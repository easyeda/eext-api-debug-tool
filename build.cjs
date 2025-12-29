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
  console.error('无法读取 index.d.ts，请确认 @jlceda/pro-api-types 已安装。');
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

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();

  // 捕获 class 声明（即使没有 { 在同一行）
  if (line.startsWith('declare class ')) {
    const match = line.match(/declare\s+class\s+(\w+)/);
    if (match) {
      currentClass = match[1];
      continue;
    }
  }

  // 离开当前 class
  if (currentClass && line === '}') {
    currentClass = null;
    continue;
  }

  if (!currentClass) continue;

  // 跳过被排除的成员
  if (line.startsWith('/* Excluded from this release type:')) {
    continue;
  }

  // 只处理标准 JSDoc 注释块（以 /** 开始）
  if (line === '/**') {
    let description = '';
    const params = [];
    let j = i + 1;

    // 解析整个注释块直到 */
    while (j < lines.length) {
      const l = lines[j].trim();
      if (l === '*/') {
        break;
      }

      // 提取主描述：第一个非 @ 标签的 * 行
      if (l.startsWith('*') && !l.startsWith('* @')) {
        const text = l.slice(1).trim();
        if (text && !description) {
          description = text;
        }
      }

      // 提取 @param 行：格式为 * @param name - description
      const paramMatch = l.match(/^\*\s*@param\s+([a-zA-Z_$][\w$]*)\s*-\s*(.+)$/);
      if (paramMatch) {
        let desc = paramMatch[2].trim();
        // 转义单引号，避免 JS 字符串语法错误
        desc = desc.replace(/'/g, "\\'").replace(/\r/g, '');
        params.push({
          name: paramMatch[1],
          description: desc,
        });
      }

      j++;
    }

    // 方法定义应在 */ 的下一行
    const methodLineIndex = j + 1;
    if (methodLineIndex < lines.length) {
      const methodLine = lines[methodLineIndex];
      // 匹配方法名：允许 async，方法名后紧跟 (
      const methodMatch = methodLine.match(/^\s*(?:async\s+)?(\w+)\s*\(/);
      if (methodMatch) {
        const methodName = methodMatch[1];
        const classNameLower = formatClassName(currentClass);
        results.push({
          methodPath: `eda.${classNameLower}.${methodName}`,
          description: description.replace(/'/g, "\\'"),
          parameters: params,
        });

        // 跳过已处理的方法行
        i = methodLineIndex;
      }
    }

    // 跳过整个注释块
    i = j;
    continue;
  }
}

// 构建输出字符串
let outputStr = 'edcode = [\n';
results.forEach(item => {
  outputStr += '\t{\n';
  outputStr += `\t\t'methodPath': '${item.methodPath}',\n`;
  outputStr += `\t\t'description': '${item.description}',\n`;
  outputStr += '\t\t\'parameters\': [\n';
  item.parameters.forEach(param => {
    outputStr += `\t\t\t{ 'name': '${param.name}', 'description': '${param.description}' },\n`;
  });
  outputStr += '\t\t],\n';
  outputStr += '\t},\n';
});
outputStr += '];\n'; // 注意结尾加 ; 更安全

fs.writeFileSync(outputPath, outputStr, 'utf8');

console.log(`成功生成 ${results.length} 个方法条目到 ${outputPath}`);