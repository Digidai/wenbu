# 访问与使用统计

2026-09-29。Cloudflare Worker + D1 第一方统计，不引入外部追踪脚本。管理入口 `/insights/`；页面 noindex，汇总 API 要求管理密钥。原始事件保留 90 天，每天 UTC 19:15 清理过期记录。文末提供英文指标与使用说明。

## 第一次查看后台

1. 打开 `/insights/`，在密码框输入维护者持有的管理密钥。不要把密钥放进网址或截图。
2. 先选最近 7 天，保持“包含测试流量”关闭。看流量来源和进入页，再按语言、设备或活动筛选，避免只看总浏览量。
3. 找到开始操作多、服务端成功少的入口，再检查对应错误与耗时。区分输入错误、限流、用户中断和服务故障。
4. 看“Agent 提问引导”是否有人生成草稿、实际发送并完成回合。选项点击多不等于用户完成了探索。
5. 导出汇总 JSON，记录当时的时间范围和筛选条件。没有记录时先检查时间范围、筛选项和统计开关，不用演示数字补齐。

时间范围是截至查询时刻的最近 1 / 7 / 30 / 90 个 24 小时；每日趋势按 **UTC** 日期分组。AI 额度按上海时间零点重置，两者不要混用。当天数据仍在变化，不能与完整的一天直接比较。

## 看什么

| 维度                                           | 用途                                 |
| ---------------------------------------------- | ------------------------------------ |
| 来源 / medium / campaign / 进入页              | 搜索、AI 引荐、社区和推广入口效果    |
| 页面 / 语言 / 设备 / 浏览器 / 系统 / 国家地区  | 内容与响应式体验                     |
| web / API / CLI / MCP                          | 人与 Agent 的使用方式                |
| 工具 / Agent 模式 / 入口动作                   | 功能偏好与开始位置                   |
| 服务状态 / 耗时 / 模型调用 / 工具调用 / 产物数 | 完成率、限制、耗时和运行成本代理指标 |

后台可选最近 1 / 7 / 30 / 90 天，按来源、活动、语言、设备、使用方式组合筛选；提供每日趋势、会话覆盖、维度明细、错误与耗时，以及汇总 JSON 导出。测试流量默认排除。

## 事件与口径

浏览器记录：`page_view`、可见时间满 30 秒的 `engaged`、50/90% `scroll_depth`、`cta_click`、`form_started`、`tool_started`、`result_viewed`、`ai_requested`、`ai_result_viewed`、`agent_started`、`agent_received`、`agent_stopped`、`artifact_opened`、`card_inspected`、`source_opened`、`context_opened`、保存/导出及 `client_error`。

服务端独立记录：`calculation_succeeded`、`interpret_succeeded`、`agent_finished`、`mcp_finished`、`api_failed`。开始按钮、HTTP 200 或客户端自行上报，都不等同于实际完成。MCP 以真实工具返回为依据，Agent 以最终状态为依据；完成、等用户补充、受限、中断、超时、错误分开。

首页六个 KPI 是浏览、浏览器标识数、访问会话、非示例成功计算、完成的 Agent 回合、服务错误。示例、输入错误、限流和用户中断单列。Agent 一回合可有多次内部工具调用，不能把回合与工具调用相加成“用户人数”。MCP 工具完成在事件明细和性能表单列，不冒充网站转化。

会话覆盖要求同一会话包含访问、开始、服务端成功、保存事件，逐层取交集。它不是严格时间顺序漏斗；异步批量事件可能晚于服务端结果到达，不据此推断先后因果。来自 API、CLI、MCP 的无浏览器会话请求不能计算网页访客转化。

## Agent 提问引导

`guide_opened` 表示第一次选择主题或重新打开引导，`guide_step` 的 value 为 1–3（仅步骤编号），`guide_skipped` 表示转为直接输入，`guide_draft_created` 表示放入草稿，`suggestion_selected` 的 action 区分 clarification / followup。`agent_started` 的 action 区分 guided / clarification / followup / example；自由编辑后若原建议已不完整则归普通对话。

管理员后台的“Agent 提问引导”显示每步操作数和访问会话数。它能定位用户是否停在目标选择、背景补充或草稿阶段；回退和重复编辑都会产生操作，不能直接用次数相除当转化率。发送与实际服务端完成分别统计。测试流量遵循统一排除规则。

不记录选了工作还是关系、不记录选项原文，也不记录背景、对话或出生资料。引导选择在本页完成，直到用户发送后才作为对话内容交给 DeepSeek。

## 推广链接

只接受枚举值，防止私人文本进入统计。完整字典见 `src/lib/analytics-contract.ts`。

示例：`https://wenbu.genedai.me/tarot/deck/?utm_source=github&utm_medium=referral&utm_campaign=tarot-deck`。

允许的 campaign：`launch`、`tarot-deck`、`agent-studio`、`bazi-guide`、`developer-tools`、`none`。新增推广活动时先更新字典和测试。未知值归入默认分类，原始查询字符串不落库。一次会话保留首次入口归因，30 分钟无活动后重建。

评估知识手册时，可以比较文章的进入会话、阅读行为和工具入口点击，再检查同一会话是否有真实计算成功。页面/进入页明细不能单独证明一篇文章促成了转化。新文章路径必须加入 `pagePaths` 白名单；未知路径会归 `/other/`，因此不能靠后台补救发布时漏记的路径。

AI 引荐只表示浏览器可观察到的来源类别或约定的 UTM。很多应用不传 referrer，可能落入 direct / other；本后台不能证明某篇文章被模型引用，也不提供搜索排名或全网 GEO 曝光数据。模型调用次数当前来自 Agent 的回合统计，不含单次解读的模型调用明细；它是用量信号，不能当成 DeepSeek 账单。

## 隐私与管理

不收集问题、出生日期时间地点、命盘、对话正文、笔记、原始 IP、完整 URL、搜索词或自定义任意属性。路径经过站内白名单；来源仅分类；国家只保留两位国家代码。随机浏览器标识有效 30 天，不做指纹或跨设备身份合并，不等同于自然人数。

`/privacy/` 可关闭统计；DNT / GPC 自动关闭；浏览器无法使用存储时关闭。关闭时清空待发队列、移除当前标识，此后的服务请求发送 `X-Wenbu-Analytics: off`。已经收到的历史事件不会立即撤回，按保留期限移除。关闭使用统计不会取消维持服务所需的限流与 AI 额度计数。

API / MCP 可传 `X-Wenbu-Analytics: off`；CLI 用 `WENBU_ANALYTICS=off node wenbu.mjs ...`。不传标识的服务调用只记粗粒度工具状态，不建立隐形用户标识。

生产密钥为 Worker secret `ANALYTICS_ADMIN_TOKEN`。本机生成的副本在项目根目录 `.analytics-admin-token`，权限 0600、Git 忽略。通过密码输入框提交，仅用于 Authorization 请求头；不写网址、localStorage 或公开源码。退出和刷新页面后需重新输入。不要把密钥或原始用户数据贴进问题单。

## 可靠性、规模与限制

浏览器最多 10 条一批，离线 / 429 / 5xx 有一次有界重试，以事件 UUID 在 D1 去重。收集 API 与工具 API 使用独立限流器，管理员汇总接口也单独限速。统计写入失败不阻止占卜或 Agent 返回。

公开客户端事件与归因可被模拟，不能用于计费或反作弊；服务端成功事件禁止由收集接口写入。广告拦截、关闭统计、网络故障、机器人会影响覆盖。来源归因是可观察的引荐或 UTM，不是广告平台归因系统。

D1 记录是实际写入而非采样估算；仍有读取 / 写入 / 数据库容量成本和账户限制。后台 20 组查询当前按 90 天内索引时间窗口汇总，流量增长后应增加按天预聚合、监控 D1 rows_read / rows_written、再决定迁移，不预先承诺无限容量或零成本。当天无记录时显示空状态，不生成演示数字。

运维与迁移见 [operations.md](operations.md)，上线验证见 [本次质量记录](reviews/deck-analytics-release.md)。

## English: using the dashboard

Open `/insights/` and enter the administrator token in the password field. The token is sent in an Authorization header, not stored in the URL or localStorage. Reloading or signing out clears it from the interface. Keep screenshots and public reports free of credentials.

Start with the last seven days and test traffic excluded. Filter by source, registered campaign, language, device or channel, then compare starts with server-recorded outcomes. Review input errors, throttling, cancellations and service failures separately. Export the aggregate JSON with the selected period and filters when recording a finding.

Periods are rolling 24-hour windows; daily rows use UTC dates. AI allowances reset at midnight in Shanghai. A partial current day is not directly comparable with a complete day.

| Metric                  | What it means                                                             | What it does not establish                         |
| ----------------------- | ------------------------------------------------------------------------- | -------------------------------------------------- |
| Page views              | Browser `page_view` events received                                       | Search impressions or unique people                |
| Visitors                | Distinct random browser IDs with a page view                              | Individuals or cross-device identity               |
| Sessions                | Browser sessions with a page view; renewed after 30 minutes of inactivity | Signed-in accounts                                 |
| Successful calculations | Server-confirmed calculation results, excluding marked examples           | Accepted interpretations or predictive accuracy    |
| Completed Agent turns   | Server `agent_finished` events with status `complete`                     | Independent factual validation of the report       |
| Service errors          | The specified API failures and Agent errors/timeouts                      | Every user input error or intentional cancellation |

The session-coverage view intersects visit, start, success and save events within a session. It is not a strictly ordered funnel: browser events arrive in batches and may reach the server after the corresponding success event. Native API, CLI and MCP calls without browser session IDs do not belong in a website conversion denominator.

Guidance counts show opens, steps, drafts, selections and sends. They do not record the chosen topic, option text or personal background. Backtracking and repeated edits create additional operations, so dividing raw step counts does not produce a valid conversion rate.

## English: attribution and data limits

Only registered sources, media, campaigns, actions and page paths are retained. Unknown article paths become `/other/`; register a new route before release. Current campaign values are `launch`, `tarot-deck`, `agent-studio`, `bazi-guide`, `developer-tools` and `none`. Attribution preserves the first entry of a session. Arbitrary URL queries and search terms are discarded.

### Knowledge library / 知识手册

The library uses `cta_click` with registered actions `library-start`, `library-article`, `library-filter`, `library-search`, `library-view` and `article-next`. Search and filter events include only the numeric result count in `value`. View events use `value: 1` for covers and `value: 0` for the thumbnail list; repeated clicks are operations, not unique visitors or completed reads. Queries remain in the browser; they are not put in the URL or sent with events. All 21 guide paths are registered, including their normalized English equivalents.

知识手册的统计分别记录新手入口、文章进入、主题筛选、搜索、视图切换和后续阅读；筛选与搜索只附带结果数量，不记录输入词。视图切换 library-view 的 value 为 1（封面）或 0（缩略图列表）；重复点击计为操作，不是独立访客。可以结合已有页面、来源、语言与工具使用记录评估路径，但单次点击不等于完成阅读、实际掌握知识或获得准确预测。

AI referral categories reflect an observable referrer or a registered UTM value. Apps can omit referrers, so some visits appear as direct or other. This dashboard does not measure model citations, search rankings or all AI-generated exposure. Recorded model-call totals currently come from Agent turns, not the separate single-reading route, and are not an invoice.

D1 events exclude prompts, birth inputs, charts, conversation text, notes, raw IPs and full referrer URLs. Random browser IDs expire after 30 days; raw events expire after 90 days. There is no fingerprinting or cross-device identity merge. Infrastructure providers still process request metadata under their own practices.

The privacy page offers an opt-out; the browser also honors DNT/GPC and disables analytics when storage is unavailable. Native clients can send `X-Wenbu-Analytics: off`; the CLI accepts `WENBU_ANALYTICS=off`. Opting out stops subsequent analytics and does not remove required quota controls or immediately erase received events.

Browser events can be blocked, lost or fabricated. Server success events cannot be submitted through the public collection endpoint, but analytics still is not a billing or fraud-detection ledger. QA requests use `X-Wenbu-Test: true`, or the dedicated browser tab sets `sessionStorage['wenbu.analytics.test']='true'` before loading product pages. Test events are excluded by default. See [operations](operations.md) for migration, access and retention procedures.
