(function () {
	'use strict';

	window.WorkflowApp = window.WorkflowApp || {};

	class DelayBlock extends window.WorkflowApp.BaseBlock {
		static getMetadata() {
			return {
				type: 'delay',
				title: '延时',
				category: '流程控制',
				color: '#ae81ff',
				inputs: [{ name: 'input', description: '透传值' }],
				outputs: [{ name: 'output', description: '透传值' }],
				code: 'await new Promise(r => setTimeout(r, 1000));\nreturn input;',
				description: '延时等待（默认 1000ms）',
			};
		}
	}

	window.WorkflowApp.DelayBlock = DelayBlock;
})();
