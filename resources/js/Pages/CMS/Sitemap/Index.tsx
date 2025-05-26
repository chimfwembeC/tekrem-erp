import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  Globe,
  Download,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Search,
  Calendar,
  FileText,
  Upload
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import { toast } from 'sonner';

interface Page {
  id: number;
  title: string;
  slug: string;
  updated_at: string;
  created_at: string;
}

interface Props {
  sitemapExists: boolean;
  lastGenerated?: string;
  pageCount: number;
  recentPages: Page[];
  sitemapUrl: string;
}

export default function SitemapIndex({ 
  sitemapExists, 
  lastGenerated, 
  pageCount, 
  recentPages, 
  sitemapUrl 
}: Props) {
  const { t } = useTranslate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(route('cms.sitemap.generate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
        router.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(t('cms.sitemap_generation_failed', 'Failed to generate sitemap'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      const response = await fetch(route('cms.sitemap.validate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
      
      const result = await response.json();
      setValidationResult(result);
      
      if (result.valid) {
        toast.success(t('cms.sitemap_valid', 'Sitemap is valid'));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(t('cms.sitemap_validation_failed', 'Failed to validate sitemap'));
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(route('cms.sitemap.submit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(t('cms.sitemap_submission_failed', 'Failed to submit sitemap'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = () => {
    window.open(route('cms.sitemap.download'), '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <AppLayout>
      <Head title={t('cms.sitemap', 'Sitemap')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('cms.sitemap', 'Sitemap')}
            </h1>
            <p className="text-muted-foreground">
              {t('cms.sitemap_description', 'Generate and manage XML sitemaps')}
            </p>
          </div>
          <div className="flex gap-2">
            {sitemapExists && (
              <>
                <Button variant="outline" onClick={handleValidate} disabled={isValidating}>
                  {isValidating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  {t('cms.validate', 'Validate')}
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  {t('cms.download', 'Download')}
                </Button>
              </>
            )}
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {sitemapExists ? t('cms.regenerate', 'Regenerate') : t('cms.generate', 'Generate')}
            </Button>
          </div>
        </div>

        {/* Sitemap Status */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('cms.sitemap_status', 'Sitemap Status')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('cms.status', 'Status')}</span>
                  <Badge variant={sitemapExists ? 'default' : 'secondary'}>
                    {sitemapExists ? t('cms.exists', 'Exists') : t('cms.not_generated', 'Not Generated')}
                  </Badge>
                </div>
                
                {sitemapExists && lastGenerated && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('cms.last_generated', 'Last Generated')}</span>
                    <span className="text-sm text-muted-foreground">{formatDate(lastGenerated)}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('cms.pages_included', 'Pages Included')}</span>
                  <span className="text-sm font-medium">{pageCount}</span>
                </div>
                
                {sitemapExists && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{t('cms.sitemap_url', 'Sitemap URL')}</span>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={sitemapUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {t('cms.view', 'View')}
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                {t('cms.search_engines', 'Search Engines')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t('cms.submit_sitemap_description', 'Submit your sitemap to search engines for better indexing')}
                </p>
                
                {sitemapExists ? (
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {t('cms.submit_to_search_engines', 'Submit to Search Engines')}
                  </Button>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {t('cms.generate_sitemap_first', 'Generate a sitemap first before submitting to search engines')}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Validation Results */}
        {validationResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {validationResult.valid ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                )}
                {t('cms.validation_results', 'Validation Results')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert variant={validationResult.valid ? 'default' : 'destructive'}>
                  <AlertDescription>
                    {validationResult.message}
                  </AlertDescription>
                </Alert>
                
                {validationResult.stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t('cms.url_count', 'URL Count')}</span>
                      <div className="font-medium">{validationResult.stats.url_count}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('cms.file_size', 'File Size')}</span>
                      <div className="font-medium">{validationResult.stats.file_size_mb} MB</div>
                    </div>
                  </div>
                )}
                
                {validationResult.warnings && validationResult.warnings.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">{t('cms.warnings', 'Warnings')}</h4>
                    <ul className="space-y-1">
                      {validationResult.warnings.map((warning: string, index: number) => (
                        <li key={index} className="text-sm text-yellow-600 flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3" />
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t('cms.recent_pages', 'Recent Pages')}
            </CardTitle>
            <CardDescription>
              {t('cms.recent_pages_description', 'Recently updated pages that will be included in the sitemap')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPages.map((page) => (
                <div key={page.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{page.title}</h4>
                    <p className="text-sm text-muted-foreground">/{page.slug}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {t('cms.updated', 'Updated')}
                    </div>
                    <div className="text-sm font-medium">
                      {formatDate(page.updated_at)}
                    </div>
                  </div>
                </div>
              ))}
              
              {recentPages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    {t('cms.no_pages_found', 'No pages found')}
                  </p>
                  <p className="text-sm">
                    {t('cms.create_pages_for_sitemap', 'Create some pages to include in your sitemap')}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('cms.sitemap_information', 'Sitemap Information')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">{t('cms.what_is_sitemap', 'What is a sitemap?')}</h4>
                <p className="text-muted-foreground">
                  {t('cms.sitemap_explanation', 'A sitemap is a file that provides information about the pages, videos, and other files on your site, and the relationships between them. Search engines like Google read this file to crawl your site more efficiently.')}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">{t('cms.automatic_generation', 'Automatic Generation')}</h4>
                <p className="text-muted-foreground">
                  {t('cms.automatic_generation_explanation', 'The sitemap is automatically generated based on your published pages. It includes information about when pages were last modified, how often they change, and their relative importance.')}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">{t('cms.search_engine_submission', 'Search Engine Submission')}</h4>
                <p className="text-muted-foreground">
                  {t('cms.submission_explanation', 'After generating your sitemap, you can submit it to search engines like Google and Bing to help them discover and index your content more effectively.')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
