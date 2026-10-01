import type { Copy } from './articles';
type Page = { zh: Copy; en: Copy };
export const pages: Record<string, Page> = {
  about: {
    zh: {
      title: '关于问卜',
      description: '了解问卜如何帮你理清问题、使用八字与占卜工具、核对资料，并把有用的理解记下来。',
      sections: [
        {
          heading: '从一个具体问题开始',
          paragraphs: [
            'Wenbu 读作 wen-boo，中文是「问卜」。你可以带着关于工作、关系或日常选择的问题进来，也可以只是想学会看一张命盘。无需先熟悉术语。',
            '网站由 Gene Dai 构建。Agent 会用选项帮你整理问题，按需调用八字、易经、塔罗或紫微工具，查阅资料并整理结果。四种工具也能独立使用，记录可保存到浏览器并导出。开始使用无需姓名或账户。',
          ],
        },
        {
          heading: '我们在乎什么',
          paragraphs: [
            '一份结果应该说清楚用了哪些输入、采用什么规则、哪些部分只是解释。问卜展示原始命盘或抽取结果，再提供可选的 AI 解读；有出处的说法可以继续核对，不确定的地方应保留说明。',
            '内容与代码使用 AI 辅助制作，解释性文字没有经过命理专业人士逐篇审定。计算采用公开程序库和明确的约定。我们会修正发现的计算、来源和表达问题，不以头衔、用户感言或未经验证的准确率代替证据。',
          ],
        },
        {
          heading: '参与改进',
          paragraphs: [
            '项目源代码、计算实现和反馈入口在 GitHub。提交问题时请写清步骤、规则和差异，使用示例资料，不要公开你或他人的完整出生资料、私人问题或密钥。',
          ],
        },
      ],
    },
    en: {
      title: 'About Wenbu',
      description:
        'Meet Wenbu: a place to ask a question, explore BaZi, I Ching, tarot or Zi Wei, and understand how a reading was made.',
      sections: [
        {
          heading: 'Start with something on your mind',
          paragraphs: [
            'Wenbu, pronounced wen-boo, comes from 问卜, Chinese for consulting an oracle. Bring a question about work, a relationship or an everyday choice. You can also come simply to learn how a chart works. You do not need to know the terminology first.',
            'Built by Gene Dai, Wenbu offers an Agent that helps frame your question, uses one of four tools when needed, reads references and brings the results together. You can also use each tool directly. Save readings in your browser and export them for later. You can start without an account or your name.',
          ],
        },
        {
          heading: 'What matters to us',
          paragraphs: [
            'A reading should tell you what went into it, how the result was calculated and where interpretation begins. Wenbu shows the chart or draw separately from the optional AI reading. You can check cited sources and see where the answer remains uncertain.',
            'AI helps produce the content and code. Interpretive articles have not each been reviewed by a professional practitioner. Calculations use public libraries and stated conventions. When we find an error, we correct the calculation, source or wording; credentials, testimonials and untested accuracy claims are not substitutes for evidence.',
          ],
        },
        {
          heading: 'Help improve the tools',
          paragraphs: [
            'Source code and issue reporting are on GitHub. A useful report includes steps, settings and a specific discrepancy. Use synthetic examples and do not post birth details, private questions or credentials.',
          ],
        },
      ],
    },
  },
  methodology: {
    zh: {
      title: '计算与依据',
      description: '公开问卜的八字、易经、塔罗与紫微计算规则、模型分工、版本和不确定性，方便你独立核对结果。',
      sections: [
        {
          heading: '先分清结果和解释',
          paragraphs: [
            '八字和紫微根据输入资料排盘；塔罗和在线起卦由程序随机抽取。页面会保留原始结果。你可以自己阅读，也可以请求 DeepSeek 解读，或与 Agent 继续讨论。',
            '计算能按约定复现，不代表解释已经得到科学验证。传统含义、AI 推断和你提供的现实情况需要分开看。比较两份结果时，先核对输入与计算规则。',
          ],
        },
        {
          heading: '八字：时间规则要先说清楚',
          paragraphs: [
            '采用 lunar-typescript 1.8.6。输入为 1901 至 2099 年的公历日期、出生地钟表时间，以及 IANA 时区名称或明确的 UTC 偏移。年、月柱按出生绝对时刻与节气时刻比较，使用固定东八区标准时（UTC+08:00，不叠加历史夏令时）；日、时柱默认使用所选当地钟表时间。',
            '默认在 00:00 换日（sect=2），也可选 23:00 子初换日（sect=1）。默认规则下，晚子时的时干仍使用库的次日约定。开启真太阳时后，日、时柱使用经度与均时差近似校正，年、月柱仍按原绝对时刻计算。出生时间未知时不生成时柱，年、月柱以当地中午暂定，交节日会提示不确定性。',
            '五行图把每个可见天干和地支各计一次，表示出现次数。它不加入藏干权重或季节影响，不能单凭数量判断五行强弱、格局或喜用神。真太阳时采用近似公式，临近换日或时辰边界时，建议对照不同设置的结果。',
          ],
        },
        {
          heading: '易经：保留六个原始数字',
          paragraphs: [
            '在线起卦用密码学随机数模拟三枚公平硬币，也可输入自己投币得到的六个数值。每爻取 6、7、8 或 9，六爻自下而上排列；6 与 9 是动爻，翻转后得到之卦。卦名按文王卦序对应。',
            '卦象主题提示由问卜编写，不作为古籍原文引用。多个动爻怎样取用有不同传统，本工具展示全部动爻，不指定一种方法为唯一标准。',
          ],
        },
        {
          heading: '塔罗：完整牌组，明确随机过程',
          paragraphs: [
            '从 78 张牌中等概率抽取 1 张或 3 张，同一次抽取不会重复。开启逆位时，每张牌独立有 50% 的概率呈逆位。三张牌的位置是「当下、牵引、下一步」，用于组织思考，不代表必然发生的顺序。',
            '78 张牌面为原创 AI 插画，参考传统塔罗意象；关键词与提示文字由问卜编写。模型收到的是牌名、正逆位和关键词，不是牌面图像，因此不应把对传统意象的解释说成看到了图中的细节。',
          ],
        },
        {
          heading: '紫微：保留流派边界',
          paragraphs: [
            '采用 iztro 2.6.1 默认配置，fixLeap=true。输入出生地的公历日期与已知钟表时间，不自动换算时区或校正太阳时。早子时和晚子时分别处理。传统男女参数用于排盘规则；宫位与星曜保留中文名称。不同流派的规则可能不同，对盘前应先核对设置。',
          ],
        },
        {
          heading: '模型与验证',
          paragraphs: [
            'AI 请求发往 DeepSeek 官网 API，当前配置名为 deepseek-v4-flash。服务方可能更新别名对应的模型；结果会显示其返回的模型名称，这不是对底层模型身份的独立验证。模型负责对话与解释，也可能误读结果或来源，重要说法仍需核对。',
            '工程检查包括历法样例、时区与夏令时边界、全部 64 种卦象映射、牌组去重、API 输入校验与 MCP 协议测试。通过软件测试仅说明这些已测试行为符合约定，不等于命理预测得到验证。',
          ],
        },
      ],
    },
    en: {
      title: 'How the tools calculate results',
      description:
        'Calculation conventions, random-draw methods, model responsibilities and uncertainty for all four Wenbu tools.',
      sections: [
        {
          heading: 'The result and the interpretation',
          paragraphs: [
            'BaZi and Zi Wei use your inputs to calculate a chart. Tarot and online I Ching casts use random draws. Wenbu keeps that result visible. Read it yourself, ask DeepSeek for an interpretation or discuss it with the Agent.',
            'A reproducible calculation does not establish that an interpretation predicts events. Keep the calculation, traditional meanings and AI suggestions distinct. When two results differ, compare the inputs and conventions first.',
          ],
        },
        {
          heading: 'BaZi: explicit time conventions',
          paragraphs: [
            'The engine is lunar-typescript 1.8.6. It accepts a Gregorian date from 1901 to 2099, the local birth time, and an IANA time zone or explicit UTC offset. Year and month pillars compare the birth instant with solar terms in fixed UTC+08:00 standard time. Day and hour pillars use the selected local clock unless solar correction is enabled.',
            'The day changes at midnight by default (sect=2); 23:00 is available as an alternative (sect=1). Under the default late-Zi convention, the library still advances the hour stem. Optional apparent solar time adjusts the day and hour calculation using longitude and an approximate equation of time. Year and month pillars keep the original birth instant. If the birth time is unknown, the hour pillar is omitted and year/month results use local noon provisionally, with a warning about solar-term dates.',
            'The element chart counts each visible stem and branch once. These are counts, not strength scores. They do not account for hidden-stem weights or seasonal effects and cannot establish favorable elements. Solar correction is approximate; compare settings when the time is close to a day or hour boundary.',
          ],
        },
        {
          heading: 'I Ching: keep the six original values',
          paragraphs: [
            'Online casts use cryptographic randomness to simulate three fair coins. You can also enter six values from your own coin tosses. Each line is 6, 7, 8 or 9. Read the lines from bottom to top; 6 and 9 change to form the resulting hexagram. Names follow the King Wen sequence.',
            'The theme prompts are written for Wenbu and are not quotations from a classical text. Traditions differ on how to read several changing lines. The tool shows all of them without presenting one approach as the only standard.',
          ],
        },
        {
          heading: 'Tarot: a full deck and a stated draw',
          paragraphs: [
            'A draw selects one or three cards with equal probability from a 78-card deck, without repeats. If reversals are enabled, each card has an independent 50 percent chance of being reversed. The three positions are Situation, Tension and Next Step. They organize the reading; they do not establish a sequence of future events.',
            'The 78 cards use original AI illustrations based on traditional tarot imagery, with keywords and prompts written for Wenbu. The model receives card names, orientations and keywords, not the images. Its comments on traditional symbolism should not be read as observations of details in this particular deck.',
          ],
        },
        {
          heading: 'Zi Wei: preserve school differences',
          paragraphs: [
            'The engine is iztro 2.6.1 with its default configuration and fixLeap=true. Enter the Gregorian date and known clock time at the birthplace. This tool does not convert time zones or apply solar correction, and it distinguishes early and late Zi hours. The traditional sex parameter is used by the calculation. Star and palace names remain in Chinese. Check conventions before comparing charts from different schools.',
          ],
        },
        {
          heading: 'The model and the checks',
          paragraphs: [
            'AI requests use the official DeepSeek API with the configured name deepseek-v4-flash. The provider can change which model a name refers to. Results show the model name returned by the service, not an independent verification of the underlying model. The model handles conversation and interpretation; it can still misread a result or a source.',
            'Software checks cover calendar fixtures, time-zone transitions, all 64 hexagram mappings, unique card draws, API input validation and MCP protocol behavior. Passing those tests supports the tested implementation conventions, not claims of divinatory accuracy.',
          ],
        },
      ],
    },
  },
  privacy: {
    zh: {
      title: '隐私与数据',
      description: '了解哪些资料会离开浏览器，什么保存在本地，以及如何选择、导出和移除自己的命盘与手记。',
      sections: [
        {
          heading: '你输入的资料怎样使用',
          paragraphs: [
            '出生信息通过加密连接发送到 Cloudflare Worker，用于生成命盘。抽牌和起卦接口不需要发送你的问题。问卜不会自动把出生资料、问题或解读写入服务器数据库，也不把它们放进页面地址。只有在反馈中主动勾选分享并提交的摘录会私密保存。',
            '单次解读在勾选发送说明后，将当前命盘、问题和主动补充的背景发送给 DeepSeek 官网 API。命理 Agent 在发送消息时，会发送最多 16 条最近消息、6 份命盘、2 版报告和你主动选择的出生资料、背景与手记。DeepSeek 按其自己的隐私政策处理这些数据；问卜不能代表上游承诺零保留。',
          ],
        },
        {
          heading: '会话、手记与导出文件',
          paragraphs: [
            '手记的保存按钮将结果写入当前浏览器的 localStorage，最多保留最近 100 条。没有默认的云端同步。共享设备上的其他使用者可能访问这些记录，清理浏览器数据会将其删除。',
            'Agent 会话自动保存在当前浏览器，可删除整段会话、导出 JSON，报告可导出 Markdown。取消选择资料不会从旧消息或已有命盘中移除这些信息；新建对话会从空白上下文开始。页面关闭会中断任务，已成功保存的结果可在刷新后恢复。存储不足时会提示导出备份。',
            '研习搜索问卜资料库与精选来源目录；外部阅读仅请求目录中的公开页面地址，不把出生资料或问题附加到这些网址。来源网站仍可能处理服务器请求信息。',
            '手记可逐条删除、在当前页面撤销，或导出 JSON 备份。工具页的「导出给 Agent」可以先预览，原始出生资料需额外勾选。完整会话导出则包含已保存的对话、资料与结果；即使没有出生日期，命盘和问题也可能涉及个人信息。',
          ],
        },
        {
          heading: '使用统计，可随时关闭',
          paragraphs: [
            '为了了解哪些页面和功能真正有用，我们通过本站接口向 Cloudflare D1 发送页面路径、来源类别、预先定义的推广活动、语言、国家级区域、设备与浏览器类别、功能事件、成功状态和耗时。不会发送出生日期、问题、聊天、命盘内容、笔记、原始 IP、完整来源网址或网址参数。',
            '公开网页、Markdown/JSON 手册和发现文件的 GET/HEAD 请求还会记录路径类别、响应状态、方法、耗时、客户端类别与分类依据，不附带浏览器访客或会话标识。搜索爬虫、AI 搜索、训练抓取和用户委托抓取分别归类；UA 自报可伪装，Cloudflare 验证和评分只在边缘提供时记录。不会保存完整 UA、网址参数或原始 IP。',
            '浏览器保存一个 30 天到期的随机访客标识和 30 分钟无活动后重置的会话标识。这些是浏览器访问估计，不等于真实人数。事件还记录时间、页面、操作与 Agent 回合的随机关联标识，帮助复盘使用过程。近期明细在 D1 保留 90 天；事件同时归档到私有 R2 长期保存，目前不设自动到期时间。明细、汇总和归档只对持有管理凭据的人开放。离线待发事件在本机最多暂存 7 天、1,000 条。',
            '本页可关闭本浏览器的统计，并设置仅表示关闭偏好的 cookie，让后续页面请求也停止统计；同时尊重 Do Not Track 和 Global Privacy Control。关闭后不再发送后续统计，不影响排盘或对话；已接收记录不会自动撤回，历史归档继续按上述政策保存。必要的额度与限速仍会运行。API、CLI 和 MCP 默认只记不含浏览器标识的功能、状态、耗时、国家与设备类别；可发送 X-Wenbu-Analytics: off，CLI 也可设置 WENBU_ANALYTICS=off。',
          ],
        },
        {
          heading: '页面交互分析',
          paragraphs: [
            '我们使用 Microsoft Clarity 的热力图和会话回放，了解点击、滚动和页面交互，帮助发现难用的位置。Clarity 在无 cookie 模式下运行，不授予广告或统计 cookie 存储权限；Microsoft 仍会处理网络请求信息（包括 IP）、页面地址与设备信息，按其自己的隐私政策处理和保留数据。Clarity 数据不会存入本站 D1 或 R2。',
            '工具、Agent 和手记的主内容区域设置了内容遮罩，包含聊天、出生资料、命盘、结果与笔记。输入框内容由 Clarity 默认遮罩；我们不使用自定义标识接口传送本站访客身份。管理后台、历史迁移页、本地预览和已标记测试会话不加载 Clarity。',
            '本页的统计开关同时控制 Clarity，DNT / GPC 也会阻止加载。运行中关闭会停止后续交互录制，但已经传送的数据不会撤回；无 cookie 模式下的访客与会话统计不能直接与本站统计相加。',
          ],
        },
        {
          heading: '免费额度与基础设施',
          paragraphs: [
            '为了控制滥用，Cloudflare 会处理请求的 IP。AI 额度使用每天变化的带密钥哈希，持久层只存日期、哈希和次数，按过期清理机制移除。边缘请求限速不等于真实用户识别，共享网络可能共用额度。',
            '除主动提交的反馈及其勾选分享的摘录外，应用不记录请求正文、不安装广告追踪脚本，也不读取浏览器以外的聊天、文件或位置。Cloudflare 的基础设施处理及 DeepSeek 的模型处理受各自政策约束。',
          ],
        },
        {
          heading: '反馈与更新',
          paragraphs: [
            '本说明更新于 2026-10-01。页面上的反馈入口私密保存评价、建议、可选邮箱和反馈编号。相关问题或结果的摘录默认不发送；勾选分享后可预览和删改。关闭使用统计仍可主动发送反馈，但不会附带统计身份。反馈用于处理问题和产品改进，目前不设自动到期时间；可通过新的反馈提供原反馈编号，请求删除。私人摘录和邮箱不会进入事件归档。公开 GitHub 问题中请勿包含私人资料或密钥。本地记录可在手记中删除，或清除本站浏览器存储。',
          ],
        },
      ],
    },
    en: {
      title: 'Privacy and your data',
      description:
        'What leaves your browser, what stays in your local journal, and how to choose, export or remove your reading data.',
      sections: [
        {
          heading: 'How your inputs are used',
          paragraphs: [
            'Birth details are sent over an encrypted connection to a Cloudflare Worker to calculate the chart. Casting and card-draw endpoints do not need your question. Wenbu does not automatically store birth details, questions or readings in its server database or put them in page URLs. An excerpt is stored privately only when you explicitly choose to share it in feedback.',
            'AI readings on the tool pages send the chart, question and selected context to the official DeepSeek API after you select the consent checkbox. Sending an Agent message shares up to 16 recent messages, 6 recent charts, 2 report versions and the birth details, notes and journal entries you explicitly select. DeepSeek processes them under its own privacy policy; Wenbu cannot promise zero retention on the provider’s behalf.',
          ],
        },
        {
          heading: 'Conversations, local journal and exports',
          paragraphs: [
            'Saving a journal entry writes it to this browser’s localStorage, which retains the latest 100 entries. There is no automatic cloud sync. Other users of a shared browser may access the records, and clearing browser storage removes them.',
            'Agent conversations save automatically in this browser. You can delete a conversation, export it as JSON or download reports as Markdown. Deselecting context does not remove the information from earlier messages or charts. Start a new conversation for an empty context. Closing the page interrupts the task; results that were saved successfully return after a reload. A storage failure prompts you to export a backup.',
            'Research searches Wenbu’s library and curated catalogue. External reading requests only listed public page URLs, without adding your question or birth details. Source websites may still process server request metadata.',
            'You can delete individual journal entries, undo a deletion on the current page and export JSON backups. On a tool page, “Export for an agent” offers a preview and excludes original birth details unless you select them. A full conversation export includes the saved messages, context and results. Even without a birth date, a chart or question may contain personal information.',
          ],
        },
        {
          heading: 'Optional usage statistics',
          paragraphs: [
            'Our first-party endpoint records page paths, source categories, registered campaigns, language, country-level region, device/browser categories, feature events, outcomes and durations in Cloudflare D1. It excludes birth details, questions, chat, chart contents, notes, raw IPs, full referrer URLs and URL query parameters.',
            'Public page, Markdown/JSON guide and discovery-file GET/HEAD requests also record a known path category, response status, method, duration, client category and classification evidence, without browser visitor or session identifiers. Search crawling, AI search, training crawls and user-triggered fetches are classified separately. User agents can be spoofed; Cloudflare verification and scores are recorded only when supplied by the edge. Full user agents, URL queries and raw IPs are not stored.',
            'A random browser identifier expires after 30 days; a session resets after 30 minutes of inactivity. These estimate browser visits, not individual people. Events also carry timestamps and random page, operation and Agent-turn IDs so we can understand usage journeys. Recent detail stays in D1 for 90 days; private R2 archives currently have no automatic expiry. Reports, individual events and archives require administrator credentials. Pending events can stay on your device for up to seven days, with a 1,000-event limit.',
            'Disable measurement on this page at any time. A preference-only cookie also disables measurement of subsequent page requests. We also honor Do Not Track and Global Privacy Control. Disabling stops future analytics without affecting tools or conversations; previously received events remain subject to the archive policy above. Necessary quota and rate-limit controls continue. API, CLI and MCP record coarse feature, status, duration, country and device categories without browser identifiers by default. Send X-Wenbu-Analytics: off to disable; the CLI also accepts WENBU_ANALYTICS=off.',
          ],
        },
        {
          heading: 'Page interaction analysis',
          paragraphs: [
            'We use Microsoft Clarity heatmaps and session replay to understand clicks, scrolling and page interactions, and identify usability problems. Clarity runs without analytics or advertising cookie storage permission. Microsoft still processes network request information, including IP addresses, page URLs and device information, under its own privacy and retention policies. Clarity data is not stored in our D1 database or R2 archive.',
            'The main content of tool, Agent and journal pages is explicitly masked, including conversations, birth details, charts, results and notes. Clarity masks input fields by default. We do not share our visitor identifiers through its custom identity API. Clarity does not load on the admin dashboard, history migration pages, local previews or sessions marked as tests.',
            'The measurement switch on this page also controls Clarity. Do Not Track and Global Privacy Control prevent it from loading. Disabling measurement during a visit stops further interaction recording; it does not withdraw data already sent. Clarity’s cookie-less visitor and session counts cannot be added to Wenbu’s own counts.',
          ],
        },
        {
          heading: 'Free allowances and infrastructure',
          paragraphs: [
            'Cloudflare processes request IPs for abuse controls. The AI allowance uses a daily keyed hash; persistent storage holds only dates, hashes and counts with expiry cleanup. Edge rate limiting is not user identification, and people on a shared network may share an allowance.',
            'Apart from submitted feedback and explicitly shared excerpts, the application does not log request bodies, include ad trackers or read external chats, files or location. Cloudflare infrastructure and DeepSeek model processing remain subject to their respective policies.',
          ],
        },
        {
          heading: 'Feedback and updates',
          paragraphs: [
            'Updated October 1, 2026. The feedback button privately stores your rating, note, optional email and receipt ID. Excerpts are off by default; you can review and edit one before choosing to share it. Feedback still works with analytics disabled, without analytics identifiers. Feedback currently has no automatic expiry and is used for issue resolution and product improvement. To request deletion, send a new note with the original receipt ID. Shared excerpts and email addresses are excluded from event archives. Keep private information and credentials out of public GitHub issues. Delete local records in the journal or clear this site’s browser storage.',
          ],
        },
      ],
    },
  },
  terms: {
    zh: {
      title: '使用说明与条款',
      description: '问卜用于文化探索、学习与自我反思。了解免费服务的使用范围、内容边界和可用性说明。',
      sections: [
        {
          heading: '用途与范围',
          paragraphs: [
            '问卜提供传统符号系统的计算工具、学习资料及可选 AI 解读。内容用于文化探索和反思，不保证未来事件，也不构成医疗、法律、投资或心理治疗服务。',
            '你对自己的现实决定负责。不要用命盘或占卜决定他人在招聘、信贷、教育等重要领域的资格，也不要根据符号对他人作未经证实的指控。',
          ],
        },
        {
          heading: '尊重资料与使用边界',
          paragraphs: [
            '仅提交你有权使用的资料。请求涉及他人时，请先取得对方同意，避免输入不必要的姓名、联系方式或其他敏感信息。',
            '请勿绕过限速、批量消耗模型额度、攻击接口或使用服务传播违法侵害内容。公开 API 与 MCP 适用于合理使用，可能因负载或维护调整限制。',
          ],
        },
        {
          heading: '费用与可用性',
          paragraphs: [
            '当前排盘、起卦、抽牌和本地手记免费；AI 解读与 Agent 对话有公开额度。当前没有订阅收费或付费解锁结果。免费服务受维护、网络与模型可用性影响，不提供无限调用或预测保证。',
            'AI 不可用或额度用完时，排盘与已保存的记录不受模型额度影响。排盘仍需网络连接。请自行导出本地记录的备份。',
          ],
        },
        {
          heading: '知识产权与反馈',
          paragraphs: [
            '源代码按仓库 LICENSE 提供，第三方依赖遵守各自许可证。品牌名称与第三方产品名称分别属于其权利人；比较页面不表示合作或背书。',
            '这些说明更新于 2026-09-29。发现计算错误或内容问题时，可通过项目 GitHub 提交可复现且不含私人资料的反馈。',
          ],
        },
      ],
    },
    en: {
      title: 'Terms and use of Wenbu',
      description:
        'The scope of the free service, appropriate use of personal information, and the distinction between cultural reflection and professional advice.',
      sections: [
        {
          heading: 'Purpose and scope',
          paragraphs: [
            'Wenbu offers traditional symbolic calculators, learning material and optional AI reflection. It does not guarantee future events or provide medical, legal, investment or psychotherapy services.',
            'You remain responsible for real-world decisions. Do not use a chart to determine another person’s eligibility for employment, credit, education or other high-impact opportunities, or as evidence for an accusation.',
          ],
        },
        {
          heading: 'Respect information and service limits',
          paragraphs: [
            'Only submit information you are entitled to use. Obtain permission before submitting another person’s details and omit unnecessary names, contact information and sensitive data.',
            'Do not bypass limits, exhaust shared AI allowances, attack the service or use it to infringe others’ rights. Public API and MCP access are subject to reasonable-use limits that may change with load or maintenance.',
          ],
        },
        {
          heading: 'Cost and availability',
          paragraphs: [
            'Charts, casts, draws and the local journal are currently free. AI readings and Agent conversations have published allowances. There are no current subscriptions or paid result unlocks. Service availability depends on maintenance, network conditions and model access. Free use does not include unlimited calls or guaranteed predictions.',
            'Calculations and saved records do not use the AI allowance. Calculations still need a network connection. Export local records to keep your own backup.',
          ],
        },
        {
          heading: 'Ownership and feedback',
          paragraphs: [
            'Source code is provided under the repository LICENSE; dependencies retain their own licenses. Product names belong to their respective holders, and comparisons do not imply a partnership or endorsement.',
            'Updated October 1, 2026. Report calculation or content issues through GitHub with reproducible examples and private information removed.',
          ],
        },
      ],
    },
  },
  free: {
    zh: {
      title: '免费功能与使用额度',
      description:
        '八字、易经、塔罗、紫微和本地手记免费。单次 AI 解读每天 5 次，Agent 每天 12 回合，均按网络计数并受全站额度限制。',
      sections: [
        {
          heading: '哪些功能免费？',
          paragraphs: [
            '八字排盘与五行构成图、紫微十二宫、易经三钱法起卦、78 张塔罗抽牌、本地手记、JSON 导出和知识手册，当前都无需付款或注册。MCP 与 CLI 的计算接口也免费开放。',
            '工具接口当前按请求 IP 限流，每分钟最多 60 次；同一网络的使用者可能共享限制。请避免短时间内大量重复请求。',
          ],
        },
        {
          heading: 'AI 解读怎样计算额度？',
          paragraphs: [
            '每个网络每天最多 5 次工具页 AI 解读，另有 12 回合 Agent 对话，按上海时间（UTC+08:00）零点重置。一次发送算一个对话回合，后续追问使用新回合。共享 Wi-Fi、公司网络或同一 IPv6 网段可能共用额度，不是按个人账户计数。',
            '所有访客另共享每天 1,000 次模型请求的全站预算，其中 Agent 最多使用 600 次。一回合最多调用模型 5 次、执行工具 12 次；模型请求会在调用前预留额度。超时或服务失败也可能消耗额度。输入、上下文和输出有长度限制。',
          ],
        },
        {
          heading: '额度结束之后',
          paragraphs: [
            'AI 额度用完后，仍可排盘、抽牌、起卦、保存手记和导出结果。也可以通过 MCP 把计算结果交给你自己的 AI 助手；外部助手使用的模型与费用按其服务计算，Wenbu 的计算接口不需要你的 DeepSeek 密钥。',
            '额度以当前运行配置为准。若有调整，会更新此页与界面说明；已保存的本地记录不受 AI 额度影响。',
          ],
        },
      ],
    },
    en: {
      title: 'Free to use, with clear limits',
      description:
        'Free charts, casts, tarot and a local journal. Optional AI readings have a daily per-network allowance and a shared site budget.',
      sections: [
        {
          heading: 'What is free?',
          paragraphs: [
            'BaZi charts and element counts, Zi Wei charts, three-coin I Ching casts, 78-card tarot draws, the local journal, JSON exports and learning guides are free to use without an account. Calculation tools are also free through MCP and the CLI.',
            'Tool endpoints currently allow up to 60 requests per minute per IP address. People sharing a network may share this limit. Avoid sending large bursts of repeated requests.',
          ],
        },
        {
          heading: 'How the AI allowance works',
          paragraphs: [
            'Each network can use up to five AI readings on the tool pages and 12 Agent turns per day. Sending a message starts one turn; a follow-up uses another. Allowances reset at midnight in Shanghai (UTC+08:00). People on shared Wi-Fi, an office network or the same IPv6 network prefix may share this allowance. It is not an individual account limit.',
            'All visitors also share a daily budget of 1,000 model requests, of which the Agent can use up to 600. A turn can make up to five model calls and 12 tool calls. Each model request reserves its allowance before contacting DeepSeek, so timeouts and provider failures may still use it. Input, context and output lengths are limited.',
          ],
        },
        {
          heading: 'After the allowance is used',
          paragraphs: [
            'You can still calculate charts, cast, draw cards, save readings and export results. MCP lets an AI assistant you already use interpret the result with its own model. That assistant’s fees and limits still apply. Wenbu’s calculation tools do not require your DeepSeek key.',
            'These are the current operating limits. We will update this page and the interface if they change. The AI allowance does not restrict access to records saved in your browser.',
          ],
        },
      ],
    },
  },
};
