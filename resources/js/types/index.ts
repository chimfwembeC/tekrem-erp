type DateTime = string;

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  profile_photo_url?: string;
  roles: string[];
}

export interface InertiaSharedProps {
  auth: {
    user: User | null;
  };
  settings?: Record<string, any>;
  flash?: {
    message?: string;
    success?: string;
    error?: string;
  };
  errors: Record<string, string>;
}

export interface AppRole {
  id: number;
  name: string;
  description: string | null;
  created_at: DateTime;
  updated_at: DateTime;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  description: string | null;
  created_at: DateTime;
  updated_at: DateTime;
  roles?: AppRole[];
}

export interface JetstreamRole {
  key: string;
  name: string;
  permissions: string[];
  description: string;
}


export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  active: boolean;
  permission: string | null;
}

export interface Communication {
  id: number;
  type: 'email' | 'call' | 'meeting' | 'note';
  content: string;
  subject: string | null;
  communication_date: string;
  direction: 'inbound' | 'outbound' | null;
  status: 'completed' | 'scheduled' | 'cancelled' | null;
  communicable_id: number;
  communicable_type: string;
  user_id: number | null;
  created_at: string;
  updated_at: string;
  user?: User;
  communicable?: Client | Lead;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  address: string | null;
  status: string;
  user_id: number | null;
  created_at: string;
  updated_at: string;
  user?: User;
  communications?: Communication[];
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  source: string | null;
  status: string;
  user_id: number | null;
  created_at: string;
  updated_at: string;
  user?: User;
  communications?: Communication[];
}

// Enhanced Chat/LiveChat Interfaces
export interface ChatMessage {
  id: number;
  conversation_id: number | null;
  message: string;
  message_type: 'text' | 'file' | 'image' | 'video' | 'audio';
  attachments: ChatAttachment[] | null;
  is_read: boolean;
  delivered_at: string | null;
  read_at: string | null;
  status: 'sent' | 'delivered' | 'read';
  reply_to_id: number | null;
  is_internal_note: boolean;
  metadata: Record<string, any> | null;
  chattable_id: number;
  chattable_type: string;
  user_id: number;
  recipient_id: number | null;
  created_at: string;
  updated_at: string;
  // Enhanced features
  reactions?: MessageReaction[] | null;
  is_pinned?: boolean;
  pinned_at?: string | null;
  pinned_by?: number | null;
  is_edited?: boolean;
  edited_at?: string | null;
  original_message?: string | null;
  edit_history?: MessageEditHistory[] | null;
  comments?: MessageComment[] | null;
  // Relations
  user?: User;
  recipient?: User;
  conversation?: Conversation;
  reply_to?: ChatMessage;
  replies?: ChatMessage[];
  pinned_by_user?: User;
  // Computed properties
  attachment_count?: number;
  type_icon?: string;
  status_color?: string;
}

export interface MessageReaction {
  emoji: string;
  users: number[];
  count: number;
}

export interface MessageEditHistory {
  previous_message: string;
  edited_by: number;
  edited_at: string;
  edited_by_user?: User;
}

export interface MessageComment {
  id: number;
  comment: string;
  user: {
    id: number;
    name: string;
  };
  created_at: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  thumbnail_url?: string;
  mime_type: string;
  uploaded_at: string;
}

export interface Conversation {
  id: number;
  title: string | null;
  conversable_type: string | null;
  conversable_id: number | null;
  created_by: number;
  assigned_to: number | null;
  status: 'active' | 'archived' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  participants: number[] | null;
  tags: string[] | null;
  last_message_at: string | null;
  unread_count: number;
  is_internal: boolean;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  conversable?: Client | Lead;
  creator?: User;
  assignee?: User;
  messages?: ChatMessage[];
  latest_message?: ChatMessage;
  participant_users?: User[];
  display_title?: string;
  status_color?: string;
  priority_color?: string;
}

export interface TypingIndicator {
  user_id: number;
  user_name: string;
  conversation_id: number;
  timestamp: string;
}

export interface ChatNotification {
  id: string;
  type: 'new_message' | 'message_read' | 'user_typing' | 'user_joined' | 'user_left';
  conversation_id: number;
  user_id: number;
  message?: ChatMessage;
  data?: Record<string, any>;
  timestamp: string;
}

// Projects Module Interfaces
export interface Project {
  id: number;
  name: string;
  description: string | null;
  status: 'draft' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string | null;
  start_date: string | null;
  end_date: string | null;
  deadline: string | null;
  budget: number | null;
  spent_amount: number;
  progress: number; // 0-100
  client_id: number | null;
  manager_id: number;
  team_members: number[] | null;
  tags: string[] | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  // Relations
  client?: Client;
  manager?: User;
  team?: User[];
  milestones?: ProjectMilestone[];
  files?: ProjectFile[];
  tasks?: ProjectTask[];
  project_tags?: Tag[];
  conversations?: Conversation[];
  expenses?: any[]; // Finance module integration
  invoices?: any[]; // Finance module integration
  // Computed properties
  status_color?: string;
  priority_color?: string;
  progress_color?: string;
  is_overdue?: boolean;
  days_remaining?: number;
  completion_percentage?: number;
}

export interface ProjectMilestone {
  id: number;
  project_id: number;
  name: string;
  description: string | null;
  due_date: string | null;
  completion_date: string | null;
  progress: number; // 0-100
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to: number | null;
  dependencies: number[] | null; // Array of milestone IDs
  order: number;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  // Relations
  project?: Project;
  assignee?: User;
  dependent_milestones?: ProjectMilestone[];
  blocking_milestones?: ProjectMilestone[];
  files?: ProjectFile[];
  // Computed properties
  status_color?: string;
  is_overdue?: boolean;
  days_remaining?: number;
  can_start?: boolean; // Based on dependencies
}

export interface ProjectFile {
  id: number;
  project_id: number;
  milestone_id: number | null;
  name: string;
  original_name: string;
  file_path: string;
  file_url: string;
  mime_type: string;
  file_size: number;
  category: 'document' | 'image' | 'contract' | 'design' | 'other';
  description: string | null;
  version: number;
  is_latest_version: boolean;
  uploaded_by: number;
  access_level: 'public' | 'team' | 'managers' | 'private';
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  // Relations
  project?: Project;
  milestone?: ProjectMilestone;
  uploader?: User;
  versions?: ProjectFile[]; // File version history
  // Computed properties
  file_icon?: string;
  file_size_formatted?: string;
  can_access?: boolean;
}

export interface ProjectTemplate {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  template_data: {
    milestones?: Partial<ProjectMilestone>[];
    default_team_roles?: string[];
    estimated_duration?: number; // in days
    default_budget?: number;
    required_files?: string[];
  };
  is_active: boolean;
  created_by: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
  // Relations
  creator?: User;
  projects?: Project[]; // Projects created from this template
}

export interface ProjectTimeLog {
  id: number;
  project_id: number;
  milestone_id: number | null;
  user_id: number;
  description: string | null;
  hours: number;
  log_date: string;
  is_billable: boolean;
  hourly_rate: number | null;
  status: 'draft' | 'submitted' | 'approved' | 'invoiced';
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  // Relations
  project?: Project;
  milestone?: ProjectMilestone;
  user?: User;
  // Computed properties
  total_amount?: number;
  status_color?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  color: string;
  description: string | null;
  type: 'project' | 'task' | 'general';
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
  // Relations
  creator?: User;
  projects?: Project[];
  tasks?: ProjectTask[];
  // Computed properties
  usage_count?: number;
}

export interface ProjectTask {
  id: number;
  project_id: number;
  milestone_id: number | null;
  title: string;
  description: string | null;
  type: 'task' | 'issue' | 'bug' | 'feature' | 'improvement';
  status: 'todo' | 'in-progress' | 'review' | 'testing' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to: number | null;
  created_by: number;
  due_date: string | null;
  start_date: string | null;
  completed_date: string | null;
  progress: number; // 0-100
  estimated_hours: number | null;
  actual_hours: number;
  dependencies: number[] | null; // Array of task IDs
  parent_task_id: number | null;
  order: number;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  // Relations
  project?: Project;
  milestone?: ProjectMilestone;
  assignee?: User;
  creator?: User;
  parent_task?: ProjectTask;
  subtasks?: ProjectTask[];
  tags?: Tag[];
  time_logs?: ProjectTimeLog[];
  // Computed properties
  status_color?: string;
  priority_color?: string;
  type_color?: string;
  is_overdue?: boolean;
  days_remaining?: number;
  can_start?: boolean;
}

export interface ProjectAnalytics {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  overdue_projects: number;
  total_budget: number;
  total_spent: number;
  average_completion_time: number;
  team_utilization: {
    user_id: number;
    user_name: string;
    active_projects: number;
    total_hours: number;
    utilization_percentage: number;
  }[];
  project_status_distribution: {
    status: string;
    count: number;
    percentage: number;
  }[];
  monthly_completion_trend: {
    month: string;
    completed: number;
    started: number;
  }[];
}

declare global {
  interface Window {
    Echo?: {
      private(channel: string): {
        listen(event: string, callback: (e: any) => void): any;
        stopListening(event: string): any;
      };
    };
  }
}
