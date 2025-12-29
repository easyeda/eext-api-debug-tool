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


// 注册EDA的自动补全
function ACE_CodingForEDA(editor, edcode) {
	const completers = [];
	for (const e of edcode) {
		completers.push({
			caption: e.methodPath,
			value: e.methodPath + '()',
			score: 1000,
			meta: 'method',
			docText: e.description,
		}, {
			caption: e.description,
			value: e.methodPath + '()',
			score: 999,
			meta: 'desc',
			docText: e.methodPath,
		}, );
	}
	editor.completers = editor.completers.filter((c) => !c.getCompletions || (c.meta !== 'method' && c.meta !== 'desc'));
	editor.completers.push({
		identifierRegexps: [/[\w\$\u00A2-\uFFFF]/], // 支持中文
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
			const matches = completers.filter((item) => item.caption.toLowerCase().includes(prefix.toLowerCase()));
			callback(null, matches);
		},
	});
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
// 初始化 BtnList 表的数据库
// ==========================
function BtnStore_Init() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open('CodeStore', 2); // 注意：版本号升为 2，以触发 onupgradeneeded

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
// 初始化 BtnList 表（版本 2）
// ==========================
function BtnStore_Init() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open('CodeStore', 2); // 升级版本以创建 BtnList

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
// 保存当前代码为快捷按钮（追加到 <ul> 中）
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
			if (inputValue == null || !inputValue.trim()) {
				return;
			}
			const name = inputValue.trim();

			try {
				const db = await BtnStore_Init();
				const tx = db.transaction(['BtnList'], 'readwrite');
				const store = tx.objectStore('BtnList');

				// 检查是否重名
				const index = store.index('name');
				const existing = await new Promise((res) => {
					const req = index.get(name);
					req.onsuccess = () => res(req.result);
					req.onerror = () => res(null);
				});

				if (existing) {
					eda.sys_Message.showToastMessage(`按钮名称 "${name}" 已存在，请换一个。`, 'warn', 2);
					return;
				}

				// 保存到数据库
				const record = {
					name: name,
					code: currentCode,
					createdAt: new Date().toISOString()
				};
				await new Promise((resolve, reject) => {
					const req = store.add(record);
					req.onsuccess = () => resolve();
					req.onerror = () => reject(req.error);
				});

				// 创建 <li><button>...</button></li>
				const li = document.createElement('li');
				const btn = document.createElement('button');
				btn.textContent = name;
				btn.onclick = () => {
					editor.setValue(record.code, -1);
					editor.clearSelection();
					eda.sys_Message.showToastMessage(`已加载：${name}`, 'info', 1);
				};
				li.appendChild(btn);

				// 追加到 ul 末尾
				const ul = document.querySelector('#sidebar ul');
				if (ul) ul.appendChild(li);

				eda.sys_Message.showToastMessage(`快捷按钮 "${name}" 已保存并添加到侧边栏。`, 'success', 2);

			} catch (error) {
				console.error('保存快捷按钮失败:', error);
				eda.sys_Message.showToastMessage(`保存失败: ${error.message || error}`, 'error', 2);
			}
		}
	);
}

// ==========================
// 启动时从数据库加载所有快捷按钮并追加到 <ul>
// ==========================
async function Code_LoadBtnListFromDB(editor) {
	try {
		const db = await BtnStore_Init();
		const tx = db.transaction(['BtnList'], 'readonly');
		const store = tx.objectStore('BtnList');
		const records = await new Promise((resolve, reject) => {
			const req = store.getAll();
			req.onsuccess = () => resolve(req.result || []);
			req.onerror = () => reject(req.error);
		});

		const ul = document.querySelector('#sidebar ul');
		if (!ul) return;

		records.forEach(record => {
			const li = document.createElement('li');
			const btn = document.createElement('button');
			btn.textContent = record.name;
			btn.onclick = () => {
				editor.setValue(record.code, -1);
				editor.clearSelection();
				eda.sys_Message.showToastMessage(`已加载：${record.name}`, 'info', 1);
			};
			li.appendChild(btn);
			ul.appendChild(li);
		});

		if (records.length > 0) {
			console.log(`成功加载 ${records.length} 个快捷按钮`);
		}
	} catch (error) {
		console.error('加载快捷按钮失败:', error);
		eda.sys_Message.showToastMessage(`加载失败: ${error.message || error}`, 'error', 2);
	}
}