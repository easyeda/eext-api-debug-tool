/**
 * 渲染模块 - 负责画布渲染
 */
(function() {
    window.workflowModuleRegistry.register({
        name: 'render',
        dependencies: ['canvas', 'state'],

        async init(context, eventBus) {
            const { canvas, state } = context;
            const ctx = canvas.ctx;

            const PORT_RADIUS = 8;
            const BLOCK_MIN_W = 200;
            const BLOCK_HEADER_H = 36;
            const BLOCK_PORT_H = 40;
            const BLOCK_DESC_H = 40;

            // 渲染工具函数
            function roundedRect(x, y, w, h, r) {
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.arcTo(x + w, y, x + w, y + h, r);
                ctx.arcTo(x + w, y + h, x, y + h, r);
                ctx.arcTo(x, y + h, x, y, r);
                ctx.arcTo(x, y, x + w, y, r);
                ctx.closePath();
            }

            function drawGrid() {
                const grid = 40;
                const startX = (-state.camera.x / state.camera.scale) % grid;
                const startY = (-state.camera.y / state.camera.scale) % grid;
                ctx.save();
                ctx.strokeStyle = '#31322c';
                ctx.lineWidth = 1 / state.camera.scale;
                for (let x = startX; x < canvas.element.width / state.camera.scale; x += grid) {
                    ctx.beginPath();
                    ctx.moveTo(x, -state.camera.y / state.camera.scale);
                    ctx.lineTo(x, (-state.camera.y + canvas.element.height) / state.camera.scale);
                    ctx.stroke();
                }
                for (let y = startY; y < canvas.element.height / state.camera.scale; y += grid) {
                    ctx.beginPath();
                    ctx.moveTo(-state.camera.x / state.camera.scale, y);
                    ctx.lineTo((-state.camera.x + canvas.element.width) / state.camera.scale, y);
                    ctx.stroke();
                }
                ctx.restore();
            }

            function drawConnection(from, to, color) {
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                const dx = Math.max(60, Math.abs(to.x - from.x) * 0.5);
                ctx.bezierCurveTo(from.x + dx, from.y, to.x - dx, to.y, to.x, to.y);
                ctx.strokeStyle = color || '#66d9ef';
                ctx.lineWidth = 3;
                ctx.stroke();
            }

            function drawBlock(block) {
                // 简化的模块绘制逻辑
                const h = 100; // 简化高度计算
                const isSelected = state.selected === block.id;

                ctx.save();
                roundedRect(block.x, block.y, block.w, h, 8);
                ctx.fillStyle = '#2d2e27';
                ctx.fill();
                ctx.strokeStyle = isSelected ? '#66d9ef' : block.color;
                ctx.lineWidth = isSelected ? 2.5 : 1.5;
                ctx.stroke();

                // 绘制标题
                ctx.fillStyle = block.color;
                ctx.font = 'bold 13px sans-serif';
                ctx.textBaseline = 'middle';
                ctx.fillText(block.title, block.x + 10, block.y + BLOCK_HEADER_H / 2);

                ctx.restore();
            }

            function render() {
                canvas.clear();

                ctx.save();
                ctx.translate(state.camera.x, state.camera.y);
                ctx.scale(state.camera.scale, state.camera.scale);

                drawGrid();

                // 绘制连接线
                for (const c of state.connections) {
                    const fromBlock = state.blocks.find(b => b.id === c.fromId);
                    const toBlock = state.blocks.find(b => b.id === c.toId);
                    if (fromBlock && toBlock) {
                        drawConnection(
                            { x: fromBlock.x + fromBlock.w, y: fromBlock.y + 50 },
                            { x: toBlock.x, y: toBlock.y + 50 }
                        );
                    }
                }

                // 绘制模块
                for (const block of state.blocks) {
                    drawBlock(block);
                }

                ctx.restore();
                requestAnimationFrame(render);
            }

            // 导出渲染器
            context.renderer = {
                start() {
                    requestAnimationFrame(render);
                }
            };

            eventBus.emit('render:initialized');
        }
    });
})();
