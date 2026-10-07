# Priyal & Vaibhav — wedding invitation

An interactive wedding invitation: a sindoor-velvet envelope sealed with wax that
you break and then pull open with your finger, a gold-dust transition, and a
scroll-driven invitation underneath.

Built mobile-first for a 390 × 844 phone, because almost everyone will open it
from a WhatsApp link. Wider screens get the invitation as a centred 9:16 column
on a velvet backdrop, the way a reel looks on a laptop.

**No backend.** No database, no accounts, nothing to host but the site itself.

---

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

Other commands:

| Command | What it does |
|---|---|
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | TypeScript, no emit |

---

## Editing the content

There are two ways, and they edit the same thing.

### The Content Studio — `/admin`

Open <http://localhost:3000/admin>. Forms for every field, a live phone preview
beside them, and a guest-link generator.

Changes are saved **in your browser only**. Guests keep seeing the published site
until you publish:

1. Go to **Save & publish**
2. **Download `wedding.config.ts`**
3. Replace `config/wedding.config.ts` with the downloaded file
4. Commit and push — Vercel rebuilds in about a minute

There is no password on `/admin`, because there is nothing behind it to protect:
it only writes to your own browser and hands you a file. It is excluded from
search engines. If you would rather it were not on the public site at all, delete
`app/admin/` before deploying and edit the config file by hand.

### The config file — `config/wedding.config.ts`

Every string, date, colour, photo, song, link and on/off switch lives in this one
commented file. Nothing is hard-coded in a component. Editing it directly is
often quicker than the Studio for small changes.

---

## How to do the common things

### Change the names, date or venue

`config/wedding.config.ts` → `couple`, `dates.weddingStart`, `venue`.

Dates are ISO 8601 **with the `+05:30` offset**, e.g. `'2027-01-31T19:00:00+05:30'`.
The countdown, the scratch cards and every event date line all read from these,
so changing the date in one place changes it everywhere.

### Add or remove a celebration

Add an object to the `events` array. `order` sorts them; `visible: false` hides
one without deleting it. The minimum you need:

```ts
{
  id: 'mehendi',                 // unique, used by the RSVP checkboxes
  title: 'Mehendi',
  startISO: '2027-01-29T11:00:00+05:30',
  endISO: '2027-01-29T16:00:00+05:30',
  description: 'One line, shown in italics under the artwork.',
  dressCode: 'Mint and sunshine yellow',
  venueName: 'Monsoon Resort',
  address: 'Udaipur, Rajasthan',
  mapsUrl: 'https://maps.app.goo.gl/…',
  artwork: '',                   // empty = use the drawn scene below
  artworkTone: 'mehendi',        // mehendi | haldi | sangeet | baraat | pheras | reception
  order: 1,
  visible: true,
}
```

### Add photos and artwork

Put the files in `public/img/` and reference them as `/img/your-file.jpg`, or
paste any `https://` URL. Images are served as AVIF/WebP with `srcset` and
lazy-loaded automatically.

- **Event artwork** — set `artwork` on that event. Portrait or square works best;
  the card is 3:4.1 and crops from the centre. If your image has the event name
  printed on it, it will sit under the card's own title — crop that part off.
- **Gallery** — add to the `gallery` array. 6 to 30 photos work well. Give each
  an `alt` line so screen readers can describe it.
- **Leave `artwork` empty** and you get a drawn vector scene for that ceremony
  instead — a few kilobytes, sharp at any size.

### Add your own music and trim it

1. Put the file in `public/audio/`, e.g. `public/audio/shehnai.mp3`
   (AAC or MP3, 96–128 kbps, under about 1.5 MB)
2. In `music.tracks`, set `src: '/audio/shehnai.mp3'`
3. Trim without touching the file:

| Field | Meaning |
|---|---|
| `startSec` | Where the loop begins |
| `endSec` | Where it ends. `0` plays to the end of the file |
| `fadeInSec` | Fade up when a guest first taps the seal |
| `fadeOutSec` | Fade down before it loops |
| `volume` | 0 to 1 |

4. Point `music.defaultTrackId` at that track's `id`

Nothing plays until a guest taps the wax seal — that tap is what unlocks audio
on a phone. The floating button mutes in one tap and remembers the choice.
Set `defaultTrackId: 'none'` for a silent invitation.

**Only use music you have the right to use.** No film songs are bundled.

### Change colours and fonts

`theme.colors` in the config, or the colour pickers under **Look & feel**. Every
colour is a CSS custom property, so changing one repaints the whole site.

Fonts are declared in `app/layout.tsx` via `next/font/google`, which downloads,
subsets and self-hosts them at build time:

| Role | Face |
|---|---|
| Names and headings | Bonheur Royale |
| Section display type | Playfair Display |
| Body | Cormorant Garamond |
| Script asides | Great Vibes |
| Small caps labels | Cinzel Decorative |
| Devanagari | Tiro Devanagari Hindi |

### Personalise a guest's link

`?guest=Sharma%20Family` adds "Dear Sharma Family," above the invitation and
prefills the RSVP name. The Studio's **Guest links** tab turns a pasted list of
names into links with a ready-to-send WhatsApp message for each.

### Read your RSVPs

Each reply opens WhatsApp with the message already written and sends it to
`rsvp.whatsappNumber` (country code first, digits only, no `+`). They arrive as
normal WhatsApp messages. The guest's own answer is remembered in their browser
so they can come back and edit it.

### Switch the blessing

`intro.deity` takes `'ganesha'`, `'mahavira'` or `'none'`. It sets both the
envelope crest and the invocation in the blessing, so the two always agree. To
use your own artwork, put a transparent PNG in `public/img/` and set
`intro.deityImage`.

---

## Deploying

### Vercel

1. Push this folder to a Git repository
2. On <https://vercel.com> → **Add New → Project** → import the repo
3. Everything is detected automatically. No environment variables are needed
4. **Deploy**

### Your own domain

1. Vercel → your project → **Settings → Domains** → add e.g.
   `vaibhavweddspriyal.in`
2. Point the records Vercel shows you at your registrar
3. HTTPS is issued automatically

### Then — and this matters for WhatsApp

Set `seo.siteUrl` in the config to your real domain and redeploy. The link
preview image is built from it, and a wrong value means no preview.

Check it with <https://developers.facebook.com/tools/debug/> or by sending the
link to yourself on WhatsApp. You should see a velvet card with both names, the
date and the city. If WhatsApp shows a stale preview, it has cached the old one —
add `?v=2` to the link once to force a refresh.

---

## How it is built

```
app/
  layout.tsx            fonts, metadata, the pre-paint no-flash script
  page.tsx              the invitation
  globals.css           design tokens, velvet and gold materials, reveals
  gate.css              the envelope and the wax seal
  sections.css          everything below the fold
  opengraph-image.tsx   the WhatsApp preview card, built at build time
  admin/                the Content Studio
components/
  gate/                 envelope, wax seal, shard physics, vortex
  ornaments/            the SVG kit — arches, paisley, deities, calligraphy
  sections/             blessing, hero, date, countdown, story, photos,
                        festivities, venue, RSVP, shagun, closing
  ui/                   petals, sound, reactions, reveals, placeholders
config/wedding.config.ts   all of your content
lib/                    dates, maps, calendar, audio, share, hooks
public/                 images, audio, icon, manifest, service worker
```

### Decisions worth knowing about

**No animation library.** The spec suggested Framer Motion. The envelope, the
reveals, the petals and the vortex are hand-written with CSS transforms, an
`IntersectionObserver` and two small canvases instead. Everything animates
`transform` and `opacity` only, so it stays on the compositor, and it keeps a
library out of the bundle for effects that did not need one.

**The envelope paints before JavaScript.** It is server-rendered, and an inline
script in `<head>` settles the "has this guest already opened it" question before
the first paint. So there is no flash of the invitation before the envelope, and
no flash of the envelope for someone coming back.

**First-load JS is about 204 KB gzipped**, not the 120 KB the brief asked for.
Next.js App Router with React 19 is roughly 120–130 KB of that before a line of
this site is written, so the target is not reachable on this stack. What was
done instead: the envelope and the whole invitation are in the HTML and paint
without waiting for any of it, and `canvas-confetti` and `qrcode` are loaded only
at the moment they are used. If the number itself matters more than the stack,
the same design would fit comfortably as a static site with no framework.

**Everything degrades.** No `localStorage`, no `sessionStorage`, no clipboard, no
`navigator.share`, no vibration, no geolocation, no `AudioContext`, no service
worker — each is wrapped and the site works without it. The RSVP needs nothing
but a WhatsApp link.

**Accessibility.** `prefers-reduced-motion` replaces every animation with a fade
and switches off the particles and the parallax. The seal, the scratch cards and
the mute button have labels. All controls are keyboard-reachable with a visible
gold focus ring. Form fields are 16px or larger, so iOS does not zoom on focus.

---

## Still to send me

- [ ] Both sets of parents' names (the config has `______` placeholders)
- [ ] Which ceremonies you actually want, and their real times
- [ ] Whether every event is at Monsoon Resort, or some are elsewhere
- [ ] Dress codes and a one-line description for each
- [ ] 8 to 30 photos, with a caption for each
- [ ] Your real love-story milestones
- [ ] The WhatsApp number RSVPs should go to
- [ ] A music track you have the rights to — or say "none"
- [ ] Hotels, airport and parking notes for the travel section
- [ ] Your domain name
