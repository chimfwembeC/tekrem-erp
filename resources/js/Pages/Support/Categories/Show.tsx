import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import {
  ArrowLeft,
  Edit,
  Ticket,
  Settings,
  Users,
  Clock,
  Target,
  TrendingUp,
  Calendar
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  is_active: boolean;
  sort_order: number;
  default_priority: string;
  created_at: string;
  updated_at: string;
  tickets_count: number;
  resolved_tickets_count: number;
  avg_resolution_time: number;
  default_sla_policy?: {
    id: number;
    name: string;
    response_time_hours: number;
    resolution_time_hours: number;
  };
  auto_assign_user?: {
    id: number;
    name: string;
  };
}

interface RecentTicket {
  id: number;
  ticket_number: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  requester?: {
    name: string;
  };
}

interface Props {
  category: Category;
  recentTickets: RecentTicket[];
  monthlyStats: Array<{
    month: string;
    tickets: number;
    resolved: number;
  }>;
}

export default function Show({ category, recentTickets, monthlyStats }: Props) {
  const { t } = useTranslate();
  const route = useRoute();

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

  const resolutionRate = category.tickets_count > 0 
    ? ((category.resolved_tickets_count / category.tickets_count) * 100).toFixed(1)
    : '0';

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <AppLayout>
      <Head title={`${t('support.category', 'Category')}: ${category.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={route('support.categories.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back', 'Back')}
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <h1 className="text-3xl font-bold tracking-tight">
                  {category.name}
                </h1>
                <Badge variant={category.is_active ? 'default' : 'secondary'}>
                  {category.is_active ? t('support.active', 'Active') : t('support.inactive', 'Inactive')}
                </Badge>
              </div>
              {category.description && (
                <p className="text-muted-foreground">{category.description}</p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={route('support.categories.edit', category.id)}>
              <Edit className="h-4 w-4 mr-2" />
              {t('common.edit', 'Edit')}
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('support.total_tickets', 'Total Tickets')}
              </CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{category.tickets_count}</div>
              <p className="text-xs text-muted-foreground">
                {category.resolved_tickets_count} resolved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('support.resolution_rate', 'Resolution Rate')}
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resolutionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {t('support.of_total_tickets', 'of total tickets')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('support.avg_resolution_time', 'Avg Resolution Time')}
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(category.avg_resolution_time)}</div>
              <p className="text-xs text-muted-foreground">
                {t('support.average_time', 'average time')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('support.default_priority', 'Default Priority')}
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge className={getPriorityColor(category.default_priority)} variant="secondary">
                {category.default_priority}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {t('support.for_new_tickets', 'for new tickets')}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Category Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Tickets */}
            <Card>
              <CardHeader>
                <CardTitle>{t('support.recent_tickets', 'Recent Tickets')}</CardTitle>
                <CardDescription>
                  {t('support.latest_tickets_in_category', 'Latest tickets in this category')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTickets.length > 0 ? recentTickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">#{ticket.ticket_number}</span>
                          <Badge className={getStatusColor(ticket.status)} variant="secondary">
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(ticket.priority)} variant="secondary">
                            {ticket.priority}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm leading-tight">{ticket.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {ticket.requester?.name} • {new Date(ticket.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={route('support.tickets.show', ticket.id)}>
                          {t('common.view', 'View')}
                        </Link>
                      </Button>
                    </div>
                  )) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Ticket className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{t('support.no_tickets_in_category', 'No tickets in this category yet')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>{t('support.monthly_statistics', 'Monthly Statistics')}</CardTitle>
                <CardDescription>
                  {t('support.ticket_trends', 'Ticket creation and resolution trends')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monthlyStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{stat.month}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{stat.tickets}</div>
                          <div className="text-xs text-muted-foreground">Created</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-green-600">{stat.resolved}</div>
                          <div className="text-xs text-muted-foreground">Resolved</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">
                            {stat.tickets > 0 ? ((stat.resolved / stat.tickets) * 100).toFixed(0) : 0}%
                          </div>
                          <div className="text-xs text-muted-foreground">Rate</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Category Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{t('support.category_settings', 'Category Settings')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('support.sort_order', 'Sort Order')}</span>
                    <span className="font-medium">{category.sort_order}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('support.status', 'Status')}</span>
                    <Badge variant={category.is_active ? 'default' : 'secondary'}>
                      {category.is_active ? t('support.active', 'Active') : t('support.inactive', 'Inactive')}
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('support.default_priority', 'Default Priority')}</span>
                    <Badge className={getPriorityColor(category.default_priority)} variant="secondary">
                      {category.default_priority}
                    </Badge>
                  </div>

                  {category.default_sla_policy && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('support.default_sla', 'Default SLA')}</span>
                      <span className="font-medium">{category.default_sla_policy.name}</span>
                    </div>
                  )}

                  {category.auto_assign_user && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('support.auto_assign', 'Auto Assign')}</span>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span className="font-medium">{category.auto_assign_user.name}</span>
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('support.created', 'Created')}</span>
                    <span className="font-medium">{new Date(category.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('support.updated', 'Updated')}</span>
                    <span className="font-medium">{new Date(category.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('support.quick_actions', 'Quick Actions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={route('support.tickets.create', { category_id: category.id })}>
                    <Ticket className="h-4 w-4 mr-2" />
                    {t('support.create_ticket', 'Create Ticket')}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={route('support.tickets.index', { category_id: category.id })}>
                    {t('support.view_all_tickets', 'View All Tickets')}
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={route('support.categories.edit', category.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {t('support.edit_category', 'Edit Category')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
