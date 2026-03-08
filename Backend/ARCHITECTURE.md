# 🏗️ VolunteerManager Backend Architecture

## 📁 Complete File Structure

```
Backend/
├── 📄 BackendPRD                       # Original requirements
├── 📄 README.md                        # Comprehensive documentation
├── 📄 API_QUICK_REFERENCE.md          # Quick API reference
├── 📄 FRONTEND_INTEGRATION_SPEC.md    # Frontend build guide
├── 📄 ARCHITECTURE.md                 # This file
├── 📄 SUPABASE_SETUP_CHECKLIST.md     # Database setup guide
│
├── ⚙️ Configuration Files
│   ├── .env.example                    # Environment template
│   ├── .gitignore                      # Git ignore rules
│   └── requirements.txt                # Python dependencies (minimal!)
│
└── 📦 Application Code (app/)
    ├── __init__.py                     # Package initialization
    ├── main.py                         # 🚀 FastAPI application
    ├── config.py                       # Settings & environment
    ├── database.py                     # Supabase client
    ├── embeddings.py                   # 🧠 HuggingFace API wrapper
    ├── models.py                       # Pydantic schemas
    │
    └── routes/
        ├── __init__.py
        ├── volunteers.py               # 👥 Volunteer CRUD + health
        ├── tasks.py                    # 📋 Task CRUD + matching
        └── activities.py               # ⚡ Activity logging + scoring
```

---

## 🔄 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
│                  (Built from FRONTEND_SPEC)                 │
│                                                             │
│  • Supabase Auth for login/signup                          │
│  • API calls to FastAPI backend (no auth headers)          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              FastAPI Backend (Python Server)                │
│        (Railway / Render / Vercel / VPS)                    │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              FastAPI Application                    │   │
│   │                                                     │   │
│   │  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │   │
│   │  │ Volunteers   │  │    Tasks     │  │Activities│ │   │
│   │  │   Routes     │  │   Routes     │  │  Routes  │ │   │
│   │  └──────┬───────┘  └──────┬───────┘  └────┬─────┘ │   │
│   │         │                 │                │       │   │
│   │         └─────────────────┼────────────────┘       │   │
│   │                           ▼                        │   │
│   │              ┌─────────────────────────┐           │   │
│   │              │   Embedding Engine      │           │   │
│   │              │   (HuggingFace API)     │           │   │
│   │              │  🧠 External Service    │           │   │
│   │              └──────────┬──────────────┘           │   │
│   │                         │                          │   │
│   │                         ▼                          │   │
│   │              ┌─────────────────────────┐           │   │
│   │              │   Supabase Client       │           │   │
│   │              │   (Database Layer)      │           │   │
│   │              └─────────────────────────┘           │   │
│   └─────────────────────────────────────────────────────┘   │
└────────────┬───────────────────────┬────────────────────────┘
             │                       │
             ▼                       ▼
┌──────────────────────┐  ┌─────────────────────────────────┐
│  HuggingFace API     │  │   Supabase Database            │
│  (Inference API)     │  │   (PostgreSQL + pgvector)       │
│                      │  │                                 │
│ • Free tier          │  │  ┌──────────────┐               │
│ • No local model     │  │  │  volunteers  │               │
│ • 384-dim vectors    │  │  │ • embedding  │               │
│ • all-MiniLM-L6-v2   │  │  │   (384-dim)  │               │
└──────────────────────┘  │  └──────────────┘               │
                         │                                 │
                         │  ┌──────────────┐               │
                         │  │    tasks     │               │
                         │  │ • task_vector│               │
                         │  │   (384-dim)  │               │
                         │  └──────────────┘               │
                         │                                 │
                         │  ┌─────────────────┐            │
                         │  │ activity_logs   │            │
                         │  │ • volunteer_id  │            │
                         │  │ • points        │            │
                         │  └─────────────────┘            │
                         │                                 │
                         │  ┌──────────────────────────┐   │
                         │  │ match_volunteers() RPC   │   │
                         │  │ (Cosine Similarity)      │   │
                         │  └──────────────────────────┘   │
                         │                                 │
                         │  ┌──────────────────────────┐   │
                         │  │ volunteer_retention_     │   │
                         │  │ status VIEW              │   │
                         │  └──────────────────────────┘   │
                         └─────────────────────────────────┘
```

---

## 🎯 Core Features & Endpoints

### 1️⃣ **The Embedding Engine** 🧠
**Module**: `app/embeddings.py`

- Calls HuggingFace Inference API for embeddings
- Model: `sentence-transformers/all-MiniLM-L6-v2`
- Generates 384-dimensional vectors
- **No local model** - lightweight and fast
- Free tier friendly with optional API key for higher limits

**Used by**:
- `POST /volunteers` - Encode volunteer bio
- `POST /tasks` - Encode task description

**Benefits**:
✅ No 80MB+ model download  
✅ No GPU/CPU intensive processing  
✅ Cold starts are instant  
✅ Works perfectly for low-traffic applications

---

### 2️⃣ **The Routing Engine** 🎯
**Module**: `app/routes/tasks.py`

- **Endpoint**: `GET /tasks/{id}/matches`
- Semantic matching using cosine similarity
- Calls Supabase `match_volunteers()` RPC
- Returns ranked volunteers with similarity scores

**Parameters**:
- `match_threshold` (0.0-1.0): Minimum similarity
- `match_count` (1-100): Max results

---

### 3️⃣ **The Engagement Pulse** ⚡
**Module**: `app/routes/activities.py`

- **Endpoint**: `POST /activities`
- Logs activity and awards points
- Updates `engagement_score` in volunteers table
- Updates `last_active_at` timestamp

**Activity Types**:
- `signup`: 10 points
- `task_completion`: 50 points
- `check_in`: 5 points
- `custom`: Variable (must specify)

---

### 4️⃣ **Retention Intelligence** 📊
**Module**: `app/routes/volunteers.py`

- **Endpoint**: `GET /volunteers/health`
- Queries `volunteer_retention_status` view
- Calculates: `health = score - (days_inactive × 2)`

**Status Levels**:
- `Healthy` (>70): Active and engaged ✅
- `Warning` (40-70): Needs attention ⚠️
- `At-Risk` (<40): About to churn 🚨

---

## 🔌 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Health check |
| `/health` | GET | Database health check |
| `/info` | GET | System information |
| `/volunteers` | POST | Create volunteer + embedding |
| `/volunteers` | GET | List all volunteers |
| `/volunteers/{id}` | GET | Get volunteer details |
| `/volunteers/{id}` | PATCH | Update volunteer |
| `/volunteers/{id}` | DELETE | Delete volunteer |
| `/volunteers/health` | GET | Get retention status |
| `/tasks` | POST | Create task + embedding |
| `/tasks` | GET | List all tasks |
| `/tasks/{id}` | GET | Get task details |
| `/tasks/{id}/matches` | GET | **ROUTING ENGINE** 🎯 |
| `/tasks/{id}/recommendations` | GET | Alias for matches |
| `/tasks/{id}` | PATCH | Update task |
| `/tasks/{id}` | DELETE | Delete task |
| `/activities` | POST | **ENGAGEMENT PULSE** ⚡ |
| `/activities` | GET | List activities |
| `/activities/volunteer/{id}` | GET | Volunteer activity history |
| `/activities/{id}` | GET | Get activity details |
| `/activities/{id}` | DELETE | Delete activity |

---

## 🔐 Environment Variables

Required in `.env`:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
```

Optional:
```bash
AWS_ACCESS_KEY_ID=for-s3-uploads
AWS_SECRET_ACCESS_KEY=for-s3-uploads
AWS_REGION=us-east-1
REDIS_URL=redis://upstash-url
ENVIRONMENT=development
MODEL_CACHE_DIR=/tmp/model_cache
MATCH_THRESHOLD=0.5
DEFAULT_MATCH_COUNT=10
```

---

## 🚀 Deployment Options

### **1. AWS Lambda** (Primary)
```bash
npm install
serverless deploy
```
→ Serverless, auto-scaling, pay-per-request

### **2. Docker** (Alternative)
```bash
docker-compose up
```
→ Container-based, portable

### **3. Direct Python** (Local Dev)
```bash
python -m app.main
```
→ Fast iteration, hot-reload

---

## 📊 Data Flow Examples

### Creating a Volunteer
```
1. Client sends POST /volunteers with bio
2. embeddings.py generates 384-dim vector
3. database.py inserts to Supabase
4. Returns volunteer with default score=100
```

### Matching Volunteers to Task
```
1. Client sends GET /tasks/{id}/matches
2. Fetch task_vector from database
3. Call match_volunteers(vector, threshold, count)
4. Supabase performs cosine similarity search
5. Returns ranked volunteers with scores
```

### Logging Activity
```
1. Client sends POST /activities
2. Insert into activity_logs table
3. Update volunteer.engagement_score += points
4. Update volunteer.last_active_at = NOW()
5. Returns activity log
```

### Checking Health
```
1. Client sends GET /volunteers/health
2. Query volunteer_retention_status view
3. View calculates: score - (days_inactive × 2)
4. Returns list with health status
```

---

## 🧪 Testing Workflow

1. **Setup**: `python setup.py`
2. **Start Server**: `python -m app.main`
3. **Run Tests**: `python test_api.py`
4. **Manual Testing**: http://localhost:8000/docs

---

## 💡 Key Design Decisions

1. **Singleton Pattern**: Embedding model loaded once, reused
2. **Mangum Wrapper**: Makes FastAPI compatible with Lambda
3. **Pydantic Validation**: Type-safe request/response
4. **RPC Functions**: Database logic stays in database
5. **Time-Decay Scoring**: Passive churn detection
6. **Vector Embeddings**: Semantic matching without keywords

---

## 🎓 Learning Value

This project demonstrates:
- ✅ Full-stack CRUD operations
- ✅ FastAPI best practices
- ✅ Serverless architecture
- ✅ Vector embeddings & semantic search
- ✅ Database design (PostgreSQL + pgvector)
- ✅ Business logic (scoring algorithms)
- ✅ API design & documentation
- ✅ Deployment strategies

---

## 🔮 Future Enhancements

- [ ] JWT authentication
- [ ] Rate limiting with Redis
- [ ] S3 integration for file uploads
- [ ] EventBridge for scheduled re-engagement
- [ ] WebSocket for real-time updates
- [ ] GraphQL API option
- [ ] Batch operations
- [ ] Admin dashboard
- [ ] Email notifications via Resend
- [ ] AI chatbot for churn analysis

---

**Built for AWS Lambda | Powered by FastAPI | Smart with SentenceTransformers**
