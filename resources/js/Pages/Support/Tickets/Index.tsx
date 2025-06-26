import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import {
  Ticket,
  Plus,
  Search,
  Filter,
  Clock,
  User,
  AlertTriangle,
  Eye
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
  due_date?: string;
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
}

interface Category {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
}

interface PaginatedTickets {
  data: TicketData[];
  links: any;
  meta?: any;
}

interface Props {
  tickets: PaginatedTickets;
  categories: Category[];
  users: User[];
  filters: {
    search?: string;
    status?: string;
    priority?: string;
    category_id?: string;
    assigned_to?: string;
    overdue?: string;
  };
}

export default function Index({ tickets, categories, users, filters }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('support.tickets.index'), {
      ...filters,
      search: searchTerm,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get(route('support.tickets.index'), {
      ...filters,
      [key]: value === 'all' ? '' : value,
    }, {
      preserveState: true,
      replace: true,
    });
  };

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

  const isOverdue = (dueDate: string) => {
    return dueDate && new Date(dueDate) < new Date();
  };

  return (
    <AppLayout>
      <Head title={t('support.tickets', 'Support Tickets')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('support.tickets', 'Support Tickets')}</h1>
            <p className="text-muted-foreground">
              {t('support.tickets_description', 'Manage and track support tickets')}
            </p>
          </div>
          <Button asChild>
            <Link href={route('support.tickets.create')}>
              <Plus className="h-4 w-4 mr-2" />
              {t('support.create_ticket', 'Create Ticket')}
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              {t('common.filters', 'Filters')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder={t('common.search', 'Search...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('support.status', 'Status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                  <SelectItem value="open">{t('support.status_open', 'Open')}</SelectItem>
                  <SelectItem value="in_progress">{t('support.status_in_progress', 'In Progress')}</SelectItem>
                  <SelectItem value="pending">{t('support.status_pending', 'Pending')}</SelectItem>
                  <SelectItem value="resolved">{t('support.status_resolved', 'Resolved')}</SelectItem>
                  <SelectItem value="closed">{t('support.status_closed', 'Closed')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.priority || 'all'} onValueChange={(value) => handleFilterChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('support.priority', 'Priority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                  <SelectItem value="low">{t('support.priority_low', 'Low')}</SelectItem>
                  <SelectItem value="medium">{t('support.priority_medium', 'Medium')}</SelectItem>
                  <SelectItem value="high">{t('support.priority_high', 'High')}</SelectItem>
                  <SelectItem value="urgent">{t('support.priority_urgent', 'Urgent')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.category_id || 'all'} onValueChange={(value) => handleFilterChange('category_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('support.category', 'Category')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.assigned_to || 'all'} onValueChange={(value) => handleFilterChange('assigned_to', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('support.assigned_to', 'Assigned To')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                  <SelectItem value="unassigned">{t('support.unassigned', 'Unassigned')}</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="overdue"
                  checked={filters.overdue === 'true'}
                  onCheckedChange={(checked) => handleFilterChange('overdue', checked ? 'true' : '')}
                />
                <label htmlFor="overdue" className="text-sm font-medium">
                  {t('support.overdue_only', 'Overdue Only')}
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <div className="space-y-4">
          {tickets.data.map((ticket) => (
            <Card key={ticket.id} className={`hover:shadow-md transition-shadow ${isOverdue(ticket.due_date || '') ? 'border-red-500' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={route('support.tickets.show', ticket.id)}
                        className="text-lg font-semibold hover:text-primary"
                      >
                        #{ticket.ticket_number}
                      </Link>
                      <Badge className={getStatusColor(ticket.status)} variant="secondary">
                        {ticket.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)} variant="secondary">
                        {ticket.priority}
                      </Badge>
                      {isOverdue(ticket.due_date || '') && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-medium mb-2">{ticket.title}</h3>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {ticket.category && (
                        <div className="flex items-center gap-1">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: ticket.category.color }}
                          />
                          {ticket.category.name}
                        </div>
                      )}
                      
                      {ticket.assigned_to && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {ticket.assigned_to.name}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </div>
                      
                      {ticket.requester && (
                        <div>
                          Requester: {ticket.requester.name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={route('support.tickets.show', ticket.id)}>
                        <Eye className="h-4 w-4 mr-1" />
                        {t('common.view', 'View')}
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {tickets.data.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('support.no_tickets', 'No tickets found')}</h3>
              <p className="text-muted-foreground mb-4">
                {t('support.no_tickets_description', 'Get started by creating your first support ticket.')}
              </p>
              <Button asChild>
                <Link href={route('support.tickets.create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('support.create_ticket', 'Create Ticket')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
