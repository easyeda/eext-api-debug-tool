/**
 * 初始化 IndexedDB 数据库连接，打开或创建名为 'CodeStore' 的数据库
 * @returns {Promise<IDBDatabase>} 返回数据库实例对象
 */
function CodeStore_Init() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open('CodeStore', 1); //数据库名和数据库版本 如果要升级数据库那么版本号必须增加

		request.onupgradeneeded = (e) => { //回调函数 这个不需要手动触发 入参e是db实例对象 调用时会自动传进event
			const db = e.target.result; //参数传递 不传也行 只是不够优雅
			if (!db.objectStoreNames.contains('CodeList')) { //如果objectStoreNames返回的列表中不包含指定的数据表 则新建数据库
				const store = db.createObjectStore('CodeList', { keyPath: 'id', autoIncrement: true }); //自增的隐藏主键
				store.createIndex('code', 'code', { unique: false }); //创建索引和字段，这里设置成一样的就可以用索引查找相同字段了
				store.createIndex('name', 'name', { unique: true }); //代码名不允许重复
				store.createIndex('createdAt', 'createdAt', { unique: false });
			}
		}; //这里是将函数赋值给事务处理器 所以花括号带个分号也正常
		request.onsuccess = (e) => {
			const result = e.target.result;
			console.log('数据库打开成功', result);
			resolve(result);
		};
		request.onerror = (e) => {
			console.error('数据库打开失败:', e.target.error);
			reject(e.target.error);
		};
	})
}

/**
 * 向 CodeList 表中保存一段新代码
 * @param {string} name - 代码名称（必须唯一）
 * @param {string} code - 代码内容字符串
 * @returns {Promise<number>} 返回新记录的自增 ID
 */
function CodeStore_SaveCode( name, code) {
	const db = await CodeStore_Init();
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['CodeList'], 'readwrite'); //创建一个事务 这里指的是操作表CodeList 模式为读写 只读模式为readwrite
		const store = transaction.objectStore('CodeList'); //这里是表对象 现在可以通过这个对象操作这张表
		const record = {
			name: name,
			code: code,
			createdAt: new Date().toISOString() // ISO 字符串，便于排序和显示
		};
		const request = store.add(record); //将数据插入表中并获得返回值 返回值由事务自动识别
		request.onsuccess = (e) => {
			const newId = e.target.result; //此处返回的是主键的值
			console.log('保存成功，ID', newId);
			resolve(newId); // 返回新记录的 ID
		};

		request.onerror = (e) => {
			console.error('保存失败:', e.target.error);
			reject(e.target.error);
		};
	})
}

/**
 * 根据代码名称删除 CodeList 中的一条记录
 * @param {IDBDatabase} db - 已打开的数据库连接对象
 * @param {string} name - 要删除的代码名称
 * @returns {Promise<boolean>} 删除成功返回 true，未找到返回 false
 */
function CodeStore_DeleteCode(db, name) {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['CodeList'], 'readwrite');
		const store = transaction.objectStore('CodeList');
		const index = store.index('name'); // 这里告诉数据库 需要查询的字段是name
		const getRequest = index.getKey(name); // 通过索引查找主键（id） 这里有个很重要的概念 必须传进字段name的值，因为数据库只会从字段name进行查找

		getRequest.onsuccess = (e) => { //在后续的业务设计中 绝对不会出现这种情况，因为是指定的，先查询所有存在的 再选择一个删除 所以这段后面可以删掉
			const id = e.target.result;
			if (id === undefined) {
				// 没找到对应 name 的记录
				console.warn(`未找到名称为 "${name}" 的代码`);
				resolve(false); // 或 resolve(null)
				return;
			}
			// 找到 id 后，通过主键删除
			const deleteRequest = store.delete(id);
			deleteRequest.onsuccess = () => {
				console.log(`成功删除代码 "${name}" (ID: ${id})`);
				resolve(true);
			};
			deleteRequest.onerror = (e) => {
				console.error('删除失败:', e.target.error);
				reject(e.target.error);
			};
		};
		getRequest.onerror = (e) => {
			console.error('❌ 查询 name 失败:', e.target.error);
			reject(e.target.error);
		};
	});
}


/**
 * 根据代码名称更新其代码内容（不修改名称）
 * @param {IDBDatabase} db - 已打开的数据库连接对象
 * @param {string} name - 要更新的代码名称（必须已存在）
 * @param {string} newCode - 新的代码内容
 * @returns {Promise<boolean>} 更新成功返回 true，未找到返回 false
 */
function CodeStore_UpdateCode(db, name, newCode) {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['CodeList'], 'readwrite');
		const store = transaction.objectStore('CodeList');
		const index = store.index('name'); //告诉数据库要查询的字段是name
		const getRequest = index.get(name); //z这里的name不是字段而是值，数据库根据这个值在字段name中找符合条件的 前面已经设置过name的唯一性 所以这里只会找到一条
		getRequest.onsuccess = (e) => {
			const record = e.target.result; //这里是返回的完整对象
			if (!record) { //一般不会发生这种情况 除非有神人手动修改了indexDB的数据库
				console.warn(`${name}"更新失败`);
				resolve(false);
				return;
			}
			const updatedRecord = { //这里只对code进行更新
				...record,
				code: newCode
			};

			const putRequest = store.put(updatedRecord); //使用put方法更新指定主键的字段值
			putRequest.onsuccess = () => {
				console.log(`"${name}已保存"`);
				resolve(true);
			};
			putRequest.onerror = (e) => { //一般也不会出现这种情况
				console.error('保存失败:', e.target.error);
				reject(e.target.error);
			};
		};
		getRequest.onerror = (e) => { //上同
			console.error('查询失败:', e.target.error);
			reject(e.target.error);
		};
	});
}

/**
 * 查询 CodeList 中所有代码的简要信息（id、name、createdAt），按 id 升序排列
 * @param {IDBDatabase} db - 已打开的数据库连接对象
 * @returns {Promise<Array<{id: number, name: string, createdAt: string}>>} 返回代码列表数组
 */
function CodeStore_Get_CodeList(db) {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction(['CodeList'], 'readonly'); //只读更安全高效
		const store = transaction.objectStore('CodeList');
		const request = store.openCursor(); //查询自动按照主键升序
		const result = [];
		request.onsuccess = (e) => {
			const cursor = e.target.result; //返回的是整个对象
			if (cursor) {
				const record = cursor.value;
				result.push({
					id: record.id,
					name: record.name,
					createdAt: record.createdAt
				});
				cursor.continue(); // 继续下一条
			} else {
				resolve(result); // 已按 id 升序（IndexedDB 主键默认排序）
			}
		};
		request.onerror = (e) => {
			console.error('未知错误：', e.target.error);
			reject(e.target.error);
		};
	});
}