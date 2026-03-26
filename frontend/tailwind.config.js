/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        primary: "hsl(var(--primary))",
        accent: "hsl(var(--accent))",
      },
      animation: {
        "portal-pulse": "portal-pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "portal-pulse": {
          "0%, 100%": { opacity: 0.1, transform: "scale(1)" },
          "50%": { opacity: 0.3, transform: "scale(1.1)" },
        },
      },
    },
  },
  plugins: [],
}
