import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Plus,
  Eye
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface SupportStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  overdueTickets: number;
  totalArticles: number;
  totalFAQs: number;
  avgResolutionTime: number;
  avgResponseTime: number;
  avgSatisfactionRating: number;
}

interface TicketPriority {
  priority: string;
  count: number;
}

interface TicketCategory {
  category_id: number;
  count: number;
  category?: {
    name: string;
    color: string;
  };
}

interface RecentTicket {
  id: number;
  ticket_number: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  category?: {
    name: string;
    color: string;
  };
  assigned_to?: {
    name: string;
  };
  requester?: {
    name: string;
  };
}

interface SLACompliance {
  name: string;
  compliance: number;
  tickets_count: number;
}

interface PopularArticle {
  id: number;
  title: string;
  view_count: number;
  helpful_count: number;
}

interface Props {
  stats: SupportStats;
  ticketsByPriority: TicketPriority[];
  ticketsByCategory: TicketCategory[];
  recentTickets: RecentTicket[];
  myTickets: RecentTicket[];
  overdueTickets: RecentTicket[];
  slaCompliance: SLACompliance[];
  popularArticles: PopularArticle[];
  satisfactionRatings: { satisfaction_rating: number; count: number }[];
}

export default function Dashboard({
  stats,
  ticketsByPriority,
  ticketsByCategory,
  recentTickets,
  myTickets,
  overdueTickets,
  slaCompliance,
  popularArticles,
  satisfactionRatings
}: Props) {
  const { t } = useTranslate();

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

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <AppLayout>
      <Head title={t('support.title', 'Support')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('support.title', 'Support')}</h1>
            <p className="text-muted-foreground">
              {t('support.dashboard_description', 'Manage support tickets and help customers')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/support/tickets/create">
                <Plus className="h-4 w-4 mr-2" />
                {t('support.create_ticket', 'Create Ticket')}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/support/knowledge-base/create">
                <BookOpen className="h-4 w-4 mr-2" />
                {t('support.create_article', 'Create Article')}
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('support.total_tickets', 'Total Tickets')}
              </CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTickets}</div>
              <div className="text-xs text-muted-foreground">
                {stats.openTickets} open, {stats.overdueTickets} overdue
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('support.avg_response_time', 'Avg Response Time')}
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(stats.avgResponseTime)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('support.avg_resolution_time', 'Avg Resolution Time')}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(stats.avgResolutionTime)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('support.satisfaction_rating', 'Satisfaction Rating')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgSatisfactionRating.toFixed(1)}/5</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('support.tickets_by_priority', 'Tickets by Priority')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ticketsByPriority}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('support.tickets_by_category', 'Tickets by Category')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ticketsByCategory}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category }) => category?.name || 'Uncategorized'}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {ticketsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Tickets */}
          <Card>
            <CardHeader>
              <CardTitle>{t('support.recent_tickets', 'Recent Tickets')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTickets.slice(0, 5).map((ticket) => (
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
                      <a href={`/support/tickets/${ticket.id}`}>
                        <Eye className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* My Tickets */}
          <Card>
            <CardHeader>
              <CardTitle>{t('support.my_tickets', 'My Assigned Tickets')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {myTickets.length > 0 ? myTickets.map((ticket) => (
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
                      <a href={`/support/tickets/${ticket.id}`}>
                        <Eye className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                )) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{t('support.no_assigned_tickets', 'No tickets assigned to you')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Tickets Alert */}
        {overdueTickets.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                {t('support.overdue_tickets', 'Overdue Tickets')} ({overdueTickets.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {overdueTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 bg-white border border-red-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">#{ticket.ticket_number}</span>
                        <Badge className={getPriorityColor(ticket.priority)} variant="secondary">
                          {ticket.priority}
                        </Badge>
                        {ticket.assigned_to && (
                          <span className="text-xs text-muted-foreground">
                            → {ticket.assigned_to.name}
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-sm leading-tight">{ticket.title}</h4>
                      <p className="text-xs text-red-600">
                        Overdue since {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/support/tickets/${ticket.id}`}>
                        <Eye className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Popular Knowledge Base Articles */}
        <Card>
          <CardHeader>
            <CardTitle>{t('support.popular_articles', 'Popular Knowledge Base Articles')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {popularArticles.map((article) => (
                <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm leading-tight">{article.title}</h4>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.view_count} views
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {article.helpful_count} helpful
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/support/knowledge-base/${article.id}`}>
                      <Eye className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
