#!/usr/bin/env python3
"""
Test script to verify the FastAPI setup works correctly.
Run this to test if all dependencies are available.
"""

import sys
import importlib

def test_imports():
    """Test if all required packages can be imported."""
    required_packages = [
        'fastapi',
        'uvicorn',
        'pandas',
        'pydantic',
        'python_multipart'
    ]
    
    print("Testing package imports...")
    failed_imports = []
    
    for package in required_packages:
        try:
            importlib.import_module(package)
            print(f"✅ {package}")
        except ImportError as e:
            print(f"❌ {package}: {e}")
            failed_imports.append(package)
    
    if failed_imports:
        print(f"\n❌ Failed to import: {', '.join(failed_imports)}")
        print("Please install missing packages with: pip install -r apps/server/requirements.txt")
        return False
    else:
        print("\n✅ All packages imported successfully!")
        return True

def test_fastapi_app():
    """Test if the FastAPI app can be created."""
    try:
        from apps.server.main import app
        print("✅ FastAPI app created successfully!")
        print(f"   App title: {app.title}")
        print(f"   App version: {app.version}")
        return True
    except Exception as e:
        print(f"❌ Failed to create FastAPI app: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Bot Cleaner SaaS Setup\n")
    
    # Test imports
    imports_ok = test_imports()
    
    if imports_ok:
        # Test FastAPI app
        app_ok = test_fastapi_app()
        
        if app_ok:
            print("\n🎉 Setup test completed successfully!")
            print("You can now run the development servers:")
            print("  - Web: npm run dev (from root directory)")
            print("  - Server: npm run dev:server (from root directory)")
            print("  - Or use Docker: docker compose up --build")
        else:
            print("\n❌ FastAPI app test failed!")
    else:
        print("\n❌ Package import test failed!")
    
    print("\n" + "="*50)

