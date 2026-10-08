import Image from 'next/image';
import { SparkleDivider } from '@/components/ornaments';
import { Reveal } from '@/components/ui/Reveal';
import { Bridge } from '@/components/ui/Bridge';
import type { WeddingConfig } from '@/lib/types';

/**
 * The invocation, set on velvet between the venue and the RSVP.
 *
 * The mandala crowns it full-bleed and the seated Tirthankara stands beneath
 * the arch, so the lines of the artwork stay clear of the lines of the
 * pattern.
 * Under it, centred on one column: the mantra itself and a line of English
 * saying what is being asked for.
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
          </span>
        </Reveal>

        <Reveal variant="scale" delay={80}>
          <Image
            src="/img/mahavira-gold.png"
            alt="Lord Mahavira seated in meditation"
            width={659}
            height={900}
            sizes="(max-width: 700px) 46vw, 210px"
            className="mantra-deity"
          />
        </Reveal>

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

        {m.meaning && (
          <Reveal delay={400}>
            <p className="t-body mantra-meaning">{m.meaning}</p>
          </Reveal>
        )}

      </div>
    </section>
  );
}
