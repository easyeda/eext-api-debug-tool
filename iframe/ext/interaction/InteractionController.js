(function () {
	'use strict';

	window.WorkflowApp = window.WorkflowApp || {};

	class InteractionController {
		constructor(canvas, state, eventBus, blockRenderer) {
			this.canvas = canvas;
			this.state = state;
			this.eventBus = eventBus;
			this.blockRenderer = blockRenderer;
			this.PORT_RADIUS = 8;

			this.portTooltip = document.createElement('div');
			this.portTooltip.style.cssText =
				'position:fixed;background:#1e1f1c;color:#f8f8f2;border:1px solid #49483e;border-radius:4px;padding:6px 10px;font:12px sans-serif;max-width:360px;word-wrap:break-word;pointer-events:none;z-index:9999;display:none;box-shadow:0 2px 8px rgba(0,0,0,0.5);';
			document.body.appendChild(this.portTooltip);

			this.bindCanvasEvents();
			this.bindKeyboardEvents();
		}

		hitTestPort(mx, my) {
			for (const b of this.state.blocks) {
				for (let i = 0; i < b.inputs.length; i++) {
					const p = window.WorkflowApp.Geometry.getPortPos(b, 'input', i);
					if (Math.hypot(mx - p.x, my - p.y) < this.PORT_RADIUS + 5) {
						return { blockId: b.id, side: 'input', index: i };
					}
				}
				for (let i = 0; i < b.outputs.length; i++) {
					const p = window.WorkflowApp.Geometry.getPortPos(b, 'output', i);
					if (Math.hypot(mx - p.x, my - p.y) < this.PORT_RADIUS + 5) {
						return { blockId: b.id, side: 'output', index: i };
					}
				}
			}
			return null;
		}

		hitTestBlock(mx, my) {
			for (let i = this.state.blocks.length - 1; i >= 0; i--) {
				const b = this.state.blocks[i];

				// Special handling for annotation blocks
				if (b.type === 'annotation') {
					const rot = ((b.rotation || 0) * Math.PI) / 180;
					const len = b.w || 150;

					// Transform mouse point to annotation's local space
					const dx = mx - b.x;
					const dy = my - b.y;
					const localX = dx * Math.cos(-rot) - dy * Math.sin(-rot);
					const localY = dx * Math.sin(-rot) + dy * Math.cos(-rot);

					// Check if within line bounds (with some tolerance)
					if (Math.abs(localY) < 20 && localX >= -len / 2 - 10 && localX <= len / 2 + 10) {
						return b;
					}
					continue;
				}

				const h = window.WorkflowApp.Geometry.getBlockHeight(b);
				const lp = window.WorkflowApp.Geometry.unrotatePoint(mx, my, b);
				if (lp.x >= b.x && lp.x <= b.x + b.w && lp.y >= b.y && lp.y <= b.y + h) {
					return b;
				}
			}
			return null;
		}

		hitTestDeleteBtn(mx, my, block) {
			if (block.type === 'annotation') {
				// Delete button is at center, below the line
				const rot = ((block.rotation || 0) * Math.PI) / 180;
				const dx = mx - block.x;
				const dy = my - block.y;
				const localX = dx * Math.cos(-rot) - dy * Math.sin(-rot);
				const localY = dx * Math.sin(-rot) + dy * Math.cos(-rot);
				return Math.abs(localX) < 10 && localY >= 12 && localY <= 32;
			}

			const lp = window.WorkflowApp.Geometry.unrotatePoint(mx, my, block);
			const bx = block.x + block.w - 24;
			const by = block.y + 8;
			return lp.x >= bx && lp.x <= bx + 20 && lp.y >= by && lp.y <= by + 20;
		}

		hitTestAnnotationArrowhead(mx, my, block) {
			if (block.type !== 'annotation') return false;

			const rot = ((block.rotation || 0) * Math.PI) / 180;
			const len = block.w || 150;

			// Arrowhead tip position in world space
			const tipX = block.x + (len / 2) * Math.cos(rot);
			const tipY = block.y + (len / 2) * Math.sin(rot);

			// Check distance to tip
			return Math.hypot(mx - tipX, my - tipY) < 15;
		}

		bindCanvasEvents() {
			this.boundHandlers = {
				mouseleave: () => {
					this.portTooltip.style.display = 'none';
				},
				contextmenu: (e) => {
					e.preventDefault();
					if (this.state.placingBlock) return;
					const rect = this.canvas.getBoundingClientRect();
					const w = window.WorkflowApp.Geometry.screenToWorld(e.clientX - rect.left, e.clientY - rect.top, this.state.camera);
					const block = this.hitTestBlock(w.x, w.y);
					if (block) {
						this.eventBus.emit('contextMenu', { x: e.clientX, y: e.clientY, block });
					}
				},
				mousedown: (e) => this.onMouseDown(e),
				mousemove: (e) => this.onMouseMove(e),
				mouseup: (e) => this.onMouseUp(e),
				dblclick: (e) => this.onDblClick(e),
				wheel: (e) => this.onWheel(e),
			};

			this.canvas.addEventListener('mouseleave', this.boundHandlers.mouseleave);
			this.canvas.addEventListener('contextmenu', this.boundHandlers.contextmenu);
			this.canvas.addEventListener('mousedown', this.boundHandlers.mousedown);
			this.canvas.addEventListener('mousemove', this.boundHandlers.mousemove);
			this.canvas.addEventListener('mouseup', this.boundHandlers.mouseup);
			this.canvas.addEventListener('dblclick', this.boundHandlers.dblclick);
			this.canvas.addEventListener('wheel', this.boundHandlers.wheel, { passive: false });
		}

		onMouseDown(e) {
			const rect = this.canvas.getBoundingClientRect();
			const sx = e.clientX - rect.left;
			const sy = e.clientY - rect.top;
			const w = window.WorkflowApp.Geometry.screenToWorld(sx, sy, this.state.camera);

			if (this.state.placingBlock && e.button === 0) {
				this.eventBus.emit('finalizePlacement');
				return;
			}
			if (this.state.placingBlock && e.button === 2) {
				this.placingRightClick = { x: sx, y: sy, time: Date.now() };
				this.state.panning = true;
				this.state.panStart = { x: sx - this.state.camera.x, y: sy - this.state.camera.y };
				e.preventDefault();
				return;
			}
			if (e.button === 1 || e.button === 2 || (e.button === 0 && this.state.spaceDown)) {
				this.state.panning = true;
				this.state.panStart = { x: sx - this.state.camera.x, y: sy - this.state.camera.y };
				e.preventDefault();
				return;
			}
			if (e.button !== 0) return;

			const port = this.hitTestPort(w.x, w.y);
			if (port && port.side === 'output') {
				this.state.connecting = { fromId: port.blockId, fromPort: port.index };
				e.preventDefault();
				return;
			}

			const block = this.hitTestBlock(w.x, w.y);
			if (block) {
				if (this.hitTestDeleteBtn(w.x, w.y, block)) {
					this.state.removeBlock(block.id);
					this.eventBus.emit('blockDeleted', block.id);
					return;
				}

				// Check if dragging annotation arrowhead for rotation
				if (block.type === 'annotation' && this.hitTestAnnotationArrowhead(w.x, w.y, block)) {
					this.state.selected = block.id;
					this.eventBus.emit('blockSelected', block);
					this.state.rotatingAnnotation = { blockId: block.id };
					return;
				}

				this.state.selected = block.id;
				this.eventBus.emit('blockSelected', block);
				this.state.dragging = { blockId: block.id, offsetX: w.x - block.x, offsetY: w.y - block.y };
				const idx = this.state.blocks.indexOf(block);
				this.state.blocks.splice(idx, 1);
				this.state.blocks.push(block);
				return;
			}

			this.state.selected = null;
			this.eventBus.emit('selectionCleared');
		}

		onMouseMove(e) {
			const rect = this.canvas.getBoundingClientRect();
			const sx = e.clientX - rect.left;
			const sy = e.clientY - rect.top;
			const w = window.WorkflowApp.Geometry.screenToWorld(sx, sy, this.state.camera);
			this.state.mouse = { x: sx, y: sy, wx: w.x, wy: w.y };

			if (this.state.panning) {
				this.state.camera.x = sx - this.state.panStart.x;
				this.state.camera.y = sy - this.state.panStart.y;
				this.portTooltip.style.display = 'none';
				return;
			}
			if (this.state.dragging) {
				const block = this.state.blocks.find((b) => b.id === this.state.dragging.blockId);
				if (block) {
					block.x = w.x - this.state.dragging.offsetX;
					block.y = w.y - this.state.dragging.offsetY;
				}
				this.portTooltip.style.display = 'none';
				return;
			}
			if (this.state.rotatingAnnotation) {
				const block = this.state.blocks.find((b) => b.id === this.state.rotatingAnnotation.blockId);
				if (block) {
					const angle = (Math.atan2(w.y - block.y, w.x - block.x) * 180) / Math.PI;
					block.rotation = angle;
				}
				this.portTooltip.style.display = 'none';
				return;
			}
			if (this.state.placingBlock) {
				this.state.placingBlock.x = w.x - this.state.placingBlock.w / 2;
				this.state.placingBlock.y = w.y - window.WorkflowApp.Geometry.getBlockHeight(this.state.placingBlock) / 2;
				this.portTooltip.style.display = 'none';
				return;
			}
			this.portTooltip.style.display = 'none';
		}

		onMouseUp(e) {
			if (this.placingRightClick && e.button === 2) {
				const rect = this.canvas.getBoundingClientRect();
				const sx = e.clientX - rect.left;
				const sy = e.clientY - rect.top;
				const dist = Math.hypot(sx - this.placingRightClick.x, sy - this.placingRightClick.y);
				const elapsed = Date.now() - this.placingRightClick.time;
				this.placingRightClick = null;
				this.state.panning = false;
				if (dist < 5 && elapsed < 300) {
					this.eventBus.emit('cancelPlacement');
				}
				return;
			}

			if (this.state.connecting) {
				const rect = this.canvas.getBoundingClientRect();
				const w = window.WorkflowApp.Geometry.screenToWorld(e.clientX - rect.left, e.clientY - rect.top, this.state.camera);
				const port = this.hitTestPort(w.x, w.y);
				const fromBlock = this.state.blocks.find((b) => b.id === this.state.connecting.fromId);

				if (port && port.side === 'input' && port.blockId !== this.state.connecting.fromId) {
					const exists = this.state.connections.some((c) => c.toId === port.blockId && c.toPort === port.index);
					if (!exists) {
						this.state.connections.push({
							fromId: this.state.connecting.fromId,
							fromPort: this.state.connecting.fromPort,
							toId: port.blockId,
							toPort: port.index,
						});
					}
				} else if (fromBlock && fromBlock.type === 'loop') {
					const targetBlock = this.hitTestBlock(w.x, w.y);
					if (targetBlock && targetBlock.id !== fromBlock.id) {
						const exists = this.state.connections.some((c) => c.fromId === fromBlock.id && c.toId === targetBlock.id && c.toPort === -1);
						if (!exists) {
							this.state.connections.push({
								fromId: fromBlock.id,
								fromPort: this.state.connecting.fromPort,
								toId: targetBlock.id,
								toPort: -1,
							});
						}
					}
				}
				this.state.connecting = null;
			}
			this.state.dragging = null;
			this.state.rotatingAnnotation = null;
			this.state.panning = false;
		}

		onDblClick(e) {
			const rect = this.canvas.getBoundingClientRect();
			const w = window.WorkflowApp.Geometry.screenToWorld(e.clientX - rect.left, e.clientY - rect.top, this.state.camera);
			const block = this.hitTestBlock(w.x, w.y);
			if (block) {
				this.state.selected = block.id;
				this.eventBus.emit('blockDblClick', block);
			}
		}

		onWheel(e) {
			e.preventDefault();
			const rect = this.canvas.getBoundingClientRect();
			const sx = e.clientX - rect.left;
			const sy = e.clientY - rect.top;
			const w = window.WorkflowApp.Geometry.screenToWorld(sx, sy, this.state.camera);
			const delta = e.deltaY > 0 ? 0.9 : 1.1;
			const newScale = Math.max(0.1, Math.min(4, this.state.camera.scale * delta));
			this.state.camera.x = sx - w.x * newScale;
			this.state.camera.y = sy - w.y * newScale;
			this.state.camera.scale = newScale;
		}

		bindKeyboardEvents() {
			this.keydownHandler = (e) => {
				const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable;

				if (e.code === 'Escape' && this.state.placingBlock) {
					this.eventBus.emit('cancelPlacement');
					return;
				}
				if (e.code === 'Space' && !isTyping) {
					e.preventDefault();
					if (this.state.selected) {
						const block = this.state.blocks.find((b) => b.id === this.state.selected);
						if (block) block.rotation = ((block.rotation || 0) + 90) % 360;
					} else {
						this.state.spaceDown = true;
						this.canvas.style.cursor = 'grab';
					}
				}
				if (e.code === 'Delete' && this.state.selected && !isTyping) {
					this.state.removeBlock(this.state.selected);
					this.eventBus.emit('blockDeleted', this.state.selected);
				}
				if ((e.ctrlKey || e.metaKey) && e.code === 'KeyD' && this.state.selected && !isTyping) {
					e.preventDefault();
					this.eventBus.emit('copyBlock', this.state.selected);
				}
				if ((e.ctrlKey || e.metaKey) && e.code === 'KeyC' && this.state.selected && !isTyping) {
					e.preventDefault();
					this.state.copiedBlock = this.state.selected;
				}
				if ((e.ctrlKey || e.metaKey) && e.code === 'KeyV' && this.state.copiedBlock && !isTyping) {
					e.preventDefault();
					this.eventBus.emit('copyBlock', this.state.copiedBlock);
				}
			};

			this.keyupHandler = (e) => {
				if (e.code === 'Space') {
					this.state.spaceDown = false;
					this.canvas.style.cursor = 'default';
				}
			};

			window.addEventListener('keydown', this.keydownHandler);
			window.addEventListener('keyup', this.keyupHandler);
		}

		destroy() {
			if (this.boundHandlers) {
				this.canvas.removeEventListener('mouseleave', this.boundHandlers.mouseleave);
				this.canvas.removeEventListener('contextmenu', this.boundHandlers.contextmenu);
				this.canvas.removeEventListener('mousedown', this.boundHandlers.mousedown);
				this.canvas.removeEventListener('mousemove', this.boundHandlers.mousemove);
				this.canvas.removeEventListener('mouseup', this.boundHandlers.mouseup);
				this.canvas.removeEventListener('dblclick', this.boundHandlers.dblclick);
				this.canvas.removeEventListener('wheel', this.boundHandlers.wheel);
			}
			if (this.keydownHandler) {
				window.removeEventListener('keydown', this.keydownHandler);
			}
			if (this.keyupHandler) {
				window.removeEventListener('keyup', this.keyupHandler);
			}
			if (this.portTooltip && this.portTooltip.parentNode) {
				this.portTooltip.parentNode.removeChild(this.portTooltip);
			}
		}
	}

	window.WorkflowApp.InteractionController = InteractionController;
})();
