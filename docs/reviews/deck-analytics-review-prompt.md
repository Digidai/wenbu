Perform a rigorous read-only engineering review of this Wenbu change. Do not modify files or invoke subagents. Focus on actionable correctness, privacy, auth, analytics data semantics, resilience, accessibility and UX defects. Never request secrets or inspect ignored credentials. Use only this supplied source snapshot. Return concrete prioritized findings with file paths and reasoning; do not invent defects. Distinguish client-reported usage from server-confirmed outcomes; this is anonymous product analytics, not billing or fraud-proof identity. Public deployment remains pending verification.

The change adds 78 pre-generated tarot artworks and a card gallery, fixes a reproduced UTC+8 / historic Shanghai DST mismatch at a solar-term boundary, improves home-page clarity and installs closed-vocabulary first-party Cloudflare D1 analytics with 90-day retention and an authenticated aggregate dashboard.

## Tracked diff
diff --git a/public/wenbu.mjs b/public/wenbu.mjs
index c54cbf4..0331688 100644
--- a/public/wenbu.mjs
+++ b/public/wenbu.mjs
@@ -38,7 +38,7 @@ try {
     throw new Error('Agent requires explicit consent:true to send this context to DeepSeek.');
   const res = await fetch(new URL('/api/v1/' + command, base), {
     method: 'POST',
-    headers: { 'Content-Type': 'application/json' },
+    headers: { 'Content-Type': 'application/json', 'X-Wenbu-Client': 'cli' },
     body: JSON.stringify(input),
     signal: AbortSignal.timeout(command === 'agent' ? 130000 : 15000),
   });
diff --git a/src/components/AgentReport.tsx b/src/components/AgentReport.tsx
index 152a7d8..b877f9e 100644
--- a/src/components/AgentReport.tsx
+++ b/src/components/AgentReport.tsx
@@ -22,7 +22,7 @@ function Citations({ ids, sources, locale }: { ids: string[]; sources: AgentSour
       <BookOpen size={12} aria-hidden="true" />
       {cited.length > 0 &&
         cited.map((source) => (
-          <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer">
+          <a key={source.id} data-track="source" href={source.url} target="_blank" rel="noopener noreferrer">
             {source.title}
             <ArrowUpRight size={11} />
           </a>
diff --git a/src/components/AgentWorkspace.tsx b/src/components/AgentWorkspace.tsx
index 7050896..e05bc01 100644
--- a/src/components/AgentWorkspace.tsx
+++ b/src/components/AgentWorkspace.tsx
@@ -1,3 +1,4 @@
+import { analyticsHeaders, track } from '../lib/analytics';
 import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
 import {
   ArrowUp,
@@ -247,6 +248,7 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
   }, [sidebar]);
 
   function stop() {
+    track('agent_stopped', { tool: 'agent', status: 'cancelled' });
     const running = pending.current;
     if (!running) return;
     pending.current = null;
@@ -289,6 +291,7 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
     setDeleteId('');
   }
   function openContext(resume = false) {
+    track('context_opened', { tool: 'agent', action: 'context' });
     if (!active) return;
     setResumeAfterContext(resume);
     setContextDraft({
@@ -311,6 +314,7 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
     }));
   }
   function openArtifact(id: string) {
+    track('artifact_opened', { tool: 'agent' });
     setArrivingArtifacts([]);
     setSelectedArtifact(id);
     setPanel('results');
@@ -335,6 +339,7 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
     }
     setNotice('');
     setDraft('');
+    track('agent_started', { tool: 'agent', mode: session.mode });
     setBusy(true);
     setMobilePane('chat');
     stickToBottom.current = true;
@@ -371,7 +376,7 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
     try {
       const response = await fetch('/api/v1/agent', {
         method: 'POST',
-        headers: { 'Content-Type': 'application/json' },
+        headers: { 'Content-Type': 'application/json', ...analyticsHeaders() },
         signal: controller.signal,
         body: JSON.stringify({
           message: value.trim().slice(0, 3000),
@@ -408,7 +413,14 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
           if (!isCurrent()) return;
           const event = JSON.parse(data) as AgentEvent;
           if (event.type === 'start') setRemaining(event.remaining);
-          if (event.type === 'done' || event.type === 'error') terminal = true;
+          if (event.type === 'done' || event.type === 'error') {
+            terminal = true;
+            track('agent_received', {
+              tool: 'agent',
+              mode: session.mode,
+              status: event.type === 'done' ? event.status : 'error',
+            });
+          }
           if (event.type === 'artifact') {
             setSelectedArtifact(event.artifact.id);
             setPanel('results');
@@ -464,6 +476,7 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
         },
         ...entries.filter((e) => e.id !== id),
       ]);
+      track('journal_saved', { tool: item.reading.kind, action: 'save' });
       setNotice(t('已存入我的手记。', 'Saved to your journal.'));
     } catch {
       setStorageError(true);
@@ -1096,7 +1109,7 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
                           ? t('已读取网页片段', 'Web excerpt read')
                           : t('问卜原创资料', 'Wenbu library note')}
                       </span>
-                      <a href={source.url} target="_blank" rel="noopener noreferrer">
+                      <a data-track="source" href={source.url} target="_blank" rel="noopener noreferrer">
                         {source.title}
                         <ArrowUpRight size={14} />
                       </a>
@@ -1185,7 +1198,12 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
                   />
                 )}
                 <div className="agent-artifact-actions">
-                  <button onClick={() => downloadMarkdown(artifactMarkdown(artifact, sources))}>
+                  <button
+                    onClick={() => {
+                      downloadMarkdown(artifactMarkdown(artifact, sources));
+                      track('report_exported', { tool: 'agent', action: 'export' });
+                    }}
+                  >
                     <Download size={14} />
                     {t('导出', 'Export')}
                   </button>
diff --git a/src/components/Home.astro b/src/components/Home.astro
index 7feb437..b9c844c 100644
--- a/src/components/Home.astro
+++ b/src/components/Home.astro
@@ -17,38 +17,38 @@ const t = (zh: string, en: string) => choose(locale, zh, en);
       <h1>
         {locale === 'zh' ? (
           <>
-            知其来处，
+            把心里的问题，
             <br />
-            <em>从容向前。</em>
+            <em>看得更清楚。</em>
           </>
         ) : (
           <>
-            A little wisdom.
+            Bring your question.
             <br />
-            <em>A wider view.</em>
+            <em>Find a fresh perspective.</em>
           </>
         )}
       </h1>
       <p class="hero-description">
         {t(
-          '从八字的五行，到易经的变化。借古老的智慧，看见此刻的自己，找到下一步的从容。',
-          'Meet yourself through BaZi, I Ching and tarot. Explore an old language of change, and find a little more room to move.',
+          '免费排八字与紫微命盘、抽塔罗、问易经。也可以直接与 Agent 对话，让它调用工具、查阅资料，把结果和出处放在一起。',
+          'Calculate a birth chart, draw tarot or cast the I Ching for free. Or ask Wenbu Agent to use the tools, read references and bring the results together.',
         )}
       </p>
       <div class="hero-buttons">
-        <a class="button vermillion" href={href(locale, 'bazi')}>
-          {t('免费探索我的命盘', 'Explore my birth chart')}
+        <a class="button vermillion" data-track="hero-agent" href={href(locale, 'agent')}>
+          {t('带着问题开始对话', 'Start with your question')}
           <span aria-hidden="true">↗</span>
         </a>
-        <a class="text-link" href={href(locale, 'iching')}>
-          {t('为此刻，问一卦', 'Ask the I Ching')}
+        <a class="text-link" data-track="hero-chart" href={href(locale, 'bazi')}>
+          {t('直接免费排盘', 'Go straight to a chart')}
           <span aria-hidden="true">→</span>
         </a>
       </div>
       <div class="hero-meta">
         <span>{t('无需注册', 'NO ACCOUNT')}</span>
         <span>{t('工具免费', 'FREE TO EXPLORE')}</span>
-        <span>{t('为自己留一点时间', 'A MOMENT FOR YOU')}</span>
+        <span>{t('计算有依据', 'METHODS YOU CAN CHECK')}</span>
       </div>
     </div>
     <div class="hero-visual">
@@ -56,11 +56,13 @@ const t = (zh: string, en: string) => choose(locale, zh, en);
       <div class="visual-caption">{t('天地有序 · 万物有时', 'EVERYTHING HAS ITS SEASON')}</div>
     </div>
   </section>
-  <a class="home-agent-entry" href={href(locale, 'agent')}>
+  <a class="home-agent-entry" data-track="home-agent" href={href(locale, 'agent')}>
     <span class="home-agent-mark">问</span>
     <span>
       <small>WENBU AGENT · {t('独立研习室', 'THE RESEARCH STUDIO')}</small>
-      <strong>{t('一个问题，一段可以继续的探索。', 'One question. An exploration you can continue.')}</strong>
+      <strong>
+        {t('命盘、图解与出处，放进同一段对话。', 'Charts, visual notes and sources, in one conversation.')}
+      </strong>
     </span>
     <span class="home-agent-cta">{t('与命理 Agent 对话', 'Meet Wenbu Agent')} ↗</span>
   </a>
@@ -126,7 +128,14 @@ const t = (zh: string, en: string) => choose(locale, zh, en);
                   ))}
                 </div>
               ) : kind === 'tarot' ? (
-                <div class="mini-tarot">✦</div>
+                <img
+                  class="mini-tarot-art"
+                  src="/images/tarot/17-star.webp"
+                  width="70"
+                  height="105"
+                  alt=""
+                  loading="lazy"
+                />
               ) : (
                 <div class="mini-star">✳</div>
               )}
@@ -152,6 +161,55 @@ const t = (zh: string, en: string) => choose(locale, zh, en);
       })}
     </div>
   </section>
+  <section class="deck-editorial reveal" aria-labelledby="deck-heading">
+    <div class="deck-editorial-art" aria-hidden="true">
+      <img src="/images/tarot/02-high-priestess.webp" width="180" height="270" alt="" loading="lazy" />
+      <img src="/images/tarot/17-star.webp" width="180" height="270" alt="" loading="lazy" />
+      <img src="/images/tarot/19-sun.webp" width="180" height="270" alt="" loading="lazy" />
+    </div>
+    <div>
+      <span class="eyebrow accent">THE WENBU DECK · 78 ILLUSTRATIONS</span>
+      <h2 id="deck-heading">{t('让一个画面，打开另一种看法。', 'A picture. Another way to see.')}</h2>
+      <p>
+        {t(
+          '78 张原创 AI 插画，重新描绘传统塔罗意象。抽一张整理思绪，或用三张牌看见当下、牵引与下一步。每张牌都可以放大细看。',
+          '78 original AI illustrations reinterpret traditional tarot imagery. Draw one card for reflection, or three for the situation, tension and next step. Open any card to look closer.',
+        )}
+      </p>
+      <a class="text-link" data-track="tool-entry" href={href(locale, 'tarot')}>
+        {t('遇见此刻的一张牌', 'Meet a card for this moment')} →
+      </a>
+    </div>
+  </section>
+  <div class="home-proof-row">
+    <a href={href(locale, 'methodology')}>
+      <strong>{t('计算与解释分开', 'Calculations come first')}</strong>
+      <span>
+        {t(
+          '四柱、星盘与抽牌由工具产生；解释标明依据与边界。',
+          'Tools produce the chart or draw. Interpretations state their scope.',
+        )}
+      </span>
+    </a>
+    <a href={href(locale, 'free')}>
+      <strong>{t('免费额度公开', 'Clear free allowances')}</strong>
+      <span>
+        {t(
+          '无需注册。AI 解读每天 5 次，Agent 每天 12 回合，按网络计数。',
+          'No account. Five AI readings and 12 Agent turns per network each day.',
+        )}
+      </span>
+    </a>
+    <a href={href(locale, 'privacy')}>
+      <strong>{t('资料由你选择', 'You choose the context')}</strong>
+      <span>
+        {t(
+          '会话与手记留在本机；发送前可查看会分享什么。',
+          'Conversations and journals stay in this browser. You choose what to share.',
+        )}
+      </span>
+    </a>
+  </div>
   <section class="manifesto reveal">
     <div>
       <span class="eyebrow accent">A MIRROR, NOT A VERDICT</span>
diff --git a/src/components/ReadingView.tsx b/src/components/ReadingView.tsx
index 3fc7ce7..dd940d1 100644
--- a/src/components/ReadingView.tsx
+++ b/src/components/ReadingView.tsx
@@ -1,4 +1,5 @@
 import { useState } from 'react';
+import TarotCard from './TarotCard';
 import type { Reading } from '../lib/tools';
 import type { Locale } from '../lib/schema';
 import { choose } from '../lib/i18n';
@@ -200,18 +201,7 @@ export default function ReadingView({ result, locale }: { result: Reading; local
                   result.cards.length === 1 ? 'REFLECTION' : ['SITUATION', 'TENSION', 'NEXT STEP'][i],
                 )}
               </span>
-              <div
-                className={`tarot-face ${card.reversed ? 'reversed' : ''}`}
-                style={{ '--card-color': card.color } as React.CSSProperties}
-              >
-                <span className="card-index">{String(card.number).padStart(2, '0')}</span>
-                <div className="tarot-art">
-                  <i />
-                  <span>{card.symbol}</span>
-                  <i />
-                </div>
-                <span className="card-bottom">WENBU · {card.arcana.toUpperCase()}</span>
-              </div>
+              <TarotCard card={card} locale={locale} />
               <h3>{t(card.zh, card.en)}</h3>
               <span className="card-orientation">
                 {t(card.reversed ? '逆位' : '正位', card.reversed ? 'Reversed' : 'Upright')}
diff --git a/src/components/ToolDesk.tsx b/src/components/ToolDesk.tsx
index b8421bd..3d33e4e 100644
--- a/src/components/ToolDesk.tsx
+++ b/src/components/ToolDesk.tsx
@@ -15,11 +15,12 @@ import type { Reading } from '../lib/tools';
 import { choose, href } from '../lib/i18n';
 import { agentContext, downloadJson, readJournal, writeJournal, type Answer } from '../lib/journal';
 import ReadingView from './ReadingView';
+import { analyticsHeaders, track } from '../lib/analytics';
 
 async function post<T>(path: string, input: unknown, signal?: AbortSignal): Promise<T> {
   const response = await fetch(path, {
     method: 'POST',
-    headers: { 'Content-Type': 'application/json' },
+    headers: { 'Content-Type': 'application/json', ...analyticsHeaders() },
     body: JSON.stringify(input),
     signal,
   });
@@ -95,6 +96,7 @@ export default function ToolDesk({ kind, locale }: { kind: ToolKind; locale: Loc
   async function run(demo = false) {
     if (lock.current) return;
     lock.current = true;
+    track('tool_started', { tool: kind, action: demo ? 'example' : 'calculate' });
     setBusy(true);
     setError('');
     setAiError('');
@@ -133,6 +135,7 @@ export default function ToolDesk({ kind, locale }: { kind: ToolKind; locale: Loc
     try {
       const data = await post<Reading>(`/api/v1/${kind}`, payload);
       setResult(data);
+      track('result_viewed', { tool: kind });
       entryId.current = crypto.randomUUID();
       setSelected([]);
       requestAnimationFrame(() =>
@@ -142,6 +145,7 @@ export default function ToolDesk({ kind, locale }: { kind: ToolKind; locale: Loc
         }),
       );
     } catch (e) {
+      track('client_error', { tool: kind, status: 'error' });
       setError(
         e instanceof Error ? e.message : t('连接失败，请重试。', 'Connection failed. Please try again.'),
       );
@@ -159,6 +163,7 @@ export default function ToolDesk({ kind, locale }: { kind: ToolKind; locale: Loc
   }
   async function ask() {
     if (!result || aiBusy || !consent || question.trim().length < 2) return;
+    track('ai_requested', { tool: kind });
     setAiBusy(true);
     setAiError('');
     const controller = new AbortController();
@@ -177,6 +182,7 @@ export default function ToolDesk({ kind, locale }: { kind: ToolKind; locale: Loc
       );
       if (controller.signal.aborted) return;
       setAnswer(data.answer);
+      track('ai_result_viewed', { tool: kind });
       setRemaining(data.remaining);
       setProvenance(data.provenance.servedModel);
       setSaved(false);
@@ -208,6 +214,7 @@ export default function ToolDesk({ kind, locale }: { kind: ToolKind; locale: Loc
         ...entries.filter((e) => e.id !== id),
       ]);
       setSaved(true);
+      track('journal_saved', { tool: kind, action: 'save' });
     } catch {
       setAiError(
         t('浏览器无法保存，请使用导出备份。', 'Browser storage is unavailable. Please export a backup.'),
@@ -452,10 +459,13 @@ export default function ToolDesk({ kind, locale }: { kind: ToolKind; locale: Loc
                     {busy
                       ? t('正在展开牌面…', 'Revealing your cards…')
                       : t(
-                          `选 ${count} 张牌 · 已选 ${selected.length} 张`,
+                          `从完整 78 张中抽 ${count} 张 · 已选 ${selected.length} 张`,
                           `Choose ${count} · ${selected.length} selected`,
                         )}
                   </p>
+                  <a className="deck-gallery-link" href={href(locale, 'tarot/deck')}>
+                    {t('翻阅 78 张牌图鉴', 'Browse all 78 cards')} ↗
+                  </a>
                   <button type="submit" className="button primary full" disabled={busy}>
                     {t('为我抽牌', 'Draw for me')}
                     <ArrowRight size={18} />
diff --git a/src/data/pages.ts b/src/data/pages.ts
index 3428118..e3930ad 100644
--- a/src/data/pages.ts
+++ b/src/data/pages.ts
@@ -118,7 +118,7 @@ export const pages: Record<string, Page> = {
         {
           heading: 'BaZi: explicit time conventions',
           paragraphs: [
-            'The engine is lunar-typescript 1.8.6. Input is a Gregorian date from 1901–2099, local time, and IANA zone or explicit offset. Year/month pillars follow solar terms at the absolute instant expressed in Beijing time; day/hour pillars follow the selected local clock.',
+            'The engine is lunar-typescript 1.8.6. Input is a Gregorian date from 1901–2099, local time, and IANA zone or explicit offset. Year/month pillars follow solar terms at the absolute instant expressed in fixed UTC+08:00 standard time; day/hour pillars follow the selected local clock.',
             'The default is midnight (sect=2), with a 23:00 Zi option (sect=1). Under the default late-Zi convention, the library advances the hour stem. Optional solar correction uses longitude and a low-order equation-of-time approximation, not a precision ephemeris. Unknown time omits the hour pillar and flags provisional noon-based year/month results.',
             'The element chart counts each visible stem and branch once. It does not weight hidden stems, season or favorable elements.',
           ],
@@ -173,6 +173,14 @@ export const pages: Record<string, Page> = {
             '你可以逐条移除手记、在当前页面撤销，或导出 JSON 备份。Agent 上下文导出可预览，原始出生信息需额外勾选；即使不包含出生日期，命盘和问题仍可能属于个人信息。',
           ],
         },
+        {
+          heading: '匿名使用统计，可随时关闭',
+          paragraphs: [
+            '为了了解哪些页面和功能真正有用，我们通过本站接口向 Cloudflare D1 发送页面路径、来源类别、预先定义的推广活动、语言、国家级区域、设备与浏览器类别、功能事件、成功状态和耗时。不会发送出生日期、问题、聊天、命盘内容、笔记、原始 IP、完整来源网址或网址参数。',
+            '浏览器保存一个 30 天到期的随机访客标识和 30 分钟无活动后重置的会话标识。这些是浏览器访问估计，不等于真实人数。事件保留 90 天，后台只向持有管理凭据的人提供汇总统计。',
+            '下方可以关闭本浏览器的统计；同时尊重 Do Not Track 和 Global Privacy Control。关闭后不再发送后续统计，不影响排盘或对话；已接收记录按保留期限移除。必要的额度与限速仍会运行。',
+          ],
+        },
         {
           heading: '免费额度与基础设施',
           paragraphs: [
@@ -209,6 +217,14 @@ export const pages: Record<string, Page> = {
             'You can remove individual entries, undo a removal on the current page and export JSON backups. Agent exports can be previewed and omit original birth details unless selected. A chart or personal question may still be sensitive even without a birth date.',
           ],
         },
+        {
+          heading: 'Optional anonymous usage measurement',
+          paragraphs: [
+            'Our first-party endpoint records page paths, source categories, registered campaigns, language, country-level region, device/browser categories, feature events, outcomes and durations in Cloudflare D1. It excludes birth details, questions, chat, chart contents, notes, raw IPs, full referrer URLs and URL query parameters.',
+            'A random browser identifier expires after 30 days; a session resets after 30 minutes of inactivity. These estimate browser visits, not individual people. Events are retained for 90 days. Aggregate reports require administrator credentials.',
+            'Disable measurement below at any time. We also honor Do Not Track and Global Privacy Control. Disabling stops future analytics without affecting tools or conversations; existing records expire under the retention policy. Necessary quota and rate-limit controls continue.',
+          ],
+        },
         {
           heading: 'Free allowances and infrastructure',
           paragraphs: [
diff --git a/src/layouts/Layout.astro b/src/layouts/Layout.astro
index 8099ace..077e9f5 100644
--- a/src/layouts/Layout.astro
+++ b/src/layouts/Layout.astro
@@ -120,7 +120,7 @@ const schema = {
         </span>
         <span class="brand-zh">问卜</span>
       </a>
-      <nav aria-label={t('主导航', 'Main navigation')} class="desktop-nav">
+      <nav aria-label={t('主导航', 'Main navigation')} class="desktop-nav" data-track="navigation">
         <a
           class="agent-nav-link"
           href={href(locale, 'agent')}
@@ -239,6 +239,8 @@ const schema = {
       </div>
     </footer>
     <script>
+      import { initializeAnalytics } from '../lib/analytics';
+      initializeAnalytics();
       const menu = document.querySelector<HTMLButtonElement>('.menu-toggle');
       const nav = document.getElementById('mobile-nav');
       menu?.addEventListener('click', () => {
diff --git a/src/lib/bazi.ts b/src/lib/bazi.ts
index a7ec095..ba4eb6d 100644
--- a/src/lib/bazi.ts
+++ b/src/lib/bazi.ts
@@ -77,7 +77,9 @@ export function birthMoment(input: BirthInput) {
 export function calculateBazi(raw: unknown) {
   const input = birthSchema.parse(raw);
   const moment = birthMoment(input);
-  const beijing = moment.withTimeZone('Asia/Shanghai');
+  // The ephemeris adds 1/3 day (UTC+8). Shanghai's historic DST must not
+  // shift the solar-term comparison by another hour. Local day/hour retain the chosen zone.
+  const beijing = moment.withTimeZone('+08:00');
   let local = moment.toPlainDateTime();
   let correctionMinutes = 0;
   if (input.solarTime && input.longitude !== undefined) {
@@ -142,7 +144,7 @@ export function calculateBazi(raw: unknown) {
     );
   return {
     kind: 'bazi' as const,
-    version: 'wenbu-bazi-1.0',
+    version: 'wenbu-bazi-1.1',
     input,
     calendar: {
       lunar: `${lunar.getYearInChinese()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
@@ -163,7 +165,7 @@ export function calculateBazi(raw: unknown) {
     warnings,
     method: {
       engine: 'lunar-typescript@1.8.6',
-      yearMonth: 'Absolute solar-term boundaries in Asia/Shanghai',
+      yearMonth: 'Absolute solar-term boundaries in fixed UTC+08:00',
       dayHour: input.solarTime ? 'Approximate local apparent solar time' : 'Local civil clock',
       dayBoundary: input.dayBoundary,
       elements:
diff --git a/src/pages/[...path].astro b/src/pages/[...path].astro
index 84b6b3f..2c3996a 100644
--- a/src/pages/[...path].astro
+++ b/src/pages/[...path].astro
@@ -1,5 +1,8 @@
 ---
 import Layout from '../layouts/Layout.astro';
+import AnalyticsDashboard from '../components/AnalyticsDashboard';
+import TarotGallery from '../components/TarotGallery';
+import AnalyticsPreference from '../components/AnalyticsPreference';
 import Home from '../components/Home.astro';
 import ToolDesk from '../components/ToolDesk';
 import Journal from '../components/Journal';
@@ -18,6 +21,7 @@ export function getStaticPaths() {
     'bazi',
     'iching',
     'tarot',
+    'tarot/deck',
     'ziwei',
     'journal',
     'learn',
@@ -25,6 +29,7 @@ export function getStaticPaths() {
     'agents',
     'agent',
     'sources',
+    'insights',
     ...Object.keys(pages),
     ...articles.map((a) => `${a.category}/${a.slug}`),
     ...comparisons.map((c) => `compare/${c.slug}`),
@@ -47,6 +52,7 @@ const titles: Record<string, [string, string]> = {
   '': ['免费八字、易经、塔罗与紫微工具', 'Free BaZi, I Ching, tarot & Zi Wei tools'],
   bazi: ['免费八字排盘，读懂你的五行底色', 'Free BaZi calculator & Four Pillars chart'],
   iching: ['免费易经占卜，从一卦看见变化', 'Free I Ching reading & hexagram oracle'],
+  'tarot/deck': ['78 张塔罗牌图鉴 · 问卜原创插画与牌义', '78 tarot cards · the illustrated Wenbu deck'],
   tarot: ['免费塔罗占卜，遇见新的视角', 'Free tarot reading · one & three cards'],
   ziwei: ['免费紫微斗数排盘，十二宫可视化', 'Free Zi Wei Dou Shu chart calculator'],
   journal: ['我的手记', 'Your reading journal'],
@@ -54,6 +60,7 @@ const titles: Record<string, [string, string]> = {
   blog: ['问卜札记', 'The Wenbu journal'],
   agents: ['与你的 Agent 一起探索', 'Wenbu for agents · MCP, CLI & Skills'],
   agent: ['命理 Agent · 对话、排盘与有依据的研习', 'Wenbu Agent · chat, charts & sourced research'],
+  insights: ['访问与使用 · 管理后台', 'Product analytics · administration'],
   sources: ['参考资料与研究来源', 'Sources & further reading'],
 };
 const descriptions: Record<string, [string, string]> = {
@@ -61,6 +68,10 @@ const descriptions: Record<string, [string, string]> = {
     '免费探索八字命盘、易经问卦、78 张塔罗和紫微星盘。无需注册，计算依据透明，可选 AI 解读、本地手记和 MCP Agent 接口。',
     'Explore free BaZi charts, I Ching casts, a full 78-card tarot deck and Zi Wei. No account needed. Transparent methods, optional AI and a local journal.',
   ],
+  'tarot/deck': [
+    '浏览完整 78 张塔罗牌：22 张大阿卡纳与四组小阿卡纳。原创 AI 插画、正逆位关键词、放大查看。免费探索传统象征与自己的问题。',
+    'Browse all 78 tarot cards: original AI illustrations, upright and reversed themes, major arcana and four suits. Open each artwork and explore for free.',
+  ],
   journal: [
     '留住当时的问题，也留住后来的理解。记录只在当前浏览器里，由你保存、回看和导出。',
     'Keep the question you had and the understanding that followed. Your entries stay in this browser, ready to revisit and export.',
@@ -111,12 +122,16 @@ const displayHeading = kind ? t(tool!.zh, tool!.en) : title;
   description={description}
   locale={locale}
   path={path}
-  noindex={path === 'journal'}
+  noindex={path === 'journal' || path === 'insights'}
   article={Boolean(article)}
   workspace={path === 'agent'}
 >
   {path === '' ? (
     <Home locale={locale} />
+  ) : path === 'tarot/deck' ? (
+    <TarotGallery locale={locale} client:visible />
+  ) : path === 'insights' ? (
+    <AnalyticsDashboard client:load />
   ) : path === 'agent' ? (
     <>
       <AgentWorkspace locale={locale} client:load />
@@ -331,6 +346,7 @@ const displayHeading = kind ? t(tool!.zh, tool!.en) : title;
       {content && (
         <div class="prose-grid">
           <article class="prose">
+            {path === 'privacy' && <AnalyticsPreference locale={locale} client:load />}
             {content.sections.map((s, i) => (
               <section id={`section-${i}`}>
                 <h2>{s.heading}</h2>
diff --git a/src/styles/global.css b/src/styles/global.css
index e864b38..691cacf 100644
--- a/src/styles/global.css
+++ b/src/styles/global.css
@@ -3040,3 +3040,612 @@ html[lang='en'] .section-heading h2 {
     font-size: 8px;
   }
 }
+
+/* Original illustrated deck: one shared treatment for tools, journals and Agent artifacts. */
+.tarot-face.illustrated,
+.agent-chart .tarot-face.illustrated {
+  display: block;
+  width: 100%;
+  padding: 0;
+  aspect-ratio: 2 / 3;
+  cursor: zoom-in;
+  border: 1px solid #b9a785;
+  border-radius: 5px;
+  background: #eae0c8;
+  box-shadow:
+    0 3px 5px #312a1914,
+    0 12px 24px -12px #312a193b;
+  transition:
+    transform 240ms ease,
+    box-shadow 240ms ease;
+}
+.tarot-face.illustrated::after {
+  display: none;
+}
+.tarot-face.illustrated > img {
+  width: 100%;
+  height: 100%;
+  object-fit: cover;
+  display: block;
+}
+.tarot-face.illustrated.reversed > img {
+  transform: rotate(180deg);
+}
+.tarot-face.illustrated:hover {
+  transform: translateY(-4px);
+  box-shadow: 0 12px 24px -8px #312a1940;
+}
+.tarot-face.illustrated:focus-visible {
+  outline: 3px solid var(--vermillion);
+  outline-offset: 5px;
+}
+.card-inspect {
+  position: absolute;
+  inset: auto 6px 6px auto;
+  display: flex;
+  align-items: center;
+  gap: 5px;
+  padding: 5px 7px;
+  background: #f6f1e6ed;
+  border-radius: 3px;
+  color: #34483d;
+  font: 10px var(--sans);
+  opacity: 0;
+  transition: opacity 180ms;
+}
+.tarot-face:hover .card-inspect,
+.tarot-face:focus-visible .card-inspect {
+  opacity: 1;
+}
+.card-unavailable {
+  display: grid;
+  place-content: center;
+  height: 100%;
+  gap: 12px;
+  font: 22px var(--serif);
+}
+.card-unavailable small {
+  font: 10px var(--sans);
+}
+.tarot-lightbox {
+  max-width: min(620px, calc(100vw - 32px));
+  max-height: calc(100dvh - 32px);
+  border: 1px solid #c9bca0;
+  border-radius: 10px;
+  background: var(--paper);
+  color: var(--ink);
+  padding: 0;
+  overflow: auto;
+  box-shadow: 0 20px 90px #121e1b50;
+}
+.tarot-lightbox::backdrop {
+  background: #12201bd9;
+  backdrop-filter: blur(5px);
+}
+.tarot-lightbox-inner {
+  padding: 24px;
+  position: relative;
+}
+.tarot-lightbox-inner > img {
+  display: block;
+  width: auto;
+  height: min(62dvh, 630px);
+  max-width: 100%;
+  object-fit: contain;
+  margin: 0 auto;
+  border-radius: 3px;
+  box-shadow: 0 4px 18px #312a1926;
+}
+.tarot-lightbox-inner > img.is-reversed {
+  transform: rotate(180deg);
+}
+.tarot-close {
+  position: sticky;
+  top: 0;
+  margin: -12px -12px 8px auto;
+  display: grid;
+  place-items: center;
+  width: 36px;
+  height: 36px;
+  border-radius: 50%;
+  border: 1px solid var(--line);
+  background: var(--paper-light);
+  color: var(--ink);
+  z-index: 1;
+  cursor: pointer;
+}
+.tarot-lightbox-copy {
+  padding-top: 24px;
+  text-align: center;
+}
+.tarot-lightbox .tarot-lightbox-copy h3 {
+  font: 28px var(--serif);
+  margin: 10px 0;
+}
+.tarot-lightbox-copy h3 small {
+  font: 12px var(--sans);
+  color: var(--muted);
+  margin-left: 8px;
+}
+.tarot-lightbox .tarot-lightbox-copy p {
+  font-size: 14px;
+  margin: 12px 0;
+}
+.tarot-lightbox-copy .small-label {
+  font-size: 10px;
+}
+.drawn-cards.count-1 {
+  grid-template-columns: minmax(0, 240px);
+}
+@media (hover: none) {
+  .card-inspect {
+    opacity: 1;
+  }
+}
+@media (prefers-reduced-motion: reduce) {
+  .tarot-face.illustrated,
+  .card-inspect {
+    transition: none;
+  }
+  .tarot-face.illustrated:hover {
+    transform: none;
+  }
+}
+.mini-tarot-art {
+  height: 98px;
+  width: 65px;
+  object-fit: cover;
+  border-radius: 3px;
+  transform: rotate(-8deg);
+  box-shadow: 8px 6px 0 #dfd7c4;
+}
+.deck-editorial {
+  display: grid;
+  grid-template-columns: 1fr 1fr;
+  align-items: center;
+  gap: clamp(32px, 6vw, 92px);
+  padding: 70px 0;
+  border-top: 1px solid var(--line);
+}
+.deck-editorial-art {
+  display: flex;
+  justify-content: center;
+  align-items: center;
+  padding: 20px;
+}
+.deck-editorial-art img {
+  width: 34%;
+  height: auto;
+  border-radius: 4px;
+  box-shadow: 0 12px 35px #283f292e;
+}
+.deck-editorial-art img:first-child {
+  transform: translateX(15px) rotate(-12deg);
+}
+.deck-editorial-art img:nth-child(2) {
+  position: relative;
+  z-index: 1;
+  transform: translateY(-12px);
+}
+.deck-editorial-art img:last-child {
+  transform: translateX(-15px) rotate(12deg);
+}
+.deck-editorial h2 {
+  font: clamp(26px, 3vw, 38px)/1.6 var(--serif);
+  margin: 18px 0;
+}
+.deck-editorial p {
+  font-size: 14px;
+  line-height: 2;
+  color: var(--muted);
+  margin-bottom: 24px;
+}
+.home-proof-row {
+  display: grid;
+  grid-template-columns: repeat(3, 1fr);
+  gap: 28px;
+  padding: 30px 0 50px;
+}
+.home-proof-row a {
+  border-top: 1px solid var(--line);
+  padding-top: 20px;
+}
+.home-proof-row strong,
+.home-proof-row span {
+  display: block;
+}
+.home-proof-row strong {
+  font-size: 14px;
+  margin-bottom: 10px;
+}
+.home-proof-row span {
+  font-size: 12px;
+  color: var(--muted);
+  line-height: 1.9;
+}
+@media (max-width: 680px) {
+  .deck-editorial {
+    grid-template-columns: 1fr;
+    gap: 16px;
+    padding: 40px 0;
+  }
+  .deck-editorial-art {
+    max-width: 400px;
+    margin: auto;
+  }
+  .home-proof-row {
+    grid-template-columns: 1fr;
+    gap: 16px;
+  }
+}
+.analytics-preference {
+  border: 1px solid var(--line);
+  padding: 24px;
+  background: var(--paper-light);
+  margin-bottom: 40px;
+  border-radius: 6px;
+}
+.analytics-preference label {
+  display: flex;
+  align-items: center;
+  gap: 10px;
+  font-size: 14px;
+}
+.analytics-preference p {
+  font-size: 12px;
+}
+.insights {
+  padding-top: 50px;
+  padding-bottom: 70px;
+}
+.insights-header {
+  display: flex;
+  justify-content: space-between;
+  gap: 20px;
+  align-items: center;
+  margin-bottom: 35px;
+}
+.insights h1 {
+  display: flex;
+  gap: 14px;
+  align-items: center;
+  font: 38px var(--serif);
+  margin: 16px 0;
+}
+.insights-header p,
+.insights-card > p,
+.insights-footnote {
+  color: var(--muted);
+  font-size: 12px;
+  line-height: 1.9;
+}
+.insights-private {
+  display: flex;
+  gap: 8px;
+  align-items: center;
+  color: var(--muted);
+  font-size: 11px;
+}
+.insights-login {
+  max-width: 440px;
+  border: 1px solid var(--line);
+  padding: 34px;
+  margin: 50px auto;
+  background: var(--paper-light);
+  border-radius: 8px;
+}
+.insights-login h2 {
+  font: 26px var(--serif);
+  margin: 18px 0;
+}
+.insights-login p {
+  font-size: 12px;
+  line-height: 2;
+  color: var(--muted);
+  margin-bottom: 25px;
+}
+.insights label {
+  display: grid;
+  gap: 8px;
+  font-size: 11px;
+}
+.insights-login input {
+  width: 100%;
+  padding: 12px;
+  border: 1px solid var(--line);
+  border-radius: 4px;
+  margin-bottom: 18px;
+  background: var(--paper);
+}
+.insights-filters {
+  display: flex;
+  flex-wrap: wrap;
+  gap: 14px;
+  align-items: end;
+  padding: 20px;
+  background: #ecece2;
+  border: 1px solid var(--line);
+}
+.insights-filters select {
+  min-width: 90px;
+  padding: 9px;
+  border: 1px solid var(--line);
+  border-radius: 4px;
+  background: var(--paper-light);
+  font-size: 12px;
+}
+.insights-filters .insights-test {
+  display: flex;
+  align-items: center;
+  padding: 10px 0;
+}
+.insights-toolbar {
+  display: flex;
+  gap: 18px;
+  align-items: center;
+  margin: 18px 0;
+  font-size: 10px;
+  color: var(--muted);
+  flex-wrap: wrap;
+}
+.insights-toolbar span {
+  margin-right: auto;
+}
+.insights-toolbar button {
+  display: flex;
+  align-items: center;
+  gap: 5px;
+  background: transparent;
+  border: 0;
+  cursor: pointer;
+  color: var(--ink);
+}
+.insights-metrics {
+  display: grid;
+  grid-template-columns: repeat(6, minmax(0, 1fr));
+  gap: 12px;
+}
+.insights-metrics article {
+  border-top: 2px solid #6e826d;
+  background: var(--paper-light);
+  padding: 18px;
+}
+.insights-metrics span {
+  font-size: 10px;
+  color: var(--muted);
+}
+.insights-metrics strong {
+  font: 32px var(--serif);
+  display: block;
+  margin-top: 12px;
+}
+.insights-primary {
+  display: grid;
+  grid-template-columns: 1.3fr 1fr;
+  gap: 20px;
+  margin: 24px 0;
+}
+.insights-card {
+  border: 1px solid var(--line);
+  border-radius: 5px;
+  background: var(--paper-light);
+  padding: 22px;
+  min-width: 0;
+  margin-bottom: 12px;
+}
+.insights-card h2,
+.insights-card summary {
+  font: 20px var(--serif);
+  margin-bottom: 10px;
+}
+.insights-card summary {
+  cursor: pointer;
+}
+.insights-card small {
+  font-size: 10px;
+  color: var(--muted);
+}
+.insights-timeline > div {
+  display: grid;
+  grid-template-columns: 38px 1fr 120px;
+  gap: 10px;
+  align-items: center;
+  margin-top: 14px;
+  font-size: 11px;
+}
+.insights-timeline i {
+  height: 18px;
+  background: #70846c;
+  border-radius: 2px;
+}
+.insights-timeline b {
+  font-weight: 500;
+}
+.insights-funnel {
+  display: flex;
+  gap: 12px;
+  padding: 17px 0;
+  border-bottom: 1px solid var(--line);
+  font-size: 12px;
+  align-items: center;
+}
+.insights-funnel span {
+  color: var(--vermillion);
+  font-size: 10px;
+}
+.insights-funnel b {
+  margin-left: auto;
+  font-size: 22px;
+  font-weight: 400;
+}
+.insights-breakdowns {
+  display: grid;
+  grid-template-columns: 1fr 1fr;
+  gap: 14px;
+  align-items: start;
+}
+.insights-table {
+  width: 100%;
+  overflow-x: auto;
+}
+.insights table {
+  width: 100%;
+  border-collapse: collapse;
+  font-size: 11px;
+}
+.insights td,
+.insights th {
+  text-align: left;
+  padding: 12px 5px;
+  border-bottom: 1px solid var(--line);
+  font-weight: 400;
+  overflow-wrap: anywhere;
+}
+.insights thead {
+  color: var(--muted);
+  font-size: 10px;
+}
+.insights-empty {
+  padding: 28px;
+  border: 1px dashed var(--line);
+  margin: 20px 0;
+  font-size: 13px;
+}
+.insights-footnote {
+  margin-top: 30px;
+  max-width: 760px;
+}
+@media (max-width: 800px) {
+  .insights-metrics {
+    grid-template-columns: repeat(3, minmax(0, 1fr));
+  }
+  .insights-primary,
+  .insights-breakdowns {
+    grid-template-columns: 1fr;
+  }
+}
+@media (max-width: 460px) {
+  .insights-metrics {
+    grid-template-columns: repeat(2, minmax(0, 1fr));
+  }
+  .insights-header {
+    display: block;
+  }
+  .insights-login,
+  .insights-card {
+    padding: 18px;
+  }
+  .insights-filters label {
+    flex: 1 0 100px;
+  }
+}
+.card-back {
+  background: #34483d url('/images/tarot/back.webp') center / cover;
+}
+.card-back::before,
+.card-back span {
+  opacity: 0;
+}
+.card-back:hover,
+.card-back.selected {
+  background: #34483d url('/images/tarot/back.webp') center / cover;
+  outline: 2px solid var(--vermillion);
+  outline-offset: 3px;
+}
+.tarot-gallery {
+  padding: 70px 0;
+}
+.gallery-heading {
+  max-width: 680px;
+  margin: 0 auto 40px;
+  text-align: center;
+}
+.gallery-heading h1 {
+  font: clamp(28px, 4vw, 44px)/1.5 var(--serif);
+  margin: 20px 0;
+}
+.gallery-heading p {
+  font-size: 14px;
+  line-height: 2;
+  color: var(--muted);
+  margin-bottom: 20px;
+}
+.gallery-filters {
+  display: flex;
+  justify-content: center;
+  flex-wrap: wrap;
+  gap: 8px;
+  margin: 35px 0;
+}
+.gallery-filters button {
+  border: 1px solid var(--line);
+  background: transparent;
+  padding: 10px 15px;
+  border-radius: 30px;
+  font-size: 12px;
+  color: var(--ink);
+  cursor: pointer;
+}
+.gallery-filters button span {
+  opacity: 0.6;
+  margin-left: 7px;
+  font-size: 10px;
+}
+.gallery-filters button[aria-pressed='true'] {
+  background: var(--ink);
+  color: var(--paper);
+  border-color: var(--ink);
+}
+.tarot-gallery-grid {
+  display: grid;
+  grid-template-columns: repeat(6, minmax(0, 1fr));
+  gap: 35px 22px;
+}
+.tarot-gallery-grid article {
+  min-width: 0;
+  text-align: center;
+}
+.tarot-gallery-grid article h2 {
+  font: 18px var(--serif);
+  margin: 15px 0 8px;
+}
+.tarot-gallery-grid article > p {
+  font-size: 12px;
+  margin-bottom: 7px;
+}
+.tarot-gallery-grid article > small {
+  color: var(--muted);
+  font-size: 10px;
+  line-height: 1.8;
+}
+.gallery-note {
+  font-size: 12px;
+  color: var(--muted);
+  line-height: 2;
+  padding: 30px 0;
+  border-top: 1px solid var(--line);
+  margin-top: 50px;
+}
+.deck-gallery-link {
+  font-size: 11px;
+  color: var(--muted);
+  display: block;
+  text-align: center;
+  margin: 0 0 18px;
+  text-decoration: underline;
+  text-underline-offset: 4px;
+}
+@media (max-width: 1000px) {
+  .tarot-gallery-grid {
+    grid-template-columns: repeat(4, minmax(0, 1fr));
+  }
+}
+@media (max-width: 640px) {
+  .tarot-gallery-grid {
+    grid-template-columns: repeat(2, minmax(0, 1fr));
+    gap: 28px 18px;
+  }
+  .tarot-gallery {
+    padding: 40px 0;
+  }
+}
diff --git a/tests/calculations.test.ts b/tests/calculations.test.ts
index e0241be..85e229c 100644
--- a/tests/calculations.test.ts
+++ b/tests/calculations.test.ts
@@ -49,6 +49,24 @@ describe('calendar contracts', () => {
     expect(before.pillars[0].value).toBe('癸卯');
     expect(after.pillars[0].value).toBe('甲辰');
   });
+  it('compares 1988 solar terms in fixed UTC+8, not Shanghai summer time', () => {
+    // Upstream ephemeris: 1988 Li Xia = 15:01:43 at UTC+8.
+    // Shanghai civil clocks were UTC+9, so 15:30 civil is still BEFORE the term.
+    const before = calculateBazi({ date: '1988-05-05', time: '15:30', timezone: 'Asia/Shanghai' });
+    const fixed = calculateBazi({ date: '1988-05-05', time: '14:30', timezone: '+08:00' });
+    const after = calculateBazi({ date: '1988-05-05', time: '16:02', timezone: 'Asia/Shanghai' });
+    expect(before.calendar.offset).toBe('+09:00');
+    expect(before.pillars[1].value).toBe('丙辰');
+    expect(before.pillars[1].value).toBe(fixed.pillars[1].value);
+    expect(after.pillars[1].value).toBe('丁巳');
+  });
+  it('solar correction does not move year/month across a term instant', () => {
+    const args = { date: '2024-02-04', time: '16:28', timezone: 'Asia/Shanghai' };
+    const clock = calculateBazi(args);
+    const corrected = calculateBazi({ ...args, solarTime: true, longitude: 75 });
+    expect(corrected.pillars.slice(0, 2)).toEqual(clock.pillars.slice(0, 2));
+    expect(corrected.pillars[3].value).not.toBe(clock.pillars[3].value);
+  });
   it('requires longitude for solar correction', () =>
     expect(() => calculateBazi({ date: '2000-08-16', time: '03:30', solarTime: true })).toThrow());
   it('reports approximate correction', () => {
diff --git a/worker/agent.ts b/worker/agent.ts
index 2ec7782..c990962 100644
--- a/worker/agent.ts
+++ b/worker/agent.ts
@@ -1,6 +1,7 @@
 import { z } from 'zod';
 import { ApiError, identityHash } from './ai';
 import type { Env } from './types';
+import type { ServiceMetric } from './analytics';
 import { agentRequestSchema, restoreReading, type AgentRequest } from './agent-schema';
 import { agentTools, executeAgentTool, toolTrace } from './agent-tools';
 import { libraryDocuments, readLibrary, readReference } from './agent-library';
@@ -189,7 +190,12 @@ export function requestsNewDraw(message: string) {
   );
 }
 
-export async function agentResponse(raw: unknown, request: Request, env: Env) {
+export async function agentResponse(
+  raw: unknown,
+  request: Request,
+  env: Env,
+  onFinish?: (metric: ServiceMetric) => void,
+) {
   const input = agentRequestSchema.parse(raw);
   // Rebuild charts and validate original random results BEFORE reserving a paid turn.
   let readings: ReturnType<typeof restoreReading>[];
@@ -270,6 +276,23 @@ export async function agentResponse(raw: unknown, request: Request, env: Env) {
   const onRequestAbort = () => abort.abort();
   request.signal.addEventListener('abort', onRequestAbort, { once: true });
   if (request.signal.aborted) abort.abort();
+  const metrics: ServiceMetric = {
+    event: 'agent_finished',
+    tool: 'agent',
+    mode: input.mode,
+    status: 'error',
+    duration: 0,
+    modelCalls: 0,
+    toolCalls: 0,
+    artifacts: 0,
+  };
+  let recorded = false;
+  const finishMetric = () => {
+    if (!recorded) {
+      recorded = true;
+      onFinish?.(metrics);
+    }
+  };
   let closed = false;
   let cancelled = false;
   let timeout: ReturnType<typeof setTimeout>;
@@ -277,6 +300,13 @@ export async function agentResponse(raw: unknown, request: Request, env: Env) {
     start(controller) {
       const encoder = new TextEncoder();
       const emit = (event: AgentEvent) => {
+        if (event.type === 'artifact') metrics.artifacts = (metrics.artifacts ?? 0) + 1;
+        if (event.type === 'tool_start') metrics.toolCalls = (metrics.toolCalls ?? 0) + 1;
+        if (event.type === 'done') {
+          metrics.status = event.status;
+          metrics.modelCalls = event.modelCalls;
+          metrics.toolCalls = event.toolCalls;
+        }
         if (closed || cancelled || abort.signal.aborted) return;
         controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
       };
@@ -392,6 +422,7 @@ export async function agentResponse(raw: unknown, request: Request, env: Env) {
             });
           }
           modelCalls++;
+          metrics.modelCalls = modelCalls;
           const result = await streamDeepSeek(
             messages,
             env,
@@ -486,6 +517,7 @@ export async function agentResponse(raw: unknown, request: Request, env: Env) {
       };
       void run()
         .catch((error) => {
+          metrics.status = cancelled ? 'cancelled' : abort.signal.aborted ? 'timeout' : 'error';
           if (cancelled) return;
           // Emit a terminal error even when the total-time abort fired, instead of a false success.
           const event: AgentEvent = {
@@ -505,6 +537,7 @@ export async function agentResponse(raw: unknown, request: Request, env: Env) {
           if (!closed) controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
         })
         .finally(() => {
+          finishMetric();
           clearTimeout(timeout);
           clearInterval(heartbeat);
           request.signal.removeEventListener('abort', onRequestAbort);
@@ -513,6 +546,7 @@ export async function agentResponse(raw: unknown, request: Request, env: Env) {
         });
     },
     cancel() {
+      metrics.status = 'cancelled';
       cancelled = true;
       closed = true;
       abort.abort();
diff --git a/worker/index.ts b/worker/index.ts
index a796c7b..042653c 100644
--- a/worker/index.ts
+++ b/worker/index.ts
@@ -6,6 +6,14 @@ import { handleMcp } from './mcp';
 import type { Env } from './types';
 import { agentResponse } from './agent';
 import { AGENT_BODY_LIMIT } from '../src/lib/agent-protocol';
+import {
+  collectEvents,
+  recordService,
+  authorizedAnalytics,
+  analyticsReport,
+  pruneAnalytics,
+  type ServiceMetric,
+} from './analytics';
 export { UsageGate } from './quota';
 
 const apiHeaders = {
@@ -69,13 +77,39 @@ export function originAllowed(request: Request, env: Env) {
   return false;
 }
 export default {
-  async fetch(request: Request, env: Env): Promise<Response> {
+  async fetch(request: Request, env: Env, ctx?: ExecutionContext): Promise<Response> {
     const url = new URL(request.url);
     const path = url.pathname;
     if (!path.startsWith('/api/') && path !== '/mcp' && path !== '/mcp/') return env.ASSETS.fetch(request);
     if (!originAllowed(request, env))
       return json({ error: { code: 'origin_denied', message: 'Origin not allowed.' } }, 403);
+    const started = Date.now();
+    const observedTool = path.match(/^\/api\/v1\/(bazi|iching|tarot|ziwei|agent|interpret)$/)?.[1] as
+      ServiceMetric['tool'] | undefined;
+    let locale: 'zh' | 'en' = 'en';
+    const record = (metric: ServiceMetric) => {
+      const task = recordService(request, env, metric).catch(() => undefined);
+      if (ctx) ctx.waitUntil(task);
+    };
     try {
+      if (path === '/api/events') {
+        if (request.method !== 'POST') return json({ error: { code: 'method_not_allowed' } }, 405);
+        if (request.headers.get('Origin') !== url.origin)
+          return json({ error: { code: 'origin_denied' } }, 403);
+        if (
+          env.ANALYTICS_LIMITER &&
+          !(await env.ANALYTICS_LIMITER.limit({ key: request.headers.get('CF-Connecting-IP') ?? 'local' }))
+            .success
+        )
+          return json({ error: { code: 'rate_limited' } }, 429);
+        if (!env.ANALYTICS) return json({ error: { code: 'analytics_unavailable' } }, 503);
+        return json(await collectEvents(await boundedBody(request, 16000), request, env));
+      }
+      if (path === '/api/admin/analytics') {
+        if (request.method !== 'GET') return json({ error: { code: 'method_not_allowed' } }, 405);
+        if (!(await authorizedAnalytics(request, env))) return json({ error: { code: 'unauthorized' } }, 401);
+        return json(await analyticsReport(url, env));
+      }
       if (path === '/api/health' && request.method === 'GET')
         return json({
           status: 'ok',
@@ -89,7 +123,8 @@ export default {
           headers: {
             ...apiHeaders,
             'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
-            'Access-Control-Allow-Headers': 'Content-Type, Accept, MCP-Protocol-Version',
+            'Access-Control-Allow-Headers':
+              'Content-Type, Accept, MCP-Protocol-Version, X-Wenbu-Client, X-Wenbu-Analytics',
             'Access-Control-Allow-Origin': request.headers.get('Origin') || env.SITE_URL,
             Vary: 'Origin',
           },
@@ -98,8 +133,16 @@ export default {
         const result = await env.RATE_LIMITER.limit({
           key: request.headers.get('CF-Connecting-IP') ?? 'local',
         });
-        if (!result.success)
+        if (!result.success) {
+          if (observedTool)
+            record({
+              event: 'api_failed',
+              tool: observedTool,
+              status: 'rate_limited',
+              duration: Date.now() - started,
+            });
           return json({ error: { code: 'rate_limited', message: 'Please slow down. / 请稍后再试。' } }, 429);
+        }
       }
       if (path === '/mcp' || path === '/mcp/') {
         if (request.method === 'POST') {
@@ -110,7 +153,14 @@ export default {
             body: JSON.stringify(body),
           });
         }
-        const response = await handleMcp(request);
+        const response = await handleMcp(request, (tool, success, duration) =>
+          record({
+            event: tool === 'mcp' ? 'mcp_finished' : success ? 'calculation_succeeded' : 'api_failed',
+            tool,
+            status: success ? 'complete' : 'invalid_input',
+            duration,
+          }),
+        );
         const headers = new Headers(response.headers);
         for (const [k, v] of Object.entries(apiHeaders)) if (k !== 'Content-Type') headers.set(k, v);
         return new Response(response.body, { status: response.status, headers });
@@ -118,12 +168,49 @@ export default {
       if (request.method !== 'POST')
         return json({ error: { code: 'method_not_allowed', message: 'Use POST with a JSON body.' } }, 405);
       const raw = await boundedBody(request, path === '/api/v1/agent' ? AGENT_BODY_LIMIT : 8192);
-      if (path === '/api/v1/agent') return await agentResponse(raw, request, env);
-      if (path === '/api/v1/interpret') return json(await interpret(raw, request, env));
+      locale = raw && typeof raw === 'object' && raw.locale === 'zh' ? 'zh' : 'en';
+      if (path === '/api/v1/agent')
+        return await agentResponse(raw, request, env, (metric) =>
+          record({ ...metric, locale, duration: Date.now() - started }),
+        );
+      if (path === '/api/v1/interpret') {
+        const result = await interpret(raw, request, env);
+        record({
+          event: 'interpret_succeeded',
+          tool: 'interpret',
+          status: 'complete',
+          locale,
+          duration: Date.now() - started,
+        });
+        return json(result);
+      }
       const kind = path.match(/^\/api\/v1\/(bazi|iching|tarot|ziwei)$/)?.[1] as ToolKind | undefined;
       if (!kind) return json({ error: { code: 'not_found', message: 'Unknown endpoint.' } }, 404);
-      return json(calculate(kind, raw));
+      const result = calculate(kind, raw);
+      record({
+        event: 'calculation_succeeded',
+        tool: kind,
+        status: 'complete',
+        locale,
+        duration: Date.now() - started,
+      });
+      return json(result);
     } catch (error) {
+      if (observedTool)
+        record({
+          event: 'api_failed',
+          tool: observedTool,
+          locale,
+          status:
+            error instanceof ApiError && error.status === 429
+              ? 'rate_limited'
+              : error instanceof InputError || error instanceof z.ZodError
+                ? 'invalid_input'
+                : error instanceof ApiError && error.status === 503
+                  ? 'unavailable'
+                  : 'error',
+          duration: Date.now() - started,
+        });
       if (error instanceof ApiError)
         return json({ error: { code: error.code, message: error.message } }, error.status);
       if (error instanceof InputError)
@@ -150,4 +237,7 @@ export default {
       );
     }
   },
+  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
+    ctx.waitUntil(pruneAnalytics(env));
+  },
 } satisfies ExportedHandler<Env>;
diff --git a/worker/mcp.ts b/worker/mcp.ts
index af80d83..6e2b051 100644
--- a/worker/mcp.ts
+++ b/worker/mcp.ts
@@ -6,6 +6,8 @@ import { castIching } from '../src/lib/iching';
 import { drawTarot } from '../src/lib/tarot';
 import { calculateZiwei } from '../src/lib/ziwei';
 import { searchLibrary, readLibrary } from './agent-library';
+import type { ToolKind } from '../src/lib/schema';
+type ToolReceipt = (tool: ToolKind | 'mcp', success: boolean, duration: number) => void;
 
 const language = z.enum(['zh', 'en']).default('en');
 const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
@@ -15,7 +17,7 @@ const pack = (data: Record<string, unknown>) => ({
   structuredContent: data,
 });
 
-export function createMcpServer() {
+export function createMcpServer(receipt?: ToolReceipt) {
   const server = new McpServer(
     { name: 'wenbu', version: '1.1.0' },
     {
@@ -43,9 +45,22 @@ export function createMcpServer() {
         },
       },
       async (args) => {
+        const started = Date.now();
+        const kind =
+          (
+            {
+              calculate_bazi: 'bazi',
+              calculate_ziwei: 'ziwei',
+              cast_iching: 'iching',
+              draw_tarot: 'tarot',
+            } as Record<string, ToolKind>
+          )[name] ?? 'mcp';
         try {
-          return pack(fn(args));
+          const result = fn(args);
+          receipt?.(kind, true, Date.now() - started);
+          return pack(result);
         } catch {
+          receipt?.(kind, false, Date.now() - started);
           return {
             isError: true,
             content: [
@@ -126,14 +141,14 @@ export function createMcpServer() {
       {
         uri: 'wenbu://methodology',
         mimeType: 'text/plain',
-        text: 'Wenbu v1.1. BaZi: lunar-typescript 1.8.6; solar-term year/month at the absolute instant in Asia/Shanghai; day/hour in local civil or approximate solar time. I Ching: cryptographic three-coin probabilities 1/8,3/8,3/8,1/8; bottom-to-top lines; changing lines 6 and 9. Tarot: uniform selection without replacement, optional independent 50% reversals. Zi Wei: iztro 2.6.1 local civil time, fixLeap=true, default school. Details: https://wenbu.genedai.me/en/methodology/',
+        text: 'Wenbu v1.1. BaZi: lunar-typescript 1.8.6; solar-term year/month at the absolute instant in fixed UTC+08:00 standard time; day/hour in local civil or approximate solar time. I Ching: cryptographic three-coin probabilities 1/8,3/8,3/8,1/8; bottom-to-top lines; changing lines 6 and 9. Tarot: uniform selection without replacement, optional independent 50% reversals. Zi Wei: iztro 2.6.1 local civil time, fixLeap=true, default school. Details: https://wenbu.genedai.me/en/methodology/',
       },
     ],
   }));
   return server;
 }
-export async function handleMcp(request: Request) {
-  const server = createMcpServer();
+export async function handleMcp(request: Request, receipt?: ToolReceipt) {
+  const server = createMcpServer(receipt);
   const transport = new WebStandardStreamableHTTPServerTransport({
     sessionIdGenerator: undefined,
     enableJsonResponse: true,
diff --git a/worker/types.ts b/worker/types.ts
index 03de138..abbc980 100644
--- a/worker/types.ts
+++ b/worker/types.ts
@@ -1,6 +1,9 @@
 import type { UsageGate } from './quota';
 export interface Env {
   ASSETS: Fetcher;
+  ANALYTICS?: D1Database;
+  ANALYTICS_ADMIN_TOKEN?: string;
+  ANALYTICS_LIMITER?: RateLimit;
   QUOTA: DurableObjectNamespace<UsageGate>;
   RATE_LIMITER?: RateLimit;
   DEEPSEEK_API_KEY?: string;
diff --git a/wrangler.jsonc b/wrangler.jsonc
index 633e588..be48dcb 100644
--- a/wrangler.jsonc
+++ b/wrangler.jsonc
@@ -36,6 +36,7 @@
     },
   ],
   "ratelimits": [
+    { "name": "ANALYTICS_LIMITER", "namespace_id": "1002", "simple": { "limit": 30, "period": 60 } },
     {
       "name": "RATE_LIMITER",
       "namespace_id": "1001",
@@ -45,6 +46,15 @@
       },
     },
   ],
+  "d1_databases": [
+    {
+      "binding": "ANALYTICS",
+      "database_name": "wenbu-analytics",
+      "database_id": "ad0bb9f2-43d5-47f0-a404-06f071b85935",
+      "migrations_dir": "migrations",
+    },
+  ],
+  "triggers": { "crons": ["15 19 * * *"] },
   "observability": {
     "enabled": false,
   },

## worker/analytics.ts
import { z } from 'zod';
import type { Env } from './types';
import {
  actions,
  campaigns,
  clientEvents,
  mediums,
  safePage,
  sources,
  statuses,
  tools,
} from '../src/lib/analytics-contract';

const contextSchema = z
  .object({
    session: z.uuid(),
    visitor: z.uuid(),
    page: z.string().max(120).transform(safePage),
    entry: z.string().max(120).transform(safePage),
    locale: z.enum(['zh', 'en']),
    source: z.enum(sources),
    medium: z.enum(mediums),
    campaign: z.enum(campaigns),
    test: z.boolean().default(false),
  })
  .strict();
export const eventSchema = contextSchema
  .extend({
    id: z.uuid(),
    event: z.enum(clientEvents),
    tool: z.enum(tools).default('none'),
    mode: z.enum(['none', 'explore', 'research']).default('none'),
    action: z.enum(actions).default('none'),
    status: z.enum(statuses).default('none'),
    value: z.number().int().min(0).max(100).default(0),
    duration: z.number().int().min(0).max(3600000).default(0),
  })
  .strict();
export const eventBatch = z.object({ events: z.array(eventSchema).min(1).max(10) }).strict();
export type ServiceMetric = {
  event: 'calculation_succeeded' | 'interpret_succeeded' | 'agent_finished' | 'api_failed' | 'mcp_finished';
  tool: (typeof tools)[number];
  status: (typeof statuses)[number];
  mode?: 'none' | 'explore' | 'research';
  locale?: 'zh' | 'en';
  duration: number;
  modelCalls?: number;
  toolCalls?: number;
  artifacts?: number;
};

export function requestDimensions(request: Request) {
  const ua = request.headers.get('User-Agent') ?? '';
  return {
    device: /bot|crawler|spider|headless/i.test(ua)
      ? 'bot'
      : /iPad|Tablet/i.test(ua)
        ? 'tablet'
        : /Mobi|Android/i.test(ua)
          ? 'mobile'
          : ua
            ? 'desktop'
            : 'unknown',
    browser: /Edg\//.test(ua)
      ? 'edge'
      : /Firefox\//.test(ua)
        ? 'firefox'
        : /Chrome\//.test(ua)
          ? 'chrome'
          : /Safari\//.test(ua)
            ? 'safari'
            : 'other',
    os: /iPhone|iPad/.test(ua)
      ? 'ios'
      : /Android/.test(ua)
        ? 'android'
        : /Windows/.test(ua)
          ? 'windows'
          : /Macintosh/.test(ua)
            ? 'macos'
            : /Linux/.test(ua)
              ? 'linux'
              : 'other',
    country: /^[A-Z]{2}$/.test(String(request.cf?.country ?? '')) ? String(request.cf?.country) : 'XX',
  };
}
const columns =
  'id,occurred_at,event,origin,session_id,visitor_id,page,entry_page,locale,source,medium,campaign,device,browser,os,country,channel,tool,mode,action,status,value,duration_ms,model_calls,tool_calls,artifacts,is_test';
const insert = `INSERT OR IGNORE INTO events (${columns}) VALUES (${Array(27).fill('?').join(',')})`;
const noTracking = (request: Request) =>
  request.headers.get('DNT') === '1' ||
  request.headers.get('Sec-GPC') === '1' ||
  request.headers.get('X-Wenbu-Analytics') === 'off';
export async function collectEvents(raw: unknown, request: Request, env: Env) {
  const { events } = eventBatch.parse(raw);
  if (noTracking(request)) return { accepted: 0 };
  if (!env.ANALYTICS) throw new Error('Analytics unavailable');
  const meta = requestDimensions(request);
  const result = await env.ANALYTICS.batch(
    events.map((e) =>
      env
        .ANALYTICS!.prepare(insert)
        .bind(
          e.id,
          Date.now(),
          e.event,
          'client',
          e.session,
          e.visitor,
          e.page,
          e.entry,
          e.locale,
          e.source,
          e.medium,
          e.campaign,
          meta.device,
          meta.browser,
          meta.os,
          meta.country,
          'web',
          e.tool,
          e.mode,
          e.action,
          e.status,
          e.value,
          e.duration,
          0,
          0,
          0,
          Number(e.test),
        ),
    ),
  );
  return { accepted: result.reduce((n, r) => n + (r.meta.changes ?? 0), 0) };
}
export async function recordService(request: Request, env: Env, metric: ServiceMetric) {
  if (!env.ANALYTICS || noTracking(request)) return;
  let context: z.infer<typeof contextSchema> | undefined;
  // Public correlation labels are approximate product analytics, never billing identity.
  const header = request.headers.get('X-Wenbu-Analytics');
  if (header && header.length <= 1500) {
    try {
      context = contextSchema.parse(JSON.parse(header));
    } catch {
      /* Discard the entire untrusted context. */
    }
  }
  const meta = requestDimensions(request);
  const path = new URL(request.url).pathname;
  const channel = path.startsWith('/mcp')
    ? 'mcp'
    : request.headers.get('X-Wenbu-Client') === 'cli'
      ? 'cli'
      : context || request.headers.get('X-Wenbu-Client') === 'web'
        ? 'web'
        : 'api';
  await env.ANALYTICS.prepare(insert)
    .bind(
      crypto.randomUUID(),
      Date.now(),
      metric.event,
      'server',
      context?.session ?? null,
      context?.visitor ?? null,
      context?.page ?? '/api/',
      context?.entry ?? '/api/',
      context?.locale ?? metric.locale ?? 'en',
      context?.source ?? 'direct',
      context?.medium ?? 'none',
      context?.campaign ?? 'none',
      meta.device,
      meta.browser,
      meta.os,
      meta.country,
      channel,
      metric.tool,
      metric.mode ?? 'none',
      'none',
      metric.status,
      0,
      Math.min(3600000, Math.max(0, Math.round(metric.duration))),
      metric.modelCalls ?? 0,
      metric.toolCalls ?? 0,
      metric.artifacts ?? 0,
      Number(context?.test ?? request.headers.get('X-Wenbu-Test') === 'true'),
    )
    .run();
}

export async function authorizedAnalytics(request: Request, env: Env) {
  if (!env.ANALYTICS_ADMIN_TOKEN) return false;
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '') ?? '';
  if (!token || token.length > 256) return false;
  const digest = async (value: string) =>
    new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
  const a = await digest(token),
    b = await digest(env.ANALYTICS_ADMIN_TOKEN);
  return a.reduce((difference, byte, i) => difference | (byte ^ b[i]), 0) === 0;
}
export async function analyticsReport(url: URL, env: Env) {
  if (!env.ANALYTICS) throw new Error('Analytics unavailable');
  const days = Math.max(1, Math.min(90, Number(url.searchParams.get('days')) || 7));
  const since = Date.now() - days * 86400000;
  const includeTest = url.searchParams.get('test') === 'true';
  const filters: Record<string, readonly string[]> = {
    source: sources,
    campaign: campaigns,
    locale: ['zh', 'en'],
    device: ['mobile', 'desktop', 'tablet', 'bot', 'unknown'],
    channel: ['web', 'api', 'cli', 'mcp'],
  };
  let where = 'occurred_at >= ? AND (? = 1 OR is_test = 0)';
  const values: (string | number)[] = [since, Number(includeTest)];
  for (const [key, allowed] of Object.entries(filters)) {
    const value = url.searchParams.get(key);
    if (value && allowed.includes(value)) {
      where += ` AND ${key} = ?`;
      values.push(value);
    }
  }
  const query = (sql: string) => env.ANALYTICS!.prepare(sql.replaceAll('$WHERE', where)).bind(...values);
  const queries: [string, string][] = [
    [
      'summary',
      `SELECT COUNT(*) events, SUM(event='page_view') pageviews, COUNT(DISTINCT CASE WHEN event='page_view' THEN session_id END) sessions, COUNT(DISTINCT CASE WHEN event='page_view' THEN visitor_id END) visitors, COUNT(DISTINCT CASE WHEN event='engaged' THEN session_id END) engaged_sessions, SUM(event='calculation_succeeded') calculations, SUM(event='interpret_succeeded') interpretations, SUM(event='agent_finished' AND status='complete') agent_complete, SUM(event='agent_finished' AND status='waiting') agent_waiting, SUM(event='agent_finished' AND status='limited') agent_limited, SUM(event='api_failed' OR (event='agent_finished' AND status IN ('error','timeout','cancelled'))) failures, SUM(model_calls) model_calls, SUM(tool_calls) tool_calls, MAX(occurred_at) last_event FROM events WHERE $WHERE`,
    ],
    [
      'daily',
      `SELECT strftime('%Y-%m-%d', occurred_at/1000, 'unixepoch') label, SUM(event='page_view') views, COUNT(DISTINCT CASE WHEN event='page_view' THEN session_id END) sessions, SUM(event='calculation_succeeded') calculations, SUM(event='agent_finished' AND status='complete') agent FROM events WHERE $WHERE GROUP BY label ORDER BY label`,
    ],
    [
      'events',
      `SELECT event label, origin, status, COUNT(*) count, COUNT(DISTINCT session_id) sessions FROM events WHERE $WHERE GROUP BY event,origin,status ORDER BY count DESC`,
    ],
    [
      'performance',
      `SELECT tool label, status, COUNT(*) count, ROUND(AVG(duration_ms)) average_ms, MAX(duration_ms) max_ms FROM events WHERE $WHERE AND origin='server' GROUP BY tool,status ORDER BY count DESC`,
    ],
    [
      'funnel',
      `WITH steps AS (SELECT session_id, MIN(CASE WHEN event='page_view' THEN occurred_at END) visit, MIN(CASE WHEN event IN ('tool_started','agent_started') THEN occurred_at END) start, MIN(CASE WHEN event IN ('calculation_succeeded','interpret_succeeded') OR (event='agent_finished' AND status='complete') THEN occurred_at END) success, MAX(CASE WHEN event='journal_saved' THEN occurred_at END) saved FROM events WHERE $WHERE AND session_id IS NOT NULL GROUP BY session_id) SELECT COUNT(visit) visited, SUM(visit IS NOT NULL AND start IS NOT NULL) started, SUM(visit IS NOT NULL AND start IS NOT NULL AND success IS NOT NULL) succeeded, SUM(visit IS NOT NULL AND start IS NOT NULL AND success IS NOT NULL AND saved IS NOT NULL) saved FROM steps`,
    ],
  ];
  for (const key of [
    'source',
    'medium',
    'campaign',
    'page',
    'entry_page',
    'locale',
    'device',
    'browser',
    'os',
    'country',
    'channel',
    'tool',
    'mode',
    'action',
  ]) {
    queries.push([
      key,
      `SELECT ${key} label, COUNT(*) events, SUM(event='page_view') views, COUNT(DISTINCT session_id) sessions, SUM(event='calculation_succeeded' OR event='interpret_succeeded' OR (event='agent_finished' AND status='complete')) successes FROM events WHERE $WHERE GROUP BY ${key} ORDER BY events DESC LIMIT 30`,
    ]);
  }
  const results = await env.ANALYTICS.batch(queries.map(([, sql]) => query(sql)));
  return {
    generatedAt: new Date().toISOString(),
    days,
    includeTest,
    retentionDays: 90,
    timezone: 'UTC',
    data: Object.fromEntries(queries.map(([key], i) => [key, results[i].results])),
  };
}
export async function pruneAnalytics(env: Env) {
  if (env.ANALYTICS)
    await env.ANALYTICS.prepare('DELETE FROM events WHERE occurred_at < ?')
      .bind(Date.now() - 90 * 86400000)
      .run();
}

## src/lib/analytics-contract.ts
/** Deliberately closed vocabulary: no prompts, birth inputs, arbitrary URLs or labels. */
export const clientEvents = [
  'page_view',
  'engaged',
  'scroll_depth',
  'cta_click',
  'tool_started',
  'result_viewed',
  'ai_requested',
  'ai_result_viewed',
  'agent_started',
  'agent_received',
  'agent_stopped',
  'artifact_opened',
  'report_exported',
  'conversation_exported',
  'journal_saved',
  'context_opened',
  'card_inspected',
  'source_opened',
  'form_started',
  'client_error',
] as const;
export type ClientEvent = (typeof clientEvents)[number];
export const tools = ['none', 'bazi', 'iching', 'tarot', 'ziwei', 'agent', 'interpret', 'mcp'] as const;
export const sources = [
  'direct',
  'google',
  'bing',
  'baidu',
  'duckduckgo',
  'chatgpt',
  'perplexity',
  'claude',
  'deepseek',
  'github',
  'x',
  'weibo',
  'xiaohongshu',
  'youtube',
  'newsletter',
  'other',
  'internal',
] as const;
export const mediums = ['none', 'organic', 'referral', 'social', 'email', 'cpc', 'ai', 'other'] as const;
// Add campaign slugs here BEFORE distribution. Never collect arbitrary UTM values.
export const campaigns = [
  'none',
  'launch',
  'tarot-deck',
  'agent-studio',
  'bazi-guide',
  'developer-tools',
] as const;
export const actions = [
  'none',
  'hero-agent',
  'hero-chart',
  'home-agent',
  'tool-entry',
  'navigation',
  'article-tool',
  'example',
  'calculate',
  'export',
  'save',
  'inspect',
  'source',
  'context',
] as const;
export const statuses = [
  'none',
  'complete',
  'waiting',
  'limited',
  'error',
  'cancelled',
  'timeout',
  'rate_limited',
  'invalid_input',
  'unavailable',
] as const;
export const pagePaths = [
  '',
  'bazi',
  'iching',
  'tarot',
  'tarot/deck',
  'ziwei',
  'journal',
  'learn',
  'blog',
  'agents',
  'agent',
  'sources',
  'about',
  'methodology',
  'privacy',
  'terms',
  'free',
  'compare/fatetell',
  'compare/labyrinthos',
  'compare/chatbot',
  'learn/bazi-basics',
  'learn/five-elements',
  'learn/birth-time-timezone',
  'learn/iching-three-coins',
  'learn/tarot-beginner',
  'learn/ziwei-twelve-palaces',
  'learn/unknown-birth-time',
  'learn/ai-divination',
  'learn/chinese-zodiac-vs-bazi',
  'learn/bazi-vs-western-astrology',
  'learn/choose-a-tool',
  'blog/a-reading-you-can-return-to',
  'blog/why-calculation-comes-first',
] as const;
export function safePage(path: string): string {
  const p = path
    .split(/[?#]/)[0]
    .replace(/^\//, '')
    .replace(/^en\/?/, '')
    .replace(/\/$/, '');
  return (pagePaths as readonly string[]).includes(p) ? '/' + (p ? p + '/' : '') : '/other/';
}
export function referrerSource(referrer: string, origin: string): (typeof sources)[number] {
  if (!referrer) return 'direct';
  try {
    const url = new URL(referrer);
    if (url.origin === origin) return 'internal';
    const host = url.hostname.replace(/^www\./, '');
    const known: Record<string, (typeof sources)[number]> = {
      'google.com': 'google',
      'google.co.uk': 'google',
      'bing.com': 'bing',
      'baidu.com': 'baidu',
      'duckduckgo.com': 'duckduckgo',
      'chatgpt.com': 'chatgpt',
      'chat.openai.com': 'chatgpt',
      'perplexity.ai': 'perplexity',
      'claude.ai': 'claude',
      'chat.deepseek.com': 'deepseek',
      'github.com': 'github',
      't.co': 'x',
      'x.com': 'x',
      'twitter.com': 'x',
      'weibo.com': 'weibo',
      'xiaohongshu.com': 'xiaohongshu',
      'youtube.com': 'youtube',
    };
    return known[host] ?? 'other';
  } catch {
    return 'other';
  }
}

## src/lib/analytics.ts
import {
  actions,
  campaigns,
  mediums,
  referrerSource,
  safePage,
  sources,
  type ClientEvent,
  type tools,
  type statuses,
} from './analytics-contract';

type Dimensions = {
  tool?: (typeof tools)[number];
  mode?: 'none' | 'explore' | 'research';
  action?: (typeof actions)[number];
  status?: (typeof statuses)[number];
  value?: number;
  duration?: number;
};
type Session = { id: string; last: number; source: string; medium: string; campaign: string; entry: string };
const preferenceKey = 'wenbu.analytics.disabled';
let session: Session | undefined;
let visitor = '';
let initialized = false;
let queue: Record<string, unknown>[] = [];
let timer: ReturnType<typeof setTimeout> | undefined;
let memoryDisabled = false;

export function analyticsEnabled() {
  if (
    typeof window === 'undefined' ||
    memoryDisabled ||
    navigator.doNotTrack === '1' ||
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl
  )
    return false;
  try {
    return localStorage.getItem(preferenceKey) !== 'true';
  } catch {
    return false;
  }
}
export function setAnalyticsEnabled(enabled: boolean) {
  memoryDisabled = !enabled;
  try {
    localStorage.setItem(preferenceKey, String(!enabled));
    if (!enabled) {
      localStorage.removeItem('wenbu.analytics.visitor');
      sessionStorage.removeItem('wenbu.analytics.session');
    }
  } catch {
    /* Preference applies to this page even when storage is unavailable. */
  }
  if (!enabled) {
    queue = [];
    session = undefined;
    visitor = '';
    clearTimeout(timer);
  }
  window.dispatchEvent(new Event('wenbu:analytics-preference'));
}
function identity() {
  if (!analyticsEnabled()) return;
  try {
    const now = Date.now();
    if (!visitor) {
      const stored = JSON.parse(localStorage.getItem('wenbu.analytics.visitor') || 'null');
      const v =
        stored && typeof stored.id === 'string' && stored.expires > now
          ? stored
          : { id: crypto.randomUUID(), expires: now + 30 * 86400000 };
      visitor = v.id;
      localStorage.setItem('wenbu.analytics.visitor', JSON.stringify(v));
    }
    if (!session)
      session = JSON.parse(sessionStorage.getItem('wenbu.analytics.session') || 'null') ?? undefined;
    if (!session || now - session.last > 30 * 60000) {
      const params = new URLSearchParams(location.search);
      const ref = referrerSource(document.referrer, location.origin);
      const source =
        sources.find((s) => s === params.get('utm_source')) ?? (ref === 'internal' ? 'direct' : ref);
      const medium =
        mediums.find((m) => m === params.get('utm_medium')) ??
        (['google', 'bing', 'baidu', 'duckduckgo'].includes(source)
          ? 'organic'
          : ['chatgpt', 'perplexity', 'claude', 'deepseek'].includes(source)
            ? 'ai'
            : source === 'direct'
              ? 'none'
              : 'referral');
      session = {
        id: crypto.randomUUID(),
        last: now,
        source,
        medium,
        campaign: campaigns.find((c) => c === params.get('utm_campaign')) ?? 'none',
        entry: safePage(location.pathname),
      };
    }
    session.last = now;
    sessionStorage.setItem('wenbu.analytics.session', JSON.stringify(session));
    return session;
  } catch {
    return;
  }
}
export function analyticsContext() {
  const s = identity();
  return s
    ? {
        session: s.id,
        visitor,
        source: s.source,
        medium: s.medium,
        campaign: s.campaign,
        entry: s.entry,
        page: safePage(location.pathname),
        locale: document.documentElement.lang.startsWith('zh') ? 'zh' : 'en',
        test: sessionStorage.getItem('wenbu.analytics.test') === 'true',
      }
    : undefined;
}
export function analyticsHeaders(): Record<string, string> {
  const context = analyticsContext();
  return { 'X-Wenbu-Client': 'web', 'X-Wenbu-Analytics': context ? JSON.stringify(context) : 'off' };
}
export function track(event: ClientEvent, dimensions: Dimensions = {}) {
  const context = analyticsContext();
  if (!context) return;
  queue.push({ id: crypto.randomUUID(), event, ...context, ...dimensions });
  if (queue.length >= 10) void flush();
  else if (!timer) timer = setTimeout(() => void flush(), 1500);
}
async function flush() {
  clearTimeout(timer);
  timer = undefined;
  if (!analyticsEnabled() || !queue.length) return;
  const events = queue.splice(0, 10);
  try {
    // No retry storm or duplicate conversion. Event IDs are also deduplicated on the server.
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      keepalive: true,
      credentials: 'omit',
    });
  } catch {
    /* Analytics can never block a reading. */
  }
  if (queue.length) timer = setTimeout(() => void flush(), 100);
}
export function initializeAnalytics() {
  if (initialized || location.pathname.includes('/insights')) return;
  initialized = true;
  track('page_view');
  const depth = new Set<number>();
  let engaged = false;
  let visibleSince = document.visibilityState === 'visible' ? Date.now() : 0;
  let visibleMs = 0;
  const updateVisible = () => {
    if (visibleSince) visibleMs += Date.now() - visibleSince;
    visibleSince = document.visibilityState === 'visible' ? Date.now() : 0;
    if (!engaged && visibleMs >= 30000) {
      engaged = true;
      track('engaged', { duration: 30000 });
    }
  };
  setInterval(updateVisible, 15000);
  document.addEventListener('visibilitychange', () => {
    updateVisible();
    if (document.visibilityState === 'hidden') void flush();
  });
  window.addEventListener('pagehide', () => void flush());
  window.addEventListener(
    'scroll',
    () => {
      const height = document.documentElement.scrollHeight - innerHeight;
      if (height <= 0) return;
      const percent = (scrollY / height) * 100;
      for (const value of [50, 90])
        if (percent >= value && !depth.has(value)) {
          depth.add(value);
          track('scroll_depth', { value });
        }
    },
    { passive: true },
  );
  document.addEventListener('click', (e) => {
    const el = (e.target as Element)?.closest<HTMLElement>('[data-track]');
    const action = actions.find((a) => a === el?.dataset.track);
    if (action && action !== 'none') track(action === 'source' ? 'source_opened' : 'cta_click', { action });
  });
  const forms = new WeakSet<Element>();
  document.addEventListener('focusin', (e) => {
    const form = (e.target as Element)?.closest('form');
    if (form && !forms.has(form)) {
      forms.add(form);
      track('form_started');
    }
  });
}

## src/components/AnalyticsDashboard.tsx
import { useState } from 'react';
import { BarChart3, Download, LockKeyhole, RefreshCw, LogOut } from 'lucide-react';
import { campaigns, sources } from '../lib/analytics-contract';
type Row = Record<string, string | number | null>;
type Report = { generatedAt: string; days: number; includeTest: boolean; data: Record<string, Row[]> };
const number = (value: unknown) => (typeof value === 'number' ? value.toLocaleString() : '0');
export default function AnalyticsDashboard() {
  const [token, setToken] = useState('');
  const [report, setReport] = useState<Report>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    days: '7',
    source: '',
    campaign: '',
    locale: '',
    device: '',
    channel: '',
    test: 'false',
  });
  async function load() {
    if (!token.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/analytics?' + new URLSearchParams(filters), {
        headers: { Authorization: `Bearer ${token.trim()}` },
        cache: 'no-store',
      });
      if (!response.ok)
        throw new Error(
          response.status === 401 ? '管理密钥无效，请检查后再试。' : '统计暂时不可用，请稍后刷新。',
        );
      setReport(await response.json());
    } catch (e) {
      setReport(undefined);
      setError(e instanceof Error ? e.message : '加载失败');
    } finally {
      setBusy(false);
    }
  }
  const summary = report?.data.summary[0] ?? {};
  const funnel = report?.data.funnel[0] ?? {};
  const select = (key: keyof typeof filters, title: string, options: readonly string[]) => (
    <label>
      {title}
      <select value={filters[key]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}>
        {key !== 'days' && <option value="">全部</option>}
        {options.map((v) => (
          <option key={v} value={v}>
            {v}
          </option>
        ))}
      </select>
    </label>
  );
  function download() {
    if (!report) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wenbu-analytics.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const breakdownNames: Record<string, string> = {
    source: '访问来源',
    medium: '渠道类型',
    campaign: '推广活动',
    page: '浏览页面',
    entry_page: '进入页面',
    locale: '语言',
    device: '设备',
    browser: '浏览器',
    os: '操作系统',
    country: '国家 / 地区',
    channel: '使用方式',
    tool: '工具',
    mode: 'Agent 模式',
    action: '入口点击',
  };
  return (
    <section className="insights shell">
      <header className="insights-header">
        <div>
          <span className="eyebrow accent">WENBU · PRODUCT OBSERVATORY</span>
          <h1>
            <BarChart3 size={28} />
            访问与使用
          </h1>
          <p>从哪里来，在哪里开始，是否真正得到结果。</p>
        </div>
        <span className="insights-private">
          <LockKeyhole size={14} />
          仅管理员可见
        </span>
      </header>
      {!report ? (
        <form
          className="insights-login"
          onSubmit={(e) => {
            e.preventDefault();
            void load();
          }}
        >
          <LockKeyhole size={26} />
          <h2>打开数据观察室</h2>
          <p>输入管理密钥查看汇总。密钥只用于本页请求，不写入网址或浏览器存储。</p>
          <label>
            管理密钥
            <input
              type="password"
              autoComplete="off"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </label>
          <button className="button" disabled={busy}>
            {busy ? '正在验证…' : '查看统计'}
          </button>
        </form>
      ) : (
        <>
          <form
            className="insights-filters"
            onSubmit={(e) => {
              e.preventDefault();
              void load();
            }}
          >
            {select('days', '最近天数', ['1', '7', '30', '90'])}
            {select('source', '来源', sources)}
            {select('campaign', '活动', campaigns)}
            {select('locale', '语言', ['zh', 'en'])}
            {select('device', '设备', ['mobile', 'desktop', 'tablet', 'bot', 'unknown'])}
            {select('channel', '使用方式', ['web', 'api', 'cli', 'mcp'])}
            <label className="insights-test">
              <input
                type="checkbox"
                checked={filters.test === 'true'}
                onChange={(e) => setFilters({ ...filters, test: String(e.target.checked) })}
              />
              包含测试流量
            </label>
            <button className="button" disabled={busy}>
              <RefreshCw size={14} />
              {busy ? '读取中' : '应用筛选'}
            </button>
          </form>
          <div className="insights-toolbar">
            <span>
              最近 {report.days} 天 · UTC · {report.includeTest ? '包含测试' : '已排除测试'} ·{' '}
              {new Date(report.generatedAt).toLocaleString('zh-CN')}
            </span>
            <button onClick={download}>
              <Download size={15} />
              导出汇总
            </button>
            <button
              onClick={() => {
                setToken('');
                setReport(undefined);
              }}
            >
              <LogOut size={15} />
              退出
            </button>
          </div>
          <div className="insights-metrics">
            {[
              ['pageviews', '页面浏览'],
              ['visitors', '匿名访客'],
              ['sessions', '访问会话'],
              ['calculations', '成功计算'],
              ['agent_complete', 'Agent 完成回合'],
              ['failures', '服务失败 / 中断'],
            ].map(([key, label]) => (
              <article key={key}>
                <span>{label}</span>
                <strong>{number(summary[key])}</strong>
              </article>
            ))}
          </div>
          {!summary.events && (
            <p className="insights-empty">这个范围内还没有记录。上线后的真实访问和功能使用会在这里出现。</p>
          )}
          <div className="insights-primary">
            <article className="insights-card">
              <h2>每日访问与使用</h2>
              <p>柱高代表浏览量，旁边列出成功计算次数。</p>
              <div className="insights-timeline">
                {report.data.daily.map((row) => (
                  <div key={String(row.label)}>
                    <span>{String(row.label).slice(5)}</span>
                    <i
                      style={{
                        width: `${Math.max(2, (Number(row.views) / Math.max(1, ...report.data.daily.map((d) => Number(d.views)))) * 100)}%`,
                      }}
                    />
                    <b>
                      {number(row.views)} <small>浏览 · {number(row.calculations)} 计算</small>
                    </b>
                  </div>
                ))}
              </div>
            </article>
            <article className="insights-card">
              <h2>会话覆盖漏斗</h2>
              <p>同一会话内包含各阶段，成功必须有服务端记录。点击不算完成。</p>
              {[
                ['visited', '访问页面'],
                ['started', '开始工具或对话'],
                ['succeeded', '实际完成'],
                ['saved', '保存为手记'],
              ].map(([key, label], i) => (
                <div className="insights-funnel" key={key}>
                  <span>0{i + 1}</span>
                  <strong>{label}</strong>
                  <b>{number(funnel[key])}</b>
                </div>
              ))}
              <small>会话覆盖统计，不推断跨设备身份或因果关系。</small>
            </article>
          </div>
          <div className="insights-breakdowns">
            {Object.entries(breakdownNames).map(([key, label]) => (
              <details
                className="insights-card"
                key={key}
                open={['source', 'page', 'tool', 'device'].includes(key)}
              >
                <summary>{label}</summary>
                <div className="insights-table">
                  <table>
                    <thead>
                      <tr>
                        <th>维度</th>
                        <th>事件</th>
                        <th>会话</th>
                        <th>成功</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.data[key].map((row) => (
                        <tr key={String(row.label)}>
                          <th>{String(row.label)}</th>
                          <td>{number(row.events)}</td>
                          <td>{number(row.sessions)}</td>
                          <td>{number(row.successes)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            ))}
          </div>
          <details className="insights-card">
            <summary>服务状态与耗时</summary>
            <div className="insights-table">
              <table>
                <thead>
                  <tr>
                    <th>功能</th>
                    <th>状态</th>
                    <th>次数</th>
                    <th>平均耗时</th>
                    <th>最大耗时</th>
                  </tr>
                </thead>
                <tbody>
                  {report.data.performance.map((row, i) => (
                    <tr key={i}>
                      <th>{row.label}</th>
                      <td>{row.status}</td>
                      <td>{number(row.count)}</td>
                      <td>{number(row.average_ms)} ms</td>
                      <td>{number(row.max_ms)} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
          <details className="insights-card">
            <summary>全部事件与接收位置</summary>
            <div className="insights-table">
              <table>
                <thead>
                  <tr>
                    <th>事件</th>
                    <th>接收位置</th>
                    <th>状态</th>
                    <th>数量</th>
                  </tr>
                </thead>
                <tbody>
                  {report.data.events.map((row, i) => (
                    <tr key={i}>
                      <th>{row.label}</th>
                      <td>{row.origin}</td>
                      <td>{row.status}</td>
                      <td>{number(row.count)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      <p className="insights-footnote">
        匿名访客是 30
        天有效的浏览器标识，不代表精确人数。统计遵循用户关闭选项和浏览器隐私信号；拦截、离线和自动化流量会影响覆盖。事件保留
        90 天。数据用于产品改进，不用于计费。
      </p>
    </section>
  );
}

## src/components/AnalyticsPreference.tsx
import { useEffect, useState } from 'react';
import { analyticsEnabled, setAnalyticsEnabled } from '../lib/analytics';
import type { Locale } from '../lib/schema';
export default function AnalyticsPreference({ locale }: { locale: Locale }) {
  const [enabled, setEnabled] = useState(false);
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    setEnabled(analyticsEnabled());
    setBlocked(
      navigator.doNotTrack === '1' ||
        Boolean((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl),
    );
  }, []);
  return (
    <aside className="analytics-preference">
      <h2>{locale === 'zh' ? '本浏览器的统计偏好' : 'Measurement preference for this browser'}</h2>
      <label>
        <input
          type="checkbox"
          checked={enabled}
          disabled={blocked}
          onChange={(event) => {
            setAnalyticsEnabled(event.target.checked);
            setEnabled(analyticsEnabled());
          }}
        />
        {locale === 'zh' ? '允许匿名使用统计' : 'Allow anonymous usage measurement'}
      </label>
      <p role="status">
        {blocked
          ? locale === 'zh'
            ? '浏览器的隐私信号已关闭统计。'
            : 'Your browser privacy signal has disabled measurement.'
          : enabled
            ? locale === 'zh'
              ? '已开启。仅记录功能使用，不记录你写下的内容。'
              : 'Enabled. Records feature use, never what you write.'
            : locale === 'zh'
              ? '已关闭。工具和对话仍可正常使用。'
              : 'Disabled. Tools and conversations continue to work.'}
      </p>
    </aside>
  );
}

## src/components/TarotCard.tsx
import { useRef, useState } from 'react';
import { Maximize2, X } from 'lucide-react';
import type { TarotResult } from '../lib/tarot';
import type { Locale } from '../lib/schema';
import { tarotArt } from '../data/tarot-art';
import { track } from '../lib/analytics';

export default function TarotCard({ card, locale }: { card: TarotResult['cards'][number]; locale: Locale }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [failed, setFailed] = useState(false);
  const name = locale === 'zh' ? card.zh : card.en;
  const orientation =
    locale === 'zh' ? (card.reversed ? '逆位' : '正位') : card.reversed ? 'Reversed' : 'Upright';
  const keywords =
    locale === 'zh'
      ? card.reversed
        ? card.reversedZh
        : card.keywordsZh
      : card.reversed
        ? card.reversedEn
        : card.keywordsEn;
  const src = tarotArt[card.id];
  return (
    <>
      <button
        type="button"
        className={`tarot-face illustrated ${card.reversed ? 'reversed' : ''}`}
        aria-label={locale === 'zh' ? `放大查看${name} · ${orientation}` : `Inspect ${name} · ${orientation}`}
        onClick={() => {
          dialog.current?.showModal();
          track('card_inspected', { tool: 'tarot', action: 'inspect' });
        }}
      >
        {!failed && src ? (
          <img
            src={src}
            alt=""
            width="600"
            height="900"
            decoding="async"
            loading={preview ? 'lazy' : 'eager'}
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="card-unavailable">
            {name}
            <small>{locale === 'zh' ? '插画暂未载入' : 'Artwork unavailable'}</small>
          </span>
        )}
        <span className="card-inspect">
          <Maximize2 size={13} />
          <span>{locale === 'zh' ? '细看' : 'Inspect'}</span>
        </span>
      </button>
      <dialog
        ref={dialog}
        className="tarot-lightbox"
        aria-label={`${name} · ${orientation}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="tarot-lightbox-inner">
          <button
            className="tarot-close"
            aria-label={locale === 'zh' ? '关闭卡牌' : 'Close card'}
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
          <img
            className={card.reversed ? 'is-reversed' : undefined}
            src={src}
            alt={`${name} · ${orientation}`}
            width="600"
            height="900"
          />
          <div className="tarot-lightbox-copy">
            <span className="eyebrow">
              WENBU · {card.arcana === 'major' ? 'MAJOR ARCANA' : card.suit.toUpperCase()}
            </span>
            <h3>
              {name} <small>{orientation}</small>
            </h3>
            <p>{keywords}</p>
            <span className="small-label">
              {locale === 'zh'
                ? '问卜原创 AI 插画 · 以传统意象重新绘制'
                : 'Original AI artwork · a reinterpretation of traditional imagery'}
            </span>
          </div>
        </div>
      </dialog>
    </>
  );
}

## src/components/TarotGallery.tsx
import { useState } from 'react';
import { tarotDeck } from '../data/tarot';
import type { Locale } from '../lib/schema';
import TarotCard from './TarotCard';
import { href } from '../lib/i18n';
export default function TarotGallery({ locale }: { locale: Locale }) {
  const [suit, setSuit] = useState('all');
  const t = (zh: string, en: string) => (locale === 'zh' ? zh : en);
  const groups = [
    ['all', '全部', 'All 78'],
    ['major', '大阿卡纳', 'Major arcana'],
    ['wands', '权杖', 'Wands'],
    ['cups', '圣杯', 'Cups'],
    ['swords', '宝剑', 'Swords'],
    ['pentacles', '星币', 'Pentacles'],
  ];
  return (
    <section className="tarot-gallery shell">
      <div className="gallery-heading">
        <span className="eyebrow accent">THE WENBU DECK</span>
        <h1>{t('一副牌，七十八种看法。', 'One deck. Seventy-eight perspectives.')}</h1>
        <p>
          {t(
            '以纸本版画的笔触，重新绘制传统塔罗意象。选一张细看，先认识它的象征，再带着自己的问题去探索。',
            'Original AI illustrations reinterpret traditional tarot imagery as hand-colored engravings. Open a card, learn its theme, then bring your own question.',
          )}
        </p>
        <a className="text-link" data-track="tool-entry" href={href(locale, 'tarot')}>
          {t('带着问题抽牌', 'Draw with a question')} ↗
        </a>
      </div>
      <div className="gallery-filters" aria-label={t('筛选牌组', 'Filter by suit')}>
        {groups.map(([key, zh, en]) => (
          <button key={key} aria-pressed={suit === key} onClick={() => setSuit(key)}>
            {t(zh, en)}
            <span>{key === 'all' ? 78 : key === 'major' ? 22 : 14}</span>
          </button>
        ))}
      </div>
      <div className="tarot-gallery-grid">
        {tarotDeck
          .filter((card) => suit === 'all' || card.suit === suit)
          .map((card) => (
            <article key={card.id}>
              <TarotCard
                card={{ ...card, reversed: false, position: 'reflection' }}
                locale={locale}
                preview
              />
              <h2>{t(card.zh, card.en)}</h2>
              <p>{t(card.keywordsZh, card.keywordsEn)}</p>
              <small>
                {t('逆位：', 'Reversed: ')}
                {t(card.reversedZh, card.reversedEn)}
              </small>
            </article>
          ))}
      </div>
      <p className="gallery-note">
        {t(
          '插画为问卜原创 AI 图像，属于传统意象的重新演绎，不是历史牌面的复制品；个别意象采用更温和的表达。牌义是反思提示，不是对未来的事实判断。',
          'Original AI artwork reinterprets traditional imagery, with gentler symbolic alternatives in some cards. It is not a historical facsimile. Meanings are prompts for reflection, not verified predictions.',
        )}
      </p>
    </section>
  );
}

## tests/analytics.test.ts
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  analyticsReport,
  authorizedAnalytics,
  collectEvents,
  eventBatch,
  pruneAnalytics,
  recordService,
} from '../worker/analytics';
import { pagePaths, referrerSource, safePage } from '../src/lib/analytics-contract';
import { articles } from '../src/data/articles';
import { comparisons } from '../src/data/comparisons';
import { pages } from '../src/data/pages';
import type { Env } from '../worker/types';

function database() {
  const sql = new DatabaseSync(':memory:');
  sql.exec(readFileSync(new URL('../migrations/0001_analytics.sql', import.meta.url), 'utf8'));
  const prepare = (query: string, args: (string | number | null)[] = []) => ({
    bind: (...values: (string | number | null)[]) => prepare(query, values),
    all: async () => ({ results: sql.prepare(query).all(...args), success: true, meta: { changes: 0 } }),
    run: async () => ({
      results: [],
      success: true,
      meta: { changes: Number(sql.prepare(query).run(...args).changes) },
    }),
    query,
  });
  const binding = {
    prepare,
    batch: async (items: ReturnType<typeof prepare>[]) =>
      Promise.all(items.map((i) => (i.query.startsWith('INSERT') ? i.run() : i.all()))),
  };
  return {
    sql,
    env: { ANALYTICS: binding, ANALYTICS_ADMIN_TOKEN: 'test-only-private-admin' } as unknown as Env,
  };
}
function context() {
  return {
    session: crypto.randomUUID(),
    visitor: crypto.randomUUID(),
    page: '/tarot/',
    entry: '/',
    source: 'google',
    medium: 'organic',
    campaign: 'launch',
    locale: 'zh',
    test: false,
  };
}
const request = (headers: Record<string, string> = {}) =>
  new Request('https://wenbu.genedai.me/api/v1/tarot', { headers });
describe('closed analytics contract', () => {
  it('rejects free-form text, identifiers in unexpected fields and forged server events', () => {
    const event = { ...context(), id: crypto.randomUUID(), event: 'page_view' };
    expect(() => eventBatch.parse({ events: [{ ...event, question: 'private question' }] })).toThrow();
    expect(() => eventBatch.parse({ events: [{ ...event, event: 'calculation_succeeded' }] })).toThrow();
    expect(() => eventBatch.parse({ events: [{ ...event, campaign: 'someone@example.com' }] })).toThrow();
    expect(() => eventBatch.parse({ events: Array(11).fill(event) })).toThrow();
  });
  it('covers every public content path and discards unknown URLs and search details', () => {
    for (const path of [
      ...Object.keys(pages),
      ...articles.map((a) => `${a.category}/${a.slug}`),
      ...comparisons.map((c) => `compare/${c.slug}`),
    ])
      expect(pagePaths).toContain(path);
    expect(safePage('/en/tarot/?question=private#name')).toBe('/tarot/');
    expect(safePage('/private-person-1988/')).toBe('/other/');
    expect(referrerSource('https://www.google.com/search?q=private', 'https://wenbu.genedai.me')).toBe(
      'google',
    );
    expect(referrerSource('https://someone.example/private', 'https://wenbu.genedai.me')).toBe('other');
  });
  it('deduplicates receipts in actual SQLite and stores no raw request data', async () => {
    const { sql, env } = database();
    const event = { ...context(), id: crypto.randomUUID(), event: 'page_view' };
    expect(
      await collectEvents(
        { events: [event] },
        request({ 'User-Agent': 'Mozilla/5.0 Macintosh Chrome/130', 'CF-Connecting-IP': '198.51.100.1' }),
        env,
      ),
    ).toEqual({ accepted: 1 });
    expect(await collectEvents({ events: [event] }, request(), env)).toEqual({ accepted: 0 });
    const row = sql.prepare('SELECT * FROM events').get();
    expect(row).toMatchObject({ device: 'desktop', browser: 'chrome', os: 'macos', page: '/tarot/' });
    expect(JSON.stringify(row)).not.toContain('198.51.100.1');
    sql.close();
  });
  it.each([{ DNT: '1' }, { 'Sec-GPC': '1' }, { 'X-Wenbu-Analytics': 'off' }])(
    'honors opt-out %j on both ingestion paths',
    async (headers) => {
      const { sql, env } = database();
      await collectEvents(
        { events: [{ ...context(), id: crypto.randomUUID(), event: 'page_view' }] },
        request(headers),
        env,
      );
      await recordService(request(headers), env, {
        event: 'calculation_succeeded',
        tool: 'tarot',
        status: 'complete',
        duration: 10,
      });
      expect(sql.prepare('SELECT COUNT(*) n FROM events').get()?.n).toBe(0);
      sql.close();
    },
  );
  it('counts actual service success separately, excludes test data and tolerates beacon reordering', async () => {
    const { sql, env } = database();
    const ctx = context();
    await recordService(request({ 'X-Wenbu-Analytics': JSON.stringify(ctx) }), env, {
      event: 'calculation_succeeded',
      tool: 'tarot',
      status: 'complete',
      duration: 15,
    });
    await collectEvents(
      {
        events: ['page_view', 'tool_started', 'journal_saved'].map((event) => ({
          ...ctx,
          id: crypto.randomUUID(),
          event,
        })),
      },
      request(),
      env,
    );
    await collectEvents(
      { events: [{ ...context(), id: crypto.randomUUID(), event: 'page_view', test: true }] },
      request(),
      env,
    );
    const report = await analyticsReport(new URL('https://wenbu.genedai.me/api/admin/analytics?days=7'), env);
    expect(report.data.summary[0]).toMatchObject({ pageviews: 1, calculations: 1, sessions: 1 });
    expect(report.data.funnel[0]).toMatchObject({ visited: 1, started: 1, succeeded: 1, saved: 1 });
    const include = await analyticsReport(
      new URL('https://wenbu.genedai.me/api/admin/analytics?test=true'),
      env,
    );
    expect(include.data.summary[0]).toMatchObject({ pageviews: 2 });
    sql.close();
  });
  it('filters without interpolating values and prunes only expired events', async () => {
    const { sql, env } = database();
    const event = { ...context(), id: crypto.randomUUID(), event: 'page_view' };
    await collectEvents({ events: [event] }, request(), env);
    const report = await analyticsReport(
      new URL('https://wenbu.genedai.me/api/admin/analytics?source=github'),
      env,
    );
    expect(report.data.summary[0].events).toBe(0);
    const injection = await analyticsReport(
      new URL("https://wenbu.genedai.me/api/admin/analytics?source=';DROP%20TABLE%20events;--"),
      env,
    );
    expect(injection.data.summary[0].events).toBe(1);
    sql.prepare('UPDATE events SET occurred_at = ?').run(Date.now() - 91 * 86400000);
    await collectEvents({ events: [{ ...event, id: crypto.randomUUID() }] }, request(), env);
    await pruneAnalytics(env);
    expect(sql.prepare('SELECT COUNT(*) n FROM events').get()?.n).toBe(1);
    sql.close();
  });
  it('requires the server secret for reports; URLs never authenticate', async () => {
    const { sql, env } = database();
    expect(await authorizedAnalytics(request(), env)).toBe(false);
    expect(await authorizedAnalytics(request({ Authorization: 'Bearer wrong' }), env)).toBe(false);
    expect(await authorizedAnalytics(request({ Authorization: 'Bearer test-only-private-admin' }), env)).toBe(
      true,
    );
    sql.close();
  });
});

## migrations/0001_analytics.sql
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY, occurred_at INTEGER NOT NULL,
  event TEXT NOT NULL, origin TEXT NOT NULL,
  session_id TEXT, visitor_id TEXT,
  page TEXT NOT NULL, entry_page TEXT NOT NULL,
  locale TEXT NOT NULL, source TEXT NOT NULL, medium TEXT NOT NULL, campaign TEXT NOT NULL,
  device TEXT NOT NULL, browser TEXT NOT NULL, os TEXT NOT NULL, country TEXT NOT NULL,
  channel TEXT NOT NULL, tool TEXT NOT NULL, mode TEXT NOT NULL, action TEXT NOT NULL, status TEXT NOT NULL,
  value INTEGER NOT NULL DEFAULT 0, duration_ms INTEGER NOT NULL DEFAULT 0,
  model_calls INTEGER NOT NULL DEFAULT 0, tool_calls INTEGER NOT NULL DEFAULT 0,
  artifacts INTEGER NOT NULL DEFAULT 0, is_test INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS events_time ON events(occurred_at);
CREATE INDEX IF NOT EXISTS events_event_time ON events(event, occurred_at);
CREATE INDEX IF NOT EXISTS events_session ON events(session_id, occurred_at);
