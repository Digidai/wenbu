Review this focused CSS follow-up for concrete bugs. An actual 390 px English tarot result has mixed one-line/two-line titles, causing orientation and keyword rows to stagger. Shared subgrid rows should align five in-flow children: span.eyebrow, button.tarot-face, h3, span.card-orientation, p. The sibling dialog is display:none when closed and fixed-position in the top layer when open. Existing browsers without subgrid keep the current readable fallback. The higher specificity selector is intentional because agent.css loads later and sets gap:8px. Also fixing a focus outline using an undefined variable. No tools. Identify genuine defects or say no blocking defects.

diff --git a/src/styles/global.css b/src/styles/global.css
index cfba45a..2f7726b 100644
--- a/src/styles/global.css
+++ b/src/styles/global.css
@@ -3094,7 +3094,7 @@ html[lang='en'] .section-heading h2 {
   box-shadow: 0 12px 24px -8px #312a1940;
 }
 .tarot-face.illustrated:focus-visible {
-  outline: 3px solid var(--vermillion);
+  outline: 3px solid var(--red);
   outline-offset: 5px;
 }
 .card-inspect {
@@ -3697,3 +3697,16 @@ html[lang='en'] .section-heading h2 {
 .agent-chart .reading-hint {
   font-size: 10px;
 }
+/* Share content rows so translated card titles can wrap without staggering the metadata. */
+@supports (grid-template-rows: subgrid) {
+  .drawn-cards,
+  .agent-chart .tarot-result .drawn-cards {
+    row-gap: 0;
+  }
+  .drawn-card-wrap {
+    display: grid;
+    grid-row: span 5;
+    grid-template-rows: subgrid;
+    min-width: 0;
+  }
+}

import { useRef, useState } from 'react';
import { Maximize2, X } from 'lucide-react';
import type { TarotResult } from '../lib/tarot';
import type { Locale } from '../lib/schema';
import { tarotArt } from '../data/tarot-art';
import { track } from '../lib/analytics';

export default function TarotCard({
  card,
  locale,
  preview = false,
}: {
  card: TarotResult['cards'][number];
  locale: Locale;
  preview?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [failed, setFailed] = useState(false);
  const [opened, setOpened] = useState(false);
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
          setOpened(true);
          dialog.current?.showModal();
          track('card_inspected', { tool: 'tarot', action: 'inspect' });
        }}
      >
        {!failed && src ? (
          <img
            src={preview ? src.replace('.webp', '-small.webp') : src}
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
        onClose={() => setOpened(false)}
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
          {opened && (
            <img
              className={card.reversed ? 'is-reversed' : undefined}
              src={src}
              alt={`${name} · ${orientation}`}
              width="600"
              height="900"
            />
          )}
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
