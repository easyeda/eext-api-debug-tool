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
	eda.sys_Storage.setExtensionUserConfig('version', extensionConfig.version);
	eda.sys_IFrame.openIFrame('iframe/main/index.html', parseInt(width || '1200', 10), parseInt(height || '500', 10), 'ScriptTool', {
		maximizeButton: true,
		minimizeButton: true,
	});
}
