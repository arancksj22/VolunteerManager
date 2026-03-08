# 🚀 AWS Lambda Deployment Guide (100% FREE TIER)

## 💰 **Cost: $0/month**

AWS Lambda Free Tier includes:
- ✅ **1 million requests per month** (forever free)
- ✅ **400,000 GB-seconds compute time** (forever free)
- ✅ **Automatic scaling** (0 to thousands of requests)
- ✅ **No idle costs** (pay only when running)

**Your app will cost $0** unless you exceed:
- 1,000,000 API calls per month
- OR run longer than ~150 hours/month at 512MB memory

For typical usage (500-50,000 requests/month), **you'll never pay anything**.

---

## 📋 Prerequisites

### 1. AWS Account
1. Create account: https://aws.amazon.com/free/
2. No credit card charge for free tier
3. Set up billing alerts (recommended): https://console.aws.amazon.com/billing/

### 2. AWS CLI
```powershell
# Install AWS CLI (Windows)
winget install Amazon.AWSCLI

# Or download from: https://aws.amazon.com/cli/

# Verify installation
aws --version
```

### 3. Configure AWS Credentials
```powershell
# Run AWS configure
aws configure

# Enter your credentials (get from AWS Console → IAM → Users):
AWS Access Key ID: [your-access-key]
AWS Secret Access Key: [your-secret-key]
Default region: us-east-1
Default output format: json
```

**How to get AWS credentials:**
1. Go to AWS Console: https://console.aws.amazon.com
2. Services → IAM → Users → Create User
3. Attach policy: `AdministratorAccess` (or `AWSLambdaFullAccess` + `IAMFullAccess`)
4. Security credentials → Create access key
5. Copy Access Key ID and Secret Access Key

### 4. Node.js (for Serverless Framework)
```powershell
# Install Node.js (required for Serverless Framework)
winget install OpenJS.NodeJS

# Verify
node --version
npm --version
```

### 5. Serverless Framework
```powershell
# Install globally
npm install -g serverless

# Verify
serverless --version
```

### 6. Python Dependencies
```powershell
# Make sure you have Python 3.10+
python --version

# Install requirements
pip install -r requirements.txt

# Install serverless plugin for Python packaging
npm install --save-dev serverless-python-requirements
```

---

## 🚀 Deployment Steps

### Step 1: Set Environment Variables

Create `.env` file (copy from `.env.example`):
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
HUGGINGFACE_API_KEY=your-hf-key  # Optional but recommended
```

**IMPORTANT**: Serverless Framework reads `.env` automatically, but you can also set env vars in `serverless.yml`.

### Step 2: Test Locally First

```powershell
# Test that handler works
python -m app.main

# Should show:
# 🚀 Starting VolunteerManager Backend in LOCAL MODE
# 📖 API Docs: http://localhost:8000/docs

# Test API
curl http://localhost:8000/
```

### Step 3: Deploy to AWS Lambda

```powershell
# Deploy to AWS (first time)
serverless deploy

# This will:
# 1. Package your Python code
# 2. Create Lambda function
# 3. Create HTTP API Gateway
# 4. Set up CloudWatch Logs
# 5. Return your API URL
```

**Expected output:**
```
Service deployed to stack volunteer-manager-api-dev

endpoint: https://abc123xyz.execute-api.us-east-1.amazonaws.com
functions:
  api: volunteer-manager-api-dev-api (45 MB)
```

### Step 4: Test Your Lambda API

```powershell
# Replace with your API Gateway URL from deployment
$API_URL = "https://abc123xyz.execute-api.us-east-1.amazonaws.com"

# Test root endpoint
curl "$API_URL/"

# Should return:
# {"status":"healthy","version":"1.0.0","timestamp":"..."}

# Test API docs (Swagger UI)
# Visit in browser: https://abc123xyz.execute-api.us-east-1.amazonaws.com/docs
```

---

## 🎯 Common Deployment Commands

```powershell
# Deploy changes
serverless deploy

# Deploy specific function only (faster)
serverless deploy function -f api

# View logs in real-time
serverless logs -f api -t

# Get deployment info
serverless info

# Remove entire deployment (DELETE EVERYTHING)
serverless remove
```

---

## ⚙️ Configuration Options

### Option 1: Stay 100% Free (Default)

```yaml
# serverless.yml (current setup)
provider:
  memorySize: 512
  # No provisionedConcurrency = cold starts possible
```

**Tradeoffs:**
- ✅ $0/month forever
- ⚠️ 1-3 second cold start after 5-15 min inactivity
- ✅ Perfect for small orgs, demos, staging

### Option 2: No Cold Starts ($5/month)

```yaml
# serverless.yml
functions:
  api:
    provisionedConcurrency: 1  # Keep 1 instance always warm
```

**Tradeoffs:**
- 💰 ~$5-7/month
- ✅ Zero cold starts (instant responses)
- ✅ Perfect for production, user-facing apps

### Option 3: Hybrid (Free + Scheduled Warm-Up)

Use AWS EventBridge to ping your API every 5 minutes (keeps it warm):

```yaml
# Add to serverless.yml functions section
functions:
  api:
    events:
      - httpApi: ...
      - schedule:
          rate: rate(5 minutes)
          enabled: true
          input:
            path: /health
```

**Tradeoffs:**
- ✅ Still free tier (8,640 pings/month < 1M limit)
- ⚠️ Slight cold starts possible during traffic spikes
- ✅ Good middle ground

---

## 🔍 Monitoring & Debugging

### View CloudWatch Logs
```powershell
# Stream logs live
serverless logs -f api -t

# Or go to AWS Console:
# CloudWatch → Log Groups → /aws/lambda/volunteer-manager-api-dev-api
```

### Check Invocations & Cost
```powershell
# AWS Console → Lambda → Functions → volunteer-manager-api-dev-api
# Check:
# - Invocations (should be < 1M/month)
# - Duration (should be < few seconds)
# - Errors (should be 0%)
```

### Monitor Costs
```powershell
# AWS Console → Billing Dashboard
# Set up billing alert for > $1/month (just in case)
```

---

## 🐛 Troubleshooting

### Issue: "Module not found" error

**Solution**: Install `serverless-python-requirements` plugin
```powershell
npm install --save-dev serverless-python-requirements
```

### Issue: Cold starts too slow

**Options:**
1. Increase memory (faster CPU): `memorySize: 1024` (still free tier)
2. Add provisioned concurrency: `provisionedConcurrency: 1` (~$5/mo)
3. Use Serverless Warm-Up plugin

### Issue: HuggingFace API timeout

**Solution**: HuggingFace cold starts their model too. Retry logic already built-in to `app/embeddings.py`.

### Issue: Package too large (>250MB)

**Solution**: Already optimized! Current package ~45MB. If issues:
```yaml
# serverless.yml custom section
custom:
  pythonRequirements:
    slim: true
    strip: true
```

### Issue: Environment variables not working

**Check:**
```powershell
# Verify .env file exists
Get-Content .env

# Or set directly in serverless.yml
provider:
  environment:
    SUPABASE_URL: https://your-project.supabase.co
```

---

## 🎓 Understanding Lambda Pricing

### Free Tier (Forever)
- **Requests**: 1 million per month
- **Compute**: 400,000 GB-seconds per month
  - Example: 512MB function running for 1 second = 0.5 GB-seconds
  - 400,000 GB-seconds ÷ 0.5 = **800,000 invocations at 1 second each**

### Your App Usage (512MB, avg 500ms response time)
- **Cost per invocation**: $0 (within free tier)
- **Monthly breakdown**:
  - 10,000 requests: $0 (0 GB-seconds used, 400,000 available)
  - 50,000 requests: $0 (25,000 GB-seconds used, 375,000 available)
  - 100,000 requests: $0 (50,000 GB-seconds used, 350,000 available)
  - 800,000 requests: $0 (400,000 GB-seconds used - FREE TIER LIMIT)

**You'd need 1.6 MILLION requests/month before paying anything!**

---

## 🔄 Updating Your API

```powershell
# Make code changes
# Then deploy:
serverless deploy

# Takes ~30-60 seconds
# Zero downtime (AWS handles traffic switching)
```

---

## 📊 Production Best Practices

### 1. Set Up Custom Domain (Optional)
```powershell
# Install plugin
npm install --save-dev serverless-domain-manager

# Configure in serverless.yml
custom:
  customDomain:
    domainName: api.yourorg.com
    certificateName: '*.yourorg.com'
    basePath: ''
    stage: ${self:provider.stage}
    createRoute53Record: true
```

### 2. Add API Key Protection (Optional)
```yaml
# serverless.yml
functions:
  api:
    events:
      - httpApi:
          path: /{proxy+}
          method: any
          authorizer:
            name: apiKeyAuthorizer
```

### 3. Set Up Alerts
```powershell
# AWS Console → CloudWatch → Alarms
# Create alarms for:
# - Function errors > 1%
# - Duration > 5 seconds
# - Throttles > 0
```

---

## 🎯 Quick Start TL;DR

```powershell
# 1. Install tools
npm install -g serverless
pip install -r requirements.txt

# 2. Configure AWS
aws configure

# 3. Set environment variables
Copy .env.example to .env and fill values

# 4. Deploy!
serverless deploy

# 5. Test
curl https://your-api-url.amazonaws.com/

# Done! 🎉
```

---

## 🆚 Lambda vs Railway/Render

| Feature | Lambda (Free) | Railway ($5/mo) | Render ($7/mo) |
|---------|---------------|-----------------|----------------|
| **Cold Start** | 1-3 seconds | None | 30-90 seconds (free tier) |
| **Always-On** | No | Yes | Yes (paid only) |
| **Cost (0-50K req/mo)** | $0 | $0-5 | $0 or $7 |
| **Setup Complexity** | Medium | Low | Low |
| **Scaling** | Automatic | Manual | Automatic |
| **Best For** | Variable traffic | Consistent traffic | Predictable traffic |

---

## 🎓 Next Steps

1. ✅ Deploy to Lambda (free tier)
2. ✅ Test with frontend
3. ✅ Monitor for 1 week
4. 🔄 If cold starts annoying → Add `provisionedConcurrency: 1` (~$5/mo)
5. 🔄 If scaling issues → Stay on Lambda (handles millions of requests)
6. 🔄 If want simpler → Switch to Railway ($5/mo)

**You can't go wrong with Lambda free tier for starting out!**

---

**Questions? Issues?**
- AWS Lambda Docs: https://docs.aws.amazon.com/lambda/
- Serverless Framework Docs: https://www.serverless.com/framework/docs
- This project's GitHub Issues: [your repo]
