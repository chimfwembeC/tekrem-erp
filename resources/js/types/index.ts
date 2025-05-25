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
