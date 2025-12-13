import React from 'react';

export interface CardProps {
  variant?: 'default' | 'bordered' | 'elevated' | 'interactive';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const variantStyles = {
  default: 'bg-white',
  bordered: 'bg-white border border-gray-200',
  elevated: 'bg-white shadow-md',
  interactive: 'bg-white border border-gray-200 hover:shadow-lg hover:border-blue-300 cursor-pointer transition-all duration-200',
};

export const Card: React.FC<CardProps> = ({ 
  variant = 'default', 
  className = '', 
  children,
  onClick 
}) => {
  const variantClass = variantStyles[variant];
  
  return (
    <div 
      className={`rounded-lg p-6 ${variantClass} ${className}`}
      onClick={onClick}
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
