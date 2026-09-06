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
        gym: {
          bg: '#090A0A',
          card: '#121417',
          cardHover: '#181B20',
          elevated: '#1F2228',
          border: '#242830',
          borderLight: '#323742',
          muted: '#8E95A5',
          text: '#F3F4F6',
          accent: '#CCFF00', // Athletic volt lime
          accentHover: '#B8E600',
          accentMuted: '#ccff001a',
          accentBorder: '#ccff004d',
          danger: '#FF453A',
          dangerMuted: '#ff453a20',
          success: '#30D158',
          warning: '#FF9F0A',
          blue: '#0A84FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Cabinet Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-accent': '0 0 20px -5px rgba(204, 255, 0, 0.35)',
        'glow-accent-sm': '0 0 10px -2px rgba(204, 255, 0, 0.25)',
      }
    },
  },
  plugins: [],
}
