export type InstrumentKind = 'bazi' | 'iching' | 'tarot' | 'ziwei' | 'library' | 'report';

/** Original engraving-like marks. Decorative; the adjacent label names the action. */
export default function InstrumentGlyph({ kind, size = 48 }: { kind: InstrumentKind; size?: number }) {
  return (
    <svg
      className={`instrument-glyph glyph-${kind}`}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="glyph-ground" cx="32" cy="32" r="28" />
      <g
        className="glyph-lines"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {kind === 'bazi' ? (
          <>
            {[17, 27, 37, 47].map((x, i) => (
              <g key={x} className={`glyph-column column-${i}`}>
                <path d={`M${x - 3} 18h6v28h-6zM${x - 3} 28h6M${x - 3} 36h6`} />
                <path className="glyph-accent" d={`M${x} 22v2m0 17v2`} />
              </g>
            ))}
            <path d="M12 50h40M12 14h40" opacity=".4" />
          </>
        ) : kind === 'iching' ? (
          <>
            <circle cx="32" cy="32" r="20" opacity=".4" />
            <path d="M20 23h24M20 29h9m6 0h9M20 35h24M20 41h9m6 0h9" strokeWidth="2.2" />
            <circle className="glyph-accent" cx="49" cy="18" r="3" />
          </>
        ) : kind === 'tarot' ? (
          <>
            <rect x="16" y="16" width="24" height="34" rx="2" transform="rotate(-13 28 33)" opacity=".5" />
            <g className="glyph-card">
              <rect
                x="27"
                y="14"
                width="24"
                height="34"
                rx="2"
                transform="rotate(10 39 31)"
                className="glyph-paper"
              />
              <path className="glyph-accent" d="m40 22 2 7 6 3-7 2-3 7-1-8-6-3 7-2z" />
            </g>
          </>
        ) : kind === 'ziwei' ? (
          <>
            <rect x="14" y="14" width="36" height="36" />
            <path d="M23 14v36m18-36v36M14 23h36M14 41h36M32 14v9m0 18v9M14 32h9m18 0h9" />
            <path className="glyph-accent" d="m32 27 1.5 3.5L37 32l-3.5 1.5L32 37l-1.5-3.5L27 32l3.5-1.5z" />
          </>
        ) : kind === 'library' ? (
          <>
            <path d="M12 19q11-5 20 1 9-6 20-1v29q-11-5-20 1-9-6-20-1zM32 20v29" className="glyph-paper" />
            <path
              d="M17 25q5-2 10 1m-10 6q5-2 10 1m-10 6q5-2 10 1m10-15q5-2 10-1m-10 8q5-2 10-1"
              opacity=".6"
            />
            <path className="glyph-accent" d="M39 16v16l3-3 3 2V15" />
          </>
        ) : (
          <>
            <path d="M18 12h23l7 7v32H18zM41 12v9h7" className="glyph-paper" />
            <path d="M24 26h17M24 32h17M24 38h9" opacity=".65" />
            <rect
              className="glyph-accent"
              x="36"
              y="38"
              width="11"
              height="12"
              transform="rotate(-7 41 44)"
            />
            <path className="glyph-accent" d="m39 44 2 2 3-5" />
          </>
        )}
      </g>
    </svg>
  );
}

export function ReadingDeskIllustration() {
  return (
    <svg
      className="reading-desk-illustration"
      viewBox="0 0 280 178"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="142" cy="153" rx="103" ry="13" fill="#d8dccd" opacity=".3" />
      <circle cx="137" cy="83" r="70" stroke="#d4d8ca" strokeDasharray="2 6" />
      <path d="M32 122h219M60 34h15m-8-7v14m171 38h10m-5-5v10" stroke="#c4cbbb" />
      <g className="desk-sheet-back" transform="rotate(-9 118 86)">
        <rect x="53" y="27" width="130" height="118" rx="2" fill="#f0f0e5" stroke="#bdc6af" />
        <path d="M66 45h53M66 53h34" stroke="#adb79f" />
        <path
          d="M71 68v54m20-54v54m20-54v54m20-54v54M66 84h10m10 0h10m10 0h10m10 0h10M66 104h10m10 0h10m10 0h10m10 0h10"
          stroke="#77896a"
          strokeWidth="2"
        />
        <circle cx="155" cy="45" r="9" stroke="#b37b60" />
      </g>
      <g className="desk-sheet-front" transform="rotate(7 185 105)">
        <rect x="130" y="57" width="104" height="103" rx="2" fill="#faf7ef" stroke="#cbc5b4" />
        <path d="M145 75h57M145 82h32" stroke="#a1ab91" />
        <circle cx="162" cy="116" r="18" stroke="#d7ddca" strokeWidth="6" />
        <path d="M162 98a18 18 0 0 1 18 18" stroke="#879877" strokeWidth="6" />
        <path d="M181 112h32m-24 8h24m-24 8h17" stroke="#bcc3ad" />
        <rect x="209" y="141" width="12" height="12" stroke="#a86e56" />
      </g>
      <path d="m217 34 3 7 7 3-7 3-3 7-3-7-7-3 7-3z" stroke="#ac765b" />
    </svg>
  );
}
