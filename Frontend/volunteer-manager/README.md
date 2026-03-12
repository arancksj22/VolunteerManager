# MissionMatch Frontend

Next.js frontend for MissionMatch - deployed on Vercel.

**Live:** https://missionmatch.vercel.app/

## Tech Stack

- **Next.js 16** - App Router, SSR, middleware
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - 30+ accessible UI components (Radix primitives)
- **Supabase SSR** - Auth middleware (JWT session management)

## Project Structure

```
src/
├── app/
│   ├── coordinator/         # Protected dashboard routes
│   │   ├── dashboard/       # Main dashboard with metrics
│   │   ├── volunteers/      # Volunteer list + search
│   │   ├── activities/      # Activity logging
│   │   ├── campaigns/       # Campaigns + AI matching
│   │   ├── assistant/       # AI chatbot
│   │   ├── documents/       # File management
│   │   ├── emails/          # Email campaigns
│   │   └── notes/           # Coordinator notes
│   ├── volunteer/           # Public volunteer portal
│   │   ├── signup/          # Registration
│   │   ├── login/           # Authentication
│   │   └── dashboard/       # Volunteer dashboard
│   └── page.tsx             # Landing page
├── components/              # Reusable UI components
├── lib/                     # API client, Supabase client, utilities
├── providers/               # React context providers
└── types/                   # TypeScript type definitions
```

## Run Locally

```bash
cd Frontend/volunteer-manager
npm install

# Create .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

npm run dev
# Available at http://localhost:3000
```

## Auth

Supabase Auth with JWT sessions. Next.js middleware protects all `/coordinator/*` routes - only users with `role: coordinator` in user_metadata can access the dashboard.
