(function() {
    'use strict';

    window.WorkflowApp = window.WorkflowApp || {};

    class ApiBlock extends window.WorkflowApp.BaseBlock {
        static createFromEdcode(item) {
            const path = item.methodPath;
            const parts = path.split('.');
            const category = parts[1] || 'custom';
            const methodName = parts.slice(2).join('.') || path;
            const params = item.parameters || [];
            const hasReturn = item.returns && item.returns !== 'void';

            return {
                type: path.replace(/\./g, '_'),
                title: methodName,
                fullPath: path,
                category: category,
                color: window.WorkflowApp.Helpers.getCategoryColor(category),
                inputs: params.map(p => ({ name: p.name, description: p.description || '' })),
                outputs: hasReturn ? [{ name: 'result', description: item.returns || '' }] : [],
                code: window.WorkflowApp.Helpers.generateBlockCode(path, params.map(p => p.name), hasReturn),
                description: item.description || ''
            };
        }

        static getMetadata() {
            return {
                type: 'api',
                title: 'API Block',
                category: 'API',
                color: '#66d9ef',
                inputs: [],
                outputs: [],
                code: '',
                description: 'EDA API method block'
            };
        }
    }

    window.WorkflowApp.ApiBlock = ApiBlock;
})();
