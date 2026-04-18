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
	eda.sys_Storage.setExtensionUserConfig('version', extensionConfig.version);
	eda.sys_IFrame.openIFrame('iframe/main/index.html', 1200, 500, 'ScriptTool', { maximizeButton: true, minimizeButton: true });
}
