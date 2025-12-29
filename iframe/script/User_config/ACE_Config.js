// 初始化ACE编辑器
function ACE_Init(editor) {
	editor.session.setMode('ace/mode/javascript');
	editor.setTheme('ace/theme/monokai');
	editor.setValue('', -1);
	editor.setOptions({
		enableBasicAutocompletion: true,
		enableLiveAutocompletion: true,
		fontSize: 14,
		useWorker: false,
		highlightActiveLine: true,
		showPrintMargin: false,
	});
}

// 获取编辑器主题
async function GetTheme(editor, light_theme, dark_theme) {
	const theme = eda.sys_Storage.getExtensionUserConfig('theme');
	if (theme == undefined) {
		const result = await eda.sys_Storage.setExtensionUserConfig('theme', 'dark');
		console.log(result);
	} else if (theme == 'light') {
		light_theme.disabled = false;
		dark_theme.disabled = true;
		editor.setTheme('ace/theme/github');
	} else {
		light_theme.disabled = true;
		dark_theme.disabled = false;
		editor.setTheme('ace/theme/monokai');
	}
	console.log('当前主题', theme);
}

//修改
async function SetTheme(editor, light_theme, dark_theme) {
	let theme = eda.sys_Storage.getExtensionUserConfig('theme');
	if (theme == 'light') {
		light_theme.disabled = true;
		dark_theme.disabled = false;
		editor.setTheme('ace/theme/monokai');
		const result = await eda.sys_Storage.setExtensionUserConfig('theme', 'dark');
		theme = 'dark';
	} else {
		light_theme.disabled = false;
		dark_theme.disabled = true;
		editor.setTheme('ace/theme/github');
		const result = await eda.sys_Storage.setExtensionUserConfig('theme', 'light');
		theme = 'light';
	}
	await eda.sys_Message.showToastMessage('当前主题已切换为' + theme, 'info', 1);
}


function ACE_CodingForEDA(editor, edcode) {
	const completers = [];

	for (const e of edcode) {
		// 构建 snippet：${1:param1}, ${2:param2}, ...
		const paramPlaceholders = e.parameters
			.map((p, idx) => `\${${idx + 1}:${p.name}}`)
			.join(', ');

		const snippet = e.methodPath + '(' + paramPlaceholders + ')';

		// 主补全项（按方法路径）
		completers.push({
			caption: e.methodPath,
			snippet: snippet, // ← 关键：使用 snippet
			score: 1000,
			meta: 'method',
			docText: buildDocText(e), // 更丰富的文档
		});

		// 备用：按描述搜索
		completers.push({
			caption: e.description,
			snippet: snippet,
			score: 999,
			meta: 'desc',
			docText: buildDocText(e),
		});
	}

	// 清除旧的 EDA 补全
	editor.completers = editor.completers.filter((c) => {
		return !c.getCompletions ||
			!(c.meta === 'method' || c.meta === 'desc');
	});

	// 注册新的 completer
	editor.completers.push({
		identifierRegexps: [/[\w\$\u00A2-\uFFFF]/],
		getCompletions: function(editor, session, pos, prefix, callback) {
			const { row, column } = pos;
			const tokens = session.getTokens(row);
			let tokenStart = 0;
			let currentToken = null;
			for (let i = 0; i < tokens.length; i++) {
				const token = tokens[i];
				const tokenEnd = tokenStart + token.value.length;
				if (column <= tokenEnd) {
					currentToken = token;
					break;
				}
				tokenStart = tokenEnd;
			}
			const tokenType = currentToken?.type || '';
			if (tokenType.includes('string') || tokenType.includes('comment') || tokenType.includes('regexp')) {
				return callback(null, []);
			}
			if (/[\s"'\(\)\[\]\{\}\+\-\*\/\=\!\&\|\<\>]/.test(prefix)) {
				return callback(null, []);
			}
			if (prefix === '') {
				return callback(null, []);
			}
			const matches = completers.filter((item) =>
				item.caption.toLowerCase().includes(prefix.toLowerCase())
			);
			callback(null, matches);
		},
	});
}

// 辅助函数：生成更详细的文档文本
function buildDocText(item) {
	let doc = item.description + '\n\n';
	if (item.parameters && item.parameters.length > 0) {
		doc += 'Parameters:\n';
		item.parameters.forEach(p => {
			doc += `  • ${p.name}: ${p.description}\n`;
		});
	}
	return doc.trim();
}


// 滚动+Ctrl放大或缩小代码
function ACE_ChangeCodeSize(editor, currentFontSize, showToast) {
	editor.container.addEventListener(
		'wheel',
		(e) => {
			if (!e.ctrlKey) return;
			e.preventDefault();
			const delta = e.deltaY;
			if (delta < 0) {
				currentFontSize = Math.min(currentFontSize + 7, 140);
				showToast(currentFontSize + 'px:' + (currentFontSize / 14) * 100 + '%');
			} else if (delta > 0) {
				currentFontSize = Math.max(currentFontSize - 7, 7);
				showToast(currentFontSize + 'px:' + (currentFontSize / 14) * 100 + '%');
			}
			editor.setFontSize(currentFontSize);
		}, { passive: false },
	);
}

// 执行编辑框中的代码
function ACE_RunCode(editor) {

	const code = editor.getValue().trim();
	if (!code) {
		console.log('编辑器为空，未执行任何代码。');
		return;
	}
	try {
		eval(code);
	} catch (error) {
		console.error('❌ 执行出错:', error);
	}

}

// ==========================
// 初始化 BtnList 表
// ==========================
function BtnStore_Init() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open('BtnStore', 1);

		request.onupgradeneeded = (e) => {
			const db = e.target.result;
			if (!db.objectStoreNames.contains('BtnList')) {
				const store = db.createObjectStore('BtnList', { keyPath: 'id', autoIncrement: true });
				store.createIndex('name', 'name', { unique: true });
				store.createIndex('createdAt', 'createdAt', { unique: false });
			}
		};

		request.onsuccess = (e) => resolve(e.target.result);
		request.onerror = (e) => reject(e.target.error);
	});
}

// ==========================
// 删除 BtnList 中的按钮记录
// ==========================
async function deleteBtnFromDB(name) {
	const db = await BtnStore_Init();
	const tx = db.transaction(['BtnList'], 'readwrite');
	const store = tx.objectStore('BtnList');
	const index = store.index('name');

	const key = await new Promise((resolve, reject) => {
		const req = index.getKey(name);
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});

	if (key === undefined) {
		throw new Error('按钮不存在');
	}

	await new Promise((resolve, reject) => {
		const req = store.delete(key);
		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
	});
}

// ==========================
// 创建一个快捷按钮元素（含右键删除）
// ==========================
function createQuickButton(editor, name, code) {
	const li = document.createElement('li');
	const btn = document.createElement('button');
	btn.textContent = name;
	btn.setAttribute('data-btn-name', name);

	// 左键：加载代码
	btn.onclick = () => {
		editor.setValue(code, -1);
		editor.clearSelection();
		eda.sys_Message.showToastMessage(`已加载：${name}`, 'info', 1);
	};

	// 右键：删除按钮
	btn.oncontextmenu = (e) => {
		e.preventDefault();
		if (confirm(`确定要删除快捷按钮 "${name}" 吗？\n（此操作不可逆）`)) {
			deleteBtnFromDB(name)
				.then(() => {
					li.remove(); // 移除整个 <li>
					eda.sys_Message.showToastMessage(`已删除快捷按钮 "${name}"`, 'info', 1);
				})
				.catch(err => {
					console.error('删除失败:', err);
					eda.sys_Message.showToastMessage(`删除失败: ${err.message}`, 'error', 1);
				});
		}
	};

	li.appendChild(btn);
	return li;
}

// ==========================
// 保存为快捷按钮
// ==========================
async function Code_SaveToBtnList(editor) {
	const currentCode = editor.getValue();
	if (!currentCode.trim()) {
		eda.sys_Message.showToastMessage('当前没有可保存的代码内容。', 'info', 1);
		return;
	}

	eda.sys_Dialog.showInputDialog(
		'请输入按钮名称：',
		'该名称将作为左侧工具栏的新按钮，不可重复。',
		'保存为快捷按钮',
		'text',
		'', {
			placeholder: '例如：自动布线脚本',
			minlength: 1,
			maxlength: 50
		},
		async (inputValue) => {
			if (inputValue == null || !inputValue.trim()) return;
			const name = inputValue.trim();

			try {
				const db = await BtnStore_Init();
				const tx = db.transaction(['BtnList'], 'readwrite');
				const store = tx.objectStore('BtnList');

				// 检查重名
				const existing = await new Promise(res => {
					const req = store.index('name').get(name);
					req.onsuccess = () => res(!!req.result);
				});
				if (existing) {
					eda.sys_Message.showToastMessage(`按钮名称 "${name}" 已存在`, 'warn', 2);
					return;
				}

				// 保存
				await new Promise((resolve, reject) => {
					const req = store.add({ name, code: currentCode, createdAt: new Date().toISOString() });
					req.onsuccess = resolve;
					req.onerror = reject;
				});

				// 创建并追加按钮
				const li = createQuickButton(editor, name, currentCode);
				document.querySelector('#sidebar ul')?.appendChild(li);

				eda.sys_Message.showToastMessage(`快捷按钮 "${name}" 已添加`, 'success', 1);
			} catch (error) {
				eda.sys_Message.showToastMessage(`保存失败: ${error.message}`, 'error', 2);
			}
		}
	);
}

// ==========================
// 加载所有快捷按钮
// ==========================
async function Code_LoadBtnListFromDB(editor) {
	try {
		const db = await BtnStore_Init();
		const records = await new Promise((resolve, reject) => {
			const tx = db.transaction(['BtnList'], 'readonly');
			const req = tx.objectStore('BtnList').getAll();
			req.onsuccess = () => resolve(req.result || []);
			req.onerror = reject;
		});

		const ul = document.querySelector('#sidebar ul');
		if (!ul) return;

		records.forEach(record => {
			const li = createQuickButton(editor, record.name, record.code);
			ul.appendChild(li);
		});
	} catch (error) {
		console.error('加载快捷按钮失败:', error);
		eda.sys_Message.showToastMessage(`加载失败: ${error.message}`, 'error', 1);
	}
}