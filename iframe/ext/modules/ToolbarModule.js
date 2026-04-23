/**
 * 工具栏模块 - 管理顶部工具栏按钮
 */
(function() {
    window.workflowModuleRegistry.register({
        name: 'toolbar',
        dependencies: ['state'],

        async init(context, eventBus) {
            // 运行按钮
            document.getElementById('run')?.addEventListener('click', () => {
                eventBus.emit('toolbar:run');
            });

            // 查看代码按钮
            document.getElementById('view-code')?.addEventListener('click', () => {
                eventBus.emit('toolbar:viewCode');
            });

            // 导出按钮
            document.getElementById('export')?.addEventListener('click', () => {
                eventBus.emit('toolbar:export');
            });

            // 导入按钮
            document.getElementById('import')?.addEventListener('click', () => {
                eventBus.emit('toolbar:import');
            });

            // 清空按钮
            document.getElementById('clear')?.addEventListener('click', () => {
                eventBus.emit('toolbar:clear');
            });

            // 缩放按钮
            document.getElementById('zoom-in')?.addEventListener('click', () => {
                eventBus.emit('toolbar:zoomIn');
            });

            document.getElementById('zoom-out')?.addEventListener('click', () => {
                eventBus.emit('toolbar:zoomOut');
            });

            document.getElementById('zoom-reset')?.addEventListener('click', () => {
                eventBus.emit('toolbar:zoomReset');
            });

            eventBus.emit('toolbar:initialized');
        }
    });
})();
