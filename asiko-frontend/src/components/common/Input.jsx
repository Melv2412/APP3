/**
 * Composant Input
 * Input réutilisable avec styles ASIKO
 */
const Input = ({
  type = 'text',
  label,
  error,
  className = '',
  ...props
}) => {
  const inputClasses = `
    w-full px-4 py-3 
    border border-primary-green 
    rounded-asiko 
    focus:outline-none focus:ring-2 focus:ring-primary-green
    text-body-md
    ${error ? 'border-asiko-red focus:ring-asiko-red' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-body-md font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        type={type}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-body-sm text-asiko-red">{error}</p>
      )}
    </div>
  );
};

export default Input;
