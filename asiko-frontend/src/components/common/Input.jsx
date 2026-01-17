import React, { useState } from 'react';

/**
 * Input ASIKO Premium
 * Design : Minimaliste, interactif, avec retour visuel doux.
 */
const Input = ({
  type = 'text',
  label,
  error,
  icon, // Optionnel : pour ajouter une icône iOS
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`w-full group transition-all duration-300`}>
      {/* Label avec style typographique aéré */}
      {label && (
        <label
          className={`block text-[13px] font-bold tracking-tight mb-1.5 transition-colors duration-300 ${isFocused ? 'text-emerald-600' : 'text-slate-500'
            } ${error ? 'text-red-500' : ''}`}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type={type}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-3.5
            bg-slate-50 border-2 border-transparent
            rounded-[16px] outline-none
            text-[15px] font-medium text-slate-900
            placeholder:text-slate-400
            transition-all duration-400 ease-out
            shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]
            
            /* Focus State : L'effet "Apple Bloom" */
            focus:bg-white focus:border-emerald-500/20 focus:ring-[4px] focus:ring-emerald-500/10
            
            /* Error State */
            ${error ? 'border-red-100 bg-red-50/30 focus:border-red-500/20 focus:ring-red-500/10' : ''}
            
            ${className}
          `}
          {...props}
        />

        {/* Petit indicateur visuel de validité (facultatif) */}
        {!error && isFocused && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-in fade-in zoom-in duration-300">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>
        )}
      </div>

      {/* Message d'erreur dynamique */}
      <div className="min-h-[20px]"> {/* Évite le saut de mise en page */}
        {error && (
          <p className="mt-1.5 text-[12px] font-bold text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default Input;