/**
 * HTML Renderer - HTML 预览渲染器
 */

class HTMLRenderer {
	constructor() {
		this.previewWindow = null;
		this.previewFrame = null;
	}

	// 渲染 HTML 预览
	async renderHTML(projectManager, editor) {
		if (!projectManager.currentProject) {
			eda.sys_Message.showToastMessage('请先创建或打开一个项目', 'warn', 2);
			return;
		}

		// 查找 HTML 文件
		const htmlFiles = projectManager.currentProject.files.filter((f) => f.fileName.toLowerCase().endsWith('.html'));

		if (htmlFiles.length === 0) {
			eda.sys_Message.showToastMessage('项目中没有 HTML 文件', 'warn', 2);
			return;
		}

		// 如果有多个 HTML 文件，让用户选择
		let selectedFile;
		if (htmlFiles.length === 1) {
			selectedFile = htmlFiles[0];
		} else {
			const options = {};
			htmlFiles.forEach((f) => {
				options[f.fileName] = f.fileName;
			});

			const result = await Swal.fire({
				title: '选择要预览的 HTML 文件',
				input: 'select',
				inputOptions: options,
				showCancelButton: true,
				confirmButtonText: '预览',
				cancelButtonText: '取消',
			});

			if (!result.isConfirmed) return;
			selectedFile = htmlFiles.find((f) => f.fileName === result.value);
		}

		// 保存当前文件
		if (projectManager.currentFile) {
			await projectManager.saveFileContent(projectManager.currentFile, editor.getValue());
		}

		// 构建完整的 HTML 内容
		const htmlContent = this.buildHTMLContent(selectedFile, projectManager);

		// 显示预览窗口
		this.showPreviewWindow(htmlContent, selectedFile.fileName);
	}

	// 注入 eda 桥接脚本
	injectEdaBridge(html) {
		const bridge = '<script>\n' +
			'(function() {\n' +
			'	var p = window.parent || window.top;\n' +
			'	if (!p || p === window) return;\n' +
			'	var names = Object.getOwnPropertyNames(p);\n' +
			'	for (var i = 0; i < names.length; i++) {\n' +
			'		var k = names[i];\n' +
			'		if (k in window) continue;\n' +
			'		try { window[k] = p[k]; } catch(e) {}\n' +
			'	}\n' +
			'	window.__parent = p;\n' +
			'})();\n' +
			'<\/script>';
		if (/<head[^>]*>/i.test(html)) return html.replace(/(<head[^>]*>)/i, '$1\n' + bridge);
		if (/<body[^>]*>/i.test(html)) return html.replace(/(<body[^>]*>)/i, '$1\n' + bridge);
		return bridge + '\n' + html;
	}

	// 构建完整的 HTML 内容（处理资源引用）
	buildHTMLContent(htmlFile, projectManager) {
		let html = htmlFile.content;

		// 处理 script 标签引用
		html = html.replace(/<script([^>]*)\s+src=["']([^"']+)["']([^>]*)>/gi, (match, preAttrs, src, postAttrs) => {
			// 查找项目中的 JS 文件
			const file = this.findProjectFile(src, projectManager);

			if (file) {
				// 内联 JS 文件内容，移除 src 属性，保留其他属性
				const attrs = (preAttrs + postAttrs).trim();
				return `<script${attrs ? ' ' + attrs : ''}>\n${file.content}\n</script>`;
			}
			// 如果找不到文件，保留原始引用（可能是外部 URL）
			return match;
		});

		// 处理 link 标签引用（CSS）
		html = html.replace(/<link\s+([^>]*href=["']([^"']+\.css)["'][^>]*)>/gi, (match, fullAttrs, href) => {
			// 查找项目中的 CSS 文件
			const file = this.findProjectFile(href, projectManager);

			if (file) {
				// 内联 CSS 文件内容
				return `<style>\n${file.content}\n</style>`;
			}
			// 如果找不到文件，保留原始引用（可能是外部 URL）
			return match;
		});

		return html;
	}

	// 查找项目文件（支持相对路径和绝对路径）
	findProjectFile(path, projectManager) {
		if (!projectManager.currentProject) return null;

		// 移除开头的 ./ 或 /
		const cleanPath = path.replace(/^\.?\//, '');

		// 尝试精确匹配
		let file = projectManager.currentProject.files.find((f) => f.fileName === cleanPath);
		if (file) return file;

		// 尝试只匹配文件名（忽略路径）
		const fileName = cleanPath.split('/').pop();
		file = projectManager.currentProject.files.find((f) => {
			const fName = f.fileName.split('/').pop();
			return fName === fileName;
		});
		if (file) return file;

		// 尝试匹配路径结尾
		file = projectManager.currentProject.files.find((f) => f.fileName.endsWith(cleanPath));
		return file || null;
	}

	// 显示预览窗口
	showPreviewWindow(htmlContent, fileName) {
		// 创建模态框
		const isDark = document.getElementById('theme-dark') && !document.getElementById('theme-dark').disabled;
		const modalBg = isDark ? '#272822' : '#ffffff';
		const modalBorder = isDark ? '#444' : '#d0d7de';
		const textColor = isDark ? '#f8f8f2' : '#24292f';
		const headerBg = isDark ? '#2d2e27' : '#f6f8fa';

		const overlay = document.createElement('div');
		overlay.id = 'html-preview-overlay';
		overlay.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.6);
			display: flex;
			justify-content: center;
			align-items: center;
			z-index: 10000;
			backdrop-filter: blur(2px);
		`;

		const modal = document.createElement('div');
		modal.style.cssText = `
			background: ${modalBg};
			border: 1px solid ${modalBorder};
			border-radius: 8px;
			width: 90%;
			height: 90%;
			max-width: 1400px;
			max-height: 900px;
			display: flex;
			flex-direction: column;
			box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
		`;

		const header = document.createElement('div');
		header.style.cssText = `
			padding: 16px;
			border-bottom: 1px solid ${modalBorder};
			display: flex;
			justify-content: space-between;
			align-items: center;
			background: ${headerBg};
			border-radius: 8px 8px 0 0;
		`;

		const title = document.createElement('div');
		title.textContent = `预览: ${fileName}`;
		title.style.cssText = `
			font-weight: 600;
			font-size: 16px;
			color: ${textColor};
		`;

		const closeBtn = document.createElement('button');
		closeBtn.textContent = '✕';
		closeBtn.style.cssText = `
			background: transparent;
			border: none;
			color: ${textColor};
			cursor: pointer;
			font-size: 20px;
			padding: 4px 8px;
			border-radius: 4px;
			transition: background 0.2s;
		`;
		closeBtn.onmouseenter = () => (closeBtn.style.background = isDark ? '#444' : '#eaeaea');
		closeBtn.onmouseleave = () => (closeBtn.style.background = 'transparent');
		closeBtn.onclick = () => overlay.remove();

		header.appendChild(title);
		header.appendChild(closeBtn);

		const iframeContainer = document.createElement('div');
		iframeContainer.style.cssText = `
			flex: 1;
			overflow: hidden;
			background: #ffffff;
		`;

		const iframe = document.createElement('iframe');
		iframe.style.cssText = `
			width: 100%;
			height: 100%;
			border: none;
		`;
		iframe.sandbox = 'allow-scripts allow-same-origin allow-forms';

		iframeContainer.appendChild(iframe);
		modal.appendChild(header);
		modal.appendChild(iframeContainer);
		overlay.appendChild(modal);
		document.body.appendChild(overlay);

		// 写入 HTML 内容（注入 eda 桥接）
		const bridgedContent = this.injectEdaBridge(htmlContent);
		iframe.contentDocument.open();
		iframe.contentDocument.write(bridgedContent);
		iframe.contentDocument.close();

		// ESC 键关闭
		const escHandler = (e) => {
			if (e.key === 'Escape') {
				overlay.remove();
				document.removeEventListener('keydown', escHandler);
			}
		};
		document.addEventListener('keydown', escHandler);
	}
}

// 全局实例
window.htmlRenderer = new HTMLRenderer();
