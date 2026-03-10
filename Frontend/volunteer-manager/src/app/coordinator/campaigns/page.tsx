'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Target, Calendar } from 'lucide-react';
import { campaignApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Campaign } from '@/types';

const statusColors = {
  open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  filled: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-gray-50 text-gray-700 border-gray-200',
};

export default function CampaignsPage() {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: campaignApi.getAll,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Create campaigns and find perfect volunteer matches with AI
          </p>
        </div>
        <Link href="/coordinator/campaigns/new">
          <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4" />
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Campaigns Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading campaigns...</div>
      ) : campaigns && campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-lg transition-all border-purple-100 hover:border-purple-200">
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="outline" className={statusColors[campaign.status]}>
                    {campaign.status}
                  </Badge>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">{campaign.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {campaign.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {campaign.required_skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {campaign.required_skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{campaign.required_skills.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="pt-3 border-t flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Created {formatDate(campaign.created_at)}
                    </span>
                    <Link href={`/coordinator/campaigns/${campaign.id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Target className="h-4 w-4" />
                        Find Matches
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="max-w-md mx-auto">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first campaign and use AI to find the perfect volunteer matches.
              </p>
              <Link href="/coordinator/campaigns/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Campaign
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
