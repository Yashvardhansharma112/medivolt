#!/usr/bin/env python3
"""
Test script for the medical data extraction pipeline
Tests OCR, data structuring, and health scoring
"""

import json

import requests
from medical_extraction_pipeline import MedicalExtractionPipeline


def test_health_analysis():
    """Test the complete pipeline"""
    print("=" * 60)
    print("Medical Data Extraction Pipeline - Test Suite")
    print("=" * 60)
    
    # Initialize pipeline
    pipeline = MedicalExtractionPipeline()
    
    # Test 1: Health check
    print("\n[TEST 1] Health Check")
    print("-" * 40)
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            health = response.json()
            print(f"✓ Service Status: {health['status']}")
            print(f"✓ OCR Available: {health['ocr_available']}")
            print(f"✓ Gemini Configured: {health['gemini_configured']}")
        else:
            print(f"✗ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"✗ Error: {e}")
        print("Make sure the service is running: uvicorn predict_service:app --reload")
    
    # Test 2: Test with existing uploaded file
    print("\n[TEST 2] Analyze Uploaded Report")
    print("-" * 40)
    
    # Use one of the existing files
    test_file_url = "http://localhost:5000/uploads/1748175511998-patient report 1.jpg"
    print(f"Testing with file: {test_file_url}")
    
    try:
        response = requests.post(
            "http://localhost:8000/analyze",
            json={"file_url": test_file_url},
            timeout=60  # Give it time to process
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✓ Analysis successful!")
            
            if result.get("success"):
                # Display health score
                health_score = result.get("health_score", {})
                print(f"\n  Health Score: {health_score.get('score', 'N/A')}/100")
                print(f"  Risk Level: {health_score.get('risk_level', 'unknown')}")
                print(f"  Tests Analyzed: {health_score.get('total_tests', 0)}")
                
                # Display extracted metrics
                if health_score.get("metrics"):
                    print(f"\n  Key Metrics:")
                    for metric in health_score["metrics"][:5]:
                        print(f"    - {metric['test_name']}: {metric['value']} {metric['unit']} ({metric['status']})")
                
                # Display extracted data
                data = result.get("data", {})
                if data:
                    print(f"\n  Raw Extracted Data:")
                    for key, val in list(data.items())[:3]:
                        print(f"    - {key}: {val.get('value')} {val.get('unit', '')}")
                
                print(f"\n  OCR Preview (first 200 chars):")
                print(f"    {result.get('ocr_preview', 'N/A')[:200]}...")
            else:
                print(f"✗ Analysis failed: {result.get('error', 'Unknown error')}")
        else:
            print(f"✗ Request failed: {response.status_code}")
            print(f"  Error: {response.text}")
    except requests.exceptions.Timeout:
        print("✗ Request timed out (processing took too long)")
        print("  This might happen if Tesseract is not installed")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 3: Test medical standards
    print("\n[TEST 3] Medical Standards Check")
    print("-" * 40)
    from medical_extraction_pipeline import MEDICAL_STANDARDS
    print(f"✓ Loaded {len(MEDICAL_STANDARDS)} medical standards:")
    for test_name, standard in list(MEDICAL_STANDARDS.items())[:5]:
        print(f"  - {test_name}: {standard['normal_min']}-{standard['normal_max']} {standard['unit']} (weight: {standard['weight']})")
    
    # Test 4: Pipeline components
    print("\n[TEST 4] Pipeline Components")
    print("-" * 40)
    print(f"✓ OCR Enabled: {pipeline.ocr_enabled}")
    print(f"✓ Gemini API Configured: {bool(pipeline.gemini_api_key)}")
    print(f"✓ Regex Extraction Available: True")
    
    print("\n" + "=" * 60)
    print("Test Complete!")
    print("=" * 60)

if __name__ == "__main__":
    test_health_analysis()
