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
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category_id?: number;
  is_published: boolean;
  is_featured: boolean;
  tags?: string[];
  sort_order: number;
}

interface Category {
  id: number;
  name: string;
  description: string;
  color: string;
}

interface Props {
  faq: FAQ;
  categories: Category[];
}

export default function Edit({ faq, categories }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [previewMode, setPreviewMode] = useState(false);

  const { data, setData, put, processing, errors } = useForm({
    question: faq.question,
    answer: faq.answer,
    category_id: faq.category_id?.toString() || '',
    is_published: faq.is_published,
    is_featured: faq.is_featured,
    tags: faq.tags || [],
    sort_order: faq.sort_order,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('support.faq.update', faq.id));
  };

  return (
    <AppLayout>
      <Head title={`${t('common.edit', 'Edit')} FAQ`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href={route('support.faq.show', faq.id)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back', 'Back')}
              </a>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('common.edit', 'Edit')} FAQ
              </h1>
              <p className="text-muted-foreground">
                {t('support.edit_faq_description', 'Update the frequently asked question')}
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
                  <CardTitle>{t('support.faq_content', 'FAQ Content')}</CardTitle>
                  <CardDescription>
                    {t('support.edit_faq_content_description', 'Update your question and answer')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!previewMode ? (
                    <>
                      <div>
                        <Label htmlFor="question">{t('support.question', 'Question')} *</Label>
                        <Input
                          id="question"
                          value={data.question}
                          onChange={(e) => setData('question', e.target.value)}
                          placeholder={t('support.question_placeholder', 'What is your question?')}
                          className={errors.question ? 'border-red-500' : ''}
                        />
                        {errors.question && (
                          <p className="text-sm text-red-500 mt-1">{errors.question}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="answer">{t('support.answer', 'Answer')} *</Label>
                        <Textarea
                          id="answer"
                          value={data.answer}
                          onChange={(e) => setData('answer', e.target.value)}
                          placeholder={t('support.answer_placeholder', 'Provide a detailed answer...')}
                          rows={10}
                          className={errors.answer ? 'border-red-500' : ''}
                        />
                        {errors.answer && (
                          <p className="text-sm text-red-500 mt-1">{errors.answer}</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                          <HelpCircle className="h-5 w-5 text-primary" />
                          {data.question || 'Your question will appear here...'}
                        </h2>
                      </div>
                      <div className="prose max-w-none">
                        <div className="whitespace-pre-wrap text-muted-foreground">
                          {data.answer || 'Your answer will appear here...'}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
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
                    <Label htmlFor="category">{t('support.category', 'Category')}</Label>
                    <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('support.select_category', 'Select category')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t('support.no_category', 'No Category')}</SelectItem>
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

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_published"
                        checked={data.is_published}
                        onCheckedChange={(checked) => setData('is_published', !!checked)}
                      />
                      <Label htmlFor="is_published" className="text-sm font-medium">
                        {t('support.published', 'Published')}
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_featured"
                        checked={data.is_featured}
                        onCheckedChange={(checked) => setData('is_featured', !!checked)}
                      />
                      <Label htmlFor="is_featured" className="text-sm font-medium">
                        {t('support.featured_faq', 'Featured FAQ')}
                      </Label>
                    </div>
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
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('support.sort_order_help', 'Lower numbers appear first')}
                    </p>
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
                      <a href={route('support.faq.show', faq.id)}>
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
                  {t('support.edit_faq_help', 'Changes will be saved immediately. Published FAQs will be visible to all users.')}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
