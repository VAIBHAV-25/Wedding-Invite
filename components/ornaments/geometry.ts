/**
 * Path builders for the Mewari arch.
 *
 * These run at build time inside server components, so the generated `d`
 * strings end up as plain HTML and cost nothing at runtime.
 */

interface Pt {
  x: number;
  y: number;
}

/**
 * A two-centred pointed arch: the left and right arcs are struck from centres
 * set in from each jamb, which is what gives Rajput arches their lift compared
 * with a plain semicircle.
 *
 * The natural rise of this construction is about 0.71 of the span, which for
 * most sensible boxes puts the apex *above* the top of the viewBox and quietly
 * clips the crown off. So once the points are struck, the rise is compressed
 * to fit whatever height is actually available, with the springing line held
 * where it is. The arch keeps its character and stops depending on the caller
 * having picked a compatible springY.
 */
function archPoints(w: number, springY: number, lobes: number, k = 0.25, topMargin = 0): Pt[] {
  const cx = w * (1 - k);
  const r = w * (1 - k);
  const start = Math.PI; // the springing point, due left of the centre
  const apexX = w / 2;
  const apexY = springY - Math.sqrt(r * r - (apexX - cx) ** 2);
  const end = Math.atan2(apexY - springY, apexX - cx) + 2 * Math.PI;

  const pts: Pt[] = [];
  for (let i = 0; i <= lobes; i++) {
    const a = start + ((end - start) * i) / lobes;
    pts.push({ x: cx + r * Math.cos(a), y: springY + r * Math.sin(a) });
  }

  const crown = pts[pts.length - 1].y;
  if (crown < topMargin && springY > crown) {
    const squash = (springY - topMargin) / (springY - crown);
    for (const pt of pts) pt.y = springY - (springY - pt.y) * squash;
  }
  return pts;
}

const n = (v: number) => Math.round(v * 100) / 100;

/**
 * The full cusped-arch outline, as a closed path.
 *
 * `lobes` counts the scallops on *each* side of the apex, so 4 gives the nine
 * foils you see over the jharokhas of the City Palace.
 */
export function cuspedArchPath(w: number, h: number, springY: number, lobes = 5, inset = 0): string {
  // Leave room for the stroke as well as the inset, so the crown is not shaved
  // off by the edge of the box.
  const topMargin = inset + 1.5;
  const left = archPoints(w - inset * 2, springY, lobes, 0.25, topMargin).map((p) => ({
    x: p.x + inset,
    y: p.y,
  }));
  const apex = left[left.length - 1];

  /**
   * Each foil is a near-semicircle on its chord, bulging *into* the opening.
   * The two halves need opposite sweep flags to curve the same way, which is
   * what makes the apex come to a point instead of a notch.
   */
  const seg = (from: Pt, to: Pt, sweep: 0 | 1) => {
    const chord = Math.hypot(to.x - from.x, to.y - from.y);
    const rr = n(chord / 2);
    return `A ${rr} ${rr} 0 0 ${sweep} ${n(to.x)} ${n(to.y)}`;
  };

  const d: string[] = [`M ${n(inset)} ${n(h)}`, `L ${n(inset)} ${n(springY)}`];
  for (let i = 1; i < left.length; i++) d.push(seg(left[i - 1], left[i], 1));

  // Mirror the foils back down to the right jamb.
  const right = left
    .slice(0, -1)
    .reverse()
    .map((p) => ({ x: w - p.x, y: p.y }));
  let prev = apex;
  for (const p of right) {
    d.push(seg(prev, p, 0));
    prev = p;
  }

  d.push(`L ${n(w - inset)} ${n(h)}`);
  return d.join(' ');
}

/** The silhouette of a jharokha — the bracketed balcony with its own cusped hood. */
export function jharokhaPath(w: number, h: number): string {
  const archH = h * 0.62;
  const arch = cuspedArchPath(w, archH, archH * 0.72, 4);
  const sill = [
    `M ${n(w * 0.06)} ${n(archH)}`,
    `L ${n(w * 0.94)} ${n(archH)}`,
    `L ${n(w * 0.88)} ${n(archH + h * 0.12)}`,
    `L ${n(w * 0.12)} ${n(archH + h * 0.12)}`,
    'Z',
  ].join(' ');
  const corbel = [
    `M ${n(w * 0.2)} ${n(archH + h * 0.12)}`,
    `Q ${n(w * 0.5)} ${n(h)} ${n(w * 0.8)} ${n(archH + h * 0.12)}`,
  ].join(' ');
  return `${arch} ${sill} ${corbel}`;
}
