'use client';

import { useEffect, useState } from 'react';
import { music, readMuted } from '@/lib/audio';

/**
 * The floating mute control. Shows an animated equaliser while a track is
 * playing and a crossed speaker when it is not, and remembers the choice.
 */
export function SoundButton({ hasTrack }: { hasTrack: boolean }) {
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setMuted(readMuted());
    return music.subscribe(setPlaying);
  }, []);

  if (!hasTrack) return null;

  const on = playing && !muted;

  return (
    <button
      type="button"
      className="float-btn sound-btn"
      data-on={on}
      onClick={() => setMuted(music.toggleMute())}
      aria-pressed={muted}
      aria-label={muted ? 'Turn the music on' : 'Turn the music off'}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        {on ? (
          <g className="eq">
            <rect x="5" y="9" width="2.4" height="6" rx="1.2" />
            <rect x="10.8" y="5" width="2.4" height="14" rx="1.2" />
            <rect x="16.6" y="8" width="2.4" height="8" rx="1.2" />
          </g>
        ) : (
          <g>
            <path d="M4 9.5h3.2L12 5.5v13L7.2 14.5H4z" />
            <path d="M16 9l5 6M21 9l-5 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </button>
  );
}
