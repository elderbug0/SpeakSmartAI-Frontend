import React from 'react';
import PropTypes from 'prop-types';

export const Button = ({ variant, children, className, ...props }) => {
  const baseClass = 'py-2 px-3 rounded-lg';
  const variantClass = variant === 'link' ? 'text-blue-500 underline' : 'bg-custom-blue text-white hover:bg-custom-blue-dark';
  const combinedClass = `${baseClass} ${variantClass} ${className}`;
  
  return (
    <button className={combinedClass} {...props}>
      {children}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Button;
