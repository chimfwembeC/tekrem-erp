import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { 
  ArrowLeft, 
  Edit, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  DollarSign,
  Calendar,
  Building,
  Hash,
  FileText
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';

interface Account {
  id: number;
  name: string;
  type: string;
  account_number: string | null;
  bank_name: string | null;
  balance: number;
  initial_balance: number;
  currency: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  transactions: Transaction[];
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  transaction_date: string;
  status: string;
  category: {
    name: string;
    color: string;
  } | null;
  transferToAccount: {
    name: string;
  } | null;
}

interface Stats {
  total_income: number;
  total_expenses: number;
  total_transfers_in: number;
  total_transfers_out: number;
  transaction_count: number;
}

interface Props {
  account: Account;
  stats: Stats;
}

export default function Show({ account, stats }: Props) {
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
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'expense':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'transfer':
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
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
    <AppLayout title={account.name}>
      <Head title={account.name} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={route('finance.accounts.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back', 'Back')}
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{account.name}</h1>
              <p className="text-muted-foreground">
                {t('finance.account_details', 'Account Details')}
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href={route('finance.accounts.edit', account.id)}>
              <Edit className="h-4 w-4 mr-2" />
              {t('common.edit', 'Edit')}
            </Link>
          </Button>
        </div>

        {/* Account Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.current_balance', 'Current Balance')}
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(account.balance, account.currency)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('finance.initial_balance', 'Initial')}: {formatCurrency(account.initial_balance, account.currency)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.total_income', 'Total Income')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.total_income, account.currency)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('finance.from_transactions', 'From transactions')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.total_expenses', 'Total Expenses')}
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.total_expenses, account.currency)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('finance.from_transactions', 'From transactions')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.transactions', 'Transactions')}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.transaction_count}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('finance.total_transactions', 'Total transactions')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              {t('finance.account_information', 'Account Information')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" />
                  {t('finance.account_type', 'Account Type')}
                </div>
                <Badge variant="secondary">
                  {getAccountTypeLabel(account.type)}
                </Badge>
              </div>

              {account.account_number && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    {t('finance.account_number', 'Account Number')}
                  </div>
                  <p className="font-medium">{account.account_number}</p>
                </div>
              )}

              {account.bank_name && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-4 w-4" />
                    {t('finance.bank_name', 'Bank Name')}
                  </div>
                  <p className="font-medium">{account.bank_name}</p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  {t('finance.currency', 'Currency')}
                </div>
                <p className="font-medium">{account.currency}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {t('finance.created_date', 'Created Date')}
                </div>
                <p className="font-medium">{formatDate(account.created_at)}</p>
              </div>

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {t('common.status', 'Status')}
                </div>
                <Badge variant={account.is_active ? 'default' : 'secondary'}>
                  {account.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                </Badge>
              </div>
            </div>

            {account.description && (
              <div className="mt-6 space-y-2">
                <div className="text-sm text-muted-foreground">
                  {t('common.description', 'Description')}
                </div>
                <p className="text-sm">{account.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('finance.recent_transactions', 'Recent Transactions')}
            </CardTitle>
            <CardDescription>
              {t('finance.latest_account_transactions', 'Latest transactions for this account')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {account.transactions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  {t('finance.no_transactions', 'No transactions found for this account')}
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href={route('finance.transactions.create')}>
                    {t('finance.add_transaction', 'Add Transaction')}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('finance.type', 'Type')}</TableHead>
                      <TableHead>{t('common.description', 'Description')}</TableHead>
                      <TableHead>{t('finance.category', 'Category')}</TableHead>
                      <TableHead>{t('finance.amount', 'Amount')}</TableHead>
                      <TableHead>{t('finance.date', 'Date')}</TableHead>
                      <TableHead>{t('common.status', 'Status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {account.transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(transaction.type)}
                            <Badge className={getTransactionTypeColor(transaction.type)} variant="secondary">
                              {transaction.type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            {transaction.transferToAccount && (
                              <p className="text-sm text-muted-foreground">
                                To: {transaction.transferToAccount.name}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {transaction.category ? (
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: transaction.category.color }}
                              />
                              <span className="text-sm">{transaction.category.name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className={transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}>
                            {transaction.type === 'expense' ? '-' : '+'}
                            {formatCurrency(transaction.amount, account.currency)}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {account.transactions.length > 0 && (
              <div className="mt-4 text-center">
                <Button variant="outline" asChild>
                  <Link href={route('finance.transactions.index', { account: account.id })}>
                    {t('finance.view_all_transactions', 'View All Transactions')}
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
