(function () {
	'use strict';

	window.WorkflowApp = window.WorkflowApp || {};

	class GridRenderer {
		constructor(ctx, state) {
			this.ctx = ctx;
			this.state = state;
		}

		render(canvas) {
			const grid = 40;
			const startX = (-this.state.camera.x / this.state.camera.scale) % grid;
			const startY = (-this.state.camera.y / this.state.camera.scale) % grid;
			this.ctx.save();
			this.ctx.strokeStyle = '#31322c';
			this.ctx.lineWidth = 1 / this.state.camera.scale;
			for (let x = startX; x < canvas.width / this.state.camera.scale; x += grid) {
				this.ctx.beginPath();
				this.ctx.moveTo(x, -this.state.camera.y / this.state.camera.scale);
				this.ctx.lineTo(x, (-this.state.camera.y + canvas.height) / this.state.camera.scale);
				this.ctx.stroke();
			}
			for (let y = startY; y < canvas.height / this.state.camera.scale; y += grid) {
				this.ctx.beginPath();
				this.ctx.moveTo(-this.state.camera.x / this.state.camera.scale, y);
				this.ctx.lineTo((-this.state.camera.x + canvas.width) / this.state.camera.scale, y);
				this.ctx.stroke();
			}
			this.ctx.restore();
		}
	}

	window.WorkflowApp.GridRenderer = GridRenderer;
})();
