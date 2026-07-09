/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      maxWidth: {
        workbench: '96rem'
      },
      colors: {
        canvas: {
          light: '#f4f4f4',
          dark: '#161616'
        },
        surface: {
          light: '#ffffff',
          dark: '#262626',
          raisedLight: '#e8e8e8',
          raisedDark: '#393939'
        },
        border: {
          subtle: '#d1d1d1',
          strong: '#8d8d8d'
        },
        texttone: {
          primaryLight: '#161616',
          primaryDark: '#f4f4f4',
          secondaryLight: '#525252',
          secondaryDark: '#c6c6c6'
        },
        brand: {
          400: '#4589ff',
          500: '#0f62fe',
          700: '#0043ce'
        },
        status: {
          success: '#24a148',
          successDark: '#42be65',
          warning: '#f1c21b',
          caution: '#ff832b',
          danger: '#da1e28',
          dangerDark: '#fa4d56',
          info: '#0043ce'
        }
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        panel: '0.75rem'
      },
      boxShadow: {
        panel: '0 1px 2px rgba(0,0,0,0.06), 0 6px 18px rgba(0,0,0,0.04)'
      }
    }
  },
  plugins: []
};
