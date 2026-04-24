(function() {
    'use strict';

    window.WorkflowApp = window.WorkflowApp || {};

    class EventBus {
        constructor() {
            this.listeners = new Map();
        }

        on(event, callback) {
            if (!this.listeners.has(event)) {
                this.listeners.set(event, []);
            }
            this.listeners.get(event).push(callback);
        }

        off(event, callback) {
            if (!this.listeners.has(event)) return;
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }

        emit(event, data) {
            if (!this.listeners.has(event)) return;
            const callbacks = this.listeners.get(event);
            callbacks.forEach(callback => {
                try {
                    callback(data);
                } catch (err) {
                    console.error(`EventBus error in ${event}:`, err);
                }
            });
        }

        clear() {
            this.listeners.clear();
        }
    }

    window.WorkflowApp.EventBus = EventBus;
})();
