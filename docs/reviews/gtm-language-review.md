# 中英文 GTM 与公开说明审查

复核日期：2026-09-29。代码基线：`5014561`。本记录覆盖 Agent Team 中的 GTM 文案编辑范围，不代替整站构建、视觉检查或部署验收。

## 覆盖范围

直接修改以下四个文件，保留组件布局、路由和产品功能接口：

- `src/components/Home.astro`：中文、英文首页全部可见文案。
- `src/data/pages.ts`：About、Methodology、Privacy、Terms、Free 共 5 类页面、10 个语言版本。
- `src/data/comparisons.ts`：FateTell、Labyrinthos、未调用工具的 AI 共 3 类对比、6 个语言版本。
- `src/lib/i18n.ts`：四工具的中文/英文简介、眉题，共 8 份简介。增加 `eyebrowZh`，保留原接口。

另外只读交叉检查了 `articles.ts` 的 13 篇原有文章、`beginner-articles.ts` 的 10 篇新增文章英文，以及 `learning-paths.ts`、`KnowledgeLibrary.astro`。建议交给对应文件负责者修改，没有交叉写入。

## 首轮发现与处理

| 问题                                                                                  | 处理                                                                                   |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 首页反复讲“角度、古老智慧、镜子”，新用户仍不知道怎么开始                              | 从具体困惑、选项起草、选择工具开始；四张工具卡说明用途与需要的资料                     |
| 中文首页眉题大量使用英语                                                              | 按语言提供眉题；四工具增加中文眉题供主路由使用                                         |
| 英文有逐字翻译和抽象表达，如 “Meet a present question through the language of change” | 改为实际动作和用户目标，例如 “Cast a hexagram for a question…”                         |
| 首页“会话留在浏览器”可能被理解成对话不会传出去                                        | 明确区分浏览器保存与发送对话、选定资料给 DeepSeek                                      |
| 方法页与 Labyrinthos 对比还称牌面是抽象线条                                           | 更新为 78 张原创 AI 插画；说明模型接收牌名、朝向与关键词，不接收牌面图像               |
| FateTell 对比低估了当前公开计算规则                                                   | 如实承认两者都有免注册免费排盘和规则说明；注明对方计算器的本地计算与保存说明           |
| 通用 AI 对比把产品名和工具能力混为一谈                                                | 比较范围缩小为调用工具和未调用工具两种方式，说明支持工具的通用助手也能调用问卜         |
| 隐私页的 Agent 导出说法过宽                                                           | 区分工具页可预览的“导出给 Agent”与完整会话 JSON；后者包含保存的对话、上下文和结果      |
| 免费页把个人日额度、共享预算与模型次数塞进同一长段                                    | 分开网络日额度和全站模型预算，解释一个发送为一个回合、上海零点重置、60 次/分钟/IP 限流 |
| Terms 英文漏掉 Agent 额度，另有与用户无关的“流量保证”措辞                             | 补齐 Agent，删除流量措辞；明确计算仍需网络连接                                         |
| 中英文隐私页更新时间不一致                                                            | 本次实际修改的说明页统一为 2026-09-29                                                  |
| 首页推荐文章依赖数组下标                                                              | 改为按 `first-reading`、`choose-a-tool`、`tarot-beginner` slug 选择                    |

## 实现依据与边界

本次先读实现再改表达，重点核对了：

- `src/lib/bazi.ts`、`ziwei.ts`、`tarot.ts`、`iching.ts`：输入条件、时间规则、随机过程、五行计数、紫微中文名称。
- `src/lib/journal.ts`、`agent-session.ts`、`AgentWorkspace.tsx`、`ToolDesk.tsx`：手记手动保存与会话自动保存、100 条手记限制、两类导出、最近 16 条消息/6 份命盘/2 版报告的发送上限。
- `worker/ai.ts`、`agent.ts`、`quota.ts`、`wrangler.jsonc`：DeepSeek 官网 API、5 次工具页解读、12 回合 Agent、全站 1,000 次模型请求与 Agent 600 次上限、失败可能消耗额度。
- `worker/analytics.ts`：统计字段与随机浏览器标识。没有把可关联同一浏览器的事件笼统宣传成“完全匿名”。

保留专业规则，但放在方法和使用说明中。首页不要求新用户先理解 IANA、sect、模型别名或 MCP。没有引入无限免费、绝对隐私、专家审定、预测准确率或流量保证。

模型名表述仅说明当前配置与服务返回的名称。官方兼容别名可能调整，服务返回的名字也不是对底层模型身份的独立验证。

## 竞品一手来源

| 来源                                                                                                         | 本次用途                             | 核对边界                                                   |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------ | ---------------------------------------------------------- |
| [FateTell 官网](https://fatetell.com/)                                                                       | 确认公开产品入口                     | 厂商产品介绍，不验证效果                                   |
| [FateTell 免费八字计算器](https://fatetell.com/bazi-calculator)                                              | 免费免注册、计算约定、浏览器计算说明 | 公开页面；未登录测付费产品。另一位 Agent 独立核对了此页    |
| [Labyrinthos 官方应用页](https://app.labyrinthos.co/)                                                        | 基础抽牌、牌阵和免费日志额度         | 本次搜索抽取到的官方页面文本；直接正文抽取为空，未登录实测 |
| [Labyrinthos 入门课程](https://labyrinthos.co/pages/learn-tarot-for-beginners-with-our-online-tarot-classes) | 练习、学习与日志定位                 | 公开产品说明                                               |
| [Labyrinthos 实体牌](https://labyrinthos.co/collections/tarot-decks-for-sale)                                | 牌组及实体产品范围                   | 未购买或评测                                               |
| [DeepSeek 工具调用文档](https://api-docs.deepseek.com/guides/tool_calls/)                                    | 模型请求工具、宿主执行工具的区别     | 技术文档；不据此对所有聊天产品作能力排名                   |

对比数据增加 `reviewed`、`sources`、`nameZh`、`nameEn`，由主路由显示复核日期、可点击来源与本地化表头。没有把未查到接口写成产品没有接口。

## 编辑循环

使用 humanizer 的“起草、查生硬表达、再改”流程，完整终稿留在源文件中。

示例一，首页工具入口：

- 初稿：让用户在传统符号中获得新的思考角度。
- 审查：没有说清入口，也没有帮助读者选工具。
- 终稿：想看出生时的命盘，选八字或紫微；想梳理一件具体的事，可以从易经或塔罗开始。

示例二，英文首页：

- 初稿：Bring your question. Find a fresh perspective.
- 审查：保留邀请式标题，但正文需要解释不熟悉术语的人下一步怎么做。
- 终稿标题：Bring your question. See it more clearly.
- 终稿正文：You don’t need to know the terminology. Tell Wenbu Agent what’s on your mind, and it can help frame your question, use a tool and look up references. Or explore the four free tools yourself.

示例三，数据边界：

- 初稿：Conversations and journals stay in this browser. You choose what to share.
- 审查：容易把本机保存误读成不传到服务器。
- 终稿：Records are saved in this browser. Sending a message shares the conversation and selected context with DeepSeek.

第二轮去掉重复修辞，缩短英文卡片标题；检查中文搭配、英文主语和动词，保留有明确用途的术语与边界说明。最终四个编辑文件未使用 em dash 或 en dash。

## 交叉复核

文档审查 Agent 检查了方法、隐私、免费与对比页，未发现新增阻断问题，并独立核实 FateTell 公共计算器。其建议“保存按钮注明手记”“不能固定承诺别名模型”“取消选择资料不移除历史”等均已采纳。

对知识编辑的反馈均已由其修复，并已再次读取源文件确认：

- 十神传统英文名称与当前图表的简短英语提示不同，应说明对照，避免练习时找不到标签。
- `browser session history` 改为浏览器中保存的会话列表，避免与临时 session storage 混淆。
- 不把“要求模型不编造古籍引用”的提示词写成绝对结果保证。
- “不扫描聊天历史”应明确指站外内容，不能让用户误解本站 Agent 不会发送近期对话。
- 工具选择文章用具体输入和入门动作替换重复的泛免责声明。

对知识库组件的建议：英文结尾用 “Ask about anything that’s unclear.”，空搜索状态用 “No matching guides”；易经的之卦译名应在相邻入门材料中保持一致。

## 已完成验证与集成检查

已通过：

- 对三个 TypeScript 数据文件运行 ESLint。
- 对四个修改源文件运行 Prettier 检查。
- 对四文件范围运行 `git diff --check`。
- 临时内容完整性检查：5 类页面的中英章节数一致、内容非空；3 类对比中英行数一致且每行 3 列；复核日期和来源齐全；4 工具均有两种语言的简介与中文眉题。

没有为纯文案新增复制实现的单元测试。尝试单独导入 `@astrojs/compiler` 时当前项目未暴露该包，没有安装额外依赖；`.astro` 已通过 Prettier 解析，正式 Astro 类型与构建检查由主任务统一执行。

集成负责人继续验收：首页三篇推荐实际存在、对比来源/日期渲染、中文工具眉题接入、英文长标题与手机表格换行，以及整站构建与上线后的实际页面。此审查记录不宣称这些发布步骤已经完成。
