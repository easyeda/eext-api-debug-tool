import * as extensionConfig from '../extension.json';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function activate(status?: 'onStartupFinished', arg?: string): void {
	// Write marker to storage for debugging
	try {
		eda.sys_Storage.setExtensionUserConfig('__activate_status', status || 'undefined');
	} catch (_) {}

	if (status !== 'onStartupFinished') return;

	let spaces = (globalThis as any)._EXTAPI_SCRIPT_SPACES_;
	if (!spaces) return;
	let mySpace = spaces[eda.extensionUuid];
	if (!mySpace) return;

	// Execute auto-start plugins via hidden iframe
	try {
		let configs = eda.sys_Storage.getExtensionAllUserConfigs();
		if (!configs || typeof configs === 'string') return;
		let raw = configs.autoStartPlugins;
		if (!raw || typeof raw !== 'string') return;

		// Store pending plugins for the hidden iframe to execute
		mySpace.eda.sys_Storage.setExtensionUserConfig('__pending_autostart', raw);

		mySpace.eda.sys_IFrame.openIFrame('/iframe/auto-start.html', 1, 1, 'eext-autostart', {
			title: '',
			maximizeButton: false,
			minimizeButton: false,
		});
		setTimeout(() => {
			try {
				mySpace.eda.sys_IFrame.hideIFrame('eext-autostart');
			} catch (_) {}
		}, 500);
	} catch (e) {
		console.error('[AutoStart] Failed:', e);
	}
}

export function about(): void {
	eda.sys_Dialog.showInformationMessage(
		eda.sys_I18n.text('EasyEDA Debug Tool v', undefined, undefined, extensionConfig.version),
		eda.sys_I18n.text('About'),
	);
}
export async function openScriptTool(): void {
	const width = await eda.sys_Storage.getExtensionUserConfig('UI_width');
	const height = await eda.sys_Storage.getExtensionUserConfig('UI_height');
	try {
		eda.sys_Storage.setExtensionUserConfig('version', extensionConfig.version);
	} catch (e) {}

	let _closing = false;
	eda.sys_IFrame.openIFrame('iframe/main/index.html', parseInt(width || '1200', 10), parseInt(height || '500', 10), 'ScriptTool', {
		maximizeButton: true,
		minimizeButton: true,
		onBeforeCloseCallFn: () => {
			if (_closing) return true;
			setTimeout(() => {
				try {
					const hasDirty = eda.sys_Storage.getExtensionUserConfig('__has_dirty');
					if (hasDirty === 'true') {
						eda.sys_Dialog.showConfirmationMessage('有未保存的文件，确定关闭窗口？', '关闭确认', '确定', '取消', (confirmed: boolean) => {
							if (confirmed) {
								_closing = true;
								eda.sys_IFrame.closeIFrame('ScriptTool');
							}
						});
						return;
					}
				} catch (e) {}
				_closing = true;
				eda.sys_IFrame.closeIFrame('ScriptTool');
			}, 50);
			return false;
		},
	});
}
