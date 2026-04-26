(function () {
	'use strict';

	window.WorkflowApp = window.WorkflowApp || {};

	class SwitchBlock extends window.WorkflowApp.BaseBlock {
		static getMetadata() {
			return {
				type: 'switch',
				title: '多路分支',
				category: '流程控制',
				color: '#fd971f',
				inputs: [{ name: 'input', description: '输入值' }],
				outputs: [
					{ name: 'caseA', description: '分支 A' },
					{ name: 'caseB', description: '分支 B' },
					{ name: 'default', description: '默认分支' },
				],
				code: "// 返回分支索引: 0=A, 1=B, 其他=默认\nif (input > 0) return 0;\nif (input < 0) return 1;\nreturn 2;",
				description: '根据返回值选择执行分支 (0=A, 1=B, 其他=默认)',
			};
		}
	}

	window.WorkflowApp.SwitchBlock = SwitchBlock;
})();
