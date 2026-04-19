/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0f1419',
          900: '#1a1f2e',
          800: '#2a3142',
          700: '#3a4252',
        },
        accent: {
          blue: '#3b82f6',
          green: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444',
        },
      },
      boxShadow: {
        // Depth layers for card UI
        'sm-depth': '0 2px 8px rgba(0, 0, 0, 0.12)',
        'md-depth': '0 8px 16px rgba(0, 0, 0, 0.15)',
        'lg-depth': '0 12px 32px rgba(0, 0, 0, 0.2)',
        'xl-depth': '0 20px 48px rgba(0, 0, 0, 0.25)',
        
        // Glass effect shadows
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
        'glass-hover': '0 12px 48px rgba(31, 38, 135, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'float': 'float 3s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { 
            opacity: '0', 
            transform: 'translateY(20px)' 
          },
          '100%': { 
            opacity: '1', 
            transform: 'translateY(0)' 
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
      spacing: {
        'safe': 'max(1rem, env(safe-area-inset-bottom))',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
