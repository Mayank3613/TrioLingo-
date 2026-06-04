import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export function Input({ label, error, leftIcon, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {leftIcon}
          </div>
        )}
        <input
          className={clsx(
            'w-full rounded-lg px-4 py-2.5 text-sm transition-all duration-200',
            'focus:outline-none focus:ring-2',
            leftIcon && 'pl-10',
            className
          )}
          style={{
            background: 'var(--bg-tertiary)',
            border: `1px solid ${error ? '#ef4444' : 'var(--border-primary)'}`,
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-lg)',
          }}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  );
}
