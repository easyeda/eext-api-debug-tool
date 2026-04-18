/**
 * 显示文件操作右键菜单
 * @param {Event} e - 点击事件
 * @param {Object} editor - ACE 编辑器实例
 */
function showFileContextMenu(e, editor) {
	const isDark = document.getElementById('theme-dark') && !document.getElementById('theme-dark').disabled;
	const menuBg = isDark ? '#2d2e27' : '#ffffff';
	const menuBorder = isDark ? '#444' : '#d0d7de';
	const menuShadow = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)';
	const textColor = isDark ? '#f8f8f2' : '#24292f';
	const hoverBg = isDark ? '#3b3c35' : '#f6f8fa';

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
		{ text: '导入', action: () => ImportFile(editor) },
		{ text: '导出', action: () => ExportFileForJs(editor.getValue(), Date() + '_script.js') },
		{ text: '加载', action: () => Code_OpenLoadWindow(editor) },
		{ text: '保存', action: () => Code_SaveCode(editor) },
		{
			text: '删除',
			action: () => {
				eda.sys_Message.showToastMessage('注意，这玩意不会问你是否删除，点一下立马删，三思而后行', 'warn', 3);
				Code_OpenDeleteWindow(editor);
			},
		},
		{ text: '保存到列表', action: () => Code_SaveToBtnList(editor) },
	];

	menu.innerHTML = '';
	menuItems.forEach((item) => {
		const menuItem = document.createElement('div');
		menuItem.textContent = item.text;
		menuItem.style.cssText = `padding:8px 16px;cursor:pointer;color:${textColor};user-select:none;transition:background 0.2s;`;
		menuItem.onmouseenter = () => (menuItem.style.backgroundColor = hoverBg);
		menuItem.onmouseleave = () => (menuItem.style.backgroundColor = '');
		menuItem.onclick = () => {
			menu.style.display = 'none';
			item.action();
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

	let isDark = dark_theme && !dark_theme.disabled;

	function getThemeColors() {
		const currentIsDark = dark_theme && !dark_theme.disabled;
		return {
			modalBg: currentIsDark ? '#272822' : '#ffffff',
			modalBorder: currentIsDark ? '#444' : '#d0d7de',
			textColor: currentIsDark ? '#f8f8f2' : '#24292f',
			itemBg: currentIsDark ? '#333430' : '#f6f8fa',
			itemHoverBg: currentIsDark ? '#3b3c35' : '#eaeef2',
			secondaryText: currentIsDark ? '#75715e' : '#6b7280',
		};
	}

	let colors = getThemeColors();

	const overlay = document.createElement('div');
	overlay.id = 'settings-modal-overlay';
	overlay.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);backdrop-filter:blur(2px);z-index:10000;display:flex;justify-content:center;align-items:center;`;

	const modal = document.createElement('div');
	modal.id = 'settings-modal-content';
	modal.style.cssText = `background:${colors.modalBg};border:1px solid ${colors.modalBorder};border-radius:8px;width:400px;max-width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.5);display:flex;flex-direction:column;color:${colors.textColor};transition:background 0.3s ease,border-color 0.3s ease,color 0.3s ease;`;

	const header = document.createElement('div');
	header.id = 'settings-modal-header';
	header.style.cssText = `padding:16px 20px;border-bottom:1px solid ${colors.modalBorder};display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:16px;transition:border-color 0.3s ease;`;
	header.innerHTML = `<span>设置</span><button id="settings-modal-close" style="background:transparent;border:none;color:${colors.textColor};cursor:pointer;font-size:24px;line-height:1;padding:0;width:24px;height:24px;transition:color 0.3s ease;">×</button>`;

	const body = document.createElement('div');
	body.id = 'settings-modal-body';
	body.style.cssText = `padding:20px;display:flex;flex-direction:column;gap:16px;`;

	function updateModalThemeColors() {
		colors = getThemeColors();
		modal.style.background = colors.modalBg;
		modal.style.borderColor = colors.modalBorder;
		modal.style.color = colors.textColor;
		header.style.borderColor = colors.modalBorder;
		document.getElementById('settings-modal-close').style.color = colors.textColor;

		const themeLabel = document.getElementById('theme-label');
		const themeSwitch = document.getElementById('theme-switch');
		const themeText = document.getElementById('theme-text');
		const sunIcon = document.getElementById('theme-icon-sun');
		const moonIcon = document.getElementById('theme-icon-moon');
		const slider = document.getElementById('theme-slider');
		const sliderBg = document.getElementById('theme-slider-bg');

		if (themeLabel) themeLabel.style.color = colors.textColor;
		if (themeSwitch) {
			themeSwitch.style.background = colors.itemBg;
			themeSwitch.style.borderColor = colors.modalBorder;
		}
		if (themeText) themeText.style.color = colors.secondaryText;

		const newTheme = isDark ? 'dark' : 'light';
		if (sunIcon) {
			sunIcon.style.stroke = newTheme === 'light' ? '#f59e0b' : '#75715e';
			sunIcon.style.transform = newTheme === 'light' ? 'scale(1.1) rotate(0deg)' : 'scale(1) rotate(-30deg)';
		}
		if (moonIcon) {
			moonIcon.style.stroke = newTheme === 'dark' ? '#66d9ef' : '#75715e';
			moonIcon.style.transform = newTheme === 'dark' ? 'scale(1.1) rotate(0deg)' : 'scale(1) rotate(30deg)';
		}
		if (slider) slider.style.left = newTheme === 'dark' ? '27px' : '3px';
		if (sliderBg) sliderBg.style.background = newTheme === 'dark' ? '#66d9ef' : '#d1d5db';
		if (themeText) themeText.textContent = newTheme === 'dark' ? '暗色' : '亮色';

		document.querySelectorAll('.settings-item-card').forEach((item) => {
			item.style.background = colors.itemBg;
			item.style.borderColor = colors.modalBorder;
		});
	}

	function renderMainSettings() {
		body.innerHTML = '';

		const themeToggle = document.createElement('div');
		themeToggle.style.cssText = `display:flex;flex-direction:column;gap:12px;`;

		const themeLabel = document.createElement('div');
		themeLabel.id = 'theme-label';
		themeLabel.textContent = '主题';
		themeLabel.style.cssText = `font-size:14px;font-weight:500;color:${colors.textColor};transition:color 0.3s ease;`;

		const currentTheme = isDark ? 'dark' : 'light';
		const themeSwitch = document.createElement('div');
		themeSwitch.id = 'theme-switch';
		themeSwitch.style.cssText = `display:flex;align-items:center;justify-content:space-between;background:${colors.itemBg};border:1px solid ${colors.modalBorder};border-radius:8px;padding:12px 16px;cursor:pointer;transition:all 0.3s ease;`;
		themeSwitch.innerHTML = `
			<div style="display:flex;align-items:center;gap:12px;">
				<svg id="theme-icon-sun" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${currentTheme === 'light' ? '#f59e0b' : '#75715e'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition:stroke 0.4s ease,transform 0.4s ease;transform:${currentTheme === 'light' ? 'scale(1.1)' : 'scale(1) rotate(-30deg)'};">
					<circle cx="12" cy="12" r="5"></circle>
					<line x1="12" y1="1" x2="12" y2="3"></line>
					<line x1="12" y1="21" x2="12" y2="23"></line>
					<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
					<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
					<line x1="1" y1="12" x2="3" y2="12"></line>
					<line x1="21" y1="12" x2="23" y2="12"></line>
					<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
					<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
				</svg>
				<div id="theme-slider-bg" style="position:relative;width:50px;height:26px;background:${currentTheme === 'dark' ? '#66d9ef' : '#d1d5db'};border-radius:13px;transition:background 0.4s ease;box-shadow:inset 0 2px 4px rgba(0,0,0,0.1);">
					<div id="theme-slider" style="position:absolute;top:3px;left:${currentTheme === 'dark' ? '27px' : '3px'};width:20px;height:20px;background:white;border-radius:50%;transition:left 0.4s cubic-bezier(0.4,0,0.2,1),transform 0.2s ease;box-shadow:0 2px 4px rgba(0,0,0,0.2);"></div>
				</div>
				<svg id="theme-icon-moon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${currentTheme === 'dark' ? '#66d9ef' : '#75715e'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition:stroke 0.4s ease,transform 0.4s ease;transform:${currentTheme === 'dark' ? 'scale(1.1)' : 'scale(1) rotate(30deg)'};">
					<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
				</svg>
			</div>
			<span id="theme-text" style="font-size:13px;color:${colors.secondaryText};transition:color 0.3s ease;">${currentTheme === 'dark' ? '暗色' : '亮色'}</span>
		`;

		themeSwitch.onmouseenter = () => {
			themeSwitch.style.backgroundColor = colors.itemHoverBg;
			const slider = document.getElementById('theme-slider');
			if (slider) slider.style.transform = 'scale(1.1)';
		};
		themeSwitch.onmouseleave = () => {
			themeSwitch.style.backgroundColor = colors.itemBg;
			const slider = document.getElementById('theme-slider');
			if (slider) slider.style.transform = 'scale(1)';
		};

		themeSwitch.onclick = async () => {
			const slider = document.getElementById('theme-slider');
			if (slider) {
				slider.style.transform = 'scale(0.9)';
				setTimeout(() => {
					slider.style.transform = 'scale(1)';
				}, 150);
			}

			const newTheme = await SetTheme(editor, light_theme, dark_theme);
			isDark = newTheme === 'dark';
			updateModalThemeColors();
		};

		themeToggle.appendChild(themeLabel);
		themeToggle.appendChild(themeSwitch);
		body.appendChild(themeToggle);

		// 窗口尺寸设置
		const sizeSettings = document.createElement('div');
		sizeSettings.style.cssText = `display:flex;flex-direction:column;gap:12px;`;

		const sizeLabel = document.createElement('div');
		sizeLabel.textContent = '窗口尺寸';
		sizeLabel.style.cssText = `font-size:14px;font-weight:500;color:${colors.textColor};transition:color 0.3s ease;`;

		const sizeContainer = document.createElement('div');
		sizeContainer.style.cssText = `background:${colors.itemBg};border:1px solid ${colors.modalBorder};border-radius:8px;padding:12px 16px;transition:all 0.3s ease;`;

		const inputRow = document.createElement('div');
		inputRow.style.cssText = `display:flex;gap:8px;align-items:center;margin-bottom:12px;`;

		const widthLabel = document.createElement('span');
		widthLabel.textContent = '宽:';
		widthLabel.style.cssText = `font-size:13px;color:${colors.textColor};min-width:28px;`;

		const widthInput = document.createElement('input');
		widthInput.type = 'number';
		widthInput.placeholder = '1200';
		widthInput.id = 'ui-width-input';
		widthInput.style.cssText = `width:80px;padding:6px 8px;background:${colors.modalBg};color:${colors.textColor};border:1px solid ${colors.modalBorder};border-radius:4px;font-size:13px;outline:none;transition:all 0.2s ease;`;
		widthInput.onfocus = () => (widthInput.style.borderColor = isDark ? '#66d9ef' : '#0969da');
		widthInput.onblur = () => (widthInput.style.borderColor = colors.modalBorder);

		const heightLabel = document.createElement('span');
		heightLabel.textContent = '高:';
		heightLabel.style.cssText = `font-size:13px;color:${colors.textColor};min-width:28px;margin-left:8px;`;

		const heightInput = document.createElement('input');
		heightInput.type = 'number';
		heightInput.placeholder = '700';
		heightInput.id = 'ui-height-input';
		heightInput.style.cssText = `width:80px;padding:6px 8px;background:${colors.modalBg};color:${colors.textColor};border:1px solid ${colors.modalBorder};border-radius:4px;font-size:13px;outline:none;transition:all 0.2s ease;`;
		heightInput.onfocus = () => (heightInput.style.borderColor = isDark ? '#66d9ef' : '#0969da');
		heightInput.onblur = () => (heightInput.style.borderColor = colors.modalBorder);

		// 加载当前设置
		(async () => {
			const savedWidth = await eda.sys_Storage.getExtensionUserConfig('UI_width');
			const savedHeight = await eda.sys_Storage.getExtensionUserConfig('UI_height');
			if (savedWidth) widthInput.value = savedWidth;
			if (savedHeight) heightInput.value = savedHeight;
		})();

		const applyBtn = document.createElement('button');
		applyBtn.textContent = '应用';
		applyBtn.style.cssText = `padding:8px 16px;background:${isDark ? '#66d9ef' : '#0969da'};color:${isDark ? '#272822' : '#ffffff'};border:none;border-radius:4px;font-size:13px;cursor:pointer;transition:all 0.2s ease;font-weight:500;`;
		applyBtn.onmouseenter = () => (applyBtn.style.opacity = '0.85');
		applyBtn.onmouseleave = () => (applyBtn.style.opacity = '1');
		applyBtn.onclick = async () => {
			const width = widthInput.value.trim();
			const height = heightInput.value.trim();

			if (!width || !height) {
				alert('请输入宽度和高度');
				return;
			}

			if (parseInt(width) < 400 || parseInt(height) < 300) {
				alert('窗口尺寸过小，最小宽度400，最小高度300');
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
				alert('应用失败: ' + error.message);
				applyBtn.textContent = '应用';
				applyBtn.disabled = false;
			}
		};

		inputRow.appendChild(widthLabel);
		inputRow.appendChild(widthInput);
		inputRow.appendChild(heightLabel);
		inputRow.appendChild(heightInput);
		sizeContainer.appendChild(inputRow);
		sizeContainer.appendChild(applyBtn);
		sizeSettings.appendChild(sizeLabel);
		sizeSettings.appendChild(sizeContainer);
		body.appendChild(sizeSettings);

		const settingsItems = [
			{
				text: '插件管理',
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
			itemDiv.style.cssText = `padding:12px 16px;background:${colors.itemBg};border:1px solid ${colors.modalBorder};border-radius:6px;cursor:pointer;transition:all 0.2s ease;font-size:14px;`;
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

	overlay.onclick = (e) => {
		if (e.target === overlay) overlay.remove();
	};

	const escHandler = (e) => {
		if (e.key === 'Escape') {
			overlay.remove();
			document.removeEventListener('keydown', escHandler);
		}
	};
	document.addEventListener('keydown', escHandler);
}
