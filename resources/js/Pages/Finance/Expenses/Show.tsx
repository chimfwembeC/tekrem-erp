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
  TrendingUp,
  Calendar,
  Receipt,
  Building,
  User,
  DollarSign,
  Hash,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Download,
  Tag
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import { toast } from 'sonner';

interface Expense {
  id: number;
  expense_number: string;
  title: string;
  description: string | null;
  amount: number;
  expense_date: string;
  vendor: string | null;
  status: string;
  receipt_url: string | null;
  created_at: string;
  updated_at: string;
  category: {
    id: number;
    name: string;
    description: string | null;
  } | null;
  account: {
    id: number;
    name: string;
    currency: string;
    type: string;
  };
}

interface Props {
  expense: Expense;
  statuses: Record<string, string>;
}

export default function Show({ expense, statuses }: Props) {
  const { t } = useTranslate();

  const handleDelete = () => {
    if (confirm(t('common.confirm_delete', 'Are you sure you want to delete this item?'))) {
      router.delete(route('finance.expenses.destroy', expense.id), {
        onSuccess: () => {
          toast.success(t('finance.expense_deleted', 'Expense deleted successfully'));
        },
        onError: () => {
          toast.error(t('common.error_occurred', 'An error occurred'));
        },
      });
    }
  };

  const handleApprove = () => {
    router.post(route('finance.expenses.approve', expense.id), {}, {
      onSuccess: () => {
        toast.success(t('finance.expense_approved', 'Expense approved successfully'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const handleReject = () => {
    router.post(route('finance.expenses.reject', expense.id), {}, {
      onSuccess: () => {
        toast.success(t('finance.expense_rejected', 'Expense rejected successfully'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <AppLayout
      title={expense.expense_number}
      breadcrumbs={[
        { label: t('finance.title', 'Finance'), href: '/finance' },
        { label: t('finance.expenses', 'Expenses'), href: '/finance/expenses' },
        { label: expense.expense_number },
      ]}
    >
      <Head title={expense.expense_number} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={route('finance.expenses.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back', 'Back')}
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <TrendingUp className="h-8 w-8" />
                {expense.expense_number}
              </h1>
              <p className="text-muted-foreground">
                {expense.title}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href={route('finance.expenses.edit', expense.id)}>
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
                {expense.status === 'pending' && (
                  <>
                    <DropdownMenuItem
                      onClick={handleApprove}
                      className="text-green-600"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {t('finance.approve', 'Approve')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleReject}
                      className="text-red-600"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      {t('finance.reject', 'Reject')}
                    </DropdownMenuItem>
                  </>
                )}
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
          {/* Expense Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t('finance.expense_information', 'Expense Information')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    {t('finance.expense_number', 'Expense Number')}
                  </div>
                  <p className="font-medium">{expense.expense_number}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    {t('finance.amount', 'Amount')}
                  </div>
                  <p className="text-2xl font-bold">
                    {formatCurrency(expense.amount, expense.account.currency)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  {t('finance.title', 'Title')}
                </div>
                <p className="font-medium">{expense.title}</p>
              </div>

              {expense.description && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Receipt className="h-4 w-4" />
                    {t('finance.description', 'Description')}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{expense.description}</p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {t('finance.expense_date', 'Expense Date')}
                  </div>
                  <p className="font-medium">
                    {new Date(expense.expense_date).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    {t('common.status', 'Status')}
                  </div>
                  <Badge className={getStatusColor(expense.status)} variant="secondary">
                    <span className="mr-1">{getStatusIcon(expense.status)}</span>
                    {statuses[expense.status] || expense.status}
                  </Badge>
                </div>
              </div>

              {expense.vendor && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <User className="h-4 w-4" />
                    {t('finance.vendor', 'Vendor')}
                  </div>
                  <p className="font-medium">{expense.vendor}</p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Building className="h-4 w-4" />
                  {t('finance.account', 'Account')}
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-medium">{expense.account.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {expense.account.type} - {expense.account.currency}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                {t('finance.additional_information', 'Additional Information')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {expense.category && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Tag className="h-4 w-4" />
                    {t('finance.category', 'Category')}
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-medium">{expense.category.name}</p>
                    {expense.category.description && (
                      <p className="text-sm text-muted-foreground">{expense.category.description}</p>
                    )}
                  </div>
                </div>
              )}

              {expense.receipt_url && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Receipt className="h-4 w-4" />
                    {t('finance.receipt', 'Receipt')}
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{t('finance.receipt_available', 'Receipt Available')}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('finance.receipt_uploaded', 'Receipt file uploaded')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          {t('common.download', 'Download')}
                        </a>
                      </Button>
                    </div>
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
                    {new Date(expense.created_at).toLocaleString()}
                  </p>
                  <p>
                    <strong>{t('common.updated', 'Updated')}:</strong>{' '}
                    {new Date(expense.updated_at).toLocaleString()}
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
