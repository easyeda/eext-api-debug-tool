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
		position: fixed;
		z-index: 10000;
		background: ${menuBg};
		border: 1px solid ${menuBorder};
		box-shadow: 2px 2px 8px ${menuShadow};
		display: block;
		font-size: 14px;
		min-width: 120px;
		border-radius: 4px;
		padding: 4px 0;
	`;

	const menuItems = [
		{ text: '新建项目', action: () => showNewProjectDialog(editor) },
		{ text: '---', action: null },
		{ text: '加载代码', action: () => Code_OpenLoadWindow(editor) },
		{ text: '保存代码', action: () => Code_SaveCode(editor) },
		{
			text: '删除已保存代码',
			action: () => Code_OpenDeleteWindow(editor),
		},
		{ text: '保存到快捷按钮', action: () => Code_SaveToBtnList(editor) },
		{ text: '保存到启动项', action: () => ExtStore_SavePlugin(editor) },
	];

	menu.innerHTML = '';
	menuItems.forEach((item) => {
		if (item.text === '---') {
			const separator = document.createElement('div');
			separator.style.cssText = `height:1px;background:${menuBorder};margin:4px 0;`;
			menu.appendChild(separator);
			return;
		}
		const menuItem = document.createElement('div');
		menuItem.textContent = item.text;
		menuItem.style.cssText = `padding:8px 16px;cursor:pointer;color:${textColor};user-select:none;transition:background 0.2s;`;
		menuItem.onmouseenter = () => (menuItem.style.backgroundColor = hoverBg);
		menuItem.onmouseleave = () => (menuItem.style.backgroundColor = '');
		menuItem.onclick = () => {
			menu.style.display = 'none';
			if (item.action) item.action();
		};
		menu.appendChild(menuItem);
	});

	const btnRect = e.target.getBoundingClientRect();
	let left = btnRect.right + 5;
	let top = btnRect.top;
	if (left + 120 > window.innerWidth) left = btnRect.left - 125;
	if (top + menuItems.length * 40 > window.innerHeight) top = window.innerHeight - menuItems.length * 40 - 10;
	menu.style.left = `${left}px`;
	menu.style.top = `${top}px`;

	const closeMenu = (event) => {
		if (!menu.contains(event.target) && event.target !== e.target) {
			menu.style.display = 'none';
			document.removeEventListener('click', closeMenu);
		}
	};
	setTimeout(() => document.addEventListener('click', closeMenu), 10);
}

/**
 * 显示设置模态框
 * @param {Object} editor - ACE 编辑器实例
 * @param {HTMLElement} light_theme - 亮色主题元素
 * @param {HTMLElement} dark_theme - 暗色主题元素
 */
function showSettingsModal(editor, light_theme, dark_theme) {
	if (document.getElementById('settings-modal-overlay')) return;

	let isDark = document.body.classList.contains('dark-theme');

	function getThemeColors() {
		const currentIsDark = document.body.classList.contains('dark-theme');
		return {
			modalBg: currentIsDark ? '#404040' : '#fff',
			modalBorder: currentIsDark ? '#222' : '#d9d9d9',
			textColor: currentIsDark ? '#e5e5e5' : '#333',
			itemBg: currentIsDark ? '#353535' : '#f5f5f5',
			itemHoverBg: currentIsDark ? '#6283a2' : '#e6f7ff',
			secondaryText: currentIsDark ? '#868686' : '#666',
		};
	}

	let colors = getThemeColors();

	const overlay = document.createElement('div');
	overlay.id = 'settings-modal-overlay';
	overlay.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);backdrop-filter:blur(2px);z-index:10000;display:flex;justify-content:center;align-items:center;`;

	const modal = document.createElement('div');
	modal.id = 'settings-modal-content';
	modal.style.cssText = `background:${colors.modalBg};border:1px solid ${colors.modalBorder};border-radius:4px;width:400px;max-width:90%;max-height:80vh;box-shadow:0 0 15px rgba(50,50,50,0.3);display:flex;flex-direction:column;color:${colors.textColor};`;

	const header = document.createElement('div');
	header.id = 'settings-modal-header';
	header.style.cssText = `padding:8px 16px;border-bottom:1px solid ${colors.modalBorder};display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:12px;`;
	header.innerHTML = `<span>设置</span><button id="settings-modal-close" style="background:transparent;border:none;color:${colors.textColor};cursor:pointer;font-size:12px;line-height:1;padding:0 8px;border-radius:2px;transition:color 0.2s,background 0.2s;">×</button>`;

	const body = document.createElement('div');
	body.id = 'settings-modal-body';
	body.style.cssText = `padding:16px;display:flex;flex-direction:column;gap:12px;overflow-y:auto;overflow-x:hidden;flex:1;`;

	function updateModalThemeColors() {
		colors = getThemeColors();
		modal.style.background = colors.modalBg;
		modal.style.borderColor = colors.modalBorder;
		modal.style.color = colors.textColor;
		header.style.borderColor = colors.modalBorder;
		document.getElementById('settings-modal-close').style.color = colors.textColor;

		const themeLabel = document.getElementById('theme-label');
		

		document.querySelectorAll('.settings-item-card').forEach((item) => {
			item.style.background = colors.itemBg;
			item.style.borderColor = colors.modalBorder;
		});
	}

	function _to6hex(h){return (h||"#000").replace(/^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/,"#$1$1$2$2$3$3");}
	// 收集当前颜色选择器的值并持久化
let _persistTimer = null;
function _persistCurrentColors() {
	clearTimeout(_persistTimer);
	_persistTimer = setTimeout(() => {
		const newVars = {};
		document.querySelectorAll('#settings-modal-body input[type=color]').forEach(el => {
			newVars[el.getAttribute('data-key')] = el.value;
		});
		const current = ThemeEngine.getCurrent();
		const themeName = current === 'dark' ? '自定义暗色' : current === 'light' ? '自定义亮色' : '自定义';
		ThemeEngine.saveCustom(themeName, { ...ThemeEngine.getCurrentVars(), ...newVars }, themeName).then(name => {
			if (name) ThemeEngine.apply(name);
		});
	}, 500);
}

function renderMainSettings() {
		body.innerHTML = '';

		const themeToggle = document.createElement('div');
		themeToggle.style.cssText = 'display:flex;flex-direction:column;gap:8px;';

		const themeLabel = document.createElement('div');
		themeLabel.id = 'theme-label';
		themeLabel.textContent = '主题';
		themeLabel.style.cssText = 'font-size:12px;font-weight:500;color:' + colors.textColor + ';';

		themeToggle.appendChild(themeLabel);

		// Theme preset cards
		const presets = ThemeEngine.listThemes().filter(t => t.preset);
		presets.forEach(t => {
			const card = document.createElement('div');
			card.className = 'theme-preset-card';
			card.setAttribute('data-theme', t.id);
			const active = ThemeEngine.getCurrent() === t.id;
			card.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 10px;background:' + (active ? colors.itemHoverBg : colors.itemBg) + ';border:1px solid ' + (active ? colors.modalBorder : 'transparent') + ';border-radius:2px;cursor:pointer;font-size:12px;color:' + colors.textColor + ';transition:background 0.2s;';
			card.innerHTML = '<div style="width:12px;height:12px;border-radius:2px;border:1px solid ' + colors.modalBorder + ';background:' + (t.id === 'dark' ? '#404040' : t.id === 'dark-editor' ? '#272822' : '#f5f5f5') + ';"></div><span>' + t.name + '</span>' + (active ? '<span style="margin-left:auto;color:' + colors.textColor + ';">✔</span>' : '');
			card.onmouseenter = () => { if (!card.classList.contains('active')) card.style.background = colors.itemHoverBg; };
			card.onmouseleave = () => { if (!card.classList.contains('active')) card.style.background = colors.itemBg; };
			card.onclick = async () => {
				if (ThemeEngine.getCurrent() === t.id) return;
				ThemeEngine.apply(t.id);
				isDark = document.body.classList.contains('dark-theme');
				updateModalThemeColors();
				// Rebuild theme cards
				renderMainSettings();
				eda.sys_Message.showToastMessage('主题已切换为' + t.name, 'info', 1);
			};
			themeToggle.appendChild(card);
		});

		body.appendChild(themeToggle);
		// Color customization section
		const colorSection = document.createElement('div');
		colorSection.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-top:8px;';

		const colorLabel = document.createElement('div');
		colorLabel.textContent = '自定义主题颜色';
		colorLabel.style.cssText = 'font-size:12px;font-weight:500;color:' + colors.textColor + ';';
		colorSection.appendChild(colorLabel);

		const currentVars = ThemeEngine.getCurrentVars();
		const editableKeys = ['bg-body','bg-toolbar','bg-panel','bg-input','editor-bg','text-primary','border','brand','brand-hover'];
		const keyLabels = {'bg-body':'页面背景','bg-toolbar':'工具栏','bg-panel':'面板','bg-input':'输入框','editor-bg':'编辑器','text-primary':'主文字','border':'边框','brand':'品牌色','brand-hover':'悬停色'};

		editableKeys.forEach(k => {
			const row = document.createElement('div');
			row.style.cssText = 'display:flex;align-items:center;gap:6px;';
			const swatch = document.createElement('input');
			swatch.type = 'color';
			swatch.value = _to6hex(currentVars[k]);
			swatch.style.cssText = 'width:24px;height:24px;border:1px solid ' + colors.modalBorder + ';border-radius:2px;padding:0;cursor:pointer;';
			swatch.setAttribute('data-key', k);
			const hexInput = document.createElement('input');
			hexInput.type = 'text';
			hexInput.value = _to6hex(currentVars[k]);
			hexInput.style.cssText = 'width:82px;height:24px;padding:0 4px;border:1px solid ' + colors.modalBorder + ';border-radius:2px;font-size:12px;font-family:monospace;color:' + colors.textColor + ';background:' + colors.itemBg + ';';
			hexInput.setAttribute('data-key', k);
			// 实时同步 + 持久化：修改即保存为自定义主题
			const applyColor = (val) => {
				document.documentElement.style.setProperty('--eext-' + k, val);
				_persistCurrentColors();
			};
			hexInput.oninput = () => { swatch.value = hexInput.value; applyColor(hexInput.value); };
			swatch.oninput = () => { hexInput.value = swatch.value; applyColor(swatch.value); };
			const label = document.createElement('span');
			label.textContent = keyLabels[k];
			label.style.cssText = 'font-size:12px;color:' + colors.secondaryText + ';flex:1;';
			row.appendChild(swatch);
			row.appendChild(hexInput);
			row.appendChild(label);
			colorSection.appendChild(row);
		});

		body.appendChild(colorSection);


		// 窗口尺寸设置
		const sizeSettings = document.createElement('div');
		sizeSettings.style.cssText = `display:flex;flex-direction:column;gap:12px;`;

		const sizeLabel = document.createElement('div');
		sizeLabel.id = 'size-label';
		sizeLabel.textContent = '窗口尺寸';
		sizeLabel.style.cssText = `font-size:12px;font-weight:500;color:${colors.textColor};transition:color 0.3s ease;`;

		const sizeContainer = document.createElement('div');
		sizeContainer.id = 'size-container';
		sizeContainer.style.cssText = `background:${colors.itemBg};border:1px solid ${colors.modalBorder};border-radius:2px;padding:12px 16px;`;

		const inputRow = document.createElement('div');
		inputRow.style.cssText = `display:flex;gap:8px;align-items:center;flex-wrap:wrap;`;

		const widthLabel = document.createElement('span');
		widthLabel.id = 'ui-width-label';
		widthLabel.textContent = '宽';
		widthLabel.style.cssText = `font-size:12px;color:${colors.textColor};`;

		const widthInput = document.createElement('input');
		widthInput.type = 'number';
		widthInput.placeholder = window.innerWidth;
		widthInput.id = 'ui-width-input';
		widthInput.style.cssText = `width:80px;height:24px;padding:0 6px;background:${colors.modalBg};color:${colors.textColor};border:1px solid ${colors.modalBorder};border-radius:2px;font-size:12px;outline:none;-moz-appearance:textfield;`;
		widthInput.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
		widthInput.addEventListener('keydown', (e) => {
			if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
		});

		const heightLabel = document.createElement('span');
		heightLabel.id = 'ui-height-label';
		heightLabel.textContent = '高';
		heightLabel.style.cssText = `font-size:12px;color:${colors.textColor};`;

		const heightInput = document.createElement('input');
		heightInput.type = 'number';
		heightInput.placeholder = window.innerHeight;
		heightInput.id = 'ui-height-input';
		heightInput.style.cssText = `width:80px;height:24px;padding:0 6px;background:${colors.modalBg};color:${colors.textColor};border:1px solid ${colors.modalBorder};border-radius:2px;font-size:12px;outline:none;-moz-appearance:textfield;`;
		heightInput.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
		heightInput.addEventListener('keydown', (e) => {
			if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault();
		});

		const applyBtn = document.createElement('button');
		applyBtn.id = 'ui-apply-btn';
		applyBtn.textContent = '应用';
		applyBtn.style.cssText = `height:28px;padding:0 10px;min-width:96px;background:${isDark ? '#353535' : '#1890ff'};color:#fff;border:1px solid ${isDark ? '#222' : '#1890ff'};border-radius:2px;font-size:12px;cursor:pointer;font-weight:500;`;
		applyBtn.onmouseenter = () => (applyBtn.style.opacity = '0.85');
		applyBtn.onmouseleave = () => (applyBtn.style.opacity = '1');
		applyBtn.onclick = async () => {
			const width = widthInput.value.trim() || String(window.innerWidth);
			const height = heightInput.value.trim() || String(window.innerHeight);

			if (parseInt(width) < 400 || parseInt(height) < 300) {
				eda.sys_Message.showToastMessage('窗口尺寸过小，最小宽度400，最小高度300', 'warn', 2);
				return;
			}

			applyBtn.textContent = '应用中...';
			applyBtn.disabled = true;

			try {
				await eda.sys_Storage.setExtensionUserConfig('UI_width', width);
				await eda.sys_Storage.setExtensionUserConfig('UI_height', height);

				eda.sys_IFrame.closeIFrame('ScriptTool');

				const newWidth = await eda.sys_Storage.getExtensionUserConfig('UI_width');
				const newHeight = await eda.sys_Storage.getExtensionUserConfig('UI_height');

				eda.sys_IFrame.openIFrame('iframe/main/index.html', parseInt(newWidth) || 1200, parseInt(newHeight) || 700, 'ScriptTool', {
					maximizeButton: true,
					minimizeButton: true,
				});
			} catch (error) {
				console.error('应用窗口尺寸失败:', error);
				eda.sys_Message.showToastMessage('应用失败: ' + error.message, 'error', 3);
				applyBtn.textContent = '应用';
				applyBtn.disabled = false;
			}
		};

		inputRow.appendChild(widthLabel);
		inputRow.appendChild(widthInput);
		inputRow.appendChild(heightLabel);
		inputRow.appendChild(heightInput);
		inputRow.appendChild(applyBtn);
		sizeContainer.appendChild(inputRow);
		sizeSettings.appendChild(sizeLabel);
		sizeSettings.appendChild(sizeContainer);
		body.appendChild(sizeSettings);

		// 补全模式设置
		const completionSettings = document.createElement('div');
		completionSettings.style.cssText = `display:flex;flex-direction:column;gap:12px;`;

		const completionLabel = document.createElement('div');
		completionLabel.id = 'completion-label';
		completionLabel.textContent = '补全模式';
		completionLabel.style.cssText = `font-size:12px;font-weight:500;color:${colors.textColor};transition:color 0.3s ease;`;

		const completionSwitch = document.createElement('div');
		completionSwitch.id = 'completion-switch';
		completionSwitch.style.cssText = `display:flex;align-items:center;justify-content:space-between;background:${colors.itemBg};border:1px solid ${colors.modalBorder};border-radius:8px;padding:12px 16px;cursor:pointer;transition:all 0.3s ease;`;

		// 加载当前设置
		let completionWithComment = false;
		(async () => {
			try {
				const saved = await eda.sys_Storage.getExtensionUserConfig('completion_with_comment');
				completionWithComment = saved === 'true' || saved === true;
			} catch (e) {}
			updateCompletionSwitch();
		})();

		function updateCompletionSwitch() {
			completionSwitch.innerHTML = `
				<div style="display:flex;align-items:center;gap:12px;">
					<svg id="completion-icon-off" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${completionWithComment ? '#868686' : '#fa8c16'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition:stroke 0.4s ease,transform 0.4s ease;transform:${completionWithComment ? 'scale(1) rotate(-30deg)' : 'scale(1.1)'};">
						<polyline points="16 18 22 12 16 6"></polyline>
						<polyline points="8 6 2 12 8 18"></polyline>
					</svg>
					<div id="completion-slider-bg" style="position:relative;width:50px;height:26px;background:${completionWithComment ? '#1890ff' : '#d9d9d9'};border-radius:13px;transition:background 0.4s ease;box-shadow:inset 0 2px 4px rgba(0,0,0,0.1);">
						<div id="completion-slider" style="position:absolute;top:3px;left:${completionWithComment ? '27px' : '3px'};width:20px;height:20px;background:white;border-radius:50%;transition:left 0.4s cubic-bezier(0.4,0,0.2,1),transform 0.2s ease;box-shadow:0 2px 4px rgba(0,0,0,0.2);"></div>
					</div>
					<svg id="completion-icon-on" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${completionWithComment ? '#1890ff' : '#868686'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition:stroke 0.4s ease,transform 0.4s ease;transform:${completionWithComment ? 'scale(1.1)' : 'scale(1) rotate(30deg)'};">
						<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
					</svg>
				</div>
				<span id="completion-text" style="font-size:12px;color:${colors.secondaryText};transition:color 0.3s ease;">${completionWithComment ? '带注释补全' : '正常补全'}</span>
			`;
		}

		completionSwitch.onmouseenter = () => {
			completionSwitch.style.backgroundColor = colors.itemHoverBg;
			const slider = document.getElementById('completion-slider');
			if (slider) slider.style.transform = 'scale(1.1)';
		};
		completionSwitch.onmouseleave = () => {
			completionSwitch.style.backgroundColor = colors.itemBg;
			const slider = document.getElementById('completion-slider');
			if (slider) slider.style.transform = 'scale(1)';
		};

		completionSwitch.onclick = async () => {
			const slider = document.getElementById('completion-slider');
			const sliderBg = document.getElementById('completion-slider-bg');
			const iconOff = document.getElementById('completion-icon-off');
			const iconOn = document.getElementById('completion-icon-on');
			const text = document.getElementById('completion-text');

			if (slider) {
				slider.style.transform = 'scale(0.9)';
				setTimeout(() => {
					slider.style.transform = 'scale(1)';
				}, 150);
			}

			completionWithComment = !completionWithComment;
			try { await eda.sys_Storage.setExtensionUserConfig('completion_with_comment', completionWithComment.toString()); } catch (e) {}

			// Smooth transition
			if (sliderBg) sliderBg.style.background = completionWithComment ? '#1890ff' : '#d9d9d9';
			if (slider) slider.style.left = completionWithComment ? '27px' : '3px';
			if (iconOff) {
				iconOff.style.stroke = completionWithComment ? '#868686' : '#fa8c16';
				iconOff.style.transform = completionWithComment ? 'scale(1) rotate(-30deg)' : 'scale(1.1) rotate(0deg)';
			}
			if (iconOn) {
				iconOn.style.stroke = completionWithComment ? '#1890ff' : '#868686';
				iconOn.style.transform = completionWithComment ? 'scale(1.1) rotate(0deg)' : 'scale(1) rotate(30deg)';
			}
			if (text) text.textContent = completionWithComment ? '带注释补全' : '正常补全';
		};

		completionSettings.appendChild(completionLabel);
		completionSettings.appendChild(completionSwitch);
		body.appendChild(completionSettings);

		const settingsItems = [
			{
				text: '快捷键设置',
				action: () => {
					overlay.style.display = 'none';
					showKeyboardShortcutsModal(editor, () => {
						overlay.style.display = 'flex';
					});
				},
			},
			{
				text: '启动项管理',
				action: () => {
					overlay.style.display = 'none';
					showPluginManagerModal(editor, () => {
						overlay.style.display = 'flex';
					});
				},
			},
			{
				text: '补全仓库',
				action: () => {
					overlay.style.display = 'none';
					showCompleterStoreModal(editor, () => {
						overlay.style.display = 'flex';
					});
				},
			},
		];

		settingsItems.forEach((item) => {
			const itemDiv = document.createElement('div');
			itemDiv.className = 'settings-item-card';
			itemDiv.textContent = item.text;
			itemDiv.style.cssText = `padding:12px 16px;background:${colors.itemBg};border:1px solid ${colors.modalBorder};border-radius:2px;cursor:pointer;transition:background 0.2s,border-color 0.2s;font-size:12px;`;
			itemDiv.onmouseenter = () => {
				itemDiv.style.backgroundColor = colors.itemHoverBg;
				itemDiv.style.transform = 'translateX(4px)';
			};
			itemDiv.onmouseleave = () => {
				itemDiv.style.backgroundColor = colors.itemBg;
				itemDiv.style.transform = 'translateX(0)';
			};
			itemDiv.onclick = () => {
				item.action();
			};
			body.appendChild(itemDiv);
		});
	}

	renderMainSettings();

	modal.appendChild(header);
	modal.appendChild(body);
	overlay.appendChild(modal);
	document.body.appendChild(overlay);

	document.getElementById('settings-modal-close').onclick = () => overlay.remove();

	const escHandler = (e) => {
		if (e.key === 'Escape') {
			overlay.remove();
			document.removeEventListener('keydown', escHandler);
		}
	};
	document.addEventListener('keydown', escHandler);
}

/**
 * 显示新建项目对话框
 */
async function showNewProjectDialog(editor) {
	const result = await Swal.fire({
		title: '新建项目',
		input: 'text',
		inputLabel: '项目名称',
		inputPlaceholder: '例如: MyProject',
		showCancelButton: true,
		confirmButtonText: '创建',
		cancelButtonText: '取消',
		inputValidator: (value) => {
			if (!value) return '请输入项目名称';
			if (value.length < 2) return '项目名称至少2个字符';
		},
	});

	if (result.isConfirmed) {
		try {
			const project = await window.projectManager.createProject(result.value);
			window.fileTreeUI = new FileTreeUI('file-tree', editor);
			await window.fileTreeUI.render();

			// 初始化项目补全器
			if (window.projectCompleter) {
				window.projectCompleter.clear();
				window.projectCompleter.updateFiles();
			}

			if (project.files.length > 0) {
				const firstFile = project.files[0];
				editor.setValue(firstFile.content, -1);
				window.projectManager.currentFile = firstFile.fileName;
			}

			// 刷新左侧导航面板并切换到项目设计视图
			if (window.leftNavPanel) {
				await window.leftNavPanel.loadProjectList();
				window.leftNavPanel.switchView('project-design');
			}

			eda.sys_Message.showToastMessage('项目创建成功', 'success', 2);
		} catch (error) {
			eda.sys_Message.showToastMessage('项目创建失败: ' + error.message, 'error', 3);
		}
	}
}


