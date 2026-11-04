import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  padding?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  bodyClassName = '',
  padding,
  style
}) => {
  return (
    <div 
      className={`card ${className}`}
      style={{ ...(padding ? { padding } : {}), ...style }}
    >
      {(title || action) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: subtitle ? '4px' : '16px',
        }}>
          <div>
            {title && <h2 className="section-heading" style={{ margin: 0 }}>{title}</h2>}
            {subtitle && <p className="text-secondary" style={{ marginTop: '2px' }}>{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>
        {children}
      </div>
    </div>
  );
};
