/**
 * I18n module for API Debug Tool iframe
 * Uses platform eda.sys_I18n API for automatic language switching
 */
var I18N = (function() {
  var dict = {
    zh: {
      loadingEditor: '正在加载编辑器...',
      run: '运行',
      file: '文件',
      settings: '设置',
      allProjects: '所有项目',
      projectDesign: '项目设计',
      codeSnippets: '常用代码',
      searchProjects: '搜索项目...',
      importProject: '导入项目',
      importBtn: '导入',
      closeProject: '关闭项目',
      searchCode: '搜索代码...',
      newConversation: '新建对话',
      chatSettings: '聊天设置',
      aiWelcome: '你好！我是你的 AI 编程助手。有什么可以帮你的吗？',
      aiPlaceholder: '输入代码问题或指令... (Shift+Enter 换行)',
      send: '发送',
      collapse: '收回'
    },
    en: {
      loadingEditor: 'Loading editor...',
      run: 'Run',
      file: 'File',
      settings: 'Settings',
      allProjects: 'All Projects',
      projectDesign: 'Project Design',
      codeSnippets: 'Code Snippets',
      searchProjects: 'Search projects...',
      importProject: 'Import Project',
      importBtn: 'Import',
      closeProject: 'Close Project',
      searchCode: 'Search code...',
      newConversation: 'New Conversation',
      chatSettings: 'Chat Settings',
      aiWelcome: 'Hello! I\'m your AI coding assistant. How can I help you?',
      aiPlaceholder: 'Enter code questions or instructions... (Shift+Enter for new line)',
      send: 'Send',
      collapse: 'Collapse'
    }
  };

  var currentLang = 'zh';

  // Use platform API to get current language
  try {
    eda.sys_I18n.getCurrentLanguage().then(function(lang) {
      currentLang = (lang && lang.startsWith('en')) ? 'en' : 'zh';
      applyI18n();
    });
  } catch(e) {}

  // Listen for platform language changes
  try {
    eda.sys_I18n.addLanguageChangedEventListener('apidebug-iframe-i18n', function(newLang) {
      currentLang = (newLang && newLang.startsWith('en')) ? 'en' : 'zh';
      applyI18n();
    }, false);
  } catch(e) {}

  function t(key) {
    return (dict[currentLang] && dict[currentLang][key]) || (dict['en'] && dict['en'][key]) || key;
  }

  function applyI18n() {
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      if (key && dict[currentLang] && dict[currentLang][key]) {
        el.textContent = dict[currentLang][key];
      }
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (key && dict[currentLang] && dict[currentLang][key]) {
        el.placeholder = dict[currentLang][key];
      }
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
      var key = el.getAttribute('data-i18n-title');
      if (key && dict[currentLang] && dict[currentLang][key]) {
        el.title = dict[currentLang][key];
      }
    });
  }

  function getCurrentLang() { return currentLang; }

  return { t: t, applyI18n: applyI18n, getCurrentLang: getCurrentLang };
})();
