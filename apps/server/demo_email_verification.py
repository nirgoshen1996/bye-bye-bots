#!/usr/bin/env python3
"""
Demo script for enhanced email verification and bot detection.
This script demonstrates the new email status functionality and configurable options.
"""

import sys
import os
from datetime import datetime

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from bot_rules import BotDetector, BotDetectionConfig
from models import ProcessingOptions

def demo_basic_email_verification():
    """Demonstrate basic email verification functionality."""
    print("🔍 Basic Email Verification Demo")
    print("=" * 50)
    
    # Initialize bot detector with default settings
    detector = BotDetector()
    
    # Test various email types
    test_emails = [
        "john.doe@gmail.com",           # Valid email
        "invalid-email",                # Invalid syntax
        "test@nonexistentdomain12345.com",  # No MX records
        "bot@mailinator.com",           # Disposable domain
        "test@company.com",             # Test local-part
        "admin@company.com",            # Role account
        "xq7k9m2n4p8r@company.com",    # High randomness
        "",                             # Empty email
        "user@tempmail.org",            # Another disposable domain
    ]
    
    for email in test_emails:
        email_status = detector.get_email_status(email)
        is_bot = detector.is_bot_email(email)
        
        print(f"📧 {email or '(empty)'}")
        print(f"   Status: {email_status}")
        print(f"   Bot: {is_bot}")
        print()

def demo_configurable_options():
    """Demonstrate configurable processing options."""
    print("⚙️ Configurable Options Demo")
    print("=" * 50)
    
    # Test different configurations
    configs = [
        {
            "name": "Default (Strict)",
            "options": ProcessingOptions(
                enable_syntax_check=True,
                enable_mx_check=True,
                treat_invalid_as_bots=True,
                mx_check_timeout=5.0,
                bot_threshold=1.0
            )
        },
        {
            "name": "Lenient (No MX Check)",
            "options": ProcessingOptions(
                enable_syntax_check=True,
                enable_mx_check=False,
                treat_invalid_as_bots=False,
                mx_check_timeout=5.0,
                bot_threshold=1.5
            )
        },
        {
            "name": "Very Strict",
            "options": ProcessingOptions(
                enable_syntax_check=True,
                enable_mx_check=True,
                treat_invalid_as_bots=True,
                mx_check_timeout=2.0,
                bot_threshold=0.5
            )
        }
    ]
    
    test_email = "test@nonexistentdomain12345.com"
    
    for config in configs:
        print(f"🔧 Configuration: {config['name']}")
        
        detector = BotDetector(config['options'])
        email_status = detector.get_email_status(test_email)
        is_bot = detector.is_bot_email(test_email)
        
        print(f"   Email: {test_email}")
        print(f"   Status: {email_status}")
        print(f"   Bot: {is_bot}")
        print(f"   Options: {config['options']}")
        print()

def demo_detailed_analysis():
    """Demonstrate detailed bot detection analysis."""
    print("📊 Detailed Analysis Demo")
    print("=" * 50)
    
    detector = BotDetector()
    
    test_cases = [
        ("john.doe@gmail.com", "John", "Doe"),
        ("bot@mailinator.com", "Bot", "User"),
        ("test@company.com", "Test", "User"),
        ("admin@company.com", "Admin", "User"),
        ("xq7k9m2n4p8r@company.com", "User", "Name"),
        ("invalid-email", "Invalid", "User"),
        ("test@nonexistentdomain12345.com", "Test", "User"),
    ]
    
    for email, first_name, last_name in test_cases:
        print(f"📧 Analyzing: {email}")
        print(f"   Name: {first_name} {last_name}")
        
        details = detector.get_detection_details(email, first_name, last_name)
        
        print(f"   Email Status: {details['email_status']}")
        print(f"   Bot Score: {details['score']:.2f}")
        print(f"   Is Bot: {details['is_bot']}")
        print(f"   Reason: {details['reason']}")
        
        if 'checks' in details['details']:
            print("   Detection Details:")
            for check_name, check_data in details['details']['checks'].items():
                if isinstance(check_data, dict) and 'result' in check_data:
                    print(f"     {check_name}: {check_data['result']}")
        
        print()

def demo_csv_processing_simulation():
    """Simulate CSV processing with the new functionality."""
    print("📁 CSV Processing Simulation Demo")
    print("=" * 50)
    
    # Simulate CSV data
    csv_data = [
        {"email": "john.doe@gmail.com", "first_name": "John", "last_name": "Doe", "company": "Gmail"},
        {"email": "bot@mailinator.com", "first_name": "Bot", "last_name": "User", "company": "Mailinator"},
        {"email": "test@company.com", "first_name": "Test", "last_name": "User", "company": "Company"},
        {"email": "admin@company.com", "first_name": "Admin", "last_name": "User", "company": "Company"},
        {"email": "invalid-email", "first_name": "Invalid", "last_name": "User", "company": "Company"},
        {"email": "test@nonexistentdomain12345.com", "first_name": "Test", "last_name": "User", "company": "Company"},
        {"email": "", "first_name": "NoName", "last_name": "User", "company": "Company"},
    ]
    
    # Process with different configurations
    configs = [
        ("Default", ProcessingOptions()),
        ("Lenient", ProcessingOptions(enable_mx_check=False, treat_invalid_as_bots=False)),
        ("Strict", ProcessingOptions(bot_threshold=0.5, treat_invalid_as_bots=True))
    ]
    
    for config_name, options in configs:
        print(f"🔧 Configuration: {config_name}")
        
        detector = BotDetector(options)
        
        # Simulate processing
        total_rows = len(csv_data)
        rows_with_email = 0
        valid_emails = 0
        invalid_syntax_emails = 0
        no_mx_emails = 0
        unknown_emails = 0
        bots_count = 0
        clean_count = 0
        
        for row in csv_data:
            email = row['email']
            first_name = row.get('first_name')
            last_name = row.get('last_name')
            
            if email and email.strip():
                rows_with_email += 1
                email_status = detector.get_email_status(email)
                is_bot = detector.is_bot_email(email, first_name, last_name)
                
                # Count email statuses
                if email_status == 'valid':
                    valid_emails += 1
                elif email_status == 'invalid_syntax':
                    invalid_syntax_emails += 1
                elif email_status == 'no_mx':
                    no_mx_emails += 1
                else:
                    unknown_emails += 1
                
                # Count bot status
                if is_bot:
                    bots_count += 1
                else:
                    clean_count += 1
            else:
                unknown_emails += 1
                clean_count += 1
        
        rows_without_email = total_rows - rows_with_email
        
        print(f"   Total Rows: {total_rows}")
        print(f"   Rows with Email: {rows_with_email}")
        print(f"   Rows without Email: {rows_without_email}")
        print(f"   Valid Emails: {valid_emails}")
        print(f"   Invalid Syntax: {invalid_syntax_emails}")
        print(f"   No MX Records: {no_mx_emails}")
        print(f"   Unknown: {unknown_emails}")
        print(f"   Bots Found: {bots_count}")
        print(f"   Clean Rows: {clean_count}")
        print()

def main():
    """Run all demos."""
    print("🚀 Enhanced Email Verification and Bot Detection Demo")
    print("=" * 60)
    print()
    
    try:
        demo_basic_email_verification()
        print()
        
        demo_configurable_options()
        print()
        
        demo_detailed_analysis()
        print()
        
        demo_csv_processing_simulation()
        print()
        
        print("✅ All demos completed successfully!")
        print()
        print("📋 Summary of New Features:")
        print("   • Email syntax validation via email-validator")
        print("   • MX record checking via dnspython")
        print("   • Configurable processing options")
        print("   • EMAIL_STATUS column in output CSVs")
        print("   • Enhanced summary.json with email status counts")
        print("   • Option to treat invalid emails as bots")
        print("   • Configurable bot detection threshold")
        print("   • MX check timeout configuration")
        
    except Exception as e:
        print(f"❌ Error during demo: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())

