import { readFile } from 'node:fs/promises';
import path from 'node:path';
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

/**
 * Satori cannot fetch from the public folder, so the drawing is read off disk
 * at build time and inlined. Fails quietly: a card without the couple on it is
 * better than a build that will not finish.
 */
async function loadArtwork(src: string): Promise<string | null> {
  if (!src.startsWith('/')) return null;
  try {
    const buf = await readFile(path.join(process.cwd(), 'public', src.slice(1)));
    const type = src.endsWith('.png') ? 'png' : 'jpeg';
    return `data:image/${type};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

export default async function OgImage() {
  const [font, art] = await Promise.all([loadFont(), loadArtwork(wedding.couple.illustration)]);
  const { couple, dates, theme } = wedding;
  const c = theme.colors;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: art ? 56 : 0,
          padding: '0 72px',
          backgroundColor: c['velvet-deep'],
          backgroundImage: `linear-gradient(135deg, ${c.velvet} 0%, ${c['velvet-deep']} 68%)`,
          color: c['gold-1'],
          fontFamily: font ? 'Playfair' : 'serif',
        }}
      >
        {art && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={art} alt="" height={452} style={{ objectFit: 'contain' }} />
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: art ? 'flex-start' : 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ display: 'flex', width: 300, height: 1, backgroundColor: c['gold-2'], opacity: 0.5 }} />

          <div
            style={{
              display: 'flex',
              fontSize: 23,
              letterSpacing: 13,
              textTransform: 'uppercase',
              color: c['gold-2'],
              margin: '26px 0 14px',
            }}
          >
            {couple.monogram}
          </div>

          <div style={{ display: 'flex', fontSize: 78, color: c['gold-1'], lineHeight: 1.08 }}>
            {couple.partner1.shortName}
          </div>
          <div style={{ display: 'flex', fontSize: 38, color: c['gold-2'], margin: '2px 0' }}>&amp;</div>
          <div style={{ display: 'flex', fontSize: 78, color: c['gold-1'], lineHeight: 1.08 }}>
            {couple.partner2.shortName}
          </div>

          <div style={{ display: 'flex', fontSize: 28, color: c.ivory, margin: '28px 0 8px', opacity: 0.92 }}>
            {longDate(dates.weddingStart)}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 18,
              letterSpacing: 7,
              color: c['gold-2'],
              textTransform: 'uppercase',
            }}
          >
            {couple.city}
          </div>

          {couple.hashtag && (
            <div style={{ display: 'flex', fontSize: 19, color: c.petal, marginTop: 20, opacity: 0.9 }}>
              {couple.hashtag}
            </div>
          )}

          <div style={{ display: 'flex', width: 300, height: 1, backgroundColor: c['gold-2'], opacity: 0.5, marginTop: 28 }} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: 'Playfair', data: font, style: 'normal', weight: 500 }] : undefined,
    },
  );
}
