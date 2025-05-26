import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import {
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  EyeOff,
  RefreshCw,
  ExternalLink,
  Settings
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';

interface Page {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  meta_title?: string;
  meta_description?: string;
  template: string;
  status: string;
  published_at?: string;
}

interface Props {
  page: Page;
  onClose?: () => void;
  showDeviceToggle?: boolean;
  showMetaPreview?: boolean;
}

export default function PagePreview({ 
  page, 
  onClose, 
  showDeviceToggle = true, 
  showMetaPreview = true 
}: Props) {
  const { t } = useTranslate();
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showMeta, setShowMeta] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getDeviceClass = () => {
    switch (device) {
      case 'tablet':
        return 'max-w-3xl';
      case 'mobile':
        return 'max-w-sm';
      default:
        return 'max-w-full';
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-hidden">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">{t('cms.preview', 'Preview')}: {page.title}</h2>
            <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
              {page.status}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {showDeviceToggle && (
              <>
                <Button
                  variant={device === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDevice('desktop')}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={device === 'tablet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDevice('tablet')}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={device === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDevice('mobile')}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
              </>
            )}
            
            {showMetaPreview && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMeta(!showMeta)}
              >
                {showMeta ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span className="ml-2">{t('cms.meta_preview', 'Meta Preview')}</span>
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/${page.slug}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                {t('common.close', 'Close')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        <div className="mx-auto transition-all duration-300" style={{ maxWidth: device === 'desktop' ? '100%' : device === 'tablet' ? '768px' : '375px' }}>
          {/* Meta Preview */}
          {showMeta && showMetaPreview && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  {t('cms.search_engine_preview', 'Search Engine Preview')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Google Search Result Preview */}
                  <div className="border rounded-lg p-4 bg-white">
                    <div className="text-xs text-green-600 mb-1">
                      {window.location.origin}/{page.slug}
                    </div>
                    <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                      {page.meta_title || page.title}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {page.meta_description || page.excerpt || 'No meta description available'}
                    </div>
                  </div>
                  
                  {/* Social Media Preview */}
                  <div className="border rounded-lg p-4 bg-white">
                    <div className="text-xs text-muted-foreground mb-2">
                      {t('cms.social_media_preview', 'Social Media Preview')}
                    </div>
                    <div className="border rounded">
                      <div className="aspect-video bg-gray-200 rounded-t flex items-center justify-center">
                        <span className="text-gray-500 text-sm">
                          {t('cms.og_image_placeholder', 'Open Graph Image')}
                        </span>
                      </div>
                      <div className="p-3">
                        <div className="font-medium text-sm">
                          {page.meta_title || page.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {page.meta_description || page.excerpt}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {window.location.hostname}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Page Preview */}
          <Card className="bg-white shadow-lg">
            <CardContent className="p-0">
              {/* Page Header */}
              <div className="border-b p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                    {window.location.origin}/{page.slug}
                  </div>
                </div>
                
                {/* Page Title */}
                <h1 className="text-3xl font-bold mb-2">{page.title}</h1>
                
                {/* Page Meta */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {page.published_at && (
                    <span>{t('cms.published', 'Published')}: {formatDate(page.published_at)}</span>
                  )}
                  <span>{t('cms.template', 'Template')}: {page.template}</span>
                </div>
                
                {/* Excerpt */}
                {page.excerpt && (
                  <div className="mt-4 text-lg text-muted-foreground">
                    {page.excerpt}
                  </div>
                )}
              </div>
              
              {/* Page Content */}
              <div className="p-6">
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
                
                {!page.content && (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="text-lg font-medium mb-2">
                      {t('cms.no_content', 'No content available')}
                    </div>
                    <div className="text-sm">
                      {t('cms.add_content_to_preview', 'Add content to see the preview')}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Device Info */}
          {showDeviceToggle && (
            <div className="mt-4 text-center">
              <Badge variant="outline" className="text-xs">
                {device === 'desktop' && `${t('cms.desktop', 'Desktop')} (1200px+)`}
                {device === 'tablet' && `${t('cms.tablet', 'Tablet')} (768px)`}
                {device === 'mobile' && `${t('cms.mobile', 'Mobile')} (375px)`}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
