import type { Track } from './types';

/**
 * One AudioContext for the whole site, shared by the music player and the
 * small synthesised UI sounds.
 *
 * Nothing here makes a sound until `unlock()` is called from inside a real tap
 * handler — that is what mobile browsers require, and the envelope tap is it.
 */

let ctx: AudioContext | null = null;

export function audioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  return ctx;
}

const MUTE_KEY = 'mewar:muted';

export function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? '1' : '0');
  } catch {
    /* private mode — the preference just won't survive a reload */
  }
}

class MusicPlayer {
  private el: HTMLAudioElement | null = null;
  private gain: GainNode | null = null;
  private track: Track | null = null;
  private muted = false;
  /** Set while a video is playing, so music sits under it instead of fighting it. */
  private ducked = false;
  private started = false;
  private listeners = new Set<(playing: boolean) => void>();

  get isMuted(): boolean {
    return this.muted;
  }

  get hasTrack(): boolean {
    return Boolean(this.track?.src);
  }

  subscribe(fn: (playing: boolean) => void): () => void {
    this.listeners.add(fn);
    // Hand the current state straight to a listener that arrives late. The
    // sound button only mounts once the envelope has finished opening, which
    // is seconds after the tap that started the music, so without this it
    // never hears the one emit that mattered and sits on its initial value.
    fn(this.playingNow);
    return () => this.listeners.delete(fn);
  }

  private get playingNow(): boolean {
    return this.started && !this.muted && this.hasTrack;
  }

  private emit(): void {
    const playing = this.playingNow;
    this.listeners.forEach((fn) => fn(playing));
  }

  /** The target gain right now, before any fade. */
  private get targetVolume(): number {
    if (!this.track || this.muted) return 0;
    return this.track.volume * (this.ducked ? 0.3 : 1);
  }

  private ramp(to: number, seconds: number): void {
    const c = audioContext();
    if (!c || !this.gain) return;
    const now = c.currentTime;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(this.gain.gain.value, now);
    // An exponential ramp sounds natural but cannot reach exactly zero.
    this.gain.gain.linearRampToValueAtTime(Math.max(to, 0.0001), now + Math.max(seconds, 0.01));
  }

  load(track: Track): void {
    if (!track.src) {
      this.track = null;
      return;
    }
    if (this.track?.id === track.id && this.el) {
      this.track = track;
      return;
    }
    this.track = track;
    const el = new Audio(track.src);
    el.loop = false; // looping is handled manually so the trim points are respected
    el.preload = 'metadata';
    el.crossOrigin = 'anonymous';
    // iOS treats audio elements with this attribute as non-fullscreen media.
    el.setAttribute('playsinline', '');
    this.el = el;

    el.addEventListener('timeupdate', () => this.enforceTrim());
    el.addEventListener('ended', () => this.restart());
  }

  /** Keeps playback inside [startSec, endSec] and loops with a short fade. */
  private enforceTrim(): void {
    const el = this.el;
    const t = this.track;
    if (!el || !t) return;
    const end = t.endSec > 0 ? t.endSec : el.duration;
    if (!Number.isFinite(end)) return;
    const remaining = end - el.currentTime;
    if (remaining <= t.fadeOutSec && remaining > 0) {
      this.ramp(0, remaining);
    }
    if (el.currentTime >= end - 0.05) this.restart();
  }

  /**
   * Seeking a media element that has no metadata yet throws, so this waits
   * for the element to know its own duration before moving the playhead.
   */
  private seekToStart(): void {
    const el = this.el;
    const t = this.track;
    if (!el || !t || t.startSec <= 0) return;
    const apply = () => {
      try {
        el.currentTime = t.startSec;
      } catch {
        /* still not ready; leaving it at zero is harmless */
      }
    };
    if (el.readyState >= 1) apply();
    else el.addEventListener('loadedmetadata', apply, { once: true });
  }

  private restart(): void {
    const el = this.el;
    const t = this.track;
    if (!el || !t) return;
    this.seekToStart();
    this.ramp(this.targetVolume, Math.min(t.fadeInSec, 1.2));
    if (!el.paused) return;
    void el.play().catch(() => undefined);
  }

  /**
   * Call from inside a tap handler. Safe to call more than once.
   *
   * Order matters more than it looks. A tap grants transient user activation,
   * and that activation is spent by the first `await`. Resuming the
   * AudioContext first and only then calling play() meant play() was no
   * longer running inside the gesture, and Chrome refused it — so the music
   * never started for anyone. Everything up to play() is now synchronous, and
   * the resume is fired off without waiting on it.
   */
  async unlock(): Promise<void> {
    const el = this.el;
    const t = this.track;
    this.muted = readMuted();
    if (!el || !t) {
      this.started = true;
      this.emit();
      return;
    }

    const c = audioContext();
    if (c && !this.gain) {
      try {
        const source = c.createMediaElementSource(el);
        this.gain = c.createGain();
        this.gain.gain.value = 0.0001;
        source.connect(this.gain).connect(c.destination);
      } catch {
        // Already routed, or the graph could not be built: fall back to the
        // element's own volume.
        this.gain = null;
      }
    }
    if (!this.gain) el.volume = this.targetVolume;

    const playing = el.play();
    if (c && c.state === 'suspended') void c.resume().catch(() => undefined);

    try {
      await playing;
      this.started = true;
      this.seekToStart();
      this.ramp(this.targetVolume, t.fadeInSec);
    } catch {
      this.started = false;
    }
    this.emit();
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    writeMuted(this.muted);
    if (this.el && !this.gain) this.el.volume = this.targetVolume;
    this.ramp(this.targetVolume, this.muted ? 0.4 : 0.8);
    if (!this.muted && this.el?.paused && this.started) void this.el.play().catch(() => undefined);
    this.emit();
    return this.muted;
  }

  setDucked(ducked: boolean): void {
    this.ducked = ducked;
    this.ramp(this.targetVolume, 0.5);
  }

  /** Pause when the tab goes away, resume when it comes back. */
  handleVisibility(hidden: boolean): void {
    const el = this.el;
    if (!el || !this.started || this.muted) return;
    if (hidden) {
      this.ramp(0, 0.3);
      window.setTimeout(() => {
        if (document.hidden) el.pause();
      }, 320);
    } else {
      void el.play().catch(() => undefined);
      this.ramp(this.targetVolume, 0.8);
    }
  }
}

export const music = new MusicPlayer();
