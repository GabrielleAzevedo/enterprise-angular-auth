/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4B3F72',
          light: '#F5F3FF',
          dark: '#2D2A32',
        },
        accent:{
          DEFAULT: '#B86B2E',
          hover: '#A65E28',
        },
        background: '#F5F5F5',   
      },
      fontFamily: {
        sans: ['Figtree', 'sans-serif'],
        logo: ['Zain', 'sans-serif'],
      },
      letterSpacing: {
        logo: '0.07em',
      },
    },
  },
  plugins: [],
}