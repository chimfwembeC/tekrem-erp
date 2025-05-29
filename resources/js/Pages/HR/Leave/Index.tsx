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
  Calendar,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Check,
  X,
  Clock
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Leave {
  id: number;
  employee: {
    user: {
      name: string;
    };
  };
  leave_type: {
    name: string;
    color: string;
  };
  start_date: string;
  end_date: string;
  days_requested: number;
  status: string;
  reason: string;
  submitted_at: string;
  approver?: {
    name: string;
  };
}

interface LeaveType {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  name: string;
}

interface LeaveIndexProps {
  leaves: {
    data: Leave[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  leaveTypes: LeaveType[];
  employees: Employee[];
  filters: {
    search?: string;
    status?: string;
    leave_type_id?: string;
    employee_id?: string;
    date_from?: string;
    date_to?: string;
  };
}

export default function Index({ leaves, leaveTypes, employees, filters }: LeaveIndexProps) {
  const { t } = useTranslate();
  const route = useRoute();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const search = formData.get('search') as string;

    router.get(route('hr.leave.index'), {
      ...filters,
      search: search || undefined,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get(route('hr.leave.index'), {
      ...filters,
      [key]: value === 'all' ? undefined : value,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'approved':
        return <Check className="h-3 w-3" />;
      case 'rejected':
        return <X className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <AppLayout
      title={t('hr.leave_management', 'Leave Management')}
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          {t('hr.leave_management', 'Leave Management')}
        </h2>
      )}
    >
      <Head title={t('hr.leave_management', 'Leave Management')} />

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {t('hr.leave_requests', 'Leave Requests')}
                  </CardTitle>
                  <CardDescription>
                    {t('hr.manage_leave_requests_description', 'Manage employee leave requests and approvals')}
                  </CardDescription>
                </div>
                <Link href={route('hr.leave.create')}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('hr.request_leave', 'Request Leave')}
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
                      placeholder={t('hr.search_leave_requests', 'Search leave requests...')}
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
                      <SelectItem value="pending">{t('hr.pending', 'Pending')}</SelectItem>
                      <SelectItem value="approved">{t('hr.approved', 'Approved')}</SelectItem>
                      <SelectItem value="rejected">{t('hr.rejected', 'Rejected')}</SelectItem>
                      <SelectItem value="cancelled">{t('hr.cancelled', 'Cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.leave_type_id || 'all'}
                    onValueChange={(value) => handleFilterChange('leave_type_id', value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t('hr.select_leave_type', 'Select Leave Type')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_types', 'All Types')}</SelectItem>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
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

                  <div className="flex gap-2">
                    <Input
                      type="date"
                      placeholder={t('hr.from_date', 'From Date')}
                      value={filters.date_from || ''}
                      onChange={(e) => handleFilterChange('date_from', e.target.value)}
                      className="w-40"
                    />
                    <Input
                      type="date"
                      placeholder={t('hr.to_date', 'To Date')}
                      value={filters.date_to || ''}
                      onChange={(e) => handleFilterChange('date_to', e.target.value)}
                      className="w-40"
                    />
                  </div>
                </div>
              </div>

              {/* Leave Requests Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('hr.employee', 'Employee')}</TableHead>
                      <TableHead>{t('hr.leave_type', 'Leave Type')}</TableHead>
                      <TableHead>{t('hr.dates', 'Dates')}</TableHead>
                      <TableHead>{t('hr.days', 'Days')}</TableHead>
                      <TableHead>{t('hr.status', 'Status')}</TableHead>
                      <TableHead>{t('hr.submitted', 'Submitted')}</TableHead>
                      <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaves.data.map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell>
                          <div className="font-medium">{leave.employee.user.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: leave.leave_type.color }}
                            />
                            {leave.leave_type.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{leave.start_date}</div>
                            {leave.start_date !== leave.end_date && (
                              <div className="text-gray-500">to {leave.end_date}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{leave.days_requested}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(leave.status)} flex items-center gap-1 w-fit`}>
                            {getStatusIcon(leave.status)}
                            {leave.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {new Date(leave.submitted_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={route('hr.leave.show', leave.id)}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {leave.status === 'pending' && (
                              <Link href={route('hr.leave.edit', leave.id)}>
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

                {leaves.data.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('hr.no_leave_requests', 'No leave requests found')}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {t('hr.no_leave_requests_description', 'No leave requests match your current filters.')}
                    </p>
                    <Link href={route('hr.leave.create')}>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('hr.request_leave', 'Request Leave')}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {leaves.last_page > 1 && (
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {leaves.from} to {leaves.to} of {leaves.total} leave requests
                  </div>
                  <div className="flex gap-1">
                    {leaves.links.map((link, i) => {
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
