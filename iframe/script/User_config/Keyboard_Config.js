/**
 * 快捷键配置管理
 * 管理编辑器的所有快捷键设置
 */

// 默认快捷键配置
const DEFAULT_SHORTCUTS = {
	run: { win: 'Ctrl+Enter', mac: 'Command+Enter', description: '运行代码' },
	save: { win: 'Ctrl+S', mac: 'Command+S', description: '保存代码' },
	format: { win: 'Ctrl+K', mac: 'Command+K', description: '格式化代码' },
	find: { win: 'Ctrl+F', mac: 'Command+F', description: '查找' },
	replace: { win: 'Ctrl+H', mac: 'Command+H', description: '替换' },
	import: { win: 'Ctrl+O', mac: 'Command+O', description: '导入文件' },
	export: { win: 'Ctrl+E', mac: 'Command+E', description: '导出文件' },
	load: { win: 'Ctrl+L', mac: 'Command+L', description: '加载代码' },
	delete: { win: 'Ctrl+D', mac: 'Command+D', description: '删除代码' },
	saveToList: { win: 'Ctrl+Shift+S', mac: 'Command+Shift+S', description: '保存到快捷按钮' },
	saveAsPlugin: { win: 'Ctrl+Shift+P', mac: 'Command+Shift+P', description: '保存到启动项' },
};

/**
 * 获取当前平台（Windows 或 Mac）
 */
function getPlatform() {
	return navigator.platform.toLowerCase().includes('mac') ? 'mac' : 'win';
}

/**
 * 从 localStorage 加载快捷键配置
 */
async function loadShortcuts() {
	try {
		const saved = await eda.sys_Storage.getExtensionUserConfig('keyboard_shortcuts');
		if (saved) {
			const parsed = JSON.parse(saved);
			return { ...DEFAULT_SHORTCUTS, ...parsed };
		}
	} catch (e) {
		console.error('加载快捷键配置失败:', e);
	}
	return DEFAULT_SHORTCUTS;
}

/**
 * 保存快捷键配置到 localStorage
 */
async function saveShortcuts(shortcuts) {
	try {
		await eda.sys_Storage.setExtensionUserConfig('keyboard_shortcuts', JSON.stringify(shortcuts));
		return true;
	} catch (e) {
		console.error('保存快捷键配置失败:', e);
		return false;
	}
}

/**
 * 重置为默认快捷键
 */
async function resetShortcuts() {
	await eda.sys_Storage.setExtensionUserConfig('keyboard_shortcuts', JSON.stringify(DEFAULT_SHORTCUTS));
	return DEFAULT_SHORTCUTS;
}

/**
 * 解析快捷键字符串为键盘事件匹配条件
 * @param {string} shortcut - 快捷键字符串，如 "Ctrl+S" 或 "Command+Enter"
 * @returns {Object} 包含 ctrl, shift, alt, meta, key 的对象
 */
function parseShortcut(shortcut) {
	const parts = shortcut.split('+').map((p) => p.trim());
	const result = { ctrl: false, shift: false, alt: false, meta: false, key: '' };

	parts.forEach((part) => {
		const lower = part.toLowerCase();
		if (lower === 'ctrl' || lower === 'control') result.ctrl = true;
		else if (lower === 'shift') result.shift = true;
		else if (lower === 'alt') result.alt = true;
		else if (lower === 'command' || lower === 'cmd' || lower === 'meta') result.meta = true;
		else result.key = part;
	});

	return result;
}

/**
 * 检查键盘事件是否匹配快捷键
 */
function matchesShortcut(event, shortcut) {
	const parsed = parseShortcut(shortcut);
	return (
		event.ctrlKey === parsed.ctrl &&
		event.shiftKey === parsed.shift &&
		event.altKey === parsed.alt &&
		event.metaKey === parsed.meta &&
		event.key.toLowerCase() === parsed.key.toLowerCase()
	);
}

/**
 * 显示确认模态框
 * @param {string} title - 标题
 * @param {string} message - 消息内容
 * @param {Function} onConfirm - 确认回调
 * @param {boolean} isDark - 是否为暗色主题
 */
function showConfirmModal(title, message, onConfirm, isDark) {
	const confirmOverlay = document.createElement('div');
	confirmOverlay.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);backdrop-filter:blur(3px);z-index:10002;display:flex;justify-content:center;align-items:center;`;

	const confirmModal = document.createElement('div');
	confirmModal.style.cssText = `background:${isDark ? '#272822' : '#ffffff'};border:1px solid ${isDark ? '#444' : '#d0d7de'};border-radius:8px;width:400px;max-width:90%;box-shadow:0 10px 25px rgba(0,0,0,0.5);color:${isDark ? '#f8f8f2' : '#24292f'};`;

	const confirmHeader = document.createElement('div');
	confirmHeader.style.cssText = `padding:16px 20px;border-bottom:1px solid ${isDark ? '#444' : '#d0d7de'};font-weight:600;font-size:16px;`;
	confirmHeader.textContent = title;

	const confirmBody = document.createElement('div');
	confirmBody.style.cssText = `padding:20px;font-size:14px;line-height:1.6;color:${isDark ? '#a9a9a9' : '#57606a'};`;
	confirmBody.textContent = message;

	const confirmFooter = document.createElement('div');
	confirmFooter.style.cssText = `padding:16px 20px;border-top:1px solid ${isDark ? '#444' : '#d0d7de'};display:flex;justify-content:flex-end;gap:8px;`;

	const cancelBtn = document.createElement('button');
	cancelBtn.textContent = '取消';
	cancelBtn.style.cssText = `padding:8px 16px;background:transparent;color:${isDark ? '#f8f8f2' : '#24292f'};border:1px solid ${isDark ? '#444' : '#d0d7de'};border-radius:4px;cursor:pointer;font-size:14px;transition:all 0.2s;`;
	cancelBtn.onmouseenter = () => (cancelBtn.style.backgroundColor = isDark ? '#333430' : '#f6f8fa');
	cancelBtn.onmouseleave = () => (cancelBtn.style.backgroundColor = 'transparent');
	cancelBtn.onclick = () => confirmOverlay.remove();

	const confirmBtn = document.createElement('button');
	confirmBtn.textContent = '确认';
	confirmBtn.style.cssText = `padding:8px 16px;background:#dc3545;color:#ffffff;border:none;border-radius:4px;cursor:pointer;font-size:14px;font-weight:500;transition:all 0.2s;`;
	confirmBtn.onmouseenter = () => (confirmBtn.style.backgroundColor = '#c82333');
	confirmBtn.onmouseleave = () => (confirmBtn.style.backgroundColor = '#dc3545');
	confirmBtn.onclick = () => {
		confirmOverlay.remove();
		if (onConfirm) onConfirm();
	};

	confirmFooter.appendChild(cancelBtn);
	confirmFooter.appendChild(confirmBtn);
	confirmModal.appendChild(confirmHeader);
	confirmModal.appendChild(confirmBody);
	confirmModal.appendChild(confirmFooter);
	confirmOverlay.appendChild(confirmModal);
	document.body.appendChild(confirmOverlay);

	confirmOverlay.addEventListener('click', (e) => {
		if (e.target === confirmOverlay) confirmOverlay.remove();
	});

	document.addEventListener('keydown', function escHandler(e) {
		if (e.key === 'Escape') {
			confirmOverlay.remove();
			document.removeEventListener('keydown', escHandler);
		}
	});
}

/**
 * 显示快捷键设置模态框
 */
async function showKeyboardShortcutsModal(editor, onClose) {
	const isDark = document.getElementById('theme-dark') && !document.getElementById('theme-dark').disabled;
	const platform = getPlatform();

	let shortcuts = await loadShortcuts();

	// 标记快捷键设置模态框已打开，用于禁用全局快捷键
	window.keyboardShortcutsModalOpen = true;

	const overlay = document.createElement('div');
	overlay.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);backdrop-filter:blur(2px);z-index:10001;display:flex;justify-content:center;align-items:center;`;

	const modal = document.createElement('div');
	modal.style.cssText = `background:${isDark ? '#272822' : '#ffffff'};border:1px solid ${isDark ? '#444' : '#d0d7de'};border-radius:8px;width:600px;max-width:90%;max-height:80vh;box-shadow:0 10px 25px rgba(0,0,0,0.5);display:flex;flex-direction:column;color:${isDark ? '#f8f8f2' : '#24292f'};`;

	const header = document.createElement('div');
	header.style.cssText = `padding:16px 20px;border-bottom:1px solid ${isDark ? '#444' : '#d0d7de'};display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:16px;`;
	header.innerHTML = `<span>快捷键设置</span><button id="keyboard-modal-close" style="background:transparent;border:none;color:${isDark ? '#f8f8f2' : '#24292f'};cursor:pointer;font-size:24px;line-height:1;padding:0;width:24px;height:24px;">×</button>`;

	const body = document.createElement('div');
	body.style.cssText = `padding:20px;overflow-y:auto;flex:1;scrollbar-width:none;-ms-overflow-style:none;`;

	// Hide scrollbar for webkit browsers
	const scrollbarStyle = document.createElement('style');
	scrollbarStyle.textContent = `
		#keyboard-shortcuts-body::-webkit-scrollbar {
			display: none;
		}
	`;
	document.head.appendChild(scrollbarStyle);
	body.id = 'keyboard-shortcuts-body';

	const platformInfo = document.createElement('div');
	platformInfo.style.cssText = `margin-bottom:16px;padding:12px;background:${isDark ? '#333430' : '#f6f8fa'};border-radius:6px;font-size:13px;color:${isDark ? '#75715e' : '#6b7280'};`;
	platformInfo.textContent = `当前平台: ${platform === 'mac' ? 'macOS' : 'Windows'}`;
	body.appendChild(platformInfo);

	const shortcutsList = document.createElement('div');
	shortcutsList.style.cssText = `display:flex;flex-direction:column;gap:12px;`;

	Object.entries(shortcuts).forEach(([key, config]) => {
		const item = document.createElement('div');
		item.style.cssText = `display:flex;justify-content:space-between;align-items:center;padding:12px;background:${isDark ? '#333430' : '#f6f8fa'};border:1px solid ${isDark ? '#444' : '#d0d7de'};border-radius:6px;transition:all 0.2s;`;

		const label = document.createElement('div');
		label.style.cssText = `flex:1;`;
		label.innerHTML = `<div style="font-weight:500;margin-bottom:4px;">${config.description}</div><div style="font-size:12px;color:${isDark ? '#75715e' : '#6b7280'};">${key}</div>`;

		const input = document.createElement('input');
		input.type = 'text';
		input.value = config[platform];
		input.placeholder = '按下快捷键...';
		input.readOnly = true;
		input.style.cssText = `width:180px;padding:8px 12px;background:${isDark ? '#272822' : '#ffffff'};color:${isDark ? '#f8f8f2' : '#24292f'};border:1px solid ${isDark ? '#444' : '#d0d7de'};border-radius:4px;font-size:13px;text-align:center;font-family:monospace;cursor:pointer;user-select:none;`;

		input.addEventListener('focus', () => {
			input.style.borderColor = isDark ? '#66d9ef' : '#0969da';
			input.placeholder = '按下任意键...';
		});

		input.addEventListener('blur', () => {
			input.style.borderColor = isDark ? '#444' : '#d0d7de';
			input.placeholder = '按下快捷键...';
		});

		input.addEventListener('keydown', (e) => {
			e.preventDefault();
			e.stopPropagation();

			const keys = [];
			if (e.ctrlKey) keys.push('Ctrl');
			if (e.shiftKey) keys.push('Shift');
			if (e.altKey) keys.push('Alt');
			if (e.metaKey) keys.push(platform === 'mac' ? 'Command' : 'Meta');

			if (e.key && !['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
				keys.push(e.key === ' ' ? 'Space' : e.key.length === 1 ? e.key.toUpperCase() : e.key);
			}

			if (keys.length > 0) {
				input.value = keys.join('+');
				shortcuts[key][platform] = input.value;
			}
		});

		item.appendChild(label);
		item.appendChild(input);
		shortcutsList.appendChild(item);
	});

	body.appendChild(shortcutsList);

	const footer = document.createElement('div');
	footer.style.cssText = `padding:16px 20px;border-top:1px solid ${isDark ? '#444' : '#d0d7de'};display:flex;justify-content:space-between;gap:12px;`;

	const resetBtn = document.createElement('button');
	resetBtn.textContent = '恢复默认';
	resetBtn.style.cssText = `padding:8px 16px;background:transparent;color:${isDark ? '#f8f8f2' : '#24292f'};border:1px solid ${isDark ? '#444' : '#d0d7de'};border-radius:4px;cursor:pointer;font-size:14px;transition:all 0.2s;`;
	resetBtn.onclick = () => {
		showConfirmModal(
			'确认恢复默认',
			'确定要恢复默认快捷键设置吗？当前的自定义设置将会丢失。',
			async () => {
				shortcuts = await resetShortcuts();
				overlay.remove();
				showKeyboardShortcutsModal(editor, onClose);
			},
			isDark,
		);
	};

	const buttonGroup = document.createElement('div');
	buttonGroup.style.cssText = `display:flex;gap:8px;`;

	const cancelBtn = document.createElement('button');
	cancelBtn.textContent = '取消';
	cancelBtn.style.cssText = `padding:8px 16px;background:transparent;color:${isDark ? '#f8f8f2' : '#24292f'};border:1px solid ${isDark ? '#444' : '#d0d7de'};border-radius:4px;cursor:pointer;font-size:14px;`;
	cancelBtn.onclick = () => {
		window.keyboardShortcutsModalOpen = false;
		overlay.remove();
		if (onClose) onClose();
	};

	const saveBtn = document.createElement('button');
	saveBtn.textContent = '保存';
	saveBtn.style.cssText = `padding:8px 16px;background:${isDark ? '#66d9ef' : '#0969da'};color:#ffffff;border:none;border-radius:4px;cursor:pointer;font-size:14px;font-weight:500;`;
	saveBtn.onclick = async () => {
		const success = await saveShortcuts(shortcuts);
		if (success) {
			eda.sys_Message.showToastMessage('快捷键设置已保存，请重新打开窗口以应用更改', 'success', 3);
			window.keyboardShortcutsModalOpen = false;
			overlay.remove();
			if (onClose) onClose();
		} else {
			eda.sys_Message.showToastMessage('保存失败', 'error', 2);
		}
	};

	buttonGroup.appendChild(cancelBtn);
	buttonGroup.appendChild(saveBtn);
	footer.appendChild(resetBtn);
	footer.appendChild(buttonGroup);

	modal.appendChild(header);
	modal.appendChild(body);
	modal.appendChild(footer);
	overlay.appendChild(modal);
	document.body.appendChild(overlay);

	document.getElementById('keyboard-modal-close').onclick = () => {
		window.keyboardShortcutsModalOpen = false;
		overlay.remove();
		if (onClose) onClose();
	};

	overlay.addEventListener('click', (e) => {
		if (e.target === overlay) {
			window.keyboardShortcutsModalOpen = false;
			overlay.remove();
			if (onClose) onClose();
		}
	});
}
