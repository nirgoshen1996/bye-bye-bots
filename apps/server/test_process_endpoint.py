#!/usr/bin/env python3
"""
Test script for the updated /process endpoint.
Tests the new implementation with memory-safe streaming and UTF-8 BOM encoding.
"""

import requests
import json
import os
import tempfile
import zipfile
import io
import pandas as pd

# Configuration
BASE_URL = "http://localhost:8000"

def create_test_csv():
    """Create a test CSV file with various email patterns."""
    test_data = {
        'email': [
            'john.doe@gmail.com',
            'jane.smith@company.com',
            'bot@mailinator.com',
            'test@company.com',
            'admin@company.com',
            'xq7k9m2n4p8r@company.com',
            'noreply@tempmail.org',
            'user123@outlook.com',
            'info@company.com',
            '',  # Empty email
            'invalid-email',  # Invalid email
        ],
        'first_name': [
            'John',
            'Jane',
            'Bot',
            'Test',
            'Admin',
            'User',
            'NoReply',
            'User',
            'Info',
            'NoName',
            'Invalid',
        ],
        'last_name': [
            'Doe',
            'Smith',
            'User',
            'User',
            'User',
            'Name',
            'User',
            'Name',
            'Person',
            'User',
            'User',
        ],
        'company': [
            'Gmail',
            'Company',
            'Mailinator',
            'Company',
            'Company',
            'Company',
            'TempMail',
            'Outlook',
            'Company',
            'Company',
            'Company',
        ]
    }
    
    df = pd.DataFrame(test_data)
    return df

def test_process_endpoint():
    """Test the /process endpoint with the new implementation."""
    print("🧪 Testing Updated /process Endpoint")
    print("=" * 50)
    
    try:
        # Create test CSV
        df = create_test_csv()
        
        # Create temporary CSV file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as temp_file:
            df.to_csv(temp_file.name, index=False)
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
        
        print("📤 Sending request to /process endpoint...")
        
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
                
                # Test ZIP contents
                test_zip_contents(response.content)
                
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
        import traceback
        traceback.print_exc()
        return False

def test_zip_contents(zip_content):
    """Test the contents of the ZIP file."""
    print("\n📦 Testing ZIP File Contents")
    print("-" * 30)
    
    try:
        # Read ZIP from memory
        with zipfile.ZipFile(io.BytesIO(zip_content)) as zip_file:
            # List all files in ZIP
            file_list = zip_file.namelist()
            print(f"Files in ZIP: {file_list}")
            
            # Check required files
            required_files = ['clean.csv', 'bots.csv', 'annotated.csv', 'summary.json']
            for file_name in required_files:
                if file_name in file_list:
                    print(f"✅ {file_name} found")
                else:
                    print(f"❌ {file_name} missing")
            
            # Test CSV files
            test_csv_files(zip_file)
            
            # Test summary.json
            test_summary_json(zip_file)
            
    except Exception as e:
        print(f"❌ Error testing ZIP contents: {e}")

def test_csv_files(zip_file):
    """Test the CSV files in the ZIP."""
    print("\n📊 Testing CSV Files")
    print("-" * 20)
    
    # Test clean.csv
    try:
        with zip_file.open('clean.csv') as f:
            clean_df = pd.read_csv(f, encoding='utf-8-sig')
            print(f"✅ clean.csv: {len(clean_df)} rows")
            print(f"   Columns: {list(clean_df.columns)}")
            if 'BOT' in clean_df.columns:
                bot_counts = clean_df['BOT'].value_counts()
                print(f"   BOT column values: {dict(bot_counts)}")
    except Exception as e:
        print(f"❌ Error reading clean.csv: {e}")
    
    # Test bots.csv
    try:
        with zip_file.open('bots.csv') as f:
            bots_df = pd.read_csv(f, encoding='utf-8-sig')
            print(f"✅ bots.csv: {len(bots_df)} rows")
            if 'BOT' in bots_df.columns:
                bot_counts = bots_df['BOT'].value_counts()
                print(f"   BOT column values: {dict(bot_counts)}")
    except Exception as e:
        print(f"❌ Error reading bots.csv: {e}")
    
    # Test annotated.csv
    try:
        with zip_file.open('annotated.csv') as f:
            annotated_df = pd.read_csv(f, encoding='utf-8-sig')
            print(f"✅ annotated.csv: {len(annotated_df)} rows")
            if 'BOT' in annotated_df.columns:
                bot_counts = annotated_df['BOT'].value_counts()
                print(f"   BOT column values: {dict(bot_counts)}")
    except Exception as e:
        print(f"❌ Error reading annotated.csv: {e}")

def test_summary_json(zip_file):
    """Test the summary.json file."""
    print("\n📋 Testing Summary JSON")
    print("-" * 20)
    
    try:
        with zip_file.open('summary.json') as f:
            summary = json.load(f)
            print(f"✅ summary.json loaded successfully")
            print(f"   Total rows: {summary.get('total_rows', 'N/A')}")
            print(f"   Rows with email: {summary.get('rows_with_email', 'N/A')}")
            print(f"   Rows without email: {summary.get('rows_without_email', 'N/A')}")
            print(f"   Bots count: {summary.get('bots_count', 'N/A')}")
            print(f"   Clean count: {summary.get('clean_count', 'N/A')}")
            print(f"   Timestamp: {summary.get('timestamp', 'N/A')}")
    except Exception as e:
        print(f"❌ Error reading summary.json: {e}")

def test_encoding_compatibility():
    """Test that CSV files are Excel-compatible with UTF-8 BOM."""
    print("\n🔤 Testing Encoding Compatibility")
    print("-" * 30)
    
    try:
        # Create test CSV
        df = create_test_csv()
        
        # Create temporary CSV file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as temp_file:
            df.to_csv(temp_file.name, index=False)
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
            # Test ZIP contents for encoding
            with zipfile.ZipFile(io.BytesIO(response.content)) as zip_file:
                # Test one CSV file for BOM
                with zip_file.open('clean.csv') as f:
                    content = f.read()
                    if content.startswith(b'\xef\xbb\xbf'):  # UTF-8 BOM
                        print("✅ UTF-8 BOM detected - Excel compatible")
                    else:
                        print("⚠️  No UTF-8 BOM detected")
                    
                    # Try to decode as UTF-8
                    try:
                        decoded = content.decode('utf-8-sig')
                        print("✅ UTF-8 decoding successful")
                    except Exception as e:
                        print(f"❌ UTF-8 decoding failed: {e}")
        else:
            print(f"❌ Request failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Encoding test failed: {e}")

def main():
    """Run all tests."""
    print("🚀 Testing Updated Bot Cleaner /process Endpoint")
    print("=" * 60)
    
    # Test basic functionality
    basic_success = test_process_endpoint()
    
    # Test encoding compatibility
    encoding_success = test_encoding_compatibility()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Results Summary")
    print("=" * 60)
    
    if basic_success:
        print("✅ Basic Functionality: PASSED")
    else:
        print("❌ Basic Functionality: FAILED")
    
    if encoding_success:
        print("✅ Encoding Compatibility: PASSED")
    else:
        print("❌ Encoding Compatibility: FAILED")
    
    # Overall success
    overall_success = basic_success and encoding_success
    if overall_success:
        print("\n🎉 All tests passed! The updated /process endpoint is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")
    
    return overall_success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)

