import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Separator } from '@/Components/ui/separator';
import {
  Save,
  Eye,
  Globe,
  Settings,
  Search,
  Calendar,
  Clock,
  FileText,
  Image,
  Code,
  Layers
} from 'lucide-react';
import RichTextEditor from '@/Components/CMS/RichTextEditor';
import MediaPicker from '@/Components/CMS/MediaPicker';
import SEOAnalyzer from '@/Components/CMS/SEOAnalyzer';
import useTranslate from '@/Hooks/useTranslate';

interface Template {
  id: number;
  name: string;
  slug: string;
  description?: string;
  fields?: any[];
}

interface Page {
  id?: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  content_blocks?: any[];
  template: string;
  layout?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  canonical_url?: string;
  status: string;
  published_at?: string;
  scheduled_at?: string;
  parent_id?: number;
  language: string;
  is_homepage: boolean;
  show_in_menu: boolean;
  require_auth: boolean;
  permissions?: any;
  settings?: any;
}

interface Props {
  page?: Page;
  templates: Template[];
  pages: Array<{ id: number; title: string; slug: string }>;
  languages: Record<string, string>;
  onSave: (data: any) => void;
  onPreview?: (data: any) => void;
  className?: string;
}

export default function PageEditor({
  page,
  templates,
  pages,
  languages,
  onSave,
  onPreview,
  className = ''
}: Props) {
  const { t } = useTranslate();
  const [formData, setFormData] = useState<Page>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    content_blocks: [],
    template: templates[0]?.slug || 'default',
    layout: 'default',
    meta_title: '',
    meta_description: '',
    meta_keywords: [],
    og_title: '',
    og_description: '',
    og_image: '',
    canonical_url: '',
    status: 'draft',
    published_at: '',
    scheduled_at: '',
    parent_id: undefined,
    language: 'en',
    is_homepage: false,
    show_in_menu: true,
    require_auth: false,
    permissions: {},
    settings: {},
    ...page
  });

  const [activeTab, setActiveTab] = useState('content');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [seoScore, setSeoScore] = useState(0);

  const selectedTemplate = templates.find(t => t.slug === formData.template);

  useEffect(() => {
    // Auto-generate slug from title
    if (formData.title && !page?.id) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, page?.id]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (status?: string) => {
    const dataToSave = {
      ...formData,
      ...(status && { status })
    };
    onSave(dataToSave);
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(formData);
    }
    setIsPreviewMode(true);
  };

  const handleSchedule = () => {
    if (formData.scheduled_at) {
      handleSave('scheduled');
    }
  };

  const addKeyword = (keyword: string) => {
    if (keyword && !formData.meta_keywords?.includes(keyword)) {
      handleInputChange('meta_keywords', [...(formData.meta_keywords || []), keyword]);
    }
  };

  const removeKeyword = (keyword: string) => {
    handleInputChange('meta_keywords', formData.meta_keywords?.filter(k => k !== keyword) || []);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {page?.id ? t('cms.edit_page', 'Edit Page') : t('cms.create_page', 'Create Page')}
          </h1>
          <p className="text-muted-foreground">
            {page?.id ? t('cms.edit_page_description', 'Edit page content and settings') : t('cms.create_page_description', 'Create a new page')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            {t('cms.preview', 'Preview')}
          </Button>
          <Button variant="outline" onClick={() => handleSave('draft')}>
            <Save className="h-4 w-4 mr-2" />
            {t('cms.save_draft', 'Save Draft')}
          </Button>
          <Button onClick={() => handleSave('published')}>
            <Globe className="h-4 w-4 mr-2" />
            {t('cms.publish', 'Publish')}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="content">
                <FileText className="h-4 w-4 mr-2" />
                {t('cms.content', 'Content')}
              </TabsTrigger>
              <TabsTrigger value="seo">
                <Search className="h-4 w-4 mr-2" />
                {t('cms.seo', 'SEO')}
              </TabsTrigger>
              <TabsTrigger value="design">
                <Layers className="h-4 w-4 mr-2" />
                {t('cms.design', 'Design')}
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                {t('cms.settings', 'Settings')}
              </TabsTrigger>
            </TabsList>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('cms.page_content', 'Page Content')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">{t('cms.title', 'Title')}</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder={t('cms.enter_title', 'Enter page title')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">{t('cms.slug', 'Slug')}</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder={t('cms.enter_slug', 'Enter page slug')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="excerpt">{t('cms.excerpt', 'Excerpt')}</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt || ''}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      placeholder={t('cms.enter_excerpt', 'Enter page excerpt')}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>{t('cms.content', 'Content')}</Label>
                    <RichTextEditor
                      value={formData.content}
                      onChange={(content) => handleInputChange('content', content)}
                      onImageInsert={() => setShowMediaPicker(true)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('cms.seo_optimization', 'SEO Optimization')}</CardTitle>
                  <CardDescription>
                    {t('cms.seo_description', 'Optimize your page for search engines')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="meta_title">{t('cms.meta_title', 'Meta Title')}</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title || ''}
                      onChange={(e) => handleInputChange('meta_title', e.target.value)}
                      placeholder={t('cms.enter_meta_title', 'Enter meta title')}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.meta_title?.length || 0}/60 characters
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="meta_description">{t('cms.meta_description', 'Meta Description')}</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description || ''}
                      onChange={(e) => handleInputChange('meta_description', e.target.value)}
                      placeholder={t('cms.enter_meta_description', 'Enter meta description')}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.meta_description?.length || 0}/160 characters
                    </p>
                  </div>

                  <div>
                    <Label>{t('cms.meta_keywords', 'Meta Keywords')}</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.meta_keywords?.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeKeyword(keyword)}>
                          {keyword} ×
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder={t('cms.add_keyword', 'Add keyword and press Enter')}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addKeyword(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>

                  <Separator />

                  <div>
                    <Label htmlFor="og_title">{t('cms.og_title', 'Open Graph Title')}</Label>
                    <Input
                      id="og_title"
                      value={formData.og_title || ''}
                      onChange={(e) => handleInputChange('og_title', e.target.value)}
                      placeholder={t('cms.enter_og_title', 'Enter Open Graph title')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="og_description">{t('cms.og_description', 'Open Graph Description')}</Label>
                    <Textarea
                      id="og_description"
                      value={formData.og_description || ''}
                      onChange={(e) => handleInputChange('og_description', e.target.value)}
                      placeholder={t('cms.enter_og_description', 'Enter Open Graph description')}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="og_image">{t('cms.og_image', 'Open Graph Image')}</Label>
                    <div className="flex gap-2">
                      <Input
                        id="og_image"
                        value={formData.og_image || ''}
                        onChange={(e) => handleInputChange('og_image', e.target.value)}
                        placeholder={t('cms.enter_og_image_url', 'Enter image URL')}
                      />
                      <Button variant="outline" onClick={() => setShowMediaPicker(true)}>
                        <Image className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="canonical_url">{t('cms.canonical_url', 'Canonical URL')}</Label>
                    <Input
                      id="canonical_url"
                      value={formData.canonical_url || ''}
                      onChange={(e) => handleInputChange('canonical_url', e.target.value)}
                      placeholder={t('cms.enter_canonical_url', 'Enter canonical URL')}
                    />
                  </div>
                </CardContent>
              </Card>

              <SEOAnalyzer
                title={formData.title}
                metaTitle={formData.meta_title}
                metaDescription={formData.meta_description}
                content={formData.content}
                slug={formData.slug}
                onScoreChange={setSeoScore}
              />
            </TabsContent>

            {/* Design Tab */}
            <TabsContent value="design" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('cms.template_layout', 'Template & Layout')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="template">{t('cms.template', 'Template')}</Label>
                    <Select value={formData.template} onValueChange={(value) => handleInputChange('template', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.slug} value={template.slug}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedTemplate?.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedTemplate.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="layout">{t('cms.layout', 'Layout')}</Label>
                    <Select value={formData.layout || 'default'} onValueChange={(value) => handleInputChange('layout', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default</SelectItem>
                        <SelectItem value="full-width">Full Width</SelectItem>
                        <SelectItem value="sidebar-left">Sidebar Left</SelectItem>
                        <SelectItem value="sidebar-right">Sidebar Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('cms.page_settings', 'Page Settings')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="language">{t('cms.language', 'Language')}</Label>
                    <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(languages).map(([code, name]) => (
                          <SelectItem key={code} value={code}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="parent_id">{t('cms.parent_page', 'Parent Page')}</Label>
                    <Select 
                      value={formData.parent_id?.toString() || ''} 
                      onValueChange={(value) => handleInputChange('parent_id', value ? parseInt(value) : undefined)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('cms.select_parent', 'Select parent page')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="empty">{t('cms.no_parent', 'No parent')}</SelectItem>
                        {pages.filter(p => p.id !== page?.id).map((page) => (
                          <SelectItem key={page.id} value={page.id.toString()}>
                            {page.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_homepage"
                      checked={formData.is_homepage}
                      onCheckedChange={(checked) => handleInputChange('is_homepage', checked)}
                    />
                    <Label htmlFor="is_homepage">{t('cms.set_as_homepage', 'Set as homepage')}</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show_in_menu"
                      checked={formData.show_in_menu}
                      onCheckedChange={(checked) => handleInputChange('show_in_menu', checked)}
                    />
                    <Label htmlFor="show_in_menu">{t('cms.show_in_menu', 'Show in menu')}</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="require_auth"
                      checked={formData.require_auth}
                      onCheckedChange={(checked) => handleInputChange('require_auth', checked)}
                    />
                    <Label htmlFor="require_auth">{t('cms.require_authentication', 'Require authentication')}</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {t('cms.publishing', 'Publishing')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t('cms.status', 'Status')}</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.status === 'scheduled' && (
                <div>
                  <Label htmlFor="scheduled_at">{t('cms.schedule_for', 'Schedule for')}</Label>
                  <Input
                    id="scheduled_at"
                    type="datetime-local"
                    value={formData.scheduled_at || ''}
                    onChange={(e) => handleInputChange('scheduled_at', e.target.value)}
                  />
                  <Button className="w-full mt-2" onClick={handleSchedule}>
                    <Calendar className="h-4 w-4 mr-2" />
                    {t('cms.schedule', 'Schedule')}
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => handleSave('draft')}>
                  <Save className="h-4 w-4 mr-2" />
                  {t('cms.save', 'Save')}
                </Button>
                <Button className="flex-1" onClick={() => handleSave('published')}>
                  <Globe className="h-4 w-4 mr-2" />
                  {t('cms.publish', 'Publish')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SEO Score */}
          {seoScore > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  {t('cms.seo_score', 'SEO Score')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{seoScore}/100</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${seoScore}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <MediaPicker
          onSelect={(media) => {
            if (activeTab === 'seo') {
              handleInputChange('og_image', media.url);
            }
            setShowMediaPicker(false);
          }}
          onClose={() => setShowMediaPicker(false)}
          type="image"
        />
      )}
    </div>
  );
}
