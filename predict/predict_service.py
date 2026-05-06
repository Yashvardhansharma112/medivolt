# predict_service.py - FastAPI wrapper for medical extraction pipeline
import logging
import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    load_dotenv = None

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from medical_extraction_pipeline import MedicalExtractionPipeline
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env file if python-dotenv is installed
if load_dotenv:
    load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="MediVault Medical Extraction Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize pipeline
gemini_api_key = os.environ.get("GEMINI_API_KEY")
if not gemini_api_key:
    logger.warning("GEMINI_API_KEY not set - will use regex-based extraction (limited)")
    
pipeline = MedicalExtractionPipeline(gemini_api_key=gemini_api_key)

class PredictRequest(BaseModel):
    file_url: str

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "ocr_available": pipeline.ocr_enabled,
        "gemini_configured": bool(gemini_api_key)
    }

@app.post("/analyze")
def analyze_report(payload: PredictRequest):
    """
    Analyze a medical report (PDF or image)
    Input: file_url - URL to the uploaded file
    Output: structured medical data + health score
    """
    try:
        logger.info(f"Analyzing report from: {payload.file_url}")
        
        # Validate URL (security) - allow localhost for dev, S3 for production
        allowed_prefixes = ("http://localhost", "http://127.0.0.1", "https://", "http://medivault-backend-env")
        if not payload.file_url.startswith(allowed_prefixes):
            raise HTTPException(
                status_code=400,
                detail="Invalid file URL"
            )
        
        # Download file
        response = requests.get(payload.file_url, timeout=30)
        if response.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to download file: {response.status_code}"
            )
        
        file_bytes = response.content
        file_name = payload.file_url.split("/")[-1]
        
        # Process through pipeline
        result = pipeline.process_file(file_bytes, file_name)
        
        if not result.get("success"):
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Unknown error during processing")
            )
        
        return {
            "success": True,
            "data": result.get("extracted_data"),
            "health_score": result.get("health_score"),
            "ocr_preview": result.get("ocr_preview"),
            "file_name": file_name
        }
        
    except requests.RequestException as e:
        logger.error(f"Network error: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to access file: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

# For backward compatibility with frontend expecting /predict-url
@app.post("/predict-url")
def predict_url(payload: PredictRequest):
    """Backward compatible endpoint"""
    return analyze_report(payload)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
