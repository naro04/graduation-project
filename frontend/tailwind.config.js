/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        'primary': '#00564F',
        'primary-light': '#005D55',
        'border-teal': 'rgba(28, 137, 154, 0.7)',
      }
    },
  },
  plugins: [],
}

