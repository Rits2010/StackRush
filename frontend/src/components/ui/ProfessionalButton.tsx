import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ProfessionalButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const ProfessionalButton: React.FC<ProfessionalButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  className = '',
  onClick,
  disabled = false,
  loading = false,
  type = 'button'
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transform hover:scale-105 focus:ring-blue-500/25',
    secondary: 'bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 hover:border-gray-500 text-gray-200 focus:ring-gray-500/25',
    outline: 'border-2 border-blue-500 hover:bg-blue-500 text-blue-400 hover:text-white focus:ring-blue-500/25',
    ghost: 'hover:bg-gray-800/50 text-gray-300 hover:text-white focus:ring-gray-500/25'
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
      ) : (
        Icon && iconPosition === 'left' && <Icon className="h-5 w-5 mr-2" />
      )}
      
      {children}
      
      {!loading && Icon && iconPosition === 'right' && <Icon className="h-5 w-5 ml-2" />}
    </button>
  );
};