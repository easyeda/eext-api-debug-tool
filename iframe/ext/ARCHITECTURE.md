# Workflow Canvas - 模块化架构文档

## 概述

工作流画布已从单一的 2878 行 `workflow.js` 文件重构为模块化架构，包含 25+ 个独立文件。新架构实现了关注点分离、低耦合、高内聚，并提供了统一的扩展标准。

## 架构层次

```
WorkflowEngine (主协调器)
├── Core Layer (核心层)
│   ├── EventBus - 事件总线，解耦组件通信
│   ├── CanvasState - 状态管理，观察者模式
│   ├── BlockRegistry - 插件式模块注册系统
│   └── ExecutionEngine - 拓扑排序与异步执行
├── Rendering Layer (渲染层)
│   ├── CanvasRenderer - 主渲染循环
│   ├── BlockRenderer - 模块绘制
│   ├── ConnectionRenderer - 连接线绘制
│   └── GridRenderer - 背景网格
├── UI Layer (UI层)
│   ├── PropertiesPanel - 属性面板
│   ├── Toolbar - 工具栏
│   ├── SearchPanel - 搜索面板
│   ├── ModalManager - 模态对话框管理
│   └── ContextMenu - 右键菜单
├── Block Layer (模块层)
│   ├── BaseBlock - 抽象基类
│   ├── CustomBlock - 自定义代码模块
│   ├── FunctionBlock - 函数模块
│   ├── VariableBlock - 变量模块
│   ├── LoopBlock - 循环模块
│   └── ApiBlock - EDA API 模块工厂
├── Interaction Layer (交互层)
│   └── InteractionController - 鼠标/键盘交互
├── Serialization Layer (序列化层)
│   ├── WorkflowSerializer - 导入/导出
│   └── CodeGenerator - 代码生成
└── Utils (工具层)
    ├── Geometry - 几何计算
    └── Helpers - 辅助函数
```

## 文件结构

```
iframe/ext/
├── workflow.html           # 入口 HTML
├── workflow.css            # 样式（未改动）
├── workflow.legacy.js      # 原始单体文件备份
├── WorkflowEngine.js       # 主协调器
├── core/
│   ├── EventBus.js
│   ├── CanvasState.js
│   ├── BlockRegistry.js
│   └── ExecutionEngine.js
├── rendering/
│   ├── CanvasRenderer.js
│   ├── BlockRenderer.js
│   ├── ConnectionRenderer.js
│   └── GridRenderer.js
├── ui/
│   ├── PropertiesPanel.js
│   ├── Toolbar.js
│   ├── SearchPanel.js
│   ├── ModalManager.js
│   └── ContextMenu.js
├── blocks/
│   ├── BaseBlock.js
│   ├── CustomBlock.js
│   ├── FunctionBlock.js
│   ├── VariableBlock.js
│   ├── LoopBlock.js
│   └── ApiBlock.js
├── interaction/
│   └── InteractionController.js
├── serialization/
│   ├── WorkflowSerializer.js
│   └── CodeGenerator.js
└── utils/
    ├── Geometry.js
    └── Helpers.js
```

## 核心设计模式

### 1. 命名空间模式

所有类挂载到 `window.WorkflowApp` 命名空间：

```javascript
(function() {
    'use strict';
    window.WorkflowApp = window.WorkflowApp || {};
    
    class MyClass {
        // 实现
    }
    
    window.WorkflowApp.MyClass = MyClass;
})();
```

### 2. 事件驱动通信

组件通过 `EventBus` 解耦通信：

```javascript
// 发送事件
eventBus.emit('blockSelected', block);

// 监听事件
eventBus.on('blockSelected', (block) => {
    // 处理逻辑
});
```

### 3. 观察者模式

`CanvasState` 封装状态并通知观察者：

```javascript
state.addBlock(block);  // 自动触发 'blockAdded' 和 'stateChanged' 事件
```

### 4. 插件式注册

模块类型通过 `BlockRegistry` 注册：

```javascript
registry.register(CustomBlock);
```

## 添加新模块类型

### 步骤 1: 创建模块类

在 `blocks/` 目录创建新文件 `MyBlock.js`：

```javascript
(function() {
    'use strict';
    
    window.WorkflowApp = window.WorkflowApp || {};
    
    class MyBlock extends window.WorkflowApp.BaseBlock {
        static getMetadata() {
            return {
                type: 'myblock',              // 唯一标识符
                title: '我的模块',             // 显示名称
                category: '自定义',            // 分类
                color: '#ff6600',             // 颜色
                inputs: [                     // 输入端口
                    { name: 'input', description: '输入值' }
                ],
                outputs: [                    // 输出端口
                    { name: 'output', description: '输出值' }
                ],
                code: 'const output = input * 2;\nreturn output;',  // 默认代码
                description: '将输入值乘以2'   // 描述
            };
        }
        
        // 可选：自定义执行逻辑
        async execute(inputs) {
            // 自定义执行逻辑
            return await super.execute(inputs);
        }
    }
    
    window.WorkflowApp.MyBlock = MyBlock;
})();
```

### 步骤 2: 在 HTML 中加载

在 `workflow.html` 的 `<!-- Blocks -->` 部分添加：

```html
<script src="blocks/MyBlock.js"></script>
```

### 步骤 3: 注册模块

在 `WorkflowEngine.js` 的 `registerBuiltInBlocks()` 方法中添加：

```javascript
this.registry.register(window.WorkflowApp.MyBlock);
```

**完成！** 新模块类型现在可以通过搜索面板添加到画布。

## BaseBlock API

所有模块类必须继承 `BaseBlock` 并实现 `getMetadata()` 静态方法。

### 必需方法

```javascript
static getMetadata() {
    return {
        type: string,           // 唯一标识符
        title: string,          // 显示名称
        category: string,       // 分类（用于搜索）
        color: string,          // 十六进制颜色
        inputs: Array,          // 输入端口定义
        outputs: Array,         // 输出端口定义
        code: string,           // 默认代码
        description: string     // 描述文本
    };
}
```

### 可选方法

```javascript
// 自定义执行逻辑
async execute(inputs) {
    // inputs 是 { inputName: value } 对象
    // 返回输出值
}

// 自定义代码生成
generateCode() {
    return this.code;
}

// 自定义序列化
serialize() {
    return { /* 自定义数据 */ };
}
```

## 事件系统

### 核心事件

- `blockAdded` - 模块添加时触发
- `blockRemoved` - 模块删除时触发
- `blockSelected` - 模块选中时触发
- `blockDblClick` - 模块双击时触发
- `connectionAdded` - 连接添加时触发
- `stateChanged` - 状态改变时触发
- `contextMenu` - 右键菜单时触发
- `arraySelectionNeeded` - 需要数组选择时触发

### 监听事件

```javascript
eventBus.on('blockSelected', (block) => {
    console.log('选中模块:', block.title);
});
```

### 发送事件

```javascript
eventBus.emit('customEvent', { data: 'value' });
```

## 状态管理

### CanvasState API

```javascript
// 添加模块
state.addBlock(block);

// 删除模块
state.removeBlock(blockId);

// 添加连接
state.addConnection(connection);

// 清空输入连接
state.clearInputConnection(blockId, portIndex);

// 清空画布
state.clear();

// 获取模块
const block = state.getBlock(id);

// 获取选中模块
const selected = state.getSelectedBlock();

// 导出 JSON
const json = state.toJSON();

// 加载 JSON
state.loadFromJSON(data);
```

## 渲染系统

渲染系统采用分层架构：

1. **CanvasRenderer** - 主渲染循环，管理相机变换
2. **GridRenderer** - 绘制背景网格
3. **ConnectionRenderer** - 绘制贝塞尔曲线连接
4. **BlockRenderer** - 绘制模块（委托给 block.render()）

### 自定义渲染

模块可以实现自定义渲染：

```javascript
class MyBlock extends BaseBlock {
    render(ctx, x, y, w, h) {
        // 自定义绘制逻辑
    }
}
```

## 执行引擎

### 执行流程

1. **拓扑排序** - 确定执行顺序
2. **依赖解析** - 解析输入依赖
3. **异步执行** - 按顺序执行模块
4. **循环处理** - 特殊处理循环模块
5. **路径选择** - 处理复杂输出的路径选择

### 执行 API

```javascript
// 执行工作流
await executionEngine.execute();

// 继续执行（数组选择后）
await executionEngine.continueAfterArraySelection(selectedPath);

// 取消执行
executionEngine.cancelExecution();
```

## 序列化

### 导出工作流

```javascript
serializer.export();  // 下载 JSON 文件
```

### 导入工作流

```javascript
serializer.import(file, (data) => {
    state.loadFromJSON(data);
});
```

### 生成代码

```javascript
const code = codeGenerator.generate();
```

## 向后兼容

新架构完全兼容旧的 `.json` 工作流文件。序列化格式保持不变：

```json
{
    "version": 1,
    "blocks": [...],
    "connections": [...],
    "nextId": 123
}
```

## 性能优化

1. **按需渲染** - 仅在状态改变时重绘
2. **事件批处理** - 批量处理状态更新
3. **懒加载** - 模块类按需注册
4. **缓存计算** - 缓存模块宽度等计算结果

## 调试

### 访问全局对象

```javascript
// 主引擎
window.workflowEngine

// 状态
window.workflowEngine.state

// 注册表
window.workflowEngine.registry

// 事件总线
window.workflowEngine.eventBus
```

### 监听所有事件

```javascript
const originalEmit = window.workflowEngine.eventBus.emit;
window.workflowEngine.eventBus.emit = function(event, data) {
    console.log('Event:', event, data);
    return originalEmit.call(this, event, data);
};
```

## 迁移指南

### 从旧版本迁移

1. **备份** - 原始文件已保存为 `workflow.legacy.js`
2. **测试** - 使用现有 `.json` 文件测试兼容性
3. **回滚** - 如有问题，恢复 `workflow.legacy.js`

### 自定义修改迁移

如果你修改了原始 `workflow.js`：

1. 识别修改的功能
2. 找到对应的新模块文件
3. 将修改应用到新文件
4. 测试功能

## 最佳实践

1. **单一职责** - 每个类只负责一个功能
2. **事件通信** - 使用事件而非直接调用
3. **不可变性** - 避免直接修改状态
4. **类型安全** - 使用 JSDoc 注释
5. **错误处理** - 捕获并报告错误

## 故障排除

### 模块未显示

检查：
1. 文件是否在 HTML 中加载
2. 类是否正确注册
3. `getMetadata()` 是否返回有效数据

### 事件未触发

检查：
1. 事件名称是否正确
2. 监听器是否在事件触发前注册
3. EventBus 实例是否正确

### 渲染问题

检查：
1. Canvas 上下文是否正确传递
2. 相机变换是否正确应用
3. 渲染循环是否运行

## 未来扩展

新架构支持以下扩展：

1. **插件系统** - 动态加载外部模块
2. **主题系统** - 自定义颜色和样式
3. **撤销/重做** - 基于事件的历史记录
4. **协作编辑** - 多用户实时协作
5. **性能分析** - 执行时间分析
6. **单元测试** - 独立测试每个模块

## 贡献指南

添加新功能时：

1. 遵循现有命名约定
2. 使用 IIFE 包装代码
3. 挂载到 `window.WorkflowApp`
4. 在 HTML 中按依赖顺序加载
5. 更新此文档

## 许可证

与原项目相同。
