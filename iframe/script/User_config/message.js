/**
 * 在页面右下角显示一条临时消息提示（Toast）
 *
 * @param {string} message - 要显示的消息文本，必填
 * @param {Object} [options] - 可选配置项
 * @param {number} [options.duration=3000] - 消息自动消失的毫秒数，默认 3000ms
 * @param {string} [options.type='info'] - 消息类型，可选 'info' | 'success' | 'warning' | 'error'
 * @param {boolean} [options.allowMultiple=false] - 是否允许多条消息同时存在
 * @returns {void}
 * @throws {TypeError} 当 message 不是字符串时抛出错误
 */
function showToast(message, options = {}) {
	// 参数校验
	if (typeof message !== 'string') {
		throw new TypeError('Parameter "message" must be a string.');
	}
	try {
		// 默认配置
		const config = {
			duration: 3000,
			type: 'info',
			allowMultiple: false,
			...options,
		};
		const validTypes = ['info', 'success', 'warning', 'error'];
		if (!validTypes.includes(config.type)) {
			console.warn(`不存在的消息类型"${config.type}"`);
			config.type = 'info';
		}
		let toastContainer = document.getElementById('__toast-container');
		if (!toastContainer) {
			toastContainer = document.createElement('div');
			toastContainer.id = '__toast-container';
			toastContainer.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 80vw;
                pointer-events: none;
            `;
			document.body.appendChild(toastContainer);
		}
		if (!config.allowMultiple) {
			toastContainer.innerHTML = '';
		}
		const toastEl = document.createElement('div');
		toastEl.textContent = message;
		toastEl.style.cssText = `
            background: ${
				config.type === 'success' ? '#4caf50' : config.type === 'warning' ? '#ff9800' : config.type === 'error' ? '#f44336' : '#333'
			};
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            margin-top: 8px;
            font-size: 14px;
            line-height: 1.4;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.3s ease, transform 0.3s ease;
            animation: __toast-fade-in 0.3s forwards;
            pointer-events: auto;
            word-break: break-word;
        `;
		if (!document.getElementById('__toast-styles')) {
			const styleEl = document.createElement('style');
			styleEl.id = '__toast-styles';
			styleEl.textContent = `
                @keyframes __toast-fade-in {
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes __toast-fade-out {
                    to { opacity: 0; transform: translateY(20px); }
                }
            `;
			document.head.appendChild(styleEl);
		}
		toastContainer.appendChild(toastEl);
		requestAnimationFrame(() => {
			toastEl.style.animation = '__toast-fade-in 0.3s forwards';
		});
		const removeToast = () => {
			if (!toastEl.parentNode) return;
			toastEl.style.animation = '__toast-fade-out 0.3s forwards';
			setTimeout(() => {
				if (toastEl.parentNode) {
					toastEl.parentNode.removeChild(toastEl);
				}
			}, 300);
		};
		if (config.duration > 0) {
			setTimeout(removeToast, config.duration);
		}
		toastEl.addEventListener('click', removeToast, { once: true });
	} catch (error) {
		console.error('显示消息异常', error);
	}
}

/**
 * 激活 ECT AI 辅助功能
 *
 * 此函数负责：
 * 1. 检查 Ace 编辑器是否存在
 * 2. 尝试连接后端 AI 服务（/health 接口）
 * 3. 初始化运行按钮拦截与智能注释功能
 *
 * @returns {void}
 */
async function activateECTAI() {
	if (window.__eda_ai_injected__) {
		eda.sys_Message.showToastMessage('服务已连接，请勿重复唤起', 'info', 1);
		return;
	}
	window.__eda_ai_injected__ = true;

	if (typeof ace === 'undefined') {
		console.error('[AI Assist] Ace 编辑器未加载');
		eda.sys_Message.showToastMessage('Ace 编辑器未加载', 'error');
		return;
	}

	let editor;
	try {
		editor = ace.edit('editor');
	} catch (e) {
		console.error('[AI Assist] 无法获取编辑器:', e);
		eda.sys_Message.showToastMessage('无法获取编辑器', 'error');
		return;
	}

	window._ai_editor = editor;

	// 后端健康检查配置
	const BACKEND_URL = 'http://localhost:5000';
	const MAX_RETRIES = 5;
	const INTERVAL_MS = 1;

	let isConnected = false;
	let retryCount = 0;

	/**
	 * 检查后端健康状态
	 *
	 * @returns {Promise<boolean>} 是否连接成功且配置完整
	 */
	const checkHealth = async () => {
		try {
			const res = await fetch(`${BACKEND_URL}/health`, { method: 'GET' });
			if (res.ok) {
				const data = await res.json();
				if (data.status === 'ok' && data.sk_set) {
					isConnected = true;
					eda.sys_Message.showToastMessage('连接成功！', 'success');
					return true;
				} else {
					console.warn('[AI Assist] 后端配置不完整:', data);
					return false;
				}
			}
		} catch (err) {
			console.warn('[AI Assist] 健康检查失败:', err.message);
		}
		return false;
	};

	// 初始提示
	eda.sys_Message.showToastMessage('正在尝试连接AI服务器...');

	while (retryCount < MAX_RETRIES && !isConnected) {
		if (retryCount > 0) {
			await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
			eda.sys_Message.showToastMessage('正在尝试链接AI服务器...');
		}

		isConnected = await checkHealth();
		retryCount++;
	}

	if (!isConnected) {
		eda.sys_Message.showToastMessage('连接超时：无法连接到AI服务器', 'error');
		return;
	}

	/**
	 * 显示自定义 ECT 错误分析提示框
	 *
	 * @param {string} message - 要显示的错误解释文本
	 * @param {boolean} [isPersistent=false] - 是否为持久提示（不自动消失）
	 * @returns {Function} 清理函数，用于手动移除提示
	 */
	function showECTMessage(message, isPersistent = false) {
		const existing = document.getElementById('ect-toast');
		if (existing) existing.remove();

		const container = document.createElement('div');
		container.id = 'ect-toast';
		container.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 600px;
            background: #1e1e1e;
            color: #f0f0f0;
            border-radius: 16px;
            padding: 20px;
            box-shadow:
                inset 8px 8px 16px #161616,
                inset -8px -8px 16px #282828;
            z-index: 10000;
            font-size: 14px;
            line-height: 1.5;
            display: flex;
            flex-direction: column;
            gap: 12px;
        `;

		const progressContainer = document.createElement('div');
		progressContainer.style.cssText = `
            height: 4px;
            width: 100%;
            background: #2a2a2a;
            border-radius: 2px;
            overflow: hidden;
            box-shadow:
                inset 2px 2px 4px #161616,
                inset -2px -2px 4px #282828;
        `;

		const progressBar = document.createElement('div');
		progressBar.style.cssText = `
            height: 100%;
            width: 100%;
            background: #4caf50;
            border-radius: 2px;
            transition: width 0.1s linear;
        `;
		progressContainer.appendChild(progressBar);

		const contentWrapper = document.createElement('div');
		contentWrapper.style.display = 'flex';
		contentWrapper.style.justifyContent = 'space-between';
		contentWrapper.style.alignItems = 'flex-start';

		const textEl = document.createElement('span');
		textEl.textContent = message;
		textEl.style.flex = '1';
		textEl.style.wordBreak = 'break-word';
		textEl.style.marginRight = '12px';

		const buttonGroup = document.createElement('div');
		buttonGroup.style.display = 'flex';
		buttonGroup.style.gap = '8px';

		const copyBtn = document.createElement('button');
		copyBtn.textContent = '复制';
		copyBtn.style.cssText = `
            background: black;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 12px;
            white-space: nowrap;
            box-shadow:
                inset 2px 2px 4px #0a0a0a,
                inset -2px -2px 4px #1a1a1a;
        `;
		copyBtn.onclick = async () => {
			try {
				await navigator.clipboard.writeText(message);
				copyBtn.textContent = '已复制';
				setTimeout(() => {
					if (copyBtn.parentNode) copyBtn.textContent = '复制';
				}, 1500);
			} catch (err) {
				console.warn('复制失败:', err);
				copyBtn.textContent = '失败';
				setTimeout(() => {
					if (copyBtn.parentNode) copyBtn.textContent = '复制';
				}, 1500);
			}
		};

		const closeBtn = document.createElement('button');
		closeBtn.textContent = '×';
		closeBtn.style.cssText = `
            background: #1e1e1e;
            color: #aaa;
            border: none;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            font-size: 18px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow:
                inset 2px 2px 4px #161616,
                inset -2px -2px 4px #282828;
        `;
		closeBtn.onclick = () => {
			container.remove();
			if (timeoutId) clearTimeout(timeoutId);
		};

		buttonGroup.appendChild(copyBtn);
		buttonGroup.appendChild(closeBtn);

		contentWrapper.appendChild(textEl);
		contentWrapper.appendChild(buttonGroup);

		container.appendChild(progressContainer);
		container.appendChild(contentWrapper);
		document.body.appendChild(container);

		let timeoutId = null;
		let startTime = null;
		let isHovered = false;
		const DURATION = 5000;

		function updateProgress() {
			if (isPersistent || isHovered) return;
			const elapsed = Date.now() - startTime;
			const remaining = DURATION - elapsed;
			if (remaining <= 0) {
				container.remove();
			} else {
				const percent = (remaining / DURATION) * 100;
				progressBar.style.width = `${percent}%`;
				timeoutId = setTimeout(updateProgress, 50);
			}
		}

		function startTimer() {
			if (isPersistent) return;
			startTime = Date.now();
			timeoutId = setTimeout(updateProgress, 50);
		}

		function resetTimer() {
			if (isPersistent) return;
			if (timeoutId) clearTimeout(timeoutId);
			startTimer();
		}

		container.addEventListener('mouseenter', () => {
			isHovered = true;
			if (timeoutId) clearTimeout(timeoutId);
		});

		container.addEventListener('mouseleave', () => {
			isHovered = false;
			resetTimer();
		});

		if (!isPersistent) {
			startTimer();
		}

		return () => {
			if (container.parentNode) container.remove();
			if (timeoutId) clearTimeout(timeoutId);
		};
	}

	/**
	 * 调用 AI 后端服务
	 *
	 * @param {string} prompt - 发送给 AI 的提示文本
	 * @param {string} [mode='comment'] - 模式：'comment' 或 'error'
	 * @returns {Promise<string|null>} AI 返回的文本，若无效则返回 null
	 */
	async function callAI(prompt, mode = 'comment') {
		const backendUrl = `${BACKEND_URL}/chat`;

		try {
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 12000);
			const res = await fetch(backendUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ message: prompt }),
				signal: controller.signal,
			});
			clearTimeout(timeoutId);

			if (!res.ok) {
				const text = await res.text();
				throw new Error(`HTTP ${res.status}: ${text.substring(0, 100)}`);
			}

			if (!res.body) throw new Error('Empty response');

			const reader = res.body.getReader();
			const decoder = new TextDecoder('utf-8');
			let result = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				result += decoder.decode(value, { stream: true });
			}

			let clean = result.trim();

			if (mode === 'comment') {
				clean = clean.replace(/[。.，,！!？?；;…]+$/, '');
				if (!clean || clean.length === 0 || clean.length > 30 || /Error|异常|失败|无法|sorry|undefined|分析失败/i.test(clean)) {
					return null;
				}
			}

			return clean;
		} catch (err) {
			console.error('[AI Assist] 请求失败:', err);
			return mode === 'comment' ? null : 'ECT 分析失败：' + (err.message || '未知错误');
		}
	}

	// 拦截“运行”按钮
	const runBtn = document.getElementById('run-btn');
	if (runBtn) {
		const newBtn = runBtn.cloneNode(true);
		runBtn.parentNode.replaceChild(newBtn, runBtn);
		newBtn.addEventListener('click', async () => {
			const code = editor.getValue().trim();
			if (!code) {
				eda.sys_Message.showToastMessage('代码为空');
				return;
			}
			try {
				(0, eval)(code);
			} catch (error) {
				console.error('执行出错:', error);
				eda.sys_Message.showToastMessage('检测到错误，ECT 正在分析原因...');
				const explanation = await callAI(
					`[ERROR_ANALYSIS] 请用中文简明解释以下 JavaScript 错误：\n错误信息: ${error.message}\n代码:\n${code}`,
					'error',
				);
				if (explanation && !explanation.includes('ECT 分析失败')) {
					showECTMessage(explanation);
				} else {
					showECTMessage(explanation || 'ECT 未能解析该错误');
				}
			}
		});
	}

	// 智能注释功能
	let debounceTimer = null;
	let lastTriggerAt = 0;
	const COOLDOWN = 1500;

	editor.session.on('change', () => {
		const now = Date.now();
		if (now - lastTriggerAt < COOLDOWN) return;

		const cursor = editor.getCursorPosition();
		const currentLine = editor.session.getLine(cursor.row).trim();

		if (/^\/{2}\s*$/.test(currentLine)) {
			clearTimeout(debounceTimer);
			debounceTimer = setTimeout(async () => {
				lastTriggerAt = Date.now();
				const targetRow = cursor.row - 1;
				if (targetRow < 0) {
					eda.sys_Message.showToastMessage('上方无代码可注释');
					return;
				}
				const codeLine = editor.session.getLine(targetRow).trim();
				if (!codeLine || codeLine.startsWith('//')) {
					eda.sys_Message.showToastMessage('上方不是有效代码');
					return;
				}

				eda.sys_Message.showToastMessage('ECT 正在生成注释...');
				const comment = await callAI(
					`[LINE_COMMENT] 请为以下 JavaScript 代码行生成一句简短中文注释（10字以内，不要标点）：\n${codeLine}`,
					'comment',
				);

				if (comment !== null) {
					const pos = { row: cursor.row, column: editor.session.getLine(cursor.row).length };
					editor.session.insert(pos, ` ${comment}`);
				} else {
					eda.sys_Message.showToastMessage('ECT 暂无法生成注释');
				}
			}, 600);
		}
	});
}

/**
 * 调用后端服务，将用户提供的 JavaScript 代码注入到立创 EDA 扩展模板中，
 * 生成并下载修改后的 .eext 文件。
 *
 * @async
 * @function generateAndDownloadEext
 * @param {string} jsCode - 要注入到 index.html 中的 JavaScript 代码字符串。
 *                          不得为空或仅包含空白字符。
 * @returns {Promise<void>} 无返回值。成功时触发浏览器下载 .eext 文件；
 *                          失败时抛出错误（如网络错误、后端返回错误等）。
 * @throws {Error} 当 jsCode 无效、网络请求失败或后端返回错误状态时抛出。
 *
 * @example
 * try {
 *   const userScript = "console.log('Hello from EDA extension!');";
 *   await generateAndDownloadEext(userScript);
 * } catch (err) {
 *   console.error('生成扩展失败:', err.message);
 * }
 */
async function generateAndDownloadEext(jsCode) {
	if (!jsCode || typeof jsCode !== 'string' || !jsCode.trim()) {
		throw new Error('jsCode must be a non-empty string');
	}

	const response = await fetch('http://localhost:5000/generate-eext', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ js_code: jsCode.trim() }),
	});

	if (!response.ok) {
		let errorMessage = `请求失败: ${response.status} ${response.statusText}`;
		try {
			const errorData = await response.json();
			errorMessage = errorData.error || errorMessage;
		} catch (e) {
			// 忽略 JSON 解析错误，使用默认消息
		}
		throw new Error(errorMessage);
	}

	const blob = await response.blob();
	const url = window.URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'modified_tool.eext';
	document.body.appendChild(a);
	a.click();
	window.URL.revokeObjectURL(url);
	document.body.removeChild(a);
}
