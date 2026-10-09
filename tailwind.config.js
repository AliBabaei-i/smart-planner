/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ✅ رنگ blue به CSS Variable وصل شد
        blue: {
          50: 'var(--color-blue-50, #eff6ff)',
          100: 'var(--color-blue-100, #dbeafe)',
          200: 'var(--color-blue-200, #bfdbfe)',
          300: 'var(--color-blue-300, #93c5fd)',
          400: 'var(--color-blue-400, #60a5fa)',
          500: 'var(--color-blue-500, #3b82f6)',
          600: 'var(--color-blue-600, #2563eb)',
          700: 'var(--color-blue-700, #1d4ed8)',
          800: 'var(--color-blue-800, #1e40af)',
          900: 'var(--color-blue-900, #1e3a8a)',
        },
        // ✅ primary هم به همون متغیرها
        primary: {
          50: 'var(--color-blue-50, #eff6ff)',
          100: 'var(--color-blue-100, #dbeafe)',
          200: 'var(--color-blue-200, #bfdbfe)',
          300: 'var(--color-blue-300, #93c5fd)',
          400: 'var(--color-blue-400, #60a5fa)',
          500: 'var(--color-blue-500, #3b82f6)',
          600: 'var(--color-blue-600, #2563eb)',
          700: 'var(--color-blue-700, #1d4ed8)',
          800: 'var(--color-blue-800, #1e40af)',
          900: 'var(--color-blue-900, #1e3a8a)',
        }
      },
      fontFamily: {
        sans: ['Vazirmatn', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}