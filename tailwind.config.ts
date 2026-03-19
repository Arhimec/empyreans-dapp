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
        mvxborder: '#2a2a2c'
      },
    },
  },
  plugins:[],
};
export default config;
