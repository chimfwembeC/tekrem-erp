import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Checkbox } from '@/Components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  Copy,
  Trash2,
  Globe,
  Clock,
  FileText,
  Calendar,
  User
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';

interface Page {
  id: number;
  title: string;
  slug: string;
  status: string;
  published_at?: string;
  scheduled_at?: string;
  author: {
    id: number;
    name: string;
  };
  parent?: {
    id: number;
    title: string;
  };
  template: string;
  language: string;
  view_count: number;
  created_at: string;
  updated_at: string;
}

interface Props {
  pages: {
    data: Page[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  templates: Array<{ slug: string; name: string }>;
  languages: string[];
  authors: Array<{ id: number; name: string }>;
  filters: {
    search?: string;
    status?: string;
    template?: string;
    language?: string;
    author?: string;
  };
}

export default function PagesIndex({ pages, templates, languages, authors, filters }: Props) {
  const { t } = useTranslate();
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  const handleSearch = () => {
    router.get(route('cms.pages.index'), {
      ...filters,
      search: searchQuery,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFilter = (key: string, value: string) => {
    router.get(route('cms.pages.index'), {
      ...filters,
      [key]: value || undefined,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleBulkAction = (action: string) => {
    if (selectedPages.length === 0) return;

    router.post(route('cms.pages.bulk-action'), {
      action,
      page_ids: selectedPages,
    }, {
      onSuccess: () => {
        setSelectedPages([]);
      },
    });
  };

  const handlePageAction = (pageId: number, action: string) => {
    switch (action) {
      case 'edit':
        router.visit(route('cms.pages.edit', pageId));
        break;
      case 'view':
        router.visit(route('cms.pages.show', pageId));
        break;
      case 'preview':
        router.visit(route('cms.pages.preview', pageId));
        break;
      case 'duplicate':
        router.post(route('cms.pages.duplicate', pageId));
        break;
      case 'delete':
        if (confirm(t('cms.confirm_delete_page', 'Are you sure you want to delete this page?'))) {
          router.delete(route('cms.pages.destroy', pageId));
        }
        break;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      published: 'default',
      draft: 'secondary',
      scheduled: 'outline',
      archived: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <AppLayout>
      <Head title={t('cms.pages', 'Pages')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('cms.pages', 'Pages')}
            </h1>
            <p className="text-muted-foreground">
              {t('cms.pages_description', 'Manage your website pages and content')}
            </p>
          </div>
          <Button asChild>
            <Link href={route('cms.pages.create')}>
              <Plus className="h-4 w-4 mr-2" />
              {t('cms.create_page', 'Create Page')}
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {t('common.filters', 'Filters')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              <div className="lg:col-span-2">
                <div className="flex gap-2">
                  <Input
                    placeholder={t('cms.search_pages', 'Search pages...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button variant="outline" onClick={handleSearch}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Select value={filters.status || 'all'} onValueChange={(value) => handleFilter('status', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('cms.all_statuses', 'All statuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('cms.all_statuses', 'All statuses')}</SelectItem>
                  <SelectItem value="published">{t('cms.published', 'Published')}</SelectItem>
                  <SelectItem value="draft">{t('cms.draft', 'Draft')}</SelectItem>
                  <SelectItem value="scheduled">{t('cms.scheduled', 'Scheduled')}</SelectItem>
                  <SelectItem value="archived">{t('cms.archived', 'Archived')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.template || 'all'} onValueChange={(value) => handleFilter('template', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('cms.all_templates', 'All templates')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('cms.all_templates', 'All templates')}</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.slug} value={template.slug}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.language || 'all'} onValueChange={(value) => handleFilter('language', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('cms.all_languages', 'All languages')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('cms.all_languages', 'All languages')}</SelectItem>
                  {languages.map((language) => (
                    <SelectItem key={language} value={language}>
                      {language.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.author || 'all'} onValueChange={(value) => handleFilter('author', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('cms.all_authors', 'All authors')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('cms.all_authors', 'All authors')}</SelectItem>
                  {authors.map((author) => (
                    <SelectItem key={author.id} value={author.id.toString()}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedPages.length > 0 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedPages.length} {t('cms.pages_selected', 'pages selected')}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('publish')}>
                    <Globe className="h-4 w-4 mr-2" />
                    {t('cms.publish', 'Publish')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('unpublish')}>
                    <Clock className="h-4 w-4 mr-2" />
                    {t('cms.unpublish', 'Unpublish')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('archive')}>
                    <FileText className="h-4 w-4 mr-2" />
                    {t('cms.archive', 'Archive')}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleBulkAction('delete')}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('common.delete', 'Delete')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pages List */}
        <Card>
          <CardHeader>
            <CardTitle>{t('cms.pages_list', 'Pages List')}</CardTitle>
            <CardDescription>
              {pages.meta?.total || 0} {t('cms.total_pages', 'total pages')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pages.data.map((page) => (
                <div key={page.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Checkbox
                    checked={selectedPages.includes(page.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedPages(prev => [...prev, page.id]);
                      } else {
                        setSelectedPages(prev => prev.filter(id => id !== page.id));
                      }
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{page.title}</h3>
                      {getStatusBadge(page.status)}
                      <Badge variant="outline" className="text-xs">
                        {page.language.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {page.author.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(page.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {page.view_count} views
                      </span>
                      {page.parent && (
                        <span className="text-xs">
                          Parent: {page.parent.title}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground mt-1">
                      /{page.slug}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {page.status === 'scheduled' && page.scheduled_at && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(page.scheduled_at)}
                      </Badge>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePageAction(page.id, 'view')}>
                          <Eye className="h-4 w-4 mr-2" />
                          {t('common.view', 'View')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePageAction(page.id, 'edit')}>
                          <Edit className="h-4 w-4 mr-2" />
                          {t('common.edit', 'Edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePageAction(page.id, 'preview')}>
                          <Globe className="h-4 w-4 mr-2" />
                          {t('cms.preview', 'Preview')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handlePageAction(page.id, 'duplicate')}>
                          <Copy className="h-4 w-4 mr-2" />
                          {t('cms.duplicate', 'Duplicate')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handlePageAction(page.id, 'delete')}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {t('common.delete', 'Delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}

              {pages.data.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    {t('cms.no_pages_found', 'No pages found')}
                  </p>
                  <p className="text-sm">
                    {t('cms.create_first_page', 'Create your first page to get started')}
                  </p>
                  <Button asChild className="mt-4">
                    <Link href={route('cms.pages.create')}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('cms.create_page', 'Create Page')}
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pages.links && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {pages.from || 0} to {pages.to || 0} of {pages.total || 0} results
                </div>
                <div className="flex gap-2">
                  {pages.links.map((link: any, index: number) => (
                    <Button
                      key={index}
                      variant={link.active ? 'default' : 'outline'}
                      size="sm"
                      disabled={!link.url}
                      onClick={() => link.url && router.visit(link.url)}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
