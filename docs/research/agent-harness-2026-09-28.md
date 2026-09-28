# 从对话到命理工作台：Wenbu Agent harness 研究

研究日期：2026-09-28。范围是已公开的一手工程文档与产品说明，不宣称遍历所有 harness 或登录体验所有产品。前一轮命理、经典、计算库研究仍见 landscape-2026-09-28.md。

## 结论与产品取舍

“Codex for 命理”对应一个可检查、可追问、有实际产物的研究工作台：用户提出问题；模型判断缺失资料；调用经过验证的排盘、随机抽取与资料工具；用户看见真实的执行状态；图表和报告独立保留；后续讨论继续使用这些证据。命盘计算、来源材料、AI 的解释保持不同身份。

本次采用一个 DeepSeek 主 Agent 和明确的工具注册表。没有为每种传统虚构多个独立专家。四种计算工具是 Agent 的能力，原有直接操作入口继续存在。对话和研究共用同一个执行循环，研究模式增加来源阅读，并在已读到资料时预留倒数第二次模型调用用于报告工具。

## 一手来源与可核实内容

| 来源 | 本次读取的公开事实 | 对问卜的设计影响（分析判断） |
| --- | --- | --- |
| [OpenAI: Unrolling the Codex agent loop](https://openai.com/index/unrolling-the-codex-agent-loop/) | 一次用户回合可含多轮模型与工具交互；工具输出被加入下一轮输入；增大的上下文需要管理。 | 实现真实循环；只接收用户/助手历史，工具结果由服务端执行产生；限制回合工作量，并明确保留哪些上下文。 |
| [Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents) | 跨会话的结构化产物和进度记录用于恢复工作；端到端验证能暴露仅靠单元测试未发现的问题。 | 本地持久化会话、图表、报告和工具记录；验证刷新、追问、取消和错误路径。 |
| [Anthropic: Multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) | 研究会依据发现调整搜索；工具描述、引用处理和评估很关键；多 Agent 有显著成本。其性能数字是厂商内部实验。 | 单 Agent 先满足本场景；检索、阅读与写报告分离；引用必须来自实际工具结果。没有据此宣称命理效果或相同研究性能。 |
| [Claude: Artifacts](https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them) | 较大的独立内容可放在聊天旁边的窗口，支持后续修改和版本切换。 | 命盘、来源与报告进入结果面板；新报告保留旧版本，聊天不必塞满图表。 |
| [Cursor: Plan Mode](https://cursor.com/blog/plan-mode) | 规划包含探索相关资料、澄清问题与形成计划。 | 复杂问题可以显示计划；资料不足时返回可操作的问题或出生资料表单，不猜出生时间。 |
| [Cursor: Checkpoints](https://docs.cursor.com/en/agent/chat/checkpoints) | 搜索索引仍有历史快照说明，但本次链接已重定向文档首页。 | 不把旧版具体按钮与回滚行为当成已验证当前事实。问卜仅实现自己可验证的会话与产物保存。 |
| [LangGraph: Persistence](https://docs.langchain.com/oss/javascript/langgraph/persistence) | 持久状态与线程/checkpoint 是恢复执行和记忆的重要基础设施。 | 首版选择浏览器本地保存，避免无账号云端保存出生资料；关闭页面不宣称后台任务继续执行。 |
| [DeepSeek: Tool Calls](https://api-docs.deepseek.com/guides/tool_calls/) | 模型返回函数请求，应用负责执行并回传结果；strict 是 beta 特性，有自己的 schema 约束。 | 用官网 Chat Completions 与服务端 Zod 校验，不依赖 beta strict 保证。未知工具与无效参数返回可处理错误。 |
| [DeepSeek: Thinking Mode](https://api-docs.deepseek.com/guides/thinking_mode/) | 带工具的 thinking 请求需要回传 reasoning_content；默认思考行为与参数有特定要求。 | 本实现显式关闭 thinking，使用工具循环完成研究；不把隐藏推理作为进度或向用户泄露。 |
| [Cloudflare: Streams](https://developers.cloudflare.com/workers/runtime-apis/streams/) | Worker 支持流式响应。 | 使用带类型的 SSE 事件呈现文字增量、工具开始/结束、产物、补问与完成；取消中止当前上游请求。 |

## 交互流程

1. 独立 /agent/、/en/agent/ 入口，首页及导航可发现。原四个工具不重定向、不移除。
2. 欢迎页给真实可用的任务建议：了解自己、眼前的问题、研习一个概念。模式和用户资料始终可查看。
3. 用户发送即选择把本次聊天和勾选的上下文交给 DeepSeek。出生资料可不填；没有全局自动读取手记。
4. Agent 补问、产生简短任务计划、执行工具。工具卡显示真实完成或失败，不播放伪造搜索进度。
5. 命盘自动进入结果面板；资料显示所属层级和读取状态；报告包含基于工具结果的可点击来源。
6. 用户继续追问、修改问题、停止、导出、选择旧会话或从已有工具带入资料。停止后的部分结果仍保留，未完成状态明确。

## 研究能力的边界

资料检索覆盖本站完整原创手册、方法说明、卦象与牌义，以及收录的参考文献目录；参考网页可以由工具按文献 ID 实际读取。不是任意互联网搜索引擎。页面不可达、付费、PDF 或过大时，工具明确返回未读取，不冒称阅读全文。外部网页是资料而不是指令，不能改变工具权限或得到出生资料；只请求预先收录的公开 URL，不把用户的问题拼入外部搜索。

原文、本站编辑说明、计算输出和模型解释分别标识。LLM 不能直接生成四柱或修改随机结果来迎合用户。它只能解释真正的工具结果。高风险现实决定不交由占卜作确定裁决。

## 成本与连续性

Agent 按用户回合限额；每个回合还有模型请求数、工具调用数、输入和输出上限。每次实际模型请求前原子预留一次全站预算；首个请求同时占用一个个人回合。失败或取消不自动退款，避免重复计费与超支。浏览器本地保存不是跨设备云同步；关页后的运行不保证继续；恢复靠已经落地的事件和已验证结果，而不是宣称 exactly-once 后台任务。

## 验收标准

真实 DeepSeek 多轮工具调用；四工具与资料工具逐项验证；未知出生时刻不猜；同一次抽牌在追问时保持不变；工具失败仍有明确状态；报告引用无伪造 ID；停止能结束上游循环；跨会话无串流写错；手机无横向溢出；新入口与旧工具均在线。

## 实测后的修正

真实模型试验中，Agent 使用 4 次模型请求和 6 次工具执行，读取站内方法说明与 USNO 的公开均时差页面并产出报告。协议与引用验证通过，但人工复核发现模型给出两类超出依据的推断：把接近交节时刻当成太阳时校正会改变年月柱的例外；给出未经来源支持的纬度误差说法与统一安全分钟数。系统约定补充固定出生时刻下年月柱不因太阳时校正而改变、均时差近似不以纬度为输入、边界必须比较实际修正量。此后复测，不把协议通过等同于内容事实无误。来源可追溯仍需要读者判断解释与证据的关系。

Markdown 表格采用 [remark-gfm 官方实现](https://github.com/remarkjs/remark-gfm)，保持禁用原始 HTML，外链仍限制为已读来源。
