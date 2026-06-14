/**
 * Popout Manager - 弹出面板管理器
 * 原生 HTML5 Drag API + dragleave/dragenter 追踪 + MessageBus RPC
 * 不持久化弹出状态，每次启动全新
 */

const POPOUT_VIEW_MAP = {
	"all-projects": { btnId: "nav-all-projects", viewId: "project-list-view", title: "所有项目" },
	"project-design": { btnId: "nav-project-design", viewId: "file-tree", title: "项目设计" },
	"common-code": { btnId: "nav-common-code", viewId: "completer-store-view", title: "常用代码" },
};

const POPOUT_DRAG_BTN_MAP = {
	'nav-all-projects': 'all-projects',
	'nav-project-design': 'project-design',
	'nav-common-code': 'common-code',
};

const PopoutManager = {
	_dragViewName: null,
	_mouseLeftIframe: false,
	_poppedOutPanels: {},
	_subscriptionsAttached: false,

	init() {
		this.attachDragHandlers();
		if (!this._subscriptionsAttached) {
			this.attachMessageBusSubscriptions();
			this._subscriptionsAttached = true;
		}
	},

	attachDragHandlers() {
		for (const [btnId, viewName] of Object.entries(POPOUT_DRAG_BTN_MAP)) {
			const btn = document.getElementById(btnId);
			if (!btn) continue;
			btn.draggable = true;

			btn.addEventListener('dragstart', (e) => {
				this._dragViewName = viewName;
				this._mouseLeftIframe = false;

				const ghost = document.createElement('div');
				ghost.className = 'popout-drag-ghost';
				ghost.innerHTML = '<span class="popout-drag-ghost-text">' + POPOUT_VIEW_MAP[viewName].title + '</span>';
				ghost.style.position = 'absolute';
				ghost.style.top = '-9999px';
				ghost.style.left = '-9999px';
				ghost.style.opacity = '1';
				document.body.appendChild(ghost);

				e.dataTransfer.effectAllowed = 'move';
				e.dataTransfer.setData('text/plain', '');
				e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2);

				setTimeout(() => ghost.remove(), 0);
			});

			btn.addEventListener('dragend', (e) => {
				if (!this._dragViewName) return;
				if (this._mouseLeftIframe) {
					this.popOut(this._dragViewName);
				}
				this._dragViewName = null;
				this._mouseLeftIframe = false;
			});
		}

		document.addEventListener('dragleave', (e) => {
			if (!this._dragViewName) return;
			if (!e.relatedTarget || !document.contains(e.relatedTarget)) {
				this._mouseLeftIframe = true;
			}
		});

		document.addEventListener('dragenter', (e) => {
			if (!this._dragViewName) return;
			if (e.relatedTarget && document.contains(e.relatedTarget)) {
				this._mouseLeftIframe = false;
			}
		});

		document.addEventListener('dragover', (e) => {
			if (this._dragViewName) {
				e.preventDefault();
				e.dataTransfer.dropEffect = 'move';
			}
		});
	},

	async popOut(viewName) {
		if (this._poppedOutPanels[viewName] && this._poppedOutPanels[viewName].isOpen) return;

		const cfg = POPOUT_VIEW_MAP[viewName];
		const config = {
			panelType: viewName,
			theme: document.body.classList.contains("dark-theme") ? "dark" : "light",
			currentProjectId: window.projectManager.currentProject ? window.projectManager.currentProject.id : null,
			activeBuiltInProjectId: window.leftNavPanel && window.leftNavPanel._activeBuiltInProjectId ? window.leftNavPanel._activeBuiltInProjectId : null,
		};
		await eda.sys_Storage.setExtensionUserConfig('__popout_panel_config', JSON.stringify(config));

		this.hidePanelInMain(viewName);

		const iframeId = 'popout-' + viewName;

		try {
			await eda.sys_IFrame.openIFrame(
				'iframe/popout-panel.html',
				320,
				600,
				iframeId,
				{
					title: cfg.title,
					maximizeButton: true,
					minimizeButton: true,
					onBeforeCloseCallFn: async () => {
						this.restorePanel(viewName);
						return true;
					},
				}
			);
			this._poppedOutPanels[viewName] = { iframeId: iframeId, isOpen: true };
			eda.sys_Message.showToastMessage(cfg.title + ' 已弹出', 'success', 2);
		} catch (e) {
			this.restorePanel(viewName);
			eda.sys_Message.showToastMessage(cfg.title + ' 弹出失败', 'error', 3);
		}
	},

	hidePanelInMain(viewName) {
		const cfg = POPOUT_VIEW_MAP[viewName];
		const navBtn = document.getElementById(cfg.btnId);
		if (navBtn) navBtn.classList.add('popped-out');

		const viewEl = document.getElementById(cfg.viewId);
		if (viewEl) viewEl.classList.add('popped-out');
	},

	restorePanel(viewName) {
		if (!this._poppedOutPanels[viewName]) return;
		const cfg = POPOUT_VIEW_MAP[viewName];

		const navBtn = document.getElementById(cfg.btnId);
		if (navBtn) navBtn.classList.remove('popped-out');

		const viewEl = document.getElementById(cfg.viewId);
		if (viewEl) viewEl.classList.remove('popped-out');

		delete this._poppedOutPanels[viewName];

		if (window.leftNavPanel) window.leftNavPanel.switchView(viewName);
		eda.sys_Message.showToastMessage('面板已收回', 'success', 1);
	},

	// 主 iframe 侧 MessageBus
	attachMessageBusSubscriptions() {
		try {
			var flag = eda.sys_Storage.getExtensionUserConfig("__msg_bus_subs_ready");
			if (flag === true || flag === "true") return;
			eda.sys_Storage.setExtensionUserConfig("__msg_bus_subs_ready", true);
			eda.sys_MessageBus.subscribePublic('popout-panel-close', (msg) => {
				if (msg && msg.panelType) this.restorePanel(msg.panelType);
			});

			eda.sys_MessageBus.subscribePublic('popout-select-project', (msg) => {
				if (msg && msg.projectId && window.leftNavPanel) {
					window.leftNavPanel.selectProject(msg.projectId);
				}
			});

			eda.sys_MessageBus.subscribePublic('popout-open-project', async (msg) => {
				if (!msg || !msg.projectId || !window.leftNavPanel) return;
				if (!window.projectManager.db || window.projectManager.db.closed) {
					await window.projectManager.initDB();
				}
				await window.leftNavPanel.openProject(msg.projectId);
				this.notifyRefresh('project-design', { projectId: msg.projectId });
			});

			eda.sys_MessageBus.subscribePublic('popout-open-builtin-project', async (msg) => {
				if (!msg || !msg.projectId || !window.leftNavPanel) return;
				if (!window.projectManager.db || window.projectManager.db.closed) {
					await window.projectManager.initDB();
				}
				await window.leftNavPanel.openBuiltInProject(msg.projectId);
				this.notifyRefresh('all-projects');
			});

			eda.sys_MessageBus.subscribePublic('popout-close-builtin-project', () => {
				if (window.leftNavPanel) window.leftNavPanel.closeBuiltInProject();
				this.notifyRefresh('all-projects');
			});

			eda.sys_MessageBus.subscribePublic('popout-load-file', async (msg) => {
				if (msg && msg.fileName && window.fileTreeUI) {
					await window.fileTreeUI.loadFile(msg.fileName);
				}
			});

			eda.sys_MessageBus.subscribePublic('popout-popup-preview', (msg) => {
				if (msg && msg.fileName && window.fileTreeUI) {
					window.fileTreeUI.popupPreviewHtml(msg.fileName);
				}
			});

			eda.sys_MessageBus.subscribePublic('popout-insert-code', (msg) => {
				if (msg && msg.methodPath && window.editor) {
					const cursor = window.editor.getCursorPosition();
					window.editor.session.insert(cursor, msg.methodPath);
					
				}
			});
		} catch (e) {}
	},

	closeAll() {
		for (const viewName in this._poppedOutPanels) {
			const panel = this._poppedOutPanels[viewName];
			if (panel && panel.iframeId) {
				try { eda.sys_IFrame.closeIFrame(panel.iframeId); } catch (e) {}
			}
			this.restorePanel(viewName);
		}
		this._poppedOutPanels = {};
	},
	notifyRefresh(viewName, data) {
		const topicMap = {
			'all-projects': 'popout-refresh-projects',
			'project-design': 'popout-refresh-filetree',
			'common-code': 'popout-refresh-completers',
		};
		const topic = topicMap[viewName];
		if (topic) {
			try { eda.sys_MessageBus.publishPublic(topic, data || {}); } catch (e) {}
		}
	},
};

window.PopoutManager = PopoutManager;
