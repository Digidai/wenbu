# IndexNow 自动提交 / Automatic URL notifications

问卜通过 IndexNow 通知搜索引擎：哪些公开页面已经新增、更新或删除。提交使用主域名 `https://wenbu.app`，只包含 sitemap 中可索引的 HTML 页面。后台、私人手记、迁移页面、API、MCP、查询参数和知识手册的重复 Markdown/JSON 版本不进入清单。

## 何时自动运行

- `npm run deploy` 成功部署后，脚本核对线上清单与本次构建，并尝试立即提交。脚本使用已有的管理员凭证；缺少凭证或网络失败不会撤销已完成的部署，会明确提示定时任务接手。
- Cloudflare Cron 每 15 分钟独立检查当前已部署的静态资源。因此，直接运行 `wrangler deploy`、本地终端关闭或发布脚本短暂失败，都不会取消后续自动检查。
- 第一次运行提交当前公开页面。之后比较 HTML 的 SHA-256 指纹，仅发送变化；未变页面不会周期性重复推送。删除过的公开地址会再通知一次，然后从已接收清单中移除。
- 每批最多 1,000 个地址。剩余变化在下一轮继续处理。失败采用指数退避（15 分钟起，最长日常间隔 24 小时），同时遵守服务器给出的 `Retry-After`，上限七天。

The build produces a deterministic manifest from the same indexable pages as the sitemap. The Worker reads that manifest through its deployed asset binding, compares it with the last received fingerprints in D1, and posts only additions, changes and removals. No network submission happens during a build, test or pull-request check. HTML fingerprints also change when shared rendered navigation, metadata or asset references change.

## 数据与凭证

根目录的 UTF-8 验证文件由 `src/data/indexnow.json` 生成；它是网站所有权验证文件，必须公开可读取。IndexNow 的验证 key 不能用于登录后台，也不复用模型密钥或管理员密码。修改 key 时，必须同步部署配置与验证文件。

新增的 D1 表与使用统计、反馈及归档维护相互独立：

| 表                     | 保存内容                                                  |
| ---------------------- | --------------------------------------------------------- |
| `indexnow_pages`       | 最后收到 HTTP 200 / 202 的公开 URL 与 HTML 指纹           |
| `indexnow_submissions` | 每次尝试的时间、清单版本、地址列表、数量、HTTP 状态与结果 |
| `indexnow_state`       | 上次检查、错误代码、重试时间与并发锁                      |

不读取对话、出生资料、访问者 ID 或反馈文本。D1 的提交记录不进入公开 API。管理员查询继续使用现有认证、限流、`no-store` 与 `noindex` 响应。

A five-minute D1 lease prevents overlapping jobs. A single D1 transaction stores each receipt and advances the fingerprints only for HTTP 200 or 202. Failed batches remain eligible for retry. Delivery is **at least once**: if the service receives a request but the Worker loses its response or fails before persisting it, a later retry can repeat those URLs. This is preferable to silently dropping an update.

## 运维与排查

首次部署本功能前应用新增迁移；后续常规发布不需要重建任何表：

```sh
npx wrangler d1 migrations apply wenbu-analytics --remote
npx wrangler whoami
npm run deploy
npm run indexnow:status
```

手动补跑：`npm run indexnow:submit`。它仍遵守并发锁、去重和退避，不提供跳过核对、强制重提全站或任意 URL 参数。

维护脚本从 `WENBU_ADMIN_TOKEN`、`WENBU_ADMIN_TOKEN_FILE`，或已有的忽略文件 `.analytics-admin-token` 读取凭证。不要把凭证放进命令参数、文档或 Git。定时任务在 Worker 内直接运行，不需要这些本地环境变量。

- `GET /api/admin/indexnow`：最后检查状态、已接收页面数与最近 20 次提交记录摘要。
- `POST /api/admin/indexnow/run`：立即检查当前部署。需要管理员认证、主域名及匹配的 `Origin`；请求方不能指定提交地址。
- `npm run audit:indexnow`：检查 sitemap 一致性、HTML 指纹、私有路由排除及验证文件；已加入 `npm run verify` 和 GitHub CI。

| 状态                            | 含义 / Meaning                                                     |
| ------------------------------- | ------------------------------------------------------------------ |
| `submitted` / HTTP 200          | 接口成功收到这批 URL；不代表已经收录                               |
| `pending_validation` / HTTP 202 | 已收到 URL，所有权验证仍待完成；保留原始回执，不把它改写为成功验证 |
| `unchanged`                     | 当前页面与上次收到的内容相同，没有再次请求 IndexNow                |
| `retrying`                      | 网络、协议、静态资源或存储失败；查看 `last_error`、`retry_at`      |
| `backoff`                       | 尚未到重试时间，没有向 IndexNow 发请求                             |
| `busy` / `lease_lost`           | 已有任务运行，或本轮失去锁；后续任务会继续核对                     |

HTTP 202 已表明接收，因此不会每 15 分钟重复推送同一批页面。IndexNow 没有用于查询某批验证结果的回执 API；如需核实后续状态，在 Bing Webmaster Tools 检查，后续内容变更也会留下新的提交回执。

Cloudflare 的 Cron 配置传播可能需要几分钟。状态接口里的 `last_checked` 可以证明任务实际运行，配置本身只说明已安排。回滚应用代码不删除 D1 状态；若要暂停自动提交，移除对应的 15 分钟 Cron，并保留现有每小时归档任务。

## 收录与效果的边界

IndexNow 是更新通知协议。提交回执、搜索引擎抓取、实际收录、排名及流量是不同状态，不能互相替代。一次提交会在采用该协议的搜索引擎间共享，无需给每个参与者重复提交同一批地址。

Protocol references: [Bing integration instructions](https://www.bing.com/indexnow/getstarted#implementation), [IndexNow documentation and response codes](https://www.indexnow.org/documentation). Checked 2026-10-01.
