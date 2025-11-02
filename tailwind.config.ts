import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx,js,jsx}", "./components/**/*.{ts,tsx,js,jsx}", "./pages/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        'murder-black': '#0b0b0d',
        'murder-deep': '#121213',
        'blood-red': '#c62828',
        'muted-gray': '#9aa0a6',
      },
      backgroundImage: {
        'gradient-mystery': 'linear-gradient(135deg, rgba(11,11,13,1), rgba(18,18,19,1))',
        'gradient-danger': 'linear-gradient(135deg, rgba(198,40,40,1), rgba(175,30,30,1))',
      },
      boxShadow: {
        'glow-danger': '0 0 30px rgba(198,40,40,0.25)',
        'card': '0 10px 30px rgba(0,0,0,0.6)',
      },
      borderRadius: {
        'xl': '1rem'
      }
    },
  },
  plugins: []
} satisfies Config;
