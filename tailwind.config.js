/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'meituan-orange': '#FF6B35',
        'meituan-navy': '#1A1A2E',
        'meituan-navy-light': '#252542',
        'success-green': '#10B981',
        'error-red': '#EF4444',
        'warning-amber': '#F59E0B',
        'info-blue': '#3B82F6',
      },
      screens: {
        'xs': '320px',
        'sm': '360px',
        'md': '640px',
        'lg': '1024px',
        'xl': '1280px',
      },
    },
  },
  plugins: [],
}
