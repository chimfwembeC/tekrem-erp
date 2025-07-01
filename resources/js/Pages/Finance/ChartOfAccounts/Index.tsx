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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
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
  TreePine,
  Building2,
  Banknote,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface Account {
  id: number;
  name: string;
  account_code: string;
  type: string;
  account_category: string;
  account_subcategory?: string;
  parent_account_id?: number;
  level: number;
  normal_balance: 'debit' | 'credit';
  balance: number;
  is_system_account: boolean;
  allow_manual_entries: boolean;
  is_active: boolean;
  created_at: string;
  parentAccount?: Account;
  childAccounts?: Account[];
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
  categories: string[];
  types: string[];
  filters: {
    category?: string;
    type?: string;
    search?: string;
    level?: string;
    system_accounts_only?: boolean;
    manual_entries_only?: boolean;
  };
}

export default function Index({ accounts, categories, types, filters }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
  const [selectedType, setSelectedType] = useState(filters.type || '');
  const [selectedLevel, setSelectedLevel] = useState(filters.level || '');
  const [systemAccountsOnly, setSystemAccountsOnly] = useState(filters.system_accounts_only || false);
  const [manualEntriesOnly, setManualEntriesOnly] = useState(filters.manual_entries_only || false);

  const handleSearch = () => {
    router.get(route('finance.chart-of-accounts.index'), {
      search: searchTerm,
      category: selectedCategory,
      type: selectedType,
      level: selectedLevel,
      system_accounts_only: systemAccountsOnly,
      manual_entries_only: manualEntriesOnly,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedType('');
    setSelectedLevel('');
    setSystemAccountsOnly(false);
    setManualEntriesOnly(false);
    router.get(route('finance.chart-of-accounts.index'));
  };

  const handleDelete = (account: Account) => {
    if (confirm(t('Are you sure you want to delete this account?'))) {
      router.delete(route('finance.chart-of-accounts.destroy', account.id), {
        onSuccess: () => {
          toast.success(t('Account deleted successfully'));
        },
        onError: (errors) => {
          toast.error(errors.error || t('Failed to delete account'));
        },
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'assets':
        return <Building2 className="h-4 w-4" />;
      case 'liabilities':
        return <TrendingDown className="h-4 w-4" />;
      case 'equity':
        return <Banknote className="h-4 w-4" />;
      case 'income':
        return <TrendingUp className="h-4 w-4" />;
      case 'expenses':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Building2 className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'assets':
        return 'bg-blue-100 text-blue-800';
      case 'liabilities':
        return 'bg-red-100 text-red-800';
      case 'equity':
        return 'bg-purple-100 text-purple-800';
      case 'income':
        return 'bg-green-100 text-green-800';
      case 'expenses':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBalance = (balance: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(balance);
  };

  return (
    <AppLayout>
      <Head title={t('Chart of Accounts')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('Chart of Accounts')}</h1>
            <p className="text-muted-foreground">
              {t('Manage your hierarchical chart of accounts structure')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild variant="outline">
              <Link href={route('finance.chart-of-accounts.tree')}>
                <TreePine className="h-4 w-4 mr-2" />
                {t('Tree View')}
              </Link>
            </Button>
            <Button asChild>
              <Link href={route('finance.chart-of-accounts.create')}>
                <Plus className="h-4 w-4 mr-2" />
                {t('Add Account')}
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('Filters')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('Search')}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('Search accounts...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('Category')}</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('All Categories')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('All Categories')}</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {t(category.charAt(0).toUpperCase() + category.slice(1))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('Type')}</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('All Types')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('All Types')}</SelectItem>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(type.charAt(0).toUpperCase() + type.slice(1))}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('Level')}</label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('All Levels')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('All Levels')}</SelectItem>
                    <SelectItem value="0">{t('Level 0 (Root)')}</SelectItem>
                    <SelectItem value="1">{t('Level 1')}</SelectItem>
                    <SelectItem value="2">{t('Level 2')}</SelectItem>
                    <SelectItem value="3">{t('Level 3')}</SelectItem>
                    <SelectItem value="4">{t('Level 4+')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={systemAccountsOnly}
                    onChange={(e) => setSystemAccountsOnly(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{t('System Accounts Only')}</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={manualEntriesOnly}
                    onChange={(e) => setManualEntriesOnly(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{t('Manual Entries Only')}</span>
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={handleReset}>
                  {t('Reset')}
                </Button>
                <Button onClick={handleSearch}>
                  <Filter className="h-4 w-4 mr-2" />
                  {t('Apply Filters')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accounts Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Accounts')}</CardTitle>
            <CardDescription>
              {t('Showing :from to :to of :total accounts', {
                from: accounts.from,
                to: accounts.to,
                total: accounts.total,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Account Code')}</TableHead>
                  <TableHead>{t('Account Name')}</TableHead>
                  <TableHead>{t('Category')}</TableHead>
                  <TableHead>{t('Type')}</TableHead>
                  <TableHead>{t('Level')}</TableHead>
                  <TableHead>{t('Balance')}</TableHead>
                  <TableHead>{t('Status')}</TableHead>
                  <TableHead className="w-[100px]">{t('Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.data.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-mono">
                      {account.account_code}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div style={{ marginLeft: `${account.level * 20}px` }}>
                          {account.level > 0 && (
                            <ChevronRight className="h-4 w-4 text-muted-foreground inline mr-1" />
                          )}
                          <span className="font-medium">{account.name}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getCategoryColor(account.account_category)}>
                        {getCategoryIcon(account.account_category)}
                        <span className="ml-1">
                          {t(account.account_category.charAt(0).toUpperCase() + account.account_category.slice(1))}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {t(account.type.charAt(0).toUpperCase() + account.type.slice(1))}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{account.level}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className={account.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatBalance(account.balance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge variant={account.is_active ? 'default' : 'secondary'}>
                          {account.is_active ? t('Active') : t('Inactive')}
                        </Badge>
                        {account.is_system_account && (
                          <Badge variant="outline" className="text-xs">
                            {t('System')}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={route('finance.chart-of-accounts.show', account.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t('View')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={route('finance.chart-of-accounts.edit', account.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              {t('Edit')}
                            </Link>
                          </DropdownMenuItem>
                          {!account.is_system_account && (
                            <DropdownMenuItem
                              onClick={() => handleDelete(account)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('Delete')}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {accounts.data.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t('No accounts found')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
