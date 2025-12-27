const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'node_modules', '@jlceda', 'pro-api-types', 'index.d.ts');
const outputPath = path.join(__dirname, 'iframe', 'script', 'eda_coder', 'EDA_Codes.js');

const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

let content;
try {
  content = fs.readFileSync(inputPath, 'utf8');
} catch (err) {
  console.error('❌ 无法读取 index.d.ts，请确认 @jlceda/pro-api-types 已安装。');
  process.exit(1);
}

function formatClassName(className) {
  const parts = className.split('_');
  if (parts.length === 0) return className.toLowerCase();
  parts[0] = parts[0].toLowerCase();
  return parts.join('_');
}

const lines = content.split('\n');
const results = [];
let currentClass = null;
let pendingDescription = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  // ✅ 改进：只要 declare class XXX 出现，且该行有 {，就捕获
  if (line.startsWith('declare class ')) {
    const match = line.match(/declare\s+class\s+(\w+)/);
    if (match && line.includes('{')) {
      currentClass = match[1];
      pendingDescription = null;
      continue;
    }
  }

  if (currentClass && line === '}') {
    currentClass = null;
    pendingDescription = null;
    continue;
  }

  if (!currentClass) continue;

  if (line.startsWith('/* Excluded from this release type:')) {
    continue;
  }

  if (line === '/**') {
    let desc = '';
    let j = i + 1;
    while (j < lines.length) {
      const l = lines[j].trim();
      if (l === '*/') break;
      if (l.startsWith('*') && !l.startsWith('* @')) {
        const text = l.slice(1).trim();
        if (text && !desc) {
          desc = text;
        }
      }
      j++;
    }
    pendingDescription = desc;
    i = j;
    continue;
  }

  const methodMatch = line.match(/^\s*(?:async\s+)?(\w+)\s*\(/);
  if (methodMatch && pendingDescription !== null) {
    const methodName = methodMatch[1];
    const classNameLower = formatClassName(currentClass);
    results.push({
      methodPath: `eda.${classNameLower}.${methodName}`,
      description: pendingDescription,
    });
    pendingDescription = null;
  }

  if (pendingDescription !== null && line !== '' && !line.startsWith('*')) {
    pendingDescription = null;
  }
}

// 手动构建格式
let outputStr = 'edcode = [\n';
results.forEach(item => {
  outputStr += '\t{\n';
  outputStr += `\t\t'methodPath': '${item.methodPath}',\n`;
  outputStr += `\t\t'description': '${item.description}',\n`;
  outputStr += '\t},\n';
});
outputStr += ']\n';

fs.writeFileSync(outputPath, outputStr, 'utf8');

console.log(`✅ 成功生成 ${results.length} 个方法条目`);