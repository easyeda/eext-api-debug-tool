/**
 * 画布模块 - 管理画布渲染和交互
 */
(function() {
    window.workflowModuleRegistry.register({
        name: 'canvas',
        dependencies: [],

        async init(context, eventBus) {
            const canvas = document.getElementById('canvas');
            const ctx = canvas.getContext('2d');

            // 导出画布相关功能
            context.canvas = {
                element: canvas,
                ctx: ctx,

                resize() {
                    canvas.width = canvas.clientWidth;
                    canvas.height = canvas.clientHeight;
                    eventBus.emit('canvas:resized', { width: canvas.width, height: canvas.height });
                },

                screenToWorld(sx, sy, camera) {
                    return {
                        x: (sx - camera.x) / camera.scale,
                        y: (sy - camera.y) / camera.scale
                    };
                },

                clear() {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = '#272822';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
            };

            // 初始化画布大小
            context.canvas.resize();
            window.addEventListener('resize', () => context.canvas.resize());

            eventBus.emit('canvas:initialized');
        }
    });
})();
