/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#f7f8fc',
          panel: '#ffffff',
          rail: '#fbfcff',
          line: '#dfe4ef',
          soft: '#f0f2f8',
          muted: '#64708b',
          navy: '#111a3a',
          purple: '#5138b9',
          purpleDark: '#3b268f',
          purpleSoft: '#eeeaff',
          green: '#11966e',
          greenSoft: '#dcf8ec',
          amber: '#b87505',
          amberSoft: '#fff3cd',
          red: '#c73548',
          redSoft: '#ffe5e9',
          blue: '#1d5ed8',
          blueSoft: '#e7f0ff',
        },
      },
      boxShadow: {
        panel: '0 10px 30px rgba(17, 24, 39, 0.06)',
        soft: '0 1px 2px rgba(17, 24, 39, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', '"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        dashboard: '116rem',
      },
    },
  },
  plugins: [],
};
