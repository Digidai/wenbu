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
