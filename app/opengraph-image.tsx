import { ImageResponse } from 'next/og';
import { wedding } from '@/config/wedding.config';
import { longDate } from '@/lib/format';

/**
 * The picture WhatsApp shows when someone forwards the link.
 * Generated at build time, so there is no runtime cost and no file to maintain.
 */
export const alt = wedding.seo.title;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * ImageResponse has no system fonts — naming "serif" silently renders as a
 * sans. The face has to be handed over as a buffer, so it is fetched once at
 * build time. If that fetch fails the card still renders, just in the default
 * face, which is better than failing the build.
 */
async function loadFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500&display=swap',
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
    ).then((r) => r.text());
    const url = css.match(/src:\s*url\((https:[^)]+)\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function OgImage() {
  const font = await loadFont();
  const { couple, dates, theme } = wedding;
  const c = theme.colors;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: c['velvet-deep'],
          backgroundImage: `radial-gradient(120% 80% at 50% -10%, ${c.velvet} 0%, transparent 62%), radial-gradient(90% 70% at 15% 110%, ${c.wine} 0%, transparent 65%)`,
          color: c['gold-1'],
          fontFamily: font ? 'Playfair' : 'serif',
        }}
      >
        {/* A gold rule above and below, standing in for the filigree frame. */}
        <div style={{ display: 'flex', width: 520, height: 1, backgroundColor: c['gold-2'], opacity: 0.55 }} />

        <div
          style={{
            display: 'flex',
            fontSize: 26,
            letterSpacing: 14,
            textTransform: 'uppercase',
            color: c['gold-2'],
            margin: '34px 0 18px',
          }}
        >
          {couple.monogram}
        </div>

        <div style={{ display: 'flex', fontSize: 92, color: c['gold-1'], lineHeight: 1.1 }}>
          {couple.partner1.shortName}
        </div>
        <div style={{ display: 'flex', fontSize: 44, color: c['gold-2'], margin: '4px 0' }}>&amp;</div>
        <div style={{ display: 'flex', fontSize: 92, color: c['gold-1'], lineHeight: 1.1 }}>
          {couple.partner2.shortName}
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: 30,
            color: c.ivory,
            margin: '34px 0 10px',
            opacity: 0.9,
          }}
        >
          {longDate(dates.weddingStart)}
        </div>
        <div style={{ display: 'flex', fontSize: 21, letterSpacing: 8, color: c['gold-2'], textTransform: 'uppercase' }}>
          {couple.city}
        </div>

        <div style={{ display: 'flex', width: 520, height: 1, backgroundColor: c['gold-2'], opacity: 0.55, marginTop: 40 }} />
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: 'Playfair', data: font, style: 'normal', weight: 500 }] : undefined,
    },
  );
}
