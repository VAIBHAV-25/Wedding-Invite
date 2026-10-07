'use client';

import { useEffect, useState } from 'react';
import { Reveal } from '@/components/ui/Reveal';
import { dotted } from '@/lib/format';
import { downloadIcs, googleCalendarUrl } from '@/lib/calendar';
import { SparkleDivider } from '@/components/ornaments';
import type { WeddingConfig } from '@/lib/types';

type Remaining = { days: number; hours: number; mins: number; secs: number } | null;

function remainingFrom(target: number): Remaining {
  const diff = target - Date.now();
  if (diff <= 0) return null;
  const secs = Math.floor(diff / 1000);
  return {
    days: Math.floor(secs / 86400),
    hours: Math.floor((secs % 86400) / 3600),
    mins: Math.floor((secs % 3600) / 60),
    secs: secs % 60,
  };
}

/**
 * One unit of the countdown.
 *
 * Each digit is its own element keyed by its own value, so only the digit that
 * actually changed flips — the seconds tick every second while the days sit
 * still, which is what makes it feel alive rather than twitchy.
 */
function Unit({ value, label, pad = 2 }: { value: number; label: string; pad?: number }) {
  const text = String(value).padStart(pad, '0');
  return (
    <div className="cd-unit">
      <span className="cd-dial">
        {Array.from(text).map((d, i) => (
          <span key={`${i}-${d}`} className="t-display cd-digit">
            {d}
          </span>
        ))}
      </span>
      <span className="t-caps cd-label">{label}</span>
    </div>
  );
}

export function Countdown({ config }: { config: WeddingConfig }) {
  const { dates, couple, events } = config;
  const target = new Date(dates.weddingStart).getTime();

  // Starts null so the server and the first client render agree; the real
  // figures arrive on the first tick.
  const [left, setLeft] = useState<Remaining>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const tick = () => {
      setLeft(remainingFrom(target));
      setStarted(true);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  // The ceremony runs for a day before it counts as over.
  const past = started && !left;

  /**
   * How far through the wait we are, measured from a year out. It gives the
   * number somewhere to go instead of just ticking down in place.
   */
  const YEAR = 365 * 86400000;
  const remaining = Math.max(0, target - Date.now());
  const progress = Math.min(1, Math.max(0, 1 - remaining / YEAR));

  const days = left?.days ?? 0;
  const countingLine =
    days > 180
      ? 'Plenty of time to plan your outfit.'
      : days > 60
        ? 'Close enough to start getting excited.'
        : days > 7
          ? 'Nearly there. Have you booked your travel?'
          : days > 1
            ? 'Any day now.'
            : 'Today is the day.';
  const sameDay = past && Date.now() - target < 86400000;
  const message = sameDay ? dates.countdownLiveMessage : dates.countdownEndMessage;

  const calEvent = {
    title: `${couple.partner1.shortName} & ${couple.partner2.shortName} — Wedding`,
    description: dates.poeticLine,
    location: `${config.venue.name}, ${config.venue.address}`,
    startISO: dates.weddingStart,
    endISO: events.find((e) => e.id === 'pheras')?.endISO ?? '',
  };

  return (
    <section className="sec ivory-field" id="countdown">
      <Reveal variant="pop">
        <div className="cd-card double-gold">
          <p className="t-caps cd-heading">The wedding</p>
          <p className="t-display cd-title">{dotted(dates.weddingStart)}</p>
          <SparkleDivider width={150} className="cd-rule" />

          {past ? (
            <p className="t-display cd-over">{message}</p>
          ) : (
            <>
              <div className="cd-grid" aria-live="off">
                <Unit value={left?.days ?? 0} label="Days" pad={3} />
                <Unit value={left?.hours ?? 0} label="Hours" />
                <Unit value={left?.mins ?? 0} label="Mins" />
                <Unit value={left?.secs ?? 0} label="Secs" />
              </div>
              {/* How far along we are, as a thread that fills up. */}
              <div className="cd-thread" aria-hidden="true">
                <span style={{ transform: `scaleX(${progress.toFixed(4)})` }} />
              </div>
              <p className="cd-counting">{countingLine}</p>
            </>
          )}

          <p className="t-body cd-poem">{dates.poeticLine}</p>

          <div className="cd-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={() =>
                downloadIcs(
                  [calEvent],
                  `${couple.partner1.shortName} & ${couple.partner2.shortName}`,
                  'wedding',
                )
              }
            >
              Add to calendar
            </button>
            <a className="btn-ghost" href={googleCalendarUrl(calEvent)} target="_blank" rel="noreferrer">
              Google Calendar
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
