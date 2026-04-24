(function() {
    'use strict';

    window.WorkflowApp = window.WorkflowApp || {};

    class WorkflowSerializer {
        constructor(state) {
            this.state = state;
        }

        export() {
            const data = {
                version: 1,
                blocks: this.state.blocks.map(b => ({
                    id: b.id,
                    type: b.type,
                    title: b.title,
                    color: b.color,
                    x: b.x,
                    y: b.y,
                    w: b.w,
                    inputs: b.inputs,
                    outputs: b.outputs,
                    code: b.code,
                    description: b.description,
                    value: b.value,
                    varName: b.varName,
                    varScope: b.varScope,
                    loopCount: b.loopCount,
                    loopDelay: b.loopDelay,
                    rotation: b.rotation || 0,
                    savedPath: b.savedPath
                })),
                connections: this.state.connections,
                nextId: this.state.nextId
            };

            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `workflow_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }

        import(file, callback) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (!data.version || !data.blocks || !data.connections) {
                        eda.sys_Message.showToastMessage('无效的工作流文件格式', 'info', 1);
                        return;
                    }
                    callback(data);
                } catch (err) {
                    eda.sys_Message.showToastMessage('导入失败: ' + err.message, 'info', 1);
                }
            };
            reader.readAsText(file);
        }
    }

    window.WorkflowApp.WorkflowSerializer = WorkflowSerializer;
})();
