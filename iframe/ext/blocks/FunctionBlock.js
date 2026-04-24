(function() {
    'use strict';

    window.WorkflowApp = window.WorkflowApp || {};

    class FunctionBlock extends window.WorkflowApp.BaseBlock {
        static getMetadata() {
            return {
                type: 'function',
                title: '函数',
                category: '自定义',
                color: '#fd971f',
                inputs: [{ name: 'input', description: '输入值' }],
                outputs: [{ name: 'result', description: '函数输出' }],
                code: 'const result1 = input;\n\nreturn result1;',
                description: ''
            };
        }
    }

    window.WorkflowApp.FunctionBlock = FunctionBlock;
})();
