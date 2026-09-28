Final focused review. Source only: no tools, browsing or delegation. Prior findings and dispositions: (1) substring suggestion replacement fixed using a recorded insertion span, invalidated on edits; (2) keyboard heading focus now has focus-visible outline; (3) actual Agent example requests now count as starts and are reported; (4) stale intro title when finished/closed now has state-specific headings; (5) reopen focus effect now observes collapsed/ready state. Since review we also derived suggestion checks from the intact parent draft rather than stale component state, use report-provided followups when available, and avoid asking for another example after a message already gives one. Live synthetic two-turn test passed clarification -> direct example, without chart actions. Review ONLY concrete defects in this final source. Identify exact reproduction or state No blocking defects found. Do not invent runtime verification.

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
  const previousView = useRef({ step, collapsed, ready });
  useEffect(() => {
    const previous = previousView.current;
    if (!collapsed && !ready && (previous.step !== step || previous.collapsed || previous.ready))
      heading.current?.focus({ preventScroll: false });
    previousView.current = { step, collapsed, ready };
  }, [step, collapsed, ready]);

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
        {collapsed
          ? t('从一句话开始。', 'Begin with one sentence.')
          : ready
            ? t('问题准备好了。', 'Your question is ready.')
            : step === 0
              ? t('最近，你更关心哪件事？', 'What is on your mind?')
              : t('一起把问题说清楚', 'Let’s clarify your question')}
      </h1>
      {(step === 0 || collapsed || ready) && (
        <p>
          {collapsed
            ? t(
                '写下此刻的想法，不必组织得很完整。',
                'Write what is on your mind. It does not have to be polished.',
              )
            : ready
              ? t('在下方读一读，改成更贴近你的表达。', 'Read the draft below and make it your own.')
              : t(
                  '不必想好怎么问，选一个贴近的开始。',
                  'No perfect question needed. Choose a place to begin.',
                )}
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
import type { AgentMessage } from '../lib/agent-protocol';
import { followupSuggestions } from '../lib/agent-guidance';
import type { Locale } from '../lib/schema';
import { choose } from '../lib/i18n';
import { track } from '../lib/analytics';

export default function AgentConversationGuide({
  message,
  locale,
  disabled,
  stagedText,
  onStage,
  onCustom,
  onBirth,
}: {
  message: AgentMessage;
  locale: Locale;
  disabled: boolean;
  stagedText: string;
  onStage: (text: string) => boolean;
  onCustom: () => void;
  onBirth: () => void;
}) {
  const t = (zh: string, en: string) => choose(locale, zh, en);
  const question = message.status === 'waiting' ? message.question : undefined;
  const followups = followupSuggestions(message, locale);
  if (!question && !followups.length) return null;
  const unsureText = t(
    '这一点我还不确定。请说明它会影响什么，以及信息未知时可以怎样继续；不要替我假定答案。',
    'I am not sure about this. Explain what it changes and how we can continue with it unknown; do not assume an answer for me.',
  );
  const options = question
    ? [...new Set(question.options.map((s) => s.trim()).filter(Boolean))].map((text, i) => ({
        id: String(i),
        text,
        label: text,
      }))
    : followups;
  const hasSelection =
    options.some((option) => option.text === stagedText) || (!!question && stagedText === unsureText);
  function stage(text: string, action: 'clarification' | 'followup') {
    if (onStage(text)) {
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
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            aria-pressed={stagedText === option.text}
            onClick={() => stage(option.text, question ? 'clarification' : 'followup')}
          >
            {stagedText === option.text ? (
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
            aria-pressed={stagedText === unsureText}
            onClick={() => stage(unsureText, 'clarification')}
          >
            {t('暂时不确定', 'I’m not sure')}
          </button>
        )}
      </div>
      <p className="agent-guidance-hint" aria-live="polite">
        {hasSelection
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

```

## Parent integration
```tsx
  function prepareDraft(text: string, action: 'guided' | 'clarification' | 'followup' | 'example') {
    const { draft: next, suggestion } = stageSuggestion(draft, stagedSuggestion.current, text);
    if (next.length > 3000) {
      setNotice(
        t(
          '草稿已接近 3000 字上限，请先精简内容，再添加这个选项。',
          'Your draft is near the 3,000-character limit. Shorten it before adding this suggestion.',
        ),
      );
      textarea.current?.focus();
      return false;
    }
    setDraft(next);
    stagedSuggestion.current = { ...suggestion, action };
    setMobilePane('chat');
    setNotice('');
    textarea.current?.focus();
    return true;
  }
  async function send(value = draft) {
    const session = sessionRef.current.find((s) => s.id === activeId);
    if (!session || pending.current || !value.trim()) return;
    if (session.messages.length >= 160) {
      setNotice(
        t(
          '这段探索已很长，请导出后开启新对话。',
          'This conversation is long. Export it and start a new one.',
        ),
      );
      return;
    }
    if (session.context.useBirth && !session.context.birth?.date) {
      openContext();
      return;
    }
    setNotice('');
    setDraft('');
    track('agent_started', {
      tool: 'agent',
      mode: session.mode,
      action:
        value === draft && isSuggestionIntact(value, stagedSuggestion.current)
          ? stagedSuggestion.current.action
          : 'none',
    });
    stagedSuggestion.current = { text: '', start: 0, action: 'none' };

                  {i === active.messages.length - 1 && (
                    <AgentConversationGuide
                      key={message.id}
                      message={message}
                      stagedText={
                        isSuggestionIntact(draft, stagedSuggestion.current)
                          ? stagedSuggestion.current.text
                          : ''
                      }
                      locale={locale}
                      disabled={busy}
                      onStage={(text) => prepareDraft(text, message.question ? 'clarification' : 'followup')}
                      onCustom={() => {
                        setMobilePane('chat');
                        textarea.current?.focus();
                      }}
                      onBirth={() => openContext(true)}
                    />
                  )}

              onChange={(e) => {
                setDraft(e.target.value);
                if (!isSuggestionIntact(e.target.value, stagedSuggestion.current))
                  stagedSuggestion.current = { text: '', start: 0, action: 'none' };
              }}

```

Heading focus styles: h1:focus-visible and h2:focus-visible have 2px solid #718860 outline, 5px offset. Reduced motion disables step animation.
