/**
 * Popout Panel Init - 弹出面板初始化
 * 轻量视图层：只渲染 UI + 发布用户操作到主 iframe
 * 只订阅刷新通知类 topic，不订阅操作类 topic（避免重复处理）
 */

(async function PopoutPanelInit() {
	let panelType = null;
	let popoutPanel = null;
	let editor = null;
	let currentProjectId = null;

	let config = null;
	try {
		const rawConfig = eda.sys_Storage.getExtensionUserConfig('__popout_panel_config');
		if (!rawConfig) {
			document.getElementById('popout-content').innerHTML = '<div style="padding:20px;">No config</div>';
			return;
		}
		config = typeof rawConfig === 'string' ? JSON.parse(rawConfig) : rawConfig;
		panelType = config.panelType;
		currentProjectId = config.currentProjectId;
		var activeBuiltInProjectId = config.activeBuiltInProjectId || null;
	} catch (e) {
		document.getElementById('popout-content').innerHTML = '<div style="padding:20px;color:red;">Error: ' + e.message + '</div>';
		return;
	}

	if (!panelType) return;

	// Apply theme from config
	if (config.theme) {
		if (config.theme === 'dark') {
			document.body.classList.add('dark-theme');
		} else {
			document.body.classList.remove('dark-theme');
		}
	}

	const titles = {
		'all-projects': '所有项目',
		'project-design': '项目设计',
		'common-code': '常用代码',
	};
	document.getElementById('popout-title').textContent = titles[panelType] || panelType;

	ThemeEngine.init();
	await window.projectManager.initDB();

	const tempEditorDiv = document.createElement('div');
	tempEditorDiv.id = 'popout-editor';
	tempEditorDiv.style.cssText = 'width:1px;height:1px;position:absolute;opacity:0;pointer-events:none;';
	document.body.appendChild(tempEditorDiv);
	editor = ace.edit("popout-editor");
	// Set basePath and disable all workers for popout panel (blob URL context)
	ace.config.set("basePath", "/iframe/script/Ace_Editor/");
	ace.config.set("workerPath", null);
	editor.setOption("useWorker", false);
	// Disable worker for all session
	editor.session.setOption("useWorker", false);
	// Globally disable workers in Ace config
	ace.config.set("useWorker", false);

	popoutPanel = new LeftNavPanel(editor);

	// Popout has no editor area — sidebar must always stay expanded
	popoutPanel.sidebarExpanded = true;
	popoutPanel.toggleSidebar = function() {};
	const contentArea = document.getElementById('left-content-area');
	if (contentArea) contentArea.style.display = 'flex';

// Sync running built-in project state from config (passed at popout time)
if (activeBuiltInProjectId) {
	popoutPanel._activeBuiltInProjectId = activeBuiltInProjectId;
}



	// Always create fileTreeUI for project-design, even without a project
	if (panelType === 'project-design') {
		if (currentProjectId) {
			try {
				const project = await window.projectManager.loadProject(currentProjectId);
				window.projectManager.currentProject = project;
				window.projectManager.currentFile = null;
			} catch (e) {
				await window.projectManager.initDB();
				const project = await window.projectManager.loadProject(currentProjectId);
				window.projectManager.currentProject = project;
				window.projectManager.currentFile = null;
			}
		}
		window.fileTreeUI = new FileTreeUI('file-tree', editor);
		await window.fileTreeUI.render();
	}

	popoutPanel.switchView(panelType);

	// 收回按钮
	document.getElementById('popout-restore-btn').addEventListener('click', function() {
		try { eda.sys_MessageBus.publishPublic('popout-panel-close', { panelType: panelType }); } catch (e) {}
		try { eda.sys_IFrame.closeIFrame('popout-' + panelType); } catch (e) {}
	});

	// RPC — 所有用户操作只发布到主 iframe，不做本地执行
	if (panelType === 'all-projects') {
		popoutPanel.selectProject = function(projectId) {
			try { eda.sys_MessageBus.publishPublic('popout-select-project', { projectId: projectId }); } catch (e) {}
		};
		popoutPanel.openProject = function(projectId) {
			try { eda.sys_MessageBus.publishPublic('popout-open-project', { projectId: projectId }); } catch (e) {}
		};
		popoutPanel.openBuiltInProject = function(projectId) {
			try { eda.sys_MessageBus.publishPublic('popout-open-builtin-project', { projectId: projectId }); } catch (e) {}
		};
		popoutPanel.closeBuiltInProject = function() {
			try { eda.sys_MessageBus.publishPublic('popout-close-builtin-project', {}); } catch (e) {}
		};
		popoutPanel.closeCurrentProject = function() {
			try { eda.sys_MessageBus.publishPublic('popout-close-project', {}); } catch (e) {}
		};
	}

	if (panelType === 'project-design' && window.fileTreeUI) {
		window.fileTreeUI.loadFile = function(fileName) {
			try { eda.sys_MessageBus.publishPublic('popout-load-file', { fileName: fileName }); } catch (e) {}
		};
		window.fileTreeUI.popupPreviewHtml = function(fileName) {
			try { eda.sys_MessageBus.publishPublic('popout-popup-preview', { fileName: fileName }); } catch (e) {}
		};
		popoutPanel.closeCurrentProject = function() {
			try { eda.sys_MessageBus.publishPublic('popout-close-project', {}); } catch (e) {}
		};
	}

	if (panelType === 'common-code' && popoutPanel.insertEdcodeMethod) {
		popoutPanel.insertEdcodeMethod = function(methodPath) {
			try { eda.sys_MessageBus.publishPublic('popout-insert-code', { methodPath: methodPath }); } catch (e) {}
			eda.sys_Message.showToastMessage('已插入: ' + methodPath, 'success', 1);
		};
	}

	// 只订阅刷新通知类 topic — 主 iframe 操作完成后发布这些通知
	// 不订阅操作类 topic（popout-select-project 等），那些只由主 iframe 处理
	try {
		eda.sys_MessageBus.subscribePublic('popout-refresh-projects', function(msg) {
			if (panelType === 'all-projects' && popoutPanel) {
				try { popoutPanel._activeBuiltInProjectId = eda.sys_Storage.getExtensionUserConfig('__active_builtin_project') || null; } catch (e) {}
				popoutPanel.loadProjectList();
			}
		});

		eda.sys_MessageBus.subscribePublic('popout-refresh-filetree', async function(msg) {
			if (panelType === 'project-design') {
				if (msg && msg.projectId) {
					currentProjectId = msg.projectId;
					try {
						const project = await window.projectManager.loadProject(msg.projectId);
						window.projectManager.currentProject = project;
						window.projectManager.currentFile = null;
					} catch (e) {
						await window.projectManager.initDB();
						const project = await window.projectManager.loadProject(msg.projectId);
						window.projectManager.currentProject = project;
						window.projectManager.currentFile = null;
					}
				}
				window.fileTreeUI = new FileTreeUI('file-tree', editor);
				await window.fileTreeUI.render();
				// Reapply RPC overrides after recreation
				if (window.fileTreeUI) {
					window.fileTreeUI.loadFile = function(fileName) {
						try { eda.sys_MessageBus.publishPublic('popout-load-file', { fileName: fileName }); } catch (e) {}
					};
				}
			}
		});

		eda.sys_MessageBus.subscribePublic('popout-refresh-completers', function(msg) {
			if (panelType === 'common-code' && popoutPanel) {
				popoutPanel.loadCompleterStore();
			}
		});

		eda.sys_MessageBus.subscribePublic('popout-close-project', async function(msg) {
			if (panelType === 'project-design') {
				currentProjectId = null;
				window.projectManager.currentProject = null;
				window.projectManager.currentFile = null;
				popoutPanel.switchView('project-design');
				if (window.fileTreeUI) {
					window.fileTreeUI = new FileTreeUI('file-tree', editor);
					await window.fileTreeUI.render();
						// Reapply RPC overrides after recreation
						if (window.fileTreeUI) {
							window.fileTreeUI.loadFile = function(fileName) {
								try { eda.sys_MessageBus.publishPublic('popout-load-file', { fileName: fileName }); } catch (e) {}
							};
						}
				}
			}
		});
	} catch (e) {}
})();
