'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CreditCard, 
  Crown, 
  Zap, 
  Check, 
  X, 
  Loader2, 
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
  Shield,
  Star
} from 'lucide-react';
import { createSupabaseClient } from '@/lib/supabase';
import { ProtectedRoute } from '@/components/auth/protected-route';

interface BillingInfo {
  plan_type: string;
  credits_balance: number;
  subscription_status: string;
  last_payment_date: string | null;
  monthly_email_limit: number;
  recent_transactions: Array<{
    transaction_type: string;
    amount: number;
    description: string;
    created_at: string;
  }>;
}

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  credits: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
  priceId: string;
}

const subscriptionPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    credits: '1,000 emails/month',
    features: [
      'Basic bot detection',
      'Email validation',
      'CSV processing',
      'Basic support'
    ],
    buttonText: 'Current Plan',
    priceId: ''
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    credits: '50,000 emails/month',
    features: [
      'Advanced bot detection',
      'MX record checking',
      'Priority processing',
      'Email support',
      'API access'
    ],
    popular: true,
    buttonText: 'Upgrade to Pro',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro'
  },
  {
    id: 'master_100k',
    name: 'Master 100K',
    price: '$49',
    credits: '100,000 emails/month',
    features: [
      'All Pro features',
      'Advanced analytics',
      'Custom rules',
      'Phone support',
      'Dedicated account manager'
    ],
    buttonText: 'Upgrade to Master',
    priceId: process.env.NEXT_PUBLIC_STRIPE_MASTER_100K_PRICE_ID || 'price_master_100k'
  },
  {
    id: 'master_250k',
    name: 'Master 250K',
    price: '$99',
    credits: '250,000 emails/month',
    features: [
      'All Master 100K features',
      'Bulk processing',
      'Custom integrations',
      '24/7 support',
      'SLA guarantee'
    ],
    buttonText: 'Upgrade to Master',
    priceId: process.env.NEXT_PUBLIC_STRIPE_MASTER_250K_PRICE_ID || 'price_master_250k'
  },
  {
    id: 'master_500k',
    name: 'Master 500K',
    price: '$199',
    credits: '500,000 emails/month',
    features: [
      'All Master 250K features',
      'Enterprise security',
      'Custom reporting',
      'On-premise options',
      'White-label solutions'
    ],
    buttonText: 'Upgrade to Master',
    priceId: process.env.NEXT_PUBLIC_STRIPE_MASTER_500K_PRICE_ID || 'price_master_500k'
  }
];

const creditPacks = [
  {
    id: 'credits_10k',
    name: '10K Credits',
    price: '$10',
    credits: '10,000',
    description: 'Perfect for small projects',
    priceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_10K_PRICE_ID || 'price_credits_10k'
  },
  {
    id: 'credits_50k',
    name: '50K Credits',
    price: '$40',
    credits: '50,000',
    description: 'Great value for medium workloads',
    priceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_50K_PRICE_ID || 'price_credits_50k'
  },
  {
    id: 'credits_100k',
    name: '100K Credits',
    price: '$75',
    credits: '100,000',
    description: 'Best value for large projects',
    priceId: process.env.NEXT_PUBLIC_STRIPE_CREDITS_100K_PRICE_ID || 'price_credits_100k'
  }
];

export default function BillingPage() {
  const router = useRouter();
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const supabase = createSupabaseClient();

  useEffect(() => {
    loadBillingInfo();
  }, []);

  const loadBillingInfo = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }

      const response = await fetch('/api/billing/info', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load billing information');
      }

      const data = await response.json();
      setBillingInfo(data);
    } catch (err) {
      setError('Failed to load billing information');
      console.error('Error loading billing info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (priceId: string, mode: 'subscription' | 'payment' = 'subscription') => {
    try {
      setProcessingPayment(priceId);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/billing?success=true`,
          cancel_url: `${window.location.origin}/billing?canceled=true`,
          mode: mode
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      window.location.href = data.url;
      
    } catch (err) {
      console.error('Error creating checkout session:', err);
      alert('Failed to start checkout process');
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleManageBilling = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch('/api/billing/create-portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          return_url: `${window.location.origin}/billing`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const data = await response.json();
      window.location.href = data.url;
      
    } catch (err) {
      console.error('Error creating portal session:', err);
      alert('Failed to open billing portal');
    }
  };

  const getCurrentPlan = () => {
    if (!billingInfo) return null;
    return subscriptionPlans.find(plan => plan.id === billingInfo.plan_type);
  };

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'free': return <Shield className="h-6 w-6" />;
      case 'pro': return <Zap className="h-6 w-6" />;
      case 'master_100k':
      case 'master_250k':
      case 'master_500k': return <Crown className="h-6 w-6" />;
      case 'enterprise': return <Star className="h-6 w-6" />;
      default: return <Shield className="h-6 w-6" />;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'master_100k':
      case 'master_250k':
      case 'master_500k': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Container>
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading billing information...</p>
            </div>
          </div>
        </Container>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <Container>
          <div className="max-w-2xl mx-auto pt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <X className="h-5 w-5 text-red-500" />
                  Error Loading Billing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button onClick={loadBillingInfo} variant="outline">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </Container>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Container>
        <div className="max-w-7xl mx-auto pt-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Billing & Credits</h1>
            <p className="text-muted-foreground text-lg">
              Manage your subscription and credit balance
            </p>
          </div>

          {/* Current Plan & Credits */}
          {billingInfo && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getPlanIcon(billingInfo.plan_type)}
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className={getPlanColor(billingInfo.plan_type)}>
                      {getCurrentPlan()?.name || 'Free'}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {billingInfo.monthly_email_limit.toLocaleString()} emails/month
                    </p>
                    {billingInfo.subscription_status !== 'active' && (
                      <Badge variant="destructive">
                        {billingInfo.subscription_status}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Credits Remaining
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {billingInfo.credits_balance.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      credits available
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ 
                          width: `${Math.min((billingInfo.credits_balance / billingInfo.monthly_email_limit) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Last Payment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {billingInfo.last_payment_date ? (
                      <p className="text-sm">
                        {new Date(billingInfo.last_payment_date).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No payments yet
                      </p>
                    )}
                    {billingInfo.plan_type !== 'free' && (
                      <Button 
                        onClick={handleManageBilling} 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                      >
                        Manage Billing
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Credit Usage Warning */}
          {billingInfo && billingInfo.credits_balance < 1000 && (
            <Alert>
              <AlertDescription>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  You're running low on credits! Consider upgrading your plan or purchasing a credit pack.
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Subscription Plans */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Subscription Plans</h2>
              <p className="text-muted-foreground">
                Choose the plan that fits your needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan) => {
                const isCurrentPlan = billingInfo?.plan_type === plan.id;
                const isPopular = plan.popular;
                
                return (
                  <Card key={plan.id} className={`relative ${isPopular ? 'ring-2 ring-primary' : ''}`}>
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader>
                      <CardTitle className="text-center">{plan.name}</CardTitle>
                      <div className="text-center">
                        <span className="text-3xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                      <CardDescription className="text-center">
                        {plan.credits}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className="w-full"
                        variant={isCurrentPlan ? "outline" : "default"}
                        disabled={isCurrentPlan || processingPayment === plan.priceId}
                        onClick={() => plan.priceId && handleUpgrade(plan.priceId)}
                      >
                        {processingPayment === plan.priceId && (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        )}
                        {isCurrentPlan ? 'Current Plan' : plan.buttonText}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Credit Packs */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Credit Packs</h2>
              <p className="text-muted-foreground">
                Need more credits? Purchase a pack that never expires
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {creditPacks.map((pack) => (
                <Card key={pack.id} className="text-center">
                  <CardHeader>
                    <CardTitle>{pack.name}</CardTitle>
                    <div className="text-3xl font-bold text-primary">
                      {pack.price}
                    </div>
                    <CardDescription>
                      {pack.credits} credits
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {pack.description}
                    </p>
                    
                    <Button 
                      className="w-full"
                      disabled={processingPayment === pack.priceId}
                      onClick={() => handleUpgrade(pack.priceId, 'payment')}
                    >
                      {processingPayment === pack.priceId && (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      )}
                      Buy Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          {billingInfo && billingInfo.recent_transactions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Recent Transactions</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {billingInfo.recent_transactions.map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={transaction.amount > 0 ? "default" : "secondary"}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Enterprise Plan */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Star className="h-8 w-8 text-yellow-600" />
                  <h3 className="text-2xl font-bold text-yellow-800">Enterprise Plan</h3>
                </div>
                <p className="text-yellow-700 max-w-2xl mx-auto">
                  Need more than 500K emails per month? Our enterprise plan includes custom pricing, 
                  dedicated support, API access, and white-label solutions.
                </p>
                <Button variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
                  Contact Sales
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </ProtectedRoute>
  );
}

