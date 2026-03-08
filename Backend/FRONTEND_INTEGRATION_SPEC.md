# 🎨 Vanguard Frontend - Complete Build Specification

## 🚀 DESIGN PROMPT - BUILD THE ENTIRE WEBSITE

You are building **Vanguard**, an AI-native volunteer management platform that solves volunteer churn with intelligent matching and health monitoring.

### 🎯 Core Features to Build

**1. Dashboard (Landing Page)**
- **Hero Section**: Bold tagline "Stop Losing Volunteers" with mission statement
- **Key Metrics Cards**: 
  - Total Volunteers (with trend)
  - At-Risk Volunteers (red alert badge)
  - Active Tasks (open/filled/completed breakdown)
  - Average Engagement Score
- **Health Status Overview**: Visual health distribution (Healthy/Warning/At-Risk) with pie chart
- **Recent Activity Feed**: Last 10 activities with timestamps and point awards
- **Quick Actions**: "Add Volunteer", "Create Task", "View Health Report" buttons

**2. Volunteer Management**
- **Volunteer List Page**:
  - Searchable/filterable table (search by name/email, filter by health status)
  - Columns: Name, Email, Skills (tags), Engagement Score (with color coding), Health Status (badge), Last Active
  - Actions: Edit, Delete, View Details
  - Pagination (20 per page)
  - "Add New Volunteer" button (top right)
  
- **Add/Edit Volunteer Form**:
  - Fields: Full Name, Email, Bio (textarea), Skills (dynamic tag input)
  - Real-time validation (email format, required fields)
  - Save button → Shows success toast → Redirects to list
  
- **Volunteer Detail Page**:
  - Profile section (name, email, bio, skills)
  - Engagement score gauge with visual indicator
  - Health status with detailed explanation
  - Activity history timeline
  - "Log Activity" button

**3. Task Management & Matching**
- **Task List Page**:
  - Card grid layout showing all tasks
  - Each card: Title, Description (truncated), Status badge, Required Skills tags
  - Filter by status (open/filled/completed)
  - "Create Task" button
  
- **Create Task Form**:
  - Fields: Title, Description, Required Skills (tag input), Status dropdown
  - Save → Redirect to task matching page
  
- **Task Matching Page** (THE STAR FEATURE ⭐):
  - Task details at top
  - "Find Matches" button with threshold slider (0-100%) and count selector (1-50)
  - **Results display**: 
    - Ranked list of volunteers with similarity percentage
    - Each result shows: Name, Bio, Similarity Score (visual bar), Skills overlap
    - "Contact" button (opens email) for each volunteer
  - Visual: Use gradient bars for similarity (green = high match, yellow = medium)

**4. Health Monitoring**
- **Health Report Page**:
  - Three columns: Healthy (green), Warning (yellow), At-Risk (red)
  - Each column shows list of volunteers with current_health score
  - Click volunteer → See their detail page
  - Filter controls at top
  - **Action prompts**: "Send check-in email to At-Risk volunteers"

**5. Activity Logging**
- **Activity Log Page** (Admin view):
  - Table: Volunteer Name, Activity Type, Points, Timestamp
  - Filter by: Activity type, Volunteer, Date range
  - Total points awarded (summary stat)
  
- **Quick Log Activity Modal**:
  - Accessible from volunteer detail page or dashboard
  - Select volunteer (dropdown with search)
  - Select activity type (signup/task_completion/check_in/custom)
  - Points auto-filled based on type (editable)
  - Submit → Updates engagement score immediately

### 🎨 Design System

**Color Palette**:
- Primary: Deep Blue (#1e40af) for headers, buttons
- Success/Healthy: Green (#10b981)
- Warning: Amber (#f59e0b)
- Danger/At-Risk: Red (#ef4444)
- Background: Light gray (#f9fafb)
- Cards: White with subtle shadow

**Typography**:
- Headings: Inter or Poppins (bold, 24-32px)
- Body: Inter or Open Sans (regular, 14-16px)
- Monospace for IDs/emails: Fira Code

**Components**:
- **Buttons**: Rounded (6px), shadow on hover, primary/secondary variants
- **Cards**: White bg, border-radius 8px, shadow-sm
- **Badges**: Pill-shaped, small text, colored by status
- **Forms**: Labeled inputs, validation feedback, focus states
- **Tables**: Striped rows, hover effect, sortable headers

**Layout**:
- Sidebar navigation (Dashboard, Volunteers, Tasks, Health, Activities)
- Top bar with logo, search, admin menu
- Content area with padding and max-width (1200px)
- Mobile responsive (hamburger menu, stacked cards)

### 🛠️ Technical Stack Recommendations

- **Framework**: React with TypeScript + Vite (or Next.js for SSR)
- **UI Library**: Tailwind CSS + shadcn/ui components (or Material-UI)
- **State Management**: React Query (TanStack Query) for API calls
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts or Chart.js
- **Icons**: Lucide React or Heroicons
- **Routing**: React Router (or Next.js routing)
- **Date Formatting**: date-fns
- **Authentication**: Supabase Auth (use Supabase client library)

### 🔐 Authentication via Supabase

**Supabase handles ALL authentication - DO NOT build custom auth flows!**

**Setup**:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**User Flow**:
1. Use Supabase Auth UI component for login/signup (pre-built by Supabase)
2. After login, Supabase provides session token automatically
3. Protected routes check `supabase.auth.getSession()` 
4. NO custom login forms needed - use Supabase's built-in UI

**Implementation**:
```typescript
// Protect routes
const { data: { session } } = await supabase.auth.getSession()
if (!session) redirect('/login')

// Supabase Auth UI (one line!)
import { Auth } from '@supabase/auth-ui-react'

<Auth 
  supabaseClient={supabase} 
  appearance={{ theme: ThemeSupa }}
  providers={['google']} // Optional: Social login
/>
```

**That's it!** Supabase automatically manages tokens, sessions, password resets, email verification, etc.

### 📡 API Integration

**Base URL**: `http://localhost:8000` (local) or use deployed backend URL

**NO auth headers needed** for backend API (Supabase auth is separate layer)

```typescript
const API_BASE = 'http://localhost:8000'

// All API calls use standard fetch
async function getVolunteers() {
  const response = await fetch(`${API_BASE}/volunteers`)
  return response.json()
}
```

---

## 🌐 API Configuration

---

## 📦 TypeScript Interfaces

### Core Data Models

```typescript
// ============================================================================
// VOLUNTEER MODELS
// ============================================================================

interface Volunteer {
  id: string; // UUID
  full_name: string;
  email: string;
  bio: string | null;
  skills: string[];
  engagement_score: number;
  last_active_at: string; // ISO 8601 timestamp
  created_at: string; // ISO 8601 timestamp
}

interface VolunteerCreate {
  full_name: string;
  email: string;
  bio?: string;
  skills?: string[];
}

interface VolunteerUpdate {
  full_name?: string;
  bio?: string;
  skills?: string[];
  // Note: email cannot be updated
}

interface VolunteerHealthStatus {
  id: string; // UUID
  full_name: string;
  email: string;
  current_health: number;
  status: 'Healthy' | 'Warning' | 'At-Risk';
}

interface VolunteerMatch {
  id: string; // UUID
  full_name: string;
  bio: string | null;
  similarity: number; // 0.0 to 1.0
}

// ============================================================================
// TASK MODELS
// ============================================================================

interface Task {
  id: string; // UUID
  title: string;
  description: string | null;
  required_skills: string[];
  status: 'open' | 'filled' | 'completed';
  created_at: string; // ISO 8601 timestamp
}

interface TaskCreate {
  title: string;
  description?: string;
  required_skills?: string[];
  status?: 'open' | 'filled' | 'completed';
}

interface TaskUpdate {
  title?: string;
  description?: string;
  required_skills?: string[];
  status?: 'open' | 'filled' | 'completed';
}

// ============================================================================
// ACTIVITY MODELS
// ============================================================================

interface Activity {
  id: number;
  volunteer_id: string; // UUID
  activity_type: 'signup' | 'task_completion' | 'check_in' | 'custom';
  points_awarded: number;
  created_at: string; // ISO 8601 timestamp
}

interface ActivityCreate {
  volunteer_id: string; // UUID
  activity_type: 'signup' | 'task_completion' | 'check_in' | 'custom';
  points_awarded?: number; // Optional, defaults based on activity type
}

// ============================================================================
// RESPONSE MODELS
// ============================================================================

interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
}

interface MessageResponse {
  message: string;
  detail?: string;
}

interface ErrorResponse {
  error: string;
  detail?: string;
  status_code: number;
}

// ============================================================================
// PAGINATION PARAMETERS
// ============================================================================

interface PaginationParams {
  limit?: number; // Default: 100
  offset?: number; // Default: 0
}

interface MatchParams {
  match_threshold?: number; // 0.0-1.0, Default: 0.5
  match_count?: number; // 1-100, Default: 10
}
```

---

## 🔌 API Endpoints

### System Endpoints

#### `GET /` - Root Health Check

**Purpose**: Verify API is running

**Request**: None

**Response**: `HealthResponse`
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2026-03-08T10:30:00.000Z"
}
```

**Usage**:
```typescript
async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${BASE_URL}/`);
  return response.json();
}
```

---

#### `GET /health` - Database Health Check

**Purpose**: Verify database connectivity

**Request**: None

**Response**: `HealthResponse` or `503` if unhealthy

**Usage**:
```typescript
async function checkDatabaseHealth(): Promise<HealthResponse> {
  const response = await fetch(`${BASE_URL}/health`);
  if (!response.ok) throw new Error('Database unhealthy');
  return response.json();
}
```

---

#### `GET /info` - System Information

**Purpose**: Get API configuration details

**Response**:
```json
{
  "application": "Vanguard Volunteer Management API",
  "version": "1.0.0",
  "environment": "development",
  "python_version": "3.10.0",
  "embedding_model": "sentence-transformers/all-MiniLM-L6-v2",
  "embedding_dimensions": 384,
  "match_threshold": 0.5,
  "default_match_count": 10
}
```

---

### Volunteer Endpoints

#### `POST /volunteers` - Create Volunteer

**Purpose**: Create new volunteer profile with semantic embedding

**Request Body**: `VolunteerCreate`
```json
{
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "bio": "Passionate about education and community work",
  "skills": ["teaching", "event planning", "public speaking"]
}
```

**Response**: `Volunteer` (201 Created)
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "bio": "Passionate about education and community work",
  "skills": ["teaching", "event planning", "public speaking"],
  "engagement_score": 100,
  "last_active_at": "2026-03-08T10:30:00Z",
  "created_at": "2026-03-08T10:30:00Z"
}
```

**Errors**:
- `409 Conflict` - Email already exists
- `422 Unprocessable Entity` - Invalid data (e.g., bad email format)

**Usage**:
```typescript
async function createVolunteer(data: VolunteerCreate): Promise<Volunteer> {
  const response = await fetch(`${BASE_URL}/volunteers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create volunteer');
  }
  
  return response.json();
}
```

---

#### `GET /volunteers` - List All Volunteers

**Purpose**: Retrieve paginated list of volunteers

**Query Parameters**: `PaginationParams`
- `limit` (optional): Max results, default 100
- `offset` (optional): Pagination offset, default 0

**Example Request**:
```
GET /volunteers?limit=20&offset=0
```

**Response**: `Volunteer[]`
```json
[
  {
    "id": "uuid-1",
    "full_name": "Jane Smith",
    "email": "jane@example.com",
    "bio": "...",
    "skills": ["teaching"],
    "engagement_score": 150,
    "last_active_at": "2026-03-08T10:30:00Z",
    "created_at": "2026-03-08T10:00:00Z"
  }
]
```

**Usage**:
```typescript
async function listVolunteers(
  limit: number = 100, 
  offset: number = 0
): Promise<Volunteer[]> {
  const response = await fetch(
    `${BASE_URL}/volunteers?limit=${limit}&offset=${offset}`
  );
  return response.json();
}
```

---

#### `GET /volunteers/health` - Volunteer Health Status

**Purpose**: Get retention health status (churn detection)

**Query Parameters**:
- `status_filter` (optional): Filter by status
  - Values: `'Healthy'`, `'Warning'`, `'At-Risk'`

**Example Requests**:
```
GET /volunteers/health
GET /volunteers/health?status_filter=At-Risk
```

**Response**: `VolunteerHealthStatus[]`
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

**Health Calculation**:
```
current_health = engagement_score - (days_inactive × 2)

Status Thresholds:
- Healthy: > 70
- Warning: 40-70
- At-Risk: < 40
```

**Usage**:
```typescript
async function getVolunteerHealth(
  statusFilter?: 'Healthy' | 'Warning' | 'At-Risk'
): Promise<VolunteerHealthStatus[]> {
  const url = statusFilter 
    ? `${BASE_URL}/volunteers/health?status_filter=${statusFilter}`
    : `${BASE_URL}/volunteers/health`;
  
  const response = await fetch(url);
  return response.json();
}
```

---

#### `GET /volunteers/{id}` - Get Volunteer by ID

**Purpose**: Retrieve specific volunteer details

**Path Parameters**:
- `id`: UUID of volunteer

**Response**: `Volunteer` (200 OK) or `404 Not Found`

**Usage**:
```typescript
async function getVolunteer(id: string): Promise<Volunteer> {
  const response = await fetch(`${BASE_URL}/volunteers/${id}`);
  if (!response.ok) throw new Error('Volunteer not found');
  return response.json();
}
```

---

#### `PATCH /volunteers/{id}` - Update Volunteer

**Purpose**: Update volunteer information (regenerates embedding if bio/skills change)

**Path Parameters**:
- `id`: UUID of volunteer

**Request Body**: `VolunteerUpdate`
```json
{
  "full_name": "Jane Smith-Doe",
  "bio": "Updated bio with new interests",
  "skills": ["teaching", "mentoring", "coaching"]
}
```

**Response**: `Volunteer` (200 OK)

**Errors**:
- `404 Not Found` - Volunteer doesn't exist
- `400 Bad Request` - No fields to update

**Usage**:
```typescript
async function updateVolunteer(
  id: string, 
  data: VolunteerUpdate
): Promise<Volunteer> {
  const response = await fetch(`${BASE_URL}/volunteers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to update volunteer');
  }
  
  return response.json();
}
```

---

#### `DELETE /volunteers/{id}` - Delete Volunteer

**Purpose**: Delete volunteer (cascades to activity logs)

**Path Parameters**:
- `id`: UUID of volunteer

**Response**: `MessageResponse` (200 OK)
```json
{
  "message": "Volunteer deleted successfully",
  "detail": "Deleted volunteer ID: uuid-here"
}
```

**Errors**:
- `404 Not Found` - Volunteer doesn't exist

**Usage**:
```typescript
async function deleteVolunteer(id: string): Promise<MessageResponse> {
  const response = await fetch(`${BASE_URL}/volunteers/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) throw new Error('Failed to delete volunteer');
  return response.json();
}
```

---

### Task Endpoints

#### `POST /tasks` - Create Task

**Purpose**: Create new task with semantic embedding

**Request Body**: `TaskCreate`
```json
{
  "title": "Community Food Drive",
  "description": "Organize and run weekend food distribution event",
  "required_skills": ["organizing", "logistics", "leadership"],
  "status": "open"
}
```

**Response**: `Task` (201 Created)

**Usage**:
```typescript
async function createTask(data: TaskCreate): Promise<Task> {
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) throw new Error('Failed to create task');
  return response.json();
}
```

---

#### `GET /tasks` - List All Tasks

**Purpose**: Retrieve paginated list of tasks

**Query Parameters**: `PaginationParams` + filter
- `status_filter` (optional): `'open'`, `'filled'`, or `'completed'`
- `limit` (optional): Max results, default 100
- `offset` (optional): Pagination offset, default 0

**Example Requests**:
```
GET /tasks?status_filter=open&limit=20
GET /tasks?offset=20
```

**Response**: `Task[]`

**Usage**:
```typescript
async function listTasks(
  statusFilter?: 'open' | 'filled' | 'completed',
  limit: number = 100,
  offset: number = 0
): Promise<Task[]> {
  let url = `${BASE_URL}/tasks?limit=${limit}&offset=${offset}`;
  if (statusFilter) url += `&status_filter=${statusFilter}`;
  
  const response = await fetch(url);
  return response.json();
}
```

---

#### `GET /tasks/{id}` - Get Task by ID

**Purpose**: Retrieve specific task details

**Path Parameters**:
- `id`: UUID of task

**Response**: `Task` (200 OK) or `404 Not Found`

**Usage**:
```typescript
async function getTask(id: string): Promise<Task> {
  const response = await fetch(`${BASE_URL}/tasks/${id}`);
  if (!response.ok) throw new Error('Task not found');
  return response.json();
}
```

---

#### `GET /tasks/{id}/matches` - Find Matching Volunteers ⭐

**Purpose**: **THE ROUTING ENGINE** - Semantic matching of volunteers to task

**Path Parameters**:
- `id`: UUID of task

**Query Parameters**: `MatchParams`
- `match_threshold` (optional): Minimum similarity (0.0-1.0), default 0.5
- `match_count` (optional): Max results (1-100), default 10

**Example Requests**:
```
GET /tasks/{id}/matches
GET /tasks/{id}/matches?match_threshold=0.7&match_count=5
GET /tasks/{id}/matches?match_threshold=0.3&match_count=20
```

**Response**: `VolunteerMatch[]`
```json
[
  {
    "id": "uuid-1",
    "full_name": "Jane Smith",
    "bio": "Passionate about community organizing...",
    "similarity": 0.87
  },
  {
    "id": "uuid-2",
    "full_name": "John Doe",
    "bio": "Experienced event coordinator...",
    "similarity": 0.76
  }
]
```

**Similarity Score**:
- `1.0` = Perfect match
- `0.8-0.9` = Excellent match
- `0.6-0.8` = Good match
- `0.4-0.6` = Moderate match
- `< 0.4` = Weak match

**Usage**:
```typescript
async function findMatchingVolunteers(
  taskId: string,
  threshold: number = 0.5,
  count: number = 10
): Promise<VolunteerMatch[]> {
  const response = await fetch(
    `${BASE_URL}/tasks/${taskId}/matches?match_threshold=${threshold}&match_count=${count}`
  );
  
  if (!response.ok) throw new Error('Failed to find matches');
  return response.json();
}
```

**UI Recommendations**:
- Display similarity as percentage: `${(similarity * 100).toFixed(0)}%`
- Color-code matches:
  - Green (>80%): Excellent
  - Yellow (60-80%): Good
  - Orange (<60%): Moderate
- Show top 5-10 by default
- Allow filtering by threshold

---

#### `GET /tasks/{id}/recommendations` - Alias for Matches

**Purpose**: Alternative endpoint name for `matches`

Same as `/tasks/{id}/matches` - use whichever naming convention you prefer.

---

#### `PATCH /tasks/{id}` - Update Task

**Purpose**: Update task information (regenerates embedding if description/skills change)

**Path Parameters**:
- `id`: UUID of task

**Request Body**: `TaskUpdate`
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "filled"
}
```

**Response**: `Task` (200 OK)

**Usage**:
```typescript
async function updateTask(id: string, data: TaskUpdate): Promise<Task> {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) throw new Error('Failed to update task');
  return response.json();
}
```

---

#### `DELETE /tasks/{id}` - Delete Task

**Purpose**: Delete task

**Path Parameters**:
- `id`: UUID of task

**Response**: `MessageResponse` (200 OK)

**Usage**:
```typescript
async function deleteTask(id: string): Promise<MessageResponse> {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) throw new Error('Failed to delete task');
  return response.json();
}
```

---

### Activity Endpoints

#### `POST /activities` - Log Activity ⭐

**Purpose**: **THE ENGAGEMENT PULSE** - Log activity & update engagement score

**Request Body**: `ActivityCreate`
```json
{
  "volunteer_id": "uuid-here",
  "activity_type": "task_completion",
  "points_awarded": 50
}
```

**Activity Types & Default Points**:
- `signup`: 10 points
- `task_completion`: 50 points
- `check_in`: 5 points
- `custom`: Must specify `points_awarded`

**Response**: `Activity` (201 Created)
```json
{
  "id": 123,
  "volunteer_id": "uuid-here",
  "activity_type": "task_completion",
  "points_awarded": 50,
  "created_at": "2026-03-08T10:30:00Z"
}
```

**Side Effects**:
1. ✅ Increments volunteer's `engagement_score`
2. ✅ Updates volunteer's `last_active_at` to current time
3. ✅ Creates activity log record

**Errors**:
- `404 Not Found` - Volunteer doesn't exist
- `400 Bad Request` - Missing points for custom activity

**Usage**:
```typescript
async function logActivity(data: ActivityCreate): Promise<Activity> {
  const response = await fetch(`${BASE_URL}/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to log activity');
  }
  
  return response.json();
}
```

**When to Use**:
- ✅ Volunteer completes a task
- ✅ Volunteer checks in or updates profile
- ✅ Volunteer attends an event
- ✅ Any engagement action

---

#### `GET /activities` - List All Activities

**Purpose**: Retrieve paginated activity logs

**Query Parameters**: `PaginationParams`

**Response**: `Activity[]`

**Usage**:
```typescript
async function listActivities(
  limit: number = 100,
  offset: number = 0
): Promise<Activity[]> {
  const response = await fetch(
    `${BASE_URL}/activities?limit=${limit}&offset=${offset}`
  );
  return response.json();
}
```

---

#### `GET /activities/volunteer/{id}` - Get Volunteer's Activities

**Purpose**: Retrieve activity history for specific volunteer

**Path Parameters**:
- `id`: UUID of volunteer

**Query Parameters**: `PaginationParams`

**Response**: `Activity[]`

**Usage**:
```typescript
async function getVolunteerActivities(
  volunteerId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Activity[]> {
  const response = await fetch(
    `${BASE_URL}/activities/volunteer/${volunteerId}?limit=${limit}&offset=${offset}`
  );
  return response.json();
}
```

---

#### `GET /activities/{id}` - Get Activity by ID

**Purpose**: Retrieve specific activity log

**Path Parameters**:
- `id`: Activity ID (integer)

**Response**: `Activity` (200 OK) or `404 Not Found`

---

#### `DELETE /activities/{id}` - Delete Activity

**Purpose**: Delete activity log (for data correction only)

**⚠️ WARNING**: Does NOT reverse engagement score changes!

**Path Parameters**:
- `id`: Activity ID (integer)

**Response**: `MessageResponse` (200 OK)

---

## 🎯 Common Workflows

### Workflow 1: Onboarding New Volunteer

```typescript
async function onboardVolunteer(volunteerData: VolunteerCreate) {
  // 1. Create volunteer profile
  const volunteer = await createVolunteer(volunteerData);
  
  // 2. Log signup activity
  await logActivity({
    volunteer_id: volunteer.id,
    activity_type: 'signup',
    // points_awarded is optional, defaults to 10
  });
  
  // 3. Return volunteer (now has 110 engagement score: 100 + 10)
  return volunteer;
}
```

---

### Workflow 2: Finding Best Volunteers for Task

```typescript
async function matchVolunteersToTask(taskId: string) {
  // 1. Get task details
  const task = await getTask(taskId);
  
  // 2. Find matching volunteers (top 10, >50% similarity)
  const matches = await findMatchingVolunteers(taskId, 0.5, 10);
  
  // 3. Display matches sorted by similarity
  return matches.map(match => ({
    ...match,
    matchPercentage: Math.round(match.similarity * 100),
    matchLevel: getMatchLevel(match.similarity)
  }));
}

function getMatchLevel(similarity: number): string {
  if (similarity >= 0.8) return 'Excellent';
  if (similarity >= 0.6) return 'Good';
  if (similarity >= 0.4) return 'Moderate';
  return 'Weak';
}
```

---

### Workflow 3: Completing a Task

```typescript
async function completeTask(taskId: string, volunteerId: string) {
  // 1. Log task completion
  await logActivity({
    volunteer_id: volunteerId,
    activity_type: 'task_completion',
    // points_awarded is optional, defaults to 50
  });
  
  // 2. Update task status
  await updateTask(taskId, { status: 'completed' });
  
  // 3. Get updated volunteer with new engagement score
  const volunteer = await getVolunteer(volunteerId);
  
  return volunteer;
}
```

---

### Workflow 4: Monitoring At-Risk Volunteers

```typescript
async function getAtRiskVolunteers() {
  // Get volunteers with At-Risk status
  const atRisk = await getVolunteerHealth('At-Risk');
  
  // For each at-risk volunteer, get their activity history
  const enrichedData = await Promise.all(
    atRisk.map(async (volunteer) => {
      const activities = await getVolunteerActivities(volunteer.id, 10);
      return {
        ...volunteer,
        recentActivities: activities,
        daysSinceLastActivity: calculateDaysSince(
          activities[0]?.created_at
        )
      };
    })
  );
  
  return enrichedData;
}

function calculateDaysSince(date: string): number {
  if (!date) return Infinity;
  const past = new Date(date);
  const now = new Date();
  return Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60 * 24));
}
```

---

### Workflow 5: Dashboard Statistics

```typescript
async function getDashboardStats() {
  // Parallel fetching for efficiency
  const [allVolunteers, openTasks, healthStats] = await Promise.all([
    listVolunteers(),
    listTasks('open'),
    getVolunteerHealth()
  ]);
  
  return {
    totalVolunteers: allVolunteers.length,
    openTasks: openTasks.length,
    healthyVolunteers: healthStats.filter(v => v.status === 'Healthy').length,
    warningVolunteers: healthStats.filter(v => v.status === 'Warning').length,
    atRiskVolunteers: healthStats.filter(v => v.status === 'At-Risk').length,
    avgEngagementScore: 
      allVolunteers.reduce((sum, v) => sum + v.engagement_score, 0) / 
      allVolunteers.length
  };
}
```

---

## ❌ Error Handling

### Standard Error Response Format

```typescript
interface ErrorResponse {
  error: string;
  detail?: string;
  status_code: number;
}
```

### HTTP Status Codes

| Code | Meaning | When It Occurs |
|------|---------|----------------|
| 200 | OK | Successful GET/PATCH/DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid input data |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate email, constraint violation |
| 422 | Unprocessable Entity | Validation error (Pydantic) |
| 500 | Internal Server Error | Backend error |
| 503 | Service Unavailable | Database connection failed |

### Error Handling Pattern

```typescript
async function apiCall<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.detail || error.error || 'API request failed');
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      // Network error or JSON parsing error
      console.error('API Error:', error.message);
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
}
```

### Validation Errors

```json
{
  "error": "Validation error",
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address",
      "type": "value_error.email"
    }
  ],
  "status_code": 422
}
```

---

## 🎨 UI/UX Recommendations

### Volunteer List Page
- **Display**: Name, email, engagement score, health status badge
- **Filters**: By status (Healthy/Warning/At-Risk)
- **Sorting**: By score (desc), name (asc), last_active_at (desc)
- **Actions**: View details, Edit, Delete

### Task Management Page
- **Display**: Title, status badge, required skills chips
- **Filters**: By status (open/filled/completed)
- **Card View**: Show description, created date
- **Action Button**: "Find Matches" → Opens match modal

### Task Matching Modal
- **Input**: Threshold slider (0.3-0.9), count selector (5-20)
- **Display**: List of matches with:
  - Avatar/initials
  - Name
  - Similarity badge (color-coded)
  - Bio preview
  - Skills chips
- **Actions**: "Assign" button, "View Profile"

### Volunteer Detail Page
- **Sections**:
  - Profile (name, email, bio, skills)
  - Engagement Score (big number, trend)
  - Health Status (badge with color)
  - Activity Timeline (recent activities)
- **Actions**: Edit, Log Activity, View Tasks

### Dashboard
- **Stats Cards**:
  - Total Volunteers
  - Open Tasks
  - At-Risk Count (red if > 0)
  - Avg Engagement Score
- **Charts**:
  - Health distribution (pie chart)
  - Engagement over time (line chart)
  - Activity breakdown (bar chart)
- **Widget**: Recent activities feed
- **Widget**: At-Risk volunteers alert

### Activity Logging
- **Form Fields**:
  - Volunteer (autocomplete dropdown)
  - Activity Type (radio buttons with descriptions)
  - Points (auto-filled, editable for custom)
- **Feedback**: Success toast with new engagement score

---

## 🔒 Authentication (Future)

Currently, the API has **no authentication**. For production, add:

```typescript
// After implementing auth on backend:
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
}
```

Recommended auth flow:
1. Login → Get JWT token
2. Store token in localStorage/cookies
3. Include in all requests
4. Handle 401 Unauthorized → Redirect to login

---

## 🧪 Testing the API

### Interactive Documentation
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Quick Test with Fetch (Browser Console)

```javascript
// 1. Create volunteer
const createResp = await fetch('http://localhost:8000/volunteers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    full_name: 'Test User',
    email: `test${Date.now()}@example.com`,
    bio: 'Loves helping with community events',
    skills: ['organizing', 'communication']
  })
});
const volunteer = await createResp.json();
console.log('Created:', volunteer);

// 2. Create task
const taskResp = await fetch('http://localhost:8000/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Community Cleanup',
    description: 'Organize volunteers for park cleanup',
    required_skills: ['organizing', 'leadership']
  })
});
const task = await taskResp.json();
console.log('Created task:', task);

// 3. Find matches
const matchResp = await fetch(`http://localhost:8000/tasks/${task.id}/matches`);
const matches = await matchResp.json();
console.log('Matches:', matches);

// 4. Log activity
const activityResp = await fetch('http://localhost:8000/activities', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    volunteer_id: volunteer.id,
    activity_type: 'task_completion'
  })
});
const activity = await activityResp.json();
console.log('Logged activity:', activity);
```

---

## 📦 Complete API Client Example

```typescript
// api-client.ts
export class VanguardAPI {
  constructor(private baseURL: string) {}
  
  // Volunteers
  async createVolunteer(data: VolunteerCreate): Promise<Volunteer> {
    return this.post('/volunteers', data);
  }
  
  async listVolunteers(params?: PaginationParams): Promise<Volunteer[]> {
    return this.get('/volunteers', params);
  }
  
  async getVolunteer(id: string): Promise<Volunteer> {
    return this.get(`/volunteers/${id}`);
  }
  
  async updateVolunteer(id: string, data: VolunteerUpdate): Promise<Volunteer> {
    return this.patch(`/volunteers/${id}`, data);
  }
  
  async deleteVolunteer(id: string): Promise<MessageResponse> {
    return this.delete(`/volunteers/${id}`);
  }
  
  async getVolunteerHealth(statusFilter?: string): Promise<VolunteerHealthStatus[]> {
    return this.get('/volunteers/health', statusFilter ? { status_filter: statusFilter } : undefined);
  }
  
  // Tasks
  async createTask(data: TaskCreate): Promise<Task> {
    return this.post('/tasks', data);
  }
  
  async listTasks(statusFilter?: string, params?: PaginationParams): Promise<Task[]> {
    return this.get('/tasks', { status_filter: statusFilter, ...params });
  }
  
  async getTask(id: string): Promise<Task> {
    return this.get(`/tasks/${id}`);
  }
  
  async updateTask(id: string, data: TaskUpdate): Promise<Task> {
    return this.patch(`/tasks/${id}`, data);
  }
  
  async deleteTask(id: string): Promise<MessageResponse> {
    return this.delete(`/tasks/${id}`);
  }
  
  async findMatches(taskId: string, params?: MatchParams): Promise<VolunteerMatch[]> {
    return this.get(`/tasks/${taskId}/matches`, params);
  }
  
  // Activities
  async logActivity(data: ActivityCreate): Promise<Activity> {
    return this.post('/activities', data);
  }
  
  async listActivities(params?: PaginationParams): Promise<Activity[]> {
    return this.get('/activities', params);
  }
  
  async getVolunteerActivities(
    volunteerId: string, 
    params?: PaginationParams
  ): Promise<Activity[]> {
    return this.get(`/activities/volunteer/${volunteerId}`, params);
  }
  
  // System
  async healthCheck(): Promise<HealthResponse> {
    return this.get('/health');
  }
  
  async getSystemInfo(): Promise<any> {
    return this.get('/info');
  }
  
  // HTTP helpers
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || error.error || 'Request failed');
    }
    
    return response.json();
  }
  
  private get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const query = params ? '?' + new URLSearchParams(
      Object.entries(params)
        .filter(([_, v]) => v != null)
        .map(([k, v]) => [k, String(v)])
    ).toString() : '';
    
    return this.request(`${endpoint}${query}`);
  }
  
  private post<T>(endpoint: string, data: any): Promise<T> {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  private patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
  
  private delete<T>(endpoint: string): Promise<T> {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Usage
export const api = new VanguardAPI('http://localhost:8000');
```

---

## 🎯 Summary Checklist for Frontend Developer

### Data Fetching
- [ ] Set up API client with base URL
- [ ] Implement error handling wrapper
- [ ] Create TypeScript interfaces from this doc

### Core Features to Build
- [ ] **Volunteer Management**: List, create, edit, delete, view details
- [ ] **Task Management**: List, create, edit, delete
- [ ] **Semantic Matching**: Task → Find Volunteers UI
- [ ] **Activity Logging**: Quick log + detailed log forms
- [ ] **Health Dashboard**: Stats, charts, at-risk alerts
- [ ] **Volunteer Profile**: Details, activity timeline, engagement trend

### UI Components Needed
- [ ] Volunteer card/list item
- [ ] Task card/list item
- [ ] Match result card (with similarity score)
- [ ] Activity log item
- [ ] Health status badge
- [ ] Engagement score display
- [ ] Skills chips/tags
- [ ] Status badges (task status, health status)

### Pages to Build
- [ ] Dashboard (overview + stats)
- [ ] Volunteers list + detail
- [ ] Tasks list + detail
- [ ] Task matching interface
- [ ] Activity log view
- [ ] At-risk volunteers alert page

---

## 📞 Support

**Backend API Base URL**: Configure based on environment
**API Documentation**: `/docs` (Swagger) or `/redoc`
**Health Check**: `GET /health`

---

**Document Version**: 1.0.0  
**Last Updated**: March 8, 2026  
**API Version**: 1.0.0
