import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ProfessionalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  style?: React.CSSProperties;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  children,
  className = '',
  hover = true,
  glow = false,
  style,
  ...rest
}) => {
  return (
    <div 
      style={style} 
      className={`
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-2xl shadow-lg
        transition-all duration-200
        ${hover ? 'hover:scale-[1.02] hover:shadow-xl' : ''}
        ${glow ? 'hover:shadow-blue-500/20 dark:hover:shadow-blue-500/30' : ''}
        ${className}
      `} 
      {...rest}
    >
      {children}
    </div>
  );
};

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange' | 'cyan';
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  change,
  changeType = 'positive',
  color = 'purple'
}) => {
  const colorClasses = {
    purple: 'text-purple-600 dark:text-purple-300 bg-purple-500/10 border-purple-500/20',
    blue: 'text-blue-600 dark:text-blue-300 bg-blue-500/10 border-blue-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    cyan: 'text-cyan-500 dark:text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  const changeColors = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-gray-500 dark:text-gray-400'
  };

  return (
    <ProfessionalCard className="p-6 group" style={{ backgroundColor: 'var(--color-card-bg)', borderColor: 'var(--color-border)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl border ${colorClasses[color]} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="h-6 w-6" />
        </div>
        {change && (
          <div className={`text-sm font-medium ${changeColors[changeType]}`}>
            {change}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="text-3xl font-bold group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors duration-300" style={{ color: 'var(--color-text-primary)' }}>
          {value}
        </div>
        <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
          {label}
        </div>
      </div>
    </ProfessionalCard>
  );
};

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: 'blue' | 'purple' | 'green' | 'orange';
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  accent = 'blue'
}) => {
  const accentColors = {
    blue: 'from-blue-500 to-blue-600 group-hover:from-blue-600 group-hover:to-blue-700',
    purple: 'from-purple-500 to-purple-600 group-hover:from-purple-600 group-hover:to-purple-700',
    green: 'from-green-500 to-green-600 group-hover:from-green-600 group-hover:to-green-700',
    orange: 'from-orange-500 to-orange-600 group-hover:from-orange-600 group-hover:to-orange-700'
  };

  return (
    <ProfessionalCard className="p-8 group text-center">
      <div className="mb-6">
        <div className={`w-16 h-16 mx-auto bg-gradient-to-br ${accentColors[accent]} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
        {title}
      </h3>
      
      <p className="text-slate-600 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </ProfessionalCard>
  );
};