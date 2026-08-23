# FurinaPet Plugins

FurinaPet 官方插件仓库与插件目录源。

这个仓库与主程序 `sheetung/furinapet` 分离：主程序负责 Plugin Host、安装/更新/设置/卸载和权限控制；本仓库负责插件源码、manifest、catalog 与版本发布。

## 目录

```text
catalog.v1.json
schemas/
  catalog.schema.json
  manifest.schema.json
plugins/
  official/
    click-reaction/
    focus-timer/
    sedentary-reminder/
  community/
  dev/
```

- `plugins/official/`：FurinaPet 官方维护插件。
- `plugins/community/`：审核后进入公共目录的社区插件。
- `plugins/dev/`：开发实验，不进入正式 catalog。
- `catalog.v1.json`：主程序读取的远程插件目录。

## 插件包约定

每个插件至少包含：

```text
furinapet.plugin.json
index.js
README.md
```

`furinapet.plugin.json` 是安装、权限、配置和兼容性的唯一契约。插件不能直接访问 Tauri、DOM 或系统 API，只能通过 FurinaPet Plugin SDK 请求 Host 执行受控操作。

## SDK v1 设计原则

插件代码通过 `activate(ctx)` 启动，通过 Host 提供的受限 API 工作：

- `ctx.events.on(name, handler)`：订阅允许的桌宠/应用事件。
- `ctx.pet.react(reaction, message)`：请求桌宠动作与气泡。
- `ctx.timer.setInterval(...)` / `ctx.timer.setTimeout(...)`：受控计时器。
- `ctx.config.get(key)`：读取 manifest 声明的设置。
- `ctx.storage.get/set(...)`：插件隔离存储。

所有能力都必须先在 manifest 的 `permissions` 中声明，并由 Host 校验。

## 发布流程

1. 修改插件版本和代码。
2. 校验 manifest/schema。
3. 更新 `catalog.v1.json` 中的版本、文件列表和哈希。
4. FurinaPet 在插件页刷新 catalog 后提示安装或更新。

当前仓库先采用 GitHub raw 文件分发；后续可以升级为 `.furina-plugin` ZIP + SHA-256 + GitHub Releases，而不改变 manifest 基本结构。
