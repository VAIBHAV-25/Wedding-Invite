'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { CuspedArch, SuryaRosette, SparkleDivider } from '@/components/ornaments';
import { Bridge } from '@/components/ui/Bridge';
import { longDate } from '@/lib/format';
import { activeTrack } from '@/lib/content';
import { Parallax } from '@/components/ui/Parallax';
import type { WeddingConfig } from '@/lib/types';

/**
 * The names arriving letter by letter.
 *
 * The stagger is computed so the last letter lands on the final music cue, so
 * the reveal finishes with the phrase rather than drifting past it.
 */
function Letters({ text, startDelay, totalMs }: { text: string; startDelay: number; totalMs: number }) {
  const chars = Array.from(text);
  const per = chars.length > 1 ? totalMs / chars.length : 0;
  return (
    <span className="letters" aria-label={text}>
      {chars.map((c, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="letter"
          style={{ animationDelay: `${startDelay + i * per}ms` }}
        >
          {c === ' ' ? ' ' : c}
        </span>
      ))}
    </span>
  );
}

export function Hero({ config }: { config: WeddingConfig }) {
  const { couple, dates, music } = config;
  const ref = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);

  // Hold the reveal until the hero is actually on screen.
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLive(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  /**
   * With a track playing, the reveal is paced to land on the last music cue.
   * With no track, those cues are meaningless and stretching the names over
   * three and a half seconds just looks like the page is broken — so it runs
   * at a brisk pace instead.
   */
  const hasTrack = Boolean(activeTrack(config));
  const cues = music.introCues?.length ? music.introCues : [0.5, 2, 3.6];
  const firstCue = hasTrack ? cues[0] * 1000 : 160;
  const lastCue = hasTrack ? cues[cues.length - 1] * 1000 : 1500;
  const nameWindow = Math.max(700, lastCue - firstCue);

  const name1 = couple.partner1.shortName;
  const name2 = couple.partner2.shortName;
  const half = nameWindow / 2;

  return (
    <section className="sec hero velvet" id="hero" ref={ref} data-live={live ? 'true' : undefined}>
      <Bridge edge="both" />

      {/* The frame and the sun are sized with the content rather than the
          viewport, so the arch keeps its proportions instead of shearing
          flat on a wide screen. */}
      <Parallax className="hero-frame">
        <CuspedArch className="hero-arch" width={100} height={150} strokeWidth={0.6} />
        <SuryaRosette size={190} className="hero-sun" />
      </Parallax>

      <div className="hero-inner">
        {couple.illustration && (
          <Image
            src={couple.illustration}
            alt={`An illustration of ${couple.partner1.shortName} and ${couple.partner2.shortName}`}
            width={474}
            height={760}
            priority
            className="couple-art"
          />
        )}

        <h1 className="t-name hero-names">
          <Letters text={name1} startDelay={firstCue} totalMs={half} />
          <span className="hero-amp" style={{ animationDelay: `${firstCue + half + 90}ms` }}>
            &amp;
          </span>
          <Letters text={name2} startDelay={firstCue + half + 240} totalMs={half} />
        </h1>

        <div className="hero-meta" style={{ animationDelay: `${lastCue + 320}ms` }}>
          <SparkleDivider width={150} />
          <p className="hero-date">{longDate(dates.weddingStart)}</p>
          <p className="t-caps hero-city">{couple.city}</p>
          {couple.hashtag && (
            <p className="hero-hash">
              <span aria-hidden="true">&#10022;</span>
              {couple.hashtag}
              <span aria-hidden="true">&#10022;</span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
