/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-wa-bg', 'bg-wa-card', 'bg-wa-accent', 'bg-wa-accent-lt', 'bg-wa-accent-pale',
    'text-wa-text', 'text-wa-dim', 'text-wa-accent', 'text-wa-accent-lt', 'text-wa-accent-pale',
    'border-wa-accent', 'border-wa-accent-lt', 'border-wa-accent-pale',
    'hover:bg-wa-accent', 'hover:bg-wa-accent-lt',
    'hover:text-wa-text', 'hover:text-wa-dim',
    'hover:border-wa-accent-lt',
  ],
  theme: {
    extend: {
      colors: {
        'wa-bg':          '#384959',
        'wa-card':        '#2e3d4a',
        'wa-accent':      '#6A89A7',
        'wa-accent-lt':   '#88BDF2',
        'wa-accent-pale': '#BDDDFC',
        'wa-text':        '#f0f4f8',
        'wa-dim':         '#6A89A7',
      }
    }
  },
  plugins: [],
}