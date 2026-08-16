# S-UI-X 简体中文增强版

本仓库是基于 [deposist/s-ui-x](https://github.com/deposist/s-ui-x) 的简体中文国际化增强版本。当前同步基线为 upstream `42baef5`（Release v1.5.11）。本项目保留上游代码结构、开源历史和 GPL-3.0 许可证，不是独立原创或脱离 upstream 的重写版本。
简体中文增强维护：**爱分享的华哥**
Upstream：**deposist/s-ui-x**

本项目定位为中文社区维护的国际化增强发行版，不代表 upstream 官方中文版本。

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

## 当前版本

- 中文发行目标：`v1.5.11-cn.1`
- upstream 基线：[deposist/s-ui-x v1.5.11](https://github.com/deposist/s-ui-x/releases/tag/v1.5.11)
- 简体中文 Locale：1334/1334，覆盖率 100%
- 当前状态：代码、文档与安装器已准备；Tag 和 GitHub Release 尚未创建

版本规则保持 upstream 语义。例如 upstream 升级到 `v1.5.12` 后，中文版对应 `v1.5.12-cn.1`；同一 upstream 基线上的中文版修复递增为 `-cn.2`。

## Linux 一键安装

安装前请切换到 root shell。安装器会在开始时执行 `id -u` 检查，非 root 会直接退出。

```bash
bash <(curl -Ls https://raw.githubusercontent.com/webhuage-debug/s-ui-x/main/install.sh)
```

如需先查看脚本再执行：

```bash
curl -LO https://raw.githubusercontent.com/webhuage-debug/s-ui-x/main/install.sh
chmod +x install.sh
./install.sh
```

需要固定首个中文正式版本时：

```bash
bash <(curl -Ls https://raw.githubusercontent.com/webhuage-debug/s-ui-x/main/install.sh) v1.5.11-cn.1
```

> `v1.5.11-cn.1` Tag 与 Release 将在下一阶段经维护者确认后创建。在 Release Assets 发布前，安装器会因找不到本 Fork 的稳定发行物而安全退出，不会回退安装 upstream 或 `main` 分支代码。

## 安装要求

- Linux 与 root 权限；
- systemd 服务管理；
- 可通过 HTTPS 访问 GitHub；
- `/etc/os-release` 或 `/usr/lib/os-release`；
- `curl`、`wget`、`tar`、`sha256sum`。安装器会通过系统包管理器补齐常用依赖；
- upstream 脚本已明确识别 Debian/Ubuntu 系、CentOS、AlmaLinux、Rocky Linux、Oracle Linux、Fedora、Arch Linux、Manjaro、Parch 和 openSUSE Tumbleweed。其他发行版不得据此视为已验证支持。

Release Workflow 实际构建以下 Linux 架构：

```text
amd64  arm64  armv7  armv6  armv5  386  s390x
```

安装器使用 `uname -m` 映射到上述资产名；未知架构会报错退出。

## 安装来源与校验

安装器复用 upstream 的安装、迁移、密钥和 systemd 流程，只将 GitHub Release 来源参数化并默认设为 `webhuage-debug/s-ui-x`。默认安装本 Fork 的 `releases/latest` 稳定版，不会 `git clone main`、运行 `npm install` 或在服务器编译 Go。

每个 Linux tarball 都必须同时存在对应的 `.sha256` 资产。安装器先通过 HTTPS 下载二进制和校验文件，再执行 `sha256sum -c`；校验失败会终止安装。

主要路径：

- 可执行文件与数据库：`/usr/local/s-ui/`
- 管理命令：`/usr/bin/s-ui`
- systemd 服务：`/etc/systemd/system/s-ui.service`
- 加密密钥环境文件：`/etc/s-ui/secretbox.env`
- 安装语言偏好：`/etc/s-ui/lang`

## 更新、状态和日志

首个中文 Release 发布后，可使用同一安装入口更新到本 Fork 最新稳定版：

```bash
s-ui update
```

也可以再次执行一键安装命令；现有数据库与设置由 upstream 安装流程保留。常用命令：

```bash
s-ui status
s-ui log
```

重要：当前面板内“设置 → 维护 → 面板更新”的后端仓库常量仍指向 upstream。阶段 10 为遵守“不修改后端业务逻辑”的边界未改动它。中文增强版用户应使用 `s-ui update` 或本 Fork 的 `install.sh` 更新，避免通过 Web 更新切换到 upstream 发行物。

## 卸载

先备份数据库和重要配置。然后执行：

```bash
s-ui uninstall
```

upstream 管理脚本确认后会停止并禁用 `s-ui.service`，删除 `/etc/s-ui/` 与 `/usr/local/s-ui/`。该操作会删除本机面板数据，不可撤销。

## Release 与下载

- 中文 Releases：<https://github.com/webhuage-debug/s-ui-x/releases>
- Upstream Releases：<https://github.com/deposist/s-ui-x/releases>
- GitHub 自动生成的 Source code ZIP/TAR 仅是源码，不是普通用户安装包。
- 正式安装资产由仓库现有 Tag Workflow 构建并上传，不使用来源不明或手工伪造的二进制。

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
6. 面板内 Web 自更新仍跟踪 upstream；中文增强版应使用终端 `s-ui update` 或本 Fork 的安装器更新。

简体中文增强维护：爱分享的华哥。Upstream、原作者与全部贡献者信息均予保留。

## 版权与许可证

原项目、作者和贡献历史归各自贡献者所有。本 Fork 明确保留上游来源及 [LICENSE](LICENSE)，并遵循 GPL-3.0。请同时遵守上游免责声明，仅将项目用于合法的学习、研究和管理场景。
