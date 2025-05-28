import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import AppLayout from '@/Layouts/AppLayout';
import {
    Bot,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Edit,
    Trash2,
    Star,
    Settings,
    Eye,
    Power,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import { toast } from 'sonner';

interface AIModel {
    id: number;
    name: string;
    slug: string;
    model_identifier: string;
    type: string;
    description: string;
    is_enabled: boolean;
    is_default: boolean;
    capabilities: string[];
    max_tokens: number;
    temperature: number;
    cost_per_input_token: number;
    cost_per_output_token: number;
    service: {
        id: number;
        name: string;
        provider: string;
    };
    created_at: string;
    updated_at: string;
}

interface Service {
    id: number;
    name: string;
    provider: string;
}

interface PaginatedData {
    data: AIModel[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    }>;
}

interface Props {
    models: PaginatedData;
    services: Service[];
    filters: {
        search?: string;
        service_id?: string;
        type?: string;
        is_enabled?: string;
    };
}

export default function Index({ models, services, filters }: Props) {
    const { t } = useTranslate();
    const [search, setSearch] = useState(filters.search || '');
    const [selectedService, setSelectedService] = useState(filters.service_id || 'all');
    const [selectedType, setSelectedType] = useState(filters.type || 'all');
    const [enabledFilter, setEnabledFilter] = useState(filters.is_enabled || 'all');

    const handleSearch = () => {
        router.get(route('ai.models.index'), {
            search,
            service_id: selectedService === 'all' ? '' : selectedService,
            type: selectedType === 'all' ? '' : selectedType,
            is_enabled: enabledFilter === 'all' ? '' : enabledFilter,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedService('all');
        setSelectedType('all');
        setEnabledFilter('all');
        router.get(route('ai.models.index'));
    };

    const toggleModelStatus = async (modelId: number) => {
        try {
            const response = await fetch(route('ai.models.toggle-status', modelId), {
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

    const setAsDefault = async (modelId: number) => {
        try {
            const response = await fetch(route('ai.models.set-default', modelId), {
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

    const deleteModel = (modelId: number) => {
        if (confirm(t('Are you sure you want to delete this model?'))) {
            router.delete(route('ai.models.destroy', modelId), {
                onSuccess: () => toast.success(t('Model deleted successfully')),
                onError: () => toast.error(t('Failed to delete model')),
            });
        }
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 6,
        }).format(amount);
    };

    return (
        <AppLayout
            title={t('AI Models')}
            renderHeader={() => (
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            {t('AI Models')}
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                            {t('Manage AI models and their configurations')}
                        </p>
                    </div>
                    <Link href={route('ai.models.create')}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            {t('Add Model')}
                        </Button>
                    </Link>
                </div>
            )}
        >
            <Head title={t('AI Models')} />

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
                                        placeholder={t('Search models...')}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>

                                <Select value={selectedService} onValueChange={setSelectedService}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('All Services')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('All Services')}</SelectItem>
                                        {services.map((service) => (
                                            <SelectItem key={service.id} value={service.id.toString()}>
                                                {service.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={selectedType} onValueChange={setSelectedType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('All Types')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('All Types')}</SelectItem>
                                        <SelectItem value="chat">{t('Chat')}</SelectItem>
                                        <SelectItem value="completion">{t('Completion')}</SelectItem>
                                        <SelectItem value="embedding">{t('Embedding')}</SelectItem>
                                        <SelectItem value="image">{t('Image')}</SelectItem>
                                        <SelectItem value="audio">{t('Audio')}</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={enabledFilter} onValueChange={setEnabledFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('All Status')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('All Status')}</SelectItem>
                                        <SelectItem value="1">{t('Enabled')}</SelectItem>
                                        <SelectItem value="0">{t('Disabled')}</SelectItem>
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

                    {/* Models Grid */}
                    {models.data.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {t('No AI models found')}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {t('Get started by creating your first AI model.')}
                                </p>
                                <Link href={route('ai.models.create')}>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        {t('Add Model')}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {models.data.map((model) => (
                                <Card key={model.id} className="relative">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <CardTitle className="text-lg">{model.name}</CardTitle>
                                                    {model.is_default && (
                                                        <Badge variant="default" className="text-xs">
                                                            <Star className="h-3 w-3 mr-1" />
                                                            {t('Default')}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardDescription className="text-sm">
                                                    {model.description || model.model_identifier}
                                                </CardDescription>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('ai.models.show', model.id)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            {t('View')}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('ai.models.edit', model.id)}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            {t('Edit')}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => toggleModelStatus(model.id)}>
                                                        <Power className="h-4 w-4 mr-2" />
                                                        {model.is_enabled ? t('Disable') : t('Enable')}
                                                    </DropdownMenuItem>
                                                    {!model.is_default && model.is_enabled && (
                                                        <DropdownMenuItem onClick={() => setAsDefault(model.id)}>
                                                            <Star className="h-4 w-4 mr-2" />
                                                            {t('Set as Default')}
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        onClick={() => deleteModel(model.id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        {t('Delete')}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">{t('Service')}</span>
                                            <Badge variant="outline">{model.service.name}</Badge>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">{t('Type')}</span>
                                            <Badge className={getTypeColor(model.type)}>
                                                {model.type}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">{t('Status')}</span>
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

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">{t('Max Tokens')}</span>
                                            <span className="text-sm font-medium">{model.max_tokens.toLocaleString()}</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">{t('Temperature')}</span>
                                            <span className="text-sm font-medium">{model.temperature}</span>
                                        </div>

                                        <div className="pt-2 border-t">
                                            <div className="text-xs text-gray-500 space-y-1">
                                                <div className="flex justify-between">
                                                    <span>{t('Input Cost')}:</span>
                                                    <span>{formatCurrency(model.cost_per_input_token)}/token</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>{t('Output Cost')}:</span>
                                                    <span>{formatCurrency(model.cost_per_output_token)}/token</span>
                                                </div>
                                            </div>
                                        </div>

                                        {model.capabilities && model.capabilities.length > 0 && (
                                            <div className="pt-2">
                                                <div className="text-xs text-gray-600 mb-2">{t('Capabilities')}:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {model.capabilities.slice(0, 3).map((capability, index) => (
                                                        <Badge key={index} variant="secondary" className="text-xs">
                                                            {capability}
                                                        </Badge>
                                                    ))}
                                                    {model.capabilities.length > 3 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{model.capabilities.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {models.last_page > 1 && (
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                {t('Showing')} {models.from} {t('to')} {models.to} {t('of')} {models.total} {t('results')}
                            </div>
                            <div className="flex space-x-1">
                                {models.links.map((link, index) => (
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
