@echo off
setlocal enabledelayedexpansion

:: MediVault - AWS Deployment Script (Windows)
:: Prerequisites: AWS CLI, Docker Desktop, Node.js installed

set APP_NAME=medivault
set STACK_NAME=medivault-stack
set REGION=us-east-1

echo ======================================================
echo  MediVault AWS Deployment
echo ======================================================

:: Get AWS Account ID
for /f "tokens=*" %%i in ('aws sts get-caller-identity --query Account --output text') do set ACCOUNT_ID=%%i
set ECR_BASE=%ACCOUNT_ID%.dkr.ecr.%REGION%.amazonaws.com

echo Account: %ACCOUNT_ID%  Region: %REGION%
echo.

:: Prompt for secrets
set /p DB_PASSWORD="DB Password: "
set /p JWT_SECRET="JWT Secret: "
set /p EMAIL_USER="Email User (Gmail): "
set /p EMAIL_PASS="Email Password: "
set /p GEMINI_API_KEY="Gemini API Key: "

echo.
echo [1/7] Creating ECR repositories...
aws ecr describe-repositories --repository-names %APP_NAME%-backend --region %REGION% >nul 2>&1 || aws ecr create-repository --repository-name %APP_NAME%-backend --region %REGION% >nul
aws ecr describe-repositories --repository-names %APP_NAME%-predict --region %REGION% >nul 2>&1 || aws ecr create-repository --repository-name %APP_NAME%-predict --region %REGION% >nul
echo   Done.

echo.
echo [2/7] Logging in to ECR...
aws ecr get-login-password --region %REGION% | docker login --username AWS --password-stdin %ECR_BASE%

echo.
echo [3/7] Building and pushing Node.js backend...
set BACKEND_URI=%ECR_BASE%/%APP_NAME%-backend:latest
docker build -t %BACKEND_URI% server
docker push %BACKEND_URI%
echo   Pushed %BACKEND_URI%

echo.
echo [4/7] Building and pushing Python predict service...
set PREDICT_URI=%ECR_BASE%/%APP_NAME%-predict:latest
docker build -t %PREDICT_URI% predict
docker push %PREDICT_URI%
echo   Pushed %PREDICT_URI%

echo.
echo [5/7] Deploying CloudFormation stack (this takes ~10 min)...
aws cloudformation deploy ^
  --template-file infrastructure.yml ^
  --stack-name %STACK_NAME% ^
  --capabilities CAPABILITY_NAMED_IAM ^
  --region %REGION% ^
  --parameter-overrides ^
    AppName=%APP_NAME% ^
    DBPassword=%DB_PASSWORD% ^
    JWTSecret=%JWT_SECRET% ^
    EmailUser=%EMAIL_USER% ^
    EmailPass=%EMAIL_PASS% ^
    GeminiApiKey=%GEMINI_API_KEY% ^
    BackendImageUri=%BACKEND_URI% ^
    PredictImageUri=%PREDICT_URI%
echo   Stack deployed.

echo.
echo [6/7] Fetching stack outputs...
for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --region %REGION% --query "Stacks[0].Outputs[?OutputKey==''FrontendBucketName''].OutputValue" --output text') do set FRONTEND_BUCKET=%%i
for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --region %REGION% --query "Stacks[0].Outputs[?OutputKey==''CloudFrontURL''].OutputValue" --output text') do set CLOUDFRONT_URL=%%i
for /f "tokens=*" %%i in ('aws cloudformation describe-stacks --stack-name %STACK_NAME% --region %REGION% --query "Stacks[0].Outputs[?OutputKey==''DBEndpoint''].OutputValue" --output text') do set DB_ENDPOINT=%%i

echo   Frontend bucket : %FRONTEND_BUCKET%
echo   CloudFront URL  : %CLOUDFRONT_URL%
echo   DB endpoint     : %DB_ENDPOINT%

echo.
echo [7/7] Building and deploying React frontend...
echo VITE_API_URL=%CLOUDFRONT_URL% > .env.production
call npm ci
call npm run build
aws s3 sync dist/ s3://%FRONTEND_BUCKET%/ --delete --region %REGION%
echo   Frontend deployed to S3.

echo.
echo ======================================================
echo  DEPLOYMENT COMPLETE
echo ======================================================
echo  App URL   : %CLOUDFRONT_URL%
echo  DB Host   : %DB_ENDPOINT%
echo.
echo  Next step : Initialize the database schema:
echo    psql -h %DB_ENDPOINT% -U postgres -d medivault -f server/db_init.sql
echo ======================================================
pause
