'use client';

import clsx from 'clsx';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function Badge({ label, variant = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-indigo-500/20 text-indigo-200 border-indigo-500/30',
    success: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
    warning: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
    error: 'bg-red-500/20 text-red-200 border-red-500/30',
  };

  return (
    <span
      className={clsx(
        'inline-block px-3 py-1 rounded-full text-xs font-medium border',
        variants[variant]
      )}
    >
      {label}
    </span>
  );
}
