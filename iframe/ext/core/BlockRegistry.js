(function () {
	'use strict';

	window.WorkflowApp = window.WorkflowApp || {};

	class BlockRegistry {
		constructor() {
			this.blockTypes = new Map();
			this.categories = new Map();
		}

		register(BlockClass) {
			const metadata = BlockClass.getMetadata();
			this.blockTypes.set(metadata.type, BlockClass);

			if (!this.categories.has(metadata.category)) {
				this.categories.set(metadata.category, []);
			}
			this.categories.get(metadata.category).push(metadata.type);
		}

		get(type) {
			return this.blockTypes.get(type);
		}

		has(type) {
			return this.blockTypes.has(type);
		}

		getMetadata(type) {
			const BlockClass = this.get(type);
			return BlockClass ? BlockClass.getMetadata() : null;
		}

		getAllTypes() {
			return Array.from(this.blockTypes.keys());
		}

		getAllMetadata() {
			const result = {};
			this.blockTypes.forEach((BlockClass, type) => {
				result[type] = BlockClass.getMetadata();
			});
			return result;
		}

		getCategories() {
			const result = {};
			this.categories.forEach((types, category) => {
				result[category] = types;
			});
			return result;
		}

		search(query) {
			if (!query || query.length < 1) return [];
			const lowerQuery = query.toLowerCase();
			const results = [];

			this.blockTypes.forEach((BlockClass, type) => {
				const metadata = BlockClass.getMetadata();
				const titleMatch = metadata.title.toLowerCase().includes(lowerQuery);
				const descMatch = metadata.description && metadata.description.toLowerCase().includes(lowerQuery);
				const pathMatch = metadata.fullPath && metadata.fullPath.toLowerCase().includes(lowerQuery);

				if (titleMatch || descMatch || pathMatch) {
					results.push({
						type,
						metadata,
						score: titleMatch ? 3 : pathMatch ? 2 : 1,
					});
				}
			});

			return results.sort((a, b) => b.score - a.score);
		}
	}

	window.WorkflowApp.BlockRegistry = BlockRegistry;
})();
