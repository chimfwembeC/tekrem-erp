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
  Download,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
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
  period_start: string;
  period_end: string;
  opening_balance: number;
  closing_balance: number;
  import_method: 'manual' | 'csv' | 'excel' | 'api';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_name?: string;
  transaction_count: number;
  total_debit_amount: number;
  total_credit_amount: number;
  net_change: number;
  account: Account;
  imported_by?: {
    id: number;
    name: string;
  };
  created_at: string;
}

interface Props {
  statements: {
    data: BankStatement[];
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

export default function Index({ statements, accounts, filters, statuses }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedAccount, setSelectedAccount] = useState(filters.account_id || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
  const [dateFrom, setDateFrom] = useState(filters.date_from || '');
  const [dateTo, setDateTo] = useState(filters.date_to || '');

  const handleSearch = () => {
    router.get(route('finance.bank-statements.index'), {
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
    router.get(route('finance.bank-statements.index'));
  };

  const handleDelete = (statement: BankStatement) => {
    if (confirm(t('Are you sure you want to delete this bank statement?'))) {
      router.delete(route('finance.bank-statements.destroy', statement.id), {
        onSuccess: () => {
          toast.success(t('Bank statement deleted successfully'));
        },
        onError: (errors) => {
          toast.error(errors.error || t('Failed to delete bank statement'));
        },
      });
    }
  };

  const handleReprocess = (statement: BankStatement) => {
    if (statement.status !== 'failed') {
      toast.error(t('Can only reprocess failed imports'));
      return;
    }

    router.post(route('finance.bank-statements.reprocess', statement.id), {}, {
      onSuccess: () => {
        toast.success(t('Statement reprocessing started'));
      },
      onError: (errors) => {
        toast.error(errors.error || t('Failed to reprocess statement'));
      },
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImportMethodIcon = (method: string) => {
    switch (method) {
      case 'manual':
        return <Edit className="h-4 w-4" />;
      case 'csv':
      case 'excel':
        return <Upload className="h-4 w-4" />;
      case 'api':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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
      <Head title={t('Bank Statements')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('Bank Statements')}</h1>
            <p className="text-muted-foreground">
              {t('Import and manage bank statements for reconciliation')}
            </p>
          </div>
          <Button asChild>
            <Link href={route('finance.bank-statements.create')}>
              <Plus className="h-4 w-4 mr-2" />
              {t('Import Statement')}
            </Link>
          </Button>
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
                    placeholder={t('Search statements...')}
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

        {/* Statements Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Bank Statements')}</CardTitle>
            <CardDescription>
              {t('Showing :from to :to of :total statements', {
                from: statements.from,
                to: statements.to,
                total: statements.total,
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Statement #')}</TableHead>
                  <TableHead>{t('Account')}</TableHead>
                  <TableHead>{t('Period')}</TableHead>
                  <TableHead>{t('Import Method')}</TableHead>
                  <TableHead>{t('Status')}</TableHead>
                  <TableHead>{t('Transactions')}</TableHead>
                  <TableHead>{t('Net Change')}</TableHead>
                  <TableHead className="w-[100px]">{t('Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statements.data.map((statement) => (
                  <TableRow key={statement.id}>
                    <TableCell className="font-mono">
                      {statement.statement_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{statement.account.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {statement.account.account_code}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(statement.period_start)}</div>
                        <div className="text-muted-foreground">
                          to {formatDate(statement.period_end)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getImportMethodIcon(statement.import_method)}
                        <span className="ml-1">
                          {t(statement.import_method.charAt(0).toUpperCase() + statement.import_method.slice(1))}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(statement.status)}>
                        {getStatusIcon(statement.status)}
                        <span className="ml-1">{t(statuses[statement.status])}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{statement.transaction_count} transactions</div>
                        <div className="text-muted-foreground">
                          {formatCurrency(statement.total_debit_amount)} / {formatCurrency(statement.total_credit_amount)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={statement.net_change >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(statement.net_change)}
                      </span>
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
                            <Link href={route('finance.bank-statements.show', statement.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t('View')}
                            </Link>
                          </DropdownMenuItem>
                          {statement.import_method === 'manual' && (
                            <DropdownMenuItem asChild>
                              <Link href={route('finance.bank-statements.edit', statement.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                {t('Edit')}
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {statement.file_name && (
                            <DropdownMenuItem asChild>
                              <Link href={route('finance.bank-statements.download', statement.id)}>
                                <Download className="h-4 w-4 mr-2" />
                                {t('Download File')}
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {statement.status === 'failed' && (
                            <DropdownMenuItem onClick={() => handleReprocess(statement)}>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              {t('Reprocess')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(statement)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('Delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {statements.data.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t('No bank statements found')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
