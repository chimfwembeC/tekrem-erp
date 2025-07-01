import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface ParentAccount {
  id: number;
  name: string;
  account_code: string;
  level: number;
}

interface Props {
  parentAccount?: ParentAccount;
  parentAccounts: ParentAccount[];
  accountCategories: Record<string, string>;
  accountTypes: Record<string, string>;
  normalBalances: Record<string, string>;
}

export default function Create({
  parentAccount,
  parentAccounts,
  accountCategories,
  accountTypes,
  normalBalances,
}: Props) {
  const { t } = useTranslate();
  const route = useRoute();

  const { data, setData, post, processing, errors } = useForm({
    name: '',
    account_code: '',
    type: '',
    account_category: '',
    account_subcategory: '',
    parent_account_id: parentAccount?.id || '',
    normal_balance: '',
    description: '',
    is_system_account: false,
    allow_manual_entries: true,
    currency: 'USD',
    initial_balance: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('finance.chart-of-accounts.store'), {
      onSuccess: () => {
        toast.success(t('Account created successfully'));
      },
      onError: () => {
        toast.error(t('Failed to create account'));
      },
    });
  };

  const getCategoryNormalBalance = (category: string) => {
    switch (category) {
      case 'assets':
      case 'expenses':
        return 'debit';
      case 'liabilities':
      case 'equity':
      case 'income':
        return 'credit';
      default:
        return '';
    }
  };

  const handleCategoryChange = (category: string) => {
    setData({
      ...data,
      account_category: category,
      normal_balance: getCategoryNormalBalance(category),
    });
  };

  return (
    <AppLayout>
      <Head title={t('Create Account')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={route('finance.chart-of-accounts.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('Back')}
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('Create Account')}</h1>
              <p className="text-muted-foreground">
                {t('Add a new account to your chart of accounts')}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t('Account Information')}</CardTitle>
                  <CardDescription>
                    {t('Basic information about the account')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('Account Name')} *</Label>
                      <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder={t('Enter account name')}
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="account_code">{t('Account Code')}</Label>
                      <Input
                        id="account_code"
                        value={data.account_code}
                        onChange={(e) => setData('account_code', e.target.value)}
                        placeholder={t('Auto-generated if empty')}
                        className={errors.account_code ? 'border-red-500' : ''}
                      />
                      {errors.account_code && (
                        <p className="text-sm text-red-500">{errors.account_code}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {t('Leave empty to auto-generate based on category and parent')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="account_category">{t('Category')} *</Label>
                      <Select
                        value={data.account_category}
                        onValueChange={handleCategoryChange}
                      >
                        <SelectTrigger className={errors.account_category ? 'border-red-500' : ''}>
                          <SelectValue placeholder={t('Select category')} />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(accountCategories).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {t(label)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.account_category && (
                        <p className="text-sm text-red-500">{errors.account_category}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="account_subcategory">{t('Subcategory')}</Label>
                      <Input
                        id="account_subcategory"
                        value={data.account_subcategory}
                        onChange={(e) => setData('account_subcategory', e.target.value)}
                        placeholder={t('Optional subcategory')}
                        className={errors.account_subcategory ? 'border-red-500' : ''}
                      />
                      {errors.account_subcategory && (
                        <p className="text-sm text-red-500">{errors.account_subcategory}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">{t('Account Type')} *</Label>
                      <Select
                        value={data.type}
                        onValueChange={(value) => setData('type', value)}
                      >
                        <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                          <SelectValue placeholder={t('Select type')} />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(accountTypes).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {t(label)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.type && (
                        <p className="text-sm text-red-500">{errors.type}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="normal_balance">{t('Normal Balance')} *</Label>
                      <Select
                        value={data.normal_balance}
                        onValueChange={(value) => setData('normal_balance', value)}
                      >
                        <SelectTrigger className={errors.normal_balance ? 'border-red-500' : ''}>
                          <SelectValue placeholder={t('Select normal balance')} />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(normalBalances).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {t(label)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.normal_balance && (
                        <p className="text-sm text-red-500">{errors.normal_balance}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parent_account_id">{t('Parent Account')}</Label>
                    <Select
                      value={data.parent_account_id.toString()}
                      onValueChange={(value) => setData('parent_account_id', value ? parseInt(value) : '')}
                    >
                      <SelectTrigger className={errors.parent_account_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder={t('Select parent account (optional)')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t('No Parent (Root Account)')}</SelectItem>
                        {parentAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            <span style={{ marginLeft: `${account.level * 12}px` }}>
                              {account.account_code} - {account.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.parent_account_id && (
                      <p className="text-sm text-red-500">{errors.parent_account_id}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{t('Description')}</Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder={t('Optional description')}
                      rows={3}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Settings */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>{t('Settings')}</CardTitle>
                  <CardDescription>
                    {t('Account configuration options')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">{t('Currency')} *</Label>
                      <Select
                        value={data.currency}
                        onValueChange={(value) => setData('currency', value)}
                      >
                        <SelectTrigger className={errors.currency ? 'border-red-500' : ''}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.currency && (
                        <p className="text-sm text-red-500">{errors.currency}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="initial_balance">{t('Initial Balance')}</Label>
                      <Input
                        id="initial_balance"
                        type="number"
                        step="0.01"
                        value={data.initial_balance}
                        onChange={(e) => setData('initial_balance', e.target.value)}
                        placeholder="0.00"
                        className={errors.initial_balance ? 'border-red-500' : ''}
                      />
                      {errors.initial_balance && (
                        <p className="text-sm text-red-500">{errors.initial_balance}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_system_account"
                        checked={data.is_system_account}
                        onCheckedChange={(checked) => setData('is_system_account', !!checked)}
                      />
                      <Label htmlFor="is_system_account" className="text-sm">
                        {t('System Account')}
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('System accounts cannot be deleted')}
                    </p>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allow_manual_entries"
                        checked={data.allow_manual_entries}
                        onCheckedChange={(checked) => setData('allow_manual_entries', !!checked)}
                      />
                      <Label htmlFor="allow_manual_entries" className="text-sm">
                        {t('Allow Manual Entries')}
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t('Allow direct transactions to this account')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="mt-6 flex items-center justify-end space-x-2">
                <Button variant="outline" asChild>
                  <Link href={route('finance.chart-of-accounts.index')}>
                    {t('Cancel')}
                  </Link>
                </Button>
                <Button type="submit" disabled={processing}>
                  <Save className="h-4 w-4 mr-2" />
                  {processing ? t('Creating...') : t('Create Account')}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
