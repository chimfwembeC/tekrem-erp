import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Calendar
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  transaction_date: string;
  reference_number: string | null;
  status: string;
  account: {
    id: number;
    name: string;
    currency: string;
  };
  category: {
    id: number;
    name: string;
    color: string;
  } | null;
  transferToAccount: {
    id: number;
    name: string;
  } | null;
  invoice: any | null;
  expense: any | null;
}

interface Account {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
  type: string;
  color: string;
}

interface Props {
  transactions: {
    data: Transaction[];
    links?: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  accounts?: Account[];
  categories?: Category[];
  transactionTypes: Record<string, string>;
  statuses: Record<string, string>;
  filters: {
    search?: string;
    account?: string;
    type?: string;
    status?: string;
    category?: string;
    date_from?: string;
    date_to?: string;
  };
}

export default function Index({
  transactions,
  accounts,
  categories,
  transactionTypes,
  statuses,
  filters
}: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [search, setSearch] = useState(filters.search || '');
  const [selectedAccount, setSelectedAccount] = useState(filters.account || 'all');
  const [selectedType, setSelectedType] = useState(filters.type || 'all');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
  const [dateFrom, setDateFrom] = useState(filters.date_from || '');
  const [dateTo, setDateTo] = useState(filters.date_to || '');

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const handleSearch = () => {
    router.get(route('finance.transactions.index'), {
      search,
      account: selectedAccount === 'all' ? '' : selectedAccount,
      type: selectedType === 'all' ? '' : selectedType,
      status: selectedStatus === 'all' ? '' : selectedStatus,
      category: selectedCategory === 'all' ? '' : selectedCategory,
      date_from: dateFrom,
      date_to: dateTo,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleReset = () => {
    setSearch('');
    setSelectedAccount('all');
    setSelectedType('all');
    setSelectedStatus('all');
    setSelectedCategory('all');
    setDateFrom('');
    setDateTo('');
    router.get(route('finance.transactions.index'), {}, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDelete = (transaction: Transaction) => {
    if (confirm(t('finance.confirm_delete_transaction', 'Are you sure you want to delete this transaction?'))) {
      router.delete(route('finance.transactions.destroy', transaction.id), {
        onSuccess: () => {
          toast.success(t('finance.transaction_deleted', 'Transaction deleted successfully'));
        },
        onError: (errors) => {
          toast.error(errors.message || t('finance.delete_error', 'Error deleting transaction'));
        },
      });
    }
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
        return <ArrowRightLeft className="h-4 w-4 text-blue-600" />;
      default:
        return <CreditCard className="h-4 w-4" />;
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

  return (
    <AppLayout title={t('finance.transactions', 'Transactions')}>
      <Head title={t('finance.transactions', 'Transactions')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <CardTitle>{t('finance.transactions', 'Transactions')}</CardTitle>
                <CardDescription>
                  {t('finance.transactions_description', 'Track your income, expenses, and transfers')}
                </CardDescription>
              </div>
              <Link href={route('finance.transactions.create')}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('finance.add_transaction', 'Add Transaction')}
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2 flex-1">
                  <Input
                    type="text"
                    placeholder={t('finance.search_transactions', 'Search transactions...')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button type="submit" variant="secondary">{t('common.search', 'Search')}</Button>
                </form>

                <div className="flex gap-2">
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t('common.all_accounts', 'All Accounts')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_accounts', 'All Accounts')}</SelectItem>
                      {accounts?.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t('common.all_types', 'All Types')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_types', 'All Types')}</SelectItem>
                      {transactionTypes && Object.entries(transactionTypes).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t('common.all_statuses', 'All Statuses')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_statuses', 'All Statuses')}</SelectItem>
                      {statuses && Object.entries(statuses).map(([value, label]) => (
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

              {transactions.data.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('finance.no_transactions', 'No transactions found')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {t('finance.create_first_transaction_desc', 'Get started by creating your first transaction.')}
                  </p>
                  <Link href={route('finance.transactions.create')}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('finance.add_transaction', 'Add Transaction')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">{t('finance.type', 'Type')}</th>
                        <th className="text-left p-2">{t('common.description', 'Description')}</th>
                        <th className="text-left p-2">{t('finance.account', 'Account')}</th>
                        <th className="text-left p-2">{t('finance.category', 'Category')}</th>
                        <th className="text-left p-2">{t('finance.amount', 'Amount')}</th>
                        <th className="text-left p-2">{t('finance.date', 'Date')}</th>
                        <th className="text-left p-2">{t('common.status', 'Status')}</th>
                        <th className="text-left p-2">{t('common.actions', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.data.map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(transaction.type)}
                              <Badge className={getTransactionTypeColor(transaction.type)} variant="secondary">
                                {(transactionTypes && transactionTypes[transaction.type]) || transaction.type}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-2">
                            <div>
                              <div className="font-medium">{transaction.description}</div>
                              {transaction.reference_number && (
                                <div className="text-sm text-muted-foreground">
                                  Ref: {transaction.reference_number}
                                </div>
                              )}
                              {transaction.transferToAccount && (
                                <div className="text-sm text-muted-foreground">
                                  To: {transaction.transferToAccount.name}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <span className="font-medium">{transaction.account.name}</span>
                          </td>
                          <td className="p-2">
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
                          </td>
                          <td className="p-2">
                            <span className={transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}>
                              {transaction.type === 'expense' ? '-' : '+'}
                              {formatCurrency(transaction.amount, transaction.account.currency)}
                            </span>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(transaction.transaction_date)}
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge className={getStatusColor(transaction.status)} variant="secondary">
                              {(statuses && statuses[transaction.status]) || transaction.status}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <Link href={route('finance.transactions.edit', transaction.id)}>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4 mr-1" />
                                  {t('common.edit', 'Edit')}
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(transaction)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                {t('common.delete', 'Delete')}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {transactions.last_page > 1 && (
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {transactions.from} to {transactions.to} of {transactions.total} transactions
                  </div>
                  <div className="flex gap-1">
                    {transactions.links?.map((link, i) => {
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
