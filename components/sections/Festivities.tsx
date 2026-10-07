'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { Bridge } from '@/components/ui/Bridge';
import { Parallax, useActiveBand } from '@/components/ui/Parallax';
import { EventScene } from '@/components/ui/EventScene';
import { timeRange, time, dayKey, dayHeading } from '@/lib/format';
import { directionsUrl, appleMapsUrl } from '@/lib/maps';
import { downloadIcs, googleCalendarUrl } from '@/lib/calendar';
import { visibleEvents } from '@/lib/content';
import { isIOS } from '@/lib/hooks';
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
  const cal = {
    title: event.title,
    description: event.description,
    location: `${event.venueName}, ${event.address}`,
    startISO: event.startISO,
    endISO: event.endISO,
  };

  return (
    <article className="tl-card">
      <Parallax className="event-art">
        {event.artwork ? (
          <Image
            src={event.artwork}
            alt=""
            fill
            sizes="(max-width: 700px) 80vw, 320px"
            loading="lazy"
            // Biased below centre: these illustrations put the people and the
            // ritual low in the frame, with decorated sky above.
            style={{ objectFit: 'cover', objectPosition: 'center 62%' }}
          />
        ) : (
          <EventScene tone={event.artworkTone} />
        )}
        <div className="event-scrim" />
        <div className="event-overlay">
          <h3 className="t-name event-title">{event.title}</h3>
          {event.subtitle && <p className="event-sub">{event.subtitle}</p>}
        </div>
      </Parallax>

      <div className="event-body">
        {event.description && <p className="t-body event-desc">{event.description}</p>}

        {event.dressCode && (
          <p className="event-dc">
            <span className="t-caps event-dc-label">Dress code</span>
            {event.dressCode}
          </p>
        )}

        <div className="event-rule" aria-hidden="true" />

        <p className="event-venue">{event.venueName}</p>

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
    </article>
  );
}

function TimelineItem({ event, ios }: { event: WeddingEvent; ios: boolean }) {
  const ref = useRef<HTMLLIElement>(null);
  // Lights the knot while this ceremony is the one you are looking at.
  useActiveBand(ref);

  return (
    <li className="tl-item" ref={ref}>
      <Reveal variant="slide-r" delay={40}>
        <div className="tl-row">
          <span className="tl-node" aria-hidden="true" />
          <p className="tl-time">
            <span className="tl-time-main">{time(event.startISO)}</span>
            <span className="tl-time-range">{timeRange(event.startISO, event.endISO)}</span>
          </p>
        </div>
        <EventCard event={event} ios={ios} />
      </Reveal>
    </li>
  );
}

export function Festivities({ config }: { config: WeddingConfig }) {
  const events = visibleEvents(config);
  const [ios, setIos] = useState(false);
  useEffect(() => setIos(isIOS()), []);

  /**
   * Eight ceremonies across two days read as a schedule, not a stack of cards —
   * so they are grouped by day and hung off a single gold thread, with the
   * time of each on the thread itself.
   */
  const days = useMemo(() => {
    const groups = new Map<string, WeddingEvent[]>();
    for (const e of events) {
      const key = dayKey(e.startISO);
      const list = groups.get(key);
      if (list) list.push(e);
      else groups.set(key, [e]);
    }
    return [...groups.entries()].map(([key, list]) => ({ key, list, head: dayHeading(list[0].startISO) }));
  }, [events]);

  if (!events.length) return null;

  return (
    <section className="sec velvet sec-dark" id="festivities">
      <Bridge edge="both" />
      <SectionHeading label="The celebrations" title="Festivities" tone="dark" />

      <div className="timeline">
        {days.map((day, di) => (
          <div className="tl-day" key={day.key}>
            <Reveal delay={40}>
              <p className="tl-day-head">
                <span className="t-caps">{day.head.weekday}</span>
                <strong className="t-display">{day.head.date}</strong>
              </p>
            </Reveal>

            <ol className="tl-list" data-last={di === days.length - 1 ? 'true' : undefined}>
              {day.list.map((e) => (
                <TimelineItem key={e.id} event={e} ios={ios} />
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
