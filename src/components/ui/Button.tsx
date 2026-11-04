import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'icon' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  style,
  ...props
}) => {
  const variantClass = variant === 'primary' 
    ? 'btn-primary' 
    : variant === 'secondary' 
    ? 'btn-secondary' 
    : variant === 'danger'
    ? 'btn-danger'
    : 'btn-icon';

  const sizeStyle: React.CSSProperties = size === 'sm' ? {
    height: '32px',
    padding: '0 10px',
    fontSize: '12px'
  } : {};

  return (
    <button
      className={`${variantClass} ${className}`}
      style={{ ...sizeStyle, ...style }}
      {...props}
    >
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  );
};
