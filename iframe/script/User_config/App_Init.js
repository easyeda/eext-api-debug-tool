// document.title = 'Ace Editor - EDA' + eda.sys_Storage.getExtensionUserConfig('version'); 暂时失效 等解决
// console.log(eda.sys_Storage.getExtensionUserConfig('version'))

const editor = ace.edit('editor');
window.editor = editor; // Expose to global scope for AI chat tools
ACE_Init(editor);

// Markdown 预览：将 MD 内容转为带样式的 HTML 页面
function buildMarkdownPreviewHTML(mdContent) {
	const isDark = document.body.classList.contains('dark-theme');
	const bg = isDark ? '#404040' : '#fff';
	const fg = isDark ? '#e5e5e5' : '#333';
	const codeBg = isDark ? '#353535' : '#f5f5f5';
	const borderColor = isDark ? '#222' : '#d9d9d9';
	const linkColor = isDark ? '#40a9ff' : '#1890ff';
	const blockquoteBorder = isDark ? '#666' : '#d9d9d9';
	const blockquoteColor = isDark ? '#868686' : '#666';

	const renderer = {
		code({ text, lang }) {
			let highlighted;
			if (lang && hljs.getLanguage(lang)) {
				highlighted = hljs.highlight(text, { language: lang }).value;
			} else {
				highlighted = hljs.highlightAuto(text).value;
			}
			return `<pre><code class="hljs">${highlighted}</code></pre>`;
		}
	};

	marked.use({ renderer });
	const rendered = marked.parse(mdContent);

	return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body {
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
	font-size: 15px;
	line-height: 1.7;
	color: ${fg};
	background: ${bg};
	padding: 32px 48px;
	max-width: 900px;
	margin: 0 auto;
	word-wrap: break-word;
}
h1, h2, h3, h4, h5, h6 {
	margin-top: 24px;
	margin-bottom: 16px;
	font-weight: 600;
	line-height: 1.25;
}
h1 { font-size: 2em; padding-bottom: 0.3em; border-bottom: 1px solid ${borderColor}; }
h2 { font-size: 1.5em; padding-bottom: 0.3em; border-bottom: 1px solid ${borderColor}; }
h3 { font-size: 1.25em; }
p { margin-top: 0; margin-bottom: 16px; }
a { color: ${linkColor}; text-decoration: none; }
a:hover { text-decoration: underline; }
code {
	font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
	font-size: 85%;
	background: ${codeBg};
	padding: 0.2em 0.4em;
	border-radius: 4px;
}
pre {
	background: ${codeBg};
	padding: 16px;
	border-radius: 6px;
	overflow-x: auto;
	line-height: 1.45;
	margin-bottom: 16px;
}
pre code {
	background: transparent;
	padding: 0;
	font-size: 85%;
}
blockquote {
	margin: 0 0 16px 0;
	padding: 0 16px;
	border-left: 4px solid ${blockquoteBorder};
	color: ${blockquoteColor};
}
table {
	border-collapse: collapse;
	width: 100%;
	margin-bottom: 16px;
}
th, td {
	border: 1px solid ${borderColor};
	padding: 8px 12px;
	text-align: left;
}
th { background: ${codeBg}; font-weight: 600; }
img { max-width: 100%; height: auto; }
ul, ol { padding-left: 2em; margin-bottom: 16px; }
li { margin-bottom: 4px; }
hr { border: none; border-top: 1px solid ${borderColor}; margin: 24px 0; }
.hljs { background: ${codeBg}; }
::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: ${isDark ? '#2d2d2d' : '#f0f0f0'}; }
::-webkit-scrollbar-thumb { background: ${isDark ? '#555' : '#c1c1c1'}; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: ${isDark ? '#777' : '#a0a0a0'}; }
</style>
</head>
<body>${rendered}</body>
</html>`;
}

// Inject eda bridge into HTML preview content
function injectEdaBridge(html) {
	const bridge = '<script>\n' +
		'(function() {\n' +
		'	var p = window.parent || window.top;\n' +
		'	if (!p || p === window) return;\n' +
		'	var names = Object.getOwnPropertyNames(p);\n' +
		'	for (var i = 0; i < names.length; i++) {\n' +
		'		var k = names[i];\n' +
		'		if (k in window) continue;\n' +
		'		try { window[k] = p[k]; } catch(e) {}\n' +
		'	}\n' +
		'	window.__parent = p;\n' +
		'})();\n' +
		'<\/script>';
	if (/<head[^>]*>/i.test(html)) return html.replace(/(<head[^>]*>)/i, '$1\n' + bridge);
	if (/<body[^>]*>/i.test(html)) return html.replace(/(<body[^>]*>)/i, '$1\n' + bridge);
	return bridge + '\n' + html;
}

editor.setValue("", -1);

// 注册 Ctrl+滚轮缩放字体
let currentFontSize = 14;
ACE_ChangeCodeSize(editor, currentFontSize, showToast);

// 注册 EDA 智能补全
ACE_CodingForEDA(editor, edcode);

// 加载用户自定义补全
UserCompleter_LoadAll(editor);

const loadingBar = document.getElementById('loading-bar');
const loadingOverlay = document.getElementById('loading-overlay');
if (loadingBar) loadingBar.style.width = '30%';
(async () => {
	await ThemeEngine.init();
	if (loadingBar) loadingBar.style.width = '70%';
	await new Promise(r => setTimeout(r, 150));
	if (loadingOverlay) {
		loadingOverlay.style.opacity = '0';
		loadingOverlay.style.transition = 'opacity 0.3s ease';
		setTimeout(() => { if (loadingOverlay) loadingOverlay.remove(); }, 300);
	}
})();

// 初始化 AI 按钮状态
GetVibeCodingConfig();

// 初始化脏标记
try { eda.sys_Storage.setExtensionUserConfig('__has_dirty', 'false'); } catch(e) {}

// 加载并执行已保存插件
ExtStore_LoadAndRunAllPlugins();
// 加载快捷按钮列表
Code_LoadBtnListFromDB(editor);

// 初始化项目管理器
(async function initProjectManager() {
	await window.projectManager.initDB();

	// 初始化左侧导航面板
	window.leftNavPanel = new LeftNavPanel(editor);

	// 初始化文件树（但不显示，由导航面板控制）
	window.fileTreeUI = new FileTreeUI('file-tree', editor);

	await window.fileTreeUI.render();

	// 初始化项目文件补全器
	window.projectCompleter = new ProjectCompleter(editor);
	// 初始化弹出面板管理器
	PopoutManager.init();

	// 等待 TabManager 定义完成后恢复标签页
	Promise.resolve().then(function() {
		if (typeof TabManager !== "undefined") {
			TabManager.restoreTabs();
		} else {
			setTimeout(function() {
				if (typeof TabManager !== "undefined") {
					TabManager.restoreTabs();
				}
			}, 100);
		}
	});

})();
// 迁移旧版 CodeStore 已保存代码到项目系统
if (typeof migrateCodeStoreToProjects === "function") {
	migrateCodeStoreToProjects();
}

// 在 iframe 关闭前保存标签页状态（使用 localStorage 同步备份）
window.addEventListener("beforeunload", function() {
	try { if (typeof PopoutManager !== "undefined") PopoutManager.closeAll(); } catch(e) {}
	if (typeof TabManager !== "undefined" && TabManager._tabs) {
		try {
			var data = TabManager._tabs.map(function(t) { return { projectId: t.projectId, fileName: t.fileName, label: t.label }; });
			localStorage.setItem('__open_tabs_backup', JSON.stringify(data));
			// 尝试同步保存到 EDA 存储（可能不会完成，但 localStorage 已经保存了）
			try { eda.sys_Storage.setExtensionUserConfig('__open_tabs', JSON.stringify(data)); } catch(e) {}
		} catch(e) {}
	}
});

async function saveCurrentProjectFile() {
	if (!window.projectManager.currentFile || !window.projectManager.currentProject) {
		eda.sys_Message.showToastMessage("没有打开的项目文件", "warn", 1);
		return;
	}
	if (window.projectManager.currentProject.isBuiltIn) {
		eda.sys_Message.showToastMessage("内置项目不可保存", "warn", 1);
		return;
	}
	try {
		await window.projectManager.saveFileContent(window.projectManager.currentFile, editor.getValue());
		window.projectManager._savedContent = editor.getValue();
		if (typeof TabManager !== "undefined") TabManager.markDirty(window.projectManager.currentProject ? window.projectManager.currentProject.id : null, window.projectManager.currentFile, false);
		if (window.fileTreeUI) {
			window.fileTreeUI._dirty = false;
			window.fileTreeUI._registerDirtyListener();
			await window.fileTreeUI.render();
		}
		eda.sys_Message.showToastMessage("已保存: " + window.projectManager.currentFile, "success", 1);
	} catch(e) {
		eda.sys_Message.showToastMessage("保存失败: " + e.message, "error", 2);
	}
}

// ========== TabManager (UUID-based) ==========
var TabManager = {
	_tabs: [],
	_activeKey: null,
	_restoring: false,

	_makeKey: function(projectId, fileName) {
		return (projectId || "_") + ":" + (fileName || "_");
	},

	open: function(projectId, fileName, label) {
		if (!fileName) return;
		var key = this._makeKey(projectId, fileName);
		var existing = this._tabs.find(function(t) { return t.key === key; });
		if (!existing) {
			this._tabs.push({ key: key, label: label || fileName.split("/").pop(), dirty: false, projectId: projectId, fileName: fileName });
		}
		this._activeKey = key;
		this.render();
		if (!this._restoring) this.saveTabs();
	},

	isOpen: function(projectId, fileName) {
		var key = this._makeKey(projectId, fileName);
		return !!this._tabs.find(function(t) { return t.key === key; });
	},

	getActiveKey: function() { return this._activeKey; },

	getTab: function(projectId, fileName) {
		var key = this._makeKey(projectId, fileName);
		return this._tabs.find(function(t) { return t.key === key; });
	},

	markDirty: function(projectId, fileName, dirty) {
		var key = this._makeKey(projectId, fileName);
		var tab = this._tabs.find(function(t) { return t.key === key; });
		if (tab) { tab.dirty = !!dirty; }
		this.render();
		_updateDirtyFlag();
	},

	close: async function(projectId, fileName) {
		var key = this._makeKey(projectId, fileName);
		var idx = this._tabs.findIndex(function(t) { return t.key === key; });
		if (idx < 0) return;
		var tab = this._tabs[idx];

		if (tab.dirty) {
			var result = await Swal.fire({
				title: "未保存的更改",
				html: "文件 <strong>" + tab.label + "</strong> 有未保存的更改，是否保存？",
				icon: "warning",
				showDenyButton: true,
				showCancelButton: true,
				confirmButtonText: "保存",
				denyButtonText: "不保存",
				cancelButtonText: "取消",
			});
			if (result.isConfirmed) {
				await window.projectManager.saveFileContent(tab.fileName, editor.getValue());
				if (window.fileTreeUI) { window.fileTreeUI._dirty = false; window.fileTreeUI._registerDirtyListener(); }
				eda.sys_Message.showToastMessage("已保存: " + tab.label, "success", 1);
			} else if (result.isDenied) {
			} else { return; }
		}

		this._tabs.splice(idx, 1);
		_updateDirtyFlag();
		this.saveTabs();
		if (this._activeKey === key) {
			var next = this._tabs.length > 0 ? this._tabs[this._tabs.length-1] : null;
			this._activeKey = next ? next.key : null;
			if (next) {
				// 先加载下一个 tab 对应的项目，确保 loadFile 中的 TabManager.open 使用正确的 projectId
				var curPid = window.projectManager.currentProject ? window.projectManager.currentProject.id : null;
				if (next.projectId && next.projectId !== curPid && next.projectId > 0) {
					var proj = await window.projectManager.loadProject(next.projectId);
					window.projectManager.currentProject = proj;
					if (window.fileTreeUI) {
						window.fileTreeUI = new FileTreeUI("file-tree", editor);
						await window.fileTreeUI.render();
					}
				}
				if (window.fileTreeUI && next.fileName !== window.projectManager.currentFile) {
					await window.fileTreeUI.loadFile(next.fileName, true);
				}
			} else {
				editor.setValue("", -1);
				window.projectManager.currentFile = null;
				window.projectManager.currentProject = null;
			}
		}
		this.render();
	},

	switchTo: function(projectId, fileName) {
		var key = this._makeKey(projectId, fileName);
		var tab = this._tabs.find(function(t) { return t.key === key; });
		if (tab) { this._activeKey = key; this.render(); }
	},
		updateFileName: function(projectId, oldFileName, newFileName, newLabel) {
			var oldKey = this._makeKey(projectId, oldFileName);
			var idx = this._tabs.findIndex(function(t) { return t.key === oldKey; });
			if (idx >= 0) {
				var newKey = this._makeKey(projectId, newFileName);
				this._tabs[idx].fileName = newFileName;
				this._tabs[idx].label = newLabel || newFileName.split("/").pop();
				this._tabs[idx].key = newKey;
				if (this._activeKey === oldKey) {
					this._activeKey = newKey;
				}
				this.saveTabs();
				this.render();
			}
			},

	saveTabs: async function() {
		var data = this._tabs.map(function(t) { return { projectId: t.projectId, fileName: t.fileName, label: t.label }; });
		try { localStorage.setItem('__open_tabs_backup', JSON.stringify(data)); } catch(e) {}
		try { await eda.sys_Storage.setExtensionUserConfig('__open_tabs', JSON.stringify(data)); } catch(e) {}
	},

	restoreTabs: async function() {
		this._restoring = true;
		try {
			var raw = localStorage.getItem('__open_tabs_backup');
			if (!raw) {
				raw = await eda.sys_Storage.getExtensionUserConfig('__open_tabs');
			}
			if (!raw) return;
			var data = JSON.parse(raw);
			if (!data || !data.length) return;
			if (!window.projectManager.db) await window.projectManager.initDB();
			if (!window.fileTreeUI) window.fileTreeUI = new FileTreeUI("file-tree", editor);

			for (var i = 0; i < data.length; i++) {
				var t = data[i];
				if (!t.fileName) continue;
				try {
					if (t.projectId && t.projectId > 0) {
						var proj = await window.projectManager.loadProject(t.projectId);
						window.projectManager.currentProject = proj;
					}
					if (i === data.length - 1) {
						if (window.fileTreeUI) await window.fileTreeUI.loadFile(t.fileName);
						this._activeKey = this._makeKey(t.projectId, t.fileName);
					}
					this.open(t.projectId, t.fileName, t.label || t.fileName.split("/").pop());
				} catch(e) {}
			}
			this.render();
			try { localStorage.removeItem('__open_tabs_backup'); } catch(e) {}
		} catch(e) {}
		finally {
			this._restoring = false;
			await this.saveTabs();
		}
	},

	render: function() {
		var bar = document.getElementById("tab-bar");
		if (!bar) return;
		if (this._tabs.length === 0) {
			bar.className = "empty";
			bar.innerHTML = "";
			return;
		}
		bar.className = "";
		var self = this;
		bar.innerHTML = "";
		this._tabs.forEach(function(tab) {
			var isActive = tab.key === self._activeKey;
			var div = document.createElement("div");
			div.className = "tab-item" + (isActive ? " active" : "") + (tab.dirty ? " dirty" : "");
			div.title = tab.key;
			div.textContent = tab.label;
			div.onclick = async function() {
				if (tab.key === self._activeKey) return;
				var curPid = window.projectManager.currentProject ? window.projectManager.currentProject.id : null;
				if (tab.projectId && tab.projectId !== curPid && tab.projectId > 0) {
					var proj = await window.projectManager.loadProject(tab.projectId);
					window.projectManager.currentProject = proj;
					if (window.fileTreeUI) { window.fileTreeUI = new FileTreeUI("file-tree", editor); await window.fileTreeUI.render(); }
				}
				if (window.fileTreeUI) await window.fileTreeUI.loadFile(tab.fileName);
			};

			var closeBtn = document.createElement("button");
			closeBtn.className = "tab-close";
			closeBtn.textContent = "x";
			closeBtn.onclick = function(e) {
				e.stopPropagation();
				self.close(tab.projectId, tab.fileName);
			};
			div.appendChild(closeBtn);
			bar.appendChild(div);
		});
	},
};

async function _updateDirtyFlag() {
	var isDirty = TabManager._tabs.some(function(t) { return t.dirty; });
	try { await eda.sys_Storage.setExtensionUserConfig('__has_dirty', isDirty ? 'true' : 'false'); } catch(e) {}
}

// 注册右键跳转文档
const methodList = edcode.map((item) => item.methodPath);
injectContextMenuJumpToDocs(editor, methodList);

// 运行/预览统一入口（运行按钮和快捷键共用）
async function handleRunAction() {
	const runBtn = document.getElementById('run-btn');
	const editorDiv = document.getElementById('editor');
	const previewContainer = document.getElementById('html-preview-container');
	const previewFrame = document.getElementById('html-preview-frame');


	// 检查是否正在预览模式
	if (previewContainer.classList.contains('active')) {
		previewContainer.classList.remove('active');
		editorDiv.style.display = 'block';

		if (window.projectManager && window.projectManager.currentFile) {
			const ext = window.projectManager.currentFile.split('.').pop().toLowerCase();
			runBtn.textContent = (ext === 'md' || ext === 'markdown') ? '预览' : '运行';
		} else {
			const currentMode = editor.session.getMode().$id || '';
			runBtn.textContent = currentMode.indexOf('markdown') !== -1 ? '预览' : '运行';
		}

		previewFrame.src = 'about:blank';
		return;
	}

	// 检查当前文件类型
	if (window.projectManager && window.projectManager.currentFile) {
		const fileName = window.projectManager.currentFile;
		const ext = fileName.split('.').pop().toLowerCase();

		if (ext === 'html') {
			const currentFile = window.projectManager.currentProject?.files?.find(
				f => f.fileName === fileName
			);
			const rawContent = editor.getValue();
			const content = (currentFile && window.htmlRenderer) ?
				window.htmlRenderer.buildHTMLContent({ ...currentFile, content: rawContent },
					window.projectManager
				) :
				rawContent;
			const finalContent = injectEdaBridge(content);
			const blob = new Blob([finalContent], { type: 'text/html' });
			const url = URL.createObjectURL(blob);

			previewFrame.src = url;
			editorDiv.style.display = 'none';
			previewContainer.classList.add('active');
			runBtn.textContent = '停止';

			eda.sys_Message.showToastMessage('HTML 预览已打开', 'success', 2);

			previewFrame.addEventListener('load', () => {
				URL.revokeObjectURL(url);
			}, { once: true });
		} else if (ext === 'md' || ext === 'markdown') {
			const mdContent = editor.getValue();
			const htmlContent = buildMarkdownPreviewHTML(mdContent);
			const blob = new Blob([htmlContent], { type: 'text/html' });
			const url = URL.createObjectURL(blob);

			previewFrame.src = url;
			editorDiv.style.display = 'none';
			previewContainer.classList.add('active');
			runBtn.textContent = '停止';

			eda.sys_Message.showToastMessage('Markdown 预览已打开', 'success', 2);

			previewFrame.addEventListener('load', () => {
				URL.revokeObjectURL(url);
			}, { once: true });
		} else {
			ACE_RunCode(editor);
		}
	} else {
		const content = editor.getValue().trim();

		try {
			const newcode = `(async () => {\n ${content}\n})();`;
			eval(newcode);
		} catch (jsError) {
			const isHTML = /^\s*<!DOCTYPE\s+html/i.test(content) ||
				/^\s*<html[\s>]/i.test(content) ||
				(/<!DOCTYPE\s+html/i.test(content.substring(0, 200)) &&
					/<html[\s>]/i.test(content.substring(0, 500)));

			if (isHTML) {
				if (/<script[^>]+src=/i.test(content)) {
					eda.sys_Message.showToastMessage(
						'检测到外部脚本引用，但未在项目中。外部脚本将无法加载，请创建项目或内联脚本。',
						'warn',
						4
					);
				}

				const blob = new Blob([injectEdaBridge(content)], { type: 'text/html' });
				const url = URL.createObjectURL(blob);

				previewFrame.src = url;
				editorDiv.style.display = 'none';
				previewContainer.classList.add('active');
				runBtn.textContent = '停止';

				eda.sys_Message.showToastMessage('HTML 预览已打开', 'success', 2);

				previewFrame.addEventListener('load', () => {
					URL.revokeObjectURL(url);
				}, { once: true });
			} else {
				const isMarkdown = /^#{1,6}\s/m.test(content) ||
					/^\s*[-*+]\s/m.test(content) ||
					/^\s*\d+\.\s/m.test(content) ||
					/\[.+\]\(.+\)/.test(content) ||
					/^\s*>/m.test(content) ||
					/```/.test(content) ||
					/^\s*\|.+\|/m.test(content);

				if (isMarkdown) {
					const htmlContent = buildMarkdownPreviewHTML(content);
					const blob = new Blob([htmlContent], { type: 'text/html' });
					const url = URL.createObjectURL(blob);

					previewFrame.src = url;
					editorDiv.style.display = 'none';
					previewContainer.classList.add('active');
					runBtn.textContent = '停止';

					eda.sys_Message.showToastMessage('Markdown 预览已打开', 'success', 2);

					previewFrame.addEventListener('load', () => {
						URL.revokeObjectURL(url);
					}, { once: true });
				} else {
					eda.sys_Message.showToastMessage(
						'执行失败，内容不是有效的 JS、HTML 或 MD 格式。',
						'error',
						4
					);
				}
			}
		}
	}
}

// 按钮事件绑定
document.getElementById('SaveinLeft-btn')?.addEventListener('click', () => {
	Code_SaveToBtnList(editor);
});
	document.getElementById('run-btn').addEventListener('click', handleRunAction);
document.getElementById('ai-btn').addEventListener('click', () => {
	SetVibeCodingConfig();
});
document.getElementById('import-btn')?.addEventListener('click', () => {
	ImportFile(editor);
});
document.getElementById('export-btn')?.addEventListener('click', () => {
	ExportFileForJs(editor.getValue(), Date() + '_script.js');
});
document.getElementById('Ext-btn')?.addEventListener('click', () => {
	showPluginManagerModal(editor);
});
document.getElementById('completer-store-btn')?.addEventListener('click', () => {
	showCompleterStoreModal(editor);
});

// 文件按钮 - 使用右键菜单
const fileBtn = document.getElementById('file-btn');
if (fileBtn) {
	fileBtn.addEventListener('click', (e) => {
		e.preventDefault();
		showFileContextMenu(e, editor);
	});
}

// 设置按钮 - 使用模态框
const settingsBtn = document.getElementById('settings-btn');
if (settingsBtn) {
	settingsBtn.addEventListener('click', () => {
		showSettingsModal(editor, null, null);
	});
}

// 快捷键绑定 - 使用配置系统
(async function initKeyboardShortcuts() {
	const shortcuts = await loadShortcuts();
	const platform = getPlatform();

	editor.commands.removeCommand('gotoline');

	const formatKey = shortcuts.format[platform].replace(/\+/g, '-');
	editor.commands.addCommand({
		name: 'formatCode',
		bindKey: { win: shortcuts.format.win.replace(/\+/g, '-'), mac: shortcuts.format.mac.replace(/\+/g, '-') },
		exec: function(editor) {
			if (window.keyboardShortcutsModalOpen) return;
			formatEditorCode(editor);
		},
	});

	document.addEventListener('keydown', function(e) {
		if (window.keyboardShortcutsModalOpen) return;

		if (matchesShortcut(e, shortcuts.find[platform]) || matchesShortcut(e, shortcuts.replace[platform])) {
			return;
		}

		if (matchesShortcut(e, shortcuts.run[platform])) {
			e.preventDefault();
			handleRunAction();
		} else if (matchesShortcut(e, shortcuts.saveFile[platform])) {
			e.preventDefault();
			saveCurrentProjectFile();
		}
		else if (matchesShortcut(e, shortcuts.import[platform])) {
			e.preventDefault();
			ImportFile(editor);
		}
		else if (matchesShortcut(e, shortcuts.export[platform])) {
			e.preventDefault();
			ExportFileForJs(editor.getValue(), Date() + '_script.js');
		}
		else if (matchesShortcut(e, shortcuts.saveToList[platform])) {
			e.preventDefault();
			Code_SaveToBtnList(editor);
		}
		else if (matchesShortcut(e, shortcuts.saveAsPlugin[platform])) {
			e.preventDefault();
			ExtStore_SavePlugin(editor);
		}
	});
})();