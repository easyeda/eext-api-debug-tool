(function () {
	'use strict';

	window.WorkflowApp = window.WorkflowApp || {};

	class MergeBlock extends window.WorkflowApp.BaseBlock {
		static getMetadata() {
			return {
				type: 'merge',
				title: '合并',
				category: '流程控制',
				color: '#75715e',
				inputs: [
					{ name: 'inputA', description: '输入 A' },
					{ name: 'inputB', description: '输入 B' },
				],
				outputs: [{ name: 'output', description: '合并结果' }],
				code: 'const output = { a: inputA, b: inputB };\nreturn output;',
				description: '合并多个输入为一个对象',
			};
		}
	}

	window.WorkflowApp.MergeBlock = MergeBlock;
})();
