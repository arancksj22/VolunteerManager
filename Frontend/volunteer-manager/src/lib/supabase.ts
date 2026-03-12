import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if user is coordinator
export async function isCoordinator(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return false;
  
  return session.user.user_metadata?.role === 'coordinator';
}

// Helper function to get current user session
export async function getCurrentSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}
