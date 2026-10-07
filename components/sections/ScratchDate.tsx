'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { scratchValues } from '@/lib/format';
import { playChime, playDhol, playScratchTick, buzz } from '@/lib/sfx';
import type { WeddingConfig } from '@/lib/types';

/** Cleared area past which the card finishes revealing itself. */
const THRESHOLD = 0.45;

function ScratchCard({
  label,
  value,
  index,
  revealed,
  onRevealed,
}: {
  label: string;
  value: string;
  index: number;
  /** Set once any card has been scratched, so the others open with it. */
  revealed: boolean;
  onRevealed: (index: number, el: HTMLDivElement | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  // A sibling was scratched; fall open too.
  useEffect(() => {
    if (revealed) setDone(true);
  }, [revealed]);
  const painting = useRef(false);
  const lastPt = useRef<{ x: number; y: number } | null>(null);
  const checking = useRef(0);

  const finish = useCallback(() => {
    if (done) return;
    setDone(true);
    onRevealed(index, wrapRef.current);
  }, [done, index, onRevealed]);

  const reveal = () => {
    if (!done) finish();
  };

  /** Paints the foil the guest scratches away. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#c9707c');
    g.addColorStop(0.42, '#a8545f');
    g.addColorStop(0.68, '#8f3f4c');
    g.addColorStop(1, '#b3606c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Gold flecks, so the foil catches light.
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = `rgba(248,231,168,${0.06 + Math.random() * 0.18})`;
      const s = 1 + Math.random() * 2.4;
      ctx.fillRect(Math.random() * w, Math.random() * h, s, s);
    }
  }, []);

  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || done) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const r = canvas.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 30;
    ctx.beginPath();
    const prev = lastPt.current;
    if (prev) {
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();
    lastPt.current = { x, y };

    playScratchTick();
    buzz(5);

    // Sampling every pixel on every move would stall the thread, so check a
    // low-resolution version of the canvas a few times a second instead.
    const now = Date.now();
    if (now - checking.current < 220) return;
    checking.current = now;

    const sw = 40;
    const sh = Math.max(1, Math.round((sw * canvas.height) / canvas.width));
    const off = document.createElement('canvas');
    off.width = sw;
    off.height = sh;
    const octx = off.getContext('2d');
    if (!octx) return;
    octx.drawImage(canvas, 0, 0, sw, sh);
    const data = octx.getImageData(0, 0, sw, sh).data;
    let clear = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] < 40) clear++;
    if (clear / (sw * sh) > THRESHOLD) finish();
  };

  const onDown = (e: React.PointerEvent) => {
    if (done) return;
    painting.current = true;
    lastPt.current = null;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    scratchAt(e.clientX, e.clientY);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!painting.current) return;
    scratchAt(e.clientX, e.clientY);
  };

  const onUp = () => {
    painting.current = false;
    lastPt.current = null;
  };

  return (
    <div className="scratch" ref={wrapRef} data-done={done ? 'true' : undefined}>
      <p className="t-caps scratch-label">{label}</p>
      <div className="scratch-card">
        <span className="t-display scratch-value">{value}</span>
        <canvas
          ref={canvasRef}
          className="scratch-foil"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />
        {!done && (
          <button type="button" className="scratch-a11y" onClick={reveal}>
            Reveal the {label.toLowerCase()}
          </button>
        )}
        {!done && (
          <span className="scratch-hand" aria-hidden="true">
            <svg viewBox="0 0 32 32">
              <path
                d="M12 19V7.5a2.1 2.1 0 0 1 4.2 0V15m0-1.4a1.9 1.9 0 0 1 3.8 0V16m0-1.3a1.85 1.85 0 0 1 3.7 0v1.6m0-.8a1.8 1.8 0 0 1 3.6 0v5.1c0 4.4-3 7.9-7.6 7.9-4.3 0-6.4-1.9-8.2-5.3l-2.4-4.6a2 2 0 0 1 3.3-2.2L12 19.5"
                fill="#fff6ec"
                stroke="#8a5a4a"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </div>
      <p className="scratch-hint">{done ? ' ' : 'Scratch me'}</p>
    </div>
  );
}

export function ScratchDate({ config }: { config: WeddingConfig }) {
  const { month, day, year } = scratchValues(config.dates.weddingStart);
  const { muhurat } = config.dates;
  const [allOpen, setAllOpen] = useState(false);
  const openedRef = useRef(false);

  const cards = [
    { label: 'Month', value: month },
    { label: 'Day', value: day },
    { label: 'Year', value: year },
  ];

  /**
   * The first scratch opens all three. Making someone repeat the same gesture
   * to learn one date is work, not delight — the reward should land at once.
   */
  const onRevealed = useCallback((_index: number, el: HTMLDivElement | null) => {
    if (openedRef.current) return;
    openedRef.current = true;
    setAllOpen(true);

    const r = el?.getBoundingClientRect();
    const origin = r
      ? { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight }
      : { x: 0.5, y: 0.6 };

    void (async () => {
      const confetti = (await import('canvas-confetti')).default;
      const colors = ['#D4AF37', '#F8E7A8', '#B3141F', '#F2B8BE', '#5E0B15'];
      confetti({ particleCount: 160, spread: 115, startVelocity: 48, scalar: 0.95, origin, colors, disableForReducedMotion: true });
      // A second, wider shower a beat later, so the burst has a tail.
      window.setTimeout(
        () =>
          confetti({
            particleCount: 90,
            spread: 140,
            startVelocity: 34,
            scalar: 0.8,
            origin: { x: 0.5, y: 0.45 },
            colors,
            disableForReducedMotion: true,
          }),
        260,
      );
    })();

    playChime(1174);
    playDhol();
    buzz([12, 60, 18, 60, 24]);
  }, []);

  return (
    <section className="sec ivory-field" id="date">
      <SectionHeading
        label="The date"
        title="Save the Date"
        lead="Scratch any one of them — all three will open together."
      />

      <Reveal variant="pop">
        <div className="scratch-row">
          {cards.map((c, i) => (
            <ScratchCard
              key={c.label}
              label={c.label}
              value={c.value}
              index={i}
              revealed={allOpen}
              onRevealed={onRevealed}
            />
          ))}
        </div>
      </Reveal>

      <div className="muhurat" data-open={allOpen ? 'true' : undefined}>
        <Reveal delay={120}>
          <div className="muhurat-card double-gold">
            <p className="t-caps">Shubh Muhurat</p>
            <p className="t-display muhurat-time">{muhurat.time}</p>
            {(muhurat.tithi || muhurat.nakshatra) && (
              <p className="muhurat-panchang">
                {[muhurat.tithi, muhurat.nakshatra].filter(Boolean).join(' · ')}
              </p>
            )}
            {muhurat.note && <p className="t-body muhurat-note">{muhurat.note}</p>}
          </div>
        </Reveal>
      </div>

      {!allOpen && (
        <button type="button" className="reveal-all" onClick={() => onRevealed(0, null)}>
          Just show me the date
        </button>
      )}
    </section>
  );
}
