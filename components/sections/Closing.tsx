'use client';

import { MonogramDisc, SparkleDivider } from '@/components/ornaments';
import { Bridge } from '@/components/ui/Bridge';
import { Reveal } from '@/components/ui/Reveal';
import { shareMessage, whatsappUrl } from '@/lib/share';
import { useEffect, useState } from 'react';
import type { WeddingConfig } from '@/lib/types';

export function Closing({ config }: { config: WeddingConfig }) {
  const { hosts, couple, invitation, features, seo } = config;
  const [url, setUrl] = useState(seo.siteUrl);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // The real address, so a shared link works from wherever it is opened.
    setUrl(window.location.origin + window.location.pathname);
  }, []);

  const share = async () => {
    const text = shareMessage(config, url);
    if (navigator.share) {
      try {
        await navigator.share({ title: seo.title, text, url });
        return;
      } catch {
        // Dismissed — fall through to copying.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* nothing more to try */
    }
  };

  const replay = () => {
    try {
      sessionStorage.removeItem('mewar:opened');
    } catch {
      /* it will replay anyway with the query below */
    }
    window.location.href = `${window.location.pathname}?replay=1`;
  };

  return (
    <section className="sec closing" id="closing">
      <Bridge edge="top" />
      <div className="closing-inner">
        <Reveal>
          <p className="t-body closing-line">{invitation.closingLine}</p>
        </Reveal>

        <Reveal delay={80}>
          <SparkleDivider width={170} className="closing-rule" />
        </Reveal>

        <Reveal delay={140}>
          <p className="t-caps closing-regards">{hosts.regardsLine},</p>
        </Reveal>

        <Reveal delay={200}>
          <p className="closing-family">{hosts.familyNames}</p>
        </Reveal>

        <Reveal variant="scale" delay={280}>
          <p className="t-name closing-names gold-text" data-revealed="true">
            {couple.partner1.shortName}
            <span className="closing-amp"> &amp; </span>
            {couple.partner2.shortName}
          </p>
        </Reveal>

        {couple.hashtag && (
          <Reveal delay={340}>
            <p className="t-caps closing-hash">{couple.hashtag}</p>
          </Reveal>
        )}

        <Reveal variant="scale" delay={400}>
          <MonogramDisc monogram={couple.monogram} size={78} className="closing-seal" />
        </Reveal>

        {features.share && (
          <Reveal delay={460}>
            <div className="closing-share">
              <a
                className="btn-pill"
                href={whatsappUrl('', shareMessage(config, url))}
                target="_blank"
                rel="noreferrer"
              >
                Share on WhatsApp
              </a>
              <button type="button" className="btn-ghost" onClick={share}>
                {copied ? 'Link copied' : 'Share link'}
              </button>
            </div>
          </Reveal>
        )}

        <Reveal delay={520}>
          <div className="closing-links">
            <button type="button" onClick={replay}>
              Replay the opening
            </button>
            <span aria-hidden="true">·</span>
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Back to top
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
