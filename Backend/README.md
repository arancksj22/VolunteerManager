# 🚀 Vanguard Backend - Volunteer Management API

**AI-native volunteer management platform** with semantic matching, engagement tracking, and retention intelligence.

## 🏗️ Tech Stack

- **Backend Framework**: FastAPI (Python 3.10+)
- **Database**: Supabase (PostgreSQL + pgvector)
- **ML/AI**: SentenceTransformer via HuggingFace API (external, no local model)
- **Deployment**: Simple Python server (Railway, Render, Vercel, or any Python host)

## ✨ Features

### 🧠 **The Embedding Engine**
- Generates 384-dimensional semantic embeddings via HuggingFace API
- Uses `sentence-transformers/all-MiniLM-L6-v2` model (hosted by HuggingFace)
- Zero local dependencies - lightweight and fast!
- **Free tier friendly**: No model loading, no large downloads

### 🎯 **The Routing Engine**
- Semantic matching of volunteers to tasks using cosine similarity
- No keyword dependency - matches based on meaning
- Adjustable threshold and match count

### 📊 **The Engagement Pulse**
- Activity-based scoring system
- Time-decay algorithm for retention health
- Automated tracking of volunteer engagement

### ⚠️ **Retention Intelligence**
- Real-time health status view
- Flags "At-Risk" volunteers before they churn
- Three-tier system: Healthy, Warning, At-Risk

---

## 📁 Project Structure

```
Backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Settings & environment variables
│   ├── database.py          # Supabase client
│   ├── embeddings.py        # HuggingFace API wrapper
│   ├── models.py            # Pydantic schemas
│   └── routes/
│       ├── __init__.py
│       ├── volunteers.py    # Volunteer CRUD + health
│       ├── tasks.py         # Task CRUD + matching
│       └── activities.py    # Activity logging + scoring
├── requirements.txt         # Minimal dependencies
├── .env.example
└── README.md
```

---

## 🚀 Quick Start

### 1. **Prerequisites**

- Python 3.10+
- Supabase account (free tier works!)
- HuggingFace account (free API, optional token for higher rate limits)

### 2. **Clone & Setup**

```bash
# Navigate to the backend directory
cd Backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. **Configure Environment**

```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your credentials:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_KEY=your-anon-key
# HUGGINGFACE_API_KEY=hf_xxxxx (optional, get from huggingface.co/settings/tokens)
```

**Note**: HuggingFace API works WITHOUT a key (with rate limits). For production, get a free API token from https://huggingface.co/settings/tokens

### 4. **Run Locally**

```bash
# Start the development server
python -m app.main

# Or use uvicorn directly
uvicorn app.main:app --reload --port 8000
```

**API Documentation**: http://localhost:8000/docs 📖

---

## 🌐 Deployment Options

This is a standard FastAPI app - deploy anywhere that supports Python:

### **Option 1: Railway** (Recommended - Free Tier)
1. Create account at railway.app
2. Connect GitHub repo
3. Add environment variables (SUPABASE_URL, SUPABASE_KEY, HUGGINGFACE_API_KEY)
4. Deploy! Railway auto-detects Python

### **Option 2: Render**
1. Create account at render.com
2. New Web Service → Connect repo
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables

### **Option 3: Vercel** (with Python runtime)
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Add environment variables in dashboard

### **Option 4: Traditional VPS**
- Run with gunicorn: `gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker`
- Use nginx as reverse proxy
- Deploy with systemd service

---

## 🗄️ Database Setup

Already complete! The PRD indicates you've run these SQL commands in Supabase:

✅ Enabled `pgvector` extension  
✅ Created `volunteers` table with 384-dim embedding  
✅ Created `tasks` table with task_vector  
✅ Created `activity_logs` table  
✅ Created `match_volunteers()` RPC function  
✅ Created `volunteer_retention_status` view

If you need to reset or verify, check the SQL scripts in your Supabase SQL Editor.

---

## 📡 API Endpoints

### **System**
- `GET /` - Health check
- `GET /health` - Database health check
- `GET /info` - System information

### **Volunteers** (`/volunteers`)
- `POST /volunteers` - Create volunteer (generates embedding)
- `GET /volunteers` - List all volunteers
- `GET /volunteers/health` - Get retention health status
- `GET /volunteers/{id}` - Get specific volunteer
- `PATCH /volunteers/{id}` - Update volunteer
- `DELETE /volunteers/{id}` - Delete volunteer

### **Tasks** (`/tasks`)
- `POST /tasks` - Create task (generates embedding)
- `GET /tasks` - List all tasks
- `GET /tasks/{id}` - Get specific task
- `GET /tasks/{id}/matches` - **ROUTING ENGINE** - Find matching volunteers
- `GET /tasks/{id}/recommendations` - Alias for matches
- `PATCH /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task

### **Activities** (`/activities`)
- `POST /activities` - **ENGAGEMENT PULSE** - Log activity & update score
- `GET /activities` - List all activities
- `GET /activities/volunteer/{id}` - Get volunteer's activity history
- `GET /activities/{id}` - Get specific activity
- `DELETE /activities/{id}` - Delete activity log

---

## 🎯 Key Workflows

### **1. Create a Volunteer**
```bash
POST /volunteers
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "bio": "Passionate about community outreach and education",
  "skills": ["public speaking", "event planning"]
}
```
→ Returns volunteer with auto-generated 384-dim embedding

### **2. Create a Task**
```bash
POST /tasks
{
  "title": "Weekend Food Drive",
  "description": "Help organize and run a community food distribution event",
  "required_skills": ["logistics", "people skills"],
  "status": "open"
}
```
→ Returns task with semantic embedding

### **3. Find Matching Volunteers** (The Magic! ✨)
```bash
GET /tasks/{task_id}/matches?match_threshold=0.5&match_count=10
```
→ Returns ranked list of volunteers with similarity scores

### **4. Log Activity & Update Score**
```bash
POST /activities
{
  "volunteer_id": "uuid-here",
  "activity_type": "task_completion",
  "points_awarded": 50
}
```
→ Increments engagement_score and updates last_active_at

### **5. Check Retention Health**
```bash
GET /volunteers/health?status_filter=At-Risk
```
→ Returns volunteers flagged as "At-Risk" for churn

---

## ☁️ AWS Lambda Deployment

### **Option 1: Serverless Framework** (Recommended)

```bash
# Install Serverless Framework
npm install -g serverless

# Install plugins
npm install --save-dev serverless-python-requirements serverless-offline

# Configure AWS credentials
serverless config credentials --provider aws --key YOUR_KEY --secret YOUR_SECRET

# Deploy to AWS
serverless deploy --stage prod

# Check logs
serverless logs -f api --stage prod --tail
```

### **Option 2: Manual Lambda Deployment**

1. **Package your application**:
   ```bash
   pip install -r requirements.txt -t package/
   cp -r app package/
   cd package && zip -r ../deployment.zip . && cd ..
   ```

2. **Upload to AWS Lambda**:
   - Create a Lambda function in AWS Console
   - Set runtime to Python 3.10
   - Set handler to `app.main.handler`
   - Upload `deployment.zip`
   - Add environment variables from `.env`
   - Set memory to 1024MB+ (for model loading)
   - Set timeout to 30 seconds

3. **Add API Gateway**:
   - Create HTTP API
   - Add `ANY /{proxy+}` route
   - Point to your Lambda function

---

## 🔥 Lambda Optimization Tips

### **Model Caching** (Critical!)
The embedding model is ~80MB. To avoid downloading it every cold start:

1. **Use /tmp cache**: Already configured in `embeddings.py`
2. **Package model with deployment**: Download model locally and include in zip
   ```bash
   python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2', cache_folder='./model_cache')"
   ```
3. **Use EFS** (overkill for this project): Mount EFS volume to Lambda

### **Keep Lambda Warm**
- Use **Provisioned Concurrency** (costs money but eliminates cold starts)
- Use **CloudWatch Events** to ping your API every 5 minutes
- Use a service like **Lambda Warmer**

---

## 🧪 Testing

### **Manual Testing**
Use the interactive docs at `/docs` or tools like:
- **Postman**
- **Insomnia**
- **curl**
- **HTTPie**

Example:
```bash
# Create a volunteer
curl -X POST http://localhost:8000/volunteers \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John Doe","email":"john@test.com","bio":"Loves helping people"}'

# Get health status
curl http://localhost:8000/volunteers/health
```

### **Automated Testing** (TODO)
```bash
# Install pytest
pip install pytest pytest-asyncio httpx

# Run tests
pytest tests/
```

---

## 🔐 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SUPABASE_URL` | Your Supabase project URL | ✅ Yes | - |
| `SUPABASE_KEY` | Your Supabase anon key | ✅ Yes | - |
| `AWS_ACCESS_KEY_ID` | AWS credentials (for S3) | ❌ No | - |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | ❌ No | - |
| `AWS_REGION` | AWS region | ❌ No | us-east-1 |
| `AWS_S3_BUCKET` | S3 bucket for uploads | ❌ No | - |
| `REDIS_URL` | Upstash Redis URL | ❌ No | - |
| `ENVIRONMENT` | Environment name | ❌ No | development |
| `MODEL_CACHE_DIR` | Model cache directory | ❌ No | /tmp/model_cache |
| `MATCH_THRESHOLD` | Minimum similarity score | ❌ No | 0.5 |
| `DEFAULT_MATCH_COUNT` | Default results to return | ❌ No | 10 |

---

## 🐛 Troubleshooting

### **"Model not found" error**
- Ensure you have internet connection on first run
- Check that `/tmp/model_cache` is writable
- In Lambda, increase memory to 1024MB+

### **"Database connection failed"**
- Verify `SUPABASE_URL` and `SUPABASE_KEY` in `.env`
- Check Supabase dashboard for API status
- Ensure your IP isn't blocked in Supabase settings

### **"Slow cold starts in Lambda"**
- Normal for first request after idle (model loading)
- Use Provisioned Concurrency or Lambda Warmer
- Consider packaging model with deployment

### **"Vector search returns no results"**
- Check that embeddings were generated (not null)
- Lower the `match_threshold` parameter
- Verify pgvector extension is enabled in Supabase

---

## 📈 Future Enhancements

- [ ] **Redis caching** for frequently accessed data
- [ ] **S3 integration** for volunteer document uploads
- [ ] **EventBridge triggers** for automated re-engagement emails
- [ ] **AI Coordinator Agent** for churn analysis
- [ ] **Batch embedding** endpoint for bulk operations
- [ ] **GraphQL API** option
- [ ] **WebSocket** support for real-time updates
- [ ] **Rate limiting** with Upstash Redis
- [ ] **Authentication/Authorization** (JWT, API keys)

---

## 📝 License

This project is built for learning and demonstration purposes.

---

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

---

## 📬 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API docs at `/docs`
3. Verify your Supabase configuration

---

**Built with ❤️ for making volunteer management smarter, not harder.**
