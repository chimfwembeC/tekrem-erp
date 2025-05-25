import React from 'react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/Components/ui/tooltip';
import { toast } from 'sonner';
import useRoute from '@/Hooks/useRoute';

interface Reaction {
  emoji: string;
  users: number[];
  count: number;
}

interface MessageReactionsProps {
  messageId: number;
  reactions: Reaction[];
  currentUserId: number;
  onRefresh: () => void;
  style?: 'default' | 'whatsapp';
  position?: 'left' | 'right';
}

export default function MessageReactions({
  messageId,
  reactions,
  currentUserId,
  onRefresh,
  style = 'default',
  position = 'left'
}: MessageReactionsProps) {
  const route = useRoute();

  // Always render the container, but only show reactions if they exist
  if (!reactions || reactions.length === 0) {
    return <div className="flex flex-wrap gap-1 mt-1 min-h-[1px]" />; // Invisible placeholder
  }

  const handleReactionClick = async (emoji: string) => {
    try {
      // Check if user already reacted with this emoji
      const reaction = reactions.find(r => r.emoji === emoji);
      const hasReacted = reaction?.users.includes(currentUserId);

      const url = route('crm.livechat.messages.react', messageId);
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
        toast.success(hasReacted ? 'Reaction removed' : 'Reaction added');
        onRefresh(); // Refresh the conversation to show updated reactions
      } else {
        throw new Error('Failed to update reaction');
      }
    } catch (error) {
      toast.error('Failed to update reaction');
    }
  };

  const getUserNames = (userIds: number[]): string => {
    // In a real app, you'd have access to user data to show names
    // For now, we'll just show the count
    if (userIds.length === 1) {
      return userIds.includes(currentUserId) ? 'You' : '1 person';
    } else if (userIds.length === 2 && userIds.includes(currentUserId)) {
      return 'You and 1 other';
    } else if (userIds.includes(currentUserId)) {
      return `You and ${userIds.length - 1} others`;
    } else {
      return `${userIds.length} people`;
    }
  };

  // WhatsApp-style positioning
  if (style === 'whatsapp') {
    return (
      <div className={`absolute -bottom-2 ${position === 'right' ? 'right-2' : 'left-2'} z-10`}>
        <div className="flex flex-wrap gap-1 bg-white dark:bg-gray-800 rounded-full px-2 py-1 shadow-lg border border-gray-200 dark:border-gray-700">
          {reactions.map((reaction) => {
            const hasUserReacted = reaction.users.includes(currentUserId);

            return (
              <TooltipProvider key={reaction.emoji}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className={`flex items-center gap-1 rounded-full px-1 py-0.5 transition-colors text-xs ${
                        hasUserReacted
                          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => handleReactionClick(reaction.emoji)}
                    >
                      <span className="text-sm">{reaction.emoji}</span>
                      <span className={`text-xs font-medium ${hasUserReacted ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>
                        {reaction.count}
                      </span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">
                      {getUserNames(reaction.users)} reacted with {reaction.emoji}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
    );
  }

  // Default style
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {reactions.map((reaction) => {
        const hasUserReacted = reaction.users.includes(currentUserId);

        return (
          <TooltipProvider key={reaction.emoji}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 px-2 py-0 text-xs rounded-full border transition-colors ${
                    hasUserReacted
                      ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => handleReactionClick(reaction.emoji)}
                >
                  <span className="mr-1">{reaction.emoji}</span>
                  <span className="text-xs">{reaction.count}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">
                  {getUserNames(reaction.users)} reacted with {reaction.emoji}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}
