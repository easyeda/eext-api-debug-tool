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
		this.init();
	}

	// 初始化
	init() {
		this.restoreSidebarState();
		this.attachNavButtonEvents();
		this.attachSearchEvent();
		this.attachCompleterSearchEvent();
		this.attachImportProjectEvent();
		this.loadProjectList();
	}

	// 恢复侧边栏展开/收起状态（默认收起）
	restoreSidebarState() {
		const saved = eda.sys_Storage.getExtensionUserConfig('sidebar_expanded');
		this.sidebarExpanded = saved === true || saved === 'true';
		this.applySidebarState();
	}

	// 切换侧边栏展开/收起
	toggleSidebar() {
		this.sidebarExpanded = !this.sidebarExpanded;
		eda.sys_Storage.setExtensionUserConfig('sidebar_expanded', this.sidebarExpanded);
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
						confirmButtonColor: '#d33',
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
						createdAt: Date.now(),
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
							eda.sys_Storage.setExtensionUserConfig('sidebar_expanded', true);
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
		this.currentView = viewName;

		// 更新按钮状态
		document.querySelectorAll('.nav-button').forEach((btn) => {
			btn.classList.remove('active');
		});
		document.getElementById(`nav-${viewName}`).classList.add('active');

		// 显示/隐藏对应视图
		document.getElementById('project-list-view').style.display = viewName === 'all-projects' ? 'flex' : 'none';
		document.getElementById('file-tree').style.display = viewName === 'project-design' ? 'flex' : 'none';
		document.getElementById('completer-store-view').style.display = viewName === 'common-code' ? 'flex' : 'none';

		// 加载对应视图的内容
		if (viewName === 'all-projects') {
			this.loadProjectList();
		} else if (viewName === 'common-code') {
			this.loadCompleterStore();
		}
	}

	// 加载项目列表
	async loadProjectList() {
		try {
			this.projects = await window.projectManager.getAllProjects();
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
		projects.forEach((project) => {
			const date = new Date(project.updatedAt).toLocaleDateString('zh-CN');
			const isSelected = this.selectedProjectId === project.id;
			html += `
				<div class="project-item ${isSelected ? 'selected' : ''}" data-project-id="${project.id}">
					<div class="project-item-name">${this.escapeHtml(project.projectName)}</div>
					<div class="project-item-info">
						<span>${project.files.length} 文件</span>
						<span>${date}</span>
					</div>
				</div>
			`;
		});

		container.innerHTML = html;
		this.attachProjectItemEvents();
	}

	// 绑定项目项事件
	attachProjectItemEvents() {
		const items = document.querySelectorAll('.project-item');
		items.forEach((item) => {
			// 单击选中
			item.addEventListener('click', () => {
				const projectId = parseInt(item.dataset.projectId);
				this.selectProject(projectId);
			});

			// 双击打开
			item.addEventListener('dblclick', async () => {
				const projectId = parseInt(item.dataset.projectId);
				await this.openProject(projectId);
			});

			// 右键菜单
			item.addEventListener('contextmenu', (e) => {
				e.preventDefault();
				const projectId = parseInt(item.dataset.projectId);
				this.selectProject(projectId);
				this.showProjectContextMenu(e, projectId);
			});
		});
	}

	// 显示项目右键菜单
	showProjectContextMenu(event, projectId) {
		const existingMenu = document.getElementById('project-context-menu');
		if (existingMenu) existingMenu.remove();

		const isDark = document.getElementById('theme-dark') && !document.getElementById('theme-dark').disabled;
		const menuBg = isDark ? '#2d2e27' : '#ffffff';
		const menuBorder = isDark ? '#444' : '#d0d7de';
		const textColor = isDark ? '#f8f8f2' : '#24292f';
		const hoverBg = isDark ? '#3b3c35' : '#f6f8fa';

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
			{ text: '打开项目', action: () => this.openProject(projectId) },
			{ text: '保存到快捷按钮', action: () => Project_SaveToBtnList(projectId) },
			{ text: '导出项目文件', action: () => this.exportProjectAsZip(projectId) },
			{ text: '重命名', action: () => this.showRenameProjectDialog(projectId) },
			{ text: '---', action: null },
			{ text: '删除项目', action: () => this.showDeleteProjectConfirm(projectId) },
		];

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
			if (item.text === '删除项目') menuItem.style.color = '#d33';
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

		const result = await Swal.fire({
			title: '确认删除',
			html: `确定要删除项目 "<strong>${this.escapeHtml(project.projectName)}</strong>" 吗？<br><br>这将删除项目中的 <strong>${project.files.length}</strong> 个文件。<br><br><span style="color: #d33;">此操作不可恢复！</span>`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: '确认删除',
			cancelButtonText: '取消',
			confirmButtonColor: '#d33',
		});

		if (result.isConfirmed) {
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

	// 打开项目
	async openProject(projectId) {
		try {
			// 保存当前文件
			if (window.projectManager.currentFile) {
				await window.projectManager.saveFileContent(window.projectManager.currentFile, this.editor.getValue());
			}

			// 清除旧项目的补全器
			if (window.projectCompleter) {
				window.projectCompleter.clear();
			}

			// 加载新项目
			const project = await window.projectManager.loadProject(projectId);
			window.fileTreeUI = new FileTreeUI('file-tree', this.editor);
			await window.fileTreeUI.render();

			// 更新项目补全器
			if (window.projectCompleter) {
				window.projectCompleter.updateFiles();
			}

			// 加载第一个文件
			if (project.files.length > 0) {
				const firstFile = project.files[0];
				this.editor.setValue(firstFile.content, -1);
				window.projectManager.currentFile = firstFile.fileName;
			}

			// 自动切换到项目设计视图
			this.switchView('project-design');

			eda.sys_Message.showToastMessage('项目加载成功', 'success', 2);
		} catch (error) {
			eda.sys_Message.showToastMessage('项目加载失败: ' + error.message, 'error', 3);
		}
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
			confirmButtonColor: '#d33',
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

	// HTML 转义
	escapeHtml(text) {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}
}

// 全局实例
window.leftNavPanel = null;
