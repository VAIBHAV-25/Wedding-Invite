'use client';

import { useEffect, useRef } from 'react';
import { trackPage } from '@/lib/scroll';
import type { PetalDensity } from '@/lib/types';

interface Petal {
  x: number;
  y: number;
  z: number;
  vy: number;
  sway: number;
  swaySpeed: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  flip: number;
  flipSpeed: number;
}

const COUNT: Record<PetalDensity, number> = { low: 12, medium: 22, high: 32 };

/**
 * Petals falling over the whole invitation.
 *
 * One canvas rather than a DOM node per petal: 30 absolutely-positioned
 * elements with their own transforms will drop frames on a mid-range phone,
 * where one canvas will not. Pauses when the tab is hidden, thins itself on
 * slow devices, and does not run at all under reduced motion.
 */
export function PetalCanvas({
  enabled,
  density,
  colors,
}: {
  enabled: boolean;
  density: PetalDensity;
  colors: string[];
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const palette = colors.length ? colors : ['#F2B8BE', '#F5D7AE', '#D4AF37'];
    const cores = navigator.hardwareConcurrency ?? 8;
    let n = COUNT[density] ?? COUNT.medium;
    if (cores <= 4) n = Math.round(n * 0.55);

    let w = 0;
    let h = 0;
    let dpr = 1;
    let petals: Petal[] = [];

    const make = (seeded = false): Petal => ({
      x: Math.random() * w,
      // Seeded petals start spread through the air instead of all at the top.
      y: seeded ? Math.random() * h : -40 - Math.random() * 120,
      z: 0.45 + Math.random() * 0.55,
      vy: 0.25 + Math.random() * 0.5,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.006 + Math.random() * 0.012,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.02,
      size: 5 + Math.random() * 7,
      color: palette[Math.floor(Math.random() * palette.length)],
      flip: Math.random() * Math.PI * 2,
      flipSpeed: 0.012 + Math.random() * 0.022,
    });

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    petals = Array.from({ length: n }, () => make(true));

    let raf = 0;
    let running = true;
    let slowFrames = 0;
    let last = performance.now();

    /**
     * Petals are caught by the page moving past them. Scrolling down pushes
     * them up the screen and spins them a little — it is a small thing, but
     * it is what makes the page feel like one moving object rather than a
     * static backdrop with an animation on top.
     */
    let drift = 0;
    const untrack = trackPage((_p, velocity) => {
      drift = Math.max(-26, Math.min(26, velocity));
    });

    const draw = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;

      // If the device cannot keep up, quietly drop a few petals rather than
      // letting the whole page stutter.
      if (dt > 28) slowFrames++;
      else slowFrames = Math.max(0, slowFrames - 1);
      if (slowFrames > 40 && petals.length > 8) {
        petals.splice(0, 2);
        slowFrames = 0;
      }

      ctx.clearRect(0, 0, w, h);
      const step = dt / 16.67;

      // Eases back to nothing when the page stops moving.
      drift *= 0.92;

      for (const p of petals) {
        p.y += (p.vy * 1.6 - drift * 0.42 * p.z) * p.z * step;
        p.sway += p.swaySpeed * step;
        p.x += Math.sin(p.sway) * 0.7 * step;
        p.rot += (p.vr + drift * 0.0016) * step;
        p.flip += p.flipSpeed * step;

        // Recycle off either edge, since a fast scroll can carry one upward.
        if (p.y > h + 40) Object.assign(p, make(), { x: Math.random() * w });
        else if (p.y < -140) Object.assign(p, make(), { x: Math.random() * w, y: h + 30 });

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        // Petals turn edge-on as they tumble, which is what sells the fall.
        const squash = Math.abs(Math.cos(p.flip));
        ctx.scale(1, 0.35 + squash * 0.65);
        ctx.globalAlpha = 0.35 + p.z * 0.5;
        // Far petals sit back behind a touch of blur.
        ctx.filter = p.z < 0.6 ? 'blur(1.2px)' : 'none';
        ctx.fillStyle = p.color;
        ctx.beginPath();
        const s = p.size * p.z;
        ctx.moveTo(0, -s);
        ctx.bezierCurveTo(s * 0.9, -s * 0.5, s * 0.75, s * 0.6, 0, s);
        ctx.bezierCurveTo(-s * 0.75, s * 0.6, -s * 0.9, -s * 0.5, 0, -s);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      ctx.filter = 'none';

      if (running) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    };

    const onResize = () => {
      resize();
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      untrack();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
    };
  }, [enabled, density, colors]);

  if (!enabled) return null;

  return <canvas ref={ref} aria-hidden="true" className="petal-canvas" />;
}
