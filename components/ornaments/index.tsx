import { cuspedArchPath, jharokhaPath } from './geometry';

/* ===========================================================================
   The ornament kit.
   Every piece is vector, themeable through `currentColor` or the shared gold
   gradient, and rendered on the server — so none of it ships as JavaScript.
   ======================================================================== */

/** Rendered once per page. Every other ornament points at these. */
export function OrnamentDefs() {
  return (
    <svg aria-hidden="true" width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <linearGradient id="foil" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--gold-1)" />
          <stop offset="24%" stopColor="var(--gold-2)" />
          <stop offset="46%" stopColor="var(--gold-3)" />
          <stop offset="62%" stopColor="var(--gold-2)" />
          <stop offset="100%" stopColor="var(--gold-1)" />
        </linearGradient>

        <linearGradient id="foil-v" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--gold-1)" />
          <stop offset="40%" stopColor="var(--gold-2)" />
          <stop offset="100%" stopColor="var(--gold-3)" />
        </linearGradient>

        {/* Fine grain over large gold shapes, so they read as beaten foil. */}
        <filter id="foil-grain" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="g" />
          <feColorMatrix in="g" type="saturate" values="0" result="gm" />
          <feComposite in="gm" in2="SourceAlpha" operator="in" result="grain" />
          <feBlend in="SourceGraphic" in2="grain" mode="overlay" />
        </filter>
      </defs>
    </svg>
  );
}

type Corner = 'tl' | 'tr' | 'bl' | 'br';

const CORNER_ROTATION: Record<Corner, string> = {
  tl: 'rotate(0)',
  tr: 'scale(-1,1) translate(-48,0)',
  bl: 'scale(1,-1) translate(0,-48)',
  br: 'scale(-1,-1) translate(-48,-48)',
};

/** The gold bracket that frames a block of text. */
export function CornerBracket({
  corner,
  size = 48,
  className = '',
}: {
  corner: Corner;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      stroke="url(#foil)"
      strokeWidth="1.1"
      strokeLinecap="round"
    >
      <g transform={CORNER_ROTATION[corner]}>
        <path d="M1 20 V5 Q1 1 5 1 H20" />
        <path d="M6 24 V10 Q6 6 10 6 H24" opacity="0.55" />
        {/* A small curl where the two strokes turn, borrowed from paisley. */}
        <path d="M20 1 q7 0 9 4 t-4 6 q-3 1-3.5-2t3-3.5" opacity="0.9" />
      </g>
    </svg>
  );
}

/** Four brackets around whatever you put inside. */
export function BracketFrame({
  children,
  size = 44,
  inset = 0,
  className = '',
}: {
  children: React.ReactNode;
  size?: number;
  inset?: number;
  className?: string;
}) {
  const corners: Corner[] = ['tl', 'tr', 'bl', 'br'];
  const pos: Record<Corner, React.CSSProperties> = {
    tl: { top: inset, left: inset },
    tr: { top: inset, right: inset },
    bl: { bottom: inset, left: inset },
    br: { bottom: inset, right: inset },
  };
  return (
    <div className={`relative ${className}`}>
      {corners.map((c) => (
        <span key={c} aria-hidden="true" className="pointer-events-none absolute" style={pos[c]}>
          <CornerBracket corner={c} size={size} />
        </span>
      ))}
      {children}
    </div>
  );
}

/**
 * The cusped Mewari arch. Used as a frame for the hero and the event cards —
 * pass `asOutline` for the drawn gold line, or use the id as a clip path.
 */
export function CuspedArch({
  width = 100,
  height = 132,
  className = '',
  strokeWidth = 1,
  fill = 'none',
  lobes = 5,
}: {
  width?: number;
  height?: number;
  className?: string;
  strokeWidth?: number;
  fill?: string;
  lobes?: number;
}) {
  const outer = cuspedArchPath(width, height, height * 0.47, lobes);
  const inner = cuspedArchPath(width, height, height * 0.47, lobes, width * 0.045);
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
      fill={fill}
      stroke="url(#foil)"
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
    >
      <path d={outer} />
      <path d={inner} opacity="0.5" strokeWidth={strokeWidth * 0.7} />
    </svg>
  );
}

/** A section-header ornament: the balcony silhouette from the palace façade. */
export function Jharokha({ size = 56, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="url(#foil)"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={jharokhaPath(64, 64)} />
      <circle cx="32" cy="24" r="2.4" fill="url(#foil)" stroke="none" />
    </svg>
  );
}

/** line · diamond · four-point sparkle · diamond · line */
export function SparkleDivider({ width = 180, className = '' }: { width?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      width={width}
      height="18"
      viewBox="0 0 180 18"
      className={className}
      fill="none"
      stroke="url(#foil)"
      strokeWidth="1"
    >
      <path d="M0 9 H58" strokeLinecap="round" opacity="0.75" />
      <path d="M122 9 H180" strokeLinecap="round" opacity="0.75" />
      <path d="M66 9 L71 4 L76 9 L71 14 Z" />
      <path d="M104 9 L109 4 L114 9 L109 14 Z" />
      {/* The four-point sparkle: concave sides so the points stay sharp. */}
      <path
        d="M90 0 Q92 7 99 9 Q92 11 90 18 Q88 11 81 9 Q88 7 90 0 Z"
        fill="url(#foil)"
        stroke="none"
      />
    </svg>
  );
}

/** The Surya rosette that sits behind the monogram. */
export function SuryaRosette({ size = 120, className = '' }: { size?: number; className?: string }) {
  const rays = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const inner = 19;
    const outer = i % 2 === 0 ? 30 : 25;
    return {
      x1: 32 + Math.cos(a) * inner,
      y1: 32 + Math.sin(a) * inner,
      x2: 32 + Math.cos(a) * outer,
      y2: 32 + Math.sin(a) * outer,
    };
  });
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="url(#foil)"
      strokeWidth="0.8"
      strokeLinecap="round"
    >
      {rays.map((r, i) => (
        <line key={i} x1={r.x1.toFixed(2)} y1={r.y1.toFixed(2)} x2={r.x2.toFixed(2)} y2={r.y2.toFixed(2)} />
      ))}
      <circle cx="32" cy="32" r="17" />
      <circle cx="32" cy="32" r="14" opacity="0.5" />
    </svg>
  );
}

/** A single ambi (paisley), the unit the borders are built from. */
export function Paisley({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      stroke="url(#foil)"
      strokeWidth="1"
      strokeLinecap="round"
    >
      <path d="M16 30 C4 24 3 12 10 6 C16 1 26 3 27 11 C28 18 21 22 17 18 C14 15 17 10 21 12" />
      <path d="M15 25 C9 21 8 14 12 10" opacity="0.55" />
    </svg>
  );
}

/**
 * The rule under every section heading: a hairline that stops either side of a
 * central lotus bud, with a pair of ambis turning away from it. Drawn in real
 * coordinates and centred with CSS, so the motifs never shear.
 */
export function PaisleyBorder({ width = 200, className = '' }: { width?: number; className?: string }) {
  const ambi = 'M0 0 C -5.5 -2.4 -6 -7.4 -2.6 -10 C 0.4 -12.2 4.6 -11 5 -7.4 C 5.4 -4.2 2.2 -2.4 0.6 -4.2 C -0.6 -5.6 0.6 -7.6 2.4 -6.8';
  return (
    <svg
      aria-hidden="true"
      width={width}
      height={Math.round(width * 0.11)}
      viewBox="0 0 200 22"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 14 H66" opacity="0.45" />
      <path d="M134 14 H196" opacity="0.45" />

      {/* Ambis turning away from the centre */}
      <g transform="translate(76 18)">
        <path d={ambi} />
      </g>
      <g transform="translate(124 18) scale(-1,1)">
        <path d={ambi} />
      </g>

      {/* A lotus bud at the middle */}
      <g transform="translate(100 14)">
        <path d="M0 0 C -4 -2 -5.5 -6.5 -3.5 -10 C -1.2 -7.6 0 -4 0 0 Z" />
        <path d="M0 0 C 4 -2 5.5 -6.5 3.5 -10 C 1.2 -7.6 0 -4 0 0 Z" />
        <path d="M-7.5 -1 C -9.5 -3.5 -9 -6.5 -7 -7.5 C -5.5 -5.5 -5.5 -2.5 -7.5 -1 Z" opacity="0.7" />
        <path d="M7.5 -1 C 9.5 -3.5 9 -6.5 7 -7.5 C 5.5 -5.5 5.5 -2.5 7.5 -1 Z" opacity="0.7" />
      </g>

      <circle cx="70" cy="14" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="130" cy="14" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** A lotus, drawn in gold line. Also the plinth the Ganesha sits on. */
export function Lotus({ size = 72, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size * 0.42}
      viewBox="0 0 72 30"
      className={className}
      fill="none"
      stroke="url(#foil)"
      strokeWidth="1"
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <path d="M36 28 C30 28 25 23 25 16 C25 9 30 3 36 1 C42 3 47 9 47 16 C47 23 42 28 36 28 Z" />
      <path d="M25 17 C19 14 12 15 8 20 C13 26 22 28 29 25" />
      <path d="M47 17 C53 14 60 15 64 20 C59 26 50 28 43 25" />
      <path d="M31 27 C26 24 23 19 23 13" opacity="0.5" />
      <path d="M41 27 C46 24 49 19 49 13" opacity="0.5" />
    </svg>
  );
}

/** A peacock feather eye, used sparingly as an accent. */
export function PeacockFeather({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      fill="none"
      stroke="url(#foil)"
      strokeWidth="0.9"
      strokeLinecap="round"
    >
      <path d="M20 39 C20 30 20 24 20 20" />
      <ellipse cx="20" cy="13" rx="11" ry="12.5" />
      <ellipse cx="20" cy="14" rx="6.5" ry="7.5" opacity="0.7" />
      <ellipse cx="20" cy="15" rx="2.8" ry="3.4" fill="url(#foil)" stroke="none" />
      {[-34, -17, 0, 17, 34].map((a) => (
        <path key={a} d="M20 1 C20 -3 20 -5 20 -7" transform={`rotate(${a} 20 13)`} opacity="0.6" />
      ))}
    </svg>
  );
}

/**
 * Ganesha, drawn as a single gold line on a lotus.
 * Deliberately spare — a few confident strokes rather than an illustration.
 */
export function Ganesha({ size = 96, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 96 96"
      className={className}
      fill="none"
      stroke="url(#foil)"
      strokeWidth="1.15"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Mukut — the crown */}
      <path d="M48 7 L48 13" />
      <path d="M38 22 C38 13 42 9 48 9 C54 9 58 13 58 22" />
      <path d="M41 15 L48 10 L55 15" opacity="0.6" />

      {/* Head */}
      <path d="M36 23 C32 27 31 34 34 40 C37 46 43 49 48 49 C53 49 59 46 62 40 C65 34 64 27 60 23" />

      {/* Ears, the broad fans either side */}
      <path d="M36 25 C27 23 20 27 19 34 C18 41 24 46 32 44" />
      <path d="M60 25 C69 23 76 27 77 34 C78 41 72 46 64 44" />
      <path d="M33 29 C28 29 25 32 25 36" opacity="0.5" />
      <path d="M63 29 C68 29 71 32 71 36" opacity="0.5" />

      {/* Trunk, curling to its left */}
      <path d="M48 36 C48 44 46 52 41 56 C36 60 31 57 32 52 C33 48 38 48 39 52" />

      {/* Tusks */}
      <path d="M41 42 C39 45 38 47 37 48" />
      <path d="M55 42 C57 45 58 47 59 48" opacity="0.55" />

      {/* Eyes */}
      <path d="M40 33 C42 31 44 31 45 33" />
      <path d="M51 33 C52 31 54 31 56 33" />

      {/* Shoulders and the folded body */}
      <path d="M34 53 C27 56 23 62 22 69" />
      <path d="M62 53 C69 56 73 62 74 69" />
      <path d="M22 69 C30 72 38 73 48 73 C58 73 66 72 74 69" />

      {/* The lotus plinth */}
      <g transform="translate(12 68)">
        <path d="M36 25 C31 25 27 21 27 15 C27 10 31 5 36 3 C41 5 45 10 45 15 C45 21 41 25 36 25 Z" />
        <path d="M27 16 C22 13 16 14 12 18 C16 23 24 25 30 23" />
        <path d="M45 16 C50 13 56 14 60 18 C56 23 48 25 42 23" />
      </g>
    </svg>
  );
}

/** The stamped monogram disc used in the closing panel. */
export function MonogramDisc({
  monogram,
  size = 72,
  className = '',
}: {
  monogram: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`relative grid place-items-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <SuryaRosette size={size} className="absolute inset-0 opacity-70" />
      <span
        className="t-caps gold-text relative"
        style={{ fontSize: size * 0.18, letterSpacing: '0.1em' }}
      >
        {monogram}
      </span>
    </div>
  );
}
