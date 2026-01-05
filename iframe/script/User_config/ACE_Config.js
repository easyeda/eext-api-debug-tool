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
	// console.log('当前主题', theme);
}

// 修改编辑器主题
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

// 注册ACE补全
function ACE_CodingForEDA(editor, edcode) {
	const completers = [];
	for (const e of edcode) {
		// 构建 snippet：方法参数提示
		const paramPlaceholders = e.parameters.map((p, idx) => `\${${idx + 1}:${p.name}}`).join(', ');
		const snippet = e.methodPath + '(' + paramPlaceholders + ')';
		// 按方法名注册
		completers.push({
			caption: e.methodPath,
			snippet: snippet, // 关键：使用 snippet
			score: 1000,
			meta: 'method',
			docText: buildDocText(e), // 更丰富的文档
		});
		// 中文联想反向注册
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
		return !c.getCompletions || !(c.meta === 'method' || c.meta === 'desc');
	});
	// 注册新的 completer
	editor.completers.push({
		identifierRegexps: [/[\w\$\u00A2-\uFFFF]/],
		getCompletions: function (editor, session, pos, prefix, callback) {
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

// 辅助函数：生成更详细的文档文本
function buildDocText(item) {
	let doc = item.description + '\n用法：' + item.methodPath + '()\n';
	if (item.parameters && item.parameters.length > 0) {
		doc += '参数:\n';
		item.parameters.forEach((p) => {
			doc += `  • ${p.name}: ${p.description}\n`;
		});
	} else {
		doc += '\n此方法无参数，可直接调用';
	}
	return doc.trim() + '\n\n返回值:' + item.returns;
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
		},
		{ passive: false },
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
		console.error('执行出错:', error);
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

	// 左键：加载代码 2026.1.5 修改为直接执行代码
	btn.onclick = () => {
		eval(code);
		// editor.setValue(code, -1);
		// editor.clearSelection();
		// eda.sys_Message.showToastMessage(`已加载：${name}`, 'info', 1);
	};

	// 右键：删除按钮 2026.1.5 修改增加一个新的菜单项
	btn.oncontextmenu = (e) => {
		e.preventDefault();
		const menu =
			document.getElementById('ctx-menu') ||
			(() => {
				const m = document.createElement('div');
				m.id = 'ctx-menu';
				m.style.cssText =
					'position:fixed;z-index:10000;background:white;border:1px solid #ccc;box-shadow:2px 2px 6px rgba(0,0,0,0.2);display:none;font-size:14px;min-width:80px';
				document.body.appendChild(m);
				document.addEventListener('click', () => (m.style.display = 'none'));
				return m;
			})();
		const showItem = (text, color, action) => {
			const item = document.createElement('div');
			item.textContent = text;
			item.style.cssText = `padding:6px 12px;cursor:pointer;color:${color || '#000'};user-select:none`;
			item.onmouseenter = () => (item.style.backgroundColor = color ? '#ffebee' : '#f0f0f0');
			item.onmouseleave = () => (item.style.backgroundColor = '');
			item.onclick = () => {
				menu.style.display = 'none';
				action();
			};
			menu.appendChild(item);
		};
		menu.innerHTML = '';
		showItem('加载', '', () => {
			editor.setValue(code, -1);
			editor.clearSelection();
			eda.sys_Message.showToastMessage(`已加载：${name}`, 'info', 1);
		});
		showItem('删除', '#d32f2f', () => {
			deleteBtnFromDB(name)
				.then(() => {
					li.remove();
					eda.sys_Message.showToastMessage(`已删除快捷按钮 "${name}"`, 'info', 1);
				})
				.catch((err) => {
					console.error('删除失败:', err);
					eda.sys_Message.showToastMessage(`删除失败: ${err.message}`, 'error', 1);
				});
		});
		const x = e.pageX;
		const y = e.pageY;
		const w = window.innerWidth;
		const h = window.innerHeight;
		const mw = 100;
		const mh = 50;
		menu.style.left = `${Math.min(x, w - mw - 5)}px`;
		menu.style.top = `${Math.min(y, h - mh - 5)}px`;
		menu.style.display = 'block';
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
		'',
		{
			placeholder: '例如：自动布线脚本',
			minlength: 1,
			maxlength: 50,
		},
		async (inputValue) => {
			if (inputValue == null || !inputValue.trim()) return;
			const name = inputValue.trim();

			try {
				const db = await BtnStore_Init();
				const tx = db.transaction(['BtnList'], 'readwrite');
				const store = tx.objectStore('BtnList');

				// 检查重名
				const existing = await new Promise((res) => {
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
		},
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

		records.forEach((record) => {
			const li = createQuickButton(editor, record.name, record.code);
			ul.appendChild(li);
		});
	} catch (error) {
		console.error('加载快捷按钮失败:', error);
		eda.sys_Message.showToastMessage(`加载失败: ${error.message}`, 'error', 1);
	}
}

// 初始化插件数据库
function ExtStore_Init() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open('ExtStore', 1);
		request.onupgradeneeded = (e) => {
			const db = e.target.result;
			if (!db.objectStoreNames.contains('ExtStore')) {
				const store = db.createObjectStore('ExtStore', { keyPath: 'id', autoIncrement: true });
				store.createIndex('code', 'code', { unique: false });
				store.createIndex('name', 'name', { unique: true }); // 插件名唯一
			}
		};
		request.onsuccess = (e) => {
			const result = e.target.result;
			// console.log('数据库打开成功', result);
			resolve(result);
		};
		request.onerror = (e) => {
			console.error('数据库打开失败:', e.target.error);
			reject(e.target.error);
		};
	});
}

// 保存或更新插件（使用 put 实现原子性更新）
async function ExtStore_SaveExt(name, code) {
	const db = await ExtStore_Init();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['ExtStore'], 'readwrite');
		const store = transaction.objectStore('ExtStore');

		// 先查是否存在同名插件
		const getRequest = store.index('name').get(name);
		getRequest.onsuccess = (e) => {
			const existing = e.target.result;
			let record;
			if (existing) {
				// 存在：更新 code，保留原 id
				record = { ...existing, code };
			} else {
				// 不存在：新建（id 由 autoIncrement 生成）
				record = { name, code };
			}

			const putRequest = store.put(record); // put 会根据 id 自动 insert 或 update
			putRequest.onsuccess = (ev) => {
				const id = ev.target.result;
				console.log('保存/更新成功，ID:', id);
				resolve(id);
			};
			putRequest.onerror = (ev) => {
				console.error('保存/更新失败:', ev.target.error);
				reject(ev.target.error);
			};
		};
		getRequest.onerror = (e) => {
			console.error('查询插件名失败:', e.target.error);
			reject(e.target.error);
		};
	});
}

// 从库中删除插件（通过 name）
async function ExtStore_DeleteExt(name) {
	const db = await ExtStore_Init();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['ExtStore'], 'readwrite');
		const store = transaction.objectStore('ExtStore');
		const index = store.index('name');
		const getRequest = index.getKey(name); // 获取主键 id

		getRequest.onsuccess = (e) => {
			const id = e.target.result;
			if (id === undefined) {
				console.warn(`未找到名称为 "${name}" 的插件`);
				resolve(false);
				return;
			}
			const deleteRequest = store.delete(id);
			deleteRequest.onsuccess = () => {
				console.log(`成功删除插件 "${name}" (ID: ${id})`);
				resolve(true);
			};
			deleteRequest.onerror = (e) => {
				console.error('删除失败:', e.target.error);
				reject(e.target.error);
			};
		};
		getRequest.onerror = (e) => {
			console.error('查询 name 索引失败:', e.target.error);
			reject(e.target.error);
		};
	});
}

/**
 * 查询所有插件简要信息（id, name）
 * @returns {Promise<Array<{id: number, name: string}>>}
 */
async function ExtStore_GetExtList() {
	const db = await ExtStore_Init();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['ExtStore'], 'readonly');
		const store = transaction.objectStore('ExtStore');
		const request = store.openCursor();
		const result = [];

		request.onsuccess = (e) => {
			const cursor = e.target.result;
			if (cursor) {
				const record = cursor.value;
				result.push({
					id: record.id,
					name: record.name,
				});
				cursor.continue();
			} else {
				resolve(result);
			}
		};
		request.onerror = (e) => {
			console.error('查询插件列表失败:', e.target.error);
			reject(e.target.error);
		};
	});
}

// ==========================
// 显示插件管理模态框
// ==========================
async function showPluginManagerModal(editor) {
	if (document.getElementById('plugin-manager-modal')) return;

	const modal = document.createElement('div');
	modal.id = 'plugin-manager-modal';
	modal.style.cssText = `
		position: fixed;
		top: 0; left: 0; right: 0; bottom: 0;
		background: rgba(0,0,0,0.6);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 10000;
	`;

	const container = document.createElement('div');
	container.style.cssText = `
		background: #272822;
		color: #f8f8f2;
		width: 600px;
		max-height: 80vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		border-radius: 8px;
		box-shadow: 0 4px 20px rgba(0,0,0,0.5);
		border: 1px solid #444;
	`;

	// 头部
	const header = document.createElement('div');
	header.style.cssText = `padding: 16px; border-bottom: 1px solid #444; position: relative;`;
	header.textContent = '插件管理';
	const closeBtn = document.createElement('button');
	closeBtn.textContent = '×';
	closeBtn.style.cssText = `
		position: absolute;
		right: 16px;
		top: 50%;
		transform: translateY(-50%);
		cursor: pointer;
		font-size: 20px;
		line-height: 1;
		padding: 0 8px;
		border: none;
		background: none;
		color: #f8f8f2;
	`;
	closeBtn.onclick = () => modal.remove();
	header.appendChild(closeBtn);
	container.appendChild(header);

	// 主体
	const body = document.createElement('div');
	body.style.cssText = `flex: 1; overflow-y: auto; padding: 16px;`;
	container.appendChild(body);

	// 保存区域
	const saveSection = document.createElement('div');
	saveSection.style.cssText = `margin-bottom: 20px;`;

	const saveLabel = document.createElement('div');
	saveLabel.textContent = '保存当前代码为插件：';
	saveLabel.style.cssText = `margin-bottom: 8px; font-weight: bold;`;
	saveSection.appendChild(saveLabel);

	const inputGroup = document.createElement('div');
	inputGroup.style.cssText = `display: flex; gap: 8px;`;

	const nameInput = document.createElement('input');
	nameInput.type = 'text';
	nameInput.placeholder = '插件名称（不可重复）';
	nameInput.style.cssText = `
		flex: 1;
		padding: 6px 10px;
		background: #333430;
		color: #f8f8f2;
		border: 1px solid #666;
		border-radius: 4px;
		outline: none;
	`;
	nameInput.onfocus = () => (nameInput.style.borderColor = '#888');
	nameInput.onblur = () => (nameInput.style.borderColor = '#666');
	inputGroup.appendChild(nameInput);

	const saveBtn = document.createElement('button');
	saveBtn.textContent = '保存';
	saveBtn.style.cssText = `
		width: 80px;
		height: 36px;
		background: #272822;
		color: #f8f8f2;
		border: 1px solid #666;
		border-radius: 4px;
		font-size: 14px;
		cursor: pointer;
		transition: background 0.2s, border-color 0.2s;
	`;
	saveBtn.onmouseenter = () => {
		saveBtn.style.background = '#333430';
		saveBtn.style.borderColor = '#888';
	};
	saveBtn.onmouseleave = () => {
		saveBtn.style.background = '#272822';
		saveBtn.style.borderColor = '#666';
	};
	saveBtn.onclick = async () => {
		await saveCurrentCodeAsPlugin(editor, nameInput, (msg, type) => {
			eda.sys_Message.showToastMessage(msg, type, 2);
		});
		await renderPluginList(pluginList);
	};
	inputGroup.appendChild(saveBtn);
	saveSection.appendChild(inputGroup);
	body.appendChild(saveSection);

	// 插件列表标题
	const listTitle = document.createElement('div');
	listTitle.textContent = '已有插件：';
	listTitle.style.cssText = `margin: 16px 0 8px; font-weight: bold;`;
	body.appendChild(listTitle);

	const pluginList = document.createElement('div');
	pluginList.style.cssText = `display: flex; flex-direction: column; gap: 8px;`;
	body.appendChild(pluginList);

	// 渲染插件列表
	async function renderPluginList(listEl) {
		listEl.innerHTML = '<div style="color:#75715e; font-style:italic;">加载中...</div>';
		try {
			const plugins = await ExtStore_GetExtList();
			if (plugins.length === 0) {
				listEl.innerHTML = '<div style="color:#75715e; font-style:italic;">暂无插件</div>';
			} else {
				listEl.innerHTML = '';
				for (const plugin of plugins) {
					const item = document.createElement('div');
					item.style.cssText = `
						display: flex;
						justify-content: space-between;
						align-items: center;
						padding: 6px 10px;
						background: #333430;
						border-radius: 4px;
					`;

					const nameSpan = document.createElement('span');
					nameSpan.textContent = plugin.name;
					nameSpan.style.cssText = `color: #f8f8f2;`;
					item.appendChild(nameSpan);

					const delBtn = document.createElement('button');
					delBtn.textContent = '删除';
					delBtn.style.cssText = `
						width: 80px;
						height: 36px;
						background: #272822;
						color: #f8f8f2;
						border: 1px solid #666;
						border-radius: 4px;
						font-size: 14px;
						cursor: pointer;
						transition: background 0.2s, border-color 0.2s;
					`;
					delBtn.onmouseenter = () => {
						delBtn.style.background = '#333430';
						delBtn.style.borderColor = '#888';
						delBtn.style.color = '#f92672';
					};
					delBtn.onmouseleave = () => {
						delBtn.style.background = '#272822';
						delBtn.style.borderColor = '#666';
						delBtn.style.color = '#f8f8f2';
					};
					delBtn.onclick = async (e) => {
						e.stopPropagation();
						if (!confirm(`确定删除插件 "${plugin.name}"？`)) return;
						try {
							await ExtStore_DeleteExt(plugin.name);
							await renderPluginList(pluginList);
							eda.sys_Message.showToastMessage(`插件 "${plugin.name}" 已删除`, 'info', 1);
						} catch (err) {
							console.error('删除失败:', err);
							eda.sys_Message.showToastMessage(`删除失败: ${err.message}`, 'error', 2);
						}
					};
					item.appendChild(delBtn);
					listEl.appendChild(item);
				}
			}
		} catch (err) {
			listEl.innerHTML = `<div style="color:#f92672;">加载插件失败：${err.message}</div>`;
		}
	}

	// 初始加载
	await renderPluginList(pluginList);

	modal.onclick = (e) => {
		if (e.target === modal) modal.remove();
	};

	container.appendChild(body);
	modal.appendChild(container);
	document.body.appendChild(modal);
}

// ==========================
// 保存当前代码为插件（支持更新）
// ==========================
async function saveCurrentCodeAsPlugin(editor, nameInput, messageCallback) {
	const name = nameInput.value.trim();
	const code = editor.getValue().trim();

	if (!name) {
		messageCallback('请输入插件名称', 'warn');
		return;
	}
	if (!code) {
		messageCallback('当前编辑器为空，无法保存', 'info');
		return;
	}

	try {
		await ExtStore_SaveExt(name, code);
		messageCallback(`插件 "${name}" 已保存`, 'success');
		nameInput.value = '';
	} catch (err) {
		console.error('保存插件失败:', err);
		messageCallback(`保存失败: ${err.message}`, 'error');
	}
}

/**
 * 扫描插件数据库并使用 eval() 执行所有插件代码
 * @param {Object} [globalContext={}] - 可选：注入到全局作用域的变量（如 editor）
 * @param {Function} [onLog=(msg, type) => console.log(msg)] - 可选：日志回调（用于提示）
 */
async function ExtStore_LoadAndRunAllPlugins(globalContext = {}, onLog = (msg, type) => console.log(msg)) {
	try {
		const db = await ExtStore_Init();
		const transaction = db.transaction(['ExtStore'], 'readonly');
		const store = transaction.objectStore('ExtStore');
		const request = store.openCursor();
		const results = [];

		// 临时挂载上下文到全局（供 eval 使用）
		const tempKeys = [];
		for (const key in globalContext) {
			if (globalContext.hasOwnProperty(key)) {
				window[key] = globalContext[key];
				tempKeys.push(key);
			}
		}

		return new Promise((resolve, reject) => {
			request.onsuccess = (e) => {
				const cursor = e.target.result;
				if (cursor) {
					const record = cursor.value;
					if (record?.code && typeof record.code === 'string') {
						try {
							// 直接使用 eval 执行插件代码
							eval(record.code);
							// onLog(`插件 "${record.name}" 执行成功`, 'success');
							results.push({ name: record.name, status: 'success' });
						} catch (err) {
							console.error(`插件 "${record.name}" 执行出错:`, err);
							onLog(`插件 "${record.name}" 执行失败: ${err.message}`, 'error');
							results.push({ name: record.name, status: 'error', error: err.message });
						}
					}
					cursor.continue();
				} else {
					// 清理临时挂载的全局变量
					tempKeys.forEach((key) => {
						delete window[key];
					});
					// onLog(`共执行 ${results.length} 个插件`, 'info');
					resolve(results);
				}
			};

			request.onerror = (e) => {
				const error = e.target.error;
				console.error('扫描插件数据库失败:', error);

				// 清理（即使出错也要清理）
				tempKeys.forEach((key) => {
					delete window[key];
				});

				onLog(`扫描插件失败: ${error.message}`, 'error');
				reject(error);
			};
		});
	} catch (err) {
		console.error('初始化数据库失败，无法加载插件:', err);
		onLog(`数据库初始化失败: ${err.message}`, 'error');
		throw err;
	}
}

/**
 * 打开文件选择窗口，读取用户选择的 .js 文件内容，并加载到指定的 Ace Editor 中
 * @param {Object} editor - Ace Editor 实例
 */
function ImportFile(editor) {
	// 创建一个临时的 input 元素用于文件选择
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = '.js'; // 仅接受 .js 文件

	input.onchange = (event) => {
		const file = event.target.files[0];
		if (!file) return;

		// 检查文件扩展名（虽然 accept 已限制，但再校验一次更安全）
		if (!file.name.endsWith('.js')) {
			alert('请选择一个有效的 JavaScript (.js) 文件。');
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const content = e.target.result;
			editor.session.setValue(content); // 将内容设置到 Ace Editor
			editor.session.setMode('ace/mode/javascript'); // 设置语法高亮模式为 JavaScript
		};
		reader.onerror = () => {
			console.error('读取文件时出错');
			alert('读取文件失败，请重试。');
		};

		reader.readAsText(file);
	};

	// 触发文件选择窗口
	input.click();
}

/**
 * 注入右键菜单项：「跳转方法文档」
 * @param {Object} editor - ACE 编辑器实例
 * @param {Array<string>} fullMethodPaths - 完整方法路径列表，如 ['eda.DMT_Board.copyBoard', ...]
 */
function injectContextMenuJumpToDocs(editor, fullMethodPaths) {
	const container = editor.container;

	// 监听标准 contextmenu 事件（右键完整操作后触发）
	container.addEventListener('contextmenu', (e) => {
		e.preventDefault();

		const pos = editor.renderer.screenToTextCoordinates(e.clientX, e.clientY);
		editor.selection.moveTo(pos.row, pos.column);
		const lineText = editor.session.getLine(pos.row);

		// 按长度降序匹配
		const sortedMethods = [...fullMethodPaths].sort((a, b) => b.length - a.length);
		let matchedMethod = null;
		for (const method of sortedMethods) {
			const escaped = method.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			const regex = new RegExp(`\\b${escaped}\\b`);
			if (regex.test(lineText)) {
				matchedMethod = method;
				break;
			}
		}

		// 创建菜单
		const menu = document.createElement('div');
		menu.style.cssText = `
			position: fixed;
			top: ${e.clientY}px;
			left: ${e.clientX}px;
			background: #2d2d2d;
			color: #f8f8f2;
			border: 1px solid #555;
		 border-radius: 4px;
			z-index: 100000;
			font-size: 13px;
			min-width: 160px;
			box-shadow: 0 2px 8px rgba(0,0,0,0.4);
			user-select: none;
		`;

		const item = document.createElement('div');
		item.textContent = matchedMethod ? '跳转方法文档' : '未找到可跳转的方法';
		item.style.padding = '6px 12px';
		item.style.cursor = matchedMethod ? 'pointer' : 'default';
		item.style.opacity = matchedMethod ? '1' : '0.6';

		if (matchedMethod) {
			item.onmouseenter = () => (item.style.background = '#3a3a3a');
			item.onmouseleave = () => (item.style.background = '');
			item.onclick = () => {
				let clean = matchedMethod.startsWith('eda.') ? matchedMethod.substring(4) : matchedMethod;
				const url = `https://prodocs.lceda.cn/cn/api/reference/pro-api.${clean.toLowerCase()}.html`;
				window.open(url, '_blank');
				closeMenu();
			};
		}

		menu.appendChild(item);
		document.body.appendChild(menu);

		// 关闭菜单函数
		function closeMenu() {
			if (menu.parentNode) menu.parentNode.removeChild(menu);
			document.removeEventListener('click', closeMenu);
			document.removeEventListener('contextmenu', closeMenu);
		}
		// 点击任意地方关闭
		setTimeout(() => {
			document.addEventListener('click', closeMenu);
			document.addEventListener('contextmenu', closeMenu);
		}, 10);
	});
}
