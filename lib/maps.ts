import type { WeddingEvent, Venue } from './types';

type Place = Pick<WeddingEvent, 'lat' | 'lng' | 'mapsUrl' | 'placeId' | 'venueName' | 'address'>;

/**
 * Pulls coordinates out of a pasted Google Maps link so the couple can just
 * paste the share URL instead of hunting for latitude and longitude.
 * Handles the /@lat,lng,zoom form, the !3dlat!4dlng form, and ?q=lat,lng.
 */
export function parseLatLng(url: string): { lat: number; lng: number } | null {
  if (!url) return null;
  const patterns = [
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
    /[?&]q=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
    /[?&]destination=(-?\d+\.\d+),\s*(-?\d+\.\d+)/,
    /^\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)\s*$/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) {
      const lat = Number(m[1]);
      const lng = Number(m[2]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
    }
  }
  return null;
}

/** Event cards call the place `venueName`; the main venue calls it `name`. */
function label(place: Place | Venue): string {
  const name = 'venueName' in place ? place.venueName : place.name;
  return [name, place.address].filter(Boolean).join(', ');
}

function coords(place: Place | Venue): { lat: number; lng: number } | null {
  if (typeof place.lat === 'number' && typeof place.lng === 'number') {
    return { lat: place.lat, lng: place.lng };
  }
  return parseLatLng(place.mapsUrl);
}

/**
 * Turn-by-turn navigation starting from wherever the guest is standing.
 *
 * Leaving `origin` out is deliberate: Google Maps then uses the device's own
 * location, which means one tap goes straight into navigation without the site
 * ever asking for a location permission.
 */
export function directionsUrl(place: Place | Venue): string {
  const c = coords(place);
  const params = new URLSearchParams({ api: '1', travelmode: 'driving' });
  params.set('destination', c ? `${c.lat},${c.lng}` : label(place));
  if (place.placeId) params.set('destination_place_id', place.placeId);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/** iOS guests get an Apple Maps option alongside the Google one. */
export function appleMapsUrl(place: Place | Venue): string {
  const c = coords(place);
  const daddr = c ? `${c.lat},${c.lng}` : label(place);
  return `https://maps.apple.com/?daddr=${encodeURIComponent(daddr)}&dirflg=d`;
}

/** Straight-line distance in km — good enough for a "how far am I" chip. */
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function placeCoords(place: Place | Venue) {
  return coords(place);
}
