'use client';

import clsx from 'clsx';

interface ProgressBarProps {
  progress?: number; // 0-100
  isIndeterminate?: boolean;
  className?: string;
}

export function ProgressBar({
  progress = 0,
  isIndeterminate = false,
  className,
}: ProgressBarProps) {
  return (
    <div className={clsx('w-full h-1 bg-surface rounded-full overflow-hidden', className)}>
      <div
        className={clsx(
          'h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-300',
          isIndeterminate && 'animate-pulse'
        )}
        style={{
          width: isIndeterminate ? '100%' : `${Math.min(progress, 100)}%`,
        }}
      />
    </div>
  );
}
