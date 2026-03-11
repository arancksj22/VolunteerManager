'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, Users, TrendingUp, AlertCircle, Activity, Plus, UserPlus, Briefcase, Trophy, BarChart3 } from 'lucide-react';
import { statsApi, volunteerApi, activityApi } from '@/lib/api';
import { formatRelativeTime, formatEngagementScore } from '@/lib/utils';
import { HealthBadge } from '@/components/health-badge';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';

const HEALTH_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];
const ACTIVITY_COLORS = ['#9333ea', '#c026d3', '#e879f9', '#7c3aed'];

export default function CoordinatorDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: statsApi.getStats,
  });

  const { data: atRiskVolunteers } = useQuery({
    queryKey: ['volunteers', 'at-risk'],
    queryFn: () => volunteerApi.getByHealthStatus('At-Risk'),
  });

  const { data: recentActivities } = useQuery({
    queryKey: ['activities', 'recent'],
    queryFn: activityApi.getAll,
  });

  const { data: allVolunteers } = useQuery({
    queryKey: ['volunteers'],
    queryFn: volunteerApi.getAll,
  });

  const healthDistribution = stats?.health_distribution || { Healthy: 0, Warning: 0, 'At-Risk': 0 };
  const totalVolunteers = healthDistribution.Healthy + healthDistribution.Warning + healthDistribution['At-Risk'];

  // Health pie chart data
  const healthPieData = useMemo(() => [
    { name: 'Healthy', value: healthDistribution.Healthy },
    { name: 'Warning', value: healthDistribution.Warning },
    { name: 'At-Risk', value: healthDistribution['At-Risk'] },
  ].filter(d => d.value > 0), [healthDistribution]);

  // Activity type breakdown
  const activityTypeData = useMemo(() => {
    if (!recentActivities) return [];
    const counts: Record<string, number> = {};
    recentActivities.forEach(a => {
      const type = a.activity_type.replace('_', ' ');
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [recentActivities]);

  // Activity trend (group by day, last 14 days)
  const activityTrendData = useMemo(() => {
    if (!recentActivities) return [];
    const now = new Date();
    const days: Record<string, number> = {};
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days[key] = 0;
    }
    recentActivities.forEach(a => {
      const d = new Date(a.created_at);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (key in days) days[key]++;
    });
    return Object.entries(days).map(([date, activities]) => ({ date, activities }));
  }, [recentActivities]);

  // Top volunteers by engagement score
  const topVolunteers = useMemo(() => {
    if (!allVolunteers) return [];
    return [...allVolunteers]
      .sort((a, b) => b.engagement_score - a.engagement_score)
      .slice(0, 5)
      .map(v => ({
        name: v.full_name.length > 15 ? v.full_name.slice(0, 15) + '...' : v.full_name,
        score: v.engagement_score,
      }));
  }, [allVolunteers]);

  // Engagement score distribution (buckets)
  const engagementDistribution = useMemo(() => {
    if (!allVolunteers) return [];
    const buckets = [
      { range: '0-20', min: 0, max: 20, count: 0 },
      { range: '21-40', min: 21, max: 40, count: 0 },
      { range: '41-60', min: 41, max: 60, count: 0 },
      { range: '61-80', min: 61, max: 80, count: 0 },
      { range: '81-100', min: 81, max: 100, count: 0 },
      { range: '100+', min: 101, max: Infinity, count: 0 },
    ];
    allVolunteers.forEach(v => {
      const bucket = buckets.find(b => v.engagement_score >= b.min && v.engagement_score <= b.max);
      if (bucket) bucket.count++;
    });
    return buckets.map(({ range, count }) => ({ range, count }));
  }, [allVolunteers]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">
          Stop Losing Animal Advocates
        </h1>
        <p className="text-lg text-muted-foreground">
          Monitor volunteer health, prevent burnout, and keep your movement strong.
        </p>
      </div>

      {/* At-Risk Alert */}
      {atRiskVolunteers && atRiskVolunteers.length > 0 && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base text-red-900">
                  {atRiskVolunteers.length} Advocate{atRiskVolunteers.length !== 1 ? 's' : ''} At Risk
                </CardTitle>
                <p className="text-sm text-red-700 mt-1">
                  These volunteers haven&apos;t participated in 30+ days and may churn soon.
                </p>
              </div>
              <Link href="/coordinator/volunteers">
                <Button variant="default" className="bg-red-600 hover:bg-red-700 text-white">
                  View At-Risk Volunteers
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Advocates
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-100">
              <Heart className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">{stats?.total_volunteers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.active_volunteers || 0} active this month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Engagement Score
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple-100">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">
              {stats?.avg_engagement_score ? Math.round(stats.avg_engagement_score) : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average across all volunteers
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              At-Risk Count
            </CardTitle>
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertCircle className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{stats?.at_risk_count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Need urgent attention
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Advocacy Hours
            </CardTitle>
            <div className="p-2 rounded-lg bg-muted">
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.total_hours_this_month || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Health Distribution + Activity Types Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <CardTitle>Health Distribution</CardTitle>
            </div>
            <CardDescription>Volunteer retention risk breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {healthPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={healthPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {healthPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={HEALTH_COLORS[index % HEALTH_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} volunteers`, '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                No volunteer data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              <CardTitle>Activity Types</CardTitle>
            </div>
            <CardDescription>Breakdown by activity category</CardDescription>
          </CardHeader>
          <CardContent>
            {activityTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={activityTypeData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {activityTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={ACTIVITY_COLORS[index % ACTIVITY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                No activity data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Trend + Engagement Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <CardTitle>Activity Trend</CardTitle>
            </div>
            <CardDescription>Daily activity count over the last 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            {activityTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={activityTrendData}>
                  <defs>
                    <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="activities"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    fill="url(#activityGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                No activity data yet
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <CardTitle>Engagement Distribution</CardTitle>
            </div>
            <CardDescription>Volunteer scores grouped by range</CardDescription>
          </CardHeader>
          <CardContent>
            {engagementDistribution.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={engagementDistribution} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [`${value} volunteers`, 'Count']} />
                  <Bar dataKey="count" fill="#a855f7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                No volunteer data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Volunteers Leaderboard + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Volunteers */}
        <Card className="shadow-sm border-purple-100">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-purple-600" />
              <CardTitle>Top Volunteers</CardTitle>
            </div>
            <CardDescription>Highest engagement scores</CardDescription>
          </CardHeader>
          <CardContent>
            {topVolunteers.length > 0 ? (
              <div className="space-y-4">
                {topVolunteers.map((vol, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-muted text-muted-foreground'}
                    `}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{vol.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (vol.score / Math.max(...topVolunteers.map(v => v.score))) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-purple-700 w-10 text-right">{vol.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No volunteer data yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest volunteer advocacy actions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivities && recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {activity.activity_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatRelativeTime(activity.created_at)} • {activity.points_awarded} points
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No recent activities
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common coordinator tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/coordinator/volunteers/new">
            <Button className="w-full justify-start gap-2" variant="outline">
              <UserPlus className="h-4 w-4" />
              Add Volunteer
            </Button>
          </Link>
          <Link href="/coordinator/campaigns/new">
            <Button className="w-full justify-start gap-2" variant="outline">
              <Plus className="h-4 w-4" />
              Create Campaign
            </Button>
          </Link>
          <Link href="/coordinator/emails">
            <Button className="w-full justify-start gap-2" variant="outline">
              <Heart className="h-4 w-4" />
              Send Emails
            </Button>
          </Link>
          <Link href="/coordinator/volunteers">
            <Button className="w-full justify-start gap-2" variant="outline">
              <Users className="h-4 w-4" />
              Manage Volunteers
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
