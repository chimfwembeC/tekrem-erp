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
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Settings,
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface Account {
  id: number;
  name: string;
  account_code: string;
}

interface BankStatement {
  id: number;
  statement_number: string;
  statement_date: string;
}

interface BankReconciliation {
  id: number;
  reconciliation_number: string;
  reconciliation_date: string;
  period_start: string;
  period_end: string;
  status: 'in_progress' | 'completed' | 'reviewed' | 'approved';
  statement_opening_balance: number;
  statement_closing_balance: number;
  book_opening_balance: number;
  book_closing_balance: number;
  difference: number;
  progress_percentage: number;
  notes?: string;
  account: Account;
  bank_statement: BankStatement;
  reconciled_by?: {
    id: number;
    name: string;
  };
  created_at: string;
}

interface Props {
  reconciliations: {
    data: BankReconciliation[];
    links?: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  accounts: Account[];
  filters: {
    account_id?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    search?: string;
  };
  statuses: Record<string, string>;
}

export default function Index({ reconciliations, accounts, filters, statuses }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedAccount, setSelectedAccount] = useState(filters.account_id || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
  const [dateFrom, setDateFrom] = useState(filters.date_from || '');
  const [dateTo, setDateTo] = useState(filters.date_to || '');

  const handleSearch = () => {
    router.get(route('finance.bank-reconciliation.index'), {
      search: searchTerm,
      account_id: selectedAccount,
      status: selectedStatus,
      date_from: dateFrom,
      date_to: dateTo,
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedAccount('');
    setSelectedStatus('');
    setDateFrom('');
    setDateTo('');
    router.get(route('finance.bank-reconciliation.index'));
  };

  const handleDelete = (reconciliation: BankReconciliation) => {
    if (reconciliation.status === 'approved') {
      toast.error(t('Cannot delete approved reconciliations'));
      return;
    }

    if (confirm(t('Are you sure you want to delete this reconciliation?'))) {
      router.delete(route('finance.bank-reconciliation.destroy', reconciliation.id), {
        onSuccess: () => {
          toast.success(t('Reconciliation deleted successfully'));
        },
        onError: (errors) => {
          toast.error(errors.error || t('Failed to delete reconciliation'));
        },
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'reviewed':
        return <FileText className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'reviewed':
        return 'bg-purple-100 text-purple-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
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

  return (
    <AppLayout>
      <Head title={t('Bank Reconciliation')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('Bank Reconciliation')}</h1>
            <p className="text-muted-foreground">
              {t('Manage bank statement reconciliations and transaction matching')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" asChild>
              <Link href={route('finance.bank-reconciliation.workspace')}>
                <Settings className="h-4 w-4 mr-2" />
                {t('Workspace')}
              </Link>
            </Button>
            <Button asChild>
              <Link href={route('finance.bank-reconciliation.create')}>
                <Plus className="h-4 w-4 mr-2" />
                {t('New Reconciliation')}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('Search')}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('Search reconciliations...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('Account')}</label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('All Accounts')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('All Accounts')}</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.account_code} - {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('Status')}</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('All Statuses')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t('All Statuses')}</SelectItem>
                    {Object.entries(statuses).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {t(label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('Date From')}</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{t('Date To')}</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
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

        {/* Reconciliations Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Reconciliations')}</CardTitle>
            <CardDescription>
              {t('Showing :from to :to of :total reconciliations', {
                from: reconciliations.from,
                to: reconciliations.to,
                total: reconciliations.total,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Reconciliation #')}</TableHead>
                  <TableHead>{t('Account')}</TableHead>
                  <TableHead>{t('Period')}</TableHead>
                  <TableHead>{t('Status')}</TableHead>
                  <TableHead>{t('Progress')}</TableHead>
                  <TableHead>{t('Difference')}</TableHead>
                  <TableHead>{t('Date')}</TableHead>
                  <TableHead className="w-[100px]">{t('Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reconciliations.data.map((reconciliation) => (
                  <TableRow key={reconciliation.id}>
                    <TableCell className="font-mono">
                      {reconciliation.reconciliation_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{reconciliation.account.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {reconciliation.account.account_code}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(reconciliation.period_start)}</div>
                        <div className="text-muted-foreground">
                          to {formatDate(reconciliation.period_end)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(reconciliation.status)}>
                        {getStatusIcon(reconciliation.status)}
                        <span className="ml-1">{t(statuses[reconciliation.status])}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${reconciliation.progress_percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {reconciliation.progress_percentage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={reconciliation.difference === 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(reconciliation.difference)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatDate(reconciliation.reconciliation_date)}
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
                            <Link href={route('finance.bank-reconciliation.show', reconciliation.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t('View')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={route('finance.bank-reconciliation.export', reconciliation.id)}>
                              <Download className="h-4 w-4 mr-2" />
                              {t('Export')}
                            </Link>
                          </DropdownMenuItem>
                          {reconciliation.status !== 'approved' && (
                            <DropdownMenuItem
                              onClick={() => handleDelete(reconciliation)}
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

            {reconciliations.data.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t('No reconciliations found')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
