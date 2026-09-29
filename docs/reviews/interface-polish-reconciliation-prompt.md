Final focused reconciliation. Last review claimed CSS :empty fails because JSX keeps indentation around {saved && ...}. Actual built React 19 DOM on /ziwei/ before saving: childNodes=0, matches(":empty")=true, computed display="none", height=0. After saving: note is visible, 10 px BELOW action row. These results are in polish-flow-local.json. JSX whitespace-only lines around an expression are compiled away. Please reassess the last finding using the exact component excerpt + CSS and identify any genuine remaining blocking defect; do not assume DOM whitespace from source indentation. Previously confirmed fixes and motion overrides remain unchanged. No tools.

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

[
  {
    "check": "context-save-focus",
    "dialogClosed": true,
    "notice": "Context updated. Your next message will use your selection.",
    "passed": true
  },
  {
    "check": "agent-system-reduced",
    "checkmark": "none",
    "motion": "quiet",
    "notice": "none",
    "stage": "none"
  },
  {
    "check": "narrow-keyboard-card-selection",
    "deckScroll": 246,
    "deckWidth": 246,
    "outline": "rgb(171, 73, 54) solid 2px",
    "overflow": 0,
    "selected": "Choose 3 · 2 selected"
  },
  {
    "check": "saved-receipt",
    "gap": 10,
    "hint": "Add your question, then confirm sharing to begin.",
    "markAnimation": "reading-check",
    "note": "Saved in this browser’s journal. Return whenever you like.",
    "overflow": 0
  },
  {
    "buttonEnabled": true,
    "check": "reading-readiness-hint",
    "hint": "Ready when you are."
  },
  {
    "check": "bazi-reduced-motion",
    "overflow": 0,
    "pillars": [
      "none",
      "none",
      "none",
      "none"
    ],
    "receipt": "none"
  },
  {
    "check": "iching-arrival-order",
    "lines": [
      {
        "delay": "0.25s",
        "name": "reading-ink"
      },
      {
        "delay": "0.2s",
        "name": "reading-ink"
      },
      {
        "delay": "0.15s",
        "name": "reading-ink"
      },
      {
        "delay": "0.1s",
        "name": "reading-ink"
      },
      {
        "delay": "0.05s",
        "name": "reading-ink"
      },
      {
        "delay": "0s",
        "name": "reading-ink"
      }
    ],
    "overflow": 0
  },
  {
    "check": "unsaved-status-line",
    "childNodes": 0,
    "display": "none",
    "empty": true,
    "height": 0
  },
  {
    "animation": "reading-unfold",
    "check": "palace-selection",
    "overflow": 0,
    "title": "命宫"
  }
]
