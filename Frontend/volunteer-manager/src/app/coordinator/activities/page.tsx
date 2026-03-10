'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Activity as ActivityIcon, Award, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { activityApi, volunteerApi } from '@/lib/api';
import { formatRelativeTime, formatDateTime, getInitials } from '@/lib/utils';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';

export default function ActivitiesPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: activityApi.getAll,
  });

  const { data: volunteers } = useQuery({
    queryKey: ['volunteers'],
    queryFn: volunteerApi.getAll,
  });

  const volunteerMap = new Map(volunteers?.map(v => [v.id, v]) || []);

  const activityTypeColors: Record<string, string> = {
    signup: 'bg-blue-50 text-blue-700 border-blue-200',
    task_completion: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    check_in: 'bg-amber-50 text-amber-700 border-amber-200',
    custom: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const activityDotColors: Record<string, string> = {
    signup: 'bg-blue-500',
    task_completion: 'bg-emerald-500',
    check_in: 'bg-amber-500',
    custom: 'bg-purple-500',
  };

  // Group activities by date for calendar
  const activitiesByDate = useMemo(() => {
    const map = new Map<string, typeof activities>();
    activities?.forEach(activity => {
      const dateKey = format(new Date(activity.created_at), 'yyyy-MM-dd');
      const existing = map.get(dateKey) || [];
      existing.push(activity);
      map.set(dateKey, existing);
    });
    return map;
  }, [activities]);

  // Calendar grid days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
        <p className="text-muted-foreground mt-1">
          Track all volunteer advocacy actions and engagement history
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Activities</CardTitle>
            <div className="p-2 rounded-lg bg-purple-100">
              <ActivityIcon className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{activities?.length || 0}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Points Awarded</CardTitle>
            <div className="p-2 rounded-lg bg-muted">
              <Award className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {activities?.reduce((sum, a) => sum + a.points_awarded, 0) || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Volunteers</CardTitle>
            <div className="p-2 rounded-lg bg-muted">
              <ActivityIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(activities?.map(a => a.volunteer_id)).size || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content - Activities List and Calendar Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activities List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
            <CardDescription>All volunteer actions sorted by most recent</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading activities...</div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {activities
                  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((activity) => {
                    const volunteer = volunteerMap.get(activity.volunteer_id);
                    return (
                      <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-purple-100 text-purple-700 text-sm">
                            {volunteer ? getInitials(volunteer.full_name) : '??'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {volunteer?.full_name || 'Unknown Volunteer'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className={`text-xs ${activityTypeColors[activity.activity_type] || activityTypeColors.custom}`}
                            >
                              {activity.activity_type.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              +{activity.points_awarded} pts
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatRelativeTime(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                No activities logged yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
              {calendarDays.map((day) => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayActivities = activitiesByDate.get(dateKey) || [];
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const today = isToday(day);

                return (
                  <div
                    key={dateKey}
                    className={`
                      relative min-h-[80px] p-2 text-left bg-background
                      ${!isCurrentMonth ? 'opacity-40' : ''}
                      ${today ? 'bg-purple-50/50' : ''}
                    `}
                  >
                    <span className={`
                      text-sm font-medium
                      ${today ? 'bg-purple-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : ''}
                    `}>
                      {format(day, 'd')}
                    </span>

                    {/* Activity dots */}
                    {dayActivities.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {dayActivities.length <= 3 ? (
                          dayActivities.map((act, i) => (
                            <div
                              key={i}
                              className={`h-1.5 rounded-full ${activityDotColors[act.activity_type] || activityDotColors.custom}`}
                            />
                          ))
                        ) : (
                          <>
                            <div className={`h-1.5 rounded-full ${activityDotColors[dayActivities[0].activity_type] || activityDotColors.custom}`} />
                            <div className={`h-1.5 rounded-full ${activityDotColors[dayActivities[1].activity_type] || activityDotColors.custom}`} />
                            <span className="text-[10px] text-muted-foreground">+{dayActivities.length - 2} more</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1.5 rounded-full bg-blue-500" />
                <span>Signup</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1.5 rounded-full bg-emerald-500" />
                <span>Task Completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1.5 rounded-full bg-amber-500" />
                <span>Check-in</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-1.5 rounded-full bg-purple-500" />
                <span>Custom</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
