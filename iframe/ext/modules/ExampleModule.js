/**
 * 示例模块 - 演示如何添加新模块
 *
 * 这个示例展示了完整的模块结构，你可以复制这个文件作为模板来创建新模块
 */
(function() {
    window.workflowModuleRegistry.register({
        // 模块唯一名称
        name: 'example',

        // 依赖的其他模块（按依赖顺序初始化）
        dependencies: ['state', 'canvas'],

        // 初始化函数
        async init(context, eventBus) {
            console.log('📦 示例模块开始初始化');

            // 1. 获取依赖模块的上下文
            const { state, canvas } = context;

            // 2. 监听其他模块的事件
            eventBus.on('block:added', (block) => {
                console.log('新模块已添加:', block.title);
            });

            eventBus.on('state:cleared', () => {
                console.log('状态已清空');
            });

            // 3. 定义本模块功能
            const exampleFeature = {
                counter: 0,

                doSomething() {
                    this.counter++;
                    eventBus.emit('example:action', { counter: this.counter });
                    return this.counter;
                },

                getStats() {
                    return {
                        counter: this.counter,
                        blockCount: state.blocks.length
                    };
                }
            };

            // 4. 导出到上下文供其他模块使用
            context.example = exampleFeature;

            // 5. 发布初始化完成事件
            eventBus.emit('example:initialized');

            console.log('✅ 示例模块初始化完成');
        }
    });
})();
