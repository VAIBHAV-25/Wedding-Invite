'use client';

import { useScrollProgress } from '@/lib/hooks';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import type { WeddingConfig } from '@/lib/types';

/**
 * The gold thread drawing itself down the page as you scroll, with a knot at
 * each milestone.
 */
export function Journey({ config }: { config: WeddingConfig }) {
  const { ref, progress } = useScrollProgress<HTMLDivElement>();
  const story = config.story;
  if (!story.length) return null;

  return (
    <section className="sec ivory-field" id="story">
      <SectionHeading label="Our story" title="Forever Us" />

      <div className="journey" ref={ref}>
        <svg className="thread" viewBox="0 0 40 1000" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M20 0 C 34 120, 6 240, 20 360 C 34 480, 6 600, 20 720 C 34 840, 10 930, 20 1000"
            fill="none"
            stroke="rgba(212,175,55,0.22)"
            strokeWidth="1.5"
          />
          <path
            d="M20 0 C 34 120, 6 240, 20 360 C 34 480, 6 600, 20 720 C 34 840, 10 930, 20 1000"
            fill="none"
            stroke="url(#foil)"
            strokeWidth="1.8"
            strokeLinecap="round"
            pathLength={1}
            style={{
              strokeDasharray: 1,
              // The thread draws in step with how far the section has scrolled.
              strokeDashoffset: 1 - Math.min(1, progress * 1.35),
            }}
          />
        </svg>

        <ol className="milestones">
          {story.map((m, i) => (
            <li key={`${m.year}-${i}`}>
              <Reveal delay={i * 60}>
                <article className="milestone">
                  <span className="knot" aria-hidden="true" />
                  <p className="t-caps milestone-year">{m.year}</p>
                  <h3 className="t-display milestone-title">{m.title}</h3>
                  <p className="t-body milestone-text">{m.text}</p>
                </article>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
