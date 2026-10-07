/** Every date on this site is rendered in the wedding's timezone, not the guest's. */
export const TZ = 'Asia/Kolkata';

function fmt(iso: string, opts: Intl.DateTimeFormatOptions): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', { timeZone: TZ, ...opts }).format(d);
}

/** Pulls one field out of a date, e.g. part('2027-…', 'month', 'short') -> "Feb". */
export function part(
  iso: string,
  which: 'weekday' | 'day' | 'month' | 'year',
  style: 'long' | 'short' | '2-digit' | 'numeric' = 'long',
): string {
  const key = which === 'day' || which === 'year' ? 'numeric' : style;
  return fmt(iso, { [which]: which === 'day' ? '2-digit' : key } as Intl.DateTimeFormatOptions);
}

/** "Friday  |  12  |  Feb 2027" — the date line on an event card. */
export function eventDateLine(iso: string): string[] {
  return [part(iso, 'weekday'), part(iso, 'day'), `${part(iso, 'month', 'short')} ${part(iso, 'year')}`];
}

/** "7:00 PM" */
export function time(iso: string): string {
  return fmt(iso, { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase().replace(/\s+/g, ' ');
}

/** "7:00 PM – 11:00 PM", or "7:00 PM onwards" when there is no end time. */
export function timeRange(startISO: string, endISO: string): string {
  const s = time(startISO);
  if (!endISO) return `${s} onwards`;
  const e = time(endISO);
  return e && e !== s ? `${s} – ${e}` : `${s} onwards`;
}

/** "14 . 02 . 2027" — the countdown card's date stamp. */
export function dotted(iso: string): string {
  return [part(iso, 'day'), fmt(iso, { month: '2-digit' }), part(iso, 'year')].join(' . ');
}

/** The three scratch-card values, in the order they are revealed. */
export function scratchValues(iso: string): { month: string; day: string; year: string } {
  return {
    month: part(iso, 'month', 'short').toUpperCase(),
    day: part(iso, 'day'),
    year: part(iso, 'year'),
  };
}

/** "15 January 2027" — used for the RSVP deadline. */
export function longDate(iso: string): string {
  return fmt(iso, { day: 'numeric', month: 'long', year: 'numeric' });
}

/** "2027-01-30" in the wedding's timezone — used to group events into days. */
export function dayKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/** The two halves of a day heading on the timeline. */
export function dayHeading(iso: string): { weekday: string; date: string } {
  return {
    weekday: part(iso, 'weekday'),
    date: `${part(iso, 'day')} ${part(iso, 'month')} ${part(iso, 'year')}`,
  };
}
