import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Separator } from '@/Components/ui/separator';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  ArrowLeft,
  Save,
  Eye,
  Code,
  Settings,
  AlertTriangle,
  Star
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
  errors?: Record<string, string>;
}

export default function TemplateEdit({ template, categories, errors }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: template.name,
    slug: template.slug,
    description: template.description || '',
    content: template.content,
    category: template.category,
    is_active: template.is_active,
    is_default: template.is_default,
    fields: JSON.stringify(template.fields || {}, null, 2),
    settings: JSON.stringify(template.settings || {}, null, 2)
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from name if slug is empty
    if (field === 'name' && !formData.slug) {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate JSON fields
      try {
        JSON.parse(formData.fields);
        JSON.parse(formData.settings);
      } catch (error) {
        toast.error(t('cms.invalid_json', 'Invalid JSON format in fields or settings'));
        setIsSubmitting(false);
        return;
      }

      router.put(route('cms.templates.update', template.id), {
        ...formData,
        fields: JSON.parse(formData.fields),
        settings: JSON.parse(formData.settings)
      }, {
        onSuccess: () => {
          toast.success(t('cms.template_updated', 'Template updated successfully'));
        },
        onError: (errors) => {
          console.error('Validation errors:', errors);
          toast.error(t('cms.template_update_failed', 'Failed to update template'));
        },
        onFinish: () => {
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error(t('cms.template_update_failed', 'Failed to update template'));
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    // Open preview in new tab/window
    const previewData = {
      ...formData,
      content: formData.content || '<p>Preview content...</p>'
    };
    
    // Store preview data temporarily and open preview
    sessionStorage.setItem('template_preview', JSON.stringify(previewData));
    window.open(`/cms/templates/${template.id}/preview`, '_blank');
  };

  return (
    <AppLayout>
      <Head title={`${t('common.edit', 'Edit')} ${template.name}`} />

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
                {t('common.edit', 'Edit')} {template.name}
                {template.is_default && (
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                )}
              </h1>
              <p className="text-muted-foreground">
                {t('cms.edit_template_description', 'Modify template settings and content')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={!formData.content}
            >
              <Eye className="h-4 w-4 mr-2" />
              {t('cms.preview', 'Preview')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.name || !formData.content}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
            </Button>
          </div>
        </div>

        {/* Usage Stats */}
        {template.usage_stats && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t('cms.template_usage_warning', 'This template is used by {{count}} pages. Changes may affect existing content.', {
                count: template.usage_stats.total_pages
              })}
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {Object.keys(errors || {}).length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t('common.validation_errors', 'Please fix the validation errors below')}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('cms.basic_information', 'Basic Information')}</CardTitle>
                  <CardDescription>
                    {t('cms.template_basic_info_desc', 'Enter the basic template details')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('cms.template_name', 'Template Name')} *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder={t('cms.enter_template_name', 'Enter template name')}
                        className={errors?.name ? 'border-destructive' : ''}
                      />
                      {errors?.name && (
                        <p className="text-sm text-destructive">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug">{t('cms.slug', 'Slug')}</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        placeholder={t('cms.auto_generated', 'Auto-generated from name')}
                        className={errors?.slug ? 'border-destructive' : ''}
                      />
                      {errors?.slug && (
                        <p className="text-sm text-destructive">{errors.slug}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{t('cms.description', 'Description')}</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder={t('cms.template_description_placeholder', 'Describe this template...')}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">{t('cms.category', 'Category')} *</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className={errors?.category ? 'border-destructive' : ''}>
                        <SelectValue placeholder={t('cms.select_category', 'Select a category')} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categories).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors?.category && (
                      <p className="text-sm text-destructive">{errors.category}</p>
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
                    {t('cms.template_content_desc', 'Enter the HTML/Blade template content')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="content">{t('cms.content', 'Content')} *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      placeholder={t('cms.template_content_placeholder', 'Enter your template HTML/Blade content...')}
                      rows={15}
                      className={`font-mono text-sm ${errors?.content ? 'border-destructive' : ''}`}
                    />
                    {errors?.content && (
                      <p className="text-sm text-destructive">{errors.content}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Template Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {t('cms.template_settings', 'Template Settings')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('cms.active', 'Active')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('cms.template_active_desc', 'Make this template available for use')}
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('cms.default_template', 'Default Template')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('cms.default_template_desc', 'Set as the default template for new pages')}
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_default}
                      onCheckedChange={(checked) => handleInputChange('is_default', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Template Info */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('cms.template_info', 'Template Information')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">{t('cms.created_by', 'Created by')}: </span>
                    <span>{template.created_by?.name || 'Unknown'}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">{t('cms.created_at', 'Created')}: </span>
                    <span>{new Date(template.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">{t('cms.updated_at', 'Updated')}: </span>
                    <span>{new Date(template.updated_at).toLocaleDateString()}</span>
                  </div>
                  {template.usage_stats && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t('cms.pages_using', 'Pages using')}: </span>
                      <span className="font-medium">{template.usage_stats.total_pages}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Advanced Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('cms.advanced_settings', 'Advanced Settings')}</CardTitle>
                  <CardDescription>
                    {t('cms.advanced_settings_desc', 'JSON configuration for fields and settings')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fields">{t('cms.template_fields', 'Template Fields')}</Label>
                    <Textarea
                      id="fields"
                      value={formData.fields}
                      onChange={(e) => handleInputChange('fields', e.target.value)}
                      placeholder='{"field_name": {"type": "text", "label": "Field Label"}}'
                      rows={4}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('cms.json_format', 'JSON format')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="settings">{t('cms.template_settings_json', 'Template Settings')}</Label>
                    <Textarea
                      id="settings"
                      value={formData.settings}
                      onChange={(e) => handleInputChange('settings', e.target.value)}
                      placeholder='{"layout": "app", "cache_enabled": true}'
                      rows={4}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('cms.json_format', 'JSON format')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
