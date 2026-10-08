'use client';

import Image from 'next/image';
import { useState } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { Placeholder } from '@/components/ui/Placeholder';
import { Parallax } from '@/components/ui/Parallax';
import { SparkleDivider } from '@/components/ornaments';
import { directionsUrl } from '@/lib/maps';
import type { WeddingConfig } from '@/lib/types';

export function Venue({ config }: { config: WeddingConfig }) {
  const { venue, travel } = config;
  const [showMap, setShowMap] = useState(false);

  return (
    <section className="sec ivory-field" id="venue">
      <SectionHeading label="Where" title="The Venue" />

      <Reveal variant="slide-l">
        <Parallax className="venue-frame">
          {venue.image ? (
            <Image
              src={venue.image}
              alt={venue.name}
              fill
              sizes="(max-width: 700px) 92vw, 400px"
              loading="lazy"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <Placeholder tone="venue" />
          )}
        </Parallax>
      </Reveal>

      <Reveal delay={100}>
        <div className="venue-body">
          <SparkleDivider width={160} />
          <h3 className="t-display venue-name">{venue.name}</h3>
          <p className="t-body venue-address">{venue.address}</p>

          <div className="venue-actions">
            <a className="btn-pill" href={directionsUrl(venue)} target="_blank" rel="noreferrer">
              Get directions
            </a>
            {venue.mapsUrl && (
              <a className="btn-ghost" href={venue.mapsUrl} target="_blank" rel="noreferrer">
                Exact pin
              </a>
            )}
            {venue.mapEmbedUrl && !showMap && (
              <button type="button" className="btn-ghost" onClick={() => setShowMap(true)}>
                Show map
              </button>
            )}
          </div>

          {showMap && venue.mapEmbedUrl && (
            <div className="venue-map">
              <iframe
                src={venue.mapEmbedUrl}
                title={`Map of ${venue.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </Reveal>

      {travel.enabled && (
        <Reveal delay={160}>
          <div className="travel">
            <p className="t-caps travel-head">Getting there &amp; staying</p>
            <dl className="travel-grid">
              {travel.airport && (
                <div>
                  <dt>Airport</dt>
                  <dd>{travel.airport}</dd>
                </div>
              )}
              {travel.station && (
                <div>
                  <dt>Railway</dt>
                  <dd>{travel.station}</dd>
                </div>
              )}
              {travel.stay && (
                <div>
                  <dt>Staying</dt>
                  <dd>{travel.stay}</dd>
                </div>
              )}
              {travel.parking && (
                <div>
                  <dt>Parking</dt>
                  <dd>{travel.parking}</dd>
                </div>
              )}
            </dl>

            {travel.hotels.length > 0 && (
              <ul className="hotels" aria-label="Where to stay">
                {travel.hotels.map((h) => (
                  <li key={h.name}>
                    <p className="hotel-name">{h.name}</p>
                    {h.note && <p className="hotel-note">{h.note}</p>}
                    <div className="hotel-links">
                      {h.phone && <a href={`tel:${h.phone.replace(/\s/g, '')}`}>{h.phone}</a>}
                      {h.mapsUrl && (
                        <a href={h.mapsUrl} target="_blank" rel="noreferrer">
                          Map
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Reveal>
      )}
    </section>
  );
}
