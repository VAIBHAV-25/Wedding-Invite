'use client';

import { useEffect, useRef } from 'react';
import type { SealStyle } from '@/lib/types';

/** The wax each style is cast in: rim, face, highlight, stamped letters. */
/**
 * Wax, not metal. The value range inside each material is deliberately narrow
 * and the highlight is warm rather than white — a wide, cool ramp is what
 * makes a seal read as a struck coin instead of poured wax.
 */
const MATERIALS: Record<SealStyle, { rim: string; face: string; lit: string; shade: string; ink: string }> = {
  gold: { rim: '#b59a5c', face: '#e9dcb8', lit: '#f7efd6', shade: '#cdb888', ink: '#8c7435' },
  ivory: { rim: '#cdbc9c', face: '#efe4cf', lit: '#fbf4e6', shade: '#d8c8aa', ink: '#9a8a6a' },
  sindoor: { rim: '#8b1019', face: '#ad2029', lit: '#c9484f', shade: '#8f141c', ink: '#5e0a10' },
};

interface Props {
  monogram: string;
  style: SealStyle;
  /** Drives the press-in, the crack lines and the shatter. */
  phase: 'idle' | 'press' | 'crack' | 'shatter';
  onActivate: () => void;
  size?: number;
}

export function WaxSeal({ monogram, style, phase, onActivate, size = 148 }: Props) {
  const m = MATERIALS[style];
  const root = useRef<HTMLButtonElement>(null);

  /**
   * The highlight follows the device's tilt, or the cursor on a desktop, so the
   * wax catches light as if it were really there. No permission is requested:
   * on iOS, DeviceOrientation simply stays silent unless the guest has already
   * granted it, and the seal looks fine without it.
   */
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const set = (x: number, y: number) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        node.style.setProperty('--tilt-x', `${x.toFixed(2)}`);
        node.style.setProperty('--tilt-y', `${y.toFixed(2)}`);
      });
    };

    const onPointer = (e: PointerEvent) => {
      const r = node.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      set(
        Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2))),
        Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2))),
      );
    };

    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      set(Math.max(-1, Math.min(1, e.gamma / 35)), Math.max(-1, Math.min(1, (e.beta - 45) / 35)));
    };

    const fine = window.matchMedia('(pointer: fine)').matches;
    if (fine) window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('deviceorientation', onTilt, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('deviceorientation', onTilt);
    };
  }, []);

  const uid = 'seal';

  return (
    <button
      ref={root}
      type="button"
      className="seal-root"
      data-phase={phase}
      onClick={onActivate}
      style={{ width: size, height: size }}
      aria-label={`Open the invitation. The seal is stamped ${monogram}.`}
    >
      <svg viewBox="0 0 160 160" width={size} height={size} aria-hidden="true">
        <defs>
          {/* Melted, irregular wax edge. */}
          <filter id={`${uid}-melt`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves="2" seed="11" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="17" xChannelSelector="R" yChannelSelector="G" />
          </filter>

          {/* The raised rim and the pressed-in face. */}
          <radialGradient id={`${uid}-body`} cx="36%" cy="30%" r="82%">
            <stop offset="0%" stopColor={m.lit} />
            <stop offset="34%" stopColor={m.face} />
            <stop offset="76%" stopColor={m.shade} />
            <stop offset="100%" stopColor={m.rim} />
          </radialGradient>

          {/* The disc is pressed *into* the blob, so it is lit from below. */}
          <radialGradient id={`${uid}-inset`} cx="52%" cy="62%" r="74%">
            <stop offset="0%" stopColor={m.face} />
            <stop offset="64%" stopColor={m.shade} />
            <stop offset="100%" stopColor={m.rim} />
          </radialGradient>

          {/* The moving glint. */}
          <linearGradient id={`${uid}-glint`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0" />
            <stop offset="42%" stopColor="#fff8e8" stopOpacity="0.3" />
            <stop offset="58%" stopColor="#fff8e8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </linearGradient>

          <clipPath id={`${uid}-clip`}>
            <circle cx="80" cy="80" r="62" />
          </clipPath>
        </defs>

        {/* Shadow cast on the flap beneath. */}
        <ellipse cx="80" cy="140" rx="46" ry="8" fill="rgba(20,2,4,0.45)" className="seal-shadow" />

        <g className="seal-body">
          {/* The blob itself, displaced so no two edges match. */}
          <circle cx="80" cy="80" r="64" fill={`url(#${uid}-body)`} filter={`url(#${uid}-melt)`} />

          {/* Raised rim */}
          <circle cx="80" cy="80" r="57" fill="none" stroke={m.rim} strokeWidth="2" opacity="0.45" />
          <circle cx="80" cy="80" r="54" fill={`url(#${uid}-inset)`} />

          {/* A beaded rope border, the way a seal matrix is actually cut.
              Evenly milled ticks are what make a seal read as a coin. */}
          <g stroke={m.ink} strokeWidth="1" fill="none" opacity="0.38">
            <circle cx="80" cy="80" r="46" />
            <circle cx="80" cy="80" r="36" opacity="0.7" />
          </g>
          <g fill={m.ink} opacity="0.3">
            {Array.from({ length: 28 }, (_, i) => {
              const a = (i / 28) * Math.PI * 2;
              return (
                <circle
                  key={i}
                  cx={(80 + Math.cos(a) * 41).toFixed(1)}
                  cy={(80 + Math.sin(a) * 41).toFixed(1)}
                  r="1.5"
                />
              );
            })}
          </g>
          {/* Four small lotus buds at the quarters, so the border has a top. */}
          <g stroke={m.ink} strokeWidth="1.1" fill="none" opacity="0.34">
            {[0, 90, 180, 270].map((deg) => (
              <path
                key={deg}
                d="M80 31 c -3.4 2.6 -3.4 7.4 0 9.4 c 3.4 -2 3.4 -6.8 0 -9.4 Z"
                transform={`rotate(${deg} 80 80)`}
              />
            ))}
          </g>

          {/* The stamped monogram, cut into the wax */}
          <text
            x="80"
            y="80"
            textAnchor="middle"
            dominantBaseline="central"
            className="seal-monogram"
            fill={m.ink}
            style={{ fontSize: monogram.length > 5 ? 17 : 23 }}
          >
            {monogram}
          </text>
          {/* A second, offset copy one pixel up makes the letters look pressed in. */}
          <text
            x="80"
            y="79"
            textAnchor="middle"
            dominantBaseline="central"
            className="seal-monogram"
            fill={m.lit}
            opacity="0.4"
            style={{ fontSize: monogram.length > 5 ? 17 : 23 }}
          >
            {monogram}
          </text>

          {/* Glint sweep, clipped to the seal */}
          <g clipPath={`url(#${uid}-clip)`}>
            <rect className="seal-glint" x="-90" y="-20" width="70" height="200" fill={`url(#${uid}-glint)`} />
          </g>

          {/* Crack lines, drawn on with stroke-dashoffset */}
          <g
            className="seal-cracks"
            stroke={m.ink}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.85"
          >
            <path d="M80 80 L58 34" />
            <path d="M80 80 L122 54" />
            <path d="M80 80 L116 122" />
            <path d="M80 80 L46 112" />
            <path d="M68 62 L52 56" />
            <path d="M98 94 L112 100" />
          </g>
        </g>
      </svg>
    </button>
  );
}
