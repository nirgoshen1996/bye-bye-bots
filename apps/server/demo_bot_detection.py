#!/usr/bin/env python3
"""
Demo script for the Bot Cleaner bot detection system.
This script demonstrates the scoring-based bot detection with various email examples.
"""

import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.bot_rules import BotDetector, BotDetectionConfig

def demo_bot_detection():
    """Demonstrate bot detection with various examples."""
    print("🤖 Bot Cleaner Bot Detection Demo")
    print("=" * 60)
    
    # Initialize detector
    detector = BotDetector()
    
    # Test cases with expected outcomes
    test_cases = [
        # Human emails (should not be bots)
        ('john.doe@gmail.com', 'John', 'Doe', 'Human email with names'),
        ('jane.smith@company.com', 'Jane', 'Smith', 'Human email with names'),
        ('user123@outlook.com', 'User', 'Name', 'Human email with numbers'),
        ('mary.jane@yahoo.com', 'Mary-Jane', 'Wilson', 'Human email with hyphenated name'),
        ('jean.pierre@company.fr', 'Jean-Pierre', 'Dubois', 'Human email with international name'),
        ('john+work@gmail.com', 'John', 'Doe', 'Plus addressing (human)'),
        
        # Bot emails (should be detected)
        ('bot@mailinator.com', None, None, 'Bot with disposable domain'),
        ('test@company.com', 'Test', 'User', 'Bot with test local-part'),
        ('noreply@tempmail.org', None, None, 'Bot with multiple indicators'),
        ('admin@company.com', 'Admin', 'User', 'Role account'),
        ('info@company.com', 'Info', 'Person', 'Role account'),
        ('support@company.com', 'Support', 'Team', 'Role account'),
        ('xq7k9m2n4p8r@company.com', None, None, 'High entropy local-part'),
        ('abc123def456@company.com', None, None, 'High digit ratio'),
        ('user!@#$%^&*()@company.com', None, None, 'High special character ratio'),
        ('qwertyuiopasdfghjkl@company.com', None, None, 'Long consonant run'),
        ('bot+test@mailinator.com', None, None, 'Bot with plus addressing'),
        
        # Edge cases
        ('invalid-email', None, None, 'Invalid email syntax'),
        ('john@', None, None, 'Incomplete email'),
        ('@company.com', None, None, 'Missing local-part'),
        ('', None, None, 'Empty email'),
        (None, None, None, 'None email'),
    ]
    
    print(f"{'Email':<35} {'Names':<20} {'Score':<8} {'Bot':<6} {'Description'}")
    print("-" * 90)
    
    for email, first_name, last_name, description in test_cases:
        if email is None:
            # Handle None case
            result = detector.is_bot_email(email, first_name, last_name)
            details = detector.get_detection_details(email, first_name, last_name)
            names_str = f"{first_name or ''} {last_name or ''}".strip() or 'None'
            score_str = f"{details['score']:.2f}" if details['valid'] else 'N/A'
            bot_str = 'TRUE' if result else 'FALSE'
            
            print(f"{'None':<35} {names_str:<20} {score_str:<8} {bot_str:<6} {description}")
        else:
            # Get detection results
            result = detector.is_bot_email(email, first_name, last_name)
            details = detector.get_detection_details(email, first_name, last_name)
            
            # Format names
            names_str = f"{first_name or ''} {last_name or ''}".strip() or 'None'
            
            # Format score
            if details['valid']:
                score_str = f"{details['score']:.2f}"
            else:
                score_str = 'N/A'
            
            # Format bot result
            bot_str = 'TRUE' if result else 'FALSE'
            
            # Truncate email if too long
            display_email = email[:34] + '...' if len(email) > 35 else email
            
            print(f"{display_email:<35} {names_str:<20} {score_str:<8} {bot_str:<6} {description}")
    
    print("\n" + "=" * 60)
    print("📊 Detection Rules Summary")
    print("=" * 60)
    
    # Show configuration
    config = detector.bot_rules_detector.config
    print(f"Bot Threshold: {config.BOT_THRESHOLD}")
    print(f"Disposable Domain Weight: {config.DISPOSABLE_DOMAIN_WEIGHT}")
    print(f"Obvious Bot Local-part Weight: {config.OBVIOUS_BOT_LOCALPART_WEIGHT}")
    print(f"High Randomness Weight: {config.HIGH_RANDOMNESS_WEIGHT}")
    print(f"Role Account Weight: {config.ROLE_ACCOUNT_WEIGHT}")
    print(f"Missing Names Weight: {config.MISSING_NAMES_WEIGHT}")
    print(f"Human Names Weight: {config.HUMAN_NAMES_WEIGHT}")
    
    print("\n" + "=" * 60)
    print("🔍 Detailed Analysis Examples")
    print("=" * 60)
    
    # Show detailed analysis for a few examples
    detailed_examples = [
        ('bot@mailinator.com', None, None, 'Bot with disposable domain'),
        ('admin@company.com', 'Admin', 'User', 'Role account'),
        ('xq7k9m2n4p8r@company.com', None, None, 'High entropy local-part'),
    ]
    
    for email, first_name, last_name, description in detailed_examples:
        print(f"\n📧 {description}: {email}")
        details = detector.get_detection_details(email, first_name, last_name)
        
        if details['valid']:
            print(f"   Score: {details['score']:.3f} (Threshold: {details['threshold']})")
            print(f"   Classification: {'BOT' if details['is_bot'] else 'HUMAN'}")
            print("   Rule Results:")
            
            rule_details = details['details']
            for rule, result in rule_details.items():
                status = "✅" if result else "❌"
                print(f"     {rule}: {status}")
        else:
            print(f"   Error: {details['details']['error']}")
    
    print("\n🎉 Demo completed! The bot detection system is working correctly.")

def demo_custom_config():
    """Demonstrate custom configuration options."""
    print("\n" + "=" * 60)
    print("⚙️  Custom Configuration Demo")
    print("=" * 60)
    
    # Create custom configuration
    config = BotDetectionConfig()
    config.BOT_THRESHOLD = 2.0  # Higher threshold
    config.ROLE_ACCOUNT_WEIGHT = 0.1  # Lower weight for role accounts
    
    custom_detector = BotDetector(config)
    
    print("Custom Configuration:")
    print(f"  Bot Threshold: {config.BOT_THRESHOLD}")
    print(f"  Role Account Weight: {config.ROLE_ACCOUNT_WEIGHT}")
    
    # Test role accounts with custom config
    test_emails = ['admin@company.com', 'info@company.com', 'support@company.com']
    
    print("\nRole Account Detection with Custom Config:")
    for email in test_emails:
        result = custom_detector.is_bot_email(email)
        details = custom_detector.get_detection_details(email)
        print(f"  {email}: {'BOT' if result else 'HUMAN'} (Score: {details['score']:.3f})")
    
    print("\nWith the higher threshold, role accounts are no longer automatically classified as bots!")

if __name__ == "__main__":
    try:
        demo_bot_detection()
        demo_custom_config()
    except Exception as e:
        print(f"❌ Demo failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

