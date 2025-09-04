'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const toastVariants = {
  success: {
    icon: CheckCircle,
    className: 'border-success bg-success/10 text-success-foreground',
    iconClassName: 'text-success'
  },
  error: {
    icon: AlertCircle,
    className: 'border-destructive bg-destructive/10 text-destructive-foreground',
    iconClassName: 'text-destructive'
  },
  warning: {
    icon: AlertTriangle,
    className: 'border-warning bg-warning/10 text-warning-foreground',
    iconClassName: 'text-warning'
  },
  info: {
    icon: Info,
    className: 'border-info bg-info/10 text-info-foreground',
    iconClassName: 'text-info'
  }
};

function ToastComponent({ toast, onRemove }: ToastProps) {
  const variant = toastVariants[toast.type || 'info'];
  const Icon = variant.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-2xl border shadow-soft-lg max-w-sm w-full',
        variant.className
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', variant.iconClassName)} />
      
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className="text-sm font-semibold mb-1">
            {toast.title}
          </h4>
        )}
        {toast.description && (
          <p className="text-sm opacity-90">
            {toast.description}
          </p>
        )}
      </div>
      
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-black/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastComponent
            key={toast.id}
            toast={toast}
            onRemove={onRemove}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
