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

function _shouldCompleteWithComment() {
	try {
		const value = eda.sys_Storage.getExtensionUserConfig('completion_with_comment');
		return value === 'true' || value === true;
	} catch (e) {
		return false;
	}
}

function _shouldWrapWithVariable() {
	try {
		var value = eda.sys_Storage.getExtensionUserConfig("completion_random_var");
		return value === "true" || value === true;
	} catch (e) { return false; }
}
function _shouldAutoAwait() {
	try {
		var value = eda.sys_Storage.getExtensionUserConfig('completion_auto_await');
		return value === 'true' || value === true;
	} catch (e) { return false; }
}

function _generateRandomVarName(editor) {
	var content = editor.getValue();
	var usedNames = {};
	var re = /\b(const|let|var)\s+(\w+)\s*=/g;
	var m;
	while ((m = re.exec(content)) !== null) { usedNames[m[2]] = true; }
	var chars = "abcdefghijklmnopqrstuvwxyz";
	var names = chars.split("");
	for (var i = 0; i < chars.length; i++) {
		for (var j = 0; j < chars.length; j++) {
			names.push(chars[i] + chars[j]);
		}
	}
	names = names.filter(function(n) { return !usedNames[n]; });
	return names[0] || "result";
}

function _buildCompletionInsertText(item, editor) {
	var text = item.value;
	// 仅当勾选"异步函数标识补全"时为异步方法添加 await
	if (_shouldAutoAwait() && item._isAsync) {
		text = "await " + text;
	}
	if (_shouldWrapWithVariable()) {
		var varName = _generateRandomVarName(editor);
		text = "const " + varName + " = " + text;
	}
	if (_shouldCompleteWithComment() && item.description) {
		return "// " + item.description + "\n" + text;
	}
	return text;
}

function _selectFirstParam(editor, text, startRow, startCol) {
	// 如果启用了随机变量，选中第一个参数，无参则定位到行末
	if (_shouldWrapWithVariable()) {
		var parenIdx = text.indexOf('(');
		if (parenIdx === -1) return;
		var suffix = text.substring(parenIdx + 1);
		var closeIdx = suffix.lastIndexOf(')');
		if (closeIdx === -1) return;
		var inner = suffix.substring(0, closeIdx);

		var lines = text.substring(0, parenIdx + 1).split('\n');
		var cursorRow = startRow + lines.length - 1;
		var cursorCol = lines.length > 1 ? lines[lines.length - 1].length : startCol + lines[0].length;

		// 如果没有参数，光标定位到行末
		if (!inner || !inner.trim()) {
			var lastLine = editor.session.getLine(cursorRow);
			editor.selection.moveTo(cursorRow, lastLine.length);
			return;
		}

		// 查找第一个参数并选中
		var firstParam = inner.split(',')[0].trim();
		if (!firstParam) {
			var lastLine2 = editor.session.getLine(cursorRow);
			editor.selection.moveTo(cursorRow, lastLine2.length);
			return;
		}
		var searchLine = editor.session.getLine(cursorRow);
		var paramIdx = searchLine.indexOf(firstParam, cursorCol);
		if (paramIdx === -1) {
			var lastLine3 = editor.session.getLine(cursorRow);
			editor.selection.moveTo(cursorRow, lastLine3.length);
			return;
		}
		editor.selection.setRange({
			start: { row: cursorRow, column: paramIdx },
			end: { row: cursorRow, column: paramIdx + firstParam.length },
		});
		return;
	}
	var parenIdx = text.indexOf('(');
	if (parenIdx === -1) return;
	var suffix = text.substring(parenIdx + 1);
	var closeIdx = suffix.lastIndexOf(')');
	if (closeIdx === -1) return;
	var inner = suffix.substring(0, closeIdx);

	var lines = text.substring(0, parenIdx + 1).split('\n');
	var cursorRow = startRow + lines.length - 1;
	var cursorCol = lines.length > 1 ? lines[lines.length - 1].length : startCol + lines[0].length;

	// 如果没有参数，光标定位到 ( 后
	if (!inner || !inner.trim()) {
		editor.selection.moveTo(cursorRow, cursorCol);
		return;
	}

	// 查找第一个参数并选中
	var firstParam = inner.split(',')[0].trim();
	if (!firstParam) { editor.selection.moveTo(cursorRow, cursorCol); return; }
	var searchLine = editor.session.getLine(cursorRow);
	var paramIdx = searchLine.indexOf(firstParam, cursorCol);
	if (paramIdx === -1) { editor.selection.moveTo(cursorRow, cursorCol); return; }
	editor.selection.setRange({
		start: { row: cursorRow, column: paramIdx },
		end: { row: cursorRow, column: paramIdx + firstParam.length },
	});
}

// 获取编辑器主题
async function GetTheme(editor, light_theme, dark_theme) {
	await ThemeEngine.init();
}

// 修改编辑器主题（保留向后兼容，实际逻辑由 ThemeEngine 处理）
async function SetTheme(editor, light_theme, dark_theme) {
	const current = ThemeEngine.getCurrent();
	const next = current === 'dark' ? 'light' : current === 'light' ? 'dark' : 'light';
	ThemeEngine.apply(next);
	if (window.fileTreeUI) window.fileTreeUI.applyTheme();
	await eda.sys_Message.showToastMessage(I18N.format('themeSwitched', I18N.t(next === 'dark' ? 'themeDark' : next === 'light' ? 'themeLight' : next)), 'info', 1);
	return next;
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
					description: e.description,
					completer: {
						insertMatch: function (editor, data) {
							const pos = editor.getCursorPosition();
							const line = editor.session.getLine(pos.row);
							const prefix = line.substring(0, pos.column);
							const match = prefix.match(/[\w\$\u00A2-\uFFFF]+$/);
							const startCol = match ? pos.column - match[0].length : pos.column;
							editor.session.replace(
								{
									start: { row: pos.row, column: startCol },
									end: pos,
								},
								_buildCompletionInsertText(data, editor),
							);
						},
					},
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
					description: e.description,
					completer: {
						insertMatch: function (editor, data) {
							const pos = editor.getCursorPosition();
							const line = editor.session.getLine(pos.row);
							const prefix = line.substring(0, pos.column);
							const match = prefix.match(/[\w\$\u00A2-\uFFFF]+$/);
							const startCol = match ? pos.column - match[0].length : pos.column;
							editor.session.replace(
								{
									start: { row: pos.row, column: startCol },
									end: pos,
								},
								_buildCompletionInsertText(data, editor),
							);
						},
					},
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
					description: e.description,
					completer: {
						insertMatch: function (editor, data) {
							const pos = editor.getCursorPosition();
							const line = editor.session.getLine(pos.row);
							const prefix = line.substring(0, pos.column);
							const match = prefix.match(/[\w\$\u00A2-\uFFFF]+$/);
							const startCol = match ? pos.column - match[0].length : pos.column;
							editor.session.replace(
								{
									start: { row: pos.row, column: startCol },
									end: pos,
								},
								_buildCompletionInsertText(data, editor),
							);
						},
					},
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
					description: e.description,
					completer: {
						insertMatch: function (editor, data) {
							const pos = editor.getCursorPosition();
							const line = editor.session.getLine(pos.row);
							const prefix = line.substring(0, pos.column);
							const match = prefix.match(/[\w\$\u00A2-\uFFFF]+$/);
							const startCol = match ? pos.column - match[0].length : pos.column;
							editor.session.replace(
								{
									start: { row: pos.row, column: startCol },
									end: pos,
								},
								_buildCompletionInsertText(data, editor),
							);
						},
					},
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
				meta: e.isAsync ? 'async method' : 'sync method',
				docText: doc,
				_lc: e.methodPath.toLowerCase(),
				_isAsync: e.isAsync || false,
				description: e.description,
				completer: {
					insertMatch: function (editor, data) {
						const pos = editor.getCursorPosition();
						const line = editor.session.getLine(pos.row);
						const prefix = line.substring(0, pos.column);
						const match = prefix.match(/[\w\$\u00A2-\uFFFF]+$/);
						const startCol = match ? pos.column - match[0].length : pos.column;
						const insertText = _buildCompletionInsertText(data, editor);
						editor.session.replace(
							{
								start: { row: pos.row, column: startCol },
								end: pos,
							},
							insertText,
						);
						_selectFirstParam(editor, insertText, pos.row, startCol);
					},
				},
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
				_isAsync: e.isAsync || false,
				description: e.description,
				completer: {
					insertMatch: function (editor, data) {
						const pos = editor.getCursorPosition();
						const line = editor.session.getLine(pos.row);
						const prefix = line.substring(0, pos.column);
						const match = prefix.match(/[\w\$\u00A2-\uFFFF]+$/);
						const startCol = match ? pos.column - match[0].length : pos.column;
						const insertText = _buildCompletionInsertText(data, editor);
						editor.session.replace(
							{
								start: { row: pos.row, column: startCol },
								end: pos,
							},
							insertText,
						);
						_selectFirstParam(editor, insertText, pos.row, startCol);
					},
				},
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
		doc += '\\n' + I18N.t('remarks') + ': ' + item.remarks;
	}

	// 枚举成员：显示所属枚举类型
	if (item.isEnumMember) {
		doc += '\\n' + I18N.t('enumDoc') + ': ' + (item.enumType || '');
		return doc.trim();
	}

	// 枚举类型本身
	if (item.isEnum) {
		return doc.trim();
	}

	// 方法/属性
	doc += '\\n' + I18N.t('usage') + ': ' + item.methodPath + '()\n';
	if (item.parameters && item.parameters.length > 0) {
		doc += I18N.t('parameters') + ':\n';
		item.parameters.forEach((p) => {
			doc += `  • ${p.name}: ${p.description}\n`;
		});
	} else {
		doc += I18N.t('noParams');
	}
	if (item.returns) {
		doc += '\\n\\n' + I18N.t('returns') + ':' + item.returns;
	}
	if (item.isAsync) {
		doc += I18N.t('asyncMethod');
	} else if (item.isAsync === false) {
		doc += I18N.t('syncMethod');
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
		console.log(I18N.t('editorEmptyExec'));
		return;
	}
	try {
		// 使用 IIFE：定义并立即调用 async 函数
		const newcode = `(async () => {\n ${code}\n})();`;
		eval(newcode);
	} catch (error) {
		eda.sys_Message.showToastMessage(I18N.t('execFailedFormat'), 'error', 2);
		console.error(I18N.t('execError'), error);
	}
}

// ==========================
// 在弹出窗口中预览 HTML
// ==========================
async function previewHtmlInPopupWindow(data) {
	try {
		const htmlContent = data.content;
		if (!htmlContent) {
			eda.sys_Message.showToastMessage(I18N.t('htmlEmpty'), 'error', 2);
			return;
		}

		// 将 HTML 内容保存到 storage
		await eda.sys_Storage.setExtensionUserConfig('__preview_html', htmlContent);

		// 生成唯一的窗口 ID
		const windowId = data.windowId || ("html-preview-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9));

		// 打开弹出窗口
		await eda.sys_IFrame.openIFrame(
			'iframe/preview.html',
			1024,
			768,
			windowId,
			{
				title: (data.projectName || 'Preview') + ' - ' + (data.entryFile || 'index.html'),
				maximizeButton: true,
				minimizeButton: true,
				onBeforeCloseCallFn: async () => {
					try {
						await eda.sys_Storage.setExtensionUserConfig('__preview_html', '');
					} catch(e) {}
					if (typeof data.onClose === 'function') {
						try { data.onClose(); } catch(e) {}
					}
					return true;
				}
			}
		);

		eda.sys_Message.showToastMessage(I18N.t('previewOpened'), 'success', 2);
	} catch (error) {
		eda.sys_Message.showToastMessage(I18N.format('previewOpenFailed', error.message), 'error', 2);
	}
}

// ==========================
// ==========================
// ==========================
// 删除 BtnList 中的按钮记录
// ==========================
async function deleteBtnFromDB(uuid) {
	var db = await BtnStore_Init();
	await new Promise(function(resolve, reject) {
		var tx = db.transaction(['BtnList'], 'readwrite');
		var req = tx.objectStore('BtnList').delete(uuid);
		req.onsuccess = resolve;
		req.onerror = reject;
	});
	db.close();
}

// ==========================
// 创建一个快捷按钮元素（含右键菜单）
// ==========================
function createQuickButton(editor, name, uuid, projectId, startupFile) {
	var li = document.createElement("li");
	var btn = document.createElement("button");
	btn.textContent = name;
	btn.setAttribute("data-btn-uuid", uuid);
	btn.setAttribute("data-btn-project-id", projectId);
	if (startupFile) btn.setAttribute("data-startup-file", startupFile);

	// 点击：根据启动文件类型执行 JS 或预览 HTML
	btn.onclick = async function() {
		try {
			var project = await window.projectManager.loadProjectById(projectId);
			if (!project) { project = await window.projectManager.loadProjectByUuid(uuid); }
			if (!project) {
				eda.sys_Message.showToastMessage(I18N.t('projectNotFound'), "error", 2);
				return;
			}
			var sf = startupFile || btn.getAttribute("data-startup-file");
			var isScript = !!(project.isScript || (project.files && project.files.length === 1 && project.files[0].fileName.endsWith(".js")));
			var ext = sf ? sf.split(".").pop().toLowerCase() : null;

			// JS 启动文件 → 执行脚本
			if (ext === "js" || (!ext && isScript)) {
				var code = project.files[0].content;
				if (code && code.trim()) {
					try { eval(code); } catch(e) { eda.sys_Message.showToastMessage(I18N.format('execFailed', e.message), "error", 2); }
				} else {
					eda.sys_Message.showToastMessage(I18N.t('scriptEmpty'), "warn", 2);
				}
				return;
			}

			// HTML 启动文件 → 内联渲染预览
			var htmlFiles = project.files.filter(function(f) { return f.fileName.toLowerCase().endsWith(".html"); });
			var entryFileName = sf || (htmlFiles.length > 0 ? htmlFiles[0].fileName : null);
			if (!entryFileName) {
				eda.sys_Message.showToastMessage(I18N.t('noRunnableFiles'), "warn", 2);
				return;
			}
			var entryFile = project.files.find(function(f) { return f.fileName === entryFileName; });
			if (!entryFile) {
				eda.sys_Message.showToastMessage(I18N.t('startupFileNotFound'), "error", 2);
				return;
			}

			var prevProject = window.projectManager.currentProject;
			var prevFile = window.projectManager.currentFile;
			window.projectManager.currentProject = project;
			window.projectManager.currentFile = entryFileName;

			var builtHTML = window.htmlRenderer
				? window.htmlRenderer.buildHTMLContent(entryFile, window.projectManager)
				: entryFile.content;

			window.projectManager.currentProject = prevProject;
			window.projectManager.currentFile = prevFile;

			var finalHTML = typeof injectEdaBridge === "function" ? injectEdaBridge(builtHTML) : builtHTML;

			if (typeof previewHtmlInPopupWindow === "function") {
				previewHtmlInPopupWindow({
					projectName: project.projectName,
					entryFile: entryFileName,
					content: finalHTML
				});
			} else {
				eda.sys_Message.showToastMessage(I18N.t('previewNotDefined'), "error", 2);
			}
		} catch(e) {
			eda.sys_Message.showToastMessage(I18N.format('loadFailed', e.message), "error", 2);
		}
	};

	// 右键菜单
	btn.oncontextmenu = function(e) {
		e.preventDefault();
		var isDark = document.body.classList.contains("dark-theme");
		var menuBg = isDark ? "#404040" : "#fff";
		var menuBorder = isDark ? "#222" : "#d9d9d9";
		var menuShadow = isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.2)";
		var textColor = isDark ? "#e5e5e5" : "#333";
		var hoverBg = isDark ? "#6283a2" : "#e6f7ff";
		var menu = document.getElementById("ctx-menu") || (function() {
			var m = document.createElement("div");
			m.id = "ctx-menu";
			document.body.appendChild(m);
			document.addEventListener("click", function() { m.style.display = "none"; });
			return m;
		})();
		menu.style.cssText = "position:fixed;z-index:10000;background:" + menuBg + ";border:1px solid " + menuBorder + ";box-shadow:2px 2px 6px " + menuShadow + ";display:none;font-size:12px;min-width:120px;border-radius:4px;padding:4px 0";
		function showItem(text, action) {
			var item = document.createElement("div");
			item.textContent = text;
			item.style.cssText = "padding:8px 16px;cursor:pointer;color:" + textColor + ";user-select:none;transition:background 0.2s;";
			item.onmouseenter = function() { item.style.backgroundColor = hoverBg; };
			item.onmouseleave = function() { item.style.backgroundColor = ""; };
			item.onclick = function() { menu.style.display = "none"; action(); };
			menu.appendChild(item);
		}
		menu.innerHTML = "";
		showItem(I18N.t("loadProject"), async function() {
			try {
				var project = await window.projectManager.loadProjectById(projectId);
				if (!project) { project = await window.projectManager.loadProjectByUuid(uuid); }
				if (!project) { eda.sys_Message.showToastMessage(I18N.t('projectNotFound'), "error", 2); return; }
				var isScript = !!(project.isScript || (project.files && project.files.length === 1 && project.files[0].fileName.endsWith(".js")));
				if (isScript) {
					await window.leftNavPanel.openScriptProject(project.id);
				} else {
					await window.leftNavPanel.openProject(project.id);
					var sf = startupFile || btn.getAttribute("data-startup-file");
					if (sf && window.fileTreeUI) { await window.fileTreeUI.loadFile(sf); }
				}
			} catch(e) {
				eda.sys_Message.showToastMessage(I18N.format('loadProjectFailed', e.message), "error", 2);
			}
		});
		showItem(I18N.t("delete"), function() {
			deleteBtnFromDB(uuid).then(function() {
				li.remove();
				eda.sys_Message.showToastMessage(I18N.format('deletedQuickButton', name), "info", 1);
			}).catch(function(err) {
				console.error("Delete failed:", err);
				eda.sys_Message.showToastMessage(I18N.format('deleteFailed', err.message), "error", 1);
			});
		});
		menu.style.left = Math.min(e.pageX, window.innerWidth - 130) + "px";
		menu.style.top = Math.min(e.pageY, window.innerHeight - 90) + "px";
		menu.style.display = "block";
	};

	li.appendChild(btn);
	return li;
}

// 初始化快捷按钮数据库
// ==========================
function BtnStore_Init() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open('BtnStore', 2);
		request.onupgradeneeded = (e) => {
			const db = e.target.result;
			if (!db.objectStoreNames.contains('BtnList')) {
				const store = db.createObjectStore('BtnList', { keyPath: 'id', autoIncrement: true });
				store.createIndex('uuid', 'uuid', { unique: true });
				store.createIndex('projectId', 'projectId', { unique: false });
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	});
}

// 映射项目到顶部菜单
async function _selectStartupFile(project) {
	var files = project.files || [];
	var candidates = [];
	files.forEach(function(f) {
		var name = f.fileName;
		var ext = name.split(".").pop().toLowerCase();
		if (ext === "html" || ext === "js") candidates.push({ fileName: name, ext: ext });
	});
	if (candidates.length === 0) return null;
	if (candidates.length === 1) return candidates[0].fileName;

	candidates.sort(function(a, b) {
		if (a.ext !== b.ext) return a.ext === "html" ? -1 : 1;
		var aIdx = a.fileName.replace(/.*\//, "").toLowerCase() === "index.html";
		var bIdx = b.fileName.replace(/.*\//, "").toLowerCase() === "index.html";
		if (aIdx !== bIdx) return aIdx ? -1 : 1;
		return a.fileName.localeCompare(b.fileName);
	});

	return new Promise(function(resolve) {
		var isDark = document.body.classList.contains("dark-theme");
		var bg = isDark ? "#404040" : "#fff";
		var fg = isDark ? "#e5e5e5" : "#333";
		var border = isDark ? "#555" : "#d9d9d9";
		var selBg = isDark ? "#0d6efd" : "#e6f7ff";
		var selFg = isDark ? "#fff" : "#333";
		var hoverBg = isDark ? "#505050" : "#f5f5f5";
		var btnBg = isDark ? "#0d6efd" : "#1890ff";
		var btnCancelBg = isDark ? "#555" : "#d9d9d9";

		var overlay = document.createElement("div");
		overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;";

		var modal = document.createElement("div");
		modal.style.cssText = "background:" + bg + ";color:" + fg + ";border-radius:8px;padding:20px;min-width:380px;max-width:480px;box-shadow:0 4px 24px rgba(0,0,0,0.3);display:flex;flex-direction:column;gap:12px;";

		var title = document.createElement("div");
		title.textContent = I18N.t("selectStartupFile");
		title.style.cssText = "font-size:16px;font-weight:600;";

		var search = document.createElement("input");
		search.type = "text";
		search.placeholder = I18N.t("searchFiles");
		search.style.cssText = "width:100%;padding:6px 10px;border:1px solid " + border + ";border-radius:4px;background:" + bg + ";color:" + fg + ";font-size:13px;box-sizing:border-box;";

		var list = document.createElement("div");
		list.style.cssText = "max-height:300px;overflow-y:auto;border:1px solid " + border + ";border-radius:4px;";

		var btnRow = document.createElement("div");
		btnRow.style.cssText = "display:flex;justify-content:flex-end;gap:8px;";

		var cancelBtn = document.createElement("button");
		cancelBtn.textContent = I18N.t("cancel");
		cancelBtn.style.cssText = "padding:6px 16px;border:none;border-radius:4px;cursor:pointer;background:" + btnCancelBg + ";color:" + fg + ";font-size:13px;";

		var confirmBtn = document.createElement("button");
		confirmBtn.textContent = I18N.t("ok");
		confirmBtn.style.cssText = "padding:6px 16px;border:none;border-radius:4px;cursor:pointer;background:" + btnBg + ";color:#fff;font-size:13px;";

		var selectedFile = null;

		function renderItems() {
			list.innerHTML = "";
			candidates.forEach(function(c) {
				var div = document.createElement("div");
				div.setAttribute("data-filename", c.fileName);
				div.style.cssText = "padding:8px 10px;cursor:pointer;border-bottom:1px solid " + border + ";font-size:13px;color:" + fg + ";";
				div.textContent = c.fileName + " [" + c.ext.toUpperCase() + "]";
				div.onclick = function() {
					list.querySelectorAll("div").forEach(function(x) { x.style.background = ""; x.style.color = fg; });
					div.style.background = selBg;
					div.style.color = selFg;
					selectedFile = c.fileName;
				};
				div.onmouseenter = function() { if (selectedFile !== c.fileName) { div.style.background = hoverBg; } };
				div.onmouseleave = function() { if (selectedFile !== c.fileName) { div.style.background = ""; } };
				list.appendChild(div);
			});
		}

		search.oninput = function() {
			var v = search.value.toLowerCase();
			list.querySelectorAll("div").forEach(function(el) {
				el.style.display = el.textContent.toLowerCase().indexOf(v) >= 0 ? "" : "none";
			});
		};

		function close(sel) {
			overlay.remove();
			resolve(sel);
		}

		cancelBtn.onclick = function() { close(null); };
		confirmBtn.onclick = function() {
			if (!selectedFile) {
				eda.sys_Message.showToastMessage(I18N.t("pleaseSelectStartupFile"), "warn", 1);
				return;
			}
			close(selectedFile);
		};
		overlay.onclick = function(e) { if (e.target === overlay) close(null); };

		btnRow.appendChild(cancelBtn);
		btnRow.appendChild(confirmBtn);
		modal.appendChild(title);
		modal.appendChild(search);
		modal.appendChild(list);
		modal.appendChild(btnRow);
		overlay.appendChild(modal);
		document.body.appendChild(overlay);

		renderItems();
		search.focus();
	});
}

async function Project_SaveToBtnList(projectId) {
	var project = await window.projectManager.loadProjectById(projectId);
	if (!project) {
		eda.sys_Message.showToastMessage(I18N.t('projectNotFound'), "error", 2);
		return;
	}

	if (!project.uuid) {
		project.uuid = generateUUID();
		await window.projectManager.saveProject(project);
	}

	try {
		var db = await BtnStore_Init();

		var allRecords = await new Promise(function(resolve, reject) {
			var tx = db.transaction(["BtnList"], "readonly");
			var req = tx.objectStore("BtnList").getAll();
			req.onsuccess = function() { resolve(req.result || []); };
			req.onerror = reject;
		});

		var existing = allRecords.find(function(r) { return r.projectId === projectId || r.uuid === project.uuid; });
		if (existing) {
			db.close();
			eda.sys_Message.showToastMessage(I18N.format("projectAlreadyMapped", project.projectName, existing.name), "info", 2);
			return;
		}

		var nameResult = await Swal.fire({
			title: I18N.t("mapToHeaderMenu"),
			input: "text",
			inputLabel: I18N.t("buttonName"),
			inputValue: project.projectName,
			inputPlaceholder: I18N.t("egMyProject"),
			showCancelButton: true,
			confirmButtonText: I18N.t("nextStep"),
			cancelButtonText: I18N.t("cancel"),
			inputValidator: function(value) {
				if (!value || !value.trim()) return I18N.t("enterButtonName");
			},
		});
		if (!nameResult.isConfirmed) { db.close(); return; }
		var btnName = nameResult.value.trim();

		var isScript = !!(project.isScript || (project.files && project.files.length === 1 && project.files[0].fileName.endsWith(".js")));
		var startupFile = null;
		if (!isScript) {
			startupFile = await _selectStartupFile(project);
			if (startupFile === null) { db.close(); return; }
		}

		await new Promise(function(resolve, reject) {
			var tx = db.transaction(["BtnList"], "readwrite");
			var store = tx.objectStore("BtnList");
			var record = { uuid: project.uuid, projectId: project.id, name: btnName, createdAt: new Date().toISOString() };
			if (startupFile) record.startupFile = startupFile;
			var req = store.add(record);
			req.onsuccess = resolve;
			req.onerror = reject;
		});

		db.close();
		var li = createQuickButton(window.editor, btnName, project.uuid, project.id, startupFile);
		var ul = document.getElementById("quick-btn-list");
		if (ul) ul.appendChild(li);
		if (startupFile) {
			eda.sys_Message.showToastMessage(I18N.format("mappedWithStartup", startupFile), "success", 2);
		} else {
			eda.sys_Message.showToastMessage(I18N.t("mappedToMenu"), "success", 2);
		}
	} catch(e) {
		eda.sys_Message.showToastMessage(I18N.format("saveFailed", e.message), "error", 2);
	}
}

async function Code_SaveToBtnList(editor) {
	// 新架构：提示用户先创建项目
	eda.sys_Dialog.showConfirmationMessage(
		'Please save the current code as a project first, then use the project\'s "Map to Header Menu" feature.\n\nThis ensures that button effects sync in real-time after code modifications.',
		I18N.t('tip'),
		I18N.t('goCreateProject'),
		'Cancel',
		(confirmed) => {
			if (confirmed) {
				// 提示用户创建新项目
				if (window.fileTreeUI) {
					window.fileTreeUI.createNewProject();
				} else {
					eda.sys_Message.showToastMessage(I18N.t('pleaseCreateProjectFirst'), 'info', 2);
				}
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

		const ul = document.getElementById('quick-btn-list');
		if (!ul) return;

		records.forEach((record) => {
			const li = createQuickButton(editor, record.name, record.uuid, record.projectId, record.startupFile);
			ul.appendChild(li);
		});
	} catch (error) {
		console.error(I18N.t('failedToLoadQuickBtns'), error);
		eda.sys_Message.showToastMessage(`Load failed: ${error.message}`, 'error', 1);
	}
}

// 初始化插件数据库
function ExtStore_Init() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open('ExtStore', 2);
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
			console.error(I18N.t('failedToOpenDb'), e.target.error);
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
				record = { name, code, enabled: true, startupTiming: 'onPluginOpen', priority: 0 };
			}

			const putRequest = store.put(record); // put 会根据 id 自动 insert 或 update
			putRequest.onsuccess = (ev) => {
				const id = ev.target.result;
				console.log(I18N.t('saveUpdateSucceeded'), id);
				resolve(id);
			};
			putRequest.onerror = (ev) => {
				console.error(I18N.t('saveUpdateFailed'), ev.target.error);
				reject(ev.target.error);
			};
		};
		getRequest.onerror = (e) => {
			console.error(I18N.t('failedToQueryPlugin'), e.target.error);
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
				console.warn(`Plugin "${name}" not found`);
				resolve(false);
				return;
			}
			const deleteRequest = store.delete(id);
			deleteRequest.onsuccess = () => {
				ExtStore_SyncAutoStartPlugins();
				console.log(`Successfully deleted plugin "${name}" (ID: ${id})`);
				resolve(true);
			};
			deleteRequest.onerror = (e) => {
				console.error('Delete failed:', e.target.error);
				reject(e.target.error);
			};
		};
		getRequest.onerror = (e) => {
			console.error(I18N.t('failedToQueryIndex'), e.target.error);
			reject(e.target.error);
		};
	});
}

// 重命名启动项
async function ExtStore_RenameExt(oldName, newName) {
	const db = await ExtStore_Init();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['ExtStore'], 'readwrite');
		const store = transaction.objectStore('ExtStore');
		const getRequest = store.index('name').get(oldName);

		getRequest.onsuccess = (e) => {
			const record = e.target.result;
			if (!record) {
				reject(new Error(`Startup item "${oldName}" not found`));
				return;
			}
			record.name = newName;
			const putRequest = store.put(record);
			putRequest.onsuccess = () => resolve(true);
			putRequest.onerror = (ev) => reject(ev.target.error);
		};
		getRequest.onerror = (e) => reject(e.target.error);
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
				enabled: record.enabled !== false,
				startupTiming: record.startupTiming || 'onPluginOpen',
				priority: typeof record.priority === 'number' ? record.priority : 0,
				});
				cursor.continue();
			} else {
				resolve(result);
			}
		};
		request.onerror = (e) => {
			console.error(I18N.t('failedToQueryPluginList'), e.target.error);
			reject(e.target.error);
		};
	});
}

	// 切换插件启用/禁用状态
	async function ExtStore_TogglePlugin(name, enabled) {
		var db = await ExtStore_Init();
		return new Promise(function(resolve, reject) {
			var transaction = db.transaction(["ExtStore"], "readwrite");
			var store = transaction.objectStore("ExtStore");
			var getRequest = store.index("name").get(name);

			getRequest.onsuccess = function(e) {
				var record = e.target.result;
				if (!record) {
				reject(new Error("Plugin \"" + name + "\" does not exist"));
					return;
				}
				record.enabled = !!enabled;
				var putRequest = store.put(record);
				putRequest.onsuccess = function() { ExtStore_SyncAutoStartPlugins(); resolve(true); };
				putRequest.onerror = function(ev) { reject(ev.target.error); };
			};
			getRequest.onerror = function(e) { reject(e.target.error); };
		});
	}

	// 更新插件的启动时机和优先级配置
	async function ExtStore_UpdateStartupConfig(name, startupTiming, priority) {
		var db = await ExtStore_Init();
		return new Promise(function(resolve, reject) {
			var transaction = db.transaction(["ExtStore"], "readwrite");
			var store = transaction.objectStore("ExtStore");
			var getRequest = store.index("name").get(name);

			getRequest.onsuccess = function(e) {
				var record = e.target.result;
				if (!record) {
					reject(new Error("Plugin \"" + name + "\" does not exist"));
					return;
				}
				record.startupTiming = startupTiming;
				record.priority = typeof priority === 'number' ? priority : 0;
				var putRequest = store.put(record);
				putRequest.onsuccess = function() {
					ExtStore_SyncAutoStartPlugins();
					resolve(true);
				};
				putRequest.onerror = function(ev) { reject(ev.target.error); };
			};
			getRequest.onerror = function(e) { reject(e.target.error); };
		});
	}

	// 将所有"打开EDA"且已启用的插件同步到 sys_Storage 供主进程读取
	async function ExtStore_SyncAutoStartPlugins() {
		try {
			var db = await ExtStore_Init();
			var transaction = db.transaction(["ExtStore"], "readonly");
			var store = transaction.objectStore("ExtStore");
			var request = store.openCursor();
			var plugins = [];

			await new Promise(function(resolve, reject) {
				request.onsuccess = function(e) {
					var cursor = e.target.result;
					if (cursor) {
						var record = cursor.value;
						if (record.startupTiming === 'onEdaStartup' && record.enabled !== false && record.code) {
							plugins.push({
								name: record.name,
								priority: typeof record.priority === 'number' ? record.priority : 0,
								code: record.code
							});
						}
						cursor.continue();
					} else {
						resolve();
					}
				};
				request.onerror = reject;
			});

			plugins.sort(function(a, b) { return a.priority - b.priority; });
			await eda.sys_Storage.setExtensionUserConfig('autoStartPlugins', JSON.stringify(plugins));
		} catch(e) {
			console.error('SyncAutoStartPlugins failed:', e);
		}
	}

// ==========================
// 显示启动项管理模态框 (重构版 - 使用 CSS 类)
// ==========================
async function showPluginManagerModal(editor, onBackCallback) {
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
	header.textContent = I18N.t('startupItemManager');
	const closeBtn = document.createElement('button');
	closeBtn.className = 'plugin-manager-close-btn';
	closeBtn.textContent = '×';
	closeBtn.title = onBackCallback ? I18N.t('back') : I18N.t('close');
	closeBtn.onclick = () => {
		if (modal.parentNode) modal.parentNode.removeChild(modal);
		if (onBackCallback) onBackCallback();
	};
	header.appendChild(closeBtn);
	container.appendChild(header);
	// 4. 主体
	const body = document.createElement('div');
	body.className = 'plugin-manager-body';
	container.appendChild(body);
	// --- 添加启动项区域 ---
	const saveSection = document.createElement('div');
	saveSection.className = 'plugin-manager-save-section';
	const saveLabel = document.createElement('div');
	saveLabel.className = 'plugin-manager-label';
	saveLabel.textContent = I18N.t('addStartupItem');
	saveSection.appendChild(saveLabel);
	const inputGroup = document.createElement('div');
	inputGroup.className = 'plugin-manager-input-group';
	const nameInput = document.createElement('input');
	nameInput.type = 'text';
	nameInput.placeholder = I18N.t('startupItemNamePlaceholder');
	nameInput.className = 'plugin-manager-input';
	inputGroup.appendChild(nameInput);
	const saveBtn = document.createElement('button');
	saveBtn.textContent = I18N.t('add');
	saveBtn.className = 'eext-modal-btn-primary';
	saveBtn.onclick = async () => {
		const originalText = saveBtn.textContent;
		saveBtn.textContent = I18N.t('adding');
		saveBtn.disabled = true;
		try {
			await saveCurrentCodeAsPlugin(editor, nameInput, (msg, type) => {
				if (eda && eda.sys_Message) eda.sys_Message.showToastMessage(msg, type, 2);
			});
			await renderPluginList(pluginList);
			nameInput.value = '';
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
	// --- 启动项列表标题 ---
	const listTitle = document.createElement('div');
	listTitle.className = 'plugin-manager-list-title';
	listTitle.textContent = I18N.t('existingStartupItems');
	body.appendChild(listTitle);
	const pluginList = document.createElement('div');
	pluginList.className = 'plugin-manager-list';
	body.appendChild(pluginList);
	// --- 渲染启动项列表函数 ---
	async function renderPluginList(listEl) {
		listEl.innerHTML = '<div class="plugin-manager-status">Loading...</div>';
		try {
			const plugins = await ExtStore_GetExtList();
			if (plugins.length === 0) {
				listEl.innerHTML = '<div class="plugin-manager-status">No startup items yet</div>';
			} else {
				listEl.innerHTML = '';
				for (const plugin of plugins) {
					const item = document.createElement('div');
					item.className = 'plugin-manager-item';
					const nameSpan = document.createElement('span');
					nameSpan.className = 'plugin-manager-item-name';
					nameSpan.textContent = plugin.name;
					nameSpan.title = plugin.name;
					item.appendChild(nameSpan);
					const renameBtn = document.createElement('button');
					renameBtn.textContent = I18N.t('rename');
					renameBtn.className = 'eext-modal-btn';
					renameBtn.onclick = async (e) => {
						e.stopPropagation();
						const result = await Swal.fire({
							title: I18N.t('renameStartupItem'),
							input: 'text',
							inputValue: plugin.name,
							inputLabel: 'New Name',
							showCancelButton: true,
							confirmButtonText: 'OK',
							cancelButtonText: 'Cancel',
							inputValidator: (value) => {
								if (!value || !value.trim()) return 'Please enter a name';
								if (value.trim() === plugin.name) return 'Name unchanged';
							},
						});
						if (result.isConfirmed) {
							try {
								await ExtStore_RenameExt(plugin.name, result.value.trim());
								await renderPluginList(pluginList);
								eda.sys_Message.showToastMessage(I18N.t('renamedSuccessfully'), 'success', 1);
							} catch (err) {
								eda.sys_Message.showToastMessage(I18N.format('renameFailed', err.message), 'error', 2);
							}
						}
					};
					item.appendChild(renameBtn);
					const loadBtn = document.createElement('button');
					loadBtn.textContent = I18N.t('load');
					loadBtn.className = 'eext-modal-btn-primary';
					loadBtn.onclick = async (e) => {
						e.stopPropagation();
						try {
							const db = await ExtStore_Init();
							const tx = db.transaction(['ExtStore'], 'readonly');
							const store = tx.objectStore('ExtStore');
							const req = store.index('name').get(plugin.name);
							req.onsuccess = () => {
								if (req.result && req.result.code) {
									editor.setValue(req.result.code, -1);
									editor.clearSelection();
									eda.sys_Message.showToastMessage(`Loaded: ${plugin.name}`, 'success', 1);
								}
							};
						} catch (err) {
							eda.sys_Message.showToastMessage(I18N.format('loadFailed', err.message), 'error', 2);
						}
					};
					item.appendChild(loadBtn);
					const delBtn = document.createElement('button');
					delBtn.textContent = I18N.t('delete');
					delBtn.className = 'eext-modal-btn-delete';
					delBtn.onclick = async (e) => {
						e.stopPropagation();
						const confirmResult = await Swal.fire({
							title: I18N.t('confirmDelete'),
							html: `Are you sure you want to delete startup item "<strong>${plugin.name}</strong>"?`,
							icon: 'warning',
							showCancelButton: true,
							confirmButtonText: 'Delete',
							cancelButtonText: 'Cancel',
							confirmButtonColor: '#d33',
						});
						if (!confirmResult.isConfirmed) return;
						delBtn.textContent = I18N.t('deleting');
						delBtn.disabled = true;
						try {
							await ExtStore_DeleteExt(plugin.name);
							await renderPluginList(pluginList);
							if (eda && eda.sys_Message) {
								eda.sys_Message.showToastMessage(`Startup item "${plugin.name}" deleted`, 'info', 1);
							}
						} catch (err) {
							console.error('Delete failed:', err);
							if (eda && eda.sys_Message) {
								eda.sys_Message.showToastMessage(`Delete failed: ${err.message}`, 'error', 2);
							}
							delBtn.textContent = I18N.t('delete');
							delBtn.disabled = false;
						}
					};
					item.appendChild(delBtn);
					listEl.appendChild(item);
				}
			}
		} catch (err) {
			listEl.innerHTML = `<div class="plugin-manager-status error">Failed to load startup items: ${err.message}</div>`;
		}
	}
	// 初始加载
	await renderPluginList(pluginList);
	// 点击遮罩层关闭
	modal.onclick = (e) => {
		if (e.target === modal) {
			if (modal.parentNode) modal.parentNode.removeChild(modal);
			if (onBackCallback) onBackCallback();
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
				if (onBackCallback) onBackCallback();
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
		messageCallback('Please enter a startup item name', 'warn');
		return;
	}
	if (!code) {
		messageCallback(I18N.t('editorEmptyCannotSave'), 'info');
		return;
	}

	try {
		await ExtStore_SaveExt(name, code);
		messageCallback(`Startup item "${name}" saved`, 'success');
		nameInput.value = '';
	} catch (err) {
		console.error('Failed to save startup item:', err);
		messageCallback(`Save failed: ${err.message}`, 'error');
	}
}

// 保存到启动项（从文件菜单/快捷键调用）
async function ExtStore_SavePlugin(editor) {
	const code = editor.getValue().trim();
	if (!code) {
		eda.sys_Message.showToastMessage(I18N.t('editorEmptyCannotSave'), 'info', 2);
		return;
	}

	const result = await Swal.fire({
		title: I18N.t('saveToStartupItems'),
		input: 'text',
		inputLabel: 'Startup Item Name',
		inputPlaceholder: 'e.g.: Auto-init script',
		showCancelButton: true,
		confirmButtonText: 'Save',
		cancelButtonText: 'Cancel',
		inputValidator: (value) => {
			if (!value || !value.trim()) return 'Please enter a startup item name';
		},
	});

	if (result.isConfirmed) {
		try {
			await ExtStore_SaveExt(result.value.trim(), code);
			eda.sys_Message.showToastMessage(`Startup item "${result.value.trim()}" saved`, 'success', 2);
		} catch (err) {
			eda.sys_Message.showToastMessage(`Save failed: ${err.message}`, 'error', 2);
		}
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
					if (record?.code && typeof record.code === 'string' && record.enabled !== false && record.startupTiming !== 'onEdaStartup') {
						try {
							// 直接使用 eval 执行插件代码
							eval(record.code);
							// onLog(`插件 "${record.name}" 执行成功`, 'success');
							results.push({ name: record.name, status: 'success' });
						} catch (err) {
							console.error(`Error executing plugin "${record.name}":`, err);
							onLog(`Plugin "${record.name}" execution failed: ${err.message}`, 'error');
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
				console.error('Failed to scan plugin database:', error);

				// 清理（即使出错也要清理）
				tempKeys.forEach((key) => {
					delete window[key];
				});

				onLog(`Failed to scan plugins: ${error.message}`, 'error');
				reject(error);
			};
		});
	} catch (err) {
		console.error('Database initialization failed, cannot load plugins:', err);
		onLog(`Database initialization failed: ${err.message}`, 'error');
		throw err;
	}
}

/**
 * 打开文件选择窗口，读取用户选择的 .js 文件内容，并加载到指定的 Ace Editor 中
 * @param {Object} editor - Ace Editor 实例
 */
function ImportFile(editor) {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = '.js';
	input.style.display = 'none';
	document.body.appendChild(input);

	input.onchange = (event) => {
		const file = event.target.files[0];
		input.remove();
		if (!file) return;

		if (!file.name.endsWith('.js')) {
			eda.sys_Message.showToastMessage(I18N.t('selectJsFile'), 'warn', 2);
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			editor.session.setValue(e.target.result);
			editor.session.setMode('ace/mode/javascript');
		};
		reader.onerror = () => {
			console.error('Error reading file');
			eda.sys_Message.showToastMessage(I18N.t('failedToReadFile'), 'error', 2);
		};

		reader.readAsText(file);
	};

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
		const isDark = document.body.classList.contains('dark-theme');
		const menuBg = isDark ? '#404040' : '#fff';
		const menuColor = isDark ? '#e5e5e5' : '#333';
		const menuBorder = isDark ? '#222' : '#d9d9d9';
		const menuHover = isDark ? '#6283a2' : '#e6f7ff';

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
			createMenuItem(matchedMethod ? 'Jump to Method Docs' : 'No jumpable method found', !!matchedMethod, () => {
				let clean = matchedMethod.startsWith('eda.') ? matchedMethod.substring(4) : matchedMethod;
				const url = `https://prodocs.lceda.cn/cn/api/reference/pro-api.${clean.toLowerCase()}.html`;
				window.open(url, '_blank');
			}),
		);

		// 2. 生成测试用例
		menu.appendChild(
			createMenuItem('Generate Test Case', !!matchedMethod, () => {
				generateTestCase(editor, matchedMethod);
			}),
		);

		// 3. 添加到补全
		menu.appendChild(
			createMenuItem('Add to Completions', true, () => {
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
	let doc = `Method path: ${info.methodPath}\n`;
	doc += `Description: ${info.description || 'None'}\n`;
	if (info.parameters && info.parameters.length > 0) {
		doc += I18N.t('parameters') + ':\n';
		info.parameters.forEach((p) => {
			doc += `  - ${p.name}: ${p.description || ''}\n`;
		});
	} else {
		doc += 'Parameters: none (can be called directly)\n';
	}
	doc += `Returns: ${info.returns || 'None'}\n`;
	doc += `Remarks: ${info.remarks || 'None'}\n`;
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

	_toast(`[1/3] Analyzing parameter dependencies of ${info.description || methodPath}...`, 'info', 2);
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
		_toast(`[2/3] ${info.description} has no external dependencies, generating directly`, 'info', 2);
	} else {
		for (let i = 0; i < uniqueDeps.length; i++) {
			const dep = uniqueDeps[i];
			_toast(`[2/3] Tracing dependency (${i + 1}/${uniqueDeps.length}): ${dep.methodPath} — ${dep.description || ''}`, 'info', 2);
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
		depsDocs = '\n## Dependency methods (in call order, leaf nodes first)\n';
		dependencyChain.forEach((dep, i) => {
			depsDocs += `\n### Dependency ${i + 1}\n`;
			depsDocs += _formatMethodDoc(dep);
		});
	}

	const systemPrompt = `You are a test case generator for the EDA (EasyEDA Pro) extension API.

Your task is to generate **directly runnable JavaScript test case code** for the specified API method.

## Rules

1. **Output format**: Output only a single block of pure JavaScript code. Do not include markdown code fences (no \`\`\`), and do not include any explanatory text.
2. **JSDoc header**: The top of the code must contain a JSDoc comment block in the following format:
   /**
    * <full method path>()
    * Method case: <method description>
    * @parameters
    * <param name>: <param description>
    * ... (if there are no parameters, write "This method has no input parameters and can be called directly")
    * @returns <return value description>
    * @remarks: <remarks; if none, write "None">
    */
3. **Dependency tracing**: The dependency methods provided below must be called in order first, and their return values passed as arguments to the target method.
4. **Variable naming**: Use meaningful variable names for each API call result (e.g. libraryList, searchResult), and add a console.log after each call to print the result.
5. **All API calls are asynchronous**: Use await for calls; code runs in top-level scope (no need to wrap in an async function).
6. **Only use the provided methods**: Never fabricate APIs that do not exist.
7. **Parameter values**: Use reasonable example values for string parameters (e.g. '' for an empty search term); for optional parameters you may use undefined.`;

	const userPrompt = `## Target method
${targetDoc}
${depsDocs}
Please generate test case code for ${methodPath}.`;

	return { systemPrompt, userPrompt };
}

/**
 * 调用 AI API 生成测试用例并写入编辑器
 */
async function generateTestCase(editor, methodPath) {
	let chatConfig;
	try {
		const stored = localStorage.getItem('ai_profiles');
		const idx = parseInt(localStorage.getItem('ai_active_profile')) || 0;
		if (stored) {
			const profiles = JSON.parse(stored);
			chatConfig = (Array.isArray(profiles) && profiles.length > idx) ? profiles[idx] : null;
		}
	} catch (e) {
		chatConfig = null;
	}

	if (!chatConfig || !chatConfig.apiKey) {
		if (typeof eda !== 'undefined' && eda.sys_Message) {
			eda.sys_Message.showToastMessage(I18N.t('fillApiKeyAiConfig'), 'warn', 3);
		} else {
			eda.sys_Message.showToastMessage(I18N.t('fillApiKeyAiConfig'), 'warn', 3);
		}
		return;
	}

	// 第一阶段：本地依赖追溯（带逐步 toast）
	const dependencyChain = await _traceWithProgress(methodPath);

	// 第二阶段：构建 prompt 并调用 AI
	const prompts = _buildTestCasePrompt(methodPath, dependencyChain);
	if (!prompts) {
		_toast(`${methodPath} not found in the method library`, 'error', 2);
		return;
	}

	_toast('[3/3] Generating code...', 'info', 3);

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
				temperature: chatConfig.temperature ?? 0.3,
			}),
		});

		if (!response.ok) {
			const errData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
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
			_toast('Test case generated', 'success', 2);
		} else {
			throw new Error('AI returned empty content');
		}
	} catch (error) {
		console.error('Failed to generate test case:', error);
		_toast(`Generation failed: ${error.message}`, 'error', 3);
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
		_toast('The current line cannot be recognized as a valid completion item', 'warn', 2);
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
			_toast(`"${parsed.caption}" already exists in custom completions`, 'info', 2);
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

		// 刷新左侧导航面板的常用代码视图
		if (window.leftNavPanel) {
			await window.leftNavPanel.loadCompleterStore();
		}

		_toast(`Completion added: ${parsed.caption}`, 'success', 2);
	} catch (err) {
		console.error('Failed to add custom completion:', err);
		_toast(`Add failed: ${err.message}`, 'error', 2);
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
				insertMatch: function (editor, data) {
					if (!data.value) { editor.insert(data.caption || data.name || ''); return; }
					var pos = editor.getCursorPosition();
					var line = editor.session.getLine(pos.row);
					var prefix = line.substring(0, pos.column);
					var match = prefix.match(/[\w\$¢-￿]+$/);
					var startCol = match ? pos.column - match[0].length : pos.column;
					editor.session.replace(
						{ start: { row: pos.row, column: startCol }, end: pos },
						data.value
					);
					_selectFirstParam(editor, data.value, pos.row, startCol);
t				}
			};
editor.completers.push(userCompleter);
	}

	for (const rec of records) {
		// 避免重复添加
		if (userCompleter._items.some((it) => it.caption === rec.caption && it._srcType === 'caption')) continue;

		const docLines = [];
		if (rec.description) docLines.push(rec.description);
		docLines.push('Completion value: ' + rec.value);
		if (rec.params && rec.params.length > 0) {
			docLines.push('Parameters: ' + rec.params.join(', '));
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
		console.error('Failed to load custom completions:', err);
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
		showToast('Content cannot be empty');
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
			console.warn(`Unknown message type "${config.type}"`);
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
		console.error('Error displaying message', error);
	}
}
