/**
 * 状态模块 - 管理工作流状态
 */
(function() {
    window.workflowModuleRegistry.register({
        name: 'state',
        dependencies: [],

        async init(context, eventBus) {
            // 工作流状态
            const state = {
                blocks: [],
                connections: [],
                camera: { x: 0, y: 0, scale: 1 },
                dragging: null,
                connecting: null,
                selected: null,
                panning: false,
                panStart: { x: 0, y: 0 },
                spaceDown: false,
                nextId: 1,
                editingBlock: null,
                mouse: { x: 0, y: 0, wx: 0, wy: 0 },
                placingBlock: null
            };

            context.state = state;

            // 状态管理方法
            context.stateManager = {
                getState() {
                    return state;
                },

                updateState(updates) {
                    Object.assign(state, updates);
                    eventBus.emit('state:updated', updates);
                },

                addBlock(block) {
                    state.blocks.push(block);
                    eventBus.emit('block:added', block);
                },

                removeBlock(blockId) {
                    state.blocks = state.blocks.filter(b => b.id !== blockId);
                    state.connections = state.connections.filter(
                        c => c.fromId !== blockId && c.toId !== blockId
                    );
                    if (state.selected === blockId) state.selected = null;
                    eventBus.emit('block:removed', blockId);
                },

                addConnection(connection) {
                    state.connections.push(connection);
                    eventBus.emit('connection:added', connection);
                },

                clearAll() {
                    state.blocks = [];
                    state.connections = [];
                    state.selected = null;
                    state.nextId = 1;
                    eventBus.emit('state:cleared');
                }
            };

            eventBus.emit('state:initialized');
        }
    });
})();
