export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: {
          DEFAULT: 'rgb(var(--color-parchment) / <alpha-value>)',
          elevated: 'rgb(var(--color-parchment-elevated) / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(var(--color-ink) / <alpha-value>)',
          subtle: 'rgb(var(--color-ink-subtle))',
          muted: 'rgb(var(--color-ink-muted))',
        },
        'border-ledger': {
          DEFAULT: 'rgb(var(--color-border-ledger))',
          hover: 'rgb(var(--color-border-ledger-hover))',
        },
        stamp: {
          plum: 'rgb(var(--color-stamp-plum) / <alpha-value>)',
          wine: 'rgb(var(--color-stamp-wine) / <alpha-value>)',
          moss: 'rgb(var(--color-stamp-moss) / <alpha-value>)',
          gold: 'rgb(var(--color-stamp-gold) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        body: ['Work Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      borderRadius: {
        card: '10px',
        stamp: '50%',
      },
    },
  },
  plugins: [],
};
