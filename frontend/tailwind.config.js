import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      "light", // White background (default in DaisyUI)
      {
        dark: {
          // Customized 'dark' theme for a true black background
          "primary": "#3b82f6", // Blue for buttons, chat bubbles, etc.
          "base-100": "#000000", // Black background
          "base-200": "#1a1a1a", // Slightly lighter black for contrast
          "base-300": "#333333", // Even lighter for borders, etc.
          "base-content": "#ffffff", // White text for readability
          "neutral": "#1a1a1a",
          "--rounded-box": "0.5rem", // Rounded corners for elements
          "--rounded-btn": "0.5rem", // Rounded corners for buttons
        },
      },
      {
        corporate: {
          // Customized 'corporate' theme for a grey background
          "primary": "#3b82f6", // Keep the same blue for consistency
          "base-100": "#d1d5db", // Light grey background
          "base-200": "#9ca3af", // Medium grey for contrast (e.g., chat bubble background)
          "base-300": "#6b7280", // Darker grey for borders, etc.
          "base-content": "#1f2937", // Dark text for readability on grey background
          "neutral": "#9ca3af",
          "--rounded-box": "0.5rem",
          "--rounded-btn": "0.5rem",
        },
      },
      "cupcake",
      "bumblebee",
      "emerald",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black", // Optional, can remove if not needed
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
      "dim",
      "nord",
      "sunset",
    ],
    darkTheme: "dark", // Use the customized 'dark' theme for system dark mode
  },
};