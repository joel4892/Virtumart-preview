import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          600: '#6D28D9'
        }
      }
    },
  },
  plugins: [],
}
export default config