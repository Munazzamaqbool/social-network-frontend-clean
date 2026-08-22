/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        barbie: {
          light: '#ffb6c1',
          DEFAULT: '#e91e63',
          dark: '#c2185b',
        },
        darkbg: '#1e1e2e',
        darkcard: '#2d2d44',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}