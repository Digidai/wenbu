import type {
  AgentMessage,
  AgentSession,
  AgentEvent,
  AgentArtifact,
  AgentSource,
  ReadingInput,
} from './agent-protocol';
import type { Locale } from './schema';
import type { Reading } from './tools';

const KEY = 'wenbu.agent.sessions.v1';
export function newSession(locale: Locale): AgentSession {
  return {
    id: crypto.randomUUID(),
    title: locale === 'zh' ? '新的探索' : 'A new exploration',
    locale,
    updatedAt: new Date().toISOString(),
    mode: 'explore',
    messages: [],
    context: { note: '', useBirth: false, journalIds: [] },
  };
}
export function newMessage(role: 'user' | 'assistant', text: string): AgentMessage {
  return {
    id: crypto.randomUUID(),
    role,
    text,
    status: role === 'user' ? 'complete' : 'running',
    tools: [],
    artifacts: [],
    sources: [],
  };
}
export function isSafeSource(value: unknown): value is AgentSource {
  if (!value || typeof value !== 'object') return false;
  const s = value as AgentSource;
  if (
    ![s.id, s.title, s.url, s.excerpt, s.level, s.readAt].every((v) => typeof v === 'string') ||
    !['guide', 'reference', 'symbol'].includes(s.kind)
  )
    return false;
  try {
    const url = new URL(s.url);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
  } catch {
    return false;
  }
}
export function restoreSessions(): AgentSession[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (s): s is AgentSession =>
          s &&
          typeof s.id === 'string' &&
          typeof s.title === 'string' &&
          ['zh', 'en'].includes(s.locale) &&
          ['explore', 'research'].includes(s.mode) &&
          typeof s.updatedAt === 'string' &&
          Array.isArray(s.messages) &&
          s.messages.every(
            (m: AgentMessage) =>
              m &&
              ['user', 'assistant'].includes(m.role) &&
              typeof m.text === 'string' &&
              typeof m.id === 'string' &&
              Array.isArray(m.tools) &&
              Array.isArray(m.artifacts) &&
              Array.isArray(m.sources),
          ) &&
          s.context &&
          typeof s.context.note === 'string' &&
          Array.isArray(s.context.journalIds),
      )
      .map((s) => ({
        ...s,
        messages: s.messages
          .map((m) => ({ ...m, sources: m.sources.filter(isSafeSource) }))
          .map((m) =>
            m.status === 'running'
              ? {
                  ...m,
                  status: 'stopped',
                  tools: m.tools.map((t) => (t.status === 'running' ? { ...t, status: 'stopped' } : t)),
                }
              : m,
          ),
      }));
  } catch {
    return [];
  }
}
export function persistSessions(sessions: AgentSession[]) {
  const json = JSON.stringify(sessions);
  if (json.length > 3600000) throw new Error('storage_full');
  localStorage.setItem(KEY, json);
}
export function updateMessage(message: AgentMessage, event: AgentEvent): AgentMessage {
  if (event.type === 'delta') return { ...message, text: message.text + event.text };
  if (event.type === 'tool_start') return { ...message, tools: [...message.tools, event.tool] };
  if (event.type === 'tool_end')
    return {
      ...message,
      tools: message.tools.map((t) =>
        t.id === event.id ? { ...t, status: event.status, detail: event.detail } : t,
      ),
    };
  if (event.type === 'plan') return { ...message, plan: event.steps };
  if (event.type === 'source')
    return isSafeSource(event.source)
      ? {
          ...message,
          sources: [...message.sources.filter((s) => s.id !== event.source.id), event.source],
        }
      : message;
  if (event.type === 'artifact') return { ...message, artifacts: [...message.artifacts, event.artifact] };
  if (event.type === 'question')
    return {
      ...message,
      question: event.question,
      text: message.text.includes(event.question.question)
        ? message.text
        : (message.text ? message.text + '\n\n' : '') + event.question.question,
    };
  if (event.type === 'done')
    return {
      ...message,
      status: event.status,
      model: event.servedModel,
      tools: message.tools.map((t) => (t.status === 'running' ? { ...t, status: 'stopped' } : t)),
    };
  if (event.type === 'error')
    return {
      ...message,
      status: 'error',
      error: event.message,
      tools: message.tools.map((t) =>
        t.status === 'running' ? { ...t, status: 'error', detail: event.message } : t,
      ),
    };
  return message;
}
export function readingReference(result: Reading): ReadingInput {
  return {
    kind: result.kind,
    input:
      result.kind === 'tarot'
        ? { cards: result.cards.map((c) => ({ id: c.id, reversed: c.reversed })) }
        : result.kind === 'iching'
          ? { lines: result.lines }
          : result.input,
  };
}
export function contextHistory(messages: AgentMessage[]) {
  const history = messages
    .filter((m) => m.text.trim())
    .slice(-16)
    .map((m) => ({ role: m.role, content: m.text.slice(0, 7000) }));
  while (history.reduce((n, m) => n + m.content.length, 0) > 28000) history.shift();
  return history;
}
export function sessionArtifacts(session: AgentSession): AgentArtifact[] {
  return session.messages.flatMap((m) => m.artifacts);
}
export function artifactMarkdown(
  artifact: AgentArtifact,
  sources: { id: string; title: string; url: string }[],
) {
  if (artifact.type === 'chart')
    return `# ${artifact.title}\n\n\`\`\`json\n${JSON.stringify(artifact.reading, null, 2)}\n\`\`\`\n`;
  const ids = new Set(artifact.sections.flatMap((s) => s.sourceIds));
  return (
    `# ${artifact.title}\n\n${artifact.summary}\n\n` +
    artifact.sections.map((s) => `## ${s.heading}\n\n${s.body}`).join('\n\n') +
    (artifact.questions.length
      ? '\n\n## ' + 'Questions / 继续思考\n\n' + artifact.questions.map((q) => '- ' + q).join('\n')
      : '') +
    '\n\n## Sources / 参考资料\n\n' +
    sources
      .filter((s) => ids.has(s.id))
      .map((s) => `- [${s.title}](${s.url})`)
      .join('\n') +
    '\n\nGenerated with DeepSeek · Wenbu · Symbolic interpretation, not established prediction.\n'
  );
}
export function downloadMarkdown(text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wenbu-research.md';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
