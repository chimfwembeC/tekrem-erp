import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  ArrowLeft,
  Save,
  Eye,
  AlertCircle
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  category_id?: number;
  status: string;
  is_featured: boolean;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  sort_order: number;
}

interface Category {
  id: number;
  name: string;
  description: string;
  color: string;
}

interface Props {
  article: Article;
  categories: Category[];
}

export default function Edit({ article, categories }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [previewMode, setPreviewMode] = useState(false);

  const { data, setData, put, processing, errors } = useForm({
    title: article.title,
    slug: article.slug,
    content: article.content,
    excerpt: article.excerpt || '',
    category_id: article.category_id?.toString() || '',
    status: article.status,
    is_featured: article.is_featured,
    tags: article.tags || [],
    meta_title: article.meta_title || '',
    meta_description: article.meta_description || '',
    sort_order: article.sort_order,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('support.knowledge-base.update', article.id));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setData('title', title);
    if (!data.meta_title) {
      setData('meta_title', title);
    }
  };

  return (
    <AppLayout>
      <Head title={`${t('common.edit', 'Edit')} ${article.title}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href={route('support.knowledge-base.show', article.id)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back', 'Back')}
              </a>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('common.edit', 'Edit')} {t('support.article', 'Article')}
              </h1>
              <p className="text-muted-foreground">
                {t('support.edit_article_description', 'Update the knowledge base article')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? t('common.edit', 'Edit') : t('common.preview', 'Preview')}
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('support.article_content', 'Article Content')}</CardTitle>
                  <CardDescription>
                    {t('support.edit_article_content_description', 'Update your knowledge base article content')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!previewMode ? (
                    <>
                      <div>
                        <Label htmlFor="title">{t('support.title', 'Title')} *</Label>
                        <Input
                          id="title"
                          value={data.title}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          placeholder={t('support.article_title_placeholder', 'Enter article title')}
                          className={errors.title ? 'border-red-500' : ''}
                        />
                        {errors.title && (
                          <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="slug">{t('support.slug', 'Slug')}</Label>
                        <Input
                          id="slug"
                          value={data.slug}
                          onChange={(e) => setData('slug', e.target.value)}
                          placeholder={t('support.slug_placeholder', 'article-url-slug')}
                          className={errors.slug ? 'border-red-500' : ''}
                        />
                        {errors.slug && (
                          <p className="text-sm text-red-500 mt-1">{errors.slug}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          {t('support.slug_help', 'URL-friendly version of the title')}
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="excerpt">{t('support.excerpt', 'Excerpt')}</Label>
                        <Textarea
                          id="excerpt"
                          value={data.excerpt}
                          onChange={(e) => setData('excerpt', e.target.value)}
                          placeholder={t('support.excerpt_placeholder', 'Brief summary of the article')}
                          rows={3}
                          className={errors.excerpt ? 'border-red-500' : ''}
                        />
                        {errors.excerpt && (
                          <p className="text-sm text-red-500 mt-1">{errors.excerpt}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="content">{t('support.content', 'Content')} *</Label>
                        <Textarea
                          id="content"
                          value={data.content}
                          onChange={(e) => setData('content', e.target.value)}
                          placeholder={t('support.content_placeholder', 'Write your article content here...')}
                          rows={15}
                          className={errors.content ? 'border-red-500' : ''}
                        />
                        {errors.content && (
                          <p className="text-sm text-red-500 mt-1">{errors.content}</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold">{data.title || 'Article Title'}</h2>
                        {data.excerpt && (
                          <p className="text-muted-foreground mt-2">{data.excerpt}</p>
                        )}
                      </div>
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap">
                          {data.content || 'Article content will appear here...'}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* SEO Settings */}
              {!previewMode && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('support.seo_settings', 'SEO Settings')}</CardTitle>
                    <CardDescription>
                      {t('support.seo_settings_description', 'Optimize your article for search engines')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="meta_title">{t('support.meta_title', 'Meta Title')}</Label>
                      <Input
                        id="meta_title"
                        value={data.meta_title}
                        onChange={(e) => setData('meta_title', e.target.value)}
                        placeholder={t('support.meta_title_placeholder', 'SEO title for search engines')}
                      />
                    </div>

                    <div>
                      <Label htmlFor="meta_description">{t('support.meta_description', 'Meta Description')}</Label>
                      <Textarea
                        id="meta_description"
                        value={data.meta_description}
                        onChange={(e) => setData('meta_description', e.target.value)}
                        placeholder={t('support.meta_description_placeholder', 'SEO description for search engines')}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publishing Options */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('support.publishing', 'Publishing')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="status">{t('support.status', 'Status')}</Label>
                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">{t('support.draft', 'Draft')}</SelectItem>
                        <SelectItem value="published">{t('support.published', 'Published')}</SelectItem>
                        <SelectItem value="archived">{t('support.archived', 'Archived')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">{t('support.category', 'Category')}</Label>
                    <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('support.select_category', 'Select category')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="empty">{t('support.no_category', 'No Category')}</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              {category.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_featured"
                      checked={data.is_featured}
                      onCheckedChange={(checked) => setData('is_featured', !!checked)}
                    />
                    <Label htmlFor="is_featured" className="text-sm font-medium">
                      {t('support.featured_article', 'Featured Article')}
                    </Label>
                  </div>

                  <div>
                    <Label htmlFor="sort_order">{t('support.sort_order', 'Sort Order')}</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={data.sort_order}
                      onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Button type="submit" className="w-full" disabled={processing}>
                      <Save className="h-4 w-4 mr-2" />
                      {processing ? t('common.saving', 'Saving...') : t('common.save_changes', 'Save Changes')}
                    </Button>
                    
                    <Button type="button" variant="outline" className="w-full" asChild>
                      <a href={route('support.knowledge-base.show', article.id)}>
                        {t('common.cancel', 'Cancel')}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Help */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t('support.edit_article_help', 'Changes will be saved immediately. Published articles will be visible to all users.')}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
