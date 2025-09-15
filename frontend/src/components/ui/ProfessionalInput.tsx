import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ProfessionalInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onBlur'> {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  icon?: LucideIcon;
  type?: 'text' | 'email' | 'password' | 'number';
  error?: string;
  helper?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  rightElement?: React.ReactNode;
}

export const ProfessionalInput: React.FC<ProfessionalInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  icon: Icon,
  type = 'text',
  error,
  helper,
  required = false,
  disabled = false,
  className = '',
  rightElement
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(e);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 h-5 w-5" />
        )}
        
        <input
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            input-professional w-full
            ${Icon ? 'pl-10' : 'pl-4'}
            ${rightElement ? 'pr-12' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />

        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
          <span className="w-4 h-4 mr-1">⚠</span>
          {error}
        </p>
      )}
      
      {helper && !error && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {helper}
        </p>
      )}
    </div>
  );
};

interface ProfessionalSelectProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ProfessionalSelect: React.FC<ProfessionalSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  error,
  required = false,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          input-professional w-full
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
          <span className="w-4 h-4 mr-1">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};