"""
Unit tests for bot_rules.py module.
Tests all bot detection methods, scoring logic, and edge cases.
"""

import unittest
from unittest.mock import patch
import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.bot_rules import BotDetector, BotDetectionConfig


class TestBotDetectionConfig(unittest.TestCase):
    """Test the configuration class."""
    
    def test_default_config(self):
        """Test default configuration values."""
        config = BotDetectionConfig()
        
        self.assertEqual(config.BOT_THRESHOLD, 1.0)
        self.assertEqual(config.DISPOSABLE_DOMAIN_WEIGHT, 2.0)
        self.assertEqual(config.OBVIOUS_BOT_LOCALPART_WEIGHT, 1.5)
        self.assertEqual(config.HIGH_RANDOMNESS_WEIGHT, 1.0)
        self.assertEqual(config.ROLE_ACCOUNT_WEIGHT, 0.3)
        self.assertEqual(config.MISSING_NAMES_WEIGHT, 0.2)
        self.assertEqual(config.HUMAN_NAMES_WEIGHT, -0.1)
    
    def test_custom_config(self):
        """Test custom configuration values."""
        config = BotDetectionConfig()
        config.BOT_THRESHOLD = 2.0
        config.DISPOSABLE_DOMAIN_WEIGHT = 3.0
        
        self.assertEqual(config.BOT_THRESHOLD, 2.0)
        self.assertEqual(config.DISPOSABLE_DOMAIN_WEIGHT, 3.0)


class TestBotDetector(unittest.TestCase):
    """Test the BotDetector class."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.detector = BotDetector()
    
    def test_disposable_domains(self):
        """Test disposable domain detection."""
        # Test exact matches
        self.assertTrue(self.detector._is_disposable_domain('mailinator.com'))
        self.assertTrue(self.detector._is_disposable_domain('10minutemail.com'))
        self.assertTrue(self.detector._is_disposable_domain('guerrillamail.com'))
        self.assertTrue(self.detector._is_disposable_domain('yopmail.com'))
        
        # Test pattern matches
        self.assertTrue(self.detector._is_disposable_domain('tempmail.org'))
        self.assertTrue(self.detector._is_disposable_domain('temp-mail.net'))
        self.assertTrue(self.detector._is_disposable_domain('mailtemp.com'))
        self.assertTrue(self.detector._is_disposable_domain('spammail.org'))
        
        # Test non-disposable domains
        self.assertFalse(self.detector._is_disposable_domain('gmail.com'))
        self.assertFalse(self.detector._is_disposable_domain('yahoo.com'))
        self.assertFalse(self.detector._is_disposable_domain('outlook.com'))
        self.assertFalse(self.detector._is_disposable_domain('company.com'))
    
    def test_obvious_bot_localparts(self):
        """Test obvious bot local-part detection."""
        # Test bot indicators
        self.assertTrue(self.detector._is_obvious_bot_localpart('bot'))
        self.assertTrue(self.detector._is_obvious_bot_localpart('test'))
        self.assertTrue(self.detector._is_obvious_bot_localpart('noreply'))
        self.assertTrue(self.detector._is_obvious_bot_localpart('no-reply'))
        self.assertTrue(self.detector._is_obvious_bot_localpart('dummy'))
        self.assertTrue(self.detector._is_obvious_bot_localpart('example'))
        self.assertTrue(self.detector._is_obvious_bot_localpart('automation'))
        self.assertTrue(self.detector._is_obvious_bot_localpart('system'))
        
        # Test human-like local-parts
        self.assertFalse(self.detector._is_obvious_bot_localpart('john'))
        self.assertFalse(self.detector._is_obvious_bot_localpart('jane.doe'))
        self.assertFalse(self.detector._is_obvious_bot_localpart('user123'))
        self.assertFalse(self.detector._is_obvious_bot_localpart('contact'))
    
    def test_high_randomness(self):
        """Test high randomness detection."""
        # Test high randomness indicators
        self.assertTrue(self.detector._is_high_randomness('xq7k9m2n4p8r'))
        self.assertTrue(self.detector._is_high_randomness('abc123def456'))
        self.assertTrue(self.detector._is_high_randomness('user!@#$%^&*()'))
        self.assertTrue(self.detector._is_high_randomness('qwertyuiopasdfghjkl'))
        
        # Test normal local-parts
        self.assertFalse(self.detector._is_high_randomness('john'))
        self.assertFalse(self.detector._is_high_randomness('jane.doe'))
        self.assertFalse(self.detector._is_high_randomness('user123'))
        self.assertFalse(self.detector._is_high_randomness('contact'))
        
        # Test short local-parts (should not trigger randomness check)
        self.assertFalse(self.detector._is_high_randomness('abc123'))
    
    def test_role_accounts(self):
        """Test role account detection."""
        # Test role accounts
        self.assertTrue(self.detector._is_role_account('admin@company.com'))
        self.assertTrue(self.detector._is_role_account('info@company.com'))
        self.assertTrue(self.detector._is_role_account('support@company.com'))
        self.assertTrue(self.detector._is_role_account('contact@company.com'))
        self.assertTrue(self.detector._is_role_account('hello@company.com'))
        
        # Test non-role accounts
        self.assertFalse(self.detector._is_role_account('john@company.com'))
        self.assertFalse(self.detector._is_role_account('jane.doe@company.com'))
        self.assertFalse(self.detector._is_role_account('user123@company.com'))
    
    def test_names_look_human(self):
        """Test human name detection."""
        # Test human names
        self.assertTrue(self.detector._names_look_human('John', 'Doe'))
        self.assertTrue(self.detector._names_look_human('Jane', 'Smith'))
        self.assertTrue(self.detector._names_look_human('Mary-Jane', 'Wilson'))
        self.assertTrue(self.detector._names_look_human('Jean-Pierre', 'Dubois'))
        
        # Test non-human names
        self.assertFalse(self.detector._names_look_human('JOHN', 'DOE'))
        self.assertFalse(self.detector._names_look_human('john', 'doe'))
        self.assertFalse(self.detector._names_look_human('J', 'D'))
        self.assertFalse(self.detector._names_look_human('123', '456'))
        self.assertFalse(self.detector._names_look_human('', ''))
        self.assertFalse(self.detector._names_look_human(None, None))
    
    def test_name_scoring(self):
        """Test name-based scoring."""
        # Test missing names with high entropy local-part
        score = self.detector._calculate_name_score(None, None, 'xq7k9m2n4p8r')
        self.assertGreater(score, 0)
        
        # Test human names (should reduce score slightly)
        score = self.detector._calculate_name_score('John', 'Doe', 'john.doe')
        self.assertLess(score, 0)
        
        # Test mixed case
        score = self.detector._calculate_name_score('John', None, 'john123')
        self.assertEqual(score, 0)  # No high entropy, no human names
    
    def test_email_validation(self):
        """Test email validation handling."""
        # Test valid emails
        self.assertFalse(self.detector.is_bot_email('john.doe@gmail.com'))
        self.assertFalse(self.detector.is_bot_email('jane@company.com'))
        
        # Test invalid emails (should be treated as bots)
        self.assertTrue(self.detector.is_bot_email('invalid-email'))
        self.assertTrue(self.detector.is_bot_email('john@'))
        self.assertTrue(self.detector.is_bot_email('@company.com'))
        self.assertTrue(self.detector.is_bot_email(''))
        self.assertTrue(self.detector.is_bot_email(None))
    
    def test_bot_classification(self):
        """Test complete bot classification."""
        # Test obvious bots
        self.assertTrue(self.detector.is_bot_email('bot@company.com'))
        self.assertTrue(self.detector.is_bot_email('test@mailinator.com'))
        self.assertTrue(self.detector.is_bot_email('noreply@tempmail.org'))
        self.assertTrue(self.detector.is_bot_email('xq7k9m2n4p8r@company.com'))
        
        # Test human emails
        self.assertFalse(self.detector.is_bot_email('john.doe@gmail.com'))
        self.assertFalse(self.detector.is_bot_email('jane.smith@company.com'))
        self.assertFalse(self.detector.is_bot_email('user123@outlook.com'))
        
        # Test role accounts (should be bots with default threshold)
        self.assertTrue(self.detector.is_bot_email('admin@company.com'))
        self.assertTrue(self.detector.is_bot_email('info@company.com'))
        self.assertTrue(self.detector.is_bot_email('support@company.com'))
    
    def test_custom_threshold(self):
        """Test custom threshold configuration."""
        # Create detector with higher threshold
        config = BotDetectionConfig()
        config.BOT_THRESHOLD = 2.0
        high_threshold_detector = BotDetector(config)
        
        # Role accounts should not be bots with higher threshold
        self.assertFalse(high_threshold_detector.is_bot_email('admin@company.com'))
        self.assertFalse(high_threshold_detector.is_bot_email('info@company.com'))
        
        # But obvious bots should still be detected
        self.assertTrue(high_threshold_detector.is_bot_email('bot@mailinator.com'))
        self.assertTrue(high_threshold_detector.is_bot_email('test@tempmail.org'))
    
    def test_detection_details(self):
        """Test detailed detection analysis."""
        details = self.detector.get_detection_details('bot@mailinator.com', 'Bot', 'User')
        
        self.assertEqual(details['email'], 'bot@mailinator.com')
        self.assertTrue(details['valid'])
        self.assertGreater(details['score'], 1.0)
        self.assertTrue(details['is_bot'])
        self.assertEqual(details['threshold'], 1.0)
        
        # Check individual rule results
        self.assertTrue(details['details']['disposable_domain'])
        self.assertTrue(details['details']['obvious_bot_localpart'])
    
    def test_plus_addressing(self):
        """Test plus addressing handling."""
        # Plus addressing should not be treated as bot by itself
        self.assertFalse(self.detector.is_bot_email('john+work@gmail.com'))
        self.assertFalse(self.detector.is_bot_email('jane+newsletter@company.com'))
        
        # But if other indicators are present, it should still be detected
        self.assertTrue(self.detector.is_bot_email('bot+test@mailinator.com'))
    
    def test_edge_cases(self):
        """Test various edge cases."""
        # Very long emails
        long_email = 'a' * 100 + '@company.com'
        self.assertTrue(self.detector.is_bot_email(long_email))
        
        # Emails with many special characters
        special_email = 'user!@#$%^&*()@company.com'
        self.assertTrue(self.detector.is_bot_email(special_email))
        
        # Emails with multiple @ symbols (invalid)
        self.assertTrue(self.detector.is_bot_email('user@company@domain.com'))
        
        # Emails with many dots
        self.assertTrue(self.detector.is_bot_email('user@company.domain.subdomain.com'))
    
    def test_scoring_breakdown(self):
        """Test scoring breakdown for different scenarios."""
        # Test disposable domain + bot local-part
        details = self.detector.get_detection_details('bot@mailinator.com')
        expected_score = (self.detector.config.DISPOSABLE_DOMAIN_WEIGHT + 
                         self.detector.config.OBVIOUS_BOT_LOCALPART_WEIGHT)
        self.assertAlmostEqual(details['score'], expected_score, places=1)
        
        # Test high randomness only
        details = self.detector.get_detection_details('xq7k9m2n4p8r@company.com')
        self.assertAlmostEqual(details['score'], self.detector.config.HIGH_RANDOMNESS_WEIGHT, places=1)
        
        # Test role account only
        details = self.detector.get_detection_details('admin@company.com')
        self.assertAlmostEqual(details['score'], self.detector.config.ROLE_ACCOUNT_WEIGHT, places=1)


class TestIntegration(unittest.TestCase):
    """Integration tests for the bot detection system."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.detector = BotDetector()
    
    def test_real_world_scenarios(self):
        """Test real-world email scenarios."""
        # Test cases with expected outcomes
        test_cases = [
            # (email, first_name, last_name, expected_is_bot, description)
            ('john.doe@gmail.com', 'John', 'Doe', False, 'Human email with names'),
            ('jane@company.com', 'Jane', None, False, 'Human email with first name only'),
            ('bot@mailinator.com', None, None, True, 'Bot email with disposable domain'),
            ('test@company.com', 'Test', 'User', True, 'Bot email with test local-part'),
            ('admin@company.com', 'Admin', 'User', True, 'Role account'),
            ('xq7k9m2n4p8r@company.com', None, None, True, 'High entropy local-part'),
            ('user123@outlook.com', 'User', 'Name', False, 'Human email with numbers'),
            ('noreply@tempmail.org', None, None, True, 'Bot email with multiple indicators'),
            ('contact@company.com', 'Contact', 'Person', True, 'Role account with human names'),
            ('john+work@gmail.com', 'John', 'Doe', False, 'Plus addressing'),
        ]
        
        for email, first_name, last_name, expected_is_bot, description in test_cases:
            with self.subTest(description):
                result = self.detector.is_bot_email(email, first_name, last_name)
                self.assertEqual(result, expected_is_bot, 
                               f"Failed for {description}: {email}")


if __name__ == '__main__':
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add test classes
    test_suite.addTest(unittest.makeSuite(TestBotDetectionConfig))
    test_suite.addTest(unittest.makeSuite(TestBotDetector))
    test_suite.addTest(unittest.makeSuite(TestIntegration))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    # Exit with appropriate code
    sys.exit(not result.wasSuccessful())

