'use client';

import Image from 'next/image';
import { useState } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { Placeholder } from '@/components/ui/Placeholder';
import { SparkleDivider } from '@/components/ornaments';
import { directionsUrl, haversineKm, placeCoords } from '@/lib/maps';
import type { WeddingConfig } from '@/lib/types';

export function Venue({ config }: { config: WeddingConfig }) {
  const { venue, travel } = config;
  const [distance, setDistance] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [showMap, setShowMap] = useState(false);

  /**
   * Only ever asked for when the guest taps the chip — never on page load.
   * If they decline, the chip simply disappears.
   */
  const askDistance = () => {
    const target = placeCoords(venue);
    if (!target || !navigator.geolocation) {
      setDistance(null);
      return;
    }
    setAsking(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const km = haversineKm({ lat: pos.coords.latitude, lng: pos.coords.longitude }, target);
        const mins = Math.round((km / 32) * 60);
        setDistance(km < 1 ? 'You are here' : `About ${Math.round(km)} km away · roughly ${mins} min by road`);
        setAsking(false);
      },
      () => {
        setAsking(false);
        setDistance(null);
      },
      { timeout: 8000, maximumAge: 300000 },
    );
  };

  return (
    <section className="sec ivory-field" id="venue">
      <SectionHeading label="Where" title="The Venue" />

      <Reveal variant="scale">
        <div className="venue-frame">
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
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="venue-body">
          <SparkleDivider width={160} />
          <h3 className="t-display venue-name">{venue.name}</h3>
          <p className="t-body venue-address">{venue.address}</p>

          <a className="btn-pill" href={directionsUrl(venue)} target="_blank" rel="noreferrer">
            Get directions
          </a>

          <div className="venue-extras">
            {!distance && (
              <button type="button" className="btn-ghost" onClick={askDistance} disabled={asking}>
                {asking ? 'Checking…' : 'How far am I?'}
              </button>
            )}
            {distance && <p className="distance-chip t-caps">{distance}</p>}

            {venue.mapsUrl && (
              <a className="btn-ghost" href={venue.mapsUrl} target="_blank" rel="noreferrer">
                Exact pin on Maps
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
              {travel.parking && (
                <div>
                  <dt>Parking</dt>
                  <dd>{travel.parking}</dd>
                </div>
              )}
            </dl>

            {travel.hotels.length > 0 && (
              <ul className="hotels">
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
