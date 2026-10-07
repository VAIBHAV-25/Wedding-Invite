/**
 * An illustrated scene for each ceremony, drawn in vector.
 *
 * These stand in until real photographs are uploaded. Each one is a different
 * subject with its own palette, so the Festivities section reads as six
 * distinct cards rather than six tinted rectangles — and because they are
 * vector they are a couple of kilobytes each and stay sharp on any screen.
 */

type Tone =
  | 'ganpati'
  | 'engagement'
  | 'mehendi'
  | 'haldi'
  | 'sangeet'
  | 'mayra'
  | 'baraat'
  | 'swagat'
  | 'pheras'
  | 'reception';

const SKY: Record<Tone, [string, string, string]> = {
  ganpati: ['#4a1508', '#8c3a12', '#e8a44a'],
  engagement: ['#2a1038', '#55275f', '#c48ec4'],
  mayra: ['#0f2a3d', '#255070', '#6ba8c9'],
  swagat: ['#44120d', '#8a2f1c', '#e09a5c'],
  mehendi: ['#123327', '#1f5340', '#56a07c'],
  haldi: ['#4a3307', '#9a6f12', '#f0bb47'],
  sangeet: ['#1b0f33', '#3f2068', '#9c6fd4'],
  baraat: ['#3d0c08', '#8a2c13', '#e0803c'],
  pheras: ['#3a0710', '#7d1322', '#d9707c'],
  reception: ['#0b1832', '#22406c', '#7098cf'],
};

function Marigolds({ y, count, r }: { y: number; count: number; r: number }) {
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const x = (i + 0.5) * (200 / count);
        const drop = y + (i % 2 ? 6 : 0);
        return (
          <g key={i} transform={`translate(${x} ${drop})`}>
            <circle r={r} fill="currentColor" opacity="0.85" />
            <circle r={r * 0.55} fill="currentColor" opacity="0.5" />
          </g>
        );
      })}
    </g>
  );
}

/** A string of marigolds swagged across the top of a scene. */
function Torana({ color }: { color: string }) {
  return (
    <g color={color}>
      <path d="M0 14 Q50 44 100 14 Q150 44 200 14" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.75" />
      {Array.from({ length: 26 }, (_, i) => {
        const t = i / 25;
        // Two swags, so the beads follow the rope rather than a straight line.
        const seg = t < 0.5 ? t * 2 : (t - 0.5) * 2;
        const x = t * 200;
        const y = 14 + 30 * (1 - Math.pow(2 * seg - 1, 2)) * 0.98;
        return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={2.6} fill="currentColor" opacity="0.9" />;
      })}
    </g>
  );
}

function Diyas({ y }: { y: number }) {
  return (
    <g>
      {[30, 80, 120, 170].map((x, i) => (
        <g key={x} transform={`translate(${x} ${y + (i % 2 ? 5 : 0)})`}>
          <path d="M-7 0 Q0 7 7 0 Z" fill="#d4af37" opacity="0.9" />
          <path d="M0 -1 C -2.4 -5 0 -9 0 -11 C 0 -9 2.4 -5 0 -1 Z" fill="#ffe6a8" />
          <circle cy="-6" r="7" fill="#ffd27a" opacity="0.18" />
        </g>
      ))}
    </g>
  );
}

export function EventScene({ tone }: { tone: Tone }) {
  const [dark, mid, light] = SKY[tone] ?? SKY.pheras;
  const uid = `sc-${tone}`;

  return (
    <svg
      className="event-scene"
      viewBox="0 0 200 280"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={mid} />
          <stop offset="55%" stopColor={dark} />
          <stop offset="100%" stopColor={dark} />
        </linearGradient>
        <radialGradient id={`${uid}-glow`} cx="50%" cy="58%" r="55%">
          <stop offset="0%" stopColor={light} stopOpacity="0.5" />
          <stop offset="100%" stopColor={light} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="200" height="280" fill={`url(#${uid}-bg)`} />
      <rect width="200" height="280" fill={`url(#${uid}-glow)`} />

      {tone === 'mehendi' && (
        <g>
          <Torana color="#f0a33c" />
          {/* A henna-patterned palm */}
          <g transform="translate(100 168)" stroke="#f6dcb0" fill="none" strokeWidth="1.2" strokeLinecap="round">
            <path
              d="M-30 46 C -36 20 -34 -2 -26 -18 C -22 -26 -14 -28 -10 -22 L -6 -4 L -2 -34 C 0 -42 10 -42 11 -33 L 12 -4 L 20 -28 C 23 -36 32 -33 31 -25 L 26 2 C 24 22 18 38 12 48 Z"
              fill="#2a5f49"
              opacity="0.92"
            />
            <circle cx="0" cy="14" r="9" />
            <circle cx="0" cy="14" r="4.5" />
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return (
                <path
                  key={i}
                  d={`M${(Math.cos(a) * 9).toFixed(1)} ${(14 + Math.sin(a) * 9).toFixed(1)} l${(Math.cos(a) * 6).toFixed(1)} ${(Math.sin(a) * 6).toFixed(1)}`}
                />
              );
            })}
            <path d="M-16 30 q8 7 16 0 t16 0" />
            <path d="M-13 38 q6 5 13 0 t13 0" opacity="0.7" />
            <path d="M-8 -12 q4 6 0 12" />
            <path d="M8 -12 q-4 6 0 12" />
          </g>
          <Marigolds y={238} count={9} r={7} />
          <g color="#f0a33c">
            <Marigolds y={262} count={11} r={5} />
          </g>
        </g>
      )}

      {tone === 'haldi' && (
        <g>
          <Torana color="#ffd766" />
          {/* Sun, and a thali of turmeric */}
          <circle cx="100" cy="112" r="30" fill="#ffd766" opacity="0.22" />
          <circle cx="100" cy="112" r="20" fill="#ffd766" opacity="0.35" />
          {Array.from({ length: 20 }, (_, i) => {
            const a = (i / 20) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={(100 + Math.cos(a) * 33).toFixed(1)}
                y1={(112 + Math.sin(a) * 33).toFixed(1)}
                x2={(100 + Math.cos(a) * (i % 2 ? 40 : 45)).toFixed(1)}
                y2={(112 + Math.sin(a) * (i % 2 ? 40 : 45)).toFixed(1)}
                stroke="#ffd766"
                strokeWidth="1.2"
                opacity="0.55"
                strokeLinecap="round"
              />
            );
          })}
          <g transform="translate(100 206)">
            <ellipse rx="44" ry="11" fill="#c8912a" />
            <ellipse rx="38" ry="9" fill="#f5cf6a" />
            <ellipse rx="22" ry="5.5" cy="-2" fill="#e2a82f" />
            <path d="M-20 -6 q20 -12 40 0" fill="none" stroke="#fff0c4" strokeWidth="1.2" opacity="0.6" />
          </g>
          <Marigolds y={250} count={9} r={7} />
        </g>
      )}

      {tone === 'sangeet' && (
        <g>
          {/* Chandeliers and a dhol */}
          {[46, 100, 154].map((x, i) => (
            <g key={x} transform={`translate(${x} ${i === 1 ? 0 : 14})`}>
              <line x1="0" y1="0" x2="0" y2="38" stroke="#d9b6f0" strokeWidth="0.9" opacity="0.6" />
              <ellipse cy="44" rx="16" ry="6" fill="#e5c8f7" opacity="0.3" />
              {[-11, -5.5, 0, 5.5, 11].map((dx) => (
                <g key={dx}>
                  <line x1={dx} y1="46" x2={dx} y2={60 + Math.abs(dx)} stroke="#e5c8f7" strokeWidth="0.7" opacity="0.55" />
                  <circle cx={dx} cy={62 + Math.abs(dx)} r="2" fill="#f4e2ff" opacity="0.9" />
                </g>
              ))}
            </g>
          ))}
          <g transform="translate(100 196)">
            <path d="M-34 -20 L34 -20 L26 26 L-26 26 Z" fill="#8a4f2b" />
            <ellipse cy="-20" rx="34" ry="9" fill="#f3e0c4" />
            <ellipse cy="26" rx="26" ry="7" fill="#d8bb92" />
            {Array.from({ length: 9 }, (_, i) => (
              <line
                key={i}
                x1={-32 + i * 8}
                y1="-16"
                x2={-25 + i * 6.5}
                y2="22"
                stroke="#f0d7ae"
                strokeWidth="0.9"
                opacity="0.7"
              />
            ))}
          </g>
          <g fill="#f4e2ff" opacity="0.55">
            {[[28, 120], [170, 140], [44, 240], [160, 236]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={1.8} />
            ))}
          </g>
          <Marigolds y={262} count={11} r={5} />
        </g>
      )}

      {tone === 'baraat' && (
        <g>
          {/* A horse under a parasol, and a dhol player */}
          <circle cx="156" cy="56" r="26" fill="#ffd9a0" opacity="0.28" />
          <g transform="translate(86 176)" fill="#f7e0bd">
            <path d="M-34 24 C -38 6 -30 -8 -14 -10 L 6 -12 C 18 -13 28 -6 30 6 L 32 20 L 24 20 L 22 8 L 4 10 L 2 24 L -6 24 L -6 10 L -22 12 L -24 24 Z" />
            <path d="M6 -12 C 10 -24 20 -30 28 -30 L 34 -40 L 38 -30 C 44 -28 46 -22 42 -18 L 30 -10 Z" />
            <path d="M34 -40 L30 -48 L38 -44 Z" />
            <path d="M-34 10 C -44 8 -48 16 -44 22" stroke="#f7e0bd" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
          <g transform="translate(86 142)">
            <path d="M-26 0 Q0 -18 26 0 Z" fill="#e0803c" opacity="0.9" />
            <path d="M-26 0 h52" stroke="#ffd9a0" strokeWidth="1.4" />
            <line x1="0" y1="0" x2="0" y2="26" stroke="#ffd9a0" strokeWidth="1.2" />
            {Array.from({ length: 7 }, (_, i) => (
              <circle key={i} cx={-24 + i * 8} cy="3" r="1.8" fill="#ffd9a0" />
            ))}
          </g>
          <g transform="translate(160 214)">
            <ellipse rx="15" ry="16" fill="#8a4f2b" />
            <ellipse rx="15" ry="5" fill="#f3e0c4" />
            <path d="M-20 -16 L-9 -6 M20 -16 L9 -6" stroke="#f7e0bd" strokeWidth="2" strokeLinecap="round" />
          </g>
          <Marigolds y={256} count={9} r={6} />
        </g>
      )}

      {tone === 'pheras' && (
        <g>
          <Torana color="#f5b0ba" />
          {/* The mandap, with the fire at its centre */}
          <g stroke="#f9d9b0" fill="none" strokeWidth="1.6" strokeLinecap="round">
            <line x1="40" y1="110" x2="40" y2="232" />
            <line x1="160" y1="110" x2="160" y2="232" />
            <path d="M40 110 Q70 78 100 96 Q130 78 160 110" />
            <path d="M48 116 Q72 92 100 106 Q128 92 152 116" opacity="0.55" />
            <path d="M100 96 L100 84" />
          </g>
          <circle cx="100" cy="80" r="4" fill="#f9d9b0" />
          {[40, 160].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy="232" rx="14" ry="4.5" fill="#f9d9b0" opacity="0.5" />
              <path d={`M${x - 10} 110 q10 -14 20 0`} fill="#f5b0ba" opacity="0.6" />
            </g>
          ))}
          <g transform="translate(100 206)">
            <path d="M-22 18 L22 18 L16 2 L-16 2 Z" fill="#7d1322" stroke="#f9d9b0" strokeWidth="1.2" />
            <path d="M0 -2 C -9 -14 -4 -26 0 -34 C 4 -26 9 -14 0 -2 Z" fill="#ffc46a" />
            <path d="M0 -4 C -5 -12 -2 -20 0 -26 C 2 -20 5 -12 0 -4 Z" fill="#fff0c4" />
            <circle cy="-16" r="22" fill="#ffc46a" opacity="0.16" />
          </g>
          <Marigolds y={252} count={9} r={6.5} />
        </g>
      )}

      {tone === 'ganpati' && (
        <g>
          <Torana color="#f0a33c" />
          {/* A kalash on its plinth, under an arch of lamps */}
          <g transform="translate(100 168)" stroke="#ffd9a0" fill="none" strokeWidth="1.5" strokeLinecap="round">
            <path d="M-26 44 H26 L22 54 H-22 Z" fill="#8a3a12" />
            <path d="M-20 44 C -26 26 -24 8 -12 0 L 12 0 C 24 8 26 26 20 44 Z" fill="#c4761f" />
            <path d="M-14 0 L-16 -8 H16 L14 0 Z" fill="#e0a04a" />
            <ellipse cy="-9" rx="17" ry="4" fill="#e0a04a" />
            {/* Coconut and mango leaves */}
            <ellipse cy="-21" rx="9" ry="11" fill="#a8541f" />
            <path d="M-16 -10 C -26 -18 -30 -30 -26 -38 C -17 -34 -13 -22 -14 -11 Z" fill="#2f6b3c" />
            <path d="M16 -10 C 26 -18 30 -30 26 -38 C 17 -34 13 -22 14 -11 Z" fill="#2f6b3c" />
            <path d="M-8 -13 C -14 -22 -14 -32 -9 -38 C -4 -31 -4 -21 -7 -13 Z" fill="#3b8049" />
            <path d="M8 -13 C 14 -22 14 -32 9 -38 C 4 -31 4 -21 7 -13 Z" fill="#3b8049" />
            <path d="M-16 16 h32 M-18 26 h36" opacity="0.5" />
          </g>
          <Diyas y={240} />
          <Marigolds y={264} count={11} r={5} />
        </g>
      )}

      {tone === 'engagement' && (
        <g>
          {/* Two rings, interlocked, under a soft light */}
          <circle cx="100" cy="124" r="46" fill="#c48ec4" opacity="0.14" />
          <g fill="none" stroke="#f0ddf5" strokeWidth="3.4">
            <circle cx="86" cy="128" r="26" />
            <circle cx="114" cy="128" r="26" opacity="0.9" />
          </g>
          <g fill="#ffe9a8">
            <path d="M86 96 l4.4 7.6 h-8.8 Z" />
            <circle cx="86" cy="94" r="3.4" />
          </g>
          {/* Petals on the table below */}
          <g transform="translate(100 210)">
            <ellipse ry="9" rx="54" fill="#efe4f5" opacity="0.85" />
            <path d="M-54 0 L-48 42 L48 42 L54 0 Z" fill="#d8c5e4" opacity="0.8" />
          </g>
          <Marigolds y={258} count={11} r={5} />
        </g>
      )}

      {tone === 'mayra' && (
        <g>
          <Torana color="#9fd0e8" />
          {/* A laden thali carried in — the bhaat */}
          <g transform="translate(100 150)">
            <ellipse ry="7" rx="46" fill="#dcecf5" />
            <path d="M-46 0 C -42 24 -26 36 0 36 C 26 36 42 24 46 0 Z" fill="#9fc4da" />
            <g fill="#e8c56a">
              <circle cx="-22" cy="12" r="8" />
              <circle cx="0" cy="16" r="9" />
              <circle cx="22" cy="12" r="8" />
            </g>
            <path d="M-30 -4 Q0 -14 30 -4" fill="none" stroke="#f2f8fc" strokeWidth="1.4" opacity="0.7" />
          </g>
          {/* Bangles stacked beside it */}
          <g transform="translate(100 214)" fill="none" stroke="#e8c56a" strokeWidth="2.6">
            {[-26, 0, 26].map((dx) => (
              <g key={dx}>
                <ellipse cx={dx} cy="0" rx="15" ry="5" />
                <ellipse cx={dx} cy="8" rx="15" ry="5" opacity="0.7" />
                <ellipse cx={dx} cy="16" rx="15" ry="5" opacity="0.45" />
              </g>
            ))}
          </g>
          <Marigolds y={258} count={11} r={5} />
        </g>
      )}

      {tone === 'swagat' && (
        <g>
          <Torana color="#f0a33c" />
          {/* The gateway, with an aarti thali at its threshold */}
          <g stroke="#ffd9a0" fill="none" strokeWidth="1.8" strokeLinecap="round">
            <line x1="44" y1="120" x2="44" y2="236" />
            <line x1="156" y1="120" x2="156" y2="236" />
            <path d="M44 120 Q72 86 100 104 Q128 86 156 120" />
            <path d="M52 126 Q74 100 100 114 Q126 100 148 126" opacity="0.5" />
          </g>
          <g color="#e0803c">
            <g transform="translate(0 -118)">
              <Marigolds y={236} count={7} r={6} />
            </g>
          </g>
          <g transform="translate(100 212)">
            <ellipse ry="6" rx="30" fill="#e8c56a" />
            <path d="M-30 0 C -27 16 -16 24 0 24 C 16 24 27 16 30 0 Z" fill="#c4902a" />
            <path d="M0 -4 C -4 -11 -2 -17 0 -22 C 2 -17 4 -11 0 -4 Z" fill="#fff0c4" />
            <circle cy="-12" r="17" fill="#ffc46a" opacity="0.2" />
          </g>
          <Marigolds y={258} count={9} r={6} />
        </g>
      )}

      {tone === 'reception' && (
        <g>
          {/* Chandelier over a laid table */}
          <g transform="translate(100 0)">
            <line x1="0" y1="0" x2="0" y2="40" stroke="#cfe0ff" strokeWidth="1" opacity="0.6" />
            <ellipse cy="46" rx="30" ry="9" fill="#dfe9ff" opacity="0.26" />
            <ellipse cy="60" rx="22" ry="7" fill="#dfe9ff" opacity="0.2" />
            {[-26, -17, -8, 0, 8, 17, 26].map((dx) => (
              <g key={dx}>
                <line x1={dx} y1="50" x2={dx} y2={70 + Math.abs(dx) * 0.7} stroke="#dfe9ff" strokeWidth="0.7" opacity="0.5" />
                <circle cx={dx} cy={72 + Math.abs(dx) * 0.7} r="2.2" fill="#f2f7ff" opacity="0.9" />
              </g>
            ))}
          </g>
          <g transform="translate(100 212)">
            <ellipse ry="12" rx="58" fill="#e8eefb" opacity="0.92" />
            <path d="M-58 0 L-50 46 L50 46 L58 0 Z" fill="#cfd9ee" opacity="0.85" />
            <g fill="#d4af37">
              <circle cx="-28" cy="-6" r="5" />
              <circle cx="28" cy="-6" r="5" />
              <path d="M-4 -22 h8 v16 h-8 Z" opacity="0.8" />
              <path d="M0 -22 C -6 -32 -2 -40 0 -46 C 2 -40 6 -32 0 -22 Z" fill="#ffd27a" />
            </g>
          </g>
          <g fill="#f2f7ff" opacity="0.5">
            {[[30, 126], [172, 150], [48, 170], [156, 118]].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={1.6} />
            ))}
          </g>
          <Diyas y={262} />
        </g>
      )}
    </svg>
  );
}
