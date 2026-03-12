<div align="center">

<img src="Frontend/volunteer-manager/public/LogoIcon.jpg" alt="MissionMatch Logo" width="120" height="120" style="border-radius: 20px;" />

# MissionMatch

**AI-powered volunteer management platform for animal advocacy organizations.**

[![Deployed on Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://volunteer2-mu.vercel.app)
[![AWS Lambda](https://img.shields.io/badge/Backend-AWS%20Lambda-FF9900?logo=awslambda&logoColor=white)](https://aws.amazon.com/lambda/)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

An intelligent platform that uses semantic AI matching and behavioral analytics to help nonprofit coordinators recruit, retain, and re-engage volunteers before they churn.

---

## Table of Contents

- [Architecture Diagram](#architecture-diagram)
- [Tech Stack](#tech-stack)
- [Demo Video](#demo-video)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [License](#license)

---

## Architecture Diagram

<div align="center">

<img src="docs/architecture-diagram.png" alt="MissionMatch Architecture Diagram" width="800" />

</div>

---

## Tech Stack

### Frontend

| Technology | Purpose |
|-----------|---------|
| Next.js 16 | React framework with App Router, SSR, middleware |
| React 19 | UI library |
| TypeScript 5 | Type safety |
| Tailwind CSS 4 | Utility-first styling |
| shadcn/ui | 30+ accessible UI components (Radix primitives) |
| TanStack Query 5 | Server state management, caching, mutations |
| Framer Motion | Scroll animations and transitions |
| Recharts | Dashboard charts and visualizations |
| React Hook Form + Zod | Form validation |
| Supabase SSR | Auth middleware (JWT session management) |

### Backend

| Technology | Purpose |
|-----------|---------|
| FastAPI 0.109 | Python ASGI web framework |
| Mangum 0.17 | ASGI-to-Lambda adapter |
| Pydantic 2.5 | Request/response validation (15 schemas) |
| Supabase Python 2.3 | Database client (PostgreSQL + pgvector) |
| HuggingFace Hub | Inference API client for embeddings |
| Google Generative AI | Gemini 2.5 Flash Lite chatbot |
| Boto3 | S3-compatible storage client (Backblaze B2) |
| Redis | Serverless notes storage (Upstash) |
| Resend | Transactional email API |

### Infrastructure

| Service | Role |
|---------|------|
| AWS Lambda (eu-north-1) | Serverless backend hosting (Function URL, no API Gateway) |
| Vercel | Frontend CDN and edge deployment |
| Supabase | Managed PostgreSQL + pgvector + Auth (JWT) |
| Backblaze B2 | S3-compatible document storage |
| Upstash Redis | Serverless Redis for coordinator notes |
| HuggingFace Inference API | all-MiniLM-L6-v2 embeddings (384 dimensions) |
| Google Gemini | AI assistant (gemini-2.5-flash-lite) |
| Resend | Email delivery with HTML templates |

---

## Demo Video

<div align="center">

[![MissionMatch Demo](https://img.shields.io/badge/Watch%20Demo-YouTube-red?logo=youtube&logoColor=white&style=for-the-badge)](https://youtube.com)

<!-- Replace the link above with your actual demo video URL -->

</div>

---

## Features

### AI-Powered Volunteer Matching (Routing Engine)
- Converts volunteer bios and task descriptions into 384-dimensional vectors using HuggingFace
- Performs cosine similarity search via pgvector to rank the best-fit volunteers for any task
- Configurable match threshold and result count

### Volunteer Retention Intelligence
- Real-time health monitoring with a computed database view
- Health formula: `score - (days_inactive x 2)` producing Healthy / Warning / At-Risk status
- Dashboard visualizations showing health distribution across all volunteers

### Adaptive Engagement Decay (Cron)
- Daily cron endpoint applies exponential decay: `decay = ceil(base x e^(k x days) x score/100)`
- Score-relative scaling so high-engagement volunteers decay proportionally
- Capped at 15 points/day to prevent score annihilation

### Activity Logging (Engagement Pulse)
- Tracks signup (10pts), task completion (50pts), check-in (5pts), and custom activities
- Automatically updates volunteer engagement scores and last-active timestamps
- Full activity history per volunteer

### AI Assistant (Gemini Chatbot)
- Coordinator-facing AI assistant powered by Gemini 2.5 Flash Lite
- System prompt tuned for volunteer management, campaign planning, and retention advice
- Conversation history support (last 4 messages for context)

### Email Campaigns
- 4 built-in HTML templates: Welcome, Reminder, Thank You, Campaign Announcement
- Single and bulk email sending via Resend API
- Template variable substitution for personalized outreach

### Document Storage
- Upload PDF, DOCX, TXT, and image files to Backblaze B2
- Files namespaced by coordinator email for isolation
- Streaming download and file listing

### Coordinator Notes
- Redis-backed quick notes with tagging and search
- Pin important notes to the top
- Full CRUD with tag-based filtering

### Authentication and Authorization
- Supabase Auth with JWT sessions
- Next.js middleware protects all `/coordinator/*` routes
- Role-based access: only users with `role: coordinator` in user_metadata can access the dashboard
- Separate volunteer signup and login flows

---

## System Architecture

The platform follows a clean three-tier architecture. The Next.js frontend (hosted on Vercel) handles all UI rendering, authentication via Supabase Auth middleware, and data fetching through TanStack Query. Every data request flows through a centralized API client to the FastAPI backend running on AWS Lambda as a serverless function (no API Gateway, direct Function URL). The backend orchestrates seven route modules, each connecting to specific external services: Supabase PostgreSQL with pgvector for all relational data and vector similarity searches, HuggingFace Inference API for generating 384-dimensional text embeddings, Google Gemini for the AI chatbot, Backblaze B2 for document storage, Upstash Redis for coordinator notes, and Resend for email delivery. The frontend never queries the database directly; all data flows through the Lambda backend, while authentication is handled client-side through Supabase Auth.

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- A Supabase project with pgvector enabled
- API keys for: HuggingFace (optional), Google Gemini, Resend, Backblaze B2, Upstash Redis

### Backend Setup

```bash
cd Backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys and Supabase credentials

# Run locally
python -m app.main
# API docs available at http://localhost:8000/docs
```

### Frontend Setup

```bash
cd Frontend/volunteer-manager

# Install dependencies
npm install

# Configure environment
# Create .env with:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Run development server
npm run dev
# Available at http://localhost:3000
```

### Supabase Setup

1. Create a new Supabase project
2. Enable the `vector` extension in SQL Editor: `CREATE EXTENSION IF NOT EXISTS vector;`
3. Create tables (`volunteers`, `tasks`, `activity_logs`) as defined in [Database Schema](#database-schema)
4. Create the `volunteer_retention_status` view
5. Create the `match_volunteers` RPC function for cosine similarity search
6. See [SUPABASE_SETUP_CHECKLIST.md](Backend/SUPABASE_SETUP_CHECKLIST.md) for the full SQL setup

---

## Deployment

### Backend (AWS Lambda)

The backend deploys as a ZIP file to AWS Lambda with a Function URL (no API Gateway needed).

```bash
cd Backend

# Build the deployment ZIP (Linux-compatible binaries)
powershell -ExecutionPolicy Bypass -File build_lambda_zip.ps1
# Produces lambda-deploy.zip (~16 MB)
```

Lambda configuration:
- Runtime: Python 3.11
- Handler: `app.main.handler`
- Memory: 512 MB
- Timeout: 30 seconds
- Function URL: Enabled (Auth type: NONE)
- All environment variables set in Lambda console

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set root directory to `Frontend/volunteer-manager`
3. Add environment variables (see below)
4. Deploy (auto-deploys on push to `main`)

---

## Environment Variables

### Backend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_KEY` | Yes | Supabase anon/service key |
| `HUGGINGFACE_API_KEY` | No | HuggingFace API key (optional, improves rate limits) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `S3_ACCESS_KEY_ID` | Yes | Backblaze B2 application key ID |
| `S3_SECRET_ACCESS_KEY` | Yes | Backblaze B2 application key |
| `S3_REGION` | Yes | Backblaze B2 region (e.g., `us-east-005`) |
| `AWS_S3_BUCKET` | Yes | B2 bucket name |
| `AWS_ENDPOINT_URL` | Yes | B2 endpoint (e.g., `https://s3.us-east-005.backblazeb2.com`) |
| `REDIS_HOST` | Yes | Upstash Redis host |
| `REDIS_PORT` | Yes | Upstash Redis port (default: `6379`) |
| `REDIS_PASSWORD` | Yes | Upstash Redis password |
| `RESEND_API_KEY` | Yes | Resend email API key |
| `ENVIRONMENT` | No | `development` or `production` (default: `development`) |

### Frontend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL (Lambda Function URL) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |

---

## API Endpoints

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
| POST | `/documents/upload` | Upload file to Backblaze B2 |
| GET | `/documents/list` | List coordinator documents |
| GET | `/documents/download/{key}` | Download file (streaming) |
| DELETE | `/documents/{key}` | Delete file |

### Chatbot (`/chatbot`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chatbot/chat` | Send message to Gemini AI assistant |
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

---

## Database Schema

### Tables

**volunteers**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| full_name | TEXT | Volunteer name |
| email | TEXT (UNIQUE) | Email address |
| bio | TEXT | Free-text biography |
| skills | TEXT[] | Array of skill tags |
| embedding | VECTOR(384) | Semantic embedding from bio |
| engagement_score | INTEGER | Current engagement score (starts at 100) |
| last_active_at | TIMESTAMPTZ | Last activity timestamp |
| created_at | TIMESTAMPTZ | Registration timestamp |

**tasks**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| title | TEXT | Task title |
| description | TEXT | Task description |
| required_skills | TEXT[] | Required skill tags |
| task_vector | VECTOR(384) | Semantic embedding from description |
| status | TEXT | open / filled / completed |
| created_at | TIMESTAMPTZ | Creation timestamp |

**activity_logs**
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL (PK) | Auto-increment |
| volunteer_id | UUID (FK) | References volunteers.id |
| activity_type | TEXT | signup / task_completion / check_in / custom |
| points_awarded | INTEGER | Points for this activity |
| created_at | TIMESTAMPTZ | Log timestamp |

### View

**volunteer_retention_status**

Computed view that calculates real-time health for each volunteer:

```sql
health = engagement_score - (days_since_last_active * 2)

Status:
  health > 70  => 'Healthy'
  health 40-70 => 'Warning'
  health < 40  => 'At-Risk'
```

### RPC Function

**match_volunteers(query_embedding, match_threshold, match_count)**

pgvector cosine similarity search that ranks volunteers against a task embedding vector. Returns volunteer ID, name, bio, and similarity score.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

Built by [Aranck Jomraj](https://github.com/arancksj22)

FastAPI | Next.js | Supabase | AWS Lambda | HuggingFace | Google Gemini

</div>