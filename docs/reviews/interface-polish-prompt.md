Review the Wenbu UI polish change. Look for actual regressions in state correctness, locale wrapping, accessibility, reduced motion, and request behavior. CSS changes should preserve full critical labels and not hide content. Do not infer runtime tests. No tool calls. Return concrete defects with location and fix, or No blocking defects found.

diff --git a/src/components/AgentOnboarding.tsx b/src/components/AgentOnboarding.tsx
index cf63bd4..4542ea2 100644
--- a/src/components/AgentOnboarding.tsx
+++ b/src/components/AgentOnboarding.tsx
@@ -82,7 +82,10 @@ export default function AgentOnboarding({
     }
   }
   return (
-    <div className={`agent-welcome agent-onboarding ${step === 0 ? 'is-intro' : 'is-detail'}`}>
+    <div
+      className={`agent-welcome agent-onboarding ${step === 0 ? 'is-intro' : 'is-detail'}`}
+      data-ready={ready}
+    >
       <div className="agent-onboarding-heading">
         <span className="agent-guide-mark" aria-hidden="true">
           问
diff --git a/src/components/AgentWorkspace.tsx b/src/components/AgentWorkspace.tsx
index 972b396..b9890f5 100644
--- a/src/components/AgentWorkspace.tsx
+++ b/src/components/AgentWorkspace.tsx
@@ -733,8 +733,8 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
           </div>
         )}
         {notice && (
-          <div className="agent-notice" role="status">
-            {notice}
+          <div className="agent-notice" role="status" key={notice}>
+            <span>{notice}</span>
             <button
               className="agent-icon-button"
               aria-label={t('关闭提示', 'Dismiss')}
@@ -999,6 +999,12 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
               if (!busy) void send();
             }}
           >
+            {isSuggestionIntact(draft, stagedSuggestion.current) && stagedSuggestion.current.text && (
+              <div className="agent-draft-receipt" role="status" key={stagedSuggestion.current.text}>
+                <Check size={13} aria-hidden="true" />
+                <span>{t('已放入草稿，可修改后发送', 'Draft added · edit before sending')}</span>
+              </div>
+            )}
             <textarea
               ref={textarea}
               value={draft}
@@ -1028,6 +1034,10 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
                 <button
                   type="button"
                   className={active?.mode === 'explore' ? 'selected' : ''}
+                  title={t(
+                    '围绕你的问题对话，按需使用排盘与抽取工具',
+                    'Talk through your question and use reading tools when needed',
+                  )}
                   onClick={() => active && mutateSession(active.id, (s) => ({ ...s, mode: 'explore' }))}
                 >
                   <Compass size={13} />
@@ -1036,6 +1046,10 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
                 <button
                   type="button"
                   className={active?.mode === 'research' ? 'selected' : ''}
+                  title={t(
+                    '查阅资料、核对出处，整理研究札记',
+                    'Read sources and prepare a referenced research note',
+                  )}
                   onClick={() => active && mutateSession(active.id, (s) => ({ ...s, mode: 'research' }))}
                 >
                   <BookOpen size={13} />
diff --git a/src/components/ReadingView.tsx b/src/components/ReadingView.tsx
index dd940d1..c789027 100644
--- a/src/components/ReadingView.tsx
+++ b/src/components/ReadingView.tsx
@@ -1,4 +1,5 @@
 import { useState } from 'react';
+import { MousePointer2, ZoomIn } from 'lucide-react';
 import TarotCard from './TarotCard';
 import type { Reading } from '../lib/tools';
 import type { Locale } from '../lib/schema';
@@ -79,6 +80,10 @@ export default function ReadingView({ result, locale }: { result: Reading; local
             </svg>
           </div>
           <div className="element-detail">
+            <p className="reading-hint">
+              <MousePointer2 size={13} aria-hidden="true" />
+              {t('点选五行，查看构成', 'Select an element to explore')}
+            </p>
             <h3>{t('你的五行底色', 'Your elemental palette')}</h3>
             <div className="element-buttons">
               {result.elements.map((e, i) => (
@@ -188,6 +193,10 @@ export default function ReadingView({ result, locale }: { result: Reading; local
   if (result.kind === 'tarot')
     return (
       <div className="tarot-result">
+        <p className="reading-hint">
+          <ZoomIn size={13} aria-hidden="true" />
+          {t('轻点牌面，放大看细节', 'Open a card to see the details')}
+        </p>
         <div className={`drawn-cards count-${result.cards.length}`}>
           {result.cards.map((card, i) => (
             <div
@@ -231,8 +240,8 @@ export default function ReadingView({ result, locale }: { result: Reading; local
           <summary>{t('抽牌方法与牌义', 'Draw method & card notes')}</summary>
           <p>
             {t(
-              '78 张完整牌组，不放回随机抽取。逆位开启时，每张牌独立以 50% 概率逆位。牌面为原创抽象图形。',
-              'A full 78-card deck, drawn without replacement. When enabled, each card independently has a 50% chance of reversal. Artwork is original and abstract.',
+              '78 张完整牌组，不放回随机抽取。逆位开启时，每张牌独立以 50% 概率逆位。牌面为问卜原创 AI 插画。',
+              'A full 78-card deck, drawn without replacement. When enabled, each card independently has a 50% chance of reversal. Original AI illustrations by Wenbu.',
             )}
           </p>
           {result.cards.map((c) => (
@@ -300,7 +309,7 @@ export default function ReadingView({ result, locale }: { result: Reading; local
         ))}
       </div>
       <div className="palace-detail" aria-live="polite">
-        <h3>
+        <h3 key={current.name}>
           {current.name}
           {t(current.name.endsWith('宫') ? '' : '宫', ' palace')}
         </h3>
diff --git a/src/components/ToolDesk.tsx b/src/components/ToolDesk.tsx
index bb56e19..54fa975 100644
--- a/src/components/ToolDesk.tsx
+++ b/src/components/ToolDesk.tsx
@@ -16,6 +16,7 @@ import { choose, href } from '../lib/i18n';
 import { agentContext, downloadJson, readJournal, writeJournal, type Answer } from '../lib/journal';
 import ReadingView from './ReadingView';
 import { analyticsHeaders, track } from '../lib/analytics';
+import '../styles/reading-motion.css';

 async function post<T>(
   path: string,
@@ -565,6 +566,13 @@ export default function ToolDesk({ kind, locale }: { kind: ToolKind; locale: Loc
         </div>
       </div>
       <div className="tool-result-panel" ref={resultRef} aria-busy={busy}>
+        <p className="tool-status" role="status" aria-atomic="true">
+          {busy
+            ? t('正在生成图景。', 'Preparing your reading.')
+            : result
+              ? t('图景已展开，可以查看结果。', 'Your reading is ready to explore.')
+              : ''}
+        </p>
         {!result ? (
           <div className="empty-reading">
             <div className="empty-orbit">
@@ -588,10 +596,10 @@ export default function ToolDesk({ kind, locale }: { kind: ToolKind; locale: Loc
             </a>
           </div>
         ) : (
-          <>
-            <div className="step-label">
+          <div className="reading-arrival">
+            <div className="step-label reading-complete">
               <span>02</span>
-              {t('看见你的图景', 'Your perspective, made visible')}
+              {t('图景已展开', 'Your reading is ready')}
               <button
                 className="icon-button"
                 type="button"
@@ -607,7 +615,7 @@ export default function ToolDesk({ kind, locale }: { kind: ToolKind; locale: Loc
               </button>
             </div>
             <ReadingView result={result} locale={locale} />
-            <div className="reading-actions">
+            <div className="reading-actions" data-saved={saved}>
               <button className="button secondary" type="button" onClick={save} disabled={saved}>
                 {saved ? <Check size={15} /> : <Bookmark size={15} />}{' '}
                 {t(saved ? '已保存到手记' : '保存到手记', saved ? 'Saved to journal' : 'Save reading')}
@@ -617,6 +625,13 @@ export default function ToolDesk({ kind, locale }: { kind: ToolKind; locale: Loc
                 {t('导出给 Agent', 'Export for an agent')}
               </button>
             </div>
+            <p className="reading-saved-note" role="status">
+              {saved &&
+                t(
+                  '已留在本机手记，随时回来续写。',
+                  'Saved in this browser’s journal. Return whenever you like.',
+                )}
+            </p>
             {exportOpen && (
               <div className="export-panel">
                 <h3>{t('选择要交给 Agent 的上下文', 'Choose what your agent receives')}</h3>
@@ -701,6 +716,7 @@ export default function ToolDesk({ kind, locale }: { kind: ToolKind; locale: Loc
                 className="button primary"
                 type="button"
                 onClick={() => void ask()}
+                aria-describedby="reading-request-hint"
                 disabled={aiBusy || !consent || question.trim().length < 2}
               >
                 {aiBusy ? (
@@ -715,6 +731,18 @@ export default function ToolDesk({ kind, locale }: { kind: ToolKind; locale: Loc
                   </>
                 )}
               </button>
+              <p className="reading-request-hint" id="reading-request-hint" aria-live="polite">
+                {aiBusy
+                  ? t('正在结合图景与问题整理，请稍候。', 'Bringing your question and reading together.')
+                  : question.trim().length < 2
+                    ? t(
+                        '先写下想探索的问题，再确认分享，即可开始解读。',
+                        'Add your question, then confirm sharing to begin.',
+                      )
+                    : !consent
+                      ? t('确认上方的分享选项，即可开始解读。', 'Confirm the sharing option above to begin.')
+                      : t('准备好了，点击即可开始。', 'Ready when you are.')}
+              </p>
               <p className="form-note">
                 {t(
                   '每个网络每日 5 次；全站有免费总额度。额度用完仍可排盘、抽牌与保存。',
@@ -770,7 +798,7 @@ export default function ToolDesk({ kind, locale }: { kind: ToolKind; locale: Loc
                 </article>
               )}
             </section>
-          </>
+          </div>
         )}
       </div>
     </div>
diff --git a/src/styles/agent-guidance.css b/src/styles/agent-guidance.css
index d89ead5..226a7e5 100644
--- a/src/styles/agent-guidance.css
+++ b/src/styles/agent-guidance.css
@@ -19,6 +19,7 @@
   border: 1px solid #b98a74;
   color: var(--red);
   font: 17px var(--serif);
+  flex-shrink: 0;
 }
 .agent-onboarding h1 {
   font-size: clamp(26px, 2.4vw, 35px);
@@ -115,8 +116,8 @@
   margin: 5px 0 0;
 }
 .agent-guide-back {
-  min-width: 34px;
-  min-height: 38px;
+  min-width: 44px;
+  min-height: 44px;
   display: grid;
   place-items: center;
   margin-left: -8px;
@@ -170,6 +171,7 @@
   font-size: 13px;
   font-weight: 500;
   line-height: 1.5;
+  text-wrap: balance;
 }
 .agent-guide-topics small,
 .agent-guide-goals small {
@@ -178,6 +180,7 @@
   font-size: 10px;
   line-height: 1.6;
   color: #748067;
+  text-wrap: pretty;
 }
 .agent-guide-topics > .is-unsure {
   grid-column: 1 / -1;
diff --git a/src/styles/agent-motion.css b/src/styles/agent-motion.css
index 4379d67..010e197 100644
--- a/src/styles/agent-motion.css
+++ b/src/styles/agent-motion.css
@@ -4,6 +4,56 @@
   --ritual-ink: #6c7761;
   --ritual-red: #a35a45;
 }
+.agent-draft-receipt {
+  display: flex;
+  align-items: center;
+  gap: 7px;
+  padding: 0 2px 9px;
+  color: #637654;
+  font-size: 10px;
+  line-height: 1.6;
+  animation: ritual-detail-in 220ms var(--ritual-ease);
+}
+.agent-draft-receipt svg,
+.agent-guide-progress .is-reached svg,
+.agent-onboarding[data-ready='true'] .agent-guide-rest > svg {
+  stroke-dasharray: 24;
+  animation: ritual-check-draw 350ms ease-out;
+}
+.agent-guide-progress li,
+.agent-guide-progress li > span {
+  transition:
+    color 180ms,
+    background-color 180ms,
+    border-color 180ms;
+}
+.agent-onboarding[data-ready='true'] .agent-guide-mark {
+  animation: ritual-seal-arrive 450ms var(--ritual-ease);
+}
+.agent-notice {
+  animation: ritual-detail-in 220ms var(--ritual-ease);
+}
+.agent-context-dialog[open] {
+  animation: ritual-dialog-in 220ms var(--ritual-ease);
+}
+@keyframes ritual-check-draw {
+  from {
+    stroke-dashoffset: 24;
+  }
+  to {
+    stroke-dashoffset: 0;
+  }
+}
+@keyframes ritual-dialog-in {
+  from {
+    opacity: 0.5;
+    transform: translateY(6px);
+  }
+  to {
+    opacity: 1;
+    transform: none;
+  }
+}
 .agent-motion-toggle {
   display: inline-flex;
   align-items: center;
diff --git a/src/styles/agent.css b/src/styles/agent.css
index c9e5575..fcd8cca 100644
--- a/src/styles/agent.css
+++ b/src/styles/agent.css
@@ -226,15 +226,20 @@
 }
 .agent-instruments {
   display: grid;
-  grid-template-columns: 1fr 1fr;
-  gap: 13px 14px;
+  grid-template-columns: repeat(2, minmax(0, 1fr));
+  gap: 10px 8px;
   margin: 18px 0 22px;
 }
 .agent-instruments a {
   display: flex;
   align-items: center;
   font-size: 11px;
-  gap: 7px;
+  gap: 5px;
+  min-height: 36px;
+  white-space: nowrap;
+}
+.agent-instruments a > svg:last-child {
+  display: none;
 }
 .agent-instruments a > span {
   font: 16px var(--serif);
@@ -337,6 +342,7 @@
   justify-content: center;
   color: #71796b;
   border-radius: 3px;
+  flex-shrink: 0;
 }
 .agent-icon-button:hover {
   background: #e9ece0;
@@ -701,6 +707,8 @@
   font-size: 8px;
   margin-left: auto;
   opacity: 0.85;
+  flex-shrink: 0;
+  white-space: nowrap;
 }
 .agent-tool-event.error summary {
   color: var(--red);
@@ -1187,6 +1195,7 @@
   align-items: center;
   gap: 16px;
   padding-top: 23px;
+  flex-wrap: wrap;
 }
 .agent-artifact-actions button {
   display: flex;
@@ -1265,6 +1274,8 @@
   padding: 10px 24px;
   background: #edf0e0;
   font-size: 11px;
+  flex-shrink: 0;
+  overflow-wrap: anywhere;
 }
 .agent-notice > button,
 .agent-storage-error > button {
@@ -1311,6 +1322,8 @@
   font-family: var(--serif);
   font-size: 28px;
   margin: 10px 0 15px;
+  line-height: 1.3;
+  text-wrap: balance;
 }
 .agent-context-toggle {
   display: flex;
@@ -1342,12 +1355,14 @@
 }
 .agent-birth-grid {
   display: grid;
-  grid-template-columns: 1fr 1fr;
+  grid-template-columns: repeat(2, minmax(0, 1fr));
   gap: 15px;
   padding: 22px 0 8px;
 }
 .agent-birth-grid label {
-  display: grid;
+  display: flex;
+  flex-direction: column;
+  min-width: 0;
   gap: 7px;
   font-size: 11px;
 }
@@ -1361,6 +1376,11 @@
   border-radius: 3px;
   padding: 10px;
   font-size: 12px;
+  min-height: 44px;
+}
+.agent-birth-grid input,
+.agent-birth-grid select {
+  margin-top: auto;
 }
 .agent-birth-grid > p {
   grid-column: 1 / -1;
@@ -1433,6 +1453,7 @@
   justify-content: flex-end;
   gap: 17px;
   padding-top: 24px;
+  flex-wrap: wrap;
 }
 .agent-dialog-actions > button {
   border: 0;
@@ -1440,6 +1461,8 @@
   padding: 10px 16px;
   border-radius: 3px;
   font-size: 12px;
+  min-height: 44px;
+  max-width: 100%;
 }
 .agent-dialog-actions > .primary {
   background: var(--ink);
@@ -1791,9 +1814,10 @@
     gap: 14px 10px;
   }
   .agent-birth-grid input,
-  .agent-birth-grid select {
+  .agent-birth-grid select,
+  .agent-context-note textarea {
     padding: 9px 7px;
-    font-size: 12px;
+    font-size: 16px;
   }
   .agent-birth-grid label {
     font-size: 10px;
@@ -1815,6 +1839,23 @@
     font-size: 11px;
   }
 }
+@media (max-width: 480px) {
+  .agent-birth-grid {
+    grid-template-columns: minmax(0, 1fr);
+    gap: 16px;
+  }
+  .agent-birth-grid label {
+    font-size: 12px;
+  }
+  .agent-dialog-actions {
+    gap: 8px;
+  }
+  .agent-dialog-actions > .primary {
+    flex: 1;
+    justify-content: center;
+    text-align: left;
+  }
+}
 @media (max-width: 370px) {
   .agent-provider {
     display: none;
diff --git a/src/styles/global.css b/src/styles/global.css
index 92c28c2..46450e5 100644
--- a/src/styles/global.css
+++ b/src/styles/global.css
@@ -85,6 +85,11 @@ h2,
 h3 {
   font-weight: 500;
 }
+.page-intro h1,
+.hero-copy h1,
+.home-agent-entry strong {
+  text-wrap: balance;
+}
 button:focus-visible,
 a:focus-visible,
 input:focus-visible,
@@ -946,6 +951,7 @@ html[lang='en'] .section-heading h2 {
   padding: 30px;
   background: #efeee5;
   border-right: 1px solid var(--line);
+  container-type: inline-size;
 }
 .step-label {
   font-size: 11px;
@@ -974,9 +980,13 @@ html[lang='en'] .section-heading h2 {
 }
 .field-pair {
   display: grid;
-  grid-template-columns: 1.3fr 1fr;
+  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
   gap: 12px;
 }
+.field-pair input {
+  margin-top: auto;
+  min-height: 46px;
+}
 .field input,
 .field select,
 .field textarea,
@@ -1310,6 +1320,7 @@ html[lang='en'] .section-heading h2 {
   justify-content: space-between;
   gap: 15px;
   padding: 18px 0 30px;
+  flex-wrap: wrap;
 }
 .reading-actions .button {
   font-size: 11px;
@@ -1440,12 +1451,16 @@ html[lang='en'] .section-heading h2 {
   flex: 1;
   padding: 9px 5px;
   font-size: 10px;
+  min-width: 0;
+  min-height: 44px;
+  text-wrap: balance;
 }
 .segmented button[aria-pressed='true'] {
   background: var(--ink);
   color: var(--paper-light);
 }
 .tarot-deck {
+  --deck-step: clamp(18px, calc((100cqw - 116px) / 6), 38px);
   height: 190px;
   position: relative;
   margin: 22px -5px 12px;
@@ -1456,7 +1471,7 @@ html[lang='en'] .section-heading h2 {
   height: 103px;
   top: 28px;
   left: calc(50% - 31px);
-  transform: translateX(calc(var(--card-i) * 28px)) translateY(calc(abs(var(--card-i)) * 7px))
+  transform: translateX(calc(var(--card-i) * var(--deck-step))) translateY(calc(abs(var(--card-i)) * 7px))
     rotate(calc(var(--card-i) * 8deg));
   background: #34483d;
   border: 1px solid #b1aa86;
@@ -1479,7 +1494,8 @@ html[lang='en'] .section-heading h2 {
 }
 .card-back:hover,
 .card-back.selected {
-  transform: translateX(calc(var(--card-i) * 28px)) translateY(-12px) rotate(calc(var(--card-i) * 8deg));
+  transform: translateX(calc(var(--card-i) * var(--deck-step))) translateY(-12px)
+    rotate(calc(var(--card-i) * 8deg));
   background: #a85e44;
   z-index: 2;
 }
@@ -1626,8 +1642,9 @@ html[lang='en'] .section-heading h2 {
   display: flex;
   align-items: center;
   justify-content: center;
-  width: 69px;
-  height: 69px;
+  width: min(69px, 24%);
+  height: auto;
+  aspect-ratio: 1;
   border: 1px solid #a99969;
   border-radius: 50%;
   color: #8b7a47;
@@ -2458,12 +2475,13 @@ html[lang='en'] .section-heading h2 {
     width: 70px;
     height: 110px;
     left: calc(50% - 35px);
-    transform: translateX(calc(var(--card-i) * 38px)) translateY(calc(abs(var(--card-i)) * 7px))
+    transform: translateX(calc(var(--card-i) * var(--deck-step))) translateY(calc(abs(var(--card-i)) * 7px))
       rotate(calc(var(--card-i) * 8deg));
   }
   .card-back:hover,
   .card-back.selected {
-    transform: translateX(calc(var(--card-i) * 38px)) translateY(-12px) rotate(calc(var(--card-i) * 8deg));
+    transform: translateX(calc(var(--card-i) * var(--deck-step))) translateY(-12px)
+      rotate(calc(var(--card-i) * 8deg));
   }
 }
 @media (max-width: 560px) {
@@ -3549,7 +3567,7 @@ html[lang='en'] .section-heading h2 {
 .card-back:hover,
 .card-back.selected {
   background: #34483d url('/images/tarot/back.webp') center / cover;
-  outline: 2px solid var(--vermillion);
+  outline: 2px solid var(--red);
   outline-offset: 3px;
 }
 .tarot-gallery {
@@ -3651,3 +3669,31 @@ html[lang='en'] .section-heading h2 {
     padding-bottom: 40px;
   }
 }
+
+/* Keep full labels readable when the form has less room than a two-column field. */
+@media (max-width: 480px) {
+  .field-pair {
+    grid-template-columns: minmax(0, 1fr);
+    gap: 0;
+  }
+}
+.reading-hint {
+  display: flex;
+  align-items: center;
+  gap: 7px;
+  color: #6b795f;
+  font-size: 11px;
+  line-height: 1.65;
+  margin: 0 0 18px;
+  text-wrap: pretty;
+}
+.element-detail .reading-hint {
+  margin-bottom: 8px;
+}
+.drawn-card-wrap h3 {
+  text-wrap: balance;
+  overflow-wrap: anywhere;
+}
+.agent-chart .reading-hint {
+  font-size: 10px;
+}


FILE src/styles/reading-motion.css
/* A quiet receipt for a real result. No artificial wait, no hidden reading. */
.tool-status {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.reading-complete {
  position: relative;
}
.reading-complete::after {
  content: '';
  position: absolute;
  bottom: -9px;
  left: 0;
  width: 28px;
  height: 1px;
  background: var(--red);
  transform-origin: left;
  animation: reading-ink 420ms ease-out;
}
.reading-complete > span:first-child {
  animation: reading-seal 400ms ease-out;
}
.reading-arrival .pillar {
  animation: reading-unfold 450ms ease-out backwards;
}
.reading-arrival .pillar:nth-child(2) {
  animation-delay: 60ms;
}
.reading-arrival .pillar:nth-child(3) {
  animation-delay: 120ms;
}
.reading-arrival .pillar:nth-child(4) {
  animation-delay: 180ms;
}
.reading-arrival .hex-line {
  transform-origin: left;
  animation: reading-ink 360ms ease-out backwards;
}
/* Hexagrams are rendered top first; arrival follows the traditional bottom first order. */
.reading-arrival .hex-line:nth-child(1) {
  animation-delay: 250ms;
}
.reading-arrival .hex-line:nth-child(2) {
  animation-delay: 200ms;
}
.reading-arrival .hex-line:nth-child(3) {
  animation-delay: 150ms;
}
.reading-arrival .hex-line:nth-child(4) {
  animation-delay: 100ms;
}
.reading-arrival .hex-line:nth-child(5) {
  animation-delay: 50ms;
}
.reading-arrival .palace-ring,
.reading-arrival .ai-reading,
.reading-arrival .export-panel,
.palace-detail > h3 {
  animation: reading-unfold 300ms ease-out;
}
.reading-saved-note,
.reading-request-hint {
  color: #627653;
  font-size: 11px;
  line-height: 1.75;
  text-wrap: pretty;
  margin: 10px 0 16px;
}
.reading-saved-note:empty {
  display: none;
}
.reading-saved-note:not(:empty) {
  margin-top: -15px;
  animation: reading-unfold 220ms ease-out;
}
.reading-actions[data-saved='true'] .button {
  color: #4f6a41;
  opacity: 1;
  background: #e8eddd;
  border-color: #acba9d;
}
.reading-actions[data-saved='true'] .button svg {
  stroke-dasharray: 24;
  animation: reading-check 350ms ease-out;
}
@keyframes reading-ink {
  from {
    transform: scaleX(0.84);
  }
  to {
    transform: scaleX(1);
  }
}
@keyframes reading-seal {
  from {
    transform: translateY(-3px) rotate(-6deg);
  }
  to {
    transform: none;
  }
}
@keyframes reading-unfold {
  from {
    transform: translateY(5px);
  }
  to {
    transform: none;
  }
}
@keyframes reading-check {
  from {
    stroke-dashoffset: 24;
  }
  to {
    stroke-dashoffset: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .reading-arrival *,
  .reading-arrival *::after,
  .palace-detail > h3 {
    animation: none !important;
  }
}


FILE src/components/ToolDesk.tsx
import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  RefreshCw,
  Bookmark,
  Download,
  Check,
  LoaderCircle,
  SlidersHorizontal,
  Feather,
} from 'lucide-react';
import type { Locale, ToolKind } from '../lib/schema';
import type { Reading } from '../lib/tools';
import { choose, href } from '../lib/i18n';
import { agentContext, downloadJson, readJournal, writeJournal, type Answer } from '../lib/journal';
import ReadingView from './ReadingView';
import { analyticsHeaders, track } from '../lib/analytics';
import '../styles/reading-motion.css';

async function post<T>(
  path: string,
  input: unknown,
  signal?: AbortSignal,
  action: 'example' | 'calculate' | 'none' = 'none',
): Promise<T> {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...analyticsHeaders(), 'X-Wenbu-Action': action },
    body: JSON.stringify(input),
    signal,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Request failed');
  return data;
}
export default function ToolDesk({ kind, locale }: { kind: ToolKind; locale: Locale }) {
  const t = (zh: string, en: string) => choose(locale, zh, en);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [unknown, setUnknown] = useState(false);
  const [timezone, setTimezone] = useState('Asia/Shanghai');
  const [sex, setSex] = useState<'male' | 'female'>('female');
  const [boundary, setBoundary] = useState<'midnight' | 'zi'>('midnight');
  const [solar, setSolar] = useState(false);
  const [longitude, setLongitude] = useState('');
  const [count, setCount] = useState<1 | 3>(3);
  const [reversals, setReversals] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [castMode, setCastMode] = useState<'random' | 'manual'>('random');
  const [lines, setLines] = useState([7, 8, 7, 8, 7, 8]);
  const [result, setResult] = useState<Reading | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [question, setQuestion] = useState('');
  const [context, setContext] = useState('');
  const [consent, setConsent] = useState(false);
  const [answer, setAnswer] = useState<Answer | undefined>();
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState('');
  const [provenance, setProvenance] = useState('');
  const [remaining, setRemaining] = useState<number>();
  const [saved, setSaved] = useState(false);
  const [note, setNote] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [includeBirth, setIncludeBirth] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const aiAbort = useRef<AbortController | null>(null);
  const lock = useRef(false);
  const entryId = useRef<string | null>(null);
  useEffect(() => () => aiAbort.current?.abort(), []);
  function invalidateAnswer() {
    aiAbort.current?.abort();
    setAiBusy(false);
    setAnswer(undefined);
    setSaved(false);
  }
  function changeQuestion(value: string) {
    setQuestion(value);
    invalidateAnswer();
  }
  function changeContext(value: string) {
    setContext(value);
    invalidateAnswer();
  }
  const input = () =>
    kind === 'bazi'
      ? {
          date,
          time: unknown ? null : time,
          timezone,
          dayBoundary: boundary,
          solarTime: solar && !unknown,
          ...(solar && !unknown ? { longitude: Number(longitude) } : {}),
          locale,
        }
      : kind === 'ziwei'
        ? { date, time, sex, locale }
        : kind === 'tarot'
          ? { count, reversals, locale }
          : { ...(castMode === 'manual' ? { lines } : {}), locale };
  async function run(demo = false) {
    if (lock.current) return;
    lock.current = true;
    track('tool_started', { tool: kind, action: demo ? 'example' : 'calculate' });
    setBusy(true);
    setError('');
    setAiError('');
    setAnswer(undefined);
    setProvenance('');
    setSaved(false);
    setExportOpen(false);
    setIncludeBirth(false);
    setNote('');
    setRemaining(undefined);
    setConsent(false);
    setResult(null);
    entryId.current = null;
    aiAbort.current?.abort();
    setAiBusy(false);
    let payload = input();
    if (demo && (kind === 'bazi' || kind === 'ziwei')) {
      setDate('2000-08-16');
      setTime('03:30');
      setTimezone('Asia/Shanghai');
      setUnknown(false);
      setSolar(false);
      setBoundary('midnight');
      payload =
        kind === 'bazi'
          ? {
              date: '2000-08-16',
              time: '03:30',
              timezone: 'Asia/Shanghai',
              dayBoundary: 'midnight',
              solarTime: false,
              locale,
            }
          : { date: '2000-08-16', time: '03:30', sex, locale };
    }
    try {
      const data = await post<Reading>(`/api/v1/${kind}`, payload, undefined, demo ? 'example' : 'calculate');
      setResult(data);
      track('result_viewed', { tool: kind });
      entryId.current = crypto.randomUUID();
      setSelected([]);
      requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
          block: 'start',
        }),
      );
    } catch (e) {
      track('client_error', { tool: kind, status: 'error' });
      setError(
        e instanceof Error ? e.message : t('连接失败，请重试。', 'Connection failed. Please try again.'),
      );
      setSelected([]);
    } finally {
      setBusy(false);
      lock.current = false;
    }
  }
  function selectCard(i: number) {
    if (busy || selected.includes(i)) return;
    const next = [...selected, i];
    setSelected(next);
    if (next.length === count) void run();
  }
  async function ask() {
    if (!result || aiBusy || !consent || question.trim().length < 2) return;
    track('ai_requested', { tool: kind });
    setAiBusy(true);
    setAiError('');
    const controller = new AbortController();
    aiAbort.current = controller;
    const readingInput =
      result.kind === 'tarot'
        ? { cards: result.cards.map((c) => ({ id: c.id, reversed: c.reversed })) }
        : result.kind === 'iching'
          ? { lines: result.lines, locale }
          : result.input;
    try {
      const data = await post<{ answer: Answer; remaining: number; provenance: { servedModel: string } }>(
        '/api/v1/interpret',
        { kind, input: readingInput, question, context, locale, consent: true },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setAnswer(data.answer);
      track('ai_result_viewed', { tool: kind });
      setRemaining(data.remaining);
      setProvenance(data.provenance.servedModel);
      setSaved(false);
    } catch (e) {
      if (!controller.signal.aborted && e instanceof Error && e.name !== 'AbortError') setAiError(e.message);
    } finally {
      if (aiAbort.current === controller) setAiBusy(false);
    }
  }
  function save() {
    if (!result || saved) return;
    try {
      const entries = readJournal();
      const id = entryId.current ?? crypto.randomUUID();
      entryId.current = id;
      const previous = entries.find((e) => e.id === id);
      writeJournal([
        {
          id,
          createdAt: previous?.createdAt ?? new Date().toISOString(),
          context,
          provenance: answer ? provenance : undefined,
          kind,
          result,
          question,
          note,
          answer,
        },
        ...entries.filter((e) => e.id !== id),
      ]);
      setSaved(true);
      track('journal_saved', { tool: kind, action: 'save' });
    } catch {
      setAiError(
        t('浏览器无法保存，请使用导出备份。', 'Browser storage is unavailable. Please export a backup.'),
      );
    }
  }
  return (
    <div className={`tool-desk tool-${kind}`}>
      <div className="tool-form-panel">
        <div className="step-label">
          <span>01</span>
          {t(
            kind === 'bazi' || kind === 'ziwei' ? '从你的出生时刻开始' : '给自己片刻安静',
            kind === 'bazi' || kind === 'ziwei' ? 'Begin with your birth details' : 'Take a quiet moment',
          )}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run();
          }}
        >
          {kind === 'bazi' || kind === 'ziwei' ? (
            <>
              <div className="field-pair">
                <label className="field">
                  {t('公历出生日期', 'Birth date · Gregorian')}
                  <input
                    aria-label={t('公历出生日期', 'Birth date')}
                    type="date"
                    min="1901-01-01"
                    max="2099-12-31"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>
                <label className="field">
                  {t('出生时间', 'Birth time')}
                  <input
                    aria-label={t('出生时间', 'Birth time')}
                    type="time"
                    required={!unknown}
                    disabled={unknown}
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </label>
              </div>
              {kind === 'bazi' ? (
                <>
                  <label className="check-field">
                    <input type="checkbox" checked={unknown} onChange={(e) => setUnknown(e.target.checked)} />
                    {t('不确定出生时间（不生成时柱）', 'I do not know the time (omit hour pillar)')}
                  </label>
                  <label className="field">
                    {t('出生地时区', 'Time zone at birth')}
                    <select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                      {[
                        ['Asia/Shanghai', '中国大陆 / China'],
                        ['Asia/Hong_Kong', '香港 / Hong Kong'],
                        ['Asia/Taipei', '台北 / Taipei'],
                        ['Asia/Singapore', '新加坡 / Singapore'],
                        ['Asia/Tokyo', '东京 / Tokyo'],
                        ['Asia/Seoul', '首尔 / Seoul'],
                        ['Asia/Kolkata', '印度 / India'],
                        ['Europe/London', '伦敦 / London'],
                        ['Europe/Paris', '巴黎 / Paris'],
                        ['America/New_York', '纽约 / New York'],
                        ['America/Los_Angeles', '洛杉矶 / Los Angeles'],
                        ['Australia/Sydney', '悉尼 / Sydney'],
                        ['UTC', 'UTC'],
                        ['+08:00', 'UTC+08:00 · 固定偏移 / fixed offset'],
                      ].map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <details className="advanced">
                    <summary>
                      <SlidersHorizontal size={14} />
                      {t('历法选项', 'Calendar options')}
                    </summary>
                    <label className="field">
                      {t('其他 IANA 时区或 UTC 偏移', 'Other IANA time zone or UTC offset')}
                      <input
                        value={timezone}
                        maxLength={80}
                        onChange={(e) => setTimezone(e.target.value)}
                        placeholder="Asia/Shanghai"
                      />
                    </label>
                    <label className="field">
                      {t('换日规则', 'Day boundary')}
                      <select
                        value={boundary}
                        onChange={(e) => setBoundary(e.target.value as 'midnight' | 'zi')}
                      >
                        <option value="midnight">{t('零点换日（默认）', 'Midnight (default)')}</option>
                        <option value="zi">{t('子初 23:00 换日', 'Zi hour · 23:00')}</option>
                      </select>
                    </label>
                    <label className="check-field">
                      <input
                        type="checkbox"
                        checked={solar}
                        disabled={unknown}
                        onChange={(e) => setSolar(e.target.checked)}
                      />
                      {t('使用近似真太阳时', 'Approximate apparent solar time')}
                    </label>
                    {solar && !unknown && (
                      <label className="field">
                        {t('出生地经度（东正西负）', 'Longitude (east + / west −)')}
                        <input
                          type="number"
                          min="-180"
                          max="180"
                          step="any"
                          required
                          value={longitude}
                          onChange={(e) => setLongitude(e.target.value)}
                          placeholder="121.47"
                        />
                      </label>
                    )}
                    <p>
                      {t(
                        '节气按绝对时刻判断。夏令时模糊时间需输入明确偏移。真太阳时是近似值，边界时刻建议对照。',
                        'Solar terms use absolute instants. Ambiguous DST times require an explicit offset. Solar correction is approximate; compare charts near boundaries.',
                      )}
                    </p>
                  </details>
                </>
              ) : (
                <>
                  <label className="field">
                    {t('传统排盘参数', 'Traditional chart parameter')}
                    <select value={sex} onChange={(e) => setSex(e.target.value as 'male' | 'female')}>
                      <option value="female">{t('女', 'Female')}</option>
                      <option value="male">{t('男', 'Male')}</option>
                    </select>
                  </label>
                  <p className="form-note">
                    {t(
                      '用于传统顺逆行计算。输入当地钟表时间，本工具不做太阳时校正。',
                      'Used for the traditional direction rule. Enter local civil time; this tool does not apply solar correction.',
                    )}
                  </p>
                </>
              )}
              <button className="button primary full" type="submit" disabled={busy}>
                {busy ? (
                  <LoaderCircle className="spin" size={18} />
                ) : (
                  <>
                    {t('展开我的命盘', 'Reveal my chart')}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              <button
                className="text-button demo-button"
                type="button"
                onClick={() => void run(true)}
                disabled={busy}
              >
                {t('先看一份示例命盘', 'Explore an example first')} <ArrowUpRight size={14} />
              </button>
            </>
          ) : (
            <>
              <label className="field">
                {t('此刻，你想问什么？（可选）', 'What is on your mind? (optional)')}
                <textarea
                  value={question}
                  onChange={(e) => changeQuestion(e.target.value)}
                  maxLength={600}
                  rows={3}
                  placeholder={t(
                    '例如：面对新的机会，我可以注意什么？',
                    'For example: what could I pay attention to as I consider a new opportunity?',
                  )}
                />
              </label>
              <p className="form-note">
                {t(
                  '起卦或抽牌时，问题留在本页。只有主动请求解读才会发送。',
                  'Your question stays on this page until you request an AI reading.',
                )}
              </p>
              {kind === 'tarot' ? (
                <>
                  <div className="segmented" aria-label={t('牌阵', 'Spread')}>
                    <button
                      type="button"
                      aria-pressed={count === 1}
                      onClick={() => {
                        setCount(1);
                        setSelected([]);
                      }}
                    >
                      {t('一张 · 当下', 'One · Reflection')}
                    </button>
                    <button
                      type="button"
                      aria-pressed={count === 3}
                      onClick={() => {
                        setCount(3);
                        setSelected([]);
                      }}
                    >
                      {t('三张 · 探索', 'Three · Perspective')}
                    </button>
                  </div>
                  <label className="check-field">
                    <input
                      type="checkbox"
                      checked={reversals}
                      onChange={(e) => setReversals(e.target.checked)}
                    />
                    {t('包含逆位', 'Include reversed cards')}
                  </label>
                  <div className="tarot-deck" aria-label={t('选牌区', 'Card selection')}>
                    {Array.from({ length: 7 }, (_, i) => (
                      <button
                        type="button"
                        key={i}
                        className={`card-back ${selected.includes(i) ? 'selected' : ''}`}
                        style={{ '--card-i': i - 3 } as React.CSSProperties}
                        aria-label={t(`选择第 ${i + 1} 张牌`, `Choose card ${i + 1}`)}
                        disabled={busy || selected.includes(i)}
                        onClick={() => selectCard(i)}
                      >
                        <span>✦</span>
                      </button>
                    ))}
                  </div>
                  <p className="deck-instruction" aria-live="polite">
                    {busy
                      ? t('正在展开牌面…', 'Revealing your cards…')
                      : t(
                          `从完整 78 张中抽 ${count} 张 · 已选 ${selected.length} 张`,
                          `Choose ${count} · ${selected.length} selected`,
                        )}
                  </p>
                  <a className="deck-gallery-link" href={href(locale, 'tarot/deck')}>
                    {t('翻阅 78 张牌图鉴', 'Browse all 78 cards')} ↗
                  </a>
                  <button type="submit" className="button primary full" disabled={busy}>
                    {t('为我抽牌', 'Draw for me')}
                    <ArrowRight size={18} />
                  </button>
                </>
              ) : (
                <>
                  <div className="segmented">
                    <button
                      type="button"
                      aria-pressed={castMode === 'random'}
                      onClick={() => setCastMode('random')}
                    >
                      {t('在线起卦', 'Cast online')}
                    </button>
                    <button
                      type="button"
                      aria-pressed={castMode === 'manual'}
                      onClick={() => setCastMode('manual')}
                    >
                      {t('录入铜钱结果', 'Enter coin results')}
                    </button>
                  </div>
                  {castMode === 'manual' ? (
                    <div className="manual-lines">
                      {lines.map((v, i) => (
                        <label className="field" key={i}>
                          {t(
                            `第 ${i + 1} 爻${i === 0 ? '（最下方）' : ''}`,
                            `Line ${i + 1}${i === 0 ? ' (bottom)' : ''}`,
                          )}
                          <select
                            value={v}
                            onChange={(e) =>
                              setLines(lines.map((x, j) => (i === j ? Number(e.target.value) : x)))
                            }
                          >
                            {[6, 7, 8, 9].map((n) => (
                              <option value={n} key={n}>
                                {n} ·{' '}
                                {t(
                                  ['老阴', '少阳', '少阴', '老阳'][n - 6],
                                  ['Old yin', 'Young yang', 'Young yin', 'Old yang'][n - 6],
                                )}
                              </option>
                            ))}
                          </select>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className={`coin-ritual ${busy ? 'casting' : ''}`} aria-hidden="true">
                      {[0, 1, 2].map((i) => (
                        <span key={i} style={{ '--i': i } as React.CSSProperties}>
                          <i />
                          通宝
                        </span>
                      ))}
                    </div>
                  )}
                  <button className="button primary full" type="submit" disabled={busy}>
                    {busy ? (
                      <LoaderCircle className="spin" size={18} />
                    ) : (
                      <>
                        {t('静心，起一卦', 'Pause. Cast a hexagram.')}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                  <p className="form-note centered">
                    {t('六爻自下而上，记录每一处变化。', 'Six lines, bottom to top. Each change recorded.')}
                  </p>
                </>
              )}
            </>
          )}
          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
        </form>
        <div className="privacy-note">
          <span>◌</span>
          <p>
            {t(
              '不需要姓名，也不需要注册。记录仅在你主动保存时留在这台设备。',
              'No name or account needed. Readings stay on this device only when you save them.',
            )}
          </p>
        </div>
      </div>
      <div className="tool-result-panel" ref={resultRef} aria-busy={busy}>
        <p className="tool-status" role="status" aria-atomic="true">
          {busy
            ? t('正在生成图景。', 'Preparing your reading.')
            : result
              ? t('图景已展开，可以查看结果。', 'Your reading is ready to explore.')
              : ''}
        </p>
        {!result ? (
          <div className="empty-reading">
            <div className="empty-orbit">
              <i />
              <span>
                {kind === 'bazi' ? '命' : kind === 'iching' ? '易' : kind === 'tarot' ? '象' : '星'}
              </span>
              <i />
            </div>
            <span className="eyebrow">A MOMENT FOR YOURSELF</span>
            <h2>{t('答案之前，先看见自己。', 'Before an answer, a new perspective.')}</h2>
            <p>
              {t(
                '填入信息，或让一次随机的相遇，成为思考的起点。',
                'Enter your details, or let a chance encounter become a starting point for reflection.',
              )}
            </p>
            <a className="text-link" href={href(locale, 'methodology')}>
              {t('了解计算方法', 'How the tools work')}
              <ArrowUpRight size={14} />
            </a>
          </div>
        ) : (
          <div className="reading-arrival">
            <div className="step-label reading-complete">
              <span>02</span>
              {t('图景已展开', 'Your reading is ready')}
              <button
                className="icon-button"
                type="button"
                onClick={() => {
                  setResult(null);
                  invalidateAnswer();
                  setNote('');
                  entryId.current = null;
                }}
                aria-label={t('重新开始', 'Start again')}
              >
                <RefreshCw size={16} />
              </button>
            </div>
            <ReadingView result={result} locale={locale} />
            <div className="reading-actions" data-saved={saved}>
              <button className="button secondary" type="button" onClick={save} disabled={saved}>
                {saved ? <Check size={15} /> : <Bookmark size={15} />}{' '}
                {t(saved ? '已保存到手记' : '保存到手记', saved ? 'Saved to journal' : 'Save reading')}
              </button>
              <button className="text-button" type="button" onClick={() => setExportOpen(!exportOpen)}>
                <Download size={15} />
                {t('导出给 Agent', 'Export for an agent')}
              </button>
            </div>
            <p className="reading-saved-note" role="status">
              {saved &&
                t(
                  '已留在本机手记，随时回来续写。',
                  'Saved in this browser’s journal. Return whenever you like.',
                )}
            </p>
            {exportOpen && (
              <div className="export-panel">
                <h3>{t('选择要交给 Agent 的上下文', 'Choose what your agent receives')}</h3>
                <p>
                  {t(
                    '导出包含命盘或牌面、当前问题和你填写的背景。只有你发送文件后，外部 Agent 才能读取。',
                    'The export includes the chart or cards, your current question and selected context. An external agent receives it only when you send the file.',
                  )}
                </p>
                {(kind === 'bazi' || kind === 'ziwei') && (
                  <label className="check-field">
                    <input
                      type="checkbox"
                      checked={includeBirth}
                      onChange={(e) => setIncludeBirth(e.target.checked)}
                    />
                    {t('同时包含原始出生资料', 'Also include original birth details')}
                  </label>
                )}
                <pre>{JSON.stringify(agentContext(result, question, context, includeBirth), null, 2)}</pre>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() =>
                    downloadJson(agentContext(result, question, context, includeBirth), 'wenbu-context.json')
                  }
                >
                  {t('下载 JSON 上下文', 'Download context JSON')}
                  <Download size={15} />
                </button>
              </div>
            )}
            <section className="interpretation">
              <div className="step-label">
                <span>03</span>
                {t('带着你的问题，继续探索', 'Bring your question into the picture')}
              </div>
              <h2>{t('让图景，贴近你的当下。', 'Make it personal. Make it useful.')}</h2>
              <label className="field">
                {t('你想探索的问题', 'Your question')}
                <textarea
                  rows={2}
                  value={question}
                  onChange={(e) => changeQuestion(e.target.value)}
                  maxLength={600}
                  placeholder={t('我该如何看待最近的变化？', 'How might I reflect on the changes around me?')}
                />
              </label>
              <details className="context-details">
                <summary>
                  {t('补充你希望使用的背景（可选）', 'Add context you choose to share (optional)')}
                </summary>
                <label className="field">
                  <span>
                    {t(
                      '只有你主动填写的内容才会被使用。',
                      'Only the information you enter here will be used.',
                    )}
                  </span>
                  <textarea
                    rows={3}
                    value={context}
                    onChange={(e) => changeContext(e.target.value)}
                    maxLength={1600}
                    placeholder={t(
                      '例如：正在适应新的团队，希望更好地表达自己的想法。',
                      'For example: I am settling into a new team and want to express my ideas more clearly.',
                    )}
                  />
                </label>
              </details>
              <label className="check-field consent">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>
                  {t(
                    '将本次排盘、问题和选填背景发送给 DeepSeek，生成解读。',
                    'Send this chart, question and selected context to DeepSeek for a reading.',
                  )}
                </span>
              </label>
              <button
                className="button primary"
                type="button"
                onClick={() => void ask()}
                aria-describedby="reading-request-hint"
                disabled={aiBusy || !consent || question.trim().length < 2}
              >
                {aiBusy ? (
                  <>
                    <LoaderCircle className="spin" size={17} />
                    {t('正在整理你的解读…', 'Considering your reading…')}
                  </>
                ) : (
                  <>
                    <Feather size={17} />
                    {t('获取免费解读', 'Get a free reading')}
                  </>
                )}
              </button>
              <p className="reading-request-hint" id="reading-request-hint" aria-live="polite">
                {aiBusy
                  ? t('正在结合图景与问题整理，请稍候。', 'Bringing your question and reading together.')
                  : question.trim().length < 2
                    ? t(
                        '先写下想探索的问题，再确认分享，即可开始解读。',
                        'Add your question, then confirm sharing to begin.',
                      )
                    : !consent
                      ? t('确认上方的分享选项，即可开始解读。', 'Confirm the sharing option above to begin.')
                      : t('准备好了，点击即可开始。', 'Ready when you are.')}
              </p>
              <p className="form-note">
                {t(
                  '每个网络每日 5 次；全站有免费总额度。额度用完仍可排盘、抽牌与保存。',
                  'Five free AI requests per network daily, subject to a site-wide budget. Charts, draws and your journal remain available.',
                )}
              </p>
              {aiError && (
                <p role="alert" className="error-message">
                  {aiError}
                </p>
              )}
              {answer && (
                <article className="ai-reading" aria-live="polite">
                  <span className="eyebrow">{t('AI 生成的象征性解读', 'AI-GENERATED REFLECTION')}</span>
                  <h2>{answer.title}</h2>
                  <p className="reading-summary">{answer.summary}</p>
                  {answer.observations.map((o, i) => (
                    <div className="observation" key={i}>
                      <span>0{i + 1}</span>
                      <div>
                        <h3>{o.basis}</h3>
                        <p>{o.reflection}</p>
                      </div>
                    </div>
                  ))}
                  <h3>{t('可以试着做的事', 'Small actions to try')}</h3>
                  <ul>
                    {answer.nextSteps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <blockquote>{answer.question}</blockquote>
                  <p className="form-note">
                    DeepSeek · {provenance} ·{' '}
                    {t(`今日剩余 ${remaining} 次`, `Today: ${remaining} requests left`)}
                  </p>
                  <label className="field">
                    {t('留一句话给以后的自己', 'A note for your future self')}
                    <textarea
                      rows={2}
                      maxLength={1200}
                      value={note}
                      onChange={(e) => {
                        setNote(e.target.value);
                        setSaved(false);
                      }}
                    />
                  </label>
                  <button type="button" className="button secondary" disabled={saved} onClick={save}>
                    {saved ? <Check size={16} /> : <Bookmark size={16} />}{' '}
                    {t(saved ? '解读已保存' : '保存这份解读', saved ? 'Reading saved' : 'Save this reading')}
                  </button>
                </article>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}


FILE src/components/AgentOnboarding.tsx
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


FILE src/components/ReadingView.tsx
import { useState } from 'react';
import { MousePointer2, ZoomIn } from 'lucide-react';
import TarotCard from './TarotCard';
import type { Reading } from '../lib/tools';
import type { Locale } from '../lib/schema';
import { choose } from '../lib/i18n';

export default function ReadingView({ result, locale }: { result: Reading; locale: Locale }) {
  const t = (zh: string, en: string) => choose(locale, zh, en);
  const [activeElement, setActiveElement] = useState(0);
  const [palace, setPalace] = useState(0);
  if (result.kind === 'bazi') {
    const total = result.elements.reduce((n, e) => n + e.count, 0);
    let offset = 0;
    return (
      <div className="chart-result">
        <div className="result-heading">
          <span className="eyebrow">YOUR FOUR PILLARS</span>
          <span className="small-label">{result.calendar.lunar}</span>
        </div>
        <div className="pillars">
          {result.pillars.map((p, i) => (
            <div key={p.key} className={`pillar ${i === 2 ? 'day-pillar' : ''}`}>
              <span className="pillar-label">
                {t(['年柱', '月柱', '日柱', '时柱'][i], ['YEAR', 'MONTH', 'DAY', 'HOUR'][i])}
              </span>
              <span className="pillar-role">
                {p.value ? (locale === 'zh' ? p.role : p.roleEn) : t('时刻未知', 'Unknown time')}
              </span>
              <strong style={{ color: result.elements.find((e) => e.zh === p.stemElement)?.color }}>
                {p.stem ?? '—'}
              </strong>
              <strong style={{ color: result.elements.find((e) => e.zh === p.branchElement)?.color }}>
                {p.branch ?? '—'}
              </strong>
              <span className="pillar-pinyin">{p.pinyin ?? '—'}</span>
              <span className="pillar-element">
                {p.value ? `${p.stemElement} · ${p.branchElement}` : t('不推定时柱', 'Not inferred')}
              </span>
              <span className="pillar-hidden">
                {t('藏干', 'Hidden')} {p.hidden?.join(' ') || '—'}
              </span>
            </div>
          ))}
        </div>
        <div className="element-section">
          <div className="element-donut">
            <svg
              viewBox="0 0 160 160"
              role="img"
              aria-label={t('五行可见字分布', 'Visible five-element distribution')}
            >
              <circle cx="80" cy="80" r="60" fill="none" stroke="#e7e2d8" strokeWidth="10" />
              {result.elements.map((e, i) => {
                const length = (e.count / total) * 377;
                const start = offset;
                offset += length;
                return (
                  <circle
                    key={e.zh}
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke={e.color}
                    strokeWidth={activeElement === i ? 14 : 10}
                    strokeDasharray={`${Math.max(0, length - 3)} ${377 - Math.max(0, length - 3)}`}
                    strokeDashoffset={-start}
                    transform="rotate(-90 80 80)"
                    opacity={e.count ? 1 : 0}
                  />
                );
              })}
              <text x="80" y="78" textAnchor="middle" className="donut-main">
                {result.dayMaster.stem}
              </text>
              <text x="80" y="102" textAnchor="middle" className="donut-caption">
                {t('日主', 'DAY MASTER')}
              </text>
            </svg>
          </div>
          <div className="element-detail">
            <p className="reading-hint">
              <MousePointer2 size={13} aria-hidden="true" />
              {t('点选五行，查看构成', 'Select an element to explore')}
            </p>
            <h3>{t('你的五行底色', 'Your elemental palette')}</h3>
            <div className="element-buttons">
              {result.elements.map((e, i) => (
                <button
                  type="button"
                  key={e.zh}
                  onClick={() => setActiveElement(i)}
                  aria-pressed={activeElement === i}
                  style={{ '--element': e.color } as React.CSSProperties}
                >
                  <i />
                  {t(e.zh, e.en)}
                  <b>{e.count}</b>
                </button>
              ))}
            </div>
            <p className="element-note">
              {t(
                `${result.elements[activeElement].zh}：${result.elements[activeElement].count} / ${total} 个可见字。这里呈现的是构成，不代表旺衰、喜用神或吉凶。`,
                `${result.elements[activeElement].en}: ${result.elements[activeElement].count} of ${total} visible characters. Composition is not a measure of strength, favorable elements or fortune.`,
              )}
            </p>
          </div>
        </div>
        {result.warnings.map((w) => (
          <p className="calculation-note" key={w}>
            {locale === 'zh' ? w.split(' / ')[1] : w.split(' / ')[0]}
          </p>
        ))}
        <details className="method-details">
          <summary>{t('查看计算约定与来源', 'Calculation conventions & source')}</summary>
          <p>
            {t(
              '年、月柱按绝对交节时刻；日、时柱使用所选当地时钟。',
              'Year/month follow absolute solar terms; day/hour use the selected local clock.',
            )}
          </p>
          <p>
            {result.input.timezone} · {result.calendar.offset} · {result.input.dayBoundary} ·{' '}
            {result.calendar.correctionMinutes} min
          </p>
          <p>{result.method.engine}</p>
          <a href={result.method.source} target="_blank" rel="noreferrer">
            {t('查看算法来源', 'View calculation source')} ↗
          </a>
        </details>
      </div>
    );
  }
  if (result.kind === 'iching')
    return (
      <div className="iching-result">
        <div className="hexagram-pair">
          {[result.original, result.changed].map((hex, i) => (
            <div className="hexagram-block" key={i}>
              <span className="eyebrow">
                {t(i === 0 ? '本卦' : '之卦', i === 0 ? 'PRESENT PATTERN' : 'CHANGING PATTERN')}
              </span>
              <div className="hexagram-lines" aria-label={t(`${hex.zh}卦`, hex.en)}>
                {[...hex.bits].reverse().map((bit, j) => (
                  <div
                    key={j}
                    className={`hex-line ${bit === '0' ? 'yin' : 'yang'} ${i === 0 && result.moving.includes(6 - j) ? 'moving' : ''}`}
                  >
                    <i />
                    <i />
                    <span>{6 - j}</span>
                  </div>
                ))}
              </div>
              <h3>
                {hex.zh} <em>{String(hex.number).padStart(2, '0')}</em>
              </h3>
              <p>{hex.en}</p>
              <span className="small-label">
                {t(`上${hex.upper} · 下${hex.lower}`, `${hex.upper} above · ${hex.lower} below`)}
              </span>
            </div>
          ))}
        </div>
        <div className="reflection-callout">
          <span>{t('此刻的一个视角', 'A PERSPECTIVE TO TRY')}</span>
          <p>{t(result.original.promptZh, result.original.promptEn)}</p>
        </div>
        <p className="calculation-note">
          {result.moving.length
            ? t(
                `动爻：第 ${result.moving.join('、')} 爻（自下而上）。朱砂色标记变化的位置。`,
                `Changing lines: ${result.moving.join(', ')} (bottom to top). Vermilion marks the changing lines.`,
              )
            : t('本次没有动爻，本卦与之卦相同。', 'No changing lines: both hexagrams are the same.')}
        </p>
        <details className="method-details">
          <summary>{t('起卦记录', 'Casting record')}</summary>
          <p>
            {result.lines.join(' · ')} · {t('从初爻到上爻', 'Bottom to top')}
          </p>
          <p>
            {t(
              '三枚铜钱法：6、7、8、9 的概率分别为 1/8、3/8、3/8、1/8。主题提示为问卜原创，不冒充经典原文。',
              'Three-coin probabilities for 6, 7, 8, 9: 1/8, 3/8, 3/8, 1/8. Themes are original Wenbu prompts, not classical quotations.',
            )}
          </p>
        </details>
      </div>
    );
  if (result.kind === 'tarot')
    return (
      <div className="tarot-result">
        <p className="reading-hint">
          <ZoomIn size={13} aria-hidden="true" />
          {t('轻点牌面，放大看细节', 'Open a card to see the details')}
        </p>
        <div className={`drawn-cards count-${result.cards.length}`}>
          {result.cards.map((card, i) => (
            <div
              className="drawn-card-wrap"
              key={card.id}
              style={{ '--delay': `${i * 180}ms` } as React.CSSProperties}
            >
              <span className="eyebrow">
                {t(
                  result.cards.length === 1 ? '此刻的映照' : ['当下', '牵引', '下一步'][i],
                  result.cards.length === 1 ? 'REFLECTION' : ['SITUATION', 'TENSION', 'NEXT STEP'][i],
                )}
              </span>
              <TarotCard card={card} locale={locale} />
              <h3>{t(card.zh, card.en)}</h3>
              <span className="card-orientation">
                {t(card.reversed ? '逆位' : '正位', card.reversed ? 'Reversed' : 'Upright')}
              </span>
              <p>
                {locale === 'zh'
                  ? card.reversed
                    ? card.reversedZh
                    : card.keywordsZh
                  : card.reversed
                    ? card.reversedEn
                    : card.keywordsEn}
              </p>
            </div>
          ))}
        </div>
        <div className="reflection-callout">
          <span>{t('留给自己的问题', 'A QUESTION FOR YOU')}</span>
          <p>
            {t(
              '哪张牌最让你在意？是牌面的意思，还是它让你想起的某件事？',
              'Which card holds your attention? Is it the symbol, or something it brings to mind?',
            )}
          </p>
        </div>
        <details className="method-details">
          <summary>{t('抽牌方法与牌义', 'Draw method & card notes')}</summary>
          <p>
            {t(
              '78 张完整牌组，不放回随机抽取。逆位开启时，每张牌独立以 50% 概率逆位。牌面为问卜原创 AI 插画。',
              'A full 78-card deck, drawn without replacement. When enabled, each card independently has a 50% chance of reversal. Original AI illustrations by Wenbu.',
            )}
          </p>
          {result.cards.map((c) => (
            <p key={c.id}>
              <b>{t(c.zh, c.en)}</b> — {t(c.promptZh, c.promptEn)}
            </p>
          ))}
        </details>
      </div>
    );
  const current = result.palaces[palace];
  const positions: Record<string, [number, number]> = {
    寅: [4, 1],
    卯: [3, 1],
    辰: [2, 1],
    巳: [1, 1],
    午: [1, 2],
    未: [1, 3],
    申: [1, 4],
    酉: [2, 4],
    戌: [3, 4],
    亥: [4, 4],
    子: [4, 3],
    丑: [4, 2],
  };
  return (
    <div className="ziwei-result">
      <div className="ziwei-summary">
        <span>
          {result.lunarDate} · {result.time}
        </span>
        <strong>{result.fiveElementsClass}</strong>
      </div>
      <div className="palace-grid palace-ring">
        <div className="palace-center">
          <span className="eyebrow">ZI WEI DOU SHU</span>
          <strong>紫微</strong>
          <i />
          <p>
            {t('命主', 'Soul')} · {result.soul}
            <br />
            {t('身主', 'Body')} · {result.body}
          </p>
          <span>{t('点选宫位，展开星曜', 'Select a palace to explore')}</span>
        </div>
        {result.palaces.map((p, i) => (
          <button
            type="button"
            className={palace === i ? 'active' : ''}
            key={p.name}
            style={{ gridRow: positions[p.branch]?.[0], gridColumn: positions[p.branch]?.[1] }}
            onClick={() => setPalace(i)}
            aria-pressed={palace === i}
          >
            <span>
              {p.stem}
              {p.branch}
            </span>
            <h3>
              {p.name}
              {p.isBody ? ' · 身' : ''}
            </h3>
            <p>{p.stars.map((s) => s.name).join(' · ') || t('无主星', 'No major star')}</p>
          </button>
        ))}
      </div>
      <div className="palace-detail" aria-live="polite">
        <h3 key={current.name}>
          {current.name}
          {t(current.name.endsWith('宫') ? '' : '宫', ' palace')}
        </h3>
        <p>
          {current.stars.length
            ? current.stars
                .map((s) => `${s.name} ${s.brightness}${s.mutagen ? ` · ${s.mutagen}` : ''}`)
                .join(' / ')
            : t(
                '空宫须结合对宫与三方四正参照，不能直接判断为「没有」或「不好」。',
                'An empty palace is read in relation to other palaces; it does not mean an area of life is absent or bad.',
              )}
        </p>
        <p>
          {t('辅星', 'Supporting stars')}：{current.supporting.join(' · ') || '—'}
        </p>
        {current.ageRange.length === 2 && (
          <p>
            {t('大限年龄区间（按计算库约定）', 'Decadal age range (engine convention)')}：
            {current.ageRange.join('–')}
          </p>
        )}
      </div>
      <p className="calculation-note">
        {t(
          '使用当地钟表日期与时间，未做真太阳时校正。宫位与星曜保留中文名称，避免译名混淆。',
          'Uses the entered local civil date and clock time without solar correction. Palace and star names retain their Chinese labels for precision.',
        )}
      </p>
      <details className="method-details">
        <summary>{t('流派与计算依据', 'School & calculation')}</summary>
        <p>
          iztro 2.6.1 · fixLeap=true ·{' '}
          {t('默认流派配置，晚子时单独处理。', 'default configuration; late Zi handled separately.')}
        </p>
        <a href="https://iztro.com/quick-start" target="_blank" rel="noreferrer">
          iztro ↗
        </a>
      </details>
    </div>
  );
}
