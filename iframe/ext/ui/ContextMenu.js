(function() {
    'use strict';

    window.WorkflowApp = window.WorkflowApp || {};

    class ContextMenu {
        constructor(state) {
            this.state = state;
            this.element = document.getElementById('context-menu');
            document.addEventListener('click', (e) => {
                if (!this.element.contains(e.target)) {
                    this.hide();
                }
            });
        }

        show(x, y, block) {
            let menuHtml = '';
            if (block.outputs && block.outputs.length > 0) {
                menuHtml += '<div class="context-menu-label">复制输出变量</div>';
                block.outputs.forEach((output, index) => {
                    const outputName = window.WorkflowApp.Helpers.portName(output);
                    const varRef = `${block.title}.${outputName}`;
                    menuHtml += `
                        <div class="context-menu-item" data-action="copy-output" data-var-ref="${varRef}">
                            <span>${outputName}</span>
                        </div>
                    `;
                });
            } else {
                menuHtml += '<div class="context-menu-item disabled">此模块无输出</div>';
            }

            this.element.innerHTML = menuHtml;
            this.element.style.left = x + 'px';
            this.element.style.top = y + 'px';
            this.element.classList.add('show');

            this.element.querySelectorAll('[data-action="copy-output"]').forEach(item => {
                item.addEventListener('click', () => {
                    this.copyToClipboard(item.dataset.varRef);
                    eda.sys_Message.showToastMessage(`已复制: ${item.dataset.varRef}`, 'info', 1);
                    this.hide();
                });
            });
        }

        hide() {
            this.element.classList.remove('show');
        }

        copyToClipboard(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
    }

    window.WorkflowApp.ContextMenu = ContextMenu;
})();
