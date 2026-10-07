import { wedding as defaults } from '@/config/wedding.config';
import type { PartialConfig, WeddingConfig } from './types';

export const DRAFT_KEY = 'mewar:draft';

type Plain = Record<string, unknown>;

function isPlainObject(v: unknown): v is Plain {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Deep-merges a draft over the committed config.
 *
 * Arrays are replaced wholesale rather than merged, because reordering events
 * or photos has to actually reorder them. A missing or malformed key always
 * falls back to the committed value, so a half-finished draft can never leave
 * a section blank.
 */
export function mergeConfig(base: WeddingConfig, patch: unknown): WeddingConfig {
  if (!isPlainObject(patch)) return base;
  const out: Plain = { ...(base as unknown as Plain) };
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || value === null) continue;
    const current = out[key];
    out[key] = isPlainObject(current) && isPlainObject(value) ? mergeConfig(current as never, value) : value;
  }
  return out as unknown as WeddingConfig;
}

/** The config as committed, with no draft applied. */
export function baseConfig(): WeddingConfig {
  return defaults;
}

/** Reads the Content Studio draft out of this browser, if there is one. */
export function readDraft(): PartialConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as PartialConfig) : null;
  } catch {
    return null;
  }
}

export function writeDraft(patch: PartialConfig): boolean {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(patch));
    return true;
  } catch {
    return false;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* nothing to clear */
  }
}

/** Events, filtered to the visible ones and sorted the way the couple set them. */
export function visibleEvents(config: WeddingConfig) {
  return config.events.filter((e) => e.visible).sort((a, b) => a.order - b.order);
}

/** The track the site should load, or null when music is switched off. */
export function activeTrack(config: WeddingConfig) {
  const t = config.music.tracks.find((x) => x.id === config.music.defaultTrackId);
  return t && t.src ? t : null;
}
