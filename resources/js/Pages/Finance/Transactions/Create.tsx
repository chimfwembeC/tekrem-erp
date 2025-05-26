import React, { useState, useEffect } from 'react';
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
import { ArrowLeft, Save, CreditCard, AlertCircle, Bot } from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useFinanceAI from '@/Hooks/useFinanceAI';
import AISuggestions from '@/Components/Finance/AISuggestions';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/Components/ui/alert';

interface Account {
  id: number;
  name: string;
  currency: string;
}

interface Category {
  id: number;
  name: string;
  type: string;
  color: string;
}

interface Props {
  accounts?: Account[];
  categories?: Category[];
  transactionTypes?: Record<string, string>;
  statuses?: Record<string, string>;
  selectedAccount?: Account;
}

export default function Create({
  accounts = [],
  categories = [],
  transactionTypes = {},
  statuses = {},
  selectedAccount
}: Props) {
  const { t } = useTranslate();
  const { getTransactionSuggestions, suggestions, loading: aiLoading, clearSuggestions } = useFinanceAI();
  const [filteredCategories, setFilteredCategories] = useState<Category[]>(categories);
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    type: '',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    account_id: selectedAccount?.id.toString() || '',
    category_id: 'none',
    transfer_to_account_id: '',
    reference_number: '',
    status: 'completed',
  });

  // Filter categories based on transaction type
  useEffect(() => {
    if (data.type) {
      const filtered = categories.filter(category =>
        category.type === data.type || category.type === 'both'
      );
      setFilteredCategories(filtered);

      // Reset category if current selection is not valid for the new type
      if (data.category_id && data.category_id !== 'none' && !filtered.find(cat => cat.id.toString() === data.category_id)) {
        setData('category_id', 'none');
      }
    } else {
      setFilteredCategories(categories);
    }
  }, [data.type, categories]);

  // Get available transfer accounts (exclude selected account)
  const transferAccounts = accounts?.filter(account =>
    account.id.toString() !== data.account_id
  ) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post(route('finance.transactions.store'), {
      onSuccess: () => {
        toast.success(t('finance.transaction_created', 'Transaction created successfully'));
        reset();
      },
      onError: (errors) => {
        toast.error(t('finance.create_error', 'Error creating transaction'));
      },
    });
  };

  const handleTypeChange = (type: string) => {
    setData(prevData => ({
      ...prevData,
      type,
      category_id: 'none', // Reset category when type changes
      transfer_to_account_id: type === 'transfer' ? prevData.transfer_to_account_id : '', // Reset transfer account if not transfer
    }));
  };

  const handleGetAISuggestions = async () => {
    if (!data.description.trim()) {
      toast.error('Please enter a description first');
      return;
    }

    setShowAISuggestions(true);
    await getTransactionSuggestions({
      description: data.description,
      amount: data.amount ? parseFloat(data.amount) : undefined,
      date: data.transaction_date,
    });
  };

  const handleApplySuggestion = (type: string, value: any) => {
    switch (type) {
      case 'category':
        // Find category by name
        const category = filteredCategories.find(cat =>
          cat.name.toLowerCase() === value.toLowerCase()
        );
        if (category) {
          setData('category_id', category.id.toString());
          toast.success('Category applied successfully');
        } else {
          toast.info(`Category "${value}" not found in your categories`);
        }
        break;
      case 'description':
        setData('description', value);
        toast.success('Description updated successfully');
        break;
      default:
        break;
    }
  };

  const handleDismissAI = () => {
    setShowAISuggestions(false);
    clearSuggestions();
  };

  return (
    <AppLayout title={t('finance.create_transaction', 'Create Transaction')}>
      <Head title={t('finance.create_transaction', 'Create Transaction')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={route('finance.transactions.index')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back', 'Back')}
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('finance.create_transaction', 'Create Transaction')}
            </h1>
            <p className="text-muted-foreground">
              {t('finance.create_transaction_description', 'Add a new financial transaction')}
            </p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t('finance.transaction_details', 'Transaction Details')}
            </CardTitle>
            <CardDescription>
              {t('finance.transaction_details_description', 'Enter the details for your new transaction')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Transaction Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">
                    {t('finance.transaction_type', 'Transaction Type')} *
                  </Label>
                  <Select value={data.type} onValueChange={handleTypeChange}>
                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                      <SelectValue placeholder={t('finance.select_transaction_type', 'Select transaction type')} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(transactionTypes || {}).map(([value, label]) => (
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

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    {t('finance.amount', 'Amount')} *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={data.amount}
                    onChange={(e) => setData('amount', e.target.value)}
                    placeholder="0.00"
                    className={errors.amount ? 'border-red-500' : ''}
                  />
                  {errors.amount && (
                    <p className="text-sm text-red-600">{errors.amount}</p>
                  )}
                </div>

                {/* Account */}
                <div className="space-y-2">
                  <Label htmlFor="account_id">
                    {t('finance.account', 'Account')} *
                  </Label>
                  <Select value={data.account_id} onValueChange={(value) => setData('account_id', value)}>
                    <SelectTrigger className={errors.account_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder={t('finance.select_account', 'Select account')} />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.name} ({account.currency})
                        </SelectItem>
                      )) || []}
                    </SelectContent>
                  </Select>
                  {errors.account_id && (
                    <p className="text-sm text-red-600">{errors.account_id}</p>
                  )}
                </div>

                {/* Transfer To Account (only for transfers) */}
                {data.type === 'transfer' && (
                  <div className="space-y-2">
                    <Label htmlFor="transfer_to_account_id">
                      {t('finance.transfer_to_account', 'Transfer To Account')} *
                    </Label>
                    <Select
                      value={data.transfer_to_account_id}
                      onValueChange={(value) => setData('transfer_to_account_id', value)}
                    >
                      <SelectTrigger className={errors.transfer_to_account_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder={t('finance.select_destination_account', 'Select destination account')} />
                      </SelectTrigger>
                      <SelectContent>
                        {transferAccounts?.map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.name} ({account.currency})
                          </SelectItem>
                        )) || []}
                      </SelectContent>
                    </Select>
                    {errors.transfer_to_account_id && (
                      <p className="text-sm text-red-600">{errors.transfer_to_account_id}</p>
                    )}
                  </div>
                )}

                {/* Category (not for transfers) */}
                {data.type && data.type !== 'transfer' && (
                  <div className="space-y-2">
                    <Label htmlFor="category_id">
                      {t('finance.category', 'Category')}
                    </Label>
                    <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                      <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder={t('finance.select_category', 'Select category')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{t('common.no_category', 'No Category')}</SelectItem>
                        {filteredCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category_id && (
                      <p className="text-sm text-red-600">{errors.category_id}</p>
                    )}
                  </div>
                )}

                {/* Transaction Date */}
                <div className="space-y-2">
                  <Label htmlFor="transaction_date">
                    {t('finance.transaction_date', 'Transaction Date')} *
                  </Label>
                  <Input
                    id="transaction_date"
                    type="date"
                    value={data.transaction_date}
                    onChange={(e) => setData('transaction_date', e.target.value)}
                    className={errors.transaction_date ? 'border-red-500' : ''}
                  />
                  {errors.transaction_date && (
                    <p className="text-sm text-red-600">{errors.transaction_date}</p>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">
                    {t('common.status', 'Status')} *
                  </Label>
                  <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                    <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                      <SelectValue placeholder={t('finance.select_status', 'Select status')} />
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

                {/* Reference Number */}
                <div className="space-y-2">
                  <Label htmlFor="reference_number">
                    {t('finance.reference_number', 'Reference Number')}
                  </Label>
                  <Input
                    id="reference_number"
                    type="text"
                    value={data.reference_number}
                    onChange={(e) => setData('reference_number', e.target.value)}
                    placeholder={t('finance.reference_number_placeholder', 'e.g., INV-001, CHK-123')}
                    className={errors.reference_number ? 'border-red-500' : ''}
                  />
                  {errors.reference_number && (
                    <p className="text-sm text-red-600">{errors.reference_number}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">
                    {t('common.description', 'Description')} *
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetAISuggestions}
                    disabled={!data.description.trim() || aiLoading}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Bot className="h-4 w-4 mr-1" />
                    {aiLoading ? 'Getting AI Suggestions...' : 'Get AI Suggestions'}
                  </Button>
                </div>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder={t('finance.transaction_description_placeholder', 'Enter transaction description')}
                  rows={3}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* AI Suggestions */}
              {showAISuggestions && suggestions && (
                <AISuggestions
                  suggestions={suggestions}
                  onApplySuggestion={handleApplySuggestion}
                  onDismiss={handleDismissAI}
                  loading={aiLoading}
                />
              )}

              {/* Status Warning */}
              {data.status === 'pending' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t('finance.pending_transaction_note', 'Pending transactions will not affect account balances until marked as completed.')}
                  </AlertDescription>
                </Alert>
              )}

              {/* Form Actions */}
              <div className="flex items-center gap-4 pt-6 border-t">
                <Button type="submit" disabled={processing}>
                  <Save className="h-4 w-4 mr-2" />
                  {processing ? t('common.creating', 'Creating...') : t('finance.create_transaction', 'Create Transaction')}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href={route('finance.transactions.index')}>
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
