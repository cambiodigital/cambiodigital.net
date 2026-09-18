/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './blog/**/*.html',
    './demos/**/*.html',
    './partials/**/*.html',
    './servicios/**/*.html',
    './pago/**/*.html',
    './assets/js/**/*.js'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        'cd-base': 'var(--cd-base, #0f172a)',
        'cd-base-dark': 'var(--cd-base-dark, #020617)',
        'cd-base-light': 'var(--cd-base-light, #1e293b)',
        'cd-base-lighter': 'var(--cd-base-lighter, #334155)',
        'cd-purple-dark': 'var(--cd-purple-dark, #1e1b4b)',
        'cd-purple-medium': 'var(--cd-purple-medium, #312e81)',
        'cd-purple-light': 'var(--cd-purple-light, #4338ca)',
        'cd-lavender': 'var(--cd-lavender, #6366f1)',
        'cd-magenta': 'var(--cd-magenta, #4f46e5)',
        'cd-highlight': 'var(--cd-highlight-color, #6366f1)',
        'cd-cream': 'var(--cd-cream, #f1f5f9)',
        'cd-dark-grey': 'var(--cd-dark-grey, #1a1a1a)',
        'cd-white': 'var(--cd-white, #ffffff)',
        'cd-surface': 'var(--cd-surface, #1e293b)',
        'cd-surface-hover': 'var(--cd-surface-hover, #334155)',
        'cd-border': 'var(--cd-border, rgba(255,255,255,0.08))',
        'cd-card-bg': 'var(--cd-card-bg, #1e293b)',
        'cd-card-text': 'var(--cd-card-text, #f1f5f9)',
        'cd-text-dim': 'var(--cd-text-dim, #64748b)',
        'cd-text-muted': 'var(--cd-text-muted, #cbd5e1)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    }
  },
  plugins: []
};
