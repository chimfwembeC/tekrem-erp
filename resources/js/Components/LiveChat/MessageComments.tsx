import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
  MessageSquare,
  Send,
  Trash2,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import useRoute from '@/Hooks/useRoute';
import { ChatMessage, MessageComment } from '@/types/index';

interface MessageCommentsProps {
  message: ChatMessage;
  currentUserId: number;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function MessageComments({
  message,
  currentUserId,
  isOpen,
  onClose,
  onRefresh
}: MessageCommentsProps) {
  const route = useRoute();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(route('crm.livechat.messages.comments.store', message.id), {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: newComment.trim() }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Comment added successfully');
        setNewComment('');
        onRefresh(); // Refresh the conversation to show new comment
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add comment');
      }
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const response = await fetch(route('crm.livechat.comments.destroy', commentId), {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Comment deleted successfully');
        onRefresh(); // Refresh the conversation to remove deleted comment
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete comment');
      }
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments on Message
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Original Message */}
          <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm">{message.user?.name || 'Unknown User'}</span>
            </div>
            <p className="text-sm text-gray-700">{message.message}</p>
          </div>

          {/* Comments List */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {message.comments && message.comments.length > 0 ? (
              message.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{comment.user.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.created_at)}
                        </span>
                        {(comment.user.id === currentUserId) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{comment.comment}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              disabled={isSubmitting}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              size="sm"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
