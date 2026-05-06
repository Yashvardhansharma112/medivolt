#!/usr/bin/env bash
# MediVault - Full AWS Deployment Script
# Usage: ./deploy.sh [--region us-east-1] [--profile default]
set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
APP_NAME="medivault"
STACK_NAME="medivault-stack"
REGION="${AWS_DEFAULT_REGION:-us-east-1}"
PROFILE="${AWS_PROFILE:-default}"

# Parse flags
while [[ $# -gt 0 ]]; do
  case $1 in
    --region) REGION="$2"; shift 2 ;;
    --profile) PROFILE="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

AWS="aws --region $REGION --profile $PROFILE"
ACCOUNT_ID=$($AWS sts get-caller-identity --query Account --output text)
ECR_BASE="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

echo "======================================================"
echo " MediVault Deploy  |  Account: $ACCOUNT_ID  |  Region: $REGION"
echo "======================================================"

# ── Step 1: Prompt for secrets ────────────────────────────────────────────────
echo ""
echo "Enter deployment secrets (input hidden):"
read -rsp "DB Password: "        DB_PASSWORD;    echo
read -rsp "JWT Secret: "         JWT_SECRET;     echo
read -rsp "Email Password: "     EMAIL_PASS;     echo
read -rp  "Email User (Gmail): " EMAIL_USER
read -rsp "Gemini API Key: "     GEMINI_API_KEY; echo

# ── Step 2: Create ECR repos ──────────────────────────────────────────────────
echo ""
echo "[1/7] Creating ECR repositories..."
for repo in "${APP_NAME}-backend" "${APP_NAME}-predict"; do
  $AWS ecr describe-repositories --repository-names "$repo" > /dev/null 2>&1 || \
    $AWS ecr create-repository --repository-name "$repo" > /dev/null
  echo "  ✓ $repo"
done

# ── Step 3: Docker login to ECR ───────────────────────────────────────────────
echo ""
echo "[2/7] Logging in to ECR..."
$AWS ecr get-login-password | docker login --username AWS --password-stdin "$ECR_BASE"

# ── Step 4: Build & push backend ─────────────────────────────────────────────
echo ""
echo "[3/7] Building & pushing Node.js backend..."
BACKEND_URI="${ECR_BASE}/${APP_NAME}-backend:latest"
docker build -t "$BACKEND_URI" ./server
docker push "$BACKEND_URI"
echo "  ✓ Pushed $BACKEND_URI"

# ── Step 5: Build & push predict service ─────────────────────────────────────
echo ""
echo "[4/7] Building & pushing Python predict service..."
PREDICT_URI="${ECR_BASE}/${APP_NAME}-predict:latest"
docker build -t "$PREDICT_URI" ./predict
docker push "$PREDICT_URI"
echo "  ✓ Pushed $PREDICT_URI"

# ── Step 6: Deploy CloudFormation stack ──────────────────────────────────────
echo ""
echo "[5/7] Deploying CloudFormation stack (this takes ~10 min)..."
$AWS cloudformation deploy \
  --template-file infrastructure.yml \
  --stack-name "$STACK_NAME" \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    AppName="$APP_NAME" \
    DBPassword="$DB_PASSWORD" \
    JWTSecret="$JWT_SECRET" \
    EmailUser="$EMAIL_USER" \
    EmailPass="$EMAIL_PASS" \
    GeminiApiKey="$GEMINI_API_KEY" \
    BackendImageUri="$BACKEND_URI" \
    PredictImageUri="$PREDICT_URI"

echo "  ✓ Stack deployed"

# ── Step 7: Get stack outputs ─────────────────────────────────────────────────
echo ""
echo "[6/7] Fetching stack outputs..."
get_output() {
  $AWS cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" \
    --output text
}

FRONTEND_BUCKET=$(get_output FrontendBucketName)
CLOUDFRONT_URL=$(get_output CloudFrontURL)
DB_ENDPOINT=$(get_output DBEndpoint)

echo "  Frontend bucket : $FRONTEND_BUCKET"
echo "  CloudFront URL  : $CLOUDFRONT_URL"
echo "  DB endpoint     : $DB_ENDPOINT"

# ── Step 8: Init DB schema ────────────────────────────────────────────────────
echo ""
echo "[6b/7] Note: Run db_init.sql against your RDS instance manually or via a bastion."
echo "       RDS endpoint: $DB_ENDPOINT"
echo "       Command: psql -h $DB_ENDPOINT -U postgres -d medivault -f server/db_init.sql"

# ── Step 9: Build & deploy frontend ──────────────────────────────────────────
echo ""
echo "[7/7] Building & deploying React frontend..."

# Write production env for Vite build
cat > .env.production <<EOF
VITE_API_URL=https://$(get_output CloudFrontURL | sed 's|https://||')
EOF

npm ci
npm run build

$AWS s3 sync dist/ "s3://${FRONTEND_BUCKET}/" --delete
echo "  ✓ Frontend deployed to S3"

# Invalidate CloudFront cache
CF_ID=$($AWS cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontURL'].OutputValue" \
  --output text | sed 's|https://||' | cut -d. -f1)

$AWS cloudfront create-invalidation \
  --distribution-id "$($AWS cloudfront list-distributions \
    --query "DistributionList.Items[?DomainName=='$(get_output CloudFrontURL | sed 's|https://||')'].Id" \
    --output text)" \
  --paths "/*" > /dev/null 2>&1 || true

echo ""
echo "======================================================"
echo " ✅ DEPLOYMENT COMPLETE"
echo "======================================================"
echo " App URL    : $CLOUDFRONT_URL"
echo " DB Host    : $DB_ENDPOINT"
echo ""
echo " Next step  : Initialize the database schema:"
echo "   psql -h $DB_ENDPOINT -U postgres -d medivault -f server/db_init.sql"
echo "======================================================"
