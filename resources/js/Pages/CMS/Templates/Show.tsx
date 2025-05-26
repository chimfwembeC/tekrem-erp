import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Label } from '@/Components/ui/label';
import { Separator } from '@/Components/ui/separator';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  ArrowLeft,
  Edit,
  Eye,
  Copy,
  Star,
  Download,
  Trash2,
  Code,
  Settings,
  FileText,
  Calendar,
  User,
  BarChart3
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface Template {
  id: number;
  name: string;
  slug: string;
  description?: string;
  content: string;
  category: string;
  is_active: boolean;
  is_default: boolean;
  fields: any;
  settings: any;
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
  template: Template;
  categories: Record<string, string>;
  pages?: Array<{
    id: number;
    title: string;
    slug: string;
    status: string;
    published_at?: string;
  }>;
}

export default function TemplateShow({ template, categories, pages = [] }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [showContent, setShowContent] = useState(false);

  const handleAction = (action: string) => {
    switch (action) {
      case 'edit':
        router.visit(route('cms.templates.edit', template.id));
        break;
      case 'preview':
        window.open(route('cms.templates.preview', template.id), '_blank');
        break;
      case 'duplicate':
        router.post(route('cms.templates.duplicate', template.id), {}, {
          onSuccess: () => {
            toast.success(t('cms.template_duplicated', 'Template duplicated successfully'));
          }
        });
        break;
      case 'set-default':
        router.post(route('cms.templates.set-default', template.id), {}, {
          onSuccess: () => {
            toast.success(t('cms.template_set_default', 'Template set as default'));
          }
        });
        break;
      case 'export':
        window.open(route('cms.templates.export', template.id), '_blank');
        break;
      case 'delete':
        if (template.usage_stats?.total_pages && template.usage_stats.total_pages > 0) {
          toast.error(t('cms.cannot_delete_template_in_use', 'Cannot delete template that is in use'));
          return;
        }
        if (confirm(t('cms.confirm_delete_template', 'Are you sure you want to delete this template?'))) {
          router.delete(route('cms.templates.destroy', template.id), {
            onSuccess: () => {
              toast.success(t('cms.template_deleted', 'Template deleted successfully'));
              router.visit(route('cms.templates.index'));
            }
          });
        }
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatJSON = (obj: any) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return 'Invalid JSON';
    }
  };

  return (
    <AppLayout>
      <Head title={template.name} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.visit(route('cms.templates.index'))}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back', 'Back')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                {template.name}
                {template.is_default && (
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                )}
              </h1>
              <p className="text-muted-foreground">
                {template.description || t('cms.no_description', 'No description provided')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleAction('preview')}
            >
              <Eye className="h-4 w-4 mr-2" />
              {t('cms.preview', 'Preview')}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleAction('duplicate')}
            >
              <Copy className="h-4 w-4 mr-2" />
              {t('cms.duplicate', 'Duplicate')}
            </Button>
            <Button
              onClick={() => handleAction('edit')}
            >
              <Edit className="h-4 w-4 mr-2" />
              {t('common.edit', 'Edit')}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Overview */}
            <Card>
              <CardHeader>
                <CardTitle>{t('cms.template_overview', 'Template Overview')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t('cms.template_name', 'Template Name')}
                    </Label>
                    <p className="text-lg font-semibold">{template.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t('cms.slug', 'Slug')}
                    </Label>
                    <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                      {template.slug}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t('cms.category', 'Category')}
                  </Label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {categories[template.category] || template.category}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t('cms.status', 'Status')}:
                    </Label>
                    <Badge variant={template.is_active ? 'default' : 'secondary'}>
                      {template.is_active ? t('cms.active', 'Active') : t('cms.inactive', 'Inactive')}
                    </Badge>
                  </div>
                  {template.is_default && (
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-yellow-600">
                        {t('cms.default_template', 'Default Template')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Template Content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  {t('cms.template_content', 'Template Content')}
                </CardTitle>
                <CardDescription>
                  {t('cms.template_content_preview', 'Preview of the template HTML/Blade content')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      {t('cms.content', 'Content')} ({template.content.length} {t('common.characters', 'characters')})
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowContent(!showContent)}
                    >
                      {showContent ? t('common.hide', 'Hide') : t('common.show', 'Show')}
                    </Button>
                  </div>

                  {showContent && (
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-sm font-mono whitespace-pre-wrap overflow-x-auto">
                        {template.content}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pages Using This Template */}
            {pages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t('cms.pages_using_template', 'Pages Using This Template')}
                  </CardTitle>
                  <CardDescription>
                    {pages.length} {t('cms.pages_found', 'pages found')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pages.map((page) => (
                      <div key={page.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{page.title}</h4>
                          <p className="text-sm text-muted-foreground">/{page.slug}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                            {page.status}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link href={route('cms.pages.show', page.id)}>
                              {t('common.view', 'View')}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('cms.quick_actions', 'Quick Actions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAction('edit')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t('common.edit', 'Edit')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAction('preview')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {t('cms.preview', 'Preview')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAction('duplicate')}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {t('cms.duplicate', 'Duplicate')}
                </Button>
                {!template.is_default && (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleAction('set-default')}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    {t('cms.set_as_default', 'Set as Default')}
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAction('export')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {t('cms.export', 'Export')}
                </Button>
                <Separator />
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => handleAction('delete')}
                  disabled={(template.usage_stats?.total_pages || 0) > 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('common.delete', 'Delete')}
                </Button>
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            {template.usage_stats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {t('cms.usage_statistics', 'Usage Statistics')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t('cms.total_pages', 'Total Pages')}
                    </span>
                    <span className="font-medium">{template.usage_stats.total_pages}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t('cms.published_pages', 'Published Pages')}
                    </span>
                    <span className="font-medium">{template.usage_stats.published_pages}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Template Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('cms.template_information', 'Template Information')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('cms.created_by', 'Created by')}:</span>
                  <span>{template.created_by?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('cms.created_at', 'Created')}:</span>
                  <span>{formatDate(template.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('cms.updated_at', 'Updated')}:</span>
                  <span>{formatDate(template.updated_at)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {t('cms.advanced_settings', 'Advanced Settings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t('cms.template_fields', 'Template Fields')}
                  </Label>
                  <pre className="mt-1 text-xs font-mono bg-muted p-2 rounded overflow-x-auto">
                    {formatJSON(template.fields)}
                  </pre>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t('cms.template_settings', 'Template Settings')}
                  </Label>
                  <pre className="mt-1 text-xs font-mono bg-muted p-2 rounded overflow-x-auto">
                    {formatJSON(template.settings)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
