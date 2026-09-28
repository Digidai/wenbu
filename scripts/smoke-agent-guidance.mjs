import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

// Opt-in live model check: two real turns, synthetic context only, marked as test traffic.
const base = process.env.WENBU_URL || 'https://wenbu.genedai.me';
const evidence = { base, checkedAt: new Date().toISOString(), synthetic: true, turns: [] };
async function turn(message, history = []) {
  const response = await fetch(base + '/api/v1/agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: base, 'X-Wenbu-Test': 'true' },
    body: JSON.stringify({ message, history, locale: 'zh', mode: 'explore', consent: true }),
    signal: AbortSignal.timeout(150000),
  });
  assert.equal(response.status, 200);
  const body = await response.text();
  const events = body.split(/\r?\n\r?\n/).flatMap((block) => {
    const data = block
      .split(/\r?\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
      .join('\n');
    return data && data !== '[DONE]' ? [JSON.parse(data)] : [];
  });
  evidence.turns.push({ message, events });
  assert(!events.some((event) => event.type === 'error'), 'Agent returned an error');
  return events;
}
try {
  const opening =
    '这是虚构的交互测试情境。我想聊工作与选择，希望比较继续现在的工作和接受一个新机会，还没想清自己最在意什么。先通过对话帮我梳理，暂不抽牌、起卦或排盘。信息不够时一次问一个关键问题，给几个可选回答。';
  const first = await turn(opening);
  const question = first.find((event) => event.type === 'question')?.question;
  assert(question, 'An ambiguous opening should offer a focused clarification');
  assert(question.options.length >= 2 && question.options.length <= 4);
  assert(first.some((event) => event.type === 'done' && event.status === 'waiting'));
  assert(!first.some((event) => event.type === 'artifact' && event.artifact.type === 'chart'));
  const reply = question.options[0] + '。请用假设案例示范梳理的方法，不需要继续收集我的个人资料。';
  const second = await turn(reply, [
    { role: 'user', content: opening },
    { role: 'assistant', content: question.question },
  ]);
  assert(
    !second.some((event) => event.type === 'question'),
    'An illustrative example should not trigger another intake',
  );
  assert(second.some((event) => event.type === 'done' && event.status === 'complete'));
  assert(
    second
      .filter((event) => event.type === 'delta')
      .map((event) => event.text)
      .join('').length > 30,
  );
  assert(!second.some((event) => event.type === 'artifact' && event.artifact.type === 'chart'));
  evidence.result = 'passed';
} catch (error) {
  evidence.result = 'failed';
  evidence.error = String(error);
  process.exitCode = 1;
} finally {
  const path = process.env.WENBU_EVIDENCE || 'docs/reviews/agent-guidance-live.json';
  await writeFile(path, JSON.stringify(evidence, null, 2) + '\n');
  console.log(
    JSON.stringify({
      base,
      result: evidence.result,
      turns: evidence.turns.length,
      evidence: path,
      error: evidence.error,
    }),
  );
}
