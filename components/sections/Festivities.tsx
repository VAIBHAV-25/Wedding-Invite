'use client';

import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { EventScene } from '@/components/ui/EventScene';
import { eventDateLine, timeRange } from '@/lib/format';
import { directionsUrl, appleMapsUrl } from '@/lib/maps';
import { downloadIcs, googleCalendarUrl } from '@/lib/calendar';
import { visibleEvents } from '@/lib/content';
import { Bridge } from '@/components/ui/Bridge';
import { isIOS } from '@/lib/hooks';
import { useEffect, useState } from 'react';
import type { WeddingConfig, WeddingEvent } from '@/lib/types';

function MapPin() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="pin">
      <path
        d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EventCard({ event, ios }: { event: WeddingEvent; ios: boolean }) {
  const [weekday, day, monthYear] = eventDateLine(event.startISO);

  const cal = {
    title: event.title,
    description: event.description,
    location: `${event.venueName}, ${event.address}`,
    startISO: event.startISO,
    endISO: event.endISO,
  };

  return (
    <article className="event">
      <Reveal variant="scale">
        <div className="event-art">
          {event.artwork ? (
            <Image
              src={event.artwork}
              alt=""
              fill
              sizes="(max-width: 700px) 92vw, 400px"
              loading="lazy"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <EventScene tone={event.artworkTone} />
          )}
          <div className="event-scrim" />
          <div className="event-overlay">
            <h3 className="t-name event-title">{event.title}</h3>
            <p className="event-date">
              <span>{weekday}</span>
              <i aria-hidden="true">|</i>
              <span>{day}</span>
              <i aria-hidden="true">|</i>
              <span>{monthYear}</span>
            </p>
            <p className="event-time">{timeRange(event.startISO, event.endISO)}</p>
          </div>
        </div>
      </Reveal>

      <Reveal delay={90}>
        <div className="event-body">
          <p className="t-body event-desc">{event.description}</p>

          {event.dressCode && (
            <>
              <p className="t-caps event-dc-label">Dress code</p>
              <p className="event-dc">{event.dressCode}</p>
            </>
          )}

          <div className="event-rule" aria-hidden="true" />

          <p className="event-venue">{event.venueName}</p>
          {event.address && <p className="event-address">{event.address}</p>}

          <a className="btn-pill" href={directionsUrl(event)} target="_blank" rel="noreferrer">
            <MapPin />
            Get directions
          </a>

          <div className="event-actions">
            <button type="button" className="btn-ghost" onClick={() => downloadIcs([cal], event.title, event.id)}>
              Add to calendar
            </button>
            <a className="btn-ghost" href={googleCalendarUrl(cal)} target="_blank" rel="noreferrer">
              Google
            </a>
            {ios && (
              <a className="btn-ghost" href={appleMapsUrl(event)} target="_blank" rel="noreferrer">
                Apple Maps
              </a>
            )}
            {event.mapsUrl && (
              <a className="btn-ghost" href={event.mapsUrl} target="_blank" rel="noreferrer">
                Exact pin
              </a>
            )}
            {event.hostPhone && (
              <a className="btn-ghost" href={`tel:${event.hostPhone.replace(/\s/g, '')}`}>
                Call host
              </a>
            )}
          </div>
        </div>
      </Reveal>
    </article>
  );
}

export function Festivities({ config }: { config: WeddingConfig }) {
  const events = visibleEvents(config);
  const [ios, setIos] = useState(false);
  useEffect(() => setIos(isIOS()), []);

  if (!events.length) return null;

  return (
    <section className="sec velvet sec-dark" id="festivities">
      <Bridge edge="both" />
      <SectionHeading label="The celebrations" title="Festivities" tone="dark" />
      <div className="event-list">
        {events.map((e) => (
          <EventCard key={e.id} event={e} ios={ios} />
        ))}
      </div>
    </section>
  );
}
