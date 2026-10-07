import type { Config } from 'tailwindcss';

/**
 * Colours are declared as CSS custom properties in app/globals.css so the admin
 * panel can repaint the whole site at runtime. Tailwind only references them.
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './config/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sindoor: 'var(--sindoor)',
        velvet: 'var(--velvet)',
        'velvet-deep': 'var(--velvet-deep)',
        wine: 'var(--wine)',
        'gold-1': 'var(--gold-1)',
        'gold-2': 'var(--gold-2)',
        'gold-3': 'var(--gold-3)',
        ivory: 'var(--ivory)',
        champagne: 'var(--champagne)',
        petal: 'var(--petal)',
        marigold: 'var(--marigold)',
        ink: 'var(--ink)',
        rose: 'var(--rose)',
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
        script: 'var(--font-script)',
        caps: 'var(--font-caps)',
        deva: 'var(--font-deva)',
      },
      transitionTimingFunction: {
        royal: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      maxWidth: {
        reel: '440px',
      },
    },
  },
  plugins: [],
};

export default config;
