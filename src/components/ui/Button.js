import React from 'react';
import PropTypes from 'prop-types';

export const Button = ({ variant, children, ...props }) => {
  const className = variant === 'link' ? 'text-blue-500 underline' : 'bg-blue-500 text-white py-2 px-4 rounded';
  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Button;
