import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { 
    HelpCircle, 
    Ticket, 
    MessageSquare, 
    Book, 
    Search,
    Filter,
    Eye,
    Plus,
    Clock,
    CheckCircle,
    AlertCircle,
    User,
    Calendar
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface SupportTicket {
    id: number;
    ticket_number: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    category?: {
        name: string;
        color: string;
    };
    assigned_to?: {
        name: string;
    };
    created_at: string;
    updated_at: string;
    responses_count: number;
}

interface Stats {
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
}

interface PaginationData {
    data: SupportTicket[];
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
    priority?: string;
    category?: string;
    search?: string;
}

interface Props {
    tickets: PaginationData;
    stats: Stats;
    filters: Filters;
}

export default function Index({ tickets, stats, filters }: Props) {
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const search = formData.get('search') as string;
        const route = useRoute();

        router.get(route('customer.support.index'), {
            ...filters,
            search: search || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilter = (key: string, value: string) => {
        router.get(route('customer.support.index'), {
            ...filters,
            [key]: value === 'all' ? undefined : value,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'resolved':
            case 'closed':
                return <CheckCircle className="h-4 w-4" />;
            case 'in_progress':
                return <Clock className="h-4 w-4" />;
            case 'open':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <Ticket className="h-4 w-4" />;
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'resolved':
            case 'closed':
                return 'secondary';
            case 'in_progress':
                return 'default';
            case 'open':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const getPriorityVariant = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'destructive';
            case 'medium':
                return 'default';
            case 'low':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <CustomerLayout>
            <Head title="Support Portal" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Support Portal</h1>
                        <p className="text-muted-foreground">
                            Get help and manage your support tickets
                        </p>
                    </div>
                    <Link href={route('customer.support.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Ticket
                        </Button>
                    </Link>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Link href={route('customer.support.create')}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Plus className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Create New Ticket</CardTitle>
                                        <CardDescription>Get help with your issues</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                    <Link href={route('customer.support.knowledge-base.index')}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Book className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">Knowledge Base</CardTitle>
                                        <CardDescription>Browse helpful articles</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                    <Link href={route('customer.support.faq')}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <HelpCircle className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">FAQ</CardTitle>
                                        <CardDescription>Common questions</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                            <Ticket className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Open</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.open}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.in_progress}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.resolved}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Closed</CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.closed}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tickets List */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>My Tickets</CardTitle>
                            <Badge variant="outline">{tickets.total} total</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <form onSubmit={handleSearch}>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        name="search"
                                        placeholder="Search tickets..."
                                        defaultValue={filters.search || ''}
                                        className="pl-10"
                                    />
                                </div>
                            </form>
                            <Select
                                value={filters.status || 'all'}
                                onValueChange={(value) => handleFilter('status', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.priority || 'all'}
                                onValueChange={(value) => handleFilter('priority', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.category || 'all'}
                                onValueChange={(value) => handleFilter('category', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="technical">Technical</SelectItem>
                                    <SelectItem value="billing">Billing</SelectItem>
                                    <SelectItem value="general">General</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Tickets */}
                        <div className="space-y-4">
                            {tickets.data.length > 0 ? (
                                tickets.data.map((ticket) => (
                                    <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="p-2 bg-secondary rounded-lg">
                                                {getStatusIcon(ticket.status)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-medium truncate">{ticket.subject}</h3>
                                                    <Badge variant="outline" className="text-xs">
                                                        {ticket.ticket_number}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                    {ticket.description}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(ticket.created_at)}
                                                    </span>
                                                    {ticket.assigned_to && (
                                                        <span className="flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            {ticket.assigned_to.name}
                                                        </span>
                                                    )}
                                                    {ticket.responses_count > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <MessageSquare className="h-3 w-3" />
                                                            {ticket.responses_count} response{ticket.responses_count !== 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col gap-1">
                                                <Badge variant={getStatusVariant(ticket.status)}>
                                                    {ticket.status.replace('_', ' ')}
                                                </Badge>
                                                <Badge variant={getPriorityVariant(ticket.priority)}>
                                                    {ticket.priority}
                                                </Badge>
                                            </div>
                                            <Link href={route('customer.support.tickets.show', ticket.id)}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {filters.search || filters.status || filters.priority || filters.category
                                            ? "No tickets match your current filters."
                                            : "You haven't created any support tickets yet."
                                        }
                                    </p>
                                    {(filters.search || filters.status || filters.priority || filters.category) ? (
                                        <Button 
                                            variant="outline" 
                                            onClick={() => router.get(route('customer.support.index'))}
                                        >
                                            Clear Filters
                                        </Button>
                                    ) : (
                                        <Link href={route('customer.support.create')}>
                                            <Button>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create Your First Ticket
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {tickets.data.length > 0 && tickets.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-muted-foreground">
                                    Showing {tickets.from} to {tickets.to} of {tickets.total} tickets
                                </div>
                                <div className="flex items-center space-x-2">
                                    {tickets.links.map((link, index) => (
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
        </CustomerLayout>
    );
}
