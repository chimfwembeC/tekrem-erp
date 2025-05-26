import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  FileText,
  Image,
  Users,
  Clock,
  Search,
  Download,
  Calendar,
  Globe,
  Link2
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';

interface Analytics {
  overview: {
    total_pages: number;
    published_pages: number;
    total_views: number;
    total_media: number;
    media_size: number;
    active_redirects: number;
    redirect_hits: number;
    new_pages: number;
    updated_pages: number;
  };
  content: {
    by_status: Record<string, number>;
    by_template: Record<string, number>;
    by_language: Record<string, number>;
    creation_timeline: Array<{ date: string; count: number }>;
  };
  performance: {
    top_pages: Array<{
      title: string;
      slug: string;
      views: number;
      last_updated: string;
    }>;
    pages_without_views: number;
    avg_content_length: number;
    page_load_times: {
      average: number;
      median: number;
      p95: number;
      p99: number;
    };
  };
  seo: {
    issues: Record<string, number>;
    score_distribution: Record<string, number>;
    average_score: number;
  };
  traffic: {
    redirects: {
      total_redirects: number;
      active_redirects: number;
      total_hits: number;
      top_redirects: Array<{
        from_url: string;
        to_url: string;
        hit_count: number;
      }>;
    };
    sources: Record<string, number>;
  };
  media: {
    by_type: Record<string, number>;
    storage: {
      total_files: number;
      total_size: number;
      average_size: number;
      largest_files: Array<{
        name: string;
        file_size: number;
        mime_type: string;
      }>;
    };
    unused_count: number;
  };
}

interface Props {
  analytics: Analytics;
  dateRange: {
    start: string;
    end: string;
    period: string;
  };
}

export default function AnalyticsIndex({ analytics, dateRange }: Props) {
  const { t } = useTranslate();
  const [selectedPeriod, setSelectedPeriod] = useState(dateRange.period);

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    router.get(route('cms.analytics'), { period }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleExport = (format: string) => {
    window.open(route('cms.analytics.export', { format, period: selectedPeriod }), '_blank');
  };

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

  const getSEOScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <AppLayout>
      <Head title={t('cms.analytics', 'CMS Analytics')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('cms.analytics', 'CMS Analytics')}
            </h1>
            <p className="text-muted-foreground">
              {t('cms.analytics_description', 'View content performance and statistics')}
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">{t('cms.last_7_days', 'Last 7 days')}</SelectItem>
                <SelectItem value="30d">{t('cms.last_30_days', 'Last 30 days')}</SelectItem>
                <SelectItem value="90d">{t('cms.last_90_days', 'Last 90 days')}</SelectItem>
                <SelectItem value="1y">{t('cms.last_year', 'Last year')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => handleExport('csv')}>
              <Download className="h-4 w-4 mr-2" />
              {t('cms.export_csv', 'Export CSV')}
            </Button>
            <Button variant="outline" onClick={() => handleExport('json')}>
              <Download className="h-4 w-4 mr-2" />
              {t('cms.export_json', 'Export JSON')}
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('cms.total_pages', 'Total Pages')}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.total_pages}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{analytics.overview.new_pages}</span> new this period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('cms.total_views', 'Total Views')}</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.total_views.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.overview.published_pages} published pages
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('cms.media_files', 'Media Files')}</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.total_media}</div>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(analytics.overview.media_size)} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('cms.redirects', 'Redirects')}</CardTitle>
              <Link2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.active_redirects}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.overview.redirect_hits} total hits
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Content Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>{t('cms.content_distribution', 'Content Distribution')}</CardTitle>
              <CardDescription>
                {t('cms.content_by_status_description', 'Content breakdown by status')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analytics.content.by_status).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
                      <span className="text-sm capitalize">{status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getStatusColor(status)}`}
                          style={{ 
                            width: `${(count / analytics.overview.total_pages) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SEO Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                {t('cms.seo_overview', 'SEO Overview')}
              </CardTitle>
              <CardDescription>
                {t('cms.seo_score_distribution', 'SEO score distribution across pages')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getSEOScoreColor(analytics.seo.average_score)}`}>
                    {analytics.seo.average_score}/100
                  </div>
                  <div className="text-sm text-muted-foreground">Average SEO Score</div>
                </div>
                
                <div className="space-y-2">
                  {Object.entries(analytics.seo.score_distribution).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{category.replace('_', ' ')}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Top Pages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {t('cms.top_pages', 'Top Pages')}
              </CardTitle>
              <CardDescription>
                {t('cms.most_viewed_pages', 'Most viewed pages')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.performance.top_pages.slice(0, 8).map((page, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{page.title}</p>
                      <p className="text-xs text-muted-foreground">/{page.slug}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      {page.views}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SEO Issues */}
          <Card>
            <CardHeader>
              <CardTitle>{t('cms.seo_issues', 'SEO Issues')}</CardTitle>
              <CardDescription>
                {t('cms.common_seo_problems', 'Common SEO problems found')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.seo.issues).map(([issue, count]) => (
                  <div key={issue} className="flex items-center justify-between">
                    <span className="text-sm">{issue.replace('_', ' ')}</span>
                    <Badge variant={count > 0 ? 'destructive' : 'secondary'}>
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Media Usage */}
          <Card>
            <CardHeader>
              <CardTitle>{t('cms.media_usage', 'Media Usage')}</CardTitle>
              <CardDescription>
                {t('cms.media_breakdown', 'Media files breakdown')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{analytics.media.storage.total_files}</div>
                    <div className="text-xs text-muted-foreground">Total Files</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{analytics.media.unused_count}</div>
                    <div className="text-xs text-muted-foreground">Unused</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {Object.entries(analytics.media.by_type).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{type}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-2 border-t">
                  <div className="text-sm text-muted-foreground">
                    Total Size: {formatFileSize(analytics.media.storage.total_size)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {t('cms.performance_metrics', 'Performance Metrics')}
            </CardTitle>
            <CardDescription>
              {t('cms.page_load_performance', 'Page load performance statistics')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{analytics.performance.page_load_times.average}s</div>
                <div className="text-sm text-muted-foreground">Average Load Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{analytics.performance.page_load_times.median}s</div>
                <div className="text-sm text-muted-foreground">Median Load Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{analytics.performance.page_load_times.p95}s</div>
                <div className="text-sm text-muted-foreground">95th Percentile</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{analytics.performance.avg_content_length}</div>
                <div className="text-sm text-muted-foreground">Avg Content Length</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('cms.traffic_sources', 'Traffic Sources')}</CardTitle>
              <CardDescription>
                {t('cms.traffic_breakdown', 'Traffic source breakdown')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analytics.traffic.sources).map(([source, percentage]) => (
                  <div key={source} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{source}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('cms.top_redirects', 'Top Redirects')}</CardTitle>
              <CardDescription>
                {t('cms.most_used_redirects', 'Most frequently used redirects')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.traffic.redirects.top_redirects.slice(0, 5).map((redirect, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{redirect.from_url}</span>
                      <Badge variant="outline">{redirect.hit_count} hits</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      → {redirect.to_url}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
