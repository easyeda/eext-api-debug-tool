(function () {
	'use strict';

	window.WorkflowApp = window.WorkflowApp || {};

	class CanvasRenderer {
		constructor(canvas, ctx, state) {
			this.canvas = canvas;
			this.ctx = ctx;
			this.state = state;
			this.gridRenderer = new window.WorkflowApp.GridRenderer(ctx, state);
			this.connectionRenderer = new window.WorkflowApp.ConnectionRenderer(ctx);
			this.blockRenderer = new window.WorkflowApp.BlockRenderer(ctx, state);
		}

		render() {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.fillStyle = '#272822';
			this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

			this.ctx.save();
			this.ctx.translate(this.state.camera.x, this.state.camera.y);
			this.ctx.scale(this.state.camera.scale, this.state.camera.scale);

			this.gridRenderer.render(this.canvas);

			for (const c of this.state.connections) {
				const fromBlock = this.state.blocks.find((b) => b.id === c.fromId);
				const toBlock = this.state.blocks.find((b) => b.id === c.toId);
				if (!fromBlock || !toBlock) continue;
				const from = window.WorkflowApp.Geometry.getPortPos(fromBlock, 'output', c.fromPort);
				let to;
				if (c.toPort === -1) {
					const h = window.WorkflowApp.Geometry.getBlockHeight(toBlock);
					to = { x: toBlock.x, y: toBlock.y + h / 2 };
				} else {
					to = window.WorkflowApp.Geometry.getPortPos(toBlock, 'input', c.toPort);
				}
				this.connectionRenderer.drawConnection(from, to, c.toPort === -1 ? '#ae81ff' : undefined);
			}

			if (this.state.connecting) {
				const fromBlock = this.state.blocks.find((b) => b.id === this.state.connecting.fromId);
				if (fromBlock) {
					const from = window.WorkflowApp.Geometry.getPortPos(fromBlock, 'output', this.state.connecting.fromPort);
					this.connectionRenderer.drawConnection(from, { x: this.state.mouse.wx, y: this.state.mouse.wy }, '#f92672');
				}
			}

			for (const b of this.state.blocks) {
				this.blockRenderer.drawBlock(b);
			}

			if (this.state.placingBlock) {
				this.ctx.globalAlpha = 0.6;
				this.blockRenderer.drawBlock(this.state.placingBlock);
				this.ctx.globalAlpha = 1;
			}

			this.ctx.restore();
			requestAnimationFrame(() => this.render());
		}

		resize() {
			this.canvas.width = this.canvas.clientWidth;
			this.canvas.height = this.canvas.clientHeight;
		}
	}

	window.WorkflowApp.CanvasRenderer = CanvasRenderer;
})();
