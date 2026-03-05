async function SetVibeCodingConfig() {
	const flag = await eda.sys_Storage.getExtensionUserConfig('Vibe_Coding_Config');
	if (flag == 'true') {
		eda.sys_Storage.setExtensionUserConfig('Vibe_Coding_Config', 'false');
		const chatEl = document.getElementById('ai-chat');
		if (chatEl) chatEl.style.display = 'none';
		const btn = document.getElementById('ai-btn');
		if (btn) btn.innerText = 'AI编程：关';
	} else {
		eda.sys_Storage.setExtensionUserConfig('Vibe_Coding_Config', 'true');
		const chatEl = document.getElementById('ai-chat');
		if (chatEl) chatEl.style.display = '';
		const btn = document.getElementById('ai-btn');
		if (btn) btn.innerText = 'AI编程：开';
	}
}

async function GetVibeCodingConfig() {
	const flag = await eda.sys_Storage.getExtensionUserConfig('Vibe_Coding_Config');
	const btn = document.getElementById('ai-btn');
	if (!btn) return;

	const chatEl = document.getElementById('ai-chat');

	if (flag == 'true') {
		btn.innerText = 'AI编程：开';
		if (chatEl) chatEl.style.display = '';
	} else {
		btn.innerText = 'AI编程：关';
		if (chatEl) chatEl.style.display = 'none';
	}
}

function initAiChat() {
	// 检查依赖库
	if (typeof marked === 'undefined' || typeof hljs === 'undefined') {
		console.error('AI Chat Init Error: marked or highlight.js not found.');
		return;
	} else {
		marked.setOptions({
			highlight: function (code, lang) {
				const language = hljs.getLanguage(lang) ? lang : 'plaintext';
				return hljs.highlight(code, { language }).value;
			},
			langPrefix: 'hljs language-',
			breaks: true,
			gfm: true,
		});
	}

	const defaultConfig = {
		apiKey: '',
		baseUrl: 'https://api.openai.com/v1',
		model: 'gpt-4',
		multiTurn: true,
		stream: true,
	};

	// --- 修复 1: 安全地加载配置 ---
	let chatConfig = defaultConfig;
	try {
		const storedConfig = localStorage.getItem('ai_chat_config');
		if (storedConfig) {
			const parsed = JSON.parse(storedConfig);
			// 合并默认配置，防止旧配置缺少新字段
			chatConfig = { ...defaultConfig, ...parsed };
		}
	} catch (e) {
		console.error('加载配置失败，使用默认配置', e);
	}

	// --- 修复 2: 安全地加载历史记录 ---
	let messageHistory = [];
	try {
		const storedHistory = localStorage.getItem('ai_chat_history');
		if (storedHistory) {
			messageHistory = JSON.parse(storedHistory);
		}
	} catch (e) {
		console.error('加载历史记录失败，清空历史', e);
		messageHistory = [];
	}

	const settingsBtn = document.getElementById('ai-settings-trigger');
	const sendBtn = document.getElementById('ai-send-btn');
	const inputArea = document.getElementById('ai-input');
	const chatList = document.getElementById('ai-chat-list');
	const modelNameDisplay = document.getElementById('ai-model-name');

	if (modelNameDisplay) modelNameDisplay.textContent = chatConfig.model || 'AI Model';

	// --- 修复 3: 初始化时渲染历史消息 ---
	if (messageHistory.length > 0 && chatList) {
		messageHistory.forEach((msg) => {
			// 重新渲染历史消息到界面
			// 注意：这里直接调用 appendMessage，它会自动处理 markdown 和高亮
			appendMessage(msg.role, msg.content, false, false);
		});
		// 滚动到底部
		chatList.scrollTop = chatList.scrollHeight;
	}

	// --- 新增：添加复制按钮的逻辑 ---
	function addCopyButtons(container) {
		if (!container) return;

		const pres = container.querySelectorAll('pre');
		pres.forEach((pre) => {
			// 如果已经添加过按钮，跳过
			if (pre.querySelector('.code-copy-btn')) return;

			const codeElement = pre.querySelector('code');
			if (!codeElement) return;

			const btn = document.createElement('button');
			btn.className = 'code-copy-btn';
			btn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span>复制</span>
            `;

			btn.onclick = async () => {
				const text = codeElement.innerText;
				try {
					await navigator.clipboard.writeText(text);
					// 更改按钮状态
					const originalContent = btn.innerHTML;
					btn.classList.add('copied');
					btn.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <span>已复制</span>
                    `;

					setTimeout(() => {
						btn.classList.remove('copied');
						btn.innerHTML = originalContent;
					}, 2000);
				} catch (err) {
					console.error('复制失败:', err);
					alert('复制失败，请手动复制');
				}
			};

			pre.appendChild(btn);
		});
	}

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
                        <input type="password" id="cfg-api-key" class="ai-form-input" value="${chatConfig.apiKey || ''}">
                    </div>
                    <div class="ai-form-group">
                        <label class="ai-form-label">Base URL</label>
                        <input type="text" id="cfg-base-url" class="ai-form-input" value="${chatConfig.baseUrl || ''}">
                    </div>
                    <div class="ai-form-group">
                        <label class="ai-form-label">Model Name</label>
                        <input type="text" id="cfg-model" class="ai-form-input" value="${chatConfig.model || ''}">
                    </div>
                    <hr style="border: 0; border-top: 1px solid #d0d7de; margin: 4px 0;">
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
		document.getElementById('cfg-api-key').value = chatConfig.apiKey || '';
		document.getElementById('cfg-base-url').value = chatConfig.baseUrl || '';
		document.getElementById('cfg-model').value = chatConfig.model || '';
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
		// 保存配置到 localStorage
		localStorage.setItem('ai_chat_config', JSON.stringify(chatConfig));

		if (!chatConfig.multiTurn) {
			messageHistory = [];
			// 如果关闭多轮对话，清空界面和历史存储
			if (chatList) chatList.innerHTML = '';
			localStorage.removeItem('ai_chat_history');
		}

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
		if (!chatList) return null;

		const msgDiv = document.createElement('div');
		msgDiv.className = `ai-message ${role === 'user' ? 'ai-message-user' : 'ai-message-system'}`;
		const bubble = document.createElement('div');
		bubble.className = 'ai-message-bubble';

		if (isLoading) {
			msgDiv.id = 'ai-loading-message';
			bubble.classList.add('ai-loading-bubble');
			bubble.innerHTML = '<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>';
		} else if (isStreaming) {
			bubble.id = 'streaming-bubble-' + Date.now();
			bubble.textContent = text;
			bubble.classList.add('streaming-cursor');
			bubble.style.whiteSpace = 'pre-wrap';
		} else {
			if (role === 'system' && typeof marked !== 'undefined') {
				bubble.innerHTML = marked.parse(text);
				if (typeof hljs !== 'undefined') {
					bubble.querySelectorAll('pre code').forEach((block) => {
						hljs.highlightElement(block);
					});
				}
				// 渲染完成后添加复制按钮
				addCopyButtons(bubble);
			} else {
				bubble.textContent = text;
				bubble.style.whiteSpace = 'pre-wrap';
			}
		}

		msgDiv.appendChild(bubble);
		chatList.appendChild(msgDiv);
		chatList.scrollTop = chatList.scrollHeight;
		return isStreaming || isLoading ? { msgDiv, bubble } : null;
	}

	// --- 核心发送逻辑 ---
	async function handleSend() {
		const rawText = inputArea.value.trim();
		if (!rawText) return;

		if (!chatConfig.apiKey) {
			alert('请先配置 API Key');
			openModal();
			return;
		}

		// --- 检测“理解代码”类指令并自动获取编辑器内容 ---
		let finalUserText = rawText;
		const codeKeywords = [
			'理解我的代码',
			'分析这段代码',
			'解释代码',
			'看我的代码',
			'帮我优化代码',
			'代码有什么问题',
			'检查代码错误',
			'重构这段代码',
		];

		const shouldFetchCode = codeKeywords.some((keyword) => rawText.includes(keyword));

		if (shouldFetchCode) {
			if (typeof editor !== 'undefined' && editor && typeof editor.getValue === 'function') {
				const currentCode = editor.getValue();

				if (!currentCode || currentCode.trim() === '') {
					finalUserText = `${rawText}\n\n[注意：当前编辑器内容为空，无法提供代码供你分析。]`;
				} else {
					finalUserText = `${rawText}\n\n以下是当前编辑器中的代码:\n\`\`\`\n${currentCode}\n\`\`\``;
					console.log('已自动抓取编辑器代码并附加到请求中');
				}
			} else {
				console.warn('未检测到 editor 对象，无法自动获取代码。');
			}
		}

		// 界面上显示用户原始输入
		appendMessage('user', rawText);
		inputArea.value = '';
		inputArea.style.height = 'auto';

		const loadingElements = appendMessage('system', '', false, true);

		// 发送时使用 finalUserText
		const currentMessages = [...messageHistory, { role: 'user', content: finalUserText }];

		let aiBubble = null;
		let fullResponse = '';
		const originalBtnText = sendBtn.textContent;

		sendBtn.disabled = true;
		sendBtn.textContent = '...';
		sendBtn.style.opacity = '0.6';

		try {
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

			if (loadingElements && loadingElements.msgDiv) {
				loadingElements.msgDiv.remove();
			}

			if (chatConfig.stream) {
				const streamElements = appendMessage('system', '', true);
				aiBubble = streamElements.bubble;

				let currentIndex = 0;
				const speed = 15;

				const typeWriter = () => {
					if (currentIndex < fullResponse.length) {
						const currentText = fullResponse.slice(0, currentIndex + 1);
						aiBubble.textContent = currentText;
						currentIndex++;
						chatList.scrollTop = chatList.scrollHeight;
						setTimeout(typeWriter, speed);
					} else {
						aiBubble.classList.remove('streaming-cursor');

						if (typeof marked !== 'undefined') {
							aiBubble.innerHTML = marked.parse(fullResponse);

							if (typeof hljs !== 'undefined') {
								aiBubble.querySelectorAll('pre code').forEach((block) => {
									hljs.highlightElement(block);
								});
							}
							addCopyButtons(aiBubble);
						}
						chatList.scrollTop = chatList.scrollHeight;
						finishProcess();
					}
				};
				typeWriter();
			} else {
				appendMessage('system', fullResponse);
				finishProcess();
			}

			function finishProcess() {
				if (chatConfig.multiTurn) {
					// 更新内存中的历史
					messageHistory.push({ role: 'user', content: finalUserText });
					messageHistory.push({ role: 'assistant', content: fullResponse });

					// 限制长度
					if (messageHistory.length > 20) messageHistory = messageHistory.slice(-20);

					// --- 修复 4: 持久化保存历史记录 ---
					try {
						localStorage.setItem('ai_chat_history', JSON.stringify(messageHistory));
					} catch (e) {
						console.error('保存历史记录失败:', e);
						// 如果存储满了，可以尝试清除最早的记录或提示用户
						if (e.name === 'QuotaExceededError') {
							alert('本地存储空间已满，历史对话可能无法保存。');
						}
					}
				}

				sendBtn.disabled = false;
				sendBtn.textContent = originalBtnText;
				sendBtn.style.opacity = '1';
				inputArea.focus();
			}
		} catch (error) {
			console.error(error);
			if (loadingElements && loadingElements.msgDiv) {
				loadingElements.msgDiv.remove();
			}

			const isDark = getComputedStyle(document.body).backgroundColor === 'rgb(39, 40, 34)';
			const errStyle = isDark
				? `background:#5a2d2d; border-color:#8b3a3a; color:#ffaaaa;`
				: `background:#ffeef0; border-color:#fdaeb7; color:#cf222e;`;

			const errDiv = document.createElement('div');
			errDiv.className = 'ai-message ai-message-system';
			errDiv.innerHTML = `<div class="ai-message-bubble" style="${errStyle}">❌ 错误：${error.message}</div>`;
			chatList.appendChild(errDiv);
			chatList.scrollTop = chatList.scrollHeight;

			sendBtn.disabled = false;
			sendBtn.textContent = originalBtnText;
			sendBtn.style.opacity = '1';
		}
	}

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
}

document.addEventListener('DOMContentLoaded', initAiChat);
