import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Users, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';

interface AnalyticsData {
  quotations: {
    total_quotations: number;
    total_value: number;
    conversion_rate: number;
    avg_quotation_value: number;
  };
  invoices: {
    total_invoices: number;
    total_value: number;
    total_paid: number;
    total_outstanding: number;
    payment_rate: number;
    overdue_rate: number;
  };
  revenue: {
    total_revenue: number;
    monthly_trend: Array<{
      year: number;
      month: number;
      revenue: number;
    }>;
    revenue_by_currency: Array<{
      currency: string;
      total: number;
    }>;
  };
  alerts: Array<{
    type: string;
    title: string;
    message: string;
    action_url: string;
  }>;
}

interface Props {
  analytics: AnalyticsData;
  period: string;
}

export default function AnalyticsDashboard({ analytics, period: initialPeriod }: Props) {
  const { t } = useTranslate();
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);

  const periods = {
    '7_days': t('common.last_7_days', 'Last 7 days'),
    '30_days': t('common.last_30_days', 'Last 30 days'),
    '90_days': t('common.last_90_days', 'Last 90 days'),
    'this_month': t('common.this_month', 'This month'),
    'last_month': t('common.last_month', 'Last month'),
    '1_year': t('common.last_year', 'Last year'),
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  // Prepare chart data
  const revenueChartData = analytics.revenue.monthly_trend.map(item => ({
    month: `${item.year}-${item.month.toString().padStart(2, '0')}`,
    revenue: item.revenue,
  }));

  const currencyChartData = analytics.revenue.revenue_by_currency.map(item => ({
    name: item.currency,
    value: item.total,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <AppLayout
      title={t('finance.analytics', 'Finance Analytics')}
      breadcrumbs={[
        { label: t('finance.title', 'Finance'), href: '/finance' },
        { label: t('finance.analytics', 'Analytics') },
      ]}
    >
      <Head title={t('finance.analytics', 'Finance Analytics')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('finance.analytics', 'Finance Analytics')}
            </h1>
            <p className="text-muted-foreground">
              {t('finance.analytics_description', 'Comprehensive insights into your financial performance')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(periods).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Alerts */}
        {analytics.alerts.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {analytics.alerts.map((alert, index) => (
              <Card key={index} className={`border ${getAlertColor(alert.type)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.total_quotations', 'Total Quotations')}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.quotations.total_quotations}</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(analytics.quotations.total_value)} {t('common.total_value', 'total value')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.conversion_rate', 'Conversion Rate')}
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.quotations.conversion_rate}%</div>
              <p className="text-xs text-muted-foreground">
                {t('finance.quotations_to_sales', 'quotations to sales')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.total_revenue', 'Total Revenue')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.revenue.total_revenue)}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.invoices.payment_rate}% {t('finance.payment_rate', 'payment rate')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('finance.outstanding_amount', 'Outstanding')}
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(analytics.invoices.total_outstanding)}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.invoices.overdue_rate}% {t('finance.overdue_rate', 'overdue rate')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t('finance.revenue_trend', 'Revenue Trend')}
              </CardTitle>
              <CardDescription>
                {t('finance.monthly_revenue_over_time', 'Monthly revenue over time')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Currency */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4" />
                {t('finance.revenue_by_currency', 'Revenue by Currency')}
              </CardTitle>
              <CardDescription>
                {t('finance.distribution_by_currency', 'Revenue distribution by currency')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currencyChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {currencyChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {t('finance.quotation_performance', 'Quotation Performance')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">{t('finance.total_quotations', 'Total Quotations')}</span>
                <Badge variant="secondary">{analytics.quotations.total_quotations}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">{t('finance.avg_value', 'Average Value')}</span>
                <Badge variant="secondary">{formatCurrency(analytics.quotations.avg_quotation_value)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">{t('finance.conversion_rate', 'Conversion Rate')}</span>
                <Badge variant={analytics.quotations.conversion_rate > 20 ? "default" : "destructive"}>
                  {analytics.quotations.conversion_rate}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('finance.invoice_performance', 'Invoice Performance')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">{t('finance.total_invoices', 'Total Invoices')}</span>
                <Badge variant="secondary">{analytics.invoices.total_invoices}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">{t('finance.payment_rate', 'Payment Rate')}</span>
                <Badge variant={analytics.invoices.payment_rate > 80 ? "default" : "destructive"}>
                  {analytics.invoices.payment_rate}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">{t('finance.overdue_rate', 'Overdue Rate')}</span>
                <Badge variant={analytics.invoices.overdue_rate < 10 ? "default" : "destructive"}>
                  {analytics.invoices.overdue_rate}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                {t('finance.financial_summary', 'Financial Summary')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">{t('finance.total_revenue', 'Total Revenue')}</span>
                <Badge variant="default">{formatCurrency(analytics.revenue.total_revenue)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">{t('finance.outstanding', 'Outstanding')}</span>
                <Badge variant="outline">{formatCurrency(analytics.invoices.total_outstanding)}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">{t('finance.collection_efficiency', 'Collection Efficiency')}</span>
                <Badge variant={analytics.invoices.payment_rate > 85 ? "default" : "secondary"}>
                  {Math.round((analytics.invoices.total_paid / analytics.invoices.total_value) * 100)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
