import React from 'react';

const Badge = ({ children, variant = 'organic', className = '' }) => {
  const baseStyles = 'inline-flex items-center px-3 py-1 rounded-pill text-xs font-medium';

  const variants = {
    organic: 'bg-pale-gold text-forest-deep border border-gold/30',
    sale: 'bg-forest text-cream',
    stock: 'bg-green-100 text-green-800 border border-green-300',
    warning: 'bg-amber-100 text-amber-800 border border-amber-300',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
