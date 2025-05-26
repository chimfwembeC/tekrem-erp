import React, { useState, useEffect } from 'react';
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
import {
  ArrowLeft,
  CreditCard,
  User,
  Calendar,
  DollarSign,
  Receipt,
  FileText
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import { toast } from 'sonner';

interface Account {
  id: number;
  name: string;
  currency: string;
  type: string;
}

interface Invoice {
  id: number;
  invoice_number: string;
  total_amount: number;
  currency: string;
  billable: {
    id: number;
    name: string;
  };
}

interface Client {
  id: number;
  name: string;
  email: string;
}

interface Lead {
  id: number;
  name: string;
  email: string;
}

interface Payment {
  id: number;
  payment_number: string;
  account_id: number;
  payable_type: string | null;
  payable_id: number | null;
  invoice_id: number | null;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number: string | null;
  status: string;
  notes: string | null;
  invoice?: Invoice;
  payable?: {
    id: number;
    name: string;
  };
}

interface Props {
  payment: Payment;
  accounts: Account[];
  invoices: Invoice[];
  clients: Client[];
  leads: Lead[];
  paymentMethods: Record<string, string>;
  statuses: Record<string, string>;
}

export default function Edit({ payment, accounts, invoices, clients, leads, paymentMethods, statuses }: Props) {
  const { t } = useTranslate();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(payment.invoice || null);

  const { data, setData, put, processing, errors } = useForm({
    account_id: payment.account_id.toString(),
    payable_type: payment.payable_type || '',
    payable_id: payment.payable_id?.toString() || '',
    invoice_id: payment.invoice_id?.toString() || '',
    amount: payment.amount.toString(),
    payment_date: payment.payment_date,
    payment_method: payment.payment_method,
    reference_number: payment.reference_number || '',
    status: payment.status,
    notes: payment.notes || '',
  });

  const handleInvoiceSelect = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id.toString() === invoiceId);
    if (invoice) {
      setSelectedInvoice(invoice);
      setData({
        ...data,
        invoice_id: invoiceId,
        amount: invoice.total_amount.toString(),
        payable_type: 'client',
        payable_id: invoice.billable.id.toString(),
      });
    } else {
      setSelectedInvoice(null);
      setData({
        ...data,
        invoice_id: '',
        payable_type: data.payable_type,
        payable_id: data.payable_id,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    put(route('finance.payments.update', payment.id), {
      onSuccess: () => {
        toast.success(t('finance.payment_updated', 'Payment updated successfully'));
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

  return (
    <AppLayout
      title={t('finance.edit_payment', 'Edit Payment')}
      breadcrumbs={[
        { label: t('finance.title', 'Finance'), href: '/finance' },
        { label: t('finance.payments', 'Payments'), href: '/finance/payments' },
        { label: payment.payment_number, href: `/finance/payments/${payment.id}` },
        { label: t('common.edit', 'Edit') },
      ]}
    >
      <Head title={t('finance.edit_payment', 'Edit Payment')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={route('finance.payments.show', payment.id)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back', 'Back')}
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('finance.edit_payment', 'Edit Payment')}
            </h1>
            <p className="text-muted-foreground">
              {t('finance.edit_payment_description', 'Update payment information')} - {payment.payment_number}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  {t('finance.payment_details', 'Payment Details')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account_id">
                    {t('finance.account', 'Account')} *
                  </Label>
                  <Select value={data.account_id} onValueChange={(value) => setData('account_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('finance.select_account', 'Select account')} />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          <div>
                            <p className="font-medium">{account.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {account.type} - {account.currency}
                            </p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.account_id && (
                    <p className="text-sm text-red-600">{errors.account_id}</p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="payment_date">
                      {t('finance.payment_date', 'Payment Date')} *
                    </Label>
                    <Input
                      id="payment_date"
                      type="date"
                      value={data.payment_date}
                      onChange={(e) => setData('payment_date', e.target.value)}
                      required
                    />
                    {errors.payment_date && (
                      <p className="text-sm text-red-600">{errors.payment_date}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment_method">
                      {t('finance.payment_method', 'Payment Method')} *
                    </Label>
                    <Select value={data.payment_method} onValueChange={(value) => setData('payment_method', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('finance.select_method', 'Select method')} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(paymentMethods).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.payment_method && (
                      <p className="text-sm text-red-600">{errors.payment_method}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      {t('finance.amount', 'Amount')} *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={data.amount}
                      onChange={(e) => setData('amount', e.target.value)}
                      required
                    />
                    {errors.amount && (
                      <p className="text-sm text-red-600">{errors.amount}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">
                      {t('common.status', 'Status')} *
                    </Label>
                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statuses).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-sm text-red-600">{errors.status}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference_number">
                    {t('finance.reference_number', 'Reference Number')}
                  </Label>
                  <Input
                    id="reference_number"
                    placeholder={t('finance.reference_placeholder', 'Transaction reference...')}
                    value={data.reference_number}
                    onChange={(e) => setData('reference_number', e.target.value)}
                  />
                  {errors.reference_number && (
                    <p className="text-sm text-red-600">{errors.reference_number}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Invoice & Client Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('finance.invoice_client_details', 'Invoice & Client Details')}
                </CardTitle>
                <CardDescription>
                  {t('finance.optional_invoice_link', 'Optionally link this payment to an invoice')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice_id">
                    {t('finance.invoice', 'Invoice')}
                  </Label>
                  <Select value={data.invoice_id} onValueChange={handleInvoiceSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('finance.select_invoice', 'Select invoice (optional)')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('finance.no_invoice', 'No invoice')}</SelectItem>
                      {invoices.map((invoice) => (
                        <SelectItem key={invoice.id} value={invoice.id.toString()}>
                          <div>
                            <p className="font-medium">{invoice.invoice_number}</p>
                            <p className="text-xs text-muted-foreground">
                              {invoice.billable.name} - {formatCurrency(invoice.total_amount, invoice.currency)}
                            </p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.invoice_id && (
                    <p className="text-sm text-red-600">{errors.invoice_id}</p>
                  )}
                </div>

                {!data.invoice_id && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="payable_type">
                        {t('finance.client_type', 'Client Type')}
                      </Label>
                      <Select
                        value={data.payable_type}
                        onValueChange={(value) => {
                          setData('payable_type', value);
                          setData('payable_id', value === 'none' ? '' : '');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('finance.select_client_type', 'Select client type')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">{t('finance.no_client', 'No client')}</SelectItem>
                          <SelectItem value="client">{t('crm.client', 'Client')}</SelectItem>
                          <SelectItem value="lead">{t('crm.lead', 'Lead')}</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.payable_type && (
                        <p className="text-sm text-red-600">{errors.payable_type}</p>
                      )}
                    </div>

                    {data.payable_type && data.payable_type !== 'none' && (
                      <div className="space-y-2">
                        <Label htmlFor="payable_id">
                          {data.payable_type === 'client' ? t('crm.client', 'Client') : t('crm.lead', 'Lead')}
                        </Label>
                        <Select value={data.payable_id} onValueChange={(value) => setData('payable_id', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${data.payable_type}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {(data.payable_type === 'client' ? clients : leads).map((item) => (
                              <SelectItem key={item.id} value={item.id.toString()}>
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-xs text-muted-foreground">{item.email}</p>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.payable_id && (
                          <p className="text-sm text-red-600">{errors.payable_id}</p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {selectedInvoice && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {t('finance.selected_invoice', 'Selected Invoice')}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>{t('finance.invoice_number', 'Invoice #')}:</strong> {selectedInvoice.invoice_number}</p>
                      <p><strong>{t('finance.client', 'Client')}:</strong> {selectedInvoice.billable.name}</p>
                      <p><strong>{t('finance.amount', 'Amount')}:</strong> {formatCurrency(selectedInvoice.total_amount, selectedInvoice.currency)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t('finance.additional_information', 'Additional Information')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">
                  {t('finance.notes', 'Notes')}
                </Label>
                <Textarea
                  id="notes"
                  placeholder={t('finance.payment_notes_placeholder', 'Add any notes about this payment...')}
                  value={data.notes}
                  onChange={(e) => setData('notes', e.target.value)}
                  rows={3}
                />
                {errors.notes && (
                  <p className="text-sm text-red-600">{errors.notes}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" asChild>
              <Link href={route('finance.payments.show', payment.id)}>
                {t('common.cancel', 'Cancel')}
              </Link>
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? t('common.saving', 'Saving...') : t('finance.update_payment', 'Update Payment')}
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
