// 原生消息类

/**
 * 在页面右下角显示一条临时消息提示（Toast）
 *
 * @param {string} message - 要显示的消息文本，必填
 * @param {Object} [options] - 可选配置项
 * @param {number} [options.duration=3000] - 消息自动消失的毫秒数，默认 3000ms
 * @param {string} [options.type='info'] - 消息类型，可选 'info' | 'success' | 'warning' | 'error'
 * @param {boolean} [options.allowMultiple=false] - 是否允许多条消息同时存在
 *
 * @returns {void}
 *
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

function activateECTAI() {
	if (window.__eda_ai_injected__) {
		console.log('[AI Assist] 已激活，跳过重复注入');
		return;
	}
	window.__eda_ai_injected__ = true;

	if (typeof ace === 'undefined') {
		console.error('[AI Assist] Ace 编辑器未加载');
		return;
	}

	let editor;
	try {
		editor = ace.edit('editor');
	} catch (e) {
		console.error('[AI Assist] 无法获取编辑器:', e);
		return;
	}

	window._ai_editor = editor;

	// ========== 原生 Toast（用于注释、加载等简单提示）==========
	const safeShowToast =
		typeof window.showToast === 'function'
			? (msg) => {
					console.log('[TOAST]', msg);
					window.showToast(msg);
				}
			: (msg) => console.warn('[FALLBACK TOAST]', msg);

	// ========== 自定义 ECT 错误分析提示（暗色 + 进度条 + 精确重置倒计时）==========
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

		// 进度条容器
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

		// 内容与按钮区
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

		// 复制按钮
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

		// 关闭按钮
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

		// ====== 精确倒计时（悬停离开后重置为完整5秒）======
		let timeoutId = null;
		let startTime = null;
		let isHovered = false;
		const DURATION = 5000; // 5秒

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
			startTimer(); // 重新开始完整5秒
		}

		container.addEventListener('mouseenter', () => {
			isHovered = true;
			if (timeoutId) clearTimeout(timeoutId);
		});

		container.addEventListener('mouseleave', () => {
			isHovered = false;
			resetTimer(); // ⭐ 关键：离开后重新计时5秒
		});

		if (!isPersistent) {
			startTimer();
		}

		// 返回清理函数（当前未使用，但保留接口）
		return () => {
			if (container.parentNode) container.remove();
			if (timeoutId) clearTimeout(timeoutId);
		};
	}

	// ✅ 修正：直接处理纯文本流（不再解析 SSE）
	async function callAI(prompt, mode = 'comment') {
		const backendUrl = 'http://localhost:5000/chat';

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

			// ✅ 仅对注释模式做严格过滤；错误分析模式不过滤
			if (mode === 'comment') {
				clean = clean.replace(/[。.，,！!？?；;…]+$/, '');
				if (
					!clean ||
					clean.length === 0 ||
					clean.length > 30 || // ← 限制注释长度
					/Error|异常|失败|无法|sorry|undefined|分析失败/i.test(clean)
				) {
					return null; // 表示无效注释
				}
			}

			return clean;
		} catch (err) {
			console.error('[AI Assist] 请求失败:', err);
			return mode === 'comment' ? null : 'ECT 分析失败：' + (err.message || '未知错误');
		}
	}

	// ========== 拦截“运行”按钮 ==========
	const runBtn = document.getElementById('run-btn');
	if (runBtn) {
		const newBtn = runBtn.cloneNode(true);
		runBtn.parentNode.replaceChild(newBtn, runBtn);
		newBtn.addEventListener('click', async () => {
			const code = editor.getValue().trim();
			if (!code) {
				safeShowToast('代码为空');
				return;
			}
			try {
				(0, eval)(code);
			} catch (error) {
				console.error('❌ 执行出错:', error);
				safeShowToast('检测到错误，ECT 正在分析原因...');
				const explanation = await callAI(
					`[ERROR_ANALYSIS] 请用中文简明解释以下 JavaScript 错误：\n错误信息: ${error.message}\n代码:\n${code}`,
					'error',
				);
				// ✅ 关键修改：错误分析结果用 showECTMessage 显示（不是 showToast）
				if (explanation && !explanation.includes('ECT 分析失败')) {
					showECTMessage(explanation);
				} else {
					showECTMessage(explanation || 'ECT 未能解析该错误');
				}
			}
		});
	}

	// ========== 智能注释 ==========
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
					safeShowToast('上方无代码可注释');
					return;
				}
				const codeLine = editor.session.getLine(targetRow).trim();
				if (!codeLine || codeLine.startsWith('//')) {
					safeShowToast('上方不是有效代码');
					return;
				}

				safeShowToast('ECT 正在生成注释...');
				const comment = await callAI(
					`[LINE_COMMENT] 请为以下 JavaScript 代码行生成一句简短中文注释（10字以内，不要标点）：\n${codeLine}`,
					'comment',
				);

				if (comment !== null) {
					const pos = { row: cursor.row, column: editor.session.getLine(cursor.row).length };
					editor.session.insert(pos, ` ${comment}`);
				} else {
					safeShowToast('ECT 暂无法生成注释');
				}
			}, 600);
		}
	});

	console.log('[AI Assist] ECT AI 已激活 ✅');
}
