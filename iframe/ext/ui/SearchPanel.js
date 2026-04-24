(function() {
    'use strict';

    window.WorkflowApp = window.WorkflowApp || {};

    class SearchPanel {
        constructor(registry, onSelect) {
            this.registry = registry;
            this.onSelect = onSelect;
            this.searchInput = document.getElementById('search-blocks');
            this.searchPanel = document.getElementById('search-panel');
            this.searchResults = document.getElementById('search-results');

            this.searchInput.addEventListener('input', (e) => this.search(e.target.value));
            this.searchInput.addEventListener('focus', (e) => {
                if (e.target.value.length >= 1) {
                    this.search(e.target.value);
                }
            });
            document.addEventListener('click', (e) => {
                if (!this.searchPanel.contains(e.target) && e.target !== this.searchInput) {
                    this.searchPanel.classList.remove('show');
                }
            });
        }

        search(query) {
            if (!query || query.length < 1) {
                this.searchPanel.classList.remove('show');
                return;
            }

            const results = this.registry.search(query);
            this.searchResults.innerHTML = '';
            results.slice(0, 50).forEach(({ type, metadata }) => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.innerHTML = `
                    <div class="search-result-title">${metadata.title}</div>
                    ${metadata.fullPath ? `<div class="search-result-path">${metadata.fullPath}</div>` : ''}
                    ${metadata.description ? `<div class="search-result-desc">${metadata.description}</div>` : ''}
                `;
                item.onclick = () => {
                    this.onSelect(type);
                    this.searchInput.value = '';
                    this.searchPanel.classList.remove('show');
                };
                this.searchResults.appendChild(item);
            });

            if (results.length === 0) {
                this.searchResults.innerHTML = '<div class="search-result-item"><div class="search-result-desc">未找到匹配的模块</div></div>';
            }

            this.searchPanel.classList.add('show');
        }
    }

    window.WorkflowApp.SearchPanel = SearchPanel;
})();
