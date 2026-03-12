# 🏗️ MissionMatch — System Architecture

## 📁 Complete File Structure

```
Backend/                                    (AWS Lambda — Python 3.11)
├── requirements.txt                        # Python dependencies
├── build_lambda_zip.ps1                    # Lambda deployment build script
│
└── app/
    ├── __init__.py
    ├── main.py                             # FastAPI app + Mangum Lambda handler
    ├── config.py                           # Pydantic Settings (env vars)
    ├── database.py                         # Supabase client (singleton)
    ├── embeddings.py                       # HuggingFace Inference API wrapper
    ├── gemini.py                           # Google Gemini AI chatbot integration
    ├── s3.py                              # Backblaze B2 (S3-compatible) file ops
    ├── emails.py                          # Resend email service
    ├── redisnotes.py                      # Redis-based notes CRUD
    ├── models.py                          # Pydantic request/response schemas
    ├── system_prompt.txt                  # Gemini chatbot system prompt
    │
    └── routes/
        ├── __init__.py
        ├── volunteers.py                  # Volunteer CRUD + health + embeddings
        ├── tasks.py                       # Task CRUD + semantic matching (Routing Engine)
        ├── activities.py                  # Activity logging + engagement scoring
        ├── documents.py                   # Document upload/download/delete (B2)
        ├── chatbot.py                     # AI assistant chat endpoint
        ├── notes.py                       # Coordinator notes (Redis)
        └── emails.py                      # Email send/templates (Resend)

Frontend/volunteer-manager/                 (Vercel — Next.js 16)
├── src/
│   ├── middleware.ts                      # Supabase auth guard (coordinator routes)
│   ├── app/
│   │   ├── layout.tsx                     # Root layout + QueryProvider
│   │   ├── page.tsx                       # Landing page
│   │   ├── auth/callback/                 # Supabase OAuth callback
│   │   ├── coordinator/                   # Protected coordinator dashboard
│   │   │   ├── dashboard/                 # Stats overview
│   │   │   ├── volunteers/               # Volunteer management
│   │   │   ├── activities/               # Activity logs
│   │   │   ├── campaigns/                # Campaign management
│   │   │   ├── assistant/                # AI chatbot
│   │   │   ├── documents/               # Document storage
│   │   │   ├── notes/                    # Quick notes
│   │   │   ├── emails/                   # Email campaigns
│   │   │   └── login/                    # Coordinator login
│   │   └── volunteer/                    # Volunteer-facing pages
│   │       ├── dashboard/                # Volunteer dashboard
│   │       ├── login/                    # Volunteer login
│   │       └── signup/                   # Volunteer signup
│   ├── lib/
│   │   ├── api.ts                        # API client (all backend calls)
│   │   ├── supabase.ts                   # Supabase browser client
│   │   └── utils.ts                      # Helpers (formatting, health calc)
│   ├── components/                       # UI components (shadcn/ui)
│   ├── providers/query-provider.tsx       # TanStack Query provider
│   └── types/index.ts                    # TypeScript interfaces
```

---

## 🧩 Component Details

### 1. Frontend — Next.js 16 on Vercel

| Component | Purpose |
|-----------|---------|
| `middleware.ts` | Supabase SSR auth guard — protects `/coordinator/*` routes, checks `role: coordinator` in JWT user_metadata |
| `lib/api.ts` | Centralized API client — all 7 route groups with typed functions, uses `NEXT_PUBLIC_API_URL` env var |
| `lib/supabase.ts` | Browser-side Supabase client for auth (login, signup, session) |
| `providers/query-provider.tsx` | TanStack Query (React Query) — caching, refetching, mutation invalidation |
| `components/ui/*` | shadcn/ui component library (30+ components) |
| `types/index.ts` | Shared TypeScript interfaces (`Volunteer`, `Campaign`) |

**Frontend → Backend:** All data flows through REST API calls in `lib/api.ts`  
**Frontend → Supabase:** Only for authentication (login/signup/session — NOT data queries)

---

### 2. Backend — FastAPI on AWS Lambda

#### Core Modules

| Module | External Service | Purpose |
|--------|-----------------|---------|
| `main.py` | — | App init, CORS, global error handler, `/stats`, `/cron/daily-decay`, Mangum handler |
| `config.py` | — | Pydantic Settings: loads 20+ env vars with defaults |
| `database.py` | Supabase | Singleton Supabase client via `@lru_cache` |
| `embeddings.py` | HuggingFace | `InferenceClient` for `all-MiniLM-L6-v2` (384-dim vectors) |
| `gemini.py` | Google Gemini | `gemini-2.5-flash-lite` model + system prompt for AI chat |
| `s3.py` | Backblaze B2 | boto3 S3 client with custom endpoint URL |
| `emails.py` | Resend | Single + bulk email sending |
| `redisnotes.py` | Upstash Redis | JSON notes CRUD with tag indexes, search, pin |
| `models.py` | — | 15 Pydantic schemas for validation |

#### Route Modules & Their Dependencies

| Route File | Prefix | Uses | External Calls |
|-----------|--------|------|----------------|
| `routes/volunteers.py` | `/volunteers` | database, embeddings | Supabase (CRUD), HuggingFace (embed on create/update) |
| `routes/tasks.py` | `/tasks` | database, embeddings, config | Supabase (CRUD + `match_volunteers` RPC), HuggingFace (embed on create) |
| `routes/activities.py` | `/activities` | database, config | Supabase (insert log + update volunteer score) |
| `routes/documents.py` | `/documents` | s3 | Backblaze B2 (upload/download/delete/list) |
| `routes/chatbot.py` | `/chatbot` | gemini | Google Gemini API (chat completion) |
| `routes/notes.py` | `/notes` | redisnotes | Upstash Redis (CRUD + search + tags) |
| `routes/emails.py` | `/emails` | emails, database | Resend API (single + bulk send) |

---

### 3. External Services

| Service | What It Does | Protocol | Module |
|---------|-------------|----------|--------|
| **Supabase** (PostgreSQL + pgvector) | Primary database — volunteers, tasks, activity_logs tables; `volunteer_retention_status` view; `match_volunteers()` RPC for cosine similarity | HTTPS (REST) | `database.py` |
| **Supabase Auth** | User authentication — coordinator login, volunteer signup, JWT sessions, role-based access | HTTPS (REST) | Frontend `middleware.ts` + `lib/supabase.ts` |
| **HuggingFace Inference API** | Text-to-vector embeddings — `sentence-transformers/all-MiniLM-L6-v2`, 384 dimensions | HTTPS (REST) | `embeddings.py` |
| **Google Gemini** | AI chatbot — `gemini-2.5-flash-lite` for coordinator assistant with system prompt | HTTPS (REST) | `gemini.py` |
| **Backblaze B2** | Document storage — S3-compatible object storage for PDF/DOCX/images | HTTPS (S3 API) | `s3.py` |
| **Upstash Redis** | Coordinator notes — JSON key-value store with tag indexing and search | TLS (Redis) | `redisnotes.py` |
| **Resend** | Email delivery — templated emails (welcome, reminder, thankyou, event) + custom HTML | HTTPS (REST) | `emails.py` |

---

### 4. Database Schema (Supabase)

**Tables:**
- `volunteers` — id, full_name, email, bio, skills[], embedding(384-dim), engagement_score, last_active_at, created_at
- `tasks` — id, title, description, required_skills[], task_vector(384-dim), status, created_at
- `activity_logs` — id, volunteer_id (FK), activity_type, points_awarded, created_at

**View:**
- `volunteer_retention_status` — Computed view: `health = engagement_score - (days_inactive × 2)`, status in (Healthy/Warning/At-Risk)

**RPC Function:**
- `match_volunteers(query_embedding, match_threshold, match_count)` — pgvector cosine similarity search against volunteer embeddings

---

## 🎯 Key Data Flows

### 1. Volunteer Creation (Embedding Flow)
```
Frontend → POST /volunteers → volunteers.py
  → embeddings.py → HuggingFace API (text → 384-dim vector)
  → database.py → Supabase INSERT (volunteer + embedding)
  → Response with volunteer data
```

### 2. Task Matching / Routing Engine
```
Frontend → GET /tasks/{id}/matches → tasks.py
  → database.py → Supabase SELECT task_vector
  → database.py → Supabase RPC match_volunteers(vector, threshold, count)
  → pgvector cosine similarity search
  → Ranked volunteer list with similarity scores
```

### 3. Engagement Pulse (Activity Logging)
```
Frontend → POST /activities → activities.py
  → database.py → Supabase INSERT activity_log
  → database.py → Supabase UPDATE volunteer (score += points, last_active_at = now)
```

### 4. Retention Health Check
```
Frontend → GET /volunteers/health → volunteers.py
  → database.py → Supabase SELECT from volunteer_retention_status VIEW
  → View computes: score - (days_inactive × 2) → Healthy/Warning/At-Risk
```

### 5. Daily Engagement Decay (Cron)
```
External Cron → POST /cron/daily-decay → main.py
  → database.py → Supabase SELECT all volunteers
  → compute_decay() per volunteer (adaptive exponential: ceil(base × e^(k×days) × score/100))
  → database.py → Supabase UPDATE each volunteer's engagement_score
```

### 6. AI Assistant Chat
```
Frontend → POST /chatbot/chat → chatbot.py
  → gemini.py → Load system_prompt.txt + conversation history
  → Google Gemini API (gemini-2.5-flash-lite)
  → AI response string
```

### 7. Document Storage
```
Frontend → POST /documents/upload → documents.py
  → s3.py → Backblaze B2 PUT (file bytes, namespaced by coordinator email)

Frontend → GET /documents/download/{key} → documents.py
  → s3.py → Backblaze B2 GET → StreamingResponse

Frontend → GET /documents/list → documents.py
  → s3.py → Backblaze B2 LIST (prefixed by coordinator email)
```

### 8. Coordinator Notes
```
Frontend → POST /notes → notes.py
  → redisnotes.py → Redis SET (JSON note) + SADD (coordinator index + tag indexes)

Frontend → GET /notes?coordinator_email=... → notes.py
  → redisnotes.py → Redis SMEMBERS + GET → sorted notes list
```

### 9. Email Campaigns
```
Frontend → POST /emails/send-template → emails.py
  → emails.py (module) → Resend API (templated HTML email)
  → Template substitution: {name}, {message}, {event}
```

### 10. Authentication Flow
```
User → Vercel (Next.js) → middleware.ts
  → Supabase Auth (getSession from cookie)
  → Role check: user_metadata.role === 'coordinator'
  → Allow/redirect based on auth state
```

---

## 🔌 Complete API Endpoints

| Endpoint | Method | Route Module | External Service |
|----------|--------|-------------|-----------------|
| `/` | GET | main.py | — |
| `/health` | GET | main.py | Supabase |
| `/info` | GET | main.py | — |
| `/stats` | GET | main.py | Supabase |
| `/cron/daily-decay` | POST | main.py | Supabase |
| `/volunteers` | POST | volunteers.py | Supabase + HuggingFace |
| `/volunteers` | GET | volunteers.py | Supabase |
| `/volunteers/health` | GET | volunteers.py | Supabase (view) |
| `/volunteers/{id}` | GET | volunteers.py | Supabase |
| `/volunteers/{id}` | PATCH | volunteers.py | Supabase + HuggingFace |
| `/volunteers/{id}` | DELETE | volunteers.py | Supabase |
| `/tasks` | POST | tasks.py | Supabase + HuggingFace |
| `/tasks` | GET | tasks.py | Supabase |
| `/tasks/{id}` | GET | tasks.py | Supabase |
| `/tasks/{id}/matches` | GET | tasks.py | Supabase (RPC) |
| `/tasks/{id}/recommendations` | GET | tasks.py | Supabase (RPC) |
| `/tasks/{id}` | PATCH | tasks.py | Supabase |
| `/tasks/{id}` | DELETE | tasks.py | Supabase |
| `/activities` | POST | activities.py | Supabase |
| `/activities` | GET | activities.py | Supabase |
| `/activities/volunteer/{id}` | GET | activities.py | Supabase |
| `/activities/{id}` | GET | activities.py | Supabase |
| `/activities/{id}` | DELETE | activities.py | Supabase |
| `/documents/upload` | POST | documents.py | Backblaze B2 |
| `/documents/list` | GET | documents.py | Backblaze B2 |
| `/documents/download/{key}` | GET | documents.py | Backblaze B2 |
| `/documents/{key}` | DELETE | documents.py | Backblaze B2 |
| `/chatbot/chat` | POST | chatbot.py | Google Gemini |
| `/chatbot/health` | GET | chatbot.py | — |
| `/notes` | POST | notes.py | Redis |
| `/notes` | GET | notes.py | Redis |
| `/notes/search` | GET | notes.py | Redis |
| `/notes/tags` | GET | notes.py | Redis |
| `/notes/{id}` | PATCH | notes.py | Redis |
| `/notes/{id}` | DELETE | notes.py | Redis |
| `/notes/health` | GET | notes.py | Redis |
| `/emails/send` | POST | emails.py | Resend |
| `/emails/send-template` | POST | emails.py | Resend |
| `/emails/templates` | GET | emails.py | — |
| `/emails/health` | GET | emails.py | — |

---

## 🏛️ Deployment Architecture

| Layer | Service | Details |
|-------|---------|---------|
| **Frontend** | Vercel (CDN + Edge) | Auto-deploy from GitHub `main` branch, root: `Frontend/volunteer-manager` |
| **Backend** | AWS Lambda (eu-north-1) | Python 3.11, 512MB, 30s timeout, Function URL (no API Gateway), Mangum adapter |
| **Database** | Supabase (managed PostgreSQL) | pgvector extension, Row Level Security, built-in Auth (JWT) |
| **Storage** | Backblaze B2 (S3-compatible) | Bucket: `claritycheck`, region: us-east-005 |
| **Cache** | Upstash Redis (serverless) | Notes storage with tag indexing |
| **AI** | HuggingFace + Google Gemini | Pure API calls — no local models |
| **Email** | Resend | Transactional email API with HTML templates |
