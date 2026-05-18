/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-purple': '#6B21A8',
        'dark-blue': '#1E3A8A',
        'midnight': '#0F172A',
        'midnight-light': '#1E293B',
      },
      screens: {
        'xs': '320px',
        'sm': '360px',
        'md': '640px',
        'lg': '1024px',
        'xl': '1280px',
      },
      fontSize: {
        'xs-mobile': '11px',
        'sm-mobile': '13px',
        'base-mobile': '15px',
      },
    },
  },
  plugins: [],
}
