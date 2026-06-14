/**
 * Left Navigation Panel - 左侧导航面板管理
 * 管理三个视图：所有项目、项目设计、常用代码
 */

class LeftNavPanel {
	constructor(editor) {
		this.editor = editor;
		this.currentView = 'all-projects'; // 'all-projects', 'project-design', 'common-code'
		this.projects = [];
		this.selectedProjectId = null;
		this.sidebarExpanded = false;
		this._activeBuiltInProjectId = null;
		this.init();
	}

		_shouldClosePanelOnRender() {
			try {
				var v = eda.sys_Storage.getExtensionUserConfig("close_panel_on_render");
				return v === true || v === "true";
			} catch (e) { return true; }
		}

	_shouldRenderBuiltInSeparately() {
		try {
			var v = eda.sys_Storage.getExtensionUserConfig("builtin_separate_render");
			return v === true || v === "true";
		} catch (e) { return false; }
	}
	// 初始化
	init() {
		this.restoreSidebarState();
		this.attachNavButtonEvents();
		this.attachSearchEvent();
		this.attachCompleterSearchEvent();
		this.attachImportProjectEvent();
		this.attachCloseProjectEvent();
		this.loadProjectList();
	}

	// 恢复侧边栏展开/收起状态（默认收起）
	restoreSidebarState() {
		let saved;
		try { saved = eda.sys_Storage.getExtensionUserConfig('sidebar_expanded'); } catch (e) {}
		this.sidebarExpanded = saved === true || saved === 'true';
		this.applySidebarState();
	}

	// 切换侧边栏展开/收起
	toggleSidebar() {
		this.sidebarExpanded = !this.sidebarExpanded;
		try { eda.sys_Storage.setExtensionUserConfig('sidebar_expanded', this.sidebarExpanded); } catch (e) {}
		this.applySidebarState();
	}

	// 应用侧边栏状态
	applySidebarState() {
		const contentArea = document.getElementById('left-content-area');
		if (contentArea) {
			contentArea.style.display = this.sidebarExpanded ? 'flex' : 'none';
		}
	}

	// 绑定导入项目按钮事件
	attachImportProjectEvent() {
		const btn = document.getElementById('import-project-btn');
		if (btn) {
			btn.addEventListener('click', () => this.importProject());
		}
	}

	attachCloseProjectEvent() {
		const btn = document.getElementById("close-project-btn");
		if (btn) {
			btn.addEventListener("click", () => this.closeCurrentProject());
		}
	}

	// 导入项目（选择文件夹）
	async importProject() {
		const input = document.createElement('input');
		input.type = 'file';
		input.webkitdirectory = true;
		input.style.display = 'none';
		document.body.appendChild(input);

		input.onchange = async (event) => {
			const files = Array.from(event.target.files);
			input.remove();
			if (files.length === 0) return;

			try {
				const firstPath = files[0].webkitRelativePath || '';
				const projectName = firstPath.split('/')[0] || 'ImportedProject';

				// 检查是否存在同名项目
				const allProjects = await window.projectManager.getAllProjects();
				const existing = allProjects.find((p) => p.projectName === projectName);

				let project;
				if (existing) {
					const result = await Swal.fire({
						title: '项目已存在',
						html: `已存在名为 "<strong>${this.escapeHtml(projectName)}</strong>" 的项目，是否覆盖？`,
						icon: 'question',
						showCancelButton: true,
						confirmButtonText: '覆盖',
						cancelButtonText: '取消',
						confirmButtonColor: '#1890ff',
					});
					if (!result.isConfirmed) return;

					project = existing;
					project.files = [];
				} else {
					project = await window.projectManager.createProject(projectName);
					project.files = [];
				}

				for (const file of files) {
					const relativePath = file.webkitRelativePath || file.name;
					const fileName = relativePath.replace(/^[^/]+\//, '');
					if (!fileName) continue;

					const content = await file.text();
					project.files.push({
						fileName,
						content,
						createdAt: new Date().toISOString().split('T')[0],
					});
				}

				await window.projectManager.saveProject(project);
				await this.loadProjectList();
				eda.sys_Message.showToastMessage(`项目 "${projectName}" 导入成功，共 ${project.files.length} 个文件`, 'success', 2);
			} catch (error) {
				eda.sys_Message.showToastMessage('导入失败: ' + error.message, 'error', 3);
			}
		};

		input.click();
	}

	// 绑定导航按钮事件
	attachNavButtonEvents() {
		const navButtons = {
			'nav-all-projects': 'all-projects',
			'nav-project-design': 'project-design',
			'nav-common-code': 'common-code',
		};

		Object.keys(navButtons).forEach((btnId) => {
			const btn = document.getElementById(btnId);
			if (btn) {
				btn.addEventListener('click', () => {
					const view = navButtons[btnId];
					if (this.sidebarExpanded && this.currentView === view) {
						this.toggleSidebar();
					} else {
						if (!this.sidebarExpanded) {
							this.sidebarExpanded = true;
							try { eda.sys_Storage.setExtensionUserConfig('sidebar_expanded', true); } catch (e) {}
							this.applySidebarState();
						}
						this.switchView(view);
					}
				});
			}
		});
	}

	// 绑定搜索事件
	attachSearchEvent() {
		const searchInput = document.getElementById('project-search-input');
		if (searchInput) {
			searchInput.addEventListener('input', (e) => {
				this.filterProjects(e.target.value);
			});
		}
	}

	// 绑定补全搜索事件
	attachCompleterSearchEvent() {
		const searchInput = document.getElementById('completer-search-input');
		if (searchInput) {
			searchInput.addEventListener('input', (e) => {
				this.filterCompleters(e.target.value);
			});
		}
	}

	// 切换视图
	switchView(viewName) {
		// 跳过已弹出的面板
		if (typeof PopoutManager !== "undefined" && PopoutManager._poppedOutPanels[viewName] && PopoutManager._poppedOutPanels[viewName].isOpen) {
			// Still update close button state even when view is popped out
			this._updateCloseProjectButton();
			return;
		}
		this.currentView = viewName;

		// 更新按钮状态
		document.querySelectorAll('.nav-button').forEach((btn) => {
			btn.classList.remove('active');
		});
		const activeBtn = document.getElementById(`nav-${viewName}`);
		if (activeBtn) activeBtn.classList.add('active');

		// 显示/隐藏对应视图
		document.getElementById('project-list-view').style.display = viewName === 'all-projects' ? 'flex' : 'none';
		document.getElementById('file-tree').style.display = viewName === 'project-design' ? 'flex' : 'none';
		document.getElementById('completer-store-view').style.display = viewName === 'common-code' ? 'flex' : 'none';

		// 加载对应视图的内容
		if (viewName === 'all-projects') {
			this.loadProjectList();
			// Notify popout panels to refresh
			if (typeof PopoutManager !== "undefined") PopoutManager.notifyRefresh("all-projects");
		} else if (viewName === 'common-code') {
			this.loadCompleterStore();
		}
		this._updateCloseProjectButton();
	}

	_updateCloseProjectButton() {
		const btn = document.getElementById("close-project-btn");
		if (!btn) return;
		btn.style.display = (window.projectManager.currentProject && !window.projectManager.currentProject.isBuiltIn) ? "flex" : "none";
	}

	closeCurrentProject() {
		if (!window.projectManager.currentProject) return;

		// Dirty check
		if (window.fileTreeUI && window.fileTreeUI._isFileModified && window.fileTreeUI._isFileModified()) {
			Swal.fire({
				title: "未保存的更改",
				html: "当前文件 <strong>" + (window.projectManager.currentFile || "") + "</strong> 有未保存的更改，是否保存？",
				icon: "warning",
				showDenyButton: true,
				showCancelButton: true,
				confirmButtonText: "保存",
				denyButtonText: "不保存",
				cancelButtonText: "取消",
			}).then(async (result) => {
				if (result.isConfirmed) {
					await window.projectManager.saveFileContent(window.projectManager.currentFile, this.editor.getValue());
					window.projectManager._savedContent = this.editor.getValue();
					if (window.fileTreeUI) window.fileTreeUI._dirty = false;
					this._doCloseProject();
				} else if (result.isDenied) {
					this._doCloseProject();
				}
			});
			return;
		}
		this._doCloseProject();
	}

	_doCloseProject() {
		window.projectManager.currentProject = null;
		window.projectManager.currentFile = null;
		this.editor.setValue("", -1);

		// Close project-design popout if it belongs to this project
		if (typeof PopoutManager !== "undefined" && PopoutManager._poppedOutPanels["project-design"]) {
			try { eda.sys_MessageBus.publishPublic("popout-close-project", {}); } catch (e) {}
			try { eda.sys_IFrame.closeIFrame("popout-project-design"); } catch (e) {}
			PopoutManager.restorePanel("project-design");
		}

		if (this._activeBuiltInProjectId) this.closeBuiltInProject();
		if (window.projectCompleter) window.projectCompleter.clear();
		if (typeof TabManager !== "undefined") { try { TabManager.closeAll(); } catch (e) {} }

		this._updateCloseProjectButton();
		this.switchView("project-design");
		eda.sys_Message.showToastMessage("项目已关闭", "success", 1);
	}

	// 获取内置项目列表
	getBuiltInProjects() {
		const manifest = window.extManifest || [];
		return manifest.map((p, idx) => {
			const files = p.files || [];
			const entryFile = files.find(f => /^index\.html?$/i.test(f.fileName)) || files[0];
			return {
				id: `builtin_${idx}`,
				projectName: p.projectName,
				files: files,
				entryFile: entryFile ? entryFile.fileName : null,
				isBuiltIn: true,
				createdAt: p.createdAt,
				updatedAt: p.updatedAt,
			};
		});
	}

	// 加载项目列表
	async loadProjectList() {
		try {
			const userProjects = await window.projectManager.getAllProjects();
			const builtInProjects = this.getBuiltInProjects();
			this.projects = [...builtInProjects, ...userProjects];
			this.renderProjectList(this.projects);
		} catch (error) {
			console.error('Failed to load projects:', error);
		}
	}

	// 渲染项目列表
	renderProjectList(projects) {
		const container = document.getElementById('project-list-content');
		if (!container) return;

		if (projects.length === 0) {
			container.innerHTML = `
				<div class="project-list-empty">
					<p>📁</p>
					<p>还没有项目</p>
					<p>点击"文件 > 新建项目"创建</p>
				</div>
			`;
			return;
		}

		let html = '';

		// 分组：内置项目和用户项目
		const builtInProjects = projects.filter((p) => p.isBuiltIn);
		const userProjects = projects.filter((p) => !p.isBuiltIn);

		// 渲染内置项目
		if (builtInProjects.length > 0) {
			html += '<div class="project-section-title">内置项目</div>';
			builtInProjects.forEach((project) => {
				const isSelected = this.selectedProjectId === project.id;
				const isRunning = this._activeBuiltInProjectId === project.id;
				html += `
					<div class="project-item ${isSelected ? 'selected' : ''} ${isRunning ? 'builtin-running' : ''}" data-project-id="${project.id}" data-is-builtin="true">
						<div class="project-item-name">
							<span class="project-builtin-badge">内置</span>
								<span class="builtin-running-label"></span>
							${this.escapeHtml(project.projectName)}
						</div>
						<div class="project-item-info">
							<span>${project.files.length} 文件</span>
						</div>
					</div>
				`;
			});
		}

		// 渲染用户项目
		if (userProjects.length > 0) {
			html += '<div class="project-section-title">我的项目</div>';
			userProjects.forEach((project) => {
					const date = new Date(project.updatedAt).toLocaleDateString('zh-CN');
					const isSelected = this.selectedProjectId === project.id;
					const isScript = !!(project.files && project.files.length === 1 && /.js$/i.test(project.files[0].fileName) && project.isScript);
					if (isScript) {
						html += '<div class="project-item script-item ' + (isSelected ? 'selected' : '') + '" data-project-id="' + project.id + '" data-is-script="true">';
						html += '<div class="project-item-name"><span class="project-builtin-badge" style="background:var(--eext-brand);">脚本</span>' + this.escapeHtml(project.projectName) + '</div>';
						html += '<div class="project-item-info"><span>脚本</span><span>' + date + '</span></div>';
						html += '</div>';
					} else {
						html += '<div class="project-item ' + (isSelected ? 'selected' : '') + '" data-project-id="' + project.id + '">';
						html += '<div class="project-item-name"><span class="project-builtin-badge" style="background:var(--eext-brand);">项目</span>' + this.escapeHtml(project.projectName) + '</div>';
						html += '<div class="project-item-info"><span>' + project.files.length + ' 文件</span><span>' + date + '</span></div>';
						html += '</div>';
					}
				});
		}

		container.innerHTML = html;
		this.attachProjectItemEvents();
	}

	// 绑定项目项事件
	attachProjectItemEvents() {
		const items = document.querySelectorAll('.project-item');
		items.forEach((item) => {
			const rawId = item.dataset.projectId;
			const isBuiltIn = item.dataset.isBuiltin === 'true';
			const projectId = isBuiltIn ? rawId : parseInt(rawId);

			// 单击：内置项目切换渲染，用户项目选中
			item.addEventListener("click", async () => {
				if (isBuiltIn) {
					if (this._activeBuiltInProjectId === projectId) {
						this.closeBuiltInProject();
					} else {
						var shouldClose = this._shouldClosePanelOnRender();
						if (shouldClose && this.sidebarExpanded) this.toggleSidebar();
						await this.openBuiltInProject(projectId);
					}
				} else if (item.dataset.isScript === "true") {
					if (this.sidebarExpanded) this.toggleSidebar();
					await this.openScriptProject(projectId);
				} else {
					this.selectProject(projectId);
				}
			});

			// 双击：用户项目打开
			item.addEventListener('dblclick', async () => {
				if (!isBuiltIn && item.dataset.isScript !== "true") await this.openProject(projectId);
			});

			// 右键菜单
			item.addEventListener('contextmenu', (e) => {
				e.preventDefault();
				this.selectProject(projectId);
				if (isBuiltIn) {
					this.showBuiltInProjectContextMenu(e, projectId);
				} else {
					this.showProjectContextMenu(e, projectId);
				}
			});
		});
	}

	// 显示项目右键菜单
	showProjectContextMenu(event, projectId) {
		const existingMenu = document.getElementById('project-context-menu');
		if (existingMenu) existingMenu.remove();

		const isDark = document.body.classList.contains('dark-theme');
		const menuBg = isDark ? '#404040' : '#fff';
		const menuBorder = isDark ? '#222' : '#d9d9d9';
		const textColor = isDark ? '#e5e5e5' : '#333';
		const hoverBg = isDark ? '#6283a2' : '#e6f7ff';

		const menu = document.createElement('div');
		menu.id = 'project-context-menu';
		menu.style.cssText = `
			position: fixed;
			z-index: 10000;
			background: ${menuBg};
			border: 1px solid ${menuBorder};
			box-shadow: 2px 2px 8px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)'};
			border-radius: 4px;
			padding: 4px 0;
			min-width: 120px;
		`;

			var isScriptProj = !!this.projects.find(function(p) { return p.id === projectId && p.isScript; });
			var menuItems;
			if (isScriptProj) {
				menuItems = [
					{ text: '打开', action: () => this.openScriptProject(projectId) },
					{ text: '重命名', action: () => this.showRenameProjectDialog(projectId) },
					{ text: '导出', action: () => this.exportScriptAsJs(projectId) },
					{ text: '---', action: null },
					{ text: '映射到顶部菜单', action: () => Project_SaveToBtnList(projectId) },
					{ text: '保存为插件', action: () => ExtStore_SavePlugin(this.editor, true) },
					{ text: '---', action: null },
					{ text: '删除', action: () => this.showDeleteProjectConfirm(projectId) },
				];
			} else {
				menuItems = [
					{ text: '打开', action: () => this.openProject(projectId) },
					{ text: '重命名', action: () => this.showRenameProjectDialog(projectId) },
					{ text: '导出', action: () => this.exportProjectAsZip(projectId) },
					{ text: '---', action: null },
					{ text: '映射到顶部菜单', action: () => Project_SaveToBtnList(projectId) },
					{ text: '---', action: null },
					{ text: '删除', action: () => this.showDeleteProjectConfirm(projectId) },
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
			menuItem.style.cssText = `padding:8px 16px;cursor:pointer;color:${textColor};user-select:none;transition:background 0.2s;`;
			
			menuItem.onmouseenter = () => (menuItem.style.backgroundColor = hoverBg);
			menuItem.onmouseleave = () => (menuItem.style.backgroundColor = '');
			menuItem.onclick = () => {
				menu.remove();
				if (item.action) item.action();
			};
			menu.appendChild(menuItem);
		});

		let left = event.clientX;
		let top = event.clientY;
		document.body.appendChild(menu);
		if (left + menu.offsetWidth > window.innerWidth) left = window.innerWidth - menu.offsetWidth - 5;
		if (top + menu.offsetHeight > window.innerHeight) top = window.innerHeight - menu.offsetHeight - 5;
		menu.style.left = `${left}px`;
		menu.style.top = `${top}px`;

		const closeMenu = (e) => {
			if (!menu.contains(e.target)) {
				menu.remove();
				document.removeEventListener('click', closeMenu);
			}
		};
		setTimeout(() => document.addEventListener('click', closeMenu), 10);
	}

	// 重命名项目对话框
	async showRenameProjectDialog(projectId) {
		const project = this.projects.find((p) => p.id === projectId);
		if (!project) return;

		const result = await Swal.fire({
			title: '重命名项目',
			input: 'text',
			inputValue: project.projectName,
			inputLabel: '新项目名称',
			showCancelButton: true,
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			inputValidator: (value) => {
				if (!value) return '请输入项目名称';
				if (value.length < 2) return '项目名称至少2个字符';
				if (value === project.projectName) return '名称未改变';
			},
		});

		if (result.isConfirmed) {
			try {
				await window.projectManager.renameProject(projectId, result.value);
				await this.loadProjectList();

				if (window.projectManager.currentProject && window.projectManager.currentProject.id === projectId) {
					if (window.fileTreeUI) await window.fileTreeUI.render();
				}

				eda.sys_Message.showToastMessage('项目重命名成功', 'success', 2);
			} catch (error) {
				eda.sys_Message.showToastMessage('重命名失败: ' + error.message, 'error', 3);
			}
		}
	}

	// 删除项目确认
	async showDeleteProjectConfirm(projectId) {
		const project = this.projects.find((p) => p.id === projectId);
		if (!project) return;

		const message = `确定要删除项目 "${project.projectName}" 吗？\n\n这将删除项目中的 ${project.files.length} 个文件。\n\n此操作不可恢复！`;

		eda.sys_Dialog.showConfirmationMessage(
			message,
			'确认删除',
			'确认删除',
			'取消',
			async (confirmed) => {
				if (!confirmed) return;

				try {
					await window.projectManager.deleteProject(projectId);

					if (window.projectManager.currentProject && window.projectManager.currentProject.id === projectId) {
						window.projectManager.currentProject = null;
						window.projectManager.currentFile = null;
						this.editor.setValue('', -1);

						if (window.projectCompleter) window.projectCompleter.clear();
						if (window.fileTreeUI) await window.fileTreeUI.render();
					}

					await this.loadProjectList();
					eda.sys_Message.showToastMessage('项目删除成功', 'success', 2);
				} catch (error) {
					eda.sys_Message.showToastMessage('删除失败: ' + error.message, 'error', 3);
				}
			}
		);
	}

	// 选中项目
	selectProject(projectId) {
		this.selectedProjectId = projectId;
		document.querySelectorAll('.project-item').forEach((item) => {
			item.classList.remove('selected');
			if (parseInt(item.dataset.projectId) === projectId) {
				item.classList.add('selected');
			}
		});
	}

		// 打开项目 — 仅显示文件树，由用户选择文件
		async openProject(projectId) {
			if (this._activeBuiltInProjectId && !this._shouldRenderBuiltInSeparately()) this.closeBuiltInProject();
			try {
				// 脏检查：当前文件未保存则提示
				if (window.fileTreeUI && window.fileTreeUI._isFileModified && window.fileTreeUI._isFileModified()) {
					var result = await Swal.fire({
						title: "未保存的更改",
						html: "当前文件 <strong>" + (window.projectManager.currentFile || "") + "</strong> 有未保存的更改，是否保存？",
						icon: "warning",
						showDenyButton: true,
						showCancelButton: true,
						confirmButtonText: "保存",
						denyButtonText: "不保存",
						cancelButtonText: "取消",
					});
					if (result.isConfirmed) {
						await window.projectManager.saveFileContent(window.projectManager.currentFile, this.editor.getValue());
						window.projectManager._savedContent = this.editor.getValue();
						if (window.fileTreeUI) window.fileTreeUI._dirty = false;
					} else if (result.isDenied) {
					} else { return; }
				}

				// 如果是已打开的项目，只刷新文件树
				if (window.projectManager.currentProject && window.projectManager.currentProject.id === projectId) {
					if (window.fileTreeUI) {
						window.fileTreeUI = new FileTreeUI("file-tree", this.editor);
						await window.fileTreeUI.render();
					}
					this.switchView("project-design");
					return;
				}

				if (window.projectCompleter) window.projectCompleter.clear();
				var project = await window.projectManager.loadProject(projectId);
				window.projectManager.currentProject = project;
				window.projectManager.currentFile = null;
				this.editor.setReadOnly(false);

				window.fileTreeUI = new FileTreeUI("file-tree", this.editor);
				await window.fileTreeUI.render();

				if (window.projectCompleter) window.projectCompleter.updateFiles();
				this.switchView("project-design");
				// Notify popout panels to refresh
				if (typeof PopoutManager !== "undefined") PopoutManager.notifyRefresh("project-design", { projectId: projectId });
				eda.sys_Message.showToastMessage("项目已打开，请在文件树中选择文件", "success", 2);
			} catch (error) {
				// IDB 连接关闭错误来自残留 iframe 实例的重复调用，不可操作，静默忽略
				if (!error.message || !error.message.includes('database connection is closed')) {
					eda.sys_Message.showToastMessage("项目加载失败: " + error.message, "error", 3);
				}
			}
		}

		// 打开脚本项目 — 直接加载唯一 JS 文件
		async openScriptProject(projectId) {
			if (this._activeBuiltInProjectId && !this._shouldRenderBuiltInSeparately()) this.closeBuiltInProject();
			try {
				// 如果是当前已打开的项目，直接返回
				if (window.projectManager.currentProject && window.projectManager.currentProject.id === projectId) {
					if (typeof TabManager !== "undefined" && window.projectManager.currentFile) TabManager.render();
					return;
				}

				// 脏检查
				if (window.fileTreeUI && window.fileTreeUI._isFileModified && window.fileTreeUI._isFileModified()) {
					var result = await Swal.fire({
						title: "未保存的更改",
						html: "当前文件 <strong>" + (window.projectManager.currentFile || "") + "</strong> 有未保存的更改，是否保存？",
						icon: "warning",
						showDenyButton: true,
						showCancelButton: true,
						confirmButtonText: "保存",
						denyButtonText: "不保存",
						cancelButtonText: "取消",
					});
					if (result.isConfirmed) {
						await window.projectManager.saveFileContent(window.projectManager.currentFile, this.editor.getValue());
						window.projectManager._savedContent = this.editor.getValue();
					if (window.fileTreeUI) window.fileTreeUI._dirty = false;
				} else if (result.isDenied) {
				} else { return; }
			}

			if (window.projectCompleter) window.projectCompleter.clear();
			var project = await window.projectManager.loadProject(projectId);
			window.projectManager.currentProject = project;
			this.editor.setReadOnly(false);

			if (project.files.length > 0) {
					var file = project.files[0];
					this.editor.setValue(file.content, -1);
					window.projectManager._savedContent = file.content;
					window.projectManager.currentFile = file.fileName;
					if (typeof TabManager !== "undefined") TabManager.open(project.id, file.fileName, file.fileName.split("/").pop());
					if (window.fileTreeUI && window.fileTreeUI._registerDirtyListener) window.fileTreeUI._registerDirtyListener();
				}

				this.switchView("all-projects");
				if (window.fileTreeUI) await window.fileTreeUI.render();
				eda.sys_Message.showToastMessage("脚本已打开", "success", 2);
			} catch (error) {
				if (!error.message || !error.message.includes("database connection is closed")) { eda.sys_Message.showToastMessage("打开脚本失败: " + error.message, "error", 3); }
			}
		}

	// 关闭内置项目渲染
	closeBuiltInProject() {
		if (!this._activeBuiltInProjectId) return;

		if (this._builtInPopupId) {
			try { eda.sys_IFrame.closeIFrame(this._builtInPopupId); } catch (e) {}
			this._builtInPopupId = null;
		}

		const previewContainer = document.getElementById("html-preview-container");
		const editorDiv = document.getElementById("editor");
		const previewFrame = document.getElementById("html-preview-frame");

		if (previewContainer) previewContainer.classList.remove("active");
		if (editorDiv) editorDiv.style.display = "block";
		if (previewFrame) previewFrame.src = "about:blank";

		this._activeBuiltInProjectId = null;
		try { eda.sys_Storage.setExtensionUserConfig("__active_builtin_project", ""); } catch (e) {}
		this.loadProjectList();
	}

	// 打开内置项目 — 单独渲染，不影响项目设计
	async openBuiltInProject(builtInId) {
		if (this._activeBuiltInProjectId) this.closeBuiltInProject();
		try {
			const project = this.projects.find((p) => p.id === builtInId);
			if (!project) {
				eda.sys_Message.showToastMessage("内置项目不存在", "error", 2);
				return;
			}

			const entryFileName = project.entryFile || (project.files[0] && project.files[0].fileName);
			const entryFile = project.files.find(f => f.fileName === entryFileName);
			if (!entryFile) {
				eda.sys_Message.showToastMessage("未找到可打开的页面", "warn", 2);
				return;
			}

			// Build HTML — temporarily set project for file resolution
			var prevProject = window.projectManager.currentProject;
			var prevFile = window.projectManager.currentFile;
			window.projectManager.currentProject = project;
			window.projectManager.currentFile = entryFile.fileName;
			const builtHTML = window.htmlRenderer
				? window.htmlRenderer.buildHTMLContent(entryFile, window.projectManager)
				: entryFile.content;
			window.projectManager.currentProject = prevProject;
			window.projectManager.currentFile = prevFile;
			const finalHTML = typeof injectEdaBridge === "function" ? injectEdaBridge(builtHTML) : builtHTML;
			const blob = new Blob([finalHTML], { type: "text/html" });
			const url = URL.createObjectURL(blob);

			if (this._shouldRenderBuiltInSeparately()) {
				URL.revokeObjectURL(url);
				this._builtInPopupId = "builtin-render-" + Date.now();
				if (typeof previewHtmlInPopupWindow === "function") {
					await previewHtmlInPopupWindow({ projectName: project.projectName, entryFile: entryFile.fileName, content: finalHTML, windowId: this._builtInPopupId, onClose: function() { if (window.leftNavPanel) { window.leftNavPanel._activeBuiltInProjectId = null; try { eda.sys_Storage.setExtensionUserConfig("__active_builtin_project", ""); } catch (e) {} window.leftNavPanel.loadProjectList(); if (typeof PopoutManager !== "undefined") PopoutManager.notifyRefresh("all-projects"); } } });
				} else {
					eda.sys_Message.showToastMessage("previewHtmlInPopupWindow 未定义", "error", 2);
					return;
				}
			} else {
				const editorDiv = document.getElementById("editor");
				const previewContainer = document.getElementById("html-preview-container");
				const previewFrame = document.getElementById("html-preview-frame");
				if (editorDiv) editorDiv.style.display = "none";
				if (previewContainer) previewContainer.classList.add("active");
				if (previewFrame) {
					previewFrame.src = url;
					previewFrame.addEventListener("load", () => URL.revokeObjectURL(url), { once: true });
				}
			}

			this._activeBuiltInProjectId = builtInId;
			try { eda.sys_Storage.setExtensionUserConfig("__active_builtin_project", builtInId); } catch (e) {}
			this.loadProjectList();
			if (typeof PopoutManager !== "undefined") PopoutManager.notifyRefresh("all-projects");
			eda.sys_Message.showToastMessage("内置项目 " + project.projectName + " 已打开", "success", 2);
		} catch (error) {
			if (!error.message || !error.message.includes("database connection is closed")) { eda.sys_Message.showToastMessage("打开内置项目失败: " + error.message, "error", 3); }
		}
	}
	// 内置项目右键菜单
	showBuiltInProjectContextMenu(event, builtInId) {
		const existingMenu = document.getElementById('project-context-menu');
		if (existingMenu) existingMenu.remove();

		const isDark = document.body.classList.contains('dark-theme');
		const menuBg = isDark ? '#404040' : '#fff';
		const menuBorder = isDark ? '#222' : '#d9d9d9';
		const textColor = isDark ? '#e5e5e5' : '#333';
		const hoverBg = isDark ? '#6283a2' : '#e6f7ff';

		const menu = document.createElement('div');
		menu.id = 'project-context-menu';
		menu.style.cssText = `
			position: fixed;
			z-index: 10000;
			background: ${menuBg};
			border: 1px solid ${menuBorder};
			box-shadow: 2px 2px 8px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)'};
			border-radius: 4px;
			padding: 4px 0;
			min-width: 120px;
		`;

		const menuItems = [
			{ text: '打开项目（只读）', action: () => this.openBuiltInProject(builtInId) },
		];

		menuItems.forEach((item) => {
			const menuItem = document.createElement('div');
			menuItem.textContent = item.text;
			menuItem.style.cssText = `padding:8px 16px;cursor:pointer;color:${textColor};user-select:none;transition:background 0.2s;`;
			menuItem.onmouseenter = () => (menuItem.style.backgroundColor = hoverBg);
			menuItem.onmouseleave = () => (menuItem.style.backgroundColor = '');
			menuItem.onclick = () => {
				menu.remove();
				if (item.action) item.action();
			};
			menu.appendChild(menuItem);
		});

		let left = event.clientX;
		let top = event.clientY;
		document.body.appendChild(menu);
		if (left + menu.offsetWidth > window.innerWidth) left = window.innerWidth - menu.offsetWidth - 5;
		if (top + menu.offsetHeight > window.innerHeight) top = window.innerHeight - menu.offsetHeight - 5;
		menu.style.left = `${left}px`;
		menu.style.top = `${top}px`;

		const closeMenu = (e) => {
			if (!menu.contains(e.target)) {
				menu.remove();
				document.removeEventListener('click', closeMenu);
			}
		};
		setTimeout(() => document.addEventListener('click', closeMenu), 10);
	}

	// 过滤项目
	filterProjects(searchText) {
		const filtered = this.projects.filter((p) => p.projectName.toLowerCase().includes(searchText.toLowerCase()));
		this.renderProjectList(filtered);
	}

	// 加载补全仓库
	async loadCompleterStore() {
		try {
			// 获取 edcode 数据
			const edcodeData = window.edcode || [];

			// 获取用户自定义补全
			const userCompleters = await this.getCompleterStoreData();

			// 存储原始数据用于搜索
			this.edcodeData = edcodeData;
			this.userCompleters = userCompleters;

			this.renderCompleterStore(edcodeData, userCompleters);
		} catch (error) {
			console.error('Failed to load completer store:', error);
		}
	}

	// 过滤补全项
	filterCompleters(searchText) {
		const filtered = {
			edcode: this.edcodeData.filter((item) => {
				const searchLower = searchText.toLowerCase();
				return (
					(item.methodPath && item.methodPath.toLowerCase().includes(searchLower)) ||
					(item.description && item.description.toLowerCase().includes(searchLower))
				);
			}),
			user: this.userCompleters.filter((item) => {
				const searchLower = searchText.toLowerCase();
				const caption = item.caption || '';
				const value = item.value || '';
				return caption.toLowerCase().includes(searchLower) || value.toLowerCase().includes(searchLower);
			}),
		};

		this.renderCompleterStore(filtered.edcode, filtered.user);
	}

	// 从 IndexedDB 获取补全仓库数据
	async getCompleterStoreData() {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open('UserCompleterStore', 1);

			request.onerror = () => reject(request.error);

			request.onsuccess = () => {
				const db = request.result;

				// 检查数据库是否有 completions 表
				if (!db.objectStoreNames.contains('completions')) {
					resolve([]);
					db.close();
					return;
				}

				const transaction = db.transaction(['completions'], 'readonly');
				const store = transaction.objectStore('completions');
				const getAllRequest = store.getAll();

				getAllRequest.onsuccess = () => {
					resolve(getAllRequest.result || []);
					db.close();
				};

				getAllRequest.onerror = () => {
					reject(getAllRequest.error);
					db.close();
				};
			};

			request.onupgradeneeded = (event) => {
				const db = event.target.result;
				// 创建 completions 表（与 Completer_Store.js 保持一致）
				if (!db.objectStoreNames.contains('completions')) {
					const store = db.createObjectStore('completions', { keyPath: 'id', autoIncrement: true });
					store.createIndex('caption', 'caption', { unique: true });
				}
			};
		});
	}

	// 删除补全项
	async deleteCompleter(completerId) {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open('UserCompleterStore', 1);

			request.onerror = () => reject(request.error);

			request.onsuccess = () => {
				const db = request.result;

				// 检查使用哪个表名
				if (!db.objectStoreNames.contains('completions')) {
					reject(new Error('Completer store not found'));
					db.close();
					return;
				}

				const transaction = db.transaction(['completions'], 'readwrite');
				const store = transaction.objectStore('completions');
				const deleteRequest = store.delete(completerId);

				deleteRequest.onsuccess = () => {
					resolve();
					db.close();
				};

				deleteRequest.onerror = () => {
					reject(deleteRequest.error);
					db.close();
				};
			};
		});
	}

	// 渲染补全仓库（使用虚拟滚动优化性能）
	renderCompleterStore(edcodeData, userCompleters) {
		const container = document.getElementById('completer-list-content');
		if (!container) return;

		if (edcodeData.length === 0 && userCompleters.length === 0) {
			container.innerHTML = `
				<div class="project-list-empty">
					<p>常用代码为空</p>
					<p>在编辑器中添加自定义补全</p>
				</div>
			`;
			return;
		}

		// 准备所有数据项
		this.allCompleterItems = [];

		// 添加 edcode 库
		if (edcodeData.length > 0) {
			this.allCompleterItems.push({ type: 'section-title', text: 'EDA 代码库' });
			edcodeData.forEach((item) => {
				this.allCompleterItems.push({ type: 'edcode', data: item });
			});
		}

		// 添加用户自定义补全
		if (userCompleters.length > 0) {
			this.allCompleterItems.push({ type: 'section-title', text: '自定义补全' });
			userCompleters.forEach((completer) => {
				this.allCompleterItems.push({ type: 'user', data: completer });
			});
		}

		// 初始化虚拟滚动
		this.initVirtualScroll(container);
	}

	// 初始化虚拟滚动
	initVirtualScroll(container) {
		const ITEM_HEIGHT = 52;
		const TITLE_HEIGHT = 30;
		const BUFFER = 10;
		const items = this.allCompleterItems;

		container.innerHTML = '';

		const totalHeight = items.reduce((h, item) => h + (item.type === 'section-title' ? TITLE_HEIGHT : ITEM_HEIGHT), 0);

		const spacer = document.createElement('div');
		spacer.style.height = totalHeight + 'px';
		spacer.style.position = 'relative';
		container.appendChild(spacer);

		// 预计算每项的 top 偏移
		const offsets = [];
		let offset = 0;
		for (let i = 0; i < items.length; i++) {
			offsets.push(offset);
			offset += items[i].type === 'section-title' ? TITLE_HEIGHT : ITEM_HEIGHT;
		}

		const renderedNodes = new Map();

		const renderVisible = () => {
			const scrollTop = container.scrollTop;
			const viewHeight = container.clientHeight;
			const startY = scrollTop;
			const endY = scrollTop + viewHeight;

			// 二分查找起始索引
			let lo = 0,
				hi = items.length - 1;
			while (lo < hi) {
				const mid = (lo + hi) >> 1;
				const itemBottom = offsets[mid] + (items[mid].type === 'section-title' ? TITLE_HEIGHT : ITEM_HEIGHT);
				if (itemBottom < startY) lo = mid + 1;
				else hi = mid;
			}
			const startIdx = Math.max(0, lo - BUFFER);
			let endIdx = lo;
			while (endIdx < items.length && offsets[endIdx] < endY) endIdx++;
			endIdx = Math.min(items.length - 1, endIdx + BUFFER);

			// 移除不可见的节点
			const visibleSet = new Set();
			for (let i = startIdx; i <= endIdx; i++) visibleSet.add(i);
			for (const [idx, node] of renderedNodes) {
				if (!visibleSet.has(idx)) {
					node.remove();
					renderedNodes.delete(idx);
				}
			}

			// 渲染可见节点
			for (let i = startIdx; i <= endIdx; i++) {
				if (renderedNodes.has(i)) continue;
				const item = items[i];
				let el;
				if (item.type === 'section-title') {
					el = document.createElement('div');
					el.className = 'completer-section-title';
					el.textContent = item.text;
					el.style.height = TITLE_HEIGHT + 'px';
				} else {
					el = this.createCompleterItemElement(item);
					el.style.height = ITEM_HEIGHT + 'px';
				}
				el.style.position = 'absolute';
				el.style.top = offsets[i] + 'px';
				el.style.left = '0';
				el.style.right = '0';
				el.style.boxSizing = 'border-box';
				spacer.appendChild(el);
				renderedNodes.set(i, el);
			}
		};

		// 清理旧的滚动监听
		if (this._vsScrollHandler) {
			container.removeEventListener('scroll', this._vsScrollHandler);
		}

		let rafId = null;
		this._vsScrollHandler = () => {
			if (rafId) return;
			rafId = requestAnimationFrame(() => {
				rafId = null;
				renderVisible();
			});
		};
		container.addEventListener('scroll', this._vsScrollHandler);
		renderVisible();
	}

	// 创建单个补全项 DOM 元素
	createCompleterItemElement(item) {
		const el = document.createElement('div');
		el.className = 'completer-item';

		if (item.type === 'edcode') {
			const data = item.data;
			const methodPath = data.methodPath || '';
			const description = data.description || '';
			const params = data.methodParams || [];

			let signature = methodPath;
			if (params.length > 0) {
				const paramStr = params.map((p) => p.name || p).join(', ');
				signature = `${methodPath}(${paramStr})`;
			} else if (!data.isEnumMember && !data.isEnum) {
				signature = `${methodPath}()`;
			}

			el.dataset.type = 'edcode';
			el.dataset.methodPath = methodPath;

			const nameDiv = document.createElement('div');
			nameDiv.className = 'completer-item-name';
			nameDiv.textContent = signature;
			el.appendChild(nameDiv);

			const valueDiv = document.createElement('div');
			valueDiv.className = 'completer-item-value';
			valueDiv.textContent = description;
			el.appendChild(valueDiv);

			el.addEventListener('click', () => {
				this.insertEdcodeMethod(methodPath);
			});
		} else if (item.type === 'user') {
			const data = item.data;
			const caption = data.caption || '';
			const value = data.value || '';
			const description = data.description || '';

			el.dataset.type = 'user';
			el.dataset.completerId = data.id;

			const header = document.createElement('div');
			header.className = 'completer-item-header';

			const nameDiv = document.createElement('div');
			nameDiv.className = 'completer-item-name';
			nameDiv.textContent = caption;
			header.appendChild(nameDiv);

			const delBtn = document.createElement('button');
			delBtn.className = 'completer-delete-btn';
			delBtn.textContent = '×';
			delBtn.title = '删除';
			delBtn.addEventListener('click', async (e) => {
				e.stopPropagation();
				await this.showDeleteCompleterConfirm(data.id);
			});
			header.appendChild(delBtn);
			el.appendChild(header);

			const valueDiv = document.createElement('div');
			valueDiv.className = 'completer-item-value';
			valueDiv.textContent = description || value;
			el.appendChild(valueDiv);

			el.addEventListener('click', () => {
				this.insertCompleter(data.id);
			});
		}

		return el;
	}

	// 绑定补全项事件
	attachCompleterItemEvents() {
		const items = document.querySelectorAll('.completer-item');
		items.forEach((item) => {
			// 点击补全项插入到编辑器
			item.addEventListener('click', (e) => {
				// 如果点击的是删除按钮，不触发插入
				if (e.target.classList.contains('completer-delete-btn')) {
					return;
				}

				const type = item.dataset.type;
				if (type === 'edcode') {
					const methodPath = item.dataset.methodPath;
					this.insertEdcodeMethod(methodPath);
				} else if (type === 'user') {
					const completerId = parseInt(item.dataset.completerId);
					this.insertCompleter(completerId);
				}
			});
		});

		// 绑定删除按钮事件（仅用户自定义补全）
		const deleteButtons = document.querySelectorAll('.completer-delete-btn');
		deleteButtons.forEach((btn) => {
			btn.addEventListener('click', async (e) => {
				e.stopPropagation();
				const completerId = parseInt(btn.dataset.completerId);
				await this.showDeleteCompleterConfirm(completerId);
			});
		});
	}

	// 插入 edcode 方法到编辑器
	insertEdcodeMethod(methodPath) {
		if (!methodPath) return;

		try {
			const cursor = this.editor.getCursorPosition();
			this.editor.session.insert(cursor, methodPath);
			eda.sys_Message.showToastMessage('已插入: ' + methodPath, 'success', 1);
		} catch (error) {
			eda.sys_Message.showToastMessage('插入失败: ' + error.message, 'error', 2);
		}
	}

	// 显示删除补全确认
	async showDeleteCompleterConfirm(completerId) {
		const completers = await this.getCompleterStoreData();
		const completer = completers.find((c) => c.id === completerId);

		if (!completer) return;

		const result = await Swal.fire({
			title: '确认删除',
			html: `确定要删除补全 "<strong>${this.escapeHtml(completer.name)}</strong>" 吗？`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: '删除',
			cancelButtonText: '取消',
			confirmButtonColor: '#1890ff',
		});

		if (result.isConfirmed) {
			try {
				await this.deleteCompleter(completerId);
				await this.loadCompleterStore();
				eda.sys_Message.showToastMessage('补全删除成功', 'success', 2);
			} catch (error) {
				eda.sys_Message.showToastMessage('删除失败: ' + error.message, 'error', 2);
			}
		}
	}

	// 插入补全到编辑器
	async insertCompleter(completerId) {
		try {
			const completers = await this.getCompleterStoreData();
			const completer = completers.find((c) => c.id === completerId);

			if (completer && completer.value) {
				const cursor = this.editor.getCursorPosition();
				this.editor.session.insert(cursor, completer.value);
				eda.sys_Message.showToastMessage('已插入: ' + (completer.caption || completer.value), 'success', 1);
			}
		} catch (error) {
			eda.sys_Message.showToastMessage('插入失败: ' + error.message, 'error', 2);
		}
	}

	// 刷新当前视图
	async refresh() {
		if (this.currentView === 'all-projects') {
			await this.loadProjectList();
		} else if (this.currentView === 'project-design') {
			if (window.fileTreeUI) {
				await window.fileTreeUI.render();
			}
		} else if (this.currentView === 'common-code') {
			await this.loadCompleterStore();
		}
	}

	// 导出项目为 ZIP 文件
	async exportProjectAsZip(projectId) {
		try {
			const project = await window.projectManager.loadProjectById(projectId);
			if (!project) {
				eda.sys_Message.showToastMessage('项目不存在', 'error', 2);
				return;
			}
			if (project.files.length === 0) {
				eda.sys_Message.showToastMessage('项目中没有文件', 'warn', 2);
				return;
			}

			const zip = new JSZip();
			const folder = zip.folder(project.projectName);
			project.files.forEach((file) => {
				folder.file(file.fileName, file.content || '');
			});

			const blob = await zip.generateAsync({ type: 'blob' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = `${project.projectName}.zip`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);

			eda.sys_Message.showToastMessage(`项目 "${project.projectName}" 已导出`, 'success', 2);
		} catch (error) {
			eda.sys_Message.showToastMessage('导出失败: ' + error.message, 'error', 3);
		}
	}
	// 导出脚本为 JS 文件
	async exportScriptAsJs(projectId) {
		try {
			const project = await window.projectManager.loadProjectById(projectId);
			if (!project) {
				eda.sys_Message.showToastMessage('项目不存在', 'error', 2);
				return;
			}
			if (!project.isScript || project.files.length === 0) {
				eda.sys_Message.showToastMessage('脚本文件不存在', 'warn', 2);
				return;
			}

			const scriptFile = project.files[0];
			const content = scriptFile.content || '';
			const filename = project.projectName + '.js';

			const blob = new Blob([content], { type: 'application/javascript;charset=utf-8' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');
			link.href = url;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(url);

			eda.sys_Message.showToastMessage('脚本 "' + project.projectName + '" 已导出', 'success', 2);
		} catch (error) {
			eda.sys_Message.showToastMessage('导出失败: ' + error.message, 'error', 3);
		}
	}


	// HTML 转义
	escapeHtml(text) {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}
}

// 全局实例
window.leftNavPanel = null;
