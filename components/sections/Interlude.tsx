import { SparkleDivider, Paisley } from '@/components/ornaments';
import { Reveal } from '@/components/ui/Reveal';
import { Bridge } from '@/components/ui/Bridge';
import type { WeddingConfig } from '@/lib/types';

/**
 * One line, set large on velvet, between the venue and the RSVP.
 *
 * Everything either side of it is sacred, logistical or decorative; this is
 * the only place on the page where the couple simply say something. It is
 * deliberately spare — no garland, no artwork — so that after nine ceremonies
 * and a map it reads as a breath rather than another block to get through,
 * and it hands straight over to the ask that follows.
 */
export function Interlude({ config }: { config: WeddingConfig }) {
  const line = config.invitation.interlude;
  if (!line) return null;

  return (
    <section className="sec velvet sec-dark interlude" id="interlude">
      <Bridge edge="both" />

      <div className="interlude-inner">
        <Reveal>
          <SparkleDivider width={150} className="interlude-rule" />
        </Reveal>

        <Reveal variant="scale" delay={120}>
          <p className="t-display interlude-line">{line}</p>
        </Reveal>

        <Reveal delay={240}>
          <div className="interlude-foot" aria-hidden="true">
            <Paisley size={22} />
            <span className="interlude-hair" />
            <Paisley size={22} className="interlude-flip" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
