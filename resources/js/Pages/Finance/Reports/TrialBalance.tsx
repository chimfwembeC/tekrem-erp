import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/Components/ui/table';
import {
  ArrowLeft,
  Download,
  FileText,
  CheckCircle,
  AlertCircle,
  Calculator,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Account {
  account_code: string;
  name: string;
  debit_balance: number;
  credit_balance: number;
}

interface ReportData {
  title: string;
  generated_at: string;
  as_of_date: string;
  parameters: {
    include_zero_balances?: boolean;
  };
  accounts: Account[];
  totals: {
    total_debits: number;
    total_credits: number;
    difference: number;
    is_balanced: boolean;
  };
}

interface Props {
  reportData: ReportData;
}

export default function TrialBalance({ reportData }: Props) {
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

        {/* Balance Status Alert */}
        <Alert className={reportData.totals.is_balanced ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <div className="flex items-center space-x-2">
            {reportData.totals.is_balanced ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={reportData.totals.is_balanced ? 'text-green-800' : 'text-red-800'}>
              {reportData.totals.is_balanced ? (
                t('Trial balance is balanced - debits equal credits')
              ) : (
                t('Trial balance is out of balance by :amount', {
                  amount: formatCurrency(Math.abs(reportData.totals.difference))
                })
              )}
            </AlertDescription>
          </div>
        </Alert>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calculator className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{reportData.accounts.length}</p>
                  <p className="text-sm text-muted-foreground">{t('Accounts')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(reportData.totals.total_debits)}</p>
                  <p className="text-sm text-muted-foreground">{t('Total Debits')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(reportData.totals.total_credits)}</p>
                  <p className="text-sm text-muted-foreground">{t('Total Credits')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                {reportData.totals.is_balanced ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-red-600" />
                )}
                <div>
                  <p className={`text-2xl font-bold ${
                    reportData.totals.is_balanced ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(Math.abs(reportData.totals.difference))}
                  </p>
                  <p className="text-sm text-muted-foreground">{t('Difference')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trial Balance Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('Trial Balance')}</CardTitle>
            <CardDescription>
              {t('Account balances as of')} {formatDate(reportData.as_of_date)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Account Code')}</TableHead>
                  <TableHead>{t('Account Name')}</TableHead>
                  <TableHead className="text-right">{t('Debit Balance')}</TableHead>
                  <TableHead className="text-right">{t('Credit Balance')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.accounts.map((account) => (
                  <TableRow key={account.account_code}>
                    <TableCell className="font-mono">{account.account_code}</TableCell>
                    <TableCell>{account.name}</TableCell>
                    <TableCell className="text-right font-medium">
                      {account.debit_balance > 0 ? (
                        <span className="text-green-600">{formatCurrency(account.debit_balance)}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {account.credit_balance > 0 ? (
                        <span className="text-red-600">{formatCurrency(account.credit_balance)}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-gray-50">
                  <TableCell colSpan={2} className="font-bold">
                    {t('TOTALS')}
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    {formatCurrency(reportData.totals.total_debits)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-red-600">
                    {formatCurrency(reportData.totals.total_credits)}
                  </TableCell>
                </TableRow>
                <TableRow className={`${
                  reportData.totals.is_balanced ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  <TableCell colSpan={2} className="font-bold">
                    {t('DIFFERENCE')}
                  </TableCell>
                  <TableCell colSpan={2} className={`text-right font-bold ${
                    reportData.totals.is_balanced ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(Math.abs(reportData.totals.difference))}
                    {!reportData.totals.is_balanced && (
                      <span className="ml-2 text-sm">
                        ({reportData.totals.difference > 0 ? t('Debit Heavy') : t('Credit Heavy')})
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>

            {reportData.accounts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t('No accounts with balances found')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Balance Analysis */}
        {!reportData.totals.is_balanced && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span>{t('Balance Analysis')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    {t('The trial balance is out of balance. This indicates potential data entry errors or missing transactions that need to be investigated.')}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">{t('Possible Causes:')}</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• {t('Incomplete journal entries')}</li>
                      <li>• {t('Data entry errors')}</li>
                      <li>• {t('Missing transactions')}</li>
                      <li>• {t('Incorrect account classifications')}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">{t('Recommended Actions:')}</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• {t('Review recent journal entries')}</li>
                      <li>• {t('Check for unposted transactions')}</li>
                      <li>• {t('Verify account balances')}</li>
                      <li>• {t('Run account reconciliations')}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                <span className="font-medium">{t('Include Zero Balances')}:</span>
                <span className="ml-2">{reportData.parameters.include_zero_balances ? t('Yes') : t('No')}</span>
              </div>
              <div>
                <span className="font-medium">{t('Generated')}:</span>
                <span className="ml-2">{formatDate(reportData.generated_at)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
