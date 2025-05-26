import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';

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
  PieChart,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface Budget {
  id: number;
  name: string;
  description: string | null;
  amount: number;
  spent_amount: number;
  remaining_amount: number;
  period_type: string;
  start_date: string;
  end_date: string;
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
}

interface Props {
  budgets: {
    data: Budget[];
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
    period_type?: string;
    category?: string;
    account?: string;
  };
  statuses: Record<string, string>;
  periodTypes: Record<string, string>;
  categories: Array<{
    id: number;
    name: string;
  }>;
  accounts: Array<{
    id: number;
    name: string;
  }>;
}

export default function Index({ budgets, filters, statuses, periodTypes, categories, accounts }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [search, setSearch] = useState(filters.search || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
  const [selectedPeriod, setSelectedPeriod] = useState(filters.period_type || 'all');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
  const [selectedAccount, setSelectedAccount] = useState(filters.account || 'all');

  const handleSearch = () => {
    router.get(route('finance.budgets.index'), {
      search,
      status: selectedStatus === 'all' ? '' : selectedStatus,
      period_type: selectedPeriod === 'all' ? '' : selectedPeriod,
      category: selectedCategory === 'all' ? '' : selectedCategory,
      account: selectedAccount === 'all' ? '' : selectedAccount,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleReset = () => {
    setSearch('');
    setSelectedStatus('all');
    setSelectedPeriod('all');
    setSelectedCategory('all');
    setSelectedAccount('all');
    router.get(route('finance.budgets.index'), {}, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm(t('common.confirm_delete', 'Are you sure you want to delete this item?'))) {
      router.delete(route('finance.budgets.destroy', id), {
        onSuccess: () => {
          toast.success(t('finance.budget_deleted', 'Budget deleted successfully'));
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
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'exceeded':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUsagePercentage = (spent: number, total: number) => {
    return total > 0 ? Math.round((spent / total) * 100) : 0;
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getUsageIcon = (percentage: number) => {
    if (percentage >= 100) return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (percentage >= 80) return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-green-600" />;
  };

  return (
    <AppLayout title={t('finance.budgets', 'Budgets')}>
      <Head title={t('finance.budgets', 'Budgets')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <CardTitle>{t('finance.budgets', 'Budgets')}</CardTitle>
                <CardDescription>
                  {t('finance.budgets_description', 'Create and monitor your financial budgets')}
                </CardDescription>
              </div>
              <Link href={route('finance.budgets.create')}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('finance.create_budget', 'Create Budget')}
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2 flex-1">
                  <Input
                    type="text"
                    placeholder={t('finance.search_budgets', 'Search budgets...')}
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

                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t('common.all_periods', 'All periods')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_periods', 'All periods')}</SelectItem>
                      {periodTypes && Object.entries(periodTypes).map(([value, label]) => (
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

              {budgets.data.length === 0 ? (
                <div className="text-center py-8">
                  <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('finance.no_budgets', 'No budgets found')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {t('finance.create_first_budget_desc', 'Get started by creating your first budget.')}
                  </p>
                  <Link href={route('finance.budgets.create')}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('finance.create_budget', 'Create Budget')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">{t('finance.budget_name', 'Budget Name')}</th>
                        <th className="text-left p-2">{t('finance.category', 'Category')}</th>
                        <th className="text-left p-2">{t('finance.period', 'Period')}</th>
                        <th className="text-left p-2">{t('finance.budget_amount', 'Budget')}</th>
                        <th className="text-left p-2">{t('finance.spent', 'Spent')}</th>
                        <th className="text-left p-2">{t('finance.usage', 'Usage')}</th>
                        <th className="text-left p-2">{t('common.status', 'Status')}</th>
                        <th className="text-left p-2">{t('common.actions', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budgets.data.map((budget) => {
                        const usagePercentage = getUsagePercentage(budget.spent_amount, budget.amount);
                        return (
                          <tr key={budget.id} className="border-b hover:bg-muted/50">
                            <td className="p-2">
                              <div>
                                <Link
                                  href={route('finance.budgets.show', budget.id)}
                                  className="font-medium text-blue-600 hover:underline"
                                >
                                  {budget.name}
                                </Link>
                                {budget.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {budget.description}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="p-2">
                              {budget.category ? (
                                <Badge variant="outline">
                                  {budget.category.name}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-2">
                              <div className="text-sm">
                                <p className="font-medium">
                                  {(periodTypes && periodTypes[budget.period_type]) || budget.period_type}
                                </p>
                                <p className="text-muted-foreground">
                                  {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                                </p>
                              </div>
                            </td>
                            <td className="p-2 font-medium">
                              {formatCurrency(budget.amount, budget.account.currency)}
                            </td>
                            <td className="p-2">
                              <div className="text-sm">
                                <p className="font-medium">
                                  {formatCurrency(budget.spent_amount, budget.account.currency)}
                                </p>
                                <p className="text-muted-foreground">
                                  {formatCurrency(budget.remaining_amount, budget.account.currency)} remaining
                                </p>
                              </div>
                            </td>
                            <td className="p-2">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  {getUsageIcon(usagePercentage)}
                                  <span className="text-sm font-medium">{usagePercentage}%</span>
                                </div>
                                <Progress
                                  value={usagePercentage}
                                  className="h-2"
                                  style={{
                                    '--progress-background': getUsageColor(usagePercentage)
                                  } as React.CSSProperties}
                                />
                              </div>
                            </td>
                            <td className="p-2">
                              <Badge className={getStatusColor(budget.status)} variant="secondary">
                                {(statuses && statuses[budget.status]) || budget.status}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <div className="flex gap-2">
                                <Link href={route('finance.budgets.edit', budget.id)}>
                                  <Button variant="outline" size="sm">
                                    <Edit className="h-4 w-4 mr-1" />
                                    {t('common.edit', 'Edit')}
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(budget.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  {t('common.delete', 'Delete')}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {budgets.last_page > 1 && (
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {budgets.from} to {budgets.to} of {budgets.total} budgets
                  </div>
                  <div className="flex gap-1">
                    {budgets.links?.map((link, i) => {
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
