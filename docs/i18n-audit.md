# S-UI-X i18n Audit

> **阶段 8 状态附注（2026-08-16）：** 本文主体保留阶段 1 的审计基线，文中的 1268 / 772 / 496 / 60.9% 是实施前历史数据，不代表当前状态。阶段 3 至阶段 8 完成后，英文、简体中文和俄文语言资源均为 1334 个 key；简体中文 Missing、Extra、Empty、Placeholder mismatch 均为 0，覆盖率为 100.0%。运行时仍保留 English fallback，内部简体中文代码仍为 `zhHans`，语言偏好仍存储于 `localStorage['locale']`。最终变更未涉及 Go 后端、API、数据库、sing-box、协议 Value、`package.json` 或 lockfile。

> 阶段 8 已在 1440px 桌面端和 390px 窄屏完成真实 Vite UI 验收，并以基于 `upstream/main` 的隔离 detached worktree 验证完整补丁可无冲突应用。由于本机未安装 Go，真实 Go 面板启动和后端数据写入流程未在本阶段重跑；前端验收使用项目现有 Playwright 依赖及与项目 E2E 结构一致的 API/WebSocket mock。

> 以下章节继续作为架构决策、初始缺口和实施依据的历史审计记录。

## 1. Repository Status

- Repository root: `C:\Users\陈华\Documents\Codex\2026-08-15\s-ui-x`
- Fork / `origin`: `https://github.com/webhuage-debug/s-ui-x.git`
- Upstream: `https://github.com/deposist/s-ui-x.git`
- Branch: `main`
- Current commit: `42baef5bed45a9a5b91d728e7e2250b524e4a41b` (`Release v1.5.11`)
- `upstream/main`: `42baef5bed45a9a5b91d728e7e2250b524e4a41b`
- Audit baseline: the fork and `upstream/main` are identical; the worktree was clean before this report was created.

This audit is read-only with respect to application code. The only project file added in Phase 1 is this report.

## 2. Frontend Technology Stack

The frontend is a Vue single-page application under `frontend/`. Versions below are the exact versions resolved by `frontend/package-lock.json`; the declared ranges remain in `frontend/package.json`.

| Area | Technology | Resolved version |
| --- | --- | --- |
| UI framework | Vue | 3.5.35 |
| Language | TypeScript | 6.0.3 |
| Build tool | Vite | 8.0.16 |
| Vue build plugin | `@vitejs/plugin-vue` | 6.0.7 |
| Component library | Vuetify | 4.1.0 |
| Vuetify build plugin | `vite-plugin-vuetify` | 2.1.3 |
| State management | Pinia | 3.0.4 |
| Router | Vue Router | 5.1.0 |
| Localization | Vue I18n | 11.4.4 |
| Notifications | Notivue | 2.4.5 |
| HTTP client | Axios | 1.17.0 |
| Unit tests | Vitest | 4.1.8 |
| E2E tests | Playwright | 1.60.0 |
| Lint | ESLint | 10.4.1 |
| Styles | Sass + Vuetify SCSS | 1.100.0 |

The project uses Vue Single-File Components (`.vue`), TypeScript modules, route-based lazy loading, two selectable UI shells (Classic and Nexus), and Pinia stores.

## 3. Frontend Directory Structure

Relevant repository roots actually present:

```text
api/              Go API handlers
app/              Go application bootstrap
cmd/              Go commands and migrations
config/           Go application configuration
core/             sing-box lifecycle/core integration
database/         database models and persistence
docs/             project documentation
frontend/         Vue frontend
service/          Go business services/config generation
sub/              subscription generation
tests/            backend/E2E support
web/              embedded web server
```

Relevant frontend structure actually present:

```text
frontend/
├── public/
├── scripts/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── nexus/
│   │   ├── presets/
│   │   ├── protocols/
│   │   ├── services/
│   │   ├── settings/
│   │   ├── tiles/
│   │   ├── tls/
│   │   └── transports/
│   ├── layouts/
│   │   ├── default/
│   │   ├── modals/
│   │   └── nexus/
│   ├── locales/
│   ├── plugins/
│   ├── router/
│   ├── store/
│   ├── styles/
│   ├── types/
│   ├── uiMode/
│   └── views/
├── tests/e2e/
├── package.json
├── package-lock.json
├── vite.config.mts
├── vitest.config.ts
└── playwright.config.ts
```

The following searched conventions do not exist as separate directories: `pages`, `routes`, `stores`, `hooks`, `composables`, `utils`, `constants`, `locale`, `lang`, `languages`, `i18n`, and `translations`. The project uses `views`, `router`, `store`, and `locales` instead.

Primary UI source locations are `frontend/src/views`, `frontend/src/components`, and `frontend/src/layouts`.

## 4. Existing Localization / i18n Status

Classification: **A. Existing complete i18n framework, with a partially maintained Simplified Chinese resource.**

The application already uses Vue I18n. `frontend/src/main.ts` loads locale messages before mounting and installs the `i18n` plugin. `frontend/src/locales/index.ts` owns locale registration, lazy loading, selection, persistence, and fallback.

Registered application locales:

| Internal code | Resource | Display name |
| --- | --- | --- |
| `en` | `frontend/src/locales/en.ts` | English |
| `fa` | `frontend/src/locales/fa.ts` | فارسی |
| `vi` | `frontend/src/locales/vi.ts` | Tiếng Việt |
| `zhHans` | `frontend/src/locales/zhcn.ts` | 简体中文 |
| `zhHant` | `frontend/src/locales/zhtw.ts` | 繁體中文 |
| `ru` | `frontend/src/locales/ru.ts` | Русский |

Important findings:

- Simplified Chinese is already registered and selectable. Internally it is named `zhHans`, not `zh-CN`; date formatting maps it to `zh-cn`.
- English is the source/fallback locale.
- English messages are always loaded before a selected non-English locale.
- Locale resources are lazy-loaded with dynamic imports.
- Unsupported stored values normalize to English.
- `frontend/src/locales/index.test.ts` verifies default loading, stored locale loading, locale persistence, Simplified Chinese loading, and unsupported-locale fallback.
- `frontend/src/locales/localeParity.test.ts` enforces full parity only between English and Russian. Its comment explicitly states that Simplified Chinese and several other locales intentionally fall back to English for newer keys.

Coverage measured by evaluating the locale objects and flattening their keys:

```text
English keys:              1268
Simplified Chinese keys:    772
Keys covered:               772
Keys missing from zh-CN:    496
Extra zh-CN-only keys:        0
Coverage:                  60.9%
```

Largest missing-key groups:

| Prefix | Missing keys |
| --- | ---: |
| `paidSub` | 99 |
| `singbox` | 93 |
| `regionalPresets` | 52 |
| `setting` | 45 |
| `telegram` | 25 |
| `update` | 24 |
| `types` | 24 |
| `rule` | 22 |
| `presets` | 19 |
| `basic` | 18 |

There is no need and no justification to introduce a second i18n framework. The safe project scope is to complete and refine the existing `zhcn.ts` resource and extract remaining frontend hard-coded strings into the existing key system.

## 5. Current UI Text Distribution

The application is already strongly key-based:

- Approximately 2,143 template `$t(...)` calls were found in `.vue` files.
- Approximately 217 programmatic `i18n.global.t(...)` calls were found.
- `useI18n()` is used in Composition API components.
- Route names are translation keys (`pages.*`).
- Most form labels, table headings, buttons, tooltips, dialog text, and notifications already use locale keys.

Text is distributed across:

1. Global and domain dictionaries in `frontend/src/locales/en.ts` and locale counterparts.
2. Route and menu translation keys in `frontend/src/router/index.ts`, `frontend/src/layouts/default/Drawer.vue`, and `frontend/src/layouts/nexus/nexusMenu.ts`.
3. Page-level templates in `frontend/src/views`.
4. Shared forms and protocol components in `frontend/src/components`.
5. Modal and drawer forms in `frontend/src/layouts/modals` and `frontend/src/components/nexus/drawers`.
6. Frontend notification code in stores, views, modal actions, and `frontend/src/plugins/httputil.ts`.
7. Backend/API and sing-box error/log strings, which are dynamic data rather than frontend locale resources.

Remaining direct English UI examples were found in:

- `frontend/src/views/Settings.vue`: section headings such as `Security & Maintenance`, `Subscription Toggles`, `JSON Configuration`, `Clash Configuration`, and `Experimental settings`.
- `frontend/src/views/Basics.vue`: `NTP`, `Experimental`, `Clash API`, and `V2Ray API` headings.
- `frontend/src/components/Listen.vue` and `frontend/src/components/Dial.vue`: TCP/UDP option labels.
- `frontend/src/components/Rule.vue`, `frontend/src/layouts/modals/Rule.vue`, and `frontend/src/layouts/modals/DnsRule.vue`: display titles paired with stable values.
- `frontend/src/layouts/modals/Tls.vue` and `frontend/src/components/nexus/drawers/TlsDrawer.vue`: TLS client-auth and fingerprint display titles.
- `frontend/src/layouts/modals/Client.vue`: display labels such as `Password`, `UUID`, `Flow`, and `Auth`.
- `frontend/src/components/protocols/Hysteria2.vue`: masquerade-mode titles (`File server`, `Reverse Proxy`, `Fixed response`).
- `frontend/src/components/nexus/overview/selectors/auditMapper.ts`: hard-coded English audit event summaries.
- `frontend/src/views/paidsub/PaidSubscriptions.vue`: at least one hard-coded success message (`Refund processed`).

Not every English-looking token is a translation defect. Brand names, protocol names, acronyms, log levels, URLs, filenames, identifiers, and configuration values must remain unchanged.

## 6. Navigation and Menu Text

Navigation is already designed around translation keys.

- Router: `frontend/src/router/index.ts`
  - Route names are keys such as `pages.home`, `pages.inbounds`, and `pages.settings`.
  - Translation does not change URL paths, route guards, or component imports.
- Nexus menu: `frontend/src/layouts/nexus/nexusMenu.ts`
  - Group labels use `nav.groups.*`.
  - Menu item titles use `pages.*`.
  - Paths and store count keys are separate from display titles.
- Nexus renderer: `frontend/src/layouts/nexus/NexusSidebar.vue`
  - Calls `$t(group.labelKey)` and `$t(item.title)`.
- Classic menu: `frontend/src/layouts/default/Drawer.vue`
  - Uses the same `pages.*` keys.

The main navigation can therefore be completed by editing `frontend/src/locales/zhcn.ts` only. No Router behavior change is required. Two current Simplified Chinese gaps affect navigation: `pages.paidSub` and `pages.donations`; `nav.groups.support` is also absent and currently falls back to English.

## 7. Common UI Actions

Common actions are centralized under `actions.*` in the locale resources and reused across many views/components. Existing Simplified Chinese translations already cover most actions, including Add, Edit, Delete, Save, Update, Submit, Close, Generate, and bulk operations.

Three English action keys are currently missing from `zhcn.ts`:

```text
actions.cancel
actions.diagnose
actions.refresh
```

These should be added to the existing Simplified Chinese object. Shared buttons should continue using translation keys. Direct strings should be extracted into `en.ts` and `zhcn.ts` only where the text is genuinely user-facing, not a technical value.

## 8. Toast / Dialog / Error Text

Frontend-local messages are mostly localized through Vue I18n and Notivue:

- `frontend/src/components/message.vue` renders notifications.
- `frontend/src/store/modules/data.ts` builds localized success/duplicate-data messages.
- Views and modal components call `push.success`, `push.warning`, and `push.error`, generally with translation keys.
- Confirm UI exists in `frontend/src/components/nexus/primitives/ConfirmDialog.vue`, `ConfirmHost.vue`, and `useConfirm.ts`.

Backend boundary:

- The API contract is `api.Msg` with `{ success, msg, obj }` in `api/utils.go`.
- `frontend/src/plugins/httputil.ts` translates known successful action names as `actions.<msg>`.
- Failed API `msg` strings are generally displayed verbatim.
- Login can display the backend-provided failure reason verbatim.
- sing-box warnings/errors and logs are deliberately displayed as original diagnostic text.

Therefore:

- Frontend-owned toast/dialog/validation text should use locale keys.
- Known stable backend error classes may be mapped to frontend translation keys without changing the API value.
- Arbitrary backend errors, protocol errors, paths, SQL-safe redacted details, and sing-box logs must not be translated by modifying the backend or response schema.
- The audit found direct frontend text such as `Refund processed` and audit event descriptions that should be extracted to locale keys.

## 9. Protocol-related UI Labels

Protocol configuration values are defined in TypeScript, primarily:

- `frontend/src/types/inbounds.ts`
- `frontend/src/types/outbounds.ts`
- `frontend/src/types/transport.ts`
- `frontend/src/types/tls.ts`

The important protocols use stable lowercase values such as:

```text
vless
hysteria2
anytls
tuic
shadowtls
vmess
```

Selectors generally construct separate objects in the form `{ title, value }`. For example, protocol selectors use human-readable enum property names as `title` and immutable protocol strings as `value`. Rule, DNS, TLS, transport, and network selectors also commonly separate title and value.

This separation is sufficient for safe localization: translate only display titles/labels and never mutate `value`, `type`, `protocol`, `tag`, IDs, JSON property names, or generated configuration.

Names that must remain English/standardized:

```text
VLESS
VMess
Reality
Hysteria2
AnyTLS
TUIC
ShadowTLS
TLS
UUID
SNI
ALPN
WebSocket
gRPC
TCP
UDP
QUIC
DNS
DoH
DoT
IPv4
IPv6
sing-box
Xray
```

Technical composites may be localized around the preserved term, for example `Reality 设置`, `AnyTLS 入站`, and `TLS 证书`.

The current source has inconsistent casing such as `AnyTls`, `Singbox`, and `Sing-Box` in some display text. A later translation-quality pass should normalize display terminology without changing the underlying values.

## 10. Frontend / Backend Boundary

Menus, route titles, pages, form labels, action buttons, tooltips, frontend dialogs, and frontend validation are owned by the Vue application. They can be localized entirely inside `frontend/`.

The Go backend owns:

- API data and the `{ success, msg, obj }` response contract.
- Database models and migrations.
- sing-box configuration generation and lifecycle.
- Inbound/outbound/service/subscription business logic.
- Dynamic errors, logs, audit data, and protocol diagnostics.
- Static SPA serving and embedding.

Some visible strings originate from the backend (`msg`, log lines, sing-box errors, and dynamic status/audit content). They should remain raw unless a stable frontend mapping already exists. No backend change is required to complete the ordinary UI localization.

Coverage conclusion: pure frontend work can cover all static navigation, page, form, action, hint, dialog, and frontend notification text. It cannot and should not rewrite arbitrary backend/sing-box diagnostic text. By UI category, more than 95% of the normal interface can be localized in the frontend; the remaining visible English may be dynamic diagnostic content or deliberately preserved technical terminology. This percentage is an architectural estimate, not a count of runtime strings.

Required backend changes: **none**.

Required database changes: **none**.

Required API changes: **none**.

Expected sing-box or protocol behavior impact: **none**, provided changes remain at the display layer and stable values are not altered.

## 11. Build Pipeline

Development:

```text
frontend source
  -> npm run dev
  -> Vite development server on port 3000
  -> /app/api proxy to http://localhost:2095
```

Production frontend build:

```text
frontend/package.json: npm run build
  -> vue-tsc --noEmit
  -> vite build
  -> frontend/dist/
```

Full release chain:

```text
frontend source
  -> npm ci (CI/Docker; build.sh currently uses npm i)
  -> npm run build
  -> frontend/dist/
  -> copied to web/html/
  -> web/web.go //go:embed all:*
  -> Go binary build
```

Evidence:

- `frontend/vite.config.mts` sets `build.outDir` to `dist`.
- `build.sh` builds the frontend, clears `web/html`, copies `frontend/dist/*`, and builds `main.go` with release tags.
- `Dockerfile` uses `npm ci && npm run build`, copies `/app/dist/` to `/app/web/html/`, then compiles the Go binary.
- `web/web.go` embeds the entire `web` package directory with `//go:embed all:*`, serves `html/index.html`, and serves `html/assets` from the embedded filesystem.
- CI runs `npm ci`, lint, unit tests, and build. The Makefile exposes `audit:fe-lint`, `audit:fe-build`, `audit:test-fe`, and Go build/test targets.

No dependencies were installed and no build was run during Phase 1, as required.

## 12. Language Preference Persistence

Current persistence is client-side:

- `localStorage['locale']` stores the selected internal locale code.
- `frontend/src/locales/index.ts` reads, normalizes, loads, and writes it.
- Vuetify reads the same `locale` key.
- Both Classic and Nexus top bars call `setI18nLocale()` and reload after a language change.
- The login screen also calls `setI18nLocale()`, but does not reload.

There is no browser-language detection. With no stored preference, the default is English.

Recommendation:

1. Keep `localStorage` as the sole language preference store.
2. Do not add a database column, migration, user model field, or API endpoint.
3. Preserve current internal locale identifiers (`en`, `zhHans`) for upstream compatibility.
4. If browser detection is desired, add a small normalization mapping only when no stored preference exists (`zh-CN`/`zh-SG` -> `zhHans`; `zh-TW`/`zh-HK`/`zh-MO` -> `zhHant`; otherwise English).

Minor existing caveat: the exported date-format `locale` is calculated once at module initialization. Authenticated language changes reload the page, but changing language on the login page does not. Date formatting after a no-reload login transition may retain the initial date locale until refresh. A later design phase should choose either a reload after login-page language change or a reactive date-locale helper.

## 13. Fallback Strategy

Fallback already exists and is suitable for long-term upstream synchronization:

- Vue I18n: `fallbackLocale: 'en'`.
- Locale loading: English is loaded before every selected non-English locale.
- Vuetify: `fallback: 'en'` with all six Vuetify locale packs registered.
- Unsupported stored locale codes normalize to English.
- Tests verify selected-locale loading and unsupported-locale fallback.

The existing fallback explains why a partial `zhcn.ts` does not crash: its 496 missing English keys display English. This is the correct stability behavior while translations catch up.

Recommended strengthening after Simplified Chinese reaches full coverage:

- Extend locale parity tests to compare `zhcn.ts` keys with `en.ts`.
- Keep English fallback enabled even after parity is achieved.
- Treat a new upstream English key as a non-breaking event: it displays English until the Chinese key is added.
- Add a test that verifies no extra/outdated Simplified Chinese keys exist and that all current English keys are covered for release branches.

## 14. Recommended zh-CN Architecture

Recommended target: **reuse and complete the existing official i18n architecture**.

```text
frontend/src/locales/index.ts
├── en       -> frontend/src/locales/en.ts       (source of truth / fallback)
├── zhHans   -> frontend/src/locales/zhcn.ts     (Simplified Chinese)
├── zhHant   -> frontend/src/locales/zhtw.ts
├── fa       -> frontend/src/locales/fa.ts
├── vi       -> frontend/src/locales/vi.ts
└── ru       -> frontend/src/locales/ru.ts
```

Implementation strategy for later phases:

1. Preserve `en` and `zhHans` internal identifiers to avoid unnecessary upstream conflicts.
2. Fill the 496 missing keys in the existing `zhcn.ts` in priority batches.
3. Extract genuine hard-coded UI text to keys in `en.ts`, then add matching Chinese values in `zhcn.ts`.
4. Keep protocol/configuration values untouched; translate display labels only.
5. Keep English fallback permanently enabled.
6. Keep language selection and preference storage client-side.
7. Add/extend parity and locale-switch tests before declaring full coverage.

It is not appropriate to add another `zh-CN` resource beside `zhcn.ts`, rename the existing internal locale, or introduce another i18n library.

## 15. Expected New Files

Runtime localization: **no new file is required**. The Simplified Chinese resource already exists at `frontend/src/locales/zhcn.ts` and is already registered.

Phase 1 adds only:

```text
docs/i18n-audit.md
```

If a later phase decides that a dedicated Chinese parity test is clearer than extending the existing test, one optional new test could be considered, but the lower-intrusion recommendation is to extend `frontend/src/locales/localeParity.test.ts` instead.

## 16. Expected Modified Files

Required primary file:

```text
frontend/src/locales/zhcn.ts
```

Files likely requiring small, targeted edits to extract remaining direct UI strings:

```text
frontend/src/locales/en.ts
frontend/src/locales/localeParity.test.ts
frontend/src/views/Settings.vue
frontend/src/views/Basics.vue
frontend/src/views/paidsub/PaidSubscriptions.vue
frontend/src/components/Listen.vue
frontend/src/components/Dial.vue
frontend/src/components/Rule.vue
frontend/src/components/OutJson.vue
frontend/src/components/protocols/Hysteria2.vue
frontend/src/components/nexus/drawers/TlsDrawer.vue
frontend/src/components/nexus/overview/selectors/auditMapper.ts
frontend/src/layouts/modals/Client.vue
frontend/src/layouts/modals/DnsRule.vue
frontend/src/layouts/modals/Rule.vue
frontend/src/layouts/modals/Ruleset.vue
frontend/src/layouts/modals/RulesetImport.vue
frontend/src/layouts/modals/RuleImport.vue
frontend/src/layouts/modals/Tls.vue
frontend/src/layouts/modals/WgQrCode.vue
```

The list is an audit inventory, not authorization to edit all files at once. Later phases should modify only files needed for that phase and preserve component logic.

Files that currently require no runtime change:

```text
frontend/src/main.ts
frontend/src/locales/index.ts
frontend/src/plugins/vuetify.ts
frontend/src/router/index.ts
frontend/src/layouts/nexus/nexusMenu.ts
frontend/src/layouts/default/Drawer.vue
```

`frontend/src/locales/index.ts` would need one small edit only if Phase 2 approves optional browser-language detection or resolves the login-page date-locale caveat.

## 17. Files That Must Not Be Modified

Localization must not modify business/core behavior in:

```text
core/
database/
cmd/migration/
api/
service/
sub/
paidsub/
network/
realtime/
go.mod
go.sum
```

It must not alter:

- sing-box lifecycle or configuration generation.
- Inbound/outbound/service models and protocol values.
- Database schema or migrations.
- API contracts or response values.
- Subscription generation.
- Authentication/session/security behavior.
- Routing, DNS, TLS, AnyTLS, Hysteria2, Reality, VLESS, TUIC, or ShadowTLS behavior.

Generated `frontend/dist` and `web/html` assets should never be hand-edited. They are build outputs and should only be produced by the documented build chain when testing/releasing.

## 18. Upstream Merge Conflict Risk

Overall risk: **Medium**, reducible toward Low by keeping most work in `zhcn.ts`.

Risk by area:

| Area | Risk | Reason |
| --- | --- | --- |
| Add missing values in existing `zhcn.ts` | Low / Medium | Language-only changes are isolated, but this existing file changed in 20 of the last 100 commits. |
| `en.ts` key additions | Medium | English is the source of truth and changed in 39 of the last 100 commits. |
| Locale registry (`index.ts`) | Low / Medium | Small centralized file; currently no change is required. |
| Menu definitions / Router | Low if untouched | They already use keys; no localization edit is required. |
| Shared UI components and modals | Medium | Several are active upstream hotspots; changes must be limited to replacing display literals with `$t(...)`. |
| Large page rewrites | High | Would overlap ongoing upstream work and are explicitly not recommended. |
| Go backend/core changes | High / unacceptable | Outside localization scope and would threaten stability/sync. |

Recent-history hotspots include `en.ts`, `ru.ts`, `zhcn.ts`, `Client.vue`, `Clients.vue`, `Rules.vue`, `Settings.vue`, `Inbound.vue`, and protocol type files. The correct mitigation is small commits, translation-only diffs, no file moves, no formatting sweeps, and no refactors mixed with localization.

## 19. Runtime Stability Risk

Overall stability risk: **Low** for the recommended plan.

Reasons:

- Vue I18n, lazy locale loading, language switching, persistence, and fallback already exist.
- Completing `zhcn.ts` changes display messages only.
- English fallback prevents missing keys from producing blank UI or crashes.
- Route paths, API calls, state, models, and protocol values do not need to change.
- No Go, database, API, sing-box, or configuration-generation edit is required.

Development complexity: **Medium**.

Reasons:

- 496 English keys are missing from Simplified Chinese.
- At least 432 statically referenced English keys currently fall back to English; other missing keys may be dynamic or lower-frequency.
- Direct strings remain across settings, rules, TLS, protocol forms, audit summaries, and paid subscriptions.
- Both Classic and Nexus shells must be regression-tested.
- Terminology must remain technically exact while being understandable to Chinese users.

Risks to test later:

- Long Chinese labels causing clipping in tables, tabs, dialogs, and mobile layouts.
- Interpolation/pluralization placeholders changing accidentally.
- Direct UI strings missed because they are constructed programmatically.
- Dynamic API/log text being mistakenly treated as a translatable key.
- Protocol selector titles being changed together with their immutable values.
- Login-page locale change leaving date formatting on the initial locale until refresh.

## 20. Recommended Translation Priority

### P0 — primary user journey

- Main navigation and group labels.
- Common actions, especially Cancel, Refresh, and Diagnose.
- Login and logout.
- Dashboard / Nexus overview summaries.
- Inbounds, Clients, Subscription/Paid Subscriptions, Settings, and Logs.
- Common table empty states, confirmations, validation, and notifications.
- Missing `pages.paidSub`, `pages.donations`, and `nav.groups.support` keys.

### P1 — common configuration

- TLS and Reality display labels.
- Transport, DNS, routing/rules, certificates, and user/client configuration.
- Settings hints and subscription delivery text.
- Telegram settings and backups.
- Panel update and Config Doctor UI.

### P2 — advanced and low-frequency surfaces

- Advanced sing-box options.
- Paid subscription provider details.
- Regional presets and advanced rules.
- Experimental settings.
- Complex help text and low-frequency protocol options.
- Migration detail and advanced audit/observability text.

Every phase must preserve the required technical names listed in Section 9.

## 21. Final Recommendation

S-UI-X already has the correct internationalization foundation and already exposes Simplified Chinese. The project should **not** create a new i18n system and should **not** add a duplicate `zh-CN` locale file.

The safest long-term plan is:

1. Treat `frontend/src/locales/en.ts` as the source of truth and English fallback.
2. Treat existing `frontend/src/locales/zhcn.ts` (`zhHans`, displayed as `简体中文`) as the Simplified Chinese locale.
3. Raise its key coverage from 60.9% to full release coverage in P0/P1/P2 batches.
4. Extract remaining frontend-owned direct English strings into the existing key system with minimal component edits.
5. Preserve all protocol/API/database/configuration values and all backend diagnostic text.
6. Extend parity and language-switch tests; keep fallback enabled permanently.
7. Use small, focused commits so future upstream merges mostly touch `zhcn.ts` and a limited number of display-only call sites.

Answers to the core decisions:

| Question | Conclusion |
| --- | --- |
| Frontend stack | Vue 3 + TypeScript + Vite + Vuetify + Pinia + Vue Router |
| Existing i18n | Yes: Vue I18n 11.4.4, six registered locales |
| Can zh-CN be added directly? | It already exists as `zhHans` / `zhcn.ts`; complete it rather than add another locale |
| Minimum-intrusion approach | Fill `zhcn.ts`; extract only genuine direct UI strings to existing keys |
| Need Go backend changes? | No |
| Need database changes? | No |
| Need API changes? | No |
| Impact sing-box? | None under the recommended display-only scope |
| Impact AnyTLS/Hysteria2/Reality/VLESS/TUIC? | None if values/types remain unchanged |
| English fallback possible? | Already implemented and tested |
| Best preference storage | Existing `localStorage['locale']` |
| Highest conflict areas | `en.ts`, `zhcn.ts`, Settings, client/rule/modals, active UI components |
| Long-term low-cost upstream sync possible? | Yes, with language-resource-first and minimal call-site edits |
| Stability risk | Low |
| Upstream conflict risk | Medium, reducible toward Low |
| Development complexity | Medium |

Phase 2 should design the completion plan around the existing `zhHans` locale, decide whether optional browser-language detection is worth the small registry change, define parity rules, and freeze the terminology/glossary before any translation edits begin.
