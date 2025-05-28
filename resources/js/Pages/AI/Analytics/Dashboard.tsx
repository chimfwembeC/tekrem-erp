import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Progress } from '@/Components/ui/progress';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import AppLayout from '@/Layouts/AppLayout';
import {
    Bot,
    Brain,
    MessageSquare,
    FileText,
    TrendingUp,
    Activity,
    DollarSign,
    Clock,
    Users,
    Zap,
    AlertCircle,
    CheckCircle
} from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import { toast } from 'sonner';

interface AIStats {
    total_services: number;
    total_models: number;
    total_conversations: number;
    total_templates: number;
    total_usage_logs: number;
    active_services: number;
    enabled_models: number;
    recent_conversations: number;
}

interface ServiceStatus {
    id: number;
    name: string;
    provider: string;
    is_default: boolean;
    status: 'online' | 'offline' | 'error';
    usage: {
        requests_today: number;
        tokens_today: number;
        cost_today: number;
    };
}

interface AnalyticsData {
    overview: {
        total_requests: number;
        successful_requests: number;
        failed_requests: number;
        success_rate: number;
        total_tokens: number;
        total_cost: number;
    };
    daily_usage: Array<{
        date: string;
        requests: number;
        tokens: number;
        cost: number;
    }>;
    usage_by_operation: Record<string, number>;
    usage_by_model: Record<string, number>;
}

interface Props {
    stats: AIStats;
    services: ServiceStatus[];
    analytics: AnalyticsData;
    quick_stats: {
        today: {
            requests: number;
            tokens: number;
            cost: number;
            success_rate: number;
        };
        yesterday: {
            requests: number;
            tokens: number;
            cost: number;
            success_rate: number;
        };
        changes: {
            requests: number;
            tokens: number;
            cost: number;
            success_rate: number;
        };
    };
}

export default function Dashboard({ stats, services = [], analytics, quick_stats }: Props) {
    const { t } = useTranslate();
    const [loading, setLoading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('7 days');

    // Provide default values for quick_stats to prevent errors
    const safeQuickStats = quick_stats || {
        today: { requests: 0, tokens: 0, cost: 0, success_rate: 0 },
        yesterday: { requests: 0, tokens: 0, cost: 0, success_rate: 0 },
        changes: { requests: 0, tokens: 0, cost: 0, success_rate: 0 }
    };

    // Provide default values for analytics to prevent errors
    const safeAnalytics = analytics || {
        overview: { total_requests: 0, successful_requests: 0, failed_requests: 0, success_rate: 0, total_tokens: 0, total_cost: 0 },
        daily_usage: [],
        usage_by_operation: {},
        usage_by_model: {}
    };

    const testConnection = async (serviceId: number) => {
        setLoading(true);
        try {
            const response = await fetch(route('ai.dashboard.test-connection'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ service_id: serviceId }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to test connection');
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 4,
        }).format(amount);
    };

    const getChangeColor = (change: number) => {
        if (change > 0) return 'text-green-600';
        if (change < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const getChangeIcon = (change: number) => {
        if (change > 0) return '↗';
        if (change < 0) return '↘';
        return '→';
    };

    return (
        <AppLayout
            title={t('AI Dashboard')}
            renderHeader={() => (
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            {t('AI Dashboard')}
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                            {t('Monitor and manage your AI services and usage')}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                            <Activity className="h-4 w-4 mr-2" />
                            {t('Refresh')}
                        </Button>
                    </div>
                </div>
            )}
        >
            <Head title={t('AI Dashboard')} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Quick Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {t('Requests Today')}
                                </CardTitle>
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatNumber(safeQuickStats.today.requests)}</div>
                                <p className={`text-xs ${getChangeColor(safeQuickStats.changes.requests)}`}>
                                    {getChangeIcon(safeQuickStats.changes.requests)} {Math.abs(safeQuickStats.changes.requests)}% from yesterday
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {t('Tokens Used')}
                                </CardTitle>
                                <Zap className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatNumber(safeQuickStats.today.tokens)}</div>
                                <p className={`text-xs ${getChangeColor(safeQuickStats.changes.tokens)}`}>
                                    {getChangeIcon(safeQuickStats.changes.tokens)} {Math.abs(safeQuickStats.changes.tokens)}% from yesterday
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {t('Cost Today')}
                                </CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(safeQuickStats.today.cost)}</div>
                                <p className={`text-xs ${getChangeColor(safeQuickStats.changes.cost)}`}>
                                    {getChangeIcon(safeQuickStats.changes.cost)} {Math.abs(safeQuickStats.changes.cost)}% from yesterday
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {t('Success Rate')}
                                </CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{safeQuickStats.today.success_rate}%</div>
                                <Progress value={safeQuickStats.today.success_rate} className="mt-2" />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Tabs */}
                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="overview">{t('Overview')}</TabsTrigger>
                            <TabsTrigger value="services">{t('Services')}</TabsTrigger>
                            <TabsTrigger value="analytics">{t('Analytics')}</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* System Overview */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Brain className="h-5 w-5 mr-2" />
                                            {t('System Overview')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{t('AI Services')}</span>
                                            <Badge variant="secondary">{stats.total_services}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{t('AI Models')}</span>
                                            <Badge variant="secondary">{stats.total_models}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{t('Conversations')}</span>
                                            <Badge variant="secondary">{stats.total_conversations}</Badge>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{t('Templates')}</span>
                                            <Badge variant="secondary">{stats.total_templates}</Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Usage Overview */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Activity className="h-5 w-5 mr-2" />
                                            {t('Usage Overview')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{t('Total Requests')}</span>
                                            <span className="font-medium">{formatNumber(safeAnalytics.overview.total_requests)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{t('Success Rate')}</span>
                                            <span className="font-medium">{safeAnalytics.overview.success_rate}%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{t('Total Tokens')}</span>
                                            <span className="font-medium">{formatNumber(safeAnalytics.overview.total_tokens)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">{t('Total Cost')}</span>
                                            <span className="font-medium">{formatCurrency(safeAnalytics.overview.total_cost)}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="services" className="space-y-6">
                            <div className="grid gap-6">
                                {services.map((service) => (
                                    <Card key={service.id}>
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <Bot className="h-6 w-6" />
                                                    <div>
                                                        <CardTitle className="text-lg">{service.name}</CardTitle>
                                                        <CardDescription>{service.provider}</CardDescription>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {service.is_default && (
                                                        <Badge variant="default">{t('Default')}</Badge>
                                                    )}
                                                    <Badge
                                                        variant={service.status === 'online' ? 'default' : 'destructive'}
                                                        className="flex items-center"
                                                    >
                                                        {service.status === 'online' ? (
                                                            <CheckCircle className="h-3 w-3 mr-1" />
                                                        ) : (
                                                            <AlertCircle className="h-3 w-3 mr-1" />
                                                        )}
                                                        {service.status}
                                                    </Badge>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => testConnection(service.id)}
                                                        disabled={loading}
                                                    >
                                                        {t('Test')}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold">{service.usage.requests_today}</div>
                                                    <div className="text-sm text-gray-600">{t('Requests Today')}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold">{formatNumber(service.usage.tokens_today)}</div>
                                                    <div className="text-sm text-gray-600">{t('Tokens Today')}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold">{formatCurrency(service.usage.cost_today)}</div>
                                                    <div className="text-sm text-gray-600">{t('Cost Today')}</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="analytics" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t('Usage Analytics')}</CardTitle>
                                    <CardDescription>
                                        {t('Detailed analytics and usage patterns')}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-sm font-medium mb-3">{t('Usage by Operation')}</h4>
                                            <div className="space-y-2">
                                                {Object.entries(safeAnalytics.usage_by_operation).map(([operation, count]) => (
                                                    <div key={operation} className="flex justify-between items-center">
                                                        <span className="text-sm capitalize">{operation}</span>
                                                        <Badge variant="outline">{count}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium mb-3">{t('Usage by Model')}</h4>
                                            <div className="space-y-2">
                                                {Object.entries(safeAnalytics.usage_by_model).map(([model, count]) => (
                                                    <div key={model} className="flex justify-between items-center">
                                                        <span className="text-sm">{model}</span>
                                                        <Badge variant="outline">{count}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AppLayout>
    );
}
