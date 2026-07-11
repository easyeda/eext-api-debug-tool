const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// 1. 读取 extension.json 版本号
const extJson = JSON.parse(fs.readFileSync(path.join(root, 'extension.json'), 'utf8'));
const version = extJson.version;

// 2. 读取 index.html
const htmlPath = path.join(root, 'iframe', 'main', 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// 3. 替换 title 中的版本号
const oldTitle = html.match(/<title>.*?<\/title>/)[0];
const newTitle = `<title>Ace Editor - EDA V${version}</title>`;

if (oldTitle !== newTitle) {
	html = html.replace(oldTitle, newTitle);
	fs.writeFileSync(htmlPath, html, 'utf8');
	console.log(`[sync-version] index.html title: "${oldTitle}" → "${newTitle}"`);
} else {
	console.log(`[sync-version] index.html title already up to date: "${oldTitle}"`);
}
