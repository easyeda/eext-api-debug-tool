# Ace Code Editor for EDA 编辑进化

一个轻量级、可嵌入的 JavaScript 代码编辑器，基于 [Ace Editor](https://ace.c9.io/) 构建，专为 **EDA（Embedded Development Assistant）** 环境设计。支持语法高亮、智能补全、自定义词库和一键运行代码。

---

## 中文联想支持

![alt text](images/效果图1.png)

## AI智能注释

![alt text](images/效果图2.png)

## AI智能报错分析

![alt text](images/效果图4.png)

## 两套主题流畅切换

![alt text](images/image.png)

## 通过npm run dev 构建全新的提示词工程

## 特性

- **Monokai 主题**：护眼暗色风格，与开发者习惯一致
- **JavaScript 语法高亮 & 智能补全**
- **左侧可滚动功能侧边栏**（预留扩展位）
- **“运行”按钮**：直接 `eval()` 执行编辑器中的代码
- **自定义词库支持**：可注入内部 API 实现智能提示
- **零依赖动态加载**：所有资源静态引用，无需网络请求
- **响应式布局**：适配 iframe 嵌入场景

## 目录结构

```
/iframe/
└── script/
    └── Ace_Editor/          # Ace 核心资源（必须部署到此路径）
        ├── ace.js
        ├── ext-language_tools.js
        ├── mode-javascript.js
        ├── theme-monokai.js
        └── worker-javascript.js (可选)
└── main/
    └── index.html           # 本编辑器主页面
```

确保 `Ace_Editor/` 文件夹已完整上传至 EDA 服务器的 `/iframe/script/` 目录。

## 自定义词库（API 智能提示）

在 `index.html` 的初始化脚本中添加自定义补全规则：

```js
// 示例：添加词库
editor.completers.push({
	getCompletions: function (editor, session, pos, prefix, callback) {
		var completions = [
			{ name: 'myFunction', value: 'myFunction', score: 1000, meta: 'custom' },
			// ... 其他补全项
		];
		callback(null, completions);
	},
});
```

支持动态更新词库，适用于内部 SDK 或平台 API。

## AI 后端支持配置教程

要启用 AI 智能补全、注释生成及错误分析等高级功能，您需要配置本地 AI 后端服务：

1. **下载 ECT（EDA Code Tool）拓展包**

    访问 [GitHub Release 页面](https://github.com/easyeda/eext-api-debug-tool/releases/tag/AI)，下载最新 `.exe` 文件（Windows）或对应平台的可执行文件。

2. **运行 ECT 工具**

    双击运行下载的 `.exe` 文件，将自动启动本地 AI 代理服务（默认监听 `http://127.0.0.1:5000`）。

3. **配置 OneAPI 令牌与模型**

    首次运行时，工具会提示您在命令行中输入以下信息：

    - **OneAPI 地址**（例如：`http://localhost:5000/v1`）
    - **访问令牌（API Key）**
    - **默认模型名称**（如 `gpt-4o`, `claude-3-5-sonnet`, `qwen-max` 等）

    提示：ECT 支持统一管理多个模型，只需配置一次 OneAPI 接口即可切换使用不同模型。

4. **在 EDA 编辑器中启用 AI 功能**

    确保 EDA 内嵌的 Ace 编辑器能访问 `http://127.0.0.1:5000`，并在初始化时启用 AI 补全模块（通常通过 `cc` 模式调用）。

注意：AI 功能依赖本地运行的 ECT 服务，请勿关闭命令行窗口。如需后台运行，可将其注册为系统服务或使用 `nohup`（Linux/macOS）。

## 开发与扩展

### 添加新功能按钮

在左侧侧边栏动态插入按钮（可在编辑器中运行以下代码测试）：

```js
const li = document.createElement('li');
const btn = Object.assign(document.createElement('button'), {
	textContent: '保存',
	style: 'width:80px;height:36px;background:#272822;color:white;border:1px solid #666;border-radius:4px;font-size:14px;cursor:pointer;',
});
btn.onclick = () => eda.sys_Message.showToastMessage('假装保存了代码', 'info', 1);
document.querySelector('#sidebar ul').appendChild(li).appendChild(btn);
```

### 扩展建议

- 添加 **清空**、**格式化**、**导出** 按钮
- 集成 `localStorage` 实现代码自动保存
- 替换 `eval()` 为沙箱执行环境（如 `Function` 构造器）

## 注意事项

- **`eval()` 安全风险**：仅限可信环境使用（如内部 EDA 工具）
- **Worker 已禁用**：避免 EDA iframe 中的 CSP 限制问题
- **路径敏感**：资源路径必须为 `/iframe/script/Ace_Editor/xxx.js`（区分大小写）

## 许可证

本项目基于 [Ace Editor](https://github.com/ajaxorg/ace) 构建，遵循其开源协议（BSD License）。  
UI 和集成代码可自由用于内部开发。

Made with ❤️ for EDA developers  
Happy Coding!
