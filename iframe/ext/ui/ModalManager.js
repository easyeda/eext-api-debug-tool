(function() {
    'use strict';

    window.WorkflowApp = window.WorkflowApp || {};

    class ModalManager {
        constructor(codeGenerator, executionEngine) {
            this.codeGenerator = codeGenerator;
            this.executionEngine = executionEngine;
            this.manualSelection = null;
            this.codeViewModal = document.getElementById('code-view-modal');
            this.codeViewEditor = document.getElementById('code-view-editor');
            this.arraySelectionModal = document.getElementById('array-selection-modal');

            document.getElementById('code-view-close').addEventListener('click', () => {
                this.codeViewModal.classList.remove('show');
            });
            document.getElementById('code-view-copy').addEventListener('click', () => {
                this.codeViewEditor.select();
                document.execCommand('copy');
                eda.sys_Message.showToastMessage('代码已复制到剪贴板', 'info', 1);
            });
        }

        showCodeView(state) {
            if (state.blocks.length === 0) {
                eda.sys_Message.showToastMessage('没有模块可以生成代码', 'info', 1);
                return;
            }
            this.codeViewEditor.value = this.codeGenerator.generate();
            this.codeViewModal.classList.add('show');
        }

        showArraySelection(selection) {
            const title = document.getElementById('array-selection-title');
            const tree = document.getElementById('array-selection-tree');
            const preview = document.getElementById('array-selection-preview');
            const pathDisplay = document.getElementById('array-selection-path');
            const { blockTitle, data, selectedPath, targetInputDesc } = selection;

            title.textContent = `选择要传递的值 - ${blockTitle}`;
            if (targetInputDesc) {
                title.innerHTML = `选择要传递的值 - ${blockTitle} <span style="font-size: 12px; color: #75715e; font-weight: normal; margin-left: 8px;">${targetInputDesc}</span>`;
            }

            if (selection.manualMode) {
                this.manualSelection = selection;
            } else {
                this.manualSelection = null;
            }
            pathDisplay.textContent = selectedPath;
            tree.innerHTML = '';
            this.renderTreeNode(data, '$', tree, 0, selection);
            const selectedValue = window.WorkflowApp.Helpers.getValueAtPath(data, selectedPath);
            preview.value = window.WorkflowApp.Helpers.stringifyForDisplay(selectedValue, 2);
            const backBtn = document.getElementById('array-selection-back');
            const cancelBtn = document.getElementById('array-selection-cancel');
            if (selection.manualMode) {
                backBtn.style.display = 'none';
                cancelBtn.textContent = '取消';
            } else {
                backBtn.style.display = '';
                cancelBtn.textContent = '取消运行';
                backBtn.disabled = this.executionEngine.executionState.selectionHistory.length === 0;
                backBtn.style.opacity = backBtn.disabled ? '0.4' : '1';
                backBtn.style.cursor = backBtn.disabled ? 'not-allowed' : 'pointer';
            }
            this.arraySelectionModal.classList.add('show');
        }

        renderTreeNode(value, path, parentEl, depth, selection) {
            const nodeDiv = document.createElement('div');
            nodeDiv.style.marginLeft = (depth * 16) + 'px';
            nodeDiv.setAttribute('data-tree-node', '');
            nodeDiv.setAttribute('data-path', path);
            const isObject = value && typeof value === 'object' && !Array.isArray(value);
            const isArray = Array.isArray(value);
            const nodeHeader = document.createElement('div');
            nodeHeader.setAttribute('data-node-header', '');
            nodeHeader.style.cssText = 'display: flex; align-items: center; padding: 4px 6px; cursor: pointer; border-radius: 4px; transition: background 0.15s; user-select: none;';
            const isSelected = selection.selectedPath === path;
            if (isSelected) {
                nodeHeader.style.background = '#3e3d32';
                nodeHeader.style.color = '#66d9ef';
                nodeHeader.style.fontWeight = 'bold';
            }
            nodeHeader.addEventListener('mouseenter', () => { if (!isSelected) nodeHeader.style.background = '#31322c'; });
            nodeHeader.addEventListener('mouseleave', () => { if (!isSelected) nodeHeader.style.background = 'transparent'; });
            let label = '';
            let expandIcon = '';
            if (isArray) {
                label = `<span style="color: #ae81ff;">Array[${value.length}]</span>`;
                expandIcon = '<span style="margin-right: 4px; color: #75715e; font-size: 10px;">▶</span>';
            } else if (isObject) {
                const keys = Object.keys(value);
                label = `<span style="color: #66d9ef;">Object{${keys.length}}</span>`;
                expandIcon = '<span style="margin-right: 4px; color: #75715e; font-size: 10px;">▶</span>';
            } else {
                const valStr = window.WorkflowApp.Helpers.stringifyForDisplay(value);
                const preview = valStr.length > 40 ? valStr.substring(0, 40) + '...' : valStr;
                label = `<span style="color: #a6e22e;">${preview}</span>`;
            }
            const pathParts = path.split(/\.|\[/).filter(p => p && p !== '$');
            const nodeName = pathParts[pathParts.length - 1]?.replace(']', '') || '$';
            nodeHeader.innerHTML = `${expandIcon}<span style="color: #f8f8f2; margin-right: 6px;">${nodeName}:</span> ${label}`;
            nodeDiv.appendChild(nodeHeader);
            if (isArray || isObject) {
                const childrenDiv = document.createElement('div');
                childrenDiv.style.display = 'none';
                let isExpanded = false;
                let childrenRendered = false;
                const expandIconEl = nodeHeader.querySelector('span:first-child');
                expandIconEl.addEventListener('click', (e) => {
                    e.stopPropagation();
                    isExpanded = !isExpanded;
                    childrenDiv.style.display = isExpanded ? 'block' : 'none';
                    expandIconEl.textContent = isExpanded ? '▼' : '▶';
                    if (isExpanded && !childrenRendered) {
                        const entries = isArray ? value.map((v, i) => [i, v]) : Object.entries(value);
                        entries.forEach(([key, val]) => {
                            const childPath = isArray ? `${path}[${key}]` : `${path}.${key}`;
                            this.renderTreeNode(val, childPath, childrenDiv, depth + 1, selection);
                        });
                        childrenRendered = true;
                    }
                });
                nodeHeader.addEventListener('click', (e) => {
                    if (e.target === expandIconEl || expandIconEl.contains(e.target)) return;
                    e.stopPropagation();
                    this.updateArraySelection(path, selection);
                });
                nodeDiv.appendChild(childrenDiv);
            } else {
                nodeHeader.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.updateArraySelection(path, selection);
                });
            }
            parentEl.appendChild(nodeDiv);
        }

        updateArraySelection(path, selection) {
            const preview = document.getElementById('array-selection-preview');
            const pathDisplay = document.getElementById('array-selection-path');
            const tree = document.getElementById('array-selection-tree');
            selection.selectedPath = path;
            pathDisplay.textContent = path;
            const selectedValue = window.WorkflowApp.Helpers.getValueAtPath(selection.data, path);
            preview.value = window.WorkflowApp.Helpers.stringifyForDisplay(selectedValue, 2);
            tree.querySelectorAll('[data-tree-node]').forEach(node => {
                const nodeHeader = node.querySelector('[data-node-header]');
                if (nodeHeader) {
                    const nodePath = node.getAttribute('data-path');
                    if (nodePath === path) {
                        nodeHeader.style.background = '#3e3d32';
                        nodeHeader.style.color = '#66d9ef';
                        nodeHeader.style.fontWeight = 'bold';
                    } else {
                        nodeHeader.style.background = 'transparent';
                        nodeHeader.style.color = '';
                        nodeHeader.style.fontWeight = '';
                    }
                }
            });
        }

        bindArraySelectionActions() {
            document.addEventListener('click', async (e) => {
                const target = e.target.closest('[id]');
                if (!target) return;
                if (target.id === 'array-selection-confirm') {
                    if (this.manualSelection) {
                        const selection = this.manualSelection;
                        const conn = selection.targetConn;
                        if (conn) {
                            conn.fromPath = selection.selectedPath;
                            conn.pathSelected = selection.selectedPath !== '$';
                        }
                        this.arraySelectionModal.classList.remove('show');
                        this.manualSelection = null;
                        eda.sys_Message.showToastMessage('路径已设置', 'info', 1);
                        if (selection.onConfirm) selection.onConfirm();
                        return;
                    }
                    const selection = this.executionEngine.executionState.pendingArraySelection;
                    if (!selection) return;
                    this.arraySelectionModal.classList.remove('show');
                    await this.executionEngine.continueAfterArraySelection(selection.selectedPath);
                }
                if (target.id === 'array-selection-cancel') {
                    if (this.manualSelection) {
                        this.arraySelectionModal.classList.remove('show');
                        this.manualSelection = null;
                        return;
                    }
                    this.arraySelectionModal.classList.remove('show');
                    this.executionEngine.cancelExecution();
                }
            });
        }
    }

    window.WorkflowApp.ModalManager = ModalManager;
})();
