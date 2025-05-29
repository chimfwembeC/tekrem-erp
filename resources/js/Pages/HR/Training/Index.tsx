import React from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  Award,
  AlertTriangle
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Training {
  id: number;
  title: string;
  description: string;
  type: string;
  category: string | null;
  instructor: {
    name: string;
  } | null;
  provider: string | null;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  mode: string;
  max_participants: number | null;
  enrolled_count: number;
  cost_per_participant: number | null;
  currency: string;
  status: string;
  is_mandatory: boolean;
  requires_certification: boolean;
  enrollments_count: number;
}

interface TrainingIndexProps {
  trainings: {
    data: Training[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  categories: string[];
  filters: {
    search?: string;
    status?: string;
    type?: string;
    category?: string;
    is_mandatory?: boolean;
  };
}

export default function Index({ trainings, categories, filters }: TrainingIndexProps) {
  const { t } = useTranslate();
  const route = useRoute();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const search = formData.get('search') as string;

    router.get(route('hr.training.index'), {
      ...filters,
      search: search || undefined,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get(route('hr.training.index'), {
      ...filters,
      [key]: value === 'all' ? undefined : value,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'internal':
        return 'bg-blue-100 text-blue-800';
      case 'external':
        return 'bg-purple-100 text-purple-800';
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'certification':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'in_person':
        return <MapPin className="h-3 w-3" />;
      case 'online':
        return <GraduationCap className="h-3 w-3" />;
      case 'hybrid':
        return <Users className="h-3 w-3" />;
      default:
        return <MapPin className="h-3 w-3" />;
    }
  };

  const formatCurrency = (amount: number | null, currency: string) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  return (
    <AppLayout
      title={t('hr.training_programs', 'Training Programs')}
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          {t('hr.training_programs', 'Training Programs')}
        </h2>
      )}
    >
      <Head title={t('hr.training_programs', 'Training Programs')} />

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    {t('hr.training_programs', 'Training Programs')}
                  </CardTitle>
                  <CardDescription>
                    {t('hr.manage_training_programs_description', 'Manage employee training and development programs')}
                  </CardDescription>
                </div>
                <Link href={route('hr.training.create')}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('hr.create_training', 'Create Training')}
                  </Button>
                </Link>
              </div>
            </CardHeader>

            <CardContent>
              {/* Filters */}
              <div className="mb-6 space-y-4">
                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      name="search"
                      placeholder={t('hr.search_training_programs', 'Search training programs...')}
                      defaultValue={filters.search || ''}
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>

                {/* Filter Controls */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{t('common.filters', 'Filters')}:</span>
                  </div>

                  <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t('hr.select_status', 'Select Status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_statuses', 'All Statuses')}</SelectItem>
                      <SelectItem value="scheduled">{t('hr.scheduled', 'Scheduled')}</SelectItem>
                      <SelectItem value="ongoing">{t('hr.ongoing', 'Ongoing')}</SelectItem>
                      <SelectItem value="completed">{t('hr.completed', 'Completed')}</SelectItem>
                      <SelectItem value="cancelled">{t('hr.cancelled', 'Cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.type || 'all'}
                    onValueChange={(value) => handleFilterChange('type', value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t('hr.select_type', 'Select Type')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_types', 'All Types')}</SelectItem>
                      <SelectItem value="internal">{t('hr.internal', 'Internal')}</SelectItem>
                      <SelectItem value="external">{t('hr.external', 'External')}</SelectItem>
                      <SelectItem value="online">{t('hr.online', 'Online')}</SelectItem>
                      <SelectItem value="certification">{t('hr.certification', 'Certification')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.category || 'all'}
                    onValueChange={(value) => handleFilterChange('category', value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t('hr.select_category', 'Select Category')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_categories', 'All Categories')}</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.is_mandatory?.toString() || 'all'}
                    onValueChange={(value) => handleFilterChange('is_mandatory', value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t('hr.select_mandatory', 'Select Mandatory')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                      <SelectItem value="true">{t('hr.mandatory', 'Mandatory')}</SelectItem>
                      <SelectItem value="false">{t('hr.optional', 'Optional')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Training Programs Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('hr.title', 'Title')}</TableHead>
                      <TableHead>{t('hr.instructor', 'Instructor')}</TableHead>
                      <TableHead>{t('hr.dates', 'Dates')}</TableHead>
                      <TableHead>{t('hr.participants', 'Participants')}</TableHead>
                      <TableHead>{t('hr.cost', 'Cost')}</TableHead>
                      <TableHead>{t('hr.status', 'Status')}</TableHead>
                      <TableHead>{t('hr.type', 'Type')}</TableHead>
                      <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainings.data.map((training) => (
                      <TableRow key={training.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {training.title}
                              {training.is_mandatory && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Mandatory
                                </Badge>
                              )}
                              {training.requires_certification && (
                                <Badge variant="secondary" className="text-xs">
                                  <Award className="h-3 w-3 mr-1" />
                                  Cert
                                </Badge>
                              )}
                            </div>
                            {training.category && (
                              <div className="text-sm text-gray-500">{training.category}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {training.instructor?.name || training.provider || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              {training.start_date}
                            </div>
                            {training.start_date !== training.end_date && (
                              <div className="text-gray-500">to {training.end_date}</div>
                            )}
                            {training.start_time && (
                              <div className="text-gray-500 text-xs">
                                {training.start_time} - {training.end_time}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-gray-400" />
                              {training.enrollments_count}
                              {training.max_participants && ` / ${training.max_participants}`}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              {getModeIcon(training.mode)}
                              {training.mode.replace('_', ' ')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatCurrency(training.cost_per_participant, training.currency)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(training.status)}>
                            {training.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(training.type)}>
                            {training.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={route('hr.training.show', training.id)}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={route('hr.training.edit', training.id)}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {trainings.data.length === 0 && (
                  <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('hr.no_training_programs', 'No training programs found')}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {t('hr.no_training_programs_description', 'No training programs match your current filters.')}
                    </p>
                    <Link href={route('hr.training.create')}>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('hr.create_training', 'Create Training')}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {trainings.last_page > 1 && (
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {trainings.from} to {trainings.to} of {trainings.total} training programs
                  </div>
                  <div className="flex gap-1">
                    {trainings.links.map((link, i) => {
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
