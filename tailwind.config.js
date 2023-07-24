/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      transitionProperty: {
        right: "right",
      },
      colors: {
        primary: "#468B97",
        secondary: "#A4907C",
        tertiary: "#C8B6A6",
        bg: "#F4F2DE",
      },
    },
  },
  plugins: [],
};
