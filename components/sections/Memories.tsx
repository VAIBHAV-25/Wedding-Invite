'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Placeholder } from '@/components/ui/Placeholder';
import type { GalleryItem, WeddingConfig } from '@/lib/types';

/** Tilt each polaroid a little, but deterministically so it never jumps. */
const tiltFor = (i: number) => [-3.5, 2.5, -1.8, 3.2, -2.6, 1.6][i % 6];

function Polaroid({
  item,
  index,
  priority,
  onOpen,
}: {
  item: GalleryItem;
  index: number;
  priority: boolean;
  onOpen: (i: number) => void;
}) {
  return (
    <button
      type="button"
      className="polaroid"
      style={{ ['--tilt' as string]: `${tiltFor(index)}deg` }}
      onClick={() => onOpen(index)}
      aria-label={item.caption ? `Open photo: ${item.caption}` : `Open photo ${index + 1}`}
    >
      <span className="polaroid-window">
        {item.src ? (
          <Image
            src={item.src}
            alt={item.alt || item.caption || ''}
            fill
            sizes="(max-width: 700px) 72vw, 300px"
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <Placeholder tone="photo" />
        )}
      </span>
      {item.caption && <span className="t-script polaroid-caption">{item.caption}</span>}
    </button>
  );
}

function Lightbox({
  items,
  index,
  onClose,
  onStep,
}: {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onStep: (delta: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onStep(1);
      if (e.key === 'ArrowLeft') onStep(-1);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, onStep]);

  const item = items[index];
  const touch = useRef<number | null>(null);

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Photo"
      onPointerDown={(e) => {
        touch.current = e.clientX;
      }}
      onPointerUp={(e) => {
        if (touch.current == null) return;
        const dx = e.clientX - touch.current;
        touch.current = null;
        if (Math.abs(dx) > 50) onStep(dx < 0 ? 1 : -1);
      }}
    >
      <button ref={closeRef} type="button" className="lightbox-close" onClick={onClose} aria-label="Close">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      <figure className="lightbox-figure">
        <div className="lightbox-frame">
          {item.src ? (
            <Image
              src={item.src}
              alt={item.alt || item.caption || ''}
              fill
              sizes="100vw"
              style={{ objectFit: 'contain' }}
            />
          ) : (
            <Placeholder tone="photo" />
          )}
        </div>
        {item.caption && <figcaption className="t-script">{item.caption}</figcaption>}
      </figure>

      <div className="lightbox-nav">
        <button type="button" onClick={() => onStep(-1)} aria-label="Previous photo">
          &#8249;
        </button>
        <span className="t-caps">
          {index + 1} / {items.length}
        </span>
        <button type="button" onClick={() => onStep(1)} aria-label="Next photo">
          &#8250;
        </button>
      </div>
    </div>
  );
}

export function Memories({ config }: { config: WeddingConfig }) {
  const items = config.gallery;
  const [open, setOpen] = useState<number | null>(null);

  const step = useCallback(
    (delta: number) => {
      setOpen((cur) => (cur == null ? cur : (cur + delta + items.length) % items.length));
    },
    [items.length],
  );

  if (!items.length) return null;

  return (
    <section className="sec ivory-field" id="memories">
      <SectionHeading label="Moments" title="A Few Favourites" />

      <div className="polaroid-rail" role="list">
        {items.map((item, i) => (
          <div role="listitem" key={`${item.src}-${i}`}>
            <Polaroid item={item} index={i} priority={i < 2} onOpen={setOpen} />
          </div>
        ))}
      </div>

      <p className="rail-hint t-caps">Swipe for more · tap to enlarge</p>

      {open != null && <Lightbox items={items} index={open} onClose={() => setOpen(null)} onStep={step} />}
    </section>
  );
}
