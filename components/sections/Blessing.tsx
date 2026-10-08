'use client';

import { Reveal } from '@/components/ui/Reveal';
import { DeityMotif } from '@/components/ornaments/deities';
import { BracketFrame } from '@/components/ornaments';
import { invocationFor } from '@/lib/invocation';
import { useGuestName } from '@/lib/hooks';
import type { WeddingConfig } from '@/lib/types';

export function Blessing({ config }: { config: WeddingConfig }) {
  const guest = useGuestName();
  const { invitation, couple, intro } = config;
  const inv = invocationFor(intro.deity);

  /**
   * The deity's default invocation is only used when the config has no shloka
   * of its own. Once it does, the config's wording is taken verbatim —
   * including the blank fields, so clearing a line in the config actually
   * clears it rather than quietly falling back to the default.
   */
  const ownWording = Boolean(invitation.shloka);
  const shloka = ownWording ? invitation.shloka : (inv?.shloka ?? '');
  const translit = ownWording ? invitation.shlokaTransliteration : (inv?.transliteration ?? '');
  const english = ownWording ? invitation.shlokaEnglish : (inv?.english ?? '');
  const showExtras = invitation.language === 'both' || invitation.language === 'en';

  return (
    <section className="sec ivory-field" id="blessing">
      {/* The brackets frame the page; the invitation itself sits on a card
          inside them, the way a printed insert sits inside its mount. */}
      <BracketFrame size={44} inset={6} className="blessing-page">
        <div className="blessing-card">
          {guest && (
            <Reveal>
              <p className="t-script guest-line">Dear {guest},</p>
            </Reveal>
          )}

          <Reveal variant="scale">
            <DeityMotif deity={intro.deity} image={intro.deityImage} size={92} className="blessing-deity" />
          </Reveal>

          {shloka && (
            <Reveal variant="wipe" delay={120}>
              <p className="t-deva shloka">
                {shloka.split('\n').map((line, i) => (
                  <span key={i}>{line}</span>
                ))}
              </p>
            </Reveal>
          )}

          {showExtras && translit && (
            <Reveal delay={200}>
              <p className="translit">{translit}</p>
            </Reveal>
          )}

          {showExtras && english && (
            <Reveal delay={260}>
              <p className="t-body shloka-en">{english}</p>
            </Reveal>
          )}

          <Reveal delay={320}>
            <p className="t-body invite-text">{invitation.introText}</p>
          </Reveal>

          <Reveal variant="scale" delay={400}>
            <p className="t-name couple-name">{couple.partner1.fullName}</p>
          </Reveal>

          {couple.partner1.parentsLine && (
            <Reveal delay={450}>
              <p className="parents-line">{couple.partner1.parentsLine}</p>
            </Reveal>
          )}

          <Reveal delay={500}>
            <p className="amp t-display">&amp;</p>
          </Reveal>

          <Reveal variant="scale" delay={550}>
            <p className="t-name couple-name">{couple.partner2.fullName}</p>
          </Reveal>

          {couple.partner2.parentsLine && (
            <Reveal delay={600}>
              <p className="parents-line">{couple.partner2.parentsLine}</p>
            </Reveal>
          )}
        </div>
      </BracketFrame>

      <Reveal delay={120}>
        <div className="scroll-cue">
          <span className="t-caps">Scroll to see the magic</span>
          <svg viewBox="0 0 20 26" aria-hidden="true">
            <path d="M10 2v20m0 0l-6-6m6 6l6-6" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </Reveal>
    </section>
  );
}
