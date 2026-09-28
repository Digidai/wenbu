Review this frontend motion patch read-only. Use no tools or subagents. Identify concrete defects in state truth, cancellation, reduced motion, React remounts, or animation completion. Return a concise verdict; do not claim tests ran. Animations must never delay network results, invent calculations or convert interrupted turns to success. Current Agent transport/event reducer is unchanged. CSS uses transform/opacity only for its loops, has all-animation/transition suppression under data-motion=quiet and prefers-reduced-motion, and a 900ms agent-paper-arrive animation that triggers the handler shown.


FILE: src/lib/agent-activity.ts
import type { AgentMessage } from './agent-protocol';

export type AgentPhase =
  | 'opening'
  | 'reading'
  | 'calculating'
  | 'drawing'
  | 'composing'
  | 'responding'
  | 'continuing'
  | 'revisiting'
  | 'waiting'
  | 'settled'
  | 'interrupted';

// Derived exclusively from received events. Elapsed time never advances a stage.
export function agentActivity(message: AgentMessage): { phase: AgentPhase; instrument?: string } {
  if (['error', 'limited', 'stopped'].includes(message.status)) return { phase: 'interrupted' };
  if (message.status === 'waiting' || message.question) return { phase: 'waiting' };
  if (message.status === 'complete') return { phase: 'settled' };
  const tool = [...message.tools].reverse().find((item) => item.status === 'running');
  if (tool) {
    if (['search_library', 'read_library', 'read_reference'].includes(tool.name)) return { phase: 'reading' };
    if (['calculate_bazi', 'calculate_ziwei'].includes(tool.name))
      return { phase: 'calculating', instrument: tool.name };
    if (['draw_tarot', 'cast_iching'].includes(tool.name)) return { phase: 'drawing', instrument: tool.name };
    if (tool.name === 'write_report') return { phase: 'composing' };
    if (tool.name === 'ask_user') return { phase: 'continuing' };
  }
  if (message.tools.at(-1)?.status === 'error') return { phase: 'revisiting' };
  if (message.artifacts.length || message.text) return { phase: 'responding' };
  if (message.tools.length) return { phase: 'continuing' };
  return { phase: 'opening' };
}


FILE: src/components/AgentRitual.tsx
import { useEffect, useState } from 'react';
import { agentActivity, type AgentPhase } from '../lib/agent-activity';
import type { AgentMessage } from '../lib/agent-protocol';
import type { Locale } from '../lib/schema';

const words: Record<AgentPhase, [string, string, string, string]> = {
  opening: ['问已落纸', 'A question, set in ink', '正在回应你的提问', 'Your turn is starting'],
  reading: [
    '循迹参照',
    'Following the sources',
    '正在查阅资料，保留可追溯的出处',
    'Reading material and keeping its sources',
  ],
  calculating: [
    '依序推演',
    'Finding the structure',
    '排盘工具正在计算原始结构',
    'The calculation tool is working',
  ],
  drawing: [
    '此刻成象',
    'A reading takes shape',
    '正在整理卦象或牌面的原始结果',
    'Preparing the original lines or cards for this reading',
  ],
  composing: ['落笔成章', 'Taking shape on paper', '正在整理研究报告', 'Preparing the research note'],
  responding: [
    '续写这一问',
    'Bringing it together',
    '正在补充说明，已生成的结果可随时查看',
    'Finishing the response; received results are ready to view',
  ],
  continuing: [
    '沿着线索继续',
    'Following the thread',
    '上一步已返回，等待下一步回复',
    'The last step has returned; awaiting the next response',
  ],
  revisiting: [
    '调整，再继续',
    'Considering the next step',
    '上次尝试未成功，正在继续处理',
    'The last attempt failed; the turn is still active',
  ],
  waiting: [
    '留一处，待你补充',
    'A detail from you',
    '补充下面的信息，再继续这一问',
    'Add the requested detail to continue',
  ],
  settled: [
    '这一问，已留成记录',
    'A note to return to',
    '本回合已结束，过程与结果均保留',
    'This turn has ended; its activity and results are retained',
  ],
  interrupted: [
    '暂歇于此',
    'Pausing here',
    '本回合未完成，已收到的内容仍保留',
    'This turn is unfinished; received content is retained',
  ],
};

export function useAgentMotion() {
  const [paused, setPaused] = useState(false);
  const [systemReduced, setSystemReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setSystemReduced(media.matches);
    update();
    try {
      setPaused(localStorage.getItem('wenbu.agent.motion') === 'paused');
    } catch {
      /* Optional preference. */
    }
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  function toggle() {
    const next = !paused;
    setPaused(next);
    try {
      localStorage.setItem('wenbu.agent.motion', next ? 'paused' : 'on');
    } catch {
      /* Works for this visit. */
    }
  }
  return { reduced: paused || systemReduced, systemReduced, toggle };
}

function RitualMark({ phase, instrument }: { phase: AgentPhase; instrument?: string }) {
  const resting = ['waiting', 'settled', 'interrupted'].includes(phase);
  return (
    <svg className="agent-ritual-mark" viewBox="0 0 96 96" fill="none" aria-hidden="true" focusable="false">
      <circle className="ritual-orbit-line" cx="48" cy="48" r="40" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <path key={angle} d="M48 5v5" transform={`rotate(${angle} 48 48)`} className="ritual-tick" />
      ))}
      {!resting && (
        <g className="ritual-traveller">
          <circle cx="48" cy="8" r="2.1" />
          <path d="M48 8a40 40 0 0 1 20 5.36" />
        </g>
      )}
      <g className="ritual-symbol" key={`${phase}:${instrument ?? ''}`}>
        {phase === 'reading' ? (
          <g className="ritual-pages">
            <path d="M25 32l19-3 6 32-19 3z" />
            <path d="M37 27l22 1-1 36-22-1z" />
            <g className="ritual-page-front">
              <path d="M48 28l23 6-9 34-23-6z" />
              <path d="M52 39l12 3m-14 4 12 3m-14 4 8 2" />
            </g>
          </g>
        ) : phase === 'calculating' ? (
          <g className="ritual-pillars">
            {[27, 39, 51, 63].map((x, i) => (
              <g key={x} className={`ritual-pillar ritual-pillar-${i}`}>
                <path d={`M${x} 28v39`} />
                <path d={`M${x - 3} 36h6m-6 20h6`} />
              </g>
            ))}
          </g>
        ) : phase === 'drawing' ? (
          instrument === 'draw_tarot' ? (
            <g className="ritual-cards">
              <rect x="29" y="30" width="23" height="34" rx="1" transform="rotate(-12 40 47)" />
              <rect x="43" y="28" width="23" height="34" rx="1" transform="rotate(12 54 45)" />
              <path d="M54 37v16m-6-8h12" />
            </g>
          ) : (
            <g className="ritual-coins">
              <circle cx="35" cy="46" r="11" />
              <circle cx="60" cy="47" r="11" />
              <path d="M32 43h6v6h-6zm25 1h6v6h-6z" />
            </g>
          )
        ) : ['composing', 'responding'].includes(phase) ? (
          <g className="ritual-writing">
            <path d="M30 27h28l8 8v34H30zM58 27v10h8" />
            <path className="ritual-ink-line" d="M38 45h19m-19 8h19m-19 8h12" />
            <path className="ritual-pen" d="M68 24L47 50l-6 3 2-7 21-26z" />
          </g>
        ) : (
          <g className="ritual-impression">
            <rect x="31" y="31" width="34" height="34" />
            <rect x="34" y="34" width="28" height="28" />
            <text x="48" y="54" textAnchor="middle">
              {phase === 'settled' ? '录' : phase === 'interrupted' ? '止' : '问'}
            </text>
          </g>
        )}
      </g>
    </svg>
  );
}

export default function AgentRitual({ message, locale }: { message: AgentMessage; locale: Locale }) {
  const { phase, instrument } = agentActivity(message);
  const zh = locale === 'zh';
  const active = !['waiting', 'settled', 'interrupted'].includes(phase);
  const [titleZh, titleEn, detailZh, detailEn] = words[phase];
  return (
    <div className="agent-ritual" data-phase={phase} data-active={active}>
      <RitualMark phase={phase} instrument={instrument} />
      <div className="agent-ritual-copy">
        <div className="agent-ritual-label">
          <span />
          {zh ? '问卜 · 此刻' : 'WENBU · THIS MOMENT'}
        </div>
        <p className="agent-ritual-title" role="status" aria-live="polite" aria-atomic="true">
          {zh ? titleZh : titleEn}
        </p>
        <p className="agent-ritual-detail">{zh ? detailZh : detailEn}</p>
        {(message.sources.length > 0 || message.artifacts.length > 0) && (
          <div className="agent-ritual-facts">
            {message.sources.length > 0 && (
              <span key={`sources-${message.sources.length}`}>
                {zh ? `已读 ${message.sources.length} 份资料` : `${message.sources.length} sources read`}
              </span>
            )}
            {message.artifacts.length > 0 && (
              <span key={`results-${message.artifacts.length}`}>
                {zh
                  ? `已生成 ${message.artifacts.length} 份结果`
                  : `${message.artifacts.length} results received`}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

diff --git a/src/components/AgentWorkspace.tsx b/src/components/AgentWorkspace.tsx
index fe5bd41..9b670a7 100644
--- a/src/components/AgentWorkspace.tsx
+++ b/src/components/AgentWorkspace.tsx
@@ -24,6 +24,8 @@ import {
   Bookmark,
   Layers,
   Feather,
+  Pause,
+  Play,
 } from 'lucide-react';
 import type { Locale } from '../lib/schema';
 import { choose, href } from '../lib/i18n';
@@ -51,8 +53,10 @@ import {
   updateMessage,
 } from '../lib/agent-session';
 import AgentMarkdown from './AgentMarkdown';
+import AgentRitual, { useAgentMotion } from './AgentRitual';
 import ReadingView from './ReadingView';
 import '../styles/agent.css';
+import '../styles/agent-motion.css';

 class ChartBoundary extends Component<{ children: ReactNode; fallback: string }, { failed: boolean }> {
   state = { failed: false };
@@ -78,6 +82,9 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
   const [loaded, setLoaded] = useState(false);
   const [draft, setDraft] = useState('');
   const [busy, setBusy] = useState(false);
+  const motion = useAgentMotion();
+  const [currentTurn, setCurrentTurn] = useState<string[]>([]);
+  const [arrivingArtifacts, setArrivingArtifacts] = useState<string[]>([]);
   const [remaining, setRemaining] = useState<number>();
   const [sidebar, setSidebar] = useState(false);
   const [mobilePane, setMobilePane] = useState<'chat' | 'results'>('chat');
@@ -174,6 +181,9 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
   useEffect(() => {
     if (stickToBottom.current && scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight;
   }, [active?.messages, busy]);
+  useEffect(() => {
+    setArrivingArtifacts([]);
+  }, [motion.reduced]);
   useEffect(() => {
     if (!textarea.current) return;
     textarea.current.style.height = 'auto';
@@ -239,6 +249,8 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
   }
   function selectSession(id: string) {
     stop();
+    setCurrentTurn([]);
+    setArrivingArtifacts([]);
     setActiveId(id);
     setSelectedArtifact('');
     setDraft('');
@@ -316,6 +328,7 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
     stickToBottom.current = true;
     const user = newMessage('user', value.trim());
     const assistant = newMessage('assistant', '');
+    setCurrentTurn([user.id, assistant.id]);
     const controller = new AbortController();
     const generationId = crypto.randomUUID();
     pending.current = { controller, sessionId: session.id, messageId: assistant.id, generationId };
@@ -381,6 +394,7 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
           if (event.type === 'artifact') {
             setSelectedArtifact(event.artifact.id);
             setPanel('results');
+            setArrivingArtifacts((ids) => [...ids, event.artifact.id].slice(-12));
           }
           patchMessage(session.id, assistant.id, (m) => updateMessage(m, event));
         },
@@ -472,7 +486,10 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
     },
   ];
   return (
-    <div className={`agent-workspace ${sidebar ? 'sidebar-open' : ''} mobile-${mobilePane}`}>
+    <div
+      className={`agent-workspace ${sidebar ? 'sidebar-open' : ''} mobile-${mobilePane}`}
+      data-motion={motion.reduced ? 'quiet' : 'on'}
+    >
       {sidebar && (
         <button
           className="agent-sidebar-backdrop"
@@ -583,6 +600,30 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
             <span className="agent-beta">{t('研习室', 'STUDIO')}</span>
           </div>
           <div className="agent-toolbar-actions">
+            <button
+              className="agent-motion-toggle"
+              aria-label={
+                motion.systemReduced
+                  ? t('系统已开启减少动效', 'Reduced motion is enabled by your system')
+                  : motion.reduced
+                    ? t('开启动效', 'Enable motion')
+                    : t('暂停动效', 'Pause motion')
+              }
+              title={
+                motion.systemReduced
+                  ? t('遵循系统的减少动态效果设置', 'Following your system motion preference')
+                  : t('仅切换动效，不影响生成', 'Change motion without interrupting the response')
+              }
+              aria-pressed={!motion.reduced}
+              disabled={motion.systemReduced}
+              onClick={() => {
+                setArrivingArtifacts([]);
+                motion.toggle();
+              }}
+            >
+              {motion.reduced ? <Play size={12} /> : <Pause size={12} />}
+              <span>{t('动效', 'Motion')}</span>
+            </button>
             <button
               className="agent-icon-button"
               aria-label={t('导出完整会话（含已分享资料）', 'Export conversation including shared context')}
@@ -686,7 +727,10 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
             <div className="agent-message-list">
               <h1 className="sr-only">{t('命理 Agent', 'Wenbu Agent')}</h1>
               {active.messages.map((message, i) => (
-                <article key={message.id} className={`agent-message role-${message.role}`}>
+                <article
+                  key={message.id}
+                  className={`agent-message role-${message.role} ${currentTurn.includes(message.id) ? 'is-current-turn' : ''}`}
+                >
                   {message.role === 'assistant' && (
                     <div className="agent-author">
                       <span className="agent-small-seal">问</span>
@@ -698,6 +742,10 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
                       </span>
                     </div>
                   )}
+                  {message.role === 'assistant' &&
+                    (message.status === 'running' || currentTurn.includes(message.id)) && (
+                      <AgentRitual message={message} locale={locale} />
+                    )}
                   {message.plan && (
                     <details className="agent-plan" open={message.status === 'running'}>
                       <summary>
@@ -778,22 +826,23 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
                     </div>
                   )}
                   {message.text && (
-                    <div className="agent-prose">
+                    <div
+                      className={`agent-prose agent-answer ${message.status === 'running' ? 'is-streaming' : ''}`}
+                    >
                       <AgentMarkdown text={message.text} allowedUrls={sources.map((s) => s.url)} />
-                    </div>
-                  )}
-                  {message.status === 'running' && !message.text && !message.tools.length && (
-                    <div className="agent-arriving" role="status">
-                      <i />
-                      <i />
-                      <i />
-                      <span>{t('正在理解你的问题', 'Considering your question')}</span>
+                      {message.status === 'running' && (
+                        <span className="agent-writing-cursor" aria-hidden="true" />
+                      )}
                     </div>
                   )}
                   {!!message.artifacts.length && (
                     <div className="agent-artifact-links">
                       {message.artifacts.map((a) => (
-                        <button key={a.id} onClick={() => openArtifact(a.id)}>
+                        <button
+                          key={a.id}
+                          className={arrivingArtifacts.includes(a.id) ? 'is-arriving' : ''}
+                          onClick={() => openArtifact(a.id)}
+                        >
                           {a.type === 'chart' ? <Compass size={16} /> : <FileText size={16} />}
                           <span>
                             <small>
@@ -1040,88 +1089,104 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
                   <ChevronDown size={13} />
                 </label>
               )}
-              <div className="agent-artifact-heading">
-                <span className="eyebrow">
-                  {artifact.type === 'chart' ? 'CALCULATED, THEN CONSIDERED' : 'A WENBU FIELD NOTE'}
-                </span>
-                <h2>{artifact.title}</h2>
-                <p>
-                  {artifact.type === 'chart'
-                    ? t(
-                        '由排盘工具生成 · 可复核原始结构',
-                        'Generated by the calculation tools · inspect the structure',
-                      )
-                    : t('基于所读资料与本次对话整理', 'Prepared from the sources read and this conversation')}
-                </p>
-              </div>
-              {artifact.type === 'chart' ? (
-                <div className="agent-chart">
-                  <ChartBoundary
-                    key={artifact.id}
-                    fallback={t(
-                      '这份本地结果无法显示，请重新排盘。',
-                      'This saved result cannot be displayed. Calculate it again.',
-                    )}
-                  >
-                    <ReadingView key={artifact.id} result={artifact.reading} locale={locale} />
-                  </ChartBoundary>
+              <div
+                key={artifact.id}
+                className={`agent-artifact-content ${arrivingArtifacts.includes(artifact.id) ? 'is-arriving' : ''}`}
+                data-kind={artifact.type === 'chart' ? artifact.reading.kind : 'report'}
+                onAnimationEnd={(event) => {
+                  if (event.target === event.currentTarget && event.animationName === 'agent-paper-arrive')
+                    setArrivingArtifacts((ids) => ids.filter((id) => id !== artifact.id));
+                }}
+              >
+                <div className="agent-artifact-heading">
+                  <span className="agent-result-seal" aria-hidden="true">
+                    {artifact.type === 'chart' ? '象' : '录'}
+                  </span>
+                  <span className="eyebrow">
+                    {artifact.type === 'chart' ? 'CALCULATED, THEN CONSIDERED' : 'A WENBU FIELD NOTE'}
+                  </span>
+                  <h2>{artifact.title}</h2>
+                  <p>
+                    {artifact.type === 'chart'
+                      ? t(
+                          '由排盘工具生成 · 可复核原始结构',
+                          'Generated by the calculation tools · inspect the structure',
+                        )
+                      : t(
+                          '基于所读资料与本次对话整理',
+                          'Prepared from the sources read and this conversation',
+                        )}
+                  </p>
                 </div>
-              ) : (
-                <div className="agent-report">
-                  <p className="agent-report-summary">{artifact.summary}</p>
-                  {artifact.sections.map((section, i) => (
-                    <section key={i}>
-                      <span className="agent-report-number">{String(i + 1).padStart(2, '0')}</span>
-                      <h3>{section.heading}</h3>
-                      <div className="agent-prose">
-                        <AgentMarkdown text={section.body} allowedUrls={sources.map((s) => s.url)} />
-                      </div>
-                      {section.sourceIds.length > 0 && (
-                        <div className="agent-report-citations">
-                          {section.sourceIds
-                            .map((id) => sourceMap.get(id))
-                            .filter(Boolean)
-                            .map((source) => (
-                              <a
-                                key={source!.id}
-                                href={source!.url}
-                                target="_blank"
-                                rel="noopener noreferrer"
-                              >
-                                <BookOpen size={11} />
-                                {source!.title}
-                                <ArrowUpRight size={11} />
-                              </a>
-                            ))}
-                        </div>
+                {artifact.type === 'chart' ? (
+                  <div className="agent-chart">
+                    <ChartBoundary
+                      key={artifact.id}
+                      fallback={t(
+                        '这份本地结果无法显示，请重新排盘。',
+                        'This saved result cannot be displayed. Calculate it again.',
                       )}
-                    </section>
-                  ))}
-                  {artifact.questions.length > 0 && (
-                    <div className="agent-report-questions">
-                      <span className="eyebrow">{t('把问题留给下一步', 'KEEP EXPLORING')}</span>
-                      {artifact.questions.map((q) => (
-                        <button key={q} disabled={busy} onClick={() => void send(q)}>
-                          {q}
-                          <ArrowUpRight size={14} />
-                        </button>
-                      ))}
-                    </div>
+                    >
+                      <ReadingView key={artifact.id} result={artifact.reading} locale={locale} />
+                    </ChartBoundary>
+                  </div>
+                ) : (
+                  <div className="agent-report">
+                    <p className="agent-report-summary">{artifact.summary}</p>
+                    {artifact.sections.map((section, i) => (
+                      <section key={i}>
+                        <span className="agent-report-number">{String(i + 1).padStart(2, '0')}</span>
+                        <h3>{section.heading}</h3>
+                        <div className="agent-prose">
+                          <AgentMarkdown text={section.body} allowedUrls={sources.map((s) => s.url)} />
+                        </div>
+                        {section.sourceIds.length > 0 && (
+                          <div className="agent-report-citations">
+                            {section.sourceIds
+                              .map((id) => sourceMap.get(id))
+                              .filter(Boolean)
+                              .map((source) => (
+                                <a
+                                  key={source!.id}
+                                  href={source!.url}
+                                  target="_blank"
+                                  rel="noopener noreferrer"
+                                >
+                                  <BookOpen size={11} />
+                                  {source!.title}
+                                  <ArrowUpRight size={11} />
+                                </a>
+                              ))}
+                          </div>
+                        )}
+                      </section>
+                    ))}
+                    {artifact.questions.length > 0 && (
+                      <div className="agent-report-questions">
+                        <span className="eyebrow">{t('把问题留给下一步', 'KEEP EXPLORING')}</span>
+                        {artifact.questions.map((q) => (
+                          <button key={q} disabled={busy} onClick={() => void send(q)}>
+                            {q}
+                            <ArrowUpRight size={14} />
+                          </button>
+                        ))}
+                      </div>
+                    )}
+                  </div>
+                )}
+                <div className="agent-artifact-actions">
+                  <button onClick={() => downloadMarkdown(artifactMarkdown(artifact, sources))}>
+                    <Download size={14} />
+                    {t('导出', 'Export')}
+                  </button>
+                  {artifact.type === 'chart' && (
+                    <button onClick={() => saveChart(artifact)}>
+                      <Bookmark size={14} />
+                      {t('存入手记', 'Save to journal')}
+                    </button>
                   )}
+                  <span>{t('文化探索 · 保留判断', 'Cultural reflection')}</span>
                 </div>
-              )}
-              <div className="agent-artifact-actions">
-                <button onClick={() => downloadMarkdown(artifactMarkdown(artifact, sources))}>
-                  <Download size={14} />
-                  {t('导出', 'Export')}
-                </button>
-                {artifact.type === 'chart' && (
-                  <button onClick={() => saveChart(artifact)}>
-                    <Bookmark size={14} />
-                    {t('存入手记', 'Save to journal')}
-                  </button>
-                )}
-                <span>{t('文化探索 · 保留判断', 'Cultural reflection')}</span>
               </div>
             </div>
           ) : (
