import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { 
    ArrowLeft,
    Download,
    CreditCard,
    Calendar,
    FileText,
    DollarSign,
    Building,
    User,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';

interface InvoiceItem {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

interface Invoice {
    id: number;
    invoice_number: string;
    status: string;
    issue_date: string;
    due_date: string;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    paid_amount: number;
    balance: number;
    notes?: string;
    terms?: string;
    client: {
        name: string;
        email: string;
        phone?: string;
        address?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
    };
    company: {
        name: string;
        email: string;
        phone?: string;
        address?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
        logo?: string;
    };
    items: InvoiceItem[];
    payments: Array<{
        id: number;
        amount: number;
        payment_date: string;
        payment_method: string;
        reference?: string;
    }>;
}

interface Props {
    invoice: Invoice;
}

export default function Show({ invoice }: Props) {
    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'paid':
                return 'secondary';
            case 'pending':
                return 'default';
            case 'overdue':
                return 'destructive';
            case 'draft':
                return 'outline';
            default:
                return 'outline';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const handleDownloadPDF = () => {
        window.open(route('customer.finance.invoices.download', invoice.id), '_blank');
    };

    const handlePayNow = () => {
        window.location.href = route('customer.finance.invoices.pay', invoice.id);
    };

    return (
        <CustomerLayout>
            <Head title={`Invoice ${invoice.invoice_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('customer.finance.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Finance
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold tracking-tight">
                                    Invoice {invoice.invoice_number}
                                </h1>
                                <Badge variant={getStatusVariant(invoice.status)}>
                                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground">
                                Issued on {formatDate(invoice.issue_date)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleDownloadPDF}>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                        </Button>
                        {invoice.status !== 'paid' && invoice.balance > 0 && (
                            <Button onClick={handlePayNow}>
                                <CreditCard className="h-4 w-4 mr-2" />
                                Pay Now
                            </Button>
                        )}
                    </div>
                </div>

                {/* Invoice Overview */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(invoice.total_amount)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(invoice.paid_amount)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Balance Due</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(invoice.balance)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Due Date</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold">{formatDate(invoice.due_date)}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Invoice Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Invoice Details */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Invoice Details</CardTitle>
                                        <CardDescription>
                                            Complete breakdown of charges and services
                                        </CardDescription>
                                    </div>
                                    {invoice.company.logo && (
                                        <img 
                                            src={invoice.company.logo} 
                                            alt={invoice.company.name}
                                            className="h-12 w-auto"
                                        />
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Company and Client Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <Building className="h-4 w-4" />
                                            From
                                        </h4>
                                        <div className="text-sm space-y-1">
                                            <p className="font-medium">{invoice.company.name}</p>
                                            {invoice.company.address && <p>{invoice.company.address}</p>}
                                            {(invoice.company.city || invoice.company.state || invoice.company.zip) && (
                                                <p>
                                                    {[invoice.company.city, invoice.company.state, invoice.company.zip]
                                                        .filter(Boolean).join(', ')}
                                                </p>
                                            )}
                                            {invoice.company.country && <p>{invoice.company.country}</p>}
                                            {invoice.company.email && (
                                                <p className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {invoice.company.email}
                                                </p>
                                            )}
                                            {invoice.company.phone && (
                                                <p className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {invoice.company.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Bill To
                                        </h4>
                                        <div className="text-sm space-y-1">
                                            <p className="font-medium">{invoice.client.name}</p>
                                            {invoice.client.address && <p>{invoice.client.address}</p>}
                                            {(invoice.client.city || invoice.client.state || invoice.client.zip) && (
                                                <p>
                                                    {[invoice.client.city, invoice.client.state, invoice.client.zip]
                                                        .filter(Boolean).join(', ')}
                                                </p>
                                            )}
                                            {invoice.client.country && <p>{invoice.client.country}</p>}
                                            <p className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {invoice.client.email}
                                            </p>
                                            {invoice.client.phone && (
                                                <p className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {invoice.client.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                {/* Invoice Items */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold">Items</h4>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-muted">
                                                <tr>
                                                    <th className="text-left p-3 font-medium">Description</th>
                                                    <th className="text-right p-3 font-medium">Qty</th>
                                                    <th className="text-right p-3 font-medium">Unit Price</th>
                                                    <th className="text-right p-3 font-medium">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {invoice.items.map((item) => (
                                                    <tr key={item.id} className="border-t">
                                                        <td className="p-3">{item.description}</td>
                                                        <td className="p-3 text-right">{item.quantity}</td>
                                                        <td className="p-3 text-right">{formatCurrency(item.unit_price)}</td>
                                                        <td className="p-3 text-right font-medium">{formatCurrency(item.total)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Totals */}
                                    <div className="flex justify-end">
                                        <div className="w-64 space-y-2">
                                            <div className="flex justify-between">
                                                <span>Subtotal:</span>
                                                <span>{formatCurrency(invoice.subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Tax:</span>
                                                <span>{formatCurrency(invoice.tax_amount)}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Total:</span>
                                                <span>{formatCurrency(invoice.total_amount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes and Terms */}
                                {(invoice.notes || invoice.terms) && (
                                    <>
                                        <Separator className="my-6" />
                                        <div className="space-y-4">
                                            {invoice.notes && (
                                                <div>
                                                    <h4 className="font-semibold mb-2">Notes</h4>
                                                    <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                                                </div>
                                            )}
                                            {invoice.terms && (
                                                <div>
                                                    <h4 className="font-semibold mb-2">Terms & Conditions</h4>
                                                    <p className="text-sm text-muted-foreground">{invoice.terms}</p>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Payment History */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment History</CardTitle>
                                <CardDescription>
                                    All payments made for this invoice
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {invoice.payments.length > 0 ? (
                                        invoice.payments.map((payment) => (
                                            <div key={payment.id} className="p-3 border rounded-lg">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-medium">{formatCurrency(payment.amount)}</span>
                                                    <span className="text-sm text-muted-foreground">
                                                        {formatDate(payment.payment_date)}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    <p>Method: {payment.payment_method}</p>
                                                    {payment.reference && <p>Ref: {payment.reference}</p>}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-muted-foreground py-4">
                                            No payments recorded yet.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full justify-start" onClick={handleDownloadPDF}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download PDF
                                </Button>
                                <Link href={route('customer.communications.create')} className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Mail className="mr-2 h-4 w-4" />
                                        Contact Support
                                    </Button>
                                </Link>
                                <Link href={route('customer.support.create')} className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        <FileText className="mr-2 h-4 w-4" />
                                        Report Issue
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
