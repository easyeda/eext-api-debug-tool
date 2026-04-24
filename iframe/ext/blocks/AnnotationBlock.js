(function() {
    'use strict';

    window.WorkflowApp = window.WorkflowApp || {};

    class AnnotationBlock extends window.WorkflowApp.BaseBlock {
        constructor(data = {}) {
            super(data);
            this.annotationText = data.annotationText || '';
        }

        static getMetadata() {
            return {
                type: 'annotation',
                title: '注释',
                category: '基础',
                color: '#75715e',
                inputs: [],
                outputs: [],
                code: '',
                description: '添加文本注释'
            };
        }

        async execute(inputs) {
            // Annotations don't execute
            return null;
        }

        serialize() {
            const base = super.serialize();
            base.annotationText = this.annotationText;
            return base;
        }
    }

    window.WorkflowApp.AnnotationBlock = AnnotationBlock;
})();
