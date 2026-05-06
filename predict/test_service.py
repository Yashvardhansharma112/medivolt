import requests

# Test if we can access uploaded files
test_url = "http://localhost:5000/uploads/1748175511998-patient report 1.jpg"
print(f"Testing URL: {test_url}")

try:
    response = requests.get(test_url, timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Content-Type: {response.headers.get('content-type', 'unknown')}")
    print(f"Content-Length: {len(response.content)} bytes")

    # Check if it's a valid image
    if response.status_code == 200:
        import io

        from PIL import Image
        try:
            img = Image.open(io.BytesIO(response.content))
            print(f"Image format: {img.format}")
            print(f"Image size: {img.size}")
            print("✓ File is a valid image")
        except Exception as e:
            print(f"✗ File is not a valid image: {e}")
    else:
        print("✗ Could not access file")

except Exception as e:
    print(f"Error accessing file: {e}")

# Test prediction service
print("\nTesting prediction service...")
try:
    payload = {"file_url": test_url}
    pred_response = requests.post("http://localhost:8000/predict-url", json=payload, timeout=30)
    print(f"Prediction status: {pred_response.status_code}")
    if pred_response.status_code == 200:
        result = pred_response.json()
        print("✓ Prediction successful!")
        print(f"Prediction: {result.get('prediction')}")
        print(f"Confidence: {result.get('probabilities')}")
        print(f"Extracted fields: {result.get('extracted_fields')}")
        print(f"OCR preview: {result.get('ocr_preview')[:200]}...")
    else:
        print(f"✗ Prediction failed: {pred_response.text}")
except Exception as e:
    print(f"Error testing prediction: {e}")