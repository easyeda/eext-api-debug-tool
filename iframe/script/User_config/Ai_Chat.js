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

	let chatConfig = defaultConfig;
	try {
		const storedConfig = localStorage.getItem('ai_chat_config');
		if (storedConfig) {
			const parsed = JSON.parse(storedConfig);
			chatConfig = { ...defaultConfig, ...parsed };
		}
	} catch (e) {
		console.error('加载配置失败，使用默认配置', e);
	}

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

	if (messageHistory.length > 0 && chatList) {
		messageHistory.forEach((msg) => {
			appendMessage(msg.role, msg.content, false, false);
		});
		chatList.scrollTop = chatList.scrollHeight;
	}

	function addCopyButtons(container) {
		if (!container) return;
		const pres = container.querySelectorAll('pre');
		pres.forEach((pre) => {
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

	function createModal() {
		const overlay = document.createElement('div');
		overlay.className = 'ai-modal-overlay';
		overlay.id = 'ai-settings-modal-overlay';
		overlay.innerHTML = `
            <div class="ai-modal">
                <div class="ai-modal-header">
                    <span class="ai-modal-title">AI 配置设置</span>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <button id="ai-new-chat-btn" class="ai-icon-btn" title="开启新对话 (清空历史)">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        </button>
                        <button class="ai-modal-close" id="ai-modal-close-btn" title="关闭">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
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

		const style = document.createElement('style');
		style.textContent = `
			.ai-icon-btn { background: transparent; border: 1px solid transparent; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #57606a; transition: all 0.2s; padding: 4px; }
			.ai-icon-btn:hover { background-color: #ffeef0; color: #cf222e; border-color: #fdaeb7; }
			.ai-icon-btn svg { display: block; }
		`;
		document.head.appendChild(style);
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

	function startNewChat() {
		messageHistory = [];
		localStorage.removeItem('ai_chat_history');
		if (chatList) chatList.innerHTML = '';
		closeModal();
		if (inputArea) inputArea.focus();
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
		if (!chatConfig.multiTurn) {
			messageHistory = [];
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
		const newChatBtn = modalOverlay.querySelector('#ai-new-chat-btn');
		if (newChatBtn) newChatBtn.onclick = startNewChat;
		modalOverlay.onclick = (e) => {
			if (e.target === modalOverlay) closeModal();
		};
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && modalOverlay?.classList.contains('active')) closeModal();
		});
	}

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
					bubble.querySelectorAll('pre code').forEach((block) => hljs.highlightElement(block));
				}
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

	async function handleSend() {
		const rawText = inputArea.value.trim();
		if (!rawText) return;
		if (!chatConfig.apiKey) {
			alert('请先配置 API Key');
			openModal();
			return;
		}

		appendMessage('user', rawText);
		inputArea.value = '';
		inputArea.style.height = 'auto';
		const loadingElements = appendMessage('system', '', false, true);

		// --- 修改点 1: 强化 System Prompt ---
		const systemInstruction = `
你是一个智能编程助手。你拥有操作当前编辑器的能力。
请严格遵守以下规则：
1. **隐形指令**：如果你需要操作编辑器，请在回复的**最第一行**插入特殊标记。这个标记是系统内部指令，**绝对不要**在标记后向用户解释它，也**不要**把它作为普通文本展示给用户。系统会自动识别并隐藏它。
2. **读取代码**：如果需要查看代码，第一行必须仅包含：[ACTION: READ_CODE]
3. **写入代码**：如果需要写代码，第一行必须仅包含：[ACTION: WRITE_CODE]，紧接着换行后提供完整的代码块（必须包含语言标识，如 \`\`\`javascript）。
   - 示例格式：
     [ACTION: WRITE_CODE]
     \`\`\`javascript
     console.log("Hello");
     \`\`\`
4. **正常回答**：如果不需操作编辑器，直接回答用户问题。
`;

		const currentMessages = [{ role: 'system', content: systemInstruction }, ...messageHistory, { role: 'user', content: rawText }];

		let aiBubble = null;
		let fullResponse = '';
		const originalBtnText = sendBtn.textContent;

		sendBtn.disabled = true;
		sendBtn.textContent = '...';
		sendBtn.style.opacity = '0.6';

		try {
			const response = await fetch(`${chatConfig.baseUrl}/chat/completions`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${chatConfig.apiKey}` },
				body: JSON.stringify({ model: chatConfig.model, messages: currentMessages, stream: false, temperature: 0.7 }),
			});

			if (!response.ok) {
				const errData = await response.json().catch(() => ({ error: { message: '未知错误' } }));
				throw new Error(errData.error?.message || `HTTP ${response.status}`);
			}

			const data = await response.json();
			fullResponse = data.choices?.[0]?.message?.content || '无内容';

			if (loadingElements && loadingElements.msgDiv) loadingElements.msgDiv.remove();

			await processAiActions(fullResponse, 0);
		} catch (error) {
			console.error(error);
			if (loadingElements && loadingElements.msgDiv) loadingElements.msgDiv.remove();
			showError(error.message);
			resetSendButton();
		}

		async function processAiActions(responseText, depth = 0) {
			if (depth > 2) {
				renderFinalResponse(responseText);
				finishProcess(rawText, responseText);
				return;
			}

			let finalDisplayText = responseText;
			let actionTaken = false;
			let codeToWrite = null;

			// --- 修改点 2: 更鲁棒的指令解析 ---

			// 1. 检查 READ_CODE (允许前后有少量空白)
			if (/^\s*\[ACTION:\s*READ_CODE\]\s*/i.test(responseText)) {
				actionTaken = true;
				// 移除标记行
				finalDisplayText = responseText.replace(/^\s*\[ACTION:\s*READ_CODE\]\s*\n?/i, '').trim();

				let codeContent = '';
				if (typeof editor !== 'undefined' && editor && typeof editor.getValue === 'function') {
					codeContent = editor.getValue();
				}

				if (!codeContent) {
					finalDisplayText = (finalDisplayText || '好的') + '\n\n⚠️ 检测到您想分析代码，但编辑器当前为空。';
				} else {
					const tempLoading = appendMessage('system', '', false, true);
					try {
						const retryMessages = [
							{ role: 'system', content: systemInstruction },
							...messageHistory,
							{ role: 'user', content: rawText },
							{
								role: 'user',
								content: `[系统自动注入]: 这是当前编辑器的代码内容:\n\`\`\`\n${codeContent}\n\`\`\`\n请基于此代码回答用户最初的问题。`,
							},
						];
						const retryResp = await fetch(`${chatConfig.baseUrl}/chat/completions`, {
							method: 'POST',
							headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${chatConfig.apiKey}` },
							body: JSON.stringify({ model: chatConfig.model, messages: retryMessages, temperature: 0.7 }),
						});
						if (retryResp.ok) {
							const retryData = await retryResp.json();
							finalDisplayText = retryData.choices?.[0]?.message?.content || '分析完成';
							if (tempLoading && tempLoading.msgDiv) tempLoading.msgDiv.remove();
							await processAiActions(finalDisplayText, depth + 1);
							return;
						} else {
							throw new Error('二次请求失败');
						}
					} catch (e) {
						if (tempLoading && tempLoading.msgDiv) tempLoading.msgDiv.remove();
						finalDisplayText += '\n\n❌ 自动获取代码后重新生成失败：' + e.message;
					}
				}
			}

			// 2. 检查 WRITE_CODE (允许前后有少量空白)
			// 使用更宽松的正则，匹配 [ACTION: WRITE_CODE] 以及后面所有的内容
			const writeMatch = responseText.match(/^\s*\[ACTION:\s*WRITE_CODE\]\s*\n?([\s\S]*)/i);

			if (writeMatch) {
				actionTaken = true;
				const rawCodeBlock = writeMatch[1].trim();

				// 尝试从 Markdown 代码块中提取纯代码
				// 匹配 ```lang ... ``` 结构
				const mdMatch = rawCodeBlock.match(/^```[\w]*\n([\s\S]*?)\n```$/);

				if (mdMatch) {
					codeToWrite = mdMatch[1]; // 提取出的纯净代码
					// 构造给用户的显示文本：只保留代码块之外的自然语言（如果有）
					// 这里我们简单处理：如果 AI 在代码块后还有话，保留；否则显示成功提示
					const afterCode = rawCodeBlock.replace(/^```[\w]*\n[\s\S]*?\n```/, '').trim();
					finalDisplayText = afterCode ? afterCode : '✅ 代码已写入编辑器。';
				} else {
					// 如果没有 markdown 包裹，假设整个剩余部分都是代码
					codeToWrite = rawCodeBlock;
					finalDisplayText = '✅ 代码已写入编辑器。';
				}

				// 执行写入
				if (typeof editor !== 'undefined' && editor && typeof editor.setValue === 'function') {
					if (chatConfig.stream) {
						await typeWriterWriteToEditor(codeToWrite);
					} else {
						editor.setValue(codeToWrite, -1);
					}
				} else {
					finalDisplayText += '\n\n⚠️ 未检测到编辑器，无法写入。';
				}
			}

			renderFinalResponse(finalDisplayText);
			finishProcess(rawText, finalDisplayText);
		}

		function typeWriterWriteToEditor(text) {
			return new Promise((resolve) => {
				if (!editor) {
					resolve();
					return;
				}
				editor.setValue('', -1);
				let i = 0;
				const speed = 10;
				const chunkSize = 3;

				function type() {
					if (i < text.length) {
						const end = Math.min(i + chunkSize, text.length);
						editor.setValue(text.substring(0, end), -1);
						editor.scrollToLine(editor.session.getLength(), true, true, function () {});
						i = end;
						setTimeout(type, speed);
					} else {
						resolve();
					}
				}
				type();
			});
		}

		function renderFinalResponse(text) {
			if (chatConfig.stream) {
				const streamElements = appendMessage('system', '', true);
				aiBubble = streamElements.bubble;
				let currentIndex = 0;
				const speed = 15;

				const typeWriter = () => {
					if (currentIndex < text.length) {
						aiBubble.textContent = text.slice(0, currentIndex + 1);
						currentIndex++;
						chatList.scrollTop = chatList.scrollHeight;
						setTimeout(typeWriter, speed);
					} else {
						aiBubble.classList.remove('streaming-cursor');
						if (typeof marked !== 'undefined') {
							aiBubble.innerHTML = marked.parse(text);
							if (typeof hljs !== 'undefined') {
								aiBubble.querySelectorAll('pre code').forEach((block) => hljs.highlightElement(block));
							}
							addCopyButtons(aiBubble);
						}
						chatList.scrollTop = chatList.scrollHeight;
					}
				};
				typeWriter();
			} else {
				appendMessage('system', text);
			}
		}

		function finishProcess(userText, aiText) {
			if (chatConfig.multiTurn) {
				messageHistory.push({ role: 'user', content: userText });
				messageHistory.push({ role: 'assistant', content: aiText });
				if (messageHistory.length > 20) messageHistory = messageHistory.slice(-20);
				try {
					localStorage.setItem('ai_chat_history', JSON.stringify(messageHistory));
				} catch (e) {
					console.error(e);
				}
			}
			resetSendButton();
		}

		function resetSendButton() {
			sendBtn.disabled = false;
			sendBtn.textContent = originalBtnText;
			sendBtn.style.opacity = '1';
			inputArea.focus();
		}

		function showError(msg) {
			const isDark = getComputedStyle(document.body).backgroundColor === 'rgb(39, 40, 34)';
			const errStyle = isDark
				? `background:#5a2d2d; border-color:#8b3a3a; color:#ffaaaa;`
				: `background:#ffeef0; border-color:#fdaeb7; color:#cf222e;`;
			const errDiv = document.createElement('div');
			errDiv.className = 'ai-message ai-message-system';
			errDiv.innerHTML = `<div class="ai-message-bubble" style="${errStyle}">❌ 错误：${msg}</div>`;
			chatList.appendChild(errDiv);
			chatList.scrollTop = chatList.scrollHeight;
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
