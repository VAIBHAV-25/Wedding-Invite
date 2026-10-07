'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { buzz } from '@/lib/sfx';

const EMOJI = ['🪔', '🌸', '💛', '🎉', '🙏', '😍'];
const MAX_ACTIVE = 25;

interface Floater {
  id: number;
  emoji: string;
  left: number;
  drift: number;
  scale: number;
  duration: number;
}

/**
 * Tapping an emoji sends it drifting up the screen.
 *
 * Purely local — with no backend there is no shared counter, so this is the
 * guest's own small gesture rather than a number that climbs.
 */
export function Reactions({ enabled }: { enabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const nextId = useRef(0);
  const lastSpawn = useRef(0);

  const spawn = useCallback((emoji: string) => {
    const now = Date.now();
    // Throttle, so holding a finger down cannot flood the screen.
    if (now - lastSpawn.current < 110) return;
    lastSpawn.current = now;

    const f: Floater = {
      id: nextId.current++,
      emoji,
      left: 6 + Math.random() * 16,
      drift: (Math.random() - 0.5) * 70,
      scale: 0.85 + Math.random() * 0.5,
      duration: 2600 + Math.random() * 1400,
    };
    setFloaters((cur) => [...cur.slice(-(MAX_ACTIVE - 1)), f]);
    buzz(8);
    window.setTimeout(() => {
      setFloaters((cur) => cur.filter((x) => x.id !== f.id));
    }, f.duration + 100);
  }, []);

  // Stop everything while the tab is away.
  useEffect(() => {
    const onHide = () => {
      if (document.hidden) setFloaters([]);
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div className="floaters" aria-hidden="true">
        {floaters.map((f) => (
          <span
            key={f.id}
            style={{
              left: `${f.left}%`,
              ['--drift' as string]: `${f.drift}px`,
              ['--scale' as string]: f.scale,
              animationDuration: `${f.duration}ms`,
            }}
          >
            {f.emoji}
          </span>
        ))}
      </div>

      <div className="reaction-bar" data-open={open}>
        {open &&
          EMOJI.map((e) => (
            <button key={e} type="button" className="reaction" onClick={() => spawn(e)} aria-label={`Send ${e}`}>
              {e}
            </button>
          ))}
        <button
          type="button"
          className="float-btn reaction-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? 'Hide reactions' : 'Send a reaction'}
        >
          {open ? '×' : '💛'}
        </button>
      </div>
    </>
  );
}
