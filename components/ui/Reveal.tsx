'use client';

import { useReveal } from '@/lib/hooks';

type Variant = 'rise' | 'wipe' | 'scale';

/**
 * Wraps a block so it animates in the first time it scrolls into view.
 * The animation itself is CSS; this only flips the attribute.
 */
export function Reveal({
  children,
  variant = 'rise',
  delay = 0,
  as: Tag = 'div',
  className = '',
  threshold,
}: {
  children: React.ReactNode;
  variant?: Variant;
  delay?: number;
  as?: 'div' | 'section' | 'li' | 'p' | 'span' | 'h2' | 'h3';
  className?: string;
  threshold?: number;
}) {
  const { ref, revealed } = useReveal<HTMLDivElement>(threshold);
  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={className}
      data-reveal={variant === 'rise' ? '' : variant}
      data-revealed={revealed ? 'true' : undefined}
      style={delay ? ({ '--d': `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
