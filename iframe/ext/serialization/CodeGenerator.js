(function() {
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
            for (const lb of this.state.blocks.filter(b => b.type === 'loop')) {
                const downstreamIds = this.getDownstreamIds(lb.id);
                for (const did of downstreamIds) {
                    edges.push({ from: lb.id, to: did });
                }
            }
            const inDeg = new Map(this.state.blocks.map(b => [b.id, 0]));
            for (const e of edges) inDeg.set(e.to, (inDeg.get(e.to) || 0) + 1);
            const queue = this.state.blocks.filter(b => inDeg.get(b.id) === 0).map(b => b.id);
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

        generate() {
            const order = this.topoSort();
            let code = '// Generated Workflow Code\n';
            code += '(async function() {\n';

            const processed = new Set();

            for (const id of order) {
                if (processed.has(id)) continue;
                const block = this.state.blocks.find(b => b.id === id);
                if (!block) continue;

                if (block.type === 'loop') {
                    const loopCount = block.loopCount || 3;
                    const downstreamIds = this.getDownstreamIds(block.id);
                    const downstreamOrder = order.filter(oid => downstreamIds.has(oid));

                    code += `\n  // Loop: ${block.title} (${loopCount} 次)\n`;
                    code += `  for (let index = 0; index < ${loopCount}; index++) {\n`;

                    for (const did of downstreamOrder) {
                        const dBlock = this.state.blocks.find(b => b.id === did);
                        if (!dBlock) continue;
                        processed.add(did);

                        code += `\n    // Block: ${dBlock.title}\n`;
                        const blockCode = dBlock.code.split('\n').map(line => '    ' + line).join('\n');
                        code += blockCode + '\n';
                    }

                    code += '  }\n';
                    continue;
                }

                code += `\n  // Block: ${block.title}\n`;
                const inputNames = block.inputs.map(window.WorkflowApp.Helpers.portName);

                for (let i = 0; i < block.inputs.length; i++) {
                    const conn = this.state.connections.find(c => c.toId === id && c.toPort === i);
                    if (conn) {
                        const fromBlock = this.state.blocks.find(b => b.id === conn.fromId);
                        const outputName = fromBlock ? window.WorkflowApp.Helpers.portName(fromBlock.outputs[conn.fromPort]) : 'unknown';
                        code += `  // ${inputNames[i]} = ${outputName} from "${fromBlock?.title}"\n`;
                    }
                }

                const blockCode = block.code.split('\n').map(line => '  ' + line).join('\n');
                code += blockCode + '\n';
            }

            code += '})();\n';
            return code;
        }
    }

    window.WorkflowApp.CodeGenerator = CodeGenerator;
})();
