# Supabase Authentication Setup Guide

## Overview
This guide walks you through setting up Supabase authentication for the MissionMatch application with two portals: **Coordinator** (protected) and **Volunteer** (optional login).

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Fill in:
   - **Project Name**: `mission-match` (or your choice)
   - **Database Password**: Save this securely!
   - **Region**: Choose closest to you
4. Click **"Create new project"** and wait ~2 minutes for provisioning

---

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values (you'll need them for `.env.local`):
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJhbG...`)

---

## Step 3: Configure Environment Variables

Create `Frontend/volunteer-manager/.env.local`:

```bash
# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Backend API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

**Important**: Replace `YOUR_PROJECT_ID` and the anon key with your actual values from Step 2.

---

## Step 4: Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. **Email** should be enabled by default
3. Scroll down to **Email Templates** and customize if desired

---

## Step 5: Configure Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add these URLs to **Redirect URLs** (comma-separated):
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000/coordinator/dashboard
   http://localhost:3000/volunteer/dashboard
   ```
3. For production, add your deployed domain (e.g., `https://your-domain.com/auth/callback`)

---

## Step 6: Set Up User Metadata (Coordinator Role)

Supabase doesn't have built-in roles, so we'll use **user metadata** to distinguish coordinators from volunteers.

### Option A: Manual Role Assignment (via SQL Editor)

1. Go to **SQL Editor** in Supabase
2. Run this SQL to add coordinator role to a user:

```sql
-- Replace 'coordinator@example.com' with actual email
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"coordinator"'::jsonb
)
WHERE email = 'coordinator@example.com';
```

### Option B: Automatic Role on Signup (Advanced)

Create a database trigger to automatically assign roles based on email domain:

```sql
-- Trigger to set coordinator role for specific emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- If email ends with @yourorg.com, set as coordinator
  IF NEW.email LIKE '%@yourorg.com' THEN
    NEW.raw_user_meta_data = jsonb_set(
      COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
      '{role}',
      '"coordinator"'::jsonb
    );
  ELSE
    -- Default role is volunteer
    NEW.raw_user_meta_data = jsonb_set(
      COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
      '{role}',
      '"volunteer"'::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Step 7: Test Authentication

1. Start your frontend:
   ```bash
   cd Frontend/volunteer-manager
   npm run dev
   ```

2. Open http://localhost:3000

3. Test signup flow:
   - Go to volunteer signup page
   - Create account → Check email for confirmation link
   - Click link → Should redirect back to app

4. Test login (after creating login pages - see next section):
   - Go to coordinator login page
   - Sign in with coordinator email
   - Should redirect to dashboard if role = coordinator

---

## Checking User Authentication & Metadata

### View All Users
Go to **Authentication** → **Users** in Supabase dashboard to see all registered users.

### Check User Metadata (Role)
1. Click on a user
2. Expand **User Metadata** section
3. Should see `"role": "coordinator"` or `"role": "volunteer"`

### Via SQL
```sql
SELECT email, raw_user_meta_data->>'role' as role, created_at
FROM auth.users
ORDER BY created_at DESC;
```

---

## Next Steps: Implement Login Pages

You'll need to create these pages (see AUTH_PAGES_IMPLEMENTATION.md for code):

1. **`/coordinator/login`** - Supabase Auth UI with role check
2. **`/volunteer/login`** - Optional login for volunteers
3. **Middleware** - Protect `/coordinator/*` routes
4. **Sign Out** - Button in coordinator sidebar

The Supabase client is already configured in `src/lib/supabase.ts` and ready to use!

---

## Troubleshooting

### "Invalid login credentials"
- Email confirmation might be required (check inbox/spam)
- Password must be at least 6 characters
- Check if email exists in **Authentication** → **Users**

### Redirect not working
- Verify redirect URLs are added in **Authentication** → **URL Configuration**
- Check `.env.local` has correct Supabase URL and anon key
- Restart dev server after changing .env.local

### Role not working
- Run the SQL query to manually set coordinator role
- Verify user metadata with: `SELECT raw_user_meta_data FROM auth.users;`
- Clear browser cookies and try logging in again

### Can't access protected routes
- Ensure middleware is checking `supabase.auth.getUser()`
- Check browser console for auth errors
- Verify session is being created (use DevTools → Application → Cookies)

---

## Security Notes

⚠️ **Production Checklist**:
- [ ] Enable RLS (Row Level Security) on all tables
- [ ] Create policies to restrict volunteer access
- [ ] Use `NEXT_PUBLIC_` prefix only for truly public values
- [ ] Add email rate limiting in Supabase settings
- [ ] Set up email templates with your domain
- [ ] Enable MFA (Multi-Factor Auth) for coordinators (optional)
- [ ] Review and restrict API permissions in Supabase

---

## Additional Resources

- [Supabase Next.js Auth Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Auth API Reference](https://supabase.com/docs/reference/javascript/auth-api)
- [Row Level Security Policies](https://supabase.com/docs/guides/auth/row-level-security)
