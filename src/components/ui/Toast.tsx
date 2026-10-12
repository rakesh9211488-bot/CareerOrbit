'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import clsx from 'clsx';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 200);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-emerald-500/20 border-emerald-500/30',
    error: 'bg-red-500/20 border-red-500/30',
    info: 'bg-blue-500/20 border-blue-500/30',
  }[type];

  const textColor = {
    success: 'text-emerald-200',
    error: 'text-red-200',
    info: 'text-blue-200',
  }[type];

  const Icon = type === 'success' ? CheckCircle : AlertCircle;
  const iconColor = {
    success: 'text-emerald-400',
    error: 'text-red-400',
    info: 'text-blue-400',
  }[type];

  return (
    <div
      className={clsx(
        'fixed bottom-6 right-6 z-50 transform transition-all duration-200',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      )}
    >
      <div
        className={clsx(
          'flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm',
          bgColor,
          textColor
        )}
      >
        <Icon className={clsx('w-5 h-5', iconColor)} />
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 200);
          }}
          className="ml-2 hover:opacity-75 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
