/**
 * A strung marigold garland, hung across the head of a section.
 *
 * This is the one thing every Indian wedding has at every doorway, and the
 * invitation had none of it — the whole page ran on maroon, ivory and gold.
 * It does double duty: it brings the warm end of the palette in, and it turns
 * the join between two sections into an event instead of a gradient fade.
 *
 * Drawn on a 420-unit field, which is near enough 1:1 with the invitation
 * column at any phone width, so the flowers stay round.
 */

/** Centre, mid and edge for one bloom. Marigolds run from a deep rusty heart
 *  out to a bright edge, which is most of what makes them readable. */
type Bloom3 = { heart: string; mid: string; edge: string };

const BLOOMS: Bloom3[] = [
  { heart: '#B8540C', mid: '#E8841A', edge: '#F7A93A' },
  { heart: '#C76A08', mid: '#F0A020', edge: '#FAC247' },
  { heart: '#A84A10', mid: '#DE7616', edge: '#F39B30' },
  { heart: '#C98A08', mid: '#F2BB2A', edge: '#FAD75E' },
];

const r2 = (v: number) => Math.round(v * 100) / 100;

/**
 * A marigold.
 *
 * Flat discs with a few dots read as beads on a string, which is what the
 * first version of this looked like. A marigold is a dense pom-pom: rings of
 * small rounded petals, each ring offset from the one beneath and lighter
 * towards the edge. Three rings is enough to read at this size.
 */
function Bloom({ x, y, i, scale = 1 }: { x: number; y: number; i: number; scale?: number }) {
  const b = BLOOMS[i % BLOOMS.length];
  const r = r2(7.6 * scale);
  const spin = (i * 37) % 360;

  const ring = (count: number, radius: number, petal: number, fill: string, from: number) =>
    Array.from({ length: count }, (_, k) => {
      const a = (k / count) * Math.PI * 2 + from;
      return (
        <ellipse
          key={`${fill}-${k}`}
          cx={r2(Math.cos(a) * radius)}
          cy={r2(Math.sin(a) * radius)}
          rx={r2(petal)}
          ry={r2(petal * 0.74)}
          fill={fill}
          transform={`rotate(${r2((a * 180) / Math.PI)} ${r2(Math.cos(a) * radius)} ${r2(Math.sin(a) * radius)})`}
        />
      );
    });

  return (
    <g transform={`translate(${r2(x)} ${r2(y)}) rotate(${spin})`}>
      {ring(11, r * 0.74, r * 0.4, b.edge, 0)}
      {ring(9, r * 0.5, r * 0.34, b.mid, 0.3)}
      {ring(7, r * 0.26, r * 0.28, b.heart, 0.6)}
      <circle r={r2(r * 0.13)} fill={b.heart} opacity="0.85" />
    </g>
  );
}

function Leaf({ x, y, flip }: { x: number; y: number; flip: boolean }) {
  return (
    <g transform={`translate(${r2(x)} ${r2(y)}) ${flip ? 'scale(-1,1)' : ''} rotate(${flip ? -22 : 22})`}>
      <path d="M0 0 C -6 -2 -10 -8 -9 -15 C -2 -13 2 -7 0 0 Z" fill="#2E6B36" />
      <path d="M0 0 C -5 -3 -8 -8 -8 -13" fill="none" stroke="#4E9152" strokeWidth="0.8" opacity="0.9" />
    </g>
  );
}

export function Garland({
  swags = 3,
  sag = 26,
  className = '',
}: {
  swags?: number;
  sag?: number;
  className?: string;
}) {
  const W = 420;
  const span = W / swags;
  const top = 6;

  /** Where the rope hangs at a given point: a sine arc per swag. */
  const ropeY = (x: number) => {
    const t = (x % span) / span;
    return top + Math.sin(Math.PI * t) * sag;
  };

  const rope: string[] = [];
  for (let x = 0; x <= W; x += 4) rope.push(`${x === 0 ? 'M' : 'L'} ${x} ${r2(ropeY(x))}`);

  const blooms: React.ReactNode[] = [];
  let n = 0;
  for (let x = 2; x <= W; x += 10.5) {
    const y = ropeY(x);
    // Heavier at the bottom of each swag, as a strung garland hangs, and with
    // a little irregularity so it does not march.
    const depth = (y - top) / Math.max(sag, 1);
    const wobble = ((n * 73) % 17) / 100;
    blooms.push(
      <Bloom key={`b${n}`} x={r2(x)} y={r2(y + wobble * 6 - 2)} i={n} scale={r2(0.76 + depth * 0.34 + wobble)} />,
    );
    if (n % 5 === 3) blooms.push(<Leaf key={`l${n}`} x={r2(x)} y={r2(y + 6)} flip={n % 10 === 3} />);
    n += 1;
  }

  /** A few strands dangling from the knots between swags. */
  const strands: React.ReactNode[] = [];
  for (let s = 1; s < swags; s++) {
    const x = s * span;
    strands.push(
      <g key={`s${s}`}>
        <line x1={x} y1={top} x2={x} y2={top + 30} stroke="#2E6B36" strokeWidth="1.3" opacity="0.8" />
        {[0, 1, 2].map((k) => (
          <Bloom key={k} x={x} y={top + 11 + k * 10} i={s * 3 + k} scale={r2(0.66 - k * 0.09)} />
        ))}
      </g>,
    );
  }

  return (
    <svg
      className={`garland ${className}`}
      viewBox={`0 0 ${W} ${top + sag + 30}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <path d={rope.join(' ')} fill="none" stroke="#24552B" strokeWidth="2.4" opacity="0.9" />
      <path d={rope.join(' ')} fill="none" stroke="#4E9152" strokeWidth="0.9" opacity="0.6" transform="translate(0 -0.8)" />
      {strands}
      {blooms}
    </svg>
  );
}
