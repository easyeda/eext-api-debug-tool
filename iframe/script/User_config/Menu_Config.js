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
async function showNewProjectDialog(editor) {
	var result = await Swal.fire({
		title: "新建项目",
		input: "text",
		inputLabel: "项目名称",
		inputPlaceholder: "例如: MyProject",
		showCancelButton: true,
		confirmButtonText: "创建",
		cancelButtonText: "取消",
		inputValidator: function(value) {
			if (!value) return "请输入项目名称";
			if (value.length < 2) return "项目名称至少2个字符";
		},
	});

	if (result.isConfirmed) {
		try {
			var project = await window.projectManager.createProject(result.value);
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
}

/**
 * 显示新建脚本对话框
 */
async function showNewScriptDialog(editor) {
	var result = await Swal.fire({
		title: "新建脚本",
		input: "text",
		inputLabel: "脚本名称",
		inputPlaceholder: "例如: my-script.js",
		inputValue: "untitled.js",
		showCancelButton: true,
		confirmButtonText: "创建",
		cancelButtonText: "取消",
		inputValidator: function(value) {
			if (!value) return "请输入脚本名称";
			if (value.length < 2) return "脚本名称至少2个字符";
		},
	});

	if (result.isConfirmed) {
		try {
			var name = result.value.trim();
			if (!name.endsWith(".js")) name += ".js";
			var projectName = name.replace(/.js$/, "");
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
							rec.files[0].content = "// " + name;
							var putReq = store.put(rec);
							putReq.onsuccess = function() { window.projectManager._savedContent = '// ' + name; window.projectManager.currentFile = name; if (typeof TabManager !== 'undefined') TabManager.open(project.id, name, name); editor.setValue("// " + name, -1); window.projectManager._dirty = false; if (window.fileTreeUI && window.fileTreeUI._registerDirtyListener) window.fileTreeUI._registerDirtyListener(); res(); };
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
	modal.style.cssText = `background:var(--eext-bg-modal);border:1px solid var(--eext-border);border-radius:4px;width:680px;max-width:95%;height:520px;max-height:85vh;box-shadow:0 0 15px rgba(50,50,50,0.3);display:flex;flex-direction:column;color:var(--eext-text-primary);`;

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
	cancelBtn.style.cssText = 'height:28px;padding:0 10px;min-width:96px;background:var(--eext-btn-bg);color:var(--eext-text-primary);border:1px solid var(--eext-btn-border);border-radius:2px;cursor:pointer;font-size:12px;';
	cancelBtn.onclick = () => overlay.remove();
	const confirmBtn = document.createElement('button');
	confirmBtn.textContent = '确认';
	confirmBtn.style.cssText = 'height:28px;padding:0 10px;min-width:96px;background:var(--eext-brand);color:#fff;border:1px solid var(--eext-brand);border-radius:2px;cursor:pointer;font-size:12px;';
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
			row.style.cssText = `padding:6px 16px;cursor:pointer;font-size:12px;color:${active ? 'var(--eext-brand)' : 'var(--eext-text-primary)'};background:${active ? 'var(--eext-hover-bg)' : 'transparent'};border-right:${active ? '2px solid var(--eext-brand)' : '2px solid transparent'};transition:background 0.15s;`;
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
			const row = document.createElement('div');
			row.style.cssText = 'display:flex;align-items:center;gap:12px;';
			const label = document.createElement('span'); label.textContent = '带注释补全';
			label.style.cssText = 'font-size:12px;color:var(--eext-text-primary);';
			const sw = document.createElement('label');
			sw.style.cssText = 'position:relative;display:inline-block;width:44px;height:24px;';
			const cb = document.createElement('input'); cb.type = 'checkbox'; cb.id = 'completion-checkbox';
			const sl = document.createElement('span');
			sl.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;background:var(--eext-border);border-radius:24px;cursor:pointer;';
			sl.innerHTML = '<span style="position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:var(--eext-bg-panel);transition:transform 0.2s;"></span>';
			cb.style.cssText = 'opacity:0;width:0;height:0;';
			sw.appendChild(cb); sw.appendChild(sl);
			cb.onchange = () => {
				const dot = sl.querySelector('span');
				if (cb.checked) { dot.style.transform = 'translateX(20px)'; sl.style.background = 'var(--eext-brand)'; }
				else { dot.style.transform = 'translateX(0)'; sl.style.background = 'var(--eext-border)'; }
				eda.sys_Storage.setExtensionUserConfig('completion_with_comment', cb.checked);
			};
			try {
				cb.checked = eda.sys_Storage.getExtensionUserConfig('completion_with_comment') == 'true';
				if (cb.checked) { sl.style.background = 'var(--eext-brand)'; sl.querySelector('span').style.transform = 'translateX(20px)'; }
			} catch(e) {}
			row.appendChild(label); row.appendChild(sw);
			contentPane.appendChild(row);
		} else if (activeMenu === 'shortcuts') {
			section('快捷键');
			var platform = typeof getPlatform === 'function' ? getPlatform() : 'windows';
			var platformLabel = platform === 'mac' ? 'macOS' : 'Windows';

			var infoDiv = document.createElement('div');
			infoDiv.style.cssText = 'font-size:11px;color:var(--eext-text-secondary);margin-bottom:10px;';
			infoDiv.textContent = '当前平台: ' + platformLabel + '，点击快捷键输入框后按下新组合键即可修改';
			contentPane.appendChild(infoDiv);

			var list = document.createElement('div');
			list.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
			contentPane.appendChild(list);

			var shortcutsData = null;

			async function renderShortcuts() {
				list.innerHTML = '<div style="font-size:12px;color:var(--eext-text-secondary);text-align:center;padding:12px;">加载中...</div>';
				try {
					shortcutsData = typeof loadShortcuts === 'function' ? await loadShortcuts() : null;
					if (!shortcutsData) {
						list.innerHTML = '<div style="font-size:12px;color:var(--eext-text-secondary);text-align:center;padding:12px;">无法加载快捷键配置</div>';
						return;
					}
					list.innerHTML = '';
					Object.entries(shortcutsData).forEach(function(entry) {
						var key = entry[0];
						var cfg = entry[1];
						var row = document.createElement('div');
						row.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:6px 8px;background:var(--eext-bg-item);border:1px solid var(--eext-border);border-radius:2px;';

						var desc = document.createElement('span');
						desc.textContent = cfg.description;
						desc.style.cssText = 'font-size:12px;color:var(--eext-text-primary);flex:1;';

						var input = document.createElement('input');
						input.type = 'text';
						input.value = cfg[platform] || key;
						input.readOnly = true;
						input.style.cssText = 'width:155px;height:24px;padding:0 8px;background:var(--eext-bg-input);color:var(--eext-text-primary);border:1px solid var(--eext-border);border-radius:2px;font-size:11px;font-family:monospace;text-align:center;cursor:pointer;user-select:none;';

					input.addEventListener('focus', function() { window.keyboardShortcutsModalOpen = true; });
						input.addEventListener('blur', function() { window.keyboardShortcutsModalOpen = false; });
						input.addEventListener('keydown', function(e) {
							e.preventDefault();
							e.stopPropagation();
							var keys = [];
							if (e.ctrlKey) keys.push('Ctrl');
							if (e.shiftKey) keys.push('Shift');
							if (e.altKey) keys.push('Alt');
							if (e.metaKey) keys.push(platform === 'mac' ? 'Command' : 'Meta');
							var keyName = e.key;
							if (keyName && !['Control','Shift','Alt','Meta'].includes(keyName)) {
								if (keyName === ' ') keyName = 'Space';
								else if (keyName.length === 1) keyName = keyName.toUpperCase();
								keys.push(keyName);
							}
							if (keys.length > 0 && keys[keys.length - 1] !== 'Control' && keys[keys.length - 1] !== 'Shift' && keys[keys.length - 1] !== 'Alt' && keys[keys.length - 1] !== 'Meta' && keys[keys.length - 1] !== 'Command') {
								input.value = keys.join('+');
								shortcutsData[key][platform] = input.value;
							}
						});

						row.appendChild(desc);
						row.appendChild(input);
						list.appendChild(row);
					});
				} catch(e) {
					list.innerHTML = '<div style="font-size:12px;color:var(--eext-error);text-align:center;padding:12px;">加载失败: ' + e.message + '</div>';
				}
			}
			renderShortcuts();

			var btnRow = document.createElement('div');
			btnRow.style.cssText = 'display:flex;gap:8px;margin-top:12px;';

			var resetBtn = document.createElement('button');
			resetBtn.textContent = '恢复默认';
			resetBtn.style.cssText = 'height:28px;padding:0 10px;min-width:96px;background:var(--eext-btn-bg);color:var(--eext-text-primary);border:1px solid var(--eext-btn-border);border-radius:2px;cursor:pointer;font-size:12px;';
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
				eda.sys_Message.showToastMessage('已恢复默认快捷键', 'success', 1);
			};
			btnRow.appendChild(resetBtn);

			var saveBtn = document.createElement('button');
			saveBtn.textContent = '保存';
			saveBtn.style.cssText = 'height:28px;padding:0 10px;min-width:96px;background:var(--eext-brand);color:#fff;border:1px solid var(--eext-brand);border-radius:2px;cursor:pointer;font-size:12px;';
			saveBtn.onclick = async function() {
				if (typeof saveShortcuts === 'function') {
					var success = await saveShortcuts(shortcutsData);
					if (success) {
						eda.sys_Message.showToastMessage('快捷键设置已保存，请重新打开窗口以应用更改', 'success', 3);
					} else {
						eda.sys_Message.showToastMessage('保存失败', 'error', 2);
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
							item.style.cssText = 'display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--eext-border);';

							// Enable toggle
							var toggle = document.createElement('label');
							toggle.style.cssText = 'position:relative;display:inline-block;width:32px;height:18px;flex-shrink:0;';
							var cb = document.createElement('input');
							cb.type = 'checkbox';
							cb.checked = p.enabled !== false;
							cb.style.cssText = 'opacity:0;width:0;height:0;';
							var sl = document.createElement('span');
							sl.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;background:' + (cb.checked ? 'var(--eext-brand)' : 'var(--eext-border)') + ';border-radius:18px;cursor:pointer;transition:background 0.2s;';
							sl.innerHTML = '<span style="position:absolute;top:1px;left:1px;width:14px;height:14px;border-radius:50%;background:#fff;transition:transform 0.2s;' + (cb.checked ? 'transform:translateX(14px)' : '') + ';"></span>';
							toggle.appendChild(cb);
							toggle.appendChild(sl);
							cb.onchange = async function() {
								var newState = cb.checked;
								sl.style.background = newState ? 'var(--eext-brand)' : 'var(--eext-border)';
								sl.querySelector('span').style.transform = newState ? 'translateX(14px)' : '';
								try {
									await ExtStore_TogglePlugin(p.name, newState);
									eda.sys_Message.showToastMessage('插件 "' + p.name + '" 已' + (newState ? '启用' : '禁用'), 'success', 1);
								} catch(err) {
									cb.checked = !newState;
									sl.style.background = cb.checked ? 'var(--eext-brand)' : 'var(--eext-border)';
									sl.querySelector('span').style.transform = cb.checked ? 'translateX(14px)' : '';
									eda.sys_Message.showToastMessage('操作失败: ' + err.message, 'error', 2);
								}
							};
							item.appendChild(toggle);

							// Plugin name
							var nameSpan = document.createElement('span');
							nameSpan.textContent = p.name || '未命名';
							nameSpan.title = p.name;
							nameSpan.style.cssText = 'flex:1;font-size:12px;color:var(--eext-text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
							item.appendChild(nameSpan);

							// Rename button
							var renameBtn = document.createElement('button');
							renameBtn.textContent = '重命名';
							renameBtn.style.cssText = 'height:24px;padding:0 8px;background:var(--eext-btn-bg);color:var(--eext-text-primary);border:1px solid var(--eext-btn-border);border-radius:2px;cursor:pointer;font-size:11px;flex-shrink:0;';
							renameBtn.onclick = async function() {
								var result = await Swal.fire({
									title: '重命名插件',
									input: 'text',
									inputValue: p.name,
									inputLabel: '新名称',
									showCancelButton: true,
									confirmButtonText: '确定',
									cancelButtonText: '取消',
									inputValidator: function(value) {
										if (!value || !value.trim()) return '请输入名称';
										if (value.trim() === p.name) return '名称未改变';
									},
								});
								if (result.isConfirmed) {
									try {
										await ExtStore_RenameExt(p.name, result.value.trim());
										await loadPluginList();
										eda.sys_Message.showToastMessage('重命名成功', 'success', 1);
									} catch(err) {
										eda.sys_Message.showToastMessage('重命名失败: ' + err.message, 'error', 2);
									}
								}
							};
							item.appendChild(renameBtn);

							// Load button
							var loadBtn = document.createElement('button');
							loadBtn.textContent = '加载';
							loadBtn.style.cssText = 'height:24px;padding:0 8px;background:var(--eext-brand);color:#fff;border:1px solid var(--eext-brand);border-radius:2px;cursor:pointer;font-size:11px;flex-shrink:0;';
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
							item.appendChild(loadBtn);

							// Delete button
							var delBtn = document.createElement('button');
							delBtn.textContent = '删除';
							delBtn.style.cssText = 'height:24px;padding:0 8px;background:transparent;color:var(--eext-error);border:1px solid var(--eext-error);border-radius:2px;cursor:pointer;font-size:11px;flex-shrink:0;';
							delBtn.onclick = async function() {
								var confirmResult = await Swal.fire({
									title: '确认删除',
									html: '确定删除插件 "<strong>' + p.name + '</strong>"？',
									icon: 'warning',
									showCancelButton: true,
									confirmButtonText: '删除',
									cancelButtonText: '取消',
									confirmButtonColor: '#d33',
								});
								if (!confirmResult.isConfirmed) return;
								try {
									await ExtStore_DeleteExt(p.name);
									await loadPluginList();
									eda.sys_Message.showToastMessage('插件 "' + p.name + '" 已删除', 'info', 1);
								} catch(err) {
									eda.sys_Message.showToastMessage('删除失败: ' + err.message, 'error', 2);
								}
							};
							item.appendChild(delBtn);

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
			const list = document.createElement('div');
			list.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
			contentPane.appendChild(list);
			async function loadCompleters() {
				list.innerHTML = '<div style="font-size:12px;color:var(--eext-text-secondary);text-align:center;padding:12px;">加载中...</div>';
				try {
					const items = await new Promise(function(r) { try { var x = indexedDB.open('UserCompleterStore', 1); x.onsuccess = function() { var t = x.result.transaction('completions','readonly'); var g = t.objectStore('completions').getAll(); g.onsuccess = function() { r(g.result || []); }; g.onerror = function() { r([]); }; }; x.onerror = function() { r([]); }; } catch(e) { r([]); } });
					if (!items || items.length === 0) {
						list.innerHTML = '<div style="font-size:12px;color:var(--eext-text-secondary);text-align:center;padding:12px;">暂无自定义补全项。</div>';
						return;
					}
					list.innerHTML = '';
					items.forEach(function(c) { list.appendChild(_buildCompleterCard(c, editor, loadCompleters)); });
				} catch(e) {
					list.innerHTML = '<div style="font-size:12px;color:var(--eext-error);text-align:center;padding:12px;">加载失败: ' + e.message + '</div>';
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

	/* Escape to close */
	document.addEventListener('keydown', function escH(e) {
		if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', escH); }
	});

	/* Close button */
	header.querySelector('#settings-modal-close').onclick = () => overlay.remove();

	/* Initial render */
	renderMenu();
	renderContent();
}

/* ============================================
   补全仓库 - 卡片渲染与编辑
   ============================================ */

/**
 * 构建单个补全项的卡片 DOM
 * @param {Object} rec - 补全记录 {id, caption, value, params, description}
 * @param {Object} editor - ACE 编辑器实例
 * @param {Function} reloadFn - 重新加载列表的回调
 */
function _buildCompleterCard(rec, editor, reloadFn) {
	const card = document.createElement("div");
	card.className = "cs-item";

	/* 信息区 */
	const info = document.createElement("div");
	info.className = "cs-item-info";

	const caption = document.createElement("span");
	caption.className = "cs-item-caption";
	caption.textContent = rec.caption || "未命名";
	caption.title = "名称: " + (rec.caption || "未命名");
	info.appendChild(caption);

	const value = document.createElement("span");
	value.className = "cs-item-value";
	value.textContent = rec.value || "";
	value.title = "补全值: " + (rec.value || "");
	info.appendChild(value);

	if (rec.description) {
		const desc = document.createElement("span");
		desc.className = "cs-item-desc";
		desc.textContent = rec.description;
		desc.title = "描述: " + rec.description;
		info.appendChild(desc);
	}

	if (rec.params && rec.params.length > 0) {
		const params = document.createElement("span");
		params.className = "cs-item-params";
		params.textContent = "参数: " + rec.params.join(", ");
		info.appendChild(params);
	}

	card.appendChild(info);

	/* 操作按钮 */
	const actions = document.createElement("div");
	actions.className = "cs-item-actions";

	const editBtn = document.createElement("button");
	editBtn.className = "cs-btn cs-btn-edit";
	editBtn.textContent = "编辑";
	editBtn.onclick = function() {
		if (card.querySelector(".cs-edit-form")) return;
		card.appendChild(_buildCompleterEditForm(rec, editor, card, reloadFn));
	};
	actions.appendChild(editBtn);

	const delBtn = document.createElement("button");
	delBtn.className = "cs-btn cs-btn-delete";
	delBtn.textContent = "删除";
	delBtn.onclick = function() {
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
					/* 重新注册剩余补全项 */
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
	actions.appendChild(delBtn);

	card.appendChild(actions);
	return card;
}

/**
 * 构建补全项的内联编辑表单
 * @param {Object} rec - 补全记录
 * @param {Object} editor - ACE 编辑器实例
 * @param {HTMLElement} card - 卡片容器
 * @param {Function} reloadFn - 重新加载列表的回调
 */
function _buildCompleterEditForm(rec, editor, card, reloadFn) {
	const form = document.createElement("div");
	form.className = "cs-edit-form";

	function addRow(label, val, placeholder, inputId) {
		const row = document.createElement("div");
		row.className = "cs-edit-row";
		const lbl = document.createElement("label");
		lbl.textContent = label;
		const inp = document.createElement("input");
		inp.className = "cs-edit-input";
		inp.value = val || "";
		inp.placeholder = placeholder || "";
		inp.id = inputId;
		row.appendChild(lbl);
		row.appendChild(inp);
		form.appendChild(row);
		return inp;
	}

	const inpCaption = addRow("名称:", rec.caption || "", "补全显示名称（中文映射）", "cs-edit-caption");
	const inpValue = addRow("补全值:", rec.value || "", "选中后插入的代码内容", "cs-edit-value");
	const inpDesc = addRow("描述:", rec.description || "", "补全提示说明", "cs-edit-desc");

	const btnRow = document.createElement("div");
	btnRow.className = "cs-edit-actions";

	const saveBtn = document.createElement("button");
	saveBtn.className = "cs-btn cs-btn-save";
	saveBtn.textContent = "保存";
	saveBtn.onclick = async function() {
		const newCaption = inpCaption.value.trim();
		const newValue = inpValue.value.trim();
		const newDesc = inpDesc.value.trim();

		if (!newCaption) { eda.sys_Message.showToastMessage("名称不能为空", "warn", 1); return; }
		if (!newValue) { eda.sys_Message.showToastMessage("补全值不能为空", "warn", 1); return; }

		/* 自动提取参数 */
		var newParams = [];
		if (typeof _parseLineForCompletion === "function") {
			var parsed = _parseLineForCompletion(newValue);
			if (parsed && parsed.params) newParams = parsed.params;
		}

		saveBtn.textContent = "保存中...";
		saveBtn.disabled = true;
		try {
			if (typeof _updateCompleter === "function") {
				await _updateCompleter(rec.id, {
					caption: newCaption,
					value: newValue,
					params: newParams,
					description: newDesc,
				});
			} else {
				/* 回退：手动更新 IndexedDB */
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
			/* 刷新编辑器补全器 */
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
			eda.sys_Message.showToastMessage("已更新: " + newCaption, "success", 1);
		} catch(err) {
			eda.sys_Message.showToastMessage("更新失败: " + err.message, "error", 1);
			saveBtn.textContent = "保存";
			saveBtn.disabled = false;
		}
	};
	btnRow.appendChild(saveBtn);

	const cancelBtn = document.createElement("button");
	cancelBtn.className = "cs-btn cs-btn-cancel";
	cancelBtn.textContent = "取消";
	cancelBtn.onclick = function() { form.remove(); };
	btnRow.appendChild(cancelBtn);

	form.appendChild(btnRow);
	/* 自动聚焦到名称输入框 */
	setTimeout(function() { inpCaption.focus(); }, 50);
	return form;
}
