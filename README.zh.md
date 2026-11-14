# AI Notepad

[English](README.md) | 中文

[![CI](https://github.com/JackWangSIA/dsh-ai-notepad/actions/workflows/ci.yml/badge.svg)](https://github.com/JackWangSIA/dsh-ai-notepad/actions/workflows/ci.yml)

<p align="center">
  <img src="assets/icon-180.png" width="112" alt="AI Notepad">
</p>

<p align="center">
  <strong>给 DeepSeek Harness 的轻量、AI 原生文本编辑器。</strong><br>
  编辑任意文本，只改你选中的内容，崩溃也不丢草稿。
</p>

## 为什么需要 AI Notepad

AI Notepad 不是完整 IDE，也不是只能预览 Markdown 的工具。它是你在 DeepSeek Harness 里临时打开日志、修 README、润色一段文字、改一个 JSON 字段时，最顺手的那一个编辑器。

它把三件通常分散在不同工具里的事合在一起：

- **真正可用的文本编辑器**：任何能被识别为文本的文件都能打开。
- **选区 AI**：只改你选中的部分，而不是每次都动整篇文档。
- **崩溃恢复与可回退历史**：敢试、敢改，也退得回来。

## 主要能力

### 写作与保存

- Windows、Linux、macOS 使用系统原生文件选择器打开、保存和另存；文件也可以直接拖入。
- CodeMirror 6 多标签编辑，撤销/重做、查找、行号、自动换行、未保存提示。
- 自动识别 UTF-8、UTF-8 BOM、UTF-16 LE/BE、GB18030/GBK、Windows-1252；保存时保留原编码、BOM 和主导换行符。
- 二进制文件会在打开前被拒绝，避免误改。
- 保存前用 SHA-256 比较磁盘内容；文件被其他程序修改时拒绝静默覆盖。
- 新建文件默认是 Markdown（`.md`）。

### 为“真实修改”设计的选区 AI

选中文字后，可以从浮动卡片或右侧 AI 面板操作。两边都是四对按钮，每对放在同一个按钮组里，并用 `↔` 标出对应关系：

| 成对操作 | 作用 |
|---|---|
| **更精简 / 更丰富** | 压缩内容，或补充有用的细节 |
| **条目化 / 段落化** | 把段落变成列表，或把碎片整理成自然段落 |
| **更易懂 / 更高级** | 用更简单的表达，或使用更精确、成熟的措辞 |
| **查语法 / 查常识** | 只修语法；或优先检查事实、逻辑和常识矛盾 |

快捷按钮点击即运行，悬停会显示说明。浮动卡片里有独立的自定义输入框，输入后按 `Enter` 执行。右侧输入框支持 `Enter` 运行、`Shift+Enter` 换行。每次运行后提示词自动清空。

### 修改、回看与独立回退

- AI 修改立即应用；右侧保留 **回看修改** 和 **退回修改**。
- 回看使用非模态 Diff，不阻塞编辑器；`Ctrl+Z` 仍然可用。
- 每次 AI 修改都会进入当前文档的历史，入口在顶部工具栏，并显示修改数量。
- 可以单独回退较早的**非重叠**修改，同时保留之后的其他修改。
- 如果修改范围与后续内容重叠，或全文修改之后又有新修改，会标记为“不可单独回退”，而不是悄悄丢弃后续内容。

### 崩溃安全的自动保存

停止输入约 1 秒后，未保存内容会写入受控的恢复目录：

```text
~/.dsh/ai-notepad/autosave/
```

- 不在内存里额外保留一份全文副本。
- 每个有未保存修改的文档只有一个防抖计时器；恢复列表只加载元数据。
- 最多保留 20 份恢复内容或 64 MiB。
- 崩溃或强制退出后，下次启动会提供 **恢复 / 丢弃 / 全部丢弃 / 稍后**。
- 恢复内容会作为新的未保存文档打开，不会直接覆盖原文件。
- 正常保存后会删除对应的恢复副本。

### Markdown 与 HTML

- Markdown 和 HTML 默认以预览模式打开。
- 预览/编辑按钮悬浮在**编辑区域右上角**，两个方向都可点击；`Ctrl+E` 同样有效。
- Markdown 预览 HTML 按内容缓存，选区和 AI 面板更新不会重复解析整篇文档。
- Markdown 中的原始 HTML 会被转义，使用保守的 CommonMark 子集。
- HTML 预览会通过认证的本地资源路由重写相对 `href`、`src`、`srcset`、内联 CSS 和链接 CSS 的 `url()`；相对 CSS、图片和字体会按 HTML 文件所在目录解析。
- HTML 预览仍阻止脚本执行。
- 在预览中选中文字可以直接交给选区 AI；正常情况下会把范围映射回 Markdown/HTML 源码，不再频繁出现“无法映射”的警告。
- HTML 预览里的图片可以右键选择 **复制原图**，按需转为 PNG 写入剪贴板。

### 和 DSH 一致的外观

- 背景、面板、文字、边框、状态色和品牌色继承 DSH 主题 token。
- 默认 `system` 主题跟随 DSH 明暗模式。
- 单独的**点缀色**用于成对按钮、选区卡片、格式按钮和品牌标记。可选预设或使用取色器，设置会持久化。
- 新建文件默认 `.md`；文件关联使用可点击的格式按钮（`.md`、`.txt`、`.json`、`.html`、`.css`、`.js`、`.py`、`.ps1`、`.log`、`.yaml`、`.csv` 等），自动增删扩展名并整理逗号分隔。

### 原生集成

- Windows 当前用户级文件关联：ProgID、`OpenWithProgids`、`RegisteredApplications`，以及把路径写入插件队列并唤起 Harness 的轻量 VBS 启动器。
- Windows 10/11 的默认打开方式受 `UserChoice` 哈希保护。插件注册真实的“打开方式”项，但用户仍需在资源管理器中手动选择一次“始终使用”。
- Linux 的打开/保存使用 `zenity`、`kdialog` 或 `yad`；在资源管理器中显示使用 FreeDesktop `FileManager1` D-Bus，失败时回退到 `xdg-open`。
- macOS 使用 `osascript` 打开/保存，使用 `open -R` 显示文件。
- 系统文件关联只在 Windows 提供；其他平台会说明并隐藏安装/移除操作，正常编辑不受影响。

## 安装

插件市场上架后可以直接安装。市场条目使用带 `latest` 的 GitHub Release tarball，不依赖 npm。

从 GitHub 安装：

```bash
dsh plugin --profile web add JackWangSIA/dsh-ai-notepad
```

预构建 tarball：

```text
https://github.com/JackWangSIA/dsh-ai-notepad/releases/latest/download/dsh-ai-notepad.tgz
```

DSH Desktop 更推荐在 **插件 → 添加插件** 中填写仓库地址。`desktop` profile 由应用管理，不要手工用 CLI 改。

## 快速开始

1. 从侧边栏或插件面板打开 AI Notepad。
2. `Ctrl+N` 新建 Markdown 文件，或把文本文件拖进编辑器。
3. 选中一句话或一段文字，点击成对按钮，或在浮动卡片里输入自己的要求。
4. 在右侧回看修改；需要找更早的改动时，点顶部工具栏的**修改历史**。
5. Markdown/HTML 用 `Ctrl+E` 或右上角悬浮按钮切换预览/编辑。

## 快捷键

| 快捷键 | 操作 |
|---|---|
| `Ctrl+S` / `Ctrl+Shift+S` | 保存 / 另存为 |
| `Ctrl+Z` / `Ctrl+Y` | 撤销 / 重做 |
| `Ctrl+F` | 查找 |
| `Ctrl+E` | 切换 Markdown / HTML 预览与编辑 |
| `Ctrl+滚轮`、`Ctrl+=`、`Ctrl+-`、`Ctrl+0` | 字号放大 / 缩小 / 重置 |
| `Ctrl+Alt+1..4` | 选区 精简 / 润色 / 扩写 / 查语法 |
| `Enter` | 运行自定义要求 |
| `Shift+Enter` | 右侧输入框内换行 |

## 平台支持

- **Windows**：原生文件选择器、字体枚举、文件关联、资源管理器定位。
- **Linux**：安装 `zenity`/`kdialog`/`yad` 后使用原生选择器；`fc-list` 字体；FreeDesktop 定位；没有文件关联也能正常编辑。
- **macOS**：`osascript` 选择器；有字体配置时使用 `fc-list`；`open -R` 定位；没有文件关联也能正常编辑。

## 架构

- `lib/index.js` — Host 半端。认证的 `/api/ai-notepad/*` 路由、文件读写、编码、冲突保护、自动保存、LLM 调用、Windows 注册表、inbox 监听、选择器和字体枚举。
- `src/` — Client 源码。`app.jsx` 页面，`editor.jsx` CodeMirror，`store.js` 标签/AI/回看/历史/自动保存/设置，`diff.js`、`markdown.js` 是纯函数。
- `lib/client.js` — 生成的 classic ModuleLoader bundle（React 保持 external）。
- `lib/scripts/` — 原生选择器、字体枚举和 Windows 外部打开启动器。
- `scripts/build.mjs` — esbuild 构建。
- `test/` — Host 路由与编码、VBS/inbox、Store AI/历史/自动保存、ModuleLoader 加载和服务端渲染测试。

## 开发

```powershell
$node = "$env:USERPROFILE\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe"
$pnpm = "$env:USERPROFILE\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\pnpm\bin\pnpm.mjs"
& $node $pnpm install --ignore-scripts --dir .
& $node scripts/build.mjs
& $node --test test/*.test.mjs
```

用 Harness 的 `plugin_manager` `install_bundle` 安装绝对目录，不要手动把文件复制进 profile。

## 限制与安全

- 单文件读取上限 64 MiB；超过 16 MiB 会提示大文件。
- 全文 AI 上下文约 120k 字符；超长文档会省略中间部分。
- 修改历史是当前文档、当前会话内的记录，不会跨重启保留；自动保存用于草稿恢复，不等于历史记录。
- HTML 预览会阻止脚本；它用于阅读和选区 AI，不是运行 HTML 应用的沙箱。
- HTML 预览中的外部图片可能因为浏览器 CORS 限制而无法复制。
- 自动保存是恢复副本，不替代正常保存；正常保存仍是最终来源。

## 许可证

[MIT](LICENSE) © 2026 Wang Heran
