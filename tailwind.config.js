/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f6f2ea',
        ink: '#1f1c18',
        taupe: '#d8d0c2',
        mist: '#efebe4',
      },
      fontFamily: {
        serif: ['Lora', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 10px 25px rgba(31, 28, 24, 0.06)',
      },
    },
  },
  plugins: [],
};
