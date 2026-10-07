import { TZ } from './format';

interface CalEvent {
  title: string;
  description: string;
  location: string;
  startISO: string;
  endISO: string;
}

/** Calendar files want UTC basic format: 20270214T133000Z */
function stamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** If no end time is given, hold three hours. */
function endOrDefault(e: CalEvent): string {
  if (e.endISO) return e.endISO;
  const d = new Date(e.startISO);
  d.setHours(d.getHours() + 3);
  return d.toISOString();
}

function escape(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export function buildIcs(events: CalEvent[], calendarName: string): string {
  const now = stamp(new Date().toISOString());
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Mewar Royal Invitation//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escape(calendarName)}`,
    `X-WR-TIMEZONE:${TZ}`,
  ];
  events.forEach((e, i) => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${now}-${i}@mewar-royal`,
      `DTSTAMP:${now}`,
      `DTSTART:${stamp(e.startISO)}`,
      `DTEND:${stamp(endOrDefault(e))}`,
      `SUMMARY:${escape(e.title)}`,
      `DESCRIPTION:${escape(e.description)}`,
      `LOCATION:${escape(e.location)}`,
      'END:VEVENT',
    );
  });
  lines.push('END:VCALENDAR');
  // RFC 5545 wants CRLF line endings.
  return lines.join('\r\n');
}

export function downloadIcs(events: CalEvent[], calendarName: string, filename: string): void {
  const blob = new Blob([buildIcs(events, calendarName)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.ics') ? filename : `${filename}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Give Safari a moment to start the download before the blob disappears.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function googleCalendarUrl(e: CalEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${stamp(e.startISO)}/${stamp(endOrDefault(e))}`,
    details: e.description,
    location: e.location,
    ctz: TZ,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export type { CalEvent };
