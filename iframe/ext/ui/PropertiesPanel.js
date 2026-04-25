(function() {
    'use strict';

    window.WorkflowApp = window.WorkflowApp || {};

    class PropertiesPanel {
        constructor(state, registry, blockRenderer, eventBus) {
            this.state = state;
            this.registry = registry;
            this.blockRenderer = blockRenderer;
            this.eventBus = eventBus;
            this.panel = document.getElementById('properties-panel');
            this.toggle = document.getElementById('properties-toggle');
            this.content = document.getElementById('properties-content');
            this.title = document.getElementById('properties-title');
            this.currentBlock = null;
            this.toggle.addEventListener('click', () => {
                if (this.panel.classList.contains('open')) {
                    this.close();
                } else {
                    this.open(this.state.getSelectedBlock());
                }
            });
        }

        open(block) {
            this.currentBlock = block;
            this.state.editingBlock = block;
            this.panel.classList.add('open');
            this.toggle.classList.add('active');
            if (block) {
                this.title.textContent = `${block.title} - 属性`;
                if (block.type === 'loop') {
                    this.buildLoopProperties(block);
                } else if (block.type === 'variable') {
                    this.buildVariableProperties(block);
                } else if (block.type === 'function') {
                    this.buildFunctionProperties(block);
                } else if (block.type === 'annotation') {
                    this.buildAnnotationProperties(block);
                } else {
                    this.buildCodeProperties(block);
                }
            } else {
                this.title.textContent = '工作流统计';
                this.buildStatisticsView();
            }
        }

        close() {
            this.panel.classList.remove('open');
            this.toggle.classList.remove('active');
            this.currentBlock = null;
            this.state.editingBlock = null;
            this.content.innerHTML = '';
        }

        buildStatisticsView() {
            const blockCount = this.state.blocks.length;
            const connectionCount = this.state.connections.length;
            const categoryCounts = {};
            this.state.blocks.forEach(block => {
                const metadata = this.registry.getMetadata(block.type);
                if (metadata && metadata.category) {
                    const category = metadata.category;
                    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                } else {
                    categoryCounts['未知'] = (categoryCounts['未知'] || 0) + 1;
                }
            });
            const categoryList = Object.entries(categoryCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([cat, count]) => `<li class="stats-list-item"><span class="stats-list-label">${cat}</span><span class="stats-list-value">${count}</span></li>`)
                .join('');
            this.content.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card"><div class="stat-value">${blockCount}</div><div class="stat-label">模块总数</div></div>
                    <div class="stat-card"><div class="stat-value">${connectionCount}</div><div class="stat-label">连接数</div></div>
                </div>
                ${blockCount > 0 ? `<div class="stats-section"><div class="stats-section-title">模块分类</div><ul class="stats-list">${categoryList}</ul></div>` : ''}
                <div class="stats-section">
                    <div class="stats-section-title">快捷键</div>
                    <ul class="stats-list">
                        <li class="stats-list-item"><span class="stats-list-label">选择模块</span><span class="stats-list-value">单击</span></li>
                        <li class="stats-list-item"><span class="stats-list-label">拖动画布</span><span class="stats-list-value">中键/右键</span></li>
                        <li class="stats-list-item"><span class="stats-list-label">缩放</span><span class="stats-list-value">滚轮</span></li>
                        <li class="stats-list-item"><span class="stats-list-label">旋转模块</span><span class="stats-list-value">Space</span></li>
                        <li class="stats-list-item"><span class="stats-list-label">删除模块</span><span class="stats-list-value">Delete</span></li>
                        <li class="stats-list-item"><span class="stats-list-label">复制模块</span><span class="stats-list-value">Ctrl+D</span></li>
                    </ul>
                </div>
            `;
        }

        buildLoopProperties(block) {
            const inputFieldsHtml = this.buildInputFields(block);
            const outputMappingsHtml = this.buildOutputMappings(block);

            this.content.innerHTML = `
                ${outputMappingsHtml}
                ${inputFieldsHtml}
                <div class="property-section">
                    <label class="property-label">循环次数</label>
                    <input type="number" id="prop-loop-count" class="property-input" value="${block.loopCount || 3}" min="1" step="1">
                </div>
                <div class="property-section">
                    <label class="property-label">每次循环间隔 (毫秒)</label>
                    <input type="number" id="prop-loop-delay" class="property-input" value="${block.loopDelay || 0}" min="0" step="100">
                    <div style="color: #75715e; font-size: 11px; margin-top: 4px;">输出端口将依次输出 0 到 N-1 的索引值</div>
                </div>
                <div class="property-actions">
                    <button class="property-button secondary" id="prop-cancel">取消</button>
                    <button class="property-button" id="prop-save-loop">保存</button>
                </div>
            `;
            document.getElementById('prop-cancel').onclick = () => this.close();
            document.getElementById('prop-save-loop').onclick = () => this.saveLoopProperties();
            this.attachInputFieldHandlers(block);
            this.attachOutputMappingHandlers(block);
        }

        buildVariableProperties(block) {
            const outputMappingsHtml = this.buildOutputMappings(block);

            this.content.innerHTML = `
                ${outputMappingsHtml}
                <div class="property-section">
                    <label class="property-label">变量名称</label>
                    <input type="text" id="prop-var-name" class="property-input" value="${block.varName || ''}" placeholder="例如：myVar">
                </div>
                <div class="property-section">
                    <label class="property-label">变量类型</label>
                    <select id="prop-var-scope" class="property-input">
                        <option value="local" ${block.varScope === 'local' ? 'selected' : ''}>局部变量</option>
                        <option value="global" ${block.varScope === 'global' ? 'selected' : ''}>全局变量</option>
                    </select>
                </div>
                <div class="property-section">
                    <label class="property-label">变量值</label>
                    <input type="text" id="prop-var-value" class="property-input" placeholder="字符串、数字、true/false、null 或 JSON">
                </div>
                <div class="property-actions">
                    <button class="property-button secondary" id="prop-cancel">取消</button>
                    <button class="property-button" id="prop-save-variable">保存</button>
                </div>
            `;
            const input = document.getElementById('prop-var-value');
            if (input && block.value !== undefined && block.value !== null) input.value = JSON.stringify(block.value);
            document.getElementById('prop-cancel').onclick = () => this.close();
            document.getElementById('prop-save-variable').onclick = () => this.saveVariableProperties();
            this.attachOutputMappingHandlers(block);
        }

        buildFunctionProperties(block) {
            const outputName = window.WorkflowApp.Helpers.portName(block.outputs[0] || { name: 'result' });
            const params = block.inputs.map(window.WorkflowApp.Helpers.portName);
            const inputFieldsHtml = this.buildInputFields(block);
            const outputMappingsHtml = this.buildOutputMappings(block);

            this.content.innerHTML = `
                ${outputMappingsHtml}
                <div class="property-section"><label class="property-label">函数名称</label><input type="text" id="prop-func-name" class="property-input" value="${block.title || ''}" placeholder="例如：处理数据"></div>
                <div class="property-section"><label class="property-label">函数描述</label><input type="text" id="prop-func-desc" class="property-input" value="${block.description || ''}" placeholder="简短描述"></div>
                ${inputFieldsHtml}
                <div class="property-section"><label class="property-label">输入参数 (逗号分隔)</label><input type="text" id="prop-func-inputs" class="property-input" value="${params.join(', ')}" placeholder="例如：input1, input2"></div>
                <div class="property-section"><label class="property-label">输出参数</label><input type="text" id="prop-func-output" class="property-input" value="${outputName}" placeholder="例如：result"></div>
                <div class="property-section"><label class="property-label">代码</label><textarea id="prop-func-code" class="property-textarea">${block.code}</textarea></div>
                <div class="property-actions"><button class="property-button secondary" id="prop-cancel">取消</button><button class="property-button" id="prop-save-function">保存</button></div>
            `;
            document.getElementById('prop-cancel').onclick = () => this.close();
            document.getElementById('prop-save-function').onclick = () => this.saveFunctionProperties();
            this.attachInputFieldHandlers(block);
            this.attachOutputMappingHandlers(block);
        }

        buildCodeProperties(block) {
            const inputFieldsHtml = this.buildInputFields(block);
            const outputMappingsHtml = this.buildOutputMappings(block);

            this.content.innerHTML = `
                ${outputMappingsHtml}
                ${inputFieldsHtml}
                <div class="property-section"><label class="property-label">代码</label><textarea id="prop-code" class="property-textarea" placeholder="在此编写 JavaScript 代码...">${block.code}</textarea></div>
                <div class="property-actions"><button class="property-button secondary" id="prop-cancel">取消</button><button class="property-button" id="prop-save-code">保存</button></div>
            `;
            document.getElementById('prop-cancel').onclick = () => this.close();
            document.getElementById('prop-save-code').onclick = () => this.saveCodeProperties();
            this.attachInputFieldHandlers(block);
            this.attachOutputMappingHandlers(block);
        }

        saveLoopProperties() {
            const count = parseInt(document.getElementById('prop-loop-count').value, 10);
            const delay = parseInt(document.getElementById('prop-loop-delay').value, 10) || 0;
            if (isNaN(count) || count < 1) {
                eda.sys_Message.showToastMessage('循环次数必须为正整数', 'info', 1);
                return;
            }
            this.currentBlock.loopCount = count;
            this.currentBlock.loopDelay = delay;
            this.currentBlock.description = delay > 0 ? `循环 ${count} 次, 间隔 ${delay}ms` : `循环 ${count} 次`;
            this.currentBlock.w = this.blockRenderer.measureBlockWidth(this.currentBlock);
            eda.sys_Message.showToastMessage('保存成功', 'info', 1);
            this.open(this.currentBlock);
        }

        saveVariableProperties() {
            const varName = document.getElementById('prop-var-name').value.trim();
            const varScope = document.getElementById('prop-var-scope').value;
            const input = document.getElementById('prop-var-value').value.trim();
            if (!varName) {
                eda.sys_Message.showToastMessage('请输入变量名称', 'info', 1);
                return;
            }
            if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(varName)) {
                eda.sys_Message.showToastMessage('变量名称无效，请使用合法的标识符', 'info', 1);
                return;
            }
            try {
                let value;
                if (input === '') value = null;
                else if (input === 'true') value = true;
                else if (input === 'false') value = false;
                else if (input === 'null') value = null;
                else if (!isNaN(input) && input !== '') value = Number(input);
                else if ((input.startsWith('{') && input.endsWith('}')) || (input.startsWith('[') && input.endsWith(']'))) value = JSON.parse(input);
                else value = input;
                this.currentBlock.value = value;
                this.currentBlock.varName = varName;
                this.currentBlock.varScope = varScope;
                const valStr = JSON.stringify(value);
                if (varScope === 'global') {
                    this.currentBlock.code = `window.__wf_globals__ = window.__wf_globals__ || {};\nwindow.__wf_globals__['${varName}'] = ${valStr};\nreturn ${valStr};`;
                } else {
                    this.currentBlock.code = `const ${varName} = ${valStr};\nreturn ${varName};`;
                }
                this.currentBlock.description = varScope === 'global' ? '全局变量' : '局部变量';
                this.currentBlock.w = this.blockRenderer.measureBlockWidth(this.currentBlock);
                eda.sys_Message.showToastMessage('保存成功', 'info', 1);
                this.open(this.currentBlock);
            } catch (e) {
                eda.sys_Message.showToastMessage('无效的值格式: ' + e.message, 'info', 1);
            }
        }

        saveFunctionProperties() {
            const title = document.getElementById('prop-func-name').value.trim() || '函数';
            const desc = document.getElementById('prop-func-desc').value.trim();
            const inputsStr = document.getElementById('prop-func-inputs').value.trim();
            const outputName = document.getElementById('prop-func-output').value.trim() || 'result';
            const code = document.getElementById('prop-func-code').value;
            const inputNames = inputsStr.split(',').map(s => s.trim()).filter(Boolean);
            if (inputNames.length === 0) {
                eda.sys_Message.showToastMessage('至少需要一个输入参数', 'info', 1);
                return;
            }
            for (const name of inputNames) {
                if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)) {
                    eda.sys_Message.showToastMessage(`无效的输入名称: ${name}`, 'info', 1);
                    return;
                }
            }
            if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(outputName)) {
                eda.sys_Message.showToastMessage(`无效的输出名称: ${outputName}`, 'info', 1);
                return;
            }
            this.currentBlock.title = title;
            this.currentBlock.description = desc;
            this.currentBlock.inputs = inputNames.map(name => ({ name, description: '' }));
            this.currentBlock.outputs = [{ name: outputName, description: '函数输出' }];
            this.currentBlock.code = code;
            this.currentBlock.w = this.blockRenderer.measureBlockWidth(this.currentBlock);
            this.state.connections = this.state.connections.filter(conn => {
                if (conn.toId === this.currentBlock.id && conn.toPort >= inputNames.length) return false;
                return !(conn.fromId === this.currentBlock.id && conn.fromPort >= 1);
            });
            eda.sys_Message.showToastMessage('保存成功', 'info', 1);
            this.open(this.currentBlock);
        }

        saveCodeProperties() {
            this.currentBlock.code = document.getElementById('prop-code').value;
            this.currentBlock.w = this.blockRenderer.measureBlockWidth(this.currentBlock);
            eda.sys_Message.showToastMessage('保存成功', 'info', 1);
            this.open(this.currentBlock);
        }

        buildAnnotationProperties(block) {
            this.content.innerHTML = `
                <div class="property-section">
                    <label class="property-label">注释文本</label>
                    <textarea id="prop-annotation-text" class="property-textarea"
                              placeholder="输入注释内容...">${block.annotationText || ''}</textarea>
                </div>
                <div class="property-actions">
                    <button class="property-button secondary" id="prop-cancel">取消</button>
                    <button class="property-button" id="prop-save-annotation">保存</button>
                </div>
            `;
            document.getElementById('prop-cancel').onclick = () => this.close();
            document.getElementById('prop-save-annotation').onclick = () => this.saveAnnotationProperties();
        }

        saveAnnotationProperties() {
            this.currentBlock.annotationText = document.getElementById('prop-annotation-text').value;
            this.currentBlock.w = this.blockRenderer.measureBlockWidth(this.currentBlock);
            eda.sys_Message.showToastMessage('保存成功', 'info', 1);
            this.open(this.currentBlock);
        }

        buildInputFields(block) {
            if (!block.inputs || block.inputs.length === 0) {
                return '';
            }

            let html = '<div class="property-section"><div class="stats-section-title">输入参数</div>';

            block.inputs.forEach((input, index) => {
                const inputName = window.WorkflowApp.Helpers.portName(input);
                const connection = this.state.connections.find(c => c.toId === block.id && c.toPort === index);
                let currentValue = '';

                if (connection) {
                    const sourceBlock = this.state.blocks.find(b => b.id === connection.fromId);
                    if (sourceBlock) {
                        const outputName = window.WorkflowApp.Helpers.portName(sourceBlock.outputs[connection.fromPort] || { name: 'output' });
                        const displayPath = connection.fromPath && connection.fromPath !== '$'
                            ? connection.fromPath.replace(/^\$/, '')
                            : '';
                        currentValue = `${sourceBlock.title}.${outputName}${displayPath}`;
                    }
                }

                html += `
                    <div class="input-field-group">
                        <label class="property-label">${inputName}</label>
                        <input type="text"
                               class="property-input input-field"
                               data-block-id="${block.id}"
                               data-port-index="${index}"
                               value="${currentValue}"
                               placeholder="${(typeof input === 'object' && input.description) || '输入值或粘贴变量引用'}">
                        ${connection ? `<button class="input-clear-btn" data-port-index="${index}">×</button>` : ''}
                    </div>
                `;
            });

            html += '</div>';
            return html;
        }

        buildOutputMappings(block) {
            const outgoing = this.state.connections.filter(c => c.fromId === block.id && c.toPort !== -1);
            if (outgoing.length === 0) return '';

            if (block.type === 'variable') {
                const items = outgoing.map((conn, index) => {
                    const targetBlock = this.state.blocks.find(b => b.id === conn.toId);
                    const targetInput = targetBlock && targetBlock.inputs[conn.toPort] ? window.WorkflowApp.Helpers.portName(targetBlock.inputs[conn.toPort]) : `input${conn.toPort}`;
                    const fromPath = conn.fromPath || '$';
                    const hasPath = fromPath !== '$';
                    const displayPath = hasPath ? fromPath.replace(/^\$/, '') : '';
                    const resolved = window.WorkflowApp.Helpers.getValueAtPath(block.value, fromPath);
                    const displayValue = window.WorkflowApp.Helpers.stringifyForDisplay(resolved);
                    const targetName = targetBlock ? targetBlock.title : '未知模块';
                    const outputName = window.WorkflowApp.Helpers.portName(block.outputs[conn.fromPort] || { name: 'value' });
                    return `
                        <div class="mapping-row" style="position: relative;">
                            <div class="mapping-label"><span class="mapping-source-link" data-source-id="${block.id}" style="color: #66d9ef; cursor: pointer;">${outputName}${displayPath}</span> → <span class="mapping-target-link" data-target-id="${conn.toId}" style="color: #66d9ef; cursor: pointer;">${targetName}.${targetInput}</span></div>
                            <div style="display: flex; gap: 4px; align-items: center;">
                                <div class="property-input mapping-path-select"
                                     data-from-id="${conn.fromId}"
                                     data-from-port="${conn.fromPort}"
                                     data-to-id="${conn.toId}"
                                     data-to-port="${conn.toPort}"
                                     style="flex: 1; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 36px;"
                                     title="${displayPath || '点击选择路径'}">${displayPath ? `<span style="color: #a6e22e;">${displayPath}</span> = ${displayValue}` : '<span style="color: #75715e;">点击选择路径...</span>'}</div>
                                ${hasPath ? `<button class="output-clear-btn" title="清除映射路径" data-from-id="${conn.fromId}" data-from-port="${conn.fromPort}" data-to-id="${conn.toId}" data-to-port="${conn.toPort}">×</button>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');

                return `
                    <div class="property-section">
                        <div class="stats-section-title">输出映射</div>
                        ${items}
                    </div>
                `;
            }

            const items = outgoing.map((conn, index) => {
                const output = block.outputs[conn.fromPort];
                const outputName = window.WorkflowApp.Helpers.portName(output || { name: 'output' });
                const targetBlock = this.state.blocks.find(b => b.id === conn.toId);
                const targetInput = targetBlock && targetBlock.inputs[conn.toPort] ? window.WorkflowApp.Helpers.portName(targetBlock.inputs[conn.toPort]) : `input${conn.toPort}`;
                const fromPath = conn.fromPath || '$';
                const displayPath = fromPath === '$' ? '' : fromPath.replace(/^\$/, '');
                const hasPath = fromPath !== '$';
                const targetName = targetBlock ? targetBlock.title : '未知模块';
                return `
                    <div class="mapping-row" style="position: relative;">
                        <div class="mapping-label"><span class="mapping-source-link" data-source-id="${block.id}" style="color: #66d9ef; cursor: pointer;">${outputName}${displayPath}</span> → <span class="mapping-target-link" data-target-id="${conn.toId}" style="color: #66d9ef; cursor: pointer;">${targetName}.${targetInput}</span></div>
                        <div style="display: flex; gap: 4px; align-items: center;">
                            <div class="property-input mapping-path-select"
                                 data-conn-index="${index}"
                                 data-from-id="${conn.fromId}"
                                 data-from-port="${conn.fromPort}"
                                 data-to-id="${conn.toId}"
                                 data-to-port="${conn.toPort}"
                                 style="flex: 1; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 36px;"
                                 title="${displayPath || '点击选择路径'}">${displayPath || '<span style="color: #75715e;">点击选择路径...</span>'}</div>
                            ${hasPath ? `<button class="output-clear-btn" title="清除映射路径" data-from-id="${conn.fromId}" data-from-port="${conn.fromPort}" data-to-id="${conn.toId}" data-to-port="${conn.toPort}">×</button>` : ''}
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="property-section">
                    <div class="stats-section-title">输出映射</div>
                    <div class="mapping-help">复杂输出可为每条连接单独设置路径，例如 .name / .uuid / [0]</div>
                    ${items}
                </div>
            `;
        }

        attachInputFieldHandlers(block) {
            const inputFields = this.content.querySelectorAll('.input-field');

            inputFields.forEach(field => {
                field.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.handleInputFieldValue(field, block);
                    }
                });

                field.addEventListener('blur', () => {
                    this.handleInputFieldValue(field, block);
                });
            });

            const clearBtns = this.content.querySelectorAll('.input-clear-btn');
            clearBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const portIndex = parseInt(btn.dataset.portIndex);
                    this.state.clearInputConnection(block.id, portIndex);
                    this.open(block);
                });
            });
        }

        attachOutputMappingHandlers(block) {
            const pathSelects = this.content.querySelectorAll('.mapping-path-select');
            pathSelects.forEach(el => {
                el.addEventListener('click', () => {
                    const fromId = parseInt(el.dataset.fromId);
                    const fromPort = parseInt(el.dataset.fromPort);
                    const toId = parseInt(el.dataset.toId);
                    const toPort = parseInt(el.dataset.toPort);
                    const conn = this.state.connections.find(
                        c => c.fromId === fromId && c.fromPort === fromPort && c.toId === toId && c.toPort === toPort
                    );
                    if (conn) {
                        const targetBlock = this.state.blocks.find(b => b.id === toId);
                        const targetInput = targetBlock && targetBlock.inputs[toPort]
                            ? window.WorkflowApp.Helpers.portName(targetBlock.inputs[toPort]) : `input${toPort}`;
                        const targetInputDesc = targetBlock && targetBlock.inputs[toPort]
                            ? window.WorkflowApp.Helpers.portDesc(targetBlock.inputs[toPort]) : '';
                        this.eventBus.emit('requestPathSelection', {
                            block,
                            conn,
                            targetBlock,
                            targetInput,
                            targetInputDesc
                        });
                    }
                });
            });

            const outputClearBtns = this.content.querySelectorAll('.output-clear-btn');
            outputClearBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const fromId = parseInt(btn.dataset.fromId);
                    const fromPort = parseInt(btn.dataset.fromPort);
                    const toId = parseInt(btn.dataset.toId);
                    const toPort = parseInt(btn.dataset.toPort);
                    const conn = this.state.connections.find(
                        c => c.fromId === fromId && c.fromPort === fromPort && c.toId === toId && c.toPort === toPort
                    );
                    if (conn) {
                        conn.fromPath = '$';
                        conn.pathSelected = false;
                    }
                    this.open(block);
                });
            });

            // Attach click handlers to target links
            const targetLinks = this.content.querySelectorAll('.mapping-target-link');
            targetLinks.forEach(link => {
                link.addEventListener('click', () => {
                    const targetId = parseInt(link.dataset.targetId);
                    this.locateAndHighlightBlock(targetId);
                });
            });

            // Attach click handlers to source links
            const sourceLinks = this.content.querySelectorAll('.mapping-source-link');
            sourceLinks.forEach(link => {
                link.addEventListener('click', () => {
                    const sourceId = parseInt(link.dataset.sourceId);
                    this.locateAndHighlightBlock(sourceId);
                });
            });
        }

        locateAndHighlightBlock(blockId) {
            const targetBlock = this.state.blocks.find(b => b.id === blockId);
            if (!targetBlock) {
                eda.sys_Message.showToastMessage('目标模块未找到', 'info', 1);
                return;
            }

            // Select the target block
            this.state.selected = blockId;

            // Calculate the center of the target block
            const blockH = window.WorkflowApp.Geometry.getBlockHeight(targetBlock);
            const blockCenterX = targetBlock.x + targetBlock.w / 2;
            const blockCenterY = targetBlock.y + blockH / 2;

            // Get canvas dimensions
            const canvas = document.getElementById('canvas');
            const canvasCenterX = canvas.width / (2 * this.state.camera.scale);
            const canvasCenterY = canvas.height / (2 * this.state.camera.scale);

            // Pan camera to center the block
            this.state.camera.x = canvasCenterX * this.state.camera.scale - blockCenterX * this.state.camera.scale;
            this.state.camera.y = canvasCenterY * this.state.camera.scale - blockCenterY * this.state.camera.scale;

            // Flash effect: temporarily increase selection visibility
            const originalSelected = this.state.selected;
            let flashCount = 0;
            const flashInterval = setInterval(() => {
                this.state.selected = flashCount % 2 === 0 ? null : originalSelected;
                flashCount++;
                if (flashCount >= 6) {
                    clearInterval(flashInterval);
                    this.state.selected = originalSelected;
                }
            }, 150);

            eda.sys_Message.showToastMessage(`已定位到: ${targetBlock.title}`, 'info', 1);
        }

        handleInputFieldValue(field, block) {
            const value = field.value.trim();
            const portIndex = parseInt(field.dataset.portIndex);

            if (!value) {
                this.state.clearInputConnection(block.id, portIndex);
                return;
            }

            if (value.includes('.') || value.match(/^block_\d+_\d+$/)) {
                this.handleVariableReference(value, block.id, portIndex);
            } else {
                this.createVariableBlockAndConnect(value, block.id, portIndex);
            }

            this.open(block);
        }

        handleVariableReference(reference, targetBlockId, targetPortIndex) {
            if (reference.includes('.')) {
                const firstDot = reference.indexOf('.');
                const blockTitle = reference.slice(0, firstDot).trim();
                const remainder = reference.slice(firstDot + 1);
                const sourceBlock = this.state.blocks.find(b => b.title === blockTitle);

                if (sourceBlock) {
                    let matchedOutputIndex = -1;
                    let matchedPath = '$';

                    sourceBlock.outputs.forEach((output, index) => {
                        if (matchedOutputIndex !== -1) return;
                        const outputName = window.WorkflowApp.Helpers.portName(output);
                        if (remainder === outputName) {
                            matchedOutputIndex = index;
                            matchedPath = '$';
                        } else if (remainder.startsWith(outputName + '.')) {
                            matchedOutputIndex = index;
                            matchedPath = '$' + remainder.slice(outputName.length);
                        } else if (remainder.startsWith(outputName + '[')) {
                            matchedOutputIndex = index;
                            matchedPath = '$' + remainder.slice(outputName.length);
                        }
                    });

                    if (matchedOutputIndex !== -1) {
                        this.createConnection(sourceBlock.id, matchedOutputIndex, targetBlockId, targetPortIndex, matchedPath);
                        return;
                    }
                }
            }

            const match = reference.match(/^block_(\d+)_(\d+)(.*)$/);
            if (match) {
                const sourceBlockId = parseInt(match[1]);
                const outputIndex = parseInt(match[2]);
                const rawPath = match[3] || '';
                const sourceBlock = this.state.blocks.find(b => b.id === sourceBlockId);

                if (sourceBlock && outputIndex < sourceBlock.outputs.length) {
                    const normalizedPath = !rawPath ? '$' : (rawPath.startsWith('$') ? rawPath : `$${rawPath}`);
                    this.createConnection(sourceBlockId, outputIndex, targetBlockId, targetPortIndex, normalizedPath);
                    return;
                }
            }

            eda.sys_Message.showToastMessage('无法找到引用的变量', 'info', 1);
        }

        createConnection(fromId, fromPort, toId, toPort, fromPath = '$') {
            this.state.clearInputConnection(toId, toPort);

            const exists = this.state.connections.some(
                c => c.fromId === fromId && c.fromPort === fromPort && c.toId === toId && c.toPort === toPort
            );

            if (!exists) {
                const conn = { fromId, fromPort, toId, toPort };
                if (fromPath && fromPath !== '$') conn.fromPath = fromPath;
                this.state.connections.push(conn);
            }
        }

        createVariableBlockAndConnect(value, targetBlockId, targetPortIndex) {
            let parsedValue;
            try {
                if (value === 'true') {
                    parsedValue = true;
                } else if (value === 'false') {
                    parsedValue = false;
                } else if (value === 'null') {
                    parsedValue = null;
                } else if (!isNaN(value) && value !== '') {
                    parsedValue = Number(value);
                } else if ((value.startsWith('{') && value.endsWith('}')) ||
                           (value.startsWith('[') && value.endsWith(']'))) {
                    parsedValue = JSON.parse(value);
                } else {
                    parsedValue = value;
                }
            } catch (e) {
                parsedValue = value;
            }

            const targetBlock = this.state.blocks.find(b => b.id === targetBlockId);
            if (!targetBlock) return;

            const varBlock = {
                id: this.state.nextId++,
                type: 'variable',
                title: '变量',
                color: '#e6db74',
                x: targetBlock.x - 250,
                y: targetBlock.y + targetPortIndex * 60,
                w: 200,
                inputs: [],
                outputs: [{ name: 'value', description: '变量值' }],
                code: `const value = ${JSON.stringify(parsedValue)};\nreturn value;`,
                description: '自动创建',
                value: parsedValue,
                varName: `auto_${this.state.nextId - 1}`,
                varScope: 'local',
                rotation: 0,
                savedPath: undefined
            };

            varBlock.w = this.blockRenderer.measureBlockWidth(varBlock);
            this.state.blocks.push(varBlock);

            this.createConnection(varBlock.id, 0, targetBlockId, targetPortIndex);
        }
    }

    window.WorkflowApp.PropertiesPanel = PropertiesPanel;
})();
