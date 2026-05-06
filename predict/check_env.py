import os

try:
    from dotenv import load_dotenv
    load_dotenv()
    print('python-dotenv is installed and .env loaded.')
except ImportError:
    print('python-dotenv is NOT installed.')

print('OPENAI_API_KEY set:', 'OPENAI_API_KEY' in os.environ)
print('GEMINI_API_KEY set:', 'GEMINI_API_KEY' in os.environ)

print('MODEL_PATH exists:', os.path.exists('diabetes_logistic_regression_model.pkl'))
try:
    import joblib
    model = joblib.load('diabetes_logistic_regression_model.pkl')
    print('Model loaded successfully')
    print('Model type:', type(model))
except Exception as e:
    print('Model loading error:', e)