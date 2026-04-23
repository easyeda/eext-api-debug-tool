/**
 * 启动文件 - 初始化模块化工作流系统
 *
 * 这个文件在所有模块加载后执行，负责启动整个应用
 */
(async function bootstrap() {
    try {
        console.log('🚀 启动模块化工作流系统...');

        // 初始化所有模块
        await window.workflowModuleRegistry.initAll(window.workflowContext);

        console.log('✅ 模块系统初始化完成');
        console.log('📦 已加载模块:', Array.from(window.workflowModuleRegistry.initializedModules));

        // 启动渲染器
        if (window.workflowContext.renderer) {
            window.workflowContext.renderer.start();
        }

        // 发布应用就绪事件
        window.workflowModuleRegistry.eventBus.emit('app:ready');

        // 显示成功消息
        if (typeof eda !== 'undefined' && eda.sys_Message) {
            eda.sys_Message.showToastMessage('工作流系统已就绪', 'success', 2);
        }

    } catch (error) {
        console.error('❌ 模块系统启动失败:', error);
        if (typeof eda !== 'undefined' && eda.sys_Message) {
            eda.sys_Message.showToastMessage('系统启动失败: ' + error.message, 'error', 5);
        }
    }
})();
