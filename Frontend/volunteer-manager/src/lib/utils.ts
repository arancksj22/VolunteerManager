import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Health status utilities
export function getHealthStatusVariant(
  status: 'Healthy' | 'Warning' | 'At-Risk'
): 'default' | 'warning' | 'destructive' {
  switch (status) {
    case 'Healthy':
      return 'default';
    case 'Warning':
      return 'warning';
    case 'At-Risk':
      return 'destructive';
  }
}

export function getHealthStatusColor(status: 'Healthy' | 'Warning' | 'At-Risk') {
  switch (status) {
    case 'Healthy':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Warning':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'At-Risk':
      return 'bg-red-50 text-red-700 border-red-200';
  }
}

export function getEngagementColor(score: number) {
  if (score >= 70) return 'bg-emerald-500';
  if (score >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}

export function getMatchColor(similarity: number) {
  if (similarity >= 0.8) return 'bg-emerald-500';
  if (similarity >= 0.6) return 'bg-amber-500';
  return 'bg-orange-500';
}

export function getMatchBadgeColor(similarity: number) {
  if (similarity >= 0.8) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (similarity >= 0.6) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-orange-50 text-orange-700 border-orange-200';
}

// Date formatting utilities
export function formatDate(dateString: string | null): string {
  if (!dateString) return 'Never';
  return format(new Date(dateString), 'MMM d, yyyy');
}

export function formatDateTime(dateString: string): string {
  return format(new Date(dateString), 'MMM d, yyyy h:mm a');
}

export function formatRelativeTime(dateString: string | null): string {
  if (!dateString) return 'Never';
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
}

// Generate avatar initials
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Format engagement score
export function formatEngagementScore(score: number): string {
  return Math.round(score).toString();
}

// Format similarity percentage
export function formatSimilarity(similarity: number): string {
  return `${Math.round(similarity * 100)}%`;
}

// Compute health status from volunteer data (client-side)
export function computeHealthStatus(volunteer: {
  engagement_score: number;
  last_active_at: string | null;
}): 'Healthy' | 'Warning' | 'At-Risk' {
  if (!volunteer.last_active_at) {
    return 'At-Risk';
  }

  // Calculate days inactive
  const lastActive = new Date(volunteer.last_active_at);
  const now = new Date();
  const daysInactive = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

  // Backend formula: current_health = engagement_score - (days_inactive × 2)
  const currentHealth = volunteer.engagement_score - (daysInactive * 2);

  if (currentHealth > 70) return 'Healthy';
  if (currentHealth >= 40) return 'Warning';
  return 'At-Risk';
}

