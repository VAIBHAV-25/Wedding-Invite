import Image from 'next/image';
import { SparkleDivider } from '@/components/ornaments';
import { MahaviraMotif } from '@/components/ornaments/deities';
import { Reveal } from '@/components/ui/Reveal';
import { Bridge } from '@/components/ui/Bridge';
import type { WeddingConfig } from '@/lib/types';

/**
 * The invocation, set on velvet between the venue and the RSVP.
 *
 * The mandala crowns it full-bleed and the seated Tirthankara sits in the
 * arch's opening, so the figure reads as enshrined rather than pasted on top.
 * Everything under it is centred on one column: the mantra's name, the mantra
 * itself, the salutation, and a line of English saying what is being asked
 * for.
 */
export function Mantra({ config }: { config: WeddingConfig }) {
  const m = config.invitation.mantra;
  if (!m?.lines?.length) return null;

  return (
    <section className="sec velvet sec-dark mantra" id="mantra">
      <Bridge edge="both" />

      <div className="mantra-inner">
        <Reveal variant="scale" className="mantra-crown">
          <span className="mantra-shrine">
            <Image
              src="/img/mandala-arch.png"
              alt=""
              width={760}
              height={546}
              sizes="(max-width: 700px) 100vw, 440px"
              className="mantra-mandala"
              aria-hidden="true"
            />
            <MahaviraMotif size={158} className="mantra-deity" />
          </span>
        </Reveal>

        {m.title && (
          <Reveal delay={120}>
            <h2 className="t-deva mantra-title">{m.title}</h2>
          </Reveal>
        )}

        <Reveal variant="scale" delay={200}>
          <p className="t-deva mantra-lines">
            {m.lines.map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </p>
        </Reveal>

        <Reveal delay={280}>
          <SparkleDivider width={116} className="mantra-rule" />
        </Reveal>

        {m.salutation && (
          <Reveal delay={340}>
            <p className="t-deva mantra-salute">{m.salutation}</p>
          </Reveal>
        )}

        {m.meaning && (
          <Reveal delay={400}>
            <p className="t-body mantra-meaning">{m.meaning}</p>
          </Reveal>
        )}

        <Reveal delay={460}>
          <SparkleDivider width={92} className="mantra-rule mantra-rule-last" />
        </Reveal>
      </div>
    </section>
  );
}
