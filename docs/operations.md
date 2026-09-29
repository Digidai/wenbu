# Deployment and operations

## 中文：维护者先看这里

项目需要 Node.js 22.12 或更高版本。首次运行依次执行 `npm ci`、`npm run verify`、`npm run preview`，然后打开 `http://localhost:8787`。预览使用已构建的静态页面，修改后需要重新构建；`npm run dev` 只提供 Astro 页面开发，不包含 Worker 接口。

现有部署使用 Cloudflare Workers 静态资源、Durable Object 额度计数和 D1 使用统计。常规发布不要重建数据库或清空额度。若是在自己的账户复制部署，先调整 `wrangler.jsonc` 中的账户、域名、D1 与绑定信息，不能直接沿用本项目的生产标识。

发布前完成 `verify` 与 `lint`，核对当前分支和 Cloudflare 账户。发布后分别检查页面、计算接口、MCP 和真实浏览器体验；只有需要验证模型时才发起有额度成本的 AI 请求。GitHub CI 通过不等于已部署，`/api/health` 显示已配置也不等于上游模型已经实测。

会话/手记保存在用户浏览器，AI 额度在 Durable Object，近期使用事件与主动提交的反馈在 D1，长期事件归档在私有 R2。反馈摘录只有用户主动勾选并预览后才上传；行为事件不含对话正文。请求处理时 Cloudflare 与 DeepSeek 仍会接收相关数据；不要把“行为统计不存对话”写成“资料不出设备”。统计日报按 UTC 分组，AI 额度按上海时间零点重置。

## Runtime

Astro static pages and React islands are built locally or in CI. One Cloudflare Worker serves static assets, POST APIs and stateless Streamable HTTP MCP. A named SQLite Durable Object atomically reserves global and per-network daily AI allowances. Cloudflare D1 stores recent first-party product events and private feedback; private R2 retains event archives. Separate rate-limit bindings protect public computation, feedback, event collection and admin reports. Optional model calls use DeepSeek's official API. There is no separate application server or third-party analytics script.

## Commands

```sh
npm ci
npm run verify
npm run lint
npm run preview
```

Use Node.js 22.12 or later. Dependencies are pinned in `package-lock.json`. Tests use Node's experimental SQLite API to execute the quota SQL; the Durable Object host is stubbed in unit tests. Local Wrangler and deployed smoke checks cover different parts of the system. `preview` serves the current `dist` build at port 8787; rebuild after editing static content.

`npm run dev` starts the Astro UI server. It does not supply Worker routes such as `/api/v1/agent`, so use the Wrangler preview for an end-to-end flow.

## Secrets

Worker secrets `DEEPSEEK_API_KEY` and `QUOTA_SALT` enable optional AI; `ANALYTICS_ADMIN_TOKEN` protects analytics reports. Set a production secret with `npx wrangler secret put NAME` using the interactive prompt. Local development may use an ignored mode-0600 `.dev.vars` file. Keep values out of shell arguments, `PUBLIC_` variables, source control, request logs and client assets. The four standalone calculation tools do not need a model key.

## Budgets and privacy

The current variables in `wrangler.jsonc` are `AI_PER_USER_DAILY_LIMIT=5`, `AGENT_PER_USER_DAILY_LIMIT=12`, `AGENT_GLOBAL_DAILY_LIMIT=600` and shared `AI_DAILY_LIMIT=1000`. They reset at midnight in Shanghai (UTC+08:00). The first Agent reservation consumes one network turn and one model allowance before streamed work begins; further model attempts reserve additional global and Agent units, not additional user turns. It does not pre-charge all five model calls. An early cancellation or failed attempt may still consume the reservation.

| Request                  | Body limit | Text/context limits                                                                               | Execution limit                                                                    |
| ------------------------ | ---------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Calculation or MCP       | 8 KiB      | Tool schema                                                                                       | Public rate limiter                                                                |
| Single AI interpretation | 8 KiB      | Question: 600 characters; selected context: 1,600                                                 | 40-second upstream timeout; 1,800 output tokens                                    |
| Agent turn               | 96 KiB     | Message: 3,000 characters; selected note: 5,000; history: 16 messages and 28,000 characters total | 5 model calls, 12 tool executions, 120 seconds; 1,800 output tokens per model call |

The public limiter is configured for 60 requests per IP per minute; event collection and admin reporting have their own limits. Daily quotas use the network grouping described below. Visitor use is funded by the operator's DeepSeek and Cloudflare accounts. The daily cap does not make hosting free or guarantee a fixed monetary bill.

Disconnecting cancels the remaining Agent work. Streams emit assistant text, public actions, sources and artifacts, without model reasoning. Sessions are stored in browser localStorage rather than Durable Object storage. Selected request data still passes through Cloudflare to DeepSeek. Research reads the Wenbu library and allowlisted public reference URLs. Citation validation checks that a source was read; it does not establish that the model's claims are supported by that text.

A daily salted HMAC groups IPv4 addresses and IPv6 /64 networks. Shared networks share the allowance. Quota and behavioral event storage exclude raw IPs and birth charts. The separate private feedback store can contain text or a chart excerpt explicitly submitted by its author; excerpt sharing is off by default. Current counters are kept through the day; stale days are deleted during reservation and by alarm. Infrastructure providers may maintain operational records under their own policies. Observability payload logging is not enabled.

## Availability

Calculation and random-draw tools continue without an AI key or when DeepSeek is unavailable. There is no payment flow or subscription. Treat 422 as input feedback, 429 as throttling or a daily allowance limit, and 502/503 as service failure. Read the error `code` and message to distinguish them. Do not automatically retry an AI request: it can consume another allowance and incur another upstream charge. `/api/health` reports configuration readiness, not a live upstream test.

If deepseek-v4-flash retires, verify the official model migration notice and test a synthetic request before changing DEEPSEEK_MODEL. Keep requested and served model provenance in responses.

## Release / rollback

Run typecheck, tests, lint, production build and static audit before deploying. Use `wrangler deployments list` and `wrangler rollback VERSION_ID` for code rollback; understand that Durable Object storage/migrations are separate. Do not delete quota storage to fix a frontend problem.

After confirming the intended checkout and Cloudflare account:

```sh
npx wrangler whoami
npm run deploy
npm run smoke
```

`smoke` checks the configured public deployment, including static routes, calculation responses and MCP. It marks requests as test traffic. It does not perform a real AI call unless explicitly requested with its AI option. Record the deployed Worker version and source commit, then inspect Chinese and English routes on desktop and a narrow mobile viewport. Recheck a changed interaction in the browser, not just its HTML.

Deployment is through the CLI under the user's existing Cloudflare account. GitHub CI validates every change; automatic production deployment is deliberately not claimed until GitHub Cloudflare credentials have been configured. The included workflow needs no deployment secret.

## Future domain

See [brand-and-growth.md](research/brand-and-growth.md). Change all absolute identifiers together and preserve old links with permanent redirects. A hostname change does not automatically migrate localStorage journals; users should export records before switching domains.

## Product analytics

Cloudflare D1 `wenbu-analytics` is bound as `ANALYTICS`; schema is versioned in `migrations/` (including `0002_feedback_history.sql`). Apply migrations before code deployment:

```sh
npx wrangler d1 migrations apply wenbu-analytics --local
npx wrangler d1 migrations apply wenbu-analytics --remote
npx wrangler secret put ANALYTICS_ADMIN_TOKEN
npx wrangler whoami
npm run deploy
```

The database and production secret were provisioned for the 2026-09-29 release. Do not recreate them for routine deployments. The administrator opens `/insights/` and supplies the secret in the password field. An ignored mode-0600 `.analytics-admin-token` file contains the initial local copy; do not publish it. The report API requires `Authorization: Bearer ...`, sends no-store/noindex, and has a separate rate limit. See [analytics.md](analytics.md) for dimensions, privacy, opt-out and definitions.

Private R2 bucket `wenbu-analytics-archive` is bound as `ANALYTICS_ARCHIVE`. Do not enable public access or set an expiry lifecycle. Cron `15 * * * *` archives events received more than one day ago in bounded NDJSON batches. Only archived rows older than 90 days can be pruned; failed uploads keep the original rows. Check `/api/admin/storage` for errors and backlog; a job handles at most 2,500 events per hour. A D1 lease prevents overlapping jobs. Archive downloads require the same admin token, and manifests contain SHA-256 hashes. Indexes bound time-window reads and retention deletes. Monitor D1 reads, writes, storage and Worker errors in Cloudflare; growth requires daily pre-aggregation before repeatedly querying large 90-day ranges. Public page beacons are approximate product measurement; server calculation receipts are recorded independently. Neither is a billing ledger.

QA sets `X-Wenbu-Test: true` for native requests or `sessionStorage['wenbu.analytics.test']='true'` in the dedicated QA browser tab before loading the page. Test traffic is excluded from the default dashboard. Automated smoke now sets this header, including MCP. Do not clear production tables to reset QA.

Worker rollback does not roll back D1 schema or data. Migrations are additive; old code can continue reading the original columns. However, code rollback must preserve the new archive-before-prune maintenance path: an old cron handler would delete unarchived events. Disable the trigger before rolling back to pre-archive code. Keep the database through code rollback. The final deployment and actual receipt checks are recorded in [feedback-history-release.md](reviews/feedback-history-release.md).

## Keep documentation in sync

Edit `scripts/generate-api.mjs` when API documentation schemas change, then run `node scripts/generate-api.mjs`. It writes `public/openapi.json`, `public/agent-request.schema.json` and `public/context.schema.json`; a normal build does not run this generator. Validate those schemas against the Zod schemas and implementation rather than treating the generated file as the source of truth.

`public/SKILL.md` is hand-maintained. Keep `docs/agent-protocol.md` and its public copy identical. `scripts/postbuild.mjs` generates the sitemap, RSS feeds, response headers and social image under `dist`; edit that source rather than generated output.

When adding a public article route, add its path to `src/lib/analytics-contract.ts` so measurements retain the registered page name instead of `/other/`. Register campaign and action values before using them in links; do not add arbitrary query strings or reader text to analytics.

## Issue reporting

Use GitHub issues with synthetic data. Never post birth details or keys in public bug reports. Reproduce calendar issues with exact timezone, date, chosen convention and expected independent reference.
