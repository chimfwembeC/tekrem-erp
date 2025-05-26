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
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  ArrowLeft,
  Save,
  TestTube,
  AlertTriangle,
  Link2,
  ExternalLink
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface Props {
  statusCodes: Record<number, string>;
  errors?: Record<string, string>;
}

export default function RedirectCreate({ statusCodes, errors }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [formData, setFormData] = useState({
    from_url: '',
    to_url: '',
    status_code: 301,
    description: '',
    is_active: true
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    router.post(route('cms.redirects.store'), formData, {
      onSuccess: () => {
        toast.success(t('cms.redirect_created', 'Redirect created successfully'));
      },
      onError: (errors) => {
        console.error('Validation errors:', errors);
        toast.error(t('cms.redirect_creation_failed', 'Failed to create redirect'));
      },
      onFinish: () => {
        setIsSubmitting(false);
      }
    });
  };

  const handleTest = async () => {
    if (!formData.from_url) {
      toast.error(t('cms.enter_from_url', 'Please enter a source URL to test'));
      return;
    }

    setIsTesting(true);
    
    try {
      const response = await fetch(route('cms.redirects.test'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ url: formData.from_url })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(t('cms.redirect_test_success', 'Redirect test completed successfully'));
      } else {
        toast.error(result.message || t('cms.redirect_test_failed', 'Redirect test failed'));
      }
    } catch (error) {
      toast.error(t('cms.redirect_test_error', 'Error testing redirect'));
    } finally {
      setIsTesting(false);
    }
  };

  const normalizeUrl = (url: string) => {
    if (!url) return '';
    
    // Add leading slash if it doesn't start with http/https or /
    if (!url.startsWith('http') && !url.startsWith('/')) {
      return '/' + url;
    }
    
    return url;
  };

  return (
    <AppLayout>
      <Head title={t('cms.create_redirect', 'Create Redirect')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.visit(route('cms.redirects.index'))}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back', 'Back')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('cms.create_redirect', 'Create Redirect')}
              </h1>
              <p className="text-muted-foreground">
                {t('cms.create_redirect_description', 'Create a new URL redirect')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={isTesting || !formData.from_url}
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isTesting ? t('cms.testing', 'Testing...') : t('cms.test', 'Test')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.from_url || !formData.to_url}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
            </Button>
          </div>
        </div>

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
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    {t('cms.redirect_details', 'Redirect Details')}
                  </CardTitle>
                  <CardDescription>
                    {t('cms.redirect_details_desc', 'Configure the source and destination URLs')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="from_url">{t('cms.from_url', 'From URL')} *</Label>
                    <Input
                      id="from_url"
                      value={formData.from_url}
                      onChange={(e) => handleInputChange('from_url', normalizeUrl(e.target.value))}
                      placeholder="/old-page or https://example.com/old-page"
                      className={errors?.from_url ? 'border-destructive' : ''}
                    />
                    {errors?.from_url && (
                      <p className="text-sm text-destructive">{errors.from_url}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t('cms.from_url_help', 'The URL that should be redirected. Can be relative (/page) or absolute (https://example.com/page)')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="to_url">{t('cms.to_url', 'To URL')} *</Label>
                    <Input
                      id="to_url"
                      value={formData.to_url}
                      onChange={(e) => handleInputChange('to_url', e.target.value)}
                      placeholder="/new-page or https://example.com/new-page"
                      className={errors?.to_url ? 'border-destructive' : ''}
                    />
                    {errors?.to_url && (
                      <p className="text-sm text-destructive">{errors.to_url}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t('cms.to_url_help', 'The destination URL where users should be redirected')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status_code">{t('cms.status_code', 'Status Code')} *</Label>
                    <Select 
                      value={formData.status_code.toString()} 
                      onValueChange={(value) => handleInputChange('status_code', parseInt(value))}
                    >
                      <SelectTrigger className={errors?.status_code ? 'border-destructive' : ''}>
                        <SelectValue placeholder={t('cms.select_status_code', 'Select status code')} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusCodes).map(([code, description]) => (
                          <SelectItem key={code} value={code}>
                            {code} - {description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors?.status_code && (
                      <p className="text-sm text-destructive">{errors.status_code}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t('cms.status_code_help', '301 for permanent redirects, 302 for temporary redirects')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{t('cms.description', 'Description')}</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder={t('cms.redirect_description_placeholder', 'Optional description for this redirect...')}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('cms.description_help', 'Optional description to help identify this redirect')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Redirect Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('cms.redirect_settings', 'Redirect Settings')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('cms.active', 'Active')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('cms.redirect_active_desc', 'Enable this redirect')}
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Status Code Information */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('cms.status_code_info', 'Status Code Information')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <strong>301 - Permanent Redirect</strong>
                    <p className="text-muted-foreground">
                      {t('cms.status_301_desc', 'Use for permanently moved content. Search engines will transfer ranking to the new URL.')}
                    </p>
                  </div>
                  <div>
                    <strong>302 - Temporary Redirect</strong>
                    <p className="text-muted-foreground">
                      {t('cms.status_302_desc', 'Use for temporarily moved content. Search engines will keep the original URL in their index.')}
                    </p>
                  </div>
                  <div>
                    <strong>307 - Temporary Redirect</strong>
                    <p className="text-muted-foreground">
                      {t('cms.status_307_desc', 'Similar to 302 but preserves the request method and body.')}
                    </p>
                  </div>
                  <div>
                    <strong>308 - Permanent Redirect</strong>
                    <p className="text-muted-foreground">
                      {t('cms.status_308_desc', 'Similar to 301 but preserves the request method and body.')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              {formData.from_url && formData.to_url && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('cms.redirect_preview', 'Redirect Preview')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{formData.from_url}</span>
                        <ExternalLink className="h-3 w-3" />
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium">{formData.to_url}</span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        HTTP {formData.status_code} - {statusCodes[formData.status_code]}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Best Practices */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('cms.best_practices', 'Best Practices')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• {t('cms.redirect_tip_1', 'Use 301 redirects for permanently moved content')}</p>
                  <p>• {t('cms.redirect_tip_2', 'Avoid redirect chains (A→B→C)')}</p>
                  <p>• {t('cms.redirect_tip_3', 'Test redirects before publishing')}</p>
                  <p>• {t('cms.redirect_tip_4', 'Monitor redirect performance regularly')}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
