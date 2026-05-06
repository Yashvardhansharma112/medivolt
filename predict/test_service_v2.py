import requests
from urllib.parse import quote

# Test if we can access uploaded files
file_name = "1748175511998-patient report 1.jpg"
test_url = f"http://localhost:5000/uploads/{file_name}"
encoded_url = f"http://localhost:5000/uploads/{quote(file_name)}"

print(f"Original URL: {test_url}")
print(f"Encoded URL: {encoded_url}")

# Test both URLs
working_url = None
for url_name, url in [("Original", test_url), ("Encoded", encoded_url)]:
    print(f"\nTesting {url_name} URL...")
    try:
        response = requests.get(url, timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type', 'unknown')}")
        print(f"Content-Length: {len(response.content)} bytes")

        # Check if it's a valid image
        if response.status_code == 200:
            from PIL import Image
            import io
            try:
                img = Image.open(io.BytesIO(response.content))
                print(f"Image format: {img.format}")
                print(f"Image size: {img.size}")
                print("✓ File is a valid image")
                working_url = url
                break  # Use this URL for prediction test
            except Exception as e:
                print(f"✗ File is not a valid image: {e}")
        else:
            print("✗ Could not access file")

    except Exception as e:
        print(f"Error accessing file: {e}")

# Test prediction service with the working URL
if working_url:
    print("\nTesting prediction service...")
    try:
        payload = {"file_url": working_url}
        print(f"Sending payload: {payload}")
        pred_response = requests.post("http://localhost:8000/predict-url", json=payload, timeout=60)
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
else:
    print("No working URL found for testing prediction service")