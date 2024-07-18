/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': '#5C8490',
        'custom-blue-dark': '#486b70',
      },
    },
  },
  plugins: [],
}
