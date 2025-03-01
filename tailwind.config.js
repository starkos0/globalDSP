/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';
module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'], // Configura Poppins como la fuente predeterminada
        title: ['Satoshi', 'sans-serif'], // Configura Satoshi como la fuente para títulos
      },
      borderRadius: {
        DEFAULT: '0.125rem', // Cambia el valor predeterminado a rounded-sm
      },
    },
  }
};
