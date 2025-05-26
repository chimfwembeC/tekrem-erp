import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import {
  FileEdit,
  Image,
  Layout,
  BarChart3,
  Navigation,
  Search,
  Users,
  Globe,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Eye,
  Calendar,
  Activity
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';

interface Stats {
  pages: {
    total: number;
    published: number;
    draft: number;
    scheduled: number;
  };
  media: {
    total: number;
    total_size: number;
    images: number;
    documents: number;
  };
  templates: {
    total: number;
    active: number;
  };
  redirects: {
    total: number;
    active: number;
    total_hits: number;
  };
}

interface Activity {
  type: string;
  action: string;
  title: string;
  url: string;
  user: string;
  timestamp: string;
}

interface Analytics {
  pageViews: Array<{ date: string; views: number }>;
  topPages: Array<{ title: string; slug: string; views: number; url: string }>;
  contentByStatus: Record<string, number>;
  seoScores: Record<string, number>;
}

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  url: string;
  color: string;
}

interface Props {
  stats: Stats;
  recentActivity: Activity[];
  analytics: Analytics;
  quickActions: QuickAction[];
}

export default function CMSDashboard({ stats, recentActivity, analytics, quickActions }: Props) {
  const { t } = useTranslate();

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'draft': return 'bg-yellow-500';
      case 'scheduled': return 'bg-blue-500';
      case 'archived': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons = {
      FileEdit,
      Image,
      Layout,
      BarChart3,
      Navigation,
      Search,
    };
    const IconComponent = icons[iconName as keyof typeof icons] || FileEdit;
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <AppLayout>
      <Head title={t('cms.dashboard', 'CMS Dashboard')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('cms.dashboard', 'CMS Dashboard')}
            </h1>
            <p className="text-muted-foreground">
              {t('cms.dashboard_description', 'Manage your website content and monitor performance')}
            </p>
          </div>
          <Button asChild>
            <Link href="/cms/pages/create">
              <FileEdit className="h-4 w-4 mr-2" />
              {t('cms.create_page', 'Create Page')}
            </Link>
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('cms.pages', 'Pages')}</CardTitle>
              <FileEdit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pages.total}</div>
              <div className="flex gap-2 mt-2">
                <Badge variant="default" className="text-xs">
                  {stats.pages.published} {t('cms.published', 'Published')}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {stats.pages.draft} {t('cms.draft', 'Draft')}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('cms.media', 'Media')}</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.media.total}</div>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(stats.media.total_size)} {t('cms.total_size', 'total size')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('cms.templates', 'Templates')}</CardTitle>
              <Layout className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.templates.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.templates.active} {t('cms.active', 'active')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('cms.redirects', 'Redirects')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.redirects.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.redirects.total_hits} {t('cms.total_hits', 'total hits')}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t('cms.quick_actions', 'Quick Actions')}</CardTitle>
                <CardDescription>
                  {t('cms.quick_actions_description', 'Common tasks and shortcuts')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    asChild
                  >
                    <Link href={action.url}>
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-md bg-${action.color}-100 text-${action.color}-600`}>
                          {getIconComponent(action.icon)}
                        </div>
                        <div className="text-left">
                          <div className="font-medium">{action.title}</div>
                          <div className="text-sm text-muted-foreground">{action.description}</div>
                        </div>
                      </div>
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Content Analytics */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>{t('cms.content_overview', 'Content Overview')}</CardTitle>
                <CardDescription>
                  {t('cms.content_overview_description', 'Content distribution and performance')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Content by Status */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">{t('cms.content_by_status', 'Content by Status')}</h4>
                    <div className="space-y-2">
                      {Object.entries(analytics.contentByStatus).map(([status, count]) => (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                            <span className="text-sm capitalize">{status}</span>
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SEO Scores */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">{t('cms.seo_scores', 'SEO Scores')}</h4>
                    <div className="space-y-2">
                      {Object.entries(analytics.seoScores).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{category.replace('_', ' ')}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t('cms.recent_activity', 'Recent Activity')}
              </CardTitle>
              <CardDescription>
                {t('cms.recent_activity_description', 'Latest content changes and updates')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.slice(0, 8).map((activity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {activity.type === 'page' ? (
                        <FileEdit className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Image className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <Link href={activity.url} className="font-medium hover:underline">
                          {activity.title}
                        </Link>
                        <span className="text-muted-foreground"> was {activity.action}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {activity.user} • {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t('cms.no_recent_activity', 'No recent activity')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {t('cms.top_pages', 'Top Pages')}
              </CardTitle>
              <CardDescription>
                {t('cms.top_pages_description', 'Most viewed pages this month')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topPages.slice(0, 8).map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <Link href={page.url} className="text-sm font-medium hover:underline">
                        {page.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">/{page.slug}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {page.views}
                    </div>
                  </div>
                ))}
                {analytics.topPages.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t('cms.no_page_views', 'No page views yet')}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
