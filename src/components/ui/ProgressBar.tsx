import React from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  gradient?: string;
  className?: string;
}

export function ProgressBar({
  value,
  max,
  label,
  showPercentage = false,
  size = 'md',
  gradient,
  className,
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={className}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full rounded-full overflow-hidden ${sizeClasses[size]}`}
        style={{ background: 'var(--bg-tertiary)' }}
      >
        <motion.div
          className={`h-full rounded-full`}
          style={{
            background: gradient || 'var(--gradient-primary)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
