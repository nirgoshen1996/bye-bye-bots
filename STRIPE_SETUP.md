# Stripe Billing Integration Setup Guide

This guide will help you set up Stripe-based billing for the BotCleaner SaaS application with subscription plans and credit packs.

## 🚀 **Features Implemented**

### **Subscription Plans**
- ✅ **Free Plan**: 1,000 emails/month
- ✅ **Pro Plan**: 50,000 emails/month ($29/month)
- ✅ **Master Plans**: 100K ($49), 250K ($99), 500K ($199)
- ✅ **Enterprise Plan**: Custom pricing (contact sales)

### **Credit System**
- ✅ **Pay-as-you-go Credits**: 10K ($10), 50K ($40), 100K ($75)
- ✅ **Credit Tracking**: Each email processed = 1 credit
- ✅ **Automatic Deduction**: Credits deducted during file processing
- ✅ **Credit Balance Display**: Prominent credit counter in dashboard

### **Billing Management**
- ✅ **Stripe Checkout**: Secure payment processing
- ✅ **Customer Portal**: Manage subscriptions and billing
- ✅ **Webhook Handling**: Automatic credit updates and plan changes
- ✅ **Transaction History**: Track all credit purchases and usage

## 🔧 **Setup Requirements**

### **1. Stripe Account Setup**
1. Create a [Stripe account](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Enable webhooks for the following events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### **2. Create Stripe Products & Prices**

#### **Subscription Products**
```bash
# Pro Plan
Product: "Pro Plan - 50K emails/month"
Price: $29/month recurring

# Master 100K
Product: "Master 100K - 100K emails/month"
Price: $49/month recurring

# Master 250K
Product: "Master 250K - 250K emails/month"
Price: $99/month recurring

# Master 500K
Product: "Master 500K - 500K emails/month"
Price: $199/month recurring
```

#### **Credit Pack Products**
```bash
# 10K Credits
Product: "10K Credits Pack"
Price: $10 one-time

# 50K Credits
Product: "50K Credits Pack"
Price: $40 one-time

# 100K Credits
Product: "100K Credits Pack"
Price: $75 one-time
```

### **3. Environment Variables**

#### **Web App (`apps/web/.env.local`)**
```env
# Existing Supabase config
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SERVER_URL=http://localhost:8000

# Stripe Price IDs (get these from Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_MASTER_100K_PRICE_ID=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_MASTER_250K_PRICE_ID=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_MASTER_500K_PRICE_ID=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_CREDITS_10K_PRICE_ID=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_CREDITS_50K_PRICE_ID=price_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_CREDITS_100K_PRICE_ID=price_xxxxxxxxxxxxx
```

#### **Server App (`apps/server/.env`)**
```env
# Existing config
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe Product IDs (get these from Stripe Dashboard)
STRIPE_PRO_PRODUCT_ID=prod_xxxxxxxxxxxxx
STRIPE_MASTER_100K_PRODUCT_ID=prod_xxxxxxxxxxxxx
STRIPE_MASTER_250K_PRODUCT_ID=prod_xxxxxxxxxxxxx
STRIPE_MASTER_500K_PRODUCT_ID=prod_xxxxxxxxxxxxx
STRIPE_CREDITS_10K_PRODUCT_ID=prod_xxxxxxxxxxxxx
STRIPE_CREDITS_50K_PRODUCT_ID=prod_xxxxxxxxxxxxx
STRIPE_CREDITS_100K_PRODUCT_ID=prod_xxxxxxxxxxxxx

# Stripe Price IDs (get these from Stripe Dashboard)
STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_MASTER_100K_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_MASTER_250K_PRICE_ID=price_xxxxxxxxxxxxx
STRIPE_MASTER_500K_PRICE_ID=price_xxxxxxxxxxxxx
```

### **4. Database Schema Update**
Run the updated SQL script in `apps/server/database/schema.sql` to add billing fields:

```sql
-- New fields added to users table
plan_type TEXT DEFAULT 'free'
credits_balance INTEGER DEFAULT 1000
subscription_status TEXT DEFAULT 'active'
stripe_customer_id TEXT
stripe_subscription_id TEXT
last_payment_date TIMESTAMP WITH TIME ZONE
monthly_email_limit INTEGER DEFAULT 1000

-- New credit_transactions table
CREATE TABLE credit_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    transaction_type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    description TEXT,
    stripe_payment_intent_id TEXT,
    stripe_checkout_session_id TEXT
);
```

## 🌐 **Webhook Configuration**

### **1. Stripe Webhook Endpoint**
Your webhook endpoint will be:
```
https://yourdomain.com/stripe/webhook
```

### **2. Webhook Events to Listen For**
- `checkout.session.completed` - Handle successful payments
- `invoice.payment_succeeded` - Refresh monthly credits
- `invoice.payment_failed` - Update subscription status
- `customer.subscription.created` - Activate new subscriptions
- `customer.subscription.updated` - Handle plan changes
- `customer.subscription.deleted` - Downgrade to free plan

### **3. Test Webhooks Locally**
Use Stripe CLI to test webhooks locally:
```bash
# Install Stripe CLI
stripe listen --forward-to localhost:8000/stripe/webhook

# This will give you a webhook secret to use in your .env file
```

## 🎯 **User Flow**

### **1. New User Experience**
1. User signs up → Gets 1,000 free credits
2. User uploads CSV → Credits deducted (1 per email)
3. When credits run low → Warning displayed
4. User can upgrade plan or buy credit packs

### **2. Subscription Management**
1. User clicks "Upgrade" → Redirected to Stripe Checkout
2. Payment successful → Plan upgraded, credits refreshed
3. Monthly renewal → Credits automatically refreshed
4. User can manage billing via Stripe Customer Portal

### **3. Credit Pack Purchases**
1. User selects credit pack → Redirected to Stripe Checkout
2. Payment successful → Credits added to balance
3. Credits never expire → Available for future use

## 🔒 **Security Features**

### **1. Credit Validation**
- ✅ **Pre-flight Check**: Verify credits before processing
- ✅ **Atomic Operations**: Credits deducted only after successful processing
- ✅ **User Isolation**: Users can only access their own credits

### **2. Payment Security**
- ✅ **Stripe Checkout**: PCI-compliant payment processing
- ✅ **Webhook Verification**: Signed webhook validation
- ✅ **JWT Authentication**: Secure API access

### **3. Data Protection**
- ✅ **Row Level Security**: Database-level access control
- ✅ **Encrypted Storage**: Sensitive data encrypted at rest
- ✅ **Audit Trail**: Complete transaction history

## 📱 **UI Components**

### **1. Credit Display (Dashboard)**
- Shows current credit balance
- Visual credit usage indicator
- Quick access to billing management
- Low credit warnings

### **2. Billing Page**
- Current plan overview
- Subscription plan comparison
- Credit pack options
- Transaction history
- Billing management portal

### **3. Credit Warnings**
- Low credit alerts (below 1,000)
- Critical credit warnings (below 100)
- Upgrade suggestions
- Quick purchase options

## 🚀 **Testing the Integration**

### **1. Start Both Applications**
```bash
# Terminal 1 - Web app
cd apps/web
npm install  # Install new Stripe dependencies
npm run dev

# Terminal 2 - Server app
cd apps/server
pip install -r requirements.txt  # Install Stripe dependency
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **2. Test Credit System**
1. Sign up for a new account
2. Check initial credit balance (1,000)
3. Upload a small CSV file
4. Verify credits are deducted
5. Check transaction history

### **3. Test Subscription Flow**
1. Go to `/billing` page
2. Click "Upgrade to Pro"
3. Complete Stripe checkout
4. Verify plan upgrade and credit refresh
5. Check subscription status

### **4. Test Credit Packs**
1. Purchase a credit pack
2. Verify credits added to balance
3. Check transaction record
4. Test credit usage

## 🎨 **Customization Options**

### **1. Plan Features**
- Modify feature lists for each plan
- Adjust pricing tiers
- Add custom plan types
- Include plan-specific limits

### **2. Credit System**
- Change credit-to-email ratio
- Add credit expiration rules
- Implement credit gifting
- Add bulk credit discounts

### **3. Billing UI**
- Customize plan comparison
- Add promotional banners
- Implement A/B testing
- Add custom checkout flows

## 🚨 **Production Considerations**

### **1. Environment Setup**
- Use production Stripe keys
- Configure production webhook endpoints
- Set up proper error monitoring
- Implement rate limiting

### **2. Monitoring & Analytics**
- Track conversion rates
- Monitor credit usage patterns
- Analyze subscription churn
- Monitor payment failures

### **3. Support & Documentation**
- Create billing FAQ
- Set up support escalation
- Document common issues
- Provide billing tutorials

## 🔍 **Troubleshooting**

### **Common Issues**

#### **1. Webhook Failures**
- Check webhook secret configuration
- Verify endpoint URL accessibility
- Monitor webhook delivery logs
- Test with Stripe CLI

#### **2. Credit Calculation Errors**
- Verify credit deduction logic
- Check transaction recording
- Monitor database consistency
- Validate user permissions

#### **3. Payment Processing Issues**
- Check Stripe API key configuration
- Verify product/price ID mapping
- Monitor Stripe dashboard for errors
- Check customer creation flow

### **Debug Tools**
- Stripe Dashboard logs
- Application error logs
- Database transaction logs
- Webhook delivery history

## 📚 **Additional Resources**

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Webhook Guide](https://stripe.com/docs/webhooks)
- [Stripe Checkout Integration](https://stripe.com/docs/payments/checkout)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/customer-portal)

---

## ✅ **Implementation Complete!**

The Stripe billing integration is now fully implemented with:
- **Secure payment processing** via Stripe Checkout
- **Flexible subscription plans** with automatic credit management
- **Pay-as-you-go credit packs** for additional flexibility
- **Comprehensive billing management** with customer portal access
- **Real-time credit tracking** and usage monitoring
- **Production-ready security** with webhook validation and RLS policies

Your BotCleaner SaaS now has a complete monetization system that can scale with your business needs!

