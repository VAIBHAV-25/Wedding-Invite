'use client';

import { useEffect, useRef } from 'react';
import { trackElement } from '@/lib/scroll';

/**
 * Registers its child with the shared scroll driver, which writes `--p`
 * (0 to 1 through the viewport) onto this element. The movement itself is
 * declared in CSS, so nothing is animated from JavaScript.
 */
export function Parallax({
  children,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'span';
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    return trackElement(node);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <Tag ref={ref as any} className={className}>
      {children}
    </Tag>
  );
}

/** Adds `data-active` while the element sits in the middle band of the screen. */
export function useActiveBand<T extends HTMLElement = HTMLElement>(ref: React.RefObject<T | null>) {
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) node.setAttribute('data-active', 'true');
          else node.removeAttribute('data-active');
        }
      },
      // A band across the middle of the screen, not the whole viewport.
      { rootMargin: '-42% 0px -42% 0px', threshold: 0 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [ref]);
}
