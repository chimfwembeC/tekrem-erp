import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
  Plus,
  Ticket,
  BookOpen,
  HelpCircle,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Search
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface TicketData {
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
}

interface Article {
  id: number;
  title: string;
  excerpt?: string;
  view_count: number;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
}

interface Props {
  tickets: {
    data: TicketData[];
    links: any;
    meta?: any;
  };
  popularArticles: Article[];
  featuredFAQs: FAQ[];
  ticketStats: TicketStats;
}

export default function Dashboard({ tickets, popularArticles, featuredFAQs, ticketStats }: Props) {
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

  return (
    <AppLayout>
      <Head title={t('support.support_portal', 'Support Portal')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('support.support_portal', 'Support Portal')}</h1>
            <p className="text-muted-foreground">
              {t('support.portal_description', 'Get help, track your tickets, and find answers')}
            </p>
          </div>
          <Button asChild>
            <Link href={route('customer.support.create')}>
              <Plus className="h-4 w-4 mr-2" />
              {t('support.create_ticket', 'Create Ticket')}
            </Link>
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('support.total_tickets', 'Total Tickets')}
              </CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('support.open_tickets', 'Open Tickets')}
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.open}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('support.in_progress', 'In Progress')}
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.in_progress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('support.resolved', 'Resolved')}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketStats.resolved}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Tickets */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('support.my_tickets', 'My Tickets')}</CardTitle>
                <CardDescription>
                  {t('support.recent_tickets_description', 'Your recent support tickets')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tickets.data.length > 0 ? tickets.data.map((ticket) => (
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
                          {ticket.category && (
                            <Badge variant="outline">
                              <div
                                className="w-3 h-3 rounded-full mr-1"
                                style={{ backgroundColor: ticket.category.color }}
                              />
                              {ticket.category.name}
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-sm leading-tight">{ticket.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {new Date(ticket.created_at).toLocaleDateString()}
                          {ticket.assigned_to && ` • Assigned to ${ticket.assigned_to.name}`}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={route('customer.support.tickets.show', ticket.id)}>
                          <Eye className="h-3 w-3 mr-1" />
                          {t('common.view', 'View')}
                        </Link>
                      </Button>
                    </div>
                  )) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Ticket className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{t('support.no_tickets', 'No tickets yet')}</p>
                      <p className="text-xs">{t('support.create_first_ticket', 'Create your first support ticket')}</p>
                    </div>
                  )}
                </div>
                
                {tickets.data.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={route('customer.support.tickets.index')}>
                        {t('support.view_all_tickets', 'View All Tickets')}
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Help */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('support.quick_actions', 'Quick Actions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" asChild>
                  <Link href={route('customer.support.create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('support.create_ticket', 'Create New Ticket')}
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href={route('customer.support.knowledge-base')}>
                    <Search className="h-4 w-4 mr-2" />
                    {t('support.search_help', 'Search Help Articles')}
                  </Link>
                </Button>
                
                <Button variant="outline" className="w-full" asChild>
                  <Link href={route('customer.support.faq')}>
                    <HelpCircle className="h-4 w-4 mr-2" />
                    {t('support.view_faq', 'View FAQ')}
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Popular Articles */}
            <Card>
              <CardHeader>
                <CardTitle>{t('support.popular_articles', 'Popular Help Articles')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {popularArticles.map((article) => (
                    <div key={article.id} className="border-b last:border-b-0 pb-3 last:pb-0">
                      <Link
                        href={route('customer.support.articles.show', article.id)}
                        className="block hover:text-primary"
                      >
                        <h4 className="font-medium text-sm leading-tight mb-1">
                          {article.title}
                        </h4>
                        {article.excerpt && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {article.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          {article.view_count} views
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Featured FAQs */}
            {featuredFAQs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('support.featured_faqs', 'Featured FAQs')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {featuredFAQs.slice(0, 3).map((faq) => (
                      <div key={faq.id} className="border-b last:border-b-0 pb-3 last:pb-0">
                        <h4 className="font-medium text-sm leading-tight mb-1">
                          {faq.question}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={route('customer.support.faq')}>
                        {t('support.view_all_faqs', 'View All FAQs')}
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
