import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
  Edit,
  Eye,
  Globe,
  Copy,
  Trash2,
  MoreHorizontal,
  Calendar,
  User,
  Clock,
  FileText,
  Search,
  ExternalLink,
  History
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';

interface Page {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  template: string;
  layout?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  status: string;
  published_at?: string;
  scheduled_at?: string;
  language: string;
  is_homepage: boolean;
  show_in_menu: boolean;
  require_auth: boolean;
  view_count: number;
  author: {
    id: number;
    name: string;
  };
  parent?: {
    id: number;
    title: string;
  };
  children?: Array<{
    id: number;
    title: string;
    slug: string;
  }>;
  revisions?: Array<{
    id: number;
    revision_number: number;
    created_by: {
      id: number;
      name: string;
    };
    created_at: string;
    revision_notes?: string;
  }>;
  seo_analysis?: {
    score: number;
    issues: Array<{
      type: string;
      message: string;
    }>;
  };
  created_at: string;
  updated_at: string;
}

interface Props {
  page: Page;
}

export default function ShowPage({ page }: Props) {
  const { t } = useTranslate();

  const handleAction = (action: string) => {
    switch (action) {
      case 'edit':
        router.visit(route('cms.pages.edit', page.id));
        break;
      case 'preview':
        window.open(route('cms.pages.preview', page.id), '_blank');
        break;
      case 'duplicate':
        router.post(route('cms.pages.duplicate', page.id));
        break;
      case 'delete':
        if (confirm(t('cms.confirm_delete_page', 'Are you sure you want to delete this page?'))) {
          router.delete(route('cms.pages.destroy', page.id));
        }
        break;
      case 'publish':
        router.post(route('cms.pages.publish', page.id));
        break;
      case 'unpublish':
        router.post(route('cms.pages.unpublish', page.id));
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

  const getSEOScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <AppLayout>
      <Head title={page.title} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold tracking-tight">{page.title}</h1>
              {getStatusBadge(page.status)}
              <Badge variant="outline" className="text-xs">
                {page.language.toUpperCase()}
              </Badge>
              {page.is_homepage && (
                <Badge variant="outline" className="text-xs">
                  Homepage
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">/{page.slug}</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleAction('preview')}>
              <Eye className="h-4 w-4 mr-2" />
              {t('cms.preview', 'Preview')}
            </Button>
            <Button onClick={() => handleAction('edit')}>
              <Edit className="h-4 w-4 mr-2" />
              {t('common.edit', 'Edit')}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleAction('duplicate')}>
                  <Copy className="h-4 w-4 mr-2" />
                  {t('cms.duplicate', 'Duplicate')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {page.status === 'published' ? (
                  <DropdownMenuItem onClick={() => handleAction('unpublish')}>
                    <Clock className="h-4 w-4 mr-2" />
                    {t('cms.unpublish', 'Unpublish')}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => handleAction('publish')}>
                    <Globe className="h-4 w-4 mr-2" />
                    {t('cms.publish', 'Publish')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleAction('delete')}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('common.delete', 'Delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Page Content */}
            <Card>
              <CardHeader>
                <CardTitle>{t('cms.page_content', 'Page Content')}</CardTitle>
              </CardHeader>
              <CardContent>
                {page.excerpt && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">{t('cms.excerpt', 'Excerpt')}</h4>
                    <p className="text-muted-foreground">{page.excerpt}</p>
                  </div>
                )}
                <div className="prose prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: page.content }} />
                </div>
              </CardContent>
            </Card>

            {/* SEO Analysis */}
            {page.seo_analysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    {t('cms.seo_analysis', 'SEO Analysis')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getSEOScoreColor(page.seo_analysis.score)}`}>
                        {page.seo_analysis.score}/100
                      </div>
                      <div className="text-sm text-muted-foreground">SEO Score</div>
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${page.seo_analysis.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {page.seo_analysis.issues.slice(0, 5).map((issue, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {issue.type === 'success' ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        ) : issue.type === 'warning' ? (
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        ) : (
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                        )}
                        <span>{issue.message}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Child Pages */}
            {page.children && page.children.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('cms.child_pages', 'Child Pages')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {page.children.map((child) => (
                      <div key={child.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <Link 
                            href={route('cms.pages.show', child.id)}
                            className="font-medium hover:underline"
                          >
                            {child.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">/{child.slug}</p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={route('cms.pages.show', child.id)}>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Page Details */}
            <Card>
              <CardHeader>
                <CardTitle>{t('cms.page_details', 'Page Details')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{page.author.name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(page.created_at)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{formatDate(page.updated_at)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{page.view_count} views</span>
                </div>

                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{page.template}</span>
                </div>

                {page.parent && (
                  <div>
                    <Separator className="my-2" />
                    <div className="text-sm">
                      <span className="text-muted-foreground">Parent: </span>
                      <Link 
                        href={route('cms.pages.show', page.parent.id)}
                        className="hover:underline"
                      >
                        {page.parent.title}
                      </Link>
                    </div>
                  </div>
                )}

                {page.scheduled_at && (
                  <div>
                    <Separator className="my-2" />
                    <div className="text-sm">
                      <span className="text-muted-foreground">Scheduled: </span>
                      <span>{formatDate(page.scheduled_at)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Page Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{t('cms.page_settings', 'Page Settings')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('cms.show_in_menu', 'Show in menu')}</span>
                  <Badge variant={page.show_in_menu ? 'default' : 'secondary'}>
                    {page.show_in_menu ? 'Yes' : 'No'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('cms.require_authentication', 'Require auth')}</span>
                  <Badge variant={page.require_auth ? 'default' : 'secondary'}>
                    {page.require_auth ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Revisions */}
            {page.revisions && page.revisions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    {t('cms.revisions', 'Revisions')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {page.revisions.slice(0, 5).map((revision) => (
                      <div key={revision.id} className="flex items-center justify-between text-sm">
                        <div>
                          <div className="font-medium">v{revision.revision_number}</div>
                          <div className="text-muted-foreground">
                            by {revision.created_by.name}
                          </div>
                        </div>
                        <div className="text-muted-foreground">
                          {formatDate(revision.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
