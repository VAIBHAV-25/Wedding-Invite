/**
 * A tapered-stroke builder.
 *
 * SVG strokes are a constant width, which is exactly what calligraphy is not.
 * These helpers walk a Bezier spine, offset it by a width that varies along
 * its length, and return a filled outline — so a stroke can start as a hair,
 * swell through the turn and finish on a point.
 *
 * Everything runs at build time inside server components, so the result is
 * plain path data in the HTML with no runtime cost.
 */

export type Pt = [number, number];
/** c1x, c1y, c2x, c2y, x, y — one cubic segment, as in an SVG `C` command. */
export type Seg = [number, number, number, number, number, number];

export interface Stroke {
  start: Pt;
  segs: Seg[];
  /** Widths sampled evenly from the start of the stroke to its end. */
  widths: number[];
}

function at(p0: Pt, c1: Pt, c2: Pt, p1: Pt, t: number): Pt {
  const mt = 1 - t;
  const a = mt * mt * mt;
  const b = 3 * mt * mt * t;
  const c = 3 * mt * t * t;
  const d = t * t * t;
  return [
    a * p0[0] + b * c1[0] + c * c2[0] + d * p1[0],
    a * p0[1] + b * c1[1] + c * c2[1] + d * p1[1],
  ];
}

function tangent(p0: Pt, c1: Pt, c2: Pt, p1: Pt, t: number): Pt {
  const mt = 1 - t;
  const a = 3 * mt * mt;
  const b = 6 * mt * t;
  const c = 3 * t * t;
  return [
    a * (c1[0] - p0[0]) + b * (c2[0] - c1[0]) + c * (p1[0] - c2[0]),
    a * (c1[1] - p0[1]) + b * (c2[1] - c1[1]) + c * (p1[1] - c2[1]),
  ];
}

/** Linear interpolation through the width stops. */
function widthAt(widths: number[], t: number): number {
  if (widths.length === 1) return widths[0];
  const span = (widths.length - 1) * Math.min(1, Math.max(0, t));
  const i = Math.min(widths.length - 2, Math.floor(span));
  const f = span - i;
  return widths[i] + (widths[i + 1] - widths[i]) * f;
}

const r2 = (v: number) => Math.round(v * 100) / 100;

/**
 * Converts a stroke into a closed outline: out along one side, back along the
 * other. 22 samples a segment is enough that the polyline reads as a curve at
 * any size a phone will show it at.
 */
export function taper(stroke: Stroke, samplesPerSeg = 22): string {
  const { start, segs, widths } = stroke;
  const left: Pt[] = [];
  const right: Pt[] = [];

  let p0: Pt = start;
  const total = segs.length * samplesPerSeg;
  let n = 0;

  for (const s of segs) {
    const c1: Pt = [s[0], s[1]];
    const c2: Pt = [s[2], s[3]];
    const p1: Pt = [s[4], s[5]];

    for (let i = 0; i <= samplesPerSeg; i++) {
      // Skip the shared joint so the two segments do not double up a point.
      if (i === 0 && n > 0) continue;
      const t = i / samplesPerSeg;
      const pt = at(p0, c1, c2, p1, t);
      const tan = tangent(p0, c1, c2, p1, t);
      const len = Math.hypot(tan[0], tan[1]) || 1;
      // Normal, rotated 90 degrees from the tangent.
      const nx = -tan[1] / len;
      const ny = tan[0] / len;
      const half = widthAt(widths, n / total) / 2;
      left.push([pt[0] + nx * half, pt[1] + ny * half]);
      right.push([pt[0] - nx * half, pt[1] - ny * half]);
      n++;
    }
    p0 = p1;
  }

  const fwd = left.map((p, i) => `${i === 0 ? 'M' : 'L'} ${r2(p[0])} ${r2(p[1])}`).join(' ');
  const back = right
    .slice()
    .reverse()
    .map((p) => `L ${r2(p[0])} ${r2(p[1])}`)
    .join(' ');
  return `${fwd} ${back} Z`;
}

/**
 * The calligraphic Ganesha: a form built from separate brush strokes rather
 * than one outline — the crown's curl and tiers, the two ears, the eye, the
 * long trunk, and the sweep of the body.
 *
 * Drawn on a 100 x 150 field.
 */
export function ganeshaStrokes(): string[] {
  const strokes: Stroke[] = [
    // The shikha curling above the crown
    {
      start: [46.5, 16],
      segs: [
        [45.5, 10.5, 51, 8.5, 55.5, 11],
        [60, 13.5, 59.5, 19.5, 54.5, 21.5],
        [50.5, 23, 47.5, 20.5, 49.5, 17.8],
      ],
      widths: [1, 2.5, 3, 2.2, 0.8],
    },
    // Three tiers of the mukut
    {
      start: [47.5, 27],
      segs: [[53, 21.5, 59, 21.5, 64, 25.5]],
      widths: [0.7, 2.5, 0.7],
    },
    {
      start: [45.5, 32.5],
      segs: [[52, 26, 60, 26, 66, 31]],
      widths: [0.7, 2.8, 0.7],
    },
    {
      start: [44, 38.5],
      segs: [[52, 31, 61, 31, 67, 37]],
      widths: [0.8, 3, 0.8],
    },

    // The left ear: one long hook that finishes in a curl
    {
      start: [45, 26],
      segs: [
        [37, 23.5, 30, 29.5, 30.5, 38],
        [31, 47, 35.5, 55, 39.5, 61],
      ],
      widths: [0.9, 3.4, 3.2, 1.1],
    },
    // The curl inside it
    {
      start: [36, 45],
      segs: [
        [28.5, 43.5, 20.5, 47.5, 20.5, 55],
        [20.5, 61.5, 27, 64.5, 32, 61],
        [35, 58.8, 34, 54.5, 30.8, 55],
      ],
      widths: [1, 3.2, 2.8, 1],
    },

    // The right ear
    {
      start: [62, 43],
      segs: [
        [70.5, 38.5, 79.5, 42, 78.5, 50],
        [77.5, 57, 70.5, 62, 65, 60.5],
      ],
      widths: [1.1, 3.6, 3, 1.1],
    },

    // The trunk, the stroke the whole form hangs from
    {
      start: [62.5, 42],
      segs: [
        [66.5, 53, 64.5, 65, 59, 77],
        [55, 86.5, 50.5, 93.5, 47, 99.5],
      ],
      widths: [1.8, 4.2, 3.4, 0.8],
    },

    // The swirl to the right of the trunk
    {
      start: [66, 64],
      segs: [
        [72, 60.5, 78.5, 63.5, 77.5, 69.5],
        [76.5, 75, 70, 75, 68, 70.5],
      ],
      widths: [1.1, 3, 1.1],
    },

    // The body, sweeping left and round
    {
      start: [34, 67],
      segs: [
        [22, 67, 11.5, 77, 11.5, 88.5],
        [11.5, 100, 24, 108, 38, 105.5],
      ],
      widths: [1.1, 4, 3.6, 1.3],
    },
    // and round to the right
    {
      start: [68, 73],
      segs: [
        [80, 73, 88, 81, 86, 91],
        [84, 100, 72, 106, 58, 103.5],
      ],
      widths: [1.3, 4, 3.4, 1.1],
    },

    // The foot
    {
      start: [38.5, 102],
      segs: [
        [36, 111, 40, 117, 46.5, 113.5],
        [50.5, 111.5, 54.5, 108.5, 58.5, 106.5],
      ],
      widths: [1, 2.8, 2.2, 0.8],
    },
  ];

  return strokes.map((s) => taper(s));
}
