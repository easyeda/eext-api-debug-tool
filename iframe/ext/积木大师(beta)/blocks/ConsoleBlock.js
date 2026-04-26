(function () {
	'use strict';

	window.WorkflowApp = window.WorkflowApp || {};

	class ConsoleBlock extends window.WorkflowApp.BaseBlock {
		static getMetadata() {
			return {
				type: 'console',
				title: '控制台输出',
				category: '流程控制',
				color: '#a6e22e',
				inputs: [{ name: 'input', description: '要输出的值' }],
				outputs: [{ name: 'output', description: '透传值' }],
				code: 'console.log(input);\nreturn input;',
				description: '输出到控制台并透传',
			};
		}
	}

	window.WorkflowApp.ConsoleBlock = ConsoleBlock;
})();
