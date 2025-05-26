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
  Trash2,
  Link2,
  TrendingUp,
  Download,
  Upload,
  TestTube,
  BarChart3
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';

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

interface Props {
  redirects: {
    data: Redirect[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  statusCodes: Record<number, string>;
  filters: {
    search?: string;
    status_code?: string;
    status?: string;
    usage?: string;
  };
}

export default function RedirectsIndex({ redirects, statusCodes, filters }: Props) {
  const { t } = useTranslate();
  const [selectedRedirects, setSelectedRedirects] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  const handleSearch = () => {
    router.get(route('cms.redirects.index'), {
      ...filters,
      search: searchQuery,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFilter = (key: string, value: string) => {
    router.get(route('cms.redirects.index'), {
      ...filters,
      [key]: value || undefined,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleBulkAction = (action: string) => {
    if (selectedRedirects.length === 0) return;

    router.post(route('cms.redirects.bulk-action'), {
      action,
      redirect_ids: selectedRedirects,
    }, {
      onSuccess: () => {
        setSelectedRedirects([]);
      },
    });
  };

  const handleRedirectAction = (redirectId: number, action: string) => {
    switch (action) {
      case 'edit':
        router.visit(route('cms.redirects.edit', redirectId));
        break;
      case 'view':
        router.visit(route('cms.redirects.show', redirectId));
        break;
      case 'test':
        router.post(route('cms.redirects.test'), {
          url: redirects.data.find(r => r.id === redirectId)?.from_url
        });
        break;
      case 'delete':
        if (confirm(t('cms.confirm_delete_redirect', 'Are you sure you want to delete this redirect?'))) {
          router.delete(route('cms.redirects.destroy', redirectId));
        }
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusCodeBadge = (code: number) => {
    const isPermanent = [301, 308].includes(code);
    return (
      <Badge variant={isPermanent ? 'default' : 'secondary'}>
        {code}
      </Badge>
    );
  };

  return (
    <AppLayout>
      <Head title={t('cms.redirects', 'Redirects')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('cms.redirects', 'Redirects')}
            </h1>
            <p className="text-muted-foreground">
              {t('cms.redirects_description', 'Manage URL redirects and aliases')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.visit(route('cms.redirects.statistics'))}>
              <BarChart3 className="h-4 w-4 mr-2" />
              {t('cms.statistics', 'Statistics')}
            </Button>
            <Button variant="outline" asChild>
              <label htmlFor="import-redirects" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                {t('cms.import_redirects', 'Import CSV')}
              </label>
            </Button>
            <input
              id="import-redirects"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  const formData = new FormData();
                  formData.append('csv_file', e.target.files[0]);
                  formData.append('has_headers', 'true');
                  router.post(route('cms.redirects.import'), formData);
                }
              }}
            />
            <Button variant="outline" onClick={() => window.open(route('cms.redirects.export'), '_blank')}>
              <Download className="h-4 w-4 mr-2" />
              {t('cms.export_csv', 'Export CSV')}
            </Button>
            <Button asChild>
              <Link href={route('cms.redirects.create')}>
                <Plus className="h-4 w-4 mr-2" />
                {t('cms.create_redirect', 'Create Redirect')}
              </Link>
            </Button>
          </div>
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <div className="flex gap-2">
                  <Input
                    placeholder={t('cms.search_redirects', 'Search redirects...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button variant="outline" onClick={handleSearch}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Select value={filters.status_code || 'all'} onValueChange={(value) => handleFilter('status_code', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('cms.all_status_codes', 'All codes')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('cms.all_status_codes', 'All codes')}</SelectItem>
                  {Object.entries(statusCodes).map(([code, description]) => (
                    <SelectItem key={code} value={code}>
                      {code} - {description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filters.status || 'all'} onValueChange={(value) => handleFilter('status', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('cms.all_statuses', 'All statuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('cms.all_statuses', 'All statuses')}</SelectItem>
                  <SelectItem value="active">{t('cms.active', 'Active')}</SelectItem>
                  <SelectItem value="inactive">{t('cms.inactive', 'Inactive')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.usage || 'all'} onValueChange={(value) => handleFilter('usage', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('cms.all_usage', 'All usage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('cms.all_usage', 'All usage')}</SelectItem>
                  <SelectItem value="used">{t('cms.used', 'Used')}</SelectItem>
                  <SelectItem value="unused">{t('cms.unused', 'Unused')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedRedirects.length > 0 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedRedirects.length} {t('cms.redirects_selected', 'redirects selected')}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>
                    <Link2 className="h-4 w-4 mr-2" />
                    {t('cms.activate', 'Activate')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('deactivate')}>
                    <Link2 className="h-4 w-4 mr-2" />
                    {t('cms.deactivate', 'Deactivate')}
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

        {/* Redirects List */}
        <Card>
          <CardHeader>
            <CardTitle>{t('cms.redirects_list', 'Redirects List')}</CardTitle>
            <CardDescription>
              {redirects.total || 0} {t('cms.total_redirects', 'total redirects')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {redirects.data.map((redirect) => (
                <div key={redirect.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Checkbox
                    checked={selectedRedirects.includes(redirect.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedRedirects(prev => [...prev, redirect.id]);
                      } else {
                        setSelectedRedirects(prev => prev.filter(id => id !== redirect.id));
                      }
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusCodeBadge(redirect.status_code)}
                      <Badge variant={redirect.is_active ? 'default' : 'secondary'}>
                        {redirect.is_active ? t('cms.active', 'Active') : t('cms.inactive', 'Inactive')}
                      </Badge>
                      {redirect.hit_count > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {redirect.hit_count} hits
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">From:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">{redirect.from_url}</code>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">To:</span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">{redirect.to_url}</code>
                      </div>
                      {redirect.description && (
                        <div className="text-sm text-muted-foreground">
                          {redirect.description}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span>Created by {redirect.created_by.name}</span>
                      <span>{formatDate(redirect.created_at)}</span>
                      {redirect.last_hit_at && (
                        <span>Last hit: {formatDate(redirect.last_hit_at)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRedirectAction(redirect.id, 'test')}
                    >
                      <TestTube className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleRedirectAction(redirect.id, 'view')}>
                          <Eye className="h-4 w-4 mr-2" />
                          {t('common.view', 'View')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRedirectAction(redirect.id, 'edit')}>
                          <Edit className="h-4 w-4 mr-2" />
                          {t('common.edit', 'Edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRedirectAction(redirect.id, 'test')}>
                          <TestTube className="h-4 w-4 mr-2" />
                          {t('cms.test_redirect', 'Test Redirect')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleRedirectAction(redirect.id, 'delete')}
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

              {redirects.data.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    {t('cms.no_redirects_found', 'No redirects found')}
                  </p>
                  <p className="text-sm">
                    {t('cms.create_first_redirect', 'Create your first redirect to get started')}
                  </p>
                  <Button asChild className="mt-4">
                    <Link href={route('cms.redirects.create')}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('cms.create_redirect', 'Create Redirect')}
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {redirects.links && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {redirects.from || 0} to {redirects.to || 0} of {redirects.total || 0} results
                </div>
                <div className="flex gap-2">
                  {redirects.links.map((link: any, index: number) => (
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
