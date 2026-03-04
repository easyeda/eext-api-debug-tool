function initAiChat() {
	const defaultConfig = {
		apiKey: '',
		baseUrl: 'https://api.openai.com/v1',
		model: 'gpt-4',
		multiTurn: true,
		stream: true, // 控制是否开启“打字机效果”
	};

	let chatConfig = JSON.parse(localStorage.getItem('ai_chat_config')) || defaultConfig;
	let messageHistory = [];

	// DOM 元素
	const settingsBtn = document.getElementById('ai-settings-trigger');
	const sendBtn = document.getElementById('ai-send-btn');
	const inputArea = document.getElementById('ai-input');
	const chatList = document.getElementById('ai-chat-list');
	const modelNameDisplay = document.getElementById('ai-model-name');

	if (modelNameDisplay) modelNameDisplay.textContent = chatConfig.model || 'AI Model';

	// --- 模态框创建 ---
	function createModal() {
		const overlay = document.createElement('div');
		overlay.className = 'ai-modal-overlay';
		overlay.id = 'ai-settings-modal-overlay';
		overlay.innerHTML = `
            <div class="ai-modal">
                <div class="ai-modal-header">
                    <span class="ai-modal-title">AI 配置设置</span>
                    <button class="ai-modal-close" id="ai-modal-close-btn" title="关闭">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div class="ai-modal-body">
                    <div class="ai-form-group">
                        <label class="ai-form-label">API Key</label>
                        <input type="password" id="cfg-api-key" class="ai-form-input" value="${chatConfig.apiKey}">
                    </div>
                    <div class="ai-form-group">
                        <label class="ai-form-label">Base URL</label>
                        <input type="text" id="cfg-base-url" class="ai-form-input" value="${chatConfig.baseUrl}">
                    </div>
                    <div class="ai-form-group">
                        <label class="ai-form-label">Model Name</label>
                        <input type="text" id="cfg-model" class="ai-form-input" value="${chatConfig.model}">
                    </div>
                    <hr style="border: 0; border-top: 1px solid #3e3d32; margin: 4px 0;">
                    <div class="ai-toggle-row">
                        <span class="ai-toggle-label">多轮对话</span>
                        <label class="ai-switch"><input type="checkbox" id="cfg-multi-turn" ${chatConfig.multiTurn ? 'checked' : ''}><span class="ai-slider"></span></label>
                    </div>
                    <div class="ai-toggle-row">
                        <span class="ai-toggle-label">流式输出</span>
                        <label class="ai-switch"><input type="checkbox" id="cfg-stream" ${chatConfig.stream ? 'checked' : ''}><span class="ai-slider"></span></label>
                    </div>
                </div>
                <div class="ai-modal-footer">
                    <button class="ai-btn ai-btn-cancel" id="ai-modal-cancel-btn">取消</button>
                    <button class="ai-btn ai-btn-save" id="ai-modal-save-btn">保存配置</button>
                </div>
            </div>`;
		document.body.appendChild(overlay);
		return overlay;
	}

	let modalOverlay = null;

	function openModal() {
		if (!modalOverlay) {
			modalOverlay = createModal();
			bindModalEvents();
		}
		document.getElementById('cfg-api-key').value = chatConfig.apiKey;
		document.getElementById('cfg-base-url').value = chatConfig.baseUrl;
		document.getElementById('cfg-model').value = chatConfig.model;
		document.getElementById('cfg-multi-turn').checked = chatConfig.multiTurn;
		document.getElementById('cfg-stream').checked = chatConfig.stream;

		setTimeout(() => modalOverlay.classList.add('active'), 10);
	}

	function closeModal() {
		if (modalOverlay) modalOverlay.classList.remove('active');
	}

	function saveConfigFromModal() {
		const newConfig = {
			apiKey: document.getElementById('cfg-api-key').value.trim(),
			baseUrl: document.getElementById('cfg-base-url').value.trim().replace(/\/$/, ''),
			model: document.getElementById('cfg-model').value.trim() || 'gpt-4',
			multiTurn: document.getElementById('cfg-multi-turn').checked,
			stream: document.getElementById('cfg-stream').checked,
		};
		if (!newConfig.apiKey) {
			alert('请填写 API Key');
			return;
		}

		chatConfig = newConfig;
		localStorage.setItem('ai_chat_config', JSON.stringify(chatConfig));
		if (!chatConfig.multiTurn) messageHistory = [];
		if (modelNameDisplay) modelNameDisplay.textContent = chatConfig.model;
		closeModal();
	}

	function bindModalEvents() {
		if (!modalOverlay) return;
		modalOverlay.querySelector('#ai-modal-close-btn').onclick = closeModal;
		modalOverlay.querySelector('#ai-modal-cancel-btn').onclick = closeModal;
		modalOverlay.querySelector('#ai-modal-save-btn').onclick = saveConfigFromModal;
		modalOverlay.onclick = (e) => {
			if (e.target === modalOverlay) closeModal();
		};
		document.onkeydown = (e) => {
			if (e.key === 'Escape' && modalOverlay?.classList.contains('active')) closeModal();
		};
	}

	// --- 消息渲染 ---
	function appendMessage(role, text, isStreaming = false, isLoading = false) {
		const msgDiv = document.createElement('div');
		msgDiv.className = `ai-message ${role === 'user' ? 'ai-message-user' : 'ai-message-system'}`;

		const bubble = document.createElement('div');
		bubble.className = 'ai-message-bubble';

		if (isLoading) {
			// 加载状态：添加特定的 ID 和 loading 类
			msgDiv.id = 'ai-loading-message';
			bubble.classList.add('ai-loading-bubble');
			// 内部放入三个跳动的点 (HTML 结构)
			bubble.innerHTML = '<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>';
		} else if (isStreaming) {
			bubble.id = 'streaming-bubble-' + Date.now();
			bubble.textContent = '';
			bubble.style.borderRight = '2px solid #66d9ef';
			bubble.style.animation = 'blink 1s step-end infinite';
		} else {
			bubble.textContent = text;
		}

		msgDiv.appendChild(bubble);
		chatList.appendChild(msgDiv);
		chatList.scrollTop = chatList.scrollHeight;
		return isStreaming || isLoading ? { msgDiv, bubble } : null;
	}

	// --- 核心发送逻辑 ---
	async function handleSend() {
		const text = inputArea.value.trim();
		if (!text) return;

		if (!chatConfig.apiKey) {
			alert('请先配置 API Key');
			openModal();
			return;
		}

		// 1. UI: 用户消息
		appendMessage('user', text);
		inputArea.value = '';
		inputArea.style.height = 'auto';

		// 2. UI: 显示 "AI 正在思考..." 加载气泡
		const loadingElements = appendMessage('system', '', false, true);

		// 准备历史
		const currentMessages = [...messageHistory, { role: 'user', content: text }];

		let aiBubble = null;
		let fullResponse = '';
		const originalBtnText = sendBtn.textContent;

		// UI: 锁定按钮
		sendBtn.disabled = true;
		sendBtn.textContent = '...';
		sendBtn.style.opacity = '0.6';

		try {
			// 3. 发起请求 (始终非流式)
			const response = await fetch(`${chatConfig.baseUrl}/chat/completions`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${chatConfig.apiKey}`,
				},
				body: JSON.stringify({
					model: chatConfig.model,
					messages: currentMessages,
					stream: false,
					temperature: 0.7,
				}),
			});

			if (!response.ok) {
				const errData = await response.json().catch(() => ({ error: { message: '未知错误' } }));
				throw new Error(errData.error?.message || `HTTP ${response.status}`);
			}

			const data = await response.json();
			fullResponse = data.choices?.[0]?.message?.content || '无内容';

			// 4. 移除加载气泡
			if (loadingElements && loadingElements.msgDiv) {
				loadingElements.msgDiv.remove();
			}

			// 5. 根据配置显示内容
			if (chatConfig.stream) {
				// === 打字机模式 ===
				const streamElements = appendMessage('system', '', true);
				aiBubble = streamElements.bubble;

				let currentIndex = 0;
				const speed = 20;

				const typeWriter = () => {
					if (currentIndex < fullResponse.length) {
						aiBubble.textContent += fullResponse.charAt(currentIndex);
						currentIndex++;
						chatList.scrollTop = chatList.scrollHeight;
						setTimeout(typeWriter, speed);
					} else {
						// 结束
						aiBubble.style.borderRight = 'none';
						aiBubble.style.animation = 'none';
						finishProcess();
					}
				};
				typeWriter();
			} else {
				// === 直接显示模式 ===
				appendMessage('system', fullResponse);
				finishProcess();
			}

			function finishProcess() {
				if (chatConfig.multiTurn) {
					messageHistory.push({ role: 'user', content: text });
					messageHistory.push({ role: 'assistant', content: fullResponse });
					if (messageHistory.length > 20) messageHistory = messageHistory.slice(-20);
				}
				sendBtn.disabled = false;
				sendBtn.textContent = originalBtnText;
				sendBtn.style.opacity = '1';
				inputArea.focus();
			}
		} catch (error) {
			console.error(error);
			// 移除加载气泡
			if (loadingElements && loadingElements.msgDiv) {
				loadingElements.msgDiv.remove();
			}

			// 显示错误
			const isDark = getComputedStyle(document.body).backgroundColor === 'rgb(39, 40, 34)';
			const errStyle = isDark
				? `background:#5a2d2d; border-color:#8b3a3a; color:#ffaaaa;`
				: `background:#ffeef0; border-color:#fdaeb7; color:#cf222e;`;

			const errDiv = document.createElement('div');
			errDiv.className = 'ai-message ai-message-system';
			errDiv.innerHTML = `<div class="ai-message-bubble" style="${errStyle}">❌ 错误: ${error.message}</div>`;
			chatList.appendChild(errDiv);
			chatList.scrollTop = chatList.scrollHeight;

			sendBtn.disabled = false;
			sendBtn.textContent = originalBtnText;
			sendBtn.style.opacity = '1';
		}
	}

	// 初始化事件
	if (settingsBtn) settingsBtn.onclick = openModal;
	if (sendBtn) sendBtn.onclick = handleSend;

	if (inputArea) {
		inputArea.oninput = function () {
			this.style.height = 'auto';
			this.style.height = this.scrollHeight + 'px';
			if (!this.value) this.style.height = 'auto';
		};
		inputArea.onkeydown = (e) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				handleSend();
			}
		};
	}

	// 注入样式 (Blink 动画 + Loading 跳动动画)
	if (!document.getElementById('ai-chat-animations')) {
		const s = document.createElement('style');
		s.id = 'ai-chat-animations';
		s.textContent = `
            @keyframes blink { 50% { border-color: transparent; } }
            
            /* 加载跳动动画 */
            .ai-loading-bubble {
                display: flex;
                gap: 4px;
                padding: 12px 16px; /* 稍微调整内边距以适应圆点 */
                align-items: center;
                justify-content: center;
                min-width: 60px;
            }
            .ai-loading-bubble .dot {
                font-size: 20px;
                line-height: 1;
                color: inherit; /* 继承气泡文字颜色 */
                opacity: 0.6;
                animation: bounce 1.4s infinite ease-in-out both;
            }
            .ai-loading-bubble .dot:nth-child(1) { animation-delay: -0.32s; }
            .ai-loading-bubble .dot:nth-child(2) { animation-delay: -0.16s; }
            
            @keyframes bounce {
                0%, 80%, 100% { transform: scale(0); }
                40% { transform: scale(1); }
            }
        `;
		document.head.appendChild(s);
	}
}

document.addEventListener('DOMContentLoaded', initAiChat);
