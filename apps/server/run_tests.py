#!/usr/bin/env python3
"""
Test runner for the Bot Cleaner backend.
This script runs all unit tests and provides a summary of results.
"""

import sys
import os
import subprocess
import unittest

def run_bot_rules_tests():
    """Run the bot rules unit tests."""
    print("🧪 Running Bot Rules Unit Tests")
    print("=" * 50)
    
    # Add the app directory to the path
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))
    
    # Import and run tests
    from tests.test_bot_rules import TestBotDetectionConfig, TestBotDetector, TestIntegration
    
    # Create test suite
    test_suite = unittest.TestSuite()
    test_suite.addTest(unittest.makeSuite(TestBotDetectionConfig))
    test_suite.addTest(unittest.makeSuite(TestBotDetector))
    test_suite.addTest(unittest.makeSuite(TestIntegration))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    return result.wasSuccessful()

def run_pytest():
    """Run tests using pytest if available."""
    try:
        print("\n🔬 Running tests with pytest...")
        result = subprocess.run([sys.executable, '-m', 'pytest', 'tests/', '-v'], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ pytest tests passed!")
            return True
        else:
            print("❌ pytest tests failed!")
            print(result.stdout)
            print(result.stderr)
            return False
    except Exception as e:
        print(f"⚠️  pytest not available: {e}")
        return False

def main():
    """Main test runner function."""
    print("🚀 Bot Cleaner Backend Test Suite")
    print("=" * 50)
    
    # Run bot rules tests
    bot_rules_success = run_bot_rules_tests()
    
    # Try to run pytest if available
    pytest_success = run_pytest()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary")
    print("=" * 50)
    
    if bot_rules_success:
        print("✅ Bot Rules Tests: PASSED")
    else:
        print("❌ Bot Rules Tests: FAILED")
    
    if pytest_success:
        print("✅ Pytest Tests: PASSED")
    else:
        print("⚠️  Pytest Tests: SKIPPED or FAILED")
    
    # Overall success
    overall_success = bot_rules_success
    if overall_success:
        print("\n🎉 All tests passed! Bot detection system is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")
    
    return overall_success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

