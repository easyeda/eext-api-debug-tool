// ============================================================
// Workflow Canvas — 可视化工作流编辑器
// ============================================================

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const state = {
    blocks: [],
    connections: [],
    camera: { x: 0, y: 0, scale: 1 },
    dragging: null,
    connecting: null,
    selected: null,
    panning: false,
    panStart: { x: 0, y: 0 },
    spaceDown: false,
    nextId: 1,
    editingBlock: null,
    mouse: { x: 0, y: 0, wx: 0, wy: 0 },
    placingBlock: null,
};

const PORT_RADIUS = 8;
const BLOCK_MIN_W = 200;
const BLOCK_HEADER_H = 36;
const BLOCK_PORT_H = 40;
const BLOCK_DESC_H = 40;

const BLOCK_DEFS = {};
const BLOCK_CATEGORIES = {};

function initBlockDefs() {
    if (typeof edcode === 'undefined') {
        console.warn('edcode not loaded');
        BLOCK_DEFS.custom = {
            title: '自定义代码',
            color: '#f92672',
            inputs: ['input'],
            outputs: ['output'],
            code: 'return input;',
            category: '自定义'
        };
        BLOCK_CATEGORIES['自定义'] = ['custom'];
        return;
    }

    edcode.forEach(item => {
        if (item.isEnumMember || item.isEnum) return;
        const path = item.methodPath;
        const parts = path.split('.');
        if (parts.length < 2) return;

        const category = parts[1];
        const methodName = parts.slice(2).join('.');
        const params = item.parameters || [];
        const inputs = params.map(p => ({ name: p.name, description: p.description || '' }));
        const hasReturn = item.returns && item.returns !== 'void';
        const blockId = path.replace(/\./g, '_');

        BLOCK_DEFS[blockId] = {
            title: methodName || path,
            fullPath: path,
            color: getCategoryColor(category),
            inputs: inputs,
            outputs: hasReturn ? [{ name: 'result', description: item.returns || '' }] : [],
            code: generateBlockCode(path, inputs.map(i => i.name), hasReturn),
            category: category,
            description: item.description || ''
        };

        if (!BLOCK_CATEGORIES[category]) BLOCK_CATEGORIES[category] = [];
        BLOCK_CATEGORIES[category].push(blockId);
    });

    BLOCK_DEFS.custom = {
        title: '自定义代码',
        color: '#f92672',
        inputs: [{ name: 'input', description: '输入值' }],
        outputs: [{ name: 'output', description: '输出值' }],
        code: 'const output = input;\nreturn output;',
        category: '自定义'
    };
    BLOCK_CATEGORIES['自定义'] = ['custom'];

    BLOCK_DEFS.function = {
        title: '函数',
        color: '#fd971f',
        inputs: [{ name: 'input', description: '输入值' }],
        outputs: [{ name: 'result', description: '函数输出' }],
        code: 'const result1 = input;\n\nreturn result1;',
        category: '自定义',
        description: ''
    };
    BLOCK_CATEGORIES['自定义'].push('function');

    BLOCK_DEFS.variable = {
        title: '变量',
        color: '#e6db74',
        inputs: [],
        outputs: [{ name: 'value', description: '变量值' }],
        code: 'const value = null;\nreturn value;',
        category: '基础',
        description: '输入常量值（字符串、数字、布尔值等）',
        value: null
    };
    if (!BLOCK_CATEGORIES['基础']) BLOCK_CATEGORIES['基础'] = [];
    BLOCK_CATEGORIES['基础'].unshift('variable');
}

function getCategoryColor(category) {
    const colors = {
        'pcb_Component': '#66d9ef', 'sch_Component': '#a6e22e',
        'pcb_Board': '#ae81ff', 'sch_Board': '#f92672',
        'sys_Message': '#e6db74', 'sys_Storage': '#fd971f',
    };
    return colors[category] || '#75715e';
}

function generateBlockCode(path, inputNames, hasReturn) {
    const args = inputNames.join(', ');
    if (hasReturn) {
        return `const result = await ${path}(${args});\nreturn result;`;
    } else {
        return `await ${path}(${args});`;
    }
}

function portName(port) {
    return typeof port === 'string' ? port : port.name;
}

function portDesc(port) {
    return typeof port === 'string' ? '' : (port.description || '');
}

function truncateText(text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    const ellipsis = '...';
    const ellipsisW = ctx.measureText(ellipsis).width;
    let end = text.length;
    while (end > 0 && ctx.measureText(text.slice(0, end)).width + ellipsisW > maxWidth) end--;
    return text.slice(0, end) + ellipsis;
}

const portTooltip = document.createElement('div');
portTooltip.style.cssText = 'position:fixed;background:#1e1f1c;color:#f8f8f2;border:1px solid #49483e;border-radius:4px;padding:6px 10px;font:12px sans-serif;max-width:360px;word-wrap:break-word;pointer-events:none;z-index:9999;display:none;box-shadow:0 2px 8px rgba(0,0,0,0.5);';
document.body.appendChild(portTooltip);

function findTruncatedPortText(wx, wy) {
    for (let bi = state.blocks.length - 1; bi >= 0; bi--) {
        const block = state.blocks[bi];
        const halfW = block.w / 2 - PORT_RADIUS - 10;
        const lp = unrotatePoint(wx, wy, block);
        const hasDesc = block.description && block.description.length > 0;
        const descOffset = hasDesc ? BLOCK_DESC_H : 0;
        const startY = BLOCK_HEADER_H + descOffset + 12;

        for (let i = 0; i < block.inputs.length; i++) {
            const py = block.y + startY + i * BLOCK_PORT_H + BLOCK_PORT_H / 2;
            const left = block.x + PORT_RADIUS + 6;

            ctx.font = '11px sans-serif';
            const name = portName(block.inputs[i]);
            if (ctx.measureText(name).width > halfW &&
                lp.x >= left && lp.x <= left + halfW && lp.y >= py - 14 && lp.y <= py) {
                return name;
            }

            const desc = portDesc(block.inputs[i]);
            if (desc) {
                ctx.font = '9px sans-serif';
                if (ctx.measureText(desc).width > halfW &&
                    lp.x >= left && lp.x <= left + halfW && lp.y >= py && lp.y <= py + 14) {
                    return desc;
                }
            }
        }

        for (let i = 0; i < block.outputs.length; i++) {
            const py = block.y + startY + i * BLOCK_PORT_H + BLOCK_PORT_H / 2;
            const right = block.x + block.w - PORT_RADIUS - 6;

            ctx.font = '11px sans-serif';
            const name = portName(block.outputs[i]);
            if (ctx.measureText(name).width > halfW &&
                lp.x >= right - halfW && lp.x <= right && lp.y >= py - 14 && lp.y <= py) {
                return name;
            }

            const desc = portDesc(block.outputs[i]);
            if (desc) {
                ctx.font = '9px sans-serif';
                if (ctx.measureText(desc).width > halfW &&
                    lp.x >= right - halfW && lp.x <= right && lp.y >= py && lp.y <= py + 14) {
                    return desc;
                }
            }
        }
    }
    return null;
}

function screenToWorld(sx, sy) {
    return {
        x: (sx - state.camera.x) / state.camera.scale,
        y: (sy - state.camera.y) / state.camera.scale,
    };
}

function getBlockHeight(block) {
    const ports = Math.max(block.inputs.length, block.outputs.length);
    const hasDesc = block.description && block.description.length > 0;
    return BLOCK_HEADER_H + Math.max(ports, 1) * BLOCK_PORT_H + 12 + (hasDesc ? BLOCK_DESC_H : 0);
}

function getBlockCenter(block) {
    const h = getBlockHeight(block);
    return { x: block.x + block.w / 2, y: block.y + h / 2 };
}

function rotatePoint(px, py, cx, cy, angle) {
    const rad = angle * Math.PI / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const dx = px - cx;
    const dy = py - cy;
    return { x: cx + dx * cos - dy * sin, y: cy + dx * sin + dy * cos };
}

function unrotatePoint(px, py, block) {
    const rot = block.rotation || 0;
    if (rot === 0) return { x: px, y: py };
    const c = getBlockCenter(block);
    return rotatePoint(px, py, c.x, c.y, -rot);
}

function getPortPos(block, side, index) {
    const hasDesc = block.description && block.description.length > 0;
    const descOffset = hasDesc ? BLOCK_DESC_H : 0;
    const startY = BLOCK_HEADER_H + descOffset + 12;
    const py = block.y + startY + index * BLOCK_PORT_H + BLOCK_PORT_H / 2;
    const px = side === 'input' ? block.x : block.x + block.w;
    const rot = block.rotation || 0;
    if (rot === 0) return { x: px, y: py };
    const c = getBlockCenter(block);
    return rotatePoint(px, py, c.x, c.y, rot);
}

function hitTestPort(mx, my) {
    for (const b of state.blocks) {
        for (let i = 0; i < b.inputs.length; i++) {
            const p = getPortPos(b, 'input', i);
            if (Math.hypot(mx - p.x, my - p.y) < PORT_RADIUS + 5) {
                return { blockId: b.id, side: 'input', index: i };
            }
        }
        for (let i = 0; i < b.outputs.length; i++) {
            const p = getPortPos(b, 'output', i);
            if (Math.hypot(mx - p.x, my - p.y) < PORT_RADIUS + 5) {
                return { blockId: b.id, side: 'output', index: i };
            }
        }
    }
    return null;
}

function hitTestBlock(mx, my) {
    for (let i = state.blocks.length - 1; i >= 0; i--) {
        const b = state.blocks[i];
        const h = getBlockHeight(b);
        const lp = unrotatePoint(mx, my, b);
        if (lp.x >= b.x && lp.x <= b.x + b.w && lp.y >= b.y && lp.y <= b.y + h) {
            return b;
        }
    }
    return null;
}

function hitTestDeleteBtn(mx, my, block) {
    const lp = unrotatePoint(mx, my, block);
    const bx = block.x + block.w - 24;
    const by = block.y + 8;
    return lp.x >= bx && lp.x <= bx + 20 && lp.y >= by && lp.y <= by + 20;
}

function measureBlockWidth(block) {
    ctx.font = 'bold 13px sans-serif';
    let maxW = ctx.measureText(block.title).width + 50;

    ctx.font = '11px sans-serif';
    for (let i = 0; i < block.inputs.length; i++) {
        const name = portName(block.inputs[i]);
        const desc = portDesc(block.inputs[i]);
        const nameW = ctx.measureText(name).width + PORT_RADIUS + 10;
        ctx.font = '9px sans-serif';
        const descW = desc ? ctx.measureText(desc).width + PORT_RADIUS + 10 : 0;
        ctx.font = '11px sans-serif';
        maxW = Math.max(maxW, nameW + 20, descW + 20);
    }

    for (let i = 0; i < block.outputs.length; i++) {
        const name = portName(block.outputs[i]);
        const desc = portDesc(block.outputs[i]);
        const nameW = ctx.measureText(name).width + PORT_RADIUS + 10;
        ctx.font = '9px sans-serif';
        const descW = desc ? ctx.measureText(desc).width + PORT_RADIUS + 10 : 0;
        ctx.font = '11px sans-serif';
        maxW = Math.max(maxW, nameW + 20, descW + 20);
    }

    if (block.description) {
        ctx.font = '10px sans-serif';
        maxW = Math.max(maxW, ctx.measureText(block.description).width + 20);
    }

    if (block.type === 'variable' && block.value !== undefined && block.value !== null) {
        ctx.font = 'bold 12px monospace';
        maxW = Math.max(maxW, ctx.measureText(JSON.stringify(block.value)).width + 20);
    }

    return Math.max(BLOCK_MIN_W, maxW);
}

function addBlock(type) {
    const def = BLOCK_DEFS[type];
    if (!def) return;
    const worldCenter = screenToWorld(canvas.width / 2, canvas.height / 2);
    const block = {
        id: state.nextId++,
        type,
        title: def.title,
        color: def.color,
        x: worldCenter.x - 100 + Math.random() * 40 - 20,
        y: worldCenter.y - 40 + Math.random() * 40 - 20,
        w: BLOCK_MIN_W,
        inputs: [...def.inputs],
        outputs: [...def.outputs],
        code: def.code,
        description: def.description || '',
        value: def.value !== undefined ? def.value : undefined,
        rotation: 0,
        savedPath: undefined,
    };
    block.w = measureBlockWidth(block);
    state.blocks.push(block);
    state.selected = block.id;
}

function copyBlock(blockId) {
    const original = state.blocks.find(b => b.id === blockId);
    if (!original) return;

    const block = {
        id: state.nextId++,
        type: original.type,
        title: original.title,
        color: original.color,
        x: original.x + 30,
        y: original.y + 30,
        w: original.w,
        inputs: [...original.inputs],
        outputs: [...original.outputs],
        code: original.code,
        description: original.description || '',
        value: original.value !== undefined ? original.value : undefined,
        rotation: original.rotation || 0,
        savedPath: original.savedPath,
    };
    block.w = measureBlockWidth(block);
    state.blocks.push(block);
    state.selected = block.id;
}

function removeBlock(blockId) {
    state.blocks = state.blocks.filter((b) => b.id !== blockId);
    state.connections = state.connections.filter((c) => c.fromId !== blockId && c.toId !== blockId);
    if (state.selected === blockId) state.selected = null;
}

function createBlockFromMethod(methodPath, edcodeItem) {
    const blockId = methodPath.replace(/\./g, '_');

    if (!BLOCK_DEFS[blockId]) {
        const parts = methodPath.split('.');
        const category = parts[1] || 'custom';
        const methodName = parts.slice(2).join('.') || methodPath;
        const params = (edcodeItem && edcodeItem.parameters) || [];
        const hasReturn = edcodeItem && edcodeItem.returns && edcodeItem.returns !== 'void';

        BLOCK_DEFS[blockId] = {
            title: methodName,
            fullPath: methodPath,
            color: getCategoryColor(category),
            inputs: params.map(p => ({ name: p.name, description: p.description || '' })),
            outputs: hasReturn ? [{ name: 'result', description: edcodeItem.returns || '' }] : [],
            code: generateBlockCode(methodPath, params.map(p => p.name), hasReturn),
            category: category,
            description: (edcodeItem && edcodeItem.description) || ''
        };

        if (!BLOCK_CATEGORIES[category]) BLOCK_CATEGORIES[category] = [];
        if (!BLOCK_CATEGORIES[category].includes(blockId)) BLOCK_CATEGORIES[category].push(blockId);
    }

    startBlockPlacement(blockId);
}

function startBlockPlacement(blockId) {
    const def = BLOCK_DEFS[blockId];
    if (!def) return;

    if (state.placingBlock) state.placingBlock = null;

    const block = {
        id: -1,
        type: blockId,
        title: def.title,
        color: def.color,
        x: state.mouse.wx - BLOCK_MIN_W / 2,
        y: state.mouse.wy - 20,
        w: BLOCK_MIN_W,
        inputs: [...def.inputs],
        outputs: [...def.outputs],
        code: def.code,
        description: def.description || '',
        value: def.value !== undefined ? def.value : undefined,
        rotation: 0,
    };
    block.w = measureBlockWidth(block);

    state.placingBlock = block;
    canvas.style.cursor = 'crosshair';
}

function finalizePlacement() {
    if (!state.placingBlock) return;
    const block = state.placingBlock;
    block.id = state.nextId++;
    state.blocks.push(block);
    state.selected = block.id;
    state.placingBlock = null;
    canvas.style.cursor = 'default';
}

function cancelPlacement() {
    state.placingBlock = null;
    canvas.style.cursor = 'default';
}

function roundedRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

function drawGrid() {
    const grid = 40;
    const startX = (-state.camera.x / state.camera.scale) % grid;
    const startY = (-state.camera.y / state.camera.scale) % grid;
    ctx.save();
    ctx.strokeStyle = '#31322c';
    ctx.lineWidth = 1 / state.camera.scale;
    for (let x = startX; x < canvas.width / state.camera.scale; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x, -state.camera.y / state.camera.scale);
        ctx.lineTo(x, (-state.camera.y + canvas.height) / state.camera.scale);
        ctx.stroke();
    }
    for (let y = startY; y < canvas.height / state.camera.scale; y += grid) {
        ctx.beginPath();
        ctx.moveTo(-state.camera.x / state.camera.scale, y);
        ctx.lineTo((-state.camera.x + canvas.width) / state.camera.scale, y);
        ctx.stroke();
    }
    ctx.restore();
}

function drawConnection(from, to, color) {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    const dx = Math.max(60, Math.abs(to.x - from.x) * 0.5);
    ctx.bezierCurveTo(from.x + dx, from.y, to.x - dx, to.y, to.x, to.y);
    ctx.strokeStyle = color || '#66d9ef';
    ctx.lineWidth = 3;
    ctx.stroke();
}

function drawBlock(block) {
    const h = getBlockHeight(block);
    const isSelected = state.selected === block.id;
    const hasDesc = block.description && block.description.length > 0;
    const isVariable = block.type === 'variable';
    const hasValue = isVariable && block.value !== undefined && block.value !== null;
    const rot = block.rotation || 0;

    ctx.save();

    // Apply rotation transform
    if (rot !== 0) {
        const c = getBlockCenter(block);
        ctx.translate(c.x, c.y);
        ctx.rotate(rot * Math.PI / 180);
        ctx.translate(-c.x, -c.y);
    }

    roundedRect(block.x, block.y, block.w, h, 8);
    ctx.fillStyle = '#2d2e27';
    ctx.fill();
    ctx.strokeStyle = isSelected ? '#66d9ef' : block.color;
    ctx.lineWidth = isSelected ? 2.5 : 1.5;
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(block.x + 8, block.y);
    ctx.arcTo(block.x + block.w, block.y, block.x + block.w, block.y + BLOCK_HEADER_H, 8);
    ctx.lineTo(block.x + block.w, block.y + BLOCK_HEADER_H);
    ctx.lineTo(block.x, block.y + BLOCK_HEADER_H);
    ctx.arcTo(block.x, block.y, block.x + block.w, block.y, 8);
    ctx.closePath();
    ctx.fillStyle = block.color + '33';
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = block.color;
    ctx.font = 'bold 13px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(block.title, block.x + 10, block.y + BLOCK_HEADER_H / 2);

    ctx.fillStyle = '#75715e';
    ctx.font = '18px sans-serif';
    ctx.fillText('×', block.x + block.w - 20, block.y + BLOCK_HEADER_H / 2);

    let contentY = block.y + BLOCK_HEADER_H + 8;

    // Display variable value if it exists
    if (hasValue) {
        ctx.fillStyle = '#e6db74';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'left';
        const valueStr = JSON.stringify(block.value);
        ctx.fillText(valueStr, block.x + 10, contentY + 6);
        contentY += 20;
    } else if (hasDesc) {
        // Display description if no value
        ctx.fillStyle = '#75715e';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(block.description, block.x + 10, contentY + 6);
        contentY += 16;
    }

    const halfW = block.w / 2 - PORT_RADIUS - 10;

    // Restore to unrotated canvas state before drawing ports
    // Ports are drawn at world-space positions (getPortPos handles rotation)
    // so text labels stay upright regardless of block rotation
    ctx.restore();
    ctx.save();

    ctx.font = '11px sans-serif';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < block.inputs.length; i++) {
        const p = getPortPos(block, 'input', i);
        const inputName = portName(block.inputs[i]);
        const inputDesc = portDesc(block.inputs[i]);

        ctx.beginPath();
        ctx.arc(p.x, p.y, PORT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#49483e';
        ctx.fill();
        ctx.strokeStyle = '#a6e22e';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#f8f8f2';
        ctx.textAlign = 'left';
        ctx.fillText(truncateText(inputName, halfW), p.x + PORT_RADIUS + 6, p.y - 6);

        if (inputDesc) {
            ctx.fillStyle = '#75715e';
            ctx.font = '9px sans-serif';
            ctx.fillText(truncateText(inputDesc, halfW), p.x + PORT_RADIUS + 6, p.y + 6);
            ctx.font = '11px sans-serif';
        }
    }

    for (let i = 0; i < block.outputs.length; i++) {
        const p = getPortPos(block, 'output', i);
        const outputName = portName(block.outputs[i]);
        const outputDesc = portDesc(block.outputs[i]);

        ctx.beginPath();
        ctx.arc(p.x, p.y, PORT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#49483e';
        ctx.fill();
        ctx.strokeStyle = '#66d9ef';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#f8f8f2';
        ctx.textAlign = 'right';
        ctx.fillText(truncateText(outputName, halfW), p.x - PORT_RADIUS - 6, p.y - 6);

        if (outputDesc) {
            ctx.fillStyle = '#75715e';
            ctx.font = '9px sans-serif';
            ctx.fillText(truncateText(outputDesc, halfW), p.x - PORT_RADIUS - 6, p.y + 6);
            ctx.font = '11px sans-serif';
        }
    }
    ctx.restore();
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#272822';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(state.camera.x, state.camera.y);
    ctx.scale(state.camera.scale, state.camera.scale);

    drawGrid();

    for (const c of state.connections) {
        const fromBlock = state.blocks.find((b) => b.id === c.fromId);
        const toBlock = state.blocks.find((b) => b.id === c.toId);
        if (!fromBlock || !toBlock) continue;
        const from = getPortPos(fromBlock, 'output', c.fromPort);
        const to = getPortPos(toBlock, 'input', c.toPort);
        drawConnection(from, to);
    }

    if (state.connecting) {
        const fromBlock = state.blocks.find(b => b.id === state.connecting.fromId);
        if (fromBlock) {
            const from = getPortPos(fromBlock, 'output', state.connecting.fromPort);
            drawConnection(from, { x: state.mouse.wx, y: state.mouse.wy }, '#f92672');
        }
    }

    for (const b of state.blocks) drawBlock(b);

    if (state.placingBlock) {
        ctx.globalAlpha = 0.6;
        drawBlock(state.placingBlock);
        ctx.globalAlpha = 1;
    }

    ctx.restore();
    requestAnimationFrame(render);
}

function resize() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}
window.addEventListener('resize', resize);
canvas.addEventListener('mouseleave', () => { portTooltip.style.display = 'none'; });
resize();

canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const w = screenToWorld(sx, sy);

    if (state.placingBlock && e.button === 0) {
        finalizePlacement();
        return;
    }

    if (e.button === 1 || e.button === 2 || (e.button === 0 && state.spaceDown)) {
        state.panning = true;
        state.panStart = { x: sx - state.camera.x, y: sy - state.camera.y };
        e.preventDefault();
        return;
    }

    if (e.button !== 0) return;

    const port = hitTestPort(w.x, w.y);
    if (port && port.side === 'output') {
        state.connecting = { fromId: port.blockId, fromPort: port.index };
        e.preventDefault();
        return;
    }

    const block = hitTestBlock(w.x, w.y);
    if (block) {
        if (hitTestDeleteBtn(w.x, w.y, block)) {
            removeBlock(block.id);
            return;
        }
        state.selected = block.id;
        state.dragging = { blockId: block.id, offsetX: w.x - block.x, offsetY: w.y - block.y };
        const idx = state.blocks.indexOf(block);
        state.blocks.splice(idx, 1);
        state.blocks.push(block);
        return;
    }

    state.selected = null;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const w = screenToWorld(sx, sy);
    state.mouse = { x: sx, y: sy, wx: w.x, wy: w.y };

    if (state.panning) {
        state.camera.x = sx - state.panStart.x;
        state.camera.y = sy - state.panStart.y;
        portTooltip.style.display = 'none';
        return;
    }

    if (state.dragging) {
        const block = state.blocks.find((b) => b.id === state.dragging.blockId);
        if (block) {
            block.x = w.x - state.dragging.offsetX;
            block.y = w.y - state.dragging.offsetY;
        }
        portTooltip.style.display = 'none';
        return;
    }

    if (state.placingBlock) {
        state.placingBlock.x = w.x - state.placingBlock.w / 2;
        state.placingBlock.y = w.y - getBlockHeight(state.placingBlock) / 2;
        portTooltip.style.display = 'none';
        return;
    }

    // Show tooltip for truncated port text
    const fullText = findTruncatedPortText(w.x, w.y);
    if (fullText) {
        portTooltip.textContent = fullText;
        portTooltip.style.display = 'block';
        portTooltip.style.left = (e.clientX + 12) + 'px';
        portTooltip.style.top = (e.clientY + 12) + 'px';
    } else {
        portTooltip.style.display = 'none';
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (state.connecting) {
        const rect = canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        const w = screenToWorld(sx, sy);
        const port = hitTestPort(w.x, w.y);
        if (port && port.side === 'input' && port.blockId !== state.connecting.fromId) {
            const exists = state.connections.some(
                (c) => c.toId === port.blockId && c.toPort === port.index
            );
            if (!exists) {
                state.connections.push({
                    fromId: state.connecting.fromId,
                    fromPort: state.connecting.fromPort,
                    toId: port.blockId,
                    toPort: port.index,
                });
            }
        }
        state.connecting = null;
    }
    state.dragging = null;
    state.panning = false;
});

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const w = screenToWorld(sx, sy);
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(4, state.camera.scale * delta));
    state.camera.x = sx - w.x * newScale;
    state.camera.y = sy - w.y * newScale;
    state.camera.scale = newScale;
});

canvas.addEventListener('dblclick', (e) => {
    const rect = canvas.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const w = screenToWorld(sx, sy);
    const block = hitTestBlock(w.x, w.y);
    if (block) {
        if (block.type === 'variable') {
            openModal(block, 'variable');
        } else if (block.savedPath) {
            openModal(block, 'state');
        } else {
            openModal(block, 'code');
        }
    }
});

window.addEventListener('keydown', (e) => {
    if (e.code === 'Escape' && state.placingBlock) {
        cancelPlacement();
        return;
    }
    if (e.code === 'Space' && !state.editingBlock) {
        e.preventDefault();
        if (state.selected) {
            const block = state.blocks.find(b => b.id === state.selected);
            if (block) {
                block.rotation = ((block.rotation || 0) + 90) % 360;
            }
        } else {
            state.spaceDown = true;
            canvas.style.cursor = 'grab';
        }
    }
    if (e.code === 'Delete' && state.selected && !state.editingBlock) {
        removeBlock(state.selected);
    }
    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyD' && state.selected && !state.editingBlock) {
        e.preventDefault();
        copyBlock(state.selected);
    }
    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyC' && state.selected && !state.editingBlock) {
        e.preventDefault();
        state.copiedBlock = state.selected;
    }
    if ((e.ctrlKey || e.metaKey) && e.code === 'KeyV' && state.copiedBlock && !state.editingBlock) {
        e.preventDefault();
        copyBlock(state.copiedBlock);
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        state.spaceDown = false;
        canvas.style.cursor = 'default';
    }
});

const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const codeEditor = document.getElementById('code-editor');
const variableEditor = document.getElementById('variable-editor');
const functionEditor = document.getElementById('function-editor');
const functionNameEditor = document.getElementById('function-name-editor');
const paramsScroll = document.getElementById('params-scroll');
const paramAddBtn = document.getElementById('param-add-btn');
const functionOutputEditor = document.getElementById('function-output-editor');

const functionDescEditor = document.getElementById('function-desc-editor');

let currentParams = [];
let lastGeneratedCode = '';

function createParamChip(paramName = '') {
    const chip = document.createElement('div');
    chip.className = 'param-chip';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = paramName;
    input.placeholder = 'param';
    input.addEventListener('input', (e) => {
        const width = Math.max(40, Math.min(150, e.target.value.length * 8 + 20));
        e.target.style.width = width + 'px';
        syncCodeWithParams();
    });

    const removeBtn = document.createElement('button');
    removeBtn.className = 'param-remove';
    removeBtn.textContent = '×';
    removeBtn.onclick = () => {
        chip.remove();
        syncCodeWithParams();
    };

    chip.appendChild(input);
    chip.appendChild(removeBtn);

    if (paramName) {
        const width = Math.max(40, Math.min(150, paramName.length * 8 + 20));
        input.style.width = width + 'px';
    }

    return chip;
}

function addParam() {
    const chip = createParamChip();
    paramsScroll.appendChild(chip);
    chip.querySelector('input').focus();
    paramsScroll.scrollLeft = paramsScroll.scrollWidth;
    syncCodeWithParams();
}

function getParamNames() {
    const inputs = paramsScroll.querySelectorAll('.param-chip input');
    return Array.from(inputs).map(input => input.value.trim()).filter(Boolean);
}

function buildCodeFromParams(params) {
    const outputName = functionOutputEditor.value.trim() || 'result';
    let code = '';
    params.forEach((p, i) => {
        code += `const ${outputName}${i + 1} = ${p};\n`;
    });
    code += `\nreturn ${outputName}1;`;
    return code;
}

function syncCodeWithParams() {
    if (!state.editingBlock || state.editingBlock.type !== 'function') return;
    const params = getParamNames();
    if (params.length === 0) return;

    const newCode = buildCodeFromParams(params);
    const current = codeEditor.value;

    if (!current || current === lastGeneratedCode) {
        codeEditor.value = newCode;
        lastGeneratedCode = newCode;
    }
}

function parseFunctionInputs() {
    const names = getParamNames();
    if (names.length === 0) throw new Error('至少需要一个输入参数');

    const seen = new Set();
    return names.map((name) => {
        if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)) throw new Error(`无效的输入名称: ${name}`);
        if (seen.has(name)) throw new Error(`重复的输入名称: ${name}`);
        seen.add(name);
        return { name, description: '' };
    });
}

function parseFunctionOutput(rawValue) {
    const name = (rawValue || '').trim() || 'result';
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name)) throw new Error(`无效的输出名称: ${name}`);
    return { name, description: '函数输出' };
}

paramAddBtn.addEventListener('click', addParam);

functionOutputEditor.addEventListener('input', () => {
    syncCodeWithParams();
});

function openModal(block, type) {
    state.editingBlock = block;
    state.editingModalType = type;

    const stateEditor = document.getElementById('state-editor');

    if (type === 'state') {
        modalTitle.textContent = '查看/编辑选择状态 - ' + block.title;
        codeEditor.style.display = 'none';
        variableEditor.style.display = 'none';
        functionEditor.style.display = 'none';
        stateEditor.style.display = 'block';
        document.getElementById('state-path-editor').value = block.savedPath || '(未设置)';
    } else if (type === 'variable') {
        modalTitle.textContent = '编辑变量值';
        codeEditor.style.display = 'none';
        variableEditor.style.display = 'block';
        functionEditor.style.display = 'none';
        stateEditor.style.display = 'none';
        variableEditor.value = block.value !== undefined && block.value !== null ? JSON.stringify(block.value) : '';
        variableEditor.focus();
    } else {
        modalTitle.textContent = block.type === 'function' ? '编辑函数模块' : '编辑代码模块';
        codeEditor.style.display = 'block';
        variableEditor.style.display = 'none';
        functionEditor.style.display = block.type === 'function' ? 'block' : 'none';
        stateEditor.style.display = 'none';

        if (block.type === 'function') {
            functionNameEditor.value = block.title || '';
            functionDescEditor.value = block.description || '';
            functionOutputEditor.value = portName(block.outputs[0] || { name: 'result' });

            paramsScroll.innerHTML = '';
            const params = block.inputs.map(portName);
            if (params.length === 0) params.push('input');
            params.forEach(param => {
                paramsScroll.appendChild(createParamChip(param));
            });

            lastGeneratedCode = buildCodeFromParams(params);
        }

        codeEditor.value = block.code;
        codeEditor.focus();
    }

    modal.classList.add('show');
}

document.getElementById('modal-cancel').addEventListener('click', () => {
    modal.classList.remove('show');
    state.editingBlock = null;
    state.editingModalType = null;
});

modal.addEventListener('click', (e) => {
    if (e.target.id === 'clear-saved-path') {
        if (state.editingBlock) {
            state.editingBlock.savedPath = undefined;
            modal.classList.remove('show');
            state.editingBlock = null;
            state.editingModalType = null;
        }
    }
});

document.getElementById('modal-save').addEventListener('click', () => {
    if (state.editingBlock) {
        if (state.editingModalType === 'state') {
            modal.classList.remove('show');
            state.editingBlock = null;
            state.editingModalType = null;
            return;
        }
        if (variableEditor.style.display !== 'none') {
            // Saving variable value
            const input = variableEditor.value.trim();
            try {
                if (input === '') {
                    state.editingBlock.value = null;
                } else if (input === 'true') {
                    state.editingBlock.value = true;
                } else if (input === 'false') {
                    state.editingBlock.value = false;
                } else if (input === 'null') {
                    state.editingBlock.value = null;
                } else if (!isNaN(input) && input !== '') {
                    state.editingBlock.value = Number(input);
                } else if ((input.startsWith('{') && input.endsWith('}')) || (input.startsWith('[') && input.endsWith(']'))) {
                    state.editingBlock.value = JSON.parse(input);
                } else {
                    state.editingBlock.value = input;
                }
                state.editingBlock.code = `const value = ${JSON.stringify(state.editingBlock.value)};\nreturn value;`;
                state.editingBlock.w = measureBlockWidth(state.editingBlock);
            } catch (e) {
                eda.sys_Message.showToastMessage('无效的值格式: ' + e.message, 'info', 1);
                return;
            }
        } else {
            if (state.editingBlock.type === 'function') {
                try {
                    const nextTitle = functionNameEditor.value.trim() || '函数';
                    const nextInputs = parseFunctionInputs();
                    const nextOutput = parseFunctionOutput(functionOutputEditor.value);

                    state.editingBlock.title = nextTitle;
                    state.editingBlock.inputs = nextInputs;
                    state.editingBlock.outputs = [nextOutput];
                    state.editingBlock.description = functionDescEditor.value.trim();

                    state.connections = state.connections.filter((conn) => {
                        if (conn.toId === state.editingBlock.id && conn.toPort >= nextInputs.length) {
                            return false;
                        }
                        return !(conn.fromId === state.editingBlock.id && conn.fromPort >= 1);
                    });
                } catch (e) {
                    eda.sys_Message.showToastMessage(e.message, 'info', 1);
                    return;
                }
            }

            // Saving custom code
            state.editingBlock.code = codeEditor.value;
            state.editingBlock.w = measureBlockWidth(state.editingBlock);
        }
    }
    modal.classList.remove('show');
    state.editingBlock = null;
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('show');
        state.editingBlock = null;
    }
});

const addBlockSelect = document.getElementById('add-block');
const searchInput = document.getElementById('search-blocks');
const searchPanel = document.getElementById('search-panel');
const searchResults = document.getElementById('search-results');

function populateBlockMenu() {
    addBlockSelect.innerHTML = '<option value="">添加模块...</option>';
    Object.keys(BLOCK_CATEGORIES).sort().forEach(cat => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = cat;
        BLOCK_CATEGORIES[cat].slice(0, 20).forEach(blockId => {
            const opt = document.createElement('option');
            opt.value = blockId;
            opt.textContent = BLOCK_DEFS[blockId].title;
            optgroup.appendChild(opt);
        });
        addBlockSelect.appendChild(optgroup);
    });
}

function searchBlocks(query) {
    if (!query || query.length < 2) {
        searchPanel.classList.remove('show');
        return;
    }

    const lowerQuery = query.toLowerCase();
    const results = [];

    Object.keys(BLOCK_DEFS).forEach(blockId => {
        const def = BLOCK_DEFS[blockId];
        const titleMatch = def.title.toLowerCase().includes(lowerQuery);
        const descMatch = def.description && def.description.toLowerCase().includes(lowerQuery);
        const pathMatch = def.fullPath && def.fullPath.toLowerCase().includes(lowerQuery);

        if (titleMatch || descMatch || pathMatch) {
            results.push({ blockId, def, score: titleMatch ? 3 : (pathMatch ? 2 : 1) });
        }
    });

    results.sort((a, b) => b.score - a.score);

    searchResults.innerHTML = '';
    results.slice(0, 50).forEach(({ blockId, def }) => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.innerHTML = `
            <div class="search-result-title">${def.title}</div>
            ${def.fullPath ? `<div class="search-result-path">${def.fullPath}</div>` : ''}
            ${def.description ? `<div class="search-result-desc">${def.description}</div>` : ''}
        `;
        item.onclick = () => {
            addBlock(blockId);
            searchInput.value = '';
            searchPanel.classList.remove('show');
        };
        searchResults.appendChild(item);
    });

    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item"><div class="search-result-desc">未找到匹配的模块</div></div>';
    }

    searchPanel.classList.add('show');
}

searchInput.addEventListener('input', (e) => {
    searchBlocks(e.target.value);
});

searchInput.addEventListener('focus', (e) => {
    if (e.target.value.length >= 2) {
        searchBlocks(e.target.value);
    }
});

document.addEventListener('click', (e) => {
    if (!searchPanel.contains(e.target) && e.target !== searchInput) {
        searchPanel.classList.remove('show');
    }
});

addBlockSelect.addEventListener('change', (e) => {
    if (e.target.value) {
        addBlock(e.target.value);
        e.target.value = '';
    }
});

document.getElementById('zoom-in').addEventListener('click', () => {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const w = screenToWorld(cx, cy);
    state.camera.scale = Math.min(4, state.camera.scale * 1.2);
    state.camera.x = cx - w.x * state.camera.scale;
    state.camera.y = cy - w.y * state.camera.scale;
});

document.getElementById('zoom-out').addEventListener('click', () => {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const w = screenToWorld(cx, cy);
    state.camera.scale = Math.max(0.1, state.camera.scale / 1.2);
    state.camera.x = cx - w.x * state.camera.scale;
    state.camera.y = cy - w.y * state.camera.scale;
});

document.getElementById('zoom-reset').addEventListener('click', () => {
    state.camera = { x: 0, y: 0, scale: 1 };
});

document.getElementById('clear').addEventListener('click', () => {
    eda.sys_Dialog.showConfirmationMessage(
        '确定清空所有模块？',
        '确认清空',
        '确定',
        '取消',
        (confirmed) => {
            if (confirmed) {
                state.blocks = [];
                state.connections = [];
                state.selected = null;
                state.nextId = 1;
            }
        }
    );
});

function topoSort() {
    const inDeg = new Map(state.blocks.map((b) => [b.id, 0]));
    for (const c of state.connections) inDeg.set(c.toId, (inDeg.get(c.toId) || 0) + 1);
    const queue = state.blocks.filter((b) => inDeg.get(b.id) === 0).map((b) => b.id);
    const order = [];
    while (queue.length) {
        const id = queue.shift();
        order.push(id);
        for (const c of state.connections) {
            if (c.fromId === id) {
                const deg = inDeg.get(c.toId) - 1;
                inDeg.set(c.toId, deg);
                if (deg === 0) queue.push(c.toId);
            }
        }
    }
    return order;
}

const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

const executionState = {
    running: false,
    order: [],
    outputs: new Map(),
    outputPaths: new Map(),
    currentIndex: 0,
    pendingArraySelection: null,
    selectionHistory: []
};

function isThenable(value) {
    return value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
}

async function resolveExecutionValue(value) {
    return isThenable(value) ? await value : value;
}

function getValueAtPath(obj, path) {
    if (!path || path === '$') return obj;
    const parts = path.replace(/^\$\.?/, '').split(/\.|\[|\]/).filter(p => p !== '');
    let current = obj;
    for (const part of parts) {
        if (current === null || current === undefined) return undefined;
        current = current[part];
    }
    return current;
}

function stringifyForDisplay(value, space = 0) {
    if (value === undefined) return 'undefined';
    if (typeof value === 'function') return '[Function]';
    try {
        const json = JSON.stringify(value, null, space);
        return json === undefined ? String(value) : json;
    } catch (err) {
        return `[Unserializable: ${err.message}]`;
    }
}

function pathToAccessor(path) {
    if (!path || path === '$') return '';
    return path.replace(/^\$/, '');
}

function getOutputExpression(blockId, portIndex = 0) {
    const base = `block_${blockId}_${portIndex}`;
    const outputPaths = executionState.outputPaths.get(blockId) || [];
    const selectedPath = outputPaths[portIndex] || '$';
    return `${base}${pathToAccessor(selectedPath)}`;
}

document.getElementById('run').addEventListener('click', async () => {
    if (executionState.running) {
        eda.sys_Message.showToastMessage('工作流正在运行中...', 'info', 1);
        return;
    }

    executionState.running = true;
    executionState.order = topoSort();
    executionState.outputs = new Map();
    executionState.outputPaths = new Map();
    executionState.currentIndex = 0;
    executionState.pendingArraySelection = null;
    executionState.selectionHistory = [];

    await executeWorkflow();
});

async function executeWorkflow() {
    // Single-pass execution: each block runs only after upstream values are fully resolved.
    while (executionState.currentIndex < executionState.order.length) {
        const id = executionState.order[executionState.currentIndex];
        const block = state.blocks.find((b) => b.id === id);

        if (!block) {
            executionState.currentIndex++;
            continue;
        }

        const args = {};
        const inputNames = block.inputs.map(portName);

        for (let i = 0; i < block.inputs.length; i++) {
            const conn = state.connections.find((c) => c.toId === id && c.toPort === i);
            if (conn) {
                if (!executionState.outputs.has(conn.fromId)) {
                    throw new Error(`Upstream block ${conn.fromId} has not finished yet`);
                }

                const fromOutputs = executionState.outputs.get(conn.fromId) || [];
                if (conn.fromPort >= fromOutputs.length) {
                    throw new Error(`Upstream output port ${conn.fromPort} has no data`);
                }

                args[inputNames[i]] = await resolveExecutionValue(fromOutputs[conn.fromPort]);
            } else {
                args[inputNames[i]] = undefined;
            }
        }

        try {
            const fn = new AsyncFunction(...inputNames, block.code);
            const result = await fn(...inputNames.map((k) => args[k]));
            executionState.outputs.set(id, block.outputs.length ? [result] : []);
            executionState.outputPaths.set(id, block.outputs.length ? ['$'] : []);

            if ((Array.isArray(result) || (result && typeof result === 'object')) && hasDownstreamDependents(id)) {
                if (block.savedPath) {
                    const selectedValue = getValueAtPath(result, block.savedPath);
                    executionState.outputs.set(id, [selectedValue]);
                    executionState.outputPaths.set(id, [block.savedPath]);
                    executionState.selectionHistory.push({
                        blockId: id,
                        blockTitle: block.title,
                        data: result,
                        previousPath: block.savedPath
                    });
                    executionState.currentIndex++;
                    continue;
                }
                executionState.pendingArraySelection = {
                    blockId: id,
                    blockTitle: block.title,
                    data: result,
                    selectedPath: '$'
                };
                showArraySelectionModal();
                return;
            }

            executionState.currentIndex++;
        } catch (err) {
            console.error(`Block "${block.title}" error:`, err);
            eda.sys_Message.showToastMessage(`模块 "${block.title}" 出错: ${err.message}`, 'info', 1);
            executionState.running = false;
            return;
        }
    }

    executionState.running = false;
    eda.sys_Message.showToastMessage('工作流执行完成', 'info', 1);
}

function hasDownstreamDependents(blockId) {
    return state.connections.some(c => c.fromId === blockId);
}

function renderTreeNode(value, path, parentEl, depth = 0) {
    const nodeDiv = document.createElement('div');
    nodeDiv.style.marginLeft = (depth * 16) + 'px';
    nodeDiv.setAttribute('data-tree-node', '');
    nodeDiv.setAttribute('data-path', path);

    const isObject = value && typeof value === 'object' && !Array.isArray(value);
    const isArray = Array.isArray(value);
    const isLeaf = !isObject && !isArray;

    const nodeHeader = document.createElement('div');
    nodeHeader.setAttribute('data-node-header', '');
    nodeHeader.style.cssText = 'display: flex; align-items: center; padding: 4px 6px; cursor: pointer; border-radius: 4px; transition: background 0.15s; user-select: none;';

    const isSelected = executionState.pendingArraySelection.selectedPath === path;
    if (isSelected) {
        nodeHeader.style.background = '#3e3d32';
        nodeHeader.style.color = '#66d9ef';
        nodeHeader.style.fontWeight = 'bold';
    }

    nodeHeader.addEventListener('mouseenter', () => {
        if (!isSelected) nodeHeader.style.background = '#31322c';
    });
    nodeHeader.addEventListener('mouseleave', () => {
        if (!isSelected) nodeHeader.style.background = 'transparent';
    });

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
        const valStr = stringifyForDisplay(value);
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
                    renderTreeNode(val, childPath, childrenDiv, depth + 1);
                });
                childrenRendered = true;
            }
        });

        nodeHeader.addEventListener('click', (e) => {
            if (e.target === expandIconEl || expandIconEl.contains(e.target)) {
                return;
            }
            e.stopPropagation();
            updateArraySelection(path);
        });

        nodeDiv.appendChild(childrenDiv);
    } else {
        nodeHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            updateArraySelection(path);
        });
    }

    parentEl.appendChild(nodeDiv);
}

function updateArraySelection(path) {
    const preview = document.getElementById('array-selection-preview');
    const pathDisplay = document.getElementById('array-selection-path');
    const tree = document.getElementById('array-selection-tree');

    executionState.pendingArraySelection.selectedPath = path;
    pathDisplay.textContent = path;

    const { data } = executionState.pendingArraySelection;
    const selectedValue = getValueAtPath(data, path);
    preview.value = stringifyForDisplay(selectedValue, 2);

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

function showArraySelectionModal() {
    const modal = document.getElementById('array-selection-modal');
    const title = document.getElementById('array-selection-title');
    const tree = document.getElementById('array-selection-tree');
    const preview = document.getElementById('array-selection-preview');
    const pathDisplay = document.getElementById('array-selection-path');

    const { blockTitle, data, selectedPath } = executionState.pendingArraySelection;

    title.textContent = `选择要传递的值 - ${blockTitle}`;
    pathDisplay.textContent = selectedPath;

    tree.innerHTML = '';
    renderTreeNode(data, '$', tree, 0);

    const selectedValue = getValueAtPath(data, selectedPath);
    preview.value = stringifyForDisplay(selectedValue, 2);

    const backBtn = document.getElementById('array-selection-back');
    backBtn.disabled = executionState.selectionHistory.length === 0;
    backBtn.style.opacity = backBtn.disabled ? '0.4' : '1';
    backBtn.style.cursor = backBtn.disabled ? 'not-allowed' : 'pointer';

    modal.classList.add('show');
}

const arraySelectionModal = document.getElementById('array-selection-modal');

document.addEventListener('click', async (e) => {
    const target = e.target.closest('[id]');
    if (!target) return;

    if (target.id === 'array-selection-confirm') {
        if (!executionState.pendingArraySelection) return;

        const { blockId, data, selectedPath } = executionState.pendingArraySelection;
        const block = state.blocks.find(b => b.id === blockId);
        const selectedValue = getValueAtPath(data, selectedPath);

        executionState.selectionHistory.push({
            blockId,
            blockTitle: executionState.pendingArraySelection.blockTitle,
            data,
            previousPath: selectedPath
        });

        if (block) block.savedPath = selectedPath;

        executionState.outputs.set(blockId, [selectedValue]);
        executionState.outputPaths.set(blockId, [selectedPath]);

        arraySelectionModal.classList.remove('show');
        executionState.pendingArraySelection = null;
        executionState.currentIndex++;

        await executeWorkflow();
    }

    if (target.id === 'array-selection-back') {
        if (executionState.selectionHistory.length === 0) return;

        const prev = executionState.selectionHistory.pop();

        executionState.outputs.delete(prev.blockId);
        executionState.outputPaths.delete(prev.blockId);
        executionState.currentIndex--;

        executionState.pendingArraySelection = {
            blockId: prev.blockId,
            blockTitle: prev.blockTitle,
            data: prev.data,
            selectedPath: prev.previousPath
        };
        showArraySelectionModal();
    }

    if (target.id === 'array-selection-cancel') {
        arraySelectionModal.classList.remove('show');
        executionState.running = false;
        executionState.pendingArraySelection = null;
    }
});

arraySelectionModal.addEventListener('click', (e) => {
    if (e.target === arraySelectionModal) {
        arraySelectionModal.classList.remove('show');
        executionState.running = false;
        executionState.pendingArraySelection = null;
    }
});

// Code View
const codeViewModal = document.getElementById('code-view-modal');
const codeViewEditor = document.getElementById('code-view-editor');

function generateWorkflowCode() {
    const order = topoSort();
    let code = '// Generated Workflow Code\n';
    code += '(async function() {\n';

    for (const id of order) {
        const block = state.blocks.find(b => b.id === id);
        if (!block) continue;

        code += `\n  // Block: ${block.title}\n`;
        const inputNames = block.inputs.map(portName);

        // Generate variable declarations for inputs
        for (let i = 0; i < block.inputs.length; i++) {
            const conn = state.connections.find(c => c.toId === id && c.toPort === i);
            if (conn) {
                const fromBlock = state.blocks.find(b => b.id === conn.fromId);
                const outputName = fromBlock ? portName(fromBlock.outputs[conn.fromPort]) : 'unknown';
                code += `  // ${inputNames[i]} = ${outputName} from "${fromBlock?.title}"\n`;
            }
        }

        // Add block code
        const blockCode = block.code.split('\n').map(line => '  ' + line).join('\n');
        code += blockCode + '\n';
    }

    code += '})();\n';
    return code;
}

document.getElementById('view-code').addEventListener('click', () => {
    if (state.blocks.length === 0) {
        eda.sys_Message.showToastMessage('没有模块可以生成代码', 'info', 1);
        return;
    }
    codeViewEditor.value = generateWorkflowCode();
    codeViewModal.classList.add('show');
});

document.getElementById('code-view-close').addEventListener('click', () => {
    codeViewModal.classList.remove('show');
});

document.getElementById('code-view-copy').addEventListener('click', () => {
    codeViewEditor.select();
    document.execCommand('copy');
    eda.sys_Message.showToastMessage('代码已复制到剪贴板', 'info', 1);
});

codeViewModal.addEventListener('click', (e) => {
    if (e.target === codeViewModal) {
        codeViewModal.classList.remove('show');
    }
});

// Export
document.getElementById('export').addEventListener('click', () => {
    const data = {
        version: 1,
        blocks: state.blocks.map(b => ({
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
            rotation: b.rotation || 0,
            savedPath: b.savedPath
        })),
        connections: state.connections,
        nextId: state.nextId
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
});

// Import
document.getElementById('import').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);

                if (!data.version || !data.blocks || !data.connections) {
                    eda.sys_Message.showToastMessage('无效的工作流文件格式', 'info', 1);
                    return;
                }

                if (state.blocks.length > 0) {
                    eda.sys_Dialog.showConfirmationMessage(
                        '导入将清空当前工作流，是否继续？',
                        '确认导入',
                        '继续',
                        '取消',
                        (confirmed) => {
                            if (confirmed) {
                                state.blocks = data.blocks;
                                state.connections = data.connections;
                                state.nextId = data.nextId || state.blocks.length + 1;
                                state.selected = null;
                                state.camera = { x: 0, y: 0, scale: 1 };

                                eda.sys_Message.showToastMessage('工作流导入成功', 'info', 1);
                            }
                        }
                    );
                } else {
                    state.blocks = data.blocks;
                    state.connections = data.connections;
                    state.nextId = data.nextId || state.blocks.length + 1;
                    state.selected = null;
                    state.camera = { x: 0, y: 0, scale: 1 };

                    eda.sys_Message.showToastMessage('工作流导入成功', 'info', 1);
                }
            } catch (err) {
                eda.sys_Message.showToastMessage('导入失败: ' + err.message, 'info', 1);
            }
        };
        reader.readAsText(file);
    };
    input.click();
});

initBlockDefs();
populateBlockMenu();
requestAnimationFrame(render);

// Listen for editor changes to detect API method insertions from common code panel
if (typeof editor !== 'undefined' && editor.session) {
    editor.session.on('change', function(delta) {
        if (delta.action === 'insert' && delta.lines && delta.lines.length > 0) {
            const text = delta.lines.join('\n');
            // Match pattern like eda.xxx.xxx or eda.xxx
            const match = text.match(/^eda\.[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*$/);
            if (match) {
                const methodPath = match[0];
                // Find the edcode item for this method
                const edcodeItem = window.edcode && window.edcode.find(item => item.methodPath === methodPath);
                if (edcodeItem) {
                    // Remove the inserted text from editor
                    const Range = ace.require('ace/range').Range;
                    const range = new Range(
                        delta.start.row,
                        delta.start.column,
                        delta.end.row,
                        delta.end.column
                    );
                    editor.session.remove(range);

                    // Create block from method
                    createBlockFromMethod(methodPath, edcodeItem);
                }
            }
        }
    });
}

// Expose API for parent window (optional, for future use)
window.workflowCanvas = {
    createBlockFromMethod: createBlockFromMethod
};
