import React from 'react';

/**
 * Button ASIKO - Engineering Grade
 * Focus sur la micro-typographie et la physique des matériaux.
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  icon: Icon, // Possibilité de passer un composant icône
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {

  // 1. Core Physics: Utilisation de l'élasticité iOS
  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-bold tracking-tight whitespace-nowrap
    transition-all duration-300 ease-[cubic-bezier(0.32,0,0.67,0)]
    active:scale-[0.97] active:brightness-90
    disabled:opacity-40 disabled:pointer-events-none disabled:grayscale
    focus:outline-none focus-visible:ring-4
  `;

  // 2. Material Variants: Équilibre entre contraste et douceur
  const variantClasses = {
    // Obsidian Mode: Profondeur noire avec reflet
    primary: `
      bg-slate-900 text-white 
      shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_12px_rgba(0,0,0,0.05)]
      hover:bg-slate-800 hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)]
      focus-visible:ring-slate-900/20
    `,
    // Medical Mint: Style "Apple Health"
    secondary: `
      bg-[#E8F5E9] text-[#2E7D32]
      hover:bg-[#C8E6C9] hover:text-[#1B5E20]
      focus-visible:ring-emerald-500/20
    `,
    // Soft Danger: Alerte sans agression
    danger: `
      bg-rose-50 text-rose-600 border border-rose-100
      hover:bg-rose-600 hover:text-white hover:border-transparent
      focus-visible:ring-rose-500/20
    `,
    // Glass Ghost: Pour les actions secondaires
    outline: `
      bg-white/50 backdrop-blur-sm text-slate-600 border border-slate-200
      hover:bg-white hover:border-slate-900 hover:text-slate-900
      focus-visible:ring-slate-900/10
    `,
  };

  // 3. Sizing System: Basé sur la grille de 4px
  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-[13px] rounded-[10px] min-h-[32px]',
    md: 'px-5 py-3 text-[15px] rounded-[14px] min-h-[48px]',
    lg: 'px-8 py-4.5 text-[17px] rounded-[18px] min-h-[56px]',
  };

  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={classes}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center pointer-events-none">
          {/* Spinner Minimaliste style San Francisco */}
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 16 : 20} className="shrink-0 opacity-90" />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;