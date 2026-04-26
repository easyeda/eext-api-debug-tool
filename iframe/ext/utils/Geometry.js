(function () {
	'use strict';

	window.WorkflowApp = window.WorkflowApp || {};

	const Geometry = {
		screenToWorld(sx, sy, camera) {
			return {
				x: (sx - camera.x) / camera.scale,
				y: (sy - camera.y) / camera.scale,
			};
		},

		rotatePoint(px, py, cx, cy, angle) {
			const rad = (angle * Math.PI) / 180;
			const cos = Math.cos(rad);
			const sin = Math.sin(rad);
			const dx = px - cx;
			const dy = py - cy;
			return {
				x: cx + dx * cos - dy * sin,
				y: cy + dx * sin + dy * cos,
			};
		},

		unrotatePoint(px, py, block) {
			const rot = block.rotation || 0;
			if (rot === 0) return { x: px, y: py };
			const c = this.getBlockCenter(block);
			return this.rotatePoint(px, py, c.x, c.y, -rot);
		},

		getBlockCenter(block) {
			const h = this.getBlockHeight(block);
			return { x: block.x + block.w / 2, y: block.y + h / 2 };
		},

		getBlockHeight(block) {
			const BLOCK_HEADER_H = 36;
			const BLOCK_PORT_H = 40;
			const BLOCK_DESC_H = 40;
			const ports = Math.max(block.inputs.length, block.outputs.length);
			const hasDesc = block.description && block.description.length > 0;
			return BLOCK_HEADER_H + Math.max(ports, 1) * BLOCK_PORT_H + 12 + (hasDesc ? BLOCK_DESC_H : 0);
		},

		getPortPos(block, side, index) {
			const BLOCK_HEADER_H = 36;
			const BLOCK_PORT_H = 40;
			const BLOCK_DESC_H = 40;
			const hasDesc = block.description && block.description.length > 0;
			const descOffset = hasDesc ? BLOCK_DESC_H : 0;
			const startY = BLOCK_HEADER_H + descOffset + 12;
			const py = block.y + startY + index * BLOCK_PORT_H + BLOCK_PORT_H / 2;
			const px = side === 'input' ? block.x : block.x + block.w;
			const rot = block.rotation || 0;
			if (rot === 0) return { x: px, y: py };
			const c = this.getBlockCenter(block);
			return this.rotatePoint(px, py, c.x, c.y, rot);
		},
	};

	window.WorkflowApp.Geometry = Geometry;
})();
