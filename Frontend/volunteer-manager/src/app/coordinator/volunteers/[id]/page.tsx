'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Mail, Calendar, Activity, Award, Trash2 } from 'lucide-react';
import { volunteerApi, activityApi } from '@/lib/api';
import { HealthBadge } from '@/components/health-badge';
import { getInitials, formatDate, formatRelativeTime, formatEngagementScore, getEngagementColor, computeHealthStatus } from '@/lib/utils';
import { toast } from 'sonner';

export default function VolunteerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const volunteerId = params.id as string;

  const { data: volunteer, isLoading } = useQuery({
    queryKey: ['volunteer', volunteerId],
    queryFn: () => volunteerApi.getById(volunteerId),
  });

  const { data: activities } = useQuery({
    queryKey: ['activities', volunteerId],
    queryFn: () => activityApi.getByVolunteer(volunteerId),
    enabled: !!volunteerId,
  });

  const deleteVolunteer = useMutation({
    mutationFn: () => volunteerApi.delete(volunteerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['volunteers'] });
      toast.success('Volunteer removed');
      router.push('/coordinator/volunteers');
    },
    onError: () => {
      toast.error('Failed to delete volunteer');
    },
  });

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Loading volunteer profile...</div>;
  }

  if (!volunteer) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground mb-4">Volunteer not found</p>
        <Link href="/coordinator/volunteers">
          <Button variant="outline">Back to Volunteers</Button>
        </Link>
      </div>
    );
  }

  const healthStatus = computeHealthStatus(volunteer);
  const totalPoints = activities?.reduce((sum, a) => sum + a.points_awarded, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" className="gap-2 mb-4" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back to Volunteers
        </Button>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {getInitials(volunteer.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{volunteer.full_name}</h1>
                  <p className="text-muted-foreground">{volunteer.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <HealthBadge status={healthStatus} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-destructive hover:text-destructive"
                    onClick={() => {
                      if (confirm('Are you sure you want to remove this volunteer?')) {
                        deleteVolunteer.mutate();
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
              {volunteer.bio && (
                <p className="text-sm text-muted-foreground mt-3 max-w-2xl">{volunteer.bio}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                {volunteer.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Engagement Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold">{formatEngagementScore(volunteer.engagement_score)}</div>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getEngagementColor(volunteer.engagement_score)}`}
                  style={{ width: `${volunteer.engagement_score}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              {formatDate(volunteer.last_active_at)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              {activities?.length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-muted-foreground" />
              {totalPoints}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity History */}
      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>All logged activities for this volunteer</CardDescription>
        </CardHeader>
        <CardContent>
          {activities && activities.length > 0 ? (
            <div className="space-y-4">
              {activities
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium capitalize">
                        {activity.activity_type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(activity.created_at)}
                      </p>
                    </div>
                    <Badge variant="secondary">+{activity.points_awarded} pts</Badge>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No activities logged yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
