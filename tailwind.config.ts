import type { Config } from "tailwindcss";

const config: Config = {
  content:[
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mvxdark: '#0a0a0a',
        mvxsurface: '#121212',
        mvxcard: '#1a1a1c',
        mvxteal: '#23f7dd',
        mvxblue: '#1446db',
        mvxpurple: '#6d28d9',
        mvxpink: '#db2777',
        mvxborder: '#2a2a2c',
        mvxgray: '#3a3a3c',
        mvxtext: '#e2e8f0',
        mvxmuted: '#94a3b8',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-glow": "radial-gradient(circle at 50% 50%, rgba(35, 247, 221, 0.15), transparent 70%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite alternate",
        "fade-in": "fade-in 0.5s ease-out forwards",
        "slide-up": "slide-up 0.5s ease-out forwards",
      },
      keyframes: {
        "glow-pulse": {
          "0%": { boxShadow: "0 0 5px rgba(35, 247, 221, 0.2), 0 0 10px rgba(35, 247, 221, 0.1)" },
          "100%": { boxShadow: "0 0 20px rgba(35, 247, 221, 0.6), 0 0 40px rgba(35, 247, 221, 0.3)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins:[],
};
export default config;

