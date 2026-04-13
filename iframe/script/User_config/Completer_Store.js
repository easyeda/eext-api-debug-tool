// ==========================
// 补全仓库 - 管理用户自定义补全项
// ==========================

/**
 * 打开补全仓库模态框
 * @param {Object} editor - ACE 编辑器实例
 */
async function showCompleterStoreModal(editor) {
	if (document.getElementById('completer-store-modal')) return;

	// 遮罩层
	const modal = document.createElement('div');
	modal.id = 'completer-store-modal';
	modal.className = 'cs-backdrop';

	// 容器
	const container = document.createElement('div');
	container.className = 'cs-container';

	// 头部
	const header = document.createElement('div');
	header.className = 'cs-header';
	header.textContent = '补全仓库';

	const headerRight = document.createElement('div');
	headerRight.className = 'cs-header-right';

	const clearBtn = document.createElement('button');
	clearBtn.className = 'cs-btn cs-btn-danger';
	clearBtn.textContent = '清空全部';
	clearBtn.onclick = async () => {
		if (!confirm('确定清空所有自定义补全项？此操作不可撤销。')) return;
		try {
			await _clearAllCompleters();
			_removeUserCompleterFromEditor(editor);
			await renderList(listEl);
			_toast('已清空所有自定义补全', 'success', 2);
		} catch (err) {
			_toast('清空失败: ' + err.message, 'error', 2);
		}
	};
	headerRight.appendChild(clearBtn);

	const closeBtn = document.createElement('button');
	closeBtn.className = 'cs-close-btn';
	closeBtn.textContent = '×';
	closeBtn.title = '关闭';
	closeBtn.onclick = () => modal.remove();
	headerRight.appendChild(closeBtn);
	header.appendChild(headerRight);
	container.appendChild(header);

	// 主体
	const body = document.createElement('div');
	body.className = 'cs-body';

	const listEl = document.createElement('div');
	listEl.className = 'cs-list';
	body.appendChild(listEl);
	container.appendChild(body);

	// 渲染列表
	async function renderList(el) {
		el.innerHTML = '<div class="cs-status">加载中...</div>';
		try {
			const db = await UserCompleterStore_Init();
			const records = await new Promise((resolve, reject) => {
				const tx = db.transaction(['completions'], 'readonly');
				const req = tx.objectStore('completions').getAll();
				req.onsuccess = () => resolve(req.result || []);
				req.onerror = reject;
			});

			if (records.length === 0) {
				el.innerHTML = '<div class="cs-status">暂无自定义补全项</div>';
				return;
			}

			el.innerHTML = '';
			for (const rec of records) {
				el.appendChild(_createCompleterItem(editor, rec, el, renderList));
			}
		} catch (err) {
			el.innerHTML = '<div class="cs-status cs-status-error">加载失败: ' + err.message + '</div>';
		}
	}

	await renderList(listEl);

	// 点击遮罩关闭
	modal.onclick = (e) => {
		if (e.target === modal) modal.remove();
	};

	// ESC 关闭
	const escHandler = (e) => {
		if (e.key === 'Escape') {
			modal.remove();
			document.removeEventListener('keydown', escHandler);
		}
	};
	document.addEventListener('keydown', escHandler);

	modal.appendChild(container);
	document.body.appendChild(modal);
}

/**
 * 创建单个补全项的 DOM 元素（含编辑、删除）
 */
function _createCompleterItem(editor, rec, listEl, renderList) {
	const item = document.createElement('div');
	item.className = 'cs-item';

	// 左侧信息
	const info = document.createElement('div');
	info.className = 'cs-item-info';

	const caption = document.createElement('span');
	caption.className = 'cs-item-caption';
	caption.textContent = rec.caption;
	caption.title = rec.caption;
	info.appendChild(caption);

	const value = document.createElement('span');
	value.className = 'cs-item-value';
	value.textContent = rec.value;
	value.title = '补全值: ' + rec.value;
	info.appendChild(value);

	if (rec.params && rec.params.length > 0) {
		const params = document.createElement('span');
		params.className = 'cs-item-params';
		params.textContent = '参数: ' + rec.params.join(', ');
		info.appendChild(params);
	}

	if (rec.description) {
		const desc = document.createElement('span');
		desc.className = 'cs-item-desc';
		desc.textContent = rec.description;
		desc.title = rec.description;
		info.appendChild(desc);
	}

	item.appendChild(info);

	// 右侧按钮组
	const actions = document.createElement('div');
	actions.className = 'cs-item-actions';

	// 编辑按钮
	const editBtn = document.createElement('button');
	editBtn.className = 'cs-btn cs-btn-edit';
	editBtn.textContent = '编辑';
	editBtn.onclick = () => _showEditCompleterForm(editor, rec, item, listEl, renderList);
	actions.appendChild(editBtn);

	// 删除按钮
	const delBtn = document.createElement('button');
	delBtn.className = 'cs-btn cs-btn-delete';
	delBtn.textContent = '删除';
	delBtn.onclick = async () => {
		delBtn.textContent = '删除中...';
		delBtn.disabled = true;
		try {
			await _deleteCompleterById(rec.id);
			_removeUserCompleterFromEditor(editor);
			const db = await UserCompleterStore_Init();
			const all = await new Promise((res, rej) => {
				const tx = db.transaction(['completions'], 'readonly');
				const req = tx.objectStore('completions').getAll();
				req.onsuccess = () => res(req.result || []);
				req.onerror = rej;
			});
			if (all.length > 0) _registerUserCompleters(editor, all);
			await renderList(listEl);
			_toast('已删除: ' + rec.caption, 'success', 2);
		} catch (err) {
			_toast('删除失败: ' + err.message, 'error', 2);
			delBtn.textContent = '删除';
			delBtn.disabled = false;
		}
	};
	actions.appendChild(delBtn);

	item.appendChild(actions);
	return item;
}

/**
 * 在列表项位置展开内联编辑表单
 */
function _showEditCompleterForm(editor, rec, itemEl, listEl, renderList) {
	// 防止重复打开
	if (itemEl.querySelector('.cs-edit-form')) return;

	const form = document.createElement('div');
	form.className = 'cs-edit-form';

	const row1 = document.createElement('div');
	row1.className = 'cs-edit-row';
	const labelCaption = document.createElement('label');
	labelCaption.textContent = '名称:';
	const inputCaption = document.createElement('input');
	inputCaption.className = 'cs-edit-input';
	inputCaption.value = rec.caption;
	row1.appendChild(labelCaption);
	row1.appendChild(inputCaption);
	form.appendChild(row1);

	const row2 = document.createElement('div');
	row2.className = 'cs-edit-row';
	const labelValue = document.createElement('label');
	labelValue.textContent = '补全值:';
	const inputValue = document.createElement('input');
	inputValue.className = 'cs-edit-input';
	inputValue.value = rec.value;
	inputValue.placeholder = '选中补全后插入的完整内容';
	row2.appendChild(labelValue);
	row2.appendChild(inputValue);
	form.appendChild(row2);

	const row3 = document.createElement('div');
	row3.className = 'cs-edit-row';
	const labelDesc = document.createElement('label');
	labelDesc.textContent = '描述:';
	const inputDesc = document.createElement('input');
	inputDesc.className = 'cs-edit-input';
	inputDesc.value = rec.description || '';
	inputDesc.placeholder = '补全提示说明（可通过描述触发补全）';
	row3.appendChild(labelDesc);
	row3.appendChild(inputDesc);
	form.appendChild(row3);

	const btnRow = document.createElement('div');
	btnRow.className = 'cs-edit-actions';

	const saveBtn = document.createElement('button');
	saveBtn.className = 'cs-btn cs-btn-save';
	saveBtn.textContent = '保存';
	saveBtn.onclick = async () => {
		const newCaption = inputCaption.value.trim();
		const newValue = inputValue.value.trim();
		const newDescription = inputDesc.value.trim();

		if (!newCaption) {
			_toast('名称不能为空', 'warn', 2);
			return;
		}
		if (!newValue) {
			_toast('补全值不能为空', 'warn', 2);
			return;
		}

		// 从补全值中自动提取参数
		const parsed = _parseLineForCompletion(newValue);
		const newParams = parsed ? parsed.params : [];

		saveBtn.textContent = '保存中...';
		saveBtn.disabled = true;
		try {
			await _updateCompleter(rec.id, {
				caption: newCaption,
				value: newValue,
				params: newParams,
				description: newDescription,
			});
			// 刷新编辑器补全器
			_removeUserCompleterFromEditor(editor);
			const db = await UserCompleterStore_Init();
			const all = await new Promise((res, rej) => {
				const tx = db.transaction(['completions'], 'readonly');
				const req = tx.objectStore('completions').getAll();
				req.onsuccess = () => res(req.result || []);
				req.onerror = rej;
			});
			if (all.length > 0) _registerUserCompleters(editor, all);
			await renderList(listEl);
			_toast('已更新: ' + newCaption, 'success', 2);
		} catch (err) {
			_toast('更新失败: ' + err.message, 'error', 2);
			saveBtn.textContent = '保存';
			saveBtn.disabled = false;
		}
	};
	btnRow.appendChild(saveBtn);

	const cancelBtn = document.createElement('button');
	cancelBtn.className = 'cs-btn cs-btn-cancel';
	cancelBtn.textContent = '取消';
	cancelBtn.onclick = () => form.remove();
	btnRow.appendChild(cancelBtn);

	form.appendChild(btnRow);
	itemEl.appendChild(form);
	inputCaption.focus();
}

// ==========================
// IndexedDB 辅助操作
// ==========================

/**
 * 根据 ID 删除一条补全记录
 */
async function _deleteCompleterById(id) {
	const db = await UserCompleterStore_Init();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(['completions'], 'readwrite');
		const req = tx.objectStore('completions').delete(id);
		req.onsuccess = resolve;
		req.onerror = () => reject(req.error);
	});
}

/**
 * 更新一条补全记录
 */
async function _updateCompleter(id, fields) {
	const db = await UserCompleterStore_Init();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(['completions'], 'readwrite');
		const store = tx.objectStore('completions');
		const getReq = store.get(id);
		getReq.onsuccess = () => {
			const record = getReq.result;
			if (!record) return reject(new Error('记录不存在'));
			Object.assign(record, fields);
			const putReq = store.put(record);
			putReq.onsuccess = resolve;
			putReq.onerror = () => reject(putReq.error);
		};
		getReq.onerror = () => reject(getReq.error);
	});
}

/**
 * 清空所有补全记录
 */
async function _clearAllCompleters() {
	const db = await UserCompleterStore_Init();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(['completions'], 'readwrite');
		const req = tx.objectStore('completions').clear();
		req.onsuccess = resolve;
		req.onerror = () => reject(req.error);
	});
}

/**
 * 从编辑器移除用户自定义补全器
 */
function _removeUserCompleterFromEditor(editor) {
	editor.completers = editor.completers.filter((c) => !c._isUserCompleter);
}
