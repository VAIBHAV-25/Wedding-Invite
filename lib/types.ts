/**
 * Shape of every piece of editable content on the site.
 *
 * The committed `config/wedding.config.ts` always satisfies this type.
 * The /admin Content Studio edits a *partial* of this same shape, deep-merged
 * over the committed defaults — so a half-filled draft can never break a page.
 */

export type SealStyle = 'gold' | 'ivory' | 'sindoor';
export type IntroMode = 'names' | 'video';
export type Deity = 'ganesha' | 'mahavira' | 'none';
export type PetalDensity = 'low' | 'medium' | 'high';
export type Language = 'en' | 'hi' | 'both';

export interface Person {
  fullName: string;
  shortName: string;
  /** e.g. "Daughter of Shri … & Smt. …" — rendered verbatim. */
  parentsLine: string;
  photo: string;
}

export interface Couple {
  partner1: Person;
  partner2: Person;
  /** A drawing of the two of you, shown above the names in the invitation. */
  illustration: string;
  /** Stamped into the wax seal and the closing monogram, e.g. "A & A". */
  monogram: string;
  hashtag: string;
  city: string;
}

export interface Hosts {
  regardsLine: string;
  familyNames: string;
}

export interface Invitation {
  shloka: string;
  shlokaTransliteration: string;
  shlokaEnglish: string;
  introText: string;
  /** The invocation set on velvet between the venue and the RSVP.
   *  Leave `lines` empty to hide the whole section. */
  mantra: {
    /** Heading above the mantra, e.g. the mantra's name. */
    title: string;
    /** One entry per printed line. */
    lines: string[];
    /** The short salutation under it. */
    salutation: string;
    /** A line of English beneath, saying what is being asked for. */
    meaning: string;
  };
  closingLine: string;
  language: Language;
}

export interface Muhurat {
  time: string;
  tithi: string;
  nakshatra: string;
  note: string;
}

export interface Dates {
  /** ISO 8601 with an explicit IST offset. Drives the countdown and scratch cards. */
  weddingStart: string;
  muhurat: Muhurat;
  /** Shown while the wedding is under way. */
  countdownLiveMessage: string;
  /** Shown once the wedding day has passed. */
  countdownEndMessage: string;
  poeticLine: string;
}

export interface Intro {
  mode: IntroMode;
  videoUrl: string;
  posterUrl: string;
  sealStyle: SealStyle;
  /** Script hint above the seal. */
  tapHint: string;
  /** Whose blessing heads the envelope and the invocation. */
  deity: Deity;
  /** Your own licensed artwork, used instead of the drawn motif. */
  deityImage: string;
}

export interface WeddingEvent {
  id: string;
  title: string;
  subtitle: string;
  /** ISO 8601 with IST offset. */
  startISO: string;
  endISO: string;
  artwork: string;
  /** Used when `artwork` is empty — picks one of the built-in filigree gradients. */
  artworkTone:
    | 'ganpati'
    | 'engagement'
    | 'mehendi'
    | 'haldi'
    | 'sangeet'
    | 'mayra'
    | 'baraat'
    | 'swagat'
    | 'pheras'
    | 'reception';
  description: string;
  dressCode: string;
  venueName: string;
  address: string;
  lat: number | null;
  lng: number | null;
  /** A pasted Google Maps share link. Parsed for lat/lng if those are empty. */
  mapsUrl: string;
  placeId: string;
  hostPhone: string;
  order: number;
  visible: boolean;
}

export interface StoryMilestone {
  year: string;
  title: string;
  text: string;
  photo: string;
}

export interface GalleryItem {
  src: string;
  caption: string;
  alt: string;
  /** Set for a looping clip instead of a still. */
  video?: string;
}

export interface Track {
  id: string;
  title: string;
  src: string;
  licence: string;
  startSec: number;
  /** 0 means "play to the end of the file". */
  endSec: number;
  fadeInSec: number;
  fadeOutSec: number;
  /** 0–1. */
  volume: number;
  source: 'preset' | 'upload';
}

export interface Music {
  tracks: Track[];
  defaultTrackId: string;
  loop: boolean;
  /** Seconds from track start. The hero name reveal lands on the last cue. */
  introCues: number[];
}

export interface Rsvp {
  enabled: boolean;
  /** International format, digits only, e.g. "919876543210". */
  whatsappNumber: string;
  deadline: string;
  maxGuests: number;
  mealOptions: string[];
  askSong: boolean;
  askMessage: boolean;
}

export interface Shagun {
  enabled: boolean;
  upiId: string;
  payeeName: string;
  presets: number[];
  /** Overrides the generated QR with an uploaded image. */
  qrOverride: string;
  note: string;
  /** Optional second payee, e.g. the other family. */
  secondary: { upiId: string; payeeName: string } | null;
}

export interface Hotel {
  name: string;
  phone: string;
  mapsUrl: string;
  note: string;
}

export interface Travel {
  enabled: boolean;
  airport: string;
  station: string;
  /** One line about where to stay. Use `hotels` instead to list several. */
  stay: string;
  hotels: Hotel[];
  parking: string;
}

export interface Venue {
  name: string;
  address: string;
  image: string;
  lat: number | null;
  lng: number | null;
  mapsUrl: string;
  placeId: string;
  mapEmbedUrl: string;
}

export interface Theme {
  colors: Record<string, string>;
  fonts: { display: string; body: string; script: string };
  petals: { enabled: boolean; density: PetalDensity; colors: string[] };
}

export interface Seo {
  title: string;
  description: string;
  ogImage: string;
  siteUrl: string;
}

export interface Features {
  reactions: boolean;
  guestWishes: boolean;
  countdown: boolean;
  gallery: boolean;
  shagun: boolean;
  share: boolean;
  analytics: boolean;
}

export interface WeddingConfig {
  couple: Couple;
  hosts: Hosts;
  invitation: Invitation;
  dates: Dates;
  intro: Intro;
  events: WeddingEvent[];
  story: StoryMilestone[];
  gallery: GalleryItem[];
  music: Music;
  rsvp: Rsvp;
  shagun: Shagun;
  venue: Venue;
  travel: Travel;
  theme: Theme;
  seo: Seo;
  features: Features;
}

/** Anything the Content Studio has not filled in falls back to the committed config. */
export type PartialConfig = {
  [K in keyof WeddingConfig]?: Partial<WeddingConfig[K]>;
};

export interface RsvpSubmission {
  name: string;
  phone: string;
  attending: boolean;
  partySize: number;
  events: string[];
  meal: string;
  song: string;
  message: string;
}
