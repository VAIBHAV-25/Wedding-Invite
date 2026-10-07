import { cuspedArchPath } from '@/components/ornaments/geometry';
import { DeityMotif, type Deity } from '@/components/ornaments/deities';

/**
 * The decorative gold work on the envelope.
 *
 * Kept separate from EnvelopeGate so the paper (EmbossPattern), the foil
 * (here) and the choreography (EnvelopeGate) can each be tuned without
 * disturbing the others.
 */

/** A band of paisley and lotus running along one diagonal fold of the flap. */
export function FoilFoldBand() {
  return (
    <svg
      className="foil-band"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      vectorEffect="non-scaling-stroke"
    >
      <defs>
        <linearGradient id="fold-foil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8a6a1c" stopOpacity="0.15" />
          <stop offset="28%" stopColor="#d4af37" stopOpacity="0.75" />
          <stop offset="50%" stopColor="#f8e7a8" stopOpacity="0.95" />
          <stop offset="72%" stopColor="#d4af37" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#8a6a1c" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {/* The crease, as a highlight above and a shadow below. */}
      <polyline
        points="0,36 50,64 100,36"
        fill="none"
        stroke="url(#fold-foil)"
        strokeWidth="1.1"
        vectorEffect="non-scaling-stroke"
      />
      <polyline
        points="0,37 50,65 100,37"
        fill="none"
        stroke="rgba(28,3,7,0.45)"
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
      <polyline
        points="0,34.4 50,62.4 100,34.4"
        fill="none"
        stroke="rgba(248,231,168,0.2)"
        strokeWidth="0.7"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * The repeating ambi border that sits just inside the flap's fold.
 * Drawn in real pixel space and positioned with CSS, so the motifs keep their
 * proportions instead of shearing with the envelope.
 */
export function FoilPaisleyRun({ className = '' }: { className?: string }) {
  const unit = (i: number) => (
    <g key={i} transform={`translate(${i * 34} 0)`}>
      <path d="M8 13 C2.5 10.5 2 5.5 5.2 3 C8 1 12.4 2 12.8 5.5 C13.2 8.6 10 10.4 8.2 8.6 C6.8 7.2 8.2 5 10 5.9" />
      <circle cx="21" cy="8" r="1.3" fill="currentColor" stroke="none" />
      <path d="M26 12 C26 9 27.6 6.5 30 5.5 C32.4 6.5 34 9 34 12" opacity="0.65" />
    </g>
  );
  return (
    <svg
      className={className}
      viewBox="0 0 340 16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {Array.from({ length: 10 }, (_, i) => unit(i))}
    </svg>
  );
}

/**
 * The crest at the head of the envelope: the deity in a cusped niche, the way
 * a wedding card carries the invocation before anything else is said.
 */
export function EnvelopeCrest({
  deity,
  image,
}: {
  deity: Deity;
  image?: string;
}) {
  if (deity === 'none') return null;
  return (
    <div className="foil-crest" aria-hidden="true">
      <svg className="crest-niche" viewBox="0 0 140 152" fill="none" aria-hidden="true">
        {/* The cusped niche */}
        <path
          d={cuspedArchPath(140, 152, 84, 5)}
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
        <path
          d={cuspedArchPath(140, 152, 84, 5, 6)}
          stroke="currentColor"
          strokeWidth="0.7"
          opacity="0.5"
          strokeLinejoin="round"
        />
        {/* A finial over the apex */}
        <path d="M70 10 L70 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <circle cx="70" cy="1.6" r="1.8" fill="currentColor" />
      </svg>

      <DeityMotif deity={deity} image={image} size={96} className="crest-deity" />

      <svg className="crest-base" viewBox="0 0 140 18" fill="none" aria-hidden="true">
        <path d="M18 3 H122" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round" opacity="0.7" />
        <path
          d="M70 2 Q74 7 80 8.5 Q74 10 70 15 Q66 10 60 8.5 Q66 7 70 2 Z"
          fill="currentColor"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}

/** A filigree corner, mirrored into each corner of the envelope. */
export function FoilCorner({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const t = {
    tl: '',
    tr: 'scale(-1,1) translate(-76,0)',
    bl: 'scale(1,-1) translate(0,-76)',
    br: 'scale(-1,-1) translate(-76,-76)',
  }[corner];

  return (
    <svg
      className={`foil-corner foil-corner-${corner}`}
      viewBox="0 0 76 76"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g transform={t}>
        <path d="M4 30 V10 Q4 4 10 4 H30" />
        <path d="M10 36 V17 Q10 12 15 12 H34" opacity="0.5" />
        {/* A vine turning back on itself, the way foil corners are tooled. */}
        <path d="M30 4 Q42 4 46 11 T40 24 Q34 27 32 21 T39 15" />
        <path d="M4 30 Q4 42 11 46 T24 40 Q27 34 21 32 T15 39" />
        <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

/** Slow gold motes drifting over the paper, so the gate is never quite still. */
export function GoldMotes() {
  const motes = [
    { l: 12, t: 22, d: 0, s: 2.2, dur: 13 },
    { l: 78, t: 16, d: 2.4, s: 1.6, dur: 16 },
    { l: 32, t: 58, d: 5.1, s: 2.6, dur: 14 },
    { l: 64, t: 72, d: 1.2, s: 1.8, dur: 18 },
    { l: 88, t: 46, d: 6.8, s: 2, dur: 15 },
    { l: 22, t: 84, d: 3.6, s: 1.5, dur: 17 },
    { l: 50, t: 34, d: 8.2, s: 1.3, dur: 19 },
    { l: 6, t: 64, d: 4.4, s: 1.9, dur: 12 },
  ];
  return (
    <div className="motes" aria-hidden="true">
      {motes.map((m, i) => (
        <span
          key={i}
          style={{
            left: `${m.l}%`,
            top: `${m.t}%`,
            width: m.s * 2,
            height: m.s * 2,
            animationDelay: `${m.d}s`,
            animationDuration: `${m.dur}s`,
          }}
        />
      ))}
    </div>
  );
}
