import React from 'react';

/**
 * Card ASIKO Ultra-Premium
 * Un container qui utilise le "Layering" plutôt que de simples ombres.
 */
const Card = ({
  children,
  className = '',
  padding = true,
  hoverable = false, // Nouvelle propriété pour l'interactivité
  glass = false,     // Option pour un effet translucide
  ...props
}) => {

  // 1. Structure de base : Squircle & Bordure "Haute Couture"
  const baseClasses = `
    relative overflow-hidden
    rounded-[32px] 
    transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
    border border-slate-100/60
  `;

  // 2. Gestion de la profondeur (Elevation)
  // On utilise un double système : une ombre très diffuse et un léger gradient de fond
  const depthClasses = `
    bg-white
    shadow-[0_8px_30px_rgb(0,0,0,0.04)]
    ${hoverable ? 'hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1' : ''}
  `;

  // 3. Option Glassmorphism (pour les widgets de dashboard)
  const glassClasses = glass ? 'bg-white/70 backdrop-blur-xl border-white/40' : '';

  const paddingClasses = padding ? 'p-6 sm:p-8' : '';

  const classes = `
    ${baseClasses}
    ${glassClasses || depthClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={classes} {...props}>
      {/* Reflet de lumière interne (Inner Glow) pour le réalisme */}
      <div className="absolute inset-0 pointer-events-none rounded-[32px] ring-1 ring-inset ring-white/20" />

      {/* Contenu */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Card;