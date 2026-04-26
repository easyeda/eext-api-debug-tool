(function () {
	'use strict';

	window.WorkflowApp = window.WorkflowApp || {};

	class ForEachBlock extends window.WorkflowApp.BaseBlock {
		static getMetadata() {
			return {
				type: 'foreach',
				title: '遍历数组',
				category: '流程控制',
				color: '#66d9ef',
				inputs: [{ name: 'array', description: '要遍历的数组' }],
				outputs: [{ name: 'item', description: '当前元素' }],
				code: '',
				description: '遍历数组，对每个元素执行下游模块',
				loopDelay: 0,
			};
		}
	}

	window.WorkflowApp.ForEachBlock = ForEachBlock;
})();
