import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
  Edit,
  Save,
  X,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import useRoute from '@/Hooks/useRoute';
import { ChatMessage } from '@/types/index';

interface MessageEditProps {
  message: ChatMessage;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function MessageEdit({
  message,
  isOpen,
  onClose,
  onRefresh
}: MessageEditProps) {
  const route = useRoute();
  const [editedMessage, setEditedMessage] = useState(message.message);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when message changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setEditedMessage(message.message);
      setError(null);
    }
  }, [isOpen, message.message]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editedMessage.trim()) {
      setError('Message cannot be empty');
      return;
    }

    if (editedMessage.trim() === message.message) {
      setError('No changes detected');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(route('crm.livechat.messages.edit', message.id), {
        method: 'PUT',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: editedMessage.trim() }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Message edited successfully');
        onRefresh(); // Refresh the conversation to show edited message
        onClose();
      } else {
        setError(result.error || 'Failed to edit message');
      }
    } catch (error) {
      setError('Failed to edit message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setEditedMessage(message.message);
    setError(null);
    onClose();
  };

  const timeLeft = () => {
    const messageTime = new Date(message.created_at).getTime();
    const now = Date.now();
    const elapsed = now - messageTime;
    const timeLimit = 15 * 60 * 1000; // 15 minutes
    const remaining = timeLimit - elapsed;

    if (remaining <= 0) return 'Time expired';

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, '0')} remaining`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Message
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Time Limit Warning */}
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-700">
              You can edit messages within 15 minutes of posting. {timeLeft()}
            </span>
          </div>

          {/* Original Message Context */}
          <div className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm">{message.user?.name || 'Unknown User'}</span>
              <span className="text-xs text-gray-500">
                {new Date(message.created_at).toLocaleString()}
              </span>
              {message.is_edited && (
                <span className="text-xs text-gray-500 italic">(edited)</span>
              )}
            </div>
            <p className="text-sm text-gray-700 font-medium">Original:</p>
            <p className="text-sm text-gray-600">{message.message}</p>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="editMessage" className="text-sm font-medium">
                Edit your message:
              </label>
              <Textarea
                id="editMessage"
                value={editedMessage}
                onChange={(e) => {
                  setEditedMessage(e.target.value);
                  setError(null);
                }}
                placeholder="Type your message..."
                rows={4}
                disabled={isSubmitting}
                className="resize-none"
              />
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>

            {/* Character Count */}
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{editedMessage.length}/5000 characters</span>
              <span>
                {editedMessage.trim() === message.message ? 'No changes' : 'Modified'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !editedMessage.trim() || editedMessage.trim() === message.message}
                className="flex items-center gap-2"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
