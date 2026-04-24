(function() {
    'use strict';

    window.WorkflowApp = window.WorkflowApp || {};

    const Helpers = {
        portName(port) {
            return typeof port === 'string' ? port : port.name;
        },

        portDesc(port) {
            return typeof port === 'string' ? '' : (port.description || '');
        },

        truncateText(ctx, text, maxWidth) {
            if (ctx.measureText(text).width <= maxWidth) return text;
            const ellipsis = '...';
            const ellipsisW = ctx.measureText(ellipsis).width;
            let end = text.length;
            while (end > 0 && ctx.measureText(text.slice(0, end)).width + ellipsisW > maxWidth) end--;
            return text.slice(0, end) + ellipsis;
        },

        getCategoryColor(category) {
            const colors = {
                'pcb_Component': '#66d9ef',
                'sch_Component': '#a6e22e',
                'pcb_Board': '#ae81ff',
                'sch_Board': '#f92672',
                'sys_Message': '#e6db74',
                'sys_Storage': '#fd971f',
            };
            return colors[category] || '#75715e';
        },

        generateBlockCode(path, inputNames, hasReturn) {
            const args = inputNames.join(', ');
            if (hasReturn) {
                return `const result = await ${path}(${args});\nreturn result;`;
            } else {
                return `await ${path}(${args});`;
            }
        },

        getValueAtPath(obj, path) {
            if (!path || path === '$') return obj;
            const parts = path.replace(/^\$\.?/, '').split(/\.|\[|\]/).filter(p => p !== '');
            let current = obj;
            for (const part of parts) {
                if (current === null || current === undefined) return undefined;
                current = current[part];
            }
            return current;
        },

        stringifyForDisplay(value, space = 0) {
            if (value === undefined) return 'undefined';
            if (typeof value === 'function') return '[Function]';
            try {
                const json = JSON.stringify(value, null, space);
                return json === undefined ? String(value) : json;
            } catch (err) {
                return `[Unserializable: ${err.message}]`;
            }
        },

        isThenable(value) {
            return value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
        },

        async resolveExecutionValue(value) {
            return this.isThenable(value) ? await value : value;
        }
    };

    window.WorkflowApp.Helpers = Helpers;
})();
