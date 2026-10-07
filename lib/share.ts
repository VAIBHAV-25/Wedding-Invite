import type { RsvpSubmission, WeddingConfig } from './types';

/** The message a guest's RSVP arrives as, on the couple's phone. */
export function rsvpMessage(config: WeddingConfig, data: RsvpSubmission): string {
  const names = `${config.couple.partner1.shortName} & ${config.couple.partner2.shortName}`;
  const eventTitles = data.events
    .map((id) => config.events.find((e) => e.id === id)?.title)
    .filter(Boolean)
    .join(', ');

  const lines = [
    `RSVP for ${names}`,
    '',
    `Name: ${data.name}`,
    data.phone ? `Phone: ${data.phone}` : '',
    `Attending: ${data.attending ? 'Yes, joyfully' : 'Regretfully unable to'}`,
  ];

  if (data.attending) {
    lines.push(`Guests: ${data.partySize}`);
    if (eventTitles) lines.push(`Events: ${eventTitles}`);
    if (data.meal) lines.push(`Meal: ${data.meal}`);
    if (data.song) lines.push(`Song request: ${data.song}`);
  }
  if (data.message) lines.push('', `Message: ${data.message}`);

  return lines.filter((l) => l !== '').join('\n');
}

export function whatsappUrl(number: string, text: string): string {
  const digits = number.replace(/\D/g, '');
  const body = encodeURIComponent(text);
  return digits ? `https://wa.me/${digits}?text=${body}` : `https://wa.me/?text=${body}`;
}

/** The message guests forward when they share the invitation onward. */
export function shareMessage(config: WeddingConfig, url: string): string {
  const names = `${config.couple.partner1.shortName} & ${config.couple.partner2.shortName}`;
  const tag = config.couple.hashtag ? `\n\n${config.couple.hashtag}` : '';
  return `You are invited to the wedding of ${names} in ${config.couple.city}.\n\n${url}${tag}`;
}

export function upiUrl(opts: {
  upiId: string;
  payeeName: string;
  amount?: number;
  note?: string;
}): string {
  const params = new URLSearchParams({
    pa: opts.upiId,
    pn: opts.payeeName,
    cu: 'INR',
  });
  if (opts.amount && opts.amount > 0) params.set('am', String(opts.amount));
  if (opts.note) params.set('tn', opts.note);
  return `upi://pay?${params.toString()}`;
}

/** "11,000" — Indian digit grouping for the shagun amount chips. */
export function inr(amount: number): string {
  return new Intl.NumberFormat('en-IN').format(amount);
}
