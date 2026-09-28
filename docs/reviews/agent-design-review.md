# Grok CLI design review · 2026-09-28

Actual review output. Reviewed an earlier design; see dispositions below.

这份约定和现有 Worker 能对上的部分是：独立 `/agent/` 入口、`consent: true`、只收 user/assistant、`deepseek-v4-flash` 且关闭 thinking、塔罗与六爻在附带原始结果时走校验后的重算、配额用上海日界和 HMAC，不存原文 IP。下面是会在实现里直接出错或超支的缺口。

## 必须先改

**1. 1800 token 写不出约定里的报告。** `reportSchema` 允许摘要 1400 字、最多 6 段、每段 2200 字。一次 `max_tokens: 1800` 装不下合法的 `write_report` 参数，最后一轮还会因为截断被当成失败。把报告收成约 1200 个汉字的上限，或者只在写报告那一次放宽输出上限，并把它算进本回合预算。工具参数也算在这 1800 里。

**2. 每回合预扣 5 个全站额度，和「最多 5 次模型请求」不是同一件事。** 现有 `reserveAgent` 会按 `AGENT_MODEL_CALLS`（5）去加 `global`，用户计数只加 1。只补问、或第一次模型调用就失败，也会占满 5。全站只剩 1–4 次时，本可以完成的短回合会被拒绝。约 200 个 Agent 回合就能把与旧解读共用的 1000 次用完。改为：进入回合先占 1 次用户额度；每一次真正发出的模型 HTTP 请求再占 1 次全站额度；占不到就停，状态用 `limited`，不退款，也不要预扣之后再按调用加一次。给 Agent 单独设全站子预算，避免把旧解读的 5 次额度挤掉。

**3. 计算工具和「不重新随机」互相矛盾。** 工具表里有 `cast_iching` 和 `draw_tarot`，二者会新起卦、新抽牌。附带的六爻或牌只能证明「这 6 个值 / 这几张牌合法」，不能证明它们就是上一次随机结果。规则应写成：本回合上下文里已有卦或牌时，禁止再调用随机工具；只有用户明确说「再起一卦 / 再抽一次」才允许。缺出生时间、紫微缺性别时必须 `ask_user`。现有 `ziweiSchema` 要求时间和性别，Agent 的出生资料却把这两项做成可空，模型不能自己补。

**4. 引用可以被客户端提前申报。** 请求里的 `sourceIds` 和助手历史都是客户端文本。若在本回合读档之前就把它们放进可引用集合，报告可以引用没读过的资料。可引用 ID 只来自本回合 `read_library` / `read_reference` 的成功结果。历史里的助手文本按不可信对话处理，不能当工具结果。

## 流式与取消

**5. 连接结束不等于完成。** 只有收到带 `status` 的 `done` 才可把消息标成完成、等待或限额结束。流在 `done` 之前断开，保留已到达的 delta 和工具卡，状态为错误。取消时同时中止浏览器请求、上游补全和资料抓取；该 `runId` 之后的事件丢弃。切换会话时用开始时绑定的 `sessionId + runId` 写回，避免串写。

**6. 不要和 DeepSeek 的 SSE 共用同一个「残包即失败」解码器。** 现有 `consumeSse` 要求事件以空行结束，这对浏览器方向是对的。上游若最后一个 `data: [DONE]` 没有补上空行，成功的补全会被标成断开。上游解码单独处理 `[DONE]` 和 `finish_reason=length`。工具执行期间发送注释心跳，并为整回合设总时限（建议 90 秒）；平台直接掐断连接时，客户端仍走第 5 条。

**7. 工具结果会把输入费用放大。** 12 次工具、单次资料最多约 9000 字，后续每一跳都会重发。为单回合提示词设总字节上限，超出则停止并说明未完成。已读资料再次引用时只传 ID 和短摘录。

## 隐私与页面安全

**8. 出生资料只随本次勾选离开浏览器。** 手记、出生表和从旧工具带入的结果默认不进请求；发送动作同时表示同意把本次勾选内容交给 DeepSeek。`localStorage` 写失败要可见。导出含出生资料。服务端不记录请求体、提示词和推理文本。即使上游仍返回 `reasoning_content`，也不展示、不写入会话。

**9. 模型输出按纯文本渲染。** Markdown 关闭原始 HTML，链接去掉 `javascript:`。资料页抽文本后仍是不可信数据，放在工具结果里，并再次声明不能改工具权限、也不能索取出生资料。重定向只允许目录中的 https URL；仅核对主机名不够，开放重定向可以跑到同一主机的其他路径。

**10. 无 Origin 的客户端今天会被 `originAllowed` 放行。** 这和计算接口、MCP 的既有策略一致，但 Agent 会花模型钱。第一版不要把 Agent 放进 MCP/CLI。无 Origin 的 `/api/v1/agent` 拒绝。第三步如果要开放，使用同一套额度、体积和同意字段，并单独计数。

## 迁移时会漏掉的现网文案



## Disposition

1. Report schema and tool guidance reduced to concise lengths. Real DeepSeek report emitted successfully.
2. Changed to actual model-call charging, atomic shared 1000 and Agent 600 budgets; SQLite concurrency and separation tests pass.
3. Preserved original card/line context; added server redraw guard including negated and hypothetical requests.
4. Prior source IDs reread actual local content; external references always require a fresh successful read.
5. Done/error terminal states required; client cancellation and generation IDs prevent stale writes.
6. Upstream parser accepts only a final DONE sentinel at EOF; browser frames remain strict. 120-second total deadline and 12-second heartbeat.
7. 180000-byte model-context ceiling and bounded source excerpts.
8. Explicit selected context, visible storage failures and export disclosure. Deselecting is documented not to erase previous messages; new chat resets context.
9. HTML/images disabled, exact verified-source links, external URL allowlist plus exact redirect checks. GFM tables supported with safe rendering tests.
10. Native Agent CLI retained to meet the user’s requested interfaces. Origin is not authentication; native requests require consent, share the same body limits and budgets, and Agent budget is separate from single readings. MCP itself uses no Wenbu model budget.
11. Updated public privacy/free/comparison/integration copy, schema/Skill/CLI and both Agent sitemap routes.
