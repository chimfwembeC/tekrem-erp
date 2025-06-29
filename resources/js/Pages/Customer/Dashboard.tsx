import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
  Ticket,
  FolderOpen,
  FileText,
  CreditCard,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface TicketData {
  id: number;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  category?: {
    name: string;
    color: string;
  };
}

interface ProjectData {
  id: number;
  name: string;
  status: string;
  progress: number;
  deadline: string;
  client?: {
    name: string;
  };
}

interface InvoiceData {
  id: number;
  invoice_number: string;
  status: string;
  total_amount: number;
  due_date: string;
  client?: {
    name: string;
  };
}

interface PaymentData {
  id: number;
  amount: number;
  payment_date: string;
  method: string;
  invoice?: {
    invoice_number: string;
  };
}

interface Stats {
  tickets: {
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  invoices: {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
  };
}

interface Props {
  tickets: TicketData[];
  projects: ProjectData[];
  invoices: InvoiceData[];
  payments: PaymentData[];
  stats: Stats;
}

export default function CustomerDashboard({ tickets, projects, invoices, payments, stats }: Props) {
  const getStatusBadge = (status: string, type: 'ticket' | 'project' | 'invoice') => {
    const variants: Record<string, string> = {
      // Ticket statuses
      open: 'destructive',
      in_progress: 'default',
      resolved: 'secondary',
      closed: 'outline',
      // Project statuses
      active: 'default',
      completed: 'secondary',
      on_hold: 'outline',
      // Invoice statuses
      paid: 'secondary',
      pending: 'default',
      overdue: 'destructive',
    };

    return variants[status] || 'outline';
  };

  const route = useRoute();
  return (
    <CustomerLayout>
      <Head title="Customer Dashboard" />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your account today.
          </p>
        </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
                <Ticket className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.tickets.total}</div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="destructive" className="text-xs">
                    {stats.tickets.open} Open
                  </Badge>
                  <Badge variant="default" className="text-xs">
                    {stats.tickets.in_progress} In Progress
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projects</CardTitle>
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.projects.total}</div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="default" className="text-xs">
                    {stats.projects.active} Active
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {stats.projects.completed} Completed
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.invoices.total}</div>
                <div className="flex gap-2 mt-2">
                  <Badge variant="default" className="text-xs">
                    {stats.invoices.pending} Pending
                  </Badge>
                  {stats.invoices.overdue > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {stats.invoices.overdue} Overdue
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Payments</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{payments.length}</div>
                <p className="text-xs text-muted-foreground">Last 5 payments</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recent Tickets */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Support Tickets</CardTitle>
                  <Link href={route('customer.support.create')}>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Ticket
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tickets.length > 0 ? (
                    tickets.map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{ticket.title}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadge(ticket.status, 'ticket')}>
                            {ticket.status}
                          </Badge>
                          <Link href={route('customer.support.tickets.show', ticket.id)}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Ticket className="mx-auto h-8 w-8 mb-2" />
                      <p>No support tickets yet</p>
                      <Link href={route('customer.support.create')}>
                        <Button className="mt-2" size="sm">
                          Create Your First Ticket
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Invoices */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.length > 0 ? (
                    invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{invoice.invoice_number}</div>
                          <div className="text-sm text-gray-500">
                            Due: {new Date(invoice.due_date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="font-medium">${invoice.total_amount}</div>
                            <Badge variant={getStatusBadge(invoice.status, 'invoice')}>
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <FileText className="mx-auto h-8 w-8 mb-2" />
                      <p>No invoices yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and helpful resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href={route('customer.support.create')}>
                  <Button className="w-full" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Support Ticket
                  </Button>
                </Link>
                <Link href={route('customer.support.knowledge-base.index')}>
                  <Button className="w-full" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Browse Knowledge Base
                  </Button>
                </Link>
                <Link href={route('customer.support.faq')}>
                  <Button className="w-full" variant="outline">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    View FAQ
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
    </CustomerLayout>
  );
}
