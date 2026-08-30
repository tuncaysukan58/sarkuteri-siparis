import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        delight: {
          50: '#fdf8f0',
          100: '#f9eedb',
          200: '#f2dab3',
          300: '#e9be81',
          400: '#df9e51',
          500: '#d78330',
          600: '#c86b24',
          700: '#a65120',
          800: '#854220',
          900: '#6c381d',
          950: '#3a1b0d',
        },
        gourmet: {
          green: '#1b4332',
          olive: '#2d6a4f',
          cream: '#fefae0',
          warm: '#dda15e',
          amber: '#bc6c25',
          dark: '#081c15',
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
export default config;
