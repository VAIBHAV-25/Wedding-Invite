'use client';

import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { SparkleDivider } from '@/components/ornaments';
import { whatsappUrl } from '@/lib/share';
import { useGuestName } from '@/lib/hooks';
import type { WeddingConfig } from '@/lib/types';

/**
 * No form.
 *
 * A wedding reply is a message, not a submission: people say yes, say how
 * many are coming, and ask a question in the same breath. A form made them
 * answer in the order the fields happened to be in. One button that opens
 * WhatsApp with the greeting already written does the same job and lets them
 * say it however they like.
 */
export function Rsvp({ config }: { config: WeddingConfig }) {
  const { rsvp, couple, hosts } = config;
  const guest = useGuestName();

  if (!rsvp.enabled) return null;

  const names = `${couple.partner1.shortName} & ${couple.partner2.shortName}`;
  const opening = guest ? `Hello! This is ${guest}.` : 'Hello!';
  const message = `${opening}\n\nReplying to the invitation for ${names}, ${couple.city}.\n\n`;

  return (
    <section className="sec ivory-field" id="rsvp">
      <SectionHeading
        label="Join the celebration"
        title="RSVP"
        lead="Your presence will make this celebration whole. Send us a message and let us know you are coming."
      />

      <Reveal>
        <div className="rsvp-regards">
          <SparkleDivider width={140} />
          <p className="t-caps rsvp-regards-label">{hosts.regardsLine}</p>
          <p className="rsvp-regards-names">{hosts.familyNames}</p>
        </div>
      </Reveal>

      <Reveal variant="pop" delay={80}>
        <div className="rsvp-reply">
          <a
            className="btn-pill rsvp-whatsapp"
            href={whatsappUrl(rsvp.whatsappNumber, message)}
            target="_blank"
            rel="noreferrer"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="wa">
              <path
                d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.6 4.7-1.2A10 10 0 1 0 12 2Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <path
                d="M8.6 7.6c.3 0 .6.1.8.5l.7 1.4c.1.3 0 .5-.1.7l-.5.6c-.1.2-.2.4 0 .7a7 7 0 0 0 3 2.9c.3.1.5 0 .7-.1l.6-.6c.2-.2.4-.2.7-.1l1.4.7c.3.2.4.4.4.7 0 .9-.8 1.6-1.7 1.6-3.3 0-7.2-3.9-7.2-7.2 0-.9.7-1.7 1.6-1.8Z"
                fill="currentColor"
              />
            </svg>
            Reply on WhatsApp
          </a>
        </div>
      </Reveal>
    </section>
  );
}
