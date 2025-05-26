import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Checkbox } from '@/Components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  Copy,
  Trash2,
  Layout,
  Star,
  Download,
  Upload
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Template {
  id: number;
  name: string;
  slug: string;
  description?: string;
  category: string;
  is_active: boolean;
  is_default: boolean;
  usage_stats?: {
    total_pages: number;
    published_pages: number;
  };
  created_by?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

interface Props {
  templates: {
    data: Template[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  categories: Record<string, string>;
  filters: {
    search?: string;
    category?: string;
    status?: string;
  };
}


export default function TemplatesIndex({ templates, categories, filters }: Props) {
  const { t } = useTranslate();
  const [selectedTemplates, setSelectedTemplates] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');
  const route = useRoute();

  const handleSearch = () => {
    router.get(route('cms.templates.index'), {
      ...filters,
      search: searchQuery,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFilter = (key: string, value: string) => {
    router.get(route('cms.templates.index'), {
      ...filters,
      [key]: value || undefined,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleBulkAction = (action: string) => {
    if (selectedTemplates.length === 0) return;

    router.post(route('cms.templates.bulk-action'), {
      action,
      template_ids: selectedTemplates,
    }, {
      onSuccess: () => {
        setSelectedTemplates([]);
      },
    });
  };

  const handleTemplateAction = (templateId: number, action: string) => {
    switch (action) {
      case 'edit':
        router.visit(route('cms.templates.edit', templateId));
        break;
      case 'view':
        router.visit(route('cms.templates.show', templateId));
        break;
      case 'preview':
        router.visit(route('cms.templates.preview', templateId));
        break;
      case 'duplicate':
        router.post(route('cms.templates.duplicate', templateId));
        break;
      case 'set-default':
        router.post(route('cms.templates.set-default', templateId));
        break;
      case 'export':
        window.open(route('cms.templates.export', templateId), '_blank');
        break;
      case 'delete':
        if (confirm(t('cms.confirm_delete_template', 'Are you sure you want to delete this template?'))) {
          router.delete(route('cms.templates.destroy', templateId));
        }
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <AppLayout>
      <Head title={t('cms.templates', 'Templates')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('cms.templates', 'Templates')}
            </h1>
            <p className="text-muted-foreground">
              {t('cms.templates_description', 'Manage page templates and layouts')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <label htmlFor="import-template" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                {t('cms.import_template', 'Import Template')}
              </label>
            </Button>
            <input
              id="import-template"
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  const formData = new FormData();
                  formData.append('template_file', e.target.files[0]);
                  router.post(route('cms.templates.import'), formData);
                }
              }}
            />
            <Button asChild>
              <Link href={route('cms.templates.create')}>
                <Plus className="h-4 w-4 mr-2" />
                {t('cms.create_template', 'Create Template')}
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {t('common.filters', 'Filters')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <div className="flex gap-2">
                  <Input
                    placeholder={t('cms.search_templates', 'Search templates...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button variant="outline" onClick={handleSearch}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Select value={filters.category || 'all'} onValueChange={(value) => handleFilter('category', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('cms.all_categories', 'All categories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('cms.all_categories', 'All categories')}</SelectItem>
                  {Object.entries(categories).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.status || 'all'} onValueChange={(value) => handleFilter('status', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('cms.all_statuses', 'All statuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('cms.all_statuses', 'All statuses')}</SelectItem>
                  <SelectItem value="active">{t('cms.active', 'Active')}</SelectItem>
                  <SelectItem value="inactive">{t('cms.inactive', 'Inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedTemplates.length > 0 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedTemplates.length} {t('cms.templates_selected', 'templates selected')}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>
                    <Layout className="h-4 w-4 mr-2" />
                    {t('cms.activate', 'Activate')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('deactivate')}>
                    <Layout className="h-4 w-4 mr-2" />
                    {t('cms.deactivate', 'Deactivate')}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleBulkAction('delete')}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('common.delete', 'Delete')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Templates Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.data?.map((template) => (
            <Card key={template.id} className="group hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedTemplates.includes(template.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTemplates(prev => [...prev, template.id]);
                        } else {
                          setSelectedTemplates(prev => prev.filter(id => id !== template.id));
                        }
                      }}
                    />
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {template.name}
                        {template.is_default && (
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        )}
                      </CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleTemplateAction(template.id, 'view')}>
                        <Eye className="h-4 w-4 mr-2" />
                        {t('common.view', 'View')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTemplateAction(template.id, 'edit')}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t('common.edit', 'Edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTemplateAction(template.id, 'preview')}>
                        <Layout className="h-4 w-4 mr-2" />
                        {t('cms.preview', 'Preview')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleTemplateAction(template.id, 'duplicate')}>
                        <Copy className="h-4 w-4 mr-2" />
                        {t('cms.duplicate', 'Duplicate')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTemplateAction(template.id, 'export')}>
                        <Download className="h-4 w-4 mr-2" />
                        {t('cms.export', 'Export')}
                      </DropdownMenuItem>
                      {!template.is_default && (
                        <DropdownMenuItem onClick={() => handleTemplateAction(template.id, 'set-default')}>
                          <Star className="h-4 w-4 mr-2" />
                          {t('cms.set_as_default', 'Set as Default')}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleTemplateAction(template.id, 'delete')}
                        className="text-destructive"
                        disabled={(template.usage_stats?.total_pages || 0) > 0}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('common.delete', 'Delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Template Preview */}
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border">
                    <Layout className="h-8 w-8 text-gray-400" />
                  </div>

                  {/* Template Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('cms.category', 'Category')}</span>
                      <Badge variant="outline">{categories[template.category] || template.category}</Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('cms.status', 'Status')}</span>
                      <Badge variant={template.is_active ? 'default' : 'secondary'}>
                        {template.is_active ? t('cms.active', 'Active') : t('cms.inactive', 'Inactive')}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('cms.pages_using', 'Pages using')}</span>
                      <span className="font-medium">{template.usage_stats?.total_pages || 0}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('cms.created_by', 'Created by')}</span>
                      <span>{template.created_by?.name || 'Unknown'}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('cms.created_at', 'Created')}</span>
                      <span>{formatDate(template.created_at)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleTemplateAction(template.id, 'preview')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t('cms.preview', 'Preview')}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleTemplateAction(template.id, 'edit')}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {t('common.edit', 'Edit')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {templates.data.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Layout className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {t('cms.no_templates_found', 'No templates found')}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {t('cms.create_first_template', 'Create your first template to get started')}
              </p>
              <Button asChild>
                <Link href={route('cms.templates.create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('cms.create_template', 'Create Template')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {templates.links && templates.data.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {templates.from || 0} to {templates.to || 0} of {templates.total || 0} results
            </div>
            <div className="flex gap-2">
              {templates.links.map((link: any, index: number) => (
                <Button
                  key={index}
                  variant={link.active ? 'default' : 'outline'}
                  size="sm"
                  disabled={!link.url}
                  onClick={() => link.url && router.visit(link.url)}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
