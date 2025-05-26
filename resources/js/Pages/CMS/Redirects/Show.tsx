import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Label } from '@/Components/ui/label';
import { Separator } from '@/Components/ui/separator';
import {
  ArrowLeft,
  Edit,
  TestTube,
  Trash2,
  Link2,
  ExternalLink,
  BarChart3,
  Calendar,
  User,
  Activity,
  TrendingUp
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface Redirect {
  id: number;
  from_url: string;
  to_url: string;
  status_code: number;
  description?: string;
  is_active: boolean;
  hit_count: number;
  last_hit_at?: string;
  created_by: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

interface Stats {
  daily_hits: Array<{ date: string; hits: number }>;
  monthly_hits: number;
  average_daily_hits: number;
  peak_day: { date: string; hits: number };
}

interface RedirectChain {
  url: string;
  status_code: number;
  is_final: boolean;
}

interface Props {
  redirect: Redirect;
  stats: Stats;
  chain: RedirectChain[];
  statusCodes: Record<number, string>;
}

export default function RedirectShow({ redirect, stats, chain, statusCodes }: Props) {
  const { t } = useTranslate();
  const route = useRoute();

  const handleAction = (action: string) => {
    switch (action) {
      case 'edit':
        router.visit(route('cms.redirects.edit', redirect.id));
        break;
      case 'test':
        router.post(route('cms.redirects.test'), { 
          url: redirect.from_url 
        }, {
          onSuccess: () => {
            toast.success(t('cms.redirect_test_success', 'Redirect test completed successfully'));
          },
          onError: () => {
            toast.error(t('cms.redirect_test_failed', 'Redirect test failed'));
          }
        });
        break;
      case 'delete':
        if (confirm(t('cms.confirm_delete_redirect', 'Are you sure you want to delete this redirect?'))) {
          router.delete(route('cms.redirects.destroy', redirect.id), {
            onSuccess: () => {
              toast.success(t('cms.redirect_deleted', 'Redirect deleted successfully'));
              router.visit(route('cms.redirects.index'));
            }
          });
        }
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <AppLayout>
      <Head title={redirect.from_url} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.visit(route('cms.redirects.index'))}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back', 'Back')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {redirect.from_url}
              </h1>
              <p className="text-muted-foreground">
                {redirect.description || t('cms.no_description', 'No description provided')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleAction('test')}
            >
              <TestTube className="h-4 w-4 mr-2" />
              {t('cms.test', 'Test')}
            </Button>
            <Button
              onClick={() => handleAction('edit')}
            >
              <Edit className="h-4 w-4 mr-2" />
              {t('common.edit', 'Edit')}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Redirect Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-5 w-5" />
                  {t('cms.redirect_overview', 'Redirect Overview')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t('cms.from_url', 'From URL')}
                    </Label>
                    <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                      {redirect.from_url}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t('cms.to_url', 'To URL')}
                    </Label>
                    <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                      {redirect.to_url}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t('cms.status_code', 'Status Code')}
                    </Label>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {redirect.status_code} - {statusCodes[redirect.status_code]}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t('cms.status', 'Status')}
                    </Label>
                    <div className="mt-1">
                      <Badge variant={redirect.is_active ? 'default' : 'secondary'}>
                        {redirect.is_active ? t('cms.active', 'Active') : t('cms.inactive', 'Inactive')}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Redirect Preview */}
                <div className="p-4 bg-muted rounded-lg">
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t('cms.redirect_flow', 'Redirect Flow')}
                  </Label>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="font-medium">{redirect.from_url}</span>
                    <ExternalLink className="h-3 w-3" />
                    <span className="text-muted-foreground">→</span>
                    <span className="font-medium">{redirect.to_url}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    HTTP {redirect.status_code} - {statusCodes[redirect.status_code]}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Redirect Chain */}
            {chain.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('cms.redirect_chain', 'Redirect Chain')}</CardTitle>
                  <CardDescription>
                    {t('cms.redirect_chain_desc', 'Shows the complete redirect path')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {chain.map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-mono text-sm">{item.url}</p>
                          <p className="text-xs text-muted-foreground">
                            HTTP {item.status_code} {item.is_final ? '(Final)' : '(Redirect)'}
                          </p>
                        </div>
                        {index < chain.length - 1 && (
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Usage Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {t('cms.usage_statistics', 'Usage Statistics')}
                </CardTitle>
                <CardDescription>
                  {t('cms.redirect_performance', 'Redirect performance and usage data')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{redirect.hit_count}</div>
                    <div className="text-sm text-muted-foreground">{t('cms.total_hits', 'Total Hits')}</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{stats.monthly_hits}</div>
                    <div className="text-sm text-muted-foreground">{t('cms.monthly_hits', 'Monthly Hits')}</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{stats.average_daily_hits.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">{t('cms.avg_daily_hits', 'Avg Daily Hits')}</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{stats.peak_day.hits}</div>
                    <div className="text-sm text-muted-foreground">{t('cms.peak_day', 'Peak Day')}</div>
                  </div>
                </div>

                {/* Daily Hits Chart (Simple representation) */}
                {stats.daily_hits.length > 0 && (
                  <div className="mt-6">
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t('cms.daily_hits_trend', 'Daily Hits (Last 30 Days)')}
                    </Label>
                    <div className="mt-2 flex items-end gap-1 h-20">
                      {stats.daily_hits.slice(-30).map((day, index) => {
                        const maxHits = Math.max(...stats.daily_hits.map(d => d.hits));
                        const height = maxHits > 0 ? (day.hits / maxHits) * 100 : 0;
                        return (
                          <div
                            key={index}
                            className="bg-primary rounded-sm flex-1 min-w-0"
                            style={{ height: `${height}%` }}
                            title={`${day.date}: ${day.hits} hits`}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('cms.quick_actions', 'Quick Actions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAction('edit')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t('common.edit', 'Edit')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAction('test')}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {t('cms.test', 'Test')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href={redirect.from_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t('cms.visit_source', 'Visit Source')}
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <a href={redirect.to_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t('cms.visit_destination', 'Visit Destination')}
                  </a>
                </Button>
                <Separator />
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => handleAction('delete')}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('common.delete', 'Delete')}
                </Button>
              </CardContent>
            </Card>

            {/* Redirect Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('cms.redirect_information', 'Redirect Information')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('cms.created_by', 'Created by')}:</span>
                  <span>{redirect.created_by.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('cms.created_at', 'Created')}:</span>
                  <span>{formatDate(redirect.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('cms.updated_at', 'Updated')}:</span>
                  <span>{formatDate(redirect.updated_at)}</span>
                </div>
                {redirect.last_hit_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{t('cms.last_hit', 'Last Hit')}:</span>
                    <span>{formatDateTime(redirect.last_hit_at)}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Code Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('cms.status_code_info', 'Status Code Information')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <strong>{redirect.status_code} - {statusCodes[redirect.status_code]}</strong>
                </div>
                {redirect.status_code === 301 && (
                  <p className="text-muted-foreground">
                    {t('cms.status_301_desc', 'Permanent redirect. Search engines will transfer ranking to the new URL.')}
                  </p>
                )}
                {redirect.status_code === 302 && (
                  <p className="text-muted-foreground">
                    {t('cms.status_302_desc', 'Temporary redirect. Search engines will keep the original URL in their index.')}
                  </p>
                )}
                {redirect.status_code === 307 && (
                  <p className="text-muted-foreground">
                    {t('cms.status_307_desc', 'Temporary redirect that preserves the request method and body.')}
                  </p>
                )}
                {redirect.status_code === 308 && (
                  <p className="text-muted-foreground">
                    {t('cms.status_308_desc', 'Permanent redirect that preserves the request method and body.')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
