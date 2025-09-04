"""
Stripe service for handling subscriptions, credit packs, and billing
"""

import os
import stripe
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
from supabase import create_client, Client

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Initialize Supabase
supabase_client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

class StripeService:
    def __init__(self):
        self.webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
        
        # Product IDs (create these in Stripe dashboard)
        self.products = {
            'pro_monthly': os.getenv("STRIPE_PRO_PRODUCT_ID"),
            'master_100k': os.getenv("STRIPE_MASTER_100K_PRODUCT_ID"),
            'master_250k': os.getenv("STRIPE_MASTER_250K_PRODUCT_ID"),
            'master_500k': os.getenv("STRIPE_MASTER_500K_PRODUCT_ID"),
            'credits_10k': os.getenv("STRIPE_CREDITS_10K_PRODUCT_ID"),
            'credits_50k': os.getenv("STRIPE_CREDITS_50K_PRODUCT_ID"),
            'credits_100k': os.getenv("STRIPE_CREDITS_100K_PRODUCT_ID"),
        }
        
        # Credit amounts for each pack
        self.credit_amounts = {
            'credits_10k': 10000,
            'credits_50k': 50000,
            'credits_100k': 100000,
        }
        
        # Monthly limits for each plan
        self.plan_limits = {
            'free': 1000,
            'pro': 50000,
            'master_100k': 100000,
            'master_250k': 250000,
            'master_500k': 500000,
            'enterprise': 3000000,
        }

    async def create_checkout_session(
        self, 
        user_id: str, 
        price_id: str, 
        success_url: str, 
        cancel_url: str,
        mode: str = 'subscription'
    ) -> Dict[str, Any]:
        """Create a Stripe checkout session"""
        try:
            # Get or create Stripe customer
            customer_id = await self._get_or_create_customer(user_id)
            
            session_data = {
                'customer': customer_id,
                'success_url': success_url,
                'cancel_url': cancel_url,
                'mode': mode,
                'line_items': [{'price': price_id, 'quantity': 1}],
                'metadata': {
                    'user_id': user_id,
                    'price_id': price_id
                }
            }
            
            if mode == 'subscription':
                session_data['subscription_data'] = {
                    'metadata': {'user_id': user_id}
                }
            elif mode == 'payment':
                session_data['payment_intent_data'] = {
                    'metadata': {'user_id': user_id}
                }
            
            session = stripe.checkout.Session.create(**session_data)
            return {'session_id': session.id, 'url': session.url}
            
        except Exception as e:
            raise Exception(f"Failed to create checkout session: {str(e)}")

    async def create_portal_session(self, user_id: str, return_url: str) -> str:
        """Create a customer portal session for managing subscriptions"""
        try:
            customer_id = await self._get_or_create_customer(user_id)
            
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url
            )
            
            return session.url
            
        except Exception as e:
            raise Exception(f"Failed to create portal session: {str(e)}")

    async def handle_webhook(self, payload: bytes, sig_header: str) -> bool:
        """Handle Stripe webhook events"""
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, self.webhook_secret
            )
            
            event_type = event['type']
            
            if event_type == 'checkout.session.completed':
                await self._handle_checkout_completed(event['data']['object'])
            elif event_type == 'invoice.payment_succeeded':
                await self._handle_invoice_payment_succeeded(event['data']['object'])
            elif event_type == 'invoice.payment_failed':
                await self._handle_invoice_payment_failed(event['data']['object'])
            elif event_type == 'customer.subscription.created':
                await self._handle_subscription_created(event['data']['object'])
            elif event_type == 'customer.subscription.updated':
                await self._handle_subscription_updated(event['data']['object'])
            elif event_type == 'customer.subscription.deleted':
                await self._handle_subscription_deleted(event['data']['object'])
            
            return True
            
        except Exception as e:
            print(f"Webhook error: {str(e)}")
            return False

    async def _handle_checkout_completed(self, session: Dict[str, Any]):
        """Handle completed checkout sessions"""
        user_id = session['metadata']['user_id']
        price_id = session['metadata']['price_id']
        
        if price_id.startswith('credits_'):
            # Handle credit pack purchase
            credit_amount = self.credit_amounts.get(price_id, 0)
            if credit_amount > 0:
                await self._add_credits(user_id, credit_amount, session['id'])
        else:
            # Handle subscription creation
            await self._update_subscription_status(user_id, session['subscription'])

    async def _handle_invoice_payment_succeeded(self, invoice: Dict[str, Any]):
        """Handle successful invoice payments"""
        subscription_id = invoice['subscription']
        user_id = await self._get_user_id_by_subscription(subscription_id)
        
        if user_id:
            # Refresh monthly credits
            await self._refresh_monthly_credits(user_id)
            await self._update_last_payment_date(user_id)

    async def _handle_invoice_payment_failed(self, invoice: Dict[str, Any]):
        """Handle failed invoice payments"""
        subscription_id = invoice['subscription']
        user_id = await self._get_user_id_by_subscription(subscription_id)
        
        if user_id:
            await self._update_subscription_status(user_id, subscription_id, 'past_due')

    async def _handle_subscription_created(self, subscription: Dict[str, Any]):
        """Handle new subscription creation"""
        user_id = await self._get_user_id_by_subscription(subscription['id'])
        if user_id:
            await self._update_subscription_status(user_id, subscription['id'])
            await self._refresh_monthly_credits(user_id)

    async def _handle_subscription_updated(self, subscription: Dict[str, Any]):
        """Handle subscription updates"""
        user_id = await self._get_user_id_by_subscription(subscription['id'])
        if user_id:
            await self._update_subscription_status(user_id, subscription['id'])

    async def _handle_subscription_deleted(self, subscription: Dict[str, Any]):
        """Handle subscription cancellation"""
        user_id = await self._get_user_id_by_subscription(subscription['id'])
        if user_id:
            await self._downgrade_to_free(user_id)

    async def _get_or_create_customer(self, user_id: str) -> str:
        """Get existing Stripe customer or create new one"""
        try:
            # Check if user already has a Stripe customer ID
            result = supabase_client.table('users').select('stripe_customer_id').eq('id', user_id).execute()
            
            if result.data and result.data[0].get('stripe_customer_id'):
                return result.data[0]['stripe_customer_id']
            
            # Get user email
            user_result = supabase_client.table('users').select('email').eq('id', user_id).execute()
            if not user_result.data:
                raise Exception("User not found")
            
            email = user_result.data[0]['email']
            
            # Create new Stripe customer
            customer = stripe.Customer.create(
                email=email,
                metadata={'user_id': user_id}
            )
            
            # Update user record
            supabase_client.table('users').update({
                'stripe_customer_id': customer.id
            }).eq('id', user_id).execute()
            
            return customer.id
            
        except Exception as e:
            raise Exception(f"Failed to get/create customer: {str(e)}")

    async def _add_credits(self, user_id: str, amount: int, session_id: str):
        """Add credits to user account"""
        try:
            # Update credit balance
            result = supabase_client.table('users').select('credits_balance').eq('id', user_id).execute()
            current_balance = result.data[0]['credits_balance'] if result.data else 0
            
            new_balance = current_balance + amount
            
            supabase_client.table('users').update({
                'credits_balance': new_balance
            }).eq('id', user_id).execute()
            
            # Record transaction
            supabase_client.table('credit_transactions').insert({
                'user_id': user_id,
                'transaction_type': 'purchase',
                'amount': amount,
                'description': f'Purchased {amount:,} credits',
                'stripe_checkout_session_id': session_id
            }).execute()
            
        except Exception as e:
            raise Exception(f"Failed to add credits: {str(e)}")

    async def _refresh_monthly_credits(self, user_id: str):
        """Refresh monthly credits based on subscription plan"""
        try:
            result = supabase_client.table('users').select('plan_type').eq('id', user_id).execute()
            plan_type = result.data[0]['plan_type'] if result.data else 'free'
            
            monthly_limit = self.plan_limits.get(plan_type, 1000)
            
            # Update credits balance
            supabase_client.table('users').update({
                'credits_balance': monthly_limit,
                'monthly_email_limit': monthly_limit
            }).eq('id', user_id).execute()
            
            # Record transaction
            supabase_client.table('credit_transactions').insert({
                'user_id': user_id,
                'transaction_type': 'subscription_renewal',
                'amount': monthly_limit,
                'description': f'Monthly credit refresh for {plan_type} plan'
            }).execute()
            
        except Exception as e:
            raise Exception(f"Failed to refresh monthly credits: {str(e)}")

    async def _update_subscription_status(self, user_id: str, subscription_id: str, status: str = 'active'):
        """Update user subscription status"""
        try:
            # Get subscription details from Stripe
            subscription = stripe.Subscription.retrieve(subscription_id)
            
            # Determine plan type from price ID
            price_id = subscription['items']['data'][0]['price']['id']
            plan_type = self._get_plan_type_from_price(price_id)
            
            # Update user record
            supabase_client.table('users').update({
                'stripe_subscription_id': subscription_id,
                'subscription_status': status,
                'plan_type': plan_type,
                'monthly_email_limit': self.plan_limits.get(plan_type, 1000)
            }).eq('id', user_id).execute()
            
        except Exception as e:
            raise Exception(f"Failed to update subscription status: {str(e)}")

    async def _downgrade_to_free(self, user_id: str):
        """Downgrade user to free plan"""
        try:
            supabase_client.table('users').update({
                'plan_type': 'free',
                'subscription_status': 'canceled',
                'stripe_subscription_id': None,
                'monthly_email_limit': 1000
            }).eq('id', user_id).execute()
            
        except Exception as e:
            raise Exception(f"Failed to downgrade user: {str(e)}")

    async def _update_last_payment_date(self, user_id: str):
        """Update last payment date"""
        try:
            supabase_client.table('users').update({
                'last_payment_date': datetime.now(timezone.utc).isoformat()
            }).eq('id', user_id).execute()
            
        except Exception as e:
            raise Exception(f"Failed to update payment date: {str(e)}")

    async def _get_user_id_by_subscription(self, subscription_id: str) -> Optional[str]:
        """Get user ID by Stripe subscription ID"""
        try:
            result = supabase_client.table('users').select('id').eq('stripe_subscription_id', subscription_id).execute()
            return result.data[0]['id'] if result.data else None
        except Exception:
            return None

    def _get_plan_type_from_price(self, price_id: str) -> str:
        """Get plan type from Stripe price ID"""
        # This mapping should match your Stripe price IDs
        price_mapping = {
            os.getenv("STRIPE_PRO_PRICE_ID"): "pro",
            os.getenv("STRIPE_MASTER_100K_PRICE_ID"): "master_100k",
            os.getenv("STRIPE_MASTER_250K_PRICE_ID"): "master_250k",
            os.getenv("STRIPE_MASTER_500K_PRICE_ID"): "master_500k",
        }
        return price_mapping.get(price_id, "free")

    async def get_user_billing_info(self, user_id: str) -> Dict[str, Any]:
        """Get user's billing information"""
        try:
            result = supabase_client.table('users').select(
                'plan_type, credits_balance, subscription_status, last_payment_date, monthly_email_limit'
            ).eq('id', user_id).execute()
            
            if not result.data:
                raise Exception("User not found")
            
            user_data = result.data[0]
            
            # Get recent credit transactions
            transactions_result = supabase_client.table('credit_transactions').select(
                'transaction_type, amount, description, created_at'
            ).eq('user_id', user_id).order('created_at', desc=True).limit(5).execute()
            
            return {
                'plan_type': user_data['plan_type'],
                'credits_balance': user_data['credits_balance'],
                'subscription_status': user_data['subscription_status'],
                'last_payment_date': user_data['last_payment_date'],
                'monthly_email_limit': user_data['monthly_email_limit'],
                'recent_transactions': transactions_result.data or []
            }
            
        except Exception as e:
            raise Exception(f"Failed to get billing info: {str(e)}")

    async def deduct_credits(self, user_id: str, amount: int, run_id: str):
        """Deduct credits for processing a file"""
        try:
            # Check if user has enough credits
            result = supabase_client.table('users').select('credits_balance').eq('id', user_id).execute()
            current_balance = result.data[0]['credits_balance'] if result.data else 0
            
            if current_balance < amount:
                raise Exception("Insufficient credits")
            
            # Deduct credits
            new_balance = current_balance - amount
            supabase_client.table('users').update({
                'credits_balance': new_balance
            }).eq('id', user_id).execute()
            
            # Update run record
            supabase_client.table('runs').update({
                'credits_used': amount
            }).eq('id', run_id).execute()
            
            # Record transaction
            supabase_client.table('credit_transactions').insert({
                'user_id': user_id,
                'transaction_type': 'usage',
                'amount': -amount,
                'description': f'Used {amount} credits for file processing'
            }).execute()
            
        except Exception as e:
            raise Exception(f"Failed to deduct credits: {str(e)}")

# Global instance
stripe_service = StripeService()

