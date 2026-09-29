# 知识手册内容审查与扩充

日期：2026-09-29。范围：`src/data/articles.ts`、`src/data/beginner-articles.ts`。页面导航、视觉呈现、GTM、部署与线上验收由本次 Agent Team 的其他工作项负责，本记录不代替它们。

## 内容盘点与结果

- 原有 13 篇双语文章：11 篇手册、2 篇札记，slug 全部保留。
- 新增 10 篇完整双语手册，共 23 篇文章：21 篇手册、2 篇札记，即 46 个语言版本。
- 新增文章每种语言均有 4 节；原有文章增加具体例子或操作练习后为 4–5 节。正文英文约 290–377 词/篇，包含列表，不靠长段落或重复免责句扩充篇数。
- 每篇都包含实际例子和下一步。示例问题、职业选择、课程报名等均为教学情境；未使用真实私人出生资料。
- 保持 `Article` 结构。新增通用文章的 `tool` 指向 `agent`，复盘文章指向 `journal`，其余指向对应工具。

| 新增 slug                     | 解决的问题                       | 下一步                               |
| ----------------------------- | -------------------------------- | ------------------------------------ |
| `first-reading`               | 首次到访不知道从哪里开始         | 用 Agent 引导完成一个可编辑草稿      |
| `ask-a-better-question`       | 一句“帮我看看”缺少背景和目标     | 按情境、顾虑、事实、任务写第一句     |
| `prepare-birth-details`       | 混淆历法、出生地时区与必填资料   | 核对公历日期、时间精度和工具要求     |
| `read-ai-with-sources`        | 把流畅文字或有链接当成证据       | 逐条区分计算、传统、推测与引用范围   |
| `review-a-reading`            | 看完就结束，没有记录行动         | 保存原问题，尝试一件小事，按日期回看 |
| `bazi-ten-gods`               | 认识名词却不会核对十神关系       | 用甲日主计算五行生克与阴阳关系       |
| `iching-trigrams`             | 混淆上下卦和爻序                 | 输入既济示例，修改一爻检查之卦       |
| `tarot-suits-and-court-cards` | 死背牌义、把宫廷牌误认成必然人物 | 结合花色、姿态、实际问题练习         |
| `tarot-reversals`             | 将逆位等同于坏结果               | 抽前选好规则，抽后保留位置和朝向     |
| `ziwei-four-transformations`  | 看到禄权科忌就推断吉凶           | 核对星、宫、四化表和当前显示范围     |

## 产品与专业事实核对

1. Agent 引导读取 `src/lib/agent-guidance.ts`、`AgentOnboarding.tsx`：引导生成草稿，不自动发送；conversation 方法明确先对话，不自动抽牌或排盘。
2. 研究范围读取 `worker/agent.ts`、`worker/agent-library.ts`、`worker/agent-tools.ts`：当前为问卜馆藏和精选参考目录，不声称全网搜索、任意网址浏览或完整阅读一本书。
3. 出生资料读取 `schema.ts`、`bazi.ts`、`ziwei.ts`：八字可缺时刻；紫微需要时间和传统性别参数。紫微没有继承八字时区或近似真太阳时设置。未知时刻的交节不确定性保留。
4. 已将甲对甲乙丙丁戊己庚辛壬癸逐一与安装的 `lunar-typescript` 的 `SHI_SHEN` 映射对照；乙对辛为七杀，均吻合。
5. 易经示例 `7,8,7,8,7,8` 经当前 `trigramBits` / `kingWen` 表复核，为下离上坎、63 既济；没有动爻。最下方改 9 后只有第一爻变化。旧文新增的 `6,7,8,9,7,8` 例子动爻为一、四。
6. 塔罗 `tarot.ts` 确认 78 张、不放回、每张逆位独立 1/2、单牌或当下/牵引/下一步三牌。旧文过时的“抽象牌面 / abstract artwork”改为原创 AI 插画，并说明不可把新插画所有细节当成经典牌图符号。
7. 紫微 `ziwei.ts` / `ReadingView.tsx` 确认：主星保留 `mutagen`，辅星列表仅保留名字。因此新四化文章没有把当前可见结果称作完整四化清单，也未把大限区间等同流年分析。
8. 手记与 Agent 会话是各自的浏览器本地记录和导出入口，没有承诺跨设备同步、自动提醒或后台继续任务。

## 一手来源与使用边界

- [lunar-typescript 的 LunarUtil 源码](https://github.com/6tail/lunar-typescript/blob/master/src/lib/LunarUtil.ts)：十神映射的实现依据；另以本项目固定版本进行数值核对。
- [《易传·说卦》原文](https://zh.wikisource.org/wiki/易傳/說卦)：八个经卦的自然意象；《中国哲学书电子化计划》的相同页面本次返回 403，未冒称已读取该页面，转用可读的原文版本。
- [A. E. Waite, The Pictorial Key to the Tarot, Part I](https://en.wikisource.org/wiki/The_Pictorial_Key_to_the_Tarot/Part_1)：核对牌组与四花色、宫廷牌结构。
- [同书 Part III](https://en.wikisource.org/wiki/The_Pictorial_Key_to_the_Tarot/Part_3)：确认正逆位是分别列出的传统解释，不机械等同好坏。本文的项目、沟通和日常练习为问卜原创现代提纲，不冒充 Waite 原意或原文翻译。
- [iztro 四化说明](https://iztro.com/learn/mutagen)与[天干四化源码](https://github.com/SylarLong/iztro/blob/main/src/data/heavenlyStems.ts)：核对四化附着、参照层次、甲年四化及流派差异。只用简短术语概括；个人经历练习与界面显示范围分别根据编辑设计和本项目代码说明。
- [香港天文台公历农历对照资料](https://www.hko.gov.hk/en/gts/time/conversion.htm)：作为核对历法的入口；另读取 [2024 年历表](https://www.hko.gov.hk/en/gts/time/calendar/pdf/files/2024e.pdf)，核对立春 2 月 4 日与春节 2 月 10 日，正文明确香港时间。历法正确性不作为命理解读效力的验证。

所有传统来源用于说明传统规则或历史用法，不用作命运预测有效性的证明。现代练习不冒用经典出处。外部文献只核对本次涉及的章节和规则，不宣称读遍全部著作。

## 文案复审

使用 [humanizer 技能](/Users/dai/.codex/skills/humanizer/SKILL.md) 的草稿、识别痕迹、再改写流程。专业说明保留中性语气，改掉抽象口号、逐字翻译式标题和生硬结尾；中文与英文分别写成能直接使用的指引。

| 审查草稿或旧句                                           | 发现的问题                   | 定稿处理                                                               |
| -------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------- |
| “五行首先是一套关系语言” / “A language of relationships” | 抽象类比，没有告诉读者如何看 | “先看五行之间的关系” / “Start with the relationships between elements” |
| “Keep the last step with the person”                     | 直译、生硬的产品宣言         | “You decide what to save and share”                                    |
| “For a birth-based symbolic structure: BaZi”             | 术语密度高，新手不知要学什么 | “To learn stems, branches and elements: BaZi”                          |
| “阅读时，不制造唯一答案”                                 | 首先否定，使用路径不足       | “多条动爻，怎样开始读？”并接实际六数练习                               |
| 原先多数文章只解释概念                                   | 读完仍不知道要做什么         | 原 13 篇均增加独立、具体的练习或比较步骤                               |
| 新文初稿容易把四化当完整列表                             | 文案超出 UI 数据范围         | 在最后一节明确主星/辅星字段差异，提供可做的检查                        |

第二轮重点检查“像翻译”的名词堆叠、反复“不等于”的句式、空泛的结尾。最终稿用有背景的问题、具体输入和能执行的下一步收束。英文保留必要的中文专业名词并就地解释；不以生硬翻译取代容易核对的原名。

## 已完成的最小检查

- `npx eslint src/data/articles.ts src/data/beginner-articles.ts`：通过。
- `npx tsc -p tsconfig.worker.json --noEmit`：通过。
- `git diff --check -- src/data/articles.ts src/data/beginner-articles.ts`：通过。
- 通过 TypeScript 转译实际数据后检查：23 个唯一 slug；21 learn、2 blog；每篇中英 sections 均非空、至少 4 节；无空标题、空段落数组。
- 与计算数据进行十神、卦序和动爻例子的独立核对：通过。

本文件只记录内容编辑与最小检查。完整构建、链接/站点审计、页面展示、Grok 与交叉复审结果以本次总体验收记录为准。

## Agent Team 交叉审查与修复

由文档审查 Agent 和 GTM 编辑 Agent 分别检查完整文章的事实与英文。以下有效问题已回到源稿修复：

- 生肖字段存在于计算返回值，但当前 `ReadingView` 不显示它。移除旧文中让用户寻找该页面字段的指引，改为解释民俗年界与八字年界。
- AI 不编造经典属于系统要求，并非可保证的实际结果；英文已改为模型收到的约束，并明确引用仍需核对。
- 讲解未知时刻时使用实际控件名称“不确定出生时间”，夏令时拒绝输入只描述八字工具。
- 十神传统英文译名与产品短标签不相同。练习增加 `Responsibility = 正官`、`Challenge = 七杀` 的对应说明，中英文均保留这个区别。
- Agent 会话保存在当前浏览器的 conversation list，避免 session history 被理解为临时会话存储。
- 札记明确 Agent 会使用本次会话最近消息与选定上下文；“不读取其他应用聊天”不再被混写成“不使用本站聊天历史”。
- 工具选择页把缺乏操作价值的泛免责声明换成输入准备、示例命盘和如何点选宫位；解释效力边界在相应专文保留。

修订保留传统术语，减少读者在页面上找不到词、找不到控件或误解产品能力的情况。
