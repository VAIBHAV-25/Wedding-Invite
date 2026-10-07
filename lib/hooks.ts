'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** True when the guest has asked their device for less motion. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

/**
 * Adds `data-revealed="true"` to an element the first time it scrolls into
 * view. All the entrance animation itself lives in CSS, so this stays cheap.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.18) {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || revealed) return;
    if (!('IntersectionObserver' in window)) {
      setRevealed(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRevealed(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [threshold, revealed]);

  return { ref, revealed };
}

/** Reports how far through an element the page has scrolled, from 0 to 1. */
export function useScrollProgress<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const r = node.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 when the top edge reaches the bottom of the screen, 1 when the
      // bottom edge reaches the top.
      const raw = (vh - r.top) / (vh + r.height);
      setProgress(Math.min(1, Math.max(0, raw)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return { ref, progress };
}

/** Reads `?guest=Sharma%20Family` so the invitation can greet people by name. */
export function useGuestName(): string {
  const [name, setName] = useState('');
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('guest');
    if (!raw) return;
    // Keep it to something that can plausibly be a name, so the URL cannot
    // be used to inject a sentence into the page.
    const clean = raw.replace(/[<>{}[\]\\^~`|]/g, '').trim().slice(0, 48);
    if (clean) setName(clean);
  }, []);
  return name;
}

/** A value that is only correct after hydration, e.g. anything touching window. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/** localStorage with the try/catch that private browsing makes necessary. */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      /* unreadable — carry on with the default */
    }
    setLoaded(true);
  }, [key]);

  const write = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* unwritable — the value still works for this session */
      }
    },
    [key],
  );

  return [value, write, loaded] as const;
}

/** Detects a device likely to struggle with particles, so they can be thinned. */
export function useLowPowerDevice(): boolean {
  const [low, setLow] = useState(false);
  useEffect(() => {
    const cores = navigator.hardwareConcurrency ?? 8;
    const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8;
    if (cores <= 4 || mem <= 4) setLow(true);
  }, []);
  return low;
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS reports itself as a Mac, but it has a touchscreen.
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}
