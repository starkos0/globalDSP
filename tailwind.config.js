/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui"
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Poppins', 'sans-serif'], // Configura Poppins como la fuente predeterminada
        'title': ['Satoshi', 'sans-serif'], // Configura Satoshi como la fuente para títulos
      },     
      borderRadius: {
        DEFAULT: '0.125rem', // Cambia el valor predeterminado a rounded-sm
      },
    },
  },
  plugins: [
    daisyui
  ],
  daisyui: {
    themes: [
      {
        dark: {
          "primary": "#989898",
          "primary-focus": "#4506cb",
          "primary-content": "#ffffff",
          "secondary": "#f000b8",
          "secondary-focus": "#bd0091",
          "secondary-content": "#ffffff",
          "accent": "#37cdbe",
          "accent-focus": "#2aa79b",
          "accent-content": "#ffffff",
          "neutral": "#3d4451",
          "neutral-focus": "#2a2e37",
          "neutral-content": "#ffffff",
          "base-100": "#0e1015",
          "base-200": "#272a30",
          "base-300": "#080807",
          "base-content": "#E1D5CD",
          "info": "#2094f3",
          "success": "#009485",
          "warning": "#ff9900",
          "error": "#ff5724",
          "fontFamily": {
            'body': ['Poppins', 'sans-serif'],
            'display': ['Satoshi', 'sans-serif'],
          }
        },
      },
      // otros temas que desees mantener
      'light',
    ],
  },
}