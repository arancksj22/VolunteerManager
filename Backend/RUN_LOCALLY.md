# Running Backend Locally

This guide explains how to run the FastAPI backend on your local machine for development and testing before deploying to AWS Lambda.

---

## Prerequisites

- Python 3.11+ installed
- Supabase project created (see Backend/SUPABASE_SETUP_CHECKLIST.md)
- Hugging Face API token (for embeddings)

---

## Step 1: Navigate to Backend Directory

```bash
cd Backend
```

---

## Step 2: Create Virtual Environment

### Windows PowerShell:
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### macOS/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

---

## Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `supabase` - Database client
- `sentence-transformers` - AI embeddings
- `pydantic` - Data validation
- And other dependencies...

---

## Step 4: Configure Environment Variables

Create a `.env` file in the `Backend/` directory:

```bash
# Supabase Configuration
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_KEY=your_service_role_key_here

# Hugging Face (for embeddings)
HUGGING_FACE_TOKEN=your_hf_token_here

# Engagement Points (optional - has defaults)
POINTS_SIGNUP=10
POINTS_TASK_COMPLETION=50
POINTS_CHECK_IN=5
```

### Getting Your Supabase Service Role Key:
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **"service_role"** key (NOT the anon key!)
   - ⚠️ **Warning**: This key bypasses RLS - keep it secret!

### Getting Your Hugging Face Token (Free):
1. Go to [huggingface.co](https://huggingface.co/) and sign up
2. Go to **Settings** → **Access Tokens**
3. Click **"New token"** → Name it `volunteer-manager` → Select **"Read"** permission
4. Copy the token (starts with `hf_...`)

---

## Step 5: Verify Supabase Database Setup

Ensure your Supabase database has the required tables. Run the SQL migrations from `Backend/SUPABASE_SETUP_CHECKLIST.md`:

1. `volunteers` table with pgvector extension
2. `tasks` table
3. `activity_logs` table
4. `volunteer_retention_status` materialized view

**Quick check via Python**:
```bash
python -c "from app.database import get_db; db = next(get_db()); print('✓ Database connected!')"
```

If this errors, double-check your `.env` file.

---

## Step 6: Start the Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Flags explained**:
- `--reload` - Auto-restart on code changes
- `--host 0.0.0.0` - Accept connections from any IP (important for Next.js frontend to connect)
- `--port 8000` - Run on port 8000 (matches frontend API_BASE_URL)

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

---

## Step 7: Test the API

### Option A: Browser
Open http://localhost:8000/docs to see the **interactive API documentation** (Swagger UI).

### Option B: CURL
```bash
# Test health check
curl http://localhost:8000/stats

# Create a test volunteer
curl -X POST http://localhost:8000/volunteers \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test Volunteer",
    "email": "test@example.com",
    "bio": "Passionate about animal welfare",
    "skills": ["Fundraising", "Social Media", "Event Planning"]
  }'
```

### Option C: From Frontend
1. Start frontend: `cd Frontend/volunteer-manager && npm run dev`
2. Open http://localhost:3000
3. Go to volunteer signup → Fill form → Submit
4. Check backend logs for incoming request

---

## Step 8: Enable CORS for Frontend

The backend should already have CORS configured in `app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

If you change the frontend port, update this!

---

## Common Issues & Fixes

### "ModuleNotFoundError: No module named 'app'"
- Make sure you're in the `Backend/` directory
- Activate virtual environment: `.\venv\Scripts\Activate.ps1`
- Reinstall: `pip install -r requirements.txt`

### "Connection refused" or "Failed to connect to Supabase"
- Check `.env` file has correct `SUPABASE_URL` and `SUPABASE_KEY`
- Verify Supabase project is active (not paused)
- Test connection: `python -c "from app.database import get_db; next(get_db())"`

### "ModuleNotFoundError: No module named 'sentence_transformers'"
- The first run downloads the AI model (~100MB) - be patient
- If it fails, manually install: `pip install sentence-transformers`
- Check internet connection (model downloads from Hugging Face)

### "Invalid API token" (Hugging Face)
- Verify `HUGGING_FACE_TOKEN` in `.env` is correct
- Token should start with `hf_`
- Create a new token at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)

### Frontend can't connect to backend
- Check backend is running on 0.0.0.0:8000 (not 127.0.0.1)
- Verify CORS allows `http://localhost:3000`
- Check firewall isn't blocking port 8000
- In frontend `.env.local`, ensure `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`

### "pgvector extension not found"
- Supabase should auto-enable pgvector, but if not:
- Go to **Database** → **Extensions** in Supabase dashboard
- Search for `vector` and click **Enable**

---

## Development Workflow

1. **Make code changes** in `Backend/app/`
2. **Save file** → Uvicorn auto-reloads
3. **Test in browser** at http://localhost:8000/docs
4. **Check logs** in terminal for errors
5. **Connect frontend** to test full flow

---

## API Endpoints Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/volunteers` | List all volunteers |
| `POST` | `/volunteers` | Create volunteer (generates embedding) |
| `GET` | `/volunteers/{id}` | Get volunteer by ID |
| `PUT` | `/volunteers/{id}` | Update volunteer info |
| `GET` | `/volunteers/health` | Get health status (with filter) |
| `GET` | `/tasks` | List all campaigns/tasks |
| `POST` | `/tasks` | Create campaign |
| `GET` | `/tasks/{id}/match` | **AI matching** (min_similarity param) |
| `POST` | `/activities` | Log activity (updates engagement) |
| `GET` | `/stats` | Dashboard statistics |

**See `Backend/API_QUICK_REFERENCE.md` for full details.**

---

## Stopping the Server

Press **CTRL+C** in the terminal running uvicorn.

To deactivate the virtual environment:
```bash
deactivate
```

---

## Next: Deploy to AWS Lambda

Once everything works locally, follow `Backend/LAMBDA_DEPLOYMENT_GUIDE.md` to deploy to production.

**Pre-deployment checklist**:
- [ ] All endpoints tested locally
- [ ] Frontend successfully connects
- [ ] AI matching returns results
- [ ] Activity logging updates engagement scores
- [ ] Supabase database has test data
- [ ] `.env` configured for production (update SUPABASE_URL if needed)

---

## Monitoring & Debugging

### View Logs
Uvicorn prints all requests and errors to console. Look for:
- `INFO` - Normal requests
- `WARNING` - Potential issues
- `ERROR` - Failed requests (check stack trace)

### Check Database
Use Supabase **Table Editor** to inspect data:
- Go to **Database** → **Tables** → Select table
- View/edit rows directly

### Debug with Breakpoints (VS Code)
1. Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "debugpy",
      "request": "launch",
      "module": "uvicorn",
      "args": ["app.main:app", "--reload", "--port", "8000"],
      "jinja": true,
      "cwd": "${workspaceFolder}/Backend"
    }
  ]
}
```
2. Set breakpoints in code
3. Press F5 to start debugging

---

## Production Considerations

When deploying to Lambda (not running locally):
- ⚠️ Remove `--reload` flag (production uses Lambda's runtime)
- Use environment variables from AWS Systems Manager or Lambda config
- Enable CloudWatch logging
- Set up API Gateway for HTTPS
- Update CORS to allow production frontend domain

See `LAMBDA_DEPLOYMENT_GUIDE.md` for full instructions.
