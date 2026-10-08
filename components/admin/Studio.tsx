'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { wedding as committed } from '@/config/wedding.config';
import { mergeConfig, readDraft, writeDraft, clearDraft } from '@/lib/content';
import { toConfigFile, download } from '@/lib/exportConfig';
import { whatsappUrl, shareMessage } from '@/lib/share';
import { Text, Area, Pick, Toggle, Colour, Group, Row } from './fields';
import type { WeddingConfig, WeddingEvent, GalleryItem } from '@/lib/types';

type Tab = 'content' | 'events' | 'photos' | 'look' | 'guests' | 'export';

const TABS: { id: Tab; label: string }[] = [
  { id: 'content', label: 'The invitation' },
  { id: 'events', label: 'Celebrations' },
  { id: 'photos', label: 'Photos & music' },
  { id: 'look', label: 'Look & feel' },
  { id: 'guests', label: 'Guest links' },
  { id: 'export', label: 'Save & publish' },
];

const blankEvent = (order: number): WeddingEvent => ({
  id: `event-${Date.now().toString(36)}`,
  title: 'New celebration',
  subtitle: '',
  startISO: committed.dates.weddingStart,
  endISO: '',
  artwork: '',
  artworkTone: 'pheras',
  description: '',
  dressCode: '',
  venueName: committed.venue.name,
  address: committed.venue.address,
  lat: null,
  lng: null,
  mapsUrl: committed.venue.mapsUrl,
  placeId: '',
  hostPhone: '',
  order,
  visible: true,
});

/** ISO with an offset <-> the value a datetime-local input wants. */
function toLocalInput(iso: string): string {
  if (!iso) return '';
  const m = iso.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  return m ? `${m[1]}T${m[2]}` : '';
}

function fromLocalInput(local: string): string {
  return local ? `${local}:00+05:30` : '';
}

export function Studio() {
  const [config, setConfig] = useState<WeddingConfig>(committed);
  const [tab, setTab] = useState<Tab>('content');
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState('');
  const [guestNames, setGuestNames] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const preview = useRef<HTMLIFrameElement>(null);

  // Load any draft this browser already holds.
  useEffect(() => {
    const draft = readDraft();
    if (draft) setConfig(mergeConfig(committed, draft));
    setSiteUrl(window.location.origin);
  }, []);

  /**
   * Saves to localStorage, which is also what the live site reads — so the
   * preview below updates with the same data path a guest would use.
   */
  const persist = useCallback((next: WeddingConfig) => {
    setConfig(next);
    setDirty(true);
    writeDraft(next as unknown as Record<string, never>);
  }, []);

  // Reload the preview a moment after typing stops.
  useEffect(() => {
    if (!dirty) return;
    const t = window.setTimeout(() => {
      preview.current?.contentWindow?.location.reload();
    }, 700);
    return () => window.clearTimeout(t);
  }, [config, dirty]);

  const set = useCallback(
    <K extends keyof WeddingConfig>(key: K, value: WeddingConfig[K]) => {
      persist({ ...config, [key]: value });
    },
    [config, persist],
  );

  const events = useMemo(() => [...config.events].sort((a, b) => a.order - b.order), [config.events]);

  const patchEvent = (id: string, patch: Partial<WeddingEvent>) =>
    set('events', config.events.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const moveEvent = (id: string, delta: number) => {
    const list = [...events];
    const i = list.findIndex((e) => e.id === id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    set('events', list.map((e, idx) => ({ ...e, order: idx + 1 })));
  };

  const guestLinks = guestNames
    .split('\n')
    .map((n) => n.trim())
    .filter(Boolean)
    .map((name) => ({ name, url: `${siteUrl}/?guest=${encodeURIComponent(name)}` }));

  return (
    <div className="studio">
      <header className="studio-top">
        <div>
          <h1>Content Studio</h1>
          <p>
            Everything you change here is saved in this browser and shown in the preview. When it looks
            right, go to <strong>Save &amp; publish</strong> and download the config file.
          </p>
        </div>
        <div className="studio-top-actions">
          {dirty && <span className="dot" />}
          <span className="studio-status">{dirty ? 'Draft saved in this browser' : 'No changes yet'}</span>
        </div>
      </header>

      <div className="studio-body">
        <div className="studio-form">
          <nav className="studio-tabs">
            {TABS.map((t) => (
              <button key={t.id} type="button" data-on={tab === t.id} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </nav>

          {tab === 'content' && (
            <>
              <Group title="The couple" open>
                <Row>
                  <Text
                    label="Name one (full)"
                    value={config.couple.partner1.fullName}
                    onChange={(v) =>
                      set('couple', {
                        ...config.couple,
                        partner1: { ...config.couple.partner1, fullName: v },
                      })
                    }
                  />
                  <Text
                    label="Short name"
                    value={config.couple.partner1.shortName}
                    onChange={(v) =>
                      set('couple', {
                        ...config.couple,
                        partner1: { ...config.couple.partner1, shortName: v },
                      })
                    }
                    hint="Used in the hero and the closing"
                  />
                </Row>
                <Text
                  label="Her parents' line"
                  value={config.couple.partner1.parentsLine}
                  onChange={(v) =>
                    set('couple', {
                      ...config.couple,
                      partner1: { ...config.couple.partner1, parentsLine: v },
                    })
                  }
                />
                <Row>
                  <Text
                    label="Name two (full)"
                    value={config.couple.partner2.fullName}
                    onChange={(v) =>
                      set('couple', {
                        ...config.couple,
                        partner2: { ...config.couple.partner2, fullName: v },
                      })
                    }
                  />
                  <Text
                    label="Short name"
                    value={config.couple.partner2.shortName}
                    onChange={(v) =>
                      set('couple', {
                        ...config.couple,
                        partner2: { ...config.couple.partner2, shortName: v },
                      })
                    }
                  />
                </Row>
                <Text
                  label="His parents' line"
                  value={config.couple.partner2.parentsLine}
                  onChange={(v) =>
                    set('couple', {
                      ...config.couple,
                      partner2: { ...config.couple.partner2, parentsLine: v },
                    })
                  }
                />
                <Row>
                  <Text
                    label="Monogram"
                    value={config.couple.monogram}
                    onChange={(v) => set('couple', { ...config.couple, monogram: v })}
                    hint="Stamped into the wax seal"
                  />
                  <Text
                    label="Hashtag"
                    value={config.couple.hashtag}
                    onChange={(v) => set('couple', { ...config.couple, hashtag: v })}
                  />
                </Row>
                <Text
                  label="City"
                  value={config.couple.city}
                  onChange={(v) => set('couple', { ...config.couple, city: v })}
                />
              </Group>

              <Group title="Hosts and wording">
                <Text
                  label="Hosting family"
                  value={config.hosts.familyNames}
                  onChange={(v) => set('hosts', { ...config.hosts, familyNames: v })}
                />
                <Pick
                  label="Blessing"
                  value={config.intro.deity}
                  options={[
                    { value: 'ganesha', label: 'Lord Ganesha' },
                    { value: 'mahavira', label: 'Bhagwan Mahavir' },
                    { value: 'none', label: 'No deity' },
                  ]}
                  onChange={(v) => set('intro', { ...config.intro, deity: v })}
                  hint="Also sets the matching invocation below"
                />
                <Area
                  label="Shloka"
                  rows={4}
                  value={config.invitation.shloka}
                  onChange={(v) => set('invitation', { ...config.invitation, shloka: v })}
                  hint="Leave empty to use the default for the blessing chosen above"
                />
                <Area
                  label="Invitation line"
                  value={config.invitation.introText}
                  onChange={(v) => set('invitation', { ...config.invitation, introText: v })}
                />
                <Area
                  label="Closing line"
                  value={config.invitation.closingLine}
                  onChange={(v) => set('invitation', { ...config.invitation, closingLine: v })}
                />
              </Group>

              <Group title="Date and muhurat">
                <Text
                  label="Wedding starts"
                  type="datetime-local"
                  value={toLocalInput(config.dates.weddingStart)}
                  onChange={(v) => set('dates', { ...config.dates, weddingStart: fromLocalInput(v) })}
                  hint="Indian Standard Time"
                />
                <Row>
                  <Text
                    label="Muhurat time"
                    value={config.dates.muhurat.time}
                    onChange={(v) =>
                      set('dates', { ...config.dates, muhurat: { ...config.dates.muhurat, time: v } })
                    }
                  />
                  <Text
                    label="Tithi"
                    value={config.dates.muhurat.tithi}
                    onChange={(v) =>
                      set('dates', { ...config.dates, muhurat: { ...config.dates.muhurat, tithi: v } })
                    }
                  />
                </Row>
                <Text
                  label="Poetic line"
                  value={config.dates.poeticLine}
                  onChange={(v) => set('dates', { ...config.dates, poeticLine: v })}
                />
              </Group>

              <Group title="The venue">
                <Text
                  label="Venue name"
                  value={config.venue.name}
                  onChange={(v) => set('venue', { ...config.venue, name: v })}
                />
                <Text
                  label="Address"
                  value={config.venue.address}
                  onChange={(v) => set('venue', { ...config.venue, address: v })}
                />
                <Text
                  label="Google Maps link"
                  value={config.venue.mapsUrl}
                  onChange={(v) => set('venue', { ...config.venue, mapsUrl: v })}
                  hint="Paste the share link, or latitude,longitude"
                />
              </Group>

              <Group title="RSVP">
                <Toggle
                  label="Collect RSVPs"
                  value={config.rsvp.enabled}
                  onChange={(v) => set('rsvp', { ...config.rsvp, enabled: v })}
                />
                <Text
                  label="WhatsApp number"
                  value={config.rsvp.whatsappNumber}
                  onChange={(v) => set('rsvp', { ...config.rsvp, whatsappNumber: v })}
                  hint="Country code first, digits only, e.g. 919876543210"
                />
                <Row>
                  <Text
                    label="Reply by"
                    type="date"
                    value={config.rsvp.deadline}
                    onChange={(v) => set('rsvp', { ...config.rsvp, deadline: v })}
                  />
                  <Text
                    label="Largest party"
                    type="number"
                    value={String(config.rsvp.maxGuests)}
                    onChange={(v) => set('rsvp', { ...config.rsvp, maxGuests: Number(v) || 1 })}
                  />
                </Row>
                <Text
                  label="Meal options"
                  value={config.rsvp.mealOptions.join(', ')}
                  onChange={(v) =>
                    set('rsvp', { ...config.rsvp, mealOptions: v.split(',').map((s) => s.trim()).filter(Boolean) })
                  }
                  hint="Separated by commas"
                />
              </Group>

              <Group title="Sections to show">
                {(
                  [
                    ['countdown', 'Countdown'],
                    ['gallery', 'Photos'],
                    ['shagun', 'Shagun (UPI)'],
                    ['share', 'Share buttons'],
                    ['reactions', 'Floating reactions'],
                  ] as const
                ).map(([key, label]) => (
                  <Toggle
                    key={key}
                    label={label}
                    value={config.features[key]}
                    onChange={(v) => set('features', { ...config.features, [key]: v })}
                  />
                ))}
              </Group>
            </>
          )}

          {tab === 'events' && (
            <>
              <p className="studio-note">
                Drag order with the arrows. Hide a celebration instead of deleting it if you might bring it
                back.
              </p>
              {events.map((e, i) => (
                <Group key={e.id} title={`${e.visible ? '' : '(hidden) '}${e.title}`}>
                  <div className="ev-tools">
                    <button type="button" onClick={() => moveEvent(e.id, -1)} disabled={i === 0}>
                      Move up
                    </button>
                    <button type="button" onClick={() => moveEvent(e.id, 1)} disabled={i === events.length - 1}>
                      Move down
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => set('events', config.events.filter((x) => x.id !== e.id))}
                    >
                      Delete
                    </button>
                  </div>
                  <Toggle label="Show on the site" value={e.visible} onChange={(v) => patchEvent(e.id, { visible: v })} />
                  <Text label="Title" value={e.title} onChange={(v) => patchEvent(e.id, { title: v })} />
                  <Row>
                    <Text
                      label="Starts"
                      type="datetime-local"
                      value={toLocalInput(e.startISO)}
                      onChange={(v) => patchEvent(e.id, { startISO: fromLocalInput(v) })}
                    />
                    <Text
                      label="Ends"
                      type="datetime-local"
                      value={toLocalInput(e.endISO)}
                      onChange={(v) => patchEvent(e.id, { endISO: fromLocalInput(v) })}
                    />
                  </Row>
                  <Area label="One-line description" value={e.description} onChange={(v) => patchEvent(e.id, { description: v })} />
                  <Text label="Dress code" value={e.dressCode} onChange={(v) => patchEvent(e.id, { dressCode: v })} />
                  <Row>
                    <Text label="Venue" value={e.venueName} onChange={(v) => patchEvent(e.id, { venueName: v })} />
                    <Text label="Address" value={e.address} onChange={(v) => patchEvent(e.id, { address: v })} />
                  </Row>
                  <Text
                    label="Google Maps link"
                    value={e.mapsUrl}
                    onChange={(v) => patchEvent(e.id, { mapsUrl: v })}
                  />
                  <Text
                    label="Artwork"
                    value={e.artwork}
                    onChange={(v) => patchEvent(e.id, { artwork: v })}
                    hint="Put the file in public/img and write /img/your-file.jpg, or leave empty for the drawn scene"
                  />
                  <Pick
                    label="Drawn scene"
                    value={e.artworkTone}
                    options={['mehendi', 'haldi', 'sangeet', 'baraat', 'pheras', 'reception'].map((t) => ({
                      value: t as WeddingEvent['artworkTone'],
                      label: t[0].toUpperCase() + t.slice(1),
                    }))}
                    onChange={(v) => patchEvent(e.id, { artworkTone: v })}
                    hint="Used when no artwork is set"
                  />
                  <Text label="Host phone" value={e.hostPhone} onChange={(v) => patchEvent(e.id, { hostPhone: v })} />
                </Group>
              ))}
              <button
                type="button"
                className="studio-add"
                onClick={() => set('events', [...config.events, blankEvent(events.length + 1)])}
              >
                Add a celebration
              </button>
            </>
          )}

          {tab === 'photos' && (
            <>
              <p className="studio-note">
                Put your photos in <code>public/img</code> and reference them as <code>/img/name.jpg</code>, or
                paste any https link.
              </p>
              {config.gallery.map((g, i) => (
                <Group key={i} title={g.caption || `Photo ${i + 1}`}>
                  <Text
                    label="File or URL"
                    value={g.src}
                    onChange={(v) => set('gallery', config.gallery.map((x, j) => (i === j ? { ...x, src: v } : x)))}
                  />
                  <Text
                    label="Caption"
                    value={g.caption}
                    onChange={(v) => set('gallery', config.gallery.map((x, j) => (i === j ? { ...x, caption: v } : x)))}
                  />
                  <Text
                    label="Description for screen readers"
                    value={g.alt}
                    onChange={(v) => set('gallery', config.gallery.map((x, j) => (i === j ? { ...x, alt: v } : x)))}
                  />
                  <button
                    type="button"
                    className="danger"
                    onClick={() => set('gallery', config.gallery.filter((_, j) => j !== i))}
                  >
                    Remove
                  </button>
                </Group>
              ))}
              <button
                type="button"
                className="studio-add"
                onClick={() => set('gallery', [...config.gallery, { src: '', caption: '', alt: '' } as GalleryItem])}
              >
                Add a photo
              </button>

              <Group title="Music" open>
                <p className="studio-note">
                  Put your track in <code>public/audio</code>. Nothing plays until a guest taps the
                  seal, and that tap is what unlocks audio on a phone.
                </p>
                {config.music.tracks.map((t, i) => (
                  <div key={t.id} className="track">
                    <Text
                      label={`${t.title}, file`}
                      value={t.src}
                      onChange={(v) =>
                        set('music', {
                          ...config.music,
                          tracks: config.music.tracks.map((x, j) => (i === j ? { ...x, src: v } : x)),
                        })
                      }
                      hint="/audio/your-track.mp3"
                    />
                    <Row>
                      <Text
                        label="Start (sec)"
                        type="number"
                        value={String(t.startSec)}
                        onChange={(v) =>
                          set('music', {
                            ...config.music,
                            tracks: config.music.tracks.map((x, j) => (i === j ? { ...x, startSec: Number(v) || 0 } : x)),
                          })
                        }
                      />
                      <Text
                        label="End (sec, 0 = whole file)"
                        type="number"
                        value={String(t.endSec)}
                        onChange={(v) =>
                          set('music', {
                            ...config.music,
                            tracks: config.music.tracks.map((x, j) => (i === j ? { ...x, endSec: Number(v) || 0 } : x)),
                          })
                        }
                      />
                    </Row>
                    <Row>
                      <Text
                        label="Fade in (sec)"
                        type="number"
                        value={String(t.fadeInSec)}
                        onChange={(v) =>
                          set('music', {
                            ...config.music,
                            tracks: config.music.tracks.map((x, j) => (i === j ? { ...x, fadeInSec: Number(v) || 0 } : x)),
                          })
                        }
                      />
                      <Text
                        label="Volume (0–1)"
                        type="number"
                        value={String(t.volume)}
                        onChange={(v) =>
                          set('music', {
                            ...config.music,
                            tracks: config.music.tracks.map((x, j) => (i === j ? { ...x, volume: Number(v) || 0 } : x)),
                          })
                        }
                      />
                    </Row>
                  </div>
                ))}
                <Pick
                  label="Play"
                  value={config.music.defaultTrackId}
                  options={config.music.tracks.map((t) => ({ value: t.id, label: t.title }))}
                  onChange={(v) => set('music', { ...config.music, defaultTrackId: v })}
                />
              </Group>
            </>
          )}

          {tab === 'look' && (
            <>
              <Group title="Colours" open>
                <div className="colour-grid">
                  {Object.entries(config.theme.colors).map(([k, v]) => (
                    <Colour
                      key={k}
                      label={k}
                      value={v}
                      onChange={(nv) =>
                        set('theme', { ...config.theme, colors: { ...config.theme.colors, [k]: nv } })
                      }
                    />
                  ))}
                </div>
              </Group>

              <Group title="The opening">
                <Pick
                  label="Wax colour"
                  value={config.intro.sealStyle}
                  options={[
                    { value: 'gold', label: 'Antique gold' },
                    { value: 'ivory', label: 'Ivory' },
                    { value: 'sindoor', label: 'Sindoor red' },
                  ]}
                  onChange={(v) => set('intro', { ...config.intro, sealStyle: v })}
                />
                <Text
                  label="Hint above the seal"
                  value={config.intro.tapHint}
                  onChange={(v) => set('intro', { ...config.intro, tapHint: v })}
                />
                <Text
                  label="Deity artwork"
                  value={config.intro.deityImage}
                  onChange={(v) => set('intro', { ...config.intro, deityImage: v })}
                  hint="Leave empty to use the drawn gold motif"
                />
              </Group>

              <Group title="Petals">
                <Toggle
                  label="Falling petals"
                  value={config.theme.petals.enabled}
                  onChange={(v) =>
                    set('theme', { ...config.theme, petals: { ...config.theme.petals, enabled: v } })
                  }
                />
                <Pick
                  label="How many"
                  value={config.theme.petals.density}
                  options={[
                    { value: 'low', label: 'A few' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'Lots' },
                  ]}
                  onChange={(v) =>
                    set('theme', { ...config.theme, petals: { ...config.theme.petals, density: v } })
                  }
                />
              </Group>

              <Group title="Link preview">
                <Text label="Page title" value={config.seo.title} onChange={(v) => set('seo', { ...config.seo, title: v })} />
                <Area
                  label="Description"
                  value={config.seo.description}
                  onChange={(v) => set('seo', { ...config.seo, description: v })}
                />
                <Text
                  label="Your domain"
                  value={config.seo.siteUrl}
                  onChange={(v) => set('seo', { ...config.seo, siteUrl: v })}
                  hint="Set this before you deploy, or the WhatsApp preview will not work"
                />
              </Group>
            </>
          )}

          {tab === 'guests' && (
            <>
              <p className="studio-note">
                Paste one name per line. Each guest gets a link that greets them by name, and a WhatsApp
                message ready to send.
              </p>
              <Area
                label="Guest names"
                rows={8}
                value={guestNames}
                onChange={setGuestNames}
                hint="For example: Sharma Family"
              />
              {guestLinks.length > 0 && (
                <ul className="guest-list">
                  {guestLinks.map((g) => (
                    <li key={g.name}>
                      <span className="guest-name">{g.name}</span>
                      <code>{g.url}</code>
                      <span className="guest-actions">
                        <button type="button" onClick={() => navigator.clipboard?.writeText(g.url)}>
                          Copy link
                        </button>
                        <a
                          href={whatsappUrl('', shareMessage(config, g.url))}
                          target="_blank"
                          rel="noreferrer"
                        >
                          WhatsApp
                        </a>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {tab === 'export' && (
            <div className="export">
              <h2>Put your changes live</h2>
              <ol>
                <li>
                  Download the config file below and replace <code>config/wedding.config.ts</code> with it.
                </li>
                <li>Commit and push. Vercel rebuilds and your guests see the change in about a minute.</li>
              </ol>
              <div className="export-actions">
                <button
                  type="button"
                  className="primary"
                  onClick={() => {
                    download('wedding.config.ts', toConfigFile(config), 'text/plain');
                    setSaved('Downloaded wedding.config.ts');
                  }}
                >
                  Download wedding.config.ts
                </button>
                <button
                  type="button"
                  onClick={() => {
                    download('wedding-backup.json', JSON.stringify(config, null, 2), 'application/json');
                    setSaved('Downloaded a JSON backup');
                  }}
                >
                  Download a JSON backup
                </button>
                <label className="import">
                  Load a JSON backup
                  <input
                    type="file"
                    accept="application/json"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        const parsed = JSON.parse(await file.text());
                        persist(mergeConfig(committed, parsed));
                        setSaved(`Loaded ${file.name}`);
                      } catch {
                        setSaved('That file could not be read as JSON');
                      }
                    }}
                  />
                </label>
                <button
                  type="button"
                  className="danger"
                  onClick={() => {
                    if (!confirm('Discard every change in this browser and go back to the published site?')) return;
                    clearDraft();
                    setConfig(committed);
                    setDirty(false);
                    setSaved('Draft discarded');
                    preview.current?.contentWindow?.location.reload();
                  }}
                >
                  Discard my draft
                </button>
              </div>
              {saved && <p className="export-said">{saved}</p>}
              <p className="studio-note">
                Your draft lives only in this browser. Guests keep seeing the published site until you
                replace the config file and redeploy.
              </p>
            </div>
          )}
        </div>

        <aside className="studio-preview">
          <div className="phone">
            <iframe ref={preview} src="/?replay=0" title="Live preview" />
          </div>
          <button type="button" onClick={() => preview.current?.contentWindow?.location.reload()}>
            Refresh preview
          </button>
        </aside>
      </div>
    </div>
  );
}
