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
  CreditCard,
  Calendar,
  Receipt,
  FileText
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface Payment {
  id: number;
  payment_number: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  reference_number: string | null;
  invoice: {
    id: number;
    invoice_number: string;
  } | null;
  payable: {
    id: number;
    name: string;
  } | null;
  account: {
    id: number;
    name: string;
    currency: string;
  };
}

interface Props {
  payments: {
    data: Payment[];
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
    payment_method?: string;
    account?: string;
    date_from?: string;
    date_to?: string;
  };
  statuses: Record<string, string>;
  paymentMethods: Record<string, string>;
  accounts: Array<{
    id: number;
    name: string;
  }>;
}

export default function Index({ payments, filters, statuses, paymentMethods, accounts }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [search, setSearch] = useState(filters.search || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
  const [selectedMethod, setSelectedMethod] = useState(filters.payment_method || 'all');
  const [selectedAccount, setSelectedAccount] = useState(filters.account || 'all');
  const [dateFrom, setDateFrom] = useState(filters.date_from || '');
  const [dateTo, setDateTo] = useState(filters.date_to || '');

  const handleSearch = () => {
    router.get(route('finance.payments.index'), {
      search,
      status: selectedStatus === 'all' ? '' : selectedStatus,
      payment_method: selectedMethod === 'all' ? '' : selectedMethod,
      account: selectedAccount === 'all' ? '' : selectedAccount,
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
    setSelectedMethod('all');
    setSelectedAccount('all');
    setDateFrom('');
    setDateTo('');
    router.get(route('finance.payments.index'), {}, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm(t('common.confirm_delete', 'Are you sure you want to delete this item?'))) {
      router.delete(route('finance.payments.destroy', id), {
        onSuccess: () => {
          toast.success(t('finance.payment_deleted', 'Payment deleted successfully'));
        },
        onError: () => {
          toast.error(t('common.error_occurred', 'An error occurred'));
        },
      });
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'pending':
        return '○';
      case 'failed':
        return '✗';
      default:
        return '○';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer':
        return <Receipt className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <AppLayout title={t('finance.payments', 'Payments')}>
      <Head title={t('finance.payments', 'Payments')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <CardTitle>{t('finance.payments', 'Payments')}</CardTitle>
                <CardDescription>
                  {t('finance.payments_description', 'Track and manage your payments')}
                </CardDescription>
              </div>
              <Link href={route('finance.payments.create')}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('finance.record_payment', 'Record Payment')}
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2 flex-1">
                  <Input
                    type="text"
                    placeholder={t('finance.search_payments', 'Search payments...')}
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

                  <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t('common.all_methods', 'All methods')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_methods', 'All methods')}</SelectItem>
                      {paymentMethods && Object.entries(paymentMethods).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={handleReset}>
                    {t('common.reset', 'Reset')}
                  </Button>
                </div>
              </div>

              {payments.data.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('finance.no_payments', 'No payments found')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {t('finance.record_first_payment_desc', 'Get started by recording your first payment.')}
                  </p>
                  <Link href={route('finance.payments.create')}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('finance.record_payment', 'Record Payment')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">{t('finance.payment_number', 'Payment #')}</th>
                        <th className="text-left p-2">{t('finance.invoice', 'Invoice')}</th>
                        <th className="text-left p-2">{t('finance.client', 'Client')}</th>
                        <th className="text-left p-2">{t('finance.amount', 'Amount')}</th>
                        <th className="text-left p-2">{t('finance.payment_method', 'Method')}</th>
                        <th className="text-left p-2">{t('finance.payment_date', 'Date')}</th>
                        <th className="text-left p-2">{t('common.status', 'Status')}</th>
                        <th className="text-left p-2">{t('common.actions', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.data.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <Link
                              href={route('finance.payments.show', payment.id)}
                              className="text-blue-600 hover:underline font-medium"
                            >
                              {payment.payment_number}
                            </Link>
                          </td>
                          <td className="p-2">
                            {payment.invoice ? (
                              <Link
                                href={route('finance.invoices.show', payment.invoice.id)}
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <FileText className="h-4 w-4" />
                                {payment.invoice.invoice_number}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-2">
                            {payment.payable ? (
                              <span className="font-medium">{payment.payable.name}</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-2 font-medium">
                            {formatCurrency(payment.amount, payment.account.currency)}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              {getMethodIcon(payment.payment_method)}
                              <span>{(paymentMethods && paymentMethods[payment.payment_method]) || payment.payment_method}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(payment.payment_date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge className={getStatusColor(payment.status)} variant="secondary">
                              <span className="mr-1">{getStatusIcon(payment.status)}</span>
                              {(statuses && statuses[payment.status]) || payment.status}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <Link href={route('finance.payments.edit', payment.id)}>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4 mr-1" />
                                  {t('common.edit', 'Edit')}
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(payment.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                {t('common.delete', 'Delete')}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {payments.last_page > 1 && (
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {payments.from} to {payments.to} of {payments.total} payments
                  </div>
                  <div className="flex gap-1">
                    {payments.links?.map((link, i) => {
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
