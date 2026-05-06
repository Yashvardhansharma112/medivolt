# SETUP GUIDE - Medical Data Extraction Pipeline

## Overview
This pipeline extracts medical data from PDFs/images, structures it, calculates health scores, and displays it on the dashboard.

## Step 1: Install Dependencies

```bash
cd "d:\Clg Major\medical repository website\predict"
pip install -r requirements.txt
```

## Step 2: (Optional but Recommended) Install Tesseract OCR

For better PDF/image OCR accuracy:

### Windows:
1. Download installer from: https://github.com/UB-Mannheim/tesseract/wiki
2. Run: `tesseract-ocr-w64-setup-v5.x.exe`
3. Add to Python (the library should auto-detect it)

### macOS/Linux:
```bash
# macOS
brew install tesseract

# Linux
sudo apt-get install tesseract-ocr
```

## Step 3: (Optional) Set Up Gemini API Key

For better data extraction accuracy using Google's Gemini API:

1. Get free API key from: https://aistudio.google.com/app/apikey
2. Set environment variable:

```bash
# Windows (Command Prompt)
set GEMINI_API_KEY=your-api-key-here

# Windows (PowerShell)
$env:GEMINI_API_KEY='your-api-key-here'

# macOS/Linux
export GEMINI_API_KEY=your-api-key-here
```

## Step 4: Start the Services

### Terminal 1 - Start Node.js Backend Server (if not already running)
```bash
cd "d:\Clg Major\medical repository website\server"
npm run dev
```
Server runs on: http://localhost:5000

### Terminal 2 - Start React Frontend (if not already running)
```bash
cd "d:\Clg Major\medical repository website"
npm run dev
```
Frontend runs on: http://localhost:8080

### Terminal 3 - Start Python Prediction Service
```bash
cd "d:\Clg Major\medical repository website\predict"
uvicorn predict_service:app --reload --host 0.0.0.0 --port 8000
```
Service runs on: http://localhost:8000

## Step 5: Test the Pipeline

```bash
cd "d:\Clg Major\medical repository website\predict"
python test_health_analysis.py
```

## What the Pipeline Does

### 1. **OCR (Text Extraction)**
- Reads PDFs using PyPDF2
- Reads images using Tesseract OCR
- Falls back to regex if OCR unavailable

### 2. **Data Structuring**
- Uses Gemini API to parse text into structured JSON
- Extracts: test names, values, units, reference ranges
- Falls back to regex patterns if API unavailable

### 3. **Health Scoring**
- Compares extracted values to medical standards
- Calculates score: 0-100
- Determines risk level: low, moderate, high, critical
- Provides metric-by-metric breakdown

### 4. **Frontend Display**
- Shows health score (0-100)
- Color-coded risk levels
- Displays extracted metrics
- Shows document preview
- Indicates which tests are normal/abnormal

## API Endpoints

### Health Check
```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "ok",
  "ocr_available": true,
  "gemini_configured": true
}
```

### Analyze Report
```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"file_url":"http://localhost:5000/uploads/filename.pdf"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "fasting_glucose": {"value": 95, "unit": "mg/dL", ...},
    "hba1c": {"value": 5.2, "unit": "%", ...}
  },
  "health_score": {
    "score": 82.5,
    "risk_level": "low",
    "metrics": [...]
  },
  "ocr_preview": "..."
}
```

## Troubleshooting

### "Tesseract not found"
- Either install Tesseract (see Step 2) or it will fall back to regex

### "Gemini API error"
- Verify API key is set correctly
- Check internet connection
- Will fall back to regex if API unavailable

### "No analysis results yet"
- Upload a medical report in Records page
- Wait 5-10 seconds for auto-analysis
- Check browser console for errors

### PDF/Image Processing Fails
- Ensure file is valid PDF or image format
- File size should be < 10MB
- Check file is not corrupted

## Features

✅ Free (except optional Gemini API for better accuracy)
✅ Works offline (with limited accuracy)
✅ Handles PDFs and images
✅ Medical standards database included
✅ Comprehensive health scoring
✅ Auto-analyzes on upload
✅ Caches results (no reprocessing)
