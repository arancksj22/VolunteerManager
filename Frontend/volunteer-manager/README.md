# MissionMatch Frontend

AI-powered volunteer management platform for animal advocacy organizations. Built with Next.js 14, shadcn/ui, and TypeScript.

## 🚀 Tech Stack

- **Framework**: Next.js 14.x (App Router)  
- **Language**: TypeScript
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack Query (React Query) v5
- **Forms**: React Hook Form + Zod validation
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Date**: date-fns
- **Animations**: Framer Motion

## 🏃 Getting Started

### Prerequisites
- Node.js 18+
- Backend API running on `http://localhost:8000`
- (Optional) Supabase project for authentication

### Installation

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/
│   ├── coordinator/      # Admin portal (dashboard, volunteers, campaigns, etc.)
│   ├── volunteer/        # Public portal (signup, login, browse campaigns)
│   ├── page.tsx          # Public home page
│   └── layout.tsx        # Root layout with providers
├── components/           # React components (shadcn/ui + custom)
├── lib/                  # Utilities (api.ts, supabase.ts, utils.ts)
├── providers/            # React context providers
└── types/                # TypeScript types
```

## 🎯 Key Features Built

### ✅ Coordinator Portal
- Dashboard with key metrics and health distribution
- Volunteer management (list, search, filter by status)
- Campaign management
- **AI-powered volunteer matching** (star feature!)
- Health monitoring with at-risk alerts

### ✅ Volunteer Portal
- Public home page with movement stats
- Volunteer signup form (no auth required)
- Campaign preview cards

### ✅ Design System
- Custom Tailwind theme with HSL colors
- Color-coded health statuses (Healthy, Warning, At-Risk)
- Visual engagement indicators (progress bars)
- Hover states and smooth transitions
- Inter font family

### ✅ Technical Setup
- TanStack Query for API state management
- Zod + React Hook Form for form validation
- Supabase client configuration
- API client with typed endpoints
- Helper functions for dates, colors, formatting

## 🔑 Two Portal System

### Coordinator Portal (`/coordinator/*`)
Admin dashboard for managing volunteers and campaigns. Requires authentication.

**Routes**:
- `/coordinator/dashboard` - Main dashboard
- `/coordinator/volunteers` - Volunteer list with search/filters
- `/coordinator/campaigns` - Campaign list
- `/coordinator/campaigns/[id]` - AI matching page ⭐
- `/coordinator/health` - Health monitoring report
- `/coordinator/activities` - Activity logs

### Volunteer Portal (`/volunteer/*` & `/`)
Public-facing portal for volunteers.

**Routes**:
- `/` - Public home page
- `/volunteer/signup` - Registration form
- `/volunteer/login` - Authentication
- `/volunteer/dashboard` - Personal dashboard
- `/volunteer/campaigns` - Browse campaigns

## 🎨 Design Principles

Following `FRONTEND_DESIGN_PRINCIPLES.md`:

- ✅ Warm, approachable colors (not generic blue)
- ✅ Visual hierarchy with intentional typography
- ✅ Consistent spacing (p-6 for cards, space-y-6 for sections)
- ✅ Color-coded health statuses
- ✅ Hover states on all interactive elements
- ✅ Loading skeletons and empty states
- ✅ Real content (no lorem ipsum)

## 🔧 API Integration

Base URL: `http://localhost:8000` (configured in `.env.local`)

**Key endpoints**:
- `GET /volunteers` - List volunteers
- `POST /volunteers` - Create volunteer
- `GET /tasks` - List campaigns (called "tasks" in backend)
- `GET /tasks/{id}/match` - AI matching ⭐
- `GET /stats` - Dashboard statistics
- `POST /activities` - Log activities

## 📦 Next Steps

The foundation is built! Here's what to add next:

1. **Create Campaign Form** - `/coordinator/campaigns/new`
2. **Add Volunteer Form** - `/coordinator/volunteers/new`
3. **Volunteer Detail Page** - `/coordinator/volunteers/[id]`
4. **Health Report Page** - `/coordinator/health`
5. **Activity Logs** - `/coordinator/activities`
6. **Volunteer Dashboard** - `/volunteer/dashboard`
7. **Login Pages** - Implement Supabase Auth UI
8. **Email Functionality** - Connect email buttons
9. **Campaign Detail** - `/volunteer/campaigns/[id]`
10. **Dark Mode** - Add theme toggle

## 🐛 Troubleshooting

**"Failed to fetch" errors:**
- Ensure backend API is running on `localhost:8000`
- Check CORS is enabled on backend
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`

**Styles not applying:**
- Restart dev server after changing `globals.css`
- Check Tailwind v4 syntax

**Supabase auth issues:**
- Verify environment variables
- Check redirect URLs in Supabase dashboard

## 💚 Built for Animals

This platform helps animal advocacy organizations prevent volunteer burnout and maximize impact for animals.

---

For detailed specs, see:
- `FRONTEND_DESIGN_PRINCIPLES.md` - Design guidelines
- `FRONTEND_INTEGRATION_SPEC.md` - Complete feature specs
