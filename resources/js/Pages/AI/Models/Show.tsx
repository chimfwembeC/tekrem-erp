import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import AppLayout from '@/Layouts/AppLayout';
import {
    Bot,
    ArrowLeft,
    MoreHorizontal,
    Edit,
    Power,
    Star,
    Trash2,
    Settings,
    Zap,
    DollarSign,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp
} from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import { toast } from 'sonner';

interface AIModel {
    id: number;
    name: string;
    model_identifier: string;
    type: string;
    description: string | null;
    is_enabled: boolean;
    is_default: boolean;
    capabilities: string[];
    max_tokens: number;
    temperature: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
    cost_per_input_token: number;
    cost_per_output_token: number;
    configuration: Record<string, any>;
    service: {
        id: number;
        name: string;
        provider: string;
    };
    usage_stats?: {
        total_conversations: number;
        total_tokens: number;
        total_cost: number;
        avg_tokens_per_conversation: number;
    };
    created_at: string;
    updated_at: string;
}

interface Props {
    model: AIModel;
}

export default function Show({ model }: Props) {
    const { t } = useTranslate();

    const toggleModelStatus = async () => {
        try {
            const response = await fetch(route('ai.models.toggle-status', model.id), {
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
            toast.error('Failed to toggle model status');
        }
    };

    const setAsDefault = async () => {
        try {
            const response = await fetch(route('ai.models.set-default', model.id), {
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
            toast.error('Failed to set as default');
        }
    };

    const deleteModel = () => {
        if (confirm(t('Are you sure you want to delete this model?'))) {
            router.delete(route('ai.models.destroy', model.id), {
                onSuccess: () => toast.success(t('Model deleted successfully')),
                onError: () => toast.error(t('Failed to delete model')),
            });
        }
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
            minimumFractionDigits: 6,
        }).format(amount);
    };

    const getTypeColor = (type: string) => {
        const colors = {
            chat: 'bg-blue-100 text-blue-800',
            completion: 'bg-green-100 text-green-800',
            embedding: 'bg-purple-100 text-purple-800',
            image: 'bg-orange-100 text-orange-800',
            audio: 'bg-pink-100 text-pink-800',
        };
        return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout
            title={model.name}
            renderHeader={() => (
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('ai.models.index')}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('Back to Models')}
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                    {model.name}
                                </h2>
                                {model.is_default && (
                                    <Badge variant="default">
                                        <Star className="h-3 w-3 mr-1" />
                                        {t('Default')}
                                    </Badge>
                                )}
                                <Badge className={getTypeColor(model.type)}>
                                    {model.type.toUpperCase()}
                                </Badge>
                                <Badge variant={model.is_enabled ? 'default' : 'secondary'}>
                                    {model.is_enabled ? t('Enabled') : t('Disabled')}
                                </Badge>
                            </div>
                            <p className="text-gray-600 text-sm mt-1">
                                {model.service.name} • {model.model_identifier}
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
                                <Link href={route('ai.models.edit', model.id)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    {t('Edit')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={toggleModelStatus}>
                                <Power className="h-4 w-4 mr-2" />
                                {model.is_enabled ? t('Disable') : t('Enable')}
                            </DropdownMenuItem>
                            {!model.is_default && model.is_enabled && (
                                <DropdownMenuItem onClick={setAsDefault}>
                                    <Star className="h-4 w-4 mr-2" />
                                    {t('Set as Default')}
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={deleteModel}
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
            <Head title={model.name} />

            <div className="py-6">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Status Alert */}
                    {!model.is_enabled && (
                        <Alert>
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>
                                {t('This model is currently disabled and cannot be used for new conversations.')}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Model Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Basic Information */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Bot className="h-5 w-5 mr-2" />
                                    {t('Model Information')}
                                </CardTitle>
                                <CardDescription>
                                    {t('Basic configuration and details')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-gray-600">{t('Service Provider')}</div>
                                        <div className="flex items-center space-x-2">
                                            <Settings className="h-4 w-4 text-gray-600" />
                                            <span className="font-medium">{model.service.name}</span>
                                            <Badge variant="outline">{model.service.provider}</Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-gray-600">{t('Model Identifier')}</div>
                                        <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                            {model.model_identifier}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-gray-600">{t('Type')}</div>
                                        <Badge className={getTypeColor(model.type)}>
                                            {model.type.toUpperCase()}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-gray-600">{t('Status')}</div>
                                        <div className="flex items-center space-x-1">
                                            {model.is_enabled ? (
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-red-600" />
                                            )}
                                            <span className={`text-sm ${model.is_enabled ? 'text-green-600' : 'text-red-600'}`}>
                                                {model.is_enabled ? t('Enabled') : t('Disabled')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {model.description && (
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-gray-600">{t('Description')}</div>
                                        <p className="text-sm text-gray-700">{model.description}</p>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-600">{t('Created')}</div>
                                    <div className="flex items-center space-x-1 text-sm text-gray-700">
                                        <Clock className="h-4 w-4" />
                                        <span>{formatDate(model.created_at)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Usage Statistics */}
                        {model.usage_stats && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <TrendingUp className="h-5 w-5 mr-2" />
                                        {t('Usage Statistics')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{model.usage_stats.total_conversations}</div>
                                        <div className="text-sm text-gray-600">{t('Conversations')}</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{model.usage_stats.total_tokens.toLocaleString()}</div>
                                        <div className="text-sm text-gray-600">{t('Total Tokens')}</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{formatCurrency(model.usage_stats.total_cost)}</div>
                                        <div className="text-sm text-gray-600">{t('Total Cost')}</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-lg font-medium">{Math.round(model.usage_stats.avg_tokens_per_conversation)}</div>
                                        <div className="text-sm text-gray-600">{t('Avg Tokens/Conv')}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Configuration Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Model Parameters */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Settings className="h-5 w-5 mr-2" />
                                    {t('Model Parameters')}
                                </CardTitle>
                                <CardDescription>
                                    {t('Configuration settings for this model')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-gray-600">{t('Max Tokens')}</div>
                                        <div className="text-lg font-semibold">{model.max_tokens.toLocaleString()}</div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-gray-600">{t('Temperature')}</div>
                                        <div className="text-lg font-semibold">{model.temperature}</div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-gray-600">{t('Top P')}</div>
                                        <div className="text-lg font-semibold">{model.top_p}</div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-sm font-medium text-gray-600">{t('Frequency Penalty')}</div>
                                        <div className="text-lg font-semibold">{model.frequency_penalty}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cost Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <DollarSign className="h-5 w-5 mr-2" />
                                    {t('Cost Information')}
                                </CardTitle>
                                <CardDescription>
                                    {t('Pricing details for token usage')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">{t('Input Token Cost')}</span>
                                        <span className="font-semibold">{formatCurrency(model.cost_per_input_token)}</span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">{t('Output Token Cost')}</span>
                                        <span className="font-semibold">{formatCurrency(model.cost_per_output_token)}</span>
                                    </div>

                                    <div className="pt-2 border-t">
                                        <div className="text-xs text-gray-500 space-y-1">
                                            <div>{t('Costs are calculated per token used')}</div>
                                            <div>{t('Input tokens: prompt and context')}</div>
                                            <div>{t('Output tokens: generated response')}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Capabilities */}
                    {model.capabilities && model.capabilities.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Zap className="h-5 w-5 mr-2" />
                                    {t('Capabilities')}
                                </CardTitle>
                                <CardDescription>
                                    {t('Features and capabilities supported by this model')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {model.capabilities.map((capability, index) => (
                                        <Badge key={index} variant="secondary" className="text-sm">
                                            <Zap className="h-3 w-3 mr-1" />
                                            {capability}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Configuration JSON */}
                    {Object.keys(model.configuration).length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Settings className="h-5 w-5 mr-2" />
                                    {t('Advanced Configuration')}
                                </CardTitle>
                                <CardDescription>
                                    {t('Additional configuration parameters')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto">
                                    {JSON.stringify(model.configuration, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
