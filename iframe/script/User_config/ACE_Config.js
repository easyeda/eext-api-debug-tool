// 初始化ACE编辑器
function ACE_Init(editor) {
	editor.session.setMode('ace/mode/javascript');
	editor.setTheme('ace/theme/monokai');
	editor.setValue('', -1);
	editor.setOptions({
		enableBasicAutocompletion: true,
		enableLiveAutocompletion: true,
		enableSnippets: false,
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
		await eda.sys_Storage.setExtensionUserConfig('theme', 'dark');
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
		await eda.sys_Storage.setExtensionUserConfig('theme', 'dark');
		theme = 'dark';
	} else {
		light_theme.disabled = false;
		dark_theme.disabled = true;
		editor.setTheme('ace/theme/github');
		await eda.sys_Storage.setExtensionUserConfig('theme', 'light');
		theme = 'light';
	}
	await eda.sys_Message.showToastMessage('当前主题已切换为' + theme, 'info', 1);
}

// 注册ACE补全
function ACE_CodingForEDA(editor, edcode) {
	// 初始化时预计算小写缓存，避免每次按键重复计算
	const completers = edcode.flatMap((e) => {
		const doc = buildDocText(e);

		// 枚举成员：直接插入完整路径（无括号）
		if (e.isEnumMember) {
			const value = e.methodPath;
			const entries = [
				{
					caption: e.methodPath,
					value: value,
					score: 1000,
					meta: 'enum',
					docText: doc,
					_lc: e.methodPath.toLowerCase(),
				},
			];
			if (e.description) {
				entries.push({
					caption: e.description,
					value: value,
					score: 999,
					meta: 'enum',
					docText: doc,
					_lc: e.description.toLowerCase(),
				});
			}
			return entries;
		}

		// 枚举类型本身：插入完整路径（无括号）
		if (e.isEnum) {
			const value = e.methodPath;
			const entries = [
				{
					caption: e.methodPath,
					value: value,
					score: 1000,
					meta: 'enum',
					docText: doc,
					_lc: e.methodPath.toLowerCase(),
				},
			];
			if (e.description) {
				entries.push({
					caption: e.description,
					value: value,
					score: 999,
					meta: 'enum',
					docText: doc,
					_lc: e.description.toLowerCase(),
				});
			}
			return entries;
		}

		// 普通方法或属性
		const paramStr = e.parameters && e.parameters.length > 0 ? e.parameters.map((p) => p.name).join(', ') : '';
		// 使用 value 而非 snippet，避免 SnippetManager 注册 back marker
		// snippet 格式会向 session 注入纯 JS 对象作为 marker，
		// 平台 ui.js 订阅 onChangeBackMarker 后将其当 DOM 元素调用 getAttribute 导致崩溃
		const hasParams = e.parameters && e.parameters.length > 0;
		const value = hasParams ? e.methodPath + '(' + paramStr + ')' : e.methodPath + '()';
		const entries = [
			{
				caption: e.methodPath,
				value: value,
				score: 1000,
				meta: 'method',
				docText: doc,
				_lc: e.methodPath.toLowerCase(),
			},
		];
		if (e.description) {
			entries.push({
				caption: e.description,
				value: value,
				score: 999,
				meta: 'desc',
				docText: doc,
				_lc: e.description.toLowerCase(),
			});
		}
		return entries;
	});

	// 移除之前注册的 EDA 补全器（防止重复注册）
	editor.completers = editor.completers.filter((c) => !c._isEdaCompleter);

	editor.completers.push({
		_isEdaCompleter: true,
		identifierRegexps: [/[\w\$\u00A2-\uFFFF]/],
		getCompletions: function (editor, session, pos, prefix, callback) {
			// 前缀少于 1 个字符时不触发
			if (prefix.length < 1) return callback(null, []);

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

			const lc = prefix.toLowerCase();
			const matches = completers.filter((item) => item._lc.includes(lc));
			callback(null, matches);
		},
	});
}

// 辅助函数：生成更详细的文档文本
function buildDocText(item) {
	let doc = item.description || '';

	// 附加 @remarks 说明
	if (item.remarks) {
		doc += '\n备注：' + item.remarks;
	}

	// 枚举成员：显示所属枚举类型
	if (item.isEnumMember) {
		doc += '\n枚举：' + (item.enumType || '');
		return doc.trim();
	}

	// 枚举类型本身
	if (item.isEnum) {
		return doc.trim();
	}

	// 方法/属性
	doc += '\n用法：' + item.methodPath + '()\n';
	if (item.parameters && item.parameters.length > 0) {
		doc += '参数:\n';
		item.parameters.forEach((p) => {
			doc += `  • ${p.name}: ${p.description}\n`;
		});
	} else {
		doc += '\n此方法无参数，可直接调用';
	}
	if (item.returns) {
		doc += '\n\n返回值:' + item.returns;
	}
	return doc.trim();
}

/**
 * 绑定 Ctrl + 滚轮事件以精细调整编辑器字体大小
 * @param {Object} editor - ACE 编辑器实例
 * @param {number} currentFontSize - 当前字体大小（单位：px）
 * @param {function} showToast - 显示提示信息的函数
 * @param {number} step - 每次缩放的步长（默认 1）
 */
function ACE_ChangeCodeSize(editor, currentFontSize, showToast, step = 1) {
	// 确保初始字体大小合法
	let fontSize = Math.max(8, Math.min(currentFontSize, 72));
	editor.container.addEventListener(
		'wheel',
		(e) => {
			if (!e.ctrlKey) return;
			e.preventDefault();
			const delta = e.deltaY;
			if (delta < 0) {
				fontSize = Math.min(fontSize + step, 72);
			} else if (delta > 0) {
				fontSize = Math.max(fontSize - step, 8);
			}
			editor.setFontSize(fontSize);
			const percent = ((fontSize / 14) * 100).toFixed(1);
			showToast(` ${fontSize}px ( ${percent}%)`);
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
		// 使用 IIFE：定义并立即调用 async 函数
		const newcode = `(async () => {\n ${code}\n})();`;
		eval(newcode);
	} catch (error) {
		eda.sys_Message.showToastMessage('啊偶，执行出错了', 'error', 2);
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

	// 右键：显示快捷菜单（加载 / 删除）
	btn.oncontextmenu = (e) => {
		e.preventDefault();
		const isDark = document.getElementById('theme-dark') && !document.getElementById('theme-dark').disabled;
		const menuBg = isDark ? '#2d2e27' : '#ffffff';
		const menuBorder = isDark ? '#444' : '#ccc';
		const menuShadow = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)';
		const menu =
			document.getElementById('ctx-menu') ||
			(() => {
				const m = document.createElement('div');
				m.id = 'ctx-menu';
				document.body.appendChild(m);
				document.addEventListener('click', () => (m.style.display = 'none'));
				return m;
			})();
		menu.style.cssText = `position:fixed;z-index:10000;background:${menuBg};border:1px solid ${menuBorder};box-shadow:2px 2px 6px ${menuShadow};display:none;font-size:14px;min-width:80px;border-radius:4px`;
		const showItem = (text, color, action) => {
			const item = document.createElement('div');
			item.textContent = text;
			const defaultColor = isDark ? '#f8f8f2' : '#000';
			item.style.cssText = `padding:6px 12px;cursor:pointer;color:${color || defaultColor};user-select:none`;
			const hoverBg = isDark ? (color ? '#3d1a1a' : '#3b3c35') : color ? '#ffebee' : '#f0f0f0';
			item.onmouseenter = () => (item.style.backgroundColor = hoverBg);
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
// 显示插件管理模态框 (重构版 - 使用 CSS 类)
// ==========================
async function showPluginManagerModal(editor) {
	if (document.getElementById('plugin-manager-modal')) return;
	// 1. 创建遮罩层
	const modal = document.createElement('div');
	modal.id = 'plugin-manager-modal';
	modal.className = 'plugin-manager-backdrop';
	// 2. 创建容器
	const container = document.createElement('div');
	container.className = 'plugin-manager-container';
	// 3. 头部
	const header = document.createElement('div');
	header.className = 'plugin-manager-header';
	header.textContent = '插件管理';
	const closeBtn = document.createElement('button');
	closeBtn.className = 'plugin-manager-close-btn';
	closeBtn.textContent = '×';
	closeBtn.title = '关闭';
	closeBtn.onclick = () => {
		if (modal.parentNode) modal.parentNode.removeChild(modal);
	};
	header.appendChild(closeBtn);
	container.appendChild(header);
	// 4. 主体
	const body = document.createElement('div');
	body.className = 'plugin-manager-body';
	container.appendChild(body);
	// --- 保存区域 ---
	const saveSection = document.createElement('div');
	saveSection.className = 'plugin-manager-save-section';
	const saveLabel = document.createElement('div');
	saveLabel.className = 'plugin-manager-label';
	saveLabel.textContent = '保存当前代码为插件：';
	saveSection.appendChild(saveLabel);
	const inputGroup = document.createElement('div');
	inputGroup.className = 'plugin-manager-input-group';
	const nameInput = document.createElement('input');
	nameInput.type = 'text';
	nameInput.placeholder = '插件名称（不可重复）';
	nameInput.className = 'plugin-manager-input';
	inputGroup.appendChild(nameInput);
	const saveBtn = document.createElement('button');
	saveBtn.textContent = '保存';
	saveBtn.className = 'plugin-manager-btn save'; // 添加 'save' 修饰类
	saveBtn.onclick = async () => {
		const originalText = saveBtn.textContent;
		saveBtn.textContent = '保存中...';
		saveBtn.disabled = true;
		try {
			await saveCurrentCodeAsPlugin(editor, nameInput, (msg, type) => {
				if (eda && eda.sys_Message) eda.sys_Message.showToastMessage(msg, type, 2);
			});
			await renderPluginList(pluginList);
			nameInput.value = ''; // 清空输入框
		} catch (e) {
			console.error(e);
		} finally {
			saveBtn.textContent = originalText;
			saveBtn.disabled = false;
		}
	};
	inputGroup.appendChild(saveBtn);
	saveSection.appendChild(inputGroup);
	body.appendChild(saveSection);
	// --- 插件列表标题 ---
	const listTitle = document.createElement('div');
	listTitle.className = 'plugin-manager-list-title';
	listTitle.textContent = '已有插件：';
	body.appendChild(listTitle);
	const pluginList = document.createElement('div');
	pluginList.className = 'plugin-manager-list';
	body.appendChild(pluginList);
	// --- 渲染插件列表函数 ---
	async function renderPluginList(listEl) {
		listEl.innerHTML = '<div class="plugin-manager-status">加载中...</div>';
		try {
			const plugins = await ExtStore_GetExtList();
			if (plugins.length === 0) {
				listEl.innerHTML = '<div class="plugin-manager-status">暂无插件</div>';
			} else {
				listEl.innerHTML = '';
				for (const plugin of plugins) {
					const item = document.createElement('div');
					item.className = 'plugin-manager-item';
					const nameSpan = document.createElement('span');
					nameSpan.className = 'plugin-manager-item-name';
					nameSpan.textContent = plugin.name;
					nameSpan.title = plugin.name; // 鼠标悬停显示全名
					item.appendChild(nameSpan);
					const delBtn = document.createElement('button');
					delBtn.textContent = '删除';
					delBtn.className = 'plugin-manager-btn delete'; // 添加 'delete' 修饰类
					delBtn.onclick = async (e) => {
						e.stopPropagation();
						if (!confirm(`确定删除插件 "${plugin.name}"？`)) return;
						delBtn.textContent = '删除中...';
						delBtn.disabled = true;
						try {
							await ExtStore_DeleteExt(plugin.name);
							await renderPluginList(pluginList);
							if (eda && eda.sys_Message) {
								eda.sys_Message.showToastMessage(`插件 "${plugin.name}" 已删除`, 'info', 1);
							}
						} catch (err) {
							console.error('删除失败:', err);
							if (eda && eda.sys_Message) {
								eda.sys_Message.showToastMessage(`删除失败: ${err.message}`, 'error', 2);
							}
							// 恢复按钮状态
							delBtn.textContent = '删除';
							delBtn.disabled = false;
						}
					};
					item.appendChild(delBtn);
					listEl.appendChild(item);
				}
			}
		} catch (err) {
			listEl.innerHTML = `<div class="plugin-manager-status error">加载插件失败：${err.message}</div>`;
		}
	}
	// 初始加载
	await renderPluginList(pluginList);
	// 点击遮罩层关闭
	modal.onclick = (e) => {
		if (e.target === modal) {
			if (modal.parentNode) modal.parentNode.removeChild(modal);
		}
	};
	// 组装 DOM
	modal.appendChild(container);
	document.body.appendChild(modal);
	// 自动聚焦输入框
	setTimeout(() => nameInput.focus(), 50);
	// ESC 关闭
	const escHandler = (e) => {
		if (e.key === 'Escape') {
			if (modal.parentNode) {
				modal.parentNode.removeChild(modal);
				document.removeEventListener('keydown', escHandler);
			}
		}
	};
	document.addEventListener('keydown', escHandler);
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
 * 注入右键菜单项：「跳转方法文档」+「生成测试用例」
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

		// 创建菜单（颜色跟随当前主题）
		const isDark = document.getElementById('theme-dark') && !document.getElementById('theme-dark').disabled;
		const menuBg = isDark ? '#2d2e27' : '#ffffff';
		const menuColor = isDark ? '#f8f8f2' : '#333333';
		const menuBorder = isDark ? '#555' : '#ccc';
		const menuHover = isDark ? '#3b3c35' : '#f0f0f0';

		const menu = document.createElement('div');
		menu.style.cssText = `
			position: fixed;
			top: ${e.clientY}px;
			left: ${e.clientX}px;
			background: ${menuBg};
			color: ${menuColor};
			border: 1px solid ${menuBorder};
			border-radius: 4px;
			z-index: 100000;
			font-size: 13px;
			min-width: 160px;
			box-shadow: 0 2px 8px rgba(0,0,0,0.4);
			user-select: none;
		`;

		// ── 菜单项辅助函数 ────────────────────────────────
		function createMenuItem(text, enabled, onClick) {
			const el = document.createElement('div');
			el.textContent = text;
			el.style.padding = '6px 12px';
			el.style.cursor = enabled ? 'pointer' : 'default';
			el.style.opacity = enabled ? '1' : '0.6';
			if (enabled) {
				el.onmouseenter = () => (el.style.background = menuHover);
				el.onmouseleave = () => (el.style.background = '');
				el.onclick = () => {
					closeMenu();
					onClick();
				};
			}
			return el;
		}

		// 1. 跳转方法文档
		menu.appendChild(
			createMenuItem(matchedMethod ? '跳转方法文档' : '未找到可跳转的方法', !!matchedMethod, () => {
				let clean = matchedMethod.startsWith('eda.') ? matchedMethod.substring(4) : matchedMethod;
				const url = `https://prodocs.lceda.cn/cn/api/reference/pro-api.${clean.toLowerCase()}.html`;
				window.open(url, '_blank');
			}),
		);

		// 2. 生成测试用例
		menu.appendChild(
			createMenuItem('生成测试用例', !!matchedMethod, () => {
				generateTestCase(editor, matchedMethod);
			}),
		);

		// 3. 添加到补全
		menu.appendChild(
			createMenuItem('添加到补全', true, () => {
				UserCompleter_Add(editor, lineText);
			}),
		);

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

// ============================================================
// 生成测试用例（通过 AI 生成单例/组合用法示例）
// ============================================================

/**
 * 从 edcode 中查找方法信息
 */
function _findMethodInfo(methodPath) {
	if (typeof edcode === 'undefined') return null;
	return edcode.find((e) => e.methodPath === methodPath) || null;
}

/**
 * 将一个 edcode 条目格式化为可读的描述文本
 */
function _formatMethodDoc(info) {
	if (!info) return '';
	let doc = `方法路径: ${info.methodPath}\n`;
	doc += `描述: ${info.description || '无'}\n`;
	if (info.parameters && info.parameters.length > 0) {
		doc += '参数:\n';
		info.parameters.forEach((p) => {
			doc += `  - ${p.name}: ${p.description || ''}\n`;
		});
	} else {
		doc += '参数: 无（可直接调用）\n';
	}
	doc += `返回值: ${info.returns || '无'}\n`;
	doc += `备注: ${info.remarks || '无'}\n`;
	return doc;
}

/**
 * 显示 toast（封装，兼容 eda 不存在的情况）
 */
function _toast(msg, type, duration) {
	if (typeof eda !== 'undefined' && eda.sys_Message) {
		eda.sys_Message.showToastMessage(msg, type || 'info', duration || 2);
	}
}

/**
 * 本地依赖分析：扫描参数描述中的类名引用和关键词，匹配已知方法
 * 返回按依赖顺序排列的方法信息数组（叶子节点在前）
 */
function _traceDependencies(methodPath, visited) {
	if (!visited) visited = new Set();
	if (visited.has(methodPath)) return [];
	visited.add(methodPath);

	const info = _findMethodInfo(methodPath);
	if (!info || !info.parameters || info.parameters.length === 0) return [];

	const deps = [];
	const allMethods = edcode.filter((e) => (e.methodPath.match(/\./g) || []).length >= 2);

	for (const param of info.parameters) {
		const desc = (param.description || '').toLowerCase();
		const name = (param.name || '').toLowerCase();

		for (const candidate of allMethods) {
			if (candidate.methodPath === methodPath) continue;
			if (!candidate.returns) continue;

			const candidateReturns = (candidate.returns || '').toLowerCase();
			const candidateMethodName = candidate.methodPath.split('.').pop().toLowerCase();
			const candidateClassName = candidate.methodPath.split('.')[1] || '';
			const classNameLower = candidateClassName.toLowerCase();

			let matched = false;

			// 参数描述中引用了候选方法所属的类名（如 LIB_LibrariesList）
			if (classNameLower && desc.includes(classNameLower)) {
				if (name.includes('uuid') && candidateReturns.includes('uuid')) matched = true;
				if (name.includes('list') && candidateReturns.includes('列表')) matched = true;
				if (name.includes('name') && candidateReturns.includes('名称')) matched = true;
				if (desc.includes('获取') || desc.includes('接口')) matched = true;
			}

			// 参数描述中直接出现候选方法名
			if (candidateMethodName.length > 3 && desc.includes(candidateMethodName)) {
				matched = true;
			}

			if (matched && !visited.has(candidate.methodPath)) {
				const subDeps = _traceDependencies(candidate.methodPath, visited);
				deps.push(...subDeps, candidate);
				break; // 每个参数只匹配一个依赖
			}
		}
	}

	return deps;
}

/**
 * 执行依赖追溯并逐步显示 toast 进度
 * 返回去重后的有序依赖链（叶子在前）
 */
async function _traceWithProgress(methodPath) {
	const info = _findMethodInfo(methodPath);
	if (!info) return [];

	_toast(`[1/3] 分析 ${info.description || methodPath} 的参数依赖...`, 'info', 2);
	await new Promise((r) => setTimeout(r, 300));

	const rawDeps = _traceDependencies(methodPath);

	const seen = new Set();
	const uniqueDeps = [];
	for (const dep of rawDeps) {
		if (!seen.has(dep.methodPath)) {
			seen.add(dep.methodPath);
			uniqueDeps.push(dep);
		}
	}

	if (uniqueDeps.length === 0) {
		_toast(`[2/3] ${info.description} 无外部依赖，直接生成`, 'info', 2);
	} else {
		for (let i = 0; i < uniqueDeps.length; i++) {
			const dep = uniqueDeps[i];
			_toast(`[2/3] 追溯依赖 (${i + 1}/${uniqueDeps.length}): ${dep.methodPath} — ${dep.description || ''}`, 'info', 2);
			await new Promise((r) => setTimeout(r, 400));
		}
	}

	return uniqueDeps;
}

/**
 * 构建发送给 AI 的完整 prompt（仅包含目标方法 + 已追溯的依赖链）
 */
function _buildTestCasePrompt(methodPath, dependencyChain) {
	const targetInfo = _findMethodInfo(methodPath);
	if (!targetInfo) return null;

	const targetDoc = _formatMethodDoc(targetInfo);

	let depsDocs = '';
	if (dependencyChain.length > 0) {
		depsDocs = '\n## 依赖方法（按调用顺序排列，叶子节点在前）\n';
		dependencyChain.forEach((dep, i) => {
			depsDocs += `\n### 依赖 ${i + 1}\n`;
			depsDocs += _formatMethodDoc(dep);
		});
	}

	const systemPrompt = `你是 EDA（嘉立创EDA/EasyEDA Pro）扩展 API 的测试用例生成器。

你的任务是为指定的 API 方法生成**可直接运行的 JavaScript 测试用例代码**。

## 规则

1. **输出格式**：只输出一段纯 JavaScript 代码，不要包含 markdown 代码块标记（不要 \`\`\`），不要有任何解释文字。
2. **JSDoc 头部**：代码最上方必须有一个 JSDoc 注释块，格式如下：
   /**
    * <方法全路径>()
    * 方法用例: <方法描述>
    * @parameters
    * <参数名>: <参数描述>
    * ...（如果无参数则写"本方法无输入参数，可直接调用"）
    * @returns <返回值描述>
    * @remarks: <备注，如果无则写"无">
    */
3. **依赖追溯**：下方提供的依赖方法必须在代码中按顺序先调用，取得返回值后作为目标方法的参数传入。
4. **变量命名**：每个 API 调用结果用有意义的变量名（如 libraryList、searchResult 等），并在调用后加上 console.log 打印结果。
5. **所有 API 调用都是异步的**：使用 await 调用，代码在顶层作用域执行（不需要包裹 async 函数）。
6. **只使用提供的方法**：绝对不要编造不存在的 API。
7. **参数值**：对于字符串参数使用合理的示例值（如 '' 表示空搜索词），对于可选参数可以使用 undefined。`;

	const userPrompt = `## 目标方法
${targetDoc}
${depsDocs}
请为 ${methodPath} 生成测试用例代码。`;

	return { systemPrompt, userPrompt };
}

/**
 * 调用 AI API 生成测试用例并写入编辑器
 */
async function generateTestCase(editor, methodPath) {
	let chatConfig;
	try {
		const stored = localStorage.getItem('ai_chat_config');
		chatConfig = stored ? JSON.parse(stored) : null;
	} catch (e) {
		chatConfig = null;
	}

	if (!chatConfig || !chatConfig.apiKey) {
		if (typeof eda !== 'undefined' && eda.sys_Message) {
			eda.sys_Message.showToastMessage('请先在 AI 配置设置中填写 API Key', 'warn', 3);
		} else {
			alert('请先在 AI 配置设置中填写 API Key');
		}
		return;
	}

	// 第一阶段：本地依赖追溯（带逐步 toast）
	const dependencyChain = await _traceWithProgress(methodPath);

	// 第二阶段：构建 prompt 并调用 AI
	const prompts = _buildTestCasePrompt(methodPath, dependencyChain);
	if (!prompts) {
		_toast(`未在方法库中找到 ${methodPath}`, 'error', 2);
		return;
	}

	_toast('[3/3] 正在生成代码...', 'info', 3);

	const messages = [
		{ role: 'system', content: prompts.systemPrompt },
		{ role: 'user', content: prompts.userPrompt },
	];

	try {
		const response = await fetch(`${chatConfig.baseUrl}/chat/completions`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${chatConfig.apiKey}`,
			},
			body: JSON.stringify({
				model: chatConfig.model,
				messages: messages,
				temperature: 0.3,
			}),
		});

		if (!response.ok) {
			const errData = await response.json().catch(() => ({ error: { message: '未知错误' } }));
			throw new Error(errData.error?.message || `HTTP ${response.status}`);
		}

		const data = await response.json();
		let code = data.choices?.[0]?.message?.content || '';

		code = code
			.replace(/^```[\w]*\n?/, '')
			.replace(/\n?```\s*$/, '')
			.trim();

		if (code) {
			editor.setValue(code, -1);
			editor.clearSelection();
			_toast('测试用例已生成', 'success', 2);
		} else {
			throw new Error('AI 返回内容为空');
		}
	} catch (error) {
		console.error('生成测试用例失败:', error);
		_toast(`生成失败: ${error.message}`, 'error', 3);
	}
}

// ==========================
// 用户自定义补全 - IndexedDB 存储
// ==========================
function UserCompleterStore_Init() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open('UserCompleterStore', 1);
		request.onupgradeneeded = (e) => {
			const db = e.target.result;
			if (!db.objectStoreNames.contains('completions')) {
				const store = db.createObjectStore('completions', { keyPath: 'id', autoIncrement: true });
				store.createIndex('caption', 'caption', { unique: true });
			}
		};
		request.onsuccess = (e) => resolve(e.target.result);
		request.onerror = (e) => reject(e.target.error);
	});
}

/**
 * 解析一行代码，智能提取函数名和参数
 * 支持: funcName(a, b, c) / obj.method(x, y) / 普通标识符
 * @returns {{ caption: string, value: string, params: string[] }}
 */
function _parseLineForCompletion(lineText) {
	const trimmed = lineText.trim();
	if (!trimmed) return null;
	// 匹配函数调用: 捕获函数名(含点号路径)和括号内参数
	const funcMatch = trimmed.match(/([\w$.]+)\s*\(([^)]*)\)/);
	if (funcMatch) {
		const caption = funcMatch[1];
		const rawParams = funcMatch[2].trim();
		const params = rawParams
			? rawParams.split(',').map((p) => {
					const clean = p.trim().split('=')[0].split(':')[0].trim();
					return clean;
				})
			: [];
		// 整行作为补全值
		return { caption, value: trimmed, params };
	}
	// 非函数调用：取第一个标识符路径，整行作为补全值
	const idMatch = trimmed.match(/([\w$.]+)/);
	if (idMatch) {
		return { caption: idMatch[1], value: trimmed, params: [] };
	}
	return null;
}

/**
 * 将当前行添加到自定义补全库，并立即注册到编辑器
 */
async function UserCompleter_Add(editor, lineText) {
	const parsed = _parseLineForCompletion(lineText);
	if (!parsed) {
		_toast('当前行无法识别为有效的补全项', 'warn', 2);
		return;
	}

	try {
		const db = await UserCompleterStore_Init();
		const tx = db.transaction(['completions'], 'readwrite');
		const store = tx.objectStore('completions');

		// 检查重复
		const existing = await new Promise((res) => {
			const req = store.index('caption').get(parsed.caption);
			req.onsuccess = () => res(!!req.result);
		});
		if (existing) {
			_toast(`"${parsed.caption}" 已存在于自定义补全中`, 'info', 2);
			return;
		}

		const record = {
			caption: parsed.caption,
			value: parsed.value,
			params: parsed.params,
			description: '',
			createdAt: new Date().toISOString(),
		};

		await new Promise((resolve, reject) => {
			const req = store.add(record);
			req.onsuccess = resolve;
			req.onerror = reject;
		});

		// 立即注册到编辑器
		_registerUserCompleters(editor, [record]);
		_toast(`已添加补全: ${parsed.caption}`, 'success', 2);
	} catch (err) {
		console.error('添加自定义补全失败:', err);
		_toast(`添加失败: ${err.message}`, 'error', 2);
	}
}

/**
 * 将自定义补全记录注册到编辑器（追加到已有的用户补全器）
 */
function _registerUserCompleters(editor, records) {
	// 查找已有的用户自定义补全器
	let userCompleter = editor.completers.find((c) => c._isUserCompleter);
	if (!userCompleter) {
		userCompleter = {
			_isUserCompleter: true,
			_items: [],
			identifierRegexps: [/[\w\$\u00A2-\uFFFF]/],
			getCompletions: function (_editor, session, pos, prefix, callback) {
				if (prefix.length < 1) return callback(null, []);
				const lc = prefix.toLowerCase();
				const matches = this._items.filter((item) => item._lc.includes(lc));
				callback(null, matches);
			},
		};
		editor.completers.push(userCompleter);
	}

	for (const rec of records) {
		// 避免重复添加
		if (userCompleter._items.some((it) => it.caption === rec.caption && it._srcType === 'caption')) continue;

		const docLines = [];
		if (rec.description) docLines.push(rec.description);
		docLines.push('补全值: ' + rec.value);
		if (rec.params && rec.params.length > 0) {
			docLines.push('参数: ' + rec.params.join(', '));
		}
		const docText = docLines.join('\n');

		// 主条目：按函数名匹配
		userCompleter._items.push({
			caption: rec.caption,
			value: rec.value,
			score: 900,
			meta: rec.description || 'custom',
			docText: docText,
			_lc: rec.caption.toLowerCase(),
			_srcType: 'caption',
		});

		// 描述条目：按描述文字匹配（仅当描述非空时注册）
		if (rec.description) {
			userCompleter._items.push({
				caption: rec.description,
				value: rec.value,
				score: 899,
				meta: rec.caption,
				docText: docText,
				_lc: rec.description.toLowerCase(),
				_srcType: 'desc',
			});
		}
	}
}

/**
 * 启动时从 IndexedDB 加载所有自定义补全并注册
 */
async function UserCompleter_LoadAll(editor) {
	try {
		const db = await UserCompleterStore_Init();
		const records = await new Promise((resolve, reject) => {
			const tx = db.transaction(['completions'], 'readonly');
			const req = tx.objectStore('completions').getAll();
			req.onsuccess = () => resolve(req.result || []);
			req.onerror = reject;
		});
		if (records.length > 0) {
			_registerUserCompleters(editor, records);
		}
	} catch (err) {
		console.error('加载自定义补全失败:', err);
	}
}

/**
 * 将文本内容保存为 .js 文件并触发浏览器下载
 *
 * @param {string} text - 要保存的 JavaScript 源码文本
 * @param {string} [filename='script.js'] - 下载的文件名
 * @returns {void}
 * @throws {TypeError} 如果 text 不是字符串
 */
function ExportFileForJs(text, filename = 'script.js') {
	if (!text || text.trim() === '') {
		showToast('内容不能为空');
		return;
	}
	// 确保文件名以 .js 结尾
	if (!filename.endsWith('.js')) {
		filename += '.js';
	}
	// 创建 Blob 对象，MIME 类型设为 application/javascript
	const blob = new Blob([text], {
		type: 'application/javascript;charset=utf-8',
	});
	// 生成临时 URL
	const url = URL.createObjectURL(blob);
	// 创建隐藏的 <a> 元素用于触发下载
	const link = document.createElement('a');
	link.href = url;
	link.download = filename; // 设置下载文件名
	// 触发点击（必须添加到 DOM 才能在某些浏览器中生效）
	document.body.appendChild(link);
	link.click();
	// 清理：移除元素并释放 URL
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/**
 * 格式化 Ace 编辑器中的 JavaScript 代码，并将光标移至原光标所在行的行末
 *
 * @param {Object} editor - Ace 编辑器实例（必须已初始化）
 * @throws {Error} 如果 editor 无效或无法获取内容
 * @returns {void}
 */
function formatEditorCode(editor) {
	if (!editor || typeof editor.getValue !== 'function') {
		throw new Error('Invalid Ace editor instance provided.');
	}
	const rawCode = editor.getValue();
	// 若内容为空或仅空白，清空编辑器并退出
	if (!rawCode || rawCode.trim() === '') {
		editor.setValue('', -1);
		return;
	}
	// 记录当前光标所在行（0-based）
	const originalRow = editor.getCursorPosition().row;
	// 使用 js-beautify 格式化代码
	const formattedCode = js_beautify(rawCode, {
		indent_size: 4,
		space_in_empty_paren: true,
		end_with_newline: false,
	});
	// 应用格式化后的内容
	editor.setValue(formattedCode, -1);
	// 获取格式化后的总行数（getLength() 返回行数，0 行时为 1）
	const session = editor.getSession();
	const totalRows = session.getLength() - 1; // 最大有效行索引（0-based）
	// 确保目标行不越界
	const targetRow = Math.min(originalRow, totalRows);
	// 获取该行内容长度（即行末列位置）
	const lineEndColumn = session.getLine(targetRow).length;
	// 移动光标到目标行末尾（Ace 的 gotoLine 行号是 1-based）
	editor.gotoLine(targetRow + 1, lineEndColumn, false);
}

/**
 * 在页面右下角显示一条临时消息提示（Toast）
 *
 * @param {string} message - 要显示的消息文本，必填
 * @param {Object} [options] - 可选配置项
 * @param {number} [options.duration=3000] - 消息自动消失的毫秒数，默认 3000ms
 * @param {string} [options.type='info'] - 消息类型，可选 'info' | 'success' | 'warning' | 'error'
 * @param {boolean} [options.allowMultiple=false] - 是否允许多条消息同时存在
 * @returns {void}
 * @throws {TypeError} 当 message 不是字符串时抛出错误
 */
function showToast(message, options = {}) {
	// 参数校验
	if (typeof message !== 'string') {
		throw new TypeError('Parameter "message" must be a string.');
	}
	try {
		// 默认配置
		const config = {
			duration: 3000,
			type: 'info',
			allowMultiple: false,
			...options,
		};
		const validTypes = ['info', 'success', 'warning', 'error'];
		if (!validTypes.includes(config.type)) {
			console.warn(`不存在的消息类型"${config.type}"`);
			config.type = 'info';
		}
		let toastContainer = document.getElementById('__toast-container');
		if (!toastContainer) {
			toastContainer = document.createElement('div');
			toastContainer.id = '__toast-container';
			toastContainer.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 80vw;
                pointer-events: none;
            `;
			document.body.appendChild(toastContainer);
		}
		if (!config.allowMultiple) {
			toastContainer.innerHTML = '';
		}
		const toastEl = document.createElement('div');
		toastEl.textContent = message;
		toastEl.style.cssText = `
            background: ${
				config.type === 'success' ? '#4caf50' : config.type === 'warning' ? '#ff9800' : config.type === 'error' ? '#f44336' : '#333'
			};
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            margin-top: 8px;
            font-size: 14px;
            line-height: 1.4;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.3s ease, transform 0.3s ease;
            animation: __toast-fade-in 0.3s forwards;
            pointer-events: auto;
            word-break: break-word;
        `;
		if (!document.getElementById('__toast-styles')) {
			const styleEl = document.createElement('style');
			styleEl.id = '__toast-styles';
			styleEl.textContent = `
                @keyframes __toast-fade-in {
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes __toast-fade-out {
                    to { opacity: 0; transform: translateY(20px); }
                }
            `;
			document.head.appendChild(styleEl);
		}
		toastContainer.appendChild(toastEl);
		requestAnimationFrame(() => {
			toastEl.style.animation = '__toast-fade-in 0.3s forwards';
		});
		const removeToast = () => {
			if (!toastEl.parentNode) return;
			toastEl.style.animation = '__toast-fade-out 0.3s forwards';
			setTimeout(() => {
				if (toastEl.parentNode) {
					toastEl.parentNode.removeChild(toastEl);
				}
			}, 300);
		};
		if (config.duration > 0) {
			setTimeout(removeToast, config.duration);
		}
		toastEl.addEventListener('click', removeToast, { once: true });
	} catch (error) {
		console.error('显示消息异常', error);
	}
}
