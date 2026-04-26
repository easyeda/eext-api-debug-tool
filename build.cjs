const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'node_modules', '@jlceda', 'pro-api-types', 'index.d.ts');
const outputPath = path.join(__dirname, 'iframe', 'script', 'eda_coder', 'EDA_Codes.js');

const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir, { recursive: true });
}

let content;
try {
	content = fs.readFileSync(inputPath, 'utf8');
} catch (err) {
	console.error('无法读取 index.d.ts，请确认 @jlceda/pro-api-types 已安装。');
	process.exit(1);
}

// 仅将第一段（下划线前）小写，其余保留
// DMT_Board → dmt_Board, LIB_Classification → lib_Classification
function formatClassName(className) {
	const parts = className.split('_');
	if (parts.length === 0) return className.toLowerCase();
	parts[0] = parts[0].toLowerCase();
	return parts.join('_');
}

// 解析 /** ... */ 块内的行（startIndex 指向 /** 的下一行）
// 返回 { jsdoc, endIndex }，endIndex 指向 */ 所在行
function parseJSDocLines(lines, startIndex) {
	let description = '';
	let remarks = '';
	const params = [];
	let returns = '';
	const tags = [];
	let j = startIndex;

	while (j < lines.length) {
		const l = lines[j].trim();
		if (l === '*/') break;
		const stripped = l.replace(/^\*\s?/, '');

		if (stripped.startsWith('@param')) {
			const m = stripped.match(/^@param\s+(?:\{[^}]*\}\s+)?([a-zA-Z_$][\w$]*)\??\s*(?:-\s*)?(.*)$/);
			if (m) params.push({ name: m[1], description: m[2].trim().replace(/\r/g, '') });
		} else if (stripped.startsWith('@returns') || stripped.startsWith('@return')) {
			const m = stripped.match(/^@returns?\s+(.*)/);
			if (m && !returns) returns = m[1].trim().replace(/\r/g, '');
		} else if (stripped.startsWith('@remarks')) {
			const m = stripped.match(/^@remarks\s+(.*)/);
			if (m) remarks = (remarks ? remarks + ' ' : '') + m[1].trim().replace(/\r/g, '');
		} else if (stripped.startsWith('@')) {
			const m = stripped.match(/^@(\w+)/);
			if (m && !['param', 'returns', 'return', 'remarks'].includes(m[1])) tags.push(m[1]);
		} else if (stripped && !description) {
			description = stripped.replace(/\r/g, '');
		}
		j++;
	}

	return { jsdoc: { description, remarks, params, returns, tags }, endIndex: j };
}

// === 读取已有 EDA_Codes.js 用于增量合并 ===
let existingMap = new Map();
if (fs.existsSync(outputPath)) {
	try {
		const existingContent = fs.readFileSync(outputPath, 'utf8');
		const match = existingContent.match(/edcode\s*=\s*(\[.*?\]);/s);
		if (match) {
			const parsed = new Function('return ' + match[1])();
			for (const item of parsed) {
				if (item && typeof item.methodPath === 'string') existingMap.set(item.methodPath, item);
			}
		}
	} catch (e) {
		console.warn('无法解析已有的 EDA_Codes.js，将重新生成全部内容。', e.message);
		existingMap = new Map();
	}
}

// ============================================================
// 主解析：行级扫描
// 实际文件结构：declare global { enum/class/interface ... }
// class 和 enum 均无 declare 前缀，直接裸写在 declare global 块内
// ============================================================
const lines = content.split('\n');
const newResults = [];
let currentClass = null;
let currentEnum = null;
let pendingJsdoc = null;

for (let i = 0; i < lines.length; i++) {
	const line = lines[i].trim();

	// ── 单行 JSDoc /** ... */ ─────────────────────────────────
	if (line.startsWith('/**') && line.endsWith('*/')) {
		const commentText = line.slice(3, -2).trim();
		pendingJsdoc = { description: commentText.replace(/\r/g, ''), remarks: '', params: [], returns: '', tags: [] };
		continue;
	}

	// ── 多行 JSDoc /** ────────────────────────────────────────
	if (line === '/**') {
		const { jsdoc, endIndex } = parseJSDocLines(lines, i + 1);
		pendingJsdoc = jsdoc;
		i = endIndex; // 跳到 */ 行，for 循环再 +1
		continue;
	}

	// ── class 声明（裸 class，位于 declare global 内）─────────
	// 同时兼容 declare class（防御性）
	const classMatch = line.match(/^(?:declare\s+)?class\s+(\w+)/);
	if (classMatch && line.includes('{')) {
		currentClass = classMatch[1];
		currentEnum = null;
		const classPath = `eda.${formatClassName(currentClass)}`;
		if (pendingJsdoc && pendingJsdoc.description) {
			const item = { methodPath: classPath, description: pendingJsdoc.description, parameters: [] };
			if (pendingJsdoc.remarks) item.remarks = pendingJsdoc.remarks;
			if (pendingJsdoc.tags.length) item.tags = pendingJsdoc.tags;
			newResults.push(item);
		}
		pendingJsdoc = null;
		continue;
	}

	// ── enum 声明（裸 enum，位于 declare global 内）───────────
	// 同时兼容 declare enum / declare const enum（防御性）
	const enumMatch = line.match(/^(?:declare\s+)?(?:const\s+)?enum\s+(\w+)/);
	if (enumMatch && line.includes('{')) {
		currentEnum = enumMatch[1];
		currentClass = null;
		const enumPath = `eda.${formatClassName(currentEnum)}`;
		if (pendingJsdoc && pendingJsdoc.description) {
			const item = { methodPath: enumPath, description: pendingJsdoc.description, parameters: [], isEnum: true };
			if (pendingJsdoc.remarks) item.remarks = pendingJsdoc.remarks;
			if (pendingJsdoc.tags.length) item.tags = pendingJsdoc.tags;
			newResults.push(item);
		}
		pendingJsdoc = null;
		continue;
	}

	// ── 块结束 } ──────────────────────────────────────────────
	// .d.ts 中方法签名以 ; 结尾，内联对象的 } 后跟 ): 或 }> 等，
	// 因此裸 } 可靠地标识 class/enum/interface 的结束
	if (line === '}') {
		currentClass = null;
		currentEnum = null;
		pendingJsdoc = null;
		continue;
	}

	// ── class 内部 ────────────────────────────────────────────
	if (currentClass) {
		if (line.startsWith('/* Excluded from this release type:')) {
			pendingJsdoc = null;
			continue;
		}
		// 跳过 private / protected / constructor
		if (/^(?:private|protected|constructor\s*\()/.test(line)) {
			pendingJsdoc = null;
			continue;
		}
		// 方法：word( 开头（含 async word(）
		const methodMatch = line.match(/^(?:async\s+)?(\w+)\s*\(/);
		if (methodMatch && pendingJsdoc && pendingJsdoc.description) {
			const item = {
				methodPath: `eda.${formatClassName(currentClass)}.${methodMatch[1]}`,
				description: pendingJsdoc.description,
				parameters: pendingJsdoc.params,
			};
			if (pendingJsdoc.remarks) item.remarks = pendingJsdoc.remarks;
			if (pendingJsdoc.returns) item.returns = pendingJsdoc.returns;
			if (pendingJsdoc.tags.length) item.tags = pendingJsdoc.tags;
			newResults.push(item);
			pendingJsdoc = null;
			continue;
		}
		// 非空非注释行清除 pendingJsdoc
		if (line && !line.startsWith('*') && !line.startsWith('//')) {
			pendingJsdoc = null;
		}
		continue;
	}

	// ── enum 内部 ─────────────────────────────────────────────
	if (currentEnum) {
		// 枚举成员：NAME = value, 或 NAME,
		const memberMatch = line.match(/^([A-Z_][A-Z0-9_]*)\s*(?:=\s*[^,]+)?,?$/);
		if (memberMatch) {
			const enumPath = `eda.${formatClassName(currentEnum)}`;
			newResults.push({
				methodPath: `${enumPath}.${memberMatch[1]}`,
				description: pendingJsdoc ? pendingJsdoc.description || '' : '',
				parameters: [],
				isEnumMember: true,
				enumType: enumPath,
			});
			pendingJsdoc = null;
		} else if (line && !line.startsWith('*') && !line.startsWith('//')) {
			pendingJsdoc = null;
		}
		continue;
	}

	// ── 顶层其他行（interface、declare global 等）─────────────
	// 非 JSDoc、非 class、非 enum 的行清除 pendingJsdoc，
	// 防止 interface 内的 JSDoc 污染后续 class 的注册
	if (line && !line.startsWith('*') && !line.startsWith('//')) {
		pendingJsdoc = null;
	}
}

// === 增量合并：新条目 + 未被覆盖的旧条目 ===
const newMap = new Map();
for (const item of newResults) newMap.set(item.methodPath, item);

const merged = [
	...newResults,
	...Array.from(existingMap.entries())
		.filter(([key]) => !newMap.has(key))
		.map(([, item]) => item),
];
merged.sort((a, b) => a.methodPath.localeCompare(b.methodPath));

// === 辅助函数：根据 methodPath 判断类型并返回后缀 ===
function getSuffix(methodPath) {
	if (methodPath.includes('sch_')) {
		return '(原理图)';
	}
	if (methodPath.includes('pcb_')) {
		return '(PCB)';
	}
	return '';
}

// === 安全输出 ===
const outputObject = merged.map((item) => {
	// 获取后缀
	const suffix = getSuffix(item.methodPath);
	// 将后缀追加到描述后面
	const description = item.description + (suffix ? ` ${suffix}` : '');

	const obj = {
		methodPath: item.methodPath,
		description: description, // 使用修改后的描述
		parameters: (item.parameters || []).map((p) => ({ name: p.name, description: p.description })),
	};
	if (item.returns) obj.returns = item.returns;
	if (item.remarks) obj.remarks = item.remarks;
	if (item.tags && item.tags.length) obj.tags = item.tags;
	if (item.isEnum) obj.isEnum = true;
	if (item.isEnumMember) {
		obj.isEnumMember = true;
		obj.enumType = item.enumType;
	}
	return obj;
});

fs.writeFileSync(outputPath, 'edcode = ' + JSON.stringify(outputObject, null, '\t') + ';\n', 'utf8');
console.log(`生成 ${newResults.length} 个新条目`);
console.log(`共 ${merged.length} 项`);
