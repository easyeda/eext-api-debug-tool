(function () {
	'use strict';

	window.WorkflowApp = window.WorkflowApp || {};

	class CanvasState {
		constructor(eventBus) {
			this.eventBus = eventBus;
			this.blocks = [];
			this.connections = [];
			this.camera = { x: 0, y: 0, scale: 1 };
			this.dragging = null;
			this.connecting = null;
			this.selected = null;
			this.panning = false;
			this.panStart = { x: 0, y: 0 };
			this.spaceDown = false;
			this.nextId = 1;
			this.editingBlock = null;
			this.mouse = { x: 0, y: 0, wx: 0, wy: 0 };
			this.placingBlock = null;
			this.copiedBlock = null;
		}

		addBlock(block) {
			block.id = this.nextId++;
			this.blocks.push(block);
			this.selected = block.id;
			this.eventBus.emit('blockAdded', block);
			this.eventBus.emit('stateChanged');
			return block;
		}

		removeBlock(blockId) {
			this.blocks = this.blocks.filter((b) => b.id !== blockId);
			this.connections = this.connections.filter((c) => c.fromId !== blockId && c.toId !== blockId);
			if (this.selected === blockId) this.selected = null;
			this.eventBus.emit('blockRemoved', blockId);
			this.eventBus.emit('stateChanged');
		}

		addConnection(connection) {
			const exists = this.connections.some(
				(c) =>
					c.fromId === connection.fromId &&
					c.fromPort === connection.fromPort &&
					c.toId === connection.toId &&
					c.toPort === connection.toPort,
			);
			if (!exists) {
				this.connections.push(connection);
				this.eventBus.emit('connectionAdded', connection);
				this.eventBus.emit('stateChanged');
			}
		}

		clearInputConnection(blockId, portIndex) {
			this.connections = this.connections.filter((c) => !(c.toId === blockId && c.toPort === portIndex));
			this.eventBus.emit('stateChanged');
		}

		clear() {
			this.blocks = [];
			this.connections = [];
			this.selected = null;
			this.nextId = 1;
			this.camera = { x: 0, y: 0, scale: 1 };
			this.eventBus.emit('stateCleared');
			this.eventBus.emit('stateChanged');
		}

		getBlock(id) {
			return this.blocks.find((b) => b.id === id);
		}

		getSelectedBlock() {
			return this.selected ? this.getBlock(this.selected) : null;
		}

		toJSON() {
			return {
				version: 1,
				blocks: this.blocks,
				connections: this.connections,
				nextId: this.nextId,
			};
		}

		loadFromJSON(data) {
			this.blocks = data.blocks || [];
			this.connections = data.connections || [];
			this.nextId = data.nextId || this.blocks.length + 1;
			this.selected = null;
			this.camera = { x: 0, y: 0, scale: 1 };
			this.eventBus.emit('stateLoaded');
			this.eventBus.emit('stateChanged');
		}
	}

	window.WorkflowApp.CanvasState = CanvasState;
})();
