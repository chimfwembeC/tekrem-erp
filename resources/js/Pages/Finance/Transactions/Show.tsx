import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  ArrowRightLeft,
  Calendar,
  Hash,
  FileText,
  Building,
  Tag,
  DollarSign,
  Receipt,
  User
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  transaction_date: string;
  reference_number: string | null;
  status: string;
  created_at: string;
  account: {
    id: number;
    name: string;
    currency: string;
    type: string;
  };
  category: {
    id: number;
    name: string;
    color: string;
    type: string;
  } | null;
  transferToAccount: {
    id: number;
    name: string;
    currency: string;
  } | null;
  invoice: {
    id: number;
    invoice_number: string;
  } | null;
  expense: {
    id: number;
    title: string;
  } | null;
}

interface Props {
  transaction: Transaction;
}

export default function Show({ transaction }: Props) {
  const { t } = useTranslate();

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const getTransactionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      income: 'bg-green-100 text-green-800',
      expense: 'bg-red-100 text-red-800',
      transfer: 'bg-blue-100 text-blue-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'income':
        return <TrendingUp className="h-6 w-6 text-green-600" />;
      case 'expense':
        return <TrendingDown className="h-6 w-6 text-red-600" />;
      case 'transfer':
        return <ArrowRightLeft className="h-6 w-6 text-blue-600" />;
      default:
        return <CreditCard className="h-6 w-6" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTransactionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      income: 'Income',
      expense: 'Expense',
      transfer: 'Transfer'
    };
    return types[type] || type;
  };

  const getAccountTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      checking: 'Checking',
      savings: 'Savings',
      business: 'Business',
      credit_card: 'Credit Card',
      investment: 'Investment',
      loan: 'Loan',
      other: 'Other'
    };
    return types[type] || type;
  };

  return (
    <AppLayout title={`Transaction #${transaction.id}`}>
      <Head title={`Transaction #${transaction.id}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={route('finance.transactions.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back', 'Back')}
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Transaction #{transaction.id}
              </h1>
              <p className="text-muted-foreground">
                {t('finance.transaction_details', 'Transaction Details')}
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href={route('finance.transactions.edit', transaction.id)}>
              <Edit className="h-4 w-4 mr-2" />
              {t('common.edit', 'Edit')}
            </Link>
          </Button>
        </div>

        {/* Transaction Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.transaction_type', 'Transaction Type')}
              </CardTitle>
              {getTransactionIcon(transaction.type)}
            </CardHeader>
            <CardContent>
              <Badge className={getTransactionTypeColor(transaction.type)} variant="secondary">
                {getTransactionTypeLabel(transaction.type)}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.amount', 'Amount')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <span className={transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}>
                  {transaction.type === 'expense' ? '-' : '+'}
                  {formatCurrency(transaction.amount, transaction.account.currency)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('common.status', 'Status')}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge className={getStatusColor(transaction.status)} variant="secondary">
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Transaction Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {t('finance.transaction_information', 'Transaction Information')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  {t('finance.transaction_id', 'Transaction ID')}
                </div>
                <p className="font-medium">#{transaction.id}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {t('finance.transaction_date', 'Transaction Date')}
                </div>
                <p className="font-medium">{formatDate(transaction.transaction_date)}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building className="h-4 w-4" />
                  {t('finance.account', 'Account')}
                </div>
                <div>
                  <p className="font-medium">{transaction.account.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {getAccountTypeLabel(transaction.account.type)} • {transaction.account.currency}
                  </p>
                </div>
              </div>

              {transaction.transferToAccount && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ArrowRightLeft className="h-4 w-4" />
                    {t('finance.transfer_to_account', 'Transfer To Account')}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.transferToAccount.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.transferToAccount.currency}
                    </p>
                  </div>
                </div>
              )}

              {transaction.category && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    {t('finance.category', 'Category')}
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: transaction.category.color }}
                    />
                    <span className="font-medium">{transaction.category.name}</span>
                  </div>
                </div>
              )}

              {transaction.reference_number && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Receipt className="h-4 w-4" />
                    {t('finance.reference_number', 'Reference Number')}
                  </div>
                  <p className="font-medium">{transaction.reference_number}</p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {t('finance.created_date', 'Created Date')}
                </div>
                <p className="font-medium">{formatDateTime(transaction.created_at)}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                {t('common.description', 'Description')}
              </div>
              <p className="text-sm bg-muted p-3 rounded-md">{transaction.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Related Records */}
        {(transaction.invoice || transaction.expense) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('finance.related_records', 'Related Records')}
              </CardTitle>
              <CardDescription>
                {t('finance.related_records_description', 'Records associated with this transaction')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transaction.invoice && (
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <Receipt className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{t('finance.invoice', 'Invoice')}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.invoice.invoice_number}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={route('finance.invoices.show', transaction.invoice.id)}>
                        {t('common.view', 'View')}
                      </Link>
                    </Button>
                  </div>
                )}

                {transaction.expense && (
                  <div className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium">{t('finance.expense', 'Expense')}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.expense.title}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={route('finance.expenses.show', transaction.expense.id)}>
                        {t('common.view', 'View')}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>{t('common.actions', 'Actions')}</CardTitle>
            <CardDescription>
              {t('finance.transaction_actions_description', 'Available actions for this transaction')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href={route('finance.transactions.edit', transaction.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {t('common.edit', 'Edit Transaction')}
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link href={route('finance.accounts.show', transaction.account.id)}>
                  <Building className="h-4 w-4 mr-2" />
                  {t('finance.view_account', 'View Account')}
                </Link>
              </Button>

              {transaction.transferToAccount && (
                <Button variant="outline" asChild>
                  <Link href={route('finance.accounts.show', transaction.transferToAccount.id)}>
                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                    {t('finance.view_transfer_account', 'View Transfer Account')}
                  </Link>
                </Button>
              )}

              {transaction.category && (
                <Button variant="outline" asChild>
                  <Link href={route('finance.categories.show', transaction.category.id)}>
                    <Tag className="h-4 w-4 mr-2" />
                    {t('finance.view_category', 'View Category')}
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
