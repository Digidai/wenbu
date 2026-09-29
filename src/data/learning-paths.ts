export const learningTopics = [
  {
    id: 'start',
    symbol: '启',
    zh: '第一次使用',
    en: 'Start here',
    descriptionZh: '先选一个入口，再把问题说清楚。',
    descriptionEn: 'Choose a starting point and put your question into words.',
    slugs: ['first-reading', 'choose-a-tool', 'ask-a-better-question', 'prepare-birth-details'],
  },
  {
    id: 'bazi',
    symbol: '命',
    zh: '读懂八字',
    en: 'Understand BaZi',
    descriptionZh: '从四柱与日主读起，遇到日期差异再查规则。',
    descriptionEn: 'Read the pillars first, then check the calendar conventions.',
    slugs: [
      'bazi-basics',
      'five-elements',
      'bazi-ten-gods',
      'unknown-birth-time',
      'birth-time-timezone',
      'chinese-zodiac-vs-bazi',
      'bazi-vs-western-astrology',
    ],
  },
  {
    id: 'iching',
    symbol: '易',
    zh: '易经与变化',
    en: 'Explore the I Ching',
    descriptionZh: '看清三枚钱、六条爻与八卦之间的关系。',
    descriptionEn: 'Follow the coins, lines and trigrams that make a hexagram.',
    slugs: ['iching-three-coins', 'iching-trigrams'],
  },
  {
    id: 'tarot',
    symbol: '象',
    zh: '塔罗与牌义',
    en: 'Learn tarot',
    descriptionZh: '从一张牌开始，逐步认识花色、人物和正逆位。',
    descriptionEn: 'Start with one card, then learn suits, court cards and reversals.',
    slugs: ['tarot-beginner', 'tarot-suits-and-court-cards', 'tarot-reversals'],
  },
  {
    id: 'ziwei',
    symbol: '星',
    zh: '认识紫微斗数',
    en: 'Read a Zi Wei chart',
    descriptionZh: '先找到宫位，再理解星曜和四化的传统用法。',
    descriptionEn: 'Find the palaces, then learn how stars and transformations are interpreted.',
    slugs: ['ziwei-twelve-palaces', 'ziwei-four-transformations'],
  },
  {
    id: 'reflect',
    symbol: '记',
    zh: '看懂解读，留下记录',
    en: 'Read critically and keep notes',
    descriptionZh: '核对出处，分清事实与解释，回看自己的判断。',
    descriptionEn: 'Check sources, separate facts from interpretations and revisit your notes.',
    slugs: ['read-ai-with-sources', 'ai-divination', 'review-a-reading'],
  },
] as const;

export const newGuideSlugs = [
  'first-reading',
  'ask-a-better-question',
  'prepare-birth-details',
  'read-ai-with-sources',
  'review-a-reading',
  'bazi-ten-gods',
  'iching-trigrams',
  'tarot-suits-and-court-cards',
  'tarot-reversals',
  'ziwei-four-transformations',
] as const;

export function topicForGuide(slug: string) {
  return learningTopics.find((topic) => (topic.slugs as readonly string[]).includes(slug));
}

type GuidePrimer = {
  mode: 'steps' | 'compare';
  zh: string;
  en: string;
  items: { zh: string; en: string; detailZh: string; detailEn: string }[];
};
export const guidePrimers: Record<string, GuidePrimer> = {
  'first-reading': {
    mode: 'steps',
    zh: '第一次，做完这三步就够了',
    en: 'A simple first session',
    items: [
      {
        zh: '写一件具体的事',
        en: 'Name one situation',
        detailZh: '说说发生了什么，以及你想弄清什么。',
        detailEn: 'Describe what happened and what you want to understand.',
      },
      {
        zh: '看结果与依据',
        en: 'Check the result',
        detailZh: '先确认输入和原始结果，再读解读。',
        detailEn: 'Check the inputs and original result before the interpretation.',
      },
      {
        zh: '留一个下一步',
        en: 'Choose a next step',
        detailZh: '记下一件能在现实中尝试的小事。',
        detailEn: 'Write down one small action you can try.',
      },
    ],
  },
  'choose-a-tool': {
    mode: 'compare',
    zh: '按你现在想做的事来选',
    en: 'Choose by what you want to do',
    items: [
      {
        zh: '还没想清楚',
        en: 'Talk it through',
        detailZh: '先用 Agent 对话，不必提供出生资料。',
        detailEn: 'Start a conversation with the Agent. Birth details are optional.',
      },
      {
        zh: '想换个角度',
        en: 'Explore a question',
        detailZh: '用塔罗或易经，从随机结果展开联想。',
        detailEn: 'Use a tarot draw or I Ching cast as a starting point for reflection.',
      },
      {
        zh: '想读懂命盘',
        en: 'Study a birth chart',
        detailZh: '准备出生资料，再排八字或紫微。',
        detailEn: 'Prepare birth details for a BaZi or Zi Wei chart.',
      },
    ],
  },
  'prepare-birth-details': {
    mode: 'steps',
    zh: '填写前核对',
    en: 'Before you enter birth details',
    items: [
      {
        zh: '公历日期',
        en: 'Gregorian date',
        detailZh: '若手上是农历，先确认历法与闰月。',
        detailEn: 'If your record is lunar, confirm the calendar and leap month first.',
      },
      {
        zh: '当地出生时间',
        en: 'Recorded local time',
        detailZh: '八字另选出生地时区；紫微使用所填当地钟表时间。',
        detailEn: 'BaZi also asks for the birth time zone. Zi Wei uses the local clock time you enter.',
      },
      {
        zh: '不确定就标明',
        en: 'Keep uncertainty visible',
        detailZh: '八字可省略时柱；紫微需要已知时辰。',
        detailEn: 'BaZi can omit the hour pillar. Zi Wei requires a known birth time.',
      },
    ],
  },
  'bazi-basics': {
    mode: 'steps',
    zh: '读盘顺序',
    en: 'A chart-reading sequence',
    items: [
      {
        zh: '核对四柱',
        en: 'Check the pillars',
        detailZh: '年、月、日、时各由一个天干和一个地支组成。',
        detailEn: 'Each year, month, day and hour pillar pairs a stem with a branch.',
      },
      {
        zh: '找到日主',
        en: 'Find the Day Master',
        detailZh: '日柱天干，是比较其他符号关系的参照。',
        detailEn: 'The day stem is the reference for relationships among the symbols.',
      },
      {
        zh: '看构成与规则',
        en: 'Read the structure',
        detailZh: '五行计数和十神关系是不同信息。',
        detailEn: 'Element counts and Ten Gods relationships describe different things.',
      },
    ],
  },
  'iching-three-coins': {
    mode: 'steps',
    zh: '一卦怎样组成',
    en: 'How a cast becomes a hexagram',
    items: [
      {
        zh: '三枚钱，一条爻',
        en: 'Three coins make a line',
        detailZh: '每轮合计为 6、7、8 或 9。',
        detailEn: 'Each round produces a total of 6, 7, 8 or 9.',
      },
      {
        zh: '由下而上，六次',
        en: 'Six lines, bottom first',
        detailZh: '第一轮在最下方，最后一轮在最上方。',
        detailEn: 'The first round is the bottom line; the sixth is the top.',
      },
      {
        zh: '本卦与之卦',
        en: 'Original and resulting hexagrams',
        detailZh: '6 和 9 为动爻，变后得到之卦。',
        detailEn: 'Lines valued 6 or 9 change to form the resulting hexagram.',
      },
    ],
  },
  'tarot-beginner': {
    mode: 'steps',
    zh: '从一张牌开始练习',
    en: 'Start with a one-card reading',
    items: [
      {
        zh: '先写问题',
        en: 'Write the question',
        detailZh: '选择你能观察、沟通或行动的一件事。',
        detailEn: 'Choose something you can observe, discuss or act on.',
      },
      {
        zh: '看看牌面',
        en: 'Look at the card',
        detailZh: '点开插画，先描述你注意到的细节。',
        detailEn: 'Open the illustration and describe what catches your attention.',
      },
      {
        zh: '联系实际经历',
        en: 'Connect it to experience',
        detailZh: '同时记录相符和不相符的地方。',
        detailEn: 'Note what fits your experience and what does not.',
      },
    ],
  },
  'ziwei-twelve-palaces': {
    mode: 'steps',
    zh: '先读位置，再读关系',
    en: 'Read positions before interpretations',
    items: [
      {
        zh: '十二宫',
        en: 'Twelve palaces',
        detailZh: '先找命宫；身宫以“身”标在十二宫之一。',
        detailEn: 'Find the Life Palace. The Body marker appears within one of the twelve palaces.',
      },
      {
        zh: '星曜分布',
        en: 'Star placement',
        detailZh: '点选宫位，查看主星、辅星和标记。',
        detailEn: 'Select a palace to inspect its stars and labels.',
      },
      {
        zh: '流派约定',
        en: 'Calculation conventions',
        detailZh: '核对日期、时辰及当前算法，不用单星下结论。',
        detailEn: 'Check the date, time and method before interpreting a star.',
      },
    ],
  },
  'read-ai-with-sources': {
    mode: 'compare',
    zh: '一段回答里的三类信息',
    en: 'Three kinds of information in a reading',
    items: [
      {
        zh: '计算事实',
        en: 'Calculation facts',
        detailZh: '来自输入、明确的规则与工具输出。',
        detailEn: 'Inputs, stated conventions and the tool’s output.',
      },
      {
        zh: '传统解释',
        en: 'Traditional interpretation',
        detailZh: '来自具体文本或流派，需要说明出处。',
        detailEn: 'Ideas attributed to a particular text or tradition.',
      },
      {
        zh: '模型建议',
        en: 'AI suggestions',
        detailZh: '模型根据你的问题组织，需要你判断是否适用。',
        detailEn: 'Suggestions generated for your question, which you can accept or reject.',
      },
    ],
  },
};
