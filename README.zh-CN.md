# S-UI-X 简体中文国际化增强版

本仓库是基于 [deposist/s-ui-x](https://github.com/deposist/s-ui-x) 的简体中文国际化增强版本。当前同步基线为 upstream `42baef5`（Release v1.5.11）。本项目保留上游代码结构、开源历史和 GPL-3.0 许可证，不是独立原创或脱离 upstream 的重写版本。

## 主要改进

- 简体中文 Locale 与 English 完整对齐，当前覆盖率 100%。
- English 与简体中文可自由切换，语言偏好保存在 `localStorage['locale']`。
- 保留 English runtime fallback，避免上游新增 key 时界面中断。
- 将选定组件中的用户可见硬编码英文迁移到现有 Vue I18n 体系。
- 统一常用中文术语，并修正 Tailscale 等旧有误译。
- Locale Parity 自动检查 Missing、Extra、Empty 和 Placeholder mismatch。
- 已完成桌面端、390px 窄屏和关键 Drawer/弹窗验收。

技术名称保持行业通用英文，包括 VLESS、VMess、Reality、Hysteria2、AnyTLS、TUIC、ShadowTLS、TLS、SNI、ALPN、UUID、sing-box、Xray 和 Tailscale。

## 语言切换

- 未登录时：在 Login 页面使用语言选择器并选择“简体中文”。
- 登录后：使用顶部栏的语言菜单切换 English 或简体中文。
- 刷新页面后会继续使用上次选择的语言。

## 安装与使用

本项目没有改变上游安装核心逻辑。官方二进制安装、运行参数和平台说明请以主 [README.md](README.md) 及 upstream 文档为准。

当前 `main` 分支发布的是源码变更，未创建自定义 Tag 或 GitHub Release。需要从本 Fork 获取源码时可执行：

```bash
git clone https://github.com/webhuage-debug/s-ui-x.git
cd s-ui-x
```

之后按照主 README 中的 “Manual Run for Development and Contributions” 流程构建。前端实际构建命令为：

```bash
cd frontend
npm install
npm run build
```

完整后端构建仍需要 Go 环境，并遵循上游说明。不要把 upstream 的预编译 Release 与本 Fork 尚未创建的中文 Release 混淆。

## 稳定性边界

本次中文化不修改：

- sing-box 核心及生命周期逻辑；
- VLESS、Reality、Hysteria2、AnyTLS、TUIC、ShadowTLS 等协议实现或 Value；
- 后端 API、数据库和订阅生成逻辑；
- 安装核心逻辑；
- `package.json` 或 lockfile。

## 测试状态

- Locale Parity：6/6 通过；
- Unit Test：27 个文件、149/149 tests 通过；
- ESLint：通过；
- TypeScript `vue-tsc --noEmit`：通过；
- Vite production build：通过；
- 真实前端 UI：11 个主要页面、6 个 390px 页面和 7 个关键 Drawer/弹窗通过；
- 基于 `upstream/main` 的隔离 worktree 同步模拟：0 冲突。

## 与 upstream 的关系

Upstream：<https://github.com/deposist/s-ui-x>

本项目持续跟踪 upstream。维护者同步前应先检查新增提交，不要使用 `git reset --hard upstream/main` 覆盖中文提交。

```bash
git fetch upstream
git log HEAD..upstream/main --oneline
```

确认变更范围后，在专用分支或隔离 worktree 中同步 upstream。同步完成后依次执行：

```bash
cd frontend
npm run test -- src/locales/localeParity.test.ts
npm run test
npm run lint
npm run build
```

如果 `en.ts` 新增 key，应同步补齐 `zhcn.ts`，并保持 `ru.ts` 的 key parity；同时复扫新增用户可见硬编码英文。

## 已知限制

1. 本次未在本机真实 Go 面板与数据库环境执行后端 E2E；前端 UI 使用真实 Vite 页面和项目兼容的 API/WebSocket mock 验收。
2. 为保持 Russian Locale 结构一致，本次新增 key 已同步补齐，但部分暂使用英文等值文案；未宣称完成俄语重译。
3. 浏览器语言自动识别尚未加入。
4. 动态后端错误、审计原始值和 sing-box 日志继续保留原文。
5. 当前依赖树既有的 5 个 high severity 问题未在本中文化项目中处理；本次未执行 `npm audit fix`、未升级依赖、未修改 lockfile。

## 版权与许可证

原项目、作者和贡献历史归各自贡献者所有。本 Fork 明确保留上游来源及 [LICENSE](LICENSE)，并遵循 GPL-3.0。请同时遵守上游免责声明，仅将项目用于合法的学习、研究和管理场景。
