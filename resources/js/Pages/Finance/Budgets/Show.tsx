import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
  ArrowLeft,
  MoreHorizontal,
  Edit,
  Trash2,
  PieChart,
  Calendar,
  Building,
  DollarSign,
  Hash,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Tag
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
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
  created_at: string;
  updated_at: string;
  category: {
    id: number;
    name: string;
    description: string | null;
  } | null;
  account: {
    id: number;
    name: string;
    currency: string;
    type: string;
  };
}

interface Props {
  budget: Budget;
  statuses: Record<string, string>;
  periodTypes: Record<string, string>;
}

export default function Show({ budget, statuses, periodTypes }: Props) {
  const { t } = useTranslate();

  const handleDelete = () => {
    if (confirm(t('common.confirm_delete', 'Are you sure you want to delete this item?'))) {
      router.delete(route('finance.budgets.destroy', budget.id), {
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

  const usagePercentage = getUsagePercentage(budget.spent_amount, budget.amount);
  const daysRemaining = Math.ceil((new Date(budget.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = Math.ceil((new Date(budget.end_date).getTime() - new Date(budget.start_date).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <AppLayout
      title={budget.name}
      breadcrumbs={[
        { label: t('finance.title', 'Finance'), href: '/finance' },
        { label: t('finance.budgets', 'Budgets'), href: '/finance/budgets' },
        { label: budget.name },
      ]}
    >
      <Head title={budget.name} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={route('finance.budgets.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back', 'Back')}
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <PieChart className="h-8 w-8" />
                {budget.name}
              </h1>
              <p className="text-muted-foreground">
                {budget.description || t('finance.budget_details', 'Budget Details')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href={route('finance.budgets.edit', budget.id)}>
                <Edit className="h-4 w-4 mr-2" />
                {t('common.edit', 'Edit')}
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('common.delete', 'Delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Budget Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.budget_amount', 'Budget Amount')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(budget.amount, budget.account.currency)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.spent_amount', 'Spent Amount')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(budget.spent_amount, budget.account.currency)}
              </div>
              <p className="text-xs text-muted-foreground">
                {usagePercentage}% of budget
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.remaining_amount', 'Remaining Amount')}
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(budget.remaining_amount, budget.account.currency)}
              </div>
              <p className="text-xs text-muted-foreground">
                {100 - usagePercentage}% remaining
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.days_remaining', 'Days Remaining')}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {daysRemaining > 0 ? daysRemaining : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                of {totalDays} total days
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Budget Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                {t('finance.budget_information', 'Budget Information')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  {t('finance.budget_name', 'Budget Name')}
                </div>
                <p className="font-medium">{budget.name}</p>
              </div>

              {budget.description && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Target className="h-4 w-4" />
                    {t('finance.description', 'Description')}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{budget.description}</p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {t('finance.budget_period', 'Budget Period')}
                </div>
                <div className="space-y-1">
                  <p className="font-medium">
                    {periodTypes[budget.period_type] || budget.period_type}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(budget.start_date).toLocaleDateString()} - {new Date(budget.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Target className="h-4 w-4" />
                  {t('common.status', 'Status')}
                </div>
                <Badge className={getStatusColor(budget.status)} variant="secondary">
                  {statuses[budget.status] || budget.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Building className="h-4 w-4" />
                  {t('finance.account', 'Account')}
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{budget.account.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {budget.account.type} - {budget.account.currency}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget Usage & Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t('finance.budget_usage', 'Budget Usage')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {budget.category && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    {t('finance.category', 'Category')}
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{budget.category.name}</p>
                    {budget.category.description && (
                      <p className="text-sm text-muted-foreground">{budget.category.description}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  {t('finance.spending_progress', 'Spending Progress')}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {formatCurrency(budget.spent_amount, budget.account.currency)} / {formatCurrency(budget.amount, budget.account.currency)}
                    </span>
                    <div className="flex items-center gap-2">
                      {getUsageIcon(usagePercentage)}
                      <span className="text-sm font-medium">{usagePercentage}%</span>
                    </div>
                  </div>
                  <Progress
                    value={usagePercentage}
                    className="h-3"
                    style={{
                      '--progress-background': getUsageColor(usagePercentage)
                    } as React.CSSProperties}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t('finance.spent', 'Spent')}</span>
                    <span>{t('finance.remaining', 'Remaining')}: {formatCurrency(budget.remaining_amount, budget.account.currency)}</span>
                  </div>
                </div>
              </div>

              {usagePercentage >= 80 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      {usagePercentage >= 100
                        ? t('finance.budget_exceeded', 'Budget Exceeded')
                        : t('finance.budget_warning', 'Budget Warning')
                      }
                    </span>
                  </div>
                  <p className="text-xs text-yellow-700 mt-1">
                    {usagePercentage >= 100
                      ? t('finance.budget_exceeded_message', 'You have exceeded your budget limit.')
                      : t('finance.budget_warning_message', 'You are approaching your budget limit.')
                    }
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {t('common.timestamps', 'Timestamps')}
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>{t('common.created', 'Created')}:</strong>{' '}
                    {new Date(budget.created_at).toLocaleString()}
                  </p>
                  <p>
                    <strong>{t('common.updated', 'Updated')}:</strong>{' '}
                    {new Date(budget.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}