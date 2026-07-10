export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        terracota: {
          50: '#FDF7F4',
          100: '#FBECE5',
          200: '#F6D2C2',
          300: '#EEAD92',
          400: '#E47F58',
          500: '#D97A4D', // Primária
          600: '#C56235',
          700: '#A44E28',
          800: '#843F22',
          900: '#6C351D',
          950: '#3D1B0E',
        },
        mostarda: {
          50: '#FEFAF0',
          100: '#FDF2D9',
          200: '#FAE1AE',
          300: '#F6CC7B',
          400: '#F1B34E',
          500: '#E8B84B', // Secundária
          600: '#CD9231',
          700: '#AA7126',
          800: '#885822',
          900: '#70481F',
          950: '#41270E',
        },
        ardosia: {
          50: '#F5F8F8',
          100: '#EBF2F2',
          200: '#CCE0E0',
          300: '#9EC1C1',
          400: '#6C9E9E',
          500: '#4A7C7C', // Apoio Frio
          600: '#3B6666',
          700: '#325353',
          800: '#2C4747',
          900: '#283E3E',
          950: '#142323',
        },
        warmBg: {
          50: '#FCFAF7',
          100: '#FAF6F0', // Fundo Claro
          250: '#F3EDE2',
          300: '#E9DEC9',
          400: '#D2C1A5',
          500: '#BCA383',
          650: '#947D61',
          700: '#7C674E',
          800: '#524434',
          900: '#352C22',
          950: '#211A16', // Fundo Escuro
        },
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['Poppins', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
