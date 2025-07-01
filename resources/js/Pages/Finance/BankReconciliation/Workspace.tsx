import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
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
import { Checkbox } from '@/Components/ui/checkbox';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  Link as LinkIcon,
  Unlink,
  Search,
  Filter,
  Download,
  Save,
  RefreshCw,
  Target,
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface Account {
  id: number;
  name: string;
  account_code: string;
}

interface BankStatementTransaction {
  id: number;
  transaction_date: string;
  description: string;
  reference_number?: string;
  debit_amount: number;
  credit_amount: number;
  balance: number;
  is_reconciled: boolean;
  confidence_score?: number;
}

interface BookTransaction {
  id: number;
  transaction_date: string;
  description: string;
  reference: string;
  debit_amount: number;
  credit_amount: number;
  is_reconciled: boolean;
  confidence_score?: number;
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
  account: Account;
}

interface Props {
  reconciliation: BankReconciliation;
  bankTransactions: {
    matched: BankStatementTransaction[];
    unmatched: BankStatementTransaction[];
  };
  bookTransactions: {
    matched: BookTransaction[];
    unmatched: BookTransaction[];
  };
  suggestedMatches: Array<{
    bank_transaction_id: number;
    book_transaction_id: number;
    confidence_score: number;
    match_reason: string;
  }>;
}

export default function Workspace({
  reconciliation,
  bankTransactions,
  bookTransactions,
  suggestedMatches,
}: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [selectedBankTransactions, setSelectedBankTransactions] = useState<number[]>([]);
  const [selectedBookTransactions, setSelectedBookTransactions] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('unmatched');

  const handleAutoMatch = () => {
    router.post(route('finance.bank-reconciliation.auto-match', reconciliation.id), {}, {
      onSuccess: () => {
        toast.success(t('Auto-matching completed'));
      },
      onError: (errors) => {
        toast.error(errors.error || t('Auto-matching failed'));
      },
    });
  };

  const handleManualMatch = () => {
    if (selectedBankTransactions.length === 0 || selectedBookTransactions.length === 0) {
      toast.error(t('Please select transactions to match'));
      return;
    }

    router.post(route('finance.bank-reconciliation.manual-match', reconciliation.id), {
      bank_transaction_ids: selectedBankTransactions,
      book_transaction_ids: selectedBookTransactions,
    }, {
      onSuccess: () => {
        toast.success(t('Transactions matched successfully'));
        setSelectedBankTransactions([]);
        setSelectedBookTransactions([]);
      },
      onError: (errors) => {
        toast.error(errors.error || t('Failed to match transactions'));
      },
    });
  };

  const handleUnmatch = (bankTransactionId: number, bookTransactionId: number) => {
    router.post(route('finance.bank-reconciliation.unmatch', reconciliation.id), {
      bank_transaction_id: bankTransactionId,
      book_transaction_id: bookTransactionId,
    }, {
      onSuccess: () => {
        toast.success(t('Transactions unmatched successfully'));
      },
      onError: (errors) => {
        toast.error(errors.error || t('Failed to unmatch transactions'));
      },
    });
  };

  const handleCompleteReconciliation = () => {
    if (reconciliation.difference !== 0) {
      if (!confirm(t('There is still a difference of :amount. Are you sure you want to complete?', {
        amount: formatCurrency(reconciliation.difference)
      }))) {
        return;
      }
    }

    router.post(route('finance.bank-reconciliation.complete', reconciliation.id), {}, {
      onSuccess: () => {
        toast.success(t('Reconciliation completed successfully'));
      },
      onError: (errors) => {
        toast.error(errors.error || t('Failed to complete reconciliation'));
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

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <AppLayout>
      <Head title={t('Bank Reconciliation Workspace')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={route('finance.bank-reconciliation.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('Back')}
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('Reconciliation Workspace')}
              </h1>
              <p className="text-muted-foreground">
                {reconciliation.reconciliation_number} - {reconciliation.account.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleAutoMatch}>
              <Target className="h-4 w-4 mr-2" />
              {t('Auto Match')}
            </Button>
            <Button variant="outline" onClick={handleManualMatch} disabled={selectedBankTransactions.length === 0 || selectedBookTransactions.length === 0}>
              <LinkIcon className="h-4 w-4 mr-2" />
              {t('Manual Match')}
            </Button>
            <Button onClick={handleCompleteReconciliation} disabled={reconciliation.status === 'completed'}>
              <CheckCircle className="h-4 w-4 mr-2" />
              {t('Complete')}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('Statement Balance')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(reconciliation.statement_closing_balance)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('Opening')}: {formatCurrency(reconciliation.statement_opening_balance)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('Book Balance')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(reconciliation.book_closing_balance)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('Opening')}: {formatCurrency(reconciliation.book_opening_balance)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('Difference')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${reconciliation.difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(reconciliation.difference)}
              </div>
              <p className="text-xs text-muted-foreground">
                {reconciliation.difference === 0 ? t('Balanced') : t('Needs attention')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('Progress')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reconciliation.progress_percentage}%
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${reconciliation.progress_percentage}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="unmatched">{t('Unmatched Transactions')}</TabsTrigger>
            <TabsTrigger value="matched">{t('Matched Transactions')}</TabsTrigger>
            <TabsTrigger value="suggestions">{t('Suggested Matches')}</TabsTrigger>
          </TabsList>

          <TabsContent value="unmatched" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bank Statement Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('Bank Statement Transactions')}</CardTitle>
                  <CardDescription>
                    {bankTransactions.unmatched.length} {t('unmatched transactions')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>{t('Date')}</TableHead>
                        <TableHead>{t('Description')}</TableHead>
                        <TableHead>{t('Amount')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bankTransactions.unmatched.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedBankTransactions.includes(transaction.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedBankTransactions([...selectedBankTransactions, transaction.id]);
                                } else {
                                  setSelectedBankTransactions(selectedBankTransactions.filter(id => id !== transaction.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{transaction.description}</div>
                              {transaction.reference_number && (
                                <div className="text-sm text-muted-foreground">
                                  Ref: {transaction.reference_number}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={transaction.debit_amount > 0 ? 'text-red-600' : 'text-green-600'}>
                              {transaction.debit_amount > 0 
                                ? `-${formatCurrency(transaction.debit_amount)}`
                                : `+${formatCurrency(transaction.credit_amount)}`
                              }
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Book Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('Book Transactions')}</CardTitle>
                  <CardDescription>
                    {bookTransactions.unmatched.length} {t('unmatched transactions')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]"></TableHead>
                        <TableHead>{t('Date')}</TableHead>
                        <TableHead>{t('Description')}</TableHead>
                        <TableHead>{t('Amount')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookTransactions.unmatched.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedBookTransactions.includes(transaction.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedBookTransactions([...selectedBookTransactions, transaction.id]);
                                } else {
                                  setSelectedBookTransactions(selectedBookTransactions.filter(id => id !== transaction.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>{formatDate(transaction.transaction_date)}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{transaction.description}</div>
                              <div className="text-sm text-muted-foreground">
                                Ref: {transaction.reference}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={transaction.debit_amount > 0 ? 'text-red-600' : 'text-green-600'}>
                              {transaction.debit_amount > 0 
                                ? `-${formatCurrency(transaction.debit_amount)}`
                                : `+${formatCurrency(transaction.credit_amount)}`
                              }
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="matched" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('Matched Transactions')}</CardTitle>
                <CardDescription>
                  {bankTransactions.matched.length} {t('matched pairs')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Bank Transaction')}</TableHead>
                      <TableHead>{t('Book Transaction')}</TableHead>
                      <TableHead>{t('Amount')}</TableHead>
                      <TableHead>{t('Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bankTransactions.matched.map((bankTx, index) => {
                      const bookTx = bookTransactions.matched[index];
                      return (
                        <TableRow key={`${bankTx.id}-${bookTx?.id}`}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{bankTx.description}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(bankTx.transaction_date)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {bookTx && (
                              <div>
                                <div className="font-medium">{bookTx.description}</div>
                                <div className="text-sm text-muted-foreground">
                                  {formatDate(bookTx.transaction_date)}
                                </div>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-green-600">
                              {formatCurrency(bankTx.debit_amount || bankTx.credit_amount)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnmatch(bankTx.id, bookTx?.id)}
                            >
                              <Unlink className="h-4 w-4 mr-2" />
                              {t('Unmatch')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('Suggested Matches')}</CardTitle>
                <CardDescription>
                  {suggestedMatches.length} {t('AI-suggested transaction matches')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('Bank Transaction')}</TableHead>
                      <TableHead>{t('Book Transaction')}</TableHead>
                      <TableHead>{t('Confidence')}</TableHead>
                      <TableHead>{t('Reason')}</TableHead>
                      <TableHead>{t('Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suggestedMatches.map((match) => {
                      const bankTx = bankTransactions.unmatched.find(tx => tx.id === match.bank_transaction_id);
                      const bookTx = bookTransactions.unmatched.find(tx => tx.id === match.book_transaction_id);
                      
                      if (!bankTx || !bookTx) return null;

                      return (
                        <TableRow key={`${match.bank_transaction_id}-${match.book_transaction_id}`}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{bankTx.description}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(bankTx.transaction_date)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{bookTx.description}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatDate(bookTx.transaction_date)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getConfidenceColor(match.confidence_score)}>
                              {Math.round(match.confidence_score * 100)}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {match.match_reason}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedBankTransactions([match.bank_transaction_id]);
                                setSelectedBookTransactions([match.book_transaction_id]);
                                handleManualMatch();
                              }}
                            >
                              <LinkIcon className="h-4 w-4 mr-2" />
                              {t('Accept')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
