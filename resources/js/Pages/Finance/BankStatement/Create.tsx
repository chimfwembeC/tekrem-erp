import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { ArrowLeft, Upload, FileText, Download, AlertCircle } from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface Account {
  id: number;
  name: string;
  account_code: string;
}

interface PreviewTransaction {
  date: string;
  description: string;
  reference?: string;
  debit_amount: number;
  credit_amount: number;
  balance: number;
  errors?: string[];
}

interface Props {
  accounts: Account[];
  previewData?: {
    transactions: PreviewTransaction[];
    summary: {
      total_transactions: number;
      total_debits: number;
      total_credits: number;
      opening_balance: number;
      closing_balance: number;
      errors: string[];
    };
  };
}

export default function Create({ accounts, previewData }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [activeTab, setActiveTab] = useState('import');

  const { data, setData, post, processing, errors } = useForm({
    account_id: '',
    statement_number: '',
    statement_date: '',
    period_start: '',
    period_end: '',
    opening_balance: '',
    closing_balance: '',
    import_method: 'csv',
    file: null as File | null,
    column_mapping: {
      date: '',
      description: '',
      reference: '',
      debit: '',
      credit: '',
      balance: '',
    },
    date_format: 'Y-m-d',
    skip_header_rows: '1',
    notes: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('file', file);
    }
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data.file) {
      toast.error(t('Please select a file to import'));
      return;
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'file' && value) {
        formData.append(key, value);
      } else if (key === 'column_mapping') {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== '') {
        formData.append(key, value.toString());
      }
    });

    post(route('finance.bank-statements.preview'), {
      data: formData,
      onSuccess: () => {
        setActiveTab('preview');
        toast.success(t('File preview generated successfully'));
      },
      onError: () => {
        toast.error(t('Failed to preview file'));
      },
    });
  };

  const handleImport = () => {
    post(route('finance.bank-statements.store'), {
      onSuccess: () => {
        toast.success(t('Bank statement imported successfully'));
      },
      onError: () => {
        toast.error(t('Failed to import bank statement'));
      },
    });
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
      <Head title={t('Import Bank Statement')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={route('finance.bank-statements.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('Back')}
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('Import Bank Statement')}</h1>
              <p className="text-muted-foreground">
                {t('Import transactions from CSV or Excel files')}
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">{t('Import Settings')}</TabsTrigger>
            <TabsTrigger value="preview" disabled={!previewData}>
              {t('Preview & Confirm')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-6">
            <form onSubmit={handlePreview} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Statement Information */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('Statement Information')}</CardTitle>
                      <CardDescription>
                        {t('Basic information about the bank statement')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="account_id">{t('Account')} *</Label>
                          <Select
                            value={data.account_id.toString()}
                            onValueChange={(value) => setData('account_id', value)}
                          >
                            <SelectTrigger className={errors.account_id ? 'border-red-500' : ''}>
                              <SelectValue placeholder={t('Select account')} />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id.toString()}>
                                  {account.account_code} - {account.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.account_id && (
                            <p className="text-sm text-red-500">{errors.account_id}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="statement_number">{t('Statement Number')} *</Label>
                          <Input
                            id="statement_number"
                            value={data.statement_number}
                            onChange={(e) => setData('statement_number', e.target.value)}
                            placeholder={t('Enter statement number')}
                            className={errors.statement_number ? 'border-red-500' : ''}
                          />
                          {errors.statement_number && (
                            <p className="text-sm text-red-500">{errors.statement_number}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="statement_date">{t('Statement Date')} *</Label>
                          <Input
                            id="statement_date"
                            type="date"
                            value={data.statement_date}
                            onChange={(e) => setData('statement_date', e.target.value)}
                            className={errors.statement_date ? 'border-red-500' : ''}
                          />
                          {errors.statement_date && (
                            <p className="text-sm text-red-500">{errors.statement_date}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="period_start">{t('Period Start')} *</Label>
                          <Input
                            id="period_start"
                            type="date"
                            value={data.period_start}
                            onChange={(e) => setData('period_start', e.target.value)}
                            className={errors.period_start ? 'border-red-500' : ''}
                          />
                          {errors.period_start && (
                            <p className="text-sm text-red-500">{errors.period_start}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="period_end">{t('Period End')} *</Label>
                          <Input
                            id="period_end"
                            type="date"
                            value={data.period_end}
                            onChange={(e) => setData('period_end', e.target.value)}
                            className={errors.period_end ? 'border-red-500' : ''}
                          />
                          {errors.period_end && (
                            <p className="text-sm text-red-500">{errors.period_end}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="opening_balance">{t('Opening Balance')} *</Label>
                          <Input
                            id="opening_balance"
                            type="number"
                            step="0.01"
                            value={data.opening_balance}
                            onChange={(e) => setData('opening_balance', e.target.value)}
                            placeholder="0.00"
                            className={errors.opening_balance ? 'border-red-500' : ''}
                          />
                          {errors.opening_balance && (
                            <p className="text-sm text-red-500">{errors.opening_balance}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="closing_balance">{t('Closing Balance')} *</Label>
                          <Input
                            id="closing_balance"
                            type="number"
                            step="0.01"
                            value={data.closing_balance}
                            onChange={(e) => setData('closing_balance', e.target.value)}
                            placeholder="0.00"
                            className={errors.closing_balance ? 'border-red-500' : ''}
                          />
                          {errors.closing_balance && (
                            <p className="text-sm text-red-500">{errors.closing_balance}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">{t('Notes')}</Label>
                        <Textarea
                          id="notes"
                          value={data.notes}
                          onChange={(e) => setData('notes', e.target.value)}
                          placeholder={t('Optional notes about this statement')}
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* File Import Settings */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>{t('File Import')}</CardTitle>
                      <CardDescription>
                        {t('Upload and configure file import settings')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="import_method">{t('Import Method')} *</Label>
                        <Select
                          value={data.import_method}
                          onValueChange={(value) => setData('import_method', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="csv">CSV File</SelectItem>
                            <SelectItem value="excel">Excel File</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="file">{t('File')} *</Label>
                        <Input
                          id="file"
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleFileChange}
                          className={errors.file ? 'border-red-500' : ''}
                        />
                        {errors.file && (
                          <p className="text-sm text-red-500">{errors.file}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {t('Supported formats: CSV, Excel (.xlsx, .xls)')}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date_format">{t('Date Format')}</Label>
                        <Select
                          value={data.date_format}
                          onValueChange={(value) => setData('date_format', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Y-m-d">YYYY-MM-DD</SelectItem>
                            <SelectItem value="m/d/Y">MM/DD/YYYY</SelectItem>
                            <SelectItem value="d/m/Y">DD/MM/YYYY</SelectItem>
                            <SelectItem value="d-m-Y">DD-MM-YYYY</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="skip_header_rows">{t('Skip Header Rows')}</Label>
                        <Input
                          id="skip_header_rows"
                          type="number"
                          min="0"
                          value={data.skip_header_rows}
                          onChange={(e) => setData('skip_header_rows', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          {t('Number of rows to skip at the beginning of the file')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Column Mapping */}
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>{t('Column Mapping')}</CardTitle>
                      <CardDescription>
                        {t('Map CSV columns to transaction fields')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t('Date Column')} *</Label>
                        <Input
                          value={data.column_mapping.date}
                          onChange={(e) => setData('column_mapping', {
                            ...data.column_mapping,
                            date: e.target.value
                          })}
                          placeholder={t('e.g., A, 1, Date')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('Description Column')} *</Label>
                        <Input
                          value={data.column_mapping.description}
                          onChange={(e) => setData('column_mapping', {
                            ...data.column_mapping,
                            description: e.target.value
                          })}
                          placeholder={t('e.g., B, 2, Description')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('Reference Column')}</Label>
                        <Input
                          value={data.column_mapping.reference}
                          onChange={(e) => setData('column_mapping', {
                            ...data.column_mapping,
                            reference: e.target.value
                          })}
                          placeholder={t('e.g., C, 3, Reference')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('Debit Column')}</Label>
                        <Input
                          value={data.column_mapping.debit}
                          onChange={(e) => setData('column_mapping', {
                            ...data.column_mapping,
                            debit: e.target.value
                          })}
                          placeholder={t('e.g., D, 4, Debit')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('Credit Column')}</Label>
                        <Input
                          value={data.column_mapping.credit}
                          onChange={(e) => setData('column_mapping', {
                            ...data.column_mapping,
                            credit: e.target.value
                          })}
                          placeholder={t('e.g., E, 5, Credit')}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t('Balance Column')}</Label>
                        <Input
                          value={data.column_mapping.balance}
                          onChange={(e) => setData('column_mapping', {
                            ...data.column_mapping,
                            balance: e.target.value
                          })}
                          placeholder={t('e.g., F, 6, Balance')}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="mt-6 flex items-center justify-end space-x-2">
                    <Button variant="outline" asChild>
                      <Link href={route('finance.bank-statements.index')}>
                        {t('Cancel')}
                      </Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                      <FileText className="h-4 w-4 mr-2" />
                      {processing ? t('Generating Preview...') : t('Preview')}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {previewData && (
              <>
                {/* Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('Import Summary')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-2xl font-bold">{previewData.summary.total_transactions}</div>
                        <p className="text-sm text-muted-foreground">{t('Transactions')}</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(previewData.summary.total_debits)}
                        </div>
                        <p className="text-sm text-muted-foreground">{t('Total Debits')}</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(previewData.summary.total_credits)}
                        </div>
                        <p className="text-sm text-muted-foreground">{t('Total Credits')}</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">
                          {formatCurrency(previewData.summary.closing_balance)}
                        </div>
                        <p className="text-sm text-muted-foreground">{t('Closing Balance')}</p>
                      </div>
                    </div>

                    {previewData.summary.errors.length > 0 && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <h4 className="font-medium text-red-800">{t('Import Errors')}</h4>
                        </div>
                        <ul className="list-disc list-inside text-sm text-red-700">
                          {previewData.summary.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Transaction Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t('Transaction Preview')}</CardTitle>
                    <CardDescription>
                      {t('Review the first 50 transactions before importing')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('Date')}</TableHead>
                          <TableHead>{t('Description')}</TableHead>
                          <TableHead>{t('Reference')}</TableHead>
                          <TableHead>{t('Debit')}</TableHead>
                          <TableHead>{t('Credit')}</TableHead>
                          <TableHead>{t('Balance')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewData.transactions.slice(0, 50).map((transaction, index) => (
                          <TableRow key={index} className={transaction.errors ? 'bg-red-50' : ''}>
                            <TableCell>{formatDate(transaction.date)}</TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>{transaction.reference || '-'}</TableCell>
                            <TableCell>
                              {transaction.debit_amount > 0 && (
                                <span className="text-red-600">
                                  {formatCurrency(transaction.debit_amount)}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {transaction.credit_amount > 0 && (
                                <span className="text-green-600">
                                  {formatCurrency(transaction.credit_amount)}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>{formatCurrency(transaction.balance)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {previewData.transactions.length > 50 && (
                      <p className="text-sm text-muted-foreground mt-4">
                        {t('Showing first 50 of :total transactions', {
                          total: previewData.transactions.length
                        })}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Import Actions */}
                <div className="flex items-center justify-end space-x-2">
                  <Button variant="outline" onClick={() => setActiveTab('import')}>
                    {t('Back to Settings')}
                  </Button>
                  <Button 
                    onClick={handleImport} 
                    disabled={processing || previewData.summary.errors.length > 0}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {processing ? t('Importing...') : t('Import Statement')}
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
