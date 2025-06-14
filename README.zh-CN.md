# CodeInterviewAssist

> ## ⚠️ 重要社区公告 ⚠️
> 
> **这是一个免费、开源的项目 - 不是完整的商业产品！**
> 
> 市面上有许多收费的面试准备工具，它们提供全面的功能（如实时音频捕获、自动答案生成等）但收费高达数百美元。本项目完全不同：
> 
> - 这是一个**小型、非营利、社区驱动的项目**，没有任何经济利益
> - 整个代码库对所有人免费开放，可以自由使用、修改或扩展
> - 想要语音支持等功能？欢迎集成 OpenAI 的 Whisper 或其他 API
> - 新功能应该通过**社区贡献**来实现 - 期望单个维护者免费实现高级功能是不合理的
> - 维护者不会从这个项目中获得任何作品集收益、金钱补偿或认可
> 
> **在提交功能请求或期望个性化支持之前，请理解这个项目纯粹是作为社区资源存在的。**如果你重视这个项目，最好的表达方式是贡献代码、文档或帮助其他用户。

> ## 🔑 API 密钥信息 - 已更新
>
> 我们已经测试并确认**Gemini 和 OpenAI API 在当前版本中都能正常工作**。如果你遇到 API 密钥问题：
>
> - 尝试从配置文件（位于用户数据目录）中删除你的 API 密钥条目
> - 退出并重新登录应用程序
> - 检查你的 API 密钥仪表板，确认密钥处于活动状态且有足够的额度
> - 确保你使用的是正确的 API 密钥格式（OpenAI 密钥以 "sk-" 开头）
>
> 配置文件存储在：`C:\Users\[用户名]\AppData\Roaming\interview-coder-v1\config.json`（Windows）或 `/Users/[用户名]/Library/Application Support/interview-coder-v1/config.json`（macOS）

## 免费、开源的 AI 驱动面试准备工具

本项目为付费编程面试平台提供了一个强大的替代方案。它以免费、开源的形式提供付费面试准备工具的核心功能。使用你自己的 OpenAI API 密钥，你可以访问高级功能，如 AI 驱动的问题分析、解决方案生成和调试辅助 - 所有这些都在你的本地机器上运行。

### 为什么创建这个项目

最好的编程面试工具通常都收费昂贵，这使得许多学生和求职者无法使用。本项目提供相同的强大功能，但没有成本障碍，让你可以：

- 使用自己的 API 密钥（只需支付你实际使用的部分）
- 在本地机器上运行所有内容，确保完全隐私
- 根据特定需求进行自定义
- 学习并贡献到一个开源工具中

### 自定义可能性

代码库设计具有适应性：

- **AI 模型**：虽然目前使用 OpenAI 的模型，但你可以修改代码以集成其他提供商，如 Claude、Deepseek、Llama 或任何提供 API 的模型。所有集成代码都在 `electron/ProcessingHelper.ts` 中，UI 设置在 `src/components/Settings/SettingsDialog.tsx` 中。
- **编程语言**：添加对更多编程语言的支持
- **功能**：扩展新功能
- **UI**：根据你的偏好自定义界面

只需要基本的 JavaScript/TypeScript 知识和对你想要集成的 API 的理解即可。

## 功能特点

- 🎯 99% 不可见性：不可检测的窗口，可以绕过大多数屏幕捕获方法
- 📸 智能截图捕获：分别捕获问题文本和代码以获得更好的分析
- 🤖 AI 驱动分析：使用 GPT-4 自动提取和分析编程问题
- 💡 解决方案生成：获取详细的解释和解决方案，包括时间和空间复杂度分析
- 🔧 实时调试：使用 AI 辅助进行代码调试和结构化反馈
- 🎨 高级窗口管理：自由移动、调整大小、更改透明度和缩放窗口
- 🔄 模型选择：在不同处理阶段选择 GPT-4 或 GPT-4-mini
- 🔒 注重隐私：除了 OpenAI API 调用外，你的 API 密钥和数据永远不会离开你的计算机

## 全局快捷键

应用程序使用不可识别的全局键盘快捷键，不会被浏览器或其他应用程序检测到：

- 切换窗口可见性：[Control 或 Cmd + B]
- 移动窗口：[Control 或 Cmd + 方向键]
- 截图：[Control 或 Cmd + H]
- 删除最后一张截图：[Control 或 Cmd + L]
- 处理截图：[Control 或 Cmd + Enter]
- 开始新问题：[Control 或 Cmd + R]
- 退出：[Control 或 Cmd + Q]
- 降低透明度：[Control 或 Cmd + []]
- 提高透明度：[Control 或 Cmd + ]]
- 缩小：[Control 或 Cmd + -]
- 重置缩放：[Control 或 Cmd + 0]
- 放大：[Control 或 Cmd + =]

## 不可见性兼容性

应用程序对以下软件不可见：

- 6.1.6 及以下版本的 Zoom
- 所有基于浏览器的屏幕录制软件
- 所有版本的 Discord
- Mac OS 截图功能（Command + Shift + 3/4）

注意：应用程序对以下软件**可见**：

- 6.1.6 及以上版本的 Zoom
  - https://zoom.en.uptodown.com/mac/versions（如需降级 Zoom 的链接）
- Mac OS 原生屏幕录制（Command + Shift + 5）

## 系统要求

- Node.js（v16 或更高版本）
- npm 或 bun 包管理器
- OpenAI API 密钥
- 终端/IDE 的屏幕录制权限
  - macOS：
    1. 进入系统偏好设置 > 安全性与隐私 > 隐私 > 屏幕录制
    2. 确保 CodeInterviewAssist 已启用屏幕录制权限
    3. 启用权限后重启 CodeInterviewAssist
  - Windows：
    - 无需额外权限
  - Linux：
    - 根据发行版可能需要 `xhost` 访问权限

## 运行应用程序

### 快速开始

1. 克隆仓库：

```bash
git clone https://github.com/greeneu/interview-coder-withoupaywall-opensource.git
cd interview-coder-withoupaywall-opensource
```

2. 安装依赖：

```bash
npm install
```

3. **推荐**：清理之前的构建：

```bash
npm run clean
```

4. 运行适合你平台的脚本：

**Windows：**
```bash
stealth-run.bat
```

**macOS/Linux：**
```bash
# 首先使脚本可执行
chmod +x stealth-run.sh
./stealth-run.sh
```

**重要提示**：应用程序窗口默认是不可见的！使用 Ctrl+B（Mac 上是 Cmd+B）来切换可见性。

### 构建可分发包

要创建可安装的分发包：

**macOS（DMG）：**
```bash
# 使用 npm
npm run package-mac

# 或使用 yarn
yarn package-mac
```

**Windows（安装程序）：**
```bash
# 使用 npm
npm run package-win

# 或使用 yarn
yarn package-win
```

打包的应用程序将在 `release` 目录中可用。

**脚本功能：**
- 创建应用程序所需的目录
- 清理之前的构建以确保全新开始
- 以生产模式构建应用程序
- 以不可见模式启动应用程序

### 注意事项和故障排除

- **窗口管理器兼容性**：某些窗口管理工具（如 macOS 上的 Rectangle Pro）可能会干扰应用程序的窗口移动。考虑暂时禁用它们。

- **API 使用**：注意你的 OpenAI API 密钥的速率限制和信用额度使用情况。视觉 API 调用比纯文本调用更昂贵。

- **LLM 自定义**：你可以轻松自定义应用程序以包含 Claude、Deepseek 或 Grok 等 LLM，只需修改 `ProcessingHelper.ts` 中的 API 调用和相关 UI 组件。

- **常见问题**：
  - 在启动应用程序前运行 `npm run clean` 以确保全新构建
  - 如果窗口没有出现，多次使用 Ctrl+B/Cmd+B
  - 如果需要，使用 Ctrl+[/]/Cmd+[/] 调整窗口透明度
  - macOS：确保脚本有执行权限（`chmod +x stealth-run.sh`）

## 与付费面试工具的比较

| 功能 | 付费工具 | CodeInterviewAssist（本项目） |
|---------|------------------------|----------------------------------------|
| 价格 | $60/月订阅 | 免费（只需支付 API 使用费用） |
| 解决方案生成 | ✅ | ✅ |
| 调试辅助 | ✅ | ✅ |
| 不可见性 | ✅ | ✅ |
| 多语言支持 | ✅ | ✅ |
| 时间/空间复杂度分析 | ✅ | ✅ |
| 窗口管理 | ✅ | ✅ |
| 认证系统 | 必需 | 无（简化版） |
| 支付处理 | 必需 | 无（使用自己的 API 密钥） |
| 隐私 | 服务器处理 | 100% 本地处理 |
| 自定义 | 有限 | 完全源代码访问 |
| 模型选择 | 有限 | 模型之间选择 |

## 技术栈

- Electron
- React
- TypeScript
- Vite
- Tailwind CSS
- Radix UI 组件
- OpenAI API

## 工作原理

1. **初始设置**
   - 启动不可见窗口
   - 在设置中输入你的 OpenAI API 密钥
   - 为提取、解决方案生成和调试选择首选模型

2. **捕获问题**
   - 使用全局快捷键 [Control 或 Cmd + H] 对代码问题进行截图
   - 截图自动添加到最多 2 张的队列中
   - 如果需要，使用 [Control 或 Cmd + L] 删除最后一张截图

3. **处理**
   - 按 [Control 或 Cmd + Enter] 分析截图
   - AI 使用 GPT-4 Vision API 从截图中提取问题要求
   - 模型根据提取的信息生成最优解决方案
   - 所有分析都使用你的个人 OpenAI API 密钥完成

4. **解决方案和调试**
   - 查看生成的解决方案和详细解释
   - 通过截取更多错误消息或代码的截图来使用调试功能
   - 获取结构化分析，包括已识别的问题、修正和优化
   - 根据需要切换解决方案和队列视图

5. **窗口管理**
   - 使用 [Control 或 Cmd + 方向键] 移动窗口
   - 使用 [Control 或 Cmd + B] 切换可见性
   - 使用 [Control 或 Cmd + [] 和 [Control 或 Cmd + ]] 调整透明度
   - 窗口对指定的屏幕共享应用程序保持不可见
   - 使用 [Control 或 Cmd + R] 开始新问题

6. **语言选择**
   - 一键轻松切换编程语言
   - 使用方向键通过键盘导航可用语言
   - 系统动态适应代码库中添加或删除的任何语言
   - 你的语言偏好会在会话之间保存

## 添加更多 AI 模型

本应用程序的设计考虑了可扩展性。你可以轻松添加对现有 OpenAI 集成之外的其他 LLM 的支持：

- 你可以添加 Claude、Deepseek、Grok 或任何其他 AI 模型作为替代选项
- 应用程序架构允许多个 LLM 后端共存
- 用户可以自由选择他们喜欢的 AI 提供商

要添加新模型，只需扩展 `electron/ProcessingHelper.ts` 中的 API 集成，并在 `src/components/Settings/SettingsDialog.tsx` 中添加相应的 UI 选项。模块化设计使这变得简单，不会破坏现有功能。

## 配置

- **OpenAI API 密钥**：你的个人 API 密钥存储在本地，仅用于 OpenAI API 调用
- **模型选择**：你可以为每个处理阶段选择 GPT-4 或 GPT-4-mini：
  - 问题提取：分析截图以理解编程问题
  - 解决方案生成：创建带有解释的优化解决方案
  - 调试：提供错误和改进建议的详细分析
- **语言**：选择你偏好的编程语言来生成解决方案
- **窗口控制**：使用键盘快捷键调整透明度、位置和缩放级别
- **所有设置都存储在本地**用户数据目录中，并在会话之间保持

## 许可证

本项目采用 GNU Affero 通用公共许可证 v3.0（AGPL-3.0）授权。

### 这意味着什么

- 你可以自由使用、修改和分发本软件
- 如果你修改代码，你必须使你的更改在相同的许可证下可用
- 如果你在网络服务器上运行修改版本，你必须向用户提供源代码
- 我们强烈鼓励你将改进贡献回主项目

查看 [LICENSE-SHORT](LICENSE-SHORT) 文件了解条款摘要，或访问 [GNU AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.html) 查看完整许可证文本。

### 贡献

我们欢迎贡献！请查看我们的[贡献指南](CONTRIBUTING.md)了解更多信息。

## 免责声明和道德使用

本工具旨在作为学习辅助和练习助手。虽然它可以在面试期间帮助你理解问题和解决方案方法，但请考虑以下道德准则：

- 如果在面试中被直接询问，诚实地说明使用辅助工具的情况
- 使用此工具来学习概念，而不仅仅是获取答案
- 认识到理解解决方案比简单地呈现它们更有价值
- 在带回家的作业中，确保你完全理解你提交的任何解决方案

记住，技术面试的目的是评估你的问题解决能力和理解力。当用于增强你的学习而不是替代它时，这个工具的效果最好。

## 支持和问题

如果你有问题或需要支持，请在 GitHub 仓库上提交 issue。

---

> **记住：** 这是一个社区资源。如果你觉得它有价值，考虑贡献而不是仅仅请求功能。项目通过集体努力而不是个人需求来成长。 




截屏权限问题
codesign --deep --force --sign - ./release/mac/Interview\ Coder.app