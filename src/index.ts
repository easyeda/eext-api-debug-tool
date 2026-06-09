import * as extensionConfig from '../extension.json';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function activate(status?: 'onStartupFinished', arg?: string): void {}

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
						eda.sys_Dialog.showConfirmationMessage(
							'有未保存的文件，确定关闭窗口？',
							'关闭确认',
							'确定',
							'取消',
							(confirmed: boolean) => {
								if (confirmed) {
									_closing = true;
									eda.sys_IFrame.closeIFrame('ScriptTool');
								}
							}
						);
						return;
					}
				} catch(e) {}
				_closing = true;
				eda.sys_IFrame.closeIFrame('ScriptTool');
			}, 50);
			return false;
		},
	});
}
