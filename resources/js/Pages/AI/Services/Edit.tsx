import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import AppLayout from '@/Layouts/AppLayout';
import {
    Settings,
    ArrowLeft,
    AlertCircle,
    Loader2,
    Bot,
    Brain,
    Zap,
    Save,
    Shield,
    Globe,
    DollarSign
} from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';

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
}

interface Props {
    service: Service;
}

interface FormData {
    name: string;
    provider: string;
    api_key: string;
    api_url: string;
    description: string;
    is_enabled: boolean;
    is_default: boolean;
    priority: string;
    supported_features: string[];
    cost_per_token: string;
    rate_limit_per_minute: string;
    max_tokens_per_request: string;
    configuration: Record<string, any>;
}

export default function Edit({ service }: Props) {
    const { t } = useTranslate();
    const [supportedFeatures, setSupportedFeatures] = useState<string[]>(service.supported_features || []);
    const [newFeature, setNewFeature] = useState('');

    const { data, setData, put, processing, errors, reset } = useForm<FormData>({
        name: service.name,
        provider: service.provider,
        api_key: service.api_key || '',
        api_url: service.api_url || '',
        description: service.description || '',
        is_enabled: service.is_enabled,
        is_default: service.is_default,
        priority: service.priority.toString(),
        supported_features: service.supported_features || [],
        cost_per_token: service.cost_per_token?.toString() || '',
        rate_limit_per_minute: service.rate_limit_per_minute?.toString() || '',
        max_tokens_per_request: service.max_tokens_per_request?.toString() || '',
        configuration: service.configuration || {},
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('ai.services.update', service.id));
    };

    const addFeature = () => {
        if (newFeature.trim() && !supportedFeatures.includes(newFeature.trim())) {
            const updatedFeatures = [...supportedFeatures, newFeature.trim()];
            setSupportedFeatures(updatedFeatures);
            setData('supported_features', updatedFeatures);
            setNewFeature('');
        }
    };

    const removeFeature = (feature: string) => {
        const updatedFeatures = supportedFeatures.filter(f => f !== feature);
        setSupportedFeatures(updatedFeatures);
        setData('supported_features', updatedFeatures);
    };

    const getProviderIcon = (provider: string) => {
        switch (provider) {
            case 'mistral':
                return <Bot className="h-4 w-4 text-orange-600" />;
            case 'openai':
                return <Brain className="h-4 w-4 text-green-600" />;
            case 'anthropic':
                return <Zap className="h-4 w-4 text-purple-600" />;
            default:
                return <Settings className="h-4 w-4 text-gray-600" />;
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
            title={t('Edit AI Service')}
            renderHeader={() => (
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href={route('ai.services.show', service.id)}>
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('Back to Service')}
                            </Button>
                        </Link>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                {t('Edit AI Service')}
                            </h2>
                            <p className="text-gray-600 text-sm mt-1">
                                {t('Update service configuration and settings')}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        >
            <Head title={t('Edit AI Service')} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Service Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    {getProviderIcon(service.provider)}
                                    <span className="ml-2">{t('Service Information')}</span>
                                </CardTitle>
                                <CardDescription>
                                    {t('Current service details and status')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-600">{t('Current Provider')}</Label>
                                        <div className="flex items-center space-x-2">
                                            {getProviderIcon(service.provider)}
                                            <span className="font-medium">{service.provider}</span>
                                            <Badge className={getProviderColor(service.provider)}>
                                                {service.provider.toUpperCase()}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-600">{t('Service ID')}</Label>
                                        <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                            {service.id}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-600">{t('Models Count')}</Label>
                                        <div className="text-lg font-semibold">{service.models_count}</div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-600">{t('Status')}</Label>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant={service.is_enabled ? 'default' : 'secondary'}>
                                                {service.is_enabled ? t('Enabled') : t('Disabled')}
                                            </Badge>
                                            {service.is_default && (
                                                <Badge variant="default">
                                                    {t('Default')}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Basic Configuration */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Settings className="h-5 w-5 mr-2" />
                                    {t('Basic Configuration')}
                                </CardTitle>
                                <CardDescription>
                                    {t('Update the basic service settings')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                {/* Service Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">{t('Service Name')} *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder={t('Enter a descriptive name for the service')}
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Provider Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="provider">{t('Provider')} *</Label>
                                    <Select value={data.provider} onValueChange={(value) => setData('provider', value)}>
                                        <SelectTrigger className={errors.provider ? 'border-red-500' : ''}>
                                            <SelectValue placeholder={t('Select a provider')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="mistral">
                                                <div className="flex items-center space-x-2">
                                                    <Bot className="h-4 w-4 text-orange-600" />
                                                    <span>Mistral AI</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="openai">
                                                <div className="flex items-center space-x-2">
                                                    <Brain className="h-4 w-4 text-green-600" />
                                                    <span>OpenAI</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="anthropic">
                                                <div className="flex items-center space-x-2">
                                                    <Zap className="h-4 w-4 text-purple-600" />
                                                    <span>Anthropic</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.provider && (
                                        <p className="text-sm text-red-600">{errors.provider}</p>
                                    )}
                                </div>

                                {/* API Configuration */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="api_key">{t('API Key')}</Label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="api_key"
                                                type="password"
                                                value={data.api_key}
                                                onChange={(e) => setData('api_key', e.target.value)}
                                                placeholder={t('Enter your API key')}
                                                className="pl-10"
                                            />
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {t('Leave empty to keep current key')}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="api_url">{t('API URL')}</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="api_url"
                                                type="url"
                                                value={data.api_url}
                                                onChange={(e) => setData('api_url', e.target.value)}
                                                placeholder={t('https://api.example.com')}
                                                className="pl-10"
                                            />
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {t('Custom API endpoint (optional)')}
                                        </p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">{t('Description')}</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder={t('Describe the service and its capabilities')}
                                        rows={3}
                                        className="resize-none"
                                    />
                                </div>

                                {/* Priority */}
                                <div className="space-y-2">
                                    <Label htmlFor="priority">{t('Priority')}</Label>
                                    <Input
                                        id="priority"
                                        type="number"
                                        value={data.priority}
                                        onChange={(e) => setData('priority', e.target.value)}
                                        placeholder="1"
                                        min="1"
                                        max="100"
                                    />
                                    <p className="text-sm text-gray-600">
                                        {t('Lower numbers have higher priority (1 = highest)')}
                                    </p>
                                </div>

                                {/* Status Switches */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>{t('Enable Service')}</Label>
                                            <p className="text-sm text-gray-600">
                                                {t('Make this service available for use')}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.is_enabled}
                                            onCheckedChange={(checked) => setData('is_enabled', checked)}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>{t('Set as Default')}</Label>
                                            <p className="text-sm text-gray-600">
                                                {t('Use as default service for this provider')}
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.is_default}
                                            onCheckedChange={(checked) => setData('is_default', checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Advanced Configuration */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Globe className="h-5 w-5 mr-2" />
                                    {t('Advanced Configuration')}
                                </CardTitle>
                                <CardDescription>
                                    {t('Configure service limits and features')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                {/* Service Limits */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="cost_per_token">{t('Cost per Token')}</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="cost_per_token"
                                                type="number"
                                                value={data.cost_per_token}
                                                onChange={(e) => setData('cost_per_token', e.target.value)}
                                                placeholder="0.000001"
                                                min="0"
                                                step="0.000001"
                                                className="pl-10"
                                            />
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            {t('Cost in USD per token')}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="rate_limit_per_minute">{t('Rate Limit (per minute)')}</Label>
                                        <Input
                                            id="rate_limit_per_minute"
                                            type="number"
                                            value={data.rate_limit_per_minute}
                                            onChange={(e) => setData('rate_limit_per_minute', e.target.value)}
                                            placeholder="60"
                                            min="1"
                                        />
                                        <p className="text-sm text-gray-600">
                                            {t('Maximum requests per minute')}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="max_tokens_per_request">{t('Max Tokens per Request')}</Label>
                                        <Input
                                            id="max_tokens_per_request"
                                            type="number"
                                            value={data.max_tokens_per_request}
                                            onChange={(e) => setData('max_tokens_per_request', e.target.value)}
                                            placeholder="4096"
                                            min="1"
                                        />
                                        <p className="text-sm text-gray-600">
                                            {t('Maximum tokens per request')}
                                        </p>
                                    </div>
                                </div>

                                {/* Supported Features */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Zap className="h-4 w-4 text-gray-600" />
                                        <Label className="text-base font-medium">{t('Supported Features')}</Label>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex space-x-2">
                                            <Input
                                                value={newFeature}
                                                onChange={(e) => setNewFeature(e.target.value)}
                                                placeholder={t('Add a feature (e.g., chat, completion, embedding)')}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                            />
                                            <Button type="button" onClick={addFeature} variant="outline">
                                                {t('Add')}
                                            </Button>
                                        </div>

                                        {supportedFeatures.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {supportedFeatures.map((feature, index) => (
                                                    <div key={index} className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                                        <span>{feature}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFeature(feature)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <p className="text-sm text-gray-600">
                                            {t('Update features that this service supports')}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                            <Link href={route('ai.services.show', service.id)}>
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
                                    disabled={processing || !data.name || !data.provider}
                                >
                                    <Save className="h-4 w-4 mr-2" />
                                    {t('Save Changes')}
                                </Button>
                            </div>
                        </div>

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
