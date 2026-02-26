import React from 'react';
import styles from './Button.module.css';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', ...props }) => {
  const buttonClasses = `
    ${styles.btn} 
    ${styles[variant]} 
    ${className}
  `;

  return (
    <button type={type} onClick={onClick} className={buttonClasses.trim()} {...props}>
      {children}
    </button>
  );
};

export default Button;