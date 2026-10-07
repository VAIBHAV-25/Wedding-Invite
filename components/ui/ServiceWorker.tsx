'use client';

import { useEffect } from 'react';

/** Registers the shell cache, after the page has finished its own work. */
export function ServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;
    // Wait for load so registration never competes with the first paint.
    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Blocked (private mode, or an unsupported in-app browser) — the site
        // works exactly the same, just without the offline shell.
      });
    };
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }, []);
  return null;
}
