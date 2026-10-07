import Image from 'next/image';

import { ganeshaStrokes } from './calligraphy';

/**
 * Line-art deity motifs, drawn as a few confident gold strokes rather than an
 * illustration. Both are built on the same footprint so either can sit in the
 * envelope crest or at the head of the blessing without re-tuning the layout.
 */

export type Deity = 'ganesha' | 'mahavira' | 'none';

/**
 * Ganesha in the calligraphic manner: the form is suggested by a handful of
 * tapering brush strokes — crown curl, three tiers of the mukut, the two ears,
 * the eye, the long trunk and the sweep of the body — rather than drawn as an
 * outline. The strokes are built by the taper() helper so they swell and
 * thin the way a brush does.
 */
export function GaneshaMotif({ size = 112, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size * 1.42}
      viewBox="0 0 100 142"
      className={className}
      fill="currentColor"
    >
      {ganeshaStrokes().map((d, i) => (
        <path key={i} d={d} />
      ))}

      {/* The eye, and the tusk below it */}
      <path d="M48.5 52.5 C50.5 47 56.5 45.5 59 48.5 C57 54 51 56 48.5 52.5 Z" />
      <path d="M51 51.5 C52.5 49 55.5 48.2 57 49.6" fill="none" stroke="var(--velvet, #5e0b15)" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M41 58.5 C44 58.8 46.5 60 47.5 61.5 C45.5 63.5 43 64.5 41.5 64 C41 62 41 60 41 58.5 Z" />

      {/* The bindu beside the swirl */}
      <circle cx="83.5" cy="66.5" r="3.4" />
    </svg>
  );
}

/**
 * Mahavira, seated in padmasana beneath the three-tiered chhatra, with the
 * srivatsa on the chest and his lion emblem on the throne.
 */
export function MahaviraMotif({ size = 112, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Chhatra — the three-tiered parasol */}
      <path d="M60 4 L60 9" />
      <circle cx="60" cy="2.5" r="1.6" fill="currentColor" stroke="none" />
      <path d="M48 13 Q60 6 72 13 Z" />
      <path d="M44 20 Q60 12 76 20 Z" />
      <path d="M40 27 Q60 18 80 27 Z" />
      <path d="M60 27 L60 33" opacity="0.6" />

      {/* Bhamandala — the halo */}
      <circle cx="60" cy="48" r="20" opacity="0.32" />
      <circle cx="60" cy="48" r="24" opacity="0.16" />

      {/* Head, in the calm frontal manner of a Tirthankara image */}
      <path d="M60 33 C53 33 48.5 38 48.5 45 C48.5 52 53 57 60 57 C67 57 71.5 52 71.5 45 C71.5 38 67 33 60 33 Z" />
      {/* Curled hair and the ushnisha */}
      <path d="M50 38 Q55 33 60 33 Q65 33 70 38" opacity="0.6" />
      {/* Eyes, lowered in meditation */}
      <path d="M54 45 Q56.5 47 59 45" />
      <path d="M61 45 Q63.5 47 66 45" />
      {/* Long ears, a mark of renunciation */}
      <path d="M48.5 42 C45.5 43 45 48 48.5 51" />
      <path d="M71.5 42 C74.5 43 75 48 71.5 51" />

      {/* Torso and the srivatsa on the chest */}
      <path d="M60 57 L60 62" />
      <path d="M48 76 C48 67 53 62 60 62 C67 62 72 67 72 76" />
      <path d="M57 70 L60 73 L63 70 L60 67 Z" opacity="0.85" />

      {/* Arms resting in dhyana mudra, one palm on the other */}
      <path d="M48 74 C43 78 42 83 44 87" />
      <path d="M72 74 C77 78 78 83 76 87" />
      <path d="M44 87 Q60 93 76 87" />

      {/* Padmasana — the crossed legs */}
      <path d="M36 95 C44 89 52 87 60 87 C68 87 76 89 84 95" />
      <path d="M36 95 C44 101 52 103 60 103 C68 103 76 101 84 95" />
      <path d="M48 92 Q60 97 72 92" opacity="0.5" />

      {/* The throne, with the lion emblem that identifies him */}
      <path d="M30 105 H90 L86 112 H34 Z" />
      <g opacity="0.75" transform="translate(0 1)">
        <circle cx="60" cy="108.5" r="3" />
        <path d="M57.4 106.6 L56 104.8 M62.6 106.6 L64 104.8" />
        <path d="M58.8 108.2 h0.01 M61.2 108.2 h0.01" strokeWidth="1.6" />
        <path d="M58.4 110 Q60 111.4 61.6 110" />
      </g>
      <path d="M30 105 L26 112 M90 105 L94 112" opacity="0.6" />
    </svg>
  );
}

export function DeityMotif({
  deity,
  size = 112,
  className,
  image,
  priority = false,
}: {
  deity: Deity;
  size?: number;
  className?: string;
  /** Your own licensed artwork. A transparent PNG or SVG works best. */
  image?: string;
  /** Set where the motif is above the fold, so it is not lazy-loaded. */
  priority?: boolean;
}) {
  if (deity === 'none') return null;

  if (image) {
    /**
     * A square box with `contain` means the artwork renders at exactly `size`
     * tall whatever its proportions, so no aspect ratio has to be declared for
     * whichever file the couple drops in. Going through next/image is what
     * turns a 100 KB PNG into a ~10 KB AVIF at the size actually displayed.
     */
    return (
      <span
        className={className}
        aria-hidden="true"
        style={{ position: 'relative', display: 'block', width: size, height: size }}
      >
        <Image
          src={image}
          alt=""
          fill
          priority={priority}
          sizes={`${size * 2}px`}
          style={{ objectFit: 'contain' }}
        />
      </span>
    );
  }

  return deity === 'mahavira' ? (
    <MahaviraMotif size={size} className={className} />
  ) : (
    <GaneshaMotif size={size} className={className} />
  );
}
