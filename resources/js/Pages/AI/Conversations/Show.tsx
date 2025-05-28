import React, { useState, useRef, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Textarea } from '@/Components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/Components/ui/avatar';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import AppLayout from '@/Layouts/AppLayout';
import {
    MessageSquare,
    Bot,
    User,
    ArrowLeft,
    MoreHorizontal,
    Edit,
    Archive,
    ArchiveRestore,
    Trash2,
    Send,
    Copy,
    Download,
    Clock,
    DollarSign,
    Zap,
    AlertCircle,
    CheckCircle,
    Loader2
} from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import { toast } from 'sonner';

interface Message {
    role: string;
    content: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

interface Conversation {
    id: number;
    title: string;
    context_type: string | null;
    context_id: number | null;
    messages: Message[];
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

interface Props {
    conversation: Conversation;
}

export default function Show({ conversation }: Props) {
    const { t } = useTranslate();
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation.messages]);

    const sendMessage = async () => {
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const response = await fetch(route('ai.conversations.messages.store', conversation.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    role: 'user',
                    content: newMessage,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setNewMessage('');
                router.reload({ only: ['conversation'] });
                toast.success(t('Message sent successfully'));
            } else {
                toast.error(data.message || t('Failed to send message'));
            }
        } catch (error) {
            toast.error(t('Failed to send message'));
        } finally {
            setSending(false);
        }
    };

    const toggleArchive = async () => {
        const endpoint = conversation.is_archived ? 'ai.conversations.unarchive' : 'ai.conversations.archive';

        try {
            const response = await fetch(route(endpoint, conversation.id), {
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

    const deleteConversation = () => {
        if (confirm(t('Are you sure you want to delete this conversation?'))) {
            router.delete(route('ai.conversations.destroy', conversation.id), {
                onSuccess: () => toast.success(t('Conversation deleted successfully')),
                onError: () => toast.error(t('Failed to delete conversation')),
            });
        }
    };

    const copyMessage = (content: string) => {
        navigator.clipboard.writeText(content);
        toast.success(t('Message copied to clipboard'));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 4,
        }).format(amount);
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

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'user':
                return <User className="h-4 w-4 text-blue-600" />;
            case 'assistant':
                return <Bot className="h-4 w-4 text-green-600" />;
            case 'system':
                return <AlertCircle className="h-4 w-4 text-orange-600" />;
            default:
                return <MessageSquare className="h-4 w-4 text-gray-600" />;
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'user':
                return 'bg-blue-50 border-blue-200';
            case 'assistant':
                return 'bg-green-50 border-green-200';
            case 'system':
                return 'bg-orange-50 border-orange-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <AppLayout
            title={conversation.title}
            renderHeader={() => (
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('ai.conversations.index')}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('Back to Conversations')}
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                    {conversation.title}
                                </h2>
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
                            <p className="text-gray-600 text-sm mt-1">
                                {conversation.user.name} • {conversation.ai_model.name}
                            </p>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link href={route('ai.conversations.edit', conversation.id)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    {t('Edit')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={toggleArchive}>
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
                            <DropdownMenuItem onClick={() => window.print()}>
                                <Download className="h-4 w-4 mr-2" />
                                {t('Export')}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={deleteConversation}
                                className="text-red-600"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t('Delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        >
            <Head title={conversation.title} />

            <div className="py-6">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Conversation Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <MessageSquare className="h-4 w-4 text-gray-600" />
                                    <div>
                                        <div className="text-2xl font-bold">{conversation.message_count}</div>
                                        <div className="text-sm text-gray-600">{t('Messages')}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <Zap className="h-4 w-4 text-gray-600" />
                                    <div>
                                        <div className="text-2xl font-bold">{conversation.total_tokens.toLocaleString()}</div>
                                        <div className="text-sm text-gray-600">{t('Tokens')}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <DollarSign className="h-4 w-4 text-gray-600" />
                                    <div>
                                        <div className="text-2xl font-bold">{formatCurrency(conversation.total_cost)}</div>
                                        <div className="text-sm text-gray-600">{t('Cost')}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4 text-gray-600" />
                                    <div>
                                        <div className="text-sm font-medium">{formatDate(conversation.last_message_at)}</div>
                                        <div className="text-sm text-gray-600">{t('Last Message')}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Messages */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <MessageSquare className="h-5 w-5 mr-2" />
                                {t('Conversation')}
                            </CardTitle>
                            <CardDescription>
                                {t('AI Model')}: {conversation.ai_model.name} ({conversation.ai_model.service.name})
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4 max-h-[500px] overflow-y-auto">
                                {conversation.messages.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p>{t('No messages yet. Start the conversation below.')}</p>
                                    </div>
                                ) : (
                                    conversation.messages.map((message, index) => (
                                        <div key={index} className={`p-4 rounded-lg border ${getRoleColor(message.role)}`}>
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                    {getRoleIcon(message.role)}
                                                    <span className="font-medium capitalize">{message.role}</span>
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(message.timestamp)}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyMessage(message.content)}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <div className="prose prose-sm max-w-none">
                                                <p className="whitespace-pre-wrap">{message.content}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Message Input */}
                    {!conversation.is_archived && (
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex space-x-4">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>
                                            {conversation.user.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-2">
                                        <Textarea
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder={t('Type your message...')}
                                            rows={3}
                                            className="resize-none"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    sendMessage();
                                                }
                                            }}
                                        />
                                        <div className="flex justify-between items-center">
                                            <p className="text-xs text-gray-500">
                                                {t('Press Enter to send, Shift+Enter for new line')}
                                            </p>
                                            <Button
                                                onClick={sendMessage}
                                                disabled={!newMessage.trim() || sending}
                                                size="sm"
                                            >
                                                {sending ? (
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                ) : (
                                                    <Send className="h-4 w-4 mr-2" />
                                                )}
                                                {t('Send')}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {conversation.is_archived && (
                        <Alert>
                            <Archive className="h-4 w-4" />
                            <AlertDescription>
                                {t('This conversation is archived. Unarchive it to continue messaging.')}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
