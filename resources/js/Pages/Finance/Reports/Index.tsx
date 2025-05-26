import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Download,
  Calendar,
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Report {
  id: number;
  name: string;
  description?: string;
  type: string;
  status: string;
  parameters?: any;
  generated_at?: string;
  file_path?: string;
  file_size?: number;
  created_by?: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

interface Props {
  reports: {
    data: Report[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  filters: {
    search?: string;
    type?: string;
    status?: string;
  };
  types: Record<string, string>;
  statuses: Record<string, string>;
}

export default function Index({ reports, filters, types, statuses }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [search, setSearch] = useState(filters.search || '');
  const [selectedType, setSelectedType] = useState(filters.type || 'all');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');

  const handleSearch = () => {
    router.get(route('finance.reports.index'), {
      search,
      type: selectedType === 'all' ? '' : selectedType,
      status: selectedStatus === 'all' ? '' : selectedStatus,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleReset = () => {
    setSearch('');
    setSelectedType('all');
    setSelectedStatus('all');
    router.get(route('finance.reports.index'), {}, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm(t('common.confirm_delete', 'Are you sure you want to delete this item?'))) {
      router.delete(route('finance.reports.destroy', id));
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout title={t('finance.reports', 'Reports')}>
      <Head title={t('finance.reports', 'Reports')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <CardTitle>{t('finance.reports', 'Reports')}</CardTitle>
                <CardDescription>
                  {t('finance.reports_description', 'Generate and manage financial reports')}
                </CardDescription>
              </div>
              <Link href={route('finance.reports.create')}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('finance.create_report', 'Create Report')}
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2 flex-1">
                  <Input
                    type="text"
                    placeholder={t('finance.search_reports', 'Search reports...')}
                    value={search}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button type="submit" variant="secondary">{t('common.search', 'Search')}</Button>
                </form>

                <div className="flex gap-2">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t('common.all_types', 'All types')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_types', 'All types')}</SelectItem>
                      {types && Object.entries(types).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t('common.all_statuses', 'All statuses')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_statuses', 'All statuses')}</SelectItem>
                      {statuses && Object.entries(statuses).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={handleReset}>
                    {t('common.reset', 'Reset')}
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">{t('common.name', 'Name')}</th>
                      <th className="text-left p-2">{t('common.type', 'Type')}</th>
                      <th className="text-left p-2">{t('common.status', 'Status')}</th>
                      <th className="text-left p-2">{t('finance.generated_at', 'Generated')}</th>
                      <th className="text-left p-2">{t('finance.file_size', 'Size')}</th>
                      <th className="text-left p-2">{t('finance.created_by', 'Created By')}</th>
                      <th className="text-left p-2">{t('common.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.data.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <BarChart3 className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              {t('finance.no_reports', 'No reports found')}
                            </p>
                            <Button asChild variant="outline">
                              <Link href={route('finance.reports.create')}>
                                {t('finance.create_first_report', 'Create your first report')}
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      reports.data.map((report) => (
                        <tr key={report.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div>
                              <p className="font-medium">{report.name}</p>
                              {report.description && (
                                <p className="text-xs text-muted-foreground">{report.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge variant="secondary">
                              {types[report.type] || report.type}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <Badge className={getStatusColor(report.status)} variant="secondary">
                              {statuses[report.status] || report.status}
                            </Badge>
                          </td>
                          <td className="p-2">
                            {report.generated_at ? (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {new Date(report.generated_at).toLocaleDateString()}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-2">
                            <span className="text-sm">{formatFileSize(report.file_size)}</span>
                          </td>
                          <td className="p-2">
                            <span className="text-sm">{report.created_by?.name || '-'}</span>
                          </td>
                          <td className="p-2 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={route('finance.reports.show', report.id)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    {t('common.view', 'View')}
                                  </Link>
                                </DropdownMenuItem>
                                {report.file_path && (
                                  <DropdownMenuItem asChild>
                                    <Link href={route('finance.reports.download', report.id)}>
                                      <Download className="mr-2 h-4 w-4" />
                                      {t('finance.download', 'Download')}
                                    </Link>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild>
                                  <Link href={route('finance.reports.edit', report.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    {t('common.edit', 'Edit')}
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(report.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t('common.delete', 'Delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {reports.last_page > 1 && (
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('common.showing_results', 'Showing {{from}} to {{to}} of {{total}} results', {
                      from: reports.from,
                      to: reports.to,
                      total: reports.total,
                    })}
                  </div>
                  <div className="flex gap-1">
                    {reports.links.map((link, i) => {
                      if (link.url === null) {
                        return (
                          <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            disabled
                            dangerouslySetInnerHTML={{ __html: link.label }}
                          />
                        );
                      }

                      return (
                        <Link key={i} href={link.url}>
                          <Button
                            variant={link.active ? "default" : "outline"}
                            size="sm"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
