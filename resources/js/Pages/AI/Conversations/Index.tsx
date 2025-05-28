import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import AppLayout from '@/Layouts/AppLayout';
import {
    MessageSquare,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Archive,
    ArchiveRestore,
    Trash2,
    Clock,
    Bot,
    User,
    DollarSign,
    Zap
} from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import { toast } from 'sonner';

interface Conversation {
    id: number;
    title: string;
    context_type: string | null;
    context_id: number | null;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    messages: Array<{
        role: string;
        content: string;
        timestamp: string;
    }>;
    total_tokens: number;
    total_cost: number;
    message_count: number;
    last_message_at: string;
    is_archived: boolean;
    user: {
        id: number;
        name: string;
        email: string;
    };
    ai_model: {
        id: number;
        name: string;
        type: string;
        service: {
            name: string;
            provider: string;
        };
    };
    created_at: string;
    updated_at: string;
}

interface AIModel {
    id: number;
    name: string;
    type: string;
}

interface PaginatedData {
    data: Conversation[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
   
}

interface Props {
    conversations: PaginatedData;
    models: AIModel[];
    filters: {
        search?: string;
        model_id?: string;
        context_type?: string;
        is_archived?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function Index({ conversations, models, filters }: Props) {
    const { t } = useTranslate();
    const [search, setSearch] = useState(filters.search || '');
    const [selectedModel, setSelectedModel] = useState(filters.model_id || 'all');
    const [selectedContext, setSelectedContext] = useState(filters.context_type || 'all');
    const [archivedFilter, setArchivedFilter] = useState(filters.is_archived || 'all');

    const handleSearch = () => {
        router.get(route('ai.conversations.index'), {
            search,
            model_id: selectedModel === 'all' ? '' : selectedModel,
            context_type: selectedContext === 'all' ? '' : selectedContext,
            is_archived: archivedFilter === 'all' ? '' : archivedFilter,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedModel('all');
        setSelectedContext('all');
        setArchivedFilter('all');
        router.get(route('ai.conversations.index'));
    };

    const toggleArchive = async (conversationId: number, isArchived: boolean) => {
        const endpoint = isArchived ? 'ai.conversations.unarchive' : 'ai.conversations.archive';

        try {
            const response = await fetch(route(endpoint, conversationId), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);
                router.reload();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to update conversation');
        }
    };

    const deleteConversation = (conversationId: number) => {
        if (confirm(t('Are you sure you want to delete this conversation?'))) {
            router.delete(route('ai.conversations.destroy', conversationId), {
                onSuccess: () => toast.success(t('Conversation deleted successfully')),
                onError: () => toast.error(t('Failed to delete conversation')),
            });
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 4,
        }).format(amount);
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

    const getContextColor = (contextType: string | null) => {
        const colors = {
            crm: 'bg-blue-100 text-blue-800',
            finance: 'bg-green-100 text-green-800',
            support: 'bg-orange-100 text-orange-800',
            general: 'bg-gray-100 text-gray-800',
        };
        return colors[contextType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getLastMessage = (conversation: Conversation) => {
        if (!conversation.messages || conversation.messages.length === 0) {
            return t('No messages');
        }

        const lastMessage = conversation.messages[conversation.messages.length - 1];
        const content = lastMessage.content.length > 100
            ? lastMessage.content.substring(0, 100) + '...'
            : lastMessage.content;

        return content;
    };

    const getLastMessageRole = (conversation: Conversation) => {
        if (!conversation.messages || conversation.messages.length === 0) {
            return null;
        }

        return conversation.messages[conversation.messages.length - 1].role;
    };

    return (
        <AppLayout
            title={t('AI Conversations')}
            renderHeader={() => (
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            {t('AI Conversations')}
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                            {t('View and manage AI conversation history')}
                        </p>
                    </div>
                    <Link href={route('ai.conversations.create')}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            {t('New Conversation')}
                        </Button>
                    </Link>
                </div>
            )}
        >
            <Head title={t('AI Conversations')} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('Filters')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder={t('Search conversations...')}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>

                                <Select value={selectedModel} onValueChange={setSelectedModel}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('All Models')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('All Models')}</SelectItem>
                                        {models.map((model) => (
                                            <SelectItem key={model.id} value={model.id.toString()}>
                                                {model.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedContext} onValueChange={setSelectedContext}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('All Contexts')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('All Contexts')}</SelectItem>
                                        <SelectItem value="crm">{t('CRM')}</SelectItem>
                                        <SelectItem value="finance">{t('Finance')}</SelectItem>
                                        <SelectItem value="support">{t('Support')}</SelectItem>
                                        <SelectItem value="general">{t('General')}</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={archivedFilter} onValueChange={setArchivedFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('All Status')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('All Status')}</SelectItem>
                                        <SelectItem value="0">{t('Active')}</SelectItem>
                                        <SelectItem value="1">{t('Archived')}</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="flex space-x-2">
                                    <Button onClick={handleSearch} className="flex-1">
                                        <Filter className="h-4 w-4 mr-2" />
                                        {t('Filter')}
                                    </Button>
                                    <Button variant="outline" onClick={clearFilters}>
                                        {t('Clear')}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Conversations List */}
                    {conversations.data.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {t('No conversations found')}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {t('Start a new conversation with AI to see it here.')}
                                </p>
                                <Link href={route('ai.conversations.create')}>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        {t('New Conversation')}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {conversations.data.map((conversation) => (
                                <Card key={conversation.id} className={`transition-all hover:shadow-md ${conversation.is_archived ? 'opacity-75' : ''}`}>
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback>
                                                            {conversation.user.name.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center space-x-2">
                                                            <h3 className="text-lg font-medium text-gray-900 truncate">
                                                                {conversation.title}
                                                            </h3>
                                                            {conversation.is_archived && (
                                                                <Badge variant="secondary">
                                                                    <Archive className="h-3 w-3 mr-1" />
                                                                    {t('Archived')}
                                                                </Badge>
                                                            )}
                                                            {conversation.context_type && (
                                                                <Badge className={getContextColor(conversation.context_type)}>
                                                                    {conversation.context_type.toUpperCase()}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600">
                                                            {conversation.user.name} • {conversation.ai_model.name}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <div className="flex items-start space-x-2">
                                                        {getLastMessageRole(conversation) === 'user' ? (
                                                            <User className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                        ) : (
                                                            <Bot className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                        )}
                                                        <p className="text-sm text-gray-700 line-clamp-2">
                                                            {getLastMessage(conversation)}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-xs text-gray-500">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex items-center">
                                                            <MessageSquare className="h-3 w-3 mr-1" />
                                                            {conversation.message_count} {t('messages')}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Zap className="h-3 w-3 mr-1" />
                                                            {conversation.total_tokens.toLocaleString()} {t('tokens')}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <DollarSign className="h-3 w-3 mr-1" />
                                                            {formatCurrency(conversation.total_cost)}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {formatDate(conversation.last_message_at)}
                                                    </div>
                                                </div>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('ai.conversations.show', conversation.id)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            {t('View')}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => toggleArchive(conversation.id, conversation.is_archived)}
                                                    >
                                                        {conversation.is_archived ? (
                                                            <>
                                                                <ArchiveRestore className="h-4 w-4 mr-2" />
                                                                {t('Unarchive')}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Archive className="h-4 w-4 mr-2" />
                                                                {t('Archive')}
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => deleteConversation(conversation.id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        {t('Delete')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {conversations.last_page > 1 && (
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                {t('Showing')} {conversations.from} {t('to')} {conversations.to} {t('of')} {conversations.total} {t('results')}
                            </div>
                            <div className="flex space-x-1">
                                {conversations.links.map((link, index) => (
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
                </div>
            </div>
        </AppLayout>
    );
}
