import type { Config } from "tailwindcss";

import { withUt } from "uploadthing/tw";
const config: Config = withUt({
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dominant: {
          DEFAULT: "var(--dominant)",
          100: "var(--dominant-100)",
          200: "var(--dominant-200)",
          300: "var(--dominant-300)",
          400: "var(--dominant-400)",
          500: "var(--dominant-500)",
          600: "var(--dominant-600)",
          700: "var(--dominant-700)",
          800: "var(--dominant-800)",
          900: "var(--dominant-900)",
        },
        complementary: {
          DEFAULT: "var(--complementary)",
          100: "var(--complementary-100)",
          200: "var(--complementary-200)",
          300: "var(--complementary-300)",
          400: "var(--complementary-400)",
          500: "var(--complementary-500)",
          600: "var(--complementary-600)",
          700: "var(--complementary-700)",
          800: "var(--complementary-800)",
          900: "var(--complementary-900)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          100: "var(--accent-100)",
          200: "var(--accent-200)",
          300: "var(--accent-300)",
          400: "var(--accent-400)",
          500: "var(--accent-500)",
          600: "var(--accent-600)",
          700: "var(--accent-700)",
          800: "var(--accent-800)",
          900: "var(--accent-900)",
        },
      },
    },
  },
  plugins: [],
});

export default config;
