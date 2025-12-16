import React from 'react';

export interface CardProps {
  variant?: 'default' | 'bordered' | 'elevated' | 'interactive';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const variantStyles = {
  default: 'bg-white shadow-lg shadow-slate-200/50',
  outlined: 'bg-white border border-slate-200 shadow-sm',
  flat: 'bg-slate-50',
};

export const Card: React.FC<CardProps> = ({ 
  variant = 'default', 
  className = '', 
  children,
  ...props
}) => {
  return (
    <div 
      className={`rounded-xl overflow-hidden ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>;
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return <div className={className}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>{children}</div>;
};
