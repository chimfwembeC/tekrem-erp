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
  ArrowLeft,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Building2,
  Banknote,
  TrendingUp,
  TrendingDown,
  List,
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
  children?: Account[];
}

interface Props {
  accountTree: Account[];
  categories: string[];
  types: string[];
  filters: {
    category?: string;
    type?: string;
    search?: string;
    show_inactive?: boolean;
  };
}

export default function Tree({ accountTree, categories, types, filters }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
  const [selectedType, setSelectedType] = useState(filters.type || '');
  const [showInactive, setShowInactive] = useState(filters.show_inactive || false);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  const handleSearch = () => {
    router.get(route('finance.chart-of-accounts.tree'), {
      search: searchTerm,
      category: selectedCategory,
      type: selectedType,
      show_inactive: showInactive,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedType('');
    setShowInactive(false);
    router.get(route('finance.chart-of-accounts.tree'));
  };

  const handleDelete = (account: Account) => {
    if (account.is_system_account) {
      toast.error(t('Cannot delete system accounts'));
      return;
    }

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

  const toggleNode = (accountId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedNodes(newExpanded);
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

  const renderAccountNode = (account: Account, depth: number = 0) => {
    const hasChildren = account.children && account.children.length > 0;
    const isExpanded = expandedNodes.has(account.id);
    const paddingLeft = depth * 24;

    return (
      <div key={account.id} className="border-b border-gray-100 last:border-b-0">
        <div className="flex items-center py-3 px-4 hover:bg-gray-50">
          <div className="flex items-center flex-1" style={{ paddingLeft: `${paddingLeft}px` }}>
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 mr-2"
                onClick={() => toggleNode(account.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="w-8 mr-2" />
            )}

            <div className="flex items-center space-x-3 flex-1">
              <div className="flex items-center space-x-2">
                {getCategoryIcon(account.account_category)}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{account.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {account.account_code}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t(account.type.charAt(0).toUpperCase() + account.type.slice(1))}
                    {account.account_subcategory && ` • ${account.account_subcategory}`}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 ml-auto">
                <Badge variant="secondary" className={getCategoryColor(account.account_category)}>
                  {t(account.account_category.charAt(0).toUpperCase() + account.account_category.slice(1))}
                </Badge>

                <div className="text-right">
                  <div className={`font-medium ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatBalance(account.balance)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t(account.normal_balance.charAt(0).toUpperCase() + account.normal_balance.slice(1))}
                  </div>
                </div>

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
                    <DropdownMenuItem asChild>
                      <Link href={route('finance.chart-of-accounts.create', { parent: account.id })}>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('Add Child')}
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
              </div>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {account.children!.map((child) => renderAccountNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <AppLayout>
      <Head title={t('Chart of Accounts - Tree View')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={route('finance.chart-of-accounts.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('Back to List')}
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('Chart of Accounts - Tree View')}</h1>
              <p className="text-muted-foreground">
                {t('Hierarchical view of your chart of accounts structure')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild variant="outline">
              <Link href={route('finance.chart-of-accounts.index')}>
                <List className="h-4 w-4 mr-2" />
                {t('List View')}
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
                <label className="text-sm font-medium">{t('Options')}</label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{t('Show Inactive')}</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={handleReset}>
                {t('Reset')}
              </Button>
              <Button onClick={handleSearch}>
                <Filter className="h-4 w-4 mr-2" />
                {t('Apply Filters')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Tree */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Account Hierarchy')}</CardTitle>
            <CardDescription>
              {t('Click on the chevron icons to expand/collapse account groups')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {accountTree.map((account) => renderAccountNode(account))}
            </div>

            {accountTree.length === 0 && (
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
