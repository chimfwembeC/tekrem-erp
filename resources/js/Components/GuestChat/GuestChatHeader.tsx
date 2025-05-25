import React from 'react';
import { X, Minimize2, Maximize2, Settings, MessageCircle } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { CardHeader } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';

interface GuestSession {
  id: number;
  session_id: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  inquiry_type: string;
  display_name: string;
}

interface Conversation {
  id: number;
  title: string;
  status: string;
  assignee?: {
    id: number;
    name: string;
  } | null;
}

interface GuestChatHeaderProps {
  guestSession: GuestSession | null;
  conversation: Conversation | null;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onClose: () => void;
  onShowGuestForm: () => void;
}

export default function GuestChatHeader({
  guestSession,
  conversation,
  isMinimized,
  onToggleMinimize,
  onClose,
  onShowGuestForm,
}: GuestChatHeaderProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'closed':
        return 'bg-red-500';
      case 'archived':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getInquiryTypeColor = (type: string) => {
    switch (type) {
      case 'support':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'sales':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'general':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getInquiryTypeLabel = (type: string) => {
    switch (type) {
      case 'support':
        return 'Support';
      case 'sales':
        return 'Sales';
      case 'general':
        return 'General';
      default:
        return 'General';
    }
  };

  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary text-primary-foreground">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        {/* Company Logo/Icon */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-4 h-4" />
          </div>
        </div>

        {/* Chat Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-sm truncate">
              TekRem Support
            </h3>
            {conversation?.status && (
              <div className={`w-2 h-2 rounded-full ${getStatusColor(conversation.status)}`} />
            )}
          </div>
          
          {!isMinimized && (
            <div className="flex items-center space-x-2 mt-1">
              {guestSession && (
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getInquiryTypeColor(guestSession.inquiry_type)}`}
                >
                  {getInquiryTypeLabel(guestSession.inquiry_type)}
                </Badge>
              )}
              
              {conversation?.assignee ? (
                <span className="text-xs opacity-90 truncate">
                  with {conversation.assignee.name}
                </span>
              ) : (
                <span className="text-xs opacity-75">
                  Connecting...
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-1 flex-shrink-0">
        {!isMinimized && guestSession && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={onShowGuestForm}
            title="Update your information"
          >
            <Settings className="h-3 w-3" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
          onClick={onToggleMinimize}
          title={isMinimized ? "Expand chat" : "Minimize chat"}
        >
          {isMinimized ? (
            <Maximize2 className="h-3 w-3" />
          ) : (
            <Minimize2 className="h-3 w-3" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
          onClick={onClose}
          title="Close chat"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </CardHeader>
  );
}
