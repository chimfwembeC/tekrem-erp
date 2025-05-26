import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import AISuggestions from '@/Components/Support/AISuggestions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Separator } from '@/Components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import {
  ArrowLeft,
  Edit,
  MessageSquare,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Send,
  Paperclip,
  Bot,
  Calendar,
  Building
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface TicketData {
  id: number;
  ticket_number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  resolved_at?: string;
  closed_at?: string;
  satisfaction_rating?: number;
  satisfaction_feedback?: string;
  tags?: string[];
  escalation_level: number;
  category?: {
    id: number;
    name: string;
    color: string;
  };
  assigned_to?: {
    id: number;
    name: string;
  };
  created_by: {
    id: number;
    name: string;
  };
  requester?: {
    name: string;
  };
  sla_policy?: {
    id: number;
    name: string;
    response_time_hours: number;
    resolution_time_hours: number;
  };
}

interface Comment {
  id: number;
  content: string;
  is_internal: boolean;
  is_solution: boolean;
  created_at: string;
  time_spent_minutes?: number;
  user: {
    id: number;
    name: string;
  };
  attachments?: Array<{
    name: string;
    path: string;
    size: number;
    type: string;
  }>;
}

interface User {
  id: number;
  name: string;
}

interface PaginatedComments {
  data: Comment[];
  links: any;
  meta?: any;
}

interface Props {
  ticket: TicketData;
  users: User[];
  comments: PaginatedComments;
}

export default function Show({ ticket, users, comments }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [aiSuggestions, setAISuggestions] = useState<string>('');

  const { data, setData, post, processing, reset } = useForm({
    content: '',
    is_internal: false,
    is_solution: false,
    time_spent_minutes: '',
    attachments: [] as File[],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = () => {
    return ticket.due_date && new Date(ticket.due_date) < new Date() &&
           !['resolved', 'closed'].includes(ticket.status);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('content', data.content);
    formData.append('is_internal', data.is_internal ? '1' : '0');
    formData.append('is_solution', data.is_solution ? '1' : '0');
    if (data.time_spent_minutes) {
      formData.append('time_spent_minutes', data.time_spent_minutes);
    }

    data.attachments.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file);
    });

    router.post(route('support.tickets.comments.store', ticket.id), formData, {
      forceFormData: true,
      onSuccess: () => {
        reset();
        // Refresh the page to show new comment
        router.reload();
      },
    });
  };

  const handleAssign = (userId: string) => {
    router.post(route('support.tickets.assign', ticket.id), {
      assigned_to: userId,
    });
  };

  const handleStatusChange = (status: string) => {
    if (status === 'closed') {
      const reason = prompt(t('support.close_reason', 'Please provide a reason for closing this ticket:'));
      if (reason) {
        router.post(route('support.tickets.close', ticket.id), {
          resolution_notes: reason,
        });
      }
    } else if (status === 'reopen') {
      const reason = prompt(t('support.reopen_reason', 'Please provide a reason for reopening this ticket:'));
      if (reason) {
        router.post(route('support.tickets.reopen', ticket.id), {
          reason: reason,
        });
      }
    }
  };

  const getAISuggestions = async () => {
    setShowAISuggestions(true);
    try {
      const response = await fetch(route('support.tickets.ai-suggestions'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          ticket_id: ticket.id,
        }),
      });

      const result = await response.json();
      if (result.suggestions) {
        setAISuggestions(result.suggestions);
      } else {
        setAISuggestions(t('support.ai_suggestions_error', 'Unable to generate suggestions at this time.'));
      }
    } catch (error) {
      setAISuggestions(t('support.ai_suggestions_error', 'Unable to generate suggestions at this time.'));
    }
  };

  return (
    <AppLayout>
      <Head title={`${t('support.ticket', 'Ticket')} #${ticket.ticket_number}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={route('support.tickets.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back', 'Back')}
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  #{ticket.ticket_number}
                </h1>
                <Badge className={getStatusColor(ticket.status)} variant="secondary">
                  {ticket.status.replace('_', ' ')}
                </Badge>
                <Badge className={getPriorityColor(ticket.priority)} variant="secondary">
                  {ticket.priority}
                </Badge>
                {isOverdue() && (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>
              <h2 className="text-xl text-muted-foreground">{ticket.title}</h2>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={getAISuggestions}>
              <Bot className="h-4 w-4 mr-2" />
              {t('support.ai_suggestions', 'AI Suggestions')}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={route('support.tickets.edit', ticket.id)}>
                <Edit className="h-4 w-4 mr-2" />
                {t('common.edit', 'Edit')}
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Description */}
            <Card>
              <CardHeader>
                <CardTitle>{t('support.description', 'Description')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{ticket.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            {showAISuggestions && (
              <AISuggestions
                ticketId={ticket.id}
                onApplySuggestion={(suggestion) => {
                  setData('content', suggestion);
                }}
              />
            )}

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {t('support.comments', 'Comments')} ({comments.data.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {comments.data.map((comment) => (
                  <div key={comment.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {comment.user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{comment.user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(comment.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {comment.is_internal && (
                          <Badge variant="secondary" className="text-xs">
                            Internal
                          </Badge>
                        )}
                        {comment.is_solution && (
                          <Badge variant="default" className="text-xs">
                            Solution
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap">{comment.content}</p>
                    </div>
                    {comment.time_spent_minutes && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {comment.time_spent_minutes} minutes
                      </div>
                    )}
                    {comment.attachments && comment.attachments.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium mb-1">Attachments:</p>
                        {comment.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Paperclip className="h-3 w-3" />
                            <a
                              href={`/storage/${attachment.path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {attachment.name}
                            </a>
                            <span className="text-muted-foreground">
                              ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {comments.data.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>{t('support.no_comments', 'No comments yet')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Add Comment */}
            <Card>
              <CardHeader>
                <CardTitle>{t('support.add_comment', 'Add Comment')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddComment} className="space-y-4">
                  <Textarea
                    value={data.content}
                    onChange={(e) => setData('content', e.target.value)}
                    placeholder={t('support.comment_placeholder', 'Add your comment...')}
                    rows={4}
                    required
                  />

                  <div className="flex gap-4 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={data.is_internal}
                        onChange={(e) => setData('is_internal', e.target.checked)}
                      />
                      {t('support.internal_comment', 'Internal comment')}
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={data.is_solution}
                        onChange={(e) => setData('is_solution', e.target.checked)}
                      />
                      {t('support.mark_as_solution', 'Mark as solution')}
                    </label>
                  </div>

                  <Button type="submit" disabled={processing}>
                    <Send className="h-4 w-4 mr-2" />
                    {processing ? t('common.sending', 'Sending...') : t('support.add_comment', 'Add Comment')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t('support.ticket_info', 'Ticket Information')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">{t('support.status', 'Status')}</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(ticket.status)} variant="secondary">
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                    {ticket.status === 'closed' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange('reopen')}
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reopen
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange('closed')}
                      >
                        <XCircle className="h-3 w-3 mr-1" />
                        Close
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">{t('support.assigned_to', 'Assigned To')}</Label>
                  <Select
                    value={ticket.assigned_to?.id.toString() || ''}
                    onValueChange={handleAssign}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('support.unassigned', 'Unassigned')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t('support.unassigned', 'Unassigned')}</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('support.created', 'Created')}</span>
                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>

                  {ticket.due_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('support.due_date', 'Due Date')}</span>
                      <span className={isOverdue() ? 'text-red-600 font-medium' : ''}>
                        {new Date(ticket.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('support.created_by', 'Created By')}</span>
                    <span>{ticket.created_by.name}</span>
                  </div>

                  {ticket.requester && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('support.requester', 'Requester')}</span>
                      <span>{ticket.requester.name}</span>
                    </div>
                  )}

                  {ticket.category && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('support.category', 'Category')}</span>
                      <div className="flex items-center gap-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: ticket.category.color }}
                        />
                        <span>{ticket.category.name}</span>
                      </div>
                    </div>
                  )}

                  {ticket.sla_policy && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('support.sla', 'SLA')}</span>
                      <span>{ticket.sla_policy.name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
