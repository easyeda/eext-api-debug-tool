/**
 * File Tree UI - 文件树界面管理（支持多级目录和多选）
 */

class FileTreeUI {
	constructor(containerId, editor) {
		this.container = document.getElementById(containerId);
		this.editor = editor;
		this.projectManager = window.projectManager;
		this.expandedFolders = new Set();
		this.selectedItems = new Set(); // 存储选中的文件/文件夹路径
		this.lastSelectedItem = null; // 用于 Shift 多选
	this._dirty = false;
	}

	// 获取文件图标
	getFileIcon(fileName) {
		const ext = fileName.split('.').pop().toLowerCase();
		const icons = {
			js: '📜',
			html: '🌐',
			css: '🎨',
			json: '📋',
			md: '📝',
			txt: '📄',
			png: '🖼️',
			jpg: '🖼️',
			svg: '🎭',
			xml: '📰',
			ts: '📘',
		};
		return icons[ext] || '📄';
	}

	// 解析文件路径为树结构
	buildFileTree(files) {
		const tree = { name: '', children: {}, files: [] };

		// 过滤掉 .gitkeep 文件
		const filteredFiles = files.filter((f) => !f.fileName.endsWith('.gitkeep'));

		filteredFiles.forEach((file) => {
			const parts = file.fileName.split('/');
			let current = tree;

			for (let i = 0; i < parts.length - 1; i++) {
				const folder = parts[i];
				if (!current.children[folder]) {
					current.children[folder] = { name: folder, children: {}, files: [] };
				}
				current = current.children[folder];
			}

			current.files.push(file);
		});

		return tree;
	}

	// 渲染文件树节点
	renderTreeNode(node, path = '', level = 0) {
		let html = '';

		// 渲染子文件夹
		Object.keys(node.children)
			.sort()
			.forEach((folderName) => {
				const folderPath = path ? `${path}/${folderName}` : folderName;
				const isExpanded = this.expandedFolders.has(folderPath);
				const isSelected = this.selectedItems.has(folderPath);
				const indent = level * 16;

				html += `
				<div class="file-tree-folder ${isSelected ? 'selected' : ''}" data-path="${this.escapeHtml(folderPath)}" data-type="folder" style="padding-left: ${indent}px;">
					<span class="folder-toggle">${isExpanded ? '▼' : '▶'}</span>
					<span class="folder-icon">📁</span>
					<span class="folder-name">${this.escapeHtml(folderName)}</span>
				</div>
			`;

				if (isExpanded) {
					html += this.renderTreeNode(node.children[folderName], folderPath, level + 1);
				}
			});

		// 渲染文件
		node.files
			.sort((a, b) => a.fileName.localeCompare(b.fileName))
			.forEach((file) => {
				const isActive = this.projectManager.currentFile === file.fileName;
				const isSelected = this.selectedItems.has(file.fileName);
				const indent = level * 16;
				const displayName = file.fileName.split('/').pop();
				const isModified = isActive && this._isFileModified();

				html += `
				<div class="file-tree-item ${isActive ? 'active' : ''} ${isSelected ? 'selected' : ''}" data-filename="${this.escapeHtml(file.fileName)}" data-type="file" style="padding-left: ${indent}px;">
					<span class="file-icon">${this.getFileIcon(displayName)}</span>
					<span class="file-name">${this.escapeHtml(displayName)}${isModified ? ' <span style="color:var(--eext-warning);">*</span>' : ''}</span>
				</div>
			`;
			});

		return html;
	}

	// 渲染文件树
	async render() {
		// 应用主题
		this.applyTheme();

		if (!this.projectManager.currentProject) {
			this.container.innerHTML = `
				<div class="file-tree-empty">
					<p>${I18N.t('noProjectOpen')}</p>
					<p>${I18N.t('clickFileNewToCreate')}</p>
				</div>
			`;
			return;
		}

		const project = this.projectManager.currentProject;
		const tree = this.buildFileTree(project.files);

		let html = `
			<div class="file-tree-header">
				<span class="project-name">${this.escapeHtml(project.projectName)}</span>
			</div>
			<div class="file-tree-list" id="file-tree-list">
				${this.renderTreeNode(tree)}
			</div>
		`;

		this.container.innerHTML = html;
		this.attachEvents();
	}

	// 应用主题
	applyTheme() {
		const isDark = document.body.classList.contains('dark-theme');
		if (isDark) {
			this.container.classList.add('dark');
			this.container.classList.remove('light');
		} else {
			this.container.classList.add('light');
			this.container.classList.remove('dark');
		}
	}

	// 绑定事件
	attachEvents() {
		// 文件夹展开/收起
		this.container.querySelectorAll('.file-tree-folder').forEach((folder) => {
				// 点击文件夹：选中并切换展开/折叠状态
				folder.addEventListener('click', (e) => {
					const path = folder.dataset.path;
					// 选中文件夹
					this.handleItemClick(e, path, 'folder');
					// 同时切换展开/折叠状态
					if (this.expandedFolders.has(path)) {
						this.expandedFolders.delete(path);
					} else {
						this.expandedFolders.add(path);
					}
					this.render();
				});

				// 文件夹右键菜单
				folder.addEventListener('contextmenu', (e) => {
					e.preventDefault();
					const path = folder.dataset.path;
					// 如果右键的项目未被选中，则只选中它
					if (!this.selectedItems.has(path)) {
						this.selectedItems.clear();
						this.selectedItems.add(path);
						this.render();
					}
					this.showContextMenu(e, path, 'folder');
				});
			});

		// 文件项点击
		this.container.querySelectorAll('.file-tree-item').forEach((item) => {
			item.addEventListener('click', (e) => {
				this.handleItemClick(e, item.dataset.filename, 'file');
			});

			// 文件右键菜单
			item.addEventListener('contextmenu', (e) => {
				e.preventDefault();
				const fileName = item.dataset.filename;
				// 如果右键的项目未被选中，则只选中它
				if (!this.selectedItems.has(fileName)) {
					this.selectedItems.clear();
					this.selectedItems.add(fileName);
					this.render();
				}
				this.showContextMenu(e, fileName, 'file');
			});
		});

		// 文件树列表空白区域右键菜单
		const fileTreeList = this.container.querySelector('#file-tree-list');
		if (fileTreeList) {
			fileTreeList.addEventListener('contextmenu', (e) => {
				// 检查是否点击在空白区域
				if (e.target === fileTreeList || e.target.classList.contains('file-tree-list')) {
					e.preventDefault();
					this.showContextMenu(e, '', 'blank');
				}
			});

			// 点击空白区域取消选择
			fileTreeList.addEventListener('click', (e) => {
				if (e.target === fileTreeList || e.target.classList.contains('file-tree-list')) {
					this.selectedItems.clear();
					this.render();
				}
			});
		}
	}

	// 处理项目点击（支持多选）
	handleItemClick(event, itemPath, itemType) {
		if (itemType === 'file' && !event.ctrlKey && !event.shiftKey && !event.metaKey) {
			// 单击文件且没有按修饰键：加载文件
			this.loadFile(itemPath);
			this.selectedItems.clear();
			this.selectedItems.add(itemPath);
			this.lastSelectedItem = itemPath;
		} else if (event.ctrlKey || event.metaKey) {
			// Ctrl/Cmd + 点击：切换选择状态
			if (this.selectedItems.has(itemPath)) {
				this.selectedItems.delete(itemPath);
			} else {
				this.selectedItems.add(itemPath);
			}
			this.lastSelectedItem = itemPath;
		} else if (event.shiftKey && this.lastSelectedItem) {
			// Shift + 点击：范围选择
			this.selectRange(this.lastSelectedItem, itemPath);
		} else {
			// 其他情况：单选
			this.selectedItems.clear();
			this.selectedItems.add(itemPath);
			this.lastSelectedItem = itemPath;
		}

		this.render();
	}

	// 范围选择
	selectRange(start, end) {
		const allItems = this.getAllItemsInOrder();
		const startIndex = allItems.indexOf(start);
		const endIndex = allItems.indexOf(end);

		if (startIndex === -1 || endIndex === -1) return;

		const [min, max] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];

		for (let i = min; i <= max; i++) {
			this.selectedItems.add(allItems[i]);
		}
	}

	// 获取所有项目的有序列表
	getAllItemsInOrder() {
		const items = [];
		const traverse = (node, path = '') => {
			// 添加文件夹
			Object.keys(node.children)
				.sort()
				.forEach((folderName) => {
					const folderPath = path ? `${path}/${folderName}` : folderName;
					items.push(folderPath);
					if (this.expandedFolders.has(folderPath)) {
						traverse(node.children[folderName], folderPath);
					}
				});

			// 添加文件
			node.files
				.sort((a, b) => a.fileName.localeCompare(b.fileName))
				.forEach((file) => {
					items.push(file.fileName);
				});
		};

		if (this.projectManager.currentProject) {
			const tree = this.buildFileTree(this.projectManager.currentProject.files);
			traverse(tree);
		}

		return items;
	}

		// 加载文件到编辑器
		async loadFile(fileName, skipDirtyCheck) {
			// 如果文件已打开且是当前文件，直接返回，防止重复打开
			if (fileName === this.projectManager.currentFile) return;

			var isBuiltIn = this.projectManager.currentProject && this.projectManager.currentProject.isBuiltIn;

			// 检查当前文件是否有未保存修改
			if (!skipDirtyCheck && this._isFileModified()) {
				var result = await Swal.fire({
					title: I18N.t("unsavedChanges"),
					html: "The current file <strong>" + (this.projectManager.currentFile || "") + "</strong> has unsaved changes. Save it?",
					icon: "warning",
					showDenyButton: true,
					showCancelButton: true,
					confirmButtonText: "Save",
					denyButtonText: I18N.t("dontSave"),
					cancelButtonText: "Cancel",
				});
				if (result.isConfirmed) {
					await window.projectManager.saveFileContent(this.projectManager.currentFile, this.editor.getValue());
					window.projectManager._savedContent = this.editor.getValue();
				} else if (result.isDenied) {
					// 不保存，继续
				} else {
					return; // 取消，不切换文件
				}
			}

			// 清理旧文件注册的脏监听器
			if (this._dirtyListener) {
				this.editor.session.off("change", this._dirtyListener);
				this._dirtyListener = null;
			}

			// 加载新文件
			var content = this.projectManager.getFileContent(fileName);
			this.editor.setValue(content, -1);
			this.editor.clearSelection();
			this.projectManager.currentFile = fileName;
			this.projectManager._savedContent = content;
			this.editor.setReadOnly(!!isBuiltIn);
			this._dirty = false;

			// 添加到标签栏
			if (typeof TabManager !== "undefined") TabManager.open(window.projectManager.currentProject ? window.projectManager.currentProject.id : null, fileName, fileName.split("/").pop());

			// 根据文件类型设置编辑器模式
			this.setEditorMode(fileName);

			// 根据文件类型更新运行按钮文本
			var ext = fileName.split(".").pop().toLowerCase();
			var runBtn = document.getElementById("run-btn");
			if (runBtn) runBtn.textContent = (ext === "md" || ext === "markdown") ? I18N.t('previewLabel') : I18N.t('runText');

			// 注册脏标记监听器（用户编辑时触发）
			this._registerDirtyListener();

			// 更新UI
			this.render();
		}

		// 注册脏标记监听器 — 使用 on+off 代替 once 确保兼容性
		_registerDirtyListener() {
			if (this._dirtyListener) {
				this.editor.session.off("change", this._dirtyListener);
				this._dirtyListener = null;
			}
			var self = this;
			this._dirtyListener = function() {
				if (self._dirtyListener !== null) {
					self.editor.session.off("change", self._dirtyListener);
					self._dirtyListener = null;
				}
				if (self.projectManager.currentFile) {
					self._dirty = true;
					if (typeof TabManager !== "undefined") TabManager.markDirty(window.projectManager.currentProject ? window.projectManager.currentProject.id : null, self.projectManager.currentFile, true);
					self.render();
				}
			};
			this.editor.session.on("change", this._dirtyListener);
		}


	// 设置编辑器模式
	setEditorMode(fileName) {
		const ext = fileName.split('.').pop().toLowerCase();
		const modeMap = {
			js: 'ace/mode/javascript',
			html: 'ace/mode/html',
			css: 'ace/mode/css',
			json: 'ace/mode/json',
			xml: 'ace/mode/xml',
			md: 'ace/mode/markdown',
			ts: 'ace/mode/typescript',
		};

		const mode = modeMap[ext] || 'ace/mode/javascript';
		this.editor.session.setMode(mode);

		// 如果是 HTML 模式，确保项目补全器已启用
		if (ext === 'html' && window.projectCompleter) {
			window.projectCompleter.updateFiles();
		}
	}

	// 显示右键菜单
	showContextMenu(event, target, type) {
		// 移除已存在的菜单
		const existingMenu = document.getElementById('file-tree-context-menu');
		if (existingMenu) existingMenu.remove();

		const isDark = document.body.classList.contains('dark-theme');
		const menuBg = isDark ? '#404040' : '#fff';
		const menuBorder = isDark ? '#222' : '#d9d9d9';
		const textColor = isDark ? '#e5e5e5' : '#333';
		const hoverBg = isDark ? '#6283a2' : '#e6f7ff';

		const menu = document.createElement('div');
		menu.id = 'file-tree-context-menu';
		menu.style.cssText = `
			position: fixed;
			z-index: 10000;
			background: ${menuBg};
			border: 1px solid ${menuBorder};
			box-shadow: 2px 2px 8px rgba(0,0,0,0.3);
			border-radius: 4px;
			padding: 4px 0;
			min-width: 150px;
		`;

		let menuItems = [];

		// 内置项目不显示编辑菜单
		if (this.projectManager.currentProject && this.projectManager.currentProject.isBuiltIn) {
			return;
		}

		if (type === 'file') {
			// 文件右键菜单
			const selectedCount = this.selectedItems.size;
			if (selectedCount > 1) {
				menuItems = [{ text: I18N.format('deleteItems', selectedCount), action: () => this.showBatchDeleteConfirm() }];
			} else {
				menuItems = [
					{ text: I18N.t('rename'), action: () => this.showRenameDialog(target) },
					{ text: I18N.t('delete'), action: () => this.showDeleteConfirm(target) },
				];
				const fileExt = target.split(".").pop().toLowerCase();
				if (fileExt === "html") {
					menuItems.push({ text: "---", action: null });
					menuItems.push({ text: I18N.t('popupPreview'), action: () => this.popupPreviewHtml(target) });
				}
			}
		} else if (type === 'folder') {
			// 文件夹右键菜单
			const selectedCount = this.selectedItems.size;
			if (selectedCount > 1) {
				menuItems = [{ text: I18N.format('deleteItems', selectedCount), action: () => this.showBatchDeleteConfirm() }];
			} else {
				menuItems = [
					{ text: I18N.t('newFileDialog'), action: () => this.showAddFileDialog(target) },
					{ text: I18N.t('newFolder'), action: () => this.showAddFolderDialog(target) },
					{ text: '---', action: null },
					{ text: I18N.t('deleteFolder'), action: () => this.showDeleteFolderConfirm(target) },
				];
			}
		} else if (type === 'blank') {
			// 空白区域右键菜单（根目录）
			menuItems = [
				{ text: I18N.t('newFileDialog'), action: () => this.showAddFileDialog('') },
				{ text: I18N.t('newFolder'), action: () => this.showAddFolderDialog('') },
			];
		}

		menuItems.forEach((item) => {
			if (item.text === '---') {
				const separator = document.createElement('div');
				separator.style.cssText = `height:1px;background:${menuBorder};margin:4px 0;`;
				menu.appendChild(separator);
				return;
			}

			const menuItem = document.createElement('div');
			menuItem.textContent = item.text;
			menuItem.style.cssText = `
				padding: 8px 16px;
				cursor: pointer;
				color: ${textColor};
				user-select: none;
				transition: background 0.2s;
			`;
			menuItem.onmouseenter = () => (menuItem.style.backgroundColor = hoverBg);
			menuItem.onmouseleave = () => (menuItem.style.backgroundColor = '');
			menuItem.onclick = () => {
				menu.remove();
				if (item.action) item.action();
			};
			menu.appendChild(menuItem);
		});

		menu.style.left = `${event.clientX}px`;
		menu.style.top = `${event.clientY}px`;

		document.body.appendChild(menu);

		// 点击其他地方关闭菜单
		const closeMenu = (e) => {
			if (!menu.contains(e.target)) {
				menu.remove();
				document.removeEventListener('click', closeMenu);
			}
		};
		setTimeout(() => document.addEventListener('click', closeMenu), 10);
	}

	// 显示添加文件夹对话框
	async showAddFolderDialog(basePath = '') {
		const placeholder = basePath ? `e.g.: ${basePath}/components` : 'e.g.: src or src/components';
		const result = await Swal.fire({
			title: I18N.t('newFolder'),
			input: 'text',
			inputLabel: 'Folder path',
			inputPlaceholder: placeholder,
			showCancelButton: true,
			confirmButtonText: I18N.t('create'),
			cancelButtonText: I18N.t('cancel'),
			inputValidator: (value) => {
				if (!value) return I18N.t('enterFolderPath');
				if (/[<>:"|?*]/.test(value)) return I18N.t('folderNameInvalid');
			},
		});

		if (result.isConfirmed) {
			// 文件夹路径记录到 expandedFolders，不创建 .gitkeep 文件
			let folderPath = result.value.replace(/\\/g, '/').replace(/\/$/, '');
			if (basePath) {
				folderPath = `${basePath}/${folderPath}`;
			}

			// 只展开文件夹，不创建任何文件
			this.expandedFolders.add(folderPath);

			await this.render();
			eda.sys_Message.showToastMessage(I18N.t('folderCreated'), 'success', 2);
		}
	}

	// 显示添加文件对话框
	async showAddFileDialog(basePath = '') {
		const placeholder = basePath ? `e.g.: ${basePath}/app.js` : 'e.g.: index.html or src/app.js';
		const result = await Swal.fire({
			title: I18N.t('newFileDialog'),
			input: 'text',
			inputLabel: 'File path',
			inputPlaceholder: placeholder,
			showCancelButton: true,
			confirmButtonText: I18N.t('create'),
			cancelButtonText: I18N.t('cancel'),
			inputValidator: (value) => {
				if (!value) return I18N.t('enterFileName');
				if (!/\.[a-zA-Z0-9]+$/.test(value)) return I18N.t('fileNameNeedsExt');
				if (/[<>:"|?*]/.test(value)) return I18N.t('fileNameInvalid');
				const fullPath = basePath ? `${basePath}/${value}` : value;
				const exists = this.projectManager.currentProject.files.some((f) => f.fileName === fullPath);
				if (exists) return I18N.t('fileAlreadyExists');
			},
		});

		if (result.isConfirmed) {
			let fileName = result.value.replace(/\\/g, '/');
			if (basePath) {
				fileName = `${basePath}/${fileName}`;
			}
			await this.projectManager.addFile(fileName);

			// 展开父文件夹
			const parts = fileName.split('/');
			if (parts.length > 1) {
				let path = '';
				for (let i = 0; i < parts.length - 1; i++) {
					path = path ? `${path}/${parts[i]}` : parts[i];
					this.expandedFolders.add(path);
				}
			}

			// 更新项目补全器
			if (window.projectCompleter) {
				window.projectCompleter.updateFiles();
			}

			await this.render();
			eda.sys_Message.showToastMessage(I18N.t('fileCreated'), 'success', 2);
		}
	}

	// 显示重命名对话框
	async showRenameDialog(oldName) {
		const result = await Swal.fire({
			title: 'Rename File',
			input: 'text',
			inputValue: oldName,
			inputLabel: 'New file path',
			showCancelButton: true,
			confirmButtonText: I18N.t('rename'),
			cancelButtonText: I18N.t('cancel'),
			inputValidator: (value) => {
				if (!value) return I18N.t('enterFileName');
				if (!/.[a-zA-Z0-9]+$/.test(value)) return I18N.t('fileNameNeedsExt');
				if (value === oldName) return I18N.t('fileNameUnchanged');
				if (/[<>:"|?*]/.test(value)) return I18N.t('fileNameInvalid');
				const exists = this.projectManager.currentProject.files.some((f) => f.fileName === value);
				if (exists) return I18N.t('fileAlreadyExists');
			},
		});

		if (result.isConfirmed) {
			await this.projectManager.renameFile(oldName, result.value);
			if (this.projectManager.currentFile === oldName) {
				this.projectManager.currentFile = result.value;
			}

			// 更新 TabManager 中的文件名
			if (typeof TabManager !== 'undefined' && this.projectManager.currentProject) {
				TabManager.updateFileName(
					this.projectManager.currentProject.id,
					oldName,
					result.value,
					result.value.split('/').pop()
				);
			}
			// 更新项目补全器
			if (window.projectCompleter) {
				window.projectCompleter.updateFiles();
			}

			await this.render();
			eda.sys_Message.showToastMessage(I18N.t('fileRenamed'), 'success', 2);
		}
	}

	// 显示删除确认
	async showDeleteConfirm(fileName) {
		const result = await Swal.fire({
			title: I18N.t('confirmDelete'),
			text: `Delete file "${fileName}"?`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: I18N.t('delete'),
			cancelButtonText: I18N.t('cancel'),
			confirmButtonColor: '#1890ff',
		});

		if (result.isConfirmed) {
			await this.projectManager.deleteFile(fileName);
			if (this.projectManager.currentFile === fileName) {
				this.projectManager.currentFile = null;
				this.editor.setValue('', -1);
			}

			// 更新项目补全器
			if (window.projectCompleter) {
				window.projectCompleter.updateFiles();
			}

			await this.render();
			eda.sys_Message.showToastMessage(I18N.t('fileDeleted'), 'success', 2);
		}
	}

	// 弹出预览HTML文件
	async popupPreviewHtml(fileName) {
		const project = this.projectManager.currentProject;
		if (!project) {
			eda.sys_Message.showToastMessage(I18N.t('noProjectOpen'), 'warn', 2);
			return;
		}
		if (project.isBuiltIn) {
			eda.sys_Message.showToastMessage(I18N.t('builtinNoPopup'), 'warn', 2);
			return;
		}
		if (!project.files || !Array.isArray(project.files)) {
			eda.sys_Message.showToastMessage(I18N.t('invalidProjectFileList'), 'warn', 2);
			return;
		}
		let htmlFile = project.files.find(f => f.fileName === fileName);
		if (!htmlFile) {
			eda.sys_Message.showToastMessage(I18N.t('fileNotFound'), 'warn', 2);
			return;
		}
		let content;
		const currentFile = this.projectManager.currentFile;
		if (currentFile === fileName) {
			const rawContent = this.editor.getValue();
			content = (window.htmlRenderer) ?
				window.htmlRenderer.buildHTMLContent({ ...htmlFile, content: rawContent }, this.projectManager) :
				rawContent;
		} else {
			content = (window.htmlRenderer) ?
				window.htmlRenderer.buildHTMLContent(htmlFile, this.projectManager) :
				(htmlFile.content || '');
		}
		if (!content || content === undefined) {
			content = htmlFile.content || '';
		}
		const finalContent = (typeof injectEdaBridge === 'function') ? injectEdaBridge(content) : content;
		const data = {
			projectName: project.projectName,
			entryFile: fileName,
			content: finalContent
		};
		previewHtmlInPopupWindow(data);
	}

	// 显示删除文件夹确认
	async showDeleteFolderConfirm(folderPath) {
		// 获取文件夹下的所有文件（包括 .gitkeep）
		const filesInFolder = this.projectManager.currentProject.files.filter((f) => f.fileName.startsWith(folderPath + '/'));

		const result = await Swal.fire({
			title: I18N.t('confirmDeleteFolder'),
			html: `Delete folder "<strong>${folderPath}</strong>"?<br><br>This will delete <strong>${filesInFolder.length}</strong> file(s) inside it.`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: I18N.t('delete'),
			cancelButtonText: I18N.t('cancel'),
			confirmButtonColor: '#1890ff',
		});

		if (result.isConfirmed) {
			// 删除文件夹下的所有文件
			for (const file of filesInFolder) {
				await this.projectManager.deleteFile(file.fileName);
				if (this.projectManager.currentFile === file.fileName) {
					this.projectManager.currentFile = null;
					this.editor.setValue('', -1);
				}
			}

			// 更新项目补全器
			if (window.projectCompleter) {
				window.projectCompleter.updateFiles();
			}

			this.selectedItems.clear();
			await this.render();
			eda.sys_Message.showToastMessage(`Folder deleted (${filesInFolder.length} file(s) removed)`, 'success', 2);
		}
	}

	// 显示批量删除确认
	async showBatchDeleteConfirm() {
		const selectedArray = Array.from(this.selectedItems);
		let totalFiles = 0;
		const filesToDelete = [];

		// 计算要删除的文件总数
		selectedArray.forEach((item) => {
			const isFolder = !this.projectManager.currentProject.files.some((f) => f.fileName === item);
			if (isFolder) {
				// 文件夹：统计其下的所有文件
				const filesInFolder = this.projectManager.currentProject.files.filter((f) => f.fileName.startsWith(item + '/'));
				totalFiles += filesInFolder.length;
				filesToDelete.push(...filesInFolder.map((f) => f.fileName));
			} else {
				// 文件
				totalFiles++;
				filesToDelete.push(item);
			}
		});

		const result = await Swal.fire({
			title: I18N.t('confirmBulkDelete'),
			html: `Delete the <strong>${selectedArray.length}</strong> selected item(s)?<br><br>This will delete <strong>${totalFiles}</strong> file(s).`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: I18N.t('delete'),
			cancelButtonText: I18N.t('cancel'),
			confirmButtonColor: '#1890ff',
		});

		if (result.isConfirmed) {
			// 删除所有文件
			for (const fileName of filesToDelete) {
				await this.projectManager.deleteFile(fileName);
				if (this.projectManager.currentFile === fileName) {
					this.projectManager.currentFile = null;
					this.editor.setValue('', -1);
				}
			}

			// 更新项目补全器
			if (window.projectCompleter) {
				window.projectCompleter.updateFiles();
			}

			this.selectedItems.clear();
			await this.render();
			eda.sys_Message.showToastMessage(`Bulk delete complete (${totalFiles} file(s) removed)`, 'success', 2);
		}
	}


	// 检查当前文件是否有未保存修改
	_isFileModified() {
		if (!this.projectManager.currentFile || this.projectManager._savedContent == null) return false;
		return this.editor.getValue() !== this.projectManager._savedContent;
	}

	// HTML转义
	escapeHtml(text) {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}
}

// 全局实例
window.fileTreeUI = null;
