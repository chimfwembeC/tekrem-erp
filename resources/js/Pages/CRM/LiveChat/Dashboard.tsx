import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import {
  MessageCircle,
  Search,
  Filter,
  Plus,
  Archive,
  Clock,
  User,
  Users,
  AlertCircle,
  CheckCircle2,
  Circle,
  MessageSquare,
  Bell
} from 'lucide-react';
import { Conversation, InertiaSharedProps } from '@/types/index';
import useRoute from '@/Hooks/useRoute';

interface LiveChatDashboardProps extends InertiaSharedProps {
  conversations: {
    data: Conversation[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  unreadCount: number;
  filters: {
    status?: string;
    priority?: string;
    search?: string;
    assigned_to_me?: boolean;
  };
  userRole: string;
}

export default function LiveChatDashboard({
  conversations,
  unreadCount,
  filters,
  userRole
}: LiveChatDashboardProps) {
  const route = useRoute();
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || 'all');
  const [priority, setPriority] = useState(filters.priority || 'all');
  const [assignedToMe, setAssignedToMe] = useState(filters.assigned_to_me || false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('crm.livechat.index'), {
      search,
      status: status === 'all' ? '' : status,
      priority: priority === 'all' ? '' : priority,
      assigned_to_me: assignedToMe
    }, { preserveState: true });
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('all');
    setPriority('all');
    setAssignedToMe(false);
    router.get(route('crm.livechat.index'));
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <Circle className="h-4 w-4 text-orange-500" />;
      case 'normal':
        return <Circle className="h-4 w-4 text-blue-500" />;
      case 'low':
        return <Circle className="h-4 w-4 text-gray-400" />;
      default:
        return <Circle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      archived: "secondary",
      closed: "destructive"
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatLastMessage = (conversation: Conversation) => {
    if (!conversation.latest_message) return 'No messages yet';

    const message = conversation.latest_message;
    if (!message || !message.message) return 'No messages yet';

    const time = new Date(message.created_at).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const messageText = typeof message.message === 'string' ? message.message : '';
    return `${time} - ${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}`;
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') {
      return 'U';
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <AppLayout
      title="Chat"
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-blue-600" />
              <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                Chat
              </h2>
            </div>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Bell className="h-3 w-3" />
                {unreadCount} unread
              </Badge>
            )}
          </div>
          {userRole !== 'customer' && (
            <Button onClick={() => router.get(route('crm.livechat.find-or-create'))}>
              <Plus className="h-4 w-4 mr-2" />
              New Conversation
            </Button>
          )}
        </div>
      )}
    >
      <Head title="Chat" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      type="text"
                      placeholder="Search conversations..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="min-w-[150px]">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-[150px]">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {userRole !== 'customer' && (
                  <div className="flex items-end">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={assignedToMe}
                        onChange={(e) => setAssignedToMe(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Assigned to me</span>
                    </label>
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <Button type="submit">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button type="button" variant="outline" onClick={handleClearFilters}>
                    Clear
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Conversations List */}
          <Card>
            <CardHeader>
              <CardTitle>Conversations ({conversations.total})</CardTitle>
              <CardDescription>
                Professional chat system for customer communication and team collaboration
              </CardDescription>
            </CardHeader>
            <CardContent>
              {conversations.data.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No conversations found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {userRole === 'customer'
                      ? 'Start a conversation with our support team.'
                      : 'Get started by creating your first conversation.'
                    }
                  </p>
                  {userRole !== 'customer' && (
                    <Button onClick={() => router.get(route('crm.livechat.create'))}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Conversation
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {conversations.data.map((conversation) => (
                    <div
                      key={conversation.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => router.get(route('crm.livechat.show', conversation.id))}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.conversable?.avatar} />
                            <AvatarFallback>
                              {conversation.conversable ?
                                getInitials(conversation.conversable.name || 'Unknown') :
                                getInitials(conversation.creator?.name || 'Unknown')
                              }
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                {conversation.display_title || conversation.title || `Conversation #${conversation.id}`}
                              </h4>
                              {getPriorityIcon(conversation.priority)}
                              {getStatusBadge(conversation.status)}
                              {conversation.unread_count > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {conversation.unread_count}
                                </Badge>
                              )}
                            </div>

                            {conversation.conversable && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                {conversation.conversable.name || 'Unknown'} ({conversation.conversable.email || 'No email'})
                              </p>
                            )}

                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {formatLastMessage(conversation)}
                            </p>

                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              {conversation.assignee && (
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {conversation.assignee.name || 'Unknown'}
                                </span>
                              )}
                              {conversation.participant_users && conversation.participant_users.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  {conversation.participant_users.length} participants
                                </span>
                              )}
                              {conversation.last_message_at && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(conversation.last_message_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {conversation.status === 'active' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : conversation.status === 'archived' ? (
                            <Archive className="h-5 w-5 text-gray-500" />
                          ) : (
                            <Circle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {conversations.last_page > 1 && (
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {conversations.from} to {conversations.to} of {conversations.total} conversations
                  </div>
                  <div className="flex gap-1">
                    {conversations.links.map((link, i) => {
                      if (link.url === null) {
                        return (
                          <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            disabled
                            dangerouslySetInnerHTML={{ __html: link.label }}
                          />
                        );
                      }

                      return (
                        <Link key={i} href={link.url}>
                          <Button
                            variant={link.active ? "default" : "outline"}
                            size="sm"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
