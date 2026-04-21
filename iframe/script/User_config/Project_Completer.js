/**
 * Project File Completer - 项目文件自动补全
 * 为 HTML 中的 script src 和 link href 提供文件路径补全
 */

class ProjectCompleter {
	constructor(editor) {
		this.editor = editor;
		this.completer = null;
		this.currentFiles = [];
		this.init();
	}

	// 初始化补全器
	init() {
		this.completer = {
			getCompletions: (editor, session, pos, prefix, callback) => {
				// 只在 HTML 模式下启用
				const mode = session.getMode().$id;
				if (!mode.includes('html')) {
					callback(null, []);
					return;
				}

				// 获取当前行内容
				const line = session.getLine(pos.row);
				const beforeCursor = line.substring(0, pos.column);

				// 检查是否在 script src 或 link href 中
				const scriptMatch = beforeCursor.match(/<script[^>]*src=["']([^"']*)$/);
				const linkMatch = beforeCursor.match(/<link[^>]*href=["']([^"']*)$/);

				if (!scriptMatch && !linkMatch) {
					callback(null, []);
					return;
				}

				// 获取当前项目的文件列表
				const files = this.getProjectFiles();

				// 根据类型过滤文件
				let filteredFiles = files;
				if (scriptMatch) {
					// script 标签：只显示 .js 文件
					filteredFiles = files.filter((f) => f.toLowerCase().endsWith('.js'));
				} else if (linkMatch) {
					// link 标签：只显示 .css 文件
					filteredFiles = files.filter((f) => f.toLowerCase().endsWith('.css'));
				}

				// 生成补全项
				const completions = filteredFiles.map((file) => ({
					caption: file,
					value: file,
					meta: this.getFileMeta(file),
					score: 1000,
				}));

				callback(null, completions);
			},
		};

		// 注册补全器
		if (this.editor.completers) {
			this.editor.completers.push(this.completer);
		}
	}

	// 获取项目文件列表
	getProjectFiles() {
		if (!window.projectManager || !window.projectManager.currentProject) {
			return [];
		}

		return window.projectManager.currentProject.files.map((f) => f.fileName).filter((f) => !f.endsWith('.gitkeep')); // 排除 .gitkeep 文件
	}

	// 获取文件类型标签
	getFileMeta(fileName) {
		const ext = fileName.split('.').pop().toLowerCase();
		const metaMap = {
			js: 'JavaScript',
			css: 'CSS',
			json: 'JSON',
			html: 'HTML',
		};
		return metaMap[ext] || 'File';
	}

	// 更新文件列表（当文件添加/删除时调用）
	updateFiles() {
		this.currentFiles = this.getProjectFiles();
	}

	// 清除补全器（切换项目时调用）
	clear() {
		this.currentFiles = [];
	}

	// 移除补全器
	destroy() {
		if (this.editor.completers && this.completer) {
			const index = this.editor.completers.indexOf(this.completer);
			if (index > -1) {
				this.editor.completers.splice(index, 1);
			}
		}
	}
}

// 全局实例
window.projectCompleter = null;
