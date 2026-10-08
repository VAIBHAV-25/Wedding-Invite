import Image from 'next/image';
import { SparkleDivider } from '@/components/ornaments';
import { Reveal } from '@/components/ui/Reveal';
import { Bridge } from '@/components/ui/Bridge';
import type { WeddingConfig } from '@/lib/types';

/**
 * One line, set large on velvet, between the venue and the RSVP.
 *
 * Everything either side of it is sacred, logistical or decorative; this is
 * the only place on the page where the couple simply say something.
 *
 * The mandala crowns it rather than enclosing it. The drawn cusped arch that
 * was here first boxed the sentence in and left it touching the jambs; a
 * crown gives the line the full width underneath and reads as the head of a
 * printed page.
 */
export function Interlude({ config }: { config: WeddingConfig }) {
  const line = config.invitation.interlude;
  if (!line) return null;

  return (
    <section className="sec velvet sec-dark interlude" id="interlude">
      <Bridge edge="both" />

      <div className="interlude-inner">
        <Reveal variant="scale">
          <Image
            src="/img/mandala-arch.png"
            alt=""
            width={760}
            height={546}
            className="interlude-mandala"
            aria-hidden="true"
          />
        </Reveal>

        <Reveal variant="scale" delay={140}>
          <p className="t-display interlude-line">{line}</p>
        </Reveal>

        <Reveal delay={260}>
          <SparkleDivider width={140} className="interlude-rule" />
        </Reveal>
      </div>
    </section>
  );
}
