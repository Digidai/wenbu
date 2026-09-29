Second review: inspect final source, assess the previous findings, and look for real regressions. No tools. Prior findings: (1) reduced-motion rules already exist at the END of full agent-motion.css for every workspace descendant and pseudo-element, both data-motion=quiet and system reduced motion; (2) four instrument labels are fixed BaZi / I Ching / Tarot / Zi Wei, decorative trailing arrows are intentionally omitted in the compact sidebar; verify with full styles; (3) notice key moved to text only, context save focus restored after native dialog.close; (4) saved-note negative margin removed. No claims of full browser or accessibility certification. Return concrete defects or No blocking defects found.

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
index 972b396..812e879 100644
--- a/src/components/AgentWorkspace.tsx
+++ b/src/components/AgentWorkspace.tsx
@@ -119,6 +119,7 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
   const scroll = useRef<HTMLDivElement>(null);
   const stickToBottom = useRef(true);
   const dialog = useRef<HTMLDialogElement>(null);
+  const focusAfterContext = useRef(false);
   const sidebarRef = useRef<HTMLElement>(null);
   const sessionRef = useRef(sessions);
   const pending = useRef<{
@@ -211,7 +212,13 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
   }, [draft]);
   useEffect(() => {
     if (contextOpen) dialog.current?.showModal();
-    else dialog.current?.close();
+    else {
+      dialog.current?.close();
+      if (focusAfterContext.current) {
+        focusAfterContext.current = false;
+        textarea.current?.focus();
+      }
+    }
   }, [contextOpen]);

   useEffect(() => {
@@ -589,7 +596,6 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
         <button className="agent-new" onClick={createSession} disabled={!loaded}>
           <Plus size={17} />
           {t('开始新的探索', 'New exploration')}
-          <span>↗</span>
         </button>
         <label className="agent-session-search">
           <Search size={14} />
@@ -734,7 +740,7 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
         )}
         {notice && (
           <div className="agent-notice" role="status">
-            {notice}
+            <span key={notice}>{notice}</span>
             <button
               className="agent-icon-button"
               aria-label={t('关闭提示', 'Dismiss')}
@@ -999,6 +1005,14 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
               if (!busy) void send();
             }}
           >
+            <div className="agent-draft-receipt" role="status" aria-atomic="true">
+              {isSuggestionIntact(draft, stagedSuggestion.current) && stagedSuggestion.current.text && (
+                <span key={stagedSuggestion.current.text}>
+                  <Check size={13} aria-hidden="true" />
+                  {t('已放入草稿，可修改后发送', 'Draft added · edit before sending')}
+                </span>
+              )}
+            </div>
             <textarea
               ref={textarea}
               value={draft}
@@ -1028,6 +1042,10 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
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
@@ -1036,6 +1054,10 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
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
@@ -1278,6 +1300,7 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
           onSubmit={(e) => {
             e.preventDefault();
             if (active) mutateSession(active.id, (s) => ({ ...s, context: contextDraft }));
+            focusAfterContext.current = !resumeAfterContext || busy;
             setContextOpen(false);
             if (resumeAfterContext && !busy) {
               void send(
@@ -1293,7 +1316,6 @@ export default function AgentWorkspace({ locale }: { locale: Locale }) {
                   'Context updated. Your next message will use your selection.',
                 ),
               );
-              textarea.current?.focus();
             }
           }}
         >
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
index 4379d67..dff23b9 100644
--- a/src/styles/agent-motion.css
+++ b/src/styles/agent-motion.css
@@ -4,6 +4,56 @@
   --ritual-ink: #6c7761;
   --ritual-red: #a35a45;
 }
+.agent-draft-receipt > span {
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
+.agent-notice > span {
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
index c9e5575..c9c6f97 100644
--- a/src/styles/agent.css
+++ b/src/styles/agent.css
@@ -133,14 +133,11 @@
   font-size: 12px;
   border-radius: 3px;
   transition: background 0.2s;
+  white-space: nowrap;
 }
 .agent-new:hover {
   background: #384d40 !important;
 }
-.agent-new > span {
-  margin-left: auto;
-  color: #afb8a7;
-}
 .agent-session-search {
   display: flex;
   align-items: center;
@@ -226,15 +223,20 @@
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
@@ -337,6 +339,7 @@
   justify-content: center;
   color: #71796b;
   border-radius: 3px;
+  flex-shrink: 0;
 }
 .agent-icon-button:hover {
   background: #e9ece0;
@@ -701,6 +704,8 @@
   font-size: 8px;
   margin-left: auto;
   opacity: 0.85;
+  flex-shrink: 0;
+  white-space: nowrap;
 }
 .agent-tool-event.error summary {
   color: var(--red);
@@ -1187,6 +1192,7 @@
   align-items: center;
   gap: 16px;
   padding-top: 23px;
+  flex-wrap: wrap;
 }
 .agent-artifact-actions button {
   display: flex;
@@ -1265,6 +1271,8 @@
   padding: 10px 24px;
   background: #edf0e0;
   font-size: 11px;
+  flex-shrink: 0;
+  overflow-wrap: anywhere;
 }
 .agent-notice > button,
 .agent-storage-error > button {
@@ -1311,6 +1319,8 @@
   font-family: var(--serif);
   font-size: 28px;
   margin: 10px 0 15px;
+  line-height: 1.3;
+  text-wrap: balance;
 }
 .agent-context-toggle {
   display: flex;
@@ -1342,12 +1352,14 @@
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
@@ -1361,6 +1373,11 @@
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
@@ -1433,6 +1450,7 @@
   justify-content: flex-end;
   gap: 17px;
   padding-top: 24px;
+  flex-wrap: wrap;
 }
 .agent-dialog-actions > button {
   border: 0;
@@ -1440,6 +1458,8 @@
   padding: 10px 16px;
   border-radius: 3px;
   font-size: 12px;
+  min-height: 44px;
+  max-width: 100%;
 }
 .agent-dialog-actions > .primary {
   background: var(--ink);
@@ -1791,9 +1811,10 @@
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
@@ -1815,6 +1836,23 @@
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
index 92c28c2..cfba45a 100644
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
@@ -1440,15 +1451,19 @@ html[lang='en'] .section-heading h2 {
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
-  margin: 22px -5px 12px;
+  margin: 22px 0 12px;
 }
 .card-back {
   position: absolute;
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


FILE src/styles/agent-motion.css
/* Paper, ink and a measured cadence. Only live events start a ceremony. */
.agent-workspace {
  --ritual-ease: cubic-bezier(0.16, 1, 0.3, 1);
  --ritual-ink: #6c7761;
  --ritual-red: #a35a45;
}
.agent-draft-receipt > span {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 2px 9px;
  color: #637654;
  font-size: 10px;
  line-height: 1.6;
  animation: ritual-detail-in 220ms var(--ritual-ease);
}
.agent-draft-receipt svg,
.agent-guide-progress .is-reached svg,
.agent-onboarding[data-ready='true'] .agent-guide-rest > svg {
  stroke-dasharray: 24;
  animation: ritual-check-draw 350ms ease-out;
}
.agent-guide-progress li,
.agent-guide-progress li > span {
  transition:
    color 180ms,
    background-color 180ms,
    border-color 180ms;
}
.agent-onboarding[data-ready='true'] .agent-guide-mark {
  animation: ritual-seal-arrive 450ms var(--ritual-ease);
}
.agent-notice > span {
  animation: ritual-detail-in 220ms var(--ritual-ease);
}
.agent-context-dialog[open] {
  animation: ritual-dialog-in 220ms var(--ritual-ease);
}
@keyframes ritual-check-draw {
  from {
    stroke-dashoffset: 24;
  }
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes ritual-dialog-in {
  from {
    opacity: 0.5;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.agent-motion-toggle {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 6px;
  color: #777e6c;
  font-size: 9px;
  white-space: nowrap;
  border-radius: 3px;
}
.agent-motion-toggle[aria-pressed='false'] {
  color: #8a877c;
}
.agent-motion-toggle:disabled {
  cursor: default;
  opacity: 0.7;
}
.agent-ritual {
  position: relative;
  display: grid;
  grid-template-columns: 80px minmax(0, 1fr);
  align-items: center;
  gap: 17px;
  margin: 4px 0 23px;
  padding: 18px 0 20px;
  border-top: 1px solid #dedfd3;
  border-bottom: 1px solid #dedfd3;
  color: var(--ritual-ink);
  isolation: isolate;
}
.agent-ritual::after {
  content: '';
  position: absolute;
  width: 28px;
  height: 1px;
  bottom: -1px;
  left: 0;
  background: var(--ritual-red);
  transform-origin: left;
  animation: ritual-rule-in 650ms var(--ritual-ease) both;
}
.agent-ritual-mark {
  width: 80px;
  height: 80px;
  overflow: visible;
}
.ritual-orbit-line {
  stroke: #cdd1c1;
  stroke-width: 0.65;
}
.ritual-tick {
  stroke: #b6bca8;
  stroke-width: 0.8;
}
.ritual-traveller {
  transform-origin: 48px 48px;
  animation: ritual-orbit 24s linear infinite;
}
.ritual-traveller circle {
  fill: var(--ritual-red);
}
.ritual-traveller path {
  stroke: var(--ritual-red);
  stroke-width: 0.85;
  opacity: 0.6;
}
.ritual-symbol {
  stroke: #77816d;
  stroke-width: 0.9;
  stroke-linejoin: round;
  animation: ritual-symbol-in 400ms var(--ritual-ease);
}
.ritual-impression {
  stroke: var(--ritual-red);
  transform-origin: 48px 48px;
}
.ritual-impression rect:first-child {
  opacity: 0.65;
}
.ritual-impression rect:nth-child(2) {
  opacity: 0.2;
}
.ritual-impression text {
  fill: var(--ritual-red);
  stroke: none;
  font: 19px var(--serif);
}
.agent-ritual[data-phase='opening'] .ritual-impression {
  animation: ritual-breathe 4s ease-in-out infinite;
}
.ritual-pages path,
.ritual-cards rect {
  fill: #f8f6ee;
}
.ritual-page-front {
  transform-origin: 54px 48px;
  animation: ritual-page-turn 4.8s ease-in-out infinite;
}
.ritual-pillar {
  animation: ritual-measure 3.8s ease-in-out infinite;
}
.ritual-pillar-1 {
  animation-delay: 0.25s;
}
.ritual-pillar-2 {
  animation-delay: 0.5s;
}
.ritual-pillar-3 {
  animation-delay: 0.75s;
}
.ritual-palaces rect {
  animation: ritual-measure 4s ease-in-out infinite;
}
.ritual-palaces rect:nth-child(3n + 2) {
  animation-delay: 0.4s;
}
.ritual-palaces rect:nth-child(3n) {
  animation-delay: 0.8s;
}
.ritual-palaces text {
  font: 13px var(--serif);
  fill: var(--ritual-red);
  stroke: none;
}
.ritual-cards,
.ritual-coins {
  transform-origin: 48px 48px;
  animation: ritual-balance 4.8s ease-in-out infinite;
}
.ritual-pen {
  fill: #f8f6ee;
  stroke: var(--ritual-red);
  animation: ritual-pen-drift 4s ease-in-out infinite;
}
.ritual-ink-line {
  animation: ritual-measure 4s ease-in-out infinite;
}
.agent-ritual-label {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #8b8b79;
  font-size: 8px;
  letter-spacing: 1.8px;
  margin-bottom: 7px;
}
.agent-ritual-label > span {
  width: 3px;
  height: 3px;
  background: #a56c52;
  border-radius: 50%;
}
.agent-ritual-title {
  font-family: var(--serif);
  font-size: 22px;
  line-height: 1.4;
  color: #3c4e3a;
  margin: 0 0 7px;
}
.agent-ritual-detail {
  font-size: 10px;
  line-height: 1.8;
  color: #7c826f;
  margin: 0;
}
.agent-ritual-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: 9px;
  font-size: 9px;
  color: #6e7c60;
  font-variant-numeric: tabular-nums;
}
.agent-ritual-facts > span {
  animation: ritual-detail-in 180ms ease-out;
}
.agent-ritual-facts > span + span::before {
  content: '·';
  margin-right: 12px;
  color: #adab97;
}
.agent-ritual[data-active='false'] {
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 12px;
  padding: 12px 0;
}
.agent-ritual[data-active='false'] .agent-ritual-mark {
  width: 42px;
  height: 42px;
}
.agent-ritual[data-active='false'] .agent-ritual-label {
  display: none;
}
.agent-ritual[data-active='false'] .agent-ritual-title {
  font-size: 16px;
  margin-bottom: 3px;
}
.agent-ritual[data-active='false'] .ritual-orbit-line,
.agent-ritual[data-active='false'] .ritual-tick {
  opacity: 0;
}
.agent-ritual[data-phase='interrupted'] .agent-ritual-title {
  color: #806a56;
}
.agent-ritual[data-phase='settled'] .ritual-impression {
  animation: ritual-seal-arrive 550ms var(--ritual-ease);
}
.is-current-turn.role-user {
  animation: ritual-question-in 300ms var(--ritual-ease);
}
.is-current-turn.role-assistant .agent-author > .agent-small-seal {
  animation: ritual-seal-arrive 600ms var(--ritual-ease);
}
.is-current-turn .agent-tool-event {
  animation: ritual-detail-in 180ms var(--ritual-ease);
}
.is-current-turn .agent-tool-event.complete summary > svg:first-child {
  animation: ritual-check-in 260ms var(--ritual-ease);
}
.agent-writing-cursor {
  display: inline-block;
  width: 3px;
  height: 11px;
  margin-left: 5px;
  background: var(--ritual-red);
  vertical-align: baseline;
  animation: ritual-measure 1.8s ease-in-out infinite;
}
.agent-artifact-links > button.is-arriving {
  animation: ritual-receipt-in 550ms var(--ritual-ease);
}
.agent-artifact-view {
  animation: none;
}
.agent-artifact-heading {
  position: relative;
  padding-right: 31px;
}
.agent-result-seal {
  position: absolute;
  right: 1px;
  top: 24px;
  display: grid;
  place-items: center;
  width: 25px;
  height: 28px;
  border: 1px solid #b47d66;
  color: #a8634c;
  font: 17px var(--serif);
  transform: rotate(-5deg);
}
.agent-result-seal::after {
  content: '';
  position: absolute;
  inset: 2px;
  border: 1px solid #d3b6a2;
  opacity: 0.6;
}
.agent-artifact-content.is-arriving {
  animation: agent-paper-arrive 900ms var(--ritual-ease);
}
.agent-artifact-content.is-arriving .agent-result-seal {
  animation: ritual-seal-arrive 600ms var(--ritual-ease);
}
.agent-artifact-content.is-arriving .agent-report > section {
  animation: ritual-section-in 480ms var(--ritual-ease) backwards;
}
.agent-artifact-content.is-arriving .agent-report > section:nth-of-type(2) {
  animation-delay: 70ms;
}
.agent-artifact-content.is-arriving .agent-report > section:nth-of-type(3) {
  animation-delay: 140ms;
}
.agent-artifact-content.is-arriving .agent-report > section:nth-of-type(n + 4) {
  animation-delay: 210ms;
}
.agent-chart .drawn-card-wrap {
  animation: none;
}
.agent-artifact-content.is-arriving .pillar,
.agent-artifact-content.is-arriving .drawn-card-wrap,
.agent-artifact-content.is-arriving .hexagram-lines > div,
.agent-artifact-content.is-arriving .palace-grid > button {
  animation: ritual-section-in 500ms var(--ritual-ease) backwards;
}
.agent-artifact-content.is-arriving .pillar:nth-child(2),
.agent-artifact-content.is-arriving .drawn-card-wrap:nth-child(2) {
  animation-delay: 75ms;
}
.agent-artifact-content.is-arriving .pillar:nth-child(3),
.agent-artifact-content.is-arriving .drawn-card-wrap:nth-child(3) {
  animation-delay: 150ms;
}
.agent-artifact-content.is-arriving .pillar:nth-child(4) {
  animation-delay: 225ms;
}
.agent-artifact-content.is-arriving .hexagram-lines > div {
  animation-name: ritual-line-in;
  transform-origin: left center;
}
/* Lines are rendered top first; draw them in the traditional bottom-to-top order. */
.agent-artifact-content.is-arriving .hexagram-lines > div:nth-child(1) {
  animation-delay: 250ms;
}
.agent-artifact-content.is-arriving .hexagram-lines > div:nth-child(2) {
  animation-delay: 200ms;
}
.agent-artifact-content.is-arriving .hexagram-lines > div:nth-child(3) {
  animation-delay: 150ms;
}
.agent-artifact-content.is-arriving .hexagram-lines > div:nth-child(4) {
  animation-delay: 100ms;
}
.agent-artifact-content.is-arriving .hexagram-lines > div:nth-child(5) {
  animation-delay: 50ms;
}
.agent-artifact-content.is-arriving .palace-grid > button:nth-child(3n + 2) {
  animation-delay: 80ms;
}
.agent-artifact-content.is-arriving .palace-grid > button:nth-child(3n) {
  animation-delay: 160ms;
}
@keyframes ritual-orbit {
  to {
    transform: rotate(360deg);
  }
}
@keyframes ritual-breathe {
  50% {
    transform: scale(1.055);
    opacity: 0.65;
  }
}
@keyframes ritual-page-turn {
  50% {
    transform: translate(3px, -1px) rotate(4deg);
  }
}
@keyframes ritual-measure {
  50% {
    opacity: 0.35;
  }
}
@keyframes ritual-balance {
  50% {
    transform: rotate(-5deg) translateY(-1px);
  }
}
@keyframes ritual-pen-drift {
  50% {
    transform: translate(-3px, 3px);
  }
}
@keyframes ritual-symbol-in {
  from {
    opacity: 0.35;
    transform: translateY(2px);
  }
}
@keyframes ritual-rule-in {
  from {
    transform: scaleX(0);
  }
}
@keyframes ritual-question-in {
  from {
    transform: translateY(7px);
  }
}
@keyframes ritual-seal-arrive {
  0% {
    transform: scale(1.16) rotate(-9deg);
    opacity: 0.4;
  }
  65% {
    transform: scale(1) rotate(-3deg);
    opacity: 1;
  }
}
@keyframes ritual-detail-in {
  from {
    transform: translateY(3px);
  }
}
@keyframes ritual-check-in {
  from {
    transform: scale(0.65);
    opacity: 0.3;
  }
}
@keyframes ritual-receipt-in {
  from {
    transform: translateY(5px);
    border-color: #b18b70;
  }
}
@keyframes agent-paper-arrive {
  from {
    transform: translateY(8px);
  }
  65%,
  100% {
    transform: none;
  }
}
@keyframes ritual-section-in {
  from {
    transform: translateY(5px);
  }
}
@keyframes ritual-line-in {
  from {
    transform: scaleX(0.86);
  }
}
@media (hover: hover) and (pointer: fine) {
  .agent-motion-toggle:hover {
    background: #eaede2;
    color: #44583f;
  }
  .agent-artifact-links > button {
    transition:
      border-color 180ms,
      transform 180ms var(--ritual-ease);
  }
  .agent-artifact-links > button:hover {
    transform: translateY(-2px);
  }
}
@media (max-width: 600px) {
  .agent-ritual {
    grid-template-columns: 66px minmax(0, 1fr);
    gap: 12px;
    padding: 17px 0;
  }
  .agent-ritual-mark {
    width: 66px;
    height: 66px;
  }
  .agent-ritual-title {
    font-size: 20px;
  }
  .agent-ritual-label {
    font-size: 7px;
    letter-spacing: 1.3px;
  }
  .agent-ritual-detail {
    font-size: 10px;
  }
  .agent-motion-toggle {
    gap: 3px;
    font-size: 8px;
    padding: 8px 5px;
  }
}
.agent-workspace[data-motion='quiet'] *,
.agent-workspace[data-motion='quiet'] *::before,
.agent-workspace[data-motion='quiet'] *::after {
  animation: none !important;
  transition: none !important;
  scroll-behavior: auto !important;
}
@media (prefers-reduced-motion: reduce) {
  .agent-workspace *,
  .agent-workspace *::before,
  .agent-workspace *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}


FILE src/styles/agent.css
/* Wenbu's reading desk: quiet paper, precise tools, room to think. */
.agent-page {
  overflow: hidden;
}
.agent-page .site-header {
  height: 82px;
  max-width: none;
  padding: 0 32px;
  gap: 20px;
}
.agent-page .site-header .brand {
  font-size: 32px;
}
.agent-page .site-footer {
  display: none;
}
.agent-page .mobile-nav {
  position: absolute;
  z-index: 45;
  width: 100%;
  background: var(--paper);
}
.agent-nav-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.nav-new-dot {
  width: 4px;
  height: 4px;
  background: var(--red);
  border-radius: 50%;
}
.home-agent-entry {
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 26px 30px;
  margin: 0 0 38px;
  border: 1px solid #d7d6c9;
  background: #eeeee4;
  transition: background 0.2s;
}
.home-agent-entry:hover {
  background: #e7e9db;
}
.home-agent-mark {
  font-family: var(--serif);
  font-size: 27px;
  color: var(--red);
  width: 48px;
  height: 48px;
  border: 1px solid #c2b7a4;
  border-radius: 50%;
  display: grid;
  place-items: center;
}
.home-agent-entry > span:nth-child(2) {
  display: grid;
  gap: 6px;
  flex: 1;
}
.home-agent-entry small {
  font-size: 9px;
  letter-spacing: 1.9px;
  color: var(--muted);
}
.home-agent-entry strong {
  font-family: var(--serif);
  font-size: 23px;
  font-weight: 500;
}
.home-agent-cta {
  color: var(--red);
  font-size: 12px;
}
.agent-workspace {
  --agent-line: #ddded3;
  display: grid;
  grid-template-columns: 218px minmax(360px, 1fr) minmax(340px, 32%);
  height: calc(100dvh - 82px);
  min-height: 0;
  font-size: 13px;
}
.agent-workspace button {
  border: 0;
  background: transparent;
}
.agent-workspace .sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.agent-workspace .eyebrow {
  font-size: 9px;
  letter-spacing: 1.8px;
}
.agent-workspace .mobile-only {
  display: none;
}
.agent-sidebar {
  background: #eeede5;
  border-right: 1px solid var(--agent-line);
  padding: 27px 18px 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.agent-sidebar-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 6px 22px;
}
.agent-sidebar-heading .eyebrow {
  color: #717366;
  font-size: 8px;
}
.agent-new {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 13px;
  background: var(--ink) !important;
  color: #f8f5ea;
  font-size: 12px;
  border-radius: 3px;
  transition: background 0.2s;
  white-space: nowrap;
}
.agent-new:hover {
  background: #384d40 !important;
}
.agent-session-search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 8px 10px;
  color: #74796c;
  border-bottom: 1px solid var(--agent-line);
  margin: 8px 0 15px;
}
.agent-session-search input {
  width: 100%;
  min-width: 0;
  border: 0;
  background: transparent;
  font-size: 11px;
  outline: none;
}
.agent-session-search:focus-within {
  border-color: var(--red);
}
.agent-session-list {
  flex: 1;
  overflow: auto;
  margin: 0 -5px;
  padding: 0 2px 20px;
}
.agent-session-row {
  display: flex;
  border-radius: 3px;
  margin-bottom: 4px;
  position: relative;
}
.agent-session-row.is-active {
  background: #e0e3d7;
}
.agent-session-row.is-active::before {
  content: '';
  width: 2px;
  height: 16px;
  position: absolute;
  left: 0;
  top: 12px;
  background: var(--red);
}
.agent-session-row > button:first-child {
  padding: 11px 7px 11px 10px;
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  text-align: left;
  gap: 9px;
  font-size: 11px;
}
.agent-session-row > button:first-child > span {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.agent-delete {
  opacity: 0;
  width: 25px;
  display: grid;
  place-items: center;
  color: #787d71;
  padding: 0;
}
.agent-session-row:hover .agent-delete,
.agent-delete:focus-visible,
.agent-delete.confirm-delete {
  opacity: 1;
}
.agent-delete.confirm-delete {
  color: var(--red);
}
.agent-sidebar-bottom {
  padding: 20px 5px 22px;
  border-top: 1px solid var(--agent-line);
}
.agent-sidebar-bottom > .eyebrow {
  color: #75796c;
  font-size: 8px;
}
.agent-instruments {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 8px;
  margin: 18px 0 22px;
}
.agent-instruments a {
  display: flex;
  align-items: center;
  font-size: 11px;
  gap: 5px;
  min-height: 36px;
  white-space: nowrap;
}
.agent-instruments a > svg:last-child {
  display: none;
}
.agent-instruments a > span {
  font: 16px var(--serif);
  color: var(--red);
  width: 18px;
}
.agent-instruments a svg {
  margin-left: auto;
  opacity: 0.45;
}
.agent-instruments a:hover,
.agent-sidebar-library:hover {
  color: var(--red);
}
.agent-sidebar-library {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--agent-line);
}
.agent-sidebar-library svg:last-child {
  margin-left: auto;
}
.agent-local {
  font-size: 9px;
  color: #737a6c;
  margin: 16px 0 0;
  display: flex;
  gap: 6px;
  align-items: center;
}
.agent-local > span {
  width: 4px;
  height: 4px;
  background: #7e896e;
  border-radius: 50%;
}
.agent-conversation {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  background: #f9f7f1;
}
.agent-chat-toolbar,
.agent-panel-toolbar {
  height: 62px;
  min-height: 62px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--agent-line);
  padding: 0 27px;
}
.agent-conversation-name {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  font-size: 12px;
}
.agent-conversation-name > span:nth-child(2) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}
.agent-small-seal {
  width: 22px;
  height: 23px;
  border: 1px solid #b4806a;
  display: inline-grid;
  place-items: center;
  font-family: var(--serif);
  font-size: 14px;
  color: var(--red);
  line-height: 1;
  flex-shrink: 0;
}
.agent-beta {
  font-size: 8px;
  letter-spacing: 1.1px;
  color: #7c7e6e;
  border: 1px solid #dddfd0;
  border-radius: 2px;
  padding: 1px 5px;
  white-space: nowrap;
}
.agent-toolbar-actions {
  display: flex;
  gap: 7px;
  margin-left: 10px;
}
.agent-icon-button {
  padding: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #71796b;
  border-radius: 3px;
  flex-shrink: 0;
}
.agent-icon-button:hover {
  background: #e9ece0;
  color: var(--ink);
}
.agent-count {
  font-size: 9px;
  color: var(--red);
  margin-left: 3px;
}
.agent-chat-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: #d4d8c9 transparent;
}
.agent-welcome {
  padding: 38px 34px 30px;
  max-width: 700px;
  margin: 0 auto;
}
.agent-welcome > .eyebrow {
  color: #8a7660;
  font-size: 8px;
}
.agent-welcome h1 {
  font-family: var(--serif);
  font-size: clamp(32px, 3.2vw, 45px);
  line-height: 1.4;
  letter-spacing: 0.6px;
  margin: 14px 0 17px;
}
.agent-welcome h1 em {
  font-style: normal;
  color: var(--red);
}
.agent-welcome > p {
  font-size: 12px;
  line-height: 1.9;
  color: #74796d;
  margin-bottom: 26px;
}
.agent-starters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 11px;
}
.agent-starters > button {
  text-align: left;
  padding: 15px 13px;
  border: 1px solid #e1e2d7;
  background: #f5f4eb;
  border-radius: 3px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
  transition:
    border-color 0.18s,
    background 0.18s,
    transform 0.18s;
}
.agent-starters > button:hover {
  border-color: #b3bba5;
  background: #eeefdf;
  transform: translateY(-2px);
}
.agent-starters > button > svg:first-child {
  color: #7e8a70;
  margin-top: 2px;
}
.agent-starters > button > svg:last-child {
  color: #7b826f;
  margin: 2px 0 0 auto;
}
.agent-starters small {
  display: block;
  font-size: 9px;
  color: #717a68;
  margin-bottom: 6px;
}
.agent-starters strong {
  font-size: 11px;
  line-height: 1.75;
  font-weight: 400;
  display: block;
}
.agent-composer-area {
  padding: 14px 28px 17px;
  max-width: 840px;
  width: 100%;
  margin: 0 auto;
}
.agent-composer {
  border: 1px solid #cdd1c0;
  border-radius: 8px;
  padding: 15px 15px 10px;
  background: #fdfcf7;
  box-shadow: 0 6px 23px #28392006;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.agent-composer:focus-within {
  border-color: #98a68c;
  box-shadow: 0 3px 17px #2e4e260b;
}
.agent-composer.is-working {
  border-color: #c2b29c;
}
.agent-composer textarea {
  width: 100%;
  height: 58px;
  min-height: 58px;
  max-height: 170px;
  background: transparent;
  border: 0;
  outline: none;
  resize: none;
  font-size: 13px;
  line-height: 1.7;
  padding: 0 2px 10px;
  display: block;
}
.agent-composer textarea:focus-visible {
  outline: none;
}
.agent-composer textarea::placeholder {
  color: #8c9282;
}
.agent-composer-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}
.agent-mode-picker {
  display: flex;
  padding: 2px;
  border-radius: 4px;
  background: #f0f1e8;
}
.agent-mode-picker button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  font-size: 10px;
  color: #78806f;
  border-radius: 3px;
  white-space: nowrap;
}
.agent-mode-picker button.selected {
  background: #e0e5d5;
  color: #354734;
}
.agent-context-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 2px;
  font-size: 10px;
  color: #75806b;
  white-space: nowrap;
}
.agent-context-trigger.has-context {
  color: var(--red);
}
.agent-context-trigger > span {
  font-size: 8px;
  width: 15px;
  height: 15px;
  background: #eee0d3;
  border-radius: 50%;
  display: grid;
  place-items: center;
}
.agent-provider {
  margin-left: auto;
  font-size: 10px;
  color: #727d68;
  letter-spacing: -0.1px;
}
.agent-send {
  background: var(--ink) !important;
  color: #f7f4e9;
  width: 31px;
  height: 31px;
  display: grid;
  place-items: center;
  padding: 0;
  border-radius: 5px;
  margin-left: 4px;
}
.agent-send:hover {
  background: var(--red) !important;
}
.agent-send:disabled {
  background: #d8ddce !important;
  color: #858f7b;
  opacity: 1;
}
.agent-send.stop {
  background: var(--red) !important;
}
.agent-composer-foot {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 3px 0;
  font-size: 9px;
  color: #7e8476;
}
.agent-composer-foot > span:last-child {
  white-space: nowrap;
}
.agent-message-list {
  padding: 28px 32px 15px;
  max-width: 840px;
  margin: auto;
}
.agent-message {
  margin-bottom: 30px;
  overflow-wrap: anywhere;
}
.agent-message.role-user {
  margin-left: auto;
  max-width: 89%;
  padding: 13px 18px;
  background: #eceee2;
  border-radius: 6px 6px 1px 6px;
  font-size: 13px;
}
.agent-message.role-user p:last-child {
  margin-bottom: 0;
}
.agent-author {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 16px;
}
.agent-author strong {
  font: 23px var(--serif);
  letter-spacing: -0.4px;
}
.agent-author > span:last-child {
  color: #89907e;
  font-size: 9px;
  margin-left: auto;
}
.agent-prose {
  font-size: 13px;
  line-height: 1.95;
}
.agent-prose p {
  margin: 0 0 13px;
}
.agent-prose > :last-child {
  margin-bottom: 0;
}
.agent-prose h1,
.agent-prose h2,
.agent-prose h3 {
  font-family: var(--serif);
  font-size: 22px;
  line-height: 1.5;
  margin: 22px 0 10px;
}
.agent-prose ul,
.agent-prose ol {
  padding-left: 22px;
}
.agent-prose li {
  margin: 6px 0;
}
.agent-prose strong {
  font-weight: 600;
  color: #314c37;
}
.agent-prose a {
  color: var(--red);
  text-decoration: underline;
  text-decoration-color: #d6b49b;
  text-underline-offset: 3px;
}
.agent-prose blockquote {
  border-left: 2px solid #b8bea5;
  padding-left: 15px;
  margin: 18px 0;
  color: #727b66;
}
.agent-prose pre {
  max-width: 100%;
  overflow: auto;
  padding: 14px;
  background: #eeefe5;
  font-size: 11px;
}
.agent-prose code {
  font-size: 0.9em;
  background: #eceee3;
  padding: 2px 3px;
}
.agent-plan {
  background: #f0f1e8;
  border: 1px solid #e1e3d6;
  border-radius: 4px;
  margin: 0 0 15px;
  font-size: 11px;
}
.agent-plan summary {
  list-style: none;
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px 13px;
  cursor: pointer;
}
.agent-plan summary > span {
  margin-left: auto;
  color: #88917b;
  font-size: 9px;
}
.agent-plan ol {
  list-style: none;
  padding: 0 13px 10px;
  margin: 0;
}
.agent-plan li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  color: #77816d;
}
.agent-plan li.complete {
  color: #55674c;
}
.agent-plan li.active {
  color: var(--red);
}
.agent-tool-log {
  border-left: 1px solid #d7dacd;
  padding-left: 12px;
  margin: 0 0 16px 10px;
}
.agent-tool-event {
  margin: 4px 0;
  font-size: 10px;
}
.agent-tool-event summary {
  display: flex;
  align-items: center;
  gap: 7px;
  list-style: none;
  cursor: pointer;
  padding: 5px 0;
  color: #718064;
}
.agent-tool-event summary small {
  font-size: 8px;
  margin-left: auto;
  opacity: 0.85;
  flex-shrink: 0;
  white-space: nowrap;
}
.agent-tool-event.error summary {
  color: var(--red);
}
.agent-tool-event.earlier-attempt summary {
  color: #70766b;
}
.agent-tool-event.earlier-attempt summary small {
  color: #4c654c;
  opacity: 1;
}
.agent-tool-event .agent-attempt-outcome {
  color: #4c654c;
}
.agent-tool-event.running summary {
  color: #857654;
}
.agent-tool-event p {
  font-size: 10px;
  padding: 4px 4px 8px 20px;
  line-height: 1.7;
  color: #7e846e;
  margin: 0;
}
.agent-arriving {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 0;
}
.agent-arriving > i {
  width: 4px;
  height: 4px;
  background: #969d89;
  border-radius: 50%;
  animation: agent-breathe 1.6s ease-in-out infinite;
}
.agent-arriving > i:nth-child(2) {
  animation-delay: 0.2s;
}
.agent-arriving > i:nth-child(3) {
  animation-delay: 0.4s;
}
.agent-arriving > span {
  font-size: 10px;
  color: #838c78;
  margin-left: 8px;
}
.agent-artifact-links {
  display: grid;
  gap: 8px;
  margin-top: 18px;
}
.agent-artifact-links > button {
  display: flex;
  gap: 11px;
  align-items: center;
  text-align: left;
  background: #f0f0e5;
  border: 1px solid #d9ddcd;
  padding: 12px 14px;
  border-radius: 4px;
  transition: border-color 0.2s;
}
.agent-artifact-links > button:hover {
  border-color: #98a389;
}
.agent-artifact-links small {
  display: block;
  font-size: 8px;
  color: #7b866d;
  margin-bottom: 3px;
}
.agent-artifact-links strong {
  font-size: 12px;
  font-weight: 500;
}
.agent-artifact-links > button > svg:first-child {
  color: var(--red);
}
.agent-artifact-links > button > svg:last-child {
  margin-left: auto;
  color: #849176;
}
.agent-source-count {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 10px;
  color: #78876a;
  padding: 0 !important;
  margin: 14px 0 0;
}
.agent-question-actions {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
  margin-top: 16px;
}
.agent-question-actions > button {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #cfd5bf;
  border-radius: 4px;
  padding: 8px 11px;
  font-size: 11px;
  text-align: left;
}
.agent-question-actions > button:hover {
  background: #eaeedf;
}
.agent-model-receipt {
  display: block;
  color: #8a917e;
  font-size: 8px;
  margin-top: 13px;
}
.agent-turn-error {
  background: #f4e9de;
  border-left: 2px solid #bb7860;
  padding: 12px;
  font-size: 11px;
  margin-top: 16px;
}
.agent-turn-error button {
  color: var(--red);
  font-size: 10px;
  padding: 0;
}
.agent-stopped {
  color: #907d67;
  font-size: 10px;
  margin: 14px 0 0;
}
.agent-result-pane {
  background: #f2f1e8;
  border-left: 1px solid var(--agent-line);
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}
.agent-panel-toolbar {
  padding: 0 26px;
}
.agent-panel-tabs {
  display: flex;
  gap: 28px;
  height: 100%;
}
.agent-panel-tabs button {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 2px 0 0;
  font-size: 11px;
  border-bottom: 2px solid transparent;
  color: #7b8371;
}
.agent-panel-tabs button.selected {
  border-color: var(--red);
  color: var(--ink);
}
.agent-panel-tabs button > span {
  font-size: 8px;
  color: #969d8b;
}
.agent-panel-scroll {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: #d4d8c9 transparent;
}
.agent-panel-empty {
  padding: 49px 33px;
}
.agent-panel-empty > .eyebrow {
  color: #89917a;
  font-size: 8px;
}
.agent-panel-empty h2 {
  font-family: var(--serif);
  font-size: 26px;
  line-height: 1.5;
  margin: 0 0 18px;
}
.agent-panel-empty > p {
  color: #7f8674;
  font-size: 11px;
  line-height: 1.95;
  max-width: 270px;
}
.agent-empty-legend {
  display: flex;
  align-items: center;
  gap: 17px;
  border-top: 1px solid #d8ddca;
  padding-top: 21px;
  margin-top: 33px;
  font-size: 9px;
  letter-spacing: 1.8px;
  color: #90987f;
}
.agent-empty-legend > span + span::before {
  content: '·';
  margin-right: 16px;
}
.agent-panel-foot {
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--agent-line);
  gap: 10px;
}
.agent-panel-foot > span {
  font-size: 7px;
  letter-spacing: 1.4px;
  color: #8c947e;
}
.agent-panel-foot > a {
  font-size: 9px;
  color: #788567;
}
.agent-artifact-view {
  padding: 24px 24px 30px;
  animation: agent-enter 0.35s ease-out;
}
.agent-artifact-select {
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid #d2d8c5;
  padding-bottom: 13px;
  margin-bottom: 25px;
  color: #849072;
}
.agent-artifact-select select {
  appearance: none;
  border: 0;
  background: transparent;
  width: 100%;
  min-width: 0;
  font-size: 10px;
  text-overflow: ellipsis;
  cursor: pointer;
}
.agent-artifact-heading > .eyebrow {
  font-size: 7px;
  color: #8d836c;
}
.agent-artifact-heading h2 {
  font-family: var(--serif);
  font-size: 28px;
  line-height: 1.4;
  margin: 11px 0 8px;
}
.agent-artifact-heading > p {
  font-size: 9px;
  color: #818872;
  margin-bottom: 24px;
}
.agent-chart {
  background: #faf8f0;
  padding: 17px 12px;
  border: 1px solid #e1e3d2;
}
.agent-chart .result-heading {
  flex-wrap: wrap;
  gap: 6px;
}
.agent-chart .eyebrow {
  font-size: 7px;
}
.agent-chart .small-label {
  font-size: 8px;
}
.agent-chart .pillars {
  gap: 5px;
  margin: 16px 0;
}
.agent-chart .pillar {
  padding: 15px 3px 10px;
}
.agent-chart .pillar strong {
  font-size: 31px;
}
.agent-chart .pillar-label,
.agent-chart .pillar-role,
.agent-chart .pillar-element,
.agent-chart .pillar-pinyin,
.agent-chart .pillar-hidden {
  font-size: 8px;
}
.agent-chart .element-section {
  display: grid;
  grid-template-columns: 108px minmax(0, 1fr);
  gap: 11px;
  margin: 15px 0;
  padding-top: 16px;
}
.agent-chart .element-donut {
  width: 108px;
}
.agent-chart .element-detail h3 {
  font-size: 15px;
}
.agent-chart .element-buttons {
  gap: 2px;
}
.agent-chart .element-buttons button {
  font-size: 10px;
  padding: 2px 4px;
}
.agent-chart .element-detail > p {
  font-size: 9px;
}
.agent-chart .hexagram-pair {
  gap: 18px;
}
.agent-chart .hexagram-block h3 {
  font-size: 22px;
}
.agent-chart .hexagram-block h3 em {
  display: block;
  font-size: 13px;
  margin: 2px 0 0;
}
.agent-chart .hexagram-block p {
  font-size: 10px;
}
.agent-chart .hexagram-lines {
  max-width: 115px;
}
.agent-chart .palace-grid {
  gap: 3px;
}
.agent-chart .palace-grid button {
  min-height: 74px;
  padding: 6px 4px;
}
.agent-chart .palace-grid h3 {
  font-size: 11px;
}
.agent-chart .palace-grid button > span {
  font-size: 8px;
}
.agent-chart .palace-grid button > p {
  font-size: 8px;
}
.agent-chart .palace-center {
  padding: 8px;
}
.agent-chart .palace-center .eyebrow {
  font-size: 5px;
  letter-spacing: 1px;
}
.agent-chart .palace-center > strong {
  font-size: 21px;
}
.agent-chart .palace-center > p,
.agent-chart .palace-center > span:last-child {
  font-size: 8px;
}
.agent-chart .ziwei-summary {
  font-size: 11px;
  gap: 6px;
  flex-wrap: wrap;
}
.agent-chart .palace-detail {
  padding: 14px 5px 0;
}
.agent-chart .palace-detail p {
  font-size: 11px;
}
.agent-chart .result-method {
  font-size: 10px;
}
.agent-chart .drawn-cards {
  gap: 8px;
}
.agent-chart .tarot-face {
  padding: 8px;
}
.agent-chart .tarot-art span {
  font-size: 34px;
}
.agent-chart .drawn-card-wrap > .eyebrow {
  font-size: 6px;
  letter-spacing: 0.5px;
  margin-bottom: 9px;
}
.agent-chart .drawn-card-wrap h3 {
  font-size: 14px;
  margin-top: 12px;
}
.agent-chart .drawn-card-wrap p {
  font-size: 9px;
}
.agent-chart .card-index {
  font-size: 12px;
}
.agent-chart .card-bottom {
  font-size: 4px;
  letter-spacing: 0.5px;
}
.agent-report-summary {
  font-family: var(--serif);
  font-size: 17px;
  line-height: 1.85;
  border-bottom: 1px solid #d7dcc8;
  padding-bottom: 23px;
  margin-bottom: 26px;
}
.agent-report > section {
  position: relative;
  margin-bottom: 25px;
}
.agent-report-number {
  font: italic 16px var(--serif);
  color: #a59074;
}
.agent-report h3 {
  font-size: 17px;
  font-family: var(--serif);
  margin: 4px 0 11px;
}
.agent-report .agent-prose {
  font-size: 12px;
  color: #59664e;
}
.agent-report-citations {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 11px;
}
.agent-report-citations a {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  font-size: 9px;
  color: #848369;
}
.agent-report-citations a:hover {
  color: var(--red);
}
.agent-report-citations a svg:last-child {
  flex-shrink: 0;
}
.agent-report-questions {
  padding: 20px 15px;
  border: 1px solid #d2d8bf;
  border-radius: 2px;
  background: #e9eddc;
}
.agent-report-questions .eyebrow {
  display: block;
  color: #859072;
  margin-bottom: 10px;
  font-size: 8px;
}
.agent-report-questions button {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  text-align: left;
  padding: 9px 0;
  width: 100%;
  font-size: 11px;
  line-height: 1.8;
}
.agent-report-questions button + button {
  border-top: 1px solid #d7dec7;
}
.agent-report-questions button svg {
  margin-top: 4px;
}
.agent-artifact-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 23px;
  flex-wrap: wrap;
}
.agent-artifact-actions button {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  padding: 0;
}
.agent-artifact-actions > span {
  margin-left: auto;
  color: #8c947e;
  font-size: 8px;
}
.agent-sources {
  padding: 32px 25px;
}
.agent-sources > .eyebrow {
  color: #8c826a;
  font-size: 8px;
}
.agent-sources > h2 {
  font-family: var(--serif);
  font-size: 28px;
  line-height: 1.5;
  margin: 14px 0 18px;
}
.agent-sources > h2 em {
  color: var(--red);
  font-style: normal;
}
.agent-source-card {
  display: flex;
  gap: 11px;
  padding: 22px 0;
  border-top: 1px solid #d6ddc7;
}
.agent-source-number {
  font: italic 17px var(--serif);
  color: #ab9377;
  margin-top: 9px;
}
.agent-source-type {
  font-size: 8px;
  color: #8b967b;
  display: block;
  margin-bottom: 5px;
}
.agent-source-card a {
  font-family: var(--serif);
  font-size: 18px;
  line-height: 1.5;
  display: block;
}
.agent-source-card a svg {
  display: inline;
  margin-left: 5px;
}
.agent-source-card p {
  font-size: 10px;
  color: #7a856d;
  margin: 9px 0;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.agent-source-card small {
  font-size: 8px;
  color: #929a84;
}
.agent-notice,
.agent-storage-error {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 24px;
  background: #edf0e0;
  font-size: 11px;
  flex-shrink: 0;
  overflow-wrap: anywhere;
}
.agent-notice > button,
.agent-storage-error > button {
  margin-left: auto;
}
.agent-storage-error {
  background: #f2e1d2;
  color: #914831;
}
.agent-storage-error button {
  text-decoration: underline;
  white-space: nowrap;
}
.agent-quiet {
  color: #7b8571;
  font-size: 11px;
  line-height: 1.85;
}
.agent-context-dialog {
  width: min(660px, calc(100vw - 32px));
  max-height: calc(100dvh - 48px);
  border: 1px solid #d2d6c5;
  padding: 28px 32px;
  background: var(--paper);
  color: var(--ink);
  border-radius: 8px;
  box-shadow: 0 24px 120px #1c302d33;
}
.agent-context-dialog::backdrop {
  background: #2736294d;
  backdrop-filter: blur(3px);
}
.agent-dialog-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}
.agent-dialog-heading .eyebrow {
  font-size: 8px;
  color: #8f816a;
}
.agent-dialog-heading h2 {
  font-family: var(--serif);
  font-size: 28px;
  margin: 10px 0 15px;
  line-height: 1.3;
  text-wrap: balance;
}
.agent-context-toggle {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 17px 0;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  cursor: pointer;
}
.agent-context-dialog input[type='checkbox'] {
  accent-color: var(--red);
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}
.agent-context-toggle strong,
.agent-journal-picker > div strong {
  display: block;
  font-size: 12px;
  font-weight: 500;
}
.agent-context-toggle small,
.agent-journal-picker > div small {
  display: block;
  font-size: 10px;
  color: #808970;
  margin-top: 3px;
}
.agent-birth-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 15px;
  padding: 22px 0 8px;
}
.agent-birth-grid label {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 7px;
  font-size: 11px;
}
.agent-birth-grid input,
.agent-birth-grid select,
.agent-context-note textarea {
  width: 100%;
  min-width: 0;
  background: #fcfaf4;
  border: 1px solid #cfd5c0;
  border-radius: 3px;
  padding: 10px;
  font-size: 12px;
  min-height: 44px;
}
.agent-birth-grid input,
.agent-birth-grid select {
  margin-top: auto;
}
.agent-birth-grid > p {
  grid-column: 1 / -1;
  font-size: 10px;
  color: #808c70;
}
.agent-context-note {
  display: grid;
  gap: 10px;
  font-size: 12px;
  margin: 23px 0;
}
.agent-context-note textarea {
  resize: vertical;
}
.agent-journal-picker {
  margin: 25px 0;
}
.agent-journal-picker > label {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--line);
  padding: 13px 0;
  font-size: 12px;
}
.agent-journal-picker > label small {
  display: block;
  color: #8b927f;
  font-size: 9px;
  margin-top: 3px;
}
.agent-journal-picker > p {
  font-size: 11px;
  color: #869178;
  margin: 12px 0;
}
.agent-journal-picker a {
  color: var(--red);
}
.agent-context-preview {
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.agent-context-preview summary {
  list-style: none;
  padding: 12px 0;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  cursor: pointer;
}
.agent-context-preview pre {
  font-size: 10px;
  line-height: 1.8;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  max-height: 260px;
  overflow: auto;
  background: #edeee3;
  padding: 14px;
}
.agent-context-preview > p {
  font-size: 10px;
  color: #808d70;
}
.agent-dialog-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 17px;
  padding-top: 24px;
  flex-wrap: wrap;
}
.agent-dialog-actions > button {
  border: 0;
  background: transparent;
  padding: 10px 16px;
  border-radius: 3px;
  font-size: 12px;
  min-height: 44px;
  max-width: 100%;
}
.agent-dialog-actions > .primary {
  background: var(--ink);
  color: #f4f3e8;
  display: flex;
  align-items: center;
  gap: 10px;
}
.rotate-180 {
  transform: rotate(180deg);
}
@keyframes agent-breathe {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-2px);
  }
}
@keyframes agent-enter {
  from {
    transform: translateY(6px);
  }
  to {
    transform: translateY(0);
  }
}
@media (min-width: 1550px) {
  .agent-workspace {
    grid-template-columns: 246px minmax(440px, 1fr) minmax(410px, 33%);
  }
  .agent-welcome {
    padding-top: 58px;
  }
}
@media (max-height: 800px) and (min-width: 1001px) {
  .agent-welcome {
    padding-top: 23px;
  }
  .agent-welcome h1 {
    font-size: 35px;
    margin: 10px 0;
  }
  .agent-welcome > p {
    margin-bottom: 20px;
  }
  .agent-starters > button {
    padding: 11px;
  }
}
@media (max-width: 1180px) and (min-width: 1001px) {
  .agent-workspace {
    grid-template-columns: 184px minmax(340px, 1fr) 330px;
  }
  .agent-sidebar {
    padding-left: 12px;
    padding-right: 12px;
  }
  .agent-welcome {
    padding-left: 25px;
    padding-right: 25px;
  }
  .agent-composer-area {
    padding-left: 20px;
    padding-right: 20px;
  }
  .agent-composer-controls {
    gap: 5px;
  }
  .agent-provider {
    display: none;
  }
  .agent-send {
    margin-left: auto;
  }
  .agent-panel-empty {
    padding-left: 25px;
    padding-right: 25px;
  }
  .agent-artifact-view {
    padding: 20px 17px;
  }
}
@media (max-width: 1000px) {
  .agent-page .site-header {
    height: 72px;
    padding: 0 25px;
  }
  .agent-workspace {
    height: calc(100dvh - 72px);
    grid-template-columns: minmax(330px, 1fr) minmax(310px, 40%);
  }
  .agent-workspace .mobile-only {
    display: inline-flex;
  }
  .agent-sidebar {
    display: none;
    position: fixed;
    z-index: 43;
    top: 72px;
    left: 0;
    bottom: 0;
    width: 250px;
  }
  .sidebar-open .agent-sidebar {
    display: flex;
  }
  .agent-sidebar-backdrop {
    position: fixed;
    z-index: 42;
    inset: 72px 0 0;
    background: #203c243b !important;
    width: 100%;
  }
  .agent-chat-toolbar {
    padding: 0 15px;
    gap: 9px;
  }
  .agent-conversation-name {
    flex: 1;
  }
  .agent-conversation-name > span:nth-child(2) {
    max-width: 160px;
  }
  .agent-toolbar-actions {
    margin-left: auto;
  }
  .agent-chat-toolbar > .agent-icon-button {
    margin-left: -4px;
  }
  .agent-welcome {
    padding: 30px 28px;
  }
  .agent-starters {
    gap: 8px;
  }
  .agent-starters > button {
    padding: 13px 10px;
  }
  .agent-starters > button > svg:last-child {
    display: none;
  }
  .agent-provider {
    display: none;
  }
  .agent-send {
    margin-left: auto;
  }
  .agent-composer-foot {
    font-size: 8px;
  }
  .agent-artifact-view {
    padding: 20px 17px;
  }
  .agent-delete {
    opacity: 0.7;
  }
}
@media (max-width: 700px) {
  .agent-page .site-header {
    height: 64px;
    padding: 0 20px;
  }
  .agent-page .site-header .brand {
    font-size: 29px;
  }
  .agent-page .site-header .brand-seal {
    width: 23px;
    height: 28px;
    font-size: 16px;
  }
  .agent-page .site-header .brand-zh {
    display: none;
  }
  .agent-workspace {
    height: calc(100dvh - 64px);
    display: block;
  }
  .agent-sidebar {
    top: 64px;
  }
  .agent-sidebar-backdrop {
    inset: 64px 0 0;
  }
  .agent-conversation,
  .agent-result-pane {
    height: 100%;
  }
  .agent-result-pane {
    display: none;
    border-left: 0;
  }
  .mobile-results .agent-result-pane {
    display: flex;
  }
  .mobile-results .agent-conversation {
    display: none;
  }
  .agent-chat-toolbar,
  .agent-panel-toolbar {
    height: 53px;
    min-height: 53px;
  }
  .agent-chat-toolbar {
    padding: 0 14px;
  }
  .agent-conversation-name {
    font-size: 11px;
    gap: 7px;
  }
  .agent-conversation-name > span:nth-child(2) {
    max-width: 155px;
  }
  .agent-beta {
    display: none;
  }
  .agent-chat-toolbar .agent-small-seal {
    display: none;
  }
  .agent-toolbar-actions {
    gap: 1px;
  }
  .agent-welcome {
    padding: 27px 23px 22px;
    max-width: 550px;
  }
  .agent-welcome h1 {
    font-size: 34px;
    margin: 12px 0 15px;
    line-height: 1.35;
  }
  .agent-welcome > p {
    font-size: 11px;
    margin-bottom: 21px;
  }
  .agent-starters {
    gap: 9px;
  }
  .agent-starters > button {
    padding: 12px 10px;
    gap: 8px;
  }
  .agent-starters > button > svg:first-child {
    width: 15px;
    height: 15px;
  }
  .agent-starters small {
    font-size: 8px;
    margin-bottom: 4px;
  }
  .agent-starters strong {
    font-size: 10px;
    line-height: 1.65;
  }
  .agent-composer-area {
    padding: 9px 13px max(10px, env(safe-area-inset-bottom));
  }
  .agent-composer {
    padding: 12px 12px 9px;
    border-radius: 7px;
  }
  .agent-composer textarea {
    font-size: 14px;
    min-height: 52px;
  }
  .agent-composer-controls {
    gap: 8px;
  }
  .agent-mode-picker button {
    padding: 6px 8px;
    font-size: 10px;
  }
  .agent-context-trigger {
    font-size: 10px;
  }
  .agent-provider {
    display: block;
    font-size: 9px;
  }
  .agent-send {
    width: 32px;
    height: 32px;
    margin-left: 0;
  }
  .agent-composer-foot {
    gap: 13px;
    font-size: 8px;
    line-height: 1.6;
    padding-top: 7px;
  }
  .agent-composer-foot > span:first-child {
    max-width: 255px;
  }
  .agent-message-list {
    padding: 24px 20px 10px;
  }
  .agent-message.role-user {
    padding: 12px 14px;
    max-width: 92%;
  }
  .agent-prose {
    font-size: 13px;
  }
  .agent-author > span:last-child {
    font-size: 8px;
  }
  .agent-message {
    margin-bottom: 25px;
  }
  .agent-panel-toolbar {
    justify-content: flex-start;
    gap: 16px;
    padding: 0 16px;
  }
  .agent-panel-tabs {
    gap: 32px;
  }
  .agent-panel-empty {
    padding: 40px 34px;
    max-width: 450px;
    margin: auto;
  }
  .agent-artifact-view {
    padding: 24px 24px 32px;
    max-width: 650px;
    margin: auto;
  }
  .agent-artifact-heading h2 {
    font-size: 30px;
  }
  .agent-sources {
    padding: 28px;
  }
  .agent-panel-foot {
    padding: 12px 23px max(12px, env(safe-area-inset-bottom));
  }
  .agent-context-dialog {
    padding: 22px;
    max-height: calc(100dvh - 28px);
  }
  .agent-dialog-heading h2 {
    font-size: 25px;
  }
  .agent-birth-grid {
    gap: 14px 10px;
  }
  .agent-birth-grid input,
  .agent-birth-grid select,
  .agent-context-note textarea {
    padding: 9px 7px;
    font-size: 16px;
  }
  .agent-birth-grid label {
    font-size: 10px;
  }
  .home-agent-entry {
    padding: 20px;
    gap: 15px;
    align-items: flex-start;
    flex-wrap: wrap;
  }
  .home-agent-entry strong {
    font-size: 19px;
  }
  .home-agent-entry small {
    font-size: 7px;
  }
  .home-agent-cta {
    margin-left: 62px;
    font-size: 11px;
  }
}
@media (max-width: 480px) {
  .agent-birth-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }
  .agent-birth-grid label {
    font-size: 12px;
  }
  .agent-dialog-actions {
    gap: 8px;
  }
  .agent-dialog-actions > .primary {
    flex: 1;
    justify-content: center;
    text-align: left;
  }
}
@media (max-width: 370px) {
  .agent-provider {
    display: none;
  }
  .agent-send {
    margin-left: auto;
  }
  .agent-welcome {
    padding: 24px 18px;
  }
  .agent-starters strong {
    font-size: 9px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .agent-workspace *,
  .agent-workspace *::before,
  .agent-workspace *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}

.agent-table-scroll {
  max-width: 100%;
  overflow-x: auto;
  margin: 18px 0;
  border: 1px solid var(--line);
}
.agent-table-scroll table {
  border-collapse: collapse;
  width: 100%;
  font-size: 12px;
  white-space: nowrap;
}
.agent-table-scroll th,
.agent-table-scroll td {
  text-align: left;
  padding: 9px 12px;
  border-bottom: 1px solid var(--line);
}
.agent-table-scroll th {
  background: var(--paper);
  font-weight: 500;
  color: var(--ink);
}
.agent-table-scroll tr:last-child td {
  border-bottom: 0;
}

/* Keep the context editor and primary action usable on compact phones. */
.agent-context-dialog {
  overflow-y: auto;
  overscroll-behavior: contain;
}
@media (max-width: 700px) {
  .agent-send {
    width: 44px;
    height: 44px;
    min-width: 44px;
  }
  .agent-composer-foot {
    font-size: 10px;
    line-height: 1.5;
  }
  .agent-composer-foot > span:first-child {
    max-width: calc(100% - 85px);
  }
  .agent-icon-button {
    min-width: 36px;
    min-height: 36px;
  }
}


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
  animation: reading-unfold 220ms ease-out;
}
.reading-actions[data-saved='true'] {
  padding-bottom: 0;
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

AgentWorkspace.tsx 95-140
  const [busy, setBusy] = useState(false);
  const motion = useAgentMotion();
  const [currentTurn, setCurrentTurn] = useState<string[]>([]);
  const [arrivingArtifacts, setArrivingArtifacts] = useState<string[]>([]);
  const reducedMotionRef = useRef(motion.reduced);
  reducedMotionRef.current = motion.reduced;
  const [remaining, setRemaining] = useState<number>();
  const [sidebar, setSidebar] = useState(false);
  const [mobilePane, setMobilePane] = useState<'chat' | 'results'>('chat');
  const [panel, setPanel] = useState<'results' | 'sources'>('results');
  const [selectedArtifact, setSelectedArtifact] = useState('');
  const [sessionSearch, setSessionSearch] = useState('');
  const [deleteId, setDeleteId] = useState('');
  const [storageError, setStorageError] = useState(false);
  const [notice, setNotice] = useState('');
  const [contextOpen, setContextOpen] = useState(false);
  const [resumeAfterContext, setResumeAfterContext] = useState(false);
  const [contextDraft, setContextDraft] = useState<AgentSession['context']>({
    note: '',
    useBirth: false,
    journalIds: [],
  });
  const [journals, setJournals] = useState<Entry[]>([]);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const scroll = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const dialog = useRef<HTMLDialogElement>(null);
  const focusAfterContext = useRef(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const sessionRef = useRef(sessions);
  const pending = useRef<{
    controller: AbortController;
    sessionId: string;
    messageId: string;
    generationId: string;
  } | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = sessions.find((s) => s.id === activeId);
  const artifacts = active ? sessionArtifacts(active) : [];
  const sourceMap = new Map<string, AgentSource>();
  for (const message of active?.messages ?? [])
    for (const source of message.sources) sourceMap.set(source.id, source);
  const sources = [...sourceMap.values()];
  const artifact = artifacts.find((a) => a.id === selectedArtifact) ?? artifacts[artifacts.length - 1];
  const birth = contextDraft.birth ?? defaultBirth;
  const contextCount =
AgentWorkspace.tsx 207-235
  }, [arrivingArtifacts]);
  useEffect(() => {
    if (!textarea.current) return;
    textarea.current.style.height = 'auto';
    textarea.current.style.height = Math.min(170, Math.max(58, textarea.current.scrollHeight)) + 'px';
  }, [draft]);
  useEffect(() => {
    if (contextOpen) dialog.current?.showModal();
    else {
      dialog.current?.close();
      if (focusAfterContext.current) {
        focusAfterContext.current = false;
        textarea.current?.focus();
      }
    }
  }, [contextOpen]);

  useEffect(() => {
    if (!sidebar) return;
    const previous = document.activeElement as HTMLElement | null;
    const focusables = () =>
      [
        ...(sidebarRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled])',
        ) ?? []),
      ].filter((el) => el.offsetParent !== null);
    focusables()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
AgentWorkspace.tsx 630-665
                >
                  {deleteId === s.id ? <Check size={13} /> : <Trash2 size={13} />}
                </button>
              </div>
            ))}
          {!sessions.length && (
            <p className="agent-quiet">{t('你的探索会留在这里。', 'Your explorations will live here.')}</p>
          )}
        </div>
        <div className="agent-sidebar-bottom">
          <span className="eyebrow">THE INSTRUMENTS</span>
          <div className="agent-instruments">
            {[
              ['bazi', '八字', 'BaZi'],
              ['iching', '易经', 'I Ching'],
              ['tarot', '塔罗', 'Tarot'],
              ['ziwei', '紫微', 'Zi Wei'],
            ].map(([p, zh, en]) => (
              <a key={p} href={href(locale, p)}>
                <InstrumentGlyph kind={p as InstrumentKind} size={26} />
                {t(zh, en)}
                <ArrowUpRight size={12} />
              </a>
            ))}
          </div>
          <a className="agent-sidebar-library" href={href(locale, 'learn')}>
            <BookOpen size={14} />
            {t('翻阅知识手册', 'Browse the library')}
            <ArrowUpRight size={12} />
          </a>
          <p className="agent-local">
            <span />
            {t('会话仅保存在此浏览器', 'Conversations stay in this browser')}
          </p>
        </div>
      </aside>
AgentWorkspace.tsx 735-770
            )}
            <button onClick={() => active && downloadJson(active, 'wenbu-conversation.json')}>
              {t('导出', 'Export')}
            </button>
          </div>
        )}
        {notice && (
          <div className="agent-notice" role="status">
            <span key={notice}>{notice}</span>
            <button
              className="agent-icon-button"
              aria-label={t('关闭提示', 'Dismiss')}
              onClick={() => setNotice('')}
            >
              <X size={13} />
            </button>
          </div>
        )}
        <div
          className="agent-chat-scroll"
          ref={scroll}
          onScroll={() => {
            if (scroll.current)
              stickToBottom.current =
                scroll.current.scrollHeight - scroll.current.scrollTop - scroll.current.clientHeight < 110;
          }}
        >
          {!active?.messages.length ? (
            <AgentOnboarding
              key={activeId}
              locale={locale}
              disabled={!loaded}
              onDirect={() => textarea.current?.focus()}
              onCompose={(value) => {
                if (!prepareDraft(value.text, 'guided')) return false;
                if (active) mutateSession(active.id, (a) => ({ ...a, mode: value.mode }));
AgentWorkspace.tsx 1000-1048
        <div className="agent-composer-area">
          <form
            className={`agent-composer ${busy ? 'is-working' : ''}`}
            onSubmit={(event) => {
              event.preventDefault();
              if (!busy) void send();
            }}
          >
            <div className="agent-draft-receipt" role="status" aria-atomic="true">
              {isSuggestionIntact(draft, stagedSuggestion.current) && stagedSuggestion.current.text && (
                <span key={stagedSuggestion.current.text}>
                  <Check size={13} aria-hidden="true" />
                  {t('已放入草稿，可修改后发送', 'Draft added · edit before sending')}
                </span>
              )}
            </div>
            <textarea
              ref={textarea}
              value={draft}
              maxLength={3000}
              rows={2}
              disabled={!loaded}
              aria-label={t('向命理 Agent 提问', 'Ask Wenbu Agent')}
              placeholder={
                active?.messages.length
                  ? t('补充你的情况，或继续追问……', 'Add context, or ask a follow-up…')
                  : t('也可以直接写：我最近在犹豫……', 'Or start here: lately, I have been wondering…')
              }
              onChange={(e) => {
                setDraft(e.target.value);
                if (!isSuggestionIntact(e.target.value, stagedSuggestion.current))
                  stagedSuggestion.current = { text: '', start: 0, action: 'none' };
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  if (!busy) void send();
                }
              }}
            />
            <div className="agent-composer-controls">
              <div className="agent-mode-picker" aria-label={t('探索方式', 'Exploration mode')}>
                <button
                  type="button"
                  className={active?.mode === 'explore' ? 'selected' : ''}
                  title={t(
                    '围绕你的问题对话，按需使用排盘与抽取工具',
                    'Talk through your question and use reading tools when needed',
                  )}
AgentWorkspace.tsx 1285-1348
        <div className="agent-panel-foot">
          <span>WENBU RESEARCH STUDIO</span>
          <a href={href(locale, 'methodology')}>{t('计算与依据', 'Our methods')} ↗</a>
        </div>
      </aside>
      <dialog
        className="agent-context-dialog"
        ref={dialog}
        onCancel={() => setContextOpen(false)}
        onClick={(e) => {
          if (e.target === dialog.current) setContextOpen(false);
        }}
        aria-labelledby="agent-context-title"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (active) mutateSession(active.id, (s) => ({ ...s, context: contextDraft }));
            focusAfterContext.current = !resumeAfterContext || busy;
            setContextOpen(false);
            if (resumeAfterContext && !busy) {
              void send(
                t(
                  '请使用我刚才选择的出生资料继续排盘，并保留时间与计算约定中的不确定性。',
                  'Continue using the birth details I selected, preserving uncertainty and calculation conventions.',
                ),
              );
            } else {
              setNotice(
                t(
                  '资料已更新，下一条消息会使用你选择的内容。',
                  'Context updated. Your next message will use your selection.',
                ),
              );
            }
          }}
        >
          <div className="agent-dialog-heading">
            <div>
              <span className="eyebrow">CONTEXT, ON YOUR TERMS</span>
              <h2 id="agent-context-title">{t('带上与你有关的资料。', 'Bring the context that matters.')}</h2>
            </div>
            <button
              type="button"
              className="agent-icon-button"
              aria-label={t('关闭资料窗口', 'Close context')}
              onClick={() => setContextOpen(false)}
            >
              <X size={19} />
            </button>
          </div>
          <p className="agent-quiet">
            {t(
              '只把你选择的内容用于本次会话。资料会随消息交给 DeepSeek，保存在此浏览器。',
              'Only your selection is used in this conversation. It is sent to DeepSeek with your message and saved in this browser.',
            )}
          </p>
          <label className="agent-context-toggle">
            <input
              type="checkbox"
              checked={contextDraft.useBirth}
              onChange={(e) => setContextDraft((c) => ({ ...c, useBirth: e.target.checked }))}
            />
            <span>
