(function () {
	'use strict';

	window.WorkflowApp = window.WorkflowApp || {};

	class Toolbar {
		constructor(actions) {
			this.actions = actions;
			document.getElementById('run').addEventListener('click', actions.run);
			document.getElementById('view-code').addEventListener('click', actions.viewCode);
			document.getElementById('export').addEventListener('click', actions.export);
			document.getElementById('import').addEventListener('click', actions.import);
			document.getElementById('clear').addEventListener('click', actions.clear);
		}
	}

	window.WorkflowApp.Toolbar = Toolbar;
})();
