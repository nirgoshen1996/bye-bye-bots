'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  CreditCard, 
  TrendingUp, 
  Zap, 
  Crown,
  AlertTriangle
} from 'lucide-react';
import { createSupabaseClient } from '@/lib/supabase';

interface CreditInfo {
  credits_balance: number;
  monthly_email_limit: number;
  plan_type: string;
}

export function CreditDisplay() {
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createSupabaseClient();

  useEffect(() => {
    loadCreditInfo();
  }, []);

  const loadCreditInfo = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/billing/info', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCreditInfo({
          credits_balance: data.credits_balance,
          monthly_email_limit: data.monthly_email_limit,
          plan_type: data.plan_type
        });
      }
    } catch (err) {
      console.error('Error loading credit info:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCreditColor = () => {
    if (!creditInfo) return 'bg-gray-100 text-gray-800';
    
    const percentage = (creditInfo.credits_balance / creditInfo.monthly_email_limit) * 100;
    
    if (percentage < 20) return 'bg-red-100 text-red-800';
    if (percentage < 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getPlanIcon = () => {
    if (!creditInfo) return <CreditCard className="h-4 w-4" />;
    
    switch (creditInfo.plan_type) {
      case 'free': return <CreditCard className="h-4 w-4" />;
      case 'pro': return <Zap className="h-4 w-4" />;
      case 'master_100k':
      case 'master_250k':
      case 'master_500k': return <Crown className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPlanName = () => {
    if (!creditInfo) return 'Free';
    
    switch (creditInfo.plan_type) {
      case 'free': return 'Free';
      case 'pro': return 'Pro';
      case 'master_100k': return 'Master 100K';
      case 'master_250k': return 'Master 250K';
      case 'master_500k': return 'Master 500K';
      case 'enterprise': return 'Enterprise';
      default: return 'Free';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
        <div className="w-4 h-4 bg-muted-foreground rounded animate-pulse" />
        <div className="w-16 h-4 bg-muted-foreground rounded animate-pulse" />
      </div>
    );
  }

  if (!creditInfo) {
    return null;
  }

  const isLowCredits = creditInfo.credits_balance < 1000;
  const isCritical = creditInfo.credits_balance < 100;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {isCritical ? (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          ) : (
            getPlanIcon()
          )}
          <span className="hidden sm:inline">
            {creditInfo.credits_balance.toLocaleString()} credits
          </span>
          <Badge className={getCreditColor()}>
            {getPlanName()}
          </Badge>
          {isLowCredits && (
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Credit Balance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Available Credits</span>
            <span className="text-lg font-bold">
              {creditInfo.credits_balance.toLocaleString()}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                isCritical ? 'bg-red-500' : 
                isLowCredits ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ 
                width: `${Math.min((creditInfo.credits_balance / creditInfo.monthly_email_limit) * 100, 100)}%` 
              }}
            />
          </div>
          
          <div className="text-xs text-muted-foreground">
            {creditInfo.credits_balance.toLocaleString()} of {creditInfo.monthly_email_limit.toLocaleString()} monthly limit
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        {isLowCredits && (
          <DropdownMenuItem 
            onClick={() => router.push('/billing')}
            className="text-yellow-700 bg-yellow-50"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            {isCritical ? 'Critical: Buy Credits Now' : 'Low Credits - Upgrade'}
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={() => router.push('/billing')}>
          <CreditCard className="h-4 w-4 mr-2" />
          Manage Billing
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => router.push('/billing')}>
          <Zap className="h-4 w-4 mr-2" />
          Upgrade Plan
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <div className="px-2 py-1 text-xs text-muted-foreground">
          Current Plan: {getPlanName()}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

