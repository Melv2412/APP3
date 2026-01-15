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
        'primary-green': '#00A651',      // Vert principal médical
        'dark-green': '#008040',         // Vert foncé (hover, accents)
        'light-green': '#B8E6B8',       // Vert clair (fond, états)
        
        // Couleurs sémantiques - AMÉLIORÉES
        'asiko-red': '#DC2626',          // Rouge moins agressif (alerts, risque)
        'asiko-red-light': '#FEE2E2',    // Fond rouge clair pour alertes
        'asiko-blue': '#2563EB',         // Bleu plus professionnel (highlights, active states)
        'asiko-blue-light': '#DBEAFE',   // Fond bleu clair
        'asiko-yellow': '#F59E0B',       // Jaune plus doux (warning)
        'asiko-yellow-light': '#FEF3C7', // Fond jaune clair
        'asiko-green-light': '#10B981', // Vert succès moderne
        'asiko-green-success': '#D1FAE5', // Fond vert succès
        
        // Neutres - AMÉLIORÉES
        'asiko-gray-light': '#F9FAFB',   // Fond gris très clair
        'asiko-gray': '#D1D5DB',         // Gris moderne (borders, inactive)
        'asiko-gray-dark': '#6B7280',    // Gris foncé (texte secondaire)
        'asiko-gray-darker': '#374151',  // Gris très foncé (texte principal)
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
