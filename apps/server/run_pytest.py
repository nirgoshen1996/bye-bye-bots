#!/usr/bin/env python3
"""
Test runner for Bot Cleaner Backend using pytest.
This script runs all pytest tests and provides a summary.
"""

import subprocess
import sys
import os

def run_pytest():
    """Run pytest tests and return success status."""
    print("🧪 Running Bot Cleaner Backend Tests with pytest")
    print("=" * 60)
    
    try:
        # Change to the server directory
        server_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(server_dir)
        
        # Run pytest with verbose output
        result = subprocess.run([
            sys.executable, "-m", "pytest",
            "tests/",
            "-v",
            "--tb=short",
            "--color=yes"
        ], capture_output=False, text=True)
        
        return result.returncode == 0
        
    except Exception as e:
        print(f"❌ Error running pytest: {e}")
        return False

def run_specific_test(test_name):
    """Run a specific test by name."""
    print(f"🧪 Running specific test: {test_name}")
    print("=" * 60)
    
    try:
        server_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(server_dir)
        
        result = subprocess.run([
            sys.executable, "-m", "pytest",
            f"tests/test_api.py::{test_name}",
            "-v",
            "--tb=short",
            "--color=yes"
        ], capture_output=False, text=True)
        
        return result.returncode == 0
        
    except Exception as e:
        print(f"❌ Error running test {test_name}: {e}")
        return False

def main():
    """Main test runner function."""
    print("🚀 Bot Cleaner Backend Test Suite")
    print("=" * 60)
    
    # Check if specific test was requested
    if len(sys.argv) > 1:
        test_name = sys.argv[1]
        success = run_specific_test(test_name)
    else:
        success = run_pytest()
    
    # Print summary
    print("\n" + "=" * 60)
    print("📊 Test Results Summary")
    print("=" * 60)
    
    if success:
        print("✅ All tests passed! The backend is working correctly.")
    else:
        print("❌ Some tests failed. Check the output above for details.")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

