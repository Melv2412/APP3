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
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'shake': 'shake 0.5s ease-in-out',
      },
      animationDelay: {
        '100': '100ms',
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
        '700': '700ms',
        '800': '800ms',
        '900': '900ms',
        '1000': '1000ms',
        '1100': '1100ms',
        '1200': '1200ms',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.animation-delay-100': { 'animation-delay': '100ms' },
        '.animation-delay-200': { 'animation-delay': '200ms' },
        '.animation-delay-300': { 'animation-delay': '300ms' },
        '.animation-delay-400': { 'animation-delay': '400ms' },
        '.animation-delay-500': { 'animation-delay': '500ms' },
        '.animation-delay-600': { 'animation-delay': '600ms' },
        '.animation-delay-700': { 'animation-delay': '700ms' },
        '.animation-delay-800': { 'animation-delay': '800ms' },
        '.animation-delay-900': { 'animation-delay': '900ms' },
        '.animation-delay-1000': { 'animation-delay': '1000ms' },
        '.animation-delay-1100': { 'animation-delay': '1100ms' },
        '.animation-delay-1200': { 'animation-delay': '1200ms' },
      });
    },
  ],
}
