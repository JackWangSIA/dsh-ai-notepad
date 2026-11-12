# AI Notepad

[English](README.md) | 中文

[![CI](https://github.com/JackWangSIA/dsh-ai-notepad/actions/workflows/ci.yml/badge.svg)](https://github.com/JackWangSIA/dsh-ai-notepad/actions/workflows/ci.yml)

<p align="center">
  <img src="assets/icon-180.png" width="112" alt="AI Notepad">
</p>

<p align="center">
  <strong>给 DeepSeek Harness 的轻量、通用、AI 原生文本编辑器。</strong><br>
  普通文本编辑 + 选区 AI 智能修改 + Windows 文件关联。
</p>

![AI Notepad 编辑器](assets/screenshot-editor.png)

## 这是什么

AI Notepad 不是完整的 IDE，也不是一个只支持 Markdown 的预览器。它把日常最常用的文本编辑能力做轻，再把 AI 放到真正有用的位置：**只改你选中的内容，Diff 确认后才写入**。

适合：

- 临时打开 TXT、LOG、JSON、YAML、CSV、配置文件；
- 写 Markdown、README、笔记和文档；
- 查看代码或日志，做局部 AI 润色、纠错、精简；
- 在 Windows 资源管理器里直接双击文本文件，进入 Harness 编辑；Linux/macOS 使用系统文件选择器打开与另存。

## 功能

### 通用文本编辑

- 支持任意可识别为文本的文件，不只限于 TXT / Markdown。
- 多标签页、拖放打开、另存为、最近文件、查找、撤销/重做。
- UTF-8、UTF-8 BOM、UTF-16 LE/BE、GB18030/GBK、Windows-1252 自动识别。
- 保存时保留原始编码、BOM 和主导换行符。
- 二进制文件识别与保护。
- 保存前校验磁盘内容 SHA-256；文件被外部修改时拒绝静默覆盖。

### 选区 AI

选中文字后，可通过浮动工具栏、右键菜单或右侧 AI 面板执行：

- 精简
- 润色
- 扩写
- 重构
- 纠错
- 自定义要求（`Enter` 运行，`Shift+Enter` 换行）

AI 只输出选中区域的替换文本；运行后直接应用。右侧保留**回看修改**和**退回修改**，回看显示非模态 Diff 且不改变编辑器滚动位置；退回可恢复原文，`Ctrl+Z` 也仍然可用。多处批注仍在应用前进入审阅栏。

### 全文与批注

- 全文润色、全文精简、内容总结、逻辑梳理、生成标题。
- 对多个区域分别写批注，最后统一交给 AI 处理。
- 批量修改逐段校验原文，再以一个可撤销事务应用。

### Markdown / HTML

- Markdown 与 HTML 打开时默认进入渲染模式，`Ctrl+E` 可切回编辑。
- Markdown 预览，原始 HTML 会被转义。
- HTML 也是一等文本类型：CodeMirror HTML 语法高亮、沙箱 HTML 预览。
- HTML 预览会重写相对 `href` / `src` / `srcset`、内联 CSS 和链接 CSS 的 `url()`，使相对 CSS、图片和字体按 HTML 文件所在目录解析，而不是落到 Harness 应用地址；脚本仍被阻止。
- 在 Markdown/HTML 预览中选中文字，可直接交给选区 AI；跨内联格式或 HTML 实体的选区也能映射。
- HTML 预览图片支持右键 **复制原图**，会按需转为 PNG 写入剪贴板。
- 已保存的 HTML 通过资源路由直接加载，避免把整份文档再 JSON 传输一遍；预览资源短期缓存。
- `Ctrl+E` 切换预览 / 编辑。
- 双击预览区域直接回到编辑器。

### 外观

- 可搜索的系统字体选择器，带推荐字体、字体样例和实时排版预览；Windows 使用 PowerShell，Linux 使用 `fc-list`。
- 字号 8–48px，`Ctrl+滚轮` 快速缩放。
- 行距、字重、自动换行、行号、Tab 宽度、浅色/深色主题。
- 设置持久保存。

![AI Notepad 关于面板](assets/screenshot-about.png)

### Linux / macOS

- Linux 打开/另存使用 `zenity`、`kdialog` 或 `yad`；如果没有弹窗，安装其中一个即可。
- macOS 使用 `osascript`。
- 字体优先使用 `fc-list`，不可用时使用安全回退列表。
- reveal 使用 FreeDesktop `FileManager1` D-Bus，失败时回退 `xdg-open`；macOS 使用 `open -R`。
- 系统文件关联仍仅支持 Windows；Linux/macOS 的关联面板会说明并隐藏安装/移除操作，不影响正常编辑。

### Windows 文件关联

- 当前用户级注册，无需管理员权限。
- 注册 `OpenWithProgids`、`RegisteredApplications` 和 `AI Notepad` ProgID。
- 通过轻量 VBS 启动器把文件写入队列并唤起 Harness。
- 已运行 DSH 时优先在现有窗口打开，不重复启动实例。
- 支持关联状态、注册、移除和恢复。
- 受 Windows `UserChoice` 保护，无法静默强制成为默认程序；注册后需在“打开方式”中手动选择一次“始终使用”。

## 快捷键

| 快捷键 | 操作 |
|---|---|
| `Ctrl+S` / `Ctrl+Shift+S` | 保存 / 另存为 |
| `Ctrl+Z` / `Ctrl+Y` | 撤销 / 重做 |
| `Ctrl+F` | 查找 |
| `Ctrl+E` | 切换 Markdown / HTML 预览 / 编辑 |
| `Ctrl+滚轮`、`Ctrl+=`、`Ctrl+-`、`Ctrl+0` | 放大 / 缩小 / 恢复字号 |
| `Ctrl+Alt+1..4` | 选区精简 / 润色 / 扩写 / 纠错 |
| `Ctrl+Alt+B` | 加入批注 |
| `Ctrl+Alt+N` | 从主界面切换到 AI Notepad |

## 安装

### 从插件市场

市场条目上线后，可在 DSH 的 **插件 / Discover** 中搜索 `AI Notepad`。市场条目使用 GitHub Release 的稳定 tarball，不需要 npm 账号。

### 从 GitHub 安装

```bash
dsh plugin --profile web add JackWangSIA/dsh-ai-notepad
```

预构建包：

```text
https://github.com/JackWangSIA/dsh-ai-notepad/releases/latest/download/dsh-ai-notepad.tgz
```

如果之后发布到 npm，也可以使用 `dsh plugin --profile web add dsh-ai-notepad`。

桌面端建议通过侧栏 **插件 → 添加插件** 使用仓库地址；Desktop profile 由桌面应用管理，不建议直接运行 CLI 修改 `desktop` profile。

### 本地开发

```powershell
$node = "$env:USERPROFILE\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
$pnpm = "$env:USERPROFILE\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\pnpm\bin\pnpm.mjs"
& $node $pnpm install --ignore-scripts
& $node scripts/build.mjs
& $node --test test/*.test.mjs
```

然后用 Harness 的 `plugin_manager` `install_bundle` 安装本目录。

## 架构

- `lib/index.js` — Host：文件 I/O、编码、Hash 冲突保护、LLM 路由、Windows 注册表、文件队列、原生选择器。
- `src/` — Client：`app.jsx` 页面、`editor.jsx` CodeMirror、`store.js` 状态、`diff.js` / `markdown.js`。
- `lib/client.js` — 构建后的经典 ModuleLoader bundle；React 由 Harness 页面提供。
- `lib/scripts/` — Windows 文件选择器、字体枚举、外部文件启动器。
- `scripts/build.mjs` — esbuild 构建并注入版本/构建时间。
- `test/` — Host 路由、编码、VBS→inbox、AI、批注、客户端加载与 SSR 测试。

## 限制与安全

- 单文件读取上限 64 MiB；超过 16 MiB 会提示大文件，预览和 AI 可能变慢。
- 单次全文 AI 上下文约 120k 字符，超长文档会省略中间上下文。
- 预览是快速阅读模式，不是 WYSIWYG 富文本编辑器。
- AI 请求复用 Harness 当前模型路由，不额外保存 API Key；发送内容受该模型提供方策略约束。
- Windows 默认应用受 `UserChoice` 哈希保护，插件不会伪造系统默认值。
- 文件读写和二进制保护说明见 [SECURITY.md](SECURITY.md)。

## 开发与发布

```bash
pnpm install --ignore-scripts
pnpm run build
pnpm test
```

发布流程见 [CHANGELOG.md](CHANGELOG.md) 与 GitHub Actions：

- `ci.yml`：每次 push / PR 构建并测试。
- `release.yml`：推送 `v*` tag 后构建、打包、发布 npm，并创建 GitHub Release。

## 许可

[MIT](LICENSE) © 2026 Wang Heran
