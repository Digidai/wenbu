import type { AgentMessage, AgentMode } from './agent-protocol';
import type { Locale } from './schema';

type Copy = readonly [string, string];
export type GuideTopic = 'work' | 'relationships' | 'self' | 'learn' | 'unsure';
export type GuideMethod = 'conversation' | 'tarot' | 'iching' | 'bazi' | 'ziwei' | 'research';
export type GuideChoice = { id: string; label: Copy; detail: Copy };
export const guideText = (copy: Copy, locale: Locale) => copy[locale === 'zh' ? 0 : 1];

export const guideTopics: (GuideChoice & { id: GuideTopic })[] = [
  {
    id: 'work',
    label: ['工作与选择', 'Work & decisions'],
    detail: ['梳理方向，想清取舍', 'Find direction, weigh a choice'],
  },
  {
    id: 'relationships',
    label: ['关系与沟通', 'Relationships'],
    detail: ['理解相处，准备沟通', 'Reflect, then find your words'],
  },
  {
    id: 'self',
    label: ['认识自己', 'Understand myself'],
    detail: ['看见习惯，了解命盘', 'Explore patterns and charts'],
  },
  {
    id: 'learn',
    label: ['学习与求证', 'Learn & investigate'],
    detail: ['读懂概念，查找依据', 'Understand ideas and sources'],
  },
  {
    id: 'unsure',
    label: ['还没想好', 'Not sure yet'],
    detail: ['陪我把问题理清楚', 'Help me find a starting point'],
  },
];

export const guideGoals: Record<GuideTopic, GuideChoice[]> = {
  work: [
    {
      id: 'compare',
      label: ['比较两个选择', 'Compare two options'],
      detail: ['理清各自的吸引与顾虑', 'Explore what matters in each'],
    },
    {
      id: 'direction',
      label: ['找到卡住的地方', 'Understand the sticking point'],
      detail: ['把模糊的犹豫说清楚', 'Put uncertainty into words'],
    },
    {
      id: 'next',
      label: ['想一个具体的下一步', 'Find a practical next step'],
      detail: ['从可以尝试的小事开始', 'Begin with something manageable'],
    },
  ],
  relationships: [
    {
      id: 'pattern',
      label: ['梳理相处中的困惑', 'Understand a difficulty'],
      detail: ['从已经发生的事情出发', 'Start with what actually happened'],
    },
    {
      id: 'words',
      label: ['准备一次沟通', 'Prepare a conversation'],
      detail: ['表达我的感受与需要', 'Express my feelings and needs'],
    },
    {
      id: 'boundaries',
      label: ['想清自己的期待与边界', 'Clarify my needs and boundaries'],
      detail: ['把注意力放回我能做的事', 'Focus on what I can do'],
    },
  ],
  self: [
    {
      id: 'habits',
      label: ['认识自己的行为习惯', 'Reflect on my habits'],
      detail: ['结合真实经历一起梳理', 'Use examples from my experience'],
    },
    {
      id: 'chart',
      label: ['看懂自己的命盘', 'Understand my birth chart'],
      detail: ['需要时再补充出生资料', 'Add birth details when needed'],
    },
    {
      id: 'reflect',
      label: ['做一次当下的自我觉察', 'Check in with myself'],
      detail: ['看看最近在意什么', 'Notice what is on my mind'],
    },
  ],
  learn: [
    {
      id: 'basics',
      label: ['从零读懂一个概念', 'Understand a concept'],
      detail: ['用例子解释术语', 'Make terminology concrete'],
    },
    {
      id: 'compare',
      label: ['比较两种说法或方法', 'Compare two explanations'],
      detail: ['看清共同点与分歧', 'See where they agree and differ'],
    },
    {
      id: 'evidence',
      label: ['核对一个说法的依据', 'Check the evidence'],
      detail: ['区分传统、计算与推测', 'Separate tradition, facts and inference'],
    },
  ],
  unsure: [
    {
      id: 'recent',
      label: ['聊聊最近反复想到的事', 'Something on my mind'],
      detail: ['从一个念头开始就好', 'One thought is enough to start'],
    },
    {
      id: 'discover',
      label: ['先了解这里能做什么', 'Show me what is possible'],
      detail: ['看看哪种探索适合我', 'Find a useful way to explore'],
    },
    {
      id: 'question',
      label: ['帮我把困惑变成问题', 'Help me frame a question'],
      detail: ['一步一步缩小范围', 'Narrow it down together'],
    },
  ],
};
export const clarifyGoal: GuideChoice = {
  id: 'clarify',
  label: ['还不确定，先帮我问清楚', 'Help me clarify first'],
  detail: ['用几个选择慢慢缩小范围', 'Use a few choices to find a focus'],
};
export const guideMethods: (GuideChoice & { id: GuideMethod })[] = [
  {
    id: 'conversation',
    label: ['先聊聊', 'Conversation'],
    detail: ['先梳理问题，需要时再选工具', 'Clarify first; choose tools when useful'],
  },
  {
    id: 'tarot',
    label: ['三张塔罗', 'Three tarot cards'],
    detail: ['抽三张牌，借象征梳理思路', 'Draw three cards for reflection'],
  },
  {
    id: 'iching',
    label: ['易经起卦', 'I Ching'],
    detail: ['起一卦，思考处境与变化', 'Cast a hexagram to reflect on change'],
  },
  {
    id: 'bazi',
    label: ['八字命盘', 'BaZi chart'],
    detail: ['需出生日期；时刻可以未知', 'Birth date needed; time may be unknown'],
  },
  {
    id: 'ziwei',
    label: ['紫微命盘', 'Zi Wei chart'],
    detail: ['需出生日期、时刻和传统性别参数', 'Date, known time and traditional sex parameter'],
  },
  {
    id: 'research',
    label: ['查阅资料', 'Sourced research'],
    detail: ['阅读资料，整理有出处的说明', 'Read sources and make a research note'],
  },
];
export const guideBackground: Record<GuideTopic, Copy> = {
  work: [
    '例如：我在继续当前工作和接受新机会之间犹豫，最在意的是……',
    'For example: I am weighing my current role against a new opportunity. What matters most is…',
  ],
  relationships: [
    '例如：我想和一位朋友重新沟通，最近发生了……',
    'For example: I want to reconnect with a friend. Recently…',
  ],
  self: [
    '例如：我常在做决定时反复犹豫，最近的一次是……',
    'For example: I tend to hesitate when making decisions. A recent example was…',
  ],
  learn: [
    '例如：真太阳时与北京时间有什么区别？我已经了解……',
    'For example: How does solar time differ from civil time? I already know…',
  ],
  unsure: [
    '写一个最近反复想到的念头就好，不必组织完整。',
    'Write a thought you keep returning to. It does not need to be polished.',
  ],
};

export function defaultGuideMethod(topic: GuideTopic, goal: string): GuideMethod {
  if (goal === 'clarify') return 'conversation';
  if (topic === 'learn') return 'research';
  if (topic === 'self' && goal === 'chart') return 'bazi';
  return 'conversation';
}

export function buildGuidedPrompt(
  input: {
    topic: GuideTopic;
    goal: string;
    method: GuideMethod;
    background: string;
  },
  locale: Locale,
): { text: string; mode: AgentMode } {
  const topic = guideTopics.find((item) => item.id === input.topic)!;
  const goal = [...guideGoals[input.topic], clarifyGoal].find((item) => item.id === input.goal);
  // A stale goal from a different topic is never silently turned into user intent.
  if (!goal) throw new Error('Choose a goal for this topic.');
  const zh = locale === 'zh';
  const methods: Record<GuideMethod, Copy> = {
    conversation: [
      '先通过对话帮我梳理；暂不抽牌、起卦或排盘。',
      'Help me think this through in conversation first. Do not draw, cast or calculate a chart yet.',
    ],
    tarot: [
      '请抽三张塔罗，作为梳理这个问题的象征视角。',
      'Please draw three tarot cards as symbolic perspectives on this question.',
    ],
    iching: [
      '请为这个问题起一卦，帮助我思考处境与变化。',
      'Please cast an I Ching hexagram to reflect on this situation and its changes.',
    ],
    bazi: [
      '请用八字命盘探索这个问题。缺少出生资料时请让我补充，不知道的时刻保留未知。',
      'Use a BaZi chart to explore this question. Ask for missing birth details; keep an unknown birth time unknown.',
    ],
    ziwei: [
      '请用紫微命盘探索这个问题。先核对必需的出生日期、时刻和传统性别参数，缺少时让我补充。',
      'Use a Zi Wei chart to explore this question. Ask for any missing birth date, known time or traditional sex parameter.',
    ],
    research: [
      '请查阅可用资料，区分计算事实、传统解释和推测，整理有出处的说明。',
      'Read available sources and make a sourced explanation, distinguishing calculation facts, tradition and inference.',
    ],
  };
  const background = input.background.trim().slice(0, 600);
  const parts = [
    `${zh ? '我想聊：' : 'Topic: '}${guideText(topic.label, locale)}${zh ? '。' : '.'}`,
    `${zh ? '我希望：' : 'My aim: '}${guideText(goal.label, locale)}${zh ? '。' : '.'}`,
    ...(background ? [`${zh ? '我的补充：' : 'My context: '}${background}`] : []),
    guideText(methods[input.method], locale),
    zh
      ? '信息不够时，一次问我一个关键问题，给几个可选回答，也允许我自己补充。'
      : 'If you need more information, ask one focused question at a time with a few options and room for my own answer.',
  ];
  return { text: parts.join('\n'), mode: input.method === 'research' ? 'research' : 'explore' };
}

export type DraftSuggestion = { text: string; start: number };
export function isSuggestionIntact(draft: string, suggestion: DraftSuggestion) {
  return (
    !!suggestion.text &&
    suggestion.start >= 0 &&
    draft.slice(suggestion.start, suggestion.start + suggestion.text.length) === suggestion.text
  );
}
/** Only the recorded insertion range belongs to us; never search user-authored text. */
export function stageSuggestion(
  draft: string,
  previous: DraftSuggestion,
  next: string,
): { draft: string; suggestion: DraftSuggestion } {
  if (isSuggestionIntact(draft, previous))
    return {
      draft: draft.slice(0, previous.start) + next + draft.slice(previous.start + previous.text.length),
      suggestion: { text: next, start: previous.start },
    };
  const prefix = draft ? draft + (draft.endsWith('\n\n') ? '' : '\n\n') : '';
  return { draft: prefix + next, suggestion: { text: next, start: prefix.length } };
}

export function followupSuggestions(
  message: AgentMessage,
  locale: Locale,
): { id: string; label: string; text: string }[] {
  if (message.role !== 'assistant' || message.status !== 'complete' || message.question) return [];
  const report = [...message.artifacts].reverse().find((a) => a.type === 'report');
  if (report?.type === 'report') {
    const questions = [...new Set(report.questions.map((q) => q.trim()).filter(Boolean))].slice(0, 2);
    if (questions.length) return questions.map((text, i) => ({ id: `report-${i}`, label: text, text }));
  }
  const hasReading = message.artifacts.some((a) => a.type === 'chart');
  const alreadyHasExample = /例子|案例|示范|example|hypothetical/i.test(message.text);
  const items: { id: string; label: Copy; text: Copy }[] = hasReading
    ? [
        {
          id: 'explain',
          label: ['用白话讲讲', 'Explain simply'],
          text: [
            '沿用刚才的结果，不重新抽取或排盘。请用白话解释最值得留意的一点，并说明它的局限。',
            'Keep the existing result without drawing or calculating again. Explain one useful point in plain language and its limits.',
          ],
        },
        {
          id: 'next',
          label: ['落到具体行动', 'Make it practical'],
          text: [
            '沿用刚才的结果，结合我已经提供的情况，帮我想一个可以尝试的小行动。不要替我作决定；信息不够时先问一个问题。',
            'Keep the existing result and use the context I provided to suggest one small action I can try. Do not decide for me; ask one question if context is missing.',
          ],
        },
      ]
    : [
        {
          id: 'example',
          label: alreadyHasExample
            ? ['整理成简明清单', 'Make a short checklist']
            : ['举个具体例子', 'Give an example'],
          text: alreadyHasExample
            ? [
                '请把刚才的说明整理成一个可以使用的简短清单，保留关键限制，不要添加我未提供的个人情况。',
                'Turn the explanation into a short, usable checklist. Keep the key limits and do not invent personal context.',
              ]
            : [
                '请用一个明确标为假设的例子，解释刚才最重要的一点。',
                'Explain the key point using an example clearly marked as hypothetical.',
              ],
        },
        {
          id: 'evidence',
          label: ['看看依据与局限', 'Evidence & limits'],
          text: [
            '刚才的回答中，哪些有资料或计算支持，哪些属于解释或推测？请说明依据和局限。',
            'Which parts of your answer have source or calculation support, and which are interpretation or inference? Explain the evidence and limits.',
          ],
        },
      ];
  return items.map((item) => ({
    id: item.id,
    label: guideText(item.label, locale),
    text: guideText(item.text, locale),
  }));
}
