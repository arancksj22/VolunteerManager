'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Mail, Target, Sparkles, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { campaignApi, volunteerApi } from '@/lib/api';
import { getInitials, cn } from '@/lib/utils';

export default function CampaignMatchingPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  
  const [minSimilarity] = useState(0.3);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: campaign } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => campaignApi.getById(campaignId),
  });

  const { data: matches, isLoading } = useQuery({
    queryKey: ['campaign-matches', campaignId, minSimilarity],
    queryFn: () => campaignApi.findMatches(campaignId, minSimilarity),
    enabled: !!campaignId,
  });

  if (!campaign) {
    return <div className="text-center py-12">Loading campaign...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          className="gap-2 mb-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Find Volunteer Matches</h1>
        <p className="text-muted-foreground mt-1">
          AI-powered matching based on interests and experience
        </p>
      </div>

      {/* Campaign Info */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{campaign.title}</CardTitle>
              <CardDescription className="text-base mt-2">
                {campaign.description}
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
              {campaign.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Required Skills:</p>
            <div className="flex flex-wrap gap-2">
              {campaign.required_skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Matches List */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">
            {isLoading ? 'Finding matches...' : matches && matches.length > 0 
              ? `Found ${matches.length} matching advocate${matches.length !== 1 ? 's' : ''}`
              : 'No matches found'}
          </h2>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Sparkles className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p>AI is analyzing volunteer profiles...</p>
            </CardContent>
          </Card>
        ) : matches && matches.length > 0 ? (
          matches.map((match) => (
            <Card key={match.id} className="hover:shadow-md transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <Avatar className="h-12 w-12 mt-1">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getInitials(match.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Link 
                        href={`/coordinator/volunteers/${match.id}`}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {match.full_name}
                      </Link>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {match.bio}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      onClick={async () => {
                        try {
                          const vol = await volunteerApi.getById(match.id);
                          await navigator.clipboard.writeText(vol.email);
                          setCopiedId(match.id);
                          toast.success('Email copied!', { description: vol.email });
                          setTimeout(() => setCopiedId(null), 2000);
                        } catch {
                          toast.error('Failed to copy email');
                        }
                      }}
                    >
                      {copiedId === match.id ? (
                        <><Check className="h-4 w-4" /> Copied</>
                      ) : (
                        <><Copy className="h-4 w-4" /> Copy Email</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No matches found</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Try lowering the match threshold to see more volunteers
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
