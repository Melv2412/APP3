/**
 * Composant Badge
 * Badge pour notifications, labels, etc.
 */
const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-full';
  
  const variantClasses = {
    default: 'bg-primary-green text-white',
    danger: 'bg-asiko-red text-white',
    warning: 'bg-asiko-yellow text-black',
    info: 'bg-asiko-blue text-white',
    success: 'bg-asiko-green-light text-black',
    gray: 'bg-asiko-gray text-black',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-body-sm',
    md: 'px-3 py-1 text-body-md',
    lg: 'px-4 py-2 text-body-lg',
  };
  
  const classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <span className={classes} {...props}>
      {children}
    </span>
  );
};

export default Badge;
