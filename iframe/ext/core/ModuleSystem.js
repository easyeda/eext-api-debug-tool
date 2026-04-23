/**
 * 模块系统核心 - 用于工作流画布的模块化架构
 */
class WorkflowModuleSystem {
    constructor() {
        this.modules = new Map();
        this.initializedModules = new Set();
        this.eventBus = new WorkflowEventBus();
        this.context = {};
    }

    /**
     * 注册模块
     */
    register(moduleDefinition) {
        if (!moduleDefinition.name) {
            throw new Error('Module must have a name');
        }
        this.modules.set(moduleDefinition.name, {
            ...moduleDefinition,
            dependencies: moduleDefinition.dependencies || []
        });
    }

    /**
     * 初始化所有模块
     */
    async initAll(context) {
        this.context = context;
        const moduleNames = Array.from(this.modules.keys());

        for (const name of moduleNames) {
            await this.init(name);
        }
    }

    /**
     * 初始化单个模块
     */
    async init(moduleName) {
        if (this.initializedModules.has(moduleName)) {
            return;
        }

        const module = this.modules.get(moduleName);
        if (!module) {
            throw new Error(`Module "${moduleName}" not found`);
        }

        // 先初始化依赖
        for (const dep of module.dependencies) {
            await this.init(dep);
        }

        // 初始化当前模块
        if (module.init) {
            await module.init(this.context, this.eventBus);
        }

        this.initializedModules.add(moduleName);
    }

    /**
     * 获取模块
     */
    get(moduleName) {
        return this.modules.get(moduleName);
    }
}

/**
 * 事件总线 - 模块间通信
 */
class WorkflowEventBus {
    constructor() {
        this.listeners = new Map();
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);

        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (!this.listeners.has(event)) return;
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    emit(event, data) {
        if (!this.listeners.has(event)) return;
        const callbacks = this.listeners.get(event);
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for "${event}":`, error);
            }
        });
    }

    clear() {
        this.listeners.clear();
    }
}

// 导出到全局
window.WorkflowModuleSystem = WorkflowModuleSystem;
window.WorkflowEventBus = WorkflowEventBus;
