/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/flowbite-react/**/*.{js,ts,jsx,tsx}',
    './node_modules/flowbite/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#F97316',
          orangeDark: '#EA580C',
          orangeLight: '#FFF7ED',
          green: '#22C55E',
          greenDark: '#16A34A',
          greenLight: '#DCFCE7',
          cream: '#FFF7ED',
          ink: '#111827',
          muted: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '22px',
      },
      boxShadow: {
        'soft': '0 10px 30px rgba(17, 24, 39, 0.08)',
        'lift': '0 18px 50px rgba(17, 24, 39, 0.12)',
      },
    },
  },
  plugins: [require('flowbite/plugin')],
};
