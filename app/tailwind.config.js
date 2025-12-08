/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Rarity colors
        common: '#808080',
        rare: '#00BFFF',
        epic: '#9370DB',
        legendary: '#FFD700',
        mythic: '#FF1493',
        secret: '#FF4500',
        og: '#FF0000',
        brainrot_god: '#00FFFF',
        // Status colors for slot usage
        status: {
          low: '#22c55e',
          medium: '#eab308',
          high: '#f97316',
          critical: '#ef4444',
          full: '#991b1b',
        }
      }
    },
  },
  plugins: [],
}

