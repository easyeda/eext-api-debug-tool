/**
 * Popout Manager - 弹出面板管理器
 * 原生 HTML5 Drag API + dragleave/dragenter 追踪 + MessageBus RPC
 * 不持久化弹出状态，每次启动全新
 */

const POPOUT_VIEW_MAP = {
	"all-projects": { btnId: "nav-all-projects", viewId: "project-list-view", title: "All Projects" },
	"project-design": { btnId: "nav-project-design", viewId: "file-tree", title: "Project Design" },
	"common-code": { btnId: "nav-common-code", viewId: "completer-store-view", title: "Common Code" },
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
	_msgBusGen: 0,

	init() {
		// 自增世代计数器，旧 handler 检测到不匹配自动跳过
		var gen = (parseInt(eda.sys_Storage.getExtensionUserConfig("__msg_bus_gen") || "0") || 0) + 1;
		eda.sys_Storage.setExtensionUserConfig("__msg_bus_gen", gen);
		this._msgBusGen = gen;
		this.attachDragHandlers();
		this.attachMessageBusSubscriptions();
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
		const iframeId = 'popout-' + viewName;

		// Set isOpen BEFORE await to prevent race conditions from stale subscription handlers
		this._poppedOutPanels[viewName] = { iframeId: null, isOpen: true };

		const config = {
			panelType: viewName,
			theme: document.body.classList.contains("dark-theme") ? "dark" : "light",
			currentProjectId: window.projectManager.currentProject ? window.projectManager.currentProject.id : null,
			activeBuiltInProjectId: window.leftNavPanel && window.leftNavPanel._activeBuiltInProjectId ? window.leftNavPanel._activeBuiltInProjectId : null,
			_popoutGen: (parseInt(eda.sys_Storage.getExtensionUserConfig('__popout_gen') || '0') || 0) + 1,
		};
		await eda.sys_Storage.setExtensionUserConfig('__popout_panel_config', JSON.stringify(config));
		await eda.sys_Storage.setExtensionUserConfig('__popout_gen', config._popoutGen);

		this.hidePanelInMain(viewName);

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
			this._poppedOutPanels[viewName].iframeId = iframeId;
			eda.sys_Message.showToastMessage(cfg.title + ' popped out', 'success', 2);
		} catch (e) {
			this.restorePanel(viewName);
			eda.sys_Message.showToastMessage(cfg.title + ' popout failed', 'error', 3);
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
		eda.sys_Message.showToastMessage('Panel restored', 'success', 1);
	},

	// 主 iframe 侧 MessageBus
	// 每次 init 递增世代计数器，handler 比对世代号，旧订阅自动失效
	attachMessageBusSubscriptions() {
		var gen = this._msgBusGen;
		var self = this;

		function isStale() {
			try {
				var current = eda.sys_Storage.getExtensionUserConfig("__msg_bus_gen");
				if (current === null || current === undefined) return false;
				return String(current) !== String(gen);
			} catch(e) { return false; }
		}

		try {
			eda.sys_MessageBus.subscribePublic('popout-panel-close', function(msg) {
				if (isStale()) return;
				if (msg && msg.panelType) self.restorePanel(msg.panelType);
			});

			eda.sys_MessageBus.subscribePublic('popout-select-project', function(msg) {
				if (isStale()) return;
				if (msg && msg.projectId && window.leftNavPanel) {
					window.leftNavPanel.selectProject(msg.projectId);
				}
			});

			eda.sys_MessageBus.subscribePublic('popout-open-project', async function(msg) {
				if (isStale()) return;
				if (!msg || !msg.projectId || !window.leftNavPanel) return;
				if (!window.projectManager.db || window.projectManager.db.closed) {
					await window.projectManager.initDB();
				}
				await window.leftNavPanel.openProject(msg.projectId);
				self.notifyRefresh('project-design', { projectId: msg.projectId });
			});

			eda.sys_MessageBus.subscribePublic('popout-open-script-project', async function(msg) {
				if (isStale()) return;
				if (!msg || !msg.projectId || !window.leftNavPanel) return;
				if (!window.projectManager.db || window.projectManager.db.closed) {
					await window.projectManager.initDB();
				}
				await window.leftNavPanel.openScriptProject(msg.projectId);
			});

			eda.sys_MessageBus.subscribePublic('popout-open-builtin-project', async function(msg) {
				if (isStale()) return;
				if (!msg || !msg.projectId || !window.leftNavPanel) return;
				if (!window.projectManager.db || window.projectManager.db.closed) {
					await window.projectManager.initDB();
				}
				await window.leftNavPanel.openBuiltInProject(msg.projectId);
			});

			eda.sys_MessageBus.subscribePublic('popout-close-builtin-project', function(msg) {
				if (isStale()) return;
				if (window.leftNavPanel) window.leftNavPanel.closeBuiltInProject();
			});

			eda.sys_MessageBus.subscribePublic('popout-load-file', async function(msg) {
				if (isStale()) return;
				if (msg && msg.fileName && window.fileTreeUI) {
					await window.fileTreeUI.loadFile(msg.fileName);
				}
			});

			eda.sys_MessageBus.subscribePublic('popout-popup-preview', function(msg) {
				if (isStale()) return;
				if (msg && msg.fileName && window.fileTreeUI) {
					window.fileTreeUI.popupPreviewHtml(msg.fileName);
				}
			});

			eda.sys_MessageBus.subscribePublic('popout-insert-code', function(msg) {
				if (isStale()) return;
				if (msg && msg.methodPath && window.editor) {
					var cursor = window.editor.getCursorPosition();
					window.editor.session.insert(cursor, msg.methodPath);
				}
			});

			eda.sys_MessageBus.subscribePublic('popout-request-close-project', function(msg) {
				if (isStale()) return;
				if (window.leftNavPanel) window.leftNavPanel.closeCurrentProject();
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
