# S-UI-X 简体中文国际化实施与治理方案

> **阶段 8 状态附注（2026-08-16）：** 本文主体是阶段 2 制定的实施计划，文中的 1268 / 772 / 496 / 60.9% 和各批次预算均为历史规划数据。阶段 3 至阶段 8 已按批次完成：英文、简体中文和俄文均为 1334 个 key；简体中文 Missing、Extra、Empty、Placeholder mismatch 均为 0，覆盖率为 100.0%。硬编码治理、既有中文审校、真实 UI 验收和隔离 upstream 同步模拟均已执行。

> 当前继续沿用 Vue I18n、`zhHans`、English fallback 和 `localStorage['locale']`；没有建立第二套语言系统，也没有修改后端、API、数据库、sing-box、协议 Value、package manifest 或 lockfile。浏览器语言自动识别和依赖安全修复仍不属于本项目已完成范围。

> 以下正文保留为可审计的原始治理方案与批次设计，不应被解读为当前待完成清单。

> 阶段：阶段 2——中文化架构设计与翻译治理方案
> 基线：`main` / `42baef5bed45a9a5b91d728e7e2250b524e4a41b`
> 范围：设计与治理，不包含阶段 3 的代码实现
> 上游：`deposist/s-ui-x`
> Fork：`webhuage-debug/s-ui-x`

## 1. Current State

项目已经具备 Vue I18n 基础设施和简体中文语言文件，不需要重新引入国际化框架，也不需要调整前端架构。

当前基线统计如下：

| 指标 | 数值 |
| --- | ---: |
| 英文语言键 | 1268 |
| 简体中文语言键 | 772 |
| 简体中文缺失键 | 496 |
| 简体中文多余键 | 0 |
| 简体中文键覆盖率 | 60.9% |
| 未分类缺失键 | 0 |

当前主要问题不是“没有中文”，而是：

1. `zhcn.ts` 只覆盖约六成英文基准键，其余内容依赖英文回退。
2. 部分组件仍存在直接写在模板或脚本中的用户可见英文文本。
3. 少量既有中文存在术语不统一、机器翻译、上下文不准确或品牌大小写不一致。
4. 现有键一致性测试只严格覆盖英文与俄文，未对简体中文建立渐进式防回退门槛。
5. 当前没有浏览器语言自动识别；用户语言由默认英文、手动选择和 `localStorage` 共同决定。

本阶段只形成实施方案，不修改上述运行行为。

## 2. Existing i18n Architecture

前端技术栈为 Vue 3、TypeScript、Vite、Vuetify、Pinia、Vue Router、Vue I18n、Vitest 和 Playwright。

现有国际化链路如下：

```text
frontend/src/locales/en.ts
           │
           ├── 英文基准键与英文回退
           │
frontend/src/locales/zhcn.ts
           │
           ├── 内部 locale code：zhHans
           │
frontend/src/locales/index.ts
           │
           ├── 懒加载语言包
           ├── localStorage 持久化
           ├── fallbackLocale = en
           │
Vue 组件中的 $t(...) / t(...)
```

应保留的架构约束：

- 保留 `en.ts` 作为键结构与默认文案基准。
- 保留 `zhcn.ts` 文件名和内部代码 `zhHans`，不为追求名称一致而改名为 `zh-CN`。
- 保留按需加载、英文回退和现有语言选择器。
- 保留当前嵌套对象结构，不扁平化键，不批量重命名命名空间。
- 保留 Vuetify 与日期格式的现有接入方式，除非后续单独立项处理响应式语言问题。

## 3. zhHans Strategy

采用“原架构内增量补齐”的策略：

1. 将 `en.ts` 视为唯一键基准。
2. 在 `zhcn.ts` 中按业务命名空间分批补齐缺失键。
3. 任何新增用户界面文案先加入 `en.ts`，再加入 `zhcn.ts`，最后替换调用点。
4. 不修改后端响应、数据库字段、配置字段、协议值或 API 契约。
5. 不通过全局字符串替换实现中文化。
6. 中文未覆盖时继续回退英文，保证功能可用。
7. 每个批次控制在可审查范围内，并在批次完成后下调缺失键预算。

此方案新增文件少、调用方式沿用上游，未来同步时主要冲突集中在 `zhcn.ts`，符合长期维护目标。

## 4. Translation Coverage

覆盖率使用扁平化后的叶子字符串键计算：

```text
coverage = zhHans 中存在的英文基准键 / en 中全部基准键
         = 772 / 1268
         = 60.9%
```

治理规则：

- 英文新增键会使缺失数增加，CI 必须及时发现。
- 中文多余键一律视为错误，避免上游删键或改键后留下失效翻译。
- 空字符串、纯空白字符串不计作有效翻译。
- 参数占位符必须与英文保持相同名称，例如 `{name}`、`{count}` 不得丢失或改名。
- 英中相同文本不自动判错，因为协议名、品牌、单位和缩写本来就应保持英文；通过人工白名单式审查处理。

完成全部现有缺失键后，目标为：

| 指标 | 目标 |
| --- | ---: |
| 缺失键 | 0 |
| 多余键 | 0 |
| 空翻译 | 0 |
| 占位符差异 | 0 |
| 键覆盖率 | 100% |

## 5. Missing Key Classification

所有 496 个缺失键均按其顶层命名空间确定优先级。下表是完整分类清单；表内命名空间覆盖全部缺失键，合计 496，未分类为 0。

| 优先级 | 顶层命名空间 | 缺失数 | 分类理由 |
| --- | --- | ---: | --- |
| P0 | `actions` | 3 | 高频通用操作 |
| P0 | `nav` | 1 | 全局导航 |
| P0 | `pages` | 2 | 页面标题与入口 |
| P0 | `table` | 3 | 高频列表反馈 |
| P0 | `setting` | 45 | 核心设置页 |
| P0 | `delivery` | 8 | 订阅交付 |
| P0 | `main` | 2 | 仪表盘核心信息 |
| P0 | `nexus` | 9 | 主界面常用能力 |
| P0 | `admin` | 1 | 管理入口 |
| P0 | `audit` | 2 | 常用审计入口 |
| P1 | `basic` | 18 | 常用基础配置 |
| P1 | `dns` | 5 | 常用 DNS 配置 |
| P1 | `rule` | 22 | 常用路由规则 |
| P1 | `ruleset` | 2 | 规则集配置 |
| P1 | `tls` | 9 | 常用 TLS 配置 |
| P1 | `telegram` | 25 | 通知与机器人管理 |
| P1 | `doctor` | 10 | 诊断与修复反馈 |
| P2 | `paidSub` | 99 | 付费订阅完整功能域 |
| P2 | `regionalPresets` | 52 | 区域预设，使用频率较低 |
| P2 | `presets` | 19 | 高级预设管理 |
| P2 | `types` | 24 | 高级类型与协议配置 |
| P3 | `singbox` | 93 | 高级 sing-box 配置与说明 |
| P3 | `update` | 24 | 更新维护流程 |
| P3 | `donations` | 9 | 非核心捐赠界面 |
| P3 | `migrateXui` | 9 | 低频迁移工具 |
| **合计** | **25 个命名空间** | **496** | **未分类 0** |

优先级合计：

| 优先级 | 数量 | 占全部缺失键 |
| --- | ---: | ---: |
| P0 | 76 | 15.3% |
| P1 | 91 | 18.3% |
| P2 | 194 | 39.1% |
| P3 | 135 | 27.2% |
| **合计** | **496** | **100%** |

命名空间分类优于逐条主观标注：规则可重复执行、可审计，也便于上游新增键自动继承业务优先级。若某命名空间未来出现明显不同优先级的新页面，可在批次评审时记录例外，但不得让键处于未分类状态。

## 6. Translation Priority

优先级定义：

- **P0：核心可用性。** 用户首次登录即可看到，或直接影响导航、保存、设置、订阅交付和核心反馈。
- **P1：高频配置。** DNS、路由规则、TLS、基础配置、Telegram 通知和诊断等常见管理任务。
- **P2：高级业务。** 付费订阅、预设、区域预设、类型与协议相关的高级界面。
- **P3：低频与维护。** 高级 sing-box 说明、更新、捐赠和迁移工具。

同一优先级内部遵循以下次序：

1. 页面标题、导航和主操作。
2. 表单标签和选项标题。
3. 验证错误、成功/失败反馈和确认提示。
4. 帮助说明、占位提示和长文本。

协议是否高级不影响技术名称保留英文；优先级只决定翻译实施顺序。

## 7. Chinese Terminology Guide

### 核心界面术语

| English | 简体中文 | 使用说明 |
| --- | --- | --- |
| Dashboard | 仪表盘 | 不使用“控制台”“仪表板”混写 |
| Inbound | 入站 | 单个对象或配置字段 |
| Inbounds | 入站管理 | 菜单、页面标题 |
| Outbound | 出站 | 单个对象或配置字段 |
| Outbounds | 出站管理 | 菜单、页面标题 |
| User | 用户 | 单个用户 |
| Users | 用户管理 | 管理页面；若原业务实际指客户端，按上下文处理 |
| Subscription | 订阅 | 单项或一般概念 |
| Subscriptions | 订阅管理 | 管理页面 |
| Settings | 设置 | 不扩写为“系统设置”，除非页面确为系统级 |
| Logs | 日志 | 页面或功能 |
| Protocol | 协议 | 技术名本身不翻译 |
| Port | 端口 | 端口号仍保留原数值 |
| Transport | 传输 | 需要解释时可用“传输方式” |
| Security | 安全 | 分组标题可用“安全设置” |
| Status | 状态 | 避免“状况” |
| Traffic | 流量 | 网络流量语境 |
| Statistics | 统计 | 页面标题可用“统计信息” |
| Network | 网络 | 保持简洁 |
| Routing / Route | 路由 | 动作按上下文使用“路由到” |
| Rule / Rules | 规则 | 菜单可用“路由规则” |
| Certificate | 证书 | 单个证书 |
| Certificates | 证书管理 | 管理页面 |
| Server | 服务器 | 不使用“服务端”，除非表达角色对比 |
| Client | 客户端 | 连接端；不能机械替换业务中的“用户” |
| Address | 地址 | IP/域名由上下文说明 |
| Listen | 监听 | 配置动作 |
| Dial | 拨号 | 出站连接配置 |

### 常用操作术语

| English | 简体中文 |
| --- | --- |
| Add / Create | 添加 / 创建 |
| Edit | 编辑 |
| Delete | 删除 |
| Save | 保存 |
| Cancel | 取消 |
| Confirm | 确认 |
| Submit | 提交 |
| Enable | 启用 |
| Disable | 禁用 |
| Import | 导入 |
| Export | 导出 |
| Download | 下载 |
| Upload | 上传 |
| Copy | 复制 |
| Refresh | 刷新 |
| Restart | 重启 |
| Search | 搜索 |
| Reset | 重置 |
| Close | 关闭 |

### 既有中文质量修正规则

后续质量批次应处理但本阶段不改代码的典型问题：

- 布尔显示的 `yes: 确认`、`no: 取消` 应改为“是”“否”；确认按钮使用独立操作键。
- `noData: 无数据！` 与 `table.noData: 暂无数据` 应按上下文统一，并减少不必要感叹号。
- `Sing-Box`、`Singbox` 统一为官方写法 `sing-box`。
- `main.gauges: 仪表板` 应为“仪表”；Dashboard 才使用“仪表盘”。
- `Disk 仪表`、`Swap 仪表`、`Disk I/O` 应分别自然化为“磁盘仪表”“交换空间仪表”“磁盘 I/O”。
- `DNS规则` 应使用中英文间距：`DNS 规则`。
- Tailscale 的 `Advertise routes/exit node` 不能误译为“广告路由/广告出口节点”，建议“发布路由/发布出口节点”。
- “可管理的”作为表单标签应简化为“可管理”。
- TLS 分片相关标签必须说明对象，不能全部只译为“启用”。

## 8. Technical Terms That Remain English

以下标准名称、协议、产品、缩写和配置格式保持英文，不做字面翻译：

```text
S-UI-X, sing-box, Xray, VLESS, VMess, Reality, Hysteria2,
AnyTLS, TUIC, ShadowTLS, TLS, UUID, SNI, ALPN, WebSocket,
gRPC, TCP, UDP, QUIC, DNS, DoH, DoT, IPv4, IPv6, API, URL, IP
```

同类保留项还包括：

```text
HTTP, HTTPS, SSH, STUN, DTLS, NTP, uTLS, ACME, ECH,
Clash, Mihomo, Hiddify, Telegram, Tailscale, WireGuard,
Cron, JSON, YAML
```

技术名可与中文说明组合，例如：

- `Reality 配置`
- `Hysteria2 伪装`
- `TLS 证书`
- `Clash 配置`
- `WireGuard 二维码`
- `TCP Fast Open`

不得翻译或修改协议枚举值、配置字段名、密码套件、浏览器指纹值、日志等级、URL、示例域名、文件名和时区值。

## 9. Hard-coded UI Text Strategy

硬编码治理分三类进行，不与 496 个现有缺失键混为一批。

### 必须迁移到 i18n

- `Settings.vue` / `Basics.vue` 中的用户可见分组标题，例如 Basics、Security & Maintenance、Subscription Toggles、JSON Configuration、NTP settings、Experimental settings。
- `PaidSubscriptions.vue` 中的 `Refund processed`；优先复用已有 `paidSub.refund.done`，不重复造键。
- `Listen.vue` / `Dial.vue` 中的 TCP Fast Open、TCP Multi Path、UDP Fragment、UDP NAT expiration 等可见标签；缩写保留英文，说明中文化。
- `Rule.vue` 中的 `Client fingerprint`。
- `Hysteria2.vue` 中的 Masquerade、File server、Reverse Proxy、Fixed response、HTTP Code、Target URL、Rewrite Host、Content 等用户可见文案。
- TLS 抽屉和弹窗中的通用说明、客户端认证选项、最大时间差、指纹等用户可见标签。
- `auditMapper.ts` 中的 Login succeeded、Login failed、Audit event 等客户端生成的显示文案。
- `layouts/modals` 中的规则动作、DNS 动作、网络策略、客户端认证、Ruleset 来源和 WireGuard 二维码等可见文本。

迁移规则：先在 `en.ts` 的最近业务命名空间加入英文键，再在 `zhcn.ts` 加入中文键，最后替换调用点。已有键可表达同一语义时必须复用。

### 不迁移、不翻译

- `NTP`、`Clash API`、`V2Ray API`、JSON、URL 等技术标题或格式名。
- HTTP、TLS、QUIC、STUN、DNS、BitTorrent、DTLS、SSH、RDP 等协议名。
- H2/H3、SNI、ALPN、UUID、Short ID、密码套件、浏览器品牌和指纹值。
- `example.com`、`time.apple.com`、`Europe/Moscow`、`box.log`、`cache.db` 等占位示例或真实值。
- `DEBUG`、`INFO`、`WARNING`、`ERROR` 等日志等级。
- 后端字段名、枚举提交值、路由动作值和配置 JSON 键。

### 需要进一步确认后再处理

- 后端返回的 `item.status`：若状态是稳定枚举，在前端建立枚举到翻译键的映射；未知值显示原文，不改变提交值。
- 后端错误文本：稳定错误代码可映射；任意原始错误消息保留，避免误导诊断。
- 审计事件的资源名和详情：只翻译稳定事件类型，不改原始载荷和可追溯字段。
- Client/User 等受业务模型影响的词：结合具体页面实体判断，不能全局替换。

## 10. en.ts / zhcn.ts Maintenance Rules

1. `en.ts` 是结构基准，`zhcn.ts` 是同构翻译，不反向以中文文件定义公共键。
2. 现有 496 个缺失键只修改 `zhcn.ts`，不为翻译而改写 `en.ts`。
3. 抽取硬编码时，才允许向 `en.ts` 添加新键，并必须同步添加中文值。
4. 新键进入最接近的现有命名空间；不得创建含义重复的通用键。
5. 保留上游键名，包括不理想或拼写有误的历史键，例如不得在本项目中单独重命名 `domainSufix`。
6. 不合并近义键：根级 `enable/disable` 与 `actions.*`、根级 `noData` 与 `table.noData`、`pages.*` 与 `objects.*` 均保留，因为它们的上下文和上游调用点不同。
7. 中文字符串使用简体中文标点；技术名与中文之间通常留一个半角空格，如 `DNS 规则`。
8. 不在翻译值中改写变量、HTML 标签、转义序列、命令、路径或占位符。
9. 协议品牌大小写遵循官方写法，尤其统一 `sing-box`、`Hysteria2`、`AnyTLS`、`Reality`。
10. 每批翻译只包含一个明确范围，避免与格式化、重构或功能修改混合提交。

## 11. Key Parity Strategy

当前 496 个缺失键不能立即采用“缺失必须为 0”的严格门禁，否则现有主分支会持续失败。采用可递减预算：

```text
初始缺失预算：496
每完成一批：预算必须下降到该批完成后的实际值
最终预算：0，并切换为严格空列表断言
```

门禁分为：

- **现阶段严格：** 多余键为 0、空白翻译为 0、占位符差异为 0。
- **迁移期渐进：** 缺失数不得大于当前预算，并在失败信息中打印缺失键。
- **完成后严格：** 缺失键和多余键都必须是空列表。

预算机制能阻止缺失数继续增加，但仅比较数量可能无法发现“一项新增、一项补齐”后净数量不变的替换。补救措施是：

1. 测试失败信息完整输出缺失键。
2. 每个翻译批次都下调固定预算。
3. 同步上游时审查 `en.ts` 的键差异。
4. 最终尽快收敛到零缺失，消除预算期盲点。

## 12. localeParity.test.ts Design

不新增第二套测试文件；阶段 3 在现有 `frontend/src/locales/localeParity.test.ts` 中扩展。

设计要点：

```ts
const ZH_HANS_MISSING_BUDGET = 420 // 阶段 3 完成 P0 后

// 复用现有 flatten 逻辑，将 en 与 zhcn 展平为 Record<string, string>
// 1. zhcn 多余键必须为 []
// 2. zhcn 空值或纯空白值必须为 []
// 3. zhcn 缺失数 <= 当前预算，并在错误中列出键名
// 4. 相同键的 {placeholder} 名称集合必须一致
// 5. 预算到 0 后，缺失键改为严格 expect(missing).toEqual([])
```

具体建议：

- 从 `./zhcn` 导入简体中文语言包，与现有英文/俄文测试共存。
- `flatten` 返回键值映射，而不只是键数组，以便检测空值和占位符。
- 占位符检测比较名称集合，不比较中文句子中的位置；同一占位符重复次数如有语义作用则比较计数。
- 断言错误应包含当前预算、实际缺失数和缺失键列表，方便维护者直接定位。
- 不把“英中字符串相同”设为自动失败，因为技术名称、单位与品牌合理相同。
- TypeScript 对对象字面量重复键已有编译检查，不为此引入新的解析依赖。

该测试只检查语言资源，不改变生产运行时，也不需要新增 npm 依赖。

## 13. Browser Language Detection Decision

决定：**延期（Defer）**，不纳入阶段 3。

理由：

1. 当前手动语言切换和 `localStorage` 持久化已经可用。
2. 496 个缺失键和既有翻译质量比自动识别更直接影响用户体验。
3. 自动识别需要修改启动逻辑，并需同时评估 Vuetify 和日期格式的初始化/响应式行为，扩大测试面。
4. 当前默认英文与英文回退是安全行为，不会阻塞功能。
5. 将其作为独立小功能更便于上游合并和故障回滚。

未来实施优先级应为：

```text
已保存的 localStorage 选择
  > navigator.languages / navigator.language
  > English
```

建议映射：

- `zh-CN`、`zh-SG`、`zh-Hans*` → `zhHans`
- `zh-TW`、`zh-HK`、`zh-MO`、`zh-Hant*` → `zhHant`
- 其他语言按现有支持列表精确匹配，无法匹配则使用英文。

## 14. Fallback Policy

继续使用英文作为唯一运行时回退语言：

```text
selected locale → English fallback → key name / Vue I18n 默认诊断
```

规则：

- 不使用简体中文回退到繁体中文，反之亦然，避免术语和地区表达混合。
- 缺少中文时显示官方英文优于显示空白、猜测翻译或隐藏功能。
- 后端原始错误和未知枚举保留原文，同时可在外围增加已翻译的说明标题。
- 语言选择必须始终允许切回 English，不强制中文。
- 回退只解决运行安全，不应成为长期缺失翻译的替代方案。

## 15. Translation Batch Plan

按实际命名空间边界安排 7 个批次。优先保证易审查和低冲突，不为机械满足固定条数而拆散同一功能域。

| 批次 | 内容 | 现有缺失键数 | 完成后预算 | 主要修改范围 |
| --- | --- | ---: | ---: | --- |
| 1 | P0 全部 | 76 | 420 | `zhcn.ts` |
| 2 | P1 全部 | 91 | 329 | `zhcn.ts` |
| 3 | P2 `paidSub` | 99 | 230 | `zhcn.ts` |
| 4 | P2 `regionalPresets` + `presets` + `types` | 95 | 135 | `zhcn.ts` |
| 5 | P3 `singbox` | 93 | 42 | `zhcn.ts` |
| 6 | P3 `update` + `donations` + `migrateXui` | 42 | 0 | `zhcn.ts` |
| 7 | 硬编码抽取与既有翻译质量修正 | 按审查清单 | 0 | `en.ts`、`zhcn.ts`、选定组件与映射器 |

批次 1 至 6 只补齐既有英文键，不触碰组件。批次 7 再处理冲突概率较高的调用点，使上游同步影响清晰可控。

每个批次应交付：

1. 本批键列表和术语检查记录。
2. 更新后的缺失预算。
3. 单元测试、lint、类型检查和构建结果。
4. 英文界面回归结果。
5. 只包含该批范围的 Git diff。

## 16. Testing Strategy

### 每个翻译批次的自动测试

建议从前端目录执行：

```bash
npm run test -- src/locales/localeParity.test.ts
npm run test
npm run lint
npm run build
```

验证内容：

- locale 文件能被 TypeScript 正确导入。
- 缺失数不超过当前预算，多余键、空值和占位符差异为 0。
- 现有语言加载和 `localStorage` 行为不退化。
- Vue 模板与 TypeScript 类型检查通过。
- 生产构建成功，无新增运行时依赖。

### 界面冒烟测试

- English 与简体中文可以双向切换，刷新后选择保持。
- 仪表盘、入站管理、出站管理、用户管理、设置、日志和订阅页面可打开。
- 中文无乱码、截断、明显溢出或缺失插值参数。
- 表单保存、取消、删除确认和错误提示语义准确。
- English 模式仍显示原英文，未被中文硬编码污染。

### 功能与兼容性回归

翻译批次不应改变业务行为，但最终仍需覆盖：

- 创建、修改、删除用户。
- 创建、修改、删除节点/入站/出站。
- 生成订阅并在支持的客户端导入。
- 查看日志和错误提示。
- sing-box 正常启动与读取配置。
- AnyTLS、Hysteria2、Reality 等技术配置的值和提交载荷不变。

涉及真实服务或破坏性数据的端到端测试必须使用隔离测试环境，不得在生产数据上执行。

## 17. Upstream Merge Strategy

保持上游同步能力的核心是把变化分成两类：

| 变化类型 | 冲突概率 | 策略 |
| --- | --- | --- |
| 仅补 `zhcn.ts` | 低到中 | 按命名空间小批提交 |
| 抽取组件硬编码 | 中 | 单独批次、逐文件提交、优先复用上游已有键 |

同步流程建议：

```bash
git fetch upstream
git merge --no-commit --no-ff upstream/main
# 检查冲突与 diff 后，取消模拟合并或在专用测试分支完成验证
```

安全要求：

- 不在包含未提交用户改动的工作区模拟合并。
- 合并测试使用临时分支或独立 worktree，避免污染主开发分支。
- 重点检查 `en.ts` 是否新增/删除/移动键，以及被抽取组件是否被上游改写。
- 上游已增加等价 i18n 键时，采用上游键并删除社区版重复键。
- 不为减少冲突而复制或重写上游组件。
- 不自动提交模拟合并结果。

## 18. Stability Guardrails

### 禁止变更

- 不修改 sing-box、Xray 或任何协议实现。
- 不修改后端 API、数据库结构、鉴权逻辑和订阅生成逻辑。
- 不修改配置 JSON 字段、枚举值、协议名、端口、UUID、URL 或证书数据。
- 不引入新的国际化库或运行时依赖。
- 不大规模重排、格式化或重构语言文件和组件。
- 不删除作者、LICENSE、上游地址或版权信息。

### 变更控制

- 翻译值变更与功能代码变更分开。
- 每批先检查 Git 工作区，发现范围外改动立即停止。
- 仅对用户可见文本调用 `$t`/`t`；提交值仍使用原常量。
- 动态后端内容采用显示映射，不覆写原值。
- 每个组件抽取前确认文案是否真的是 UI，而非协议名、测试夹具、占位符或配置值。
- 任一批次构建或测试失败，不进入下一批。

### 风险评级

| 风险 | 等级 | 缓解措施 |
| --- | --- | --- |
| 功能稳定性 | 低 | 前 6 批只改翻译值；完整构建与测试 |
| 上游冲突 | 中 | 小批提交；硬编码抽取单独进行 |
| 翻译一致性 | 中 | 术语表、命名空间评审、质量修正批次 |
| 运行时回退 | 低 | 保留 English fallback 与现有选择机制 |
| 动态后端文案 | 中 | 稳定枚举映射，未知值保留原文 |

## 19. Stage 3 Implementation Scope

阶段 3 建议只实施最小、可验证的第一批，不跨入全面中文化：

### 允许修改

1. `frontend/src/locales/zhcn.ts`
   - 补齐 P0 的 76 个缺失键。
   - 按本术语表翻译，不改键名或对象结构。
2. `frontend/src/locales/localeParity.test.ts`
   - 加入 zhHans 渐进式一致性检查。
   - 将完成 P0 后的缺失预算设为 420。
   - 严格检查多余键、空值和占位符。

### 明确不做

- 不修改 `en.ts`。
- 不抽取组件硬编码。
- 不处理 P1/P2/P3。
- 不实现浏览器语言自动识别。
- 不修改后端或协议逻辑。
- 不安装依赖，不提交，不推送，除非收到阶段内的明确授权。

### 阶段 3 验收

- 英文键仍为 1268；简体中文键达到 848；缺失键降至 420；多余键为 0。
- 76 个 P0 键全部通过人工术语复核。
- locale parity、完整单元测试、lint 和 build 通过。
- English 与简体中文切换及刷新持久化正常。
- Git diff 仅包含上述两个前端文件和阶段文档允许的既有改动。

## 20. Final Recommendation

S-UI-X 已有成熟的 Vue I18n 基础，最稳妥的路线不是重建语言系统，而是在现有 `zhHans` 架构内逐步补齐翻译并建立防回退门禁。

推荐执行顺序为：

```text
P0 76 键 + 渐进式 parity 测试
  → P1 91 键
  → P2 194 键
  → P3 135 键
  → 缺失预算归零
  → 单独抽取硬编码与修正既有中文质量
  → 独立评估浏览器语言自动识别
```

这一路线把高价值中文体验优先交付，把冲突较高的组件修改后置，并始终保留英文回退和上游结构。阶段 2 到此结束；未经确认，不进入阶段 3。
