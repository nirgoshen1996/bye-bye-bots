'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, LucideIcon } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;
          const Icon = step.icon;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200',
                    isCompleted && 'bg-accent border-accent text-accent-foreground',
                    isCurrent && 'bg-primary border-primary text-primary-foreground',
                    isUpcoming && 'bg-muted border-muted-foreground/25 text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : Icon ? (
                    <Icon className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </motion.div>
                
                {/* Step Content */}
                <div className="mt-3 text-center max-w-32">
                  <motion.h4
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.1 }}
                    className={cn(
                      'text-sm font-medium',
                      isCurrent && 'text-primary',
                      isCompleted && 'text-accent',
                      isUpcoming && 'text-muted-foreground'
                    )}
                  >
                    {step.title}
                  </motion.h4>
                  {step.description && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.15 }}
                      className="text-xs text-muted-foreground mt-1"
                    >
                      {step.description}
                    </motion.p>
                  )}
                </div>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.3 }}
                    className={cn(
                      'h-0.5 bg-muted-foreground/25',
                      index < currentStep && 'bg-accent'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
