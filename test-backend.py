#!/usr/bin/env python3
"""
Test script for the Bot Cleaner FastAPI backend.
This script tests the basic functionality and the new /process endpoint.
"""

import requests
import json
import os
import tempfile
import pandas as pd
from io import StringIO

# Configuration
BASE_URL = "http://localhost:8000"
TEST_CSV_CONTENT = """email,first_name,last_name,company
john.doe@example.com,John,Doe,Acme Corp
jane.smith@company.com,Jane,Smith,Tech Inc
test@test.com,Test,User,Test Corp
bot@bot.com,Bot,User,Bot Inc
admin@admin.com,Admin,User,Admin Corp
info@info.com,Info,User,Info Corp
support@support.com,Support,User,Support Corp
noreply@noreply.com,NoReply,User,NoReply Corp
user123@domain.com,User,Name,Domain Corp
,NoEmail,User,NoEmail Corp"""

def test_health_endpoint():
    """Test the health check endpoint."""
    print("Testing /health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Health check error: {e}")
        return False

def test_root_endpoint():
    """Test the root endpoint."""
    print("\nTesting / endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Root endpoint passed: {data}")
            return True
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Root endpoint error: {e}")
        return False

def test_process_endpoint():
    """Test the /process endpoint with a sample CSV file."""
    print("\nTesting /process endpoint...")
    
    try:
        # Create a temporary CSV file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as temp_file:
            temp_file.write(TEST_CSV_CONTENT)
            temp_file_path = temp_file.name
        
        # Prepare the request
        mapping = {
            "email": "email",
            "firstName": "first_name",
            "lastName": "last_name"
        }
        
        files = {
            'file': ('test_data.csv', open(temp_file_path, 'rb'), 'text/csv')
        }
        
        data = {
            'mapping': json.dumps(mapping)
        }
        
        # Make the request
        response = requests.post(f"{BASE_URL}/process", files=files, data=data)
        
        # Clean up temp file
        os.unlink(temp_file_path)
        
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            if 'application/zip' in content_type:
                print("✅ Process endpoint passed: ZIP file received")
                print(f"   Content-Type: {content_type}")
                print(f"   Content-Length: {len(response.content)} bytes")
                
                # Check for proper headers
                content_disposition = response.headers.get('content-disposition', '')
                if 'attachment' in content_disposition and 'filename' in content_disposition:
                    print("✅ Proper download headers present")
                else:
                    print("⚠️  Download headers may be incomplete")
                
                return True
            else:
                print(f"⚠️  Process endpoint returned non-ZIP content: {content_type}")
                return False
        else:
            print(f"❌ Process endpoint failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data}")
            except:
                print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Process endpoint error: {e}")
        return False

def test_error_handling():
    """Test error handling with invalid requests."""
    print("\nTesting error handling...")
    
    # Test with invalid file type
    try:
        mapping = {"email": "email"}
        files = {
            'file': ('test.txt', b'This is not a CSV file', 'text/plain')
        }
        data = {'mapping': json.dumps(mapping)}
        
        response = requests.post(f"{BASE_URL}/process", files=files, data=data)
        
        if response.status_code == 400:
            print("✅ Invalid file type error handled correctly")
        else:
            print(f"⚠️  Invalid file type should return 400, got {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error handling test failed: {e}")
    
    # Test with invalid mapping
    try:
        files = {
            'file': ('test.csv', TEST_CSV_CONTENT.encode(), 'text/csv')
        }
        data = {'mapping': 'invalid json'}
        
        response = requests.post(f"{BASE_URL}/process", files=files, data=data)
        
        if response.status_code == 400:
            print("✅ Invalid mapping error handled correctly")
        else:
            print(f"⚠️  Invalid mapping should return 400, got {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error handling test failed: {e}")

def main():
    """Run all tests."""
    print("🚀 Starting Bot Cleaner Backend Tests")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health_endpoint),
        ("Root Endpoint", test_root_endpoint),
        ("Process Endpoint", test_process_endpoint),
        ("Error Handling", test_error_handling),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} crashed: {e}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary")
    print("=" * 50)
    
    passed = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name}: {status}")
        if result:
            passed += 1
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

