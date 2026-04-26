(function () {
	'use strict';

	window.WorkflowApp = window.WorkflowApp || {};

	class ConditionBlock extends window.WorkflowApp.BaseBlock {
		static getMetadata() {
			return {
				type: 'condition',
				title: '条件判断',
				category: '流程控制',
				color: '#e6db74',
				inputs: [{ name: 'input', description: '输入值' }],
				outputs: [
					{ name: 'true', description: '条件为真时执行' },
					{ name: 'false', description: '条件为假时执行' },
				],
				code: 'return !!input;',
				description: '根据条件分支执行下游模块',
			};
		}
	}

	window.WorkflowApp.ConditionBlock = ConditionBlock;
})();
