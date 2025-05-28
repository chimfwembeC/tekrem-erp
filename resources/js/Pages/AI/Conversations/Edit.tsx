import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import AppLayout from '@/Layouts/AppLayout';
import {
    MessageSquare,
    Bot,
    ArrowLeft,
    Save,
    AlertCircle,
    Loader2,
    Archive
} from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';

interface Conversation {
    id: number;
    title: string;
    context_type: string | null;
    context_id: number | null;
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
    metadata?: Record<string, any>;
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

interface FormData {
    title: string;
    metadata: Record<string, any>;
}

export default function Edit({ conversation }: Props) {
    const { t } = useTranslate();

    const { data, setData, put, processing, errors, reset } = useForm<FormData>({
        title: conversation.title,
        metadata: conversation.metadata || {},
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('ai.conversations.update', conversation.id));
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

    return (
        <AppLayout
            title={t('Edit Conversation')}
            renderHeader={() => (
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('ai.conversations.show', conversation.id)}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('Back to Conversation')}
                            </Button>
                        </Link>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                {t('Edit Conversation')}
                            </h2>
                            <p className="text-gray-600 text-sm mt-1">
                                {t('Update conversation details and settings')}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        >
            <Head title={t('Edit Conversation')} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Conversation Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <MessageSquare className="h-5 w-5 mr-2" />
                                {t('Conversation Information')}
                            </CardTitle>
                            <CardDescription>
                                {t('Current conversation details and statistics')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-600">{t('AI Model')}</Label>
                                    <div className="flex items-center space-x-2">
                                        <Bot className="h-4 w-4 text-gray-600" />
                                        <span className="font-medium">{conversation.ai_model.name}</span>
                                        <Badge variant="outline">{conversation.ai_model.type}</Badge>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {conversation.ai_model.service.name} ({conversation.ai_model.service.provider})
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-600">{t('Context')}</Label>
                                    <div className="flex items-center space-x-2">
                                        {conversation.context_type ? (
                                            <>
                                                <Badge className={getContextColor(conversation.context_type)}>
                                                    {conversation.context_type.toUpperCase()}
                                                </Badge>
                                                {conversation.context_id && (
                                                    <span className="text-sm text-gray-600">ID: {conversation.context_id}</span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-sm text-gray-500">{t('No context')}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-600">{t('Statistics')}</Label>
                                    <div className="text-sm space-y-1">
                                        <div>{t('Messages')}: <span className="font-medium">{conversation.message_count}</span></div>
                                        <div>{t('Tokens')}: <span className="font-medium">{conversation.total_tokens.toLocaleString()}</span></div>
                                        <div>{t('Cost')}: <span className="font-medium">{formatCurrency(conversation.total_cost)}</span></div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-600">{t('Dates')}</Label>
                                    <div className="text-sm space-y-1">
                                        <div>{t('Created')}: <span className="font-medium">{formatDate(conversation.created_at)}</span></div>
                                        <div>{t('Last Message')}: <span className="font-medium">{formatDate(conversation.last_message_at)}</span></div>
                                    </div>
                                </div>
                            </div>

                            {conversation.is_archived && (
                                <Alert>
                                    <Archive className="h-4 w-4" />
                                    <AlertDescription>
                                        {t('This conversation is currently archived.')}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Edit Form */}
                    <form onSubmit={handleSubmit}>
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('Edit Details')}</CardTitle>
                                <CardDescription>
                                    {t('Update the conversation title and metadata')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">{t('Conversation Title')} *</Label>
                                    <Input
                                        id="title"
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder={t('Enter a descriptive title for this conversation')}
                                        className={errors.title ? 'border-red-500' : ''}
                                    />
                                    {errors.title && (
                                        <p className="text-sm text-red-600">{errors.title}</p>
                                    )}
                                    <p className="text-sm text-gray-600">
                                        {t('A clear title helps identify the conversation purpose')}
                                    </p>
                                </div>

                                {/* Metadata Info */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-600">{t('Metadata')}</Label>
                                    <div className="bg-gray-50 p-3 rounded-md">
                                        <p className="text-sm text-gray-600 mb-2">
                                            {t('Current metadata:')}
                                        </p>
                                        {Object.keys(data.metadata).length > 0 ? (
                                            <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                                                {JSON.stringify(data.metadata, null, 2)}
                                            </pre>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">
                                                {t('No metadata available')}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between pt-4 border-t">
                                    <Link href={route('ai.conversations.show', conversation.id)}>
                                        <Button type="button" variant="outline">
                                            {t('Cancel')}
                                        </Button>
                                    </Link>

                                    <div className="flex items-center space-x-3">
                                        {processing && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                {t('Saving changes...')}
                                            </div>
                                        )}
                                        <Button
                                            type="submit"
                                            disabled={processing || !data.title}
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            {t('Save Changes')}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Validation Errors */}
                        {Object.keys(errors).length > 0 && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {t('Please fix the following errors:')}
                                    <ul className="mt-2 list-disc list-inside">
                                        {Object.entries(errors).map(([field, message]) => (
                                            <li key={field} className="text-sm">{message}</li>
                                        ))}
                                    </ul>
                                </AlertDescription>
                            </Alert>
                        )}
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
