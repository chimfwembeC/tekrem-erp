import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { 
    MessageSquare, 
    Mail, 
    Phone, 
    Calendar, 
    Search,
    Filter,
    Eye,
    Plus,
    Clock,
    CheckCircle,
    AlertCircle,
    User
} from 'lucide-react';

interface Communication {
    id: number;
    type: string;
    subject: string;
    content: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
    assigned_to?: {
        name: string;
    };
    responses_count: number;
}

interface Stats {
    total: number;
    pending: number;
    in_progress: number;
    resolved: number;
}

interface PaginationData {
    data: Communication[];
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
    type?: string;
    status?: string;
    priority?: string;
    search?: string;
}

interface Props {
    communications: PaginationData;
    stats: Stats;
    filters: Filters;
}

export default function Index({ communications, stats, filters }: Props) {
    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const search = formData.get('search') as string;
        
        router.get(route('customer.communications.index'), {
            ...filters,
            search: search || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleFilter = (key: string, value: string) => {
        router.get(route('customer.communications.index'), {
            ...filters,
            [key]: value === 'all' ? undefined : value,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'email':
                return <Mail className="h-4 w-4" />;
            case 'phone':
                return <Phone className="h-4 w-4" />;
            case 'meeting':
                return <Calendar className="h-4 w-4" />;
            default:
                return <MessageSquare className="h-4 w-4" />;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'resolved':
                return <CheckCircle className="h-4 w-4" />;
            case 'in_progress':
                return <Clock className="h-4 w-4" />;
            case 'pending':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <MessageSquare className="h-4 w-4" />;
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'resolved':
                return 'secondary';
            case 'in_progress':
                return 'default';
            case 'pending':
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
            <Head title="Communication History" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Communication History</h1>
                        <p className="text-muted-foreground">
                            View and manage your communication requests and history
                        </p>
                    </div>
                    <Link href={route('customer.communications.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Request
                        </Button>
                    </Link>
                </div>

                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Communications</CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending</CardTitle>
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pending}</div>
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
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <form onSubmit={handleSearch} className="md:col-span-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        name="search"
                                        placeholder="Search communications..."
                                        defaultValue={filters.search || ''}
                                        className="pl-10"
                                    />
                                </div>
                            </form>
                            <Select
                                value={filters.type || 'all'}
                                onValueChange={(value) => handleFilter('type', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="email">Email</SelectItem>
                                    <SelectItem value="phone">Phone</SelectItem>
                                    <SelectItem value="meeting">Meeting</SelectItem>
                                    <SelectItem value="chat">Chat</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={filters.status || 'all'}
                                onValueChange={(value) => handleFilter('status', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
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
                        </div>
                    </CardContent>
                </Card>

                {/* Communications List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Communications</CardTitle>
                        <CardDescription>
                            Your communication history and requests
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {communications.data.length > 0 ? (
                                communications.data.map((communication) => (
                                    <div key={communication.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className="p-2 bg-secondary rounded-lg">
                                                {getTypeIcon(communication.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-medium truncate">{communication.subject}</h3>
                                                    <Badge variant={getPriorityVariant(communication.priority)}>
                                                        {communication.priority}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                                    {communication.content}
                                                </p>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span>{formatDate(communication.created_at)}</span>
                                                    {communication.assigned_to && (
                                                        <span className="flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            {communication.assigned_to.name}
                                                        </span>
                                                    )}
                                                    {communication.responses_count > 0 && (
                                                        <span>{communication.responses_count} response{communication.responses_count !== 1 ? 's' : ''}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Badge variant={getStatusVariant(communication.status)}>
                                                {getStatusIcon(communication.status)}
                                                <span className="ml-1 capitalize">{communication.status.replace('_', ' ')}</span>
                                            </Badge>
                                            <Link href={route('customer.communications.show', communication.id)}>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No communications found</h3>
                                    <p className="text-muted-foreground mb-4">
                                        {filters.search || filters.type || filters.status || filters.priority
                                            ? "No communications match your current filters."
                                            : "You haven't started any communications yet."
                                        }
                                    </p>
                                    {(filters.search || filters.type || filters.status || filters.priority) ? (
                                        <Button 
                                            variant="outline" 
                                            onClick={() => router.get(route('customer.communications.index'))}
                                        >
                                            Clear Filters
                                        </Button>
                                    ) : (
                                        <Link href={route('customer.communications.create')}>
                                            <Button>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Start Communication
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {communications.data.length > 0 && communications.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6">
                                <div className="text-sm text-muted-foreground">
                                    Showing {communications.from} to {communications.to} of {communications.total} communications
                                </div>
                                <div className="flex items-center space-x-2">
                                    {communications.links.map((link, index) => (
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
