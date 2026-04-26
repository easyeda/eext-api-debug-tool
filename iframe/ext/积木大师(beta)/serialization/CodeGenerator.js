(function () {
	'use strict';

	window.WorkflowApp = window.WorkflowApp || {};

	class CodeGenerator {
		constructor(state) {
			this.state = state;
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

		_isMultiOutput(block) {
			return block.type === 'condition' || block.type === 'trycatch';
		}

		_genInputs(block, indent) {
			let out = '';
			const inputNames = block.inputs.map(window.WorkflowApp.Helpers.portName);
			for (let i = 0; i < block.inputs.length; i++) {
				const conn = this.state.connections.find((c) => c.toId === block.id && c.toPort === i);
				if (conn) {
					const fromBlock = this.state.blocks.find((b) => b.id === conn.fromId);
					const fromLabel = fromBlock ? fromBlock.title : `block_${conn.fromId}`;
					const baseRef = fromBlock && this._isMultiOutput(fromBlock) ? `_out_${conn.fromId}_${conn.fromPort}` : `_out_${conn.fromId}`;
					const pathSuffix = window.WorkflowApp.Helpers.pathToAccessor(conn.fromPath);

					if (pathSuffix) {
						out += `${indent}const _raw_${inputNames[i]} = ${baseRef}; // ← ${fromLabel}\n`;
						out += `${indent}const ${inputNames[i]} = _raw_${inputNames[i]}${pathSuffix}; // 路径映射: ${conn.fromPath}\n`;
					} else {
						out += `${indent}const ${inputNames[i]} = ${baseRef}; // ← ${fromLabel}\n`;
					}
				} else {
					out += `${indent}const ${inputNames[i]} = undefined;\n`;
				}
			}
			return out;
		}

		_transformCode(block, indent) {
			let blockCode = block.code;
			if (block.outputs.length > 0) {
				if (this._isMultiOutput(block)) {
					blockCode = blockCode.replace(/\breturn\s+([\s\S]*?);/g, `_cond_${block.id} = $1;`).replace(/\breturn\s*;/g, `_cond_${block.id} = undefined;`);
				} else {
					blockCode = blockCode.replace(/\breturn\s+([\s\S]*?);/g, `_out_${block.id} = $1;`).replace(/\breturn\s*;/g, `_out_${block.id} = undefined;`);
				}
			}
			return blockCode
				.split('\n')
				.map((line) => indent + line)
				.join('\n') + '\n';
		}

		_genBlock(block, indent) {
			if (block.type === 'condition') {
				return this._genConditionBlock(block, indent);
			}
			if (block.type === 'trycatch') {
				return this._genTryCatchBlock(block, indent);
			}

			let out = '';
			out += `${indent}// Block: ${block.title}\n`;
			if (block.outputs.length > 0) {
				out += `${indent}let _out_${block.id};\n`;
			}
			out += `${indent}{\n`;
			out += this._genInputs(block, indent + '  ');
			out += this._transformCode(block, indent + '  ');
			out += `${indent}}\n\n`;
			return out;
		}

		_genConditionBlock(block, indent) {
			const inputNames = block.inputs.map(window.WorkflowApp.Helpers.portName);
			let out = '';
			out += `${indent}// Block: ${block.title} (条件判断)\n`;
			out += `${indent}let _out_${block.id}_0; // true\n`;
			out += `${indent}let _out_${block.id}_1; // false\n`;
			out += `${indent}{\n`;
			out += this._genInputs(block, indent + '  ');
			out += `${indent}  let _cond_${block.id};\n`;
			out += this._transformCode(block, indent + '  ');
			out += `${indent}  if (!!_cond_${block.id}) {\n`;
			out += `${indent}    _out_${block.id}_0 = ${inputNames[0] || 'undefined'};\n`;
			out += `${indent}  } else {\n`;
			out += `${indent}    _out_${block.id}_1 = ${inputNames[0] || 'undefined'};\n`;
			out += `${indent}  }\n`;
			out += `${indent}}\n\n`;
			return out;
		}

		_genTryCatchBlock(block, indent) {
			let out = '';
			out += `${indent}// Block: ${block.title} (异常捕获)\n`;
			out += `${indent}let _out_${block.id}_0; // success\n`;
			out += `${indent}let _out_${block.id}_1; // error\n`;
			out += `${indent}try {\n`;
			out += this._genInputs(block, indent + '  ');

			let blockCode = block.code;
			blockCode = blockCode.replace(/\breturn\s+([\s\S]*?);/g, `_out_${block.id}_0 = $1;`).replace(/\breturn\s*;/g, `_out_${block.id}_0 = undefined;`);
			out += blockCode
				.split('\n')
				.map((line) => indent + '  ' + line)
				.join('\n') + '\n';

			out += `${indent}} catch (_err_${block.id}) {\n`;
			out += `${indent}  _out_${block.id}_1 = _err_${block.id}.message;\n`;
			out += `${indent}}\n\n`;
			return out;
		}

		_genLoop(loopBlock, order, processed) {
			const loopCount = loopBlock.loopCount || 3;
			const loopDelay = loopBlock.loopDelay || 0;
			const downstreamIds = this.getDownstreamIds(loopBlock.id);
			const downstreamOrder = order.filter((oid) => downstreamIds.has(oid));
			let out = '';

			out += `\n// Loop: ${loopBlock.title} (${loopCount} 次)\n`;

			for (const did of downstreamOrder) {
				const dBlock = this.state.blocks.find((b) => b.id === did);
				if (!dBlock) continue;
				const inputNames = dBlock.inputs.map(window.WorkflowApp.Helpers.portName);
				for (let pi = 0; pi < dBlock.inputs.length; pi++) {
					const conn = this.state.connections.find((c) => c.toId === did && c.toPort === pi);
					if (!conn) continue;
					const fromInLoop = conn.fromId === loopBlock.id || downstreamIds.has(conn.fromId);
					if (!fromInLoop) {
						const fromBlock = this.state.blocks.find((b) => b.id === conn.fromId);
						const fromLabel = fromBlock ? fromBlock.title : `block_${conn.fromId}`;
						const baseRef = fromBlock && this._isMultiOutput(fromBlock) ? `_out_${conn.fromId}_${conn.fromPort}` : `_out_${conn.fromId}`;
						const pathSuffix = window.WorkflowApp.Helpers.pathToAccessor(conn.fromPath);
						if (pathSuffix) {
							out += `const _ext_raw_${did}_${inputNames[pi]} = ${baseRef}; // ← ${fromLabel}\n`;
							out += `const _ext_${did}_${inputNames[pi]} = _ext_raw_${did}_${inputNames[pi]}${pathSuffix}; // 路径映射: ${conn.fromPath}\n`;
						} else {
							out += `const _ext_${did}_${inputNames[pi]} = ${baseRef}; // ← ${fromLabel}\n`;
						}
					}
				}
			}

			const loopVar = `_loop_${loopBlock.id}`;
			out += `for (let ${loopVar} = 0; ${loopVar} < ${loopCount}; ${loopVar}++) {\n`;

			if (loopDelay > 0) {
				out += `  if (${loopVar} > 0) await new Promise(r => setTimeout(r, ${loopDelay}));\n`;
			}

			out += `  let _out_${loopBlock.id} = ${loopVar};\n`;

			for (const did of downstreamOrder) {
				const dBlock = this.state.blocks.find((b) => b.id === did);
				if (!dBlock || dBlock.type === 'annotation') continue;
				processed.add(did);

				out += `\n  // Block: ${dBlock.title}\n`;

				if (this._isMultiOutput(dBlock)) {
					out += `  let _out_${did}_0;\n`;
					out += `  let _out_${did}_1;\n`;
				} else if (dBlock.outputs.length > 0) {
					out += `  let _out_${did};\n`;
				}
				out += `  {\n`;

				const inputNames = dBlock.inputs.map(window.WorkflowApp.Helpers.portName);
				for (let pi = 0; pi < dBlock.inputs.length; pi++) {
					const conn = this.state.connections.find((c) => c.toId === did && c.toPort === pi);
					if (!conn) {
						out += `    const ${inputNames[pi]} = undefined;\n`;
						continue;
					}
					const fromInLoop = conn.fromId === loopBlock.id || downstreamIds.has(conn.fromId);
					if (fromInLoop) {
						const fromBlock = this.state.blocks.find((b) => b.id === conn.fromId);
						const fromLabel = fromBlock ? fromBlock.title : `block_${conn.fromId}`;
						const baseRef = fromBlock && this._isMultiOutput(fromBlock) ? `_out_${conn.fromId}_${conn.fromPort}` : `_out_${conn.fromId}`;
						const pathSuffix = window.WorkflowApp.Helpers.pathToAccessor(conn.fromPath);
						if (pathSuffix) {
							out += `    const _raw_${inputNames[pi]} = ${baseRef}; // ← ${fromLabel}\n`;
							out += `    const ${inputNames[pi]} = _raw_${inputNames[pi]}${pathSuffix}; // 路径映射: ${conn.fromPath}\n`;
						} else {
							out += `    const ${inputNames[pi]} = ${baseRef}; // ← ${fromLabel}\n`;
						}
					} else {
						out += `    const ${inputNames[pi]} = _ext_${did}_${inputNames[pi]}; // 外部缓存\n`;
					}
				}

				if (this._isMultiOutput(dBlock)) {
					let blockCode = dBlock.code;
					blockCode = blockCode.replace(/\breturn\s+([\s\S]*?);/g, `_cond_${did} = $1;`).replace(/\breturn\s*;/g, `_cond_${did} = undefined;`);
					out += `    let _cond_${did};\n`;
					out += blockCode
						.split('\n')
						.map((line) => '    ' + line)
						.join('\n') + '\n';
					if (dBlock.type === 'condition') {
						out += `    if (!!_cond_${did}) {\n`;
						out += `      _out_${did}_0 = ${inputNames[0] || 'undefined'};\n`;
						out += `    } else {\n`;
						out += `      _out_${did}_1 = ${inputNames[0] || 'undefined'};\n`;
						out += `    }\n`;
					} else if (dBlock.type === 'trycatch') {
						out += `    _out_${did}_0 = _cond_${did};\n`;
					}
				} else {
					let blockCode = dBlock.code;
					if (dBlock.outputs.length > 0) {
						blockCode = blockCode.replace(/\breturn\s+([\s\S]*?);/g, `_out_${did} = $1;`).replace(/\breturn\s*;/g, `_out_${did} = undefined;`);
					}
					out += blockCode
						.split('\n')
						.map((line) => '    ' + line)
						.join('\n') + '\n';
				}

				out += `  }\n`;
			}

			out += `}\n\n`;
			return out;
		}

		generate() {
			const order = this.topoSort();
			const processed = new Set();
			let code = '// Generated Workflow Code\n';

			for (const id of order) {
				if (processed.has(id)) continue;
				const block = this.state.blocks.find((b) => b.id === id);
				if (!block) continue;
				if (block.type === 'annotation') continue;

				if (block.type === 'loop') {
					code += this._genLoop(block, order, processed);
					continue;
				}

				code += this._genBlock(block, '');
			}

			return code;
		}
	}

	window.WorkflowApp.CodeGenerator = CodeGenerator;
})();
