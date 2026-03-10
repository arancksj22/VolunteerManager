# 🎨 MissionMatch Frontend - Complete Build Specification

## 🚀 DESIGN PROMPT - BUILD THE ENTIRE WEBSITE

You are building **MissionMatch**, an AI-native volunteer management platform for **animal advocacy organizations** that solves volunteer churn with intelligent matching and health monitoring.

### 🐾 **Context: Animal Advocacy Coordinators**

**The User**: Volunteer coordinators at animal advocacy organizations (animal rights groups, sanctuaries, rescue organizations, vegan outreach) managing anywhere from 20 to 2,000 volunteers who need to keep people matched to advocacy campaigns, active in the movement, and retained long-term.

**The Problem**: Animal advocacy has high volunteer turnover. Coordinators struggle to:
- Match volunteers to the right campaigns (protests, leafleting, vegan outreach, sanctuary tours)
- Identify at-risk volunteers before they burn out
- Track engagement across multiple advocacy activities
- Keep volunteers motivated and connected to the cause

### 🎭 **TWO-PORTAL SYSTEM (CRITICAL)**

Build **TWO separate user interfaces**:

#### 1️⃣ **Coordinator Portal** (Admin Dashboard)
**Users**: Advocacy coordinators, campaign managers, org admins
**Purpose**: Manage volunteers, create campaigns, monitor retention, match volunteers to advocacy work
**Auth**: Supabase Auth with role checking
**Routes**: `/coordinator/*`

#### 2️⃣ **Volunteer Portal** (Public-Facing)
**Users**: Animal advocacy volunteers (general public)
**Purpose**: Sign up, view profile, see available campaigns, track own activity
**Auth**: Optional Supabase Auth OR anonymous signup
**Routes**: `/volunteer/*` or `/` (public home)

**BOTH portals share the same backend API but have completely different UIs and feature sets.**

### 🛠️ **REQUIRED TECH STACK**

**THIS IS NON-NEGOTIABLE:**

- **Framework**: Next.js 14+ (App Router with TypeScript)
- **UI Components**: **shadcn/ui** (PRIMARY COMPONENT LIBRARY)
- **Styling**: Tailwind CSS (comes with shadcn/ui)
- **State Management**: TanStack Query (React Query) for server state
- **Forms**: React Hook Form + Zod validation
- **Auth**: Supabase Auth (pre-built UI components)
- **Icons**: lucide-react (comes with shadcn/ui)
- **Charts**: Recharts (for dashboard metrics)
- **Date Utilities**: date-fns

**Why shadcn/ui?**
- ✅ Copy-paste components directly into your codebase (full control)
- ✅ Built on Radix UI primitives (accessibility built-in)
- ✅ Fully customizable with Tailwind
- ✅ TypeScript-first design
- ✅ Beautiful, modern aesthetics out of the box
- ✅ No bloat - only install components you use

### 📦 **shadcn/ui Components to Install**

Install these shadcn/ui components (use `npx shadcn-ui@latest add <component>`):

**Core Navigation & Layout:**
- `sidebar` - Main app navigation
- `breadcrumb` - Page navigation
- `separator` - Visual dividers

**Data Display:**
- `table` - Volunteer/task lists
- `card` - Metric cards, task cards
- `badge` - Status indicators (Healthy/Warning/At-Risk, task status)
- `avatar` - User profile images
- `skeleton` - Loading states

**Forms & Inputs:**
- `form` - Form wrapper with React Hook Form integration
- `input` - Text inputs
- `textarea` - Bio/description fields
- `select` - Dropdowns (activity type, status)
- `label` - Form labels
- `button` - All actions
- `command` - Search command palette

**Feedback & Overlays:**
- `dialog` - Modal dialogs (Add Volunteer, Log Activity)
- `alert-dialog` - Confirmation dialogs (delete actions)
- `toast` - Success/error notifications
- `alert` - Inline alerts
- `progress` - Health score bars, similarity bars

**Charts & Data:**
- `chart` - Install the recharts integration
- `tabs` - Tab navigation sections

**Advanced:**
- `dropdown-menu` - User menu, action menus
- `popover` - Extra info popovers
- `tooltip` - Helpful hints
- `pagination` - List pagination
- `slider` - Match threshold slider

### 🎯 Core Features to Build

---

## 🔐 **COORDINATOR PORTAL** (Admin Dashboard)

**Route Prefix**: `/coordinator/*`  
**Auth Required**: Yes (Supabase Auth with coordinator role)

### 1. Coordinator Dashboard (`/coordinator/dashboard`)
- **Hero Section**: "Stop Losing Animal Advocates" with movement impact stats
- **Key Metrics Cards**: 
  - Total Volunteers (with trend arrow)
  - At-Risk Advocates (red alert badge)
  - Active Campaigns (open/filled/completed breakdown)
  - Average Engagement Score
  - Total Advocacy Hours This Month
- **Health Status Overview**: Pie chart showing Healthy/Warning/At-Risk distribution
- **Recent Activity Feed**: Last 10 advocacy activities with timestamps and points
- **Quick Actions**: "Add Volunteer", "Create Campaign", "View At-Risk Report"

### 2. Volunteer Management (`/coordinator/volunteers`)
- **Volunteer List Page**:
  - Searchable/filterable table (search by name/email, filter by health status)
  - Columns: Name, Email, Advocacy Interests (tags), Engagement Score (color-coded), Health Status (badge), Last Active
  - Actions: Edit, Delete, View Details, Email
  - Pagination (20 per page)
  - **Top filters**: "All", "Healthy", "Warning", "At-Risk"
  
- **Add Volunteer Manually** (coordinators can add volunteers directly):
  - Fields: Full Name, Email, Bio, Advocacy Interests (e.g., "protests", "vegan outreach", "social media", "sanctuary work")
  - Real-time validation
  - Save → Success toast → Redirects to list
  
- **Volunteer Detail Page**:
  - Profile section (name, email, bio, advocacy interests)
  - Engagement score gauge with visual indicator
  - Health status with explanation ("Last active 15 days ago, losing momentum")
  - Activity history timeline (participated in X protest, completed Y leafleting, etc.)
  - **Actions**: "Log Activity", "Edit Profile", "Send Email", "Delete"

### 3. Campaign Management (`/coordinator/campaigns`)
- **Campaign List Page**:
  - Card grid layout showing all advocacy campaigns
  - Each card: Title, Description (truncated), Status badge, Required Skills/Interests tags
  - Examples: "Downtown Vegan Outreach", "Sanctuary Open House", "Social Media Blitz", "Protest Planning"
  - Filter by status (open/filled/completed)
  - "Create Campaign" button
  
- **Create Campaign Form**:
  - Fields: Title, Description, Required Interests (tag input like "outreach, public speaking, people skills"), Status dropdown
  - Save → Redirect to campaign matching page
  
- **Campaign Matching Page** (⭐ THE STAR FEATURE):
  - Campaign details at top
  - "Find Best Matches" button with:
    - Threshold slider (0-100%) - "How closely should volunteers match?"
    - Count selector (1-50) - "How many volunteers to show?"
  - **Results display**: 
    - Ranked list of volunteers with AI similarity percentage
    - Each result shows: Name, Bio preview, Similarity Score (visual progress bar), Interest overlap
    - "Email Volunteer" button for each result
  - Visual feedback: Green bars (>80% match), Yellow (60-80%), Orange (<60%)

### 4. Health Monitoring (`/coordinator/health`)
- **Retention Health Report Page**:
  - **Three columns layout**:
    - **Healthy** (green): Active, engaged advocates
    - **Warning** (yellow): Engagement declining
    - **At-Risk** (red): Haven't participated recently, likely to churn
  - Each column shows list with current_health score and days since last activity
  - Click volunteer → Navigate to their detail page
  - **Bulk Actions**: "Send check-in email to all At-Risk volunteers"

### 5. Activity Logging (`/coordinator/activities`)
- **Activity Log Page**:
  - Table: Volunteer Name, Activity Type, Points Awarded, Date/Time
  - Filter by: Activity type, Volunteer, Date range
  - Total engagement points awarded (summary stat)
  - Export CSV button
  
- **Quick Log Activity Modal**:
  - Accessible from volunteer detail page or dashboard
  - Fields:
    - Select volunteer (dropdown with search)
    - Activity type: "protest", "leafleting", "sanctuary_tour", "social_media_post", "training_session", "custom"
    - Points (auto-filled based on type, editable)
  - Submit → Updates engagement score → Shows success toast

---

## 🐾 **VOLUNTEER PORTAL** (Public-Facing)

**Route Prefix**: `/volunteer/*` or just `/` (public home)  
**Auth Required**: Optional (can browse anonymously, auth required for profile)

### 1. Public Home Page (`/`)
- **Hero Section**: 
  - Bold headline: "Join the Animal Advocacy Movement"
  - Subheading: "Connect with campaigns, make an impact, save lives"
  - Large "Sign Up as Volunteer" button
  - Images of advocacy work (protests, vegan outreach, sanctuary animals)
  
- **How It Works** section (3 steps):
  1. Sign up and tell us about your interests
  2. Get matched to campaigns that fit your skills
  3. Track your impact and grow as an advocate
  
- **Current Campaigns** showcase:
  - Card grid showing 3-6 featured campaigns
  - Each card: Title, Description, "Learn More" button
  - Shows volunteer count and urgency level

### 2. Volunteer Signup (`/volunteer/signup`)
- **Simple signup form**:
  - Full Name
  - Email
  - Bio (textarea): "Tell us why you want to help animals and what you're interested in"
  - Advocacy Interests (tag input or checkboxes):
    - Protests & Demonstrations
    - Vegan Outreach & Leafleting
    - Social Media Advocacy
    - Sanctuary Volunteering
    - Event Planning
    - Photography & Videography
    - Community Organizing
    - Public Speaking
    - Research & Writing
  - "Join the Movement" button
  
- **After signup**:
  - Success message
  - Email sent with profile link
  - Optional: Create Supabase Auth account for login
  - Redirects to volunteer dashboard
Two Auth Scenarios**:

#### 1️⃣ **Coordinator Auth** (Required)
- Coordinators MUST log in to access admin portal
- Use Supabase Auth with role-based access
- Protected routes: `/coordinator/*`

#### 2️⃣ **Volunteer Auth** (Optional)
- Volunteers can sign up WITHOUT creating auth account initially
- Form submission just creates volunteer record in backend
- Later, they can optionally create Supabase auth account to access dashboard
- Protected routes: `/volunteer/dashboard`, `/volunteer/profile`

**Setup**:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**Coordinator Login**:
```typescript
// /coordinator/login page
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'

<Auth 
  supabaseClient={supabase} 
  appearance={{ theme: ThemeSupa }}
  providers={['google']}
  redirectTo="/coordinator/dashboard"
/>

// Protect coordinator routes
const { data: { session } } = await supabase.auth.getSession()
if (!session) redirect('/coordinator/login')

// Optional: Check for coordinator role in Supabase user metadata
const isCoordinator = session.user.user_metadata?.role === 'coordinator'
if (!isCoordinator) redirect('/')
```

**Volunteer Signup (No Auth Required)**:
```typescript
// /volunteer/signup page
// Just submit form to backend API - NO Supabase auth needed
async function handleSignup(formData) {
  const response = await fetch('http://localhost:8000/volunteers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
  
  if (response.ok) {
    // Success! Show message, redirect to thank you page
    toast.success('Welcome to the movement!')
    router.push('/volunteer/welcome')
  }
}
```

**Volunteer Optional Login** (for dashboard access):
```typescript
// /volunteer/login page (optional, if volunteer wants to access dashboard)
<Auth 
  supabaseClient={supabase} 
  appearance={{ theme: ThemeSupa }}
  redirectTo="/volunteer/dashboard"
/>
```
### 5. Browse Campaigns (`/volunteer/campaigns`)
- **Public campaign listing**:
  - All active campaigns
  - Filter by interest tags
  - Search by keyword
  - Each shows: Title, Description, When/Where (if applicable), Apply button
  
- **Campaign Detail Page**:
  - Full description
  - Required skills/interests
  - Coordinator contact info
  - "Express Interest" button (sends notification to coordinator)

---

### 🎨 Route Structure Summary

```
COORDINATOR PORTAL (Admin):
/coordinator/login          → Auth gate
/coordinator/dashboard      → Main admin dashboard
/coordinator/volunteers     → Manage all volunteers
/coordinator/volunteers/:id → Volunteer detail
/coordinator/campaigns      → Manage campaigns
/coordinator/campaigns/new  → Create campaign
/coordinator/campaigns/:id  → Campaign detail & matching
/coordinator/health         → Retention report
/coordinator/activities     → Activity logs

VOLUNTEER PORTAL (Public):
/                           → Public home page
/volunteer/signup           → Signup form
/volunteer/login            → Login (optional, uses Supabase)
/volunteer/dashboard        → Personal dashboard (auth required)
/volunteer/profile          → View/edit own profile
/volunteer/campaigns        → Browse available campaigns
/volunteer/campaigns/:id    → Campaign detail
```

### 🎨 Design System

**Color Palette** (configure in `tailwind.config.ts`):
- Primary: Blue `hsl(221, 83%, 53%)` for buttons, headers
- Success/Healthy: Green `hsl(142, 76%, 36%)`
- Warning: Amber `hsl(38, 92%, 50%)`
- Danger/At-Risk: Red `hsl(0, 84%, 60%)`
- Background: `hsl(0, 0%, 98%)`
- Card: `hsl(0, 0%, 100%)`
- Border: `hsl(214, 32%, 91%)`

(shadcn/ui uses HSL color system - customize in your theme)

**Typography** (shadcn/ui defaults):
- Headings: Inter font (via next/font)
- Body: Inter font
- Monospace: Geist Mono (for code/IDs)

**Components** (all from shadcn/ui):
- **Buttons**: Use shadcn/ui `<Button>` with variants (default, destructive, outline, ghost)
- **Cards**: Use shadcn/ui `<Card>` with `<CardHeader>`, `<CardContent>`, `<CardFooter>`
- **Badges**: Use shadcn/ui `<Badge>` with variant props
- **Forms**: Use shadcn/ui `<Form>` components with React Hook Form integration
- **Tables**: Use shadcn/ui `<Table>` with built-in styling

**Layout** (Next.js App Router):
- Sidebar navigation using shadcn/ui `<Sidebar>` component
- Top bar with app title and user menu (use `<DropdownMenu>`)
- Content area with max-width and padding
- Mobile responsive (shadcn/ui components are responsive by default)

### 🛠️ Technical Stack Recommendations

- **Framework**: Next.js 14+ with App Router + TypeScript (REQUIRED)
- **UI Library**: **shadcn/ui components** (PRIMARY - use for ALL UI components)
- **Styling**: Tailwind CSS (bundled with shadcn/ui)
- **State Management**: TanStack Query (React Query) v5 for API calls
- **Forms**: React Hook Form + Zod validation (integrated with shadcn/ui Form component)
- **Charts**: Recharts (use shadcn/ui Chart components)
- **Icons**: lucide-react (comes with shadcn/ui)
- **Auth**: Supabase Auth with pre-built UI
- **Routing**: Next.js App Router
- **Date Formatting**: date-fns

**Setup Commands:**
```bash
# Create Next.js app
npx create-next-app@latest mission-match --typescript --tailwind --app

# Initialize shadcn/ui
npx shadcn-ui@latest init

# Install components as you need them
npx shadcn-ui@latest add button card form input table badge
# ...install all components from the list above
```

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
, Heart } from "lucide-react"

export function MetricCard({ title, value, trend, status }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Heart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center pt-1">
          <Badge variant={status === 'up' ? 'default' : 'destructive'}>
            <TrendingUp className="mr-1 h-3 w-3" />
            {trend}
          </Badge>
          <span className="text-xs text-muted-foreground ml-2">
            advocates active
          </spantp://localhost:8000` (local) or use deployed backend URL

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

## 💎 shadcn/ui Component Examples

**Here are concrete examples showing how to use shadcn/ui components for each feature:**

### Example 1: Dashboard Metric Card

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp } from "lucide-react"

export function MetricCard({ title, value, trend, status }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center pt-1">
          <Badge variant={status === 'up' ? 'default' : 'destructive'}>
            <TrendingUp className="mr-1 h-3 w-3" />
            {trend}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Example 2: Volunteer List with Table (Coordinator View)

```tsx
'use client'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { Mail } from "lucide-react"

export function VolunteerTable() {
  const { data: volunteers, isLoading } = useQuery({
    queryKey: ['volunteers'],
    queryFn: () => fetch('http://localhost:8000/volunteers').then(r => r.json())
  })

  if (isLoading) return <TableSkeleton />

  return (
    <Table>
      <TableCaption>Animal advocacy volunteers across all campaigns.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Advocacy Interests</TableHead>
          <TableHead>Engagement</TableHead>
          <TableHead>Health Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {volunteers?.map((volunteer: Volunteer) => (
          <TableRow key={volunteer.id}>
            <TableCell className="font-medium">{volunteer.full_name}</TableCell>
            <TableCell className="text-muted-foreground">{volunteer.email}</TableCell>
            <TableCell>
              <div className="flex gap-1 flex-wrap">
                {volunteer.skills.slice(0, 3).map(skill => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {volunteer.skills.length > 3 && (
                  <Badge variant="outline">+{volunteer.skills.length - 3}</Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">{volunteer.engagement_score}</div>
                <div className="text-xs text-muted-foreground">pts</div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={getHealthVariant(volunteer.engagement_score)}>
                {getHealthStatus(volunteer.engagement_score)}
              </Badge>
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button variant="ghost" size="sm">
                <Mail className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">Edit</Button>
              <Button variant="ghost" size="sm" className="text-destructive">
                Delete
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

### Example 3: Volunteer Signup Form (Public Portal)

```tsx
'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const advocacyInterests = [
  { id: "protests", label: "Protests & Demonstrations" },
  { id: "outreach", label: "Vegan Outreach & Leafleting" },
  { id: "social_media", label: "Social Media Advocacy" },
  { id: "sanctuary", label: "Sanctuary Volunteering" },
  { id: "events", label: "Event Planning" },
  { id: "media", label: "Photography & Videography" },
  { id: "organizing", label: "Community Organizing" },
  { id: "speaking", label: "Public Speaking" },
]

const signupSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  bio: z.string().min(20, "Please tell us a bit more about yourself"),
  interests: z.array(z.string()).min(1, "Select at least one area of interest"),
})

export function VolunteerSignupForm() {
  const router = useRouter()
  
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      interests: [],
    }
  })

  const createVolunteer = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('http://localhost:8000/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: data.full_name,
          email: data.email,
          bio: data.bio,
          skills: data.interests, // interests become skills in backend
        })
      })
      if (!response.ok) throw new Error('Failed to sign up')
      return response.json()
    },
    onSuccess: () => {
      toast.success('Welcome to the animal advocacy movement! 🐾')
      router.push('/volunteer/welcome')
    },
    onError: () => {
      toast.error('Failed to sign up. Please try again.')
    }
  })

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Join the Animal Advocacy Movement</CardTitle>
        <CardDescription>
          Sign up to get matched with campaigns, track your impact, and help save animals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createVolunteer.mutate(data))} className="space-y-6">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="jane@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    We'll use this to match you with campaigns
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About You</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us why you want to help animals and what experience or interests you have..."
                      className="resize-none min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This helps us match you with the perfect campaigns (min 20 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="interests"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Advocacy Interests</FormLabel>
                    <FormDescription>
                      Select all areas you're interested in or experienced with
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {advocacyInterests.map((interest) => (
                      <FormField
                        key={interest.id}
                        control={form.control}
                        name="interests"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={interest.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(interest.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, interest.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== interest.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {interest.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <CardFooter className="px-0">
              <Button type="submit" size="lg" className="w-full" disabled={createVolunteer.isPending}>
                {createVolunteer.isPending ? 'Joining...' : 'Join the Movement 🐾'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
```

```tsx
'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

const volunteerSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  bio: z.string().optional(),
  skills: z.string().optional(),
})

export function AddVolunteerDialog() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  
  const form = useForm<z.infer<typeof volunteerSchema>>({
    resolver: zodResolver(volunteerSchema),
  })

  const createVolunteer = useMutation({
    mutationFn: async (data: VolunteerCreate) => {
      const response = await fetch('http://localhost:8000/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          skills: data.skills?.split(',').map(s => s.trim()).filter(Boolean)
        })
      })
      if (!response.ok) throw new Error('Failed to create volunteer')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] })
      toast.success('Volunteer created successfully!')
      setOpen(false)
      form.reset()
    },
    onError: () => {
      toast.error('Failed to create volunteer')
    }
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Volunteer</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Volunteer</DialogTitle>
          <DialogDescription>
            Create a new volunteer profile. Their bio will be used for AI matching.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createVolunteer.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="jane@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Tell us about their interests and experience..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Used for semantic matching with tasks
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="teaching, event planning, public speaking" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={createVolunteer.isPending}>
                {createVolunteer.isPending ? 'Creating...' : 'Create Volunteer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

### Example 4: Add Volunteer Manually (Coordinator Portal)

```tsx
'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

const volunteerSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  bio: z.string().optional(),
  skills: z.string().optional(),
})

export function AddVolunteerDialog() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  
  const form = useForm<z.infer<typeof volunteerSchema>>({
    resolver: zodResolver(volunteerSchema),
  })

  const createVolunteer = useMutation({
    mutationFn: async (data: VolunteerCreate) => {
      const response = await fetch('http://localhost:8000/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          skills: data.skills?.split(',').map(s => s.trim()).filter(Boolean)
        })
      })
      if (!response.ok) throw new Error('Failed to create volunteer')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] })
      toast.success('Volunteer added successfully!')
      setOpen(false)
      form.reset()
    },
    onError: () => {
      toast.error('Failed to add volunteer')
    }
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Volunteer Manually</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add Volunteer to System</DialogTitle>
          <DialogDescription>
            Manually add a volunteer to your animal advocacy team. Their bio will be used for AI campaign matching.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createVolunteer.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="jane@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Passionate about animal rights, experienced in vegan outreach..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Used for semantic campaign matching
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Advocacy Interests (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="protests, outreach, social media, organizing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={createVolunteer.isPending}>
                {createVolunteer.isPending ? 'Adding...' : 'Add Volunteer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

### Example 5: Health Status Badge

```tsx
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

function getHealthStatus(health: number): { status: string, variant: 'default' | 'warning' | 'destructive' } {
  if (health > 70) return { status: 'Healthy', variant: 'default' }
  if (health >= 40) return { status: 'Warning', variant: 'warning' }
  return { status: 'At-Risk', variant: 'destructive' }
}

export function HealthBadge({ health }: { health: number }) {
  const { status, variant } = getHealthStatus(health)
  
  return (
    <Badge 
      variant={variant}
      className={cn(
        variant === 'default' && 'bg-green-500',
        variant === 'warning' && 'bg-amber-500',
        variant === 'destructive' && 'bg-red-500'
      )}
    >
      {status} ({health})
    </Badge>
  )
}
```

### Example 6: Campaign Match Results with Progress Bars

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export function MatchResults({ matches }: { matches: VolunteerMatch[] }) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        {matches.length} advocates matched to this campaign
      </div>
      {matches.map((match) => (
        <Card key={match.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{match.full_name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {match.bio}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="ml-2">
                {Math.round(match.similarity * 100)}% match
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Match Strength</span>
                <span className="font-medium">{Math.round(match.similarity * 100)}%</span>
              </div>
              <Progress value={match.similarity * 100} className="h-2" />
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <Mail className="mr-2 h-4 w-4" />
              Email This Advocate
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

**Use these patterns throughout your app!** Every UI component should use shadcn/ui components for consistency and rapid development.

---

## 🌐 API Configuration

**Important Terminology Note:**
- The **backend API** uses "tasks" in endpoint URLs and response fields
- The **frontend UI** should present these as "campaigns" to users
- Example: `GET /tasks` → Display as "Campaigns" in UI
- This is just presentation layer branding - the data structure is identical

**Base URL**: `http://localhost:8000` (local) or deployed backend URL

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
  "application": "MissionMatch API",
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
  "bio": "Passionate about animal rights and vegan advocacy. Have experience with street outreach and social media campaigns.",
  "skills": ["outreach", "social media", "public speaking", "organizing"]
}
```

**Response**: `Volunteer` (201 Created)
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "full_name": "Jane Smith",
  "email": "jane@example.com",
  "bio": "Passionate about animal rights and vegan advocacy. Have experience with street outreach and social media campaigns.",
  "skills": ["outreach", "social media", "public speaking", "organizing"],
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
  "title": "Weekend Vegan Outreach Downtown",
  "description": "Friendly vegan leafleting and conversations with the public at the farmers market. Great for beginners!",
  "required_skills": ["outreach", "public speaking", "friendly"],
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
export class MissionMatchAPI {
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
export const api = new MissionMatchAPI('http://localhost:8000');
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

## 📊 Quick Reference: Dual Portal Architecture

### System Overview
```
MissionMatch
├── Coordinator Portal (/coordinator/*)
│   ├── Authentication: REQUIRED (Supabase Auth)
│   ├── Users: Animal advocacy coordinators
│   ├── Purpose: Manage volunteers, create campaigns, match volunteers
│   └── Key Pages: Dashboard, Volunteers List, Campaigns, Health Reports
│
└── Volunteer Portal (/volunteer/*)
    ├── Authentication: OPTIONAL (signup works without auth)
    ├── Users: Animal rights volunteers/activists
    ├── Purpose: Public signup, browse campaigns, track participation
    └── Key Pages: Home, Signup Form, Dashboard (if logged in), Profile
```

### Portal Comparison

| Feature | Coordinator Portal | Volunteer Portal |
|---------|-------------------|------------------|
| **URL Pattern** | `/coordinator/*` | `/volunteer/*` |
| **Auth Required** | ✅ Yes (Supabase Auth) | ⚠️ Optional (signup works without) |
| **User Type** | Coordinators/admins | Volunteers/activists |
| **Primary Actions** | Create campaigns, match volunteers, monitor health | Signup, browse campaigns, view profile |
| **shadcn/ui Components** | DataTable, Dialog, Form, Badge, Progress | Card, Form, Checkbox, Button, Avatar |
| **Deployment** | Protected behind auth middleware | Public-facing (no auth wall) |

### Key Technical Decisions
- **Backend uses "tasks"** ➔ **Frontend displays "campaigns"** (UI terminology only)
- **Two separate route groups** in Next.js (not a single app with role switching)
- **shadcn/ui is PRIMARY** component library (copy-paste into codebase, full control)
- **Next.js 14+ App Router REQUIRED** (not Pages Router)
- **TypeScript + Zod validation** on all forms
- **TanStack Query v5** for API calls (replaces useEffect patterns)

---

**Backend API Base URL**: Configure based on environment
**API Documentation**: `/docs` (Swagger) or `/redoc`
**Health Check**: `GET /health`

---

**Document Version**: 1.0.0  
**Last Updated**: March 8, 2026  
**API Version**: 1.0.0
