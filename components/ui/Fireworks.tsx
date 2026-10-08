'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * A short firework display.
 *
 * It dims the screen to dusk first. Fireworks are drawn with additive
 * blending, and additive blending on an ivory page just saturates to white —
 * nothing would be visible. Dropping the lights for the length of the display
 * is both what makes them legible and what makes the moment feel like one.
 */

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  hue: [number, number, number];
  /** Willow sparks fall slowly and trail; chrysanthemum sparks are quick. */
  drag: number;
  flick: number;
}

interface Shell {
  x: number;
  y: number;
  vy: number;
  hue: [number, number, number];
  burst: number;
  trail: number;
}

/** Warm tones that stay legible against a dimmed velvet sky. */
const HUES: [number, number, number][] = [
  [255, 232, 170],
  [245, 166, 35],
  [255, 196, 120],
  [242, 184, 190],
  [232, 105, 125],
  [212, 175, 55],
];

export function Fireworks({ active, onDone }: { active: boolean; onDone?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  /**
   * Rendered into the body rather than in place. The section it is triggered
   * from clips its overflow and gives its children a stacking context, either
   * of which is enough to make a fixed overlay invisible.
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!active) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const t = window.setTimeout(() => doneRef.current?.(), 400);
      return () => window.clearTimeout(t);
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const shells: Shell[] = [];
    const sparks: Spark[] = [];
    const DURATION = 4200;
    /** Stop launching in time for the last one to finish before the lights come up. */
    const LAUNCH_UNTIL = 2500;
    const start = performance.now();
    let nextLaunch = 220;
    let raf = 0;

    const launch = () => {
      const x = w * (0.18 + Math.random() * 0.64);
      shells.push({
        x,
        y: h + 10,
        vy: -(h * 0.0145 + Math.random() * h * 0.0045),
        hue: HUES[Math.floor(Math.random() * HUES.length)],
        burst: h * (0.3 + Math.random() * 0.3),
        trail: 0,
      });
    };

    const explode = (s: Shell) => {
      const willow = Math.random() < 0.35;
      const count = willow ? 56 : 74;
      const power = willow ? 2.6 : 4.2;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.14;
        // Varying the speed within a burst is what gives it depth rather
        // than a flat ring.
        const sp = power * (0.45 + Math.random() * 0.75);
        sparks.push({
          x: s.x,
          y: s.y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 0,
          max: willow ? 85 + Math.random() * 45 : 48 + Math.random() * 34,
          size: willow ? 1.5 : 1.9,
          hue: s.hue,
          drag: willow ? 0.985 : 0.955,
          flick: Math.random() * Math.PI * 2,
        });
      }
    };

    const draw = (now: number) => {
      const elapsed = now - start;

      if (elapsed > nextLaunch && elapsed < LAUNCH_UNTIL) {
        launch();
        nextLaunch = elapsed + 260 + Math.random() * 300;
      }

      // Trails rather than a hard clear, so every spark draws its own streak.
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = shells.length - 1; i >= 0; i--) {
        const s = shells[i];
        s.y += s.vy;
        s.vy += 0.055;
        s.trail += 1;
        const [r, g, b] = s.hue;
        ctx.fillStyle = `rgba(${r},${g},${b},0.9)`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.1, 0, Math.PI * 2);
        ctx.fill();

        if (s.vy >= -0.4 || s.y <= h - s.burst) {
          explode(s);
          shells.splice(i, 1);
        }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.life += 1;
        if (p.life > p.max) {
          sparks.splice(i, 1);
          continue;
        }
        p.vx *= p.drag;
        p.vy = p.vy * p.drag + 0.052;
        p.x += p.vx;
        p.y += p.vy;

        const t = 1 - p.life / p.max;
        // Embers flicker as they cool, which is most of what sells a firework.
        const twinkle = 0.65 + 0.35 * Math.sin(p.life * 0.45 + p.flick);
        const [r, g, b] = p.hue;
        const a = t * t * twinkle;
        const rad = p.size * (0.6 + t * 0.9);
        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad * 3.2);
        grd.addColorStop(0, `rgba(255,250,235,${a})`);
        grd.addColorStop(0.35, `rgba(${r},${g},${b},${a * 0.85})`);
        grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      if (elapsed < DURATION) {
        raf = requestAnimationFrame(draw);
      } else {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        doneRef.current?.();
      }
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [active]);

  if (!active || !mounted) return null;

  return createPortal(
    <div className="fireworks" aria-hidden="true">
      <div className="fireworks-dusk" />
      <canvas ref={ref} />
    </div>,
    document.body,
  );
}
