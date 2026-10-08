'use client';

import { useEffect, useState } from 'react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { visibleEvents } from '@/lib/content';
import { SparkleDivider } from '@/components/ornaments';
import { rsvpMessage, whatsappUrl } from '@/lib/share';
import { useGuestName, useLocalStorage } from '@/lib/hooks';
import { playChime, buzz } from '@/lib/sfx';
import type { RsvpSubmission, WeddingConfig } from '@/lib/types';

const BLANK: RsvpSubmission = {
  name: '',
  phone: '',
  attending: true,
  partySize: 1,
  events: [],
  meal: '',
  song: '',
  message: '',
};

export function Rsvp({ config }: { config: WeddingConfig }) {
  const { rsvp, couple, hosts } = config;
  const events = visibleEvents(config);
  const guest = useGuestName();

  // The guest's own answer, kept in their browser so they can come back and
  // change it. Nothing is stored anywhere else.
  const [saved, save, loaded] = useLocalStorage<RsvpSubmission | null>('mewar:rsvp', null);
  const [form, setForm] = useState<RsvpSubmission>(BLANK);
  const [sent, setSent] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!loaded) return;
    if (saved) {
      setForm(saved);
      setSent(true);
    } else if (guest) {
      setForm((f) => ({ ...f, name: guest }));
    }
  }, [loaded, saved, guest]);

  if (!rsvp.enabled) return null;

  const set = <K extends keyof RsvpSubmission>(key: K, value: RsvpSubmission[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleEvent = (id: string) =>
    setForm((f) => ({
      ...f,
      events: f.events.includes(id) ? f.events.filter((x) => x !== id) : [...f.events, id],
    }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    save(form);
    setSent(true);
    setEditing(false);
    playChime(1174);
    buzz([10, 50, 16]);

    const confetti = (await import('canvas-confetti')).default;
    confetti({
      particleCount: 130,
      spread: 95,
      origin: { y: 0.65 },
      colors: ['#D4AF37', '#F8E7A8', '#B3141F', '#F2B8BE'],
      disableForReducedMotion: true,
    });

    // Open WhatsApp last, so the success state is already on screen when the
    // guest comes back from the app.
    window.setTimeout(() => {
      window.open(whatsappUrl(rsvp.whatsappNumber, rsvpMessage(config, form)), '_blank', 'noopener');
    }, 700);
  };

  const showForm = !sent || editing;

  return (
    <section className="sec ivory-field" id="rsvp">
      <SectionHeading
        label="Join the celebration"
        title="RSVP"
        lead="Your presence will make this celebration whole. Let us know by sending the note straight to our WhatsApp."
      />

      {/* The families sign the ask, rather than putting a deadline on it. */}
      <Reveal>
        <div className="rsvp-regards">
          <SparkleDivider width={140} />
          <p className="t-caps rsvp-regards-label">{hosts.regardsLine}</p>
          <p className="rsvp-regards-names">{hosts.familyNames}</p>
        </div>
      </Reveal>

      <Reveal variant="pop" delay={80}>
        <div className="rsvp-card double-gold">
          {!showForm ? (
            <div className="rsvp-done">
              <p className="t-display rsvp-thanks">
                {form.attending ? 'Thank you' : 'We will miss you'}
              </p>
              <p className="t-body">
                {form.attending
                  ? `We cannot wait to celebrate with you, ${form.name}.`
                  : `Thank you for letting us know, ${form.name}. You will be missed.`}
              </p>
              <div className="rsvp-done-actions">
                <button type="button" className="btn-ghost" onClick={() => setEditing(true)}>
                  Edit my reply
                </button>
                <a
                  className="btn-ghost"
                  href={whatsappUrl(rsvp.whatsappNumber, rsvpMessage(config, form))}
                  target="_blank"
                  rel="noreferrer"
                >
                  Send again on WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="rsvp-form">
              <label className="field">
                <span>Your name</span>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Name, or your family's name"
                />
              </label>

              <label className="field">
                <span>Phone (optional)</span>
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="+91"
                />
              </label>

              <fieldset className="choice">
                <legend>Will you be joining us?</legend>
                <div className="choice-row">
                  <button
                    type="button"
                    className="choice-btn"
                    data-selected={form.attending}
                    onClick={() => set('attending', true)}
                  >
                    Joyfully accept
                  </button>
                  <button
                    type="button"
                    className="choice-btn"
                    data-selected={!form.attending}
                    onClick={() => set('attending', false)}
                  >
                    Regretfully decline
                  </button>
                </div>
              </fieldset>

              {form.attending && (
                <>
                  <label className="field">
                    <span>How many of you?</span>
                    <select
                      value={form.partySize}
                      onChange={(e) => set('partySize', Number(e.target.value))}
                    >
                      {Array.from({ length: rsvp.maxGuests }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? 'guest' : 'guests'}
                        </option>
                      ))}
                    </select>
                  </label>

                  {events.length > 0 && (
                    <fieldset className="choice">
                      <legend>Which celebrations?</legend>
                      <div className="event-picks">
                        {events.map((ev) => {
                          const on = form.events.includes(ev.id);
                          return (
                            <button
                              key={ev.id}
                              type="button"
                              className="pick"
                              data-selected={on}
                              aria-pressed={on}
                              onClick={() => toggleEvent(ev.id)}
                            >
                              <span className="pick-check" aria-hidden="true">
                                <svg viewBox="0 0 16 16">
                                  <path
                                    d="M3 8.5l3.2 3.2L13 5"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                              {ev.title}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                  )}

                  {rsvp.mealOptions.length > 0 && (
                    <label className="field">
                      <span>What would you like to eat?</span>
                      <select value={form.meal} onChange={(e) => set('meal', e.target.value)}>
                        <option value="">No preference</option>
                        {rsvp.mealOptions.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {rsvp.askSong && (
                    <label className="field">
                      <span>A song for the dance floor</span>
                      <input
                        type="text"
                        value={form.song}
                        onChange={(e) => set('song', e.target.value)}
                        placeholder="We will try our best"
                      />
                    </label>
                  )}
                </>
              )}

              {rsvp.askMessage && (
                <label className="field">
                  <span>A note for {couple.partner1.shortName} and {couple.partner2.shortName}</span>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => set('message', e.target.value)}
                    placeholder="Optional"
                  />
                </label>
              )}

              <button type="submit" className="btn-solid">
                Send on WhatsApp
              </button>
              <p className="rsvp-note">
                This opens WhatsApp with your reply already written. Nothing is stored on this site.
              </p>
            </form>
          )}
        </div>
      </Reveal>
    </section>
  );
}
