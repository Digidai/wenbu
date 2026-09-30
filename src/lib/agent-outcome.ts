import type { AgentMessage, ReportArtifact, ToolTrace } from './agent-protocol';
import type { Locale } from './schema';

export function isCitationIssue(tool: ToolTrace) {
  return (
    tool.issue === 'citation_unread' ||
    tool.detail?.startsWith('A citation was not read or verified.') === true
  );
}

// Keep the original failure in history. Only a saved artifact and a completed
// replacement tool can establish recovery; a reassuring model sentence cannot.
export function hasLaterReport(message: AgentMessage, toolId: string): boolean {
  const start = message.tools.findIndex((tool) => tool.id === toolId);
  const tool = message.tools[start];
  if (
    !tool ||
    tool.name !== 'write_report' ||
    tool.status !== 'error' ||
    !(isCitationIssue(tool) || tool.issue === 'report_invalid')
  )
    return false;
  if (tool.recovery) {
    const recovery = tool.recovery;
    return (
      message.tools
        .slice(start + 1)
        .some(
          (later) =>
            later.id === recovery.toolId &&
            later.name === 'write_report' &&
            later.status === 'complete' &&
            later.artifactId === recovery.artifactId,
        ) &&
      message.artifacts.some((artifact) => artifact.type === 'report' && artifact.id === recovery.artifactId)
    );
  }
  // Older local sessions have no explicit linkage. Infer only the unambiguous
  // single-report sequence, including library reads as well as external reads.
  if (
    tool.issue ||
    message.status !== 'complete' ||
    message.artifacts.filter((a) => a.type === 'report').length !== 1
  )
    return false;
  const reports = message.tools.filter((t) => t.name === 'write_report');
  if (reports.length !== 2 || reports[0] !== tool || reports[1].status !== 'complete') return false;
  const end = message.tools.indexOf(reports[1]);
  return message.tools
    .slice(start + 1, end)
    .some((t) => ['read_library', 'read_reference'].includes(t.name) && t.status === 'complete');
}

export function traceOutcomes(message: AgentMessage) {
  const tools = message.tools.filter((tool) => tool.name !== 'update_plan');
  const recovered = tools.filter((tool) => hasLaterReport(message, tool.id)).length;
  return {
    recovered,
    failed: tools.filter((tool) => tool.status === 'error').length - recovered,
    stopped: tools.filter((tool) => tool.status === 'stopped').length,
  };
}

export function toolDetail(tool: ToolTrace, locale: Locale) {
  if (tool.issue === 'report_invalid')
    return locale === 'zh'
      ? '这一稿的格式或篇幅不符合要求，因此未保存。需要调整后重新核对。'
      : 'This draft was not saved because its structure or length did not meet the report requirements. It needs revision and another check.';
  if (isCitationIssue(tool))
    return locale === 'zh'
      ? '这一稿引用了尚未读取或核验的资料，因此未保存。引用需要与实际读取的内容对应。'
      : 'This draft was not saved because it cited an unread or unverified source. Citations must match evidence actually read.';
  return tool.detail ?? (locale === 'zh' ? '请求正在处理中。' : 'The request is in progress.');
}

export function reportConclusion(
  text: string,
  report: Pick<ReportArtifact, 'title' | 'summary'>,
  locale: Locale,
) {
  // Correct only recognizably empty closing scaffolds, using the saved summary.
  // This runs after transport validation; it cannot turn a broken stream into success.
  const ending =
    text
      .trim()
      .split('\n')
      .at(-1)
      ?.replace(/^[#*\s]+|[*\s]+$/g, '') ?? '';
  const emptyHeading =
    /^(?:三点提要|(?:以下是)?(?:三点)?(?:提要|要点|总结|小结)|(?:three(?: key)? points|key takeaways|summary|in brief))\s*[:：]$/i.test(
      ending,
    );
  if (text.trim() && !emptyHeading) return text;
  return locale === 'zh'
    ? `《${report.title}》已整理好，可在结果面板查看。\n\n${report.summary}`
    : `“${report.title}” is ready in the results panel.\n\n${report.summary}`;
}
