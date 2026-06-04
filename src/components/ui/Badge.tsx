import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'xp' | 'coin';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      background: 'var(--bg-tertiary)',
      color: 'var(--text-secondary)',
    },
    primary: {
      background: 'var(--gradient-primary)',
      color: 'white',
    },
    success: {
      background: 'var(--gradient-success)',
      color: 'white',
    },
    warning: {
      background: 'rgba(245, 158, 11, 0.15)',
      color: '#f59e0b',
    },
    danger: {
      background: 'rgba(239, 68, 68, 0.15)',
      color: '#ef4444',
    },
    xp: {
      background: 'var(--gradient-xp)',
      color: '#78350f',
    },
    coin: {
      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
      color: '#78350f',
    },
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 font-semibold rounded-full',
        sizeClasses[size],
        className
      )}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  );
}
