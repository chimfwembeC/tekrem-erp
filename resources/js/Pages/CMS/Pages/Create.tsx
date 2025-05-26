import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageEditor from '@/Components/CMS/PageEditor';
import useTranslate from '@/Hooks/useTranslate';
import { toast } from 'sonner';

interface Template {
  id: number;
  name: string;
  slug: string;
  description?: string;
  fields?: any[];
}

interface Props {
  templates: Template[];
  pages: Array<{ id: number; title: string; slug: string }>;
  languages: Record<string, string>;
}

export default function CreatePage({ templates, pages, languages }: Props) {
  const { t } = useTranslate();

  const handleSave = (data: any) => {
    router.post(route('cms.pages.store'), data, {
      onSuccess: (page) => {
        toast.success(t('cms.page_created_successfully', 'Page created successfully'));
        router.visit(route('cms.pages.show', page.props.page?.id));
      },
      onError: (errors) => {
        console.error('Validation errors:', errors);
        toast.error(t('cms.page_creation_failed', 'Failed to create page'));
      },
    });
  };

  const handlePreview = (data: any) => {
    // Store data in session storage for preview
    sessionStorage.setItem('cms_preview_data', JSON.stringify(data));
    
    // Open preview in new tab
    const previewUrl = route('cms.pages.preview', { preview: 'new' });
    window.open(previewUrl, '_blank');
  };

  return (
    <AppLayout>
      <Head title={t('cms.create_page', 'Create Page')} />

      <PageEditor
        templates={templates}
        pages={pages}
        languages={languages}
        onSave={handleSave}
        onPreview={handlePreview}
      />
    </AppLayout>
  );
}
