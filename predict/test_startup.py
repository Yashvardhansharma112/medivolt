try:
    from predict_service import app
    print('App created successfully')
except Exception as e:
    print(f'Error creating app: {e}')
    import traceback
    traceback.print_exc()