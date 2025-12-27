// 初始化ACE编辑器
function ACE_Init(editor) {
	editor.session.setMode('ace/mode/javascript');
	editor.setTheme('ace/theme/monokai');
	editor.setValue('', -1);
	editor.setOptions({
		enableBasicAutocompletion: true,
		enableLiveAutocompletion: true,
		fontSize: 14,
		useWorker: false,
		highlightActiveLine: true,
		showPrintMargin: false,
	});
}

// 注册EDA的自动补全
function ACE_CodingForEDA(editor, edcode) {
	const completers = [];
	for (const e of edcode) {
		completers.push({
			caption: e.methodPath,
			value: e.methodPath + '()',
			score: 1000,
			meta: 'method',
			docText: e.description,
		}, {
			caption: e.description,
			value: e.methodPath + '()',
			score: 999,
			meta: 'desc',
			docText: e.methodPath,
		}, );
	}
	editor.completers = editor.completers.filter((c) => !c.getCompletions || (c.meta !== 'method' && c.meta !== 'desc'));
	editor.completers.push({
		identifierRegexps: [/[\w\$\u00A2-\uFFFF]/], // 支持中文
		getCompletions: function(editor, session, pos, prefix, callback) {
			const { row, column } = pos;
			const tokens = session.getTokens(row);
			let tokenStart = 0;
			let currentToken = null;
			for (let i = 0; i < tokens.length; i++) {
				const token = tokens[i];
				const tokenEnd = tokenStart + token.value.length;
				if (column <= tokenEnd) {
					currentToken = token;
					break;
				}
				tokenStart = tokenEnd;
			}
			const tokenType = currentToken?.type || '';
			if (tokenType.includes('string') || tokenType.includes('comment') || tokenType.includes('regexp')) {
				return callback(null, []);
			}
			if (/[\s"'\(\)\[\]\{\}\+\-\*\/\=\!\&\|\<\>]/.test(prefix)) {
				return callback(null, []);
			}
			if (prefix === '') {
				return callback(null, []);
			}
			const matches = completers.filter((item) => item.caption.toLowerCase().includes(prefix.toLowerCase()));
			callback(null, matches);
		},
	});
}


// 滚动+Ctrl放大或缩小代码
function ACE_ChangeCodeSize(editor,currentFontSize,showToast) {
	editor.container.addEventListener(
		'wheel',
		(e) => {
			if (!e.ctrlKey) return;
			e.preventDefault();
			const delta = e.deltaY;
			if (delta < 0) {
				currentFontSize = Math.min(currentFontSize + 7, 140);
				showToast(currentFontSize + 'px:' + (currentFontSize / 14) * 100 + '%');
			} else if (delta > 0) {
				currentFontSize = Math.max(currentFontSize - 7, 7);
				showToast(currentFontSize + 'px:' + (currentFontSize / 14) * 100 + '%');
			}
			editor.setFontSize(currentFontSize);
		}, { passive: false },
	);
}