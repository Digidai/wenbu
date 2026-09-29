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
    <div
      className={`agent-welcome agent-onboarding ${step === 0 ? 'is-intro' : 'is-detail'}`}
      data-ready={ready}
    >
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
