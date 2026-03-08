# 🎯 VolunteerManager API Quick Reference

## Base URLs

- **Local**: `http://localhost:8000`
- **Lambda**: `https://your-api-id.execute-api.region.amazonaws.com/`

---

## 🔑 Quick Examples

### Create a Volunteer
```bash
curl -X POST http://localhost:8000/volunteers \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "bio": "Loves community organizing and event planning",
    "skills": ["organizing", "communication", "leadership"]
  }'
```

### Create a Task
```bash
curl -X POST http://localhost:8000/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Community Cleanup Drive",
    "description": "Organize volunteers for neighborhood cleanup",
    "required_skills": ["organizing", "leadership"],
    "status": "open"
  }'
```

### Find Matching Volunteers (The Magic! 🎯)
```bash
curl "http://localhost:8000/tasks/{task_id}/matches?match_threshold=0.5&match_count=5"
```

### Log Activity
```bash
curl -X POST http://localhost:8000/activities \
  -H "Content-Type: application/json" \
  -d '{
    "volunteer_id": "uuid-here",
    "activity_type": "task_completion",
    "points_awarded": 50
  }'
```

### Check Health Status
```bash
curl "http://localhost:8000/volunteers/health?status_filter=At-Risk"
```

---

## 📊 Response Examples

### Volunteer with Embedding
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "bio": "Loves community organizing",
  "skills": ["organizing", "leadership"],
  "engagement_score": 100,
  "last_active_at": "2024-03-08T10:30:00Z",
  "created_at": "2024-03-08T10:00:00Z"
}
```

### Matching Results
```json
[
  {
    "id": "uuid-1",
    "full_name": "Jane Smith",
    "bio": "Loves community organizing",
    "similarity": 0.87
  },
  {
    "id": "uuid-2",
    "full_name": "John Doe",
    "bio": "Experienced event coordinator",
    "similarity": 0.76
  }
]
```

### Health Status
```json
[
  {
    "id": "uuid-1",
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "current_health": 85,
    "status": "Healthy"
  },
  {
    "id": "uuid-2",
    "full_name": "Bob Wilson",
    "email": "bob@example.com",
    "current_health": 35,
    "status": "At-Risk"
  }
]
```

---

## 🎨 Activity Types & Points

| Activity Type | Default Points | Description |
|--------------|----------------|-------------|
| `signup` | 10 | Initial registration |
| `task_completion` | 50 | Completed a task |
| `check_in` | 5 | Regular check-in |
| `custom` | Variable | Custom activity (must specify points) |

---

## 📈 Health Status Calculation

```
current_health = engagement_score - (days_inactive × 2)

Status:
  > 70: Healthy ✅
  40-70: Warning ⚠️
  < 40: At-Risk 🚨
```

---

## 🔍 Query Parameters

### GET /volunteers
- `limit`: Max results (default: 100)
- `offset`: Pagination offset (default: 0)

### GET /tasks
- `status_filter`: Filter by status (open/filled/completed)
- `limit`: Max results (default: 100)
- `offset`: Pagination offset (default: 0)

### GET /tasks/{id}/matches
- `match_threshold`: Min similarity (0.0-1.0, default: 0.5)
- `match_count`: Max matches (1-100, default: 10)

### GET /volunteers/health
- `status_filter`: Filter by status (Healthy/Warning/At-Risk)

---

## 🚀 Interactive Docs

Visit `/docs` for the full interactive API documentation with:
- Try-it-out functionality
- Full schema definitions
- Example requests/responses
- Authentication (when implemented)

**Local**: http://localhost:8000/docs  
**Alternative**: http://localhost:8000/redoc

---

## 💡 Pro Tips

1. **Lowering match_threshold** finds more matches (less strict)
2. **Higher match_threshold** finds better matches (more strict)
3. **Empty bios** will use skills for embedding
4. **Multiple activities** stack engagement scores
5. **Inactive volunteers** lose 2 health points per day
