/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1B2420',
        paper: '#F6F5F0',
        panel: '#FFFFFF',
        line: '#E4E1D6',
        forest: {
          50: '#EEF4F0',
          100: '#D6E5DA',
          300: '#8FB89D',
          500: '#2F6F5E',
          600: '#255A4C',
          700: '#1C463B',
          900: '#122E27',
        },
        ochre: {
          100: '#F6E4CE',
          400: '#D99A4E',
          500: '#C97D3B',
          600: '#A8632A',
        },
        rust: {
          100: '#F3DCD6',
          500: '#B85C4A',
          600: '#98452F',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(27,36,32,0.06), 0 1px 1px rgba(27,36,32,0.04)',
      },
    },
  },
  plugins: [],
};
