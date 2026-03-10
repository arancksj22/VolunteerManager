// ============================================================================
// VOLUNTEER MODELS
// ============================================================================

export interface Volunteer {
  id: string; // UUID
  full_name: string;
  email: string;
  bio: string | null;
  skills: string[]; // Backend uses 'skills' not 'advocacy_interests'
  engagement_score: number; // 0-100
  last_active_at: string; // ISO 8601 - Backend uses 'last_active_at'
  created_at: string; // ISO 8601
  // Client-side computed fields
  health_status?: 'Healthy' | 'Warning' | 'At-Risk';
}

export interface VolunteerCreate {
  full_name: string;
  email: string;
  bio?: string;
  skills?: string[]; // Backend uses 'skills'
}

export interface VolunteerUpdate {
  full_name?: string;
  bio?: string;
  skills?: string[];
  // Note: email cannot be updated
}

export interface VolunteerHealthStatus {
  id: string; // UUID
  full_name: string;
  email: string;
  current_health: number; // Backend returns this
  status: 'Healthy' | 'Warning' | 'At-Risk';
}

export interface VolunteerMatch {
  id: string; // UUID
  full_name: string;
  bio: string;
  similarity: number; // 0.0 to 1.0
}

// ============================================================================
// CAMPAIGN MODELS (Frontend calls them "campaigns", backend calls them "tasks")
// ============================================================================

export interface Campaign {
  id: string; // UUID
  title: string;
  description: string | null;
  required_skills: string[]; // Backend uses 'required_skills'
  status: 'open' | 'filled' | 'completed'; // Backend uses these values
  created_at: string; // ISO 8601
}

export interface CampaignCreate {
  title: string;
  description?: string;
  required_skills?: string[]; // Backend uses 'required_skills'
  status?: 'open' | 'filled' | 'completed';
}

export interface CampaignUpdate {
  title?: string;
  description?: string;
  required_skills?: string[];
  status?: 'open' | 'filled' | 'completed';
}

// ============================================================================
// ACTIVITY MODELS
// ============================================================================

export interface Activity {
  id: number; // Backend uses int, not UUID
  volunteer_id: string; // UUID
  activity_type: string; // 'signup', 'task_completion', 'check_in', 'custom'
  points_awarded: number; // Backend uses points_awarded, not points
  created_at: string; // ISO 8601 - Backend uses created_at, not date
}

export interface ActivityCreate {
  volunteer_id: string; // UUID
  activity_type: string;
  points_awarded?: number; // Optional, defaults based on activity_type
}

// ============================================================================
// STATISTICS MODELS
// ============================================================================

export interface Stats {
  total_volunteers: number;
  active_volunteers: number;
  at_risk_count: number;
  total_hours_this_month: number;
  avg_engagement_score: number;
  health_distribution: {
    Healthy: number;
    Warning: number;
    'At-Risk': number;
  };
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiError {
  detail: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
