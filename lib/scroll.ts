/**
 * One scroll driver for the whole page.
 *
 * Every element that wants to react to scrolling registers here and gets a
 * `--p` custom property written to it: 0 when its top edge reaches the bottom
 * of the screen, 1 when its bottom edge reaches the top. CSS does the rest.
 *
 * Why a singleton: a scroll listener and a rAF loop per component is what
 * turns a long page into a stutter. This is one passive listener and one loop
 * that stops itself a few frames after scrolling ends.
 */

type Reader = (progress: number, velocity: number) => void;

const elements = new Set<HTMLElement>();
const readers = new Set<Reader>();

let frame = 0;
let dirty = true;
let idle = 0;
let lastY = 0;
let velocity = 0;
let started = false;
let reduced = false;

function tick() {
  frame = 0;
  const vh = window.innerHeight || 1;
  const y = window.scrollY;
  // Smoothed, so a single jumpy frame does not throw anything that reads it.
  velocity = velocity * 0.8 + (y - lastY) * 0.2;
  lastY = y;

  for (const el of elements) {
    const r = el.getBoundingClientRect();
    const raw = (vh - r.top) / (vh + r.height);
    el.style.setProperty('--p', Math.min(1, Math.max(0, raw)).toFixed(4));
  }

  const docProgress = y / Math.max(1, document.documentElement.scrollHeight - vh);
  for (const read of readers) read(Math.min(1, Math.max(0, docProgress)), velocity);

  if (dirty) {
    dirty = false;
    idle = 0;
  } else {
    idle += 1;
  }

  // Keep going for a few frames after the last scroll so momentum settles.
  if (idle < 6) frame = requestAnimationFrame(tick);
}

function wake() {
  dirty = true;
  if (!frame) frame = requestAnimationFrame(tick);
}

function start() {
  if (started || typeof window === 'undefined') return;
  started = true;
  reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  lastY = window.scrollY;
  window.addEventListener('scroll', wake, { passive: true });
  window.addEventListener('resize', wake, { passive: true });
  wake();
}

/** Registers an element to receive `--p`. Returns an unsubscribe. */
export function trackElement(el: HTMLElement): () => void {
  if (reduced) {
    el.style.setProperty('--p', '0.5');
    return () => undefined;
  }
  start();
  elements.add(el);
  wake();
  return () => {
    elements.delete(el);
  };
}

/** Registers a callback for overall page progress and scroll velocity. */
export function trackPage(read: Reader): () => void {
  start();
  readers.add(read);
  wake();
  return () => {
    readers.delete(read);
  };
}

export function prefersReducedMotion(): boolean {
  return reduced;
}
