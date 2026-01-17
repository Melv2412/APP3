import React from 'react';

/**
 * Badge ASIKO Premium
 * Style : "Soft-Semantic" - Haute lisibilité et esthétique minimaliste.
 */
const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false, // Option pour ajouter un point lumineux
  className = '',
  ...props
}) => {

  // 1. Fondations : Typographie compacte et arrondie "Squircle"
  const baseClasses = `
    inline-flex items-center justify-center 
    font-bold tracking-tight 
    rounded-full leading-none
    transition-all duration-300
  `;

  // 2. Variantes : Contraste doux (Fond clair / Texte sombre)
  const variantClasses = {
    // Obsidian / Slate
    default: 'bg-slate-100 text-slate-700 border border-slate-200/50',

    // Urgent / Critique (Apple Red)
    danger: 'bg-red-50 text-red-600 border border-red-100',

    // Alerte / Phase 2
    warning: 'bg-amber-50 text-amber-700 border border-amber-100',

    // Médical / Stable
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',

    // Diagnostic / Info
    info: 'bg-blue-50 text-blue-700 border border-blue-100',

    // Neutre / Système
    gray: 'bg-slate-50 text-slate-500 border border-slate-200/60',
  };

  // 3. Tailles basées sur l'échelle iOS
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] uppercase tracking-wider',
    md: 'px-2.5 py-1 text-[12px]',
    lg: 'px-4 py-1.5 text-[14px]',
  };

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <span className={classes} {...props}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 shadow-sm ${variant === 'success' ? 'bg-emerald-500' :
          variant === 'danger' ? 'bg-red-500' :
            variant === 'warning' ? 'bg-amber-500' : 'bg-current'
          }`} />
      )}
      {children}
    </span>
  );
};

export default Badge;