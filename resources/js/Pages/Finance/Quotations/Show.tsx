import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
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
  Edit,
  Send,
  Download,
  FileText,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Mail,
  Phone,
  Building
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import { toast } from 'sonner';

interface QuotationItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Quotation {
  id: number;
  quotation_number: string;
  status: string;
  issue_date: string;
  expiry_date: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  notes: string;
  terms: string;
  lead: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  items: QuotationItem[];
  is_expired: boolean;
  days_until_expiry: number;
  can_convert_to_invoice: boolean;
  is_converted: boolean;
  converted_to_invoice?: {
    id: number;
    invoice_number: string;
  } | null;
}

interface Props {
  quotation: Quotation;
}

export default function Show({ quotation }: Props) {
  const { t } = useTranslate();

  const handleSend = () => {
    router.post(route('finance.quotations.send', quotation.id), {}, {
      onSuccess: () => {
        toast.success(t('finance.quotation_sent', 'Quotation sent successfully'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const handleAccept = () => {
    router.post(route('finance.quotations.accept', quotation.id), {}, {
      onSuccess: () => {
        toast.success(t('finance.quotation_accepted', 'Quotation accepted successfully'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const handleReject = () => {
    router.post(route('finance.quotations.reject', quotation.id), {}, {
      onSuccess: () => {
        toast.success(t('finance.quotation_rejected', 'Quotation rejected'));
      },
      onError: () => {
        toast.error(t('common.error_occurred', 'An error occurred'));
      },
    });
  };

  const handleConvertToInvoice = () => {
    if (confirm(t('finance.confirm_convert_to_invoice', 'Are you sure you want to convert this quotation to an invoice?'))) {
      router.post(route('finance.quotations.convert-to-invoice', quotation.id), {}, {
        onSuccess: () => {
          toast.success(t('finance.quotation_converted', 'Quotation converted to invoice successfully'));
        },
        onError: () => {
          toast.error(t('common.error_occurred', 'An error occurred'));
        },
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: quotation.currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'sent':
        return <Send className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'expired':
        return <AlertTriangle className="h-4 w-4" />;
      case 'draft':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getExpiryStatus = () => {
    if (quotation.is_expired) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {t('finance.expired', 'Expired')}
        </Badge>
      );
    }

    if (quotation.days_until_expiry <= 3 && quotation.status === 'sent') {
      return (
        <Badge variant="outline" className="flex items-center gap-1 text-orange-600">
          <Clock className="h-3 w-3" />
          {t('finance.expires_in_days', 'Expires in {{days}} days', { days: quotation.days_until_expiry })}
        </Badge>
      );
    }

    return null;
  };

  return (
    <AppLayout
      title={`${t('finance.quotation', 'Quotation')} ${quotation.quotation_number}`}
      breadcrumbs={[
        { label: t('finance.title', 'Finance'), href: '/finance' },
        { label: t('finance.quotations', 'Quotations'), href: '/finance/quotations' },
        { label: quotation.quotation_number },
      ]}
    >
      <Head title={`${t('finance.quotation', 'Quotation')} ${quotation.quotation_number}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={route('finance.quotations.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back', 'Back')}
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('finance.quotation', 'Quotation')} {quotation.quotation_number}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(quotation.status)} variant="secondary">
                  {getStatusIcon(quotation.status)}
                  <span className="ml-1">{quotation.status}</span>
                </Badge>
                {quotation.is_converted && (
                  <Badge variant="outline">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    {t('finance.converted', 'Converted')}
                  </Badge>
                )}
                {getExpiryStatus()}
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {t('finance.expires', 'Expires')}: {new Date(quotation.expiry_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {quotation.status === 'draft' && (
              <Button onClick={handleSend}>
                <Send className="h-4 w-4 mr-2" />
                {t('finance.send_quotation', 'Send Quotation')}
              </Button>
            )}
            {quotation.status === 'sent' && (
              <>
                <Button onClick={handleAccept} variant="default">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('finance.accept', 'Accept')}
                </Button>
                <Button onClick={handleReject} variant="outline">
                  <XCircle className="h-4 w-4 mr-2" />
                  {t('finance.reject', 'Reject')}
                </Button>
              </>
            )}
            {quotation.can_convert_to_invoice && (
              <Button onClick={handleConvertToInvoice} variant="default">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('finance.convert_to_invoice', 'Convert to Invoice')}
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href={route('finance.quotations.pdf', quotation.id)} target="_blank">
                <Download className="h-4 w-4 mr-2" />
                {t('finance.download_pdf', 'Download PDF')}
              </Link>
            </Button>
            {['draft', 'sent'].includes(quotation.status) && (
              <Button variant="outline" asChild>
                <Link href={route('finance.quotations.edit', quotation.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {t('common.edit', 'Edit')}
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quotation Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lead Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t('finance.lead_information', 'Lead Information')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{quotation.lead.name}</h3>
                    {quotation.lead.company && (
                      <p className="text-muted-foreground">{quotation.lead.company}</p>
                    )}
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{quotation.lead.email}</span>
                    </div>
                    {quotation.lead.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{quotation.lead.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quotation Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {t('finance.quotation_items', 'Quotation Items')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('finance.description', 'Description')}</TableHead>
                        <TableHead className="text-center">{t('finance.quantity', 'Qty')}</TableHead>
                        <TableHead className="text-right">{t('finance.unit_price', 'Unit Price')}</TableHead>
                        <TableHead className="text-right">{t('finance.total', 'Total')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quotation.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(item.total_price)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Quotation Totals */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between">
                    <span>{t('finance.subtotal', 'Subtotal')}:</span>
                    <span className="font-medium">{formatCurrency(quotation.subtotal)}</span>
                  </div>

                  {quotation.tax_amount > 0 && (
                    <div className="flex justify-between">
                      <span>{t('finance.tax', 'Tax')}:</span>
                      <span className="font-medium">{formatCurrency(quotation.tax_amount)}</span>
                    </div>
                  )}

                  {quotation.discount_amount > 0 && (
                    <div className="flex justify-between">
                      <span>{t('finance.discount', 'Discount')}:</span>
                      <span className="font-medium">-{formatCurrency(quotation.discount_amount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>{t('finance.total', 'Total')}:</span>
                    <span>{formatCurrency(quotation.total_amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes and Terms */}
            {(quotation.notes || quotation.terms) && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('finance.additional_information', 'Additional Information')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {quotation.notes && (
                    <div>
                      <h4 className="font-medium mb-2">{t('finance.notes', 'Notes')}</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{quotation.notes}</p>
                    </div>
                  )}
                  {quotation.terms && (
                    <div>
                      <h4 className="font-medium mb-2">{t('finance.terms', 'Terms & Conditions')}</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{quotation.terms}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quotation Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {t('finance.quotation_summary', 'Quotation Summary')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('finance.issue_date', 'Issue Date')}:</span>
                    <span>{new Date(quotation.issue_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('finance.expiry_date', 'Expiry Date')}:</span>
                    <span>{new Date(quotation.expiry_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('finance.currency', 'Currency')}:</span>
                    <span>{quotation.currency}</span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>{t('finance.total_amount', 'Total Amount')}:</span>
                    <span>{formatCurrency(quotation.total_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('common.status', 'Status')}:</span>
                    <Badge className={getStatusColor(quotation.status)} variant="secondary">
                      {getStatusIcon(quotation.status)}
                      <span className="ml-1">{quotation.status}</span>
                    </Badge>
                  </div>
                </div>

                {/* Expiry Warning */}
                {quotation.status === 'sent' && quotation.days_until_expiry <= 7 && !quotation.is_expired && (
                  <div className="pt-4 border-t">
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2 text-orange-800">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          {t('finance.expires_soon', 'Expires in {{days}} days', { days: quotation.days_until_expiry })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Conversion Status */}
                {quotation.is_converted && quotation.converted_to_invoice && (
                  <div className="pt-4 border-t">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <div>
                          <p className="text-sm font-medium">{t('finance.converted_to_invoice', 'Converted to Invoice')}</p>
                          <Link
                            href={route('finance.invoices.show', quotation.converted_to_invoice.id)}
                            className="text-xs text-green-600 hover:text-green-800 underline"
                          >
                            {quotation.converted_to_invoice.invoice_number}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="pt-4 border-t space-y-2">
                  {quotation.status === 'draft' && (
                    <Button onClick={handleSend} className="w-full">
                      <Send className="h-4 w-4 mr-2" />
                      {t('finance.send_quotation', 'Send Quotation')}
                    </Button>
                  )}

                  {quotation.status === 'sent' && (
                    <div className="space-y-2">
                      <Button onClick={handleAccept} className="w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {t('finance.accept_quotation', 'Accept Quotation')}
                      </Button>
                      <Button onClick={handleReject} variant="outline" className="w-full">
                        <XCircle className="h-4 w-4 mr-2" />
                        {t('finance.reject_quotation', 'Reject Quotation')}
                      </Button>
                    </div>
                  )}

                  {quotation.can_convert_to_invoice && (
                    <Button onClick={handleConvertToInvoice} className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {t('finance.convert_to_invoice', 'Convert to Invoice')}
                    </Button>
                  )}

                  <Button variant="outline" asChild className="w-full">
                    <Link href={route('finance.quotations.pdf', quotation.id)} target="_blank">
                      <Download className="h-4 w-4 mr-2" />
                      {t('finance.download_pdf', 'Download PDF')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
