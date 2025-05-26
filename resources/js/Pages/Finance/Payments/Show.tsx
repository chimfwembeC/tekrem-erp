import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
  ArrowLeft,
  MoreHorizontal,
  Edit,
  Trash2,
  CreditCard,
  Calendar,
  Receipt,
  FileText,
  User,
  DollarSign,
  Building,
  Hash,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import { toast } from 'sonner';

interface Payment {
  id: number;
  payment_number: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  status: string;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  invoice: {
    id: number;
    invoice_number: string;
    total_amount: number;
    currency: string;
  } | null;
  payable: {
    id: number;
    name: string;
    email: string;
  } | null;
  account: {
    id: number;
    name: string;
    currency: string;
    type: string;
  };
}

interface Props {
  payment: Payment;
  paymentMethods: Record<string, string>;
  statuses: Record<string, string>;
}

export default function Show({ payment, paymentMethods, statuses }: Props) {
  const { t } = useTranslate();

  const handleDelete = () => {
    if (confirm(t('common.confirm_delete', 'Are you sure you want to delete this item?'))) {
      router.delete(route('finance.payments.destroy', payment.id), {
        onSuccess: () => {
          toast.success(t('finance.payment_deleted', 'Payment deleted successfully'));
        },
        onError: () => {
          toast.error(t('common.error_occurred', 'An error occurred'));
        },
      });
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'bank_transfer':
        return <Receipt className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  return (
    <AppLayout
      title={payment.payment_number}
      breadcrumbs={[
        { label: t('finance.title', 'Finance'), href: '/finance' },
        { label: t('finance.payments', 'Payments'), href: '/finance/payments' },
        { label: payment.payment_number },
      ]}
    >
      <Head title={payment.payment_number} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={route('finance.payments.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back', 'Back')}
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <CreditCard className="h-8 w-8" />
                {payment.payment_number}
              </h1>
              <p className="text-muted-foreground">
                {t('finance.payment_details', 'Payment Details')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href={route('finance.payments.edit', payment.id)}>
                <Edit className="h-4 w-4 mr-2" />
                {t('common.edit', 'Edit')}
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('common.delete', 'Delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                {t('finance.payment_information', 'Payment Information')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    {t('finance.payment_number', 'Payment Number')}
                  </div>
                  <p className="font-medium">{payment.payment_number}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    {t('finance.amount', 'Amount')}
                  </div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(payment.amount, payment.account.currency)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {t('finance.payment_date', 'Payment Date')}
                  </div>
                  <p className="font-medium">
                    {new Date(payment.payment_date).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Receipt className="h-4 w-4" />
                    {t('finance.payment_method', 'Payment Method')}
                  </div>
                  <div className="flex items-center gap-2">
                    {getMethodIcon(payment.payment_method)}
                    <span className="font-medium">
                      {paymentMethods[payment.payment_method] || payment.payment_method}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    {t('common.status', 'Status')}
                  </div>
                  <Badge className={getStatusColor(payment.status)} variant="secondary">
                    <span className="mr-1">{getStatusIcon(payment.status)}</span>
                    {statuses[payment.status] || payment.status}
                  </Badge>
                </div>

                {payment.reference_number && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Hash className="h-4 w-4" />
                      {t('finance.reference_number', 'Reference Number')}
                    </div>
                    <p className="font-medium">{payment.reference_number}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Building className="h-4 w-4" />
                  {t('finance.account', 'Account')}
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{payment.account.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {payment.account.type} - {payment.account.currency}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t('finance.related_information', 'Related Information')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {payment.invoice && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    {t('finance.invoice', 'Invoice')}
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <Link
                      href={route('finance.invoices.show', payment.invoice.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {payment.invoice.invoice_number}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(payment.invoice.total_amount, payment.invoice.currency)}
                    </p>
                  </div>
                </div>
              )}

              {payment.payable && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <User className="h-4 w-4" />
                    {t('finance.client', 'Client')}
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{payment.payable.name}</p>
                    <p className="text-sm text-muted-foreground">{payment.payable.email}</p>
                  </div>
                </div>
              )}

              {payment.notes && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    {t('finance.notes', 'Notes')}
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{payment.notes}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {t('common.timestamps', 'Timestamps')}
                </div>
                <div className="space-y-1 text-sm">
                  <p>
                    <strong>{t('common.created', 'Created')}:</strong>{' '}
                    {new Date(payment.created_at).toLocaleString()}
                  </p>
                  <p>
                    <strong>{t('common.updated', 'Updated')}:</strong>{' '}
                    {new Date(payment.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
