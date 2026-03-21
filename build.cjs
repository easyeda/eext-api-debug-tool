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

function formatClassName(className) {
  const parts = className.split('_');
  if (parts.length === 0) return className.toLowerCase();
  parts[0] = parts[0].toLowerCase();
  return parts.join('_');
}

// === 读取已有 EDA_Codes.js 用于增量合并 ===
let existingMap = new Map();
if (fs.existsSync(outputPath)) {
  try {
    const existingContent = fs.readFileSync(outputPath, 'utf8');
    const match = existingContent.match(/edcode\s*=\s*(\[.*?\]);/s);
    if (match) {
      const arrStr = match[1];
      const parsed = new Function('return ' + arrStr)();
      for (const item of parsed) {
        if (item && typeof item.methodPath === 'string') {
          existingMap.set(item.methodPath, item);
        }
      }
    }
  } catch (e) {
    console.warn('无法解析已有的 EDA_Codes.js，将重新生成全部内容。', e.message);
    existingMap = new Map();
  }
}

// === 解析逻辑：提取类型描述 + 成员 ===
const newResults = [];
const lines = content.split('\n');

// 第一步：用正则提取所有 /** ... */ declare (class|interface) 块的主描述
const fullContent = content;
const typeBlockRegex = /\/\*\*([\s\S]*?)\*\//g;
let typeMatch;
while ((typeMatch = typeBlockRegex.exec(fullContent)) !== null) {
  const commentStart = typeMatch.index;
  const commentEnd = typeMatch.index + typeMatch[0].length;
  const afterComment = fullContent.slice(commentEnd).trimStart();
  
  // 检查紧接着是否是 declare class/interface（允许 export 和空格）
  const declareMatch = afterComment.match(/^(\s*(?:export\s+)?declare\s+(class|interface)\s+(\w+))/);
  if (declareMatch) {
    const typeName = declareMatch[3];
    const commentText = typeMatch[1];
    
    // 提取主描述（第一段非 @ 的行）
    let mainDesc = '';
    const commentLines = commentText.split('\n');
    for (const line of commentLines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('*') && !trimmed.startsWith('* @')) {
        const text = trimmed.replace(/^\*\s*/, '').trim();
        if (text && !mainDesc) {
          mainDesc = text;
          break;
        }
      }
    }

    if (mainDesc) {
      const formattedName = formatClassName(typeName);
      const typePath = `eda.${formattedName}`;
      newResults.push({
        methodPath: typePath,
        description: mainDesc.replace(/\r/g, ''),
        parameters: [],
      });
    }
  }
}

// 第二步：遍历所有 declare class/interface，提取内部成员（属性/方法）
for (let i = 0; i < lines.length; i++) {
  let line = lines[i].trim();
  if (line === '' || line.startsWith('//')) continue;

  // 匹配 declare 或 export declare
  const declMatch = line.match(/^(?:export\s+)?declare\s+(class|interface)\s+(\w+)/);
  if (declMatch) {
    const typeName = declMatch[2];
    const formattedName = formatClassName(typeName);
    const typePath = `eda.${formattedName}`;

    // 解析内部结构
    let j = i + 1;
    let depth = 1;
    let localPendingComment = null;

    while (j < lines.length && depth > 0) {
      const innerLineRaw = lines[j];
      const innerLine = innerLineRaw.trim();

      if (innerLine.endsWith('{')) {
        depth++;
      } else if (innerLine === '}') {
        depth--;
        if (depth === 0) break;
      }

      // 跳过排除标记
      if (innerLine.startsWith('/* Excluded from this release type:')) {
        localPendingComment = null;
        j++;
        continue;
      }

      // 单行 JSDoc 注释（用于属性）
      if (innerLine.startsWith('/**') && innerLine.endsWith('*/')) {
        localPendingComment = innerLine.slice(3, -2).trim().replace(/\r/g, '');
        j++;
        continue;
      }

      // 多行 JSDoc 注释（用于方法）
      if (innerLine === '/**') {
        let desc = '';
        let params = [];
        let returnsDesc = '';
        let k = j + 1;
        while (k < lines.length) {
          const l = lines[k].trim();
          if (l === '*/') break;
          if (l.startsWith('*') && !l.startsWith('* @')) {
            const text = l.slice(1).trim();
            if (text && !desc) desc = text;
          }
          const paramMatch = l.match(/^\*\s*@param\s+([a-zA-Z_$][\w$]*)\s*-\s*(.+)$/);
          if (paramMatch) {
            params.push({
              name: paramMatch[1],
              description: paramMatch[2].trim().replace(/\r/g, '')
            });
          }
          const returnMatch = l.match(/^\*\s*@(?:returns?|return)\s+(.+)$/);
          if (returnMatch && !returnsDesc) {
            returnsDesc = returnMatch[1].trim().replace(/\r/g, '');
          }
          k++;
        }

        // 方法应在 */ 下一行
        const methodLineIndex = k + 1;
        if (methodLineIndex < lines.length) {
          const methodLine = lines[methodLineIndex];
          const methodMatch = methodLine.match(/^\s*(?:async\s+)?(\w+)\s*\(/);
          if (methodMatch) {
            const methodName = methodMatch[1];
            const item = {
              methodPath: `${typePath}.${methodName}`,
              description: desc,
              parameters: params,
            };
            if (returnsDesc) item.returns = returnsDesc;
            newResults.push(item);
            j = methodLineIndex;
          }
        }
        j = k;
        localPendingComment = null;
        j++;
        continue;
      }

      // 属性解析（id: string 等）
      if (innerLine.includes(':') && !innerLine.includes('(') && /^[a-zA-Z_$]/.test(innerLine)) {
        const propMatch = innerLine.match(/^(\w+)(\??)\s*:/);
        if (propMatch) {
          const propName = propMatch[1];
          newResults.push({
            methodPath: `${typePath}.${propName}`,
            description: localPendingComment || '',
            parameters: [],
          });
        }
        localPendingComment = null;
      } else {
        localPendingComment = null;
      }

      j++;
    }

    i = j - 1; // for 循环会 i++
  }
}

// === 增量合并：新条目 + 未被覆盖的旧条目 ===
const newMap = new Map();
for (const item of newResults) {
  newMap.set(item.methodPath, item);
}

const merged = [
  ...newResults,
  ...Array.from(existingMap.entries())
    .filter(([key]) => !newMap.has(key))
    .map(([, item]) => item)
];

merged.sort((a, b) => a.methodPath.localeCompare(b.methodPath));

// === 安全输出：使用 JSON.stringify 避免语法错误 ===
const outputObject = merged.map(item => {
  const obj = {
    methodPath: item.methodPath,
    description: item.description,
    parameters: (item.parameters || []).map(p => ({
      name: p.name,
      description: p.description
    }))
  };
  if (item.hasOwnProperty('returns')) {
    obj.returns = item.returns;
  }
  return obj;
});

const jsonString = JSON.stringify(outputObject, null, '\t');
const outputStr = 'edcode = ' + jsonString + ';\n';

fs.writeFileSync(outputPath, outputStr, 'utf8');

console.log(`生成 ${newResults.length} 个新条目`);
console.log(`共 ${merged.length} 项`);