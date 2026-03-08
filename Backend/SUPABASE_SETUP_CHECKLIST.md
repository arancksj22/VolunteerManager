# ✅ Supabase Setup Verification Checklist

## 📋 What You've Already Done

Based on your BackendPRD, you've already run these SQL commands in Supabase:

### ✅ 1. Enable Extensions
```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### ✅ 2. Create Tables

**Volunteers Table**:
```sql
CREATE TABLE volunteers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  bio TEXT,
  skills TEXT[],
  embedding vector(384),
  engagement_score INT DEFAULT 100,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Tasks Table**:
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  required_skills TEXT[],
  task_vector vector(384),
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Activity Logs Table**:
```sql
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  volunteer_id UUID REFERENCES volunteers(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  points_awarded INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### ✅ 3. Create RPC Function (for Semantic Matching)

```sql
CREATE OR REPLACE FUNCTION match_volunteers (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  bio TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.id,
    v.full_name,
    v.bio,
    1 - (v.embedding <=> query_embedding) AS similarity
  FROM volunteers v
  WHERE 1 - (v.embedding <=> query_embedding) > match_threshold
  ORDER BY v.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### ✅ 4. Create View (for Retention Health)

```sql
CREATE OR REPLACE VIEW volunteer_retention_status AS
SELECT 
  v.id,
  v.full_name,
  v.email,
  (v.engagement_score - (EXTRACT(DAY FROM (NOW() - v.last_active_at)) * 2))::INT as current_health,
  CASE 
    WHEN (v.engagement_score - (EXTRACT(DAY FROM (NOW() - v.last_active_at)) * 2)) > 70 THEN 'Healthy'
    WHEN (v.engagement_score - (EXTRACT(DAY FROM (NOW() - v.last_active_at)) * 2)) BETWEEN 40 AND 70 THEN 'Warning'
    ELSE 'At-Risk'
  END as status
FROM volunteers v;
```

---

## 🎯 What You Need to Do NOW

### Step 1: Get Your Supabase Credentials

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Select your project**
3. **Go to Settings → API**
4. **Copy these values**:

   ```
   URL: https://[your-project-ref].supabase.co
   anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 2: Update Your `.env` File

```bash
# In Backend/.env
SUPABASE_URL=https://[your-project-ref].supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Verify Database Setup

Run this SQL in Supabase SQL Editor to verify everything:

```sql
-- Check extensions
SELECT * FROM pg_extension WHERE extname IN ('vector', 'uuid-ossp');

-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('volunteers', 'tasks', 'activity_logs');

-- Check RPC function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'match_volunteers';

-- Check view exists
SELECT table_name FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'volunteer_retention_status';
```

**Expected Results**:
- ✅ 2 extensions (vector, uuid-ossp)
- ✅ 3 tables (volunteers, tasks, activity_logs)
- ✅ 1 function (match_volunteers)
- ✅ 1 view (volunteer_retention_status)

---

## 🧪 Test Your Setup

### Test 1: Local Backend Connection

```bash
# In Backend directory
python setup.py
```

This will:
- ✅ Check Python version
- ✅ Check dependencies installed
- ✅ Verify .env configuration
- ✅ Test database connection
- ✅ Load embedding model

### Test 2: Create Test Volunteer

```python
# Run in Python console or create test.py
from dotenv import load_dotenv
load_dotenv()

from app.database import get_db
from app.embeddings import encode_text

# Connect to database
db = get_db()

# Create test volunteer
test_volunteer = {
    "full_name": "Test User",
    "email": "test@example.com",
    "bio": "Love helping with community events",
    "skills": ["organizing"],
    "embedding": encode_text("Love helping with community events"),
    "engagement_score": 100
}

result = db.table("volunteers").insert(test_volunteer).execute()
print("✅ Test volunteer created:", result.data)

# Query it back
volunteers = db.table("volunteers").select("*").execute()
print("✅ Volunteers in database:", len(volunteers.data))
```

### Test 3: Test RPC Function

```python
# After creating test volunteer
from app.database import get_db
from app.embeddings import encode_text

db = get_db()

# Generate test embedding
test_embedding = encode_text("Looking for event organizers")

# Call match_volunteers function
matches = db.rpc(
    "match_volunteers",
    {
        "query_embedding": test_embedding,
        "match_threshold": 0.3,
        "match_count": 5
    }
).execute()

print("✅ Matches found:", len(matches.data))
print("Matches:", matches.data)
```

### Test 4: Test Retention View

```sql
-- Run in Supabase SQL Editor
SELECT * FROM volunteer_retention_status;
```

Should return volunteers with their `current_health` and `status`.

---

## ⚠️ Potential Issues & Solutions

### Issue 1: "relation 'volunteers' does not exist"
**Solution**: Run the CREATE TABLE commands again in Supabase SQL Editor.

### Issue 2: "extension 'vector' does not exist"
**Solution**: 
1. Go to Supabase Dashboard → Database → Extensions
2. Enable "pgvector" extension
3. Or run: `CREATE EXTENSION vector;`

### Issue 3: "function match_volunteers does not exist"
**Solution**: Run the CREATE FUNCTION command again.

### Issue 4: Connection refused or timeout
**Solution**:
1. Check SUPABASE_URL and SUPABASE_KEY in .env
2. Verify project is not paused (free tier pauses after inactivity)
3. Check network/firewall settings

### Issue 5: "embedding vector dimension mismatch"
**Solution**: 
- The model generates 384 dimensions
- Ensure vector(384) in table definition
- If changed, recreate tables or alter column type

---

## 🔐 Security Settings (Optional but Recommended)

### Row Level Security (RLS)

By default, Supabase has RLS disabled for new tables. For development, this is fine. For production:

```sql
-- Enable RLS
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (example for public read access)
CREATE POLICY "Allow public read access" 
ON volunteers FOR SELECT 
USING (true);

-- For write access, add authentication policies when you implement auth
```

**For now**: Keep RLS disabled during development.

---

## 📊 Verify Everything Works End-to-End

### Complete Test Script

Save as `test_supabase.py` in Backend directory:

```python
"""
Complete Supabase integration test
"""
import os
from dotenv import load_dotenv
from app.database import get_db
from app.embeddings import encode_text

load_dotenv()

def test_connection():
    print("🧪 Testing Supabase Connection...")
    try:
        db = get_db()
        result = db.table("volunteers").select("id").limit(1).execute()
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

def test_embedding_generation():
    print("\n🧪 Testing Embedding Generation...")
    try:
        text = "Passionate about community organizing"
        embedding = encode_text(text)
        assert len(embedding) == 384, f"Expected 384 dims, got {len(embedding)}"
        print(f"✅ Embedding generated: {len(embedding)} dimensions")
        return True
    except Exception as e:
        print(f"❌ Embedding failed: {e}")
        return False

def test_create_volunteer():
    print("\n🧪 Testing Volunteer Creation...")
    try:
        db = get_db()
        
        volunteer_data = {
            "full_name": "Integration Test User",
            "email": f"test_{os.getpid()}@example.com",  # Unique email
            "bio": "Testing the volunteer management system",
            "skills": ["testing", "debugging"],
            "embedding": encode_text("Testing the volunteer management system"),
        }
        
        result = db.table("volunteers").insert(volunteer_data).execute()
        volunteer_id = result.data[0]["id"]
        print(f"✅ Volunteer created: {volunteer_id}")
        return volunteer_id
    except Exception as e:
        print(f"❌ Volunteer creation failed: {e}")
        return None

def test_create_task():
    print("\n🧪 Testing Task Creation...")
    try:
        db = get_db()
        
        task_data = {
            "title": "Test Task",
            "description": "Looking for someone to help with testing",
            "required_skills": ["testing"],
            "task_vector": encode_text("Looking for someone to help with testing"),
        }
        
        result = db.table("tasks").insert(task_data).execute()
        task_id = result.data[0]["id"]
        print(f"✅ Task created: {task_id}")
        return task_id
    except Exception as e:
        print(f"❌ Task creation failed: {e}")
        return None

def test_matching(task_id):
    print("\n🧪 Testing Semantic Matching...")
    try:
        db = get_db()
        
        # Get task vector
        task = db.table("tasks").select("task_vector").eq("id", task_id).execute()
        task_vector = task.data[0]["task_vector"]
        
        # Call match function
        matches = db.rpc(
            "match_volunteers",
            {
                "query_embedding": task_vector,
                "match_threshold": 0.1,  # Low threshold for testing
                "match_count": 10
            }
        ).execute()
        
        print(f"✅ Matching works: Found {len(matches.data)} matches")
        if matches.data:
            print(f"   Top match: {matches.data[0]['full_name']} ({matches.data[0]['similarity']:.2f})")
        return True
    except Exception as e:
        print(f"❌ Matching failed: {e}")
        return False

def test_retention_view():
    print("\n🧪 Testing Retention Health View...")
    try:
        db = get_db()
        result = db.table("volunteer_retention_status").select("*").limit(5).execute()
        print(f"✅ Retention view works: {len(result.data)} volunteers")
        if result.data:
            for v in result.data[:3]:
                print(f"   {v['full_name']}: {v['status']} (Health: {v['current_health']})")
        return True
    except Exception as e:
        print(f"❌ Retention view failed: {e}")
        return False

def test_activity_logging(volunteer_id):
    print("\n🧪 Testing Activity Logging...")
    try:
        db = get_db()
        
        # Get current score
        before = db.table("volunteers").select("engagement_score").eq("id", volunteer_id).execute()
        before_score = before.data[0]["engagement_score"]
        
        # Log activity
        activity_data = {
            "volunteer_id": volunteer_id,
            "activity_type": "task_completion",
            "points_awarded": 50
        }
        db.table("activity_logs").insert(activity_data).execute()
        
        # Update volunteer
        db.table("volunteers").update({
            "engagement_score": before_score + 50,
            "last_active_at": "now()"
        }).eq("id", volunteer_id).execute()
        
        # Verify
        after = db.table("volunteers").select("engagement_score").eq("id", volunteer_id).execute()
        after_score = after.data[0]["engagement_score"]
        
        assert after_score == before_score + 50, "Score didn't update correctly"
        print(f"✅ Activity logging works: {before_score} → {after_score}")
        return True
    except Exception as e:
        print(f"❌ Activity logging failed: {e}")
        return False

def main():
    print("\n" + "="*60)
    print("🚀 SUPABASE INTEGRATION TEST SUITE")
    print("="*60)
    
    tests_passed = 0
    tests_total = 7
    
    # Run tests
    if test_connection():
        tests_passed += 1
    
    if test_embedding_generation():
        tests_passed += 1
    
    volunteer_id = test_create_volunteer()
    if volunteer_id:
        tests_passed += 1
    
    task_id = test_create_task()
    if task_id:
        tests_passed += 1
    
    if task_id and test_matching(task_id):
        tests_passed += 1
    
    if test_retention_view():
        tests_passed += 1
    
    if volunteer_id and test_activity_logging(volunteer_id):
        tests_passed += 1
    
    # Summary
    print("\n" + "="*60)
    print(f"📊 TEST RESULTS: {tests_passed}/{tests_total} passed")
    print("="*60)
    
    if tests_passed == tests_total:
        print("✅ ALL TESTS PASSED! Your Supabase is ready! 🎉")
    else:
        print(f"⚠️  {tests_total - tests_passed} test(s) failed. Check errors above.")
    
    return tests_passed == tests_total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
```

Run it:
```bash
python test_supabase.py
```

---

## ✅ Final Checklist

Before starting frontend development:

- [ ] ✅ Supabase extensions enabled (vector, uuid-ossp)
- [ ] ✅ All tables created (volunteers, tasks, activity_logs)
- [ ] ✅ RPC function created (match_volunteers)
- [ ] ✅ View created (volunteer_retention_status)
- [ ] ✅ Credentials copied to `.env` file
- [ ] ✅ Backend setup script passes (`python setup.py`)
- [ ] ✅ Integration test passes (`python test_supabase.py`)
- [ ] ✅ API starts locally (`python -m app.main`)
- [ ] ✅ Swagger docs accessible at `/docs`

---

## 🎯 Will It "Magically Work"?

### ✅ **YES**, if you:

1. ✅ Already ran all the SQL commands (you said you did!)
2. ✅ Copy SUPABASE_URL and SUPABASE_KEY to `.env`
3. ✅ Install Python dependencies (`pip install -r requirements.txt`)
4. ✅ Run the backend (`python -m app.main`)

### The Magic Flow:

```
1. You create volunteer via API
   ↓
2. Backend generates 384-dim embedding
   ↓
3. Saves to Supabase volunteers table
   ↓
4. You call /tasks/{id}/matches
   ↓
5. Backend fetches task_vector
   ↓
6. Calls match_volunteers() RPC in Supabase
   ↓
7. PostgreSQL pgvector calculates cosine similarity
   ↓
8. Returns ranked volunteers
   ↓
9. 🎉 MAGIC!
```

---

## 🚨 If Something Doesn't Work

### Quick Debug Checklist:

1. **Check logs**: Look at terminal output when starting backend
2. **Test connection**: Visit `http://localhost:8000/health`
3. **Check Supabase**: Verify project isn't paused (free tier auto-pauses)
4. **Verify schema**: Run verification SQL above
5. **Check credentials**: Ensure URL and Key are correct in `.env`
6. **Clear cache**: Delete any cached model files and re-download

---

## 📞 Next Steps

After verification:

1. ✅ Keep backend running locally
2. ✅ Give the FRONTEND_INTEGRATION_SPEC.md to Claude
3. ✅ Build beautiful frontend
4. ✅ Deploy backend to AWS Lambda (when ready)
5. ✅ Update frontend to use Lambda URL
6. ✅ Launch! 🚀

---

**You're all set!** Just plug in credentials and it WILL work magically! 🪄✨
