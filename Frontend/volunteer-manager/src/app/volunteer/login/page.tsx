'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Heart, ArrowLeft, LogIn } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { volunteerApi } from '@/lib/api';

export default function VolunteerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const volunteers = await volunteerApi.getAll();
      const match = volunteers.find(
        (v) => v.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (match) {
        localStorage.setItem('volunteer_name', match.full_name);
        localStorage.setItem('volunteer_id', match.id);
        localStorage.setItem('completed_activities', '[]');
        toast.success(`Welcome back, ${match.full_name}!`);
        router.push('/volunteer/dashboard');
      } else {
        toast.error('No account found', {
          description: 'No volunteer with this email exists. Please sign up first.',
        });
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-background">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-5 w-5" />
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold text-foreground">MissionMatch</span>
          </Link>
          <div className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/volunteer/signup" className="text-primary hover:underline font-medium">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-md mx-auto px-6 py-24">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Volunteer Sign In
          </h1>
          <p className="text-muted-foreground">
            Enter your email to access your dashboard
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Use the email you registered with
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                <LogIn className="h-4 w-4" />
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
