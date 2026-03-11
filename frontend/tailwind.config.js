/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        cyan: "0 0 0 1px rgba(6, 182, 212, 0.12), 0 24px 80px rgba(6, 182, 212, 0.12)"
      }
    }
  },
  plugins: []
};
