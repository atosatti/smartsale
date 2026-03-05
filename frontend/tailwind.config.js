/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066ff',
        secondary: '#00b4d8',
        success: '#06d6a0',
        warning: '#ffd60a',
        error: '#ef476f',
      },
    },
  },
  plugins: [],
};
