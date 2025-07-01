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
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3,
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Reconciliation {
  id: number;
  reconciliation_number: string;
  account_name: string;
  reconciliation_date: string;
  period_start: string;
  period_end: string;
  statement_opening_balance: number;
  statement_closing_balance: number;
  book_opening_balance: number;
  book_closing_balance: number;
  difference: number;
  status: string;
  matched_transactions_count: number;
  unmatched_bank_transactions_count: number;
  unmatched_book_transactions_count: number;
  reconciled_by?: string;
  reconciled_at?: string;
  approved_by?: string;
  approved_at?: string;
}

interface ReportData {
  title: string;
  generated_at: string;
  period: {
    from: string;
    to: string;
  };
  parameters: {
    account_id?: number;
    status?: string;
  };
  reconciliations: Reconciliation[];
  summary: {
    total_reconciliations: number;
    by_status: Record<string, number>;
    total_difference: number;
    avg_difference: number;
    total_matched_transactions: number;
    total_unmatched_bank: number;
    total_unmatched_book: number;
  };
}

interface Props {
  reportData: ReportData;
}

export default function ReconciliationSummary({ reportData }: Props) {
  const { t } = useTranslate();
  const route = useRoute();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

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
                {formatDate(reportData.period.from)} - {formatDate(reportData.period.to)} • {t('Generated on')} {formatDate(reportData.generated_at)}
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
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{reportData.summary.total_reconciliations}</p>
                  <p className="text-sm text-muted-foreground">{t('Total Reconciliations')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{reportData.summary.total_matched_transactions}</p>
                  <p className="text-sm text-muted-foreground">{t('Matched Transactions')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">{reportData.summary.total_unmatched_bank + reportData.summary.total_unmatched_book}</p>
                  <p className="text-sm text-muted-foreground">{t('Unmatched Transactions')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <p className={`text-2xl font-bold ${
                    Math.abs(reportData.summary.total_difference) < 0.01 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(Math.abs(reportData.summary.total_difference))}
                  </p>
                  <p className="text-sm text-muted-foreground">{t('Total Difference')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Reconciliation Status Breakdown')}</CardTitle>
            <CardDescription>
              {t('Distribution of reconciliations by status')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(reportData.summary.by_status).map(([status, count]) => (
                <div key={status} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    {getStatusIcon(status)}
                  </div>
                  <p className="text-2xl font-bold">{count}</p>
                  <Badge variant="secondary" className={getStatusColor(status)}>
                    {t(status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '))}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reconciliations Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Reconciliation Details')}</CardTitle>
            <CardDescription>
              {t('Detailed list of all reconciliations in the selected period')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Reconciliation #')}</TableHead>
                  <TableHead>{t('Account')}</TableHead>
                  <TableHead>{t('Date')}</TableHead>
                  <TableHead>{t('Period')}</TableHead>
                  <TableHead className="text-right">{t('Statement Balance')}</TableHead>
                  <TableHead className="text-right">{t('Book Balance')}</TableHead>
                  <TableHead className="text-right">{t('Difference')}</TableHead>
                  <TableHead>{t('Transactions')}</TableHead>
                  <TableHead>{t('Status')}</TableHead>
                  <TableHead>{t('Reconciled By')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.reconciliations.map((reconciliation) => (
                  <TableRow key={reconciliation.id}>
                    <TableCell className="font-mono">{reconciliation.reconciliation_number}</TableCell>
                    <TableCell>{reconciliation.account_name}</TableCell>
                    <TableCell>{formatDate(reconciliation.reconciliation_date)}</TableCell>
                    <TableCell className="text-sm">
                      {formatDate(reconciliation.period_start)} - {formatDate(reconciliation.period_end)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(reconciliation.statement_closing_balance)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(reconciliation.book_closing_balance)}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      Math.abs(reconciliation.difference) < 0.01 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(Math.abs(reconciliation.difference))}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-green-600">{reconciliation.matched_transactions_count} {t('matched')}</div>
                        <div className="text-red-600">
                          {reconciliation.unmatched_bank_transactions_count + reconciliation.unmatched_book_transactions_count} {t('unmatched')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(reconciliation.status)}>
                        {t(reconciliation.status.charAt(0).toUpperCase() + reconciliation.status.slice(1).replace('_', ' '))}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {reconciliation.reconciled_by && (
                          <div>{reconciliation.reconciled_by}</div>
                        )}
                        {reconciliation.reconciled_at && (
                          <div className="text-muted-foreground">{formatDate(reconciliation.reconciled_at)}</div>
                        )}
                        {reconciliation.approved_by && (
                          <div className="text-blue-600">
                            {t('Approved by')} {reconciliation.approved_by}
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {reportData.reconciliations.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t('No reconciliations found for the selected period')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('Transaction Summary')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t('Total Matched Transactions')}:</span>
                  <span className="text-green-600 font-bold">{reportData.summary.total_matched_transactions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t('Unmatched Bank Transactions')}:</span>
                  <span className="text-red-600 font-bold">{reportData.summary.total_unmatched_bank}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t('Unmatched Book Transactions')}:</span>
                  <span className="text-red-600 font-bold">{reportData.summary.total_unmatched_book}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{t('Match Rate')}:</span>
                    <span className="font-bold">
                      {reportData.summary.total_matched_transactions > 0 ? (
                        Math.round((reportData.summary.total_matched_transactions / 
                          (reportData.summary.total_matched_transactions + 
                           reportData.summary.total_unmatched_bank + 
                           reportData.summary.total_unmatched_book)) * 100)
                      ) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('Difference Analysis')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t('Total Difference')}:</span>
                  <span className={`font-bold ${
                    Math.abs(reportData.summary.total_difference) < 0.01 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(reportData.summary.total_difference)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t('Average Difference')}:</span>
                  <span className={`font-bold ${
                    Math.abs(reportData.summary.avg_difference) < 0.01 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(reportData.summary.avg_difference)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t('Balanced Reconciliations')}:</span>
                  <span className="font-bold">
                    {reportData.reconciliations.filter(r => Math.abs(r.difference) < 0.01).length} / {reportData.reconciliations.length}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{t('Balance Rate')}:</span>
                    <span className="font-bold">
                      {reportData.reconciliations.length > 0 ? (
                        Math.round((reportData.reconciliations.filter(r => Math.abs(r.difference) < 0.01).length / 
                          reportData.reconciliations.length) * 100)
                      ) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Parameters */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Report Parameters')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">{t('Period From')}:</span>
                <span className="ml-2">{formatDate(reportData.period.from)}</span>
              </div>
              <div>
                <span className="font-medium">{t('Period To')}:</span>
                <span className="ml-2">{formatDate(reportData.period.to)}</span>
              </div>
              <div>
                <span className="font-medium">{t('Account Filter')}:</span>
                <span className="ml-2">{reportData.parameters.account_id ? t('Specific Account') : t('All Accounts')}</span>
              </div>
              <div>
                <span className="font-medium">{t('Status Filter')}:</span>
                <span className="ml-2">{reportData.parameters.status || t('All Statuses')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
