/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Public Sans"', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'Menlo', 'monospace']
      },
      colors: {
        app: '#F7F6F3',
        canvas: '#EFEDE8',
        ink: '#14151A',
        accent: {
          DEFAULT: 'oklch(0.55 0.15 255)',
          dark: 'oklch(0.50 0.15 255)',
          darker: 'oklch(0.40 0.15 255)',
          light: 'oklch(0.90 0.05 255)',
          lighter: 'oklch(0.93 0.04 255)',
          lightest: 'oklch(0.96 0.02 255)'
        },
        good: {
          text: 'oklch(0.44 0.12 152)',
          soft: 'oklch(0.95 0.04 152)',
          bar: 'oklch(0.62 0.15 152)'
        },
        warn: {
          text: 'oklch(0.47 0.14 62)',
          soft: 'oklch(0.96 0.04 62)',
          bar: 'oklch(0.70 0.15 62)'
        },
        danger: 'oklch(0.55 0.19 25)'
      },
      borderRadius: {
        xs: '7px',
        sm: '10px',
        md: '14px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px'
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,.05)'
      },
      keyframes: {
        pop: {
          from: { transform: 'scale(.94)', opacity: 0 },
          to: { transform: 'scale(1)', opacity: 1 }
        }
      },
      animation: {
        pop: 'pop .26s ease-out'
      }
    }
  },
  plugins: []
}
