import type { Copy } from './articles';
type Page = { zh: Copy; en: Copy };
export const pages: Record<string, Page> = {
  about: {
    zh: {
      title: '关于问卜',
      description:
        'Wenbu 问卜是一组免费、透明、易于使用的命理与占卜工具，帮助人们在古老符号中找到当下的思考。',
      sections: [
        {
          heading: '问而有思，行而有度',
          paragraphs: [
            '问卜，是提出一个问题，也给自己留下一点思考的空间。Wenbu 读作 wen-boo，来自中文「问卜」。我们希望古老的符号可以进入现代生活，同时保留清楚的来由与边界。',
            '网站由 Gene Dai 构建，提供八字、易经、塔罗和紫微工具，以及可导出的本地手记。无需姓名和账户即可开始。',
          ],
        },
        {
          heading: '我们在乎什么',
          paragraphs: [
            '让计算可复核，让解释被明确标记，让不确定性被保留。我们不制造专家头衔、用户见证或准确率，也不用恐吓性的说法推动付费。',
            '内容与代码使用 AI 辅助制作，解释性文字并非由经认证的命理专家审定。算法采用公开库和明确的约定；发现问题时，优先修正计算、来源或表达，而不是为旧答案补故事。',
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
        'Free, transparent tools for BaZi, I Ching, tarot and Zi Wei, built to make cultural reflection accessible without turning symbols into verdicts.',
      sections: [
        {
          heading: 'Ask thoughtfully. Act with care.',
          paragraphs: [
            'Wenbu, pronounced wen-boo, comes from the Chinese phrase 问卜: to ask an oracle. We want old symbolic languages to be accessible in modern life, with their methods and limits kept visible.',
            'Built by Gene Dai, Wenbu offers four tools and an exportable local journal. You can begin without a name or an account.',
          ],
        },
        {
          heading: 'What matters to us',
          paragraphs: [
            'Calculations should be reproducible. Interpretations should be labeled. Uncertainty should remain visible. We do not invent credentials, testimonials or accuracy rates, or use frightening claims to push purchases.',
            'The content and code are AI-assisted; interpretive material has not been certified by a professional practitioner. The engines use public libraries and explicit conventions. When something is wrong, the response is to fix the calculation, source or wording.',
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
          heading: '计算、传统与解释，分别说明',
          paragraphs: [
            '命盘和随机结果由代码生成，DeepSeek 只在用户请求时参与解释。页面把原始结构和解读分开。符号解释属于文化探索，不是对未来、性格或他人的事实鉴定。',
          ],
        },
        {
          heading: '八字：时间规则要先说清楚',
          paragraphs: [
            '采用 lunar-typescript 1.8.6。出生资料为 1901–2099 年公历日期、当地时间、IANA 时区或明确偏移。年、月柱用对应绝对时刻在北京时间下的节气规则；日、时柱用所选当地时钟。',
            '默认零点换日（sect=2），可选子初换日（sect=1）。默认规则下晚子时时干仍使用库的次日约定。可选真太阳时采用经度与低阶均时差近似，不承诺天文历表级精度。未知时间不生成时柱，年、月柱以中午暂定并提示交节不确定性。',
            '五行图每个可见干支各计一次，不加入藏干权重、季节强度或喜用神判定。',
          ],
        },
        {
          heading: '易经：保留六个原始数字',
          paragraphs: [
            '在线起卦使用密码学随机数模拟三枚公平硬币；也可手动录入 6–9。六爻按自下而上排列。6 与 9 为动爻，翻转后构成之卦。卦名采用文王卦序映射。',
            '主题提示为原创文字。我们没有将现代注本整本复制进模型提示，也不把多动爻的某一种解释规则宣称为唯一传统。',
          ],
        },
        {
          heading: '塔罗：完整牌组，明确随机过程',
          paragraphs: [
            '从 78 张牌中均匀、不放回抽取 1 张或 3 张。开启逆位时，每张牌独立以 50% 概率逆位。三张牌阵为当下、牵引、下一步；它们是阅读位置，不是预测保证。牌面抽象图形与提示文字为原创。',
          ],
        },
        {
          heading: '紫微：保留流派边界',
          paragraphs: [
            '采用 iztro 2.6.1 默认配置、fixLeap=true，输入当地民用日期与已知时间，不自动校正太阳时。早子、晚子分开处理。传统男女参数用于排盘规则，不用于评价人的身份或资格。宫位与星曜保留中文名称。',
          ],
        },
        {
          heading: '模型与验证',
          paragraphs: [
            'AI 请求发往 DeepSeek 官网 API，配置名为 deepseek-v4-flash。官方当前把该兼容别名路由到 V4.1-Flash，界面会显示上游实际返回的模型名。模型可以产生错误解释，不能作为计算或科学预测的证据。',
            '工程检查包括历法样例、时区与夏令时边界、全部 64 种卦象映射、牌组去重、API 输入校验与 MCP 协议测试。通过软件测试仅说明这些已测试行为符合约定，不等于命理预测得到验证。',
          ],
        },
      ],
    },
    en: {
      title: 'Our methods, in the open',
      description:
        'Calculation conventions, random-draw methods, model responsibilities and uncertainty for all four Wenbu tools.',
      sections: [
        {
          heading: 'Calculation, tradition and interpretation',
          paragraphs: [
            'Code generates the chart or draw. DeepSeek only interprets it when you request a reading. The interface separates the original structure from the prose. Symbolic interpretation is cultural exploration, not a factual assessment of the future or another person.',
          ],
        },
        {
          heading: 'BaZi: explicit time conventions',
          paragraphs: [
            'The engine is lunar-typescript 1.8.6. Input is a Gregorian date from 1901–2099, local time, and IANA zone or explicit offset. Year/month pillars follow solar terms at the absolute instant expressed in Beijing time; day/hour pillars follow the selected local clock.',
            'The default is midnight (sect=2), with a 23:00 Zi option (sect=1). Under the default late-Zi convention, the library advances the hour stem. Optional solar correction uses longitude and a low-order equation-of-time approximation, not a precision ephemeris. Unknown time omits the hour pillar and flags provisional noon-based year/month results.',
            'The element chart counts each visible stem and branch once. It does not weight hidden stems, season or favorable elements.',
          ],
        },
        {
          heading: 'I Ching: keep the six original values',
          paragraphs: [
            'Online casts use cryptographic randomness to simulate three fair coins. Manual values 6–9 are also accepted. Lines run bottom to top; 6 and 9 change to construct the resulting hexagram. Names use the King Wen sequence.',
            'Themes are original editorial prompts. We do not bundle modern commentaries wholesale or present one multiple-changing-line method as the only tradition.',
          ],
        },
        {
          heading: 'Tarot: a full deck and a stated draw',
          paragraphs: [
            'One or three cards are selected uniformly without replacement from 78 cards. Optional reversals use an independent 50 percent chance per card. The three positions are Situation, Tension and Next Step. Artwork and prompt wording are original.',
          ],
        },
        {
          heading: 'Zi Wei: preserve school differences',
          paragraphs: [
            'The engine is iztro 2.6.1 with its default configuration and fixLeap=true. It uses entered local civil date/time, no solar correction, and separate early/late-Zi indexes. The traditional sex parameter is a calculation input, not an evaluation of identity or eligibility. Star and palace labels remain in Chinese.',
          ],
        },
        {
          heading: 'The model and the checks',
          paragraphs: [
            'AI requests use the official DeepSeek API with the configured name deepseek-v4-flash. DeepSeek currently routes that compatibility alias to V4.1-Flash; the interface shows the model reported by the provider. Interpretation can still be wrong.',
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
            '出生信息通过加密连接发送到 Cloudflare Worker，用于生成命盘。抽牌和起卦接口不需要发送你的问题。问卜不把出生资料、问题或解读写入服务器数据库，也不把它们放进页面地址。',
            '只有点击免费解读并勾选发送说明时，当前命盘、问题和主动补充的背景才会发送给 DeepSeek 官网 API。DeepSeek 按其自己的隐私政策处理这些数据；问卜不能代表上游承诺零保留。',
          ],
        },
        {
          heading: '手记与导出文件',
          paragraphs: [
            '保存按钮将结果写入当前浏览器的 localStorage，最多保留最近 100 条。没有默认的云端同步。共享设备上的其他使用者可能访问这些记录，清理浏览器数据会将其删除。',
            '你可以逐条移除手记、在当前页面撤销，或导出 JSON 备份。Agent 上下文导出可预览，原始出生信息需额外勾选；即使不包含出生日期，命盘和问题仍可能属于个人信息。',
          ],
        },
        {
          heading: '免费额度与基础设施',
          paragraphs: [
            '为了控制滥用，Cloudflare 会处理请求的 IP。AI 额度使用每天变化的加密哈希，持久层只存日期、哈希和次数，按过期清理机制移除。边缘请求限速不等于真实用户识别，共享网络可能共用额度。',
            '应用不记录请求正文、不安装广告追踪脚本，也不读取浏览器以外的聊天、文件或位置。Cloudflare 的基础设施处理及 DeepSeek 的模型处理受各自政策约束。',
          ],
        },
        {
          heading: '反馈与更新',
          paragraphs: [
            '本说明更新于 2026-09-28。反馈入口位于 GitHub 项目；公开问题中请勿包含私人出生资料、聊天内容或密钥。需要删除本地记录，可在手记页面操作，或清除该站点的浏览器存储。',
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
            'Birth details are sent over an encrypted connection to a Cloudflare Worker to calculate the chart. Casting and card-draw endpoints do not need your question. Wenbu does not write birth details, questions or readings to its server database or put them in page URLs.',
            'Only when you request an AI reading and check the disclosure are the chart, question and selected context sent to the official DeepSeek API. DeepSeek processes them under its own privacy policy; Wenbu cannot promise zero retention on the provider’s behalf.',
          ],
        },
        {
          heading: 'Local journal and exports',
          paragraphs: [
            'Saving writes a record to this browser’s localStorage, retaining the most recent 100 entries. There is no automatic cloud sync. Other users of a shared browser may access the records, and clearing browser storage removes them.',
            'You can remove individual entries, undo a removal on the current page and export JSON backups. Agent exports can be previewed and omit original birth details unless selected. A chart or personal question may still be sensitive even without a birth date.',
          ],
        },
        {
          heading: 'Free allowances and infrastructure',
          paragraphs: [
            'Cloudflare processes request IPs for abuse controls. The AI allowance uses a daily keyed hash; persistent storage holds only dates, hashes and counts with expiry cleanup. Edge rate limiting is not user identification, and people on a shared network may share an allowance.',
            'The application does not log request bodies, include ad trackers or read external chats, files or location. Cloudflare infrastructure and DeepSeek model processing remain subject to their respective policies.',
          ],
        },
        {
          heading: 'Feedback and updates',
          paragraphs: [
            'Updated September 28, 2026. Use the GitHub project for feedback, without including birth details, private conversations or credentials in public issues. Remove local records in the journal or clear this site’s browser storage.',
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
            '当前排盘、起卦、抽牌和本地手记免费；AI 解读有公开额度。当前没有订阅收费或付费解锁结果。我们不承诺永久可用、无限调用或任何流量与预测结果。',
            '模型或网络失败时，计算工具与已保存记录尽可能保持独立可用。请自行导出本地记录的备份。',
          ],
        },
        {
          heading: '知识产权与反馈',
          paragraphs: [
            '源代码按仓库 LICENSE 提供，第三方依赖遵守各自许可证。品牌名称与第三方产品名称分别属于其权利人；比较页面不表示合作或背书。',
            '这些说明更新于 2026-09-28。发现计算错误或内容问题时，可通过项目 GitHub 提交可复现且不含私人资料的反馈。',
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
            'Charts, casts, draws and the local journal are currently free. AI readings have a published allowance. There are no current subscriptions or paid result unlocks. We do not promise permanent availability, unlimited calls or guaranteed predictions or traffic.',
            'Calculations and saved records are designed to remain usable independently of model availability. Export your own local backups.',
          ],
        },
        {
          heading: 'Ownership and feedback',
          paragraphs: [
            'Source code is provided under the repository LICENSE; dependencies retain their own licenses. Product names belong to their respective holders, and comparisons do not imply a partnership or endorsement.',
            'Updated September 28, 2026. Report calculation or content issues through GitHub with reproducible examples and private information removed.',
          ],
        },
      ],
    },
  },
  free: {
    zh: {
      title: '免费使用，说明白',
      description:
        '八字、易经、塔罗、紫微和本地手记免费。AI 每个网络每天 5 次，另有全站总额度，额度结束不会锁住工具。',
      sections: [
        {
          heading: '哪些功能免费？',
          paragraphs: [
            '八字排盘、五行可见字图、紫微十二宫、三钱法起卦、78 张塔罗抽牌、本地手记、JSON 导出、公开学习内容，以及 MCP 和 CLI 的计算接口，当前都无需付款或注册。',
            '工具接口有每分钟请求限速，用于维持服务可用，并不意味着无限批量调用。',
          ],
        },
        {
          heading: 'AI 解读怎样计算额度？',
          paragraphs: [
            '每个网络每天最多 5 次 AI 请求，全站每天最多 1,000 次，按上海时间零点换日。共享 Wi-Fi、公司网络或同一 IPv6 网段可能共用额度；这不是精确的个人账户计数。',
            '每次 AI 请求在调用上游前占用一次额度。超时或上游失败也可能消耗额度，因为远端调用可能已经发生。单次输入、上下文和输出都有长度限制。',
          ],
        },
        {
          heading: '额度结束之后',
          paragraphs: [
            '你仍然可以查看命盘、抽牌、起卦、记录手记和导出上下文。也可以通过 MCP 把计算结果交给你自己使用的 Agent 解读；Wenbu 不向 Agent 索取 DeepSeek 密钥。',
            '这些限制是当前运行配置。若未来调整，会更新此页与界面说明，而不会把已保存的本地记录放到付费墙后面。',
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
            'BaZi charts, visible-element diagrams, Zi Wei palaces, three-coin I Ching casts, 78-card tarot draws, the local journal, JSON exports, learning content and calculation access through MCP and CLI currently need no payment or account.',
            'Tool endpoints have a per-minute rate limit to keep the service available. Free access does not mean unlimited automated bulk requests.',
          ],
        },
        {
          heading: 'How the AI allowance works',
          paragraphs: [
            'Each network receives up to five AI requests per day, within a site-wide budget of 1,000 requests. The day resets at midnight in Shanghai. Shared Wi-Fi, office networks or an IPv6 network prefix may share the allowance; it is not an individual-account counter.',
            'A request reserves an allowance before contacting the provider. Timeouts and provider failures may consume a request because an upstream call may already have occurred. Input, context and output lengths are bounded.',
          ],
        },
        {
          heading: 'After the allowance is used',
          paragraphs: [
            'You can still calculate charts, cast, draw, save and export. MCP also lets your own agent interpret the calculation using its model. Wenbu never asks an agent for the DeepSeek service key.',
            'These are the current operating limits. Future changes will be reflected here and in the interface; local journal records are not placed behind a paywall.',
          ],
        },
      ],
    },
  },
};
