/**
 * Project Manager - 项目文件树管理系统
 * 使用 IndexedDB 存储项目文件
 */

const DB_NAME = 'EDA_Projects';
const DB_VERSION = 1;
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
			};
		});
	}

	// 创建新项目
	async createProject(projectName) {
		if (!this.db) await this.initDB();

		const project = {
			projectName,
			files: [{ fileName: 'main.js', content: '', createdAt: Date.now() }],
			emptyFolders: [], // 存储空文件夹
			createdAt: Date.now(),
			updatedAt: Date.now(),
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
		if (!this.db) await this.initDB();

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
		if (!this.db) await this.initDB();

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

	// 保存项目
	async saveProject(project) {
		if (!this.db) await this.initDB();
		project.updatedAt = Date.now();
		// 同步 FileTreeUI 的空文件夹到项目
		if (window.fileTreeUI && window.fileTreeUI.emptyFolders) {
			project.emptyFolders = Array.from(window.fileTreeUI.emptyFolders);
		}

		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction([STORE_NAME], 'readwrite');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.put(project);

			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
	}

	// 删除项目
	async deleteProject(projectId) {
		if (!this.db) await this.initDB();

		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction([STORE_NAME], 'readwrite');
			const store = transaction.objectStore(STORE_NAME);
			const request = store.delete(projectId);

			request.onsuccess = () => resolve();
			request.onerror = () => reject(request.error);
		});
	}

	// 重命名项目
	async renameProject(projectId, newName) {
		if (!this.db) await this.initDB();

		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction([STORE_NAME], 'readwrite');
			const store = transaction.objectStore(STORE_NAME);
			const getRequest = store.get(projectId);

			getRequest.onsuccess = () => {
				const project = getRequest.result;
				if (!project) {
					reject(new Error('Project not found'));
					return;
				}

				project.projectName = newName;
				project.updatedAt = Date.now();

				const putRequest = store.put(project);
				putRequest.onsuccess = () => {
					if (this.currentProject && this.currentProject.id === projectId) {
						this.currentProject.projectName = newName;
					}
					resolve(project);
				};
				putRequest.onerror = () => reject(putRequest.error);
			};

			getRequest.onerror = () => reject(getRequest.error);
		});
	}

	// 添加文件到当前项目
	async addFile(fileName) {
		if (!this.currentProject) throw new Error('No project loaded');

		const file = {
			fileName,
			content: '',
			createdAt: Date.now(),
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

	// 复制文件到目标文件夹
	async copyFiles(fileNames, destFolder) {
		for (const fileName of fileNames) {
			const file = this.currentProject.files.find((f) => f.fileName === fileName);
			if (!file) continue;
			const baseName = fileName.split('/').pop();
			let newPath = destFolder ? `${destFolder}/${baseName}` : baseName;
			let counter = 1;
			while (this.currentProject.files.some((f) => f.fileName === newPath)) {
				const dot = baseName.lastIndexOf('.');
				const name = dot >= 0 ? baseName.slice(0, dot) : baseName;
				const ext = dot >= 0 ? baseName.slice(dot) : '';
				newPath = destFolder ? `${destFolder}/${name}_${counter}${ext}` : `${name}_${counter}${ext}`;
				counter++;
			}
			this.currentProject.files.push({ fileName: newPath, content: file.content, createdAt: Date.now() });
		}
		await this.saveProject(this.currentProject);
	}

	// 移动文件到目标文件夹
	async moveFiles(fileNames, destFolder) {
		for (const fileName of fileNames) {
			const file = this.currentProject.files.find((f) => f.fileName === fileName);
			if (!file) continue;
			const baseName = fileName.split('/').pop();
			const newPath = destFolder ? `${destFolder}/${baseName}` : baseName;
			if (newPath !== fileName) file.fileName = newPath;
		}
		await this.saveProject(this.currentProject);
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
