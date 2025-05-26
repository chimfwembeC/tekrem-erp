import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { ArrowLeft, Save, Wallet } from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import { toast } from 'sonner';

interface Props {
  accountTypes?: Record<string, string>;
  currencies?: Record<string, string>;
}

export default function Create({ accountTypes = {}, currencies = {} }: Props) {
  const { t } = useTranslate();

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    type: '',
    account_number: '',
    bank_name: '',
    initial_balance: '',
    currency: 'USD',
    description: '',
    is_active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post(route('finance.accounts.store'), {
      onSuccess: () => {
        toast.success(t('finance.account_created', 'Account created successfully'));
        reset();
      },
      onError: (errors) => {
        toast.error(t('finance.create_error', 'Error creating account'));
      },
    });
  };

  return (
    <AppLayout title={t('finance.create_account', 'Create Account')}>
      <Head title={t('finance.create_account', 'Create Account')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={route('finance.accounts.index')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back', 'Back')}
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('finance.create_account', 'Create Account')}
            </h1>
            <p className="text-muted-foreground">
              {t('finance.create_account_description', 'Add a new financial account to track your money')}
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              {t('finance.account_details', 'Account Details')}
            </CardTitle>
            <CardDescription>
              {t('finance.account_details_description', 'Enter the details for your new account')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">
                    {t('finance.account_name', 'Account Name')} *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder={t('finance.account_name_placeholder', 'e.g., Main Checking Account')}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Account Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">
                    {t('finance.account_type', 'Account Type')} *
                  </Label>
                  <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                      <SelectValue placeholder={t('finance.select_account_type', 'Select account type')} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(accountTypes || {}).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-600">{errors.type}</p>
                  )}
                </div>

                {/* Account Number */}
                <div className="space-y-2">
                  <Label htmlFor="account_number">
                    {t('finance.account_number', 'Account Number')}
                  </Label>
                  <Input
                    id="account_number"
                    type="text"
                    value={data.account_number}
                    onChange={(e) => setData('account_number', e.target.value)}
                    placeholder={t('finance.account_number_placeholder', 'e.g., 1234567890')}
                    className={errors.account_number ? 'border-red-500' : ''}
                  />
                  {errors.account_number && (
                    <p className="text-sm text-red-600">{errors.account_number}</p>
                  )}
                </div>

                {/* Bank Name */}
                <div className="space-y-2">
                  <Label htmlFor="bank_name">
                    {t('finance.bank_name', 'Bank Name')}
                  </Label>
                  <Input
                    id="bank_name"
                    type="text"
                    value={data.bank_name}
                    onChange={(e) => setData('bank_name', e.target.value)}
                    placeholder={t('finance.bank_name_placeholder', 'e.g., Chase Bank')}
                    className={errors.bank_name ? 'border-red-500' : ''}
                  />
                  {errors.bank_name && (
                    <p className="text-sm text-red-600">{errors.bank_name}</p>
                  )}
                </div>

                {/* Initial Balance */}
                <div className="space-y-2">
                  <Label htmlFor="initial_balance">
                    {t('finance.initial_balance', 'Initial Balance')} *
                  </Label>
                  <Input
                    id="initial_balance"
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.initial_balance}
                    onChange={(e) => setData('initial_balance', e.target.value)}
                    placeholder="0.00"
                    className={errors.initial_balance ? 'border-red-500' : ''}
                  />
                  {errors.initial_balance && (
                    <p className="text-sm text-red-600">{errors.initial_balance}</p>
                  )}
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label htmlFor="currency">
                    {t('finance.currency', 'Currency')} *
                  </Label>
                  <Select value={data.currency} onValueChange={(value) => setData('currency', value)}>
                    <SelectTrigger className={errors.currency ? 'border-red-500' : ''}>
                      <SelectValue placeholder={t('finance.select_currency', 'Select currency')} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(currencies || {}).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {value} - {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.currency && (
                    <p className="text-sm text-red-600">{errors.currency}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  {t('common.description', 'Description')}
                </Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder={t('finance.account_description_placeholder', 'Optional description for this account')}
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={data.is_active}
                  onCheckedChange={(checked) => setData('is_active', checked)}
                />
                <Label htmlFor="is_active">
                  {t('finance.account_active', 'Account is active')}
                </Label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-4 pt-6 border-t">
                <Button type="submit" disabled={processing}>
                  <Save className="h-4 w-4 mr-2" />
                  {processing ? t('common.creating', 'Creating...') : t('finance.create_account', 'Create Account')}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={route('finance.accounts.index')}>
                    {t('common.cancel', 'Cancel')}
                  </Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
