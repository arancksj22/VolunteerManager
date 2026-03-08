# 🚀 AWS Lambda Deployment Guide - FREE TIER OPTIMIZED

## ❓ Docker vs Lambda - Clarification

### **TL;DR**: You're right - everything goes in **ONE Lambda function**!

**Docker Compose is just an alternative deployment option**. You have 3 choices:

1. ✅ **AWS Lambda** (Serverless) - **RECOMMENDED** for your use case
2. 🐳 **Docker** (Containers) - Alternative if you want to deploy to AWS ECS, Google Cloud Run, etc.
3. 💻 **Direct Python** (Traditional server) - For VPS/EC2 deployment

**For your project**: Use **AWS Lambda only**. Ignore Docker unless you want flexibility later.

---

## 🚨 The Model Size Problem

### **Critical Issue**: SentenceTransformer Model is ~80-90MB

**Lambda Limitations**:
- ❌ Direct upload: 50MB max (model won't fit)
- ⚠️ Lambda Layers: 250MB max (model will fit, but tight)
- ✅ Container Images: 10GB max (plenty of space)
- 💾 /tmp directory: 512MB (ephemeral, downloads each cold start)

**Free Tier Constraints**:
- 1M requests/month
- 400,000 GB-seconds compute/month
- Cold starts with model download = **EXPENSIVE** in time & compute

---

## 🎯 Solutions to Stay Free Tier

### **Option 1: Lambda Container Image** (RECOMMENDED ✅)

**Why**: Package model in the image, no downloads, still free tier!

**Steps**:

1. **Update Dockerfile** (already created):
```dockerfile
# Model is already baked into the image during build
# No runtime downloads needed!
```

2. **Build and push to ECR**:
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Create ECR repository
aws ecr create-repository --repository-name vanguard-backend --region us-east-1

# Build image
docker build -t vanguard-backend .

# Tag for ECR
docker tag vanguard-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/vanguard-backend:latest

# Push
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/vanguard-backend:latest
```

3. **Deploy Lambda from container**:
```bash
aws lambda create-function \
  --function-name vanguard-api \
  --package-type Image \
  --code ImageUri=<account-id>.dkr.ecr.us-east-1.amazonaws.com/vanguard-backend:latest \
  --role arn:aws:iam::<account-id>:role/lambda-execution-role \
  --timeout 30 \
  --memory-size 1024 \
  --environment Variables="{SUPABASE_URL=your-url,SUPABASE_KEY=your-key}"
```

**Pros**:
- ✅ Model baked in, no downloads
- ✅ Fast cold starts
- ✅ Still free tier (same limits)
- ✅ Easy updates

**Cons**:
- Slightly more complex setup
- Need AWS CLI configured

---

### **Option 2: Use Lambda Layers** (Simpler, but tighter fit)

**Steps**:

1. **Create a layer with the model**:
```bash
mkdir -p layer/python/lib/python3.10/site-packages
pip install sentence-transformers torch --target layer/python/lib/python3.10/site-packages

# Pre-download model
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2', cache_folder='layer/models')"

cd layer
zip -r ../model-layer.zip .
cd ..

# Upload layer
aws lambda publish-layer-version \
  --layer-name vanguard-ml-models \
  --zip-file fileb://model-layer.zip \
  --compatible-runtimes python3.10
```

2. **Update serverless.yml**:
```yaml
functions:
  api:
    handler: app.main.handler
    layers:
      - arn:aws:lambda:region:account:layer:vanguard-ml-models:1
```

**Pros**:
- ✅ Works with Serverless Framework
- ✅ Can reuse layer across functions

**Cons**:
- ⚠️ Close to 250MB limit
- May not fit with all dependencies

---

### **Option 3: Use HuggingFace Inference API** (Lightest, External API)

Replace local model with API calls (still free tier on HuggingFace!).

**Update `app/embeddings.py`**:
```python
import requests

class EmbeddingEngine:
    def __init__(self):
        self.api_url = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
        self.headers = {"Authorization": f"Bearer {os.getenv('HUGGINGFACE_API_KEY')}"}
    
    def encode(self, text: str) -> List[float]:
        response = requests.post(
            self.api_url,
            headers=self.headers,
            json={"inputs": text, "options": {"wait_for_model": True}}
        )
        return response.json()
```

**Pros**:
- ✅ Tiny Lambda package (~10MB)
- ✅ No cold start delay
- ✅ HuggingFace free tier: 30,000 requests/month

**Cons**:
- ❌ External dependency
- ❌ Rate limits
- ❌ Network latency

---

## 🏆 My Recommendation

**For your project, use Option 1 (Container Image)**:

1. ✅ Best cold start performance
2. ✅ Completely self-contained
3. ✅ No external dependencies
4. ✅ Still 100% free tier
5. ✅ Most reliable

**Modified Deployment Steps**:

```bash
# 1. Build container with model baked in
docker build -t vanguard-backend .

# 2. Push to ECR
# (commands above)

# 3. Create Lambda from image
# (command above)

# 4. Add API Gateway
aws apigatewayv2 create-api \
  --name vanguard-api \
  --protocol-type HTTP \
  --target arn:aws:lambda:region:account:function:vanguard-api
```

---

## 📊 Free Tier Math

**Lambda Free Tier**:
- 1M requests/month
- 400,000 GB-seconds/month

**Your setup** (1GB memory, 1s avg execution):
- 1 request = 1 GB-second
- **You can handle 400,000 requests/month FREE**

**Cold starts** (with container image):
- ~2-3 seconds (model already loaded in image)
- Happens ~1-2 times/hour (Lambda keeps warm for 15 min)
- ~1,440 cold starts/month if constantly idle

**You're safe!** 400k requests is plenty for development and moderate production use.

---

## 🎯 Simplified Deployment (Container Image)

I'll create you a deployment script:

**File: `deploy_lambda.sh`**
```bash
#!/bin/bash

# Configuration
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO_NAME="vanguard-backend"
FUNCTION_NAME="vanguard-api"

# Create ECR if doesn't exist
aws ecr describe-repositories --repository-names $ECR_REPO_NAME --region $AWS_REGION 2>/dev/null || \
  aws ecr create-repository --repository-name $ECR_REPO_NAME --region $AWS_REGION

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build image
docker build -t $ECR_REPO_NAME .

# Tag and push
docker tag $ECR_REPO_NAME:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest

# Update Lambda (or create if doesn't exist)
aws lambda update-function-code \
  --function-name $FUNCTION_NAME \
  --image-uri $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest \
  --region $AWS_REGION 2>/dev/null || \
  aws lambda create-function \
    --function-name $FUNCTION_NAME \
    --package-type Image \
    --code ImageUri=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME:latest \
    --role arn:aws:iam::$AWS_ACCOUNT_ID:role/lambda-execution-role \
    --timeout 30 \
    --memory-size 1024 \
    --region $AWS_REGION

echo "✅ Deployment complete!"
```

---

## 🎯 Final Answer to Your Questions

### Q: Can I just put this whole thing in a Lambda function?
**A: YES!** One Lambda function, using Mangum wrapper (already configured in `app/main.py`).

### Q: It all has to go in one AWS Lambda right?
**A: YES!** The `handler` in `app/main.py` wraps the entire FastAPI app.

### Q: How to handle model without exceeding free tier?
**A: Use Container Image deployment** - model baked in, no runtime downloads, still free tier!

---

## 📝 Action Items

1. ✅ Use the existing code as-is
2. ✅ Deploy using Container Image (not zip file)
3. ✅ Ignore Docker Compose (that's for alternative deployment)
4. ✅ Follow deployment script above
5. ✅ Stay well within free tier limits

**You're all set!** 🚀
