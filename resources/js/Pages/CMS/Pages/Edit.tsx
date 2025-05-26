import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PageEditor from '@/Components/CMS/PageEditor';
import useTranslate from '@/Hooks/useTranslate';
import { toast } from 'sonner';

interface Page {
  id: number;
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

interface Template {
  id: number;
  name: string;
  slug: string;
  description?: string;
  fields?: any[];
}

interface Props {
  page: Page;
  templates: Template[];
  pages: Array<{ id: number; title: string; slug: string }>;
  languages: Record<string, string>;
}

export default function EditPage({ page, templates, pages, languages }: Props) {
  const { t } = useTranslate();

  const handleSave = (data: any) => {
    router.put(route('cms.pages.update', page.id), data, {
      onSuccess: () => {
        toast.success(t('cms.page_updated_successfully', 'Page updated successfully'));
      },
      onError: (errors) => {
        console.error('Validation errors:', errors);
        toast.error(t('cms.page_update_failed', 'Failed to update page'));
      },
    });
  };

  const handlePreview = (data: any) => {
    // Store data in session storage for preview
    sessionStorage.setItem('cms_preview_data', JSON.stringify(data));
    
    // Open preview in new tab
    const previewUrl = route('cms.pages.preview', page.id);
    window.open(previewUrl, '_blank');
  };

  return (
    <AppLayout>
      <Head title={t('cms.edit_page', 'Edit Page')} />

      <PageEditor
        page={page}
        templates={templates}
        pages={pages.filter(p => p.id !== page.id)}
        languages={languages}
        onSave={handleSave}
        onPreview={handlePreview}
      />
    </AppLayout>
  );
}
