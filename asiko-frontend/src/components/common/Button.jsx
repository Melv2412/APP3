/**
 * Composant Button
 * Bouton réutilisable avec variantes
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  square = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...props 
}) => {
  const baseClasses = 'font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-primary-green text-white hover:bg-dark-green focus:ring-primary-green',
    secondary: 'bg-white text-primary-green border-2 border-primary-green hover:bg-light-green focus:ring-primary-green',
    danger: 'bg-asiko-red text-white hover:bg-red-700 focus:ring-asiko-red',
    outline: 'bg-transparent text-primary-green border-2 border-primary-green hover:bg-primary-green hover:text-white focus:ring-primary-green',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-body-md',
    md: 'px-4 py-3 text-body-lg',
    lg: 'px-6 py-4 text-body-lg',
  };
  
  const shapeClasses = square ? 'rounded-asiko' : 'rounded-asiko-lg';
  
  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${shapeClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
