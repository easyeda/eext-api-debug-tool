(function () {
	'use strict';

	window.WorkflowApp = window.WorkflowApp || {};

	class WorkflowEngine {
		constructor() {
			this.canvas = document.getElementById('canvas');
			this.ctx = this.canvas.getContext('2d');
			this.eventBus = new window.WorkflowApp.EventBus();
			this.state = new window.WorkflowApp.CanvasState(this.eventBus);
			this.registry = new window.WorkflowApp.BlockRegistry();

			this.registerBuiltInBlocks();
			this.registerApiBlocks();

			this.renderer = new window.WorkflowApp.CanvasRenderer(this.canvas, this.ctx, this.state);
			this.executionEngine = new window.WorkflowApp.ExecutionEngine(this.state, this.eventBus);
			this.serializer = new window.WorkflowApp.WorkflowSerializer(this.state);
			this.codeGenerator = new window.WorkflowApp.CodeGenerator(this.state);
			this.propertiesPanel = new window.WorkflowApp.PropertiesPanel(this.state, this.registry, this.renderer.blockRenderer, this.eventBus);
			this.contextMenu = new window.WorkflowApp.ContextMenu(this.state);
			this.searchPanel = new window.WorkflowApp.SearchPanel(this.registry, (type) => this.startBlockPlacement(type));
			this.toolbar = new window.WorkflowApp.Toolbar({
				run: () => this.executionEngine.execute(),
				viewCode: () => this.modalManager.showCodeView(this.state),
				export: () => this.serializer.export(),
				import: () => this.importWorkflow(),
				clear: () => this.clearWorkflow(),
			});
			this.modalManager = new window.WorkflowApp.ModalManager(this.codeGenerator, this.executionEngine);
			this.interactionController = new window.WorkflowApp.InteractionController(
				this.canvas,
				this.state,
				this.eventBus,
				this.renderer.blockRenderer,
			);

			this.bindEvents();
			this.bindExternalIntegration();
			this.resize();
			window.addEventListener('resize', () => this.resize());
			requestAnimationFrame(() => this.renderer.render());

			window.workflowCanvas = {
				createBlockFromMethod: (methodPath, edcodeItem) => this.createBlockFromMethod(methodPath, edcodeItem),
			};
		}

		registerBuiltInBlocks() {
			this.registry.register(window.WorkflowApp.CustomBlock);
			this.registry.register(window.WorkflowApp.FunctionBlock);
			this.registry.register(window.WorkflowApp.VariableBlock);
			this.registry.register(window.WorkflowApp.LoopBlock);
			this.registry.register(window.WorkflowApp.AnnotationBlock);
			this.registry.register(window.WorkflowApp.ConditionBlock);
			this.registry.register(window.WorkflowApp.TryCatchBlock);
			this.registry.register(window.WorkflowApp.DelayBlock);
			this.registry.register(window.WorkflowApp.ConsoleBlock);
			this.registry.register(window.WorkflowApp.SwitchBlock);
			this.registry.register(window.WorkflowApp.MergeBlock);
			this.registry.register(window.WorkflowApp.ForEachBlock);
		}

		registerApiBlocks() {
			if (typeof edcode === 'undefined') {
				console.warn('edcode not loaded');
				return;
			}
			edcode.forEach((item) => {
				if (item.isEnumMember || item.isEnum) return;
				const metadata = window.WorkflowApp.ApiBlock.createFromEdcode(item);
				const BlockClass = class extends window.WorkflowApp.BaseBlock {
					static getMetadata() {
						return metadata;
					}
				};
				this.registry.register(BlockClass);
			});
		}

		bindEvents() {
			this.eventBus.on('contextMenu', ({ x, y, block }) => {
				this.contextMenu.show(x, y, block);
			});

			this.eventBus.on('blockSelected', (block) => {
				if (this.propertiesPanel.panel.classList.contains('open')) {
					this.propertiesPanel.open(block);
				}
			});

			this.eventBus.on('selectionCleared', () => {
				if (this.propertiesPanel.panel.classList.contains('open')) {
					this.propertiesPanel.open(null);
				}
			});

			this.eventBus.on('blockDblClick', (block) => {
				if (
					this.propertiesPanel.panel.classList.contains('open') &&
					this.propertiesPanel.currentBlock &&
					this.propertiesPanel.currentBlock.id === block.id
				) {
					this.propertiesPanel.close();
				} else {
					this.propertiesPanel.open(block);
				}
			});

			this.eventBus.on('blockDeleted', (blockId) => {
				if (this.propertiesPanel.panel.classList.contains('open')) {
					if (this.propertiesPanel.currentBlock && this.propertiesPanel.currentBlock.id === blockId) {
						this.propertiesPanel.open(null);
					}
				}
			});

			this.eventBus.on('copyBlock', (blockId) => {
				this.copyBlock(blockId);
			});

			this.eventBus.on('finalizePlacement', () => {
				this.finalizePlacement();
			});

			this.eventBus.on('cancelPlacement', () => {
				this.cancelPlacement();
			});

			this.eventBus.on('arraySelectionNeeded', (selection) => {
				this.modalManager.showArraySelection(selection);
			});

			this.eventBus.on('requestPathSelection', async ({ block, conn, targetBlock, targetInput, targetInputDesc }) => {
				try {
					eda.sys_Message.showToastMessage('正在执行模块以获取输出...', 'info', 1);
					const result = await this.executionEngine.executeSingleBlock(block);
					if (result === null || result === undefined || typeof result !== 'object') {
						eda.sys_Message.showToastMessage('模块输出不是对象，无需选择路径', 'info', 1);
						return;
					}
					const targetLabel = targetBlock ? `${targetBlock.title}.${targetInput}` : targetInput;
					const selection = {
						blockId: block.id,
						blockTitle: `${block.title} → ${targetLabel}`,
						data: result,
						selectedPath: conn.fromPath || '$',
						targetConn: conn,
						targetInputDesc,
						manualMode: true,
						onConfirm: () => {
							if (this.propertiesPanel.panel.classList.contains('open') && this.propertiesPanel.currentBlock) {
								this.propertiesPanel.open(this.propertiesPanel.currentBlock);
							}
						},
					};
					this.modalManager.showArraySelection(selection);
				} catch (err) {
					console.error('Path selection execution error:', err);
					eda.sys_Message.showToastMessage(`执行模块出错: ${err.message}`, 'info', 1);
				}
			});

			this.modalManager.bindArraySelectionActions();
		}

		bindExternalIntegration() {
			if (typeof editor !== 'undefined' && editor.session) {
				editor.session.on('change', (delta) => {
					if (delta.action === 'insert' && delta.lines && delta.lines.length > 0) {
						const text = delta.lines.join('\n');
						const match = text.match(/^eda\.[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*$/);
						if (match) {
							const methodPath = match[0];
							const edcodeItem = window.edcode && window.edcode.find((item) => item.methodPath === methodPath);
							if (edcodeItem) {
								const Range = ace.require('ace/range').Range;
								const range = new Range(delta.start.row, delta.start.column, delta.end.row, delta.end.column);
								editor.session.remove(range);
								this.createBlockFromMethod(methodPath, edcodeItem);
							}
						}
					}
				});
			}
		}

		createBlockInstance(type, data = {}) {
			const BlockClass = this.registry.get(type);
			if (!BlockClass) return null;
			return new BlockClass(data);
		}

		startBlockPlacement(type) {
			const metadata = this.registry.getMetadata(type);
			if (!metadata) return;
			if (this.state.placingBlock) this.state.placingBlock = null;
			const block = {
				id: -1,
				type,
				title: metadata.title,
				color: metadata.color,
				x: this.state.mouse.wx - 100,
				y: this.state.mouse.wy - 20,
				w: 200,
				inputs: [...(metadata.inputs || [])],
				outputs: [...(metadata.outputs || [])],
				code: metadata.code || '',
				description: metadata.description || '',
				value: metadata.value !== undefined ? metadata.value : undefined,
				varName: metadata.varName !== undefined ? metadata.varName : undefined,
				varScope: metadata.varScope !== undefined ? metadata.varScope : undefined,
				loopCount: metadata.loopCount !== undefined ? metadata.loopCount : undefined,
				loopDelay: metadata.loopDelay !== undefined ? metadata.loopDelay : undefined,
				rotation: 0,
			};
			block.w = this.renderer.blockRenderer.measureBlockWidth(block);
			this.state.placingBlock = block;
			this.canvas.style.cursor = 'crosshair';
		}

		finalizePlacement() {
			if (!this.state.placingBlock) return;
			const block = this.state.placingBlock;
			block.id = this.state.nextId++;
			this.state.blocks.push(block);
			this.state.selected = block.id;
			this.state.placingBlock = null;
			this.canvas.style.cursor = 'default';
			if (this.propertiesPanel.panel.classList.contains('open')) {
				this.propertiesPanel.open(block);
			}
		}

		cancelPlacement() {
			this.state.placingBlock = null;
			this.canvas.style.cursor = 'default';
		}

		copyBlock(blockId) {
			const original = this.state.blocks.find((b) => b.id === blockId);
			if (!original) return;
			if (this.state.placingBlock) this.state.placingBlock = null;
			const block = {
				id: -1,
				type: original.type,
				title: original.title,
				color: original.color,
				x: this.state.mouse.wx - original.w / 2,
				y: this.state.mouse.wy - 20,
				w: original.w,
				inputs: [...original.inputs],
				outputs: [...original.outputs],
				code: original.code,
				description: original.description || '',
				value: original.value !== undefined ? original.value : undefined,
				varName: original.varName !== undefined ? original.varName : undefined,
				varScope: original.varScope !== undefined ? original.varScope : undefined,
				loopCount: original.loopCount !== undefined ? original.loopCount : undefined,
				loopDelay: original.loopDelay !== undefined ? original.loopDelay : undefined,
				rotation: original.rotation || 0,
				savedPath: original.savedPath,
			};
			this.state.placingBlock = block;
			this.canvas.style.cursor = 'crosshair';
		}

		createBlockFromMethod(methodPath, edcodeItem) {
			const blockId = methodPath.replace(/\./g, '_');
			if (!this.registry.has(blockId) && edcodeItem) {
				const metadata = window.WorkflowApp.ApiBlock.createFromEdcode(edcodeItem);
				const BlockClass = class extends window.WorkflowApp.BaseBlock {
					static getMetadata() {
						return metadata;
					}
				};
				this.registry.register(BlockClass);
			}
			this.startBlockPlacement(blockId);
		}

		clearWorkflow() {
			eda.sys_Dialog.showConfirmationMessage('确定清空所有模块？', '确认清空', '确定', '取消', (confirmed) => {
				if (confirmed) {
					this.state.clear();
					if (this.propertiesPanel.panel.classList.contains('open')) {
						this.propertiesPanel.open(null);
					}
				}
			});
		}

		importWorkflow() {
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = '.json';
			input.onchange = (e) => {
				const file = e.target.files[0];
				if (!file) return;
				this.serializer.import(file, (data) => {
					const load = () => {
						this.state.loadFromJSON(data);
						if (this.propertiesPanel.panel.classList.contains('open')) {
							this.propertiesPanel.open(null);
						}
						eda.sys_Message.showToastMessage('工作流导入成功', 'info', 1);
					};
					if (this.state.blocks.length > 0) {
						eda.sys_Dialog.showConfirmationMessage('导入将清空当前工作流，是否继续？', '确认导入', '继续', '取消', (confirmed) => {
							if (confirmed) load();
						});
					} else {
						load();
					}
				});
			};
			input.click();
		}

		resize() {
			this.renderer.resize();
		}
	}

	window.WorkflowApp.WorkflowEngine = WorkflowEngine;

	document.addEventListener('DOMContentLoaded', () => {
		window.workflowEngine = new WorkflowEngine();
	});
})();
