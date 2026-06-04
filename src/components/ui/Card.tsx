import React from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function Card({
  children,
  className,
  hover = false,
  gradient = false,
  padding = 'md',
  onClick,
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
  };

  const Component = hover ? motion.div : 'div';
  const motionProps = hover
    ? {
        whileHover: { y: -4, boxShadow: 'var(--shadow-xl)' },
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }
    : {};

  return (
    <Component
      className={clsx(
        'rounded-2xl transition-all duration-200',
        paddingClasses[padding],
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-primary)',
        boxShadow: 'var(--shadow-md)',
        borderRadius: 'var(--radius-xl)',
        ...(gradient && {
          borderTop: '3px solid transparent',
          borderImage: 'var(--gradient-primary) 1',
          borderImageSlice: '1 1 0 0',
        }),
      }}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </Component>
  );
}
