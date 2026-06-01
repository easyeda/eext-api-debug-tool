/* ============================================
   Theme Engine - CSS 变量驱动的主题系统
   三套内置预设 + 自定义主题支持
   ============================================ */

const THEME_PRESETS = {
	light: {
		name: '亮色',
		aceTheme: 'ace/theme/github',
		bodyClass: 'light-theme',
		vars: {
			'bg-body': '#f5f5f5', 'bg-toolbar': '#fff', 'bg-panel': '#fff',
			'bg-input': '#fff', 'bg-input-disabled': '#f1f1f1',
			'bg-modal': '#fff', 'bg-modal-header': '#f5f5f5',
			'bg-item': '#f5f5f5', 'bg-code': '#f5f5f5', 'bg-dropdown': '#fff',
			'bg-overlay': 'rgba(0,0,0,0.4)', 'bg-mask': 'rgba(0,0,0,0.5)',
			'text-primary': '#333', 'text-secondary': '#666', 'text-tertiary': '#999',
			'text-inverse': '#fff', 'text-placeholder': '#a9a9a9',
			'border': '#d9d9d9', 'border-light': '#e9e9e9',
			'brand': '#1890ff', 'brand-hover': '#40a9ff', 'brand-pressed': '#096dd9',
			'brand-bg': 'rgba(24,144,255,0.1)',
			'error': '#f5222d', 'error-text': '#e55649', 'error-bg': 'rgba(245,34,45,0.08)',
			'success': '#52c41a', 'success-bg': 'rgba(82,196,26,0.08)',
			'warning': '#fa8c16', 'warning-bg': 'rgba(250,140,22,0.08)',
			'hover-bg': '#e6f7ff', 'hover-bg-delete': 'rgba(245,34,45,0.08)',
			'selected-bg': '#e6f7ff',
			'scrollbar-thumb': '#bfbfbf', 'scrollbar-thumb-hover': '#8b8b8c',
			'scrollbar-track': 'transparent',
			'shadow': '0 1px 6px rgba(0,0,0,0.2)', 'shadow-lg': '0 0 15px rgba(50,50,50,0.3)',
			'btn-bg': '#fff', 'btn-border': '#d9d9d9', 'btn-color': '#1890ff',
			'btn-primary-bg': '#1890ff', 'btn-primary-color': '#fff',
			'btn-primary-hover-bg': '#40a9ff',
			'input-focus-ring': '0 0 0 2px rgba(24,144,255,0.2)',
			'chat-bubble-system-bg': '#f5f5f5', 'chat-bubble-system-border': '#e9e9e9',
			'chat-bubble-user-bg': '#1890ff', 'chat-bubble-user-color': '#fff',
			'editor-bg': '#fff',
		},
	},

	dark: {
		name: '暗色',
		aceTheme: 'ace/theme/monokai',
		bodyClass: 'dark-theme',
		vars: {
			'bg-body': '#404040', 'bg-toolbar': '#404040', 'bg-panel': '#353535',
			'bg-input': '#4e4e4e', 'bg-input-disabled': '#2e2e2e',
			'bg-modal': '#404040', 'bg-modal-header': '#505050',
			'bg-item': '#353535', 'bg-code': '#353535', 'bg-dropdown': '#404040',
			'bg-overlay': 'rgba(0,0,0,0.6)', 'bg-mask': 'rgba(0,0,0,0.6)',
			'text-primary': '#e5e5e5', 'text-secondary': '#868686', 'text-tertiary': '#868686',
			'text-inverse': '#fff', 'text-placeholder': '#a9a9a9',
			'border': '#222', 'border-light': '#222',
			'brand': '#1890ff', 'brand-hover': '#40a9ff', 'brand-pressed': '#096dd9',
			'brand-bg': 'rgba(24,144,255,0.16)',
			'error': '#f5222d', 'error-text': '#e55649', 'error-bg': 'rgba(245,34,45,0.1)',
			'success': '#52c41a', 'success-bg': 'rgba(82,196,26,0.1)',
			'warning': '#fa8c16', 'warning-bg': 'rgba(250,140,22,0.1)',
			'hover-bg': '#6283a2', 'hover-bg-delete': 'rgba(245,34,45,0.15)',
			'selected-bg': '#6283a2',
			'scrollbar-thumb': '#868686', 'scrollbar-thumb-hover': '#5d5d5e',
			'scrollbar-track': '#353535',
			'shadow': '0 1px 6px rgba(0,0,0,0.4)', 'shadow-lg': '0 0 15px rgba(0,0,0,0.5)',
			'btn-bg': '#4e4e4e', 'btn-border': '#222', 'btn-color': '#e5e5e5',
			'btn-primary-bg': '#1890ff', 'btn-primary-color': '#fff',
			'btn-primary-hover-bg': '#40a9ff',
			'input-focus-ring': '0 0 0 2px rgba(24,144,255,0.2)',
			'chat-bubble-system-bg': '#353535', 'chat-bubble-system-border': '#222',
			'chat-bubble-user-bg': '#1890ff', 'chat-bubble-user-color': '#fff',
			'editor-bg': '#272822',
		},
	},

	'dark-editor': {
		name: '黑底白图',
		aceTheme: 'ace/theme/monokai',
		bodyClass: 'dark-editor-theme',
		vars: {
			'bg-body': '#f5f5f5', 'bg-toolbar': '#fff', 'bg-panel': '#fff',
			'bg-input': '#fff', 'bg-input-disabled': '#f1f1f1',
			'bg-modal': '#fff', 'bg-modal-header': '#f5f5f5',
			'bg-item': '#f5f5f5', 'bg-code': '#1e1e1e', 'bg-dropdown': '#fff',
			'bg-overlay': 'rgba(0,0,0,0.4)', 'bg-mask': 'rgba(0,0,0,0.5)',
			'text-primary': '#333', 'text-secondary': '#666', 'text-tertiary': '#999',
			'text-inverse': '#fff', 'text-placeholder': '#a9a9a9',
			'border': '#d9d9d9', 'border-light': '#e9e9e9',
			'brand': '#1890ff', 'brand-hover': '#40a9ff', 'brand-pressed': '#096dd9',
			'brand-bg': 'rgba(24,144,255,0.1)',
			'error': '#f5222d', 'error-text': '#e55649', 'error-bg': 'rgba(245,34,45,0.08)',
			'success': '#52c41a', 'success-bg': 'rgba(82,196,26,0.08)',
			'warning': '#fa8c16', 'warning-bg': 'rgba(250,140,22,0.08)',
			'hover-bg': '#e6f7ff', 'hover-bg-delete': 'rgba(245,34,45,0.08)',
			'selected-bg': '#e6f7ff',
			'scrollbar-thumb': '#bfbfbf', 'scrollbar-thumb-hover': '#8b8b8c',
			'scrollbar-track': 'transparent',
			'shadow': '0 1px 6px rgba(0,0,0,0.2)', 'shadow-lg': '0 0 15px rgba(50,50,50,0.3)',
			'btn-bg': '#fff', 'btn-border': '#d9d9d9', 'btn-color': '#1890ff',
			'btn-primary-bg': '#1890ff', 'btn-primary-color': '#fff',
			'btn-primary-hover-bg': '#40a9ff',
			'input-focus-ring': '0 0 0 2px rgba(24,144,255,0.2)',
			'chat-bubble-system-bg': '#f5f5f5', 'chat-bubble-system-border': '#e9e9e9',
			'chat-bubble-user-bg': '#1890ff', 'chat-bubble-user-color': '#fff',
			'editor-bg': '#272822',
		},
	},
};

/* ---- Theme Engine API ---- */

const ThemeEngine = {
	_currentTheme: 'dark',
	_customThemes: {},

	/** 初始化：从 storage 读取并应用主题 */
	async init() {
		// 修复首次使用 storage 的 UUID 字符串问题
		let configs;
		try { configs = eda.sys_Storage.getExtensionAllUserConfigs(); } catch (e) { configs = {}; }
		if (typeof configs === 'string') {
			try { await eda.sys_Storage.clearExtensionAllUserConfigs(); } catch (e) {}
			configs = {};
		}
		this._currentTheme = configs['theme-name'] || 'dark';
		try {
			const saved = configs['custom-themes'];
			if (saved && typeof saved === 'string') this._customThemes = JSON.parse(saved);
			else if (saved) this._customThemes = saved;
		} catch (e) {
			this._customThemes = {};
		}
		this.apply(this._currentTheme);
	},

	/** 获取主题变量（预设或自定义） */
	getVars(name) {
		if (THEME_PRESETS[name]) return THEME_PRESETS[name].vars;
		if (this._customThemes[name]) return this._customThemes[name].vars;
		return THEME_PRESETS['dark'].vars;
	},

/** 应用主题到 DOM */
	apply(name) {
		const preset = THEME_PRESETS[name];
		const custom = this._customThemes[name];
		const config = preset || custom;
		if (!config) {
			// 主题不存在，回退到 dark
			return this.apply('dark');
		}

		const vars = this.getVars(name);
		const html = document.documentElement;
		Object.entries(vars).forEach(([k, v]) => {
			html.style.setProperty(`--eext-${k}`, v);
		});

		// 移除所有旧主题 class
		document.body.classList.remove('light-theme', 'dark-theme', 'dark-editor-theme');
		if (config.bodyClass) {
			document.body.classList.add(config.bodyClass);
		}

		// Ace 编辑器主题
		if (typeof editor !== 'undefined' && editor && config.aceTheme) {
			editor.setTheme(config.aceTheme);
		}

		// 文件树
		if (window.fileTreeUI && window.fileTreeUI.applyTheme) {
			window.fileTreeUI.applyTheme();
		}

		// 持久化
		this._currentTheme = name;
		try {
			eda.sys_Storage.setExtensionUserConfig('theme-name', name);
		} catch (e) { /* silent */ }

		return name;
	},

	/** 获取当前主题名 */
	getCurrent() {
		return this._currentTheme;
	},

	/** 获取当前 vars（用于 JS 内联样式） */
	getCurrentVars() {
		return this.getVars(this._currentTheme);
	},

	/** 获取所有可用主题列表 */
	listThemes() {
		const presets = Object.entries(THEME_PRESETS).map(([id, cfg]) => ({
			id, name: cfg.name, preset: true, readonly: true,
		}));
		const customs = Object.entries(this._customThemes).map(([id, cfg]) => ({
			id, name: cfg.name, preset: false, readonly: false,
		}));
		return [...presets, ...customs];
	},

	/** 判断是否为预设（只读） */
	isPreset(name) {
		return !!THEME_PRESETS[name];
	},

	/** 保存自定义主题 */
	async saveCustom(name, vars, label) {
		const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase();
		if (THEME_PRESETS[safeName]) return false;
		// 根据编辑器背景亮度自动选择 Ace 主题
		const editorBg = vars['editor-bg'] || '#fff';
		const isEditorDark = parseInt(editorBg.replace('#',''), 16) < 0x888888;
		const aceTheme = isEditorDark ? 'ace/theme/monokai' : 'ace/theme/github';
		const bodyClass = isEditorDark ? 'dark-theme' : 'light-theme';
		this._customThemes[safeName] = { name: label || name, vars, aceTheme, bodyClass };
		await eda.sys_Storage.setExtensionUserConfig('custom-themes', JSON.stringify(this._customThemes));
		return safeName;
	},

	/** 删除自定义主题 */
	async deleteCustom(name) {
		if (THEME_PRESETS[name]) return false;
		delete this._customThemes[name];
		if (this._currentTheme === name) {
			await this.apply('dark');
		}
		await eda.sys_Storage.setExtensionUserConfig('custom-themes', JSON.stringify(this._customThemes));
		return true;
	},
};

