import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import {
  History,
  X,
  Clock,
  User,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import useRoute from '@/Hooks/useRoute';
import { ChatMessage, MessageEditHistory as EditHistoryEntry } from '@/types/index';

interface EditHistoryData {
  original_message: string;
  current_message: string;
  edit_count: number;
  edit_history: EditHistoryEntry[];
  is_edited: boolean;
  edited_at: string | null;
}

interface MessageEditHistoryProps {
  message: ChatMessage;
  isOpen: boolean;
  onClose: () => void;
}

export default function MessageEditHistory({
  message,
  isOpen,
  onClose
}: MessageEditHistoryProps) {
  const route = useRoute();
  const [historyData, setHistoryData] = useState<EditHistoryData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && message.is_edited) {
      fetchEditHistory();
    }
  }, [isOpen, message.id]);

  const fetchEditHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(route('crm.livechat.messages.edit-history', message.id), {
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setHistoryData(result);
      } else {
        setError(result.error || 'Failed to load edit history');
      }
    } catch (error) {
      setError('Failed to load edit history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Message Edit History
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="ml-2">Loading edit history...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{error}</p>
            </div>
          ) : historyData ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{message.user?.name || 'Unknown User'}</span>
                  </div>
                  <Badge variant="outline" className="text-blue-600 border-blue-600">
                    {historyData.edit_count} {historyData.edit_count === 1 ? 'edit' : 'edits'}
                  </Badge>
                </div>
                {historyData.edited_at && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Clock className="h-4 w-4" />
                    Last edited {formatRelativeTime(historyData.edited_at)}
                  </div>
                )}
              </div>

              {/* Current Version */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    Current Version
                  </Badge>
                  {historyData.edited_at && (
                    <span className="text-xs text-gray-500">
                      {formatDate(historyData.edited_at)}
                    </span>
                  )}
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm">{historyData.current_message}</p>
                </div>
              </div>

              {/* Edit History */}
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <h4 className="font-medium text-gray-900">Edit History</h4>

                {historyData.edit_history.map((edit, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-gray-600">
                        Version {historyData.edit_history.length - index}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatDate(edit.edited_at)}
                      </span>
                      {edit.edited_by_user && (
                        <span className="text-xs text-gray-500">
                          by {edit.edited_by_user.name}
                        </span>
                      )}
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-700">{edit.previous_message}</p>
                    </div>
                  </div>
                ))}

                {/* Original Message */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-gray-600">
                      Original Message
                    </Badge>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-700">{historyData.original_message}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No edit history available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
