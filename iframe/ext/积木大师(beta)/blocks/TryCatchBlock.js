(function () {
	'use strict';

	window.WorkflowApp = window.WorkflowApp || {};

	class TryCatchBlock extends window.WorkflowApp.BaseBlock {
		static getMetadata() {
			return {
				type: 'trycatch',
				title: '异常捕获',
				category: '流程控制',
				color: '#f92672',
				inputs: [{ name: 'input', description: '输入值' }],
				outputs: [
					{ name: 'result', description: '成功结果' },
					{ name: 'error', description: '错误信息' },
				],
				code: 'const result = input;\nreturn result;',
				description: '捕获代码执行异常',
			};
		}
	}

	window.WorkflowApp.TryCatchBlock = TryCatchBlock;
})();
