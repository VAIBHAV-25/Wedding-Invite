import type { WeddingConfig } from '@/lib/types';

/* ============================================================================
 *  EVERY WORD, DATE, COLOUR, PHOTO, SONG AND LINK ON THIS SITE LIVES HERE.
 *
 *  Edit this file directly, or use the Content Studio at /admin — it gives you
 *  forms for all of it, a live phone preview, and an "Export" button that
 *  hands you a replacement for this file. Nothing else needs touching.
 *
 *  The sample couple below is fictional. Replace it with your own.
 * ========================================================================== */

export const wedding: WeddingConfig = {
  /* ---- Who is getting married -------------------------------------------- */
  couple: {
    // partner1 is named first everywhere on the site.
    partner1: {
      fullName: 'Vaibhav Singhvi',
      shortName: 'Vaibhav',
      parentsLine: 'Son of Shri Manoj Singhvi & Smt. Sarika Singhvi',
      photo: '',
    },
    partner2: {
      fullName: 'Priyal Jaroli',
      shortName: 'Priyal',
      parentsLine: 'Daughter of Shri Ramesh Jaroli & Smt. Kalpana Jaroli',
      photo: '',
    },
    // Shown in the invitation, just above your names. Leave empty to omit.
    illustration: '/img/couple.png',
    // Stamped into the wax seal on the envelope and the closing monogram.
    monogram: 'V & P',
    hashtag: '#ViP_LoveStory',
    city: 'Udaipur, Rajasthan',
  },

  /* ---- Who is hosting ----------------------------------------------------- */
  hosts: {
    regardsLine: 'Warm regards',
    familyNames: 'The Singhvi and Jaroli families',
  },

  /* ---- The invitation wording -------------------------------------------- */
  // Used automatically when intro.deity is 'mahavira'.
  // To switch, change intro.deity above — nothing else needs touching.
  invitation: {
    shloka:
      '॥ श्री गणेशाय नमः ॥\nवक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
    shlokaTransliteration:
      'Vakratunda Mahakaya Suryakoti Samaprabha · Nirvighnam Kuru Me Deva Sarvakaryeshu Sarvada',
    shlokaEnglish:
      'O Lord of the curved trunk, radiant as a million suns, keep our path free of obstacles, always.',
    introText:
      'With the blessings of Lord Ganesha and the elders of our two families, we invite you to the marriage of',
    closingLine: 'Your presence is the blessing we are asking for.',
    // 'en' | 'hi' | 'both' — 'both' shows the transliteration and English lines.
    language: 'both',
  },

  /* ---- When --------------------------------------------------------------- */
  dates: {
    // ISO 8601 with the +05:30 offset. Drives the countdown AND the scratch cards.
    weddingStart: '2027-01-31T23:45:00+05:30',
    muhurat: {
      time: '11:45 PM',
      tithi: 'Shukla Panchami',
      nakshatra: 'Rohini',
      note: 'The pheras begin at the auspicious hour.',
    },
    countdownLiveMessage: 'The vows are being taken',
    countdownEndMessage: 'We are married',
    poeticLine: 'A lifetime of togetherness begins with one sacred step.',
  },

  /* ---- The opening sequence ----------------------------------------------- */
  intro: {
    // 'names' = letter-by-letter name reveal. 'video' = your own clip first.
    mode: 'names',
    videoUrl: '',
    posterUrl: '',
    // 'gold' | 'ivory' | 'sindoor' — the wax the seal is cast in.
    sealStyle: 'gold',
    tapHint: 'Tap to break the seal',
    // 'ganesha' | 'mahavira' | 'none'. This one key also picks the matching
    // invocation below, so the envelope and the blessing always agree.
    deity: 'ganesha',
    // Drop your own licensed artwork in /public/img and point here, e.g.
    // '/img/ganesha.png'. Leave empty to use the drawn gold line motif.
    deityImage: '/img/ganesha.png',
  },

  /* ---- The celebrations ---------------------------------------------------
   * Add, remove and reorder freely. `order` sorts them; `visible: false` hides
   * one without deleting it. Leave `artwork` empty to use the built-in
   * filigree artwork chosen by `artworkTone`.
   * ------------------------------------------------------------------------ */
  events: [
    {
      id: 'mehendi',
      title: 'Mehendi',
      subtitle: 'Henna and laughter',
      startISO: '2027-01-29T11:00:00+05:30',
      endISO: '2027-01-29T16:00:00+05:30',
      artwork: '/img/events/mehendi.jpeg',
      artworkTone: 'mehendi',
      description: 'Marigold, shehnai, and henna drying slowly in the afternoon sun.',
      dressCode: '',
      venueName: 'Monsoon Resort',
      address: 'Monsoon Resort, Udaipur, Rajasthan',
      lat: null,
      lng: null,
      mapsUrl: 'https://maps.app.goo.gl/Tjz5AUoYGQpeQwM99',
      placeId: '',
      hostPhone: '',
      order: 1,
      visible: true,
    },
    {
      id: 'ganpati',
      title: 'Ganpati Sthapana & Kalash',
      subtitle: 'The first blessing',
      startISO: '2027-01-30T09:00:00+05:30',
      endISO: '2027-01-30T11:00:00+05:30',
      artwork: '/img/events/ganpati.jpeg',
      artworkTone: 'ganpati',
      description: 'Where it all begins. The first prayer, and the house fills up.',
      dressCode: '',
      venueName: 'Monsoon Resort',
      address: 'Monsoon Resort, Udaipur, Rajasthan',
      lat: null,
      lng: null,
      mapsUrl: 'https://maps.app.goo.gl/Tjz5AUoYGQpeQwM99',
      placeId: '',
      hostPhone: '',
      order: 2,
      visible: true,
    },
    {
      id: 'engagement',
      title: 'Engagement',
      subtitle: 'The rings',
      startISO: '2027-01-30T12:00:00+05:30',
      endISO: '2027-01-30T13:00:00+05:30',
      artwork: '/img/events/engagement.jpeg',
      artworkTone: 'engagement',
      description: 'Two families, one promise, and a great deal of photography.',
      dressCode: '',
      venueName: 'Monsoon Resort',
      address: 'Monsoon Resort, Udaipur, Rajasthan',
      lat: null,
      lng: null,
      mapsUrl: 'https://maps.app.goo.gl/Tjz5AUoYGQpeQwM99',
      placeId: '',
      hostPhone: '',
      order: 3,
      visible: true,
    },
    {
      id: 'haldi',
      title: 'Haldi',
      subtitle: 'Turmeric blessings',
      startISO: '2027-01-30T13:00:00+05:30',
      endISO: '2027-01-30T16:00:00+05:30',
      artwork: '/img/events/haldi.jpeg',
      artworkTone: 'haldi',
      description: 'Come in clothes you do not mind losing to turmeric.',
      dressCode: '',
      venueName: 'Monsoon Resort',
      address: 'Monsoon Resort, Udaipur, Rajasthan',
      lat: null,
      lng: null,
      mapsUrl: 'https://maps.app.goo.gl/Tjz5AUoYGQpeQwM99',
      placeId: '',
      hostPhone: '',
      order: 4,
      visible: true,
    },
    {
      id: 'sangeet',
      title: 'Sangeet',
      subtitle: 'The night everyone dances',
      startISO: '2027-01-30T18:00:00+05:30',
      endISO: '2027-01-30T23:30:00+05:30',
      artwork: '/img/events/sangeet.jpeg',
      artworkTone: 'sangeet',
      description: 'Our families have been rehearsing in secret. Come and judge them.',
      dressCode: '',
      venueName: 'Monsoon Resort',
      address: 'Monsoon Resort, Udaipur, Rajasthan',
      lat: null,
      lng: null,
      mapsUrl: 'https://maps.app.goo.gl/Tjz5AUoYGQpeQwM99',
      placeId: '',
      hostPhone: '',
      order: 5,
      visible: true,
    },
    {
      id: 'mayra',
      title: 'Mayra',
      subtitle: 'The maternal welcome',
      startISO: '2027-01-31T10:00:00+05:30',
      endISO: '2027-01-31T12:30:00+05:30',
      artwork: '/img/events/mayra.jpeg',
      artworkTone: 'mayra',
      description: 'The bhaat ceremony, and the warmest welcome of the whole wedding.',
      dressCode: '',
      venueName: 'Monsoon Resort',
      address: 'Monsoon Resort, Udaipur, Rajasthan',
      lat: null,
      lng: null,
      mapsUrl: 'https://maps.app.goo.gl/Tjz5AUoYGQpeQwM99',
      placeId: '',
      hostPhone: '',
      order: 6,
      visible: true,
    },
    {
      id: 'baraat-swagat',
      title: 'Baraat Swagat',
      subtitle: 'The welcome',
      startISO: '2027-01-31T18:00:00+05:30',
      endISO: '2027-01-31T19:00:00+05:30',
      artwork: '/img/events/baraat-swagat.jpeg',
      artworkTone: 'swagat',
      description: 'Marigold at the gate, dhol in the street, and both families meeting in the middle.',
      dressCode: '',
      venueName: 'Monsoon Resort',
      address: 'Monsoon Resort, Udaipur, Rajasthan',
      lat: null,
      lng: null,
      mapsUrl: 'https://maps.app.goo.gl/Tjz5AUoYGQpeQwM99',
      placeId: '',
      hostPhone: '',
      order: 7,
      visible: true,
    },
    {
      id: 'reception',
      title: 'Reception',
      subtitle: 'One last celebration',
      startISO: '2027-01-31T19:00:00+05:30',
      endISO: '2027-01-31T23:00:00+05:30',
      artwork: '/img/events/reception.jpeg',
      artworkTone: 'reception',
      description: 'Dinner under the chandeliers, and a dance floor that stays open late.',
      dressCode: '',
      venueName: 'Monsoon Resort',
      address: 'Monsoon Resort, Udaipur, Rajasthan',
      lat: null,
      lng: null,
      mapsUrl: 'https://maps.app.goo.gl/Tjz5AUoYGQpeQwM99',
      placeId: '',
      hostPhone: '',
      order: 8,
      visible: true,
    },
    {
      id: 'fere',
      title: 'Fere',
      subtitle: 'Seven vows',
      startISO: '2027-01-31T23:45:00+05:30',
      endISO: '2027-02-01T02:00:00+05:30',
      artwork: '/img/events/fere.jpeg',
      artworkTone: 'pheras',
      description: 'Seven rounds of the sacred fire, at the auspicious hour.',
      dressCode: '',
      venueName: 'Monsoon Resort',
      address: 'Monsoon Resort, Udaipur, Rajasthan',
      lat: null,
      lng: null,
      mapsUrl: 'https://maps.app.goo.gl/Tjz5AUoYGQpeQwM99',
      placeId: '',
      hostPhone: '',
      order: 9,
      visible: true,
    },
  ],

  /* ---- Our story ---------------------------------------------------------- */
  story: [
    {
      year: '2019',
      title: 'A wrong platform',
      text: 'We both got on the 6:40 to Jaipur by mistake. Neither of us got off.',
      photo: '',
    },
    {
      year: '2021',
      title: 'The long year',
      text: 'Two cities, one video call every night, and a shared list of places to go.',
      photo: '',
    },
    {
      year: '2023',
      title: 'Udaipur, by accident',
      text: 'We came for a friend’s wedding and spent the whole evening on the ghat steps.',
      photo: '',
    },
    {
      year: '2025',
      title: 'The question',
      text: 'Asked on the same platform, nearly six years later. The answer took no time at all.',
      photo: '',
    },
    {
      year: '2027',
      title: 'And now, you',
      text: 'The part we have been looking forward to most: all of you, in one place.',
      photo: '',
    },
  ],

  /* ---- Photographs --------------------------------------------------------
   * Drop your images in /public/img and reference them as '/img/your-file.jpg',
   * or paste any https URL. 6–30 photos work well.
   * ------------------------------------------------------------------------ */
  gallery: [
    { src: '', caption: 'The first trip', alt: 'The couple on their first trip together' },
    { src: '', caption: 'Chai at midnight', alt: 'The couple sharing chai late at night' },
    { src: '', caption: 'Her grandmother’s ring', alt: 'A close-up of the engagement ring' },
    { src: '', caption: 'Monsoon, finally', alt: 'The couple in the rain' },
    { src: '', caption: 'He said yes to the dog first', alt: 'The couple with their dog' },
    { src: '', caption: 'The evening we decided', alt: 'The couple on the ghat steps at dusk' },
  ],

  /* ---- Music --------------------------------------------------------------
   * Put your own .mp3 / .m4a in /public/audio and point `src` at it.
   * Nothing plays until the guest taps the seal — that tap is what unlocks
   * audio on mobile. `startSec`/`endSec` trim without touching the file.
   * ------------------------------------------------------------------------ */
  music: {
    tracks: [
      {
        id: 'none',
        title: 'No music',
        src: '',
        licence: 'None',
        startSec: 0,
        endSec: 0,
        fadeInSec: 0,
        fadeOutSec: 0,
        volume: 0,
        source: 'preset',
      },
      {
        id: 'shehnai',
        title: 'Shehnai, traditional',
        // Add your own licensed file here, e.g. '/audio/shehnai.mp3'
        src: '',
        licence: 'Add your own licensed track',
        startSec: 0,
        endSec: 0,
        fadeInSec: 3,
        fadeOutSec: 2,
        volume: 0.55,
        source: 'preset',
      },
    ],
    defaultTrackId: 'shehnai',
    loop: true,
    // Seconds from track start. The hero name reveal finishes on the last cue.
    introCues: [0.5, 2.0, 3.6],
  },

  /* ---- RSVP ---------------------------------------------------------------
   * Answers arrive as a prefilled WhatsApp message to the number below.
   * Digits only, with the country code and no "+".
   * ------------------------------------------------------------------------ */
  rsvp: {
    enabled: true,
    whatsappNumber: '919876543210',
    deadline: '2027-01-15',
    maxGuests: 8,
    mealOptions: ['Pure Vegetarian', 'Jain', 'Vegan', 'Non-Vegetarian'],
    askSong: true,
    askMessage: true,
  },

  /* ---- Shagun (UPI) -------------------------------------------------------
   * The QR is generated in the guest's browser. No payment ever touches
   * this site, and nothing is stored.
   * ------------------------------------------------------------------------ */
  shagun: {
    enabled: false,
    upiId: 'yourname@okhdfcbank',
    payeeName: 'Vaibhav & Priyal',
    presets: [501, 1101, 2100, 5100, 11000],
    qrOverride: '',
    note: 'Your presence is our greatest gift. If you wish to bless us further, this is here for you.',
    secondary: null,
  },

  /* ---- The main venue ----------------------------------------------------- */
  venue: {
    name: 'Monsoon Resort',
    address: 'Udaipur, Rajasthan',
    image: '/img/monsoon-resort.jpeg',
    // Paste the latitude and longitude here for pin-accurate navigation.
    // Left empty, directions resolve from the name and address below, and the
    // share link above opens the exact pin.
    lat: null,
    lng: null,
    mapsUrl: 'https://maps.app.goo.gl/Tjz5AUoYGQpeQwM99',
    placeId: '',
    mapEmbedUrl: '',
  },

  /* ---- Getting there and staying ------------------------------------------ */
  travel: {
    enabled: true,
    airport: 'Maharana Pratap Airport (UDR), 25 km, about 45 minutes',
    station: 'Udaipur City Railway Station, 6 km, about 20 minutes',
    hotels: [
      { name: 'Hotel Lake Haveli', phone: '+91 98765 43210', mapsUrl: '', note: 'Rooms held under "Singhvi–Jaroli"' },
      { name: 'The Gangaur Palace', phone: '+91 98765 43211', mapsUrl: '', note: '10 minutes from the mandap' },
    ],
    parking: 'Valet parking at the City Palace gate from 5 PM.',
  },

  /* ---- Look and feel ------------------------------------------------------
   * Change any colour here and the whole site repaints. These are also the
   * colour pickers in the Content Studio.
   * ------------------------------------------------------------------------ */
  theme: {
    colors: {
      sindoor: '#B3141F',
      velvet: '#5E0B15',
      'velvet-deep': '#2E0509',
      wine: '#7A3E48',
      'gold-1': '#F8E7A8',
      'gold-2': '#D4AF37',
      'gold-3': '#8A6A1C',
      ivory: '#FFF8EC',
      champagne: '#F3E3C3',
      petal: '#F2B8BE',
      marigold: '#F5A623',
      ink: '#3A1A1A',
      rose: '#A8545F',
    },
    fonts: { display: 'Playfair Display', body: 'Cormorant Garamond', script: 'Bonheur Royale' },
    petals: { enabled: true, density: 'medium', colors: ['#F2B8BE', '#F5D7AE', '#D4AF37', '#F7E3E6'] },
  },

  /* ---- Link previews and search ------------------------------------------- */
  seo: {
    title: 'Vaibhav & Priyal, 31 January 2027, Udaipur',
    description:
      'With the blessings of our families, we invite you to our wedding at Monsoon Resort, Udaipur. Tap to open the invitation.',
    ogImage: '/og.png',
    // Set this to your real domain before you deploy — it makes the WhatsApp preview work.
    siteUrl: 'https://vaibhavweddspriyal.in',
  },

  /* ---- Turn whole sections on and off -------------------------------------- */
  features: {
    reactions: true,
    // Needs somewhere to store messages, so it is off in this no-backend build.
    guestWishes: false,
    countdown: true,
    story: true,
    gallery: true,
    shagun: false,
    share: true,
    analytics: false,
  },
};

export default wedding;
