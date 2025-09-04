'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  animated?: boolean;
}

export function Logo({ 
  className, 
  size = 'md', 
  showIcon = true, 
  animated = false 
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const LogoIcon = () => (
    <motion.svg
      className={cn(iconSizes[size], 'text-primary')}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={animated ? { rotate: 0 } : false}
      animate={animated ? { rotate: 360 } : false}
      transition={animated ? { duration: 2, repeat: Infinity, ease: "linear" } : false}
    >
      {/* Robot/Broom Icon */}
      <path
        d="M12 2C13.1 2 14 2.9 14 4V6H16C17.1 6 18 6.9 18 8V18C18 19.1 17.1 20 16 20H8C6.9 20 6 19.1 6 18V8C6 6.9 6.9 6 8 6H10V4C10 2.9 10.9 2 12 2Z"
        fill="currentColor"
        opacity="0.8"
      />
      {/* Broom handle */}
      <path
        d="M4 8L2 10L6 14L8 12L4 8Z"
        fill="currentColor"
        opacity="0.6"
      />
      {/* Broom bristles */}
      <path
        d="M2 10L4 12L6 10L4 8L2 10Z"
        fill="currentColor"
        opacity="0.4"
      />
      {/* Robot eyes */}
      <circle cx="10" cy="10" r="1" fill="white" />
      <circle cx="14" cy="10" r="1" fill="white" />
      {/* Robot mouth */}
      <path d="M10 13H14" stroke="white" strokeWidth="1" strokeLinecap="round" />
    </motion.svg>
  );

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showIcon && <LogoIcon />}
      <span className={cn('font-bold text-foreground', sizeClasses[size])}>
        ByeByeBots
      </span>
    </div>
  );
}

// Alternative text-only logo
export function TextLogo({ className, size = 'md' }: Omit<LogoProps, 'showIcon' | 'animated'>) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <span className={cn('font-bold text-foreground', sizeClasses[size], className)}>
      ByeByeBots
    </span>
  );
}

// Logo with .io domain
export function FullLogo({ className, size = 'md' }: Omit<LogoProps, 'showIcon' | 'animated'>) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className={cn('font-bold text-foreground', sizeClasses[size])}>
        ByeByeBots
      </span>
      <span className={cn('text-muted-foreground', sizeClasses[size])}>
        .io
      </span>
    </div>
  );
}
