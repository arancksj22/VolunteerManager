# ⏰ Background Jobs & Cron - DO YOU NEED THEM?

## 🎯 **TL;DR: NO, YOU DON'T NEED CRONJOBS!**

The health decay (retention intelligence) is **100% automatic** via PostgreSQL database view. No background jobs, no Celery, no cronjobs required!

---

## 🧠 How Health Calculation Works

### **The PostgreSQL VIEW Approach (Current Implementation)**

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

**How it works:**
1. Every time you query `GET /volunteers/health`, the database calculates health **in real-time**
2. Formula: `current_health = engagement_score - (days_inactive × 2)`
3. Status determined by thresholds (>70 = Healthy, 40-70 = Warning, <40 = At-Risk)
4. **No background processing needed** - calculations happen on-demand

**Advantages:**
- ✅ Always up-to-date (calculates on every request)
- ✅ No infrastructure needed (no Celery, Redis, cron servers)
- ✅ Zero maintenance (database handles everything)
- ✅ Works on free hosting (Lambda, Railway, etc.)
- ✅ Lightweight (~5ms calculation time)

**Disadvantages:**
- ⚠️ No proactive notifications (doesn't send emails automatically)
- ⚠️ Requires API call to get status (not push-based)

---

## 💡 **When WOULD You Need Background Jobs?**

### Use Case 1: Automated Email Notifications

**Scenario**: Send weekly email to at-risk volunteers automatically

**WITHOUT background jobs (current setup):**
```bash
# Coordinator manually checks dashboard
# Sees at-risk volunteers
# Sends emails manually or clicks "Email All At-Risk"
```

**WITH background jobs (optional enhancement):**
```python
# Runs every Monday at 9am automatically
# Queries GET /volunteers/health?status_filter=At-Risk
# Sends personalized email to each at-risk volunteer
# Logs activity in system
```

**Implementation options:**
1. **AWS EventBridge + Lambda** (free tier, runs scheduled Lambda function)
2. **GitHub Actions Cron** (free, runs workflow on schedule)
3. **Celery + Redis** (requires Redis server, not free on most hosts)
4. **External cron service** (cron-job.org, EasyCron)

---

### Use Case 2: Daily Summary Reports

**Scenario**: Email coordinator daily stats

**Implementation:**
```python
# Lambda function triggered daily at 8am
# Fetches dashboard stats
# Composes HTML email
# Sends to coordinator
```

**Cost:** $0 (within Lambda free tier)

---

### Use Case 3: Data Cleanup/Archiving

**Scenario**: Archive old volunteer records after 2 years of inactivity

**Implementation:**
```python
# Runs monthly
# Finds volunteers inactive > 730 days
# Archives to S3 or separate table
# Deletes from main table
```

---

## 🚀 **How to Add Background Jobs (If You Want Them)**

### Option A: AWS Lambda EventBridge (Recommended for Lambda deployment)

**Step 1**: Add to `serverless.yml`

```yaml
functions:
  api:
    handler: app.main.handler
    events:
      - httpApi: ...  # Your existing HTTP API
  
  # NEW: Scheduled function
  sendWeeklyEmails:
    handler: app.jobs.send_weekly_emails
    events:
      - schedule:
          rate: cron(0 9 * * MON *)  # Every Monday at 9am UTC
          enabled: true
```

**Step 2**: Create `app/jobs.py`

```python
import requests
from app.config import settings

def send_weekly_emails(event, context):
    """Lambda function triggered by EventBridge schedule."""
    
    # Get at-risk volunteers
    response = requests.get(
        f"{settings.api_base_url}/volunteers/health?status_filter=At-Risk"
    )
    at_risk = response.json()
    
    # Send emails
    for volunteer in at_risk:
        send_email(
            to=volunteer['email'],
            subject="We miss you at the sanctuary!",
            body=f"Hi {volunteer['full_name']}, we haven't seen you in a while..."
        )
    
    return {
        "statusCode": 200,
        "body": f"Sent {len(at_risk)} emails"
    }
```

**Cost**: $0 (within free tier, even with daily runs)

---

### Option B: GitHub Actions Cron (Simplest, No Infrastructure)

**Step 1**: Create `.github/workflows/weekly-emails.yml`

```yaml
name: Weekly At-Risk Emails

on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9am UTC

jobs:
  send-emails:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      
      - name: Install dependencies
        run: pip install requests
      
      - name: Send emails to at-risk volunteers
        env:
          API_URL: ${{ secrets.API_URL }}
        run: python scripts/send_weekly_emails.py
```

**Step 2**: Create `scripts/send_weekly_emails.py`

```python
import os
import requests

api_url = os.getenv('API_URL')

# Get at-risk volunteers
response = requests.get(f"{api_url}/volunteers/health?status_filter=At-Risk")
at_risk = response.json()

print(f"Found {len(at_risk)} at-risk volunteers")

# TODO: Integrate with email service (SendGrid, Mailgun, etc.)
for volunteer in at_risk:
    print(f"Would send email to {volunteer['email']}")
```

**Cost**: $0 (GitHub Actions free tier includes 2,000 minutes/month)

---

### Option C: External Cron Service (Zero Code Changes)

**Services:**
- https://cron-job.org (free, reliable)
- https://console.cron-job.org
- https://www.easycron.com

**Setup:**
1. Create account
2. Add job: `GET https://your-api.com/volunteers/health?status_filter=At-Risk`
3. Set schedule: Every Monday at 9am
4. Add webhook to send results to email service

**No code changes needed!** Just HTTP requests.

---

## 📊 **Comparison: Cronjob Approaches**

| Approach | Cost | Complexity | Reliability | Best For |
|----------|------|------------|-------------|----------|
| **None (current)** | $0 | None | N/A | Manual checks OK |
| **AWS EventBridge** | $0 | Medium | ⭐⭐⭐⭐⭐ | Lambda deployments |
| **GitHub Actions** | $0 | Low | ⭐⭐⭐⭐ | Simple scheduled tasks |
| **External Cron** | $0-5 | Very Low | ⭐⭐⭐ | Quick & dirty automation |
| **Celery + Redis** | $5-15 | High | ⭐⭐⭐⭐ | Complex workflows |

---

## 🎯 **Recommendations**

### For Most Users: **DON'T ADD CRONJOBS YET**

**Why:**
- Health calculation already works perfectly without them
- Coordinator can manually check dashboard and send emails
- Adds complexity for minimal benefit early on

**When to add later:**
- You have >500 volunteers (manual checks tedious)
- Coordinator wants automated weekly reports
- Need proactive "we miss you" campaigns

---

### If You Deploy to Lambda: **Use EventBridge**

```yaml
# serverless.yml
functions:
  weeklyReport:
    handler: app.jobs.send_weekly_report
    events:
      - schedule: rate(7 days)
```

**Cost**: $0 within free tier

---

### If You Want Dead Simple: **GitHub Actions**

**Pros:**
- Free forever
- No infrastructure
- Works with any API deployment
- Edit schedule in YAML

**Cons:**
- Runs on GitHub's servers (not your infrastructure)
- Max 60 second runtime
- Not real-time (cron only)

---

## 🧪 Testing Scheduled Jobs Locally

### Lambda EventBridge Simulation

```bash
# Install serverless-offline plugin
npm install --save-dev serverless-offline

# Run locally
serverless offline start

# Trigger scheduled function manually
serverless invoke local --function sendWeeklyEmails
```

### GitHub Actions Local Testing

```bash
# Install act (https://github.com/nektos/act)
winget install nektos.act

# Run workflow locally
act schedule
```

---

## ✅ **Final Answer: Do You Need Cronjobs?**

### **NO** if:
- ✅ Coordinators manually check dashboard (current setup)
- ✅ <200 volunteers
- ✅ Want to keep it simple
- ✅ Budget: $0

### **YES** if:
- 📧 Want automated weekly "we miss you" emails
- 📊 Want daily/weekly summary reports emailed
- 🔄 Want data cleanup/archiving automation
- 🎯 >500 volunteers (too many to manually track)

**Recommendation**: Start without cronjobs, add later if needed. Health calculation already works perfectly!

---

## 📚 Resources

- **AWS EventBridge Docs**: https://docs.aws.amazon.com/eventbridge/
- **GitHub Actions Cron**: https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule
- **Celery (if you really want it)**: https://docs.celeryproject.org/
- **External Cron Services**: https://cron-job.org

**Questions?** Open an issue or check the deployment guides!
