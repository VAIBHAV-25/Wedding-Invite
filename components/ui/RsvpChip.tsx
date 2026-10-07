'use client';

import { useEffect, useState } from 'react';

/** A small way back to the RSVP form, once the guest is past the hero. */
export function RsvpChip({ enabled }: { enabled: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const hero = document.getElementById('hero');
    const rsvp = document.getElementById('rsvp');
    if (!hero) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Hide it again once they have actually reached the form.
          if (entry.target.id === 'rsvp') setShow(!entry.isIntersecting && window.scrollY > 400);
          else if (entry.target.id === 'hero') setShow(!entry.isIntersecting && window.scrollY > 400);
        }
      },
      { threshold: 0.12 },
    );
    io.observe(hero);
    if (rsvp) io.observe(rsvp);
    return () => io.disconnect();
  }, [enabled]);

  if (!enabled) return null;

  return (
    <a href="#rsvp" className="rsvp-chip t-caps" data-show={show} tabIndex={show ? 0 : -1} aria-hidden={!show}>
      RSVP
    </a>
  );
}
