# medical_extraction_pipeline.py
"""
Medical Report Data Extraction Pipeline
- Extracts text from PDFs/images using OCR
- Structures data using Gemini API
- Calculates health scores against medical standards
- Returns structured JSON for database storage
"""

import io
import json
import logging
import os
import re
from typing import Any, Dict, List, Optional

import PyPDF2
import pytesseract
import requests
from PIL import Image

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Medical standards - reference ranges for common tests
MEDICAL_STANDARDS = {
    "fasting_glucose": {"unit": "mg/dL", "normal_min": 70, "normal_max": 100, "weight": 15},
    "hba1c": {"unit": "%", "normal_min": 4, "normal_max": 5.6, "weight": 20},
    "total_cholesterol": {"unit": "mg/dL", "normal_min": 0, "normal_max": 200, "weight": 10},
    "hdl": {"unit": "mg/dL", "normal_min": 40, "normal_max": 300, "weight": 10},
    "ldl": {"unit": "mg/dL", "normal_min": 0, "normal_max": 100, "weight": 15},
    "triglycerides": {"unit": "mg/dL", "normal_min": 0, "normal_max": 150, "weight": 10},
    "systolic_bp": {"unit": "mmHg", "normal_min": 0, "normal_max": 120, "weight": 10},
    "diastolic_bp": {"unit": "mmHg", "normal_min": 0, "normal_max": 80, "weight": 10},
    "hemoglobin": {"unit": "g/dL", "normal_min": 12, "normal_max": 17.5, "weight": 10},
    "white_blood_cells": {"unit": "K/uL", "normal_min": 4.5, "normal_max": 11, "weight": 5},
    "platelets": {"unit": "K/uL", "normal_min": 150, "normal_max": 400, "weight": 5},
    "bmi": {"unit": "kg/m²", "normal_min": 18.5, "normal_max": 24.9, "weight": 5},
}

class MedicalExtractionPipeline:
    def __init__(self, gemini_api_key: str = None):
        # Priority: 1. Passed argument, 2. Environment variable
        self.gemini_api_key = gemini_api_key or os.getenv("GEMINI_API_KEY")
        self.ocr_enabled = self._check_tesseract()
        
    def _check_tesseract(self) -> bool:
        """Check if Tesseract is installed"""
        try:
            # Explicitly set path if not in system PATH (Common on Windows)
            if os.path.exists(r'C:\Program Files\Tesseract-OCR\tesseract.exe'):
                pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
            pytesseract.get_tesseract_version()
            logger.info("Tesseract OCR is available")
            return True
        except pytesseract.TesseractNotFoundError:
            logger.warning("Tesseract not found. Will attempt to process images anyway.")
            return False

    def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        """Extract text from PDF"""
        try:
            pdf_file = io.BytesIO(pdf_bytes)
            reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
            logger.info(f"Extracted {len(text)} characters from PDF")
            return text
        except Exception as e:
            logger.error(f"Error extracting from PDF: {e}")
            return ""

    def extract_text_from_image(self, image_bytes: bytes) -> str:
        """Extract text from image using OCR"""
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            if not self.ocr_enabled:
                logger.warning("Tesseract not available, cannot perform OCR")
                return ""
            text = pytesseract.image_to_string(image)
            logger.info(f"Extracted {len(text)} characters from image")
            return text
        except Exception as e:
            logger.error(f"Error extracting from image: {e}")
            return ""

    def extract_text_from_file(self, file_bytes: bytes, file_name: str) -> str:
        """Auto-detect file type and extract text"""
        if file_name.lower().endswith('.pdf'):
            return self.extract_text_from_pdf(file_bytes)
        else:  # Assume image
            return self.extract_text_from_image(file_bytes)

    def structure_data_with_gemini(self, ocr_text: str) -> Optional[Dict[str, Any]]:
        """Use Gemini API to structure extracted text into medical data"""
        if not self.gemini_api_key:
            logger.warning("Gemini API key not configured. Using regex extraction.")
            return self._extract_with_regex(ocr_text)

        if not ocr_text or len(ocr_text.strip()) < 10:
            logger.warning("OCR text too short for Gemini API. Using regex extraction.")
            return self._extract_with_regex(ocr_text)
        
        try:
            system_prompt = """You are a medical data extraction assistant. 
            Extract all medical test results from the provided text.
            Return ONLY a valid JSON object with test names as keys and values as objects containing:
            - "value": the numeric value
            - "unit": the unit of measurement
            - "reference_range": the normal range (e.g., "70-100")
            
            Example:
            {
                "fasting_glucose": {"value": 95, "unit": "mg/dL", "reference_range": "70-100"},
                "hba1c": {"value": 5.2, "unit": "%", "reference_range": "4.0-5.6"}
            }
            
            If unsure, omit the field. Return empty {} if no medical data found."""
            
            response = requests.post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent",
                json={
                    "contents": [{
                        "parts": [
                            {"text": system_prompt},
                            {"text": f"Extract medical data from:\n\n{ocr_text}"}
                        ]
                    }],
                    "generationConfig": {"temperature": 0}
                },
                params={"key": self.gemini_api_key},
                timeout=30
            )
            
            if response.status_code != 200:
                logger.error(f"Gemini API error: {response.text}")
                logger.info("Falling back to regex extraction due to API error")
                return self._extract_with_regex(ocr_text)
            
            result = response.json()
            content = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "{}")
            
            # Extract JSON from response
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                try:
                    extracted_data = json.loads(json_match.group())
                    logger.info(f"Gemini extracted {len(extracted_data)} fields from report")
                    return extracted_data
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse Gemini response JSON: {e}")
                    logger.info("Falling back to regex extraction due to JSON parsing error")
                    return self._extract_with_regex(ocr_text)
            else:
                logger.warning("No JSON found in Gemini response")
                logger.info("Falling back to regex extraction")
                return self._extract_with_regex(ocr_text)
            
        except Exception as e:
            logger.error(f"Error with Gemini API: {e}. Falling back to regex.")
            return self._extract_with_regex(ocr_text)

    def _extract_with_regex(self, text: str) -> Dict[str, Any]:
        """Fallback regex-based extraction for common patterns - enhanced version"""
        if not text or len(text.strip()) < 5:
            logger.warning("Text too short for regex extraction")
            return {}

        # Convert to lowercase for better matching
        text_lower = text.lower()

        patterns = {
            "fasting_glucose": [
                r"fasting\s*glucose[\s:]*(\d+(?:\.\d+)?)",
                r"fbs[\s:]*(\d+(?:\.\d+)?)",
                r"glucose[\s:]*(\d+(?:\.\d+)?)\s*mg/dl",
                r"blood\s*glucose[\s:]*(\d+(?:\.\d+)?)"
            ],
            "hba1c": [
                r"hba1c[\s:]*(\d+(?:\.\d+)?)",
                r"hemoglobin\s*a1c[\s:]*(\d+(?:\.\d+)?)",
                r"glycated\s*hemoglobin[\s:]*(\d+(?:\.\d+)?)"
            ],
            "total_cholesterol": [
                r"total\s*cholesterol[\s:]*(\d+(?:\.\d+)?)",
                r"cholesterol[\s:]*(\d+(?:\.\d+)?)\s*mg/dl"
            ],
            "hdl": [
                r"hdl[\s:]*(\d+(?:\.\d+)?)",
                r"hdl\s*cholesterol[\s:]*(\d+(?:\.\d+)?)"
            ],
            "ldl": [
                r"ldl[\s:]*(\d+(?:\.\d+)?)",
                r"ldl\s*cholesterol[\s:]*(\d+(?:\.\d+)?)"
            ],
            "triglycerides": [
                r"triglyceride[\s:]*(\d+(?:\.\d+)?)",
                r"triglycerides[\s:]*(\d+(?:\.\d+)?)"
            ],
            "hemoglobin": [
                r"hemoglobin[\s:]*(\d+(?:\.\d+)?)",
                r"hb[\s:]*(\d+(?:\.\d+)?)"
            ],
            "systolic_bp": [
                r"systolic[\s:]*(\d+(?:\.\d+)?)",
                r"bp[\s:]*(\d+(?:\.\d+)?)\s*/",
                r"blood\s*pressure[\s:]*(\d+(?:\.\d+)?)"
            ],
            "diastolic_bp": [
                r"diastolic[\s:]*(\d+(?:\.\d+)?)",
                r"/\s*(\d+(?:\.\d+)?)\s*mmhg"
            ]
        }

        extracted = {}
        for key, pattern_list in patterns.items():
            for pattern in pattern_list:
                match = re.search(pattern, text_lower, re.IGNORECASE)
                if match:
                    value = float(match.group(1))
                    extracted[key] = {
                        "value": value,
                        "unit": MEDICAL_STANDARDS.get(key, {}).get("unit", ""),
                        "reference_range": f"{MEDICAL_STANDARDS.get(key, {}).get('normal_min', '?')}-{MEDICAL_STANDARDS.get(key, {}).get('normal_max', '?')}"
                    }
                    logger.info(f"Extracted {key}: {value}")
                    break  # Found a match, move to next test

        logger.info(f"Regex extraction found {len(extracted)} medical values")
        return extracted

    def calculate_health_score(self, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculate a comprehensive health score (0-100) based on extracted values
        and their deviation from medical standards
        """
        if not extracted_data:
            logger.info("No extracted data available for scoring")
            return {
                "score": 50,  # Neutral score when no data
                "risk_level": "unknown",
                "metrics": [],
                "total_tests": 0,
                "message": "No medical data could be extracted from the document"
            }
        
        metrics = []
        total_weight = 0
        weighted_score = 0
        
        for test_name, test_value_obj in extracted_data.items():
            if test_name not in MEDICAL_STANDARDS:
                continue
            
            try:
                value = float(test_value_obj.get("value", 0))
                standard = MEDICAL_STANDARDS[test_name]
                
                # Calculate deviation from normal range
                if value < standard["normal_min"]:
                    deviation_pct = ((standard["normal_min"] - value) / standard["normal_min"]) * 100
                    status = "low"
                elif value > standard["normal_max"]:
                    deviation_pct = ((value - standard["normal_max"]) / standard["normal_max"]) * 100
                    status = "high"
                else:
                    deviation_pct = 0
                    status = "normal"
                
                # Scoring: start with 100, deduct based on deviation
                score_deduction = min(100, deviation_pct * 0.5)  # 0.5% deduction per 1% deviation
                test_score = max(0, 100 - score_deduction)
                
                # Weighted contribution
                weight = standard.get("weight", 5)
                total_weight += weight
                weighted_score += test_score * weight
                
                metrics.append({
                    "test_name": test_name,
                    "value": value,
                    "unit": test_value_obj.get("unit", ""),
                    "reference_range": test_value_obj.get("reference_range", ""),
                    "status": status,
                    "score": round(test_score, 2)
                })
                
            except (ValueError, KeyError) as e:
                logger.warning(f"Error scoring {test_name}: {e}")
                continue
        
        # Calculate overall health score
        if total_weight > 0:
            overall_score = round(weighted_score / total_weight, 2)
        else:
            overall_score = 0
        
        # Determine risk level
        if overall_score >= 80:
            risk_level = "low"
        elif overall_score >= 60:
            risk_level = "moderate"
        elif overall_score >= 40:
            risk_level = "high"
        else:
            risk_level = "critical"
        
        return {
            "score": overall_score,
            "risk_level": risk_level,
            "metrics": metrics,
            "total_tests": len(metrics)
        }

    def process_file(self, file_bytes: bytes, file_name: str) -> Dict[str, Any]:
        """Complete pipeline: download → OCR → structure → score"""
        logger.info(f"Processing file: {file_name}")
        
        # Step 1: Extract text
        ocr_text = self.extract_text_from_file(file_bytes, file_name)
        if not ocr_text:
            logger.error("Failed to extract text from file")
            return {
                "success": False,
                "error": "Could not extract text from file",
                "ocr_preview": ""
            }
        
        # Step 2: Structure data
        structured_data = self.structure_data_with_gemini(ocr_text)
        if not structured_data:
            logger.warning("No structured data extracted, but continuing with empty data for scoring")
            structured_data = {}  # Continue with empty dict for health scoring
        
        # Step 3: Calculate health score
        health_score = self.calculate_health_score(structured_data)

        # Ensure we always return success with some data
        return {
            "success": True,
            "extracted_data": structured_data,
            "health_score": health_score,
            "ocr_preview": ocr_text[:500] if ocr_text else "No text extracted"
        }
