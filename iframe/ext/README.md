# 工作流模块化架构

## 概述

本文件夹包含工作流画布 (`workflow.html`) 的**可选模块化扩展系统**。此系统完全独立，**不会修改主编辑器代码**，仅作为扩展架构使用。

## 文件结构

```
iframe/ext/
├── workflow.html              # 原始主文件（未修改）
├── workflow.js                # 原始业务逻辑（未修改）
├── workflow.css               # 原始样式（未修改）
│
├── core/                      # 核心模块系统
│   ├── ModuleSystem.js        # 模块注册中心 & 事件总线
│   └── init.js                # 初始化全局实例
│
├── modules/                   # 功能模块
│   ├── CanvasModule.js        # 画布管理
│   ├── StateModule.js         # 状态管理
│   ├── BlockDefinitionsModule.js  # 模块定义
│   ├── RenderModule.js        # 渲染
│   ├── InteractionModule.js   # 鼠标/键盘交互
│   ├── ToolbarModule.js       # 工具栏
│   └── ExampleModule.js       # 示例模块（模板）
│
├── bootstrap.js               # 应用启动
└── README.md                  # 本文档
```

## 核心概念

### 1. 模块注册中心 (WorkflowModuleSystem)

管理所有模块的注册、依赖解析和生命周期。

### 2. 事件总线 (WorkflowEventBus)

模块间通信的发布订阅系统：
- `on(event, callback)` - 订阅事件
- `emit(event, data)` - 发布事件
- `off(event, callback)` - 取消订阅

### 3. 共享上下文 (context)

所有模块可以通过 `context` 对象共享状态和服务。

## 如何启用模块系统

在 `workflow.html` 中的 `</body>` 前添加（可选）：

```html
<!-- 模块化扩展系统（可选） -->
<script src="core/ModuleSystem.js"></script>
<script src="core/init.js"></script>

<!-- 功能模块 -->
<script src="modules/CanvasModule.js"></script>
<script src="modules/StateModule.js"></script>
<script src="modules/BlockDefinitionsModule.js"></script>
<script src="modules/RenderModule.js"></script>
<script src="modules/InteractionModule.js"></script>
<script src="modules/ToolbarModule.js"></script>

<!-- 启动 -->
<script src="bootstrap.js"></script>
```

## 如何添加新模块

### 步骤 1: 创建模块文件

在 `modules/` 目录下创建新的 JS 文件，例如 `MyModule.js`:

```javascript
(function() {
    window.workflowModuleRegistry.register({
        name: 'myModule',
        dependencies: ['state'],  // 依赖的模块

        async init(context, eventBus) {
            // 获取依赖
            const { state } = context;

            // 监听事件
            eventBus.on('block:added', (block) => {
                console.log('新模块:', block);
            });

            // 导出功能
            context.myModule = {
                hello() {
                    return 'Hello from MyModule';
                }
            };

            eventBus.emit('myModule:initialized');
        }
    });
})();
```

### 步骤 2: 在 HTML 中引入

```html
<script src="modules/MyModule.js"></script>
```

### 步骤 3: 在其他模块中使用

```javascript
// 调用服务
context.myModule.hello();

// 监听事件
eventBus.on('myModule:initialized', () => { /* ... */ });
```

## 模块间通信

### 方式 1: 事件总线（推荐）

```javascript
// 模块 A 发布事件
eventBus.emit('data:updated', { value: 123 });

// 模块 B 订阅事件
eventBus.on('data:updated', (data) => {
    console.log(data.value);
});
```

### 方式 2: 共享上下文

```javascript
// 模��� A 导出
context.myService = { getData: () => 123 };

// 模块 B 使用
const data = context.myService.getData();
```

## 已定义的事件

| 事件名 | 触发时机 | 数据 |
|--------|----------|------|
| `canvas:initialized` | 画布模块初始化完成 | - |
| `canvas:resized` | 画布大小改变 | `{ width, height }` |
| `state:initialized` | 状态模块初始化完成 | - |
| `state:updated` | 状态更新 | 更新的字段 |
| `state:cleared` | 状态清空 | - |
| `block:added` | 添加模块 | block 对象 |
| `block:removed` | 删除模块 | blockId |
| `connection:added` | 添加连接 | connection 对象 |
| `mouse:down` | 鼠标按下 | `{ sx, sy, wx, wy, button }` |
| `mouse:move` | 鼠标移动 | `{ sx, sy, wx, wy }` |
| `mouse:up` | 鼠标松开 | `{ button }` |
| `mouse:wheel` | 鼠标滚轮 | `{ sx, sy, delta }` |
| `key:down` | 按键按下 | `{ code, key, ctrl, shift }` |
| `key:up` | 按键松开 | `{ code, key }` |
| `toolbar:run` | 点击运行 | - |
| `toolbar:export` | 点击导出 | - |
| `toolbar:import` | 点击导入 | - |
| `toolbar:clear` | 点击清空 | - |
| `app:ready` | 应用就绪 | - |

## 架构优势

✅ **解耦** - 模块间通过事件和上下文通信  
✅ **可扩展** - 轻松添加新模块类型  
✅ **可测试** - 每个模块独立测试  
✅ **可选启用** - 不影响现有代码  
✅ **依赖管理** - 自动解析初始化顺序

## 常见模块类型示例

### 1. 快捷键模块
```javascript
{
    name: 'hotkeys',
    dependencies: ['state'],
    async init(context, eventBus) {
        eventBus.on('key:down', (e) => {
            if (e.ctrl && e.code === 'KeyS') {
                eventBus.emit('toolbar:export');
            }
        });
    }
}
```

### 2. 历史记录模块
```javascript
{
    name: 'history',
    dependencies: ['state'],
    async init(context, eventBus) {
        const history = [];

        eventBus.on('block:added', () => {
            history.push(JSON.parse(JSON.stringify(context.state)));
        });

        context.history = {
            undo: () => { /* ... */ },
            redo: () => { /* ... */ }
        };
    }
}
```

### 3. 自动保存模块
```javascript
{
    name: 'autosave',
    dependencies: ['state'],
    async init(context, eventBus) {
        setInterval(() => {
            localStorage.setItem('workflow', JSON.stringify(context.state));
        }, 5000);
    }
}
```

## 调试技巧

### 查看已注册的模块
```javascript
console.log(window.workflowModuleRegistry.modules);
```

### 查看已初始化的模块
```javascript
console.log(window.workflowModuleRegistry.initializedModules);
```

### 查看共享上下文
```javascript
console.log(window.workflowContext);
```

### 监听所有事件（调试）
```javascript
const bus = window.workflowModuleRegistry.eventBus;
const originalEmit = bus.emit;
bus.emit = function(event, data) {
    console.log('[Event]', event, data);
    return originalEmit.call(this, event, data);
};
```

## 注意事项

1. **不影响现有代码** - 此模块系统为可选扩展，不修改 `workflow.js`
2. **按需启用** - 可以根据需要选择性地加载模块
3. **模块独立** - 每个模块应尽可能独立，通过事件和上下文通信
4. **命名规范** - 模块名使用 camelCase，事件名使用 `module:action` 格式
