import React from 'react';

interface ConfettiEffectProps {
  show: boolean;
  intensity?: 'light' | 'medium' | 'heavy';
  duration?: number;
  colors?: string[];
}

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({
  show,
  intensity = 'medium',
  duration = 3000,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899']
}) => {
  if (!show) return null;

  const getParticleCount = () => {
    switch (intensity) {
      case 'light': return 15;
      case 'medium': return 25;
      case 'heavy': return 40;
      default: return 25;
    }
  };

  const getSparkleCount = () => {
    switch (intensity) {
      case 'light': return 8;
      case 'medium': return 15;
      case 'heavy': return 25;
      default: return 15;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Main confetti particles */}
      {[...Array(getParticleCount())].map((_, i) => {
        const shapes = ['circle', 'square', 'triangle'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = 3 + Math.random() * 8;
        const startX = 20 + Math.random() * 60;
        const drift = (Math.random() - 0.5) * 200;
        
        return (
          <div
            key={i}
            className="absolute confetti-particle"
            style={{
              left: `${startX}%`,
              top: '-20px',
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              borderRadius: shape === 'circle' ? '50%' : shape === 'triangle' ? '0' : '2px',
              clipPath: shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
              animationDelay: `${Math.random() * 1}s`,
              animationDuration: `${2.5 + Math.random() * 1.5}s`,
              '--drift': `${drift}px`,
              transform: `rotate(${Math.random() * 360}deg)`,
              boxShadow: `0 0 6px ${color}40`
            } as React.CSSProperties}
          />
        );
      })}
      
      {/* Sparkle effect */}
      {[...Array(getSparkleCount())].map((_, i) => (
        <div
          key={`sparkle-${i}`}
          className="absolute animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: '2px',
            height: '2px',
            backgroundColor: '#fbbf24',
            borderRadius: '50%',
            boxShadow: '0 0 10px #fbbf24, 0 0 20px #fbbf24, 0 0 30px #fbbf24',
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${1 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );
};