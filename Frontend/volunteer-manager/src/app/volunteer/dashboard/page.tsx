'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ArrowRight, CheckCircle, Sparkles, LogOut, ClipboardCheck, MessageSquare, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { activityApi, volunteerApi } from '@/lib/api';

export default function VolunteerDashboard() {
  const [volunteerName, setVolunteerName] = useState('');
  const [volunteerId, setVolunteerId] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);

  useEffect(() => {
    const name = localStorage.getItem('volunteer_name') || 'Volunteer';
    const id = localStorage.getItem('volunteer_id') || '';
    setVolunteerName(name);
    setVolunteerId(id);

    const done = JSON.parse(localStorage.getItem('completed_activities') || '[]');
    setCompletedActivities(done);
  }, []);

  async function logActivity(activityType: string, label: string) {
    if (!volunteerId) {
      toast.error('Volunteer ID not found. Please sign up again.');
      return;
    }
    setLoading(activityType);
    try {
      await activityApi.create({
        volunteer_id: volunteerId,
        activity_type: activityType,
      });
      const updated = [...completedActivities, activityType];
      setCompletedActivities(updated);
      localStorage.setItem('completed_activities', JSON.stringify(updated));
      toast.success(`${label} logged!`, { description: 'Your engagement score has been updated.' });
    } catch {
      toast.error('Failed to log activity');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold text-foreground">MissionMatch</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome, {volunteerName}!
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Your profile has been created. Complete activities below to boost your engagement score!
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Profile Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Activities Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedActivities.length}</div>
              <p className="text-xs text-muted-foreground">Keep going!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">AI Matching</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Active</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">You&apos;re being matched to campaigns</p>
            </CardContent>
          </Card>
        </div>

        {/* Activities */}
        <Card className="mb-10">
          <CardHeader>
            <CardTitle>Log Your Activities</CardTitle>
            <CardDescription>Complete activities to increase your engagement score and stay matched</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <ClipboardCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Daily Check-In</h3>
                    <p className="text-sm text-muted-foreground">Check in to confirm you&apos;re available (+5 pts)</p>
                  </div>
                </div>
                {completedActivities.includes('check_in') ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Done</Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => logActivity('check_in', 'Check-in')}
                    disabled={loading === 'check_in'}
                  >
                    {loading === 'check_in' ? 'Logging...' : 'Check In'}
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Complete Training</h3>
                    <p className="text-sm text-muted-foreground">Mark a training module as done (+50 pts)</p>
                  </div>
                </div>
                {completedActivities.includes('task_completion') ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Done</Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => logActivity('task_completion', 'Training completed')}
                    disabled={loading === 'task_completion'}
                  >
                    {loading === 'task_completion' ? 'Logging...' : 'Mark Complete'}
                  </Button>
                )}
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Community Feedback</h3>
                    <p className="text-sm text-muted-foreground">Share feedback about your experience (+5 pts)</p>
                  </div>
                </div>
                {completedActivities.includes('custom_feedback') ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Done</Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => logActivity('check_in', 'Feedback submitted')}
                    disabled={loading === 'custom_feedback'}
                  >
                    {loading === 'custom_feedback' ? 'Logging...' : 'Submit Feedback'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/volunteer/signup">
            <Card className="hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Update Your Profile</h3>
                  <p className="text-sm text-muted-foreground">Edit your skills and interests</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
          <Link href="/">
            <Card className="hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Learn More</h3>
                  <p className="text-sm text-muted-foreground">About how MissionMatch works</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
