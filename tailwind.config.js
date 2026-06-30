/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"hoefler-text"', 'serif'],
      },
      colors: {
        primary: '#EE3625',
        pink: '#FFB4C5',
        cream: '#FFF7EF',
        maroon: '#5B1A1D',
      },
    },
  },
  plugins: [],
};
