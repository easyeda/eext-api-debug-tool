(function () {
	'use strict';

	window.WorkflowApp = window.WorkflowApp || {};

	class CustomBlock extends window.WorkflowApp.BaseBlock {
		static getMetadata() {
			return {
				type: 'custom',
				title: '自定义代码',
				category: '自定义',
				color: '#f92672',
				inputs: [{ name: 'input', description: '输入值' }],
				outputs: [{ name: 'output', description: '输出值' }],
				code: 'const output = input;\nreturn output;',
				description: '',
			};
		}
	}

	window.WorkflowApp.CustomBlock = CustomBlock;
})();
