import { CuspedArch, Paisley, SuryaRosette } from '@/components/ornaments';

/**
 * Stands in for artwork the couple has not uploaded yet.
 *
 * Deliberately not a grey box: each tone is a different gradient with its own
 * filigree, so the site looks finished from the moment it is created and every
 * event card still reads as its own thing.
 */
const TONES: Record<string, [string, string, string]> = {
  mehendi: ['#1f3b2c', '#3f6b4a', '#86b57a'],
  haldi: ['#6b4a0d', '#a8791f', '#efc765'],
  sangeet: ['#2c1340', '#5c2a6b', '#b472c4'],
  baraat: ['#5e1208', '#9e3317', '#e5853f'],
  pheras: ['#5e0b15', '#9c2230', '#e2808a'],
  reception: ['#10233f', '#2f4d7a', '#7fa6d4'],
  venue: ['#2a1a2e', '#5c3a52', '#c99fb0'],
  photo: ['#4a2430', '#8a4b58', '#e0a8b2'],
};

export function Placeholder({
  tone = 'photo',
  label,
  className = '',
}: {
  tone?: keyof typeof TONES | string;
  label?: string;
  className?: string;
}) {
  const [dark, mid, light] = TONES[tone] ?? TONES.photo;
  return (
    <div
      className={`placeholder ${className}`}
      aria-hidden="true"
      style={{
        background: `radial-gradient(120% 90% at 30% 10%, ${light}33 0%, transparent 55%),
                     radial-gradient(90% 70% at 85% 95%, ${mid}55 0%, transparent 60%),
                     linear-gradient(165deg, ${mid} 0%, ${dark} 100%)`,
      }}
    >
      <CuspedArch className="ph-arch" width={100} height={140} strokeWidth={0.6} />
      <SuryaRosette size={120} className="ph-sun" />
      <Paisley size={40} className="ph-paisley ph-paisley-a" />
      <Paisley size={30} className="ph-paisley ph-paisley-b" />
      {label && <span className="t-caps ph-label">{label}</span>}
    </div>
  );
}
