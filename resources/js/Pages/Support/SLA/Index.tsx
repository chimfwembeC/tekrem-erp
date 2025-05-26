import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import {
  Clock,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Target,
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface SLA {
  id: number;
  name: string;
  description?: string;
  response_time_hours: number;
  resolution_time_hours: number;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  tickets_count: number;
  compliance_percentage: number;
  avg_response_time: number;
  avg_resolution_time: number;
}

interface PaginatedSLAs {
  data: SLA[];
  links: any;
  meta?: any;
}

interface Props {
  slas: PaginatedSLAs;
  filters: {
    search?: string;
    active?: string;
  };
}

export default function Index({ slas, filters }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('support.sla.index'), {
      ...filters,
      search: searchTerm,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get(route('support.sla.index'), {
      ...filters,
      [key]: value === 'all' ? '' : value,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const formatTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}m`;
    } else if (hours < 24) {
      return `${hours}h`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
  };

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 95) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceBadge = (percentage: number) => {
    if (percentage >= 95) return 'bg-green-100 text-green-800';
    if (percentage >= 80) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <AppLayout>
      <Head title={t('support.sla_policies', 'SLA Policies')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('support.sla_policies', 'SLA Policies')}</h1>
            <p className="text-muted-foreground">
              {t('support.sla_policies_description', 'Manage service level agreements and performance targets')}
            </p>
          </div>
          <Button asChild>
            <Link href={route('support.sla.create')}>
              <Plus className="h-4 w-4 mr-2" />
              {t('support.create_sla', 'Create SLA Policy')}
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              {t('common.filters', 'Filters')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder={t('common.search', 'Search SLA policies...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              <Select value={filters.active || 'all'} onValueChange={(value) => handleFilterChange('active', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('support.status', 'Status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                  <SelectItem value="true">{t('support.active', 'Active')}</SelectItem>
                  <SelectItem value="false">{t('support.inactive', 'Inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* SLA Policies Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {slas.data.map((sla) => (
            <Card key={sla.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={sla.is_active ? 'default' : 'secondary'}>
                        {sla.is_active ? t('support.active', 'Active') : t('support.inactive', 'Inactive')}
                      </Badge>
                      {sla.is_default && (
                        <Badge variant="outline">
                          <Target className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">
                      <Link
                        href={route('support.sla.show', sla.id)}
                        className="hover:text-primary"
                      >
                        {sla.name}
                      </Link>
                    </CardTitle>
                    {sla.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {sla.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* SLA Times */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t('support.response_time', 'Response Time')}</span>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        <span className="font-medium">{formatTime(sla.response_time_hours)}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('support.resolution_time', 'Resolution Time')}</span>
                      <div className="flex items-center gap-1 mt-1">
                        <Target className="h-3 w-3" />
                        <span className="font-medium">{formatTime(sla.resolution_time_hours)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{t('support.compliance', 'Compliance')}</span>
                      <Badge className={getComplianceBadge(sla.compliance_percentage)} variant="secondary">
                        {sla.compliance_percentage.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          sla.compliance_percentage >= 95 ? 'bg-green-500' :
                          sla.compliance_percentage >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${sla.compliance_percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t('support.tickets', 'Tickets')}</span>
                      <div className="font-medium">{sla.tickets_count}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('support.avg_response', 'Avg Response')}</span>
                      <div className="font-medium">{formatTime(sla.avg_response_time)}</div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>{t('support.created', 'Created')}</span>
                      <span>{new Date(sla.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={route('support.sla.show', sla.id)}>
                        <Eye className="h-3 w-3 mr-1" />
                        {t('common.view', 'View')}
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={route('support.sla.edit', sla.id)}>
                        <Edit className="h-3 w-3 mr-1" />
                        {t('common.edit', 'Edit')}
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {slas.data.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Clock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('support.no_sla_policies', 'No SLA policies found')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('support.no_sla_policies_description', 'Get started by creating your first SLA policy.')}
              </p>
              <Button asChild>
                <Link href={route('support.sla.create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('support.create_sla', 'Create SLA Policy')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {slas.data.length > 0 && slas.meta && (
          <div className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Showing {slas.data.length} of {slas.meta.total || slas.data.length} SLA policies
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
