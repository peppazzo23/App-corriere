/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'giuseppe-yellow': '#FFD700',
        'giuseppe-dark': '#0D1B2A',
        'giuseppe-bg': '#F8F9FA',
      }
    },
  },
  plugins: [],
}
