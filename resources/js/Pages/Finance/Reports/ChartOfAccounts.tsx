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
  Download,
  FileText,
  Building2,
  Banknote,
  TrendingUp,
  TrendingDown,
  List,
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Account {
  account_code: string;
  name: string;
  type: string;
  category: string;
  subcategory?: string;
  parent_code?: string;
  level: number;
  balance: number;
  normal_balance: 'debit' | 'credit';
  is_active: boolean;
  is_system_account: boolean;
}

interface ReportData {
  title: string;
  generated_at: string;
  as_of_date: string;
  parameters: {
    include_inactive?: boolean;
    category?: string;
  };
  accounts: Account[];
  summary: {
    total_accounts: number;
    active_accounts: number;
    by_category: Record<string, number>;
    total_balance: number;
  };
}

interface Props {
  reportData: ReportData;
}

export default function ChartOfAccounts({ reportData }: Props) {
  const { t } = useTranslate();
  const route = useRoute();

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const groupedAccounts = reportData.accounts.reduce((groups, account) => {
    const category = account.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(account);
    return groups;
  }, {} as Record<string, Account[]>);

  return (
    <AppLayout>
      <Head title={reportData.title} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={route('finance.reports.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('Back to Reports')}
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{reportData.title}</h1>
              <p className="text-muted-foreground">
                {t('As of')} {formatDate(reportData.as_of_date)} • {t('Generated on')} {formatDate(reportData.generated_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t('Export PDF')}
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              {t('Export Excel')}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <List className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{reportData.summary.total_accounts}</p>
                  <p className="text-sm text-muted-foreground">{t('Total Accounts')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{reportData.summary.active_accounts}</p>
                  <p className="text-sm text-muted-foreground">{t('Active Accounts')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Banknote className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(reportData.summary.total_balance)}</p>
                  <p className="text-sm text-muted-foreground">{t('Total Balance')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold">{Object.keys(reportData.summary.by_category).length}</p>
                  <p className="text-sm text-muted-foreground">{t('Categories')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Accounts by Category')}</CardTitle>
            <CardDescription>
              {t('Breakdown of accounts organized by category')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(reportData.summary.by_category).map(([category, count]) => (
                <div key={category} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {getCategoryIcon(category)}
                  </div>
                  <p className="text-2xl font-bold">{count}</p>
                  <Badge variant="secondary" className={getCategoryColor(category)}>
                    {t(category.charAt(0).toUpperCase() + category.slice(1))}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Accounts by Category */}
        {Object.entries(groupedAccounts).map(([category, accounts]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getCategoryIcon(category)}
                <span>{t(category.charAt(0).toUpperCase() + category.slice(1))} ({accounts.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Account Code')}</TableHead>
                    <TableHead>{t('Account Name')}</TableHead>
                    <TableHead>{t('Type')}</TableHead>
                    <TableHead>{t('Parent')}</TableHead>
                    <TableHead className="text-right">{t('Balance')}</TableHead>
                    <TableHead>{t('Normal Balance')}</TableHead>
                    <TableHead>{t('Status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.account_code}>
                      <TableCell className="font-mono">{account.account_code}</TableCell>
                      <TableCell>
                        <div style={{ paddingLeft: `${account.level * 20}px` }}>
                          {account.name}
                          {account.is_system_account && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {t('System')}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{t(account.type.charAt(0).toUpperCase() + account.type.slice(1))}</TableCell>
                      <TableCell className="font-mono">{account.parent_code || '-'}</TableCell>
                      <TableCell className={`text-right font-medium ${
                        account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(account.balance)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {t(account.normal_balance.charAt(0).toUpperCase() + account.normal_balance.slice(1))}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={account.is_active ? 'default' : 'secondary'}>
                          {account.is_active ? t('Active') : t('Inactive')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}

        {/* Report Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Report Parameters')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">{t('As of Date')}:</span>
                <span className="ml-2">{formatDate(reportData.as_of_date)}</span>
              </div>
              <div>
                <span className="font-medium">{t('Include Inactive')}:</span>
                <span className="ml-2">{reportData.parameters.include_inactive ? t('Yes') : t('No')}</span>
              </div>
              <div>
                <span className="font-medium">{t('Category Filter')}:</span>
                <span className="ml-2">{reportData.parameters.category || t('All Categories')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
