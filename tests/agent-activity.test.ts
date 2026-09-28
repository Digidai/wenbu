import { describe, expect, it } from 'vitest';
import { agentActivity } from '../src/lib/agent-activity';
import { newMessage, updateMessage } from '../src/lib/agent-session';

describe('event-driven generation motion', () => {
  it('distinguishes preparing a clarification from actually waiting for the person', () => {
    const message = newMessage('assistant', '');
    message.tools.push({ id: 'ask', name: 'ask_user', label: 'Clarify', status: 'running' });
    expect(agentActivity(message).phase).toBe('clarifying');
    expect(
      agentActivity(
        updateMessage(message, { type: 'question', question: { question: 'Which date?', options: [] } }),
      ).phase,
    ).toBe('waiting');
  });
  it('does not invent progress while waiting, and follows actual tool activity', () => {
    let m = newMessage('assistant', '');
    expect(agentActivity(m).phase).toBe('opening');
    m = updateMessage(m, {
      type: 'tool_start',
      tool: { id: 'read', name: 'read_reference', label: 'Read', status: 'running' },
    });
    expect(agentActivity(m).phase).toBe('reading');
    m = updateMessage(m, { type: 'tool_end', id: 'read', status: 'error', detail: 'Unavailable' });
    expect(agentActivity(m).phase).toBe('revisiting');
    m = updateMessage(m, {
      type: 'tool_start',
      tool: { id: 'report', name: 'write_report', label: 'Write', status: 'running' },
    });
    expect(agentActivity(m).phase).toBe('composing');
    m = updateMessage(m, { type: 'tool_end', id: 'report', status: 'complete', detail: 'Saved' });
    expect(agentActivity(m).phase).toBe('continuing');
    m = updateMessage(m, { type: 'delta', text: 'Here is the response.' });
    expect(agentActivity(m).phase).toBe('responding');
  });
  it('never celebrates unfinished or cancelled turns, even when an artifact or question exists', () => {
    const m = newMessage('assistant', 'Partial result');
    m.question = { question: 'Which time?', options: [] };
    expect(agentActivity(m).phase).toBe('waiting');
    for (const status of ['error', 'limited', 'stopped'] as const) {
      expect(agentActivity({ ...m, status }).phase).toBe('interrupted');
    }
    expect(agentActivity({ ...m, question: undefined, status: 'complete' }).phase).toBe('settled');
    expect(agentActivity({ ...m, question: undefined, status: 'running' }).phase).toBe('responding');
  });
  it('distinguishes calculation and draws without deriving any symbols from animation', () => {
    for (const [name, phase] of [
      ['calculate_bazi', 'calculating'],
      ['calculate_ziwei', 'calculating'],
      ['draw_tarot', 'drawing'],
      ['cast_iching', 'drawing'],
    ]) {
      const m = newMessage('assistant', '');
      m.tools.push({ id: name, name, status: 'running', label: name });
      expect(agentActivity(m)).toEqual({ phase, instrument: name });
      expect(m.artifacts).toEqual([]);
    }
  });
});
