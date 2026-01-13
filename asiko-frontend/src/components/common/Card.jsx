/**
 * Composant Card
 * Container arrondi réutilisable
 */
const Card = ({ 
  children, 
  className = '',
  padding = true,
  shadow = true,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-asiko-lg';
  const paddingClasses = padding ? 'p-4' : '';
  const shadowClasses = shadow ? 'shadow-md' : '';
  
  const classes = `
    ${baseClasses}
    ${paddingClasses}
    ${shadowClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
