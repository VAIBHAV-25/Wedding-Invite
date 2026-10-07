import { Reveal } from './Reveal';
import { PaisleyBorder } from '@/components/ornaments';

/**
 * Every section opens the same way: a small label, the display title, and a
 * paisley rule. Keeping it in one place is what makes the scroll feel like one
 * document rather than a stack of blocks.
 */
export function SectionHeading({
  label,
  title,
  tone = 'light',
  lead,
}: {
  label: string;
  title: string;
  tone?: 'light' | 'dark';
  lead?: string;
}) {
  return (
    <header className={`sec-head sec-head-${tone}`}>
      <Reveal>
        <p className="t-caps sec-label">{label}</p>
      </Reveal>
      <Reveal delay={90}>
        <h2 className="t-name sec-title">{title}</h2>
      </Reveal>
      <Reveal delay={160}>
        <PaisleyBorder width={200} className="sec-rule" />
      </Reveal>
      {lead && (
        <Reveal delay={220}>
          <p className="t-body sec-lead">{lead}</p>
        </Reveal>
      )}
    </header>
  );
}
