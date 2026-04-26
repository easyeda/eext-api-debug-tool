(function () {
	'use strict';

	window.WorkflowApp = window.WorkflowApp || {};

	class ConnectionRenderer {
		constructor(ctx) {
			this.ctx = ctx;
		}

		drawConnection(from, to, color) {
			this.ctx.beginPath();
			this.ctx.moveTo(from.x, from.y);
			const dx = Math.max(60, Math.abs(to.x - from.x) * 0.5);
			this.ctx.bezierCurveTo(from.x + dx, from.y, to.x - dx, to.y, to.x, to.y);
			this.ctx.strokeStyle = color || '#66d9ef';
			this.ctx.lineWidth = 3;
			this.ctx.stroke();
		}
	}

	window.WorkflowApp.ConnectionRenderer = ConnectionRenderer;
})();
