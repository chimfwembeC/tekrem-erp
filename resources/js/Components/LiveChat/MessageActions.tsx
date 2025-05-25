import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import {
  MoreHorizontal,
  MessageSquare,
  Pin,
  PinOff,
  Smile,
  Reply,
  Edit,
  History
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/Components/ui/popover';
import { toast } from 'sonner';
import useRoute from '@/Hooks/useRoute';
import { ChatMessage } from '@/types/index';

interface MessageActionsProps {
  message: ChatMessage;
  currentUserId: number;
  onReply: (message: ChatMessage) => void;
  onShowComments: (message: ChatMessage) => void;
  onEdit: (message: ChatMessage) => void;
  onShowEditHistory: (message: ChatMessage) => void;
  onRefresh: () => void;
}

export default function MessageActions({
  message,
  currentUserId,
  onReply,
  onShowComments,
  onEdit,
  onShowEditHistory,
  onRefresh
}: MessageActionsProps) {
  const route = useRoute();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Common emojis for quick reactions
  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉'];

  // Check if user can edit this message
  const canEdit = message.user?.id === currentUserId &&
                  message.message_type !== 'system' &&
                  new Date(message.created_at).getTime() > Date.now() - (15 * 60 * 1000); // 15 minutes

  // Get the emoji the user has already reacted with (if any)
  const getUserReactionEmoji = (): string | null => {
    if (!message.reactions) return null;

    for (const reaction of message.reactions) {
      if (reaction.users.includes(currentUserId)) {
        return reaction.emoji;
      }
    }
    return null;
  };

  const userReactionEmoji = getUserReactionEmoji();

  const handleReaction = async (emoji: string) => {
    try {
      // Check if user already reacted with this emoji
      const hasReacted = message.reactions?.some(reaction =>
        reaction.emoji === emoji && reaction.users.includes(currentUserId)
      );

      const url = route('crm.livechat.messages.react', message.id);
      const method = hasReacted ? 'DELETE' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emoji }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(hasReacted ? 'Reaction removed' : 'Reaction changed');
        onRefresh(); // Refresh the conversation to show updated reactions
      } else {
        throw new Error('Failed to update reaction');
      }
    } catch (error) {
      toast.error('Failed to update reaction');
    }
    setShowEmojiPicker(false);
  };

  const handlePin = async () => {
    try {
      const url = message.is_pinned
        ? route('crm.livechat.messages.unpin', message.id)
        : route('crm.livechat.messages.pin', message.id);

      const method = message.is_pinned ? 'DELETE' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        onRefresh(); // Refresh the conversation to show updated pin status
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update pin status');
      }
    } catch (error) {
      toast.error('Failed to update pin status');
    }
  };

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      {/* Quick Reaction Button */}
      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Smile className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          {userReactionEmoji && (
            <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
              You reacted with {userReactionEmoji}. Click another emoji to change your reaction.
            </div>
          )}
          <div className="grid grid-cols-4 gap-1">
            {quickEmojis.map((emoji) => {
              const isUserReaction = userReactionEmoji === emoji;
              return (
                <Button
                  key={emoji}
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 text-lg transition-colors ${
                    isUserReaction
                      ? 'bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => handleReaction(emoji)}
                  title={isUserReaction ? 'Remove your reaction' : 'React with this emoji'}
                >
                  {emoji}
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Reply Button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={() => onReply(message)}
      >
        <Reply className="h-3 w-3" />
      </Button>

      {/* More Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {canEdit && (
            <>
              <DropdownMenuItem onClick={() => onEdit(message)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Message
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuItem onClick={() => onShowComments(message)}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Comments ({message.comments?.length || 0})
          </DropdownMenuItem>

          {message.is_edited && (
            <DropdownMenuItem onClick={() => onShowEditHistory(message)}>
              <History className="h-4 w-4 mr-2" />
              Edit History ({message.is_edited ? 'edited' : ''})
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handlePin}>
            {message.is_pinned ? (
              <>
                <PinOff className="h-4 w-4 mr-2" />
                Unpin Message
              </>
            ) : (
              <>
                <Pin className="h-4 w-4 mr-2" />
                Pin Message
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
