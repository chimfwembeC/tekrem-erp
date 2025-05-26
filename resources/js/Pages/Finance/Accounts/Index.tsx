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
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Wallet,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface Account {
  id: number;
  name: string;
  type: string;
  account_number: string | null;
  bank_name: string | null;
  balance: number;
  initial_balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  transactions: any[];
}

interface Props {
  accounts: {
    data: Account[];
    links?: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  accountTypes: Record<string, string>;
  filters: {
    search?: string;
    type?: string;
    status?: string;
  };
}

export default function Index({ accounts, accountTypes, filters }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [search, setSearch] = useState(filters.search || '');
  const [selectedType, setSelectedType] = useState(filters.type || 'all');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const handleSearch = () => {
    router.get(route('finance.accounts.index'), {
      search,
      type: selectedType === 'all' ? '' : selectedType,
      status: selectedStatus === 'all' ? '' : selectedStatus,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleReset = () => {
    setSearch('');
    setSelectedType('all');
    setSelectedStatus('all');
    router.get(route('finance.accounts.index'), {}, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDelete = (account: Account) => {
    if (confirm(t('finance.confirm_delete_account', 'Are you sure you want to delete this account?'))) {
      router.delete(route('finance.accounts.destroy', account.id), {
        onSuccess: () => {
          toast.success(t('finance.account_deleted', 'Account deleted successfully'));
        },
        onError: (errors) => {
          toast.error(errors.message || t('finance.delete_error', 'Error deleting account'));
        },
      });
    }
  };

  const getAccountTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      checking: 'bg-blue-100 text-blue-800',
      savings: 'bg-green-100 text-green-800',
      business: 'bg-purple-100 text-purple-800',
      credit_card: 'bg-red-100 text-red-800',
      investment: 'bg-yellow-100 text-yellow-800',
      loan: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || colors.other;
  };

  const getBalanceIcon = (balance: number) => {
    return balance >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <AppLayout title={t('finance.accounts', 'Accounts')}>
      <Head title={t('finance.accounts', 'Accounts')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <CardTitle>{t('finance.accounts', 'Accounts')}</CardTitle>
                <CardDescription>
                  {t('finance.accounts_description', 'Manage your financial accounts')}
                </CardDescription>
              </div>
              <Link href={route('finance.accounts.create')}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('finance.add_account', 'Add Account')}
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2 flex-1">
                  <Input
                    type="text"
                    placeholder={t('finance.search_accounts', 'Search accounts...')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button type="submit" variant="secondary">{t('common.search', 'Search')}</Button>
                </form>

                <div className="flex gap-2">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t('common.all_types', 'All Types')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_types', 'All Types')}</SelectItem>
                      {accountTypes && Object.entries(accountTypes).map(([value, label]) => (
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
                      <SelectItem value="active">{t('common.active', 'Active')}</SelectItem>
                      <SelectItem value="inactive">{t('common.inactive', 'Inactive')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={handleReset}>
                    {t('common.reset', 'Reset')}
                  </Button>
                </div>
              </div>

              {accounts.data.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {t('finance.no_accounts', 'No accounts found')}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {t('finance.create_first_account_desc', 'Get started by creating your first account.')}
                  </p>
                  <Link href={route('finance.accounts.create')}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('finance.add_account', 'Add Account')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">{t('finance.account_name', 'Account Name')}</th>
                        <th className="text-left p-2">{t('finance.type', 'Type')}</th>
                        <th className="text-left p-2">{t('finance.bank', 'Bank')}</th>
                        <th className="text-left p-2">{t('finance.balance', 'Balance')}</th>
                        <th className="text-left p-2">{t('common.status', 'Status')}</th>
                        <th className="text-left p-2">{t('finance.transactions', 'Transactions')}</th>
                        <th className="text-left p-2">{t('common.actions', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.data.map((account) => (
                        <tr key={account.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <div>
                              <div className="font-medium">{account.name}</div>
                              {account.account_number && (
                                <div className="text-sm text-muted-foreground">
                                  {account.account_number}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge className={getAccountTypeColor(account.type)} variant="secondary">
                              {(accountTypes && accountTypes[account.type]) || account.type}
                            </Badge>
                          </td>
                          <td className="p-2">
                            {account.bank_name || (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              {getBalanceIcon(account.balance)}
                              <span className={account.balance < 0 ? 'text-red-600' : 'text-green-600'}>
                                {formatCurrency(account.balance, account.currency)}
                              </span>
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge variant={account.is_active ? 'default' : 'secondary'}>
                              {account.is_active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <span className="text-sm text-muted-foreground">
                              {account.transactions?.length || 0} {t('finance.recent', 'recent')}
                            </span>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <Link href={route('finance.accounts.edit', account.id)}>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4 mr-1" />
                                  {t('common.edit', 'Edit')}
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(account)}
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
              {accounts.last_page > 1 && (
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {accounts.from} to {accounts.to} of {accounts.total} accounts
                  </div>
                  <div className="flex gap-1">
                    {accounts.links?.map((link, i) => {
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
