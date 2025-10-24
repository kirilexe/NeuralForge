/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/components/!(header)/**/*.{js,ts,jsx,tsx}",
    "./src/contexts/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false, // This prevents Tailwind from resetting CSS
  },
  theme: {
    extend: {},
  },
  plugins: [],
}