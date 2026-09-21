import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, duration = 2500 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={onClose}
      className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 bg-neutral-900/95 dark:bg-neutral-100 text-white dark:text-neutral-950 px-4 py-3 rounded-xl shadow-xl text-xs font-medium border border-neutral-700/50 dark:border-neutral-300 cursor-pointer select-none transition-all duration-200 animate-in fade-in slide-in-from-bottom-3 hover:opacity-90"
    >
      <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
      <span className="pr-1">{message}</span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="ml-1 p-0.5 rounded-md text-neutral-400 dark:text-neutral-500 hover:text-white dark:hover:text-neutral-900 transition"
        aria-label="閉じる"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
