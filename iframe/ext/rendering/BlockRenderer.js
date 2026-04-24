(function() {
    'use strict';

    window.WorkflowApp = window.WorkflowApp || {};

    class BlockRenderer {
        constructor(ctx, state) {
            this.ctx = ctx;
            this.state = state;
            this.PORT_RADIUS = 8;
            this.BLOCK_MIN_W = 200;
            this.BLOCK_HEADER_H = 36;
            this.BLOCK_PORT_H = 40;
            this.BLOCK_DESC_H = 40;
        }

        roundedRect(x, y, w, h, r) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + r, y);
            this.ctx.arcTo(x + w, y, x + w, y + h, r);
            this.ctx.arcTo(x + w, y + h, x, y + h, r);
            this.ctx.arcTo(x, y + h, x, y, r);
            this.ctx.arcTo(x, y, x + w, y, r);
            this.ctx.closePath();
        }

        measureBlockWidth(block) {
            if (block.type === 'annotation') {
                const text = block.annotationText || '';
                if (!text) return 150;
                this.ctx.font = '14px sans-serif';
                return Math.max(150, this.ctx.measureText(text).width + 40);
            }

            this.ctx.font = 'bold 13px sans-serif';
            let maxW = this.ctx.measureText(block.title).width + 50;

            this.ctx.font = '11px sans-serif';
            for (let i = 0; i < block.inputs.length; i++) {
                const name = window.WorkflowApp.Helpers.portName(block.inputs[i]);
                const desc = window.WorkflowApp.Helpers.portDesc(block.inputs[i]);
                const nameW = this.ctx.measureText(name).width + this.PORT_RADIUS + 10;
                this.ctx.font = '9px sans-serif';
                const descW = desc ? this.ctx.measureText(desc).width + this.PORT_RADIUS + 10 : 0;
                this.ctx.font = '11px sans-serif';
                maxW = Math.max(maxW, nameW + 20, descW + 20);
            }

            for (let i = 0; i < block.outputs.length; i++) {
                const name = window.WorkflowApp.Helpers.portName(block.outputs[i]);
                const desc = window.WorkflowApp.Helpers.portDesc(block.outputs[i]);
                const nameW = this.ctx.measureText(name).width + this.PORT_RADIUS + 10;
                this.ctx.font = '9px sans-serif';
                const descW = desc ? this.ctx.measureText(desc).width + this.PORT_RADIUS + 10 : 0;
                this.ctx.font = '11px sans-serif';
                maxW = Math.max(maxW, nameW + 20, descW + 20);
            }

            if (block.description) {
                this.ctx.font = '10px sans-serif';
                maxW = Math.max(maxW, this.ctx.measureText(block.description).width + 20);
            }

            if (block.type === 'variable') {
                this.ctx.font = 'bold 12px monospace';
                const prefix = block.varScope === 'global' ? '[G] ' : '';
                const name = block.varName || '';
                const valStr = block.value !== undefined && block.value !== null ? JSON.stringify(block.value) : '';
                const displayStr = name ? `${prefix}${name} = ${valStr}` : valStr;
                if (displayStr) maxW = Math.max(maxW, this.ctx.measureText(displayStr).width + 20);
            }

            return Math.max(this.BLOCK_MIN_W, maxW);
        }

        drawBlock(block) {
            if (block.type === 'annotation') {
                this.drawAnnotationBlock(block);
                return;
            }

            const h = window.WorkflowApp.Geometry.getBlockHeight(block);
            const isSelected = this.state.selected === block.id;
            const hasDesc = block.description && block.description.length > 0;
            const isVariable = block.type === 'variable';
            const rot = block.rotation || 0;

            this.ctx.save();
            if (rot !== 0) {
                const c = window.WorkflowApp.Geometry.getBlockCenter(block);
                this.ctx.translate(c.x, c.y);
                this.ctx.rotate(rot * Math.PI / 180);
                this.ctx.translate(-c.x, -c.y);
            }

            this.roundedRect(block.x, block.y, block.w, h, 8);
            this.ctx.fillStyle = '#2d2e27';
            this.ctx.fill();
            this.ctx.strokeStyle = isSelected ? '#66d9ef' : block.color;
            this.ctx.lineWidth = isSelected ? 2.5 : 1.5;
            this.ctx.stroke();

            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.moveTo(block.x + 8, block.y);
            this.ctx.arcTo(block.x + block.w, block.y, block.x + block.w, block.y + this.BLOCK_HEADER_H, 8);
            this.ctx.lineTo(block.x + block.w, block.y + this.BLOCK_HEADER_H);
            this.ctx.lineTo(block.x, block.y + this.BLOCK_HEADER_H);
            this.ctx.arcTo(block.x, block.y, block.x + block.w, block.y, 8);
            this.ctx.closePath();
            this.ctx.fillStyle = block.color + '33';
            this.ctx.fill();
            this.ctx.restore();

            this.ctx.fillStyle = block.color;
            this.ctx.font = 'bold 13px sans-serif';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(block.title, block.x + 10, block.y + this.BLOCK_HEADER_H / 2);

            this.ctx.fillStyle = '#75715e';
            this.ctx.font = '18px sans-serif';
            this.ctx.fillText('×', block.x + block.w - 20, block.y + this.BLOCK_HEADER_H / 2);

            let contentY = block.y + this.BLOCK_HEADER_H + 8;
            if (isVariable) {
                const prefix = block.varScope === 'global' ? '[G] ' : '';
                const name = block.varName || '';
                const valStr = block.value !== undefined && block.value !== null ? JSON.stringify(block.value) : '';
                const displayStr = name ? `${prefix}${name} = ${valStr}` : (valStr || '');
                if (displayStr) {
                    this.ctx.fillStyle = block.varScope === 'global' ? '#f92672' : '#e6db74';
                    this.ctx.font = 'bold 12px monospace';
                    this.ctx.textAlign = 'left';
                    this.ctx.fillText(displayStr, block.x + 10, contentY + 6);
                    contentY += 20;
                } else if (hasDesc) {
                    this.ctx.fillStyle = '#75715e';
                    this.ctx.font = '10px sans-serif';
                    this.ctx.textAlign = 'left';
                    this.ctx.fillText(block.description, block.x + 10, contentY + 6);
                    contentY += 16;
                }
            } else if (hasDesc) {
                this.ctx.fillStyle = '#75715e';
                this.ctx.font = '10px sans-serif';
                this.ctx.textAlign = 'left';
                this.ctx.fillText(block.description, block.x + 10, contentY + 6);
                contentY += 16;
            }

            const halfW = block.w / 2 - this.PORT_RADIUS - 10;
            this.ctx.restore();
            this.ctx.save();

            this.ctx.font = '11px sans-serif';
            this.ctx.textBaseline = 'middle';
            for (let i = 0; i < block.inputs.length; i++) {
                const p = window.WorkflowApp.Geometry.getPortPos(block, 'input', i);
                const inputName = window.WorkflowApp.Helpers.portName(block.inputs[i]);
                const inputDesc = window.WorkflowApp.Helpers.portDesc(block.inputs[i]);

                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, this.PORT_RADIUS, 0, Math.PI * 2);
                this.ctx.fillStyle = '#49483e';
                this.ctx.fill();
                this.ctx.strokeStyle = '#a6e22e';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                this.ctx.fillStyle = '#f8f8f2';
                this.ctx.textAlign = 'left';
                this.ctx.fillText(window.WorkflowApp.Helpers.truncateText(this.ctx, inputName, halfW), p.x + this.PORT_RADIUS + 6, p.y - 6);
                if (inputDesc) {
                    this.ctx.fillStyle = '#75715e';
                    this.ctx.font = '9px sans-serif';
                    this.ctx.fillText(window.WorkflowApp.Helpers.truncateText(this.ctx, inputDesc, halfW), p.x + this.PORT_RADIUS + 6, p.y + 6);
                    this.ctx.font = '11px sans-serif';
                }
            }

            for (let i = 0; i < block.outputs.length; i++) {
                const p = window.WorkflowApp.Geometry.getPortPos(block, 'output', i);
                const outputName = window.WorkflowApp.Helpers.portName(block.outputs[i]);
                const outputDesc = window.WorkflowApp.Helpers.portDesc(block.outputs[i]);

                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, this.PORT_RADIUS, 0, Math.PI * 2);
                this.ctx.fillStyle = '#49483e';
                this.ctx.fill();
                this.ctx.strokeStyle = '#66d9ef';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                this.ctx.fillStyle = '#f8f8f2';
                this.ctx.textAlign = 'right';
                this.ctx.fillText(window.WorkflowApp.Helpers.truncateText(this.ctx, outputName, halfW), p.x - this.PORT_RADIUS - 6, p.y - 6);
                if (outputDesc) {
                    this.ctx.fillStyle = '#75715e';
                    this.ctx.font = '9px sans-serif';
                    this.ctx.fillText(window.WorkflowApp.Helpers.truncateText(this.ctx, outputDesc, halfW), p.x - this.PORT_RADIUS - 6, p.y + 6);
                    this.ctx.font = '11px sans-serif';
                }
            }
            this.ctx.restore();
        }

        drawAnnotationBlock(block) {
            const isSelected = this.state.selected === block.id;
            const rot = (block.rotation || 0) * Math.PI / 180;
            const len = block.w || 150;
            const text = block.annotationText || '';

            this.ctx.save();

            // Draw line and arrowhead
            const startX = block.x - len / 2;
            const endX = block.x + len / 2;
            const y = block.y;

            // Apply rotation around center
            this.ctx.translate(block.x, block.y);
            this.ctx.rotate(rot);
            this.ctx.translate(-block.x, -block.y);

            // Draw line
            this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
            this.ctx.strokeStyle = isSelected ? '#66d9ef' : block.color;
            this.ctx.lineWidth = isSelected ? 3 : 2;
            this.ctx.stroke();

            // Draw arrowhead at the end
            const arrowSize = 12;
            this.ctx.beginPath();
            this.ctx.moveTo(endX, y);
            this.ctx.lineTo(endX - arrowSize, y - arrowSize / 2);
            this.ctx.lineTo(endX - arrowSize, y + arrowSize / 2);
            this.ctx.closePath();
            this.ctx.fillStyle = isSelected ? '#66d9ef' : block.color;
            this.ctx.fill();

            // Draw start circle
            this.ctx.beginPath();
            this.ctx.arc(startX, y, 4, 0, Math.PI * 2);
            this.ctx.fillStyle = isSelected ? '#66d9ef' : block.color;
            this.ctx.fill();

            // Draw text above the line
            if (text) {
                this.ctx.font = '14px sans-serif';
                this.ctx.fillStyle = '#f8f8f2';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'bottom';
                this.ctx.fillText(text, block.x, y - 8);
            }

            // Draw delete button at center
            if (isSelected) {
                const btnSize = 20;
                const btnX = block.x - btnSize / 2;
                const btnY = y + 12;

                this.ctx.fillStyle = '#f92672';
                this.roundedRect(btnX, btnY, btnSize, btnSize, 4);
                this.ctx.fill();

                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(btnX + 6, btnY + 6);
                this.ctx.lineTo(btnX + 14, btnY + 14);
                this.ctx.moveTo(btnX + 14, btnY + 6);
                this.ctx.lineTo(btnX + 6, btnY + 14);
                this.ctx.stroke();
            }

            this.ctx.restore();
        }
    }

    window.WorkflowApp.BlockRenderer = BlockRenderer;
})();
