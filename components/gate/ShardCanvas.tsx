'use client';

import { useEffect, useRef } from 'react';
import type { SealStyle } from '@/lib/types';

/** Kept in step with MATERIALS in WaxSeal.tsx, so the chips match the seal. */
const WAX: Record<SealStyle, [string, string]> = {
  gold: ['#e9dcb8', '#b59a5c'],
  ivory: ['#efe4cf', '#cdbc9c'],
  sindoor: ['#ad2029', '#8b1019'],
};

interface Shard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  pts: [number, number][];
  bounced: boolean;
  tone: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  r: number;
}

/**
 * The wax breaking: four or five shards under gravity, plus a burst of gold
 * sparks. One canvas, one RAF loop, and it tears itself down the moment the
 * last particle leaves the screen.
 */
export function ShardCanvas({
  active,
  origin,
  style,
  sealSize,
}: {
  active: boolean;
  origin: { x: number; y: number } | null;
  style: SealStyle;
  sealSize: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active || !origin) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const [light, dark] = WAX[style];
    // Wax chips off in flakes, not quarters.
    const r = (sealSize / 2) * 0.46;

    // Cut the disc into wedges, then rough up each wedge's outline.
    const count = 6 + Math.floor(Math.random() * 3);
    const shards: Shard[] = Array.from({ length: count }, (_, i) => {
      const a0 = (i / count) * Math.PI * 2 + Math.random() * 0.3;
      const a1 = ((i + 1) / count) * Math.PI * 2 + Math.random() * 0.3;
      const pts: [number, number][] = [[0, 0]];
      for (let a = a0; a <= a1; a += 0.22) {
        const rr = r * (0.62 + Math.random() * 0.42);
        pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
      }
      pts.push([Math.cos(a1) * r * 0.9, Math.sin(a1) * r * 0.9]);
      const mid = (a0 + a1) / 2;
      return {
        x: origin.x,
        y: origin.y,
        vx: Math.cos(mid) * (1.4 + Math.random() * 2.2),
        vy: Math.sin(mid) * (1.2 + Math.random() * 1.6) - 2.4,
        rot: 0,
        vr: (Math.random() - 0.5) * 0.26,
        pts,
        bounced: false,
        tone: Math.random(),
      };
    });

    const sparks: Spark[] = Array.from({ length: 26 }, () => {
      const a = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      return {
        x: origin.x,
        y: origin.y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 1.5,
        life: 0,
        max: 26 + Math.random() * 26,
        r: 1 + Math.random() * 2,
      };
    });

    let raf = 0;
    const gravity = 0.42;
    const floor = h + 80;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = false;

      for (const s of shards) {
        s.vy += gravity;
        s.x += s.vx;
        s.y += s.vy;
        s.rot += s.vr;
        // One small bounce, then they tumble out of frame.
        if (!s.bounced && s.y > h * 0.86) {
          s.vy *= -0.32;
          s.vx *= 0.7;
          s.bounced = true;
        }
        if (s.y < floor) alive = true;

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rot);
        const g = ctx.createLinearGradient(-r, -r, r, r);
        g.addColorStop(0, s.tone > 0.5 ? light : dark);
        g.addColorStop(1, s.tone > 0.5 ? dark : light);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(s.pts[0][0], s.pts[0][1]);
        for (let i = 1; i < s.pts.length; i++) ctx.lineTo(s.pts[i][0], s.pts[i][1]);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,250,235,0.35)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();
      }

      ctx.globalCompositeOperation = 'lighter';
      for (const p of sparks) {
        p.life++;
        if (p.life > p.max) continue;
        alive = true;
        p.vy += 0.1;
        p.vx *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        const t = 1 - p.life / p.max;
        ctx.globalAlpha = t;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, 'rgba(255,245,210,1)');
        g.addColorStop(0.4, 'rgba(212,175,55,0.8)');
        g.addColorStop(1, 'rgba(212,175,55,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      if (alive) {
        raf = requestAnimationFrame(draw);
      } else {
        // Otherwise the final frame stays painted on the canvas.
        ctx.clearRect(0, 0, w, h);
      }
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [active, origin, style, sealSize]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ zIndex: 40 }}
    />
  );
}
