# MissionMatch Backend

FastAPI backend for MissionMatch - deployed on AWS Lambda with Python 3.11.

## Tech Stack

- **FastAPI 0.109** - ASGI web framework with auto-generated Swagger docs
- **Supabase** - PostgreSQL + pgvector + Auth
- **HuggingFace Inference API** - Text embeddings (all-MiniLM-L6-v2, 384 dimensions)
- **Google Generative AI** - AI chatbot assistant
- **Redis** - Caching and coordinator notes
- **Resend** - Transactional email API
- **AWS S3** - Document storage
- **Mangum** - ASGI adapter for AWS Lambda

## Project Structure

```
app/
├── main.py            # FastAPI app, CORS, Mangum handler, system routes
├── config.py          # Pydantic Settings (env vars)
├── database.py        # Supabase client
├── embeddings.py      # HuggingFace Inference API wrapper
├── gemini.py          # Google Generative AI client
├── s3.py              # S3-compatible storage client
├── emails.py          # Resend email service (4 HTML templates)
├── redisnotes.py      # Redis notes client
├── models.py          # Pydantic request/response schemas
├── system_prompt.txt  # AI assistant system prompt
└── routes/
    ├── volunteers.py  # CRUD + health + embeddings
    ├── tasks.py       # CRUD + semantic matching
    ├── activities.py  # Activity logging + score updates
    ├── documents.py   # File upload/download (S3)
    ├── chatbot.py     # AI assistant conversations
    ├── notes.py       # Redis-backed notes CRUD
    └── emails.py      # Email sending + templates
```

## Run Locally

```bash
cd Backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt

# Create .env with your credentials (see root README for all variables)
python -m app.main
# Swagger docs at http://localhost:8000/docs
```

## Deploy to Lambda

```bash
powershell -ExecutionPolicy Bypass -File build_lambda_zip.ps1
# Upload lambda-deploy.zip to AWS Lambda
# Runtime: Python 3.11 | Handler: app.main.handler | Memory: 512 MB | Timeout: 30s
```

## API

38 endpoints across 7 route modules. See the root [README](../README.md#api-endpoints) or visit `/docs` when running.

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

## Why AWS Lambda

The backend runs on AWS Lambda with a Function URL (no API Gateway). Lambda scales to zero when idle, which keeps costs at zero for a demo project. The deployment ZIP is ~16 MB, and cold starts stay under 3 seconds with Python 3.11. Mangum adapts FastAPI's ASGI interface to Lambda's event handler, so the same codebase runs locally with uvicorn and in production on Lambda with no code changes.

---

## All Endpoints

38 endpoints across 7 route modules plus system routes.

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/health` | Database connectivity check |
| GET | `/info` | System information |
| GET | `/stats` | Dashboard aggregate statistics |
| POST | `/cron/daily-decay` | Daily engagement decay (external cron) |

### Volunteers (`/volunteers`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/volunteers` | Create volunteer + generate embedding |
| GET | `/volunteers` | List all volunteers (paginated) |
| GET | `/volunteers/health` | Retention health status (view query) |
| GET | `/volunteers/{id}` | Get volunteer by ID |
| PATCH | `/volunteers/{id}` | Update volunteer (re-embeds if bio/skills change) |
| DELETE | `/volunteers/{id}` | Delete volunteer |

### Tasks (`/tasks`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tasks` | Create task + generate embedding |
| GET | `/tasks` | List all tasks (filterable by status) |
| GET | `/tasks/{id}` | Get task by ID |
| GET | `/tasks/{id}/matches` | Semantic volunteer matching (Routing Engine) |
| GET | `/tasks/{id}/recommendations` | Alias for matches |
| PATCH | `/tasks/{id}` | Update task |
| DELETE | `/tasks/{id}` | Delete task |

### Activities (`/activities`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/activities` | Log activity + update engagement score |
| GET | `/activities` | List all activity logs |
| GET | `/activities/volunteer/{id}` | Activity history for a volunteer |
| GET | `/activities/{id}` | Get specific activity log |
| DELETE | `/activities/{id}` | Delete activity log |

### Documents (`/documents`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/documents/upload` | Upload file to AWS S3 |
| GET | `/documents/list` | List coordinator documents |
| GET | `/documents/download/{key}` | Download file (streaming) |
| DELETE | `/documents/{key}` | Delete file |

### Chatbot (`/chatbot`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chatbot/chat` | Send message to AI assistant |
| GET | `/chatbot/health` | Chatbot service availability |

### Notes (`/notes`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/notes` | Create note (Redis) |
| GET | `/notes` | Get coordinator notes (filterable by tag) |
| GET | `/notes/search` | Search notes by content |
| GET | `/notes/tags` | Get all tags for a coordinator |
| PATCH | `/notes/{id}` | Update note |
| DELETE | `/notes/{id}` | Delete note |
| GET | `/notes/health` | Redis connection health |

### Emails (`/emails`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/emails/send` | Send custom HTML email |
| POST | `/emails/send-template` | Send templated email (welcome/reminder/thankyou/event) |
| GET | `/emails/templates` | List available templates |
| GET | `/emails/health` | Email service configuration status |

> Full endpoint documentation with request/response schemas available at `/docs` (Swagger UI) when the backend is running.
