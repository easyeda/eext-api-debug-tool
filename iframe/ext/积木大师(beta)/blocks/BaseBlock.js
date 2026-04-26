(function () {
	'use strict';

	window.WorkflowApp = window.WorkflowApp || {};

	class BaseBlock {
		constructor(data = {}) {
			const metadata = this.constructor.getMetadata();
			this.id = data.id || -1;
			this.type = metadata.type;
			this.title = data.title || metadata.title;
			this.color = data.color || metadata.color;
			this.x = data.x || 0;
			this.y = data.y || 0;
			this.w = data.w || 200;
			this.inputs = data.inputs || metadata.inputs || [];
			this.outputs = data.outputs || metadata.outputs || [];
			this.code = data.code || metadata.code || '';
			this.description = data.description || metadata.description || '';
			this.rotation = data.rotation || 0;
			this.value = data.value;
			this.varName = data.varName;
			this.varScope = data.varScope;
			this.loopCount = data.loopCount;
			this.loopDelay = data.loopDelay;
			this.savedPath = data.savedPath;
		}

		static getMetadata() {
			throw new Error('Block class must implement getMetadata()');
		}

		async execute(inputs) {
			const inputNames = this.inputs.map(window.WorkflowApp.Helpers.portName);
			const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
			const fn = new AsyncFunction(...inputNames, this.code);
			return await fn(...inputNames.map((name) => inputs[name]));
		}

		generateCode() {
			return this.code;
		}

		serialize() {
			return {
				id: this.id,
				type: this.type,
				title: this.title,
				color: this.color,
				x: this.x,
				y: this.y,
				w: this.w,
				inputs: this.inputs,
				outputs: this.outputs,
				code: this.code,
				description: this.description,
				value: this.value,
				varName: this.varName,
				varScope: this.varScope,
				loopCount: this.loopCount,
				loopDelay: this.loopDelay,
				rotation: this.rotation,
				savedPath: this.savedPath,
			};
		}
	}

	window.WorkflowApp.BaseBlock = BaseBlock;
})();
