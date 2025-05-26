import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';

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
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface Quotation {
  id: number;
  quotation_number: string;
  status: string;
  issue_date: string;
  expiry_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  lead: {
    id: number;
    name: string;
    email: string;
    company: string | null;
  };
  is_expired: boolean;
  days_until_expiry: number;
  can_convert_to_invoice: boolean;
  is_converted: boolean;
}

interface Props {
  quotations: {
    data: Quotation[];
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
    lead?: string;
    date_from?: string;
    date_to?: string;
  };
  statuses: Record<string, string>;
  leads: Array<{
    id: number;
    name: string;
    company: string | null;
  }>;
}

export default function Index({ quotations, filters, statuses, leads }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [search, setSearch] = useState(filters.search || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
  const [selectedLead, setSelectedLead] = useState(filters.lead || 'all');
  const [dateFrom, setDateFrom] = useState(filters.date_from || '');
  const [dateTo, setDateTo] = useState(filters.date_to || '');

  const handleSearch = () => {
    router.get(route('finance.quotations.index'), {
      search,
      status: selectedStatus === 'all' ? '' : selectedStatus,
      lead: selectedLead === 'all' ? '' : selectedLead,
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
    setSelectedLead('all');
    setDateFrom('');
    setDateTo('');
    router.get(route('finance.quotations.index'), {}, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm(t('common.confirm_delete', 'Are you sure you want to delete this item?'))) {
      router.delete(route('finance.quotations.destroy', id), {
        onSuccess: () => {
          toast.success(t('finance.quotation_deleted', 'Quotation deleted successfully'));
        },
        onError: () => {
          toast.error(t('common.error_occurred', 'An error occurred'));
        },
      });
    }
  };

  const handleSend = (id: number) => {
    router.post(route('finance.quotations.send', id), {}, {
      onSuccess: () => {
        toast.success(t('finance.quotation_sent', 'Quotation sent successfully'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const handleAccept = (id: number) => {
    router.post(route('finance.quotations.accept', id), {}, {
      onSuccess: () => {
        toast.success(t('finance.quotation_accepted', 'Quotation accepted successfully'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const handleReject = (id: number) => {
    router.post(route('finance.quotations.reject', id), {}, {
      onSuccess: () => {
        toast.success(t('finance.quotation_rejected', 'Quotation rejected'));
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
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-3 w-3" />;
      case 'sent':
        return <Send className="h-3 w-3" />;
      case 'rejected':
        return <XCircle className="h-3 w-3" />;
      case 'expired':
        return <AlertTriangle className="h-3 w-3" />;
      case 'draft':
        return <FileText className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const getExpiryWarning = (quotation: Quotation) => {
    if (quotation.is_expired) {
      return <Badge variant="destructive" className="text-xs">Expired</Badge>;
    }

    if (quotation.days_until_expiry <= 3 && quotation.status === 'sent') {
      return <Badge variant="outline" className="text-xs text-orange-600">
        <Clock className="h-3 w-3 mr-1" />
        {quotation.days_until_expiry} days left
      </Badge>;
    }

    return null;
  };

  return (
    <AppLayout title={t('finance.quotations', 'Quotations')}>
      <Head title={t('finance.quotations', 'Quotations')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <CardTitle>{t('finance.quotations', 'Quotations')}</CardTitle>
                <CardDescription>
                  {t('finance.quotations_description', 'Create and manage quotations for your leads')}
                </CardDescription>
              </div>
              <Link href={route('finance.quotations.create')}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('finance.create_quotation', 'Create Quotation')}
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2 flex-1">
                  <Input
                    type="text"
                    placeholder={t('finance.search_quotations', 'Search quotations...')}
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
                      {Object.entries(statuses).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedLead} onValueChange={setSelectedLead}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t('common.all_leads', 'All leads')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_leads', 'All leads')}</SelectItem>
                      {leads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.id.toString()}>
                          {lead.name} {lead.company && `(${lead.company})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={handleReset}>
                    {t('common.reset', 'Reset')}
                  </Button>
                </div>
              </div>

              {quotations.data.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('finance.no_quotations', 'No quotations found')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {t('finance.create_first_quotation_desc', 'Get started by creating your first quotation.')}
                  </p>
                  <Link href={route('finance.quotations.create')}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('finance.create_quotation', 'Create Quotation')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">{t('finance.quotation_number', 'Quotation #')}</th>
                        <th className="text-left p-2">{t('crm.lead', 'Lead')}</th>
                        <th className="text-left p-2">{t('finance.issue_date', 'Issue Date')}</th>
                        <th className="text-left p-2">{t('finance.expiry_date', 'Expiry Date')}</th>
                        <th className="text-left p-2">{t('finance.amount', 'Amount')}</th>
                        <th className="text-left p-2">{t('common.status', 'Status')}</th>
                        <th className="text-left p-2">{t('common.actions', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotations.data.map((quotation) => (
                        <tr key={quotation.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <Link
                              href={route('finance.quotations.show', quotation.id)}
                              className="text-blue-600 hover:underline font-medium"
                            >
                              {quotation.quotation_number}
                            </Link>
                          </td>
                          <td className="p-2">
                            <div>
                              <p className="font-medium">{quotation.lead.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {quotation.lead.company || quotation.lead.email}
                              </p>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(quotation.issue_date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {new Date(quotation.expiry_date).toLocaleDateString()}
                              </div>
                              {getExpiryWarning(quotation)}
                            </div>
                          </td>
                          <td className="p-2 font-medium">
                            {formatCurrency(quotation.total_amount, quotation.currency)}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(quotation.status)} variant="secondary">
                                {getStatusIcon(quotation.status)}
                                <span className="ml-1">{statuses[quotation.status] || quotation.status}</span>
                              </Badge>
                              {quotation.is_converted && (
                                <Badge variant="outline" className="text-xs">
                                  Converted
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <Link href={route('finance.quotations.edit', quotation.id)}>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4 mr-1" />
                                  {t('common.edit', 'Edit')}
                                </Button>
                              </Link>
                              {quotation.status === 'draft' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSend(quotation.id)}
                                  className="text-blue-600"
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  {t('finance.send_quotation', 'Send')}
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {quotations.last_page > 1 && (
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {quotations.from} to {quotations.to} of {quotations.total} quotations
                  </div>
                  <div className="flex gap-1">
                    {quotations.links?.map((link, i) => {
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
