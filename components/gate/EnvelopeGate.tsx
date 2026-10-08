'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { EmbossPattern } from './EmbossPattern';
import { WaxSeal } from './WaxSeal';
import { ShardCanvas } from './ShardCanvas';
import { Vortex } from './Vortex';
import { FoilFoldBand, FoilPaisleyRun, FoilCorner, EnvelopeCrest, GoldMotes } from './EnvelopeArt';
import Image from 'next/image';
import type { Deity } from '@/components/ornaments/deities';
import { music } from '@/lib/audio';
import { playCrack, playChime, buzz } from '@/lib/sfx';
import type { SealStyle } from '@/lib/types';

export type GatePhase = 'sealed' | 'press' | 'crack' | 'shatter' | 'flap' | 'card' | 'vortex' | 'done';

/**
 * Milliseconds from the tap. One gesture opens the whole thing: the wax
 * cracks, light breaks out of the seam, the flap folds back and the card
 * rises. Nothing waits on a second input.
 */
const CUE = {
  crack: 140,
  shatter: 560,
  flap: 760,
  card: 1620,
  vortex: 2760,
  done: 4500,
} as const;

/** How long the flap takes to fold all the way back. */
const FLAP_MS = 1000;

interface Props {
  monogram: string;
  sealStyle: SealStyle;
  tapHint: string;
  deity: Deity;
  deityImage: string;
  salutation: string;
  mantraLines: string[];
  onReveal: () => void;
  onFinished: () => void;
}

export function EnvelopeGate({
  monogram,
  sealStyle,
  tapHint,
  deity,
  deityImage,
  salutation,
  mantraLines,
  onReveal,
  onFinished,
}: Props) {
  const [phase, setPhase] = useState<GatePhase>('sealed');
  const [sealBox, setSealBox] = useState<{ x: number; y: number } | null>(null);

  const sealWrap = useRef<HTMLDivElement>(null);
  const flap = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const raf = useRef(0);
  const started = useRef(false);
  const lift = useRef(0);
  const notchedHalf = useRef(false);
  const [glow, setGlow] = useState(false);

  const SEAL_SIZE = 152;

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (raf.current) cancelAnimationFrame(raf.current);
  };

  useEffect(() => clearTimers, []);

  const at = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  /** Writes the flap's angle straight to the DOM — no re-render while dragging. */
  const applyLift = useCallback((v: number) => {
    const clamped = Math.min(1, Math.max(0, v));
    lift.current = clamped;
    const node = flap.current;
    if (!node) return;
    node.style.setProperty('--lift', clamped.toFixed(4));
    // Swap to the lining while the flap is edge-on and nothing shows.
    node.dataset.side = clamped > 0.5 ? 'in' : 'out';
    if (clamped > 0.5 && !notchedHalf.current) {
      notchedHalf.current = true;
      buzz(8);
    }
  }, []);

  const tween = useCallback(
    (to: number, duration: number, then?: () => void) => {
      if (raf.current) cancelAnimationFrame(raf.current);
      const from = lift.current;
      const t0 = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        applyLift(from + (to - from) * (1 - Math.pow(1 - p, 3)));
        if (p < 1) raf.current = requestAnimationFrame(step);
        else then?.();
      };
      raf.current = requestAnimationFrame(step);
    },
    [applyLift],
  );

  const breakSeal = useCallback(
    (skip = false) => {
      if (started.current) return;
      started.current = true;

      // This tap is the gesture that lets audio play on mobile.
      void music.unlock();

      if (skip) {
        clearTimers();
        setPhase('done');
        onReveal();
        onFinished();
        return;
      }

      const r = sealWrap.current?.getBoundingClientRect();
      if (r) setSealBox({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

      buzz([6, 30, 10]);
      setPhase('press');
      at(CUE.crack, () => {
        setPhase('crack');
        playCrack();
      });
      at(CUE.shatter, () => {
        setPhase('shatter');
        // Light breaks out of the seam the moment the wax gives way.
        setGlow(true);
        buzz(22);
      });
      at(CUE.flap, () => {
        setPhase('flap');
        tween(1, FLAP_MS);
      });
      at(CUE.card, () => {
        setPhase('card');
        playChime(1046);
        buzz([10, 50, 16]);
      });
      at(CUE.vortex, () => {
        setPhase('vortex');
        onReveal();
      });
      at(CUE.done, () => {
        setPhase('done');
        onFinished();
      });
    },
    [onReveal, onFinished, tween],
  );

  const sealPhase: 'idle' | 'press' | 'crack' | 'shatter' =
    phase === 'sealed' ? 'idle' : phase === 'press' ? 'press' : phase === 'crack' ? 'crack' : 'shatter';

  return (
    <>
      <div
        className="gate velvet"
        data-phase={phase}
        aria-hidden={phase === 'done'}
      >
        <div className="env-lining">
          <div className="lining-pattern" />
        </div>

        <div className="env-card">
          <div className="env-card-face">
            <Image
              src="/img/mandala-arch.png"
              alt=""
              width={760}
              height={546}
              sizes="360px"
              className="env-card-arch"
              aria-hidden="true"
              priority
            />
            <Image
              src="/img/mahavira-gold.png"
              alt="Lord Mahavira seated in meditation"
              width={659}
              height={900}
              sizes="120px"
              className="env-card-deity"
              priority
            />
            <p className="t-deva env-card-salute">{salutation}</p>
            <p className="t-deva env-card-mantra">
              {mantraLines.map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </p>
            <span className="env-card-monogram t-caps gold-text">{monogram}</span>
          </div>
          <div className="env-card-rays" />
        </div>

        <div className="env-front velvet">
          <EmbossPattern id="front" opacity={0.62} />
          <div className="fold fold-l" />
          <div className="fold fold-r" />
          <div className="flap-shadow" />
          <FoilPaisleyRun className="front-run" />
        </div>

        <div className="env-flap" ref={flap} data-side="out">
          <div className="flap-skin">
            <EmbossPattern id="flap" opacity={0.68} />
          </div>
          <div className="flap-lining">
            <div className="lining-pattern" />
          </div>
          <FoilFoldBand />
          <FoilCorner corner="tl" />
          <FoilCorner corner="tr" />
          <EnvelopeCrest deity={deity} image={deityImage} />
          <FoilPaisleyRun className="flap-run" />
        </div>

        <div className="candle" />
        <GoldMotes />
        <div className="raking-light" />

        <p className="tap-hint t-script">{tapHint}</p>

        <div className="seal-wrap" ref={sealWrap}>
          <WaxSeal
            monogram={monogram}
            style={sealStyle}
            phase={sealPhase}
            onActivate={() => breakSeal(false)}
            size={SEAL_SIZE}
          />
          <svg className="finger" viewBox="0 0 32 32" aria-hidden="true">
            <path
              d="M12 19V7.5a2.1 2.1 0 0 1 4.2 0V15m0-1.4a1.9 1.9 0 0 1 3.8 0V16m0-1.3a1.85 1.85 0 0 1 3.7 0v1.6m0-.8a1.8 1.8 0 0 1 3.6 0v5.1c0 4.4-3 7.9-7.6 7.9-4.3 0-6.4-1.9-8.2-5.3l-2.4-4.6a2 2 0 0 1 3.3-2.2L12 19.5"
              fill="#fdf1e6"
              stroke="#8a6a4a"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <button type="button" className="skip-pill t-caps" onClick={() => breakSeal(true)}>
          Skip to card
        </button>

        {glow && sealBox && (
          <span
            className="seal-glow"
            aria-hidden="true"
            style={{ left: sealBox.x, top: sealBox.y }}
          />
        )}
        <div className="glow-wash" aria-hidden="true" />

        <ShardCanvas
          active={phase === 'shatter' || phase === 'flap'}
          origin={sealBox}
          style={sealStyle}
          sealSize={SEAL_SIZE}
        />
      </div>

      <Vortex active={phase === 'vortex'} />
    </>
  );
}
