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
    FileText,
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Edit,
    Trash2,
    Copy,
    Eye,
    Star,
    Users,
    Lock,
    Globe,
    TrendingUp,
    Hash
} from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import { toast } from 'sonner';

interface PromptTemplate {
    id: number;
    name: string;
    slug: string;
    category: string;
    description: string;
    template: string;
    variables: string[];
    is_public: boolean;
    is_system: boolean;
    usage_count: number;
    avg_rating: number | null;
    tags: string[];
    user: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
    updated_at: string;
}

interface PaginatedData {
    data: PromptTemplate[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
}

interface Props {
    templates: PaginatedData;
    filters: {
        search?: string;
        category?: string;
        is_public?: string;
        tags?: string[];
    };
}

export default function Index({ templates, filters }: Props) {
    const { t } = useTranslate();
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [visibilityFilter, setVisibilityFilter] = useState(filters.is_public || 'all');

    const handleSearch = () => {
        router.get(route('ai.prompt-templates.index'), {
            search,
            category: selectedCategory === 'all' ? '' : selectedCategory,
            is_public: visibilityFilter === 'all' ? '' : visibilityFilter,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedCategory('all');
        setVisibilityFilter('all');
        router.get(route('ai.prompt-templates.index'));
    };

    const duplicateTemplate = async (templateId: number) => {
        try {
            const response = await fetch(route('ai.prompt-templates.duplicate', templateId), {
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
            toast.error('Failed to duplicate template');
        }
    };

    const deleteTemplate = (templateId: number) => {
        if (confirm(t('Are you sure you want to delete this template?'))) {
            router.delete(route('ai.prompt-templates.destroy', templateId), {
                onSuccess: () => toast.success(t('Template deleted successfully')),
                onError: () => toast.error(t('Failed to delete template')),
            });
        }
    };

    const getCategoryColor = (category: string) => {
        const colors = {
            crm: 'bg-blue-100 text-blue-800',
            finance: 'bg-green-100 text-green-800',
            support: 'bg-orange-100 text-orange-800',
            marketing: 'bg-purple-100 text-purple-800',
            general: 'bg-gray-100 text-gray-800',
        };
        return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const renderStars = (rating: number | null) => {
        if (!rating) return null;

        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />);
        }

        if (hasHalfStar) {
            stars.push(<Star key="half" className="h-3 w-3 fill-yellow-200 text-yellow-400" />);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-gray-300" />);
        }

        return <div className="flex items-center space-x-0.5">{stars}</div>;
    };

    const truncateTemplate = (template: string, maxLength: number = 100) => {
        if (template.length <= maxLength) return template;
        return template.substring(0, maxLength) + '...';
    };

    return (
        <AppLayout
            title={t('Prompt Templates')}
            renderHeader={() => (
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            {t('Prompt Templates')}
                        </h2>
                        <p className="text-gray-600 text-sm mt-1">
                            {t('Create and manage reusable AI prompt templates')}
                        </p>
                    </div>
                    <Link href={route('ai.prompt-templates.create')}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            {t('Create Template')}
                        </Button>
                    </Link>
                </div>
            )}
        >
            <Head title={t('Prompt Templates')} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{t('Filters')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder={t('Search templates...')}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="pl-10"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>

                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('All Categories')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('All Categories')}</SelectItem>
                                        <SelectItem value="crm">{t('CRM')}</SelectItem>
                                        <SelectItem value="finance">{t('Finance')}</SelectItem>
                                        <SelectItem value="support">{t('Support')}</SelectItem>
                                        <SelectItem value="marketing">{t('Marketing')}</SelectItem>
                                        <SelectItem value="general">{t('General')}</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('All Visibility')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('All Visibility')}</SelectItem>
                                        <SelectItem value="1">{t('Public')}</SelectItem>
                                        <SelectItem value="0">{t('Private')}</SelectItem>
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

                    {/* Templates Grid */}
                    {templates.data.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {t('No templates found')}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {t('Create your first prompt template to get started.')}
                                </p>
                                <Link href={route('ai.prompt-templates.create')}>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        {t('Create Template')}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {templates.data.map((template) => (
                                <Card key={template.id} className="relative hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <CardTitle className="text-lg">{template.name}</CardTitle>
                                                    {template.is_system && (
                                                        <Badge variant="default" className="text-xs">
                                                            {t('System')}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardDescription className="text-sm">
                                                    {template.description}
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
                                                        <Link href={route('ai.prompt-templates.show', template.id)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            {t('View')}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={route('ai.prompt-templates.edit', template.id)}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            {t('Edit')}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => duplicateTemplate(template.id)}>
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        {t('Duplicate')}
                                                    </DropdownMenuItem>
                                                    {!template.is_system && (
                                                        <DropdownMenuItem
                                                            onClick={() => deleteTemplate(template.id)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            {t('Delete')}
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">{t('Category')}</span>
                                            <Badge className={getCategoryColor(template.category)}>
                                                {template.category.toUpperCase()}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">{t('Visibility')}</span>
                                            <div className="flex items-center space-x-1">
                                                {template.is_public ? (
                                                    <>
                                                        <Globe className="h-4 w-4 text-green-600" />
                                                        <span className="text-sm text-green-600">{t('Public')}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock className="h-4 w-4 text-gray-600" />
                                                        <span className="text-sm text-gray-600">{t('Private')}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">{t('Author')}</span>
                                            <div className="flex items-center space-x-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="text-xs">
                                                        {template.user.name.charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm">{template.user.name}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">{t('Variables')}</span>
                                            <Badge variant="outline">
                                                {template.variables.length} {t('variables')}
                                            </Badge>
                                        </div>

                                        <div className="pt-2 border-t">
                                            <div className="text-xs text-gray-600 mb-2">{t('Template Preview')}:</div>
                                            <div className="bg-gray-50 p-2 rounded text-xs text-gray-700 font-mono">
                                                {truncateTemplate(template.template)}
                                            </div>
                                        </div>

                                        {template.variables.length > 0 && (
                                            <div>
                                                <div className="text-xs text-gray-600 mb-2">{t('Variables')}:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {template.variables.slice(0, 4).map((variable, index) => (
                                                        <Badge key={index} variant="secondary" className="text-xs">
                                                            <Hash className="h-2 w-2 mr-1" />
                                                            {variable}
                                                        </Badge>
                                                    ))}
                                                    {template.variables.length > 4 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{template.variables.length - 4}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {template.tags && template.tags.length > 0 && (
                                            <div>
                                                <div className="text-xs text-gray-600 mb-2">{t('Tags')}:</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {template.tags.slice(0, 3).map((tag, index) => (
                                                        <Badge key={index} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    {template.tags.length > 3 && (
                                                        <Badge variant="outline" className="text-xs">
                                                            +{template.tags.length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-2 border-t flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex items-center space-x-1">
                                                    <TrendingUp className="h-3 w-3 text-gray-500" />
                                                    <span className="text-xs text-gray-600">
                                                        {template.usage_count} {t('uses')}
                                                    </span>
                                                </div>
                                                {template.avg_rating && (
                                                    <div className="flex items-center space-x-1">
                                                        {renderStars(template.avg_rating)}
                                                        <span className="text-xs text-gray-600">
                                                            ({template.avg_rating.toFixed(1)})
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {templates.meta.last_page > 1 && (
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                {t('Showing')} {templates.meta.from} {t('to')} {templates.meta.to} {t('of')} {templates.meta.total} {t('results')}
                            </div>
                            <div className="flex space-x-1">
                                {templates.links.map((link, index) => (
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
