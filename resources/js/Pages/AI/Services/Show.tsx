import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import AppLayout from '@/Layouts/AppLayout';
import {
    Settings,
    ArrowLeft,
    MoreHorizontal,
    Edit,
    Power,
    Star,
    Trash2,
    Bot,
    Brain,
    Zap,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    DollarSign,
    Shield,
    Globe
} from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import { toast } from 'sonner';

interface Service {
    id: number;
    name: string;
    provider: string;
    api_key: string | null;
    api_url: string | null;
    description: string | null;
    is_enabled: boolean;
    is_default: boolean;
    priority: number;
    supported_features: string[];
    cost_per_token: number | null;
    rate_limit_per_minute: number | null;
    max_tokens_per_request: number | null;
    configuration: Record<string, any>;
    models_count: number;
    usage_stats?: {
        total_requests: number;
        total_tokens: number;
        total_cost: number;
        avg_response_time: number;
    };
    created_at: string;
    updated_at: string;
}

interface Props {
    service: Service;
}

export default function Show({ service }: Props) {
    const { t } = useTranslate();

    const toggleServiceStatus = async () => {
        try {
            const response = await fetch(route('ai.services.toggle-status', service.id), {
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
            toast.error('Failed to toggle service status');
        }
    };

    const setAsDefault = async () => {
        try {
            const response = await fetch(route('ai.services.set-default', service.id), {
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

    const deleteService = () => {
        if (confirm(t('Are you sure you want to delete this service?'))) {
            router.delete(route('ai.services.destroy', service.id), {
                onSuccess: () => toast.success(t('Service deleted successfully')),
                onError: () => toast.error(t('Failed to delete service')),
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

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case 'mistral':
                return <Bot className="h-5 w-5 text-orange-600" />;
            case 'openai':
                return <Brain className="h-5 w-5 text-green-600" />;
            case 'anthropic':
                return <Zap className="h-5 w-5 text-purple-600" />;
            default:
                return <Settings className="h-5 w-5 text-gray-600" />;
        }
    };

    const getProviderColor = (provider: string) => {
        const colors = {
            mistral: 'bg-orange-100 text-orange-800',
            openai: 'bg-green-100 text-green-800',
            anthropic: 'bg-purple-100 text-purple-800',
        };
        return colors[provider as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout
            title={service.name}
            renderHeader={() => (
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('ai.services.index')}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('Back to Services')}
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center space-x-2">
                                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                    {service.name}
                                </h2>
                                {service.is_default && (
                                    <Badge variant="default">
                                        <Star className="h-3 w-3 mr-1" />
                                        {t('Default')}
                                    </Badge>
                                )}
                                <Badge className={getProviderColor(service.provider)}>
                                    {service.provider.toUpperCase()}
                                </Badge>
                                <Badge variant={service.is_enabled ? 'default' : 'secondary'}>
                                    {service.is_enabled ? t('Enabled') : t('Disabled')}
                                </Badge>
                            </div>
                            <p className="text-gray-600 text-sm mt-1">
                                {service.provider} • {service.models_count} {t('models')}
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
                                <Link href={route('ai.services.edit', service.id)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    {t('Edit')}
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={toggleServiceStatus}>
                                <Power className="h-4 w-4 mr-2" />
                                {service.is_enabled ? t('Disable') : t('Enable')}
                            </DropdownMenuItem>
                            {!service.is_default && service.is_enabled && (
                                <DropdownMenuItem onClick={setAsDefault}>
                                    <Star className="h-4 w-4 mr-2" />
                                    {t('Set as Default')}
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                                onClick={deleteService}
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
            <Head title={service.name} />

            <div className="py-6">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Status Alert */}
                    {!service.is_enabled && (
                        <Alert>
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>
                                {t('This service is currently disabled and cannot be used for AI operations.')}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Service Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Basic Information */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    {getProviderIcon(service.provider)}
                                    <span className="ml-2">{t('Service Information')}</span>
                                </CardTitle>
                                <CardDescription>
                                    {t('Basic configuration and details')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-gray-600">{t('Provider')}</div>
                                        <div className="flex items-center space-x-2">
                                            {getProviderIcon(service.provider)}
                                            <span className="font-medium">{service.provider}</span>
                                            <Badge className={getProviderColor(service.provider)}>
                                                {service.provider.toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-gray-600">{t('Status')}</div>
                                        <div className="flex items-center space-x-1">
                                            {service.is_enabled ? (
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-red-600" />
                                            )}
                                            <span className={`text-sm ${service.is_enabled ? 'text-green-600' : 'text-red-600'}`}>
                                                {service.is_enabled ? t('Enabled') : t('Disabled')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-gray-600">{t('Priority')}</div>
                                        <div className="text-lg font-semibold">{service.priority}</div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-gray-600">{t('Models Count')}</div>
                                        <div className="text-lg font-semibold">{service.models_count}</div>
                                    </div>
                                </div>

                                {service.description && (
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-gray-600">{t('Description')}</div>
                                        <p className="text-sm text-gray-700">{service.description}</p>
                                    </div>
                                )}

                                {service.api_url && (
                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-gray-600">{t('API URL')}</div>
                                        <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                            {service.api_url}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-600">{t('API Key Status')}</div>
                                    <div className="flex items-center space-x-1">
                                        {service.api_key ? (
                                            <>
                                                <Shield className="h-4 w-4 text-green-600" />
                                                <span className="text-sm text-green-600">{t('Configured')}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Shield className="h-4 w-4 text-red-600" />
                                                <span className="text-sm text-red-600">{t('Not Configured')}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-gray-600">{t('Created')}</div>
                                    <div className="flex items-center space-x-1 text-sm text-gray-700">
                                        <Clock className="h-4 w-4" />
                                        <span>{formatDate(service.created_at)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Usage Statistics */}
                        {service.usage_stats && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <TrendingUp className="h-5 w-5 mr-2" />
                                        {t('Usage Statistics')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{service.usage_stats.total_requests}</div>
                                        <div className="text-sm text-gray-600">{t('Total Requests')}</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{service.usage_stats.total_tokens.toLocaleString()}</div>
                                        <div className="text-sm text-gray-600">{t('Total Tokens')}</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-2xl font-bold">{formatCurrency(service.usage_stats.total_cost)}</div>
                                        <div className="text-sm text-gray-600">{t('Total Cost')}</div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-lg font-medium">{service.usage_stats.avg_response_time}ms</div>
                                        <div className="text-sm text-gray-600">{t('Avg Response Time')}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Configuration Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Service Limits */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Globe className="h-5 w-5 mr-2" />
                                    {t('Service Limits')}
                                </CardTitle>
                                <CardDescription>
                                    {t('Rate limits and token restrictions')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">{t('Rate Limit')}</span>
                                        <span className="font-semibold">
                                            {service.rate_limit_per_minute ? `${service.rate_limit_per_minute}/min` : t('Unlimited')}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">{t('Max Tokens per Request')}</span>
                                        <span className="font-semibold">
                                            {service.max_tokens_per_request ? service.max_tokens_per_request.toLocaleString() : t('Unlimited')}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">{t('Cost per Token')}</span>
                                        <span className="font-semibold">
                                            {service.cost_per_token ? formatCurrency(service.cost_per_token) : t('Variable')}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Supported Features */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Zap className="h-5 w-5 mr-2" />
                                    {t('Supported Features')}
                                </CardTitle>
                                <CardDescription>
                                    {t('Available capabilities and features')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {service.supported_features && service.supported_features.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {service.supported_features.map((feature, index) => (
                                            <Badge key={index} variant="secondary" className="text-sm">
                                                <Zap className="h-3 w-3 mr-1" />
                                                {feature}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">
                                        {t('No specific features configured')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Advanced Configuration */}
                    {Object.keys(service.configuration).length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Settings className="h-5 w-5 mr-2" />
                                    {t('Advanced Configuration')}
                                </CardTitle>
                                <CardDescription>
                                    {t('Additional service configuration parameters')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto">
                                    {JSON.stringify(service.configuration, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
