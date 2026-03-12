import {
  Volunteer,
  VolunteerCreate,
  VolunteerUpdate,
  VolunteerHealthStatus,
  VolunteerMatch,
  Campaign,
  CampaignCreate,
  CampaignUpdate,
  Activity,
  ActivityCreate,
  Stats,
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ============================================================================
// VOLUNTEER API
// ============================================================================

export const volunteerApi = {
  // Get all volunteers
  getAll: async (): Promise<Volunteer[]> => {
    const response = await fetch(`${API_BASE}/volunteers`);
    if (!response.ok) throw new Error('Failed to fetch volunteers');
    return response.json();
  },

  // Get single volunteer by ID
  getById: async (id: string): Promise<Volunteer> => {
    const response = await fetch(`${API_BASE}/volunteers/${id}`);
    if (!response.ok) throw new Error('Failed to fetch volunteer');
    return response.json();
  },

  // Create new volunteer
  create: async (data: VolunteerCreate): Promise<Volunteer> => {
    const response = await fetch(`${API_BASE}/volunteers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      if (response.status === 409) {
        throw new Error('A volunteer with this email already exists. Please use a different email.');
      }
      throw new Error(err?.detail || 'Failed to create volunteer');
    }
    return response.json();
  },

  // Update volunteer
  update: async (id: string, data: VolunteerUpdate): Promise<Volunteer> => {
    const response = await fetch(`${API_BASE}/volunteers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update volunteer');
    return response.json();
  },

  // Delete volunteer
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/volunteers/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete volunteer');
  },

  // Get volunteers by health status
  getByHealthStatus: async (
    status: 'Healthy' | 'Warning' | 'At-Risk'
  ): Promise<VolunteerHealthStatus[]> => {
    const response = await fetch(
      `${API_BASE}/volunteers/health?status_filter=${status}`
    );
    if (!response.ok) throw new Error('Failed to fetch volunteers by health');
    return response.json();
  },
};

// ============================================================================
// CAMPAIGN API (Backend calls them "tasks")
// ============================================================================

export const campaignApi = {
  // Get all campaigns
  getAll: async (): Promise<Campaign[]> => {
    const response = await fetch(`${API_BASE}/tasks`);
    if (!response.ok) throw new Error('Failed to fetch campaigns');
    return response.json();
  },

  // Get single campaign by ID
  getById: async (id: string): Promise<Campaign> => {
    const response = await fetch(`${API_BASE}/tasks/${id}`);
    if (!response.ok) throw new Error('Failed to fetch campaign');
    return response.json();
  },

  // Create new campaign
  create: async (data: CampaignCreate): Promise<Campaign> => {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create campaign');
    return response.json();
  },

  // Update campaign
  update: async (id: string, data: CampaignUpdate): Promise<Campaign> => {
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update campaign');
    return response.json();
  },

  // Delete campaign
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete campaign');
  },

  // Find matching volunteers for a campaign
  findMatches: async (
    id: string,
    minSimilarity: number = 0.5
  ): Promise<VolunteerMatch[]> => {
    const response = await fetch(
      `${API_BASE}/tasks/${id}/matches?match_threshold=${minSimilarity}`
    );
    if (!response.ok) throw new Error('Failed to find matches');
    return response.json();
  },
};

// ============================================================================
// ACTIVITY API
// ============================================================================

export const activityApi = {
  // Get all activities
  getAll: async (): Promise<Activity[]> => {
    const response = await fetch(`${API_BASE}/activities`);
    if (!response.ok) throw new Error('Failed to fetch activities');
    return response.json();
  },

  // Get activities for a volunteer
  getByVolunteer: async (volunteerId: string): Promise<Activity[]> => {
    const response = await fetch(
      `${API_BASE}/activities?volunteer_id=${volunteerId}`
    );
    if (!response.ok) throw new Error('Failed to fetch activities');
    return response.json();
  },

  // Create new activity
  create: async (data: ActivityCreate): Promise<Activity> => {
    const response = await fetch(`${API_BASE}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create activity');
    return response.json();
  },

  // Delete activity
  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/activities/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete activity');
  },
};

// ============================================================================
// STATISTICS API
// ============================================================================

export const statsApi = {
  // Get overall statistics
  getStats: async (): Promise<Stats> => {
    const response = await fetch(`${API_BASE}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },
};

// ============================================================================
// DOCUMENT API (S3 Storage)
// ============================================================================

export interface DocumentFile {
  s3_key: string;
  filename: string;
  size: number;
  last_modified: string;
}

export interface DocumentListResponse {
  coordinator_email: string;
  files: DocumentFile[];
  count: number;
}

export const documentApi = {
  // Upload document
  upload: async (coordinatorEmail: string, file: File): Promise<{ message: string; filename: string; s3_key: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE}/documents/upload?coordinator_email=${encodeURIComponent(coordinatorEmail)}`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.detail || 'Failed to upload document');
    }
    return response.json();
  },

  // List documents
  list: async (coordinatorEmail: string): Promise<DocumentListResponse> => {
    const response = await fetch(`${API_BASE}/documents/list?coordinator_email=${encodeURIComponent(coordinatorEmail)}`);
    if (!response.ok) throw new Error('Failed to fetch documents');
    return response.json();
  },

  // Download document (returns blob URL)
  download: async (s3Key: string): Promise<string> => {
    const response = await fetch(`${API_BASE}/documents/download/${encodeURIComponent(s3Key)}`);
    if (!response.ok) throw new Error('Failed to download document');
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },

  // Delete document
  delete: async (s3Key: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/documents/${encodeURIComponent(s3Key)}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete document');
    return response.json();
  },
};

// ============================================================================
// CHATBOT API (Gemini AI)
// ============================================================================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  message: string;
}

export const chatbotApi = {
  // Send message to chatbot
  chat: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await fetch(`${API_BASE}/chatbot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.detail || 'Failed to get AI response');
    }
    return response.json();
  },

  // Check chatbot health
  health: async (): Promise<{ status: string; message: string }> => {
    const response = await fetch(`${API_BASE}/chatbot/health`);
    if (!response.ok) throw new Error('Failed to check chatbot health');
    return response.json();
  },
};

// ============================================================================
// NOTES API (Redis Storage)
// ============================================================================

export interface Note {
  id: string;
  coordinator_email: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  pinned: boolean;
}

export interface CreateNoteRequest {
  coordinator_email: string;
  content: string;
  tags: string[];
}

export interface UpdateNoteRequest {
  content?: string;
  tags?: string[];
  pinned?: boolean;
}

export const notesApi = {
  // Create note
  create: async (coordinatorEmail: string, content: string, tags: string[]): Promise<Note> => {
    const response = await fetch(`${API_BASE}/notes/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coordinator_email: coordinatorEmail,
        content,
        tags,
      }),
    });
    
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.detail || 'Failed to create note');
    }
    return response.json();
  },

  // Get all notes (optionally filtered by tag)
  getAll: async (coordinatorEmail: string, tag?: string): Promise<Note[]> => {
    const url = tag
      ? `${API_BASE}/notes/?coordinator_email=${encodeURIComponent(coordinatorEmail)}&tag=${encodeURIComponent(tag)}`
      : `${API_BASE}/notes/?coordinator_email=${encodeURIComponent(coordinatorEmail)}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch notes');
    return response.json();
  },

  // Search notes
  search: async (coordinatorEmail: string, query: string): Promise<Note[]> => {
    const response = await fetch(
      `${API_BASE}/notes/search?coordinator_email=${encodeURIComponent(coordinatorEmail)}&q=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error('Failed to search notes');
    return response.json();
  },

  // Get all tags
  getTags: async (coordinatorEmail: string): Promise<{ tags: string[] }> => {
    const response = await fetch(`${API_BASE}/notes/tags?coordinator_email=${encodeURIComponent(coordinatorEmail)}`);
    if (!response.ok) throw new Error('Failed to fetch tags');
    return response.json();
  },

  // Update note
  update: async (noteId: string, content?: string, tags?: string[], pinned?: boolean): Promise<Note> => {
    const response = await fetch(`${API_BASE}/notes/${encodeURIComponent(noteId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, tags, pinned }),
    });
    
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.detail || 'Failed to update note');
    }
    return response.json();
  },

  // Delete note
  delete: async (noteId: string, coordinatorEmail: string): Promise<{ message: string }> => {
    const response = await fetch(
      `${API_BASE}/notes/${encodeURIComponent(noteId)}?coordinator_email=${encodeURIComponent(coordinatorEmail)}`,
      { method: 'DELETE' }
    );
    if (!response.ok) throw new Error('Failed to delete note');
    return response.json();
  },

  // Health check
  health: async (): Promise<{ status: string; redis: string }> => {
    const response = await fetch(`${API_BASE}/notes/health`);
    if (!response.ok) throw new Error('Failed to check notes health');
    return response.json();
  },
};

// ============================================================================
// EMAIL API (Resend)
// ============================================================================

export const emailApi = {
  // Send custom email
  sendCustom: async (data: { to_emails: string[]; subject: string; html_content: string }): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/emails/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.detail || 'Failed to send email');
    }
    return response.json();
  },

  // Send template email
  sendTemplate: async (data: {
    to_emails: string[];
    template: string;
    volunteer_name?: string;
    custom_message?: string;
    event_name?: string;
  }): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/emails/send-template`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => null);
      throw new Error(err?.detail || 'Failed to send template email');
    }
    return response.json();
  },

  // Get available templates
  getTemplates: async (): Promise<{ templates: Array<{ id: string; name: string; description: string }> }> => {
    const response = await fetch(`${API_BASE}/emails/templates`);
    if (!response.ok) throw new Error('Failed to fetch templates');
    return response.json();
  },

  // Health check
  health: async (): Promise<{ status: string; provider: string; message: string }> => {
    const response = await fetch(`${API_BASE}/emails/health`);
    if (!response.ok) throw new Error('Failed to check email health');
    return response.json();
  },
};

