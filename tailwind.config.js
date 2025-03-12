/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "lato": ['Lato', 'sans-serif'],
        "roboto": ['Roboto', 'serif'],
        "quicksand": ['Quicksand', 'sans-serif']
    }
    },
  },
  plugins: [],
}

