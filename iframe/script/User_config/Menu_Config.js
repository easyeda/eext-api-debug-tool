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
		font-size: 14px; min-width: 120px; border-radius: 4px; padding: 4px 0;
	`;

	const menuItems = [
		{ text: '新建项目', action: () => showNewProjectDialog(editor) },
		{ text: '---', action: null },
		{ text: '加载代码', action: () => Code_OpenLoadWindow(editor) },
		{ text: '保存代码', action: () => Code_SaveCode(editor) },
		{ text: '删除已保存代码', action: () => Code_OpenDeleteWindow(editor) },
		{ text: '保存到快捷按钮', action: () => Code_SaveToBtnList(editor) },
		{ text: '保存到启动项', action: () => ExtStore_SavePlugin(editor) },
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

/* ============================================
   设置模态框 — EDA 系统设置风格
   左侧菜单 + 右侧内容 + 底部按钮
   ============================================ */
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
		{ id: 'ai', label: 'AI 配置' },
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
	confirmBtn.onclick = () => {
		// 应用窗口尺寸
		const w = document.getElementById('ui-width-input'), h = document.getElementById('ui-height-input');
		if (w && h) {
			const nw = w.value.trim() || String(window.innerWidth);
			const nh = h.value.trim() || String(window.innerHeight);
			if (parseInt(nw) >= 400 && parseInt(nh) >= 300) {
				eda.sys_Storage.setExtensionUserConfig('UI_width', nw);
				eda.sys_Storage.setExtensionUserConfig('UI_height', nh);
			}
		}
		overlay.remove();
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
			row.appendChild(w.span); row.appendChild(w.inp);
			row.appendChild(h.span); row.appendChild(h.inp);
			contentPane.appendChild(row);

			/* Color customization */
			const sec3 = section('图元颜色');
			const keys = ['bg-toolbar','bg-panel','bg-input','editor-bg','text-primary','border'];
			const labels = {'bg-toolbar':'顶部菜单','bg-panel':'左侧面板背景','bg-input':'输入框','editor-bg':'编辑器','text-primary':'左侧面板文字','border':'边框'};
			keys.forEach(k => {
				const cr = document.createElement('div');
				cr.style.cssText = 'display:flex;align-items:center;gap:6px;margin-bottom:4px;';
				var domVal = document.documentElement.style.getPropertyValue('--eext-'+k).trim() || getComputedStyle(document.documentElement).getPropertyValue('--eext-'+k).trim(); if (domVal.startsWith('rgb')) { var m2 = domVal.match(/[\d.]+/g); if (m2 && m2.length >= 3) domVal = '#' + m2.slice(0,3).map(function(x) { return parseInt(x).toString(16).padStart(2,'0'); }).join(''); }
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
		} else if (activeMenu === 'ai') {
			section('AI 配置');
			/* Inline AI config form */
			const profiles = JSON.parse(localStorage.getItem('ai_profiles') || 'null') || [{name:'默认',apiKey:'',baseUrl:'https://api.openai.com/v1',model:'gpt-4',multiTurn:true,stream:true,temperature:0.7}];
			const activeIdx = parseInt(localStorage.getItem('ai_active_profile')) || 0;
			const cfg = profiles[activeIdx] || profiles[0];
			const aiFields = [
				{ label: 'API Key', id: 'cfg-api-key', val: cfg.apiKey||'', type: 'password', ph: '' },
				{ label: 'Base URL', id: 'cfg-base-url', val: cfg.baseUrl||'', type: 'text', ph: '' },
				{ label: 'Model', id: 'cfg-model', val: cfg.model||'', type: 'text', ph: '' },
				{ label: 'Temperature', id: 'cfg-temperature', val: cfg.temperature??0.7, type: 'number', ph: '0.7' },
			];
			aiFields.forEach(f => {
				const grp = document.createElement('div');
				grp.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:6px;';
				const lbl = document.createElement('span');
				lbl.textContent = f.label; lbl.style.cssText = 'font-size:12px;color:var(--eext-text-primary);width:80px;flex-shrink:0;';
				const inp = document.createElement('input');
				inp.type = f.type; inp.id = f.id; inp.value = String(f.val); inp.placeholder = f.ph;
				inp.style.cssText = 'flex:1;height:24px;padding:0 8px;border:1px solid var(--eext-border);border-radius:2px;font-size:12px;color:var(--eext-text-primary);background:var(--eext-bg-input);';
				grp.appendChild(lbl); grp.appendChild(inp);
				contentPane.appendChild(grp);
			});
			const saveAi = document.createElement('button');
			saveAi.textContent = '保存 AI 配置';
			saveAi.style.cssText = 'height:28px;padding:0 10px;min-width:96px;background:var(--eext-brand);color:#fff;border:1px solid var(--eext-brand);border-radius:2px;cursor:pointer;font-size:12px;margin-top:8px;';
			saveAi.onclick = () => {
				cfg.apiKey = document.getElementById('cfg-api-key')?.value?.trim() || '';
				cfg.baseUrl = document.getElementById('cfg-base-url')?.value?.trim()?.replace(/\/$/,'') || '';
				cfg.model = document.getElementById('cfg-model')?.value?.trim() || 'gpt-4';
				cfg.temperature = parseFloat(document.getElementById('cfg-temperature')?.value) || 0.7;
				localStorage.setItem('ai_profiles', JSON.stringify(profiles));
				eda.sys_Message.showToastMessage('AI 配置已保存', 'success', 1);
			};
			contentPane.appendChild(saveAi);
		} else if (activeMenu === 'shortcuts') {
			section('快捷键');
			const platform = typeof getPlatform === 'function' ? getPlatform() : 'windows';
			const shortcuts = typeof loadShortcuts === 'function' ? (async () => { try { return await loadShortcuts(); } catch(e) { return null; } })() : null;
			(async () => {
				const sc = await shortcuts;
				if (!sc) {
					const err = document.createElement('div');
					err.textContent = '无法加载快捷键配置。'; err.style.cssText = 'font-size:12px;color:var(--eext-text-secondary);';
					contentPane.appendChild(err); return;
				}
				Object.entries(sc).forEach(([key, cfg]) => {
					const row = document.createElement('div');
					row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:4px 0;';
					const desc = document.createElement('span');
					desc.textContent = cfg.description; desc.style.cssText = 'font-size:12px;color:var(--eext-text-primary);flex:1;';
					const kb = document.createElement('span');
					kb.textContent = cfg[platform] || cfg.key || key;
					kb.style.cssText = 'font-size:11px;color:var(--eext-text-secondary);font-family:monospace;background:var(--eext-bg-item);padding:2px 6px;border-radius:2px;';
					row.appendChild(desc); row.appendChild(kb);
					contentPane.appendChild(row);
				});
			})();
		} else if (activeMenu === 'plugins') {
			section('插件管理');
			const list = document.createElement('div');
			list.style.cssText = 'display:flex;flex-direction:column;gap:4px;';
			(async () => {
				try {
					const plugins = typeof ExtStore_GetExtList === 'function' ? await ExtStore_GetExtList() : [];
					if (!plugins || plugins.length === 0) {
						list.innerHTML = '<div style="font-size:12px;color:var(--eext-text-secondary);">暂无已保存的插件。</div>';
					} else {
						plugins.forEach(p => {
							const item = document.createElement('div');
							item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:var(--eext-bg-item);border-radius:2px;';
							item.innerHTML = `<span style="font-size:12px;color:var(--eext-text-primary);">${p.name||'未命名插件'}</span>`;
							contentPane.appendChild(item);
						});
					}
				} catch(e) { list.textContent = '加载失败。'; }
			})();
			list.style.marginTop = '0';
			contentPane.appendChild(list);
		} else if (activeMenu === 'completer') {
			section('补全仓库');
			const list = document.createElement('div');
			list.style.cssText = 'display:flex;flex-direction:column;gap:4px;';
			(async () => {
				try {
					const items = await new Promise(function(r) { try { var x = indexedDB.open('UserCompleterStore', 1); x.onsuccess = function() { var t = x.result.transaction('completions','readonly'); var g = t.objectStore('completions').getAll(); g.onsuccess = function() { r(g.result || []); }; g.onerror = function() { r([]); }; }; x.onerror = function() { r([]); }; } catch(e) { r([]); } });
					if (!items || items.length === 0) {
						list.innerHTML = '<div style="font-size:12px;color:var(--eext-text-secondary);">暂无自定义补全项。</div>';
					} else {
						items.forEach(c => {
							const item = document.createElement('div');
							item.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:4px 8px;background:var(--eext-bg-item);border-radius:2px;';
							item.innerHTML = `<span style="font-size:12px;color:var(--eext-text-primary);">${c.methodPath||c.caption||'未命名'}</span>`;
							contentPane.appendChild(item);
						});
					}
				} catch(e) { list.textContent = '加载失败。'; }
			})();
			contentPane.appendChild(list);
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
			ThemeEngine.getCurrentVars().then(cv => ThemeEngine.saveCustom(nm, {...cv, ...nv}, nm)).then(n => { if (n) ThemeEngine.apply(n); });
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
