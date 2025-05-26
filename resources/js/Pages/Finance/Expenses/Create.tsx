import React, { useState } from 'react';
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
  TrendingUp,
  Calendar,
  DollarSign,
  Receipt,
  Upload,
  Building,
  Tag,
  Bot
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import ReceiptProcessor from '@/Components/Finance/ReceiptProcessor';
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
  statuses?: Record<string, string>;
}

export default function Create({ accounts = [], categories = [], statuses = {} }: Props) {
  const { t } = useTranslate();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [showReceiptProcessor, setShowReceiptProcessor] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    account_id: '',
    category_id: 'none',
    title: '',
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    vendor: '',
    status: 'draft',
    receipt: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setReceiptFile(file);
    setData('receipt', file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === 'receipt' && value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    post(route('finance.expenses.store'), {
      data: formData,
      forceFormData: true,
      onSuccess: () => {
        toast.success(t('finance.expense_created', 'Expense created successfully'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const formatCurrency = (currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(0).replace('0.00', '');
  };

  const selectedAccount = accounts.find(acc => acc.id.toString() === data.account_id);

  const handleExpenseDataExtracted = (expenseData: any) => {
    setData({
      ...data,
      title: expenseData.title,
      description: expenseData.description,
      amount: expenseData.amount.toString(),
      vendor: expenseData.vendor,
      expense_date: expenseData.expense_date,
    });

    // Try to find and set the suggested category
    if (expenseData.suggested_category) {
      const category = categories.find(cat =>
        cat.name.toLowerCase().includes(expenseData.suggested_category.toLowerCase())
      );
      if (category) {
        setData(prev => ({ ...prev, category_id: category.id.toString() }));
      }
    }

    toast.success('Expense data applied from receipt!');
  };

  return (
    <AppLayout
      title={t('finance.add_expense', 'Add Expense')}
      breadcrumbs={[
        { label: t('finance.title', 'Finance'), href: '/finance' },
        { label: t('finance.expenses', 'Expenses'), href: '/finance/expenses' },
        { label: t('finance.add_expense', 'Add Expense') },
      ]}
    >
      <Head title={t('finance.add_expense', 'Add Expense')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={route('finance.expenses.index')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back', 'Back')}
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('finance.add_expense', 'Add Expense')}
            </h1>
            <p className="text-muted-foreground">
              {t('finance.add_expense_description', 'Record a new business expense')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* AI Receipt Processor */}
          {showReceiptProcessor && (
            <ReceiptProcessor
              onExpenseDataExtracted={handleExpenseDataExtracted}
              onClose={() => setShowReceiptProcessor(false)}
            />
          )}

          <div className="flex justify-end mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReceiptProcessor(true)}
              className="text-purple-600 border-purple-200 hover:bg-purple-50"
            >
              <Bot className="h-4 w-4 mr-2" />
              Process Receipt with AI
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Expense Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t('finance.expense_details', 'Expense Details')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    {t('finance.title', 'Title')} *
                  </Label>
                  <Input
                    id="title"
                    placeholder={t('finance.expense_title_placeholder', 'Enter expense title...')}
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    required
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    {t('finance.description', 'Description')}
                  </Label>
                  <Textarea
                    id="description"
                    placeholder={t('finance.expense_description_placeholder', 'Describe the expense...')}
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      {t('finance.amount', 'Amount')} *
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
                    <Label htmlFor="expense_date">
                      {t('finance.expense_date', 'Expense Date')} *
                    </Label>
                    <Input
                      id="expense_date"
                      type="date"
                      value={data.expense_date}
                      onChange={(e) => setData('expense_date', e.target.value)}
                      required
                    />
                    {errors.expense_date && (
                      <p className="text-sm text-red-600">{errors.expense_date}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vendor">
                    {t('finance.vendor', 'Vendor')}
                  </Label>
                  <Input
                    id="vendor"
                    placeholder={t('finance.vendor_placeholder', 'Vendor or supplier name...')}
                    value={data.vendor}
                    onChange={(e) => setData('vendor', e.target.value)}
                  />
                  {errors.vendor && (
                    <p className="text-sm text-red-600">{errors.vendor}</p>
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
          </div>

          {/* Receipt Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                {t('finance.receipt', 'Receipt')}
              </CardTitle>
              <CardDescription>
                {t('finance.receipt_description', 'Upload a receipt or supporting document for this expense')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="receipt">
                    {t('finance.receipt_file', 'Receipt File')}
                  </Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="receipt"
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </div>
                  {receiptFile && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">{receiptFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  )}
                  {errors.receipt && (
                    <p className="text-sm text-red-600">{errors.receipt}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t('finance.receipt_formats', 'Supported formats: JPG, PNG, PDF, DOC, DOCX (Max 10MB)')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href={route('finance.expenses.index')}>
                {t('common.cancel', 'Cancel')}
              </Link>
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? t('common.saving', 'Saving...') : t('finance.add_expense', 'Add Expense')}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}