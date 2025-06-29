import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { 
    CreditCard, 
    FileText, 
    DollarSign, 
    Calendar, 
    Search,
    Filter,
    Eye,
    Download,
    AlertCircle,
    CheckCircle,
    Clock
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Invoice {
    id: number;
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    status: string;
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    description?: string;
    created_at: string;
}

interface Payment {
    id: number;
    amount: number;
    payment_date: string;
    payment_method: string;
    reference_number?: string;
    invoice?: {
        invoice_number: string;
    };
}

interface Stats {
    total_invoices: number;
    paid_invoices: number;
    pending_invoices: number;
    overdue_invoices: number;
    total_amount: number;
    paid_amount: number;
    outstanding_amount: number;
}

interface PaginationData {
    data: Invoice[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Filters {
    status?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
}

interface Props {
    invoices: PaginationData;
    recent_payments: Payment[];
    stats: Stats;
    filters: Filters;
}

export default function Index({ invoices, recent_payments, stats, filters }: Props) {
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const search = formData.get('search') as string;
        const route = useRoute();

        router.get(route('customer.finance.index'), {
            ...filters,
            search: search || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleStatusFilter = (status: string) => {
        router.get(route('customer.finance.index'), {
            ...filters,
            status: status === 'all' ? undefined : status,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid':
                return <CheckCircle className="h-4 w-4" />;
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'overdue':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'paid':
                return 'secondary';
            case 'pending':
                return 'default';
            case 'overdue':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const isOverdue = (dueDate: string, status: string) => {
        return status !== 'paid' && new Date(dueDate) < new Date();
    };

    return (
        <CustomerLayout>
            <Head title="Financial Overview" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Financial Overview</h1>
                        <p className="text-muted-foreground">
                            Track your invoices, payments, and financial status
                        </p>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_invoices}</div>
                            <p className="text-xs text-muted-foreground">
                                {formatCurrency(stats.total_amount)} total value
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.outstanding_amount)}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.pending_invoices + stats.overdue_invoices} unpaid invoices
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.paid_amount)}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.paid_invoices} paid invoices
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.overdue_invoices}</div>
                            <p className="text-xs text-muted-foreground">
                                Require immediate attention
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Invoices List */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>My Invoices</CardTitle>
                                    <Link href={route('customer.finance.invoices.index')}>
                                        <Button variant="outline" size="sm">
                                            View All
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {/* Filters */}
                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    <form onSubmit={handleSearch} className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                name="search"
                                                placeholder="Search invoices..."
                                                defaultValue={filters.search || ''}
                                                className="pl-10"
                                            />
                                        </div>
                                    </form>
                                    <Select
                                        value={filters.status || 'all'}
                                        onValueChange={handleStatusFilter}
                                    >
                                        <SelectTrigger className="w-full sm:w-48">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="overdue">Overdue</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Invoices */}
                                <div className="space-y-4">
                                    {invoices.data.length > 0 ? (
                                        invoices.data.map((invoice) => (
                                            <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <div>
                                                            <div className="font-medium">{invoice.invoice_number}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                Due: {formatDate(invoice.due_date)}
                                                                {isOverdue(invoice.due_date, invoice.status) && (
                                                                    <span className="text-destructive ml-2">(Overdue)</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="font-medium">{formatCurrency(invoice.total_amount)}</div>
                                                        <Badge variant={getStatusVariant(invoice.status)}>
                                                            {getStatusIcon(invoice.status)}
                                                            <span className="ml-1 capitalize">{invoice.status}</span>
                                                        </Badge>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Link href={route('customer.finance.invoices.show', invoice.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link href={route('customer.finance.invoices.download', invoice.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <FileText className="mx-auto h-8 w-8 mb-2" />
                                            <p>No invoices found</p>
                                        </div>
                                    )}
                                </div>

                                {/* Pagination */}
                                {invoices.data.length > 0 && invoices.last_page > 1 && (
                                    <div className="flex items-center justify-between mt-6">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {invoices.from} to {invoices.to} of {invoices.total} invoices
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {invoices.links.map((link, index) => (
                                                <Button
                                                    key={index}
                                                    variant={link.active ? "default" : "outline"}
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.get(link.url)}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Payments */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Payments</CardTitle>
                                <CardDescription>Your latest payment history</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recent_payments.length > 0 ? (
                                        recent_payments.map((payment) => (
                                            <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-secondary rounded-lg">
                                                        <CreditCard className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{formatCurrency(payment.amount)}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {payment.invoice?.invoice_number || 'Direct Payment'}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {formatDate(payment.payment_date)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 text-muted-foreground">
                                            <CreditCard className="mx-auto h-8 w-8 mb-2" />
                                            <p>No payments yet</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
