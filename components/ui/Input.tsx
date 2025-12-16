import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  icon,
  fullWidth = false,
  className = '',
  ...props
}, ref) => {
  const hasError = !!error;
  
  const inputClasses = `
    block w-full rounded-lg border-slate-300 shadow-sm 
    focus:border-indigo-500 focus:ring-indigo-500 
    disabled:bg-slate-50 disabled:text-slate-500
    ${hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
    ${icon ? 'pl-10' : ''}
    ${className}
  `;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
