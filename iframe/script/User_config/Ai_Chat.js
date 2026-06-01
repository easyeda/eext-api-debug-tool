async function SetVibeCodingConfig() {
	let flag;
	try { flag = await eda.sys_Storage.getExtensionUserConfig('Vibe_Coding_Config'); } catch (e) {}
	if (flag == 'true') {
		try { eda.sys_Storage.setExtensionUserConfig('Vibe_Coding_Config', 'false'); } catch (e) {}
		const chatEl = document.getElementById('ai-chat');
		if (chatEl) chatEl.style.display = 'none';
		const btn = document.getElementById('ai-btn');
		if (btn) btn.innerText = 'Copilot：关';
	} else {
		try { eda.sys_Storage.setExtensionUserConfig('Vibe_Coding_Config', 'true'); } catch (e) {}
		const chatEl = document.getElementById('ai-chat');
		if (chatEl) chatEl.style.display = '';
		const btn = document.getElementById('ai-btn');
		if (btn) btn.innerText = 'Copilot：开';
	}
}

async function GetVibeCodingConfig() {
	let flag;
	try { flag = await eda.sys_Storage.getExtensionUserConfig('Vibe_Coding_Config'); } catch (e) {}
	const btn = document.getElementById('ai-btn');
	if (!btn) return;
	const chatEl = document.getElementById('ai-chat');
	if (flag == 'true') {
		btn.innerText = 'Copilot：开';
		if (chatEl) chatEl.style.display = '';
	} else {
		btn.innerText = 'Copilot：关';
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

	const defaultProfile = {
		name: '默认',
		apiKey: '',
		baseUrl: 'https://api.openai.com/v1',
		model: 'gpt-4',
		multiTurn: true,
		stream: true,
		temperature: 0.7,
	};

	/* ---- 多配置文件系统 ---- */
	let profiles = [defaultProfile];
	let activeIdx = 0;
	// 迁移旧版单配置 → 新版多配置文件
	try {
		const old = localStorage.getItem('ai_chat_config');
		if (old) {
			const oldCfg = JSON.parse(old);
			profiles = [{ ...defaultProfile, ...oldCfg, name: '默认' }];
			localStorage.setItem('ai_profiles', JSON.stringify(profiles));
			localStorage.removeItem('ai_chat_config');
		}
	} catch (e) {}
	try {
		const saved = localStorage.getItem('ai_profiles');
		if (saved) { const p = JSON.parse(saved); if (Array.isArray(p) && p.length) profiles = p; }
	} catch (e) { console.error('加载配置集失败', e); }
	try {
		const idx = localStorage.getItem('ai_active_profile');
		if (idx !== null) { const n = parseInt(idx); if (n >= 0 && n < profiles.length) activeIdx = n; }
	} catch (e) {}

	function getActive() { return profiles[activeIdx]; }
	function saveProfiles() { localStorage.setItem('ai_profiles', JSON.stringify(profiles)); }
	function saveActiveIdx() { localStorage.setItem('ai_active_profile', String(activeIdx)); }

	let messageHistory = [];
	try {
		const storedHistory = localStorage.getItem('ai_chat_history');
		if (storedHistory) messageHistory = JSON.parse(storedHistory);
	} catch (e) { console.error('加载历史记录失败', e); messageHistory = []; }

	const settingsBtn = document.getElementById('ai-settings-trigger');
	const sendBtn = document.getElementById('ai-send-btn');
	const inputArea = document.getElementById('ai-input');
	const chatList = document.getElementById('ai-chat-list');
	const modelNameDisplay = document.getElementById('ai-model-name');

	function updateModelDisplay() { if (modelNameDisplay) modelNameDisplay.textContent = getActive().model || 'AI Model'; }
	updateModelDisplay();

	if (messageHistory.length > 0 && chatList) {
		messageHistory.forEach((msg) => { appendMessage(msg.role, msg.content, false, false); });
		chatList.scrollTop = chatList.scrollHeight;
	}

	/* ---- Copy buttons ---- */
	function addCopyButtons(container) {
		if (!container) return;
		container.querySelectorAll('pre').forEach((pre) => {
			if (pre.querySelector('.code-copy-btn')) return;
			const codeElement = pre.querySelector('code');
			if (!codeElement) return;
			const btn = document.createElement('button');
			btn.className = 'code-copy-btn';
			btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span>复制</span>`;
			btn.onclick = async () => {
				const text = codeElement.innerText;
				try {
					await navigator.clipboard.writeText(text);
					btn.classList.add('copied');
					btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span>已复制</span>`;
					setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span>复制</span>`; }, 2000);
				} catch (err) { console.error('复制失败:', err); }
			};
			pre.appendChild(btn);
		});
	}

	/* ---- Modal ---- */
	function buildProfileSelector() {
		const cfg = getActive();
		let opts = '';
		profiles.forEach((p, i) => {
			opts += `<option value="${i}" ${i === activeIdx ? 'selected' : ''}>${p.name || '配置 ' + (i + 1)}</option>`;
		});
		return `<div class="ai-form-group"><label class="ai-form-label">配置方案</label>
			<div style="display:flex;gap:6px;align-items:center;">
				<select id="cfg-profile-select" style="flex:1;height:24px;border:1px solid var(--eext-border);border-radius:2px;font-size:12px;background:var(--eext-bg-input);color:var(--eext-text-primary);padding:0 4px;">${opts}</select>
				<button id="cfg-profile-new" title="新建" style="height:24px;padding:0 8px;border:1px solid var(--eext-border);border-radius:2px;font-size:12px;cursor:pointer;background:var(--eext-btn-bg);color:var(--eext-btn-color);white-space:nowrap;">新建</button>
				<button id="cfg-profile-del" title="删除" style="height:24px;padding:0 8px;border:1px solid var(--eext-border);border-radius:2px;font-size:12px;cursor:pointer;background:var(--eext-btn-bg);color:var(--eext-btn-color);white-space:nowrap;${profiles.length <= 1 ? 'display:none;' : ''}">删除</button>
			</div></div>`;
	}

	function createModal() {
		const cfg = getActive();
		const overlay = document.createElement('div');
		overlay.className = 'ai-modal-overlay';
		overlay.id = 'ai-settings-modal-overlay';
		overlay.innerHTML = `<div class="ai-modal">
			<div class="ai-modal-header">
				<span class="ai-modal-title">AI 配置设置</span>
				<div style="display:flex;align-items:center;gap:8px;">
					<button class="ai-modal-close" id="ai-modal-close-btn" title="关闭">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
					</button>
				</div>
			</div>
			<div class="ai-modal-body">
				${buildProfileSelector()}
				<div class="ai-form-group">
					<label class="ai-form-label">API Key</label>
					<div style="position:relative;flex:1;">
						<input type="password" id="cfg-api-key" class="ai-form-input" value="${cfg.apiKey || ''}" style="width:100%;padding-right:40px;">
						<button id="toggle-api-key-visibility" class="api-key-eye-btn" type="button" title="显示/隐藏">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
						</button>
					</div>
				</div>
				<div class="ai-form-group">
					<label class="ai-form-label">Base URL</label>
					<input type="text" id="cfg-base-url" class="ai-form-input" value="${cfg.baseUrl || ''}">
				</div>
				<div class="ai-form-group">
					<label class="ai-form-label">Model Name</label>
					<input type="text" id="cfg-model" class="ai-form-input" value="${cfg.model || ''}">
				</div>
				<div class="ai-form-group">
					<label class="ai-form-label">预设名称</label>
					<input type="text" id="cfg-profile-name" class="ai-form-input" value="${cfg.name || ''}" placeholder="给这个配置起个名字">
				</div>
				<div class="ai-form-group">
					<label class="ai-form-label">Temperature</label>
					<input type="number" id="cfg-temperature" class="ai-form-input" min="0" max="2" step="0.05" value="${cfg.temperature ?? 0.7}">
				</div>
				<hr style="border:0;border-top:1px solid var(--eext-border-light);margin:4px 0;">
				<div class="ai-toggle-row">
					<span class="ai-toggle-label">多轮对话</span>
					<label class="ai-switch"><input type="checkbox" id="cfg-multi-turn" ${cfg.multiTurn ? 'checked' : ''}><span class="ai-slider"></span></label>
				</div>
				<div class="ai-toggle-row">
					<span class="ai-toggle-label">流式输出</span>
					<label class="ai-switch"><input type="checkbox" id="cfg-stream" ${cfg.stream ? 'checked' : ''}><span class="ai-slider"></span></label>
				</div>
				</div>
			<div class="ai-modal-footer">
				<button class="ai-btn ai-btn-cancel" id="ai-modal-cancel-btn">取消</button>
				<button class="ai-btn ai-btn-save" id="ai-modal-save-btn">保存配置</button>
			</div></div>`;

		const style = document.createElement('style');
		style.textContent = `.api-key-eye-btn{position:absolute;right:8px;top:50%;transform:translateY(-50%);background:transparent;border:none;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center;color:#666;transition:color 0.2s;border-radius:4px;}.api-key-eye-btn:hover{color:#1890ff;background:rgba(24,144,255,0.1);}.api-key-eye-btn svg{display:block;}`;
		document.head.appendChild(style);
		document.body.appendChild(overlay);
		return overlay;
	}

	let modalOverlay = null;

	function openModal() {
		if (modalOverlay) { modalOverlay.remove(); modalOverlay = null; }
		modalOverlay = createModal();
		bindModalEvents();
		setTimeout(() => modalOverlay.classList.add('active'), 10);
	}

	function closeModal() {
		if (modalOverlay) modalOverlay.classList.remove('active');
	}

	function startNewChat() {
		messageHistory = [];
		localStorage.removeItem('ai_chat_history');
		if (chatList) chatList.innerHTML = '';
		if (inputArea) inputArea.focus();
	}

	function switchProfile(idx) {
		if (idx === activeIdx) return;
		activeIdx = idx;
		saveActiveIdx();
		updateModelDisplay();
		// 重建 modal 以刷新所有字段
		if (modalOverlay && modalOverlay.classList.contains('active')) {
			modalOverlay.remove(); modalOverlay = null;
			modalOverlay = createModal();
			bindModalEvents();
			modalOverlay.classList.add('active');
		}
	}

	function deleteActiveProfile() {
		if (profiles.length <= 1) return;
		profiles.splice(activeIdx, 1);
		if (activeIdx >= profiles.length) activeIdx = profiles.length - 1;
		saveProfiles();
		saveActiveIdx();
		updateModelDisplay();
		if (modalOverlay && modalOverlay.classList.contains('active')) {
			modalOverlay.remove(); modalOverlay = null;
			modalOverlay = createModal();
			bindModalEvents();
			modalOverlay.classList.add('active');
		}
	}

	function createNewProfile() {
		const newProfile = { name: '配置 ' + (profiles.length + 1), apiKey: '', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4', multiTurn: true, stream: true, temperature: 0.7 };
		profiles.push(newProfile);
		saveProfiles();
		switchProfile(profiles.length - 1);
	}

	function saveConfigFromModal() {
		const cfg = getActive();
		cfg.name = document.getElementById('cfg-profile-name').value.trim() || cfg.name;
		cfg.apiKey = document.getElementById('cfg-api-key').value.trim();
		cfg.baseUrl = document.getElementById('cfg-base-url').value.trim().replace(/\/$/, '');
		cfg.model = document.getElementById('cfg-model').value.trim() || 'gpt-4';
		cfg.multiTurn = document.getElementById('cfg-multi-turn').checked;
		cfg.stream = document.getElementById('cfg-stream').checked;
		cfg.temperature = parseFloat(document.getElementById('cfg-temperature').value) || 0.7;
		if (!cfg.apiKey) { eda.sys_Message.showToastMessage('请填写 API Key', 'warn', 2); return; }
		saveProfiles();
		if (!cfg.multiTurn) {
			messageHistory = [];
			if (chatList) chatList.innerHTML = '';
			localStorage.removeItem('ai_chat_history');
		}
		updateModelDisplay();
		eda.sys_Message.showToastMessage('配置已保存', 'success', 1);
		// 重建 modal 使下拉选项名称同步
		closeModal();
		modalOverlay.remove(); modalOverlay = null;
		modalOverlay = createModal();
		bindModalEvents();
		modalOverlay.classList.add('active');
	}

	function bindModalEvents() {
		if (!modalOverlay) return;
		modalOverlay.querySelector('#ai-modal-close-btn').onclick = closeModal;
		modalOverlay.querySelector('#ai-modal-cancel-btn').onclick = closeModal;
		modalOverlay.querySelector('#ai-modal-save-btn').onclick = saveConfigFromModal;

		// Profile selector
		const profileSel = modalOverlay.querySelector('#cfg-profile-select');
		if (profileSel) profileSel.onchange = () => switchProfile(parseInt(profileSel.value));
		const newBtn = modalOverlay.querySelector('#cfg-profile-new');
		if (newBtn) newBtn.onclick = createNewProfile;
		const delBtn = modalOverlay.querySelector('#cfg-profile-del');
		if (delBtn) delBtn.onclick = deleteActiveProfile;

		// API Key visibility
		const toggleBtn = modalOverlay.querySelector('#toggle-api-key-visibility');
		const apiKeyInput = modalOverlay.querySelector('#cfg-api-key');
		if (toggleBtn && apiKeyInput) {
			toggleBtn.onclick = () => {
				if (apiKeyInput.type === 'password') {
					apiKeyInput.type = 'text';
					toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
				} else {
					apiKeyInput.type = 'password';
					toggleBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
				}
			};
		}

		document.addEventListener('keydown', function escHandler(e) {
			if (e.key === 'Escape' && modalOverlay?.classList.contains('active')) closeModal();
		});
	}

	/* ---- Messages ---- */
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
			if ((role === 'system' || role === 'assistant') && typeof marked !== 'undefined') {
				bubble.innerHTML = marked.parse(text);
				if (typeof hljs !== 'undefined') bubble.querySelectorAll('pre code').forEach((block) => hljs.highlightElement(block));
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

	/* ---- Send ---- */
	async function handleSend() {
		const rawText = inputArea.value.trim();
		if (!rawText) return;
		const cfg = getActive();
		if (!cfg.apiKey) {
			eda.sys_Message.showToastMessage('请先配置 API Key', 'warn', 2);
			openModal();
			return;
		}

		appendMessage('user', rawText);
		inputArea.value = '';
		inputArea.style.height = 'auto';
		const loadingElements = appendMessage('system', '', false, true);

		const systemInstruction = `你是一个智能编程助手。你拥有操作当前编辑器的能力。请严格遵守以下规则：\n1. **隐形指令**：如果你需要操作编辑器，请在回复的**最第一行**插入特殊标记。这个标记是系统内部指令，**绝对不要**在标记后向用户解释它，也**不要**把它作为普通文本展示给用户。系统会自动识别并隐藏它。\n2. **读取代码**：如果需要查看代码，第一行必须仅包含：[ACTION: READ_CODE]\n3. **写入代码**：如果需要写代码，第一行必须仅包含：[ACTION: WRITE_CODE]，紧接着换行后提供完整的代码块（必须包含语言标识，如 \`\`\`javascript）。\n4. **正常回答**：如果不需操作编辑器，直接回答用户问题。`;

		const currentMessages = [{ role: 'system', content: systemInstruction }, ...messageHistory, { role: 'user', content: rawText }];

		let aiBubble = null;
		let fullResponse = '';
		const originalBtnText = sendBtn.textContent;
		sendBtn.disabled = true;
		sendBtn.textContent = '...';
		sendBtn.style.opacity = '0.6';

		try {
			const response = await fetch(`${cfg.baseUrl}/chat/completions`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` },
				body: JSON.stringify({ model: cfg.model, messages: currentMessages, stream: false, temperature: cfg.temperature }),
			});
			if (!response.ok) {
				const errData = await response.json().catch(() => ({ error: { message: '未知错误' } }));
				throw new Error(errData.error?.message || `HTTP ${response.status}`);
			}
			const data = await response.json();
			fullResponse = data.choices?.[0]?.message?.content || '无内容';
			if (loadingElements?.msgDiv) loadingElements.msgDiv.remove();
			await processAiActions(fullResponse, 0);
		} catch (error) {
			console.error(error);
			if (loadingElements?.msgDiv) loadingElements.msgDiv.remove();
			showError(error.message);
			resetSendButton();
		}

		async function processAiActions(responseText, depth) {
			if (depth > 2) { renderFinalResponse(responseText); finishProcess(rawText, responseText); return; }
			let finalDisplayText = responseText;
			let actionTaken = false;
			let codeToWrite = null;

			if (/^\s*\[ACTION:\s*READ_CODE\]\s*/i.test(responseText)) {
				actionTaken = true;
				finalDisplayText = responseText.replace(/^\s*\[ACTION:\s*READ_CODE\]\s*\n?/i, '').trim();
				let codeContent = '';
				if (typeof editor !== 'undefined' && editor && typeof editor.getValue === 'function') codeContent = editor.getValue();
				if (!codeContent) {
					finalDisplayText = (finalDisplayText || '好的') + '\n\n检测到您想分析代码，但编辑器当前为空。';
				} else {
					const tempLoading = appendMessage('system', '', false, true);
					try {
						const retryMessages = [{ role: 'system', content: systemInstruction }, ...messageHistory, { role: 'user', content: rawText }, { role: 'user', content: `[系统自动注入]: 这是当前编辑器的代码内容:\n\`\`\`\n${codeContent}\n\`\`\`\n请基于此代码回答用户最初的问题。` }];
						const retryResp = await fetch(`${cfg.baseUrl}/chat/completions`, {
							method: 'POST',
							headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.apiKey}` },
							body: JSON.stringify({ model: cfg.model, messages: retryMessages, temperature: cfg.temperature }),
						});
						if (retryResp.ok) {
							const retryData = await retryResp.json();
							finalDisplayText = retryData.choices?.[0]?.message?.content || '分析完成';
							if (tempLoading?.msgDiv) tempLoading.msgDiv.remove();
							await processAiActions(finalDisplayText, depth + 1);
							return;
						} else { throw new Error('二次请求失败'); }
					} catch (e) {
						if (tempLoading?.msgDiv) tempLoading.msgDiv.remove();
						finalDisplayText += '\n\n自动获取代码后重新生成失败：' + e.message;
					}
				}
			}

			const writeMatch = responseText.match(/^\s*\[ACTION:\s*WRITE_CODE\]\s*\n?([\s\S]*)/i);
			if (writeMatch) {
				actionTaken = true;
				const rawCodeBlock = writeMatch[1].trim();
				const mdMatch = rawCodeBlock.match(/^```[\w]*\n([\s\S]*?)\n```$/);
				if (mdMatch) {
					codeToWrite = mdMatch[1];
					const afterCode = rawCodeBlock.replace(/^```[\w]*\n[\s\S]*?\n```/, '').trim();
					finalDisplayText = afterCode || '代码已写入编辑器。';
				} else { codeToWrite = rawCodeBlock; finalDisplayText = '代码已写入编辑器。'; }
				if (typeof editor !== 'undefined' && editor && typeof editor.setValue === 'function') {
					if (cfg.stream) await typeWriterWriteToEditor(codeToWrite);
					else editor.setValue(codeToWrite, -1);
				} else { finalDisplayText += '\n\n未检测到编辑器，无法写入。'; }
			}

			renderFinalResponse(finalDisplayText);
			finishProcess(rawText, finalDisplayText);
		}

		function typeWriterWriteToEditor(text) {
			return new Promise((resolve) => {
				if (!editor) { resolve(); return; }
				editor.setValue('', -1);
				let i = 0;
				function type() {
					if (i < text.length) {
						editor.setValue(text.substring(0, Math.min(i + 3, text.length)), -1);
						editor.scrollToLine(editor.session.getLength(), true, true, function () {});
						i = Math.min(i + 3, text.length);
						setTimeout(type, 10);
					} else { resolve(); }
				}
				type();
			});
		}

		function renderFinalResponse(text) {
			if (cfg.stream) {
				const streamElements = appendMessage('system', '', true);
				aiBubble = streamElements.bubble;
				let currentIndex = 0;
				const typeWriter = () => {
					if (currentIndex < text.length) {
						aiBubble.textContent = text.slice(0, currentIndex + 1);
						currentIndex++;
						chatList.scrollTop = chatList.scrollHeight;
						setTimeout(typeWriter, 15);
					} else {
						aiBubble.classList.remove('streaming-cursor');
						if (typeof marked !== 'undefined') {
							aiBubble.innerHTML = marked.parse(text);
							if (typeof hljs !== 'undefined') aiBubble.querySelectorAll('pre code').forEach((block) => hljs.highlightElement(block));
							addCopyButtons(aiBubble);
						}
						chatList.scrollTop = chatList.scrollHeight;
					}
				};
				typeWriter();
			} else { appendMessage('system', text); }
		}

		function finishProcess(userText, aiText) {
			if (cfg.multiTurn) {
				messageHistory.push({ role: 'user', content: userText });
				messageHistory.push({ role: 'assistant', content: aiText });
				if (messageHistory.length > 20) messageHistory = messageHistory.slice(-20);
				try { localStorage.setItem('ai_chat_history', JSON.stringify(messageHistory)); } catch (e) { console.error(e); }
			}
			resetSendButton();
		}

		function resetSendButton() { sendBtn.disabled = false; sendBtn.textContent = originalBtnText; sendBtn.style.opacity = '1'; inputArea.focus(); }

		function showError(msg) {
			const errDiv = document.createElement('div');
			errDiv.className = 'ai-message ai-message-system';
			errDiv.innerHTML = `<div class="ai-message-bubble" style="background:var(--eext-error-bg);border-color:var(--eext-btn-color);color:var(--eext-error-text);">错误：${msg}</div>`;
			chatList.appendChild(errDiv);
			chatList.scrollTop = chatList.scrollHeight;
		}
	}

	/* ---- Event bindings ---- */
	if (settingsBtn) settingsBtn.onclick = openModal;
	const newConversationBtn = document.getElementById('ai-new-conversation-btn');
	if (newConversationBtn) newConversationBtn.onclick = startNewChat;
	if (sendBtn) sendBtn.onclick = handleSend;
	if (inputArea) {
		inputArea.oninput = function () {
			this.style.height = 'auto';
			this.style.height = this.scrollHeight + 'px';
			if (!this.value) this.style.height = 'auto';
		};
		inputArea.onkeydown = (e) => {
			if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
		};
	}
}

document.addEventListener('DOMContentLoaded', initAiChat);
