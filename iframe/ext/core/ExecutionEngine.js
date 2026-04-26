(function () {
	'use strict';

	window.WorkflowApp = window.WorkflowApp || {};

	class ExecutionEngine {
		constructor(state, eventBus) {
			this.state = state;
			this.eventBus = eventBus;
			this.AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
			this.executionState = {
				running: false,
				order: [],
				outputs: new Map(),
				outputPaths: new Map(),
				currentIndex: 0,
				pendingArraySelection: null,
				selectionHistory: [],
				pendingConnections: [],
			};
		}

		topoSort() {
			const edges = [];
			for (const c of this.state.connections) {
				if (c.toPort === -1) continue;
				edges.push({ from: c.fromId, to: c.toId });
			}
			for (const lb of this.state.blocks.filter((b) => b.type === 'loop')) {
				const downstreamIds = this.getDownstreamIds(lb.id);
				const externalSources = new Set();
				for (const did of downstreamIds) {
					edges.push({ from: lb.id, to: did });
					for (const c of this.state.connections) {
						if (c.toId === did && c.toPort !== -1 && c.fromId !== lb.id && !downstreamIds.has(c.fromId)) {
							externalSources.add(c.fromId);
						}
					}
				}
				for (const srcId of externalSources) {
					edges.push({ from: srcId, to: lb.id });
				}
			}
			const inDeg = new Map(this.state.blocks.map((b) => [b.id, 0]));
			for (const e of edges) inDeg.set(e.to, (inDeg.get(e.to) || 0) + 1);
			const queue = this.state.blocks.filter((b) => inDeg.get(b.id) === 0).map((b) => b.id);
			const order = [];
			while (queue.length) {
				const id = queue.shift();
				order.push(id);
				for (const e of edges) {
					if (e.from === id) {
						const deg = inDeg.get(e.to) - 1;
						inDeg.set(e.to, deg);
						if (deg === 0) queue.push(e.to);
					}
				}
			}
			return order;
		}

		getDownstreamIds(startId) {
			const visited = new Set();
			const queue = [startId];
			while (queue.length) {
				const id = queue.shift();
				for (const c of this.state.connections) {
					if (c.fromId === id && !visited.has(c.toId)) {
						visited.add(c.toId);
						queue.push(c.toId);
					}
				}
			}
			return visited;
		}

		async execute() {
			if (this.executionState.running) {
				eda.sys_Message.showToastMessage('工作流正在运行中...', 'info', 1);
				return;
			}

			this.executionState.running = true;
			this.executionState.order = this.topoSort();
			this.executionState.outputs = new Map();
			this.executionState.outputPaths = new Map();
			this.executionState.currentIndex = 0;
			this.executionState.pendingArraySelection = null;
			this.executionState.selectionHistory = [];
			this.executionState.pendingConnections = [];

			this.state.connections.forEach((c) => {
				c.pathSelected = false;
			});

			await this.executeWorkflow();
		}

		async executeWorkflow() {
			while (this.executionState.currentIndex < this.executionState.order.length) {
				const id = this.executionState.order[this.executionState.currentIndex];
				const block = this.state.blocks.find((b) => b.id === id);

				if (!block) {
					this.executionState.currentIndex++;
					continue;
				}

				if (block.type === 'loop') {
					await this.executeLoop(block);
					continue;
				}

				const args = {};
				const inputNames = block.inputs.map(window.WorkflowApp.Helpers.portName);

				for (let i = 0; i < block.inputs.length; i++) {
					const conn = this.state.connections.find((c) => c.toId === id && c.toPort === i);
					if (conn) {
						if (!this.executionState.outputs.has(conn.fromId)) {
							throw new Error(`Upstream block ${conn.fromId} has not finished yet`);
						}
						const fromOutputs = this.executionState.outputs.get(conn.fromId) || [];
						if (conn.fromPort >= fromOutputs.length) {
							throw new Error(`Upstream output port ${conn.fromPort} has no data`);
						}
						let value = await window.WorkflowApp.Helpers.resolveExecutionValue(fromOutputs[conn.fromPort]);
						if (conn.fromPath && conn.fromPath !== '$') {
							value = window.WorkflowApp.Helpers.getValueAtPath(value, conn.fromPath);
						}
						args[inputNames[i]] = value;
					} else {
						args[inputNames[i]] = undefined;
					}
				}

				try {
					const fn = new this.AsyncFunction(...inputNames, block.code);
					const result = await fn(...inputNames.map((k) => args[k]));
					this.executionState.outputs.set(id, block.outputs.length ? [result] : []);
					this.executionState.outputPaths.set(id, block.outputs.length ? ['$'] : []);

					if (block.outputs.length > 0 && result !== null && result !== undefined && typeof result === 'object') {
						const outgoing = this.state.connections.filter((c) => c.fromId === id && c.toPort !== -1);
						const needSelection = outgoing.filter((c) => !c.pathSelected && (!c.fromPath || c.fromPath === '$'));
						if (needSelection.length > 0) {
							this.executionState.pendingConnections = needSelection.map((c) => {
								const targetBlock = this.state.blocks.find((b) => b.id === c.toId);
								const targetInput =
									targetBlock && targetBlock.inputs[c.toPort]
										? window.WorkflowApp.Helpers.portName(targetBlock.inputs[c.toPort])
										: `input${c.toPort}`;
								const targetInputDesc =
									targetBlock && targetBlock.inputs[c.toPort]
										? window.WorkflowApp.Helpers.portDesc(targetBlock.inputs[c.toPort])
										: '';
								return { conn: c, targetBlock, targetInput, targetInputDesc };
							});
							const first = this.executionState.pendingConnections.shift();
							const targetLabel = first.targetBlock ? `${first.targetBlock.title}.${first.targetInput}` : first.targetInput;
							this.executionState.pendingArraySelection = {
								blockId: id,
								blockTitle: `${block.title} → ${targetLabel}`,
								data: result,
								selectedPath: '$',
								targetConn: first.conn,
								targetInputDesc: first.targetInputDesc,
							};
							this.eventBus.emit('arraySelectionNeeded', this.executionState.pendingArraySelection);
							return;
						}
					}

					this.executionState.currentIndex++;
				} catch (err) {
					console.error(`Block "${block.title}" error:`, err);
					eda.sys_Message.showToastMessage(`模块 "${block.title}" 出错: ${err.message}`, 'info', 1);
					this.executionState.running = false;
					return;
				}
			}

			this.executionState.running = false;
			eda.sys_Message.showToastMessage('工作流执行完成', 'info', 1);
		}

		async executeLoop(block) {
			const loopCount = block.loopCount || 3;
			const loopDelay = block.loopDelay || 0;
			const downstreamIds = this.getDownstreamIds(block.id);
			const downstreamOrder = this.executionState.order.filter((oid) => downstreamIds.has(oid));

			const cachedArgs = new Map();
			for (const did of downstreamOrder) {
				const dBlock = this.state.blocks.find((b) => b.id === did);
				if (!dBlock) continue;
				const inputNames = dBlock.inputs.map(window.WorkflowApp.Helpers.portName);
				for (let pi = 0; pi < dBlock.inputs.length; pi++) {
					const conn = this.state.connections.find((c) => c.toId === did && c.toPort === pi);
					if (!conn) continue;
					const fromInLoop = conn.fromId === block.id || downstreamIds.has(conn.fromId);
					if (!fromInLoop) {
						const fromOutputs = this.executionState.outputs.get(conn.fromId) || [];
						if (conn.fromPort < fromOutputs.length) {
							let val = await window.WorkflowApp.Helpers.resolveExecutionValue(fromOutputs[conn.fromPort]);
							if (conn.fromPath && conn.fromPath !== '$') {
								val = window.WorkflowApp.Helpers.getValueAtPath(val, conn.fromPath);
							}
							if (!cachedArgs.has(did)) cachedArgs.set(did, {});
							cachedArgs.get(did)[inputNames[pi]] = val;
						}
					}
				}
			}

			for (let i = 0; i < loopCount; i++) {
				if (i > 0) {
					await new Promise((r) => setTimeout(r, loopDelay > 0 ? loopDelay : 0));
				}
				this.executionState.outputs.set(block.id, [i]);
				this.executionState.outputPaths.set(block.id, ['$']);

				for (const did of downstreamOrder) {
					const dBlock = this.state.blocks.find((b) => b.id === did);
					if (!dBlock) continue;

					const args = {};
					const inputNames = dBlock.inputs.map(window.WorkflowApp.Helpers.portName);

					for (let pi = 0; pi < dBlock.inputs.length; pi++) {
						const conn = this.state.connections.find((c) => c.toId === did && c.toPort === pi);
						if (!conn) {
							args[inputNames[pi]] = undefined;
							continue;
						}
						const fromInLoop = conn.fromId === block.id || downstreamIds.has(conn.fromId);
						if (fromInLoop) {
							const fromOutputs = this.executionState.outputs.get(conn.fromId) || [];
							if (conn.fromPort < fromOutputs.length) {
								let value = await window.WorkflowApp.Helpers.resolveExecutionValue(fromOutputs[conn.fromPort]);
								if (conn.fromPath && conn.fromPath !== '$') {
									value = window.WorkflowApp.Helpers.getValueAtPath(value, conn.fromPath);
								}
								args[inputNames[pi]] = value;
							} else {
								args[inputNames[pi]] = undefined;
							}
						} else {
							const cached = cachedArgs.get(did);
							args[inputNames[pi]] = cached ? cached[inputNames[pi]] : undefined;
						}
					}

					try {
						const fn = new this.AsyncFunction(...inputNames, dBlock.code);
						const result = await fn(...inputNames.map((k) => args[k]));
						this.executionState.outputs.set(did, dBlock.outputs.length ? [result] : []);
						this.executionState.outputPaths.set(did, dBlock.outputs.length ? ['$'] : []);
					} catch (err) {
						console.error(`Block "${dBlock.title}" error (loop ${i + 1}/${loopCount}):`, err);
						eda.sys_Message.showToastMessage(`模块 "${dBlock.title}" 出错 (循环 ${i + 1}/${loopCount}): ${err.message}`, 'info', 1);
						this.executionState.running = false;
						return;
					}
				}
			}

			this.executionState.currentIndex++;
			while (
				this.executionState.currentIndex < this.executionState.order.length &&
				downstreamIds.has(this.executionState.order[this.executionState.currentIndex])
			) {
				this.executionState.currentIndex++;
			}
		}

		async continueAfterArraySelection(selectedPath) {
			if (!this.executionState.pendingArraySelection) return;

			const { blockId, data, targetConn } = this.executionState.pendingArraySelection;
			const block = this.state.blocks.find((b) => b.id === blockId);

			this.executionState.selectionHistory.push({
				blockId,
				blockTitle: this.executionState.pendingArraySelection.blockTitle,
				data,
				previousPath: selectedPath,
				targetConn,
			});

			if (targetConn) {
				targetConn.fromPath = selectedPath;
				targetConn.pathSelected = true;
			}

			if (this.executionState.pendingConnections.length > 0) {
				const next = this.executionState.pendingConnections.shift();
				const targetLabel = next.targetBlock ? `${next.targetBlock.title}.${next.targetInput}` : next.targetInput;
				this.executionState.pendingArraySelection = {
					blockId,
					blockTitle: `${block ? block.title : ''} → ${targetLabel}`,
					data,
					selectedPath: '$',
					targetConn: next.conn,
					targetInputDesc: next.targetInputDesc,
				};
				this.eventBus.emit('arraySelectionNeeded', this.executionState.pendingArraySelection);
				return;
			}

			this.executionState.pendingArraySelection = null;
			this.executionState.currentIndex++;
			await this.executeWorkflow();
		}

		cancelExecution() {
			this.executionState.running = false;
			this.executionState.pendingArraySelection = null;
			this.executionState.pendingConnections = [];
		}

		async executeSingleBlock(block) {
			const args = {};
			const inputNames = block.inputs.map(window.WorkflowApp.Helpers.portName);

			for (let i = 0; i < block.inputs.length; i++) {
				const conn = this.state.connections.find((c) => c.toId === block.id && c.toPort === i);
				if (conn) {
					const sourceBlock = this.state.blocks.find((b) => b.id === conn.fromId);
					if (sourceBlock) {
						const sourceResult = await this.executeSingleBlock(sourceBlock);
						let value = sourceResult;
						if (conn.fromPath && conn.fromPath !== '$') {
							value = window.WorkflowApp.Helpers.getValueAtPath(value, conn.fromPath);
						}
						args[inputNames[i]] = value;
					}
				}
			}

			const fn = new this.AsyncFunction(...inputNames, block.code);
			return await fn(...inputNames.map((k) => args[k]));
		}
	}

	window.WorkflowApp.ExecutionEngine = ExecutionEngine;
})();
