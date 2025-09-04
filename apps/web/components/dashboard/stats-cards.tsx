'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mail, 
  Bot, 
  CheckCircle, 
  CreditCard,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    label: string;
  };
  progress?: {
    value: number;
    max: number;
    label: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info';
  className?: string;
}

const variants = {
  default: {
    icon: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20'
  },
  success: {
    icon: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/20'
  },
  warning: {
    icon: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20'
  },
  destructive: {
    icon: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20'
  },
  info: {
    icon: 'text-info',
    bg: 'bg-info/10',
    border: 'border-info/20'
  }
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  progress,
  variant = 'default',
  className
}: StatCardProps) {
  const variantStyles = variants[variant];

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="h-3 w-3" />;
    if (trend.value < 0) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.value > 0) return 'text-accent';
    if (trend.value < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('h-full', className)}
    >
      <Card className={cn(
        'h-full transition-all duration-200 hover:shadow-soft-lg',
        variantStyles.border
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className={cn(
            'p-2 rounded-xl',
            variantStyles.bg
          )}>
            <Icon className={cn('h-4 w-4', variantStyles.icon)} />
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
            
            {trend && (
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium',
                getTrendColor()
              )}>
                {getTrendIcon()}
                <span>
                  {Math.abs(trend.value)}% {trend.label}
                </span>
              </div>
            )}
            
            {progress && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{progress.label}</span>
                  <span className="font-medium">
                    {Math.round((progress.value / progress.max) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(progress.value / progress.max) * 100} 
                  className="h-2"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface StatsCardsProps {
  stats: {
    totalEmails: number;
    botsDetected: number;
    validEmails: number;
    creditsRemaining: number;
    creditsUsed: number;
    creditsLimit: number;
  };
  className?: string;
}

export function StatsCards({ stats, className }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Emails Processed',
      value: stats.totalEmails,
      description: 'All time processed',
      icon: Mail,
      variant: 'default' as const,
      trend: {
        value: 12,
        label: 'from last month'
      }
    },
    {
      title: 'Bots Detected',
      value: stats.botsDetected,
      description: 'Invalid emails found',
      icon: Bot,
      variant: 'destructive' as const,
      trend: {
        value: -5,
        label: 'from last month'
      }
    },
    {
      title: 'Valid Emails',
      value: stats.validEmails,
      description: 'Clean email addresses',
      icon: CheckCircle,
      variant: 'success' as const,
      trend: {
        value: 8,
        label: 'from last month'
      }
    },
    {
      title: 'Credits Remaining',
      value: stats.creditsRemaining,
      description: 'Available for processing',
      icon: CreditCard,
      variant: 'info' as const,
      progress: {
        value: stats.creditsRemaining,
        max: stats.creditsLimit,
        label: 'Credits used this month'
      }
    }
  ];

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <StatCard {...card} />
        </motion.div>
      ))}
    </div>
  );
}
