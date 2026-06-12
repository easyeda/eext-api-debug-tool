/**
 * 显示文件操作右键菜单
 * @param {Event} e - 点击事件
 * @param {Object} editor - ACE 编辑器实例
 */
function showFileContextMenu(e, editor) {
	const isDark = document.body.classList.contains('dark-theme');
	const menuBg = isDark ? '#404040' : '#fff';
	const menuBorder = isDark ? '#222' : '#d9d9d9';
	const menuShadow = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)';
	const textColor = isDark ? '#e5e5e5' : '#333';
	const hoverBg = isDark ? '#6283a2' : '#e6f7ff';

	let menu = document.getElementById('file-context-menu');
	if (!menu) {
		menu = document.createElement('div');
		menu.id = 'file-context-menu';
		document.body.appendChild(menu);
	}

	menu.style.cssText = `
		position: fixed; z-index: 10000;
		background: ${menuBg}; border: 1px solid ${menuBorder};
		box-shadow: 2px 2px 8px ${menuShadow}; display: block;
		font-size: 12px; min-width: 120px; border-radius: 4px; padding: 4px 0;
	`;

	const menuItems = [
		{ text: '新建项目', action: () => showNewProjectDialog(editor) },
	{ text: '新建脚本', action: () => showNewScriptDialog(editor) },
	];

	menu.innerHTML = '';
	menuItems.forEach((item) => {
		if (item.text === '---') {
			const sep = document.createElement('div');
			sep.style.cssText = `height:1px;background:${menuBorder};margin:4px 0;`;
			menu.appendChild(sep);
			return;
		}
		const mi = document.createElement('div');
		mi.textContent = item.text;
		mi.style.cssText = `padding:8px 16px;cursor:pointer;color:${textColor};user-select:none;transition:background 0.2s;`;
		mi.onmouseenter = () => (mi.style.backgroundColor = hoverBg);
		mi.onmouseleave = () => (mi.style.backgroundColor = '');
		mi.onclick = () => { menu.style.display = 'none'; if (item.action) item.action(); };
		menu.appendChild(mi);
	});

	const btnRect = e.target.getBoundingClientRect();
	let left = btnRect.right + 5;
	let top = btnRect.top;
	if (left + 120 > window.innerWidth) left = btnRect.left - 125;
	if (top + menuItems.length * 40 > window.innerHeight) top = window.innerHeight - menuItems.length * 40 - 10;
	menu.style.left = `${left}px`;
	menu.style.top = `${top}px`;

	const closeMenu = (ev) => {
		if (!menu.contains(ev.target) && ev.target !== e.target) {
			menu.style.display = 'none';
			document.removeEventListener('click', closeMenu);
		}
	};
	setTimeout(() => document.addEventListener('click', closeMenu), 10);
}

/**
 * 迁移旧版 CodeStore 中的已保存代码到项目系统（脚本）
 * 在启动时调用，仅执行一次
 */
async function migrateCodeStoreToProjects() {
	try {
		var db = await new Promise(function(resolve, reject) {
			var req = indexedDB.open("CodeStore", 1);
			req.onsuccess = function(e) { resolve(e.target.result); };
			req.onerror = function() { resolve(null); };
		});
		if (!db || !db.objectStoreNames.contains("CodeList")) return;

		var items = await new Promise(function(resolve) {
			var tx = db.transaction(["CodeList"], "readonly");
			var store = tx.objectStore("CodeList");
			var req = store.getAll();
			req.onsuccess = function(e) { resolve(e.target.result || []); };
			req.onerror = function() { resolve([]); };
		});
		db.close();

		if (items.length === 0) {
			indexedDB.deleteDatabase("CodeStore");
			return;
		}

		var migrated = 0;
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			var scriptName = (item.name || "unnamed").replace(/[^a-zA-Z0-9_一-鿿-]/g, "-");
			if (!scriptName.endsWith(".js")) scriptName += ".js";
			var projectName = scriptName.replace(/.js$/, "");
			try {
				var project = await window.projectManager.createProject(projectName);
				if (project.files.length > 0) {
					var tx2 = window.projectManager.db.transaction(["projects"], "readwrite");
					var store2 = tx2.objectStore("projects");
					var getReq = store2.get(project.id);
					await new Promise(function(res, rej) {
						getReq.onsuccess = function(e) {
							var rec = e.target.result;
							if (rec) {
								rec.files[0].fileName = scriptName;
								rec.files[0].content = item.code || "";
								rec.isScript = true;
								store2.put(rec).onsuccess = function() { res(); };
							} else { res(); }
						};
						getReq.onerror = rej;
					});
				}
				migrated++;
			} catch(e) {
				console.warn("Migrate " + scriptName + " failed:", e.message);
			}
		}

		indexedDB.deleteDatabase("CodeStore");
		if (migrated > 0) {
			if (window.leftNavPanel) await window.leftNavPanel.loadProjectList();
		}
	} catch(e) {
		console.warn("CodeStore migration skipped:", e.message);
	}
}

/**
 * 显示新建项目对话框
 */
function showNewProjectDialog(editor) {
	eda.sys_Dialog.showInputDialog(
		"请输入项目名称", // beforeContent
		"项目名称至少2个字符", // afterContent
		"新建项目", // title
		"text", // type
		"", // value
		{ placeholder: "例如: MyProject", minlength: 2, maxlength: 50 }, // otherProperty
		async function(value) {
			// 用户点击确认后的回调
			// 用户点击取消时不执行任何操作
			if (typeof value !== "string") return;

			// 用户点击确定但输入为空或太短
			if (!value || value.length < 2) {
				eda.sys_Message.showToastMessage("项目名称至少2个字符", "warn", 2);
				return;
			}

			try {
				var project = await window.projectManager.createProject(value);
				window.fileTreeUI = new FileTreeUI("file-tree", editor);
				await window.fileTreeUI.render();

				if (window.projectCompleter) {
					window.projectCompleter.clear();
					window.projectCompleter.updateFiles();
				}

				if (window.leftNavPanel) {
					await window.leftNavPanel.loadProjectList();
					window.leftNavPanel.switchView("project-design");
				}

				if (project.files.length > 0) {
					var firstFile = project.files[0];
					editor.setValue(firstFile.content, -1);
					window.projectManager.currentFile = firstFile.fileName;
				}

				eda.sys_Message.showToastMessage("项目创建成功", "success", 2);
			} catch (error) {
				eda.sys_Message.showToastMessage("项目创建失败: " + error.message, "error", 3);
			}
		}
	);
}

/**
 * 显示新建脚本对话框
 */
function showNewScriptDialog(editor) {
	eda.sys_Dialog.showInputDialog(
		"请输入脚本名称", // beforeContent
		"脚本名称至少2个字符", // afterContent
		"新建脚本", // title
		"text", // type
		"", // value
		{ placeholder: "例如: my-script", minlength: 2, maxlength: 50 }, // otherProperty
		async function(value) {
			// 用户点击取消时不执行任何操作
			if (typeof value !== "string") return;

			// 用户点击确定但输入为空或太短
			if (!value || value.length < 2) {
				eda.sys_Message.showToastMessage("脚本名称至少2个字符", "warn", 2);
				return;
			}

		try {
			var name = value.trim();
			if (!name.endsWith(".js")) name += ".js";
			var projectName = name.replace(/.js$/, "");
			// 根据设置决定是否带文件名注释（默认开启）
			var withComment = true;
			try {
				var saved = eda.sys_Storage.getExtensionUserConfig("new_file_with_comment");
				if (saved !== null && saved !== undefined) {
					withComment = (saved === true || saved === "true");
				}
			} catch(e) {}
			var initialContent = withComment ? ("// " + name) : "";
			var project = await window.projectManager.createProject(projectName);
			if (project.files.length > 0) {
				var tx = window.projectManager.db.transaction(["projects"], "readwrite");
				var store = tx.objectStore("projects");
				var getReq = store.get(project.id);
				await new Promise(function(res, rej) {
					getReq.onsuccess = function(e) {
						var rec = e.target.result;
						if (rec) {
							rec.files[0].fileName = name;
						rec.isScript = true;
							rec.files[0].content = initialContent;
							var putReq = store.put(rec);
							putReq.onsuccess = function() { window.projectManager._savedContent = initialContent; window.projectManager.currentFile = name; if (typeof TabManager !== 'undefined') TabManager.open(project.id, name, name); editor.setValue(initialContent, -1); editor.session.setMode('ace/mode/javascript'); window.projectManager._dirty = false; if (window.fileTreeUI && window.fileTreeUI._registerDirtyListener) window.fileTreeUI._registerDirtyListener(); res(); };
							putReq.onerror = rej;
						} else { res(); }
					};
					getReq.onerror = rej;
				});
			}

			window.fileTreeUI = new FileTreeUI("file-tree", editor);
			await window.fileTreeUI.render();

			if (window.projectCompleter) {
				window.projectCompleter.clear();
				window.projectCompleter.updateFiles();
			}

			if (window.leftNavPanel) {
				await window.leftNavPanel.loadProjectList();
				window.leftNavPanel.switchView("all-projects");
			}

			eda.sys_Message.showToastMessage("脚本创建成功", "success", 2);
		} catch (error) {
			eda.sys_Message.showToastMessage("脚本创建失败: " + error.message, "error", 3);
		}
		}
		);
	}

/* ============================================
   设置模态框 — EDA 系统设置风格
   左侧菜单 + 右侧内容 + 底部按钮
   ============================================ */
/**
 * 从 CSS 变量读取实际渲染颜色，转换为 #rrggbb 格式
 */
function _readCSSColor(varName) {
	var val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
	if (!val) {
		val = document.documentElement.style.getPropertyValue(varName).trim();
	}
	if (!val || val === 'transparent' || val === 'none') return '#000';
	if (val.startsWith('#')) {
		if (val.length === 7) return val;
		if (val.length === 4) {
			return '#' + val[1] + val[1] + val[2] + val[2] + val[3] + val[3];
		}
		return val;
	}
	var m = val.match(/[\d.]+/g);
	if (m && m.length >= 3) {
		var r = parseInt(m[0]), g = parseInt(m[1]), b = parseInt(m[2]);
		if (m.length === 4) {
			var a = parseFloat(m[3]);
			if (a < 1) { r = Math.round(r * a + 255 * (1 - a)); g = Math.round(g * a + 255 * (1 - a)); b = Math.round(b * a + 255 * (1 - a)); }
		}
		return '#' + [r, g, b].map(function(x) {
			return Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0');
		}).join('');
	}
	return '#000';
}

function showSettingsModal(editor, light_theme, dark_theme) {
	if (document.getElementById('settings-modal-overlay')) return;

	const isDark = () => document.body.classList.contains('dark-theme');
	const C = () => ({
		bg: isDark() ? '#404040' : '#fff',
		border: isDark() ? '#222' : '#d9d9d9',
		text: isDark() ? '#e5e5e5' : '#333',
		itemBg: isDark() ? '#353535' : '#f5f5f5',
		hoverBg: isDark() ? '#6283a2' : '#e6f7ff',
		secondary: isDark() ? '#868686' : '#666',
	});

	let colors = C();
	let activeMenu = 'general';

	const overlay = document.createElement('div');
	overlay.id = 'settings-modal-overlay';
	overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:10000;display:flex;justify-content:center;align-items:center;';

	const modal = document.createElement('div');
	modal.id = 'settings-modal-content';
	modal.style.cssText = `background:var(--eext-bg-modal);border:1px solid var(--eext-border);border-radius:4px;width:880px;max-width:95%;height:560px;max-height:85vh;box-shadow:0 0 15px rgba(50,50,50,0.3);display:flex;flex-direction:column;color:var(--eext-text-primary);`;

	/* Header */
	const header = document.createElement('div');
	header.style.cssText = 'padding:8px 16px;border-bottom:1px solid var(--eext-border);display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:12px;flex-shrink:0;';
	header.innerHTML = `<span>设置</span><button id="settings-modal-close" style="background:transparent;border:none;color:var(--eext-text-primary);cursor:pointer;font-size:12px;padding:0 8px;border-radius:2px;">×</button>`;

	/* Body: left menu + right content */
	const bodyWrap = document.createElement('div');
	bodyWrap.style.cssText = 'display:flex;flex:1;overflow:hidden;min-height:0;';

	/* Left menu */
	const menuPane = document.createElement('div');
	menuPane.style.cssText = `width:140px;flex-shrink:0;border-right:1px solid var(--eext-border);padding:8px 0;display:flex;flex-direction:column;gap:0;background:var(--eext-bg-item);`;

	const menuItems = [
		{ id: 'general', label: '通用' },
		{ id: 'editor', label: '编辑器' },
		{ id: 'shortcuts', label: '快捷键' },
		{ id: 'plugins', label: '插件管理' },
		{ id: 'completer', label: '补全仓库' },
	];

	/* Right content */
	const contentPane = document.createElement('div');
	contentPane.style.cssText = 'flex:1;overflow-y:auto;overflow-x:hidden;padding:16px;';

	/* Footer */
	const footer = document.createElement('div');
	footer.style.cssText = 'padding:8px 16px;border-top:1px solid var(--eext-border);display:flex;justify-content:flex-end;gap:8px;flex-shrink:0;';
	const cancelBtn = document.createElement('button');
	cancelBtn.textContent = '取消';
	cancelBtn.className = 'eext-modal-btn';
	cancelBtn.onclick = () => overlay.remove();
	const confirmBtn = document.createElement('button');
	confirmBtn.textContent = '确认';
	confirmBtn.className = 'eext-modal-btn-primary';
		confirmBtn.onclick = async () => {
			var w = document.getElementById("ui-width-input"), h = document.getElementById("ui-height-input");
			var newW = null, newH = null;
			if (w && h) {
				var nw = w.value.trim() || String(window.innerWidth);
				var nh = h.value.trim() || String(window.innerHeight);
				if (parseInt(nw) >= 400 && parseInt(nh) >= 300) {
					newW = parseInt(nw, 10);
					newH = parseInt(nh, 10);
					await eda.sys_Storage.setExtensionUserConfig("UI_width", nw);
					await eda.sys_Storage.setExtensionUserConfig("UI_height", nh);
				}
			}
			overlay.remove();
			if (newW && newH) {
				await eda.sys_IFrame.closeIFrame("ScriptTool");
				await eda.sys_IFrame.openIFrame("iframe/main/index.html", newW, newH, "ScriptTool", {
					maximizeButton: true,
					minimizeButton: true,
				});
			}
		};
	footer.appendChild(cancelBtn);
	footer.appendChild(confirmBtn);

	/* === Render menu === */
	function renderMenu() {
		menuPane.innerHTML = '';
		menuItems.forEach(item => {
			const row = document.createElement('div');
			row.textContent = item.label;
			const active = activeMenu === item.id;
			row.style.cssText = `padding:6px 16px;cursor:pointer;font-size:12px;color:${active && !isDark() ? 'var(--eext-brand)' : 'var(--eext-text-primary)'};background:${active ? 'var(--eext-hover-bg)' : 'transparent'};border-right:${active ? '2px solid var(--eext-brand)' : '2px solid transparent'};transition:background 0.15s;`;
			row.onmouseenter = () => { if (!active) row.style.background = 'var(--eext-hover-bg)'; };
			row.onmouseleave = () => { if (!active) row.style.background = 'transparent'; };
			row.onclick = () => { activeMenu = item.id; renderMenu(); renderContent(); };
			menuPane.appendChild(row);
		});
	}

	/* === Render right content === */
	function renderContent() {
		contentPane.innerHTML = '';
		colors = C();

		if (activeMenu === 'general') {
			/* Theme cards */
			const sec = section('主题');
			ThemeEngine.listThemes().filter(t => t.preset).forEach(t => {
				const active = ThemeEngine.getCurrent() === t.id;
				const card = document.createElement('div');
				card.style.cssText = `display:flex;align-items:center;gap:8px;padding:6px 10px;margin-bottom:4px;background:${active ? 'var(--eext-hover-bg)' : 'var(--eext-bg-item)'};border:1px solid ${active ? 'var(--eext-brand)' : 'transparent'};border-radius:2px;cursor:pointer;font-size:12px;color:var(--eext-text-primary);`;
				const swatch = t.id === 'dark' ? '#404040' : t.id === 'dark-editor' ? '#272822' : t.id === 'system' ? 'linear-gradient(135deg,#f5f5f5 50%,#404040 50%)' : '#f5f5f5';
				card.innerHTML = `<div style="width:12px;height:12px;border-radius:2px;border:1px solid var(--eext-border);background:${swatch};"></div><span>${t.name}</span>${active ? '<span style="margin-left:auto;color:var(--eext-brand);">✔</span>' : ''}`;
				card.onclick = async () => {
					if (ThemeEngine.getCurrent() === t.id) return;
					ThemeEngine.apply(t.id);
					renderContent();
				};
				contentPane.appendChild(card);
			});

			/* Window size */
			const sec2 = section('窗口尺寸');
			const row = document.createElement('div');
			row.style.cssText = 'display:flex;align-items:center;gap:8px;';
			const makeInput = (label, id, ph) => {
				const span = document.createElement('span'); span.textContent = label; span.style.cssText = 'font-size:12px;color:var(--eext-text-primary);';
				const inp = document.createElement('input'); inp.type = 'number'; inp.id = id; inp.placeholder = ph;
				inp.style.cssText = 'width:90px;height:24px;padding:0 6px;border:1px solid var(--eext-border);border-radius:2px;font-size:12px;color:var(--eext-text-primary);background:var(--eext-bg-input);';
				return { span, inp };
			};
			const w = makeInput('宽', 'ui-width-input', String(window.innerWidth));
			const h = makeInput('高', 'ui-height-input', String(window.innerHeight));
		(async function() { try { var sw = await eda.sys_Storage.getExtensionUserConfig("UI_width"); if (sw) w.inp.value = sw; var sh = await eda.sys_Storage.getExtensionUserConfig("UI_height"); if (sh) h.inp.value = sh; } catch(e) {} })();
			row.appendChild(w.span); row.appendChild(w.inp);
			row.appendChild(h.span); row.appendChild(h.inp);
			contentPane.appendChild(row);

			/* Color customization */
			const sec3 = section('图元颜色');
			const keys = ['bg-toolbar','bg-panel','bg-input','editor-bg','editor-line-bg','text-primary','border'];
			const labels = {'bg-toolbar':'顶部菜单','bg-panel':'左侧面板背景','bg-input':'输入框','editor-bg':'编辑器背景','editor-line-bg':'编辑器选中行','text-primary':'左侧面板文字','border':'边框'};
			keys.forEach(k => {
				const cr = document.createElement('div');
				cr.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:4px;';
				var domVal = _readCSSColor('--eext-'+k);
				const sw = document.createElement('input'); sw.type = 'color'; sw.value = domVal || '#000';
				sw.style.cssText = 'width:24px;height:24px;border:1px solid var(--eext-border);border-radius:2px;padding:0;cursor:pointer;';
				sw.setAttribute('data-key', k);
				const hi = document.createElement('input'); hi.type = 'text'; hi.value = domVal || '';
				hi.style.cssText = 'width:78px;height:24px;padding:0 4px;border:1px solid var(--eext-border);border-radius:2px;font-size:11px;font-family:monospace;color:var(--eext-text-primary);background:var(--eext-bg-input);';
				hi.setAttribute('data-key', k);
				const apply = (v) => { document.documentElement.style.setProperty('--eext-'+k, v); _pt(); };
				hi.oninput = () => { sw.value = hi.value; apply(hi.value); };
				sw.oninput = () => { hi.value = sw.value; apply(sw.value); };
				const lb = document.createElement('span'); lb.textContent = labels[k];
				lb.style.cssText = 'font-size:12px;color:var(--eext-text-secondary);flex:1;';
				cr.appendChild(sw); cr.appendChild(hi); cr.appendChild(lb);
				contentPane.appendChild(cr);
			});
		} else if (activeMenu === 'editor') {
			const sec = section('补全模式');

			// 带注释补全
			const row = document.createElement('div');
			row.style.cssText = 'display:flex;align-items:center;gap:12px;';
			const cb = document.createElement('input'); cb.type = 'checkbox'; cb.id = 'completion-checkbox';
			// 标准复选框样式
			cb.style.cssText = 'width:16px;height:16px;cursor:pointer;accent-color:var(--eext-brand);';
			cb.onchange = () => {
				eda.sys_Storage.setExtensionUserConfig('completion_with_comment', cb.checked);
			};
			try {
				const saved = eda.sys_Storage.getExtensionUserConfig('completion_with_comment');
				cb.checked = (saved === true || saved === 'true');
			} catch(e) { cb.checked = false; }
			const label = document.createElement('span'); label.textContent = '带注释补全';
			label.style.cssText = 'font-size:12px;color:var(--eext-text-primary);user-select:none;cursor:pointer;';
			label.onclick = () => { cb.checked = !cb.checked; cb.onchange(); };
			row.appendChild(cb); row.appendChild(label);
			contentPane.appendChild(row);

			// 随机分配变量
			var row2 = document.createElement("div");
			row2.style.cssText = "display:flex;align-items:center;gap:12px;margin-top:8px;";
			var label2 = document.createElement("span"); label2.textContent = "随机分配变量";
			label2.style.cssText = "font-size:12px;color:var(--eext-text-primary);user-select:none;cursor:pointer;";
			label2.onclick = function() { cb2.checked = !cb2.checked; cb2.onchange(); };
			var cb2 = document.createElement("input"); cb2.type = 'checkbox';
			// 标准复选框样式
			cb2.style.cssText = 'width:16px;height:16px;cursor:pointer;accent-color:var(--eext-brand);';
			cb2.onchange = function() {
				eda.sys_Storage.setExtensionUserConfig("completion_random_var", cb2.checked);
			};
			try {
				const saved = eda.sys_Storage.getExtensionUserConfig("completion_random_var");
				cb2.checked = (saved === true || saved === "true");
			} catch(e) { cb2.checked = false; }
			row2.appendChild(cb2); row2.appendChild(label2);
			contentPane.appendChild(row2);

			// 异步函数标识补全
			var rowAwait = document.createElement("div");
			rowAwait.style.cssText = "display:flex;align-items:center;gap:12px;margin-top:8px;";
			var labelAwait = document.createElement("span"); labelAwait.textContent = "异步函数标识补全";
			labelAwait.style.cssText = "font-size:12px;color:var(--eext-text-primary);user-select:none;cursor:pointer;";
			labelAwait.onclick = function() { cbAwait.checked = !cbAwait.checked; cbAwait.onchange(); };
			var cbAwait = document.createElement("input"); cbAwait.type = 'checkbox';
			cbAwait.style.cssText = 'width:16px;height:16px;cursor:pointer;accent-color:var(--eext-brand);';
			cbAwait.onchange = function() {
				eda.sys_Storage.setExtensionUserConfig("completion_auto_await", cbAwait.checked);
			};
			try {
				const saved = eda.sys_Storage.getExtensionUserConfig("completion_auto_await");
				cbAwait.checked = (saved === true || saved === "true");
			} catch(e) { cbAwait.checked = false; }
			rowAwait.appendChild(cbAwait); rowAwait.appendChild(labelAwait);
			contentPane.appendChild(rowAwait);

			// 新建文件带文件名注释
			var row3 = document.createElement("div");
			row3.style.cssText = "display:flex;align-items:center;gap:12px;margin-top:8px;";
			var label3 = document.createElement("span"); label3.textContent = "新建文件带文件名注释";
			label3.style.cssText = "font-size:12px;color:var(--eext-text-primary);user-select:none;cursor:pointer;";
			label3.onclick = function() { cb3.checked = !cb3.checked; cb3.onchange(); };
			var cb3 = document.createElement("input"); cb3.type = 'checkbox';
			cb3.style.cssText = 'width:16px;height:16px;cursor:pointer;accent-color:var(--eext-brand);';
			cb3.onchange = function() {
				eda.sys_Storage.setExtensionUserConfig("new_file_with_comment", cb3.checked);
			};
			try {
				const saved = eda.sys_Storage.getExtensionUserConfig("new_file_with_comment");
				// 默认开启（保持原有行为）
				cb3.checked = (saved === null || saved === undefined) ? true : (saved === true || saved === "true");
			} catch(e) { cb3.checked = true; }
			row3.appendChild(cb3); row3.appendChild(label3);
			contentPane.appendChild(row3);

			// ── 补全预览 ──
			var previewWrap = document.createElement('div');
			previewWrap.style.cssText = 'margin-top:14px;padding:10px 12px;border:1px solid var(--eext-border);border-radius:4px;background:var(--eext-bg-input);';
			var previewTitle = document.createElement('div');
			previewTitle.textContent = '预览';
			previewTitle.style.cssText = 'font-size:11px;color:var(--eext-text-secondary);margin-bottom:6px;';
			previewWrap.appendChild(previewTitle);
			var previewCode = document.createElement('pre');
			previewCode.style.cssText = 'margin:0;padding:0;font-family:Consolas,Monaco,"Courier New",monospace;font-size:12px;line-height:1.6;white-space:pre-wrap;word-break:break-all;color:var(--eext-text-primary);';
			previewWrap.appendChild(previewCode);
			contentPane.appendChild(previewWrap);

			var PREVIEW_DESC = '搜索器件';
			var PREVIEW_PARAMS = 'key, libraryUuid, classification, symbolType, itemsOfPage, page';
			var PREVIEW_CALL = 'eda.lib_Device.search(' + PREVIEW_PARAMS + ')';
			var PREVIEW_FILENAME = 'myScript.js';

			function escapeHtml(s) {
				return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
			}

			function renderCompletionPreview() {
				var isDark = document.body.classList.contains('dark-theme');
				var colKeyword = isDark ? '#c586c0' : '#9333ea';
				var colComment = isDark ? '#6a9955' : '#16a34a';
				var colFn = isDark ? '#dcdcaa' : '#b45309';
				var colText = isDark ? '#e5e5e5' : '#333';

				// 闪烁背景色（半透明，主题适配）
				var flashFilename = isDark ? 'rgba(103,150,234,0.35)' : 'rgba(24,144,255,0.18)';
				var flashComment = isDark ? 'rgba(106,153,85,0.35)' : 'rgba(22,163,74,0.22)';
				var flashVar = isDark ? 'rgba(197,134,192,0.35)' : 'rgba(147,51,234,0.18)';
				var flashAwait = isDark ? 'rgba(220,220,170,0.40)' : 'rgba(180,83,9,0.22)';

				var state = {
					withFilenameComment: cb3.checked,
					withComment: cb.checked,
					withVar: cb2.checked,
					withAwait: cbAwait.checked,
				};
				var newFilename = state.withFilenameComment && !previewPrevState.withFilenameComment;
				var newComment = state.withComment && !previewPrevState.withComment;
				var newVar = state.withVar && !previewPrevState.withVar;
				var newAwait = state.withAwait && !previewPrevState.withAwait;

				function wrapFlash(innerHtml, color, shouldFlash) {
					if (!shouldFlash) return innerHtml;
					return '<span data-flash="1" style="background-color:' + color + ';border-radius:2px;transition:background-color 1.2s ease-out;padding:1px 0;box-shadow:0 0 0 2px ' + color + ';">' + innerHtml + '</span>';
				}

				var html = '';
				if (state.withFilenameComment) {
					var filenameInner = '<span style="color:' + colComment + '">// ' + escapeHtml(PREVIEW_FILENAME) + '</span>';
					html += wrapFlash(filenameInner, flashFilename, newFilename) + '\n';
					}
				if (state.withComment) {
					var commentInner = '<span style="color:' + colComment + '">// ' + escapeHtml(PREVIEW_DESC) + '</span>';
					html += wrapFlash(commentInner, flashComment, newComment) + '\n';
				}
				var constPart = '';
				var awaitPart = '';
				if (state.withVar) {
					constPart = '<span style="color:' + colKeyword + '">const</span> <span style="color:' + colText + '">a</span> = ';
				}
				if (state.withAwait) {
					awaitPart = '<span style="color:' + colKeyword + '">await</span> ';
				}
				html += wrapFlash(constPart, flashVar, newVar);
				html += wrapFlash(awaitPart, flashAwait, newAwait);
				html += '<span style="color:' + colText + '">eda.lib_Device.<span style="color:' + colFn + '">search</span>(' + escapeHtml(PREVIEW_PARAMS) + ')</span>';

				previewCode.innerHTML = html;
				previewPrevState = state;

				// 双 rAF 后清空背景色，触发 transition 渐变到透明
				requestAnimationFrame(function() {
					requestAnimationFrame(function() {
						var flashes = previewCode.querySelectorAll('[data-flash]');
						for (var i = 0; i < flashes.length; i++) {
							flashes[i].style.backgroundColor = 'transparent';
							flashes[i].style.boxShadow = 'none';
						}
					});
				});
			}
			var previewPrevState = { withFilenameComment: cb3.checked, withComment: cb.checked, withVar: cb2.checked, withAwait: cbAwait.checked };

			[cb, cb2, cbAwait, cb3].forEach(function(box) {
				var orig = box.onchange;
				box.onchange = function() {
					if (typeof orig === 'function') { try { orig.call(this); } catch(e){} }
					renderCompletionPreview();
				};
			});
			renderCompletionPreview();
		} else if (activeMenu === 'shortcuts') {
			section('快捷键');
			var platform = typeof getPlatform === 'function' ? getPlatform() : 'windows';

			var tableWrapper = document.createElement('div');
			tableWrapper.className = 'shortcuts-table-wrapper';
			contentPane.appendChild(tableWrapper);

			var table = document.createElement('table');
			table.className = 'shortcuts-table';
			var tbody = document.createElement('tbody');
			table.appendChild(tbody);
			tableWrapper.appendChild(table);

			var shortcutsData = null;

			async function renderShortcuts() {
				tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:var(--eext-text-secondary);font-size:12px;padding:24px;">加载中...</td></tr>';
				try {
					shortcutsData = typeof loadShortcuts === 'function' ? await loadShortcuts() : null;
					if (!shortcutsData) {
						tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:var(--eext-text-secondary);font-size:12px;padding:24px;">无法加载快捷键配置</td></tr>';
						return;
					}
					tbody.innerHTML = '';
					Object.entries(shortcutsData).forEach(function(entry) {
						var key = entry[0];
						var cfg = entry[1];
						var currentShortcut = cfg[platform] || '';

						var tr = document.createElement('tr');
						tr.setAttribute('data-key', key);

						var tdDesc = document.createElement('td');
						tdDesc.textContent = cfg.description;

						var tdKey = document.createElement('td');
						tdKey.textContent = currentShortcut;

						tr.appendChild(tdDesc);
						tr.appendChild(tdKey);

						tr.addEventListener('click', function() {
							_showShortcutEditDialog(cfg.description, currentShortcut, platform, function(newShortcut) {
								shortcutsData[key][platform] = newShortcut;
								renderShortcuts();
							});
						});

						tbody.appendChild(tr);
					});
				} catch(e) {
					tbody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:var(--eext-error);font-size:12px;padding:24px;">加载失败: ' + e.message + '</td></tr>';
				}
			}
			renderShortcuts();

			var btnRow = document.createElement('div');
			btnRow.style.cssText = 'display:flex;gap:8px;margin-top:12px;';

			var resetBtn = document.createElement('button');
			resetBtn.textContent = '恢复默认';
			resetBtn.className = 'eext-modal-btn';
			resetBtn.onclick = async function() {
				var result = await Swal.fire({
					title: '确认恢复默认',
					html: '确定要恢复默认快捷键设置吗？当前的自定义设置将会丢失。',
					icon: 'warning',
					showCancelButton: true,
					confirmButtonText: '确认',
					cancelButtonText: '取消',
				});
				if (!result.isConfirmed) return;
				if (typeof resetShortcuts === 'function') {
					shortcutsData = await resetShortcuts();
				} else {
					shortcutsData = null;
				}
				await renderShortcuts();
				var eda = window.eda || (typeof eda !== 'undefined' ? eda : null);
				if (eda && eda.sys_Message) eda.sys_Message.showToastMessage('已恢复默认快捷键', 'success', 1);
			};
			btnRow.appendChild(resetBtn);

			var saveBtn = document.createElement('button');
			saveBtn.textContent = '保存';
			saveBtn.className = 'eext-modal-btn-primary';
			saveBtn.onclick = async function() {
				if (typeof saveShortcuts === 'function') {
					var success = await saveShortcuts(shortcutsData);
					var eda = window.eda || (typeof eda !== 'undefined' ? eda : null);
					if (success) {
						if (eda && eda.sys_Message) eda.sys_Message.showToastMessage('快捷键设置已保存，请重新打开窗口以应用更改', 'success', 3);
					} else {
						if (eda && eda.sys_Message) eda.sys_Message.showToastMessage('保存失败', 'error', 2);
					}
				}
			};
			btnRow.appendChild(saveBtn);

			contentPane.appendChild(btnRow);
		} else if (activeMenu === 'plugins') {
			section('插件管理');
			var list = document.createElement('div');
			list.style.cssText = 'display:flex;flex-direction:column;gap:4px;';
			contentPane.appendChild(list);

			async function loadPluginList() {
				list.innerHTML = '<div style="font-size:12px;color:var(--eext-text-secondary);text-align:center;padding:12px;">加载中...</div>';
				try {
					var plugins = typeof ExtStore_GetExtList === 'function' ? await ExtStore_GetExtList() : [];
					if (!plugins || plugins.length === 0) {
						list.innerHTML = '<div style="font-size:12px;color:var(--eext-text-secondary);text-align:center;padding:12px;">暂无已保存的插件</div>';
					} else {
						list.innerHTML = '';
						plugins.forEach(function(p) {
							var item = document.createElement('div');
							item.style.cssText = 'display:flex;flex-direction:column;gap:4px;padding:6px 0;border-bottom:1px solid var(--eext-border);';

							// Row 1: plugin name only
							var row1 = document.createElement('div');
							row1.style.cssText = 'display:flex;align-items:center;';

							// Plugin name
							var nameSpan = document.createElement('span');
							nameSpan.textContent = p.name || '未命名';
							nameSpan.title = p.name;
							nameSpan.style.cssText = 'flex:1;font-size:12px;color:var(--eext-text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
							row1.appendChild(nameSpan);


							item.appendChild(row1);

							// Row 2: startup timing radio + priority + enable checkbox
							var row2 = document.createElement('div');
							row2.style.cssText = 'display:flex;align-items:center;gap:16px;padding-left:0;font-size:12px;color:var(--eext-text-primary);';

							// Enable checkbox (same style as AI settings)
							var checkboxLabel = document.createElement('label');
							checkboxLabel.style.cssText = 'display:flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;color:var(--eext-text-primary);';
							var cb = document.createElement('input');
							cb.type = 'checkbox';
							cb.checked = p.enabled !== false;
							cb.style.cssText = 'position:absolute;opacity:0;pointer-events:none;';
							checkboxLabel.appendChild(cb);

							// Create custom checkbox element
							var customCheckbox = document.createElement('span');
							customCheckbox.style.cssText = 'width:14px;height:14px;border:1px solid #d9d9d9;border-radius:2px;background:#fff;flex-shrink:0;position:relative;transition:all 0.2s;';
							// Add checkmark
							var checkmark = document.createElement('span');
							checkmark.style.cssText = 'position:absolute;left:4px;top:1px;width:4px;height:8px;border:solid #fff;border-width:0 2px 2px 0;transform:rotate(45deg);opacity:0;transition:opacity 0.2s;';
							customCheckbox.appendChild(checkmark);

							if (cb.checked) {
								customCheckbox.style.background = '#1890ff';
								customCheckbox.style.borderColor = '#1890ff';
								checkmark.style.opacity = '1';
							}
							checkboxLabel.appendChild(customCheckbox);

							checkboxLabel.onchange = async function() {
								var newState = cb.checked;
								if (newState) {
									customCheckbox.style.background = '#1890ff';
									customCheckbox.style.borderColor = '#1890ff';
									checkmark.style.opacity = '1';
								} else {
									customCheckbox.style.background = '#fff';
									customCheckbox.style.borderColor = '#d9d9d9';
									checkmark.style.opacity = '0';
								}
								try {
									await ExtStore_TogglePlugin(p.name, newState);
									eda.sys_Message.showToastMessage('插件 "' + p.name + '" 已' + (newState ? '启用' : '禁用'), 'success', 1);
								} catch(err) {
									cb.checked = !newState;
									customCheckbox.style.background = cb.checked ? '#1890ff' : '#fff';
									customCheckbox.style.borderColor = cb.checked ? '#1890ff' : '#d9d9d9';
									checkmark.style.opacity = cb.checked ? '1' : '0';
									eda.sys_Message.showToastMessage('操作失败: ' + err.message, 'error', 2);
								}
							};
							var checkboxText = document.createElement('span');
							checkboxText.textContent = '启用';
							checkboxText.style.cssText = 'font-size:12px;color:var(--eext-text-primary);';
							checkboxLabel.appendChild(checkboxText);
							row2.appendChild(checkboxLabel);
							var timingLabel = document.createElement('span');
							timingLabel.textContent = '启动时机:';
							timingLabel.style.cssText = 'font-size:12px;color:var(--eext-text-secondary);';
							row2.appendChild(timingLabel);

							var currentTiming = p.startupTiming || 'onPluginOpen';
							var currentPriority = p.priority || 0;

							var radioPlugin = document.createElement('label');
							radioPlugin.style.cssText = 'display:inline-flex;align-items:center;gap:3px;cursor:pointer;font-size:12px;color:var(--eext-text-primary);';
							var rp = document.createElement('input');
							rp.type = 'radio';
							rp.name = 'timing_' + p.name;
							rp.value = 'onPluginOpen';
							rp.checked = currentTiming === 'onPluginOpen';
							rp.style.cssText = 'margin:0;';
							radioPlugin.appendChild(rp);
							radioPlugin.appendChild(document.createTextNode('打开窗口'));
							row2.appendChild(radioPlugin);

							var radioEda = document.createElement('label');
							radioEda.style.cssText = 'display:inline-flex;align-items:center;gap:3px;cursor:pointer;font-size:12px;color:var(--eext-text-primary);';
							var re = document.createElement('input');
							re.type = 'radio';
							re.name = 'timing_' + p.name;
							re.value = 'onEdaStartup';
							re.checked = currentTiming === 'onEdaStartup';
							re.style.cssText = 'margin:0;';
							radioEda.appendChild(re);
							radioEda.appendChild(document.createTextNode('打开EDA'));
							row2.appendChild(radioEda);


						// Buttons: rename, load, delete
							// Rename button
							var renameBtn = document.createElement('button');
							renameBtn.textContent = '重命名';
							renameBtn.className = 'eext-modal-btn';
							renameBtn.onclick = async function() {
								eda.sys_Dialog.showInputDialog(
									'请输入新名称',
									'插件名称',
									'重命名插件',
									'text',
									p.name,
									{ minlength: 1, maxlength: 50 },
									async function(value) {
										if (typeof value !== 'string') return;
										if (!value || !value.trim()) {
											eda.sys_Message.showToastMessage('请输入名称', 'warn', 2);
											return;
										}
										if (value.trim() === p.name) {
											eda.sys_Message.showToastMessage('名称未改变', 'warn', 2);
											return;
										}
										try {
											await ExtStore_RenameExt(p.name, value.trim());
											await loadPluginList();
											eda.sys_Message.showToastMessage('重命名成功', 'success', 1);
										} catch(err) {
											eda.sys_Message.showToastMessage('重命名失败: ' + err.message, 'error', 2);
										}
									}
								);
							};
							row2.appendChild(renameBtn);

							// Load button
							var loadBtn = document.createElement('button');
							loadBtn.textContent = '加载';
							loadBtn.className = 'eext-modal-btn-primary';
							loadBtn.onclick = async function() {
								try {
									var db = await ExtStore_Init();
									var tx = db.transaction(['ExtStore'], 'readonly');
									var store = tx.objectStore('ExtStore');
									var req = store.index('name').get(p.name);
									req.onsuccess = function() {
										if (req.result && req.result.code) {
											editor.setValue(req.result.code, -1);
											editor.clearSelection();
											eda.sys_Message.showToastMessage('已加载：' + p.name, 'success', 1);
										}
									};
								} catch(err) {
									eda.sys_Message.showToastMessage('加载失败: ' + err.message, 'error', 2);
								}
							};
							row2.appendChild(loadBtn);

							// Delete button
							var delBtn = document.createElement('button');
							delBtn.textContent = '删除';
							delBtn.className = 'eext-modal-btn-delete';
							delBtn.onclick = async function() {
								eda.sys_Dialog.showConfirmationMessage(
									'确定删除插件 "' + p.name + '"？',
									'确认删除',
									'删除',
									'取消',
									async function(confirmed) {
										if (!confirmed) return;
										try {
											await ExtStore_DeleteExt(p.name);
											await loadPluginList();
											eda.sys_Message.showToastMessage('插件 "' + p.name + '" 已删除', 'info', 1);
										} catch(err) {
											eda.sys_Message.showToastMessage('删除失败: ' + err.message, 'error', 2);
										}
									}
								);
							};
							row2.appendChild(delBtn);


								// Apply timing change
								var applyTiming = async function(newTiming) {
									if (typeof ExtStore_UpdateStartupConfig === 'function') {
										try {
											await ExtStore_UpdateStartupConfig(p.name, newTiming);
										} catch(e) {
											eda.sys_Message.showToastMessage('保存启动配置失败: ' + e.message, 'error', 2);
										}
									}
								};

								rp.onchange = function() { if (rp.checked) { applyTiming('onPluginOpen'); } };
								re.onchange = function() { if (re.checked) { applyTiming('onEdaStartup'); } };

								item.appendChild(row2);

							list.appendChild(item);
						});
					}
				} catch(err) {
					list.innerHTML = '<div style="font-size:12px;color:var(--eext-error);text-align:center;padding:12px;">加载失败：' + err.message + '</div>';
				}
			}

			loadPluginList();
		} else if (activeMenu === 'completer') {
			section('补全仓库');
			const toolbar = document.createElement('div');
			toolbar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;';
			const hint = document.createElement('div');
			hint.style.cssText = 'font-size:11px;color:var(--eext-text-secondary);';
			hint.textContent = '提示：双击补全项可编辑';
			toolbar.appendChild(hint);
			const addBtn = document.createElement('button');
			addBtn.textContent = '新增补全项';
			addBtn.style.cssText = 'padding:5px 14px;font-size:11px;border:1px solid var(--eext-brand);border-radius:4px;background:var(--eext-brand);color:#fff;cursor:pointer;white-space:nowrap;transition:opacity 0.15s;';
			addBtn.onmouseenter = function() { addBtn.style.opacity = '0.85'; };
			addBtn.onmouseleave = function() { addBtn.style.opacity = '1'; };
			addBtn.onclick = function() { _showCompleterEditDialog(null, editor, loadCompleters); };
			toolbar.appendChild(addBtn);
			contentPane.appendChild(toolbar);
			const listWrap = document.createElement('div');
			listWrap.style.cssText = 'max-height:420px;overflow-x:hidden;overflow-y:auto;border:1px solid var(--eext-border);border-radius:4px;background:var(--eext-bg-modal);';
			const table = document.createElement('table');
			table.style.cssText = 'width:100%;table-layout:fixed;border-collapse:collapse;font-size:12px;';
			const thead = document.createElement('thead');
			thead.style.cssText = 'background:var(--eext-bg-item);';
			thead.innerHTML = '<tr>' +
				'<th style=\'padding:8px 12px;text-align:left;font-weight:600;color:var(--eext-text-secondary);border-bottom:1px solid var(--eext-border);width:20%;\'>名称</th>' +
				'<th style=\'padding:8px 12px;text-align:left;font-weight:600;color:var(--eext-text-secondary);border-bottom:1px solid var(--eext-border);width:28%;\'>描述</th>' +
				'<th style=\'padding:8px 12px;text-align:left;font-weight:600;color:var(--eext-text-secondary);border-bottom:1px solid var(--eext-border);width:34%;\'>补全值</th>' +
				'<th style=\'padding:8px 12px;text-align:right;font-weight:600;color:var(--eext-text-secondary);border-bottom:1px solid var(--eext-border);width:18%;\'>操作</th>' +
				'</tr>';
			table.appendChild(thead);
			const tbody = document.createElement('tbody');
			table.appendChild(tbody);
			listWrap.appendChild(table);
			contentPane.appendChild(listWrap);
			async function loadCompleters() {
				tbody.innerHTML = '<tr><td colspan=\'4\' style=\'padding:24px;text-align:center;color:var(--eext-text-secondary);font-size:12px;\'>加载中...</td></tr>';
				try {
					const items = await new Promise(function(r) { try { var x = indexedDB.open('UserCompleterStore', 1); x.onsuccess = function() { var t = x.result.transaction('completions','readonly'); var g = t.objectStore('completions').getAll(); g.onsuccess = function() { r(g.result || []); }; g.onerror = function() { r([]); }; }; x.onerror = function() { r([]); }; } catch(e) { r([]); } });
					if (!items || items.length === 0) {
						tbody.innerHTML = '<tr><td colspan=\'4\' style=\'padding:24px;text-align:center;color:var(--eext-text-secondary);font-size:12px;\'>暂无自定义补全项。</td></tr>';
						return;
					}
					tbody.innerHTML = '';
					items.forEach(function(c, idx) { tbody.appendChild(_buildCompleterRow(c, editor, loadCompleters, idx)); });
				} catch(e) {
					tbody.innerHTML = '<tr><td colspan=\'4\' style=\'padding:24px;text-align:center;color:var(--eext-error);font-size:12px;\'>加载失败: ' + e.message + '</td></tr>';
				}
			}
			loadCompleters();
		}
	}

	function section(title) {
		const div = document.createElement('div');
		div.style.cssText = 'font-size:12px;font-weight:600;color:var(--eext-text-primary);margin-bottom:8px;margin-top:12px;';
		div.textContent = title;
		if (contentPane.children.length === 0) div.style.marginTop = '0';
		contentPane.appendChild(div);
		return div;
	}

	/* Persist timer for color changes */
	let _ptimer = null;
	function _pt() {
		clearTimeout(_ptimer);
		_ptimer = setTimeout(() => {
			const nv = {};
			contentPane.querySelectorAll('input[type=color]').forEach(el => nv[el.getAttribute('data-key')] = el.value);
			if (Object.keys(nv).length === 0) return;
			const cur = ThemeEngine.getCurrent();
			const nm = cur === 'dark' ? '自定义暗色' : cur === 'light' ? '自定义亮色' : '自定义';
var cv = ThemeEngine.getCurrentVars(); ThemeEngine.saveCustom(nm, {...cv, ...nv}, nm).then(function(n) { if (n) ThemeEngine.apply(n); });
		}, 500);
	}

	/* Assemble */
	modal.appendChild(header);
	modal.appendChild(bodyWrap);
	modal.appendChild(footer);
	bodyWrap.appendChild(menuPane);
	bodyWrap.appendChild(contentPane);
	overlay.appendChild(modal);
	document.body.appendChild(overlay);

	/* Escape to close (skipped if a child dialog is open) */
	document.addEventListener('keydown', function escH(e) {
		if (e.key !== 'Escape') return;
		if (document.getElementById('eext-cs-edit-overlay')) return;
		overlay.remove();
		document.removeEventListener('keydown', escH);
	});

	/* Close button */
	header.querySelector('#settings-modal-close').onclick = () => overlay.remove();

	/* Initial render */
	renderMenu();
	renderContent();
}

/**
 * 快捷键编辑弹窗
 * @param {string} name - 功能名称
 * @param {string} currentShortcut - 当前快捷键
 * @param {string} platform - 平台标识 'win' | 'mac'
 * @param {Function} onSave - 保存回调，接收新的快捷键字符串
 */
function _showShortcutEditDialog(name, currentShortcut, platform, onSave) {
	var oldOverlay = document.getElementById('shortcut-edit-overlay');
	if (oldOverlay) oldOverlay.remove();

	window.keyboardShortcutsModalOpen = true;

	var overlay = document.createElement('div');
	overlay.id = 'shortcut-edit-overlay';
	overlay.className = 'shortcut-edit-overlay';

	var modal = document.createElement('div');
	modal.className = 'shortcut-edit-modal';

	var header = document.createElement('div');
	header.className = 'shortcut-edit-header';
	var title = document.createElement('span');
	title.className = 'shortcut-edit-title';
	title.textContent = '设置';
	header.appendChild(title);
	var closeBtn = document.createElement('button');
	closeBtn.className = 'shortcut-edit-close';
	closeBtn.innerHTML = '&times;';
	closeBtn.onclick = closeDialog;
	header.appendChild(closeBtn);
	modal.appendChild(header);

	var body = document.createElement('div');
	body.className = 'shortcut-edit-body';

	function buildField(labelText, inputId, value, isReadonly) {
		var field = document.createElement('div');
		field.className = 'shortcut-edit-field';
		var label = document.createElement('label');
		label.className = 'shortcut-edit-label';
		label.textContent = labelText + ':';
		label.setAttribute('for', inputId);
		field.appendChild(label);
		var input = document.createElement('input');
		input.type = 'text';
		input.className = 'shortcut-edit-input';
		input.id = inputId;
		input.value = value || '';
		if (isReadonly) {
			input.readOnly = true;
		}
		field.appendChild(input);
		body.appendChild(field);
		return input;
	}

	var nameInput = buildField('功能', 'shortcut-edit-name', name, true);
	var keyInput = buildField('快捷键', 'shortcut-edit-key', currentShortcut, false);

	keyInput.classList.add('shortcut-key-input');
	keyInput.placeholder = '点击此处后按下组合键';
	keyInput.style.fontFamily = 'Consolas, Monaco, "Courier New", monospace';
	keyInput.style.textAlign = 'center';

	keyInput.addEventListener('focus', function() {
		keyInput.style.borderColor = 'var(--eext-brand)';
		keyInput.placeholder = '按下组合键...';
	});
	keyInput.addEventListener('blur', function() {
		keyInput.style.borderColor = 'var(--eext-border)';
		keyInput.placeholder = '点击此处后按下组合键';
	});
	keyInput.addEventListener('keydown', function(e) {
		e.preventDefault();
		e.stopPropagation();
		var keys = [];
		if (e.ctrlKey) keys.push('Ctrl');
		if (e.shiftKey) keys.push('Shift');
		if (e.altKey) keys.push('Alt');
		if (e.metaKey) keys.push(platform === 'mac' ? 'Command' : 'Meta');
		var keyName = e.key;
		if (keyName && !['Control', 'Shift', 'Alt', 'Meta'].includes(keyName)) {
			if (keyName === ' ') keyName = 'Space';
			else if (keyName.length === 1) keyName = keyName.toUpperCase();
			keys.push(keyName);
		}
		if (keys.length > 0 && keys[keys.length - 1] !== 'Control' && keys[keys.length - 1] !== 'Shift' && keys[keys.length - 1] !== 'Alt' && keys[keys.length - 1] !== 'Meta' && keys[keys.length - 1] !== 'Command') {
			keyInput.value = keys.join('+');
		}
	});

	modal.appendChild(body);

	var footer = document.createElement('div');
	footer.className = 'shortcut-edit-footer';

	var confirmBtn = document.createElement('button');
	confirmBtn.textContent = '确认';
	confirmBtn.className = 'eext-modal-btn-primary';
	confirmBtn.onclick = function() {
		var newShortcut = keyInput.value.trim();
		if (onSave) onSave(newShortcut);
		closeDialog();
	};

	var cancelBtn = document.createElement('button');
	cancelBtn.textContent = '取消';
	cancelBtn.className = 'eext-modal-btn';
	cancelBtn.onclick = closeDialog;

	footer.appendChild(confirmBtn);
	footer.appendChild(cancelBtn);
	modal.appendChild(footer);

	overlay.appendChild(modal);
	document.body.appendChild(overlay);

	setTimeout(function() { keyInput.focus(); }, 100);

	function closeDialog() {
		window.keyboardShortcutsModalOpen = false;
		document.removeEventListener('keydown', escHandler, true);
		if (overlay.parentNode) overlay.remove();
	}

	overlay.addEventListener('click', function(e) {
		if (e.target === overlay) closeDialog();
	});

	function escHandler(e) {
		if (e.key === 'Escape') {
			e.preventDefault();
			e.stopImmediatePropagation();
			closeDialog();
		}
	}
	document.addEventListener('keydown', escHandler, true);
}

/* ============================================
   补全仓库 - 表格渲染与编辑
   ============================================ */

/**
 * 构建单个补全项的表格行 DOM
 * @param {Object} rec - 补全记录 {id, caption, value, params, description}
 * @param {Object} editor - ACE 编辑器实例
 * @param {Function} reloadFn - 重新加载列表的回调
 * @param {number} rowIndex - 当前行的索引（用于斑马纹）
 */
function _buildCompleterRow(rec, editor, reloadFn, rowIndex) {
	const tr = document.createElement("tr");
	const stripe = (rowIndex % 2 === 1) ? "rgba(125,125,125,0.06)" : "transparent";
	tr.style.cssText = "background:" + stripe + ";transition:background 0.15s;cursor:pointer;";

	/* 仅当内容被截断时才显示 title 提示 */
	function bindTruncateTitle(cell, fullText) {
		if (!fullText) return;
		cell.addEventListener("mouseenter", function() {
			if (cell.scrollWidth > cell.clientWidth) cell.title = fullText;
		});
		cell.addEventListener("mouseleave", function() {
			cell.removeAttribute("title");
		});
	}

	/* 名称单元格 */
	const tdCaption = document.createElement("td");
	tdCaption.style.cssText = "padding:8px 12px;color:var(--eext-text-primary);border-bottom:1px solid var(--eext-border);max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
	tdCaption.textContent = rec.caption || "未命名";
	bindTruncateTitle(tdCaption, "名称: " + (rec.caption || "未命名"));
	tr.appendChild(tdCaption);

	/* 描述单元格 */
	const tdDesc = document.createElement("td");
	tdDesc.style.cssText = "padding:8px 12px;color:var(--eext-text-secondary);border-bottom:1px solid var(--eext-border);max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
	tdDesc.textContent = rec.description || "—";
	bindTruncateTitle(tdDesc, rec.description ? "描述: " + rec.description : "");
	tr.appendChild(tdDesc);

	/* 补全值单元格 */
	const tdValue = document.createElement("td");
	tdValue.style.cssText = "padding:8px 12px;color:var(--eext-text-primary);border-bottom:1px solid var(--eext-border);font-family:Consolas,Monaco,'Courier New',monospace;font-size:11px;max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
	tdValue.textContent = rec.value || "";
	bindTruncateTitle(tdValue, "补全值: " + (rec.value || ""));
	tr.appendChild(tdValue);

	/* 操作单元格 */
	const tdAction = document.createElement("td");
	tdAction.style.cssText = "padding:8px 12px;text-align:right;border-bottom:1px solid var(--eext-border);white-space:nowrap;";
	const delBtn = document.createElement("button");
	delBtn.className = "eext-modal-btn-delete";
	delBtn.style.cssText = "padding:4px 12px;font-size:11px;min-width:auto;height:auto;";
	delBtn.textContent = "删除";
	delBtn.onclick = function(ev) {
		ev.stopPropagation();
		eda.sys_Dialog.showConfirmationMessage(
			"确定删除补全项 \"" + (rec.caption || "未命名") + "\" 吗？此操作不可撤销。",
			"提示", "确认", "取消",
			async function(confirmed) {
				if (!confirmed) return;
				try {
					await _deleteCompleterById(rec.id);
					if (typeof _removeUserCompleterFromEditor === "function") {
						_removeUserCompleterFromEditor(editor);
					}
					try {
						const db = await UserCompleterStore_Init();
						const all = await new Promise(function(res, rej) {
							const tx = db.transaction(["completions"], "readonly");
							const req = tx.objectStore("completions").getAll();
							req.onsuccess = function() { res(req.result || []); };
							req.onerror = rej;
						});
						if (all.length > 0 && typeof _registerUserCompleters === "function") {
							_registerUserCompleters(editor, all);
						}
					} catch(e) {}
					if (window.leftNavPanel && window.leftNavPanel.loadCompleterStore) {
						window.leftNavPanel.loadCompleterStore();
					}
					reloadFn();
					eda.sys_Message.showToastMessage("已删除: " + (rec.caption || "未命名"), "success", 1);
				} catch(err) {
					eda.sys_Message.showToastMessage("删除失败: " + err.message, "error", 1);
				}
			}
		);
	};
	tdAction.appendChild(delBtn);
	tr.appendChild(tdAction);

	/* 双击任意非按钮单元格进入编辑 */
	tdCaption.ondblclick = function() { _showCompleterEditDialog(rec, editor, reloadFn); };
	tdValue.ondblclick = tdCaption.ondblclick;
	tdDesc.ondblclick = tdCaption.ondblclick;

	/* 悬停整行：换底色 + 提升文字对比度（描述由 secondary 升级为 primary） */
	tr.onmouseenter = function() {
		tr.style.background = "var(--eext-hover-bg)";
		tdCaption.style.color = "var(--eext-text-primary)";
		tdDesc.style.color = "var(--eext-text-primary)";
		tdValue.style.color = "var(--eext-text-primary)";
	};
	tr.onmouseleave = function() {
		tr.style.background = stripe;
		tdCaption.style.color = "var(--eext-text-primary)";
		tdDesc.style.color = "var(--eext-text-secondary)";
		tdValue.style.color = "var(--eext-text-primary)";
	};
	return tr;
}

/**
 * 显示补全项编辑/新增弹窗
 * 点击弹窗外区域不关闭，仅"×"、"取消"或"保存"可关闭
 * 自定义模态框样式参考 example.png
 * @param {Object|null} rec - 补全记录（null 表示新增模式）
 * @param {Object} editor - ACE 编辑器实例
 * @param {Function} reloadFn - 重新加载列表的回调
 */
function _showCompleterEditDialog(rec, editor, reloadFn) {
	/* 移除可能存在的旧实例 */
	const old = document.getElementById("eext-cs-edit-overlay");
	if (old) old.remove();

	const isAdd = !rec || !rec.id;
	const modeTitle = isAdd ? "新增补全项" : "编辑补全项";

	const overlay = document.createElement("div");
	overlay.id = "eext-cs-edit-overlay";
	overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:100000;display:flex;align-items:center;justify-content:center;font-family:inherit;";
	/* 点击遮罩不关闭（保留原需求），但阻止事件冒泡到下层 */
	overlay.addEventListener("mousedown", function(ev) { if (ev.target === overlay) ev.stopPropagation(); });

	const modal = document.createElement("div");
	modal.style.cssText = "background:var(--eext-bg-modal);border:1px solid var(--eext-border);border-radius:8px;width:440px;max-width:92%;box-shadow:0 12px 32px rgba(0,0,0,0.2);display:flex;flex-direction:column;overflow:hidden;color:var(--eext-text-primary);";

	/* Header */
	const header = document.createElement("div");
	header.style.cssText = "padding:14px 20px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--eext-border);";
	const title = document.createElement("span");
	title.textContent = modeTitle;
	title.style.cssText = "font-size:14px;font-weight:600;color:var(--eext-text-primary);";
	header.appendChild(title);
	const closeBtn = document.createElement("button");
	closeBtn.innerHTML = "&times;";
	closeBtn.style.cssText = "width:26px;height:26px;border-radius:50%;border:none;background:transparent;color:var(--eext-text-secondary);font-size:18px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.15s,color 0.15s;";
	closeBtn.onmouseenter = function() { closeBtn.style.background = "var(--eext-hover-bg)"; closeBtn.style.color = "var(--eext-text-primary)"; };
	closeBtn.onmouseleave = function() { closeBtn.style.background = "transparent"; closeBtn.style.color = "var(--eext-text-secondary)"; };
	closeBtn.onclick = function() { closeDialog(); };
	header.appendChild(closeBtn);
	modal.appendChild(header);

	/* Body */
	const body = document.createElement("div");
	body.style.cssText = "padding:20px;display:flex;flex-direction:column;gap:14px;";

	function buildField(labelText, placeholder, id, type) {
		const wrap = document.createElement("div");
		wrap.style.cssText = "display:flex;flex-direction:column;gap:6px;";
		const label = document.createElement("label");
		label.textContent = labelText;
		label.style.cssText = "font-size:12px;color:var(--eext-text-secondary);font-weight:500;";
		label.setAttribute("for", id);
		wrap.appendChild(label);
		const input = document.createElement("input");
		input.type = type || "text";
		input.id = id;
		input.placeholder = placeholder;
		input.style.cssText = "width:100%;box-sizing:border-box;padding:8px 12px;border:1px solid var(--eext-border);border-radius:4px;font-size:13px;color:var(--eext-text-primary);background:var(--eext-bg-input);outline:none;transition:border-color 0.15s;";
		input.onfocus = function() { input.style.borderColor = "var(--eext-brand)"; };
		input.onblur = function() { input.style.borderColor = "var(--eext-border)"; };
		wrap.appendChild(input);
		body.appendChild(wrap);
		return input;
	}

	const captionInput = buildField("名称", "请输入名称（中文映射）", "eext-cs-edit-caption", "text");
	const valueInput = buildField("补全值", "请输入补全值（选中后插入的代码）", "eext-cs-edit-value", "text");
	valueInput.style.fontFamily = "Consolas,Monaco,'Courier New',monospace";
	valueInput.style.fontSize = "12px";
	const descInput = buildField("描述", "请输入描述（补全提示说明，可选）", "eext-cs-edit-desc", "text");

	captionInput.value = (rec && rec.caption) || "";
	valueInput.value = (rec && rec.value) || "";
	descInput.value = (rec && rec.description) || "";

	modal.appendChild(body);

	/* Footer */
	const footer = document.createElement("div");
	footer.style.cssText = "padding:12px 20px;display:flex;justify-content:flex-end;gap:8px;border-top:1px solid var(--eext-border);background:var(--eext-bg-item);";
	const cancelBtn = document.createElement("button");
	cancelBtn.textContent = "取消";
	cancelBtn.style.cssText = "padding:8px 18px;border:1px solid var(--eext-border);border-radius:4px;background:transparent;color:var(--eext-text-primary);font-size:12px;cursor:pointer;transition:background 0.15s;";
	cancelBtn.onmouseenter = function() { cancelBtn.style.background = "var(--eext-hover-bg)"; };
	cancelBtn.onmouseleave = function() { cancelBtn.style.background = "transparent"; };
	cancelBtn.onclick = function() { closeDialog(); };
	footer.appendChild(cancelBtn);
	const saveBtn = document.createElement("button");
	saveBtn.textContent = "保存";
	saveBtn.style.cssText = "padding:8px 20px;border:none;border-radius:4px;background:var(--eext-brand);color:#fff;font-size:12px;cursor:pointer;font-weight:500;transition:opacity 0.15s;";
	saveBtn.onmouseenter = function() { saveBtn.style.opacity = "0.85"; };
	saveBtn.onmouseleave = function() { saveBtn.style.opacity = "1"; };
	footer.appendChild(saveBtn);
	modal.appendChild(footer);

	overlay.appendChild(modal);
	document.body.appendChild(overlay);

	setTimeout(function() { captionInput.focus(); captionInput.select(); }, 50);

	/* 统一关闭：先解绑 document 监听，再移除 DOM */
	function closeDialog() {
		document.removeEventListener("keydown", keyHandler, true);
		if (overlay.parentNode) overlay.remove();
	}

	/* Enter 提交、Escape 关闭本弹窗（capture 阶段先于父级 settings 弹窗响应，
	   并通过 stopImmediatePropagation 阻止父级 ESC 处理器触发） */
	function keyHandler(e) {
		if (e.key === "Enter") {
			e.preventDefault();
			e.stopImmediatePropagation();
			saveBtn.click();
		} else if (e.key === "Escape") {
			e.preventDefault();
			e.stopImmediatePropagation();
			closeDialog();
		}
	}
	document.addEventListener("keydown", keyHandler, true);

	saveBtn.onclick = async function() {
		var newCaption = captionInput.value.trim();
		var newValue = valueInput.value.trim();
		var newDesc = descInput.value.trim();
		if (!newCaption) { captionInput.focus(); eda.sys_Message.showToastMessage("名称不能为空", "error", 1); return; }
		if (!newValue) { valueInput.focus(); eda.sys_Message.showToastMessage("补全值不能为空", "error", 1); return; }

		/* 自动提取参数 */
		var newParams = [];
		if (typeof _parseLineForCompletion === "function") {
			var parsed = _parseLineForCompletion(newValue);
			if (parsed && parsed.params) newParams = parsed.params;
		}

		saveBtn.disabled = true;
		saveBtn.textContent = "保存中...";
		cancelBtn.disabled = true;
		try {
			if (isAdd) {
				/* 新增模式：先检查重名，再 store.add */
				const db = await UserCompleterStore_Init();
				const dupCheck = await new Promise(function(res, rej) {
					const tx = db.transaction(["completions"], "readonly");
					const req = tx.objectStore("completions").index("caption").get(newCaption);
					req.onsuccess = function() { res(!!req.result); };
					req.onerror = rej;
				});
				if (dupCheck) {
					saveBtn.disabled = false;
					saveBtn.textContent = "保存";
					cancelBtn.disabled = false;
					captionInput.focus();
					eda.sys_Message.showToastMessage("名称 \"" + newCaption + "\" 已存在", "error", 1);
					return;
				}
				await new Promise(function(resolve, reject) {
					const tx = db.transaction(["completions"], "readwrite");
					const req = tx.objectStore("completions").add({
						caption: newCaption,
						value: newValue,
						params: newParams,
						description: newDesc,
						createdAt: new Date().toISOString(),
					});
					req.onsuccess = resolve;
					req.onerror = function() { reject(req.error); };
				});
			} else {
				/* 编辑模式：优先走 _updateCompleter */
				if (typeof _updateCompleter === "function") {
					await _updateCompleter(rec.id, {
						caption: newCaption,
						value: newValue,
						params: newParams,
						description: newDesc,
					});
				} else {
					const db = await UserCompleterStore_Init();
					await new Promise(function(resolve, reject) {
						const tx = db.transaction(["completions"], "readwrite");
						const store = tx.objectStore("completions");
						const getReq = store.get(rec.id);
						getReq.onsuccess = function() {
							const record = getReq.result;
							if (!record) return reject(new Error("记录不存在"));
							Object.assign(record, { caption: newCaption, value: newValue, params: newParams, description: newDesc });
							const putReq = store.put(record);
							putReq.onsuccess = resolve;
							putReq.onerror = function() { reject(putReq.error); };
						};
						getReq.onerror = function() { reject(getReq.error); };
					});
				}
			}
			if (typeof _removeUserCompleterFromEditor === "function") {
				_removeUserCompleterFromEditor(editor);
			}
			try {
				const db = await UserCompleterStore_Init();
				const all = await new Promise(function(res, rej) {
					const tx = db.transaction(["completions"], "readonly");
					const req = tx.objectStore("completions").getAll();
					req.onsuccess = function() { res(req.result || []); };
					req.onerror = rej;
				});
				if (all.length > 0 && typeof _registerUserCompleters === "function") {
					_registerUserCompleters(editor, all);
				}
			} catch(e) {}
			if (window.leftNavPanel && window.leftNavPanel.loadCompleterStore) {
				window.leftNavPanel.loadCompleterStore();
			}
			closeDialog();
			reloadFn();
			eda.sys_Message.showToastMessage((isAdd ? "已新增: " : "已更新: ") + newCaption, "success", 1);
		} catch(err) {
			saveBtn.disabled = false;
			saveBtn.textContent = "保存";
			cancelBtn.disabled = false;
			eda.sys_Message.showToastMessage((isAdd ? "新增失败: " : "更新失败: ") + err.message, "error", 1);
		}
	};
}

