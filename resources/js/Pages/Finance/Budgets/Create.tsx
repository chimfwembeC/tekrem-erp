import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import {
  ArrowLeft,
  PieChart,
  Calendar,
  DollarSign,
  Building,
  Tag,
  Target
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import { toast } from 'sonner';

interface Account {
  id: number;
  name: string;
  currency: string;
  type: string;
}

interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface Props {
  accounts?: Account[];
  categories?: Category[];
  periodTypes?: Record<string, string>;
  statuses?: Record<string, string>;
}

export default function Create({ accounts = [], categories = [], periodTypes = {}, statuses = {} }: Props) {
  const { t } = useTranslate();

  const { data, setData, post, processing, errors } = useForm({
    account_id: '',
    category_id: 'none',
    name: '',
    description: '',
    amount: '',
    period_type: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    status: 'active',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post(route('finance.budgets.store'), {
      onSuccess: () => {
        toast.success(t('finance.budget_created', 'Budget created successfully'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const calculateEndDate = (startDate: string, periodType: string) => {
    if (!startDate) return '';

    const start = new Date(startDate);
    let end = new Date(start);

    switch (periodType) {
      case 'weekly':
        end.setDate(start.getDate() + 7);
        break;
      case 'monthly':
        end.setMonth(start.getMonth() + 1);
        break;
      case 'quarterly':
        end.setMonth(start.getMonth() + 3);
        break;
      case 'yearly':
        end.setFullYear(start.getFullYear() + 1);
        break;
      default:
        end.setMonth(start.getMonth() + 1);
    }

    return end.toISOString().split('T')[0];
  };

  const handlePeriodTypeChange = (value: string) => {
    setData('period_type', value);
    if (data.start_date) {
      const newEndDate = calculateEndDate(data.start_date, value);
      setData('end_date', newEndDate);
    }
  };

  const handleStartDateChange = (value: string) => {
    setData('start_date', value);
    if (value) {
      const newEndDate = calculateEndDate(value, data.period_type);
      setData('end_date', newEndDate);
    }
  };

  const selectedAccount = accounts?.find(acc => acc.id.toString() === data.account_id);

  return (
    <AppLayout
      title={t('finance.create_budget', 'Create Budget')}
      breadcrumbs={[
        { label: t('finance.title', 'Finance'), href: '/finance' },
        { label: t('finance.budgets', 'Budgets'), href: '/finance/budgets' },
        { label: t('finance.create_budget', 'Create Budget') },
      ]}
    >
      <Head title={t('finance.create_budget', 'Create Budget')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={route('finance.budgets.index')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back', 'Back')}
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('finance.create_budget', 'Create Budget')}
            </h1>
            <p className="text-muted-foreground">
              {t('finance.create_budget_description', 'Set up a new financial budget to track your spending')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Budget Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  {t('finance.budget_details', 'Budget Details')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {t('finance.budget_name', 'Budget Name')} *
                  </Label>
                  <Input
                    id="name"
                    placeholder={t('finance.budget_name_placeholder', 'Enter budget name...')}
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    {t('finance.description', 'Description')}
                  </Label>
                  <Textarea
                    id="description"
                    placeholder={t('finance.budget_description_placeholder', 'Describe the purpose of this budget...')}
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">
                    {t('finance.budget_amount', 'Budget Amount')} *
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={data.amount}
                      onChange={(e) => setData('amount', e.target.value)}
                      className="pl-8"
                      required
                    />
                  </div>
                  {selectedAccount && (
                    <p className="text-xs text-muted-foreground">
                      Currency: {selectedAccount.currency}
                    </p>
                  )}
                  {errors.amount && (
                    <p className="text-sm text-red-600">{errors.amount}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">
                    {t('common.status', 'Status')} *
                  </Label>
                  <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statuses || {}).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-600">{errors.status}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account & Category */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {t('finance.account_category', 'Account & Category')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account_id">
                    {t('finance.account', 'Account')} *
                  </Label>
                  <Select value={data.account_id} onValueChange={(value) => setData('account_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('finance.select_account', 'Select account')} />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          <div>
                            <p className="font-medium">{account.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {account.type} - {account.currency}
                            </p>
                          </div>
                        </SelectItem>
                      )) || []}
                    </SelectContent>
                  </Select>
                  {errors.account_id && (
                    <p className="text-sm text-red-600">{errors.account_id}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category_id">
                    {t('finance.category', 'Category')}
                  </Label>
                  <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('finance.select_category', 'Select category (optional)')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('finance.no_category', 'No category')}</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          <div>
                            <p className="font-medium">{category.name}</p>
                            {category.description && (
                              <p className="text-xs text-muted-foreground">{category.description}</p>
                            )}
                          </div>
                        </SelectItem>
                      )) || []}
                    </SelectContent>
                  </Select>
                  {errors.category_id && (
                    <p className="text-sm text-red-600">{errors.category_id}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Budget Period */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('finance.budget_period', 'Budget Period')}
              </CardTitle>
              <CardDescription>
                {t('finance.budget_period_description', 'Define the time period for this budget')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="period_type">
                  {t('finance.period_type', 'Period Type')} *
                </Label>
                <Select value={data.period_type} onValueChange={handlePeriodTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(periodTypes || {}).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.period_type && (
                  <p className="text-sm text-red-600">{errors.period_type}</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="start_date">
                    {t('finance.start_date', 'Start Date')} *
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={data.start_date}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    required
                  />
                  {errors.start_date && (
                    <p className="text-sm text-red-600">{errors.start_date}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_date">
                    {t('finance.end_date', 'End Date')} *
                  </Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={data.end_date}
                    onChange={(e) => setData('end_date', e.target.value)}
                    required
                  />
                  {errors.end_date && (
                    <p className="text-sm text-red-600">{errors.end_date}</p>
                  )}
                </div>
              </div>

              {data.start_date && data.end_date && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {t('finance.budget_duration', 'Budget Duration')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(data.start_date).toLocaleDateString()} - {new Date(data.end_date).toLocaleDateString()}
                    {' '}({Math.ceil((new Date(data.end_date).getTime() - new Date(data.start_date).getTime()) / (1000 * 60 * 60 * 24))} days)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href={route('finance.budgets.index')}>
                {t('common.cancel', 'Cancel')}
              </Link>
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? t('common.saving', 'Saving...') : t('finance.create_budget', 'Create Budget')}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}