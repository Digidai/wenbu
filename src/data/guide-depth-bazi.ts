import type { GuideExpansion } from './guide-types';

const implementation = {
  title: 'Wenbu · BaZi calculation and declared conventions',
  url: 'https://github.com/Digidai/wenbu/blob/main/src/lib/bazi.ts',
};
const mappings = {
  title: 'lunar-typescript · stem, branch and Ten Gods mappings',
  url: 'https://github.com/6tail/lunar-typescript/blob/master/src/lib/LunarUtil.ts',
};
const calendar = {
  title: 'Hong Kong Observatory · The 24 Solar Terms',
  url: 'https://www.hko.gov.hk/en/gts/time/24solarterms.htm',
};

export const baziDepth: Record<string, GuideExpansion> = {
  'bazi-basics': {
    zh: {
      answer:
        '读八字可以分成三层：先核对出生资料与排盘约定，再辨认四柱、日主和五行关系，最后才讨论传统解释。一张有用的入门命盘，应让你能指出每个字从哪里来，也能说清哪些结论并未由这些字证明。',
      takeaways: [
        '读表前先看列名；有些排盘从右往左列年、月、日、时，不能只凭左右位置认日主。',
        '同一张盘里，可见干支、地支藏干和十神是三种信息；学习时分层核对，避免重复计数。',
        '保存日期、时区、换日及太阳时设置，别人才能复算；一张脱离输入的截图并不完整。',
      ],
      figure: {
        caption: '一张可复算的示例盘：乙酉、戊子、辛巳、壬辰。',
        description:
          '四列按年、月、日、时排列。上行天干依次是乙、戊、辛、壬，下行地支依次是酉、子、巳、辰。日柱的辛被标为日主，是比较其他天干的参照。下方表格与实例再逐字核对五行归属和数量。',
      },
      table: {
        title: '第一遍看盘，按这个顺序检查',
        columns: ['检查项', '示例中能确认的内容', '下一步'],
        rows: [
          ['出生资料', '2005-12-23 08:37，Asia/Shanghai', '确认公历、记录来源及是否为大致时间'],
          ['计算约定', '民用时；零点换日；不作太阳时校正', '与另一工具比较时使用相同设置'],
          ['四柱', '乙酉、戊子、辛巳、壬辰', '按列名识别年、月、日、时'],
          ['日主', '辛：阴金', '以辛为参照比较其他天干'],
          ['可见五行', '木 1、火 1、土 2、金 2、水 2', '合计 8；不要把藏干再加入这张计数图'],
          ['解释范围', '结构已核对，人生判断尚未得到验证', '把想进一步了解的关系写成具体问题'],
        ],
      },
      example: {
        title: '从输入到一句准确的读盘描述',
        intro:
          '这是学习用的固定样本，不代表某位用户。采用公历 2005 年 12 月 23 日 08:37、Asia/Shanghai、民用时和零点换日；结果用问卜所用的 lunar-typescript 1.8.6 核对。',
        steps: [
          '先确定时刻：当日上海为 UTC+08:00，08:37 对应 00:37 UTC。记录的是当地钟表时间，不需要先把输入框中的时间手动减去八小时。',
          '写下四柱乙酉、戊子、辛巳、壬辰。08:37 落在辰时的 07:00 至 09:00 区间；月支为子，但这不能通过公历“12 月”直接推导，仍需交节规则。',
          '找到日干辛。年干乙、月干戊、时干壬都要相对于辛读十神；不要用年干乙充当日主。日干本身在问卜标作“日主”。',
          '逐字核算五行：乙木、酉金、戊土、子水、辛金、巳火、壬水、辰土。八次观察得到 1、1、2、2、2，而非强弱比例。',
          '最后写一句可检查的描述：“此示例为辛金日主，时柱壬辰，五行图统计八个可见干支。”需要进一步解释时，再询问某个关系的传统用法和所需条件。',
        ],
        conclusion:
          '完成这五步，你得到了一份能复算、能纠错的读盘记录。即使暂时不做 AI 解读，也已经掌握了继续学习所需的结构。',
      },
      faq: [
        {
          question: '八字必须先转换成农历再输入吗？',
          answer:
            '不用。问卜出生日期输入采用公历，历法转换由工具完成。如果手头是农历记录，要先确认年份、月份及是否闰月，再转换一次；把已转换的日期再次当农历处理会造成错误。',
        },
        {
          question: '为什么两个人可能有相同八字？',
          answer:
            '四柱使用有限的干支组合，时柱通常覆盖一个双小时区间，因此不同个体可能获得相同结构。相同符号不包含他们各自的经历、环境、选择与后续变化，不能据此认为人生相同。',
        },
        {
          question: '初学者需要马上看大运和流年吗？',
          answer:
            '先把出生盘与约定核对好。大运与流年属于进一步的传统分析，还涉及起运等规则；不能把页面上尚未计算的项目自行补成已确定的结果。可以先请 Agent 解释一项概念。',
        },
      ],
      glossary: [
        { term: '四柱', definition: '出生年、月、日、时对应的四组干支；每组由一个天干和一个地支组成。' },
        { term: '日主', definition: '日柱的天干，是十神关系的计算参照；不是生肖，也不是整根日柱。' },
        { term: '藏干', definition: '按传统对应表列在地支内部的天干，与可见天干属于不同信息层。' },
      ],
    },
    en: {
      answer:
        'Read a BaZi chart in three passes: check the birth record and calculation settings, identify the four pillars and their relationships, then consider interpretation. A useful beginner chart lets you trace each label to an input or rule. It also makes clear which claims about a person do not follow from the calculation.',
      takeaways: [
        'Read the column headings first. Some charts place the year on the right, so the Day Master is not always in the same visual position.',
        'Visible characters, hidden stems and Ten Gods are separate layers. Keep them separate when checking a chart or counting elements.',
        'Save the date, time zone and boundary settings with the result. A screenshot of eight characters alone is not a reproducible record.',
      ],
      figure: {
        caption: 'A reproducible example: Yi You, Wu Zi, Xin Si and Ren Chen.',
        description:
          'Four columns show year, month, day and hour. The upper stems are Yi, Wu, Xin and Ren; the lower branches are You, Zi, Si and Chen. Xin is marked as the Day Master, the reference for comparing other stems. The table and worked example below check each character’s element and the resulting counts.',
      },
      table: {
        title: 'A first-pass chart checklist',
        columns: ['Check', 'What the example establishes', 'What to do next'],
        rows: [
          [
            'Birth record',
            '2005-12-23, 08:37, Asia/Shanghai',
            'Confirm the calendar and how precisely the time was recorded',
          ],
          [
            'Conventions',
            'Civil clock; midnight boundary; no solar correction',
            'Match these settings before comparing calculators',
          ],
          [
            'Four pillars',
            '乙酉 / 戊子 / 辛巳 / 壬辰',
            'Identify the year, month, day and hour by their headings',
          ],
          ['Day Master', 'Xin: yin Metal', 'Compare other stems with Xin'],
          [
            'Visible elements',
            'Wood 1, Fire 1, Earth 2, Metal 2, Water 2',
            'Check that the total is eight; do not add hidden stems',
          ],
          [
            'Interpretation',
            'The structure is checked; personal claims are not established',
            'Choose one relationship to study next',
          ],
        ],
      },
      example: {
        title: 'Turn a birth record into a statement you can verify',
        intro:
          'This fixed teaching example is not a user profile. It uses December 23, 2005 at 08:37 in Asia/Shanghai, the civil clock, and a midnight day boundary. The pillars were checked with lunar-typescript 1.8.6, the engine used by Wenbu.',
        steps: [
          'Establish the instant. Shanghai was UTC+08:00 on this date, so 08:37 local time corresponds to 00:37 UTC. Enter the recorded local time in the form; do not subtract eight hours yourself and still select Shanghai.',
          'Record the four pillars: Yi You, Wu Zi, Xin Si and Ren Chen. The time falls in the Chen interval, from 07:00 to before 09:00. The Zi month still requires the solar-term calculation; it is not a direct translation of “December.”',
          'Locate Xin in the day column. Compare the year stem Yi, month stem Wu and hour stem Ren with Xin when reading the Ten Gods. Yi, the year stem, is not the reference simply because it appears first.',
          'Count the visible assignments: Wood, Metal, Earth, Water, Metal, Fire, Water, Earth. This gives 1, 1, 2, 2 and 2 in Wenbu’s element order. It is a count of characters, not a measurement of strength.',
          'Write a narrow conclusion: “This example has a Xin Metal Day Master and a Ren Chen hour pillar; the diagram counts eight visible characters.” Ask a separate question if you want to explore a traditional interpretation.',
        ],
        conclusion:
          'You now have a record that another reader can reproduce and correct. That is useful progress even without an AI reading, and a sound starting point for learning the remaining chart vocabulary.',
      },
      faq: [
        {
          question: 'Should I convert my date to the lunar calendar first?',
          answer:
            'No. Wenbu’s birth-date field takes a Gregorian date. If your original record is lunar, verify the year, month and leap-month status before converting it once. Entering an already converted date as though it were still lunar creates a second, incorrect conversion.',
        },
        {
          question: 'Can different people have the same BaZi?',
          answer:
            'Yes. The stem-branch combinations are finite, and an hour pillar usually spans a two-hour interval. The same symbols do not record each person’s circumstances, experiences or choices, and do not imply identical lives.',
        },
        {
          question: 'Should I start with luck cycles and annual readings?',
          answer:
            'Check the birth chart first. Luck-cycle calculations introduce further conventions, including how their start is determined. Do not assume a feature has been calculated if it is absent from the output; begin by asking the Agent to explain the concept and its prerequisites.',
        },
      ],
      glossary: [
        {
          term: 'Four Pillars',
          definition: 'Four stem-branch pairs assigned to the birth year, month, day and hour.',
        },
        {
          term: 'Day Master',
          definition:
            'The heavenly stem of the day pillar, used as the reference for Ten Gods relationships.',
        },
        {
          term: 'Hidden stems',
          definition:
            'Stems associated with a branch by a traditional lookup table; a separate layer from the visible stems.',
        },
      ],
    },
    sources: [
      {
        ...implementation,
        noteZh: '支持输入、换日、计数口径与产品显示范围；本文固定样本已对照本地实现核算。',
        noteEn:
          'Documents the inputs, day boundary, counting method and product scope; the worked example was checked against the implementation.',
      },
      {
        ...mappings,
        noteZh: '支持干支五行、藏干和十神对应；这些是规则表，不是预测效力的证据。',
        noteEn:
          'Provides element, hidden-stem and Ten Gods mappings; lookup rules are not evidence of predictive validity.',
      },
      {
        ...calendar,
        noteZh: '支持节气是太阳黄经划分的历法背景；八字取柱约定另见计算实现。',
        noteEn:
          'Explains the astronomical basis of solar terms; BaZi pillar conventions are documented separately in the implementation.',
      },
    ],
  },
  'five-elements': {
    zh: {
      answer:
        '五行图首先要回答“统计了什么”。问卜按每个可见天干、地支各计一次；数量最多不等于最旺，数量为零也不等于需要补充。理解相生相克后，再区分可见计数、藏干与季节等不同层次，才能读懂图表而不被图表误导。',
      takeaways: [
        '相生顺序是木→火→土→金→水→木；相克顺序是木→土→水→火→金→木。箭头有方向。',
        '一个辰在可见字图里只计一次土；辰的藏干戊、乙、癸不能再混进同一组八字计数。',
        '比较两张五行图，先核对统计对象与分母，再比较数字；未知时刻的六字图不能当成完整八字图。',
      ],
      figure: {
        caption: '两套有方向的关系：相生与相克。',
        description:
          '五个节点分别为木、火、土、金、水。外圈相生箭头依次由木指火、火指土、土指金、金指水、水指木；内侧相克箭头由木指土、土指水、水指火、火指金、金指木。两种线形分别标注“生”和“克”，无需凭颜色区分。图中没有五行强弱、个人评分或吉凶顺序。',
      },
      table: {
        title: '同一元素的四种关系',
        columns: ['元素', '它生什么', '什么生它', '它克什么', '什么克它'],
        rows: [
          ['木', '火', '水', '土', '金'],
          ['火', '土', '木', '金', '水'],
          ['土', '金', '火', '水', '木'],
          ['金', '水', '土', '木', '火'],
          ['水', '木', '金', '火', '土'],
        ],
      },
      example: {
        title: '追踪一个“土 2”到底从哪里来',
        intro:
          '沿用已核算的教学盘乙酉、戊子、辛巳、壬辰。输入为 2005-12-23 08:37、Asia/Shanghai，民用时、零点换日。本例只核对构成，不判断喜用神。',
        steps: [
          '把八个可见字分别归类。土来自月干戊和时支辰，所以土的数量是 2；木来自乙，火来自巳，金来自酉和辛，水来自子和壬。',
          '检查分母：1 + 1 + 2 + 2 + 2 = 8。若另一个页面把土显示为 25%，它在这个口径下最多表示 2/8；不能把百分号理解为“土的能量强度”。',
          '展开辰的藏干戊、乙、癸。它提供了进一步研究的关系，但若把这三个字直接加到原图，统计对象就变了。应另建藏干表并说明口径，而不是仍把总数叫八个字。',
          '假设时刻未知，问卜省略壬辰，可见计数会变成木 1、火 1、土 1、金 2、水 1，总数 6。水由 2 变 1 是信息减少，不是这个人突然失去某种属性。',
          '把学习问题写得更具体：“请解释子月的季节背景在某个传统体系中如何参与判断，并与可见字计数分开。”这让后续解读明确新增了哪些假设。',
        ],
        conclusion:
          '读图时最重要的复核是“数谁、数几次、总数是多少”。先守住这个口径，才有条件继续学习更复杂的传统分析。',
      },
      faq: [
        {
          question: '相克是不是表示冲突或坏事？',
          answer:
            '相克是五行关系的名称，例如金克木。单条关系没有给出发生什么事、程度多大或一定好坏。把它直接翻译成人际冲突，会跳过对象、位置和解释体系等前提。',
        },
        {
          question: '五行数量一样，是不是就“平衡”了？',
          answer:
            '数量相同只能说明计数相同。季节、藏干及传统强弱判断没有被这个数字概括；更不能从数量相等推出现实中的健康、心理或关系状态。',
        },
        {
          question: '五行与纳音里的元素为什么不一样？',
          answer:
            '它们使用不同映射。可见五行给单个干、支分类；纳音给一组干支配上传统名称。比较前先确认页面显示哪一种，不能拿纳音标签替换日主五行或直接加入计数。',
        },
      ],
      glossary: [
        { term: '相生', definition: '木、火、土、金、水之间按固定方向形成的生成关系。' },
        { term: '相克', definition: '木克土、土克水、水克火、火克金、金克木的制约关系。' },
        { term: '计数口径', definition: '约定哪些对象参与统计、每个对象计几次，以及分母如何确定。' },
      ],
    },
    en: {
      answer:
        'Before reading a five-element diagram, ask what it counts. Wenbu assigns one count to each visible stem and branch. A larger count does not establish greater strength, and zero does not establish a deficiency. Learn the generating and controlling relationships, then keep visible counts separate from hidden stems and seasonal interpretation.',
      takeaways: [
        'Generation runs Wood → Fire → Earth → Metal → Water → Wood. Control runs Wood → Earth → Water → Fire → Metal → Wood.',
        'Chen contributes one Earth count to the visible-character chart. Its hidden stems Wu, Yi and Gui are not three additional visible characters.',
        'Compare the objects and denominator before comparing diagrams. Six visible characters with an unknown hour are not a complete eight-character sample.',
      ],
      figure: {
        caption: 'Two directed cycles: generating and controlling.',
        description:
          'Five nodes represent Wood, Fire, Earth, Metal and Water. The outer generating arrows connect Wood to Fire, Fire to Earth, Earth to Metal, Metal to Water and Water to Wood. The inner controlling arrows connect Wood to Earth, Earth to Water, Water to Fire, Fire to Metal and Metal to Wood. The two paths have distinct labels and line styles, so color is not required. Neither path ranks personal strength or fortune.',
      },
      table: {
        title: 'Four relationships for each element',
        columns: ['Element', 'Produces', 'Produced by', 'Controls', 'Controlled by'],
        rows: [
          ['Wood', 'Fire', 'Water', 'Earth', 'Metal'],
          ['Fire', 'Earth', 'Wood', 'Metal', 'Water'],
          ['Earth', 'Metal', 'Fire', 'Water', 'Wood'],
          ['Metal', 'Water', 'Earth', 'Wood', 'Fire'],
          ['Water', 'Wood', 'Metal', 'Fire', 'Earth'],
        ],
      },
      example: {
        title: 'Where does an Earth count of two come from?',
        intro:
          'Use the checked teaching chart Yi You / Wu Zi / Xin Si / Ren Chen: December 23, 2005 at 08:37, Asia/Shanghai, civil time and a midnight boundary. This exercise checks composition; it does not select a favorable element.',
        steps: [
          'Assign the eight visible characters. Earth comes from the month stem Wu and hour branch Chen. Wood comes from Yi; Fire from Si; Metal from You and Xin; Water from Zi and Ren. Each character is counted once.',
          'Check the denominator: 1 + 1 + 2 + 2 + 2 = 8. A display of 25% Earth could express 2/8 under this method. It would not, merely by using a percentage, become a measurement of elemental energy.',
          'Inspect Chen’s hidden stems: Wu, Yi and Gui. They add information for further study, but adding them to the same chart changes the statistical object. Put them in a separate table with its own method instead of calling the enlarged total “eight characters.”',
          'Now suppose the time is unknown. Omitting Ren Chen produces Wood 1, Fire 1, Earth 1, Metal 2 and Water 1: six observations. Water falling from two to one reflects missing input, not a change in the person.',
          'Frame the next question precisely: “Explain how a named interpretive approach uses the Zi month’s seasonal context, separately from these counts.” This makes the additional assumptions visible instead of concealing them inside a chart.',
        ],
        conclusion:
          'The useful checks are what was counted, how often, and out of what total. Once those are clear, you can explore more complex traditional methods without confusing them with the simpler diagram.',
      },
      faq: [
        {
          question: 'Does a controlling relationship mean something bad?',
          answer:
            'No particular event follows from the relationship alone. “Metal controls Wood” names a connection in the system; it does not specify who is involved, what will happen, or how severe an outcome might be. Those are separate interpretive claims.',
        },
        {
          question: 'Do equal counts mean a balanced person?',
          answer:
            'Equal counts establish equal counts. They do not incorporate seasonal assessment or hidden-stem weighting, and they do not measure health, emotional stability or relationship quality.',
        },
        {
          question: 'Why might a nayin element differ from the chart’s elements?',
          answer:
            'Nayin assigns a traditional label to a stem-branch pair. The visible-element diagram classifies individual stems and branches. These are different mappings: do not replace the Day Master’s element with a nayin label or add the label to the visible count.',
        },
      ],
      glossary: [
        {
          term: 'Generating cycle',
          definition:
            'The directed sequence in which Wood produces Fire, then Earth, Metal, Water and Wood again.',
        },
        {
          term: 'Controlling cycle',
          definition:
            'The directed sequence Wood–Earth–Water–Fire–Metal–Wood, also described as regulation or restraint.',
        },
        {
          term: 'Counting method',
          definition:
            'The stated objects, weights and denominator behind a diagram; necessary context for interpreting its numbers.',
        },
      ],
    },
    sources: [
      {
        title: '《尚书·洪范》 / Shang Shu, Hong Fan',
        url: 'https://zh.wikisource.org/wiki/尚書/洪範',
        noteZh: '支持五行名称及传统物象的经典背景；本文不把该篇当作现代强弱算法或预测研究。',
        noteEn:
          'Provides classical context for the five names and their imagery; it is not a modern weighting algorithm or a prediction study.',
      },
      {
        ...mappings,
        noteZh: '支持可见干支的五行和藏干对应；生克表也可由十神关系交叉核对。',
        noteEn:
          'Supports visible-character assignments and hidden stems; the relationship mappings also allow cross-checking the cycles.',
      },
      {
        ...implementation,
        noteZh: '支持已知时刻计 8、未知时刻计 6，以及不加权藏干和季节的产品口径。',
        noteEn:
          'Documents the eight- or six-character count and the exclusion of hidden-stem and seasonal weighting.',
      },
    ],
  },
  'bazi-ten-gods': {
    zh: {
      answer:
        '十神不是十个独立的人格类型，而是“另一个天干相对于日主是什么关系”。先确定谁生谁、谁克谁，再区分阴阳同异，就能得到可核对的名称。同一个天干换了参照日主，十神名称也会改变。',
      takeaways: [
        '五类关系各分阴阳同异，共十类；“正、偏”不是道德评价，也不是可靠性等级。',
        '算十神先锁定日干。辛日主遇乙为偏财；不能直接套用甲日主的示例表。',
        '地支的多个藏干可以对应多个十神；把整根地支简化成一个名称会丢失信息。',
      ],
      figure: {
        caption: '以日主为参照，先判断五类关系，再分阴阳。',
        description:
          '关系框架以日主为参照，分同我、我生、我克、克我、生我五类，再比较阴阳。同我对应比肩和劫财，我生对应食神和伤官，我克对应偏财和正财，克我对应七杀和正官，生我对应偏印和正印。每对名称先列同阴阳、后列异阴阳；下表将这套规则应用于辛金日主。',
      },
      table: {
        title: '换成辛金日主，亲手核对一遍',
        columns: ['与辛的关系', '同阴阳：辛为阴', '异阴阳：对方为阳'],
        rows: [
          ['同我：金', '辛 → 比肩', '庚 → 劫财'],
          ['我生：金生水', '癸 → 食神', '壬 → 伤官'],
          ['我克：金克木', '乙 → 偏财', '甲 → 正财'],
          ['克我：火克金', '丁 → 七杀', '丙 → 正官'],
          ['生我：土生金', '己 → 偏印', '戊 → 正印'],
        ],
      },
      example: {
        title: '把三个可见天干和一个地支拆开读',
        intro:
          '教学盘为乙酉、戊子、辛巳、壬辰，按 2005-12-23 08:37、Asia/Shanghai、民用时、零点换日核算。这里仅演示名称推导，不评判整体格局。',
        steps: [
          '先圈出日干辛：阴金。年干乙属阴木，金克木，属于“我克”；双方同为阴，故乙相对辛是偏财。',
          '再看月干戊：阳土。土生金，属于“生我”；戊阳、辛阴，故为正印。不要因为戊在月柱，就改用它作为十神参照。',
          '时干壬属阳水。金生水，属于“我生”；壬阳、辛阴，故为伤官。问卜英文卡片把它简写为 Innovation，传统资料中也常见 Hurting Officer。',
          '展开时支辰的藏干戊、乙、癸：相对辛分别为正印、偏财、食神。辰的可见五行归土，并不意味着它全部藏干只含土，也不意味着只有一个十神。',
          '反向检查：如果将参照换成庚阳金，同样的乙阴木就成为正财。其他输入不变而日主参照被误换，足以让整张十神表看似不同。',
        ],
        conclusion:
          '一个可复核的十神解释应包含四项：日主、对方天干、五行方向、阴阳同异。单独报出“偏财”或“伤官”，省略了最能帮助你理解的计算过程。',
      },
      faq: [
        {
          question: '日干自己算不算比肩？',
          answer:
            '从关系表看，一个辛相对于另一个辛属于比肩；但命盘里的日干是参照点。问卜把该位置标为“日主”，避免把参考对象误当作额外出现的一位比肩。',
        },
        {
          question: '英文标签和书里的译法对不上怎么办？',
          answer:
            '优先核对中文十神及计算关系。问卜的 Learning 对应正印，Innovation 对应伤官；传统英译可能是 Direct Resource、Hurting Officer。标签不同不一定是算法不同，导出或提问时带上中文原词。',
        },
        {
          question: '有正官就一定适合当管理者吗？',
          answer:
            '关系表没有测量管理能力，也没有提供任职概率。传统解释还会讨论位置、季节和组合，现实判断则需工作经验、能力与环境。可以拿标签来提问，不能让名称替代证据。',
        },
      ],
      glossary: [
        { term: '阴阳同异', definition: '比较两个天干的阴阳是否相同；甲丙戊庚壬为阳，乙丁己辛癸为阴。' },
        { term: '生我／我生', definition: '分别表示对方五行生成日主五行、日主五行生成对方五行，方向相反。' },
        { term: '官杀', definition: '克日主的五行关系；同阴阳称七杀，异阴阳称正官。' },
      ],
    },
    en: {
      answer:
        'The Ten Gods classify another stem in relation to the Day Master; they are not ten standalone personality types. Identify the direction of the element relationship, then compare yin-yang polarity. This produces a label you can check. Change the Day Master, and the same other stem can acquire a different label.',
      takeaways: [
        'Five relationship groups split into matching and differing polarity. “Direct” and “indirect” are inherited names, not moral or quality ratings.',
        'Fix the reference stem first. Yi is Indirect Wealth relative to Xin; a worked table for Jia cannot be reused without recalculation.',
        'A branch can contain several hidden stems and therefore several Ten Gods relationships. One branch label cannot preserve all of that detail.',
      ],
      figure: {
        caption: 'Start at the Day Master, identify a relationship, then compare polarity.',
        description:
          'The framework compares five groups with the Day Master: same element, what I produce, what I control, what controls me, and what produces me. Matching and differing polarity give, respectively: Peer and Rob Wealth; Eating God and Hurting Officer; Indirect and Direct Wealth; Seven Killings and Direct Officer; Indirect and Direct Resource. Each pair lists matching polarity first. The table applies this framework to Xin Metal.',
      },
      table: {
        title: 'A complete relationship table for Xin Metal',
        columns: ['Relationship to Xin', 'Matching polarity: yin', 'Different polarity: yang'],
        rows: [
          ['Same element: Metal', 'Xin → 比肩 / Peer', 'Geng → 劫财 / Rob Wealth'],
          ['Metal produces Water', 'Gui → 食神 / Eating God', 'Ren → 伤官 / Hurting Officer'],
          ['Metal controls Wood', 'Yi → 偏财 / Indirect Wealth', 'Jia → 正财 / Direct Wealth'],
          ['Fire controls Metal', 'Ding → 七杀 / Seven Killings', 'Bing → 正官 / Direct Officer'],
          ['Earth produces Metal', 'Ji → 偏印 / Indirect Resource', 'Wu → 正印 / Direct Resource'],
        ],
      },
      example: {
        title: 'Read three visible stems, then unpack one branch',
        intro:
          'Use Yi You / Wu Zi / Xin Si / Ren Chen, checked for December 23, 2005 at 08:37 in Asia/Shanghai, civil time and a midnight boundary. The exercise derives relationship names, not an overall chart rating.',
        steps: [
          'Circle Xin, the yin Metal Day Master. Yi, the year stem, is yin Wood. Metal controls Wood, so this is the “what I control” group. Both stems are yin, which makes Yi Indirect Wealth relative to Xin.',
          'Examine Wu, the yang Earth month stem. Earth produces Metal: “what produces me.” Their polarities differ, making Wu Direct Resource. Its location in the month pillar does not make it the reference for the other stems.',
          'Ren, the hour stem, is yang Water. Metal produces Water and the polarities differ, giving Hurting Officer. Wenbu’s English chart uses the shorter reflection label Innovation for this relationship; keep the Chinese 伤官 when comparing references.',
          'Unpack Chen into its hidden stems Wu, Yi and Gui. Relative to Xin, these are Direct Resource, Indirect Wealth and Eating God. Classifying the visible branch as Earth does not mean every hidden stem is Earth or that the branch has only one relationship.',
          'Check the reference by changing it deliberately: relative to Geng, yang Metal, the same Yi becomes Direct Wealth. An accidental change of Day Master can therefore make an entire relationship table appear inconsistent.',
        ],
        conclusion:
          'A checkable explanation names the Day Master, the other stem, the element direction and the polarity comparison. Reporting only “Wealth” or “Hurting Officer” leaves out the reasoning a learner needs.',
      },
      faq: [
        {
          question: 'Is the Day Master itself a Peer?',
          answer:
            'The lookup relationship of Xin to another Xin is Peer. In a chart, however, the day stem is the reference point. Wenbu labels that position Day Master instead of presenting it as an additional Peer occurrence.',
        },
        {
          question: 'Why do English translations differ?',
          answer:
            'Translations emphasize different aspects of inherited terms. Wenbu’s Learning corresponds to 正印, often called Direct Resource; Innovation corresponds to 伤官, often called Hurting Officer. Match the Chinese name and underlying relationship before concluding that two calculators disagree.',
        },
        {
          question: 'Does Direct Officer imply management ability?',
          answer:
            'The classification does not measure professional ability or the probability of a promotion. Traditional interpretation adds conditions such as position, season and combinations; a real career judgment needs evidence about skills and circumstances. A label can prompt a question without answering it.',
        },
      ],
      glossary: [
        {
          term: 'Polarity',
          definition:
            'Jia, Bing, Wu, Geng and Ren are yang; Yi, Ding, Ji, Xin and Gui are yin. Compare both stems.',
        },
        {
          term: 'Produces me / I produce',
          definition:
            'Opposite directions: the other element generates the Day Master’s element, or the Day Master’s generates the other.',
        },
        {
          term: 'Officer and Killings',
          definition:
            'The group that controls the Day Master: differing polarity gives Direct Officer; matching polarity gives Seven Killings.',
        },
      ],
    },
    sources: [
      {
        ...mappings,
        noteZh: '十神对应表是一手实现依据；本文已逐一核验辛日主的十种关系和辰藏干。',
        noteEn:
          'The primary implementation mapping; all ten Xin relationships and the Chen hidden stems were checked against it.',
      },
      {
        ...implementation,
        noteZh: '支持问卜以日干为参照、日柱标为日主及英文短标签的实际行为。',
        noteEn:
          'Documents Wenbu’s day-stem reference, Day Master label and shorter English reflection labels.',
      },
    ],
  },
  'unknown-birth-time': {
    zh: {
      answer:
        '不知道出生时刻仍可学习八字，但应保留未知，不填一个看似精确的时间。问卜会省略时柱；遇到交节、换日或太阳时可能跨界的情况，还要把受影响的年、月、日柱标成候选结果，而不是把三柱都当成确定值。',
      takeaways: [
        '“不知道”“上午”“约 08:30”是不同精度的资料。保留原始说法和来源，不擅自补分钟。',
        '问卜用当地中午暂算未知时刻的年、月柱；这是计算占位，不是推断你出生在午时。',
        '比较候选盘是敏感性检查；没有独立出生记录，不能仅凭“哪盘更像我”确定真实时刻。',
      ],
      figure: {
        caption: '四种出生资料，分别能保留哪些信息。',
        description:
          '四张卡片比较只有日期和地点、家人记得“早上”、约 08:50 且可能前后 20 分钟，以及 23 点左右四种资料。每张卡片列出应当保留的原始信息；这些是不同情境，不是必须依次完成的步骤。下方完整表格补充各自需要检查的边界，以及夏令时回拨的情况。',
      },
      table: {
        title: '不同资料精度，可以做哪些判断',
        columns: ['现有资料', '可以保留', '需要暂缓或对照'],
        rows: [
          ['只有公历日期和地点', '日期、出生地时区、未知状态', '时柱；交节日的年、月柱及可能跨日的情况'],
          ['家人记得“早上”', '原始说法与来源', '不要自动换成 08:00；先确认时间范围'],
          [
            '约 08:50，可能前后 20 分钟',
            '08:30–09:10 的候选区间',
            '辰、巳两个时辰；太阳时校正可能再改变边界',
          ],
          ['记录 23 点左右', '所用民用日期与时间范围', '零点、子初换日以及晚子时时干规则'],
          ['有精确记录但处于夏令时回拨', '记录的钟表时间', '还需偏移信息，才能在两个真实时刻中选择'],
        ],
      },
      example: {
        title: '只有交节日的日期，三柱也未必都确定',
        intro:
          '假设仅知道 2024 年 2 月 4 日出生于上海，时刻完全未知。采用民用时、零点换日；12:00 与 18:00 只是用于比较的样本，不是出生时刻推测。',
        steps: [
          '保留日期与 Asia/Shanghai，并明确时间未知。问卜的中午占位会暂算出癸卯年、乙丑月、戊戌日，时柱为空。',
          '核对该日是立春交节日。引擎 1.8.6 的交节结果约为当地 16:27；这是具体引擎输出，不能把分钟显示当成对真实出生时刻的精度声明。',
          '用 12:00 做交节前样本，得到癸卯、乙丑、戊戌；用 18:00 做交节后样本，得到甲辰、丙寅、戊戌。比较可见年、月改变而这两个样本的日柱相同。',
          '把结论写成候选条件：“立春前为癸卯年乙丑月，之后为甲辰年丙寅月；时刻未明，无法在两者之间确定。”若再采用子初换日，23 点之后的日柱需另行检查。',
          '继续寻找独立记录，例如家中保存的出生记录或能界定上午、下午的材料。只把能确认的新信息用于缩小区间，不用一段性格描述替代时间证据。',
        ],
        conclusion:
          '未知时刻不是一个必须被模型补完的空格。保留候选范围，反而让结果更诚实，也让之后找到新资料时容易修正。',
      },
      faq: [
        {
          question: '能不能统一填 12:00？',
          answer:
            '可以把中午当作明确标注的学习或敏感性样本，但不能把它保存成已知出生时刻。直接填入 12:00 会生成午时柱，让后续读者误以为这项输入有记录支持。',
        },
        {
          question: '日主一定不受未知时刻影响吗？',
          answer:
            '不一定。采用子初换日、存在日期记录误差或太阳时校正跨日时，都可能影响日柱。只有先界定候选时段并检查边界，才知道哪部分结构在该区间内稳定。',
        },
        {
          question: 'Agent 能通过人生经历反推出准确时辰吗？',
          answer:
            '它可以帮助整理候选与依据，但不能把与经历相符的叙述当成独立时间证明。要区分出生记录、家人回忆和解释匹配；没有证据支持的分钟或概率应保持未知。',
        },
      ],
      glossary: [
        { term: '候选区间', definition: '现有记录能支持的最早与最晚可能时刻，而不是模型猜测的最佳时间。' },
        { term: '占位时间', definition: '为运行计算而临时采用的时刻；不表示观测值或用户已确认的信息。' },
        {
          term: '敏感性检查',
          definition: '在明确的候选范围或规则之间比较结果，找出哪些柱稳定、哪些会变化。',
        },
      ],
    },
    en: {
      answer:
        'You can study BaZi without a birth time, provided the unknown stays visible. Wenbu omits the hour pillar. Near a solar-term transition, day boundary or solar-time shift, other pillars may also need to remain provisional. Do not turn a missing time into a precise-looking input merely to complete the chart.',
      takeaways: [
        '“Unknown,” “in the morning” and “around 08:30” carry different information. Keep the original wording and its source instead of inventing minutes.',
        'Wenbu uses local noon to provisionally calculate the year and month when time is absent. Noon is a placeholder, not a birth-time estimate.',
        'Comparing possible charts tests sensitivity. Choosing the reading that feels familiar does not independently establish the real time.',
      ],
      figure: {
        caption: 'Four kinds of birth information and what each can establish.',
        description:
          'Four cards compare a date and place alone, a relative’s recollection of “morning,” approximately 08:50 within twenty minutes, and a time around 23:00. Each card identifies the original information to keep. These are alternative situations, not sequential steps. The full table below adds the boundaries to check and the case of a daylight-saving fallback.',
      },
      table: {
        title: 'What each level of detail supports',
        columns: ['Available information', 'Keep as evidence', 'Leave open or compare'],
        rows: [
          [
            'Date and place only',
            'The date, birth time zone and unknown status',
            'Hour pillar; other pillars near relevant boundaries',
          ],
          [
            'A relative remembers “morning”',
            'The wording and who recalls it',
            'Do not silently replace it with 08:00',
          ],
          [
            'About 08:50, within 20 minutes',
            'An 08:30–09:10 candidate interval',
            'Chen and Si hours; possible solar-time boundary effects',
          ],
          [
            'Around 23:00',
            'The recorded civil date and time range',
            'Midnight versus Zi boundary and late-Zi hour-stem rules',
          ],
          [
            'A precise clock time during a DST fallback',
            'The written clock time',
            'The offset needed to identify one of two instants',
          ],
        ],
      },
      example: {
        title: 'A date-only record on a solar-term transition day',
        intro:
          'Suppose the only known details are February 4, 2024 and Shanghai. Use civil time and a midnight day boundary. The times 12:00 and 18:00 below are comparison samples, not estimates of the birth time.',
        steps: [
          'Keep the date, Asia/Shanghai and an explicitly unknown time. Wenbu’s noon placeholder gives provisional Gui Mao year, Yi Chou month and Wu Xu day pillars, with no hour pillar.',
          'Check for a relevant transition. This is the Li Chun date. Engine 1.8.6 places the transition at about 16:27 local time. That is an engine result, not evidence that the missing birth record is precise to the minute.',
          'Calculate a sample before the transition at 12:00: Gui Mao / Yi Chou / Wu Xu. At 18:00, the sample becomes Jia Chen / Bing Yin / Wu Xu. The year and month change, while these two samples share the day pillar.',
          'Write the result conditionally: before Li Chun, the year and month are Gui Mao and Yi Chou; afterward, Jia Chen and Bing Yin. The birth time is insufficient to choose. If a 23:00 day boundary is used, examine the late evening separately.',
          'Seek independent information that might narrow the interval, such as a surviving birth record or evidence of morning versus afternoon. Add only what the record supports; a persuasive personality description is not a substitute for time evidence.',
        ],
        conclusion:
          'An unknown time does not need to be completed by a model. Keeping a candidate range makes the chart easier to revise when better information becomes available.',
      },
      faq: [
        {
          question: 'Can I simply enter noon?',
          answer:
            'Use noon as an explicitly labeled teaching or comparison sample if useful. Do not save it as a known birth time: entering 12:00 generates an hour pillar that a later reader could reasonably mistake for a result supported by a record.',
        },
        {
          question: 'Is the Day Master always certain without a time?',
          answer:
            'No. A Zi boundary, uncertainty about the recorded date, or a solar-time adjustment across a day boundary can affect the day pillar. First define the possible interval, then check which results stay the same throughout it.',
        },
        {
          question: 'Can an Agent recover the exact time from life events?',
          answer:
            'It can organize candidates and explain assumptions. A reading that matches a life story is not independent proof of birth time. Keep documentary records, remembered details and interpretive matches separate; unsupported minutes and probabilities should remain unknown.',
        },
      ],
      glossary: [
        {
          term: 'Candidate interval',
          definition:
            'The earliest and latest times supported by the available information, rather than a model’s preferred guess.',
        },
        {
          term: 'Placeholder time',
          definition:
            'A temporary computational input that is neither an observation nor a confirmed personal detail.',
        },
        {
          term: 'Sensitivity check',
          definition:
            'Comparing allowed inputs or conventions to identify which parts of a result stay fixed and which change.',
        },
      ],
    },
    sources: [
      {
        ...implementation,
        noteZh: '支持省略时柱、中午占位及交节日警告；例中两个候选已用相同引擎核算。',
        noteEn:
          'Documents the omitted hour pillar, noon placeholder and solar-term warning; both candidate samples were checked with the same engine.',
      },
      {
        title: 'Hong Kong Observatory · 2024 calendar conversion table',
        url: 'https://www.hko.gov.hk/en/gts/time/calendar/pdf/files/2024e.pdf',
        noteZh: '独立核对 2024 年立春日期；具体交节时分取本文说明的引擎结果。',
        noteEn:
          'Independently checks the 2024 Li Chun date; the stated transition time comes from the named engine.',
      },
      {
        title: 'lunar-typescript · EightChar implementation',
        url: 'https://github.com/6tail/lunar-typescript/blob/master/src/lib/EightChar.ts',
        noteZh: '支持四柱字段和两种日界设置的计算约定，不支持由经历确定出生时刻。',
        noteEn:
          'Documents pillar fields and day-boundary conventions, not a method for establishing birth time from life events.',
      },
    ],
  },
  'birth-time-timezone': {
    zh: {
      answer:
        '出生钟表时间要先结合日期与当时的时区，才能得到一个确定时刻。太阳时是另一个明确选择的计算约定：在地方经度修正上加入均时差。问卜用近似公式校正日、时柱，年、月柱仍按原始绝对时刻比较交节，不能把所有时间都一起平移。',
      takeaways: [
        '先确认记录的时区，再考虑太阳时；太阳时选项不能修复错误的日期、夏令时或 UTC 偏移。',
        '东经取正、西经取负。问卜的修正分钟数为 4 × 经度 − 当时 UTC 偏移分钟数 + 均时差。',
        '靠近时辰或换日边界时保存两种约定的结果；近似校正不是消除出生记录误差的方法。',
      ],
      figure: {
        caption: '把记录时间、绝对时刻与太阳时约定分开检查。',
        description:
          '四张检查卡分别列出出生记录、历史时区、太阳时约定、换日与时辰，以及每一项需要核对的资料。它们帮助定位两盘差异来自哪一层。下方完整表格另列年、月交节检查和常见错误；太阳时实例再展示如何保留原始时刻与修正量。',
      },
      table: {
        title: '两盘不一致，先定位哪一层不同',
        columns: ['检查层', '需要核对的资料', '常见误差'],
        rows: [
          ['出生记录', '公历日期、当地钟表时间、记录精度', '把农历日期直接填入公历输入框'],
          ['历史时区', '出生地 IANA 时区及当日 UTC 偏移', '使用现居地时区，或手动重复扣除夏令时'],
          ['太阳时约定', '是否启用、经度、修正量和公式', '东西经符号反了，或把均时差当成经度差'],
          ['换日与时辰', '零点或 23:00 换日、晚子时时干规则', '两盘日柱不同，却只比较 AI 解读措辞'],
          ['年、月交节', '是否比较同一个绝对时刻及交节点', '把地方太阳时校正再次作用于交节时刻'],
        ],
      },
      example: {
        title: '算一次上海教学样本的太阳时修正',
        intro:
          '假设记录为 2005-12-23 08:37、Asia/Shanghai；另取教学用经度东经 121.5°。这只是指定坐标下的复算例，不宣称代表上海所有出生地点。均时差采用问卜当前近似公式。',
        steps: [
          '把历史时区确定为 UTC+08:00，即偏移 +480 分钟；原始绝对时刻为 00:37 UTC。保持这个时刻用于年、月交节比较。',
          '算经度项：121.5 × 4 − 480 = +6 分钟。该经度比东经 120° 的标准子午线偏东 1.5°，地方平太阳时相应领先六分钟。',
          '代入该日期的近似均时差，约 +1.3 分钟。总修正约 +7.3 分钟，得到约 08:44 的视太阳时；秒位即使由程序给出，也不代表高精度观测。',
          '比较边界：08:37 和约 08:44 都在辰时，且没有跨日，因此本样本四柱仍为乙酉、戊子、辛巳、壬辰。“做了校正”不等于“必然换柱”。',
          '保存原始 08:37、时区、121.5°、启用状态和 +7.3 分钟。不要把 08:44 当成新的原始时间再次启用校正，否则会重复加上修正量。',
        ],
        conclusion:
          '可复核的结果要保留原始时间与变换过程。真正值得注意的是是否跨过规则边界，以及记录本身是否足够准确，而不是小数位有多少。',
      },
      faq: [
        {
          question: '国外出生也要先换成北京时间吗？',
          answer:
            '输入时使用出生地记录的当地时间与时区。问卜内部把绝对时刻转成固定 UTC+08:00 用于交节比较，日、时柱仍按所选当地时钟约定处理。手动改成北京时间再选出生地时区，会错配同一瞬间。',
        },
        {
          question: '用了 IANA 时区，还要手动减夏令时吗？',
          answer:
            '通常不用，时区库会按日期解析偏移。若记录恰好处于时钟前拨或回拨，问卜会拒绝不存在或含糊的当地时间；需要先确认记录含义，再给出明确偏移，不能随意选一个。',
        },
        {
          question: '真太阳时是否一定比民用时更正确？',
          answer:
            '它们是不同的取时约定。天文学能解释太阳时的定义与修正，但不能单凭这一定义证明某个命理解读流派更有效。先写明采用哪种规则，临界时刻再对照结果。',
        },
      ],
      glossary: [
        { term: 'UTC 偏移', definition: '当地钟表时间相对于 UTC 的差值；必须对应出生当日，不能只查今天。' },
        { term: '地方平太阳时', definition: '按地方经度表达的平均太阳时间；经度相差一度，时间约差四分钟。' },
        { term: '均时差', definition: '这里采用“视太阳时减平太阳时”的符号约定；正值表示视太阳时领先。' },
      ],
    },
    en: {
      answer:
        'A recorded clock time identifies an instant only after its date and historical time zone are known. Solar time is a separate calculation convention, combining a longitude adjustment with the equation of time. Wenbu applies its approximate correction to the local clock used for day and hour pillars; year and month transitions still use the original instant.',
      takeaways: [
        'Resolve the recorded time zone before considering solar time. A solar-time switch cannot repair an incorrect date, DST assumption or UTC offset.',
        'Use positive longitude east of Greenwich and negative longitude west. Wenbu adds 4 × longitude − UTC offset in minutes + equation of time.',
        'Near a day or hour boundary, retain both sets of conventions and results. An approximate correction cannot remove uncertainty in the birth record.',
      ],
      figure: {
        caption: 'Check the recorded clock, the instant and the solar-time convention separately.',
        description:
          'Four cards identify the information needed to check the birth record, historical time zone, solar-time convention, and day/hour boundaries. Use them to locate the layer behind a disagreement. The full table below adds year/month transitions and common mistakes; the worked example then preserves the original instant alongside the correction.',
      },
      table: {
        title: 'Find the layer that differs between two charts',
        columns: ['Layer', 'Information to compare', 'A common mistake'],
        rows: [
          [
            'Birth record',
            'Gregorian date, local clock time and precision',
            'Entering a lunar date in a Gregorian field',
          ],
          [
            'Historical time zone',
            'Birthplace IANA zone and offset on that date',
            'Using the current residence or subtracting DST twice',
          ],
          [
            'Solar-time convention',
            'On/off, longitude, correction and formula',
            'Reversing longitude or confusing it with equation of time',
          ],
          [
            'Day and hour boundaries',
            'Midnight or 23:00; late-Zi hour-stem convention',
            'Comparing interpretation before checking different day pillars',
          ],
          [
            'Year and month transitions',
            'The same instant and solar-term boundary',
            'Applying the local solar correction to the transition again',
          ],
        ],
      },
      example: {
        title: 'Work through a solar-time adjustment',
        intro:
          'Assume a record of December 23, 2005 at 08:37 in Asia/Shanghai and a teaching longitude of 121.5° east. This is a specified coordinate, not a claim that every Shanghai birthplace has that longitude. The equation of time uses Wenbu’s current approximate formula.',
        steps: [
          'Resolve the historical offset: UTC+08:00, or +480 minutes. The original instant is 00:37 UTC. Keep that instant for year and month solar-term comparisons.',
          'Calculate the longitude component: 121.5 × 4 − 480 = +6 minutes. The chosen point is 1.5° east of the 120° standard meridian, making local mean solar time six minutes ahead.',
          'Add the formula’s equation-of-time value for the date, approximately +1.3 minutes. The total adjustment is about +7.3 minutes, producing approximately 08:44 apparent solar time. Displayed seconds do not turn the approximation into a precise observation.',
          'Check the relevant boundaries. Both 08:37 and approximately 08:44 remain in the Chen hour and on the same day. The example therefore retains Yi You / Wu Zi / Xin Si / Ren Chen. Applying a correction does not necessarily change a pillar.',
          'Save the original 08:37, the zone, 121.5° longitude, the enabled setting and the +7.3-minute correction. Do not enter 08:44 as the new original time with correction still enabled; that would apply the adjustment twice.',
        ],
        conclusion:
          'A reproducible chart preserves the recorded time and each transformation. The useful questions are whether a boundary was crossed and whether the birth record is precise enough, not how many decimal places the software displays.',
      },
      faq: [
        {
          question: 'Should an overseas birth be entered in Beijing time?',
          answer:
            'Enter the recorded local time and birthplace time zone. Wenbu internally uses fixed UTC+08:00 for the same instant when checking solar terms. Its day and hour calculation follows the selected local-clock convention. Converting the input yourself and retaining the birthplace zone would misidentify the instant.',
        },
        {
          question: 'Should I subtract daylight saving after choosing an IANA zone?',
          answer:
            'Usually not: the time-zone library resolves the offset for the date. Wenbu rejects skipped or ambiguous local times during clock changes. Clarify the record and provide the intended offset rather than choosing one arbitrarily.',
        },
        {
          question: 'Is apparent solar time always the correct choice?',
          answer:
            'It is a different convention with an astronomical definition. That definition does not establish which interpretive school makes more valid claims. State the convention first and compare results near a boundary.',
        },
      ],
      glossary: [
        {
          term: 'UTC offset',
          definition:
            'The difference between a local clock and UTC on the relevant date; today’s offset is not necessarily the historical one.',
        },
        {
          term: 'Local mean solar time',
          definition:
            'Mean solar time expressed at a particular longitude, changing by about four minutes per degree.',
        },
        {
          term: 'Equation of time',
          definition:
            'Here, apparent minus mean solar time: a positive value means apparent solar time is ahead.',
        },
      ],
    },
    sources: [
      {
        title: 'U.S. Naval Observatory · The Equation of Time',
        url: 'https://aa.usno.navy.mil/faq/eqtime',
        noteZh: '支持视太阳时、平太阳时与均时差的定义；示例数值取问卜近似公式，不冒充天文台历表结果。',
        noteEn:
          'Defines apparent time, mean time and their difference; example values come from Wenbu’s approximation, not an observatory ephemeris.',
      },
      {
        title: 'IANA · Time zone and daylight saving time data',
        url: 'https://data.iana.org/time-zones/tz-link.html',
        noteZh: '支持按地区保存历史 UTC 偏移和夏令时规则的时区数据背景。',
        noteEn: 'Explains the location-based database of historical UTC offsets and daylight-saving rules.',
      },
      {
        ...implementation,
        noteZh: '支持公式、符号、拒绝歧义时刻及年/月与日/时分开处理；本文已复算 +7.3 分钟示例。',
        noteEn:
          'Documents the formula, signs, rejection of ambiguous inputs and separate pillar handling; the +7.3-minute example was recalculated.',
      },
      {
        ...calendar,
        noteZh: '支持用太阳黄经确定节气的天文背景，区别于地方钟表或经度修正。',
        noteEn:
          'Explains solar terms as ecliptic-longitude boundaries, distinct from a local-clock or longitude adjustment.',
      },
    ],
  },
  'chinese-zodiac-vs-bazi': {
    zh: {
      answer:
        '生肖与八字不是同一份信息的两种名字。民俗生肖通常随农历新年换年；问卜八字年柱按立春交节换年。两种边界之间出生的人，生肖标签和年支可能不同。年支也只是四柱八个字之一，不能替代日主或整张命盘。',
      takeaways: [
        '先问“按春节还是按立春”，再查生肖；只用公历年份查询，年初附近尤其容易出错。',
        '农历日期旁的生肖与八字年柱可以同时有不同标签，前提是各自标清采用的规则。',
        '生肖由地支关联动物；日主来自日干，两者所指的字段不同，没有直接替换关系。',
      ],
      figure: {
        caption: '同一出生记录，先区分你要查询的字段。',
        description:
          '四张卡片分别说明民俗生肖、八字年柱、日主和完整四柱采用的规则。民俗生肖在本文采用春节边界；年柱采用立春的具体交节时刻；日主取日柱天干；四柱结合年、月、日、时的规则。下表再加入公历年份作对照，并列出同一上海样本的具体结果。',
      },
      table: {
        title: '不要把这五个字段当成同一件事',
        columns: ['字段', '采用的规则', '上海 2024-02-06 12:00 示例'],
        rows: [
          ['民俗生肖', '本文按农历新年换年', '兔：仍在上一农历年'],
          ['八字年柱', '按立春交节时刻换年', '甲辰：年支辰对应龙'],
          ['日主', '取当日日柱的天干', '庚：阳金，不是生肖动物'],
          ['完整四柱', '再结合月、日、时各自规则', '甲辰、丙寅、庚子、壬午'],
          ['公历年份', '1 月 1 日换年', '2024；单凭它不能确定边界附近的标签'],
        ],
      },
      example: {
        title: '为什么同一张资料里会同时出现兔和龙',
        intro:
          '使用公历 2024-02-06 12:00、Asia/Shanghai，民用时、零点换日。该样本离当年立春和春节边界都有明确间隔，便于看清两种口径。',
        steps: [
          '先查当年日历。香港天文台的 2024 对照表列立春在 2 月 4 日，农历正月初一在 2 月 10 日。不要凭“春节一般在二月”代替具体日期。',
          '按本文民俗生肖口径，2 月 6 日尚未到正月初一，仍属于上一农历年，因此标签是兔。这不是对当年整段公历日期的一概而论。',
          '按八字年柱口径，2 月 6 日已经过立春，计算年柱为甲辰，辰对应龙。再读全盘，可得甲辰、丙寅、庚子、壬午；日主是庚。',
          '比较另一个网站时，不先问“哪个属相更准”，而是查它将春节、立春日期还是立春具体时刻作为边界。如果出生恰在立春当天，还需要时刻与时区。',
          '保存一句完整描述：“按春节生肖为兔；按立春年柱为甲辰；采用上海当地民用时。”让 Agent 保留这两个字段的来源与定义，不把一个覆盖成另一个。',
        ],
        conclusion:
          '这类差异可以通过边界规则解释，不需要靠性格是否相像来裁决。把规则写清楚，生肖资料与四柱数据就能并存且不互相误读。',
      },
      faq: [
        {
          question: '每年立春都在 2 月 4 日吗？',
          answer:
            '不能把固定日期当成永远有效的规则。立春是太阳到达规定黄经的时刻，不同年份和所用时区可能对应不同日期或钟点；边界附近应查当年的具体交节信息。',
        },
        {
          question: '属相相同，就说明八字相似吗？',
          answer:
            '相同属相只说明某个口径下的年支动物一致。年干以及月、日、时柱仍可能不同，更不能由相同动物推出相同经历或关系质量。',
        },
        {
          question: '为什么一些人按立春说自己的生肖？',
          answer:
            '他们可能沿用命理年柱的口径。本文不是要求所有文化场景只使用一种说法，而是要求在比较时注明边界。谈民俗庆年与谈八字年柱时，可以分别保留各自定义。',
        },
      ],
      glossary: [
        { term: '年支', definition: '年柱里的地支部分，与十二生肖动物存在传统对应。' },
        { term: '春节边界', definition: '以农历正月初一进入新年；本文民俗生肖示例采用这一口径。' },
        { term: '立春边界', definition: '以立春具体交节时刻划分八字年柱；不能简化成公历元旦。' },
      ],
    },
    en: {
      answer:
        'A Chinese zodiac animal and a BaZi chart are not two names for the same information. Popular zodiac usage commonly follows Lunar New Year; Wenbu’s BaZi year pillar changes at the Li Chun solar term. A birth between those boundaries can receive different labels. The year branch is also only one character in a full chart, not the Day Master.',
      takeaways: [
        'Ask which year boundary is being used before looking up an animal. A Gregorian year alone is insufficient near the beginning of the year.',
        'A lunar-calendar animal and a BaZi year branch can legitimately differ if each field states its convention.',
        'The animal corresponds to a branch; the Day Master is the day stem. They are different fields, not interchangeable descriptions.',
      ],
      figure: {
        caption: 'One birth record can answer several different calendar questions.',
        description:
          'Four cards explain the conventions behind the popular zodiac animal, BaZi year pillar, Day Master and complete four pillars. This guide uses Lunar New Year for the animal, the Li Chun instant for the year pillar and the day stem for the Day Master. The complete chart combines year, month, day and hour rules. The table below adds the Gregorian year and the results for one Shanghai sample.',
      },
      table: {
        title: 'Five fields that should not be collapsed into one',
        columns: ['Field', 'Convention', 'Shanghai, 2024-02-06 at 12:00'],
        rows: [
          [
            'Popular zodiac animal',
            'Lunar New Year boundary in this guide',
            'Rabbit: still in the preceding lunar year',
          ],
          ['BaZi year pillar', 'The instant of Li Chun', 'Jia Chen: Chen corresponds to Dragon'],
          ['Day Master', 'The stem of the day pillar', 'Geng: yang Metal, not an animal'],
          ['Complete four pillars', 'Year, month, day and hour rules together', '甲辰 / 丙寅 / 庚子 / 壬午'],
          ['Gregorian year', 'Changes on January 1', '2024; insufficient by itself for a boundary case'],
        ],
      },
      example: {
        title: 'Why Rabbit and Dragon can appear in the same record',
        intro:
          'Use February 6, 2024 at 12:00, Asia/Shanghai, civil time and a midnight day boundary. The sample is clearly separated from both transitions, making the distinction easier to see.',
        steps: [
          'Check the year’s calendar. The Hong Kong Observatory’s 2024 conversion table places Li Chun on February 4 and the first day of the first lunar month on February 10. A general recollection that the holidays occur in February is insufficient.',
          'Apply the popular Lunar New Year convention used here. February 6 remains in the preceding lunar year, giving Rabbit. This does not assign Rabbit to the whole Gregorian year.',
          'Apply the BaZi convention. February 6 is after Li Chun, giving Jia Chen, whose branch corresponds to Dragon. The complete sample is Jia Chen / Bing Yin / Geng Zi / Ren Wu, with Geng as the Day Master.',
          'When another website disagrees, inspect its boundary before comparing personality descriptions. Does it use Lunar New Year, the calendar date of Li Chun, or the precise transition? A birth on the transition date also requires time and zone.',
          'Keep a complete note: “Rabbit by the Lunar New Year convention; Jia Chen year pillar by Li Chun; Shanghai civil time.” Ask an Agent to preserve the two definitions rather than overwriting one label with the other.',
        ],
        conclusion:
          'The difference can be explained by calendar conventions. It does not require deciding which animal feels more familiar. Separate fields with explicit rules make the record useful to both people and software.',
      },
      faq: [
        {
          question: 'Is Li Chun always February 4?',
          answer:
            'Do not use a fixed date as a universal rule. Li Chun is an instant defined by the Sun’s longitude. Its local date or clock time can differ by year and time zone, so check the actual transition for a boundary case.',
        },
        {
          question: 'Does sharing an animal mean sharing a similar chart?',
          answer:
            'It establishes only the same year-branch animal under the chosen convention. The year stem and the month, day and hour pillars may differ. It does not establish similar experiences or relationship quality.',
        },
        {
          question: 'Why do some people use Li Chun for their zodiac animal?',
          answer:
            'They may be using the BaZi year convention. The purpose here is to name the boundary, not to prescribe one label for every cultural setting. A holiday-calendar question and a BaZi-year question can retain their own definitions.',
        },
      ],
      glossary: [
        {
          term: 'Year branch',
          definition:
            'The earthly-branch part of a year pillar, traditionally associated with a zodiac animal.',
        },
        {
          term: 'Lunar New Year boundary',
          definition:
            'The first day of the first lunar month; used for the popular-zodiac example in this guide.',
        },
        {
          term: 'Li Chun boundary',
          definition:
            'The beginning-of-spring solar-term instant used for the BaZi year pillar, rather than January 1.',
        },
      ],
    },
    sources: [
      {
        title: 'Hong Kong Observatory · 2024 calendar conversion table',
        url: 'https://www.hko.gov.hk/en/gts/time/calendar/pdf/files/2024e.pdf',
        noteZh: '核对示例中的 2 月 4 日立春与 2 月 10 日正月初一；并非对命理预测的背书。',
        noteEn:
          'Checks February 4 Li Chun and February 10 Lunar New Year for the example; it does not endorse divinatory claims.',
      },
      {
        ...calendar,
        noteZh: '支持立春太阳黄经为 315°、节气按太阳位置定义；不把日期口诀当作精确边界。',
        noteEn:
          'Defines Li Chun at solar longitude 315° and explains why an approximate date is not the precise boundary.',
      },
      {
        ...implementation,
        noteZh: '支持农历生肖与按交节取年柱分属不同字段；本文示例已按实际引擎核算。',
        noteEn:
          'Shows that the lunar-year animal and solar-term year pillar are separate fields; the example was checked with the actual engine.',
      },
    ],
  },
  'bazi-vs-western-astrology': {
    zh: {
      answer:
        '八字与西方本命占星共享出生资料，但计算对象和解释体系不同。比较时应先对齐原始时刻，再分别记录干支取柱规则与星盘的黄道、宫制、星历设置。问卜目前不计算完整西方本命盘，因此不能把 AI 写出的行星位置当作工具已经验证的数据。',
      takeaways: [
        '日主、太阳星座、上升点属于不同概念。相似的性格措辞不构成字段之间的一对一映射。',
        '同一原始资料可以有不同计算约定；把两套设置分别列清，才能分辨输入误差与体系差异。',
        '天文或历法数据准确，只能支持相应的计算结果；个人解读的效力需要另行评价。',
      ],
      figure: {
        caption: '先比较输入与计算，再比较各自的解释。',
        description:
          '图中按基本输出、参照概念、地点与时间、计算约定四项并列比较两种体系。八字输出四组干支，以日干读取十神；西方本命盘通常输出星体位置、角点和宫位，并需说明黄道和宫制。下方完整表格另补时刻缺失时的限制和结果复核方式。',
      },
      table: {
        title: '比较两份结果前，先比这些字段',
        columns: ['检查项', '八字', '西方本命占星'],
        rows: [
          ['基本输出', '年、月、日、时四组干支', '星体位置，以及所选体系的相位、角点和宫位'],
          ['参照概念', '日干作为十神的参照', '太阳、月亮、上升等分别计算；不是一个日主字段'],
          ['地点与时间', '当地钟表与时区；太阳时取法另需经度', '宫位与上升等计算需要时刻和地理坐标'],
          ['必须声明的约定', '交节、换日、民用时或太阳时', '星历、黄道体系、宫制与相关计算选项'],
          ['时刻未知', '省略时柱，并检查其他柱的边界', '不能把任意中午盘的上升与宫位当成已知'],
          ['结果复核', '比较相同输入和约定下的干支字段', '比较相同设置下的坐标和角点；解释另议'],
        ],
      },
      example: {
        title: '把“两边说得不同”变成一个能回答的问题',
        intro:
          '假设学习者用同一份出生记录，拿到一张八字盘与一份西方本命盘，觉得两段性格文字互相矛盾。这里示范比较流程，不虚构一张尚未计算的西方星盘。',
        steps: [
          '建立共同输入记录：公历日期、原始当地时刻、出生地、时区及资料精度。如果有地点坐标或太阳时校正，另列出来，避免一份结果使用校正时刻、另一份使用原始时刻而未说明。',
          '分别列计算设置。八字记录换日和太阳时选项；西方盘记录星历来源、回归或恒星黄道及宫制。先查输入是否一致，再判断工具是否真的在计算相同问题。',
          '把内容分成两栏：可核对的输出和解释句子。干支、星体经度、角点属于前者；“适合领导”“需要安全感”属于后者。没有来源的行星度数先标为未核验，不让语言流畅度替它背书。',
          '限定一个有实际价值的比较任务：“如果原始出生时间有前后 20 分钟误差，两套工具分别有哪些字段发生变化？”八字按边界复算；西方盘应由支持该功能的工具计算候选范围。不要让 Agent 凭印象补出位置。',
          '若仍想比较解释，先选一项具体经历，记录两边的解释、需要的前提，以及相反证据。两份解读都使用同一段个人背景时，措辞相似并不构成两次独立验证。',
        ],
        conclusion:
          '有价值的比较能指出差异来自输入、约定、计算还是解释。保留两套方法各自的边界，比把所有术语揉成一份更长的故事更容易学习和复核。',
      },
      faq: [
        {
          question: '日主能对应某个太阳星座吗？',
          answer:
            '没有这种直接换算。日主是日柱天干，太阳星座来自太阳在所选黄道体系中的位置。它们从不同规则产生，即使解读偶尔使用类似词语，也不能把一个字段翻译成另一个。',
        },
        {
          question: '可以让问卜 Agent 同时解读两份资料吗？',
          answer:
            '可以请它解释你提供的术语和比较问题，但应标明西方盘来自哪个工具及其设置。问卜本身不提供完整西方星盘计算，Agent 不应宣称已调用不存在的行星或宫位工具。',
        },
        {
          question: '使用更精确的星历，解读就一定更准确吗？',
          answer:
            '星历精度与个人解读是不同层次。更可靠的数据有助于计算坐标，却不会自动证明由坐标推导出的性格或事件判断。比较服务时要分别询问计算误差和解释依据。',
        },
      ],
      glossary: [
        { term: '星历', definition: '提供或计算天体在特定时刻位置的数据与方法；不是一份个人性格报告。' },
        { term: '宫制', definition: '西方占星中划分宫位的一套规则；不同设置可能产生不同宫头位置。' },
        { term: '参照体系', definition: '用于定义和表达位置或关系的框架；比较结果时必须保留其名称与约定。' },
      ],
    },
    en: {
      answer:
        'BaZi and Western natal astrology share birth inputs but calculate different things. Align the original instant, then record each system’s conventions separately: pillar boundaries for BaZi, and ephemeris, zodiac and house settings for the planetary chart. Wenbu does not currently calculate a complete Western natal chart, so fluent AI text is not verification of a planetary position.',
      takeaways: [
        'The Day Master, Sun sign and Ascendant are different concepts. Similar personality wording does not create a one-to-one translation between them.',
        'The same birth record can be processed under different conventions. Preserve both sets of settings to distinguish input errors from methodological differences.',
        'Accurate astronomy or calendar conversion supports the corresponding calculation. It does not automatically establish the validity of a personal interpretation.',
      ],
      figure: {
        caption: 'Compare inputs and calculations before comparing interpretations.',
        description:
          'The figure compares four aspects side by side: basic outputs, reference concepts, place and time, and declared conventions. BaZi produces four stem-branch pairs and reads Ten Gods relative to the day stem. A Western natal chart commonly provides planetary positions, angles and houses, with a declared zodiac and house system. The full table below adds missing-time limits and ways to check the results.',
      },
      table: {
        title: 'What to compare in two chart records',
        columns: ['Check', 'BaZi', 'Western natal astrology'],
        rows: [
          [
            'Basic output',
            'Year, month, day and hour stem-branch pairs',
            'Planetary positions; aspects, angles and houses under the chosen system',
          ],
          [
            'Reference concepts',
            'Day stem as the Ten Gods reference',
            'Sun, Moon and Ascendant are separate calculations, not a Day Master field',
          ],
          [
            'Place and time',
            'Local clock and zone; longitude for a solar-time convention',
            'Time and geographical coordinates for houses and the Ascendant',
          ],
          [
            'Declared settings',
            'Solar-term and day boundaries; civil or solar time',
            'Ephemeris, zodiac, house system and relevant options',
          ],
          [
            'Missing time',
            'Omit the hour and check other pillar boundaries',
            'Do not present an arbitrary noon chart’s angles and houses as known',
          ],
          [
            'Verification',
            'Compare pillars with identical inputs and conventions',
            'Compare coordinates and angles with identical settings; assess prose separately',
          ],
        ],
      },
      example: {
        title: 'Turn “these readings disagree” into a checkable question',
        intro:
          'Suppose a learner has a BaZi chart and a Western natal report from the same birth record, but finds their personality descriptions contradictory. This exercise compares the records without inventing an uncalculated planetary chart.',
        steps: [
          'Create one source record: Gregorian date, original local clock time, birthplace, time zone and precision. List any coordinates or solar correction separately. Otherwise one report might use an adjusted time and the other the original without disclosing the difference.',
          'List the settings separately. For BaZi, note the day boundary and solar-time choice. For the Western chart, note the ephemeris, tropical or sidereal zodiac, and house system. Confirm consistent inputs before deciding whether two outputs even address the same calculation.',
          'Separate checkable outputs from interpretation. Pillars, planetary longitudes and angles belong in the first group; “suited to leadership” or “needs security” belongs in the second. Mark unsourced coordinates as unverified instead of letting confident prose authenticate them.',
          'Choose a specific comparison: “If the recorded time is uncertain by twenty minutes either way, which fields change?” Recalculate BaZi across relevant boundaries. Use suitable planetary-chart software for the other interval; do not ask the Agent to guess positions.',
          'If comparing interpretations, choose a concrete experience and record each claim, its assumptions and contrary evidence. When both readings receive the same personal background, similar prose is not two independent confirmations.',
        ],
        conclusion:
          'A useful comparison identifies whether a difference comes from inputs, conventions, calculation or interpretation. Keeping the methods separate makes them easier to learn and check than combining all their vocabulary into one narrative.',
      },
      faq: [
        {
          question: 'Can a Day Master be translated into a Sun sign?',
          answer:
            'No direct conversion follows from these definitions. The Day Master is a day-pillar stem; a Sun sign comes from the Sun’s position in the selected zodiac. Similar descriptive words do not make the fields equivalent.',
        },
        {
          question: 'Can the Wenbu Agent discuss both reports?',
          answer:
            'It can explain supplied terminology and help formulate comparisons. Identify the source and settings of the Western chart. Wenbu does not calculate a complete Western natal chart and the Agent should not claim to have called planetary or house tools that are unavailable.',
        },
        {
          question: 'Does a more precise ephemeris make the reading more accurate?',
          answer:
            'It can improve confidence in a calculated position. Claims about personality or events require a separate basis. When evaluating a service, ask separately about numerical calculation error and the evidence supporting its interpretations.',
        },
      ],
      glossary: [
        {
          term: 'Ephemeris',
          definition:
            'Data or methods for determining celestial positions at specified times, rather than a personal interpretation.',
        },
        {
          term: 'House system',
          definition:
            'A convention for dividing astrological houses; different settings may produce different cusp positions.',
        },
        {
          term: 'Reference framework',
          definition:
            'The conventions used to define positions or relationships; preserve them when comparing outputs.',
        },
      ],
    },
    sources: [
      {
        title: 'Astrodienst · Swiss Ephemeris programming documentation',
        url: 'https://www.astro.com/swisseph/swephprg.htm',
        noteZh: '支持星体、恒星黄道模式及宫位计算输入的区分；不作为解读效力研究使用。',
        noteEn:
          'Documents planetary calculations, sidereal modes and house-calculation inputs; not used as evidence for interpretive validity.',
      },
      {
        ...implementation,
        noteZh: '支持问卜实际八字计算字段与约定；产品不借比较文章声称实现西方星盘。',
        noteEn:
          'Documents Wenbu’s actual BaZi fields and conventions; the comparison does not imply a Western-chart implementation.',
      },
      {
        title: 'IANA · Time zone and daylight saving time data',
        url: 'https://data.iana.org/time-zones/tz-link.html',
        noteZh: '支持两套系统都应先核对出生记录的历史时区；不能用现居地时区替代。',
        noteEn:
          'Provides the historical time-zone basis needed to reconcile the shared birth record before either calculation.',
      },
    ],
  },
};
