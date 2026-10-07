'use client';

import { useEffect, useRef } from 'react';

interface Mote {
  a: number;
  r: number;
  va: number;
  vr: number;
  size: number;
  tone: number;
  phase: number;
}

/**
 * The gold-dust vortex that carries the guest from the envelope into the card.
 *
 * Three layers on one canvas: rays that burst out of the pocket, motes that
 * spiral outward, and a cream wash that rises to white as the transition ends.
 */
export function Vortex({ active, onDone }: { active: boolean; onDone?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!active) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DURATION = reduced ? 500 : 2100;

    if (reduced) {
      const t = window.setTimeout(() => doneRef.current?.(), DURATION);
      return () => window.clearTimeout(t);
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const cx = w / 2;
    const cy = h * 0.52;
    const reach = Math.hypot(w, h) * 0.62;

    const motes: Mote[] = Array.from({ length: 150 }, () => ({
      a: Math.random() * Math.PI * 2,
      r: Math.random() * 30,
      va: 0.028 + Math.random() * 0.05,
      vr: 1.4 + Math.random() * 4.2,
      size: 0.8 + Math.random() * 2.4,
      tone: Math.random(),
      phase: Math.random() * Math.PI * 2,
    }));

    const RAYS = 26;
    const start = performance.now();
    let raf = 0;

    const draw = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      // Ease the whole sequence so it blooms fast and settles slowly.
      const e = 1 - Math.pow(1 - t, 2.4);
      ctx.clearRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'lighter';

      /* --- the burst of rays, strongest in the first third --- */
      const rayStrength = Math.max(0, 1 - t / 0.45);
      if (rayStrength > 0) {
        const len = reach * (0.2 + e * 1.1);
        for (let i = 0; i < RAYS; i++) {
          const a = (i / RAYS) * Math.PI * 2 + e * 0.5;
          const width = (i % 3 === 0 ? 0.045 : 0.018) * (1 + e);
          const g = ctx.createLinearGradient(cx, cy, cx + Math.cos(a) * len, cy + Math.sin(a) * len);
          g.addColorStop(0, `rgba(255,248,224,${0.9 * rayStrength})`);
          g.addColorStop(0.35, `rgba(246,214,138,${0.45 * rayStrength})`);
          g.addColorStop(1, 'rgba(212,175,55,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, len, a - width, a + width);
          ctx.closePath();
          ctx.fill();
        }
      }

      /* --- the core --- */
      const coreR = 10 + e * 90;
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      core.addColorStop(0, `rgba(255,252,240,${0.95 - t * 0.3})`);
      core.addColorStop(0.45, `rgba(248,231,168,${0.6 - t * 0.3})`);
      core.addColorStop(1, 'rgba(212,175,55,0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      /* --- the spiral of motes --- */
      for (const m of motes) {
        m.a += m.va;
        m.r += m.vr * (0.4 + e);
        const x = cx + Math.cos(m.a) * m.r;
        // Squash the spiral slightly so it reads as a funnel, not a flat disc.
        const y = cy + Math.sin(m.a) * m.r * 0.82;
        const fade = Math.max(0, 1 - m.r / reach) * (1 - t * 0.35);
        if (fade <= 0) continue;
        const twinkle = 0.55 + 0.45 * Math.sin(now * 0.01 + m.phase);
        const s = m.size * (1 + e * 0.5);
        const g = ctx.createRadialGradient(x, y, 0, x, y, s * 3.5);
        const warm = m.tone > 0.7 ? '255,236,196' : m.tone > 0.35 ? '246,214,138' : '212,175,55';
        g.addColorStop(0, `rgba(${warm},${fade * twinkle})`);
        g.addColorStop(1, `rgba(${warm},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, s * 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      /* --- the cream wash that hands over to the card --- */
      ctx.globalCompositeOperation = 'source-over';
      const washStart = 0.52;
      if (t > washStart) {
        const p = (t - washStart) / (1 - washStart);
        const wash = ctx.createRadialGradient(cx, cy, 0, cx, cy, reach);
        wash.addColorStop(0, `rgba(255,252,246,${Math.min(1, p * 1.5)})`);
        wash.addColorStop(0.6, `rgba(255,248,236,${Math.min(1, p * 1.2)})`);
        wash.addColorStop(1, `rgba(255,248,236,${Math.min(1, p)})`);
        ctx.fillStyle = wash;
        ctx.fillRect(0, 0, w, h);
      }

      if (t < 1) {
        raf = requestAnimationFrame(draw);
      } else {
        doneRef.current?.();
      }
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 h-full w-full"
      style={{ zIndex: 60 }}
    />
  );
}
