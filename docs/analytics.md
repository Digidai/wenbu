# 访问与使用统计

2026-09-29。Cloudflare Worker + D1 第一方统计，不引入外部追踪脚本。管理入口 `/insights/`；页面 noindex，汇总 API 要求管理密钥。原始事件保留 90 天，每天 UTC 19:15 清理过期记录。

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

新增 `guide_opened`（第一次选择主题或重新打开引导）、`guide_step`（value 为 1–3，仅步骤编号）、`guide_skipped`（转为直接输入）、`guide_draft_created`（放入草稿）、`suggestion_selected`（action 为 clarification / followup）。`agent_started` 的 action 区分 guided / clarification / followup / example；自由编辑后若原建议已不完整则归普通对话。

管理员后台的“Agent 提问引导”显示每步操作数和访问会话数。它能定位用户是否停在目标选择、背景补充或草稿阶段；回退和重复编辑都会产生操作，不能直接用次数相除当转化率。发送与实际服务端完成分别统计。测试流量遵循统一排除规则。

不记录选了工作还是关系、不记录选项原文，也不记录背景、对话或出生资料。引导选择在本页完成，直到用户发送后才作为对话内容交给 DeepSeek。

## 推广链接

只接受枚举值，防止私人文本进入统计。完整字典见 `src/lib/analytics-contract.ts`。

示例：`https://wenbu.genedai.me/tarot/deck/?utm_source=github&utm_medium=referral&utm_campaign=tarot-deck`。

允许的 campaign：`launch`、`tarot-deck`、`agent-studio`、`bazi-guide`、`developer-tools`、`none`。新增推广活动时先更新字典和测试。未知值归入默认分类，原始查询字符串不落库。一次会话保留首次入口归因，30 分钟无活动后重建。

## 隐私与管理

不收集问题、出生日期时间地点、命盘、对话正文、笔记、原始 IP、完整 URL、搜索词或自定义任意属性。路径经过站内白名单；来源仅分类；国家只保留两位国家代码。随机浏览器标识有效 30 天，不做指纹或跨设备身份合并，不等同于自然人数。

`/privacy/` 可关闭统计；DNT / GPC 自动关闭；浏览器无法使用存储时关闭。关闭时清空待发队列、移除当前标识，此后的服务请求发送 `X-Wenbu-Analytics: off`。已经送达的匿名历史汇总不会倒撤。

API / MCP 可传 `X-Wenbu-Analytics: off`；CLI 用 `WENBU_ANALYTICS=off node wenbu.mjs ...`。不传标识的服务调用只记粗粒度工具状态，不建立隐形用户标识。

生产密钥为 Worker secret `ANALYTICS_ADMIN_TOKEN`。本机生成的副本在项目根目录 `.analytics-admin-token`，权限 0600、Git 忽略。通过密码输入框提交，仅用于 Authorization 请求头；不写网址、localStorage 或公开源码。退出和刷新页面后需重新输入。不要把密钥或原始用户数据贴进问题单。

## 可靠性、规模与限制

浏览器最多 10 条一批，离线 / 429 / 5xx 有一次有界重试，以事件 UUID 在 D1 去重。收集 API 与工具 API 使用独立限流器，管理员汇总接口也单独限速。统计写入失败不阻止占卜或 Agent 返回。

公开客户端事件与归因可被模拟，不能用于计费或反作弊；服务端成功事件禁止由收集接口写入。广告拦截、关闭统计、网络故障、机器人会影响覆盖。来源归因是可观察的引荐或 UTM，不是广告平台归因系统。

D1 记录是实际写入而非采样估算；仍有读取 / 写入 / 数据库容量成本和账户限制。后台 20 组查询当前按 90 天内索引时间窗口汇总，流量增长后应增加按天预聚合、监控 D1 rows_read / rows_written、再决定迁移，不预先承诺无限容量或零成本。当天无记录时显示空状态，不生成演示数字。

运维与迁移见 [operations.md](operations.md)，上线验证见 [本次质量记录](reviews/deck-analytics-release.md)。
