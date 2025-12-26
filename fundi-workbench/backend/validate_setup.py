#!/usr/bin/env python3
"""
Startup validation script for FUNDI Backend.
Checks that all required dependencies and configurations are in place.
"""
import os
import shutil
import sys
from pathlib import Path


def check_python_version():
    """Check Python version is 3.12+."""
    print("🔍 Checking Python version...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 12):
        print(f"❌ Python 3.12+ required, found {version.major}.{version.minor}")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
    return True


def check_arduino_cli():
    """Check if Arduino CLI is installed and accessible."""
    print("\n🔍 Checking Arduino CLI...")
    arduino_cli = shutil.which("arduino-cli")
    if not arduino_cli:
        print("❌ arduino-cli not found in PATH")
        print("   Install from: https://arduino.github.io/arduino-cli/")
        return False
    print(f"✅ Arduino CLI found at: {arduino_cli}")
    return True


def check_env_file():
    """Check if .env file exists and has required variables."""
    print("\n🔍 Checking environment configuration...")
    env_path = Path(__file__).parent / ".env"
    env_example = Path(__file__).parent / ".env.example"
    
    if not env_path.exists():
        print("⚠️  .env file not found")
        if env_example.exists():
            print(f"   Copy {env_example} to {env_path} and configure it")
        return False
    
    print("✅ .env file exists")
    
    # Check for API key
    with open(env_path) as f:
        content = f.read()
        if "GEMINI_API_KEY" not in content:
            print("⚠️  GEMINI_API_KEY not found in .env")
            return False
        if "your_api_key_here" in content:
            print("⚠️  GEMINI_API_KEY is set to placeholder value")
            print("   Get your API key from: https://makersuite.google.com/app/apikey")
            return False
    
    print("✅ GEMINI_API_KEY is configured")
    return True


def check_requirements():
    """Check if Python dependencies are installed."""
    print("\n🔍 Checking Python dependencies...")
    try:
        import fastapi
        import uvicorn
        import google.genai
        import pydantic_settings
        print("✅ All required Python packages are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing Python package: {e}")
        print("   Run: pip install -r requirements.txt")
        return False


def main():
    """Run all validation checks."""
    print("=" * 60)
    print("FUNDI Backend - Startup Validation")
    print("=" * 60)
    
    checks = [
        check_python_version(),
        check_arduino_cli(),
        check_requirements(),
        check_env_file(),
    ]
    
    print("\n" + "=" * 60)
    if all(checks):
        print("✅ All checks passed! Backend is ready to run.")
        print("=" * 60)
        print("\nTo start the backend, run:")
        print("  uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload")
        return 0
    else:
        print("❌ Some checks failed. Please fix the issues above.")
        print("=" * 60)
        return 1


if __name__ == "__main__":
    sys.exit(main())
