(function() {
    'use strict';

    window.WorkflowApp = window.WorkflowApp || {};

    class VariableBlock extends window.WorkflowApp.BaseBlock {
        static getMetadata() {
            return {
                type: 'variable',
                title: '变量',
                category: '基础',
                color: '#e6db74',
                inputs: [],
                outputs: [{ name: 'value', description: '变量值' }],
                code: 'const value = null;\nreturn value;',
                description: '输入常量值（字符串、数字、布尔值等）',
                value: null,
                varName: '',
                varScope: 'local'
            };
        }
    }

    window.WorkflowApp.VariableBlock = VariableBlock;
})();
