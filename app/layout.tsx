import type { Metadata, Viewport } from 'next';
import {
  Playfair_Display,
  Cormorant_Garamond,
  Great_Vibes,
  Bonheur_Royale,
  Cinzel_Decorative,
  Tiro_Devanagari_Hindi,
} from 'next/font/google';
import { wedding } from '@/config/wedding.config';
import { ServiceWorker } from '@/components/ui/ServiceWorker';
import './globals.css';
import './gate.css';
import './sections.css';

/* next/font downloads, subsets and self-hosts each family at build time, and
   adds font-display: swap. Only the two faces the envelope gate needs are
   preloaded; the rest arrive while the guest is still looking at the seal. */

/* Playfair Display carries the section headings; Bonheur Royale is reserved
   for the names and the few lines that matter most; Great Vibes handles the
   smaller script asides. */
const display = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
  preload: false,
});

const name = Bonheur_Royale({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-name',
  display: 'swap',
  preload: false,
});

const body = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-body',
  display: 'swap',
  preload: false,
});

const script = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
  display: 'swap',
  preload: true,
});

const caps = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-caps',
  display: 'swap',
  preload: true,
});

const deva = Tiro_Devanagari_Hindi({
  subsets: ['devanagari', 'latin'],
  weight: '400',
  variable: '--font-deva',
  display: 'swap',
  preload: false,
});

const { seo, couple, theme } = wedding;

export const metadata: Metadata = {
  metadataBase: new URL(seo.siteUrl),
  title: seo.title,
  description: seo.description,
  applicationName: 'Wedding Invitation',
  openGraph: {
    type: 'website',
    title: seo.title,
    description: seo.description,
    url: seo.siteUrl,
    siteName: seo.title,
    images: [{ url: seo.ogImage, width: 1200, height: 630, alt: seo.title }],
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: seo.title,
    description: seo.description,
    images: [seo.ogImage],
  },
  manifest: '/manifest.webmanifest',
  robots: { index: true, follow: true },
  other: { 'format-detection': 'telephone=no' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Guests must still be able to zoom into a photo or read the address.
  maximumScale: 5,
  // Lets the page paint under the notch and the home indicator.
  viewportFit: 'cover',
  themeColor: theme.colors['velvet-deep'],
};

/** Structured data, so each ceremony can surface as an event in search. */
function eventSchema() {
  const names = `${couple.partner1.shortName} & ${couple.partner2.shortName}`;
  return wedding.events
    .filter((e) => e.visible)
    .map((e) => ({
      '@context': 'https://schema.org',
      '@type': 'Event',
      name: `${e.title} — ${names}`,
      startDate: e.startISO,
      endDate: e.endISO || undefined,
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      description: e.description,
      location: {
        '@type': 'Place',
        name: e.venueName,
        address: { '@type': 'PostalAddress', streetAddress: e.address },
      },
    }));
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontVars = [display, body, name, script, caps, deva].map((f) => f.variable).join(' ');

  return (
    <html lang="en" className={fontVars}>
      <head>
        {/*
          Runs before the first paint. A guest who has already opened the
          envelope in this tab should never see it again, and the page behind
          it must not scroll for anyone who has not — both have to be settled
          before React arrives, or there is a visible flash either way.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var s=sessionStorage.getItem('mewar:opened')==='1';" +
              "var r=location.search.indexOf('replay=1')>-1;" +
              "if(s&&!r)document.documentElement.setAttribute('data-opened','1');}catch(e){}",
          }}
        />
      </head>
      <body>
        {children}
        <ServiceWorker />
        <script
          type="application/ld+json"
          // Static, build-time JSON from the committed config — no guest input reaches it.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema()) }}
        />
      </body>
    </html>
  );
}
