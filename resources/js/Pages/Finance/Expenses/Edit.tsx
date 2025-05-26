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
  Download
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

interface Expense {
  id: number;
  expense_number: string;
  account_id: number;
  category_id: number | null;
  title: string;
  description: string | null;
  amount: number;
  expense_date: string;
  vendor: string | null;
  status: string;
  receipt_url: string | null;
}

interface Props {
  expense: Expense;
  accounts: Account[];
  categories: Category[];
  statuses: Record<string, string>;
}

export default function Edit({ expense, accounts, categories, statuses }: Props) {
  const { t } = useTranslate();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const { data, setData, put, processing, errors } = useForm({
    account_id: expense.account_id.toString(),
    category_id: expense.category_id?.toString() || '',
    title: expense.title,
    description: expense.description || '',
    amount: expense.amount.toString(),
    expense_date: expense.expense_date,
    vendor: expense.vendor || '',
    status: expense.status,
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

    put(route('finance.expenses.update', expense.id), {
      data: formData,
      forceFormData: true,
      onSuccess: () => {
        toast.success(t('finance.expense_updated', 'Expense updated successfully'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const selectedAccount = accounts.find(acc => acc.id.toString() === data.account_id);

  return (
    <AppLayout
      title={t('finance.edit_expense', 'Edit Expense')}
      breadcrumbs={[
        { label: t('finance.title', 'Finance'), href: '/finance' },
        { label: t('finance.expenses', 'Expenses'), href: '/finance/expenses' },
        { label: expense.expense_number, href: `/finance/expenses/${expense.id}` },
        { label: t('common.edit', 'Edit') },
      ]}
    >
      <Head title={t('finance.edit_expense', 'Edit Expense')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={route('finance.expenses.show', expense.id)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back', 'Back')}
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('finance.edit_expense', 'Edit Expense')}
            </h1>
            <p className="text-muted-foreground">
              {t('finance.edit_expense_description', 'Update expense information')} - {expense.expense_number}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          <div>
                            <p className="font-medium">{account.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {account.type} - {account.currency}
                            </p>
                          </div>
                        </SelectItem>
                      ))}
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
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          <div>
                            <p className="font-medium">{category.name}</p>
                            {category.description && (
                              <p className="text-xs text-muted-foreground">{category.description}</p>
                            )}
                          </div>
                        </SelectItem>
                      ))}
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
                      {Object.entries(statuses).map(([value, label]) => (
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
                {expense.receipt_url && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{t('finance.current_receipt', 'Current Receipt')}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('finance.receipt_uploaded', 'Receipt file uploaded')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          {t('common.download', 'Download')}
                        </a>
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="receipt">
                    {expense.receipt_url
                      ? t('finance.replace_receipt', 'Replace Receipt File')
                      : t('finance.receipt_file', 'Receipt File')
                    }
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
              <Link href={route('finance.expenses.show', expense.id)}>
                {t('common.cancel', 'Cancel')}
              </Link>
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? t('common.saving', 'Saving...') : t('finance.update_expense', 'Update Expense')}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}