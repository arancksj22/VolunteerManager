'use client';

import { Badge } from '@/components/ui/badge';
import { cn, getHealthStatusColor } from '@/lib/utils';

interface HealthBadgeProps {
  status: 'Healthy' | 'Warning' | 'At-Risk';
  className?: string;
}

export function HealthBadge({ status, className }: HealthBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(getHealthStatusColor(status), 'font-medium', className)}
    >
      {status}
    </Badge>
  );
}
