import React from 'react';

const Input = ({
  label,
  type = 'text',
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  error,
  helpText,
  min,
  max,
  step,
  autoComplete,
  ...props
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-secondary-700 mb-1"
        >
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      
      <input
        type={type}
        id={id}
        name={name || id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        autoComplete={autoComplete}
        className={`w-full px-3 py-2 border ${
          error 
            ? 'border-danger focus:ring-danger focus:border-danger' 
            : 'border-secondary-300 focus:ring-primary-500 focus:border-primary-500'
        } rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
          disabled ? 'bg-secondary-100 text-secondary-500 cursor-not-allowed' : ''
        }`}
        {...props}
      />
      
      {helpText && (
        <p className="mt-1 text-sm text-secondary-500">{helpText}</p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
    </div>
  );
};

export default Input;