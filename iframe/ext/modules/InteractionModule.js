/**
 * 交互模块 - 处理鼠标和键盘交互
 */
(function() {
    window.workflowModuleRegistry.register({
        name: 'interaction',
        dependencies: ['canvas', 'state'],

        async init(context, eventBus) {
            const { canvas, state } = context;

            // 鼠标事件处理
            canvas.element.addEventListener('mousedown', (e) => {
                const rect = canvas.element.getBoundingClientRect();
                const sx = e.clientX - rect.left;
                const sy = e.clientY - rect.top;
                const w = canvas.screenToWorld(sx, sy, state.camera);

                eventBus.emit('mouse:down', { sx, sy, wx: w.x, wy: w.y, button: e.button });
            });

            canvas.element.addEventListener('mousemove', (e) => {
                const rect = canvas.element.getBoundingClientRect();
                const sx = e.clientX - rect.left;
                const sy = e.clientY - rect.top;
                const w = canvas.screenToWorld(sx, sy, state.camera);

                state.mouse = { x: sx, y: sy, wx: w.x, wy: w.y };
                eventBus.emit('mouse:move', { sx, sy, wx: w.x, wy: w.y });
            });

            canvas.element.addEventListener('mouseup', (e) => {
                eventBus.emit('mouse:up', { button: e.button });
            });

            canvas.element.addEventListener('wheel', (e) => {
                e.preventDefault();
                const rect = canvas.element.getBoundingClientRect();
                const sx = e.clientX - rect.left;
                const sy = e.clientY - rect.top;
                const delta = e.deltaY > 0 ? 0.9 : 1.1;

                eventBus.emit('mouse:wheel', { sx, sy, delta });
            }, { passive: false });

            // 键盘事件处理
            window.addEventListener('keydown', (e) => {
                eventBus.emit('key:down', { code: e.code, key: e.key, ctrl: e.ctrlKey, shift: e.shiftKey });
            });

            window.addEventListener('keyup', (e) => {
                eventBus.emit('key:up', { code: e.code, key: e.key });
            });

            eventBus.emit('interaction:initialized');
        }
    });
})();
