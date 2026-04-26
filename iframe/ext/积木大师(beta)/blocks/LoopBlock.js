(function () {
	'use strict';

	window.WorkflowApp = window.WorkflowApp || {};

	class LoopBlock extends window.WorkflowApp.BaseBlock {
		static getMetadata() {
			return {
				type: 'loop',
				title: '循环',
				category: '基础',
				color: '#ae81ff',
				inputs: [],
				outputs: [{ name: 'index', description: '当前循环索引 (从0开始)' }],
				code: 'return index;',
				description: '循环 3 次',
				loopCount: 3,
				loopDelay: 0,
			};
		}
	}

	window.WorkflowApp.LoopBlock = LoopBlock;
})();
