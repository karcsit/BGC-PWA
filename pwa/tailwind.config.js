/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-purple': '#9333ea',
        'primary-indigo': '#4f46e5',
      }
    },
  },
  plugins: [],
}
