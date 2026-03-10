'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Exchange the code for a session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          router.push('/coordinator/login?error=auth_failed');
          return;
        }

        if (!session) {
          router.push('/coordinator/login');
          return;
        }

        // Check user role and redirect accordingly
        const role = session.user.user_metadata?.role;
        
        if (role === 'coordinator') {
          router.push('/coordinator/dashboard');
        } else {
          // Volunteers don't have a dashboard yet, redirect to home
          router.push('/');
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        router.push('/coordinator/login?error=unexpected');
      }
    };

    handleCallback();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-12 pb-12 text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <div>
            <h2 className="text-xl font-semibold">Signing you in...</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Please wait while we complete the authentication process.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
