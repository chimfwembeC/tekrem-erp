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
  TrendingUp,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Performance {
  id: number;
  employee: {
    user: {
      name: string;
    };
  };
  reviewer: {
    name: string;
  };
  review_period: string;
  review_start_date: string;
  review_end_date: string;
  due_date: string;
  status: string;
  overall_rating: number | null;
  is_self_review: boolean;
  submitted_at: string | null;
  completed_at: string | null;
}

interface Employee {
  id: number;
  name: string;
}

interface Reviewer {
  id: number;
  name: string;
}

interface PerformanceIndexProps {
  performances: {
    data: Performance[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  employees: Employee[];
  reviewers: Reviewer[];
  filters: {
    search?: string;
    status?: string;
    employee_id?: string;
    reviewer_id?: string;
    period?: string;
  };
}

export default function Index({ performances, employees, reviewers, filters }: PerformanceIndexProps) {
  const { t } = useTranslate();
  const route = useRoute();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const search = formData.get('search') as string;

    router.get(route('hr.performance.index'), {
      ...filters,
      search: search || undefined,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get(route('hr.performance.index'), {
      ...filters,
      [key]: value === 'all' ? undefined : value,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'in_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Edit className="h-3 w-3" />;
      case 'submitted':
        return <Clock className="h-3 w-3" />;
      case 'in_review':
        return <AlertTriangle className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const renderRating = (rating: number | null) => {
    if (!rating) return '-';

    return (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'completed';
  };

  return (
    <AppLayout
      title={t('hr.performance_reviews', 'Performance Reviews')}
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          {t('hr.performance_reviews', 'Performance Reviews')}
        </h2>
      )}
    >
      <Head title={t('hr.performance_reviews', 'Performance Reviews')} />

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {t('hr.performance_reviews', 'Performance Reviews')}
                  </CardTitle>
                  <CardDescription>
                    {t('hr.manage_performance_reviews_description', 'Manage employee performance reviews and evaluations')}
                  </CardDescription>
                </div>
                <Link href={route('hr.performance.create')}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('hr.create_review', 'Create Review')}
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
                      placeholder={t('hr.search_performance_reviews', 'Search performance reviews...')}
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
                      <SelectItem value="draft">{t('hr.draft', 'Draft')}</SelectItem>
                      <SelectItem value="submitted">{t('hr.submitted', 'Submitted')}</SelectItem>
                      <SelectItem value="in_review">{t('hr.in_review', 'In Review')}</SelectItem>
                      <SelectItem value="completed">{t('hr.completed', 'Completed')}</SelectItem>
                      <SelectItem value="cancelled">{t('hr.cancelled', 'Cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.employee_id || 'all'}
                    onValueChange={(value) => handleFilterChange('employee_id', value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t('hr.select_employee', 'Select Employee')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_employees', 'All Employees')}</SelectItem>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id.toString()}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.reviewer_id || 'all'}
                    onValueChange={(value) => handleFilterChange('reviewer_id', value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t('hr.select_reviewer', 'Select Reviewer')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_reviewers', 'All Reviewers')}</SelectItem>
                      {reviewers.map((reviewer) => (
                        <SelectItem key={reviewer.id} value={reviewer.id.toString()}>
                          {reviewer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder={t('hr.search_period', 'Search period...')}
                    value={filters.period || ''}
                    onChange={(e) => handleFilterChange('period', e.target.value)}
                    className="w-48"
                  />
                </div>
              </div>

              {/* Performance Reviews Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('hr.employee', 'Employee')}</TableHead>
                      <TableHead>{t('hr.reviewer', 'Reviewer')}</TableHead>
                      <TableHead>{t('hr.period', 'Period')}</TableHead>
                      <TableHead>{t('hr.due_date', 'Due Date')}</TableHead>
                      <TableHead>{t('hr.rating', 'Rating')}</TableHead>
                      <TableHead>{t('hr.status', 'Status')}</TableHead>
                      <TableHead>{t('hr.type', 'Type')}</TableHead>
                      <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performances.data.map((performance) => (
                      <TableRow key={performance.id}>
                        <TableCell>
                          <div className="font-medium">{performance.employee.user.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{performance.reviewer.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{performance.review_period}</div>
                            <div className="text-gray-500">
                              {performance.review_start_date} - {performance.review_end_date}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`text-sm ${isOverdue(performance.due_date, performance.status) ? 'text-red-600 font-medium' : ''}`}>
                            {performance.due_date}
                            {isOverdue(performance.due_date, performance.status) && (
                              <div className="text-xs text-red-500">Overdue</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {renderRating(performance.overall_rating)}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(performance.status)} flex items-center gap-1 w-fit`}>
                            {getStatusIcon(performance.status)}
                            {performance.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={performance.is_self_review ? 'secondary' : 'outline'}>
                            {performance.is_self_review ? 'Self Review' : 'Manager Review'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={route('hr.performance.show', performance.id)}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {(performance.status === 'draft' || performance.status === 'submitted') && (
                              <Link href={route('hr.performance.edit', performance.id)}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {performances.data.length === 0 && (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('hr.no_performance_reviews', 'No performance reviews found')}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {t('hr.no_performance_reviews_description', 'No performance reviews match your current filters.')}
                    </p>
                    <Link href={route('hr.performance.create')}>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('hr.create_review', 'Create Review')}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {performances.last_page > 1 && (
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {performances.from} to {performances.to} of {performances.total} performance reviews
                  </div>
                  <div className="flex gap-1">
                    {performances.links.map((link, i) => {
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
