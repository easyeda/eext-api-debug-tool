/**
 * Project Manager - 项目文件树管理系统
 * 使用 IndexedDB 存储项目文件
 */

function generateUUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random() * 16 | 0;
		return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
}

// 同步删除快捷键映射
async function _syncDeleteBtnList(projectIdOrUuid) {
	try {
		var db = await new Promise(function(resolve, reject) {
			var req = indexedDB.open('BtnStore', 2);
			req.onsuccess = function() { resolve(req.result); };
			req.onerror = reject;
		});
		var records = await new Promise(function(resolve, reject) {
			var tx = db.transaction(['BtnList'], 'readonly');
			var r = tx.objectStore('BtnList').getAll();
			r.onsuccess = function() { resolve(r.result || []); };
			r.onerror = reject;
		});
		var target = records.find(function(r) { return r.projectId === projectIdOrUuid || r.uuid === projectIdOrUuid; });
		if (target && target.uuid) {
			await new Promise(function(resolve, reject) {
				var tx = db.transaction(['BtnList'], 'readwrite');
				var req = tx.objectStore('BtnList').delete(target.uuid);
				req.onsuccess = resolve;
				req.onerror = reject;
			});
		}
		db.close();
	} catch(e) {}
}

const DB_NAME = 'EDA_Projects';
const DB_VERSION = 2;
const STORE_NAME = 'projects';

class ProjectManager {
	constructor() {
		this.db = null;
		this.currentProject = null;
		this.currentFile = null;
	}

	// 初始化数据库
	async initDB() {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(DB_NAME, DB_VERSION);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => {
				this.db = request.result;
				resolve(this.db);
			};

			request.onupgradeneeded = (event) => {
				const db = event.target.result;
				if (!db.objectStoreNames.contains(STORE_NAME)) {
					const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
					store.createIndex('projectName', 'projectName', { unique: false });
					store.createIndex('fileName', 'fileName', { unique: false });
				}
				if (event.oldVersion < 2) {
					var tx = event.target.transaction;
					var store = tx.objectStore(STORE_NAME);
					if (!store.indexNames.contains('uuid')) {
						store.createIndex('uuid', 'uuid', { unique: false });
					}
				}
			};
		});
	}

	// 创建新项目
	async createProject(projectName) {
		if (!this.db || this.db.closed) await this.initDB();

		const project = {
			uuid: generateUUID(),
			projectName,
			files: [{ fileName: 'main.js', content: '', createdAt: new Date().toISOString().split('T')[0] }],
			createdAt: new Date().toISOString().split('T')[0],
			updatedAt: new Date().toISOString().split('T')[0],
		};

		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction([STORE_NAME], 'readwrite');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.add(project);

			request.onsuccess = () => {
				project.id = request.result;
				this.currentProject = project;
				resolve(project);
			};
			request.onerror = () => reject(request.error);
		});
	}

	// 获取所有项目
	async getAllProjects() {
		if (!this.db || this.db.closed) await this.initDB();

		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction([STORE_NAME], 'readonly');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.getAll();

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	// 加载项目
	async loadProject(projectId) {
		if (!this.db || this.db.closed) await this.initDB();

		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction([STORE_NAME], 'readonly');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.get(projectId);

			request.onsuccess = () => {
				this.currentProject = request.result;
				resolve(request.result);
			};
			request.onerror = () => reject(request.error);
		});
	}

	// 按 ID 读取项目（不改变 currentProject）
	async loadProjectById(projectId) {
		if (!this.db || this.db.closed) await this.initDB();

		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction([STORE_NAME], 'readonly');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.get(projectId);

			request.onsuccess = () => resolve(request.result || null);
			request.onerror = () => reject(request.error);
		});
	}

	// 按 UUID 读取项目
	async loadProjectByUuid(uuid) {
		if (!this.db || this.db.closed) await this.initDB();

		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction([STORE_NAME], 'readonly');
			const store = transaction.objectStore(STORE_NAME);
			const index = store.index('uuid');
			const request = index.get(uuid);

			request.onsuccess = () => resolve(request.result || null);
			request.onerror = () => reject(request.error);
		});
	}

	// 保存项目
	async saveProject(project) {
		if (!this.db || this.db.closed) await this.initDB();
		project.updatedAt = new Date().toISOString().split('T')[0];

		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction([STORE_NAME], 'readwrite');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.put(project);

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	// 重命名项目
	async renameProject(projectId, newName) {
		if (!this.db || this.db.closed) await this.initDB();

		const project = await this.loadProject(projectId);
		if (project) {
			project.projectName = newName;
			await this.saveProject(project);
		}
		return project;
	}

	// 删除项目
	async deleteProject(projectId) {
		if (!this.db || this.db.closed) await this.initDB();

		// 同步删除顶部快捷键映射
		var project = await this.loadProjectById(projectId);
		if (project && project.uuid) {
			await _syncDeleteBtnList(project.uuid);
		} else {
			await _syncDeleteBtnList(projectId);
		}

		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction([STORE_NAME], 'readwrite');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.delete(projectId);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	// 添加文件到当前项目
	async addFile(fileName) {
		if (!this.currentProject) throw new Error('No project loaded');

		const file = {
			fileName,
			content: '',
			createdAt: new Date().toISOString().split('T')[0],
		};

		this.currentProject.files.push(file);
		await this.saveProject(this.currentProject);
		return file;
	}

	// 重命名文件
	async renameFile(oldName, newName) {
		if (!this.currentProject) throw new Error('No project loaded');

		const file = this.currentProject.files.find((f) => f.fileName === oldName);
		if (file) {
			file.fileName = newName;
			await this.saveProject(this.currentProject);
		}
	}

	// 删除文件
	async deleteFile(fileName) {
		if (!this.currentProject) throw new Error('No project loaded');

		this.currentProject.files = this.currentProject.files.filter((f) => f.fileName !== fileName);
		await this.saveProject(this.currentProject);
	}

	// 保存文件内容
	async saveFileContent(fileName, content) {
		if (!this.currentProject) throw new Error('No project loaded');

		const file = this.currentProject.files.find((f) => f.fileName === fileName);
		if (file) {
			file.content = content;
			await this.saveProject(this.currentProject);
		}
	}

	// 获取文件内容
	getFileContent(fileName) {
		if (!this.currentProject) return '';
		const file = this.currentProject.files.find((f) => f.fileName === fileName);
		return file ? file.content : '';
	}
}

// 全局实例
window.projectManager = new ProjectManager();
