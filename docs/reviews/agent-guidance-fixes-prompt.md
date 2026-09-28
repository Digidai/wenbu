Review updated source, without tools, web or delegation. Prior review found substring-based suggestion replacement could corrupt user-authored text, invisible keyboard heading focus, and real Agent example starts excluded from analytics funnel. These have been fixed: anchored insertion spans, invalidation when edited, focus-visible outline, real example starts included. Browser review also shortened the initial screen and removed repeated headings. Check these fixes and any remaining concrete blocking defects, including source changes shown below. Do not infer runtime verification. Return exact file/function and reproducible issue or No blocking defects found.

## src/lib/agent-guidance.ts
```
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
    `${zh ? '我想聊' : 'Topic'}：${guideText(topic.label, locale)}。`,
    `${zh ? '我希望' : 'My aim'}：${guideText(goal.label, locale)}。`,
    ...(background ? [`${zh ? '我的补充' : 'My context'}：${background}`] : []),
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
  const hasReading = message.artifacts.some((a) => a.type === 'chart');
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
          label: ['举个具体例子', 'Give an example'],
          text: [
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

```

## src/components/AgentOnboarding.tsx
```
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Fingerprint,
  MessagesSquare,
  PenLine,
  Route,
} from 'lucide-react';
import type { Locale } from '../lib/schema';
import type { AgentMode } from '../lib/agent-protocol';
import { choose } from '../lib/i18n';
import { track } from '../lib/analytics';
import {
  buildGuidedPrompt,
  clarifyGoal,
  defaultGuideMethod,
  guideBackground,
  guideGoals,
  guideMethods,
  guideText,
  guideTopics,
  type GuideMethod,
  type GuideTopic,
} from '../lib/agent-guidance';

const topicIcons = {
  work: BriefcaseBusiness,
  relationships: MessagesSquare,
  self: Fingerprint,
  learn: BookOpen,
  unsure: Route,
};

export default function AgentOnboarding({
  locale,
  disabled,
  onCompose,
  onDirect,
  children,
}: {
  locale: Locale;
  disabled: boolean;
  onCompose: (value: { text: string; mode: AgentMode }) => boolean;
  onDirect: () => void;
  children: ReactNode;
}) {
  const t = (zh: string, en: string) => choose(locale, zh, en);
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState<GuideTopic>('unsure');
  const [goal, setGoal] = useState('');
  const [method, setMethod] = useState<GuideMethod>('conversation');
  const [background, setBackground] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);
  const started = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current !== step) heading.current?.focus({ preventScroll: false });
    previousStep.current = step;
  }, [step]);

  const selectedTopic = guideTopics.find((item) => item.id === topic)!;
  const selectedGoal = [...guideGoals[topic], clarifyGoal].find((item) => item.id === goal);
  const preview = selectedGoal ? buildGuidedPrompt({ topic, goal, method, background }, locale) : null;
  function move(next: number) {
    setReady(false);
    setStep(next);
    track('guide_step', { tool: 'agent', value: next + 1 });
  }
  function openGuide() {
    if (!started.current) {
      track('guide_opened', { tool: 'agent' });
      started.current = true;
    }
  }
  return (
    <div className={`agent-welcome agent-onboarding ${step === 0 ? 'is-intro' : 'is-detail'}`}>
      <div className="agent-onboarding-heading">
        <span className="agent-guide-mark" aria-hidden="true">
          问
        </span>
        <span>{t('把心里的事，变成一个好问题', 'A little guidance for a clearer question')}</span>
      </div>
      <h1
        className={step === 0 || collapsed || ready ? undefined : 'sr-only'}
        ref={step === 0 ? heading : undefined}
        tabIndex={-1}
      >
        {t('最近，你更关心哪件事？', 'What is on your mind?')}
      </h1>
      {(step === 0 || collapsed || ready) && (
        <p>
          {t('不必想好怎么问，选一个贴近的开始。', 'No perfect question needed. Choose a place to begin.')}
        </p>
      )}
      {collapsed || ready ? (
        <div className="agent-guide-rest">
          {ready ? <Check size={19} /> : <Route size={19} />}
          <div>
            <strong>
              {ready
                ? t('问题已放入输入框', 'Your draft is ready')
                : t('随时可以回来理清思路', 'The guide is here when you need it')}
            </strong>
            <p>
              {ready
                ? t('可以继续修改，确认后再发送。', 'Edit it as you like, then send when ready.')
                : t('直接写一句，也可以开始。', 'One sentence is enough to begin.')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              openGuide();
              setCollapsed(false);
              setReady(false);
            }}
          >
            {ready ? t('调整', 'Edit guide') : t('打开引导', 'Open guide')}
          </button>
        </div>
      ) : (
        <section className="agent-guide" aria-label={t('提问引导', 'Question guide')}>
          <ol className="agent-guide-progress" aria-label={t('引导进度', 'Guide progress')}>
            {[t('关心的事', 'Topic'), t('想得到什么', 'Aim'), t('补充与预览', 'Your context')].map(
              (label, i) => (
                <li
                  key={label}
                  aria-current={i === step ? 'step' : undefined}
                  className={i <= step ? 'is-reached' : ''}
                >
                  <span>{i < step ? <Check size={11} /> : `0${i + 1}`}</span>
                  {label}
                </li>
              ),
            )}
          </ol>
          <div className="agent-guide-stage" key={step}>
            {step > 0 && (
              <div className="agent-guide-question">
                {step > 0 && (
                  <button
                    className="agent-guide-back"
                    type="button"
                    onClick={() => move(step - 1)}
                    aria-label={t('返回上一步', 'Previous step')}
                  >
                    <ArrowLeft size={16} />
                  </button>
                )}
                <div>
                  <h2 ref={step === 0 ? undefined : heading} tabIndex={-1}>
                    {step === 0
                      ? t('最近，你更关心哪件事？', 'What is on your mind?')
                      : step === 1
                        ? t('这次，你最想得到什么？', 'What would help you most?')
                        : t('有什么想让我们先知道的？', 'What would you like us to know?')}
                  </h2>
                  <p>
                    {step === 0
                      ? t('选一项继续，也可以直接在下方输入。', 'Choose a starting point, or type below.')
                      : step === 1
                        ? `${guideText(selectedTopic.label, locale)} · ${t('选一个最贴近的方向', 'Choose the closest aim')}`
                        : t('选填 · 只补充你愿意分享的情况。', 'Optional · share only what you want to.')}
                  </p>
                </div>
              </div>
            )}
            {step === 0 && (
              <div className="agent-guide-topics">
                {guideTopics.map((item) => {
                  const Icon = topicIcons[item.id];
                  return (
                    <button
                      type="button"
                      key={item.id}
                      disabled={disabled}
                      className={item.id === 'unsure' ? 'is-unsure' : ''}
                      onClick={() => {
                        openGuide();
                        if (topic !== item.id) setGoal('');
                        setTopic(item.id);
                        move(1);
                      }}
                    >
                      <Icon size={23} strokeWidth={1.35} />
                      <span>
                        <strong>{guideText(item.label, locale)}</strong>
                        <small>{guideText(item.detail, locale)}</small>
                      </span>
                      <ArrowRight size={14} />
                    </button>
                  );
                })}
              </div>
            )}
            {step === 1 && (
              <div className="agent-guide-goals">
                {[...guideGoals[topic], clarifyGoal].map((item, index) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      setGoal(item.id);
                      if (goal !== item.id) setMethod(defaultGuideMethod(topic, item.id));
                      move(2);
                    }}
                  >
                    <span className="agent-choice-number">{`0${index + 1}`}</span>
                    <span>
                      <strong>{guideText(item.label, locale)}</strong>
                      <small>{guideText(item.detail, locale)}</small>
                    </span>
                    <ArrowRight size={14} />
                  </button>
                ))}
              </div>
            )}
            {step === 2 && (
              <>
                <div className="agent-guide-selection">
                  <span>{guideText(selectedTopic.label, locale)}</span>
                  <ArrowRight size={12} />
                  <span>{selectedGoal && guideText(selectedGoal.label, locale)}</span>
                </div>
                <label className="agent-guide-background">
                  <span className="sr-only">{t('补充背景（选填）', 'Your context (optional)')}</span>
                  <textarea
                    rows={3}
                    maxLength={600}
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    placeholder={guideText(guideBackground[topic], locale)}
                  />
                </label>
                <details className="agent-guide-method">
                  <summary>
                    {t('探索方式', 'Approach')}
                    <strong>
                      {guideText(guideMethods.find((item) => item.id === method)!.label, locale)}
                    </strong>
                    <span>{t('可更改', 'Change')}</span>
                    <ChevronDown size={13} />
                  </summary>
                  <fieldset>
                    <legend className="sr-only">{t('选择探索方式', 'Choose an approach')}</legend>
                    {guideMethods.map((item) => (
                      <label key={item.id}>
                        <input
                          type="radio"
                          name="guide-method"
                          value={item.id}
                          checked={method === item.id}
                          onChange={() => setMethod(item.id)}
                        />
                        <span>{guideText(item.label, locale)}</span>
                      </label>
                    ))}
                  </fieldset>
                  <p>{guideText(guideMethods.find((item) => item.id === method)!.detail, locale)}</p>
                </details>
                <details className="agent-guide-preview">
                  <summary>
                    <PenLine size={13} />
                    {t('查看整理后的提问', 'Preview your question')}
                    <ChevronDown size={13} />
                  </summary>
                  <p>{preview?.text}</p>
                </details>
                <button
                  className="agent-guide-compose"
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    if (preview && onCompose(preview)) {
                      track('guide_draft_created', { tool: 'agent', mode: preview.mode });
                      setReady(true);
                    }
                  }}
                >
                  {t('放入输入框', 'Add to my draft')}
                  <ArrowRight size={16} />
                </button>
                <p className="agent-guide-local">
                  {t(
                    '跳过补充也可以。发送前，选项与草稿只在本页。',
                    'You can leave context blank. Nothing is sent until you send your draft.',
                  )}
                </p>
              </>
            )}
          </div>
        </section>
      )}
      <div className="agent-guide-alternatives">
        <button
          type="button"
          onClick={() => {
            setCollapsed(true);
            track('guide_skipped', { tool: 'agent', value: step + 1 });
            onDirect();
          }}
        >
          <PenLine size={13} />
          {t('我直接写', 'I’ll write my own')}
        </button>
        <details>
          <summary>
            {t('看看提问示例', 'Example questions')}
            <ChevronDown size={12} />
          </summary>
          {children}
        </details>
      </div>
    </div>
  );
}

```

## src/components/AgentConversationGuide.tsx
```
import { ArrowDownLeft, Check, CircleHelp, PenLine, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { AgentMessage } from '../lib/agent-protocol';
import { followupSuggestions } from '../lib/agent-guidance';
import type { Locale } from '../lib/schema';
import { choose } from '../lib/i18n';
import { track } from '../lib/analytics';

export default function AgentConversationGuide({
  message,
  locale,
  disabled,
  onStage,
  onCustom,
  onBirth,
}: {
  message: AgentMessage;
  locale: Locale;
  disabled: boolean;
  onStage: (text: string) => boolean;
  onCustom: () => void;
  onBirth: () => void;
}) {
  const t = (zh: string, en: string) => choose(locale, zh, en);
  const [selected, setSelected] = useState('');
  const question = message.status === 'waiting' ? message.question : undefined;
  const followups = followupSuggestions(message, locale);
  if (!question && !followups.length) return null;
  function stage(text: string, id: string, action: 'clarification' | 'followup') {
    if (onStage(text)) {
      setSelected(id);
      track('suggestion_selected', { tool: 'agent', action });
    }
  }
  return (
    <div className={`agent-conversation-guide ${question ? 'is-clarification' : ''}`}>
      <div className="agent-conversation-guide-heading">
        {question ? <CircleHelp size={15} /> : <ArrowDownLeft size={15} />}
        <span>
          {question
            ? t('选一个回答，或补充自己的情况', 'Choose an answer, or add your own')
            : t('接下来，可以这样问', 'A useful next question')}
        </span>
      </div>
      {question?.form === 'birth' && (
        <button className="agent-guidance-birth" type="button" onClick={onBirth} disabled={disabled}>
          <SlidersHorizontal size={15} />
          <span>
            {t('补充出生资料', 'Add birth details')}
            <small>
              {t(
                '已有资料会保留；时刻不确定可如实说明。',
                'Existing details are kept. You can say if the time is uncertain.',
              )}
            </small>
          </span>
          <ArrowDownLeft size={13} />
        </button>
      )}
      <div className="agent-guidance-options">
        {(question
          ? [...new Set(question.options.map((s) => s.trim()).filter(Boolean))].map((text, i) => ({
              id: String(i),
              text,
              label: text,
            }))
          : followups
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            aria-pressed={selected === option.id}
            onClick={() => stage(option.text, option.id, question ? 'clarification' : 'followup')}
          >
            {selected === option.id ? (
              <Check size={13} />
            ) : (
              <span className="agent-guidance-dot" aria-hidden="true" />
            )}
            {option.label}
          </button>
        ))}
      </div>
      <div className="agent-guidance-other">
        <button type="button" disabled={disabled} onClick={onCustom}>
          <PenLine size={12} />
          {question
            ? t('都不贴切，我自己补充', 'None quite fits — I’ll explain')
            : t('补充我的情况', 'Add my context')}
        </button>
        {question && (
          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              stage(
                t(
                  '这一点我还不确定。请说明它会影响什么，以及信息未知时可以怎样继续；不要替我假定答案。',
                  'I am not sure about this. Explain what it changes and how we can continue with it unknown; do not assume an answer for me.',
                ),
                'unsure',
                'clarification',
              )
            }
          >
            {t('暂时不确定', 'I’m not sure')}
          </button>
        )}
      </div>
      <p className="agent-guidance-hint" aria-live="polite">
        {selected
          ? t('已放入输入框，可以补充后再发送。', 'Added to your draft. Edit or add details before sending.')
          : t(
              '选项会先放入输入框，不会直接发送。',
              'Choosing an option prepares a draft; it does not send it.',
            )}
      </p>
    </div>
  );
}

```

## src/styles/agent-guidance.css
```
/* The question guide is part of the desk: quiet paper, useful choices, a visible path. */
.agent-onboarding {
  padding-top: 18px;
  padding-bottom: 16px;
}
.agent-onboarding-heading {
  display: flex;
  gap: 9px;
  align-items: center;
  color: #78816e;
  font-size: 10px;
  letter-spacing: 0.08em;
}
.agent-guide-mark {
  display: grid;
  place-items: center;
  width: 21px;
  height: 23px;
  border: 1px solid #b98a74;
  color: var(--red);
  font: 17px var(--serif);
}
.agent-onboarding h1 {
  font-size: clamp(26px, 2.4vw, 35px);
  margin: 12px 0 8px;
  line-height: 1.4;
}
.agent-onboarding > p {
  margin-bottom: 14px;
}
.agent-onboarding h1:focus {
  outline: none;
}
.agent-onboarding.is-detail .agent-onboarding-heading {
  margin-bottom: 14px;
}
.agent-guide {
  border-top: 1px solid #d8dccd;
}
.agent-guide-progress {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 12px 0;
  margin: 0;
  list-style: none;
}
.agent-guide-progress li {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #989e90;
  font-size: 10px;
  white-space: nowrap;
}
.agent-guide-progress li + li {
  margin-left: auto;
}
.agent-guide-progress li + li::before {
  content: '';
  height: 1px;
  width: clamp(8px, 1.5vw, 25px);
  background: #d8dccd;
  margin-right: 7px;
}
.agent-guide-progress li > span {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border: 1px solid #daddd0;
  border-radius: 50%;
  font-size: 9px;
  font-variant-numeric: tabular-nums;
}
.agent-guide-progress .is-reached {
  color: #607053;
}
.agent-guide-progress [aria-current='step'] {
  color: #924e3b;
}
.agent-guide-progress [aria-current='step'] > span {
  border-color: #b97e64;
  background: #f3e7db;
}
.agent-guide-stage {
  animation: guide-unfold 220ms ease-out both;
}
.agent-guide-question {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 16px;
}
.agent-guide-question h2 {
  font-family: var(--serif);
  font-size: 23px;
  font-weight: 500;
  line-height: 1.45;
  margin: 0;
}
.agent-guide-question h2:focus {
  outline: none;
}
.agent-guide-question h2:focus-visible,
.agent-onboarding h1:focus-visible {
  outline: 2px solid #718860;
  outline-offset: 5px;
  border-radius: 2px;
}
.agent-guide-question p {
  font-size: 11px;
  color: #767e6c;
  line-height: 1.7;
  margin: 5px 0 0;
}
.agent-guide-back {
  min-width: 34px;
  min-height: 38px;
  display: grid;
  place-items: center;
  margin-left: -8px;
  border-radius: 4px;
  color: #68765c;
}
.agent-guide-back:hover {
  background: #ebeede;
}
.agent-guide-topics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
}
.agent-guide-topics > button,
.agent-guide-goals > button {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #dce0d1;
  background: #f3f4eb;
  border-radius: 5px;
  text-align: left;
  min-width: 0;
  padding: 15px 13px;
  transition:
    background 160ms,
    border-color 160ms,
    transform 160ms;
}
.agent-guide-topics > button:hover,
.agent-guide-goals > button:hover {
  background: #edf0e0;
  border-color: #aab79b;
  transform: translateY(-1px);
}
.agent-guide-topics > button > svg:first-child {
  color: #697d5c;
  flex-shrink: 0;
}
.agent-guide-topics > button > svg:last-child,
.agent-guide-goals > button > svg:last-child {
  width: 13px;
  color: #8b997d;
  flex-shrink: 0;
  margin-left: auto;
}
.agent-guide-topics strong,
.agent-guide-goals strong {
  display: block;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
}
.agent-guide-topics small,
.agent-guide-goals small {
  display: block;
  margin-top: 5px;
  font-size: 10px;
  line-height: 1.6;
  color: #748067;
}
.agent-guide-topics > .is-unsure {
  grid-column: 1 / -1;
  padding: 10px 13px;
  background: transparent;
  border-style: dashed;
}
.agent-guide-topics > .is-unsure > span {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 12px;
}
.agent-guide-topics > .is-unsure small {
  margin: 0;
}
.agent-guide-topics > .is-unsure > svg:first-child {
  width: 20px;
  height: 20px;
}
.agent-guide-goals {
  display: grid;
  gap: 8px;
}
.agent-guide-goals > button {
  padding: 11px 14px;
}
.agent-choice-number {
  align-self: flex-start;
  padding-top: 3px;
  color: #9a977e;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}
.agent-guide-selection {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 10px;
  color: #637357;
  margin-bottom: 12px;
}
.agent-guide-selection > span {
  background: #e9eddc;
  border-radius: 3px;
  padding: 4px 7px;
}
.agent-guide-background textarea {
  display: block;
  width: 100%;
  min-height: 96px;
  resize: vertical;
  padding: 13px;
  border: 1px solid #cbd3bd;
  background: #fffdf7;
  border-radius: 5px;
  font-size: 13px;
  line-height: 1.85;
}
.agent-guide-background textarea::placeholder {
  color: #8a9180;
}
.agent-guide-method {
  border-bottom: 1px solid #dfe3d5;
  margin-top: 7px;
}
.agent-guide-method summary,
.agent-guide-preview summary {
  display: flex;
  align-items: center;
  gap: 8px;
  list-style: none;
  cursor: pointer;
  font-size: 11px;
  min-height: 44px;
}
.agent-guide summary::-webkit-details-marker,
.agent-guide-alternatives summary::-webkit-details-marker {
  display: none;
}
.agent-guide-method summary > strong {
  font-weight: 500;
  color: #566c4a;
}
.agent-guide-method summary > span {
  margin-left: auto;
  font-size: 10px;
  color: #7b8670;
}
.agent-guide-method fieldset {
  padding: 0;
  margin: 4px 0 12px;
  border: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 7px;
}
.agent-guide-method label {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  padding: 10px 8px;
  border: 1px solid #d9decb;
  border-radius: 4px;
  cursor: pointer;
  min-height: 44px;
}
.agent-guide-method label:has(input:checked) {
  background: #e9eddc;
  border-color: #8ca27b;
}
.agent-guide-method input {
  accent-color: #627a52;
  width: 13px;
  height: 13px;
  margin: 0;
}
.agent-guide-method > p {
  font-size: 11px;
  line-height: 1.7;
  color: #6f7d63;
  margin: 0 0 15px;
}
.agent-guide-preview summary {
  color: #778168;
}
.agent-guide-preview summary > svg:last-child {
  margin-left: auto;
}
.agent-guide-preview > p {
  white-space: pre-wrap;
  font-size: 12px;
  line-height: 1.9;
  padding: 13px;
  margin: 0 0 15px;
  background: #f0f1e7;
  border-left: 2px solid #a7b495;
}
.agent-guide-compose {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 46px;
  padding: 11px 16px;
  width: 100%;
  background: #354e3a;
  color: #faf9f0;
  border: 1px solid #354e3a;
  border-radius: 5px;
  font-size: 13px;
  transition: background 160ms;
}
.agent-guide-compose:hover {
  background: #47634b;
}
.agent-guide-local {
  font-size: 10px;
  color: #7c8472;
  line-height: 1.7;
  margin: 8px 0 0;
}
.agent-guide-alternatives {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  align-items: flex-start;
  flex-wrap: wrap;
  margin-top: 12px;
}
.agent-guide-alternatives > button,
.agent-guide-alternatives summary {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 11px;
  min-height: 44px;
  color: #738069;
  cursor: pointer;
  list-style: none;
}
.agent-guide-alternatives > details {
  display: contents;
}
.agent-guide-alternatives .agent-starters {
  flex-basis: 100%;
}
.agent-guide-alternatives details:not([open]) > .agent-starters {
  display: none;
}
.agent-guide-rest {
  display: flex;
  align-items: center;
  gap: 11px;
  border-block: 1px solid #d9dfcf;
  padding: 22px 0;
  color: #5e7450;
}
.agent-guide-rest > svg {
  flex-shrink: 0;
}
.agent-guide-rest strong {
  font-size: 13px;
  font-weight: 500;
}
.agent-guide-rest p {
  font-size: 11px;
  line-height: 1.7;
  margin: 4px 0 0;
  color: #76816b;
}
.agent-guide-rest button {
  margin-left: auto;
  min-height: 44px;
  font-size: 11px;
  white-space: nowrap;
  text-decoration: underline;
  text-underline-offset: 4px;
}
.agent-conversation-guide {
  margin-top: 21px;
  border-top: 1px solid #dce0d0;
  padding-top: 15px;
}
.agent-conversation-guide.is-clarification {
  border: 1px solid #dce0d0;
  background: #f1f3e9;
  border-radius: 6px;
  padding: 15px;
}
.agent-conversation-guide-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  line-height: 1.65;
  color: #68795b;
  margin-bottom: 12px;
}
.agent-guidance-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.agent-guidance-options > button {
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
  padding: 10px 12px;
  min-height: 44px;
  min-width: 0;
  max-width: 100%;
  border: 1px solid #d3dbca;
  background: #fafaf3;
  border-radius: 5px;
  font-size: 12px;
  line-height: 1.65;
  overflow-wrap: anywhere;
  transition:
    border-color 150ms,
    background 150ms;
}
.agent-guidance-options > button:hover,
.agent-guidance-options > button[aria-pressed='true'] {
  border-color: #8ca177;
  background: #e8eddc;
}
.agent-guidance-options > button > svg {
  flex-shrink: 0;
  color: #637951;
}
.agent-guidance-dot {
  width: 6px;
  height: 6px;
  border: 1px solid #99a889;
  border-radius: 50%;
  flex-shrink: 0;
}
.agent-guidance-other {
  display: flex;
  flex-wrap: wrap;
  gap: 5px 18px;
  margin-top: 5px;
}
.agent-guidance-other button {
  display: flex;
  align-items: center;
  gap: 5px;
  min-height: 40px;
  color: #738067;
  font-size: 11px;
}
.agent-guidance-other button:hover {
  color: var(--red);
}
.agent-guidance-hint {
  font-size: 10px;
  color: #828b77;
  line-height: 1.7;
  margin: 0;
}
.agent-guidance-birth {
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  width: 100%;
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #c8d3bd;
  border-radius: 4px;
  background: #e8edde;
  font-size: 12px;
}
.agent-guidance-birth small {
  display: block;
  font-size: 10px;
  line-height: 1.7;
  color: #718065;
  margin-top: 3px;
}
.agent-guidance-birth > svg {
  flex-shrink: 0;
}
.agent-guidance-birth > svg:last-child {
  margin-left: auto;
}
.agent-composer textarea {
  height: auto;
  min-height: 70px;
  max-height: 190px;
  field-sizing: content;
}
@keyframes guide-unfold {
  from {
    opacity: 0.3;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.agent-workspace[data-motion='quiet'] .agent-guide-stage {
  animation: none;
}
.agent-workspace[data-motion='quiet'] .agent-guide-topics > button:hover,
.agent-workspace[data-motion='quiet'] .agent-guide-goals > button:hover {
  transform: none;
}
@media (max-width: 1180px) and (min-width: 1001px) {
  .agent-guide-topics > button {
    padding: 12px 10px;
    gap: 8px;
  }
  .agent-guide-topics > button > svg:first-child {
    width: 18px;
  }
  .agent-guide-topics > button > svg:last-child {
    display: none;
  }
  .agent-guide-topics strong {
    font-size: 12px;
  }
  .agent-guide-progress li + li::before {
    display: none;
  }
}
@media (max-width: 700px) {
  .agent-onboarding {
    padding: 23px 20px 15px;
  }
  .agent-onboarding h1 {
    font-size: 30px;
    margin: 13px 0 10px;
  }
  .agent-onboarding > p {
    margin-bottom: 18px;
  }
  .agent-guide-question h2 {
    font-size: 21px;
  }
  .agent-guide-topics > button {
    padding: 13px 11px;
    gap: 9px;
  }
  .agent-guide-topics > button > svg:last-child {
    display: none;
  }
  .agent-guide-topics > button > svg:first-child {
    width: 20px;
  }
  .agent-guide-topics strong {
    font-size: 12px;
  }
  .agent-guide-topics small {
    font-size: 10px;
  }
  .agent-guide-progress li {
    font-size: 10px;
    gap: 5px;
  }
  .agent-guide-progress li + li::before {
    width: 9px;
    margin-right: 3px;
  }
  .agent-guide-method fieldset {
    grid-template-columns: repeat(2, 1fr);
  }
  .agent-conversation-guide.is-clarification {
    padding: 13px 11px;
  }
  .agent-composer textarea {
    font-size: 16px;
    max-height: 155px;
    min-height: 60px;
  }
  .agent-guide-background textarea {
    font-size: 16px;
  }
}
@media (max-width: 370px) {
  .agent-onboarding {
    padding-inline: 16px;
  }
  .agent-onboarding h1 {
    font-size: 27px;
  }
  .agent-guide-topics > button {
    gap: 7px;
    padding: 12px 9px;
  }
  .agent-guide-topics > button > svg:first-child {
    width: 16px;
  }
  .agent-guide-progress li + li::before {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .agent-guide-stage {
    animation: none;
  }
  .agent-guide-topics > button,
  .agent-guide-goals > button,
  .agent-guide-compose,
  .agent-guidance-options > button {
    transition: none;
  }
  .agent-guide-topics > button:hover,
  .agent-guide-goals > button:hover {
    transform: none;
  }
}

```

## tests/agent-guidance.test.ts
```
import { describe, expect, it } from 'vitest';
import {
  buildGuidedPrompt,
  defaultGuideMethod,
  followupSuggestions,
  guideGoals,
  guideMethods,
  guideTopics,
  stageSuggestion,
} from '../src/lib/agent-guidance';
import { newMessage } from '../src/lib/agent-session';

describe('guided expression without invented personal context', () => {
  it('allows every offered topic, goal and method in both languages without inventing background', () => {
    for (const locale of ['zh', 'en'] as const)
      for (const topic of guideTopics)
        for (const goal of guideGoals[topic.id])
          for (const method of guideMethods) {
            const prompt = buildGuidedPrompt(
              { topic: topic.id, goal: goal.id, method: method.id, background: '' },
              locale,
            );
            expect(prompt.text.length).toBeLessThan(3000);
            expect(prompt.text).toContain(goal.label[locale === 'zh' ? 0 : 1]);
            expect(prompt.text).not.toMatch(/我的补充|My context|1990|1988|新机会|new opportunity/);
            expect(prompt.mode).toBe(method.id === 'research' ? 'research' : 'explore');
          }
  });
  it('starts everyday questions with conversation and only asks for a reading when selected', () => {
    expect(defaultGuideMethod('work', 'compare')).toBe('conversation');
    expect(defaultGuideMethod('learn', 'basics')).toBe('research');
    expect(defaultGuideMethod('learn', 'clarify')).toBe('conversation');
    expect(defaultGuideMethod('self', 'chart')).toBe('bazi');
    const plain = buildGuidedPrompt(
      { topic: 'work', goal: 'compare', method: 'conversation', background: '我最在意能否远程工作。' },
      'zh',
    );
    expect(plain.text).toContain('暂不抽牌、起卦或排盘');
    expect(plain.text).toContain('我的补充：我最在意能否远程工作。');
    expect(plain.text).not.toContain('接受新机会');
    const birth = buildGuidedPrompt({ topic: 'self', goal: 'chart', method: 'bazi', background: '' }, 'zh');
    expect(birth.text).toContain('不知道的时刻保留未知');
    expect(birth.text).not.toContain('12:00');
  });
  it('rejects stale goals from another topic', () => {
    expect(() =>
      buildGuidedPrompt(
        { topic: 'relationships', goal: 'chart', method: 'conversation', background: '' },
        'zh',
      ),
    ).toThrow();
  });
});

describe('editable suggestions preserve user authorship', () => {
  it('replaces only the actual inserted span and keeps all free typing', () => {
    const empty = { text: '', start: 0 };
    const first = stageSuggestion('我自己写的背景', empty, '第一个选项');
    expect(first.draft).toBe('我自己写的背景\n\n第一个选项');
    expect(stageSuggestion(first.draft + '\n我补充的细节', first.suggestion, '第二个选项').draft).toBe(
      '我自己写的背景\n\n第二个选项\n我补充的细节',
    );
    expect(stageSuggestion(first.draft, first.suggestion, '第一个选项').draft).toBe(first.draft);
    expect(stageSuggestion('我改写过的选项', first.suggestion, '新的选项').draft).toBe(
      '我改写过的选项\n\n新的选项',
    );
    const collision = stageSuggestion('我想比较两个选择的利弊', empty, '比较两个选择');
    expect(collision.draft).toBe('我想比较两个选择的利弊\n\n比较两个选择');
    expect(stageSuggestion(collision.draft, collision.suggestion, '找到卡住的地方').draft).toBe(
      '我想比较两个选择的利弊\n\n找到卡住的地方',
    );
    const duplicates = stageSuggestion('比较两个选择\n\n这是我的背景', empty, '比较两个选择');
    expect(stageSuggestion(duplicates.draft, duplicates.suggestion, '认识自己').draft).toBe(
      '比较两个选择\n\n这是我的背景\n\n认识自己',
    );
  });
  it('never offers generic follow-ups during a pending clarification, error or running turn', () => {
    const message = newMessage('assistant', 'A question');
    for (const status of ['running', 'waiting', 'error', 'limited', 'stopped'] as const)
      expect(followupSuggestions({ ...message, status }, 'zh')).toEqual([]);
    expect(
      followupSuggestions(
        { ...message, status: 'complete', question: { question: 'Which?', options: ['A'] } },
        'zh',
      ),
    ).toEqual([]);
    expect(followupSuggestions({ ...message, status: 'complete' }, 'zh').length).toBe(2);
    expect(followupSuggestions(newMessage('user', 'Hello'), 'zh')).toEqual([]);
  });
});

```

## Tracked source diff
```diff
diff --git a/src/components/AgentWorkspace.tsx b/src/components/AgentWorkspace.tsx
index ae47d5c..4fac416 100644
--- a/src/components/AgentWorkspace.tsx
+++ b/src/components/AgentWorkspace.tsx
@@ -16,7 +16,6 @@ import {
   PanelRight,
   Plus,
   Search,
-  SlidersHorizontal,
   Square,
   Trash2,
   X,
@@ -57,9 +56,13 @@ import InstrumentGlyph, { ReadingDeskIllustration, type InstrumentKind } from '.
 import AgentRitual, { useAgentMotion } from './AgentRitual';
 import ReadingView from './ReadingView';
 import { readReportVisual } from '../lib/agent-report';
+import { isSuggestionIntact, stageSuggestion } from '../lib/agent-guidance';
+import AgentOnboarding from './AgentOnboarding';
+import AgentConversationGuide from './AgentConversationGuide';
 import '../styles/agent.css';
 import '../styles/agent-motion.css';
 import '../styles/agent-visuals.css';
+import '../styles/agent-guidance.css';
 
 class ChartBoundary extends Component<{ children: ReactNode; fallback: string }, { failed: boolean }> {
   state = { failed: false };
@@ -84,6 +87,11 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
   const [activeId, setActiveId] = useState('');
   const [loaded, setLoaded] = useState(false);
   const [draft, setDraft] = useState('');
+  const stagedSuggestion = useRef({
+    text: '',
+    start: 0,
+    action: 'none' as 'none' | 'guided' | 'clarification' | 'followup' | 'example',
+  });
   const [busy, setBusy] = useState(false);
   const motion = useAgentMotion();
   const [currentTurn, setCurrentTurn] = useState<string[]>([]);
@@ -267,6 +275,7 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
     setActiveId(id);
     setSelectedArtifact('');
     setDraft('');
+    stagedSuggestion.current = { text: '', start: 0, action: 'none' };
     setSidebar(false);
     setMobilePane('chat');
     setNotice('');
@@ -321,6 +330,25 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
     setMobilePane('results');
   }
 
+  function prepareDraft(text: string, action: 'guided' | 'clarification' | 'followup' | 'example') {
+    const { draft: next, suggestion } = stageSuggestion(draft, stagedSuggestion.current, text);
+    if (next.length > 3000) {
+      setNotice(
+        t(
+          '草稿已接近 3000 字上限，请先精简内容，再添加这个选项。',
+          'Your draft is near the 3,000-character limit. Shorten it before adding this suggestion.',
+        ),
+      );
+      textarea.current?.focus();
+      return false;
+    }
+    setDraft(next);
+    stagedSuggestion.current = { ...suggestion, action };
+    setMobilePane('chat');
+    setNotice('');
+    textarea.current?.focus();
+    return true;
+  }
   async function send(value = draft) {
     const session = sessionRef.current.find((s) => s.id === activeId);
     if (!session || pending.current || !value.trim()) return;
@@ -339,7 +367,15 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
     }
     setNotice('');
     setDraft('');
-    track('agent_started', { tool: 'agent', mode: session.mode });
+    track('agent_started', {
+      tool: 'agent',
+      mode: session.mode,
+      action:
+        value === draft && isSuggestionIntact(value, stagedSuggestion.current)
+          ? stagedSuggestion.current.action
+          : 'none',
+    });
+    stagedSuggestion.current = { text: '', start: 0, action: 'none' };
     setBusy(true);
     setMobilePane('chat');
     stickToBottom.current = true;
@@ -718,32 +754,24 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
           }}
         >
           {!active?.messages.length ? (
-            <div className="agent-welcome">
-              <div className="agent-welcome-kicker">
-                <InstrumentGlyph kind="ziwei" size={32} />
-                <span className="eyebrow">A QUESTION. A WAY FORWARD.</span>
-              </div>
-              <h1>
-                {t('从一个问题，', 'Begin with a question.')}
-                <br />
-                <em>{t('慢慢看清。', 'Find a clearer view.')}</em>
-              </h1>
-              <p>
-                {t(
-                  '排一张命盘，读一段经典，或聊聊眼前的选择。',
-                  'Explore a chart, read a tradition, or untangle a choice.',
-                )}
-                <br />
-                {t('让依据与思考，一起留在你的探索里。', 'Keep the evidence and your reflections together.')}
-              </p>
+            <AgentOnboarding
+              key={activeId}
+              locale={locale}
+              disabled={!loaded}
+              onDirect={() => textarea.current?.focus()}
+              onCompose={(value) => {
+                if (!prepareDraft(value.text, 'guided')) return false;
+                if (active) mutateSession(active.id, (a) => ({ ...a, mode: value.mode }));
+                return true;
+              }}
+            >
               <div className="agent-starters">
                 {starters.map((s) => (
                   <button
                     key={s.label}
                     onClick={() => {
-                      setDraft(s.text);
-                      if (active) mutateSession(active.id, (a) => ({ ...a, mode: s.mode }));
-                      textarea.current?.focus();
+                      if (prepareDraft(s.text, 'example') && active)
+                        mutateSession(active.id, (a) => ({ ...a, mode: s.mode }));
                     }}
                   >
                     <InstrumentGlyph kind={s.kind} size={48} />
@@ -755,7 +783,7 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
                   </button>
                 ))}
               </div>
-            </div>
+            </AgentOnboarding>
           ) : (
             <div className="agent-message-list">
               <h1 className="sr-only">{t('命理 Agent', 'Wenbu Agent')}</h1>
@@ -907,21 +935,19 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
                       <ArrowUpRight size={11} />
                     </button>
                   )}
-                  {message.question && i === active.messages.length - 1 && (
-                    <div className="agent-question-actions">
-                      {message.question.form === 'birth' && (
-                        <button onClick={() => openContext(true)}>
-                          <SlidersHorizontal size={14} />
-                          {t('补充出生资料', 'Add birth details')}
-                        </button>
-                      )}
-                      {message.question.options.map((option) => (
-                        <button key={option} disabled={busy} onClick={() => void send(option)}>
-                          {option}
-                          <ArrowUpRight size={12} />
-                        </button>
-                      ))}
-                    </div>
+                  {i === active.messages.length - 1 && (
+                    <AgentConversationGuide
+                      key={message.id}
+                      message={message}
+                      locale={locale}
+                      disabled={busy}
+                      onStage={(text) => prepareDraft(text, message.question ? 'clarification' : 'followup')}
+                      onCustom={() => {
+                        setMobilePane('chat');
+                        textarea.current?.focus();
+                      }}
+                      onBirth={() => openContext(true)}
+                    />
                   )}
                   {message.status === 'error' && (
                     <div className="agent-turn-error" role="alert">
@@ -975,8 +1001,16 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
               rows={2}
               disabled={!loaded}
               aria-label={t('向命理 Agent 提问', 'Ask Wenbu Agent')}
-              placeholder={t('此刻，你想从哪里开始？', 'What would you like to explore?')}
-              onChange={(e) => setDraft(e.target.value)}
+              placeholder={
+                active?.messages.length
+                  ? t('补充你的情况，或继续追问……', 'Add context, or ask a follow-up…')
+                  : t('也可以直接写：我最近在犹豫……', 'Or start here: lately, I have been wondering…')
+              }
+              onChange={(e) => {
+                setDraft(e.target.value);
+                if (!isSuggestionIntact(e.target.value, stagedSuggestion.current))
+                  stagedSuggestion.current = { text: '', start: 0, action: 'none' };
+              }}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                   e.preventDefault();
@@ -1194,7 +1228,7 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
                     sources={sources}
                     locale={locale}
                     busy={busy}
-                    onQuestion={(question) => void send(question)}
+                    onQuestion={(question) => prepareDraft(question, 'followup')}
                   />
                 )}
                 <div className="agent-artifact-actions">
diff --git a/src/components/AnalyticsDashboard.tsx b/src/components/AnalyticsDashboard.tsx
index e99b3d4..371dcb1 100644
--- a/src/components/AnalyticsDashboard.tsx
+++ b/src/components/AnalyticsDashboard.tsx
@@ -41,6 +41,20 @@ export default function AnalyticsDashboard() {
   }
   const summary = report?.data.summary[0] ?? {};
   const funnel = report?.data.funnel[0] ?? {};
+  const guidanceLabels: Record<string, string> = {
+    guide_opened: '开始使用引导',
+    guide_step_1: '返回选择主题',
+    guide_step_2: '进入目标选择',
+    guide_step_3: '进入补充与预览',
+    guide_skipped: '切换直接输入',
+    guide_draft_created: '引导内容放入草稿',
+    suggestion_selected_clarification: '选择澄清回答',
+    suggestion_selected_followup: '选择继续追问',
+    agent_started_guided: '发送引导草稿',
+    agent_started_clarification: '发送澄清草稿',
+    agent_started_followup: '发送追问草稿',
+    agent_started_example: '发送示例提问',
+  };
   const select = (key: keyof typeof filters, title: string, options: readonly string[]) => (
     <label>
       {title}
@@ -232,6 +246,38 @@ export default function AnalyticsDashboard() {
             </article>
           </div>
           <div className="insights-breakdowns">
+            <details className="insights-card" open>
+              <summary>Agent 提问引导</summary>
+              <p>
+                只统计步骤与操作类型，不记录选择内容。发送表示发起回合，不等同于服务端完成；不是严格漏斗。
+              </p>
+              <div className="insights-table">
+                <table>
+                  <thead>
+                    <tr>
+                      <th>操作</th>
+                      <th>次数</th>
+                      <th>会话</th>
+                    </tr>
+                  </thead>
+                  <tbody>
+                    {(report.data.guidance ?? []).map((row) => (
+                      <tr key={String(row.label)}>
+                        <th>{guidanceLabels[String(row.label)] ?? String(row.label)}</th>
+                        <td>{number(row.count)}</td>
+                        <td>{number(row.sessions)}</td>
+                      </tr>
+                    ))}
+                    {!report.data.guidance?.length && (
+                      <tr>
+                        <td colSpan={3}>所选范围内还没有引导事件。</td>
+                      </tr>
+                    )}
+                  </tbody>
+                </table>
+              </div>
+              <small>自由修改后不再包含原建议的发送归为普通对话；不推断用户主题或个人特征。</small>
+            </details>
             {Object.entries(breakdownNames).map(([key, label]) => (
               <details
                 className="insights-card"
diff --git a/src/lib/analytics-contract.ts b/src/lib/analytics-contract.ts
index f7a61a0..b90156f 100644
--- a/src/lib/analytics-contract.ts
+++ b/src/lib/analytics-contract.ts
@@ -11,6 +11,11 @@ export const clientEvents = [
   'agent_started',
   'agent_received',
   'agent_stopped',
+  'guide_opened',
+  'guide_step',
+  'guide_skipped',
+  'guide_draft_created',
+  'suggestion_selected',
   'artifact_opened',
   'report_exported',
   'conversation_exported',
@@ -69,6 +74,9 @@ export const actions = [
   'inspect',
   'source',
   'context',
+  'guided',
+  'clarification',
+  'followup',
 ] as const;
 export const statuses = [
   'none',
diff --git a/tests/analytics.test.ts b/tests/analytics.test.ts
index 20364ed..67fef5c 100644
--- a/tests/analytics.test.ts
+++ b/tests/analytics.test.ts
@@ -55,6 +55,36 @@ function context() {
 const request = (headers: Record<string, string> = {}) =>
   new Request('https://wenbu.genedai.me/api/v1/tarot', { headers });
 describe('closed analytics contract', () => {
+  it('summarizes guidance steps without collecting topic or answer content and excludes test traffic', async () => {
+    const { sql, env } = database();
+    const session = context();
+    const events = [
+      { event: 'page_view' },
+      { event: 'guide_opened' },
+      { event: 'guide_step', value: 2 },
+      { event: 'guide_step', value: 3 },
+      { event: 'guide_draft_created' },
+      { event: 'agent_started', action: 'guided' },
+      { event: 'agent_started', action: 'example' },
+      { event: 'suggestion_selected', action: 'clarification' },
+    ].map((e) => ({ ...session, ...e, id: crypto.randomUUID(), tool: 'agent', page: '/agent/' }));
+    await collectEvents({ events }, request(), env);
+    await collectEvents({ events: [{ ...events[0], id: crypto.randomUUID(), test: true }] }, request(), env);
+    const report = await analyticsReport(new URL('https://wenbu.genedai.me/api/admin/analytics'), env);
+    expect(report.data.guidance).toEqual(
+      expect.arrayContaining([
+        { label: 'guide_opened', count: 1, sessions: 1 },
+        { label: 'guide_step_3', count: 1, sessions: 1 },
+        { label: 'agent_started_guided', count: 1, sessions: 1 },
+        { label: 'agent_started_example', count: 1, sessions: 1 },
+      ]),
+    );
+    expect(report.data.funnel[0].started).toBe(1);
+    expect(() => eventBatch.parse({ events: [{ ...events[0], topic: 'private topic' }] })).toThrow();
+    expect(() => eventBatch.parse({ events: [{ ...events[0], answer: 'private answer' }] })).toThrow();
+    expect(() => eventBatch.parse({ events: [{ ...events[0], action: 'my personal choice' }] })).toThrow();
+    sql.close();
+  });
   it('records malformed, oversized and unsupported requests as input failures, not service errors', async () => {
     const { sql, env } = database();
     for (const [body, contentType, status] of [
diff --git a/worker/agent-tools.ts b/worker/agent-tools.ts
index 0652897..0857bc8 100644
--- a/worker/agent-tools.ts
+++ b/worker/agent-tools.ts
@@ -28,7 +28,7 @@ const readSchema = z.object({ id: z.string().min(1).max(120) }).strict();
 const questionSchema = z
   .object({
     question: z.string().min(1).max(700),
-    options: z.array(z.string().max(160)).max(4).default([]),
+    options: z.array(z.string().trim().min(1).max(160)).max(4).default([]),
     form: z.literal('birth').optional(),
   })
   .strict();
@@ -62,7 +62,7 @@ const descriptions: Record<keyof typeof schemas, string> = {
   read_reference:
     'Fetch and read a PUBLIC WEB excerpt of an exact reference ID from the curated catalogue. No arbitrary URLs or general internet search. Can fail for blocked, large, PDF or private pages. Failed references are NOT read and cannot be cited as reviewed.',
   ask_user:
-    'Ask one focused question when necessary information is missing. Optional up to 4 answer options. Set form=birth to show the birth-information editor. This pauses the turn for the user; do not combine with other tools.',
+    'Help clarify a vague question or ask for necessary missing information. Ask ONE focused question with 2–4 short, distinct answer options when useful (never invent user facts). The interface adds custom-answer and unsure controls. Reuse details already shared. Set form=birth only when birth data is required. This pauses the turn for the user; do not combine with other tools.',
   write_report:
     'Create a concise structured report in the results panel: 2–4 short sections, under 800 Chinese characters or 1500 Latin characters total, including summary/questions/visual. For a meaningful comparison or ordered procedure, include one optional visual: type comparison for 2–4 parallel alternatives, or steps for 2–4 ordered stages. Keep each visual item label short and its detail under 60 Chinese characters or 130 Latin characters. Preserve qualifications; never invent percentages, scores, evidence or causal order. Each visual item has its own sourceIds. Cite only source IDs returned by successfully read_library/read_reference calls or the verified source snapshot. Separate calculation facts, tradition and interpretation. Put material uncertainty and unfinished work in the summary as well as the relevant section. Use after gathering evidence. New calls create new report versions.',
 };
diff --git a/worker/agent.ts b/worker/agent.ts
index bce277c..fe3ea0a 100644
--- a/worker/agent.ts
+++ b/worker/agent.ts
@@ -33,6 +33,7 @@ export function agentInstructions(input: AgentRequest) {
 You have REAL tools. Use them to do the work, not to describe what you might do. Select the right tools, inspect their results, and continue until the user's question is answered or a necessary detail is missing. All public text, including the brief pre-tool update, must use the selected answer language; keep English to proper names or code identifiers when replying in Chinese. Keep conversation human, precise and unhurried. Do not overwhelm simple questions with plans or long reports.
 Mode: ${input.mode === 'research' ? 'RESEARCH. Search focused terms, read relevant documents and reference pages, compare evidence, and produce a sourced report using write_report. Usually 2 or 3 relevant sources suffice: batch independent reads and reserve a call for the report. Do not spend every turn gathering more sources. An overview/search snippet is not a read source. Be candid about unavailable pages.' : 'EXPLORE. Help the user understand their question. Calculate or draw only when relevant and requested. Offer a useful next step and invite a focused follow-up.'}
 For a complex task, use update_plan with a few short action labels; progress is a public plan, not hidden reasoning. You can emit multiple independent tool calls together. Call tools directly without a narrative preamble; the interface shows actual tool progress. Never claim a tool succeeded until its result says so.
+Help users express their intent. For a vague opening or an explicit request to help frame a question, use ask_user with ONE focused question and 2–4 short, distinct, concrete options in the selected language. Ask about the situation or desired outcome before technical methods. The interface already offers a custom answer and an unsure option, so do not duplicate these in every list. Do not put unshared personal facts, desired outcomes, or consent to a new draw in the user's mouth. The user may arrive with a guided brief (topic, aim, optional context, approach); treat only the provided parts as their input. Do not restart a questionnaire or re-ask details already supplied. If enough information is available, proceed. For an unsure reply, explain what can still be done and narrow the next question; never demand a complete profile. Asking for a hypothetical example is not a request for another personal intake.
 All four chart/card tools are available. ALL pillars, stars, hexagrams and card identities MUST come from verified tool results or the supplied verified snapshot. Never compute these in prose. Use an existing result on follow-up; do not redraw/recast unless the user explicitly asks for a new draw. A request to interpret or compare existing results is not permission to replace them. Missing birth date/timezone/sex must not be invented. Unknown birth time is allowed for BaZi (time=null); Zi Wei requires known time and the traditional sex parameter. Do not invent an exact time or select the midpoint of an uncertain interval. Ask the user which exact time to test, or use time=null for BaZi and explain the missing hour. Dates are Gregorian. If necessary ask_user one useful question, options, or form=birth; this ends the turn awaiting the user. A simple general question doesn't require birth data.
 Tarot artwork is an original Wenbu reinterpretation. You receive verified card names, orientation and keywords, but NOT the actual illustration as visual input. Do not claim to see or describe the displayed artwork. Discuss traditional symbolism as tradition and ground reflection in the returned card data; do not invent visible objects, counts or scenes.
 Wenbu calculation invariants: for a known fixed birth instant, solar-time correction ONLY changes the local clock used for day/hour. Year/month ALWAYS retain the same absolute solar-term instant, even near a term boundary; never claim solar correction itself can change them. Unknown time has a separate provisional-noon uncertainty. The approximate equation of time uses date, not latitude. Do not invent numerical error estimates, latitude-dependent precision claims, or a universal safe distance (such as 20 minutes) from a boundary: the longitude correction can be much larger. Say the correction magnitude and exact boundary must be compared from actual calculations.
diff --git a/worker/analytics.ts b/worker/analytics.ts
index 332d80d..d648246 100644
--- a/worker/analytics.ts
+++ b/worker/analytics.ts
@@ -238,7 +238,11 @@ export async function analyticsReport(url: URL, env: Env) {
     ],
     [
       'funnel',
-      `WITH steps AS (SELECT session_id, MIN(CASE WHEN event='page_view' THEN occurred_at END) visit, MIN(CASE WHEN event IN ('tool_started','agent_started') AND action!='example' THEN occurred_at END) start, MIN(CASE WHEN (event IN ('calculation_succeeded','interpret_succeeded') AND action!='example') OR (event='agent_finished' AND status='complete') THEN occurred_at END) success, MAX(CASE WHEN event='journal_saved' THEN occurred_at END) saved FROM events WHERE $WHERE AND session_id IS NOT NULL GROUP BY session_id) SELECT COUNT(visit) visited, SUM(visit IS NOT NULL AND start IS NOT NULL) started, SUM(visit IS NOT NULL AND start IS NOT NULL AND success IS NOT NULL) succeeded, SUM(visit IS NOT NULL AND start IS NOT NULL AND success IS NOT NULL AND saved IS NOT NULL) saved FROM steps`,
+      `WITH steps AS (SELECT session_id, MIN(CASE WHEN event='page_view' THEN occurred_at END) visit, MIN(CASE WHEN (event='agent_started' OR (event='tool_started' AND action!='example')) THEN occurred_at END) start, MIN(CASE WHEN (event IN ('calculation_succeeded','interpret_succeeded') AND action!='example') OR (event='agent_finished' AND status='complete') THEN occurred_at END) success, MAX(CASE WHEN event='journal_saved' THEN occurred_at END) saved FROM events WHERE $WHERE AND session_id IS NOT NULL GROUP BY session_id) SELECT COUNT(visit) visited, SUM(visit IS NOT NULL AND start IS NOT NULL) started, SUM(visit IS NOT NULL AND start IS NOT NULL AND success IS NOT NULL) succeeded, SUM(visit IS NOT NULL AND start IS NOT NULL AND success IS NOT NULL AND saved IS NOT NULL) saved FROM steps`,
+    ],
+    [
+      'guidance',
+      `SELECT CASE WHEN event='guide_step' THEN event || '_' || value WHEN event IN ('suggestion_selected','agent_started') THEN event || '_' || action ELSE event END label, COUNT(*) count, COUNT(DISTINCT session_id) sessions FROM events WHERE $WHERE AND (event IN ('guide_opened','guide_step','guide_skipped','guide_draft_created','suggestion_selected') OR (event='agent_started' AND action IN ('guided','clarification','followup','example'))) GROUP BY label ORDER BY label`,
     ],
   ];
   for (const key of [

```
