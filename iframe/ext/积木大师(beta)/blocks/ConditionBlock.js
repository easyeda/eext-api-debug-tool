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
					{ name: 'trueResult', description: '条件为真时的输出' },
					{ name: 'falseResult', description: '条件为假时的输出' },
				],
				code: 'const condition = !!input;\nreturn condition;',
				description: '根据条件分支执行',
			};
		}
	}

	window.WorkflowApp.ConditionBlock = ConditionBlock;
})();
