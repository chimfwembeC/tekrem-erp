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
  TrendingUp,
  Calendar,
  Receipt,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface Expense {
  id: number;
  expense_number: string;
  title: string;
  amount: number;
  expense_date: string;
  status: string;
  category: {
    id: number;
    name: string;
  } | null;
  account: {
    id: number;
    name: string;
    currency: string;
  };
  vendor: string | null;
  receipt_url: string | null;
}

interface Props {
  expenses: {
    data: Expense[];
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
    category?: string;
    account?: string;
    date_from?: string;
    date_to?: string;
  };
  statuses: Record<string, string>;
  categories: Array<{
    id: number;
    name: string;
  }>;
  accounts: Array<{
    id: number;
    name: string;
  }>;
}

export default function Index({ expenses, filters, statuses, categories, accounts }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [search, setSearch] = useState(filters.search || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
  const [selectedAccount, setSelectedAccount] = useState(filters.account || 'all');
  const [dateFrom, setDateFrom] = useState(filters.date_from || '');
  const [dateTo, setDateTo] = useState(filters.date_to || '');

  const handleSearch = () => {
    router.get(route('finance.expenses.index'), {
      search,
      status: selectedStatus === 'all' ? '' : selectedStatus,
      category: selectedCategory === 'all' ? '' : selectedCategory,
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
    setSelectedCategory('all');
    setSelectedAccount('all');
    setDateFrom('');
    setDateTo('');
    router.get(route('finance.expenses.index'), {}, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm(t('common.confirm_delete', 'Are you sure you want to delete this item?'))) {
      router.delete(route('finance.expenses.destroy', id), {
        onSuccess: () => {
          toast.success(t('finance.expense_deleted', 'Expense deleted successfully'));
        },
        onError: () => {
          toast.error(t('common.error_occurred', 'An error occurred'));
        },
      });
    }
  };

  const handleApprove = (id: number) => {
    router.post(route('finance.expenses.approve', id), {}, {
      onSuccess: () => {
        toast.success(t('finance.expense_approved', 'Expense approved successfully'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const handleReject = (id: number) => {
    router.post(route('finance.expenses.reject', id), {}, {
      onSuccess: () => {
        toast.success(t('finance.expense_rejected', 'Expense rejected successfully'));
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
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <AppLayout title={t('finance.expenses', 'Expenses')}>
      <Head title={t('finance.expenses', 'Expenses')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <CardTitle>{t('finance.expenses', 'Expenses')}</CardTitle>
                <CardDescription>
                  {t('finance.expenses_description', 'Track and manage your business expenses')}
                </CardDescription>
              </div>
              <Link href={route('finance.expenses.create')}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('finance.add_expense', 'Add Expense')}
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2 flex-1">
                  <Input
                    type="text"
                    placeholder={t('finance.search_expenses', 'Search expenses...')}
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

                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t('common.all_categories', 'All categories')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_categories', 'All categories')}</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={handleReset}>
                    {t('common.reset', 'Reset')}
                  </Button>
                </div>
              </div>

              {expenses.data.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('finance.no_expenses', 'No expenses found')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {t('finance.add_first_expense_desc', 'Get started by adding your first expense.')}
                  </p>
                  <Link href={route('finance.expenses.create')}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('finance.add_expense', 'Add Expense')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">{t('finance.expense_number', 'Expense #')}</th>
                        <th className="text-left p-2">{t('finance.title', 'Title')}</th>
                        <th className="text-left p-2">{t('finance.category', 'Category')}</th>
                        <th className="text-left p-2">{t('finance.amount', 'Amount')}</th>
                        <th className="text-left p-2">{t('finance.vendor', 'Vendor')}</th>
                        <th className="text-left p-2">{t('finance.expense_date', 'Date')}</th>
                        <th className="text-left p-2">{t('common.status', 'Status')}</th>
                        <th className="text-left p-2">{t('common.actions', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.data.map((expense) => (
                        <tr key={expense.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <Link
                              href={route('finance.expenses.show', expense.id)}
                              className="text-blue-600 hover:underline font-medium"
                            >
                              {expense.expense_number}
                            </Link>
                          </td>
                          <td className="p-2">
                            <span className="font-medium">{expense.title}</span>
                          </td>
                          <td className="p-2">
                            {expense.category ? (
                              <Badge variant="outline">
                                {expense.category.name}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-2 font-medium">
                            {formatCurrency(expense.amount, expense.account.currency)}
                          </td>
                          <td className="p-2">
                            {expense.vendor || <span className="text-muted-foreground">-</span>}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {new Date(expense.expense_date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge className={getStatusColor(expense.status)} variant="secondary">
                              <span className="mr-1">{getStatusIcon(expense.status)}</span>
                              {(statuses && statuses[expense.status]) || expense.status}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <Link href={route('finance.expenses.edit', expense.id)}>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4 mr-1" />
                                  {t('common.edit', 'Edit')}
                                </Button>
                              </Link>
                              {expense.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleApprove(expense.id)}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  {t('finance.approve', 'Approve')}
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
              {expenses.last_page > 1 && (
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {expenses.from} to {expenses.to} of {expenses.total} expenses
                  </div>
                  <div className="flex gap-1">
                    {expenses.links?.map((link, i) => {
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
