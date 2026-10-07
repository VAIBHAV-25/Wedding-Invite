import { audioContext, music } from './audio';

/**
 * The small interaction sounds are synthesised rather than shipped as files.
 * It keeps the payload at zero bytes, works offline, and means there is no
 * licensed audio to clear.
 *
 * All of them respect the mute button.
 */

function canPlay(): AudioContext | null {
  if (music.isMuted) return null;
  const c = audioContext();
  if (!c || c.state !== 'running') return null;
  return c;
}

function envelope(c: AudioContext, node: AudioNode, peak: number, attack: number, decay: number) {
  const g = c.createGain();
  const t = c.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  node.connect(g).connect(c.destination);
  return { gain: g, stopAt: t + attack + decay + 0.05 };
}

/** A short filtered noise burst — the sound of wax giving way. */
export function playCrack(): void {
  const c = canPlay();
  if (!c) return;
  const len = Math.floor(c.sampleRate * 0.22);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    // Decaying noise, denser at the start, with a couple of sharp ticks.
    const decay = (1 - i / len) ** 3;
    data[i] = (Math.random() * 2 - 1) * decay;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1800;
  filter.Q.value = 0.8;
  src.connect(filter);
  const { stopAt } = envelope(c, filter, 0.35, 0.004, 0.2);
  src.start();
  src.stop(stopAt);
}

/** Two sine partials a fifth apart — a soft temple-bell chime. */
export function playChime(base = 880): void {
  const c = canPlay();
  if (!c) return;
  [1, 1.5, 2.67].forEach((ratio, i) => {
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = base * ratio;
    const { stopAt } = envelope(c, osc, 0.14 / (i + 1), 0.01, 1.1 + i * 0.2);
    osc.start();
    osc.stop(stopAt);
  });
}

/** A quick low thump under the confetti. */
export function playDhol(): void {
  const c = canPlay();
  if (!c) return;
  const osc = c.createOscillator();
  osc.type = 'sine';
  const t = c.currentTime;
  osc.frequency.setValueAtTime(180, t);
  osc.frequency.exponentialRampToValueAtTime(48, t + 0.18);
  const { stopAt } = envelope(c, osc, 0.4, 0.005, 0.22);
  osc.start();
  osc.stop(stopAt);
}

let lastTick = 0;
/** Throttled scratch tick — fires at most every 90 ms. */
export function playScratchTick(): void {
  const now = Date.now();
  if (now - lastTick < 90) return;
  lastTick = now;
  const c = canPlay();
  if (!c) return;
  const len = Math.floor(c.sampleRate * 0.03);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 3000;
  src.connect(filter);
  const { stopAt } = envelope(c, filter, 0.06, 0.003, 0.025);
  src.start();
  src.stop(stopAt);
}

/** Light haptic feedback where the device supports it. */
export function buzz(pattern: number | number[] = 12): void {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported — no fallback needed */
  }
}
