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
    Check,
    X,
    Calendar,
    FileText,
    DollarSign,
    Building,
    User,
    Mail,
    Phone,
    Clock
} from 'lucide-react';

interface QuotationItem {
    id: number;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
}

interface Quotation {
    id: number;
    quotation_number: string;
    status: string;
    issue_date: string;
    valid_until: string;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
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
    items: QuotationItem[];
}

interface Props {
    quotation: Quotation;
}

export default function Show({ quotation }: Props) {
    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'accepted':
                return 'secondary';
            case 'pending':
                return 'default';
            case 'rejected':
                return 'destructive';
            case 'expired':
                return 'outline';
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

    const isExpired = () => {
        return new Date(quotation.valid_until) < new Date();
    };

    const canAccept = () => {
        return quotation.status === 'pending' && !isExpired();
    };

    const handleDownloadPDF = () => {
        window.open(route('customer.finance.quotations.download', quotation.id), '_blank');
    };

    const handleAccept = () => {
        if (confirm('Are you sure you want to accept this quotation?')) {
            // Handle quotation acceptance
            window.location.href = route('customer.finance.quotations.accept', quotation.id);
        }
    };

    const handleReject = () => {
        if (confirm('Are you sure you want to reject this quotation?')) {
            // Handle quotation rejection
            window.location.href = route('customer.finance.quotations.reject', quotation.id);
        }
    };

    return (
        <CustomerLayout>
            <Head title={`Quotation ${quotation.quotation_number}`} />

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
                                    Quotation {quotation.quotation_number}
                                </h1>
                                <Badge variant={getStatusVariant(quotation.status)}>
                                    {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                                </Badge>
                                {isExpired() && quotation.status === 'pending' && (
                                    <Badge variant="destructive">Expired</Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground">
                                Issued on {formatDate(quotation.issue_date)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleDownloadPDF}>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                        </Button>
                        {canAccept() && (
                            <>
                                <Button variant="outline" onClick={handleReject}>
                                    <X className="h-4 w-4 mr-2" />
                                    Reject
                                </Button>
                                <Button onClick={handleAccept}>
                                    <Check className="h-4 w-4 mr-2" />
                                    Accept
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Quotation Overview */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(quotation.total_amount)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Issue Date</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-lg font-bold">{formatDate(quotation.issue_date)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Valid Until</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-lg font-bold ${isExpired() ? 'text-destructive' : ''}`}>
                                {formatDate(quotation.valid_until)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Status</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <Badge variant={getStatusVariant(quotation.status)} className="text-sm">
                                {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                            </Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* Expiration Warning */}
                {quotation.status === 'pending' && isExpired() && (
                    <Card className="border-destructive">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-2 text-destructive">
                                <Clock className="h-5 w-5" />
                                <p className="font-medium">This quotation has expired</p>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                                Please contact us to request a new quotation or extend the validity period.
                            </p>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Quotation Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Quotation Details */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Quotation Details</CardTitle>
                                        <CardDescription>
                                            Complete breakdown of proposed services and pricing
                                        </CardDescription>
                                    </div>
                                    {quotation.company.logo && (
                                        <img 
                                            src={quotation.company.logo} 
                                            alt={quotation.company.name}
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
                                            <p className="font-medium">{quotation.company.name}</p>
                                            {quotation.company.address && <p>{quotation.company.address}</p>}
                                            {(quotation.company.city || quotation.company.state || quotation.company.zip) && (
                                                <p>
                                                    {[quotation.company.city, quotation.company.state, quotation.company.zip]
                                                        .filter(Boolean).join(', ')}
                                                </p>
                                            )}
                                            {quotation.company.country && <p>{quotation.company.country}</p>}
                                            {quotation.company.email && (
                                                <p className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {quotation.company.email}
                                                </p>
                                            )}
                                            {quotation.company.phone && (
                                                <p className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {quotation.company.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Quote For
                                        </h4>
                                        <div className="text-sm space-y-1">
                                            <p className="font-medium">{quotation.client.name}</p>
                                            {quotation.client.address && <p>{quotation.client.address}</p>}
                                            {(quotation.client.city || quotation.client.state || quotation.client.zip) && (
                                                <p>
                                                    {[quotation.client.city, quotation.client.state, quotation.client.zip]
                                                        .filter(Boolean).join(', ')}
                                                </p>
                                            )}
                                            {quotation.client.country && <p>{quotation.client.country}</p>}
                                            <p className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {quotation.client.email}
                                            </p>
                                            {quotation.client.phone && (
                                                <p className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {quotation.client.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                {/* Quotation Items */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold">Proposed Services</h4>
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
                                                {quotation.items.map((item) => (
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
                                                <span>{formatCurrency(quotation.subtotal)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Tax:</span>
                                                <span>{formatCurrency(quotation.tax_amount)}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Total:</span>
                                                <span>{formatCurrency(quotation.total_amount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes and Terms */}
                                {(quotation.notes || quotation.terms) && (
                                    <>
                                        <Separator className="my-6" />
                                        <div className="space-y-4">
                                            {quotation.notes && (
                                                <div>
                                                    <h4 className="font-semibold mb-2">Notes</h4>
                                                    <p className="text-sm text-muted-foreground">{quotation.notes}</p>
                                                </div>
                                            )}
                                            {quotation.terms && (
                                                <div>
                                                    <h4 className="font-semibold mb-2">Terms & Conditions</h4>
                                                    <p className="text-sm text-muted-foreground">{quotation.terms}</p>
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
                        {/* Action Required */}
                        {canAccept() && (
                            <Card className="border-primary">
                                <CardHeader>
                                    <CardTitle className="text-primary">Action Required</CardTitle>
                                    <CardDescription>
                                        Please review and respond to this quotation
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button onClick={handleAccept} className="w-full">
                                        <Check className="mr-2 h-4 w-4" />
                                        Accept Quotation
                                    </Button>
                                    <Button variant="outline" onClick={handleReject} className="w-full">
                                        <X className="mr-2 h-4 w-4" />
                                        Reject Quotation
                                    </Button>
                                    <p className="text-xs text-muted-foreground">
                                        Valid until {formatDate(quotation.valid_until)}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

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
                                        Ask Questions
                                    </Button>
                                </Link>
                                <Link href={route('customer.support.create')} className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        <FileText className="mr-2 h-4 w-4" />
                                        Request Changes
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Quotation Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quotation Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-muted-foreground">Quotation Number</p>
                                    <p className="font-medium">{quotation.quotation_number}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Issue Date</p>
                                    <p className="font-medium">{formatDate(quotation.issue_date)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Valid Until</p>
                                    <p className={`font-medium ${isExpired() ? 'text-destructive' : ''}`}>
                                        {formatDate(quotation.valid_until)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Status</p>
                                    <Badge variant={getStatusVariant(quotation.status)}>
                                        {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
