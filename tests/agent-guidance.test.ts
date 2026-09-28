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
    expect(
      followupSuggestions({ ...message, text: '以下是一个假设案例。', status: 'complete' }, 'zh')[0].label,
    ).toBe('整理成简明清单');
    expect(
      followupSuggestions(
        {
          ...message,
          status: 'complete',
          artifacts: [
            {
              type: 'report',
              id: 'report',
              title: '主题',
              summary: '说明',
              sections: [],
              questions: ['如何应用刚才的方法？'],
              createdAt: new Date().toISOString(),
            },
          ],
        },
        'zh',
      )[0].text,
    ).toBe('如何应用刚才的方法？');
    expect(followupSuggestions(newMessage('user', 'Hello'), 'zh')).toEqual([]);
  });
});
