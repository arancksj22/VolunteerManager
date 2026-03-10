'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, UserPlus, Mail, TrendingUp, Activity, Calendar } from 'lucide-react';
import { volunteerApi } from '@/lib/api';
import { HealthBadge } from '@/components/health-badge';
import { getInitials, formatDate, formatEngagementScore, getEngagementColor, computeHealthStatus } from '@/lib/utils';
import type { Volunteer } from '@/types';

export default function VolunteersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Healthy' | 'Warning' | 'At-Risk'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: volunteers, isLoading } = useQuery({
    queryKey: ['volunteers'],
    queryFn: volunteerApi.getAll,
  });

  // Compute health status client-side for all volunteers
  const volunteersWithHealth = volunteers?.map(volunteer => ({
    ...volunteer,
    health_status: computeHealthStatus(volunteer)
  }));

  const filteredVolunteers = volunteersWithHealth?.filter((volunteer) => {
    const matchesSearch =
      searchQuery === '' ||
      volunteer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      volunteer.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || volunteer.health_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const counts = {
    all: volunteersWithHealth?.length || 0,
    Healthy: volunteersWithHealth?.filter((v) => v.health_status === 'Healthy').length || 0,
    Warning: volunteersWithHealth?.filter((v) => v.health_status === 'Warning').length || 0,
    'At-Risk': volunteersWithHealth?.filter((v) => v.health_status === 'At-Risk').length || 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Volunteers
          </h1>
          <p className="text-muted-foreground mt-1.5">
            Manage your volunteer network and track engagement in real-time
          </p>
        </div>
        <Link href="/coordinator/volunteers/new">
          <Button size="lg" className="gap-2 shadow-md hover:shadow-lg transition-shadow bg-purple-600 hover:bg-purple-700">
            <UserPlus className="h-4 w-4" />
            Add Volunteer
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-purple-200 bg-purple-50/50 hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Total</p>
                <p className="text-3xl font-bold mt-1 text-purple-900">{counts.all}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900 hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">Healthy</p>
                <p className="text-3xl font-bold mt-1 text-green-700 dark:text-green-400">{counts.Healthy}</p>
              </div>
              <div className="h-12 w-12 bg-green-500/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-900 hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Warning</p>
                <p className="text-3xl font-bold mt-1 text-yellow-700 dark:text-yellow-400">{counts.Warning}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900 hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-400">At-Risk</p>
                <p className="text-3xl font-bold mt-1 text-red-700 dark:text-red-400">{counts['At-Risk']}</p>
              </div>
              <div className="h-12 w-12 bg-red-500/10 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <TabsList className="grid grid-cols-4 w-full md:w-auto">
                <TabsTrigger value="all" className="gap-1.5">
                  All <Badge variant="secondary" className="ml-1">{counts.all}</Badge>
                </TabsTrigger>
                <TabsTrigger value="Healthy" className="gap-1.5">
                  Healthy <Badge variant="secondary" className="ml-1">{counts.Healthy}</Badge>
                </TabsTrigger>
                <TabsTrigger value="Warning" className="gap-1.5">
                  Warning <Badge variant="secondary" className="ml-1">{counts.Warning}</Badge>
                </TabsTrigger>
                <TabsTrigger value="At-Risk" className="gap-1.5">
                  At-Risk <Badge variant="secondary" className="ml-1">{counts['At-Risk']}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Volunteers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredVolunteers && filteredVolunteers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVolunteers.map((volunteer) => (
            <Card
              key={volunteer.id}
              className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border-border/50 overflow-hidden"
            >
              <CardContent className="pt-6">
                {/* Header with Avatar and Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-14 w-14 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-lg font-semibold">
                        {getInitials(volunteer.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                        {volunteer.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">{volunteer.email}</p>
                    </div>
                  </div>
                  <HealthBadge status={volunteer.health_status} />
                </div>

                {/* Engagement Score */}
                <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">Engagement</span>
                    <span className="text-sm font-bold">{formatEngagementScore(volunteer.engagement_score)}</span>
                  </div>
                  <div className="w-full h-2.5 bg-background rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getEngagementColor(volunteer.engagement_score)}`}
                      style={{ width: `${volunteer.engagement_score}%` }}
                    />
                  </div>
                </div>

                {/* Last Activity */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 pb-4 border-b">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Last active {formatDate(volunteer.last_active_at)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `mailto:${volunteer.email}`;
                    }}
                  >
                    <Mail className="h-3.5 w-3.5 mr-1.5" />
                    Email
                  </Button>
                  <Link href={`/coordinator/volunteers/${volunteer.id}`} className="flex-1">
                    <Button variant="default" size="sm" className="w-full">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-none shadow-none bg-muted/30">
          <CardContent className="py-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <UserPlus className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No volunteers match your filters' : 'No volunteers yet'}
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Add your first volunteer to start building your network'}
            </p>
            {searchQuery === '' && statusFilter === 'all' && (
              <Link href="/coordinator/volunteers/new">
                <Button size="lg" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Your First Volunteer
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
