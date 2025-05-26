import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import useRoute from '@/Hooks/useRoute';


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  FileText,
  Send,
  Download,
  Calendar
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import { toast } from 'sonner';

interface Invoice {
  id: number;
  invoice_number: string;
  status: string;
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  currency: string;
  billable: {
    id: number;
    name: string;
    email: string;
  } | null;
}

interface Props {
  invoices: {
    data: Invoice[];
    links?: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  filters: {
    search?: string;
    status?: string;
    billable?: string;
    date_from?: string;
    date_to?: string;
  };
  statuses: Record<string, string>;
  billables?: Array<{
    id: number;
    name: string;
    type: string;
  }>;
}

export default function Index({ invoices, filters, statuses, billables }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [search, setSearch] = useState(filters.search || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
  const [selectedBillable, setSelectedBillable] = useState(filters.billable || 'all');
  const [dateFrom, setDateFrom] = useState(filters.date_from || '');
  const [dateTo, setDateTo] = useState(filters.date_to || '');

  const handleSearch = () => {
    router.get(route('finance.invoices.index'), {
      search,
      status: selectedStatus === 'all' ? '' : selectedStatus,
      billable: selectedBillable === 'all' ? '' : selectedBillable,
      date_from: dateFrom,
      date_to: dateTo,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleReset = () => {
    setSearch('');
    setSelectedStatus('all');
    setSelectedBillable('all');
    setDateFrom('');
    setDateTo('');
    router.get(route('finance.invoices.index'), {}, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm(t('common.confirm_delete', 'Are you sure you want to delete this item?'))) {
      router.delete(route('finance.invoices.destroy', id), {
        onSuccess: () => {
          toast.success(t('finance.invoice_deleted', 'Invoice deleted successfully'));
        },
        onError: () => {
          toast.error(t('common.error_occurred', 'An error occurred'));
        },
      });
    }
  };

  const handleSend = (id: number) => {
    router.post(route('finance.invoices.send', id), {}, {
      onSuccess: () => {
        toast.success(t('finance.invoice_sent', 'Invoice sent successfully'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return '✓';
      case 'sent':
        return '→';
      case 'overdue':
        return '!';
      case 'draft':
        return '○';
      default:
        return '○';
    }
  };

  return (
    <AppLayout title={t('finance.invoices', 'Invoices')}>
      <Head title={t('finance.invoices', 'Invoices')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <CardTitle>{t('finance.invoices', 'Invoices')}</CardTitle>
                <CardDescription>
                  {t('finance.invoices_description', 'Create and manage your invoices')}
                </CardDescription>
              </div>
              <Link href={route('finance.invoices.create')}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('finance.create_invoice', 'Create Invoice')}
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2 flex-1">
                  <Input
                    type="text"
                    placeholder={t('finance.search_invoices', 'Search invoices...')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button type="submit" variant="secondary">{t('common.search', 'Search')}</Button>
                </form>

                <div className="flex gap-2">
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t('common.all_statuses', 'All statuses')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_statuses', 'All statuses')}</SelectItem>
                      {statuses && Object.entries(statuses).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedBillable} onValueChange={setSelectedBillable}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t('common.all_clients', 'All clients')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_clients', 'All clients')}</SelectItem>
                      {billables?.map((billable) => (
                        <SelectItem key={billable.id} value={billable.id.toString()}>
                          {billable.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={handleReset}>
                    {t('common.reset', 'Reset')}
                  </Button>
                </div>
              </div>

              {invoices.data.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('finance.no_invoices', 'No invoices found')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {t('finance.create_first_invoice_desc', 'Get started by creating your first invoice.')}
                  </p>
                  <Link href={route('finance.invoices.create')}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('finance.create_invoice', 'Create Invoice')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {invoices.data.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Link
                              href={route('finance.invoices.show', invoice.id)}
                              className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400"
                            >
                              {invoice.invoice_number}
                            </Link>
                            <Badge className={getStatusColor(invoice.status)} variant="secondary">
                              <span className="mr-1">{getStatusIcon(invoice.status)}</span>
                              {statuses[invoice.status] || invoice.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('finance.client', 'Client')}
                              </p>
                              <p className="font-medium">{invoice.billable?.name || 'No client'}</p>
                              {invoice.billable?.email && (
                                <p className="text-xs text-gray-500">{invoice.billable.email}</p>
                              )}
                            </div>

                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('finance.issue_date', 'Issue Date')}
                              </p>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span className="text-sm">
                                  {new Date(invoice.issue_date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('finance.due_date', 'Due Date')}
                              </p>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-gray-400" />
                                <span className="text-sm">
                                  {new Date(invoice.due_date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('finance.amount', 'Amount')}
                              </p>
                              <p className="font-medium text-lg">
                                {formatCurrency(invoice.total_amount, invoice.currency)}
                              </p>
                              {invoice.paid_amount > 0 && (
                                <p className="text-xs text-green-600">
                                  {formatCurrency(invoice.paid_amount, invoice.currency)} paid
                                  ({Math.round((invoice.paid_amount / invoice.total_amount) * 100)}%)
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={route('finance.invoices.show', invoice.id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  {t('common.view', 'View')}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={route('finance.invoices.edit', invoice.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  {t('common.edit', 'Edit')}
                                </Link>
                              </DropdownMenuItem>
                              {invoice.status === 'draft' && (
                                <DropdownMenuItem onClick={() => handleSend(invoice.id)}>
                                  <Send className="mr-2 h-4 w-4" />
                                  {t('finance.send_invoice', 'Send Invoice')}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem asChild>
                                <Link href={route('finance.invoices.pdf', invoice.id)} target="_blank">
                                  <Download className="mr-2 h-4 w-4" />
                                  {t('finance.download_pdf', 'Download PDF')}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(invoice.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('common.delete', 'Delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {invoices.last_page > 1 && (
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {invoices.from} to {invoices.to} of {invoices.total} invoices
                  </div>
                  <div className="flex gap-1">
                    {invoices.links?.map((link, i) => {
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
