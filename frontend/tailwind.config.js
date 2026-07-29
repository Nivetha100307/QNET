/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        quantum: {
          dark: '#0B0F19',
          card: '#131B2E',
          border: '#1E293B',
          cyan: '#06B6D4',
          emerald: '#10B981',
          violet: '#8B5CF6',
          rose: '#F43F5E',
          amber: '#F59E0B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      }
    },
  },
  plugins: [],
}
