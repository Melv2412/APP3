/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs primaires (vert) - ASIKO
        'primary-green': '#00A651',
        'dark-green': '#008040',
        'light-green': '#B8E6B8',
        
        // Couleurs sémantiques
        'asiko-red': '#FF0000',      // Alerts, Risque
        'asiko-blue': '#0066FF',     // Highlights, Active states
        'asiko-yellow': '#FFCC00',   // Warning
        'asiko-green-light': '#90EE90', // Success
        
        // Neutres
        'asiko-gray-light': '#F5F5F5',
        'asiko-gray': '#CCCCCC',
        'asiko-gray-dark': '#666666',
      },
      fontFamily: {
        sans: ['system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        // Titre principal : 24-32px
        'heading-xl': '32px',
        'heading-lg': '24px',
        // Sous-titres : 18-20px
        'heading-md': '20px',
        'heading-sm': '18px',
        // Corps : 14-16px
        'body-lg': '16px',
        'body-md': '14px',
        'body-sm': '12px',
        // Boutons : 16px (utiliser body-lg)
      },
      fontWeight: {
        'normal': '400',
        'semibold': '600',
        'bold': '700',
      },
      borderRadius: {
        'asiko': '8px',    // Boutons principaux
        'asiko-lg': '12px', // Cards
      },
    },
  },
  plugins: [],
}
