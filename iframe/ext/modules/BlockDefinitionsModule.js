/**
 * 模块定义模块 - 管理所有可用的模块类型定义
 */
(function() {
    window.workflowModuleRegistry.register({
        name: 'blockDefinitions',
        dependencies: [],

        async init(context, eventBus) {
            const BLOCK_DEFS = {};
            const BLOCK_CATEGORIES = {};

            // 从 edcode 初始化模块定义
            function initBlockDefs() {
                if (typeof edcode === 'undefined') {
                    console.warn('edcode not loaded');
                    BLOCK_DEFS.custom = {
                        title: '自定义代码',
                        color: '#f92672',
                        inputs: ['input'],
                        outputs: ['output'],
                        code: 'return input;',
                        category: '自定义'
                    };
                    BLOCK_CATEGORIES['自定义'] = ['custom'];
                    return;
                }

                edcode.forEach(item => {
                    if (item.isEnumMember || item.isEnum) return;
                    const path = item.methodPath;
                    const parts = path.split('.');
                    if (parts.length < 2) return;

                    const category = parts[1];
                    const methodName = parts.slice(2).join('.');
                    const params = item.parameters || [];
                    const inputs = params.map(p => ({ name: p.name, description: p.description || '' }));
                    const hasReturn = item.returns && item.returns !== 'void';
                    const blockId = path.replace(/\./g, '_');

                    BLOCK_DEFS[blockId] = {
                        title: methodName || path,
                        fullPath: path,
                        color: getCategoryColor(category),
                        inputs: inputs,
                        outputs: hasReturn ? [{ name: 'result', description: item.returns || '' }] : [],
                        code: generateBlockCode(path, inputs.map(i => i.name), hasReturn),
                        category: category,
                        description: item.description || ''
                    };

                    if (!BLOCK_CATEGORIES[category]) BLOCK_CATEGORIES[category] = [];
                    BLOCK_CATEGORIES[category].push(blockId);
                });

                // 添加基础模块
                addBasicBlocks();
            }

            function getCategoryColor(category) {
                const colors = {
                    'pcb_Component': '#66d9ef',
                    'sch_Component': '#a6e22e',
                    'pcb_Board': '#ae81ff',
                    'sch_Board': '#f92672',
                    'sys_Message': '#e6db74',
                    'sys_Storage': '#fd971f'
                };
                return colors[category] || '#75715e';
            }

            function generateBlockCode(path, inputNames, hasReturn) {
                const args = inputNames.join(', ');
                if (hasReturn) {
                    return `const result = await ${path}(${args});\nreturn result;`;
                } else {
                    return `await ${path}(${args});`;
                }
            }

            function addBasicBlocks() {
                // 自定义代码块
                BLOCK_DEFS.custom = {
                    title: '自定义代码',
                    color: '#f92672',
                    inputs: [{ name: 'input', description: '输入值' }],
                    outputs: [{ name: 'output', description: '输出值' }],
                    code: 'const output = input;\nreturn output;',
                    category: '自定义'
                };
                BLOCK_CATEGORIES['自定义'] = ['custom'];

                // 函数块
                BLOCK_DEFS.function = {
                    title: '函数',
                    color: '#fd971f',
                    inputs: [{ name: 'input', description: '输入值' }],
                    outputs: [{ name: 'result', description: '函数输出' }],
                    code: 'const result1 = input;\n\nreturn result1;',
                    category: '自定义',
                    description: ''
                };
                BLOCK_CATEGORIES['自定义'].push('function');

                // 变量块
                BLOCK_DEFS.variable = {
                    title: '变量',
                    color: '#e6db74',
                    inputs: [],
                    outputs: [{ name: 'value', description: '变量值' }],
                    code: 'const value = null;\nreturn value;',
                    category: '基础',
                    description: '输入常量值（字符串、数字、布尔值等）',
                    value: null,
                    varName: '',
                    varScope: 'local'
                };
                if (!BLOCK_CATEGORIES['基础']) BLOCK_CATEGORIES['基础'] = [];
                BLOCK_CATEGORIES['基础'].unshift('variable');

                // 循环块
                BLOCK_DEFS.loop = {
                    title: '循环',
                    color: '#ae81ff',
                    inputs: [],
                    outputs: [{ name: 'index', description: '当前循环索引 (从0开始)' }],
                    code: 'return index;',
                    category: '基础',
                    description: '循环 3 次',
                    loopCount: 3,
                    loopDelay: 0
                };
                BLOCK_CATEGORIES['基础'].push('loop');
            }

            // 初始化
            initBlockDefs();

            // 导出到上下文
            context.blockDefinitions = {
                BLOCK_DEFS,
                BLOCK_CATEGORIES,

                getDefinition(blockId) {
                    return BLOCK_DEFS[blockId];
                },

                getCategory(category) {
                    return BLOCK_CATEGORIES[category] || [];
                },

                getAllCategories() {
                    return Object.keys(BLOCK_CATEGORIES);
                }
            };

            eventBus.emit('blockDefinitions:initialized');
        }
    });
})();
