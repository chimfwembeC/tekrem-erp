import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  FileText,
  AlertTriangle,
  Plus,
  Eye
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import { Link } from '@inertiajs/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface FinanceStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  netIncome: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalInvoiceAmount: number;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  transaction_date: string;
  account: {
    name: string;
  };
  category: {
    name: string;
    color: string;
  } | null;
}

interface Invoice {
  id: number;
  invoice_number: string;
  status: string;
  total_amount: number;
  due_date: string;
  billable: {
    name: string;
  } | null;
}

interface Budget {
  id: number;
  name: string;
  amount: number;
  spent_amount: number;
  percentage_spent: number;
  alert_threshold: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

interface Props {
  stats: FinanceStats;
  recentTransactions: Transaction[];
  recentInvoices: Invoice[];
  budgetAlerts: Budget[];
  monthlyData: MonthlyData[];
}

export default function Dashboard({
  stats,
  recentTransactions,
  recentInvoices,
  budgetAlerts,
  monthlyData
}: Props) {
  const { t } = useTranslate();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'text-green-600';
      case 'expense':
        return 'text-red-600';
      case 'transfer':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <AppLayout>
      <Head title={t('finance.title', 'Finance')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('finance.title', 'Finance')}</h1>
            <p className="text-muted-foreground">
              {t('finance.dashboard_description', 'Manage your financial data and track performance')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/finance/quotations/create">
                <Plus className="h-4 w-4 mr-2" />
                {t('finance.create_quotation', 'Create Quotation')}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/finance/invoices/create">
                <FileText className="h-4 w-4 mr-2" />
                {t('finance.create_invoice', 'Create Invoice')}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/finance/analytics/dashboard">
                <TrendingUp className="h-4 w-4 mr-2" />
                {t('finance.analytics', 'Analytics')}
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.total_balance', 'Total Balance')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalBalance)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.monthly_income', 'Monthly Income')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.monthlyIncome)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.monthly_expenses', 'Monthly Expenses')}
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.monthlyExpenses)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.net_income', 'Net Income')}
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats.netIncome)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('finance.income_vs_expenses', 'Income vs Expenses')}</CardTitle>
              <CardDescription>
                {t('finance.monthly_comparison', 'Monthly comparison over the last 12 months')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Income"
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#EF4444"
                    strokeWidth={2}
                    name="Expenses"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('finance.invoice_overview', 'Invoice Overview')}</CardTitle>
              <CardDescription>
                {t('finance.invoice_status_summary', 'Current invoice status summary')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t('finance.pending_invoices', 'Pending Invoices')}
                  </span>
                  <Badge variant="secondary">{stats.pendingInvoices}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t('finance.overdue_invoices', 'Overdue Invoices')}
                  </span>
                  <Badge variant="destructive">{stats.overdueInvoices}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t('finance.total_amount', 'Total Amount')}
                  </span>
                  <span className="font-bold">{formatCurrency(stats.totalInvoiceAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('finance.recent_transactions', 'Recent Transactions')}</CardTitle>
              <CardDescription>
                {t('finance.latest_financial_activity', 'Your latest financial activity')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: transaction.category?.color || '#6B7280' }}
                      />
                      <div>
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {transaction.account.name} • {transaction.category?.name || 'Uncategorized'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getTransactionTypeColor(transaction.type)}`}>
                        {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {recentTransactions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t('finance.no_transactions', 'No transactions found')}
                  </p>
                )}
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/finance/transactions">
                    <Eye className="h-4 w-4 mr-2" />
                    {t('finance.view_all_transactions', 'View All Transactions')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('finance.recent_invoices', 'Recent Invoices')}</CardTitle>
              <CardDescription>
                {t('finance.latest_invoices', 'Your latest invoices')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{invoice.invoice_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.billable?.name || 'No client'} • Due: {new Date(invoice.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(invoice.total_amount)}</p>
                      <Badge className={getStatusColor(invoice.status)} variant="secondary">
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {recentInvoices.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t('finance.no_invoices', 'No invoices found')}
                  </p>
                )}
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/finance/invoices">
                    <Eye className="h-4 w-4 mr-2" />
                    {t('finance.view_all_invoices', 'View All Invoices')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Budget Alerts */}
        {budgetAlerts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                {t('finance.budget_alerts', 'Budget Alerts')}
              </CardTitle>
              <CardDescription>
                {t('finance.budget_alerts_description', 'Budgets that have exceeded their alert threshold')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {budgetAlerts.map((budget) => (
                  <div key={budget.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{budget.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(budget.spent_amount)} of {formatCurrency(budget.amount)} spent
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">
                        {budget.percentage_spent.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
