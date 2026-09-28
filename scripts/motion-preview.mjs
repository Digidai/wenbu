// Local-only, scripted SSE playback for visual QA. No model, credentials or production API.
// Build first; then: node scripts/motion-preview.mjs. Use report/bazi/iching/tarot/ziwei/wait/error in a prompt.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
const root = resolve('dist');
const fixturePath = resolve('docs/reviews/motion-chart-fixtures.json');
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
};
createServer(async (req, res) => {
  try {
    const path = new URL(req.url, 'http://127.0.0.1:8790').pathname;
    if (path === '/api/v1/agent' && req.method === 'POST') {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
        if (body.length > 98304) {
          res.writeHead(413).end();
          return;
        }
      }
      const input = JSON.parse(body);
      const prompt = input.message.toLowerCase();
      let closed = false;
      res.on('close', () => {
        closed = true;
      });
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-store',
        'X-Wenbu-Test': 'scripted-motion-preview',
      });
      const emit = (e) => {
        if (!closed) res.write(`data: ${JSON.stringify(e)}\n\n`);
      };
      const tick = async (ms = 700) => {
        await delay(ms);
        return !closed;
      };
      const zh = input.locale !== 'en';
      const kind = ['bazi', 'iching', 'tarot', 'ziwei'].find((k) => prompt.includes(k));
      const tool = kind
        ? { bazi: 'calculate_bazi', iching: 'cast_iching', tarot: 'draw_tarot', ziwei: 'calculate_ziwei' }[
            kind
          ]
        : 'read_library';
      emit({ type: 'start', runId: 'motion-preview', remaining: 12 });
      if (!(await tick(1000))) return;
      emit({
        type: 'tool_start',
        tool: {
          id: 'preview-read',
          name: tool,
          status: 'running',
          label: zh ? (kind ? '原始结构计算 · 演示' : '读取资料 · 演示') : 'Tool activity · preview',
        },
      });
      if (!(await tick(2000))) return;
      if (prompt.includes('error')) {
        emit({
          type: 'tool_end',
          id: 'preview-read',
          status: 'error',
          detail: 'Scripted source failure for visual QA.',
        });
        if (!(await tick())) return;
        emit({
          type: 'error',
          code: 'preview_failure',
          message: zh
            ? '受控演示：来源未能读取，未生成结果。'
            : 'Scripted preview: the source failed; no result was generated.',
        });
        res.end();
        return;
      }
      emit({
        type: 'tool_end',
        id: 'preview-read',
        status: 'complete',
        detail: 'Scripted preview step completed.',
      });
      if (prompt.includes('wait')) {
        emit({
          type: 'question',
          question: {
            question: zh ? '这次想保留哪一种换日约定？' : 'Which day boundary would you like to use?',
            options: [],
            form: 'birth',
          },
        });
        emit({
          type: 'done',
          status: 'waiting',
          servedModel: 'scripted-preview',
          requestedModel: 'none',
          modelCalls: 0,
          toolCalls: 1,
        });
        res.end();
        return;
      }
      const source = {
        id: 'guide-bazi-basics',
        title: zh ? '受控演示资料' : 'Scripted source',
        url: 'https://wenbu.genedai.me/learn/bazi-basics/',
        kind: 'guide',
        level: 'preview',
        excerpt: 'This is synthetic visual QA data, not an actual model response.',
        readAt: new Date().toISOString(),
      };
      if (!kind) {
        emit({ type: 'source', source });
        if (!(await tick())) return;
        emit({
          type: 'tool_start',
          tool: {
            id: 'preview-write',
            name: 'write_report',
            status: 'running',
            label: zh ? '整理研究报告 · 演示' : 'Writing a report · preview',
          },
        });
        if (!(await tick(2000))) return;
      }
      const artifact = kind
        ? {
            ...JSON.parse(await readFile(fixturePath, 'utf8'))[kind],
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
          }
        : {
            type: 'report',
            id: crypto.randomUUID(),
            title: zh ? '动效验收：让每一步有迹可循' : 'Motion review: a traceable process',
            createdAt: new Date().toISOString(),
            summary: zh
              ? '这是本地受控回放，用来观察资料查阅、报告生成与结果到达的节奏，不调用真实模型。'
              : 'A local scripted replay of source reading, report preparation and arrival. No model is called.',
            sections: [
              {
                heading: zh ? '先读资料，再落笔' : 'Read, then write',
                body: zh
                  ? '阶段由实际接收的事件切换。资料未返回时，界面不会自行宣布完成，也不会编造进度百分比。'
                  : 'Received events drive each stage. The interface does not invent a completion percentage.',
                sourceIds: [source.id],
              },
              {
                heading: zh ? '结果到达，即可阅读' : 'Ready to read on arrival',
                body: zh
                  ? '文字保持清晰可读，朱印与章节的细微位移带来收束感。动效不延迟结果，不代替计算。'
                  : 'The text remains readable while a small seal and section movement mark its arrival.',
                sourceIds: [source.id],
              },
            ],
            questions: [],
            ...(prompt.includes('legacy')
              ? {}
              : {
                  visual: {
                    type: prompt.includes('steps') ? 'steps' : 'comparison',
                    title: zh ? '同一个时刻，两种换日约定' : 'One moment, two day boundaries',
                    items: prompt.includes('steps')
                      ? [
                          {
                            label: zh ? '确认出生资料' : 'Confirm the input',
                            detail: zh
                              ? '先记录日期、时刻与时区，未知项保留为空。'
                              : 'Record date, time and timezone; leave unknown details empty.',
                            sourceIds: [source.id],
                          },
                          {
                            label: zh ? '选择换日约定' : 'Choose a boundary',
                            detail: zh
                              ? '注明使用零点还是子初换日，再比较命盘。'
                              : 'State midnight or early Zi before comparing charts.',
                            sourceIds: [source.id],
                          },
                          {
                            label: zh ? '保留计算出处' : 'Keep the source',
                            detail: zh
                              ? '将输入、结构与依据一起保存，方便复核。'
                              : 'Keep the input, structure and source together.',
                            sourceIds: [source.id],
                          },
                        ]
                      : [
                          {
                            label: zh ? '零点换日' : 'At midnight',
                            detail: zh
                              ? '23:00–24:00，日柱仍保留在当日。'
                              : 'Between 23:00 and midnight, keep the current day pillar.',
                            sourceIds: [source.id],
                          },
                          {
                            label: zh ? '子初换日' : 'At early Zi',
                            detail: zh
                              ? '23:00 起，日柱进入次日。'
                              : 'From 23:00, use the following day pillar.',
                            sourceIds: [source.id],
                          },
                        ],
                    note: zh
                      ? '这是合成的界面验收数据；图解与文字都不是模型输出。'
                      : 'Synthetic UI fixture. The diagram and text are not model output.',
                  },
                }),
          };
      emit({ type: 'artifact', artifact });
      if (!kind)
        emit({ type: 'tool_end', id: 'preview-write', status: 'complete', detail: 'Scripted report saved.' });
      const answer = zh
        ? '这份结果已整理好，可以在右侧查看。\n\n这是本地受控动效回放，内容仅用于界面验收。'
        : 'The result is ready to view.\n\nThis is a local scripted motion preview, not a model response.';
      for (const text of answer.match(/.{1,5}|\n/g)) {
        if (!(await tick(120))) return;
        emit({ type: 'delta', text });
      }
      emit({
        type: 'done',
        status: 'complete',
        servedModel: 'scripted-preview',
        requestedModel: 'none',
        modelCalls: 0,
        toolCalls: kind ? 1 : 2,
      });
      res.end();
      return;
    }
    if (path.startsWith('/api/')) {
      res.writeHead(404).end();
      return;
    }
    let file = resolve(root, '.' + decodeURIComponent(path));
    if (!file.startsWith(root + sep) && file !== root) {
      res.writeHead(403).end();
      return;
    }
    if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
    res.writeHead(200, {
      'Content-Type': mime[extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(await readFile(file));
  } catch {
    if (!res.headersSent) res.writeHead(404);
    res.end();
  }
}).listen(8790, '127.0.0.1', () =>
  console.log('Local scripted motion QA: http://127.0.0.1:8790/agent/ (no model calls)'),
);
