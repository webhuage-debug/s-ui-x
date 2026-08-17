# S-UI-X 简体中文增强版 v1.5.11-cn.1

> Release date: 2026-08-17
> Based on upstream: [deposist/s-ui-x v1.5.11](https://github.com/deposist/s-ui-x/releases/tag/v1.5.11)

这是基于 upstream v1.5.11 的首个简体中文增强正式发行版，由「爱分享的华哥」维护。它保留 upstream 的项目结构、GPL-3.0 许可证和核心行为，不是官方中文版，也不是独立重写版本。

## 主要更新

- ✅ 简体中文 Locale 1334/1334，覆盖率 100%
- ✅ English / 简体中文自由切换，语言偏好持久保存
- ✅ 用户可见硬编码英文迁移到现有 Vue I18n
- ✅ 中文术语统一与 Tailscale 等历史误译修正
- ✅ Locale Parity 自动检查 Missing、Extra、Empty 和 Placeholder mismatch
- ✅ 桌面端与 390px 窄屏关键页面、Drawer 和弹窗验收
- ✅ Locale 6/6、Unit 149/149
- ✅ Lint、TypeScript 与 Vite production build 全绿
- ✅ Linux installer 默认从本 Fork 的稳定 GitHub Release 安装
- ✅ Linux tarball SHA-256 校验与终端更新入口

## 核心边界

本发行版没有修改：

- sing-box 核心和生命周期逻辑；
- VLESS、Reality、Hysteria2、AnyTLS、TUIC、ShadowTLS 等协议实现或 Value；
- 后端 API；
- 数据库结构与业务逻辑；
- `package.json` 与 lockfile。

## Linux 安装

在 root shell 中执行：

```bash
bash <(curl -Ls https://raw.githubusercontent.com/webhuage-debug/s-ui-x/main/install.sh)
```

先审阅脚本再执行：

```bash
curl -LO https://raw.githubusercontent.com/webhuage-debug/s-ui-x/main/install.sh
chmod +x install.sh
./install.sh
```

安装器从本仓库最新稳定 Release 识别版本和 CPU 架构，下载对应 `s-ui-linux-<arch>.tar.gz` 与 `.sha256`，校验通过后复用 upstream 的迁移和 systemd 安装流程。

## Release Assets

现有 Tag Workflow 将生成：

- Linux：amd64、arm64、armv7、armv6、armv5、386、s390x；
- 每个 Linux tarball 对应一个 `.sha256`；
- Windows：amd64、arm64；
- Docker：由现有 Tag Workflow 发布到当前仓库的 GHCR。

GitHub 自动生成的 Source code ZIP/TAR 仅为源码，不作为普通用户安装包。

## 更新说明

中文增强版应使用以下方式更新：

```bash
s-ui update
```

或重新执行本 Fork 的一键安装命令。面板内 Web 自更新目前仍跟踪 upstream；不要用它更新中文增强发行版。

## 已知限制

- 未执行真实 Go + DB 后端 E2E；
- Russian 新增部分 key 使用英文等值 fallback；
- 未加入浏览器语言自动识别；
- 动态后端错误和 sing-box 日志仍保持原文；
- 现有 5 个 high severity 前端依赖漏洞未在本项目处理；
- 面板内 Web 自更新仍跟踪 upstream，中文增强版需使用终端更新；
- Linux VPS 一键安装冒烟测试需要用户明确授权的可丢弃测试环境。

## Credits

Upstream：[deposist/s-ui-x](https://github.com/deposist/s-ui-x)

简体中文增强维护：爱分享的华哥

原作者和贡献者信息、Git 历史及 [GPL-3.0 LICENSE](https://github.com/webhuage-debug/s-ui-x/blob/main/LICENSE) 全部保留。
