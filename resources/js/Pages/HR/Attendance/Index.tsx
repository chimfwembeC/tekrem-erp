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
  Clock,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Attendance {
  id: number;
  employee: {
    user: {
      name: string;
    };
  };
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  total_hours: number | null;
  break_duration: number | null;
  overtime_hours: number | null;
  status: string;
  notes: string | null;
  is_manual_entry: boolean;
}

interface Employee {
  id: number;
  name: string;
}

interface AttendanceIndexProps {
  attendances: {
    data: Attendance[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  employees: Employee[];
  filters: {
    search?: string;
    employee_id?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
  };
}

export default function Index({ attendances, employees, filters }: AttendanceIndexProps) {
  const { t } = useTranslate();
  const route = useRoute();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const search = formData.get('search') as string;

    router.get(route('hr.attendance.index'), {
      ...filters,
      search: search || undefined,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get(route('hr.attendance.index'), {
      ...filters,
      [key]: value === 'all' ? undefined : value,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'half_day':
        return 'bg-blue-100 text-blue-800';
      case 'on_leave':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-3 w-3" />;
      case 'absent':
        return <XCircle className="h-3 w-3" />;
      case 'late':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return '-';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <AppLayout
      title={t('hr.attendance', 'Attendance')}
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          {t('hr.attendance', 'Attendance')}
        </h2>
      )}
    >
      <Head title={t('hr.attendance', 'Attendance')} />

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {t('hr.attendance_records', 'Attendance Records')}
                  </CardTitle>
                  <CardDescription>
                    {t('hr.manage_attendance_description', 'Track and manage employee attendance')}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Link href={route('hr.attendance.reports')}>
                    <Button variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      {t('hr.reports', 'Reports')}
                    </Button>
                  </Link>
                  <Link href={route('hr.attendance.create')}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('hr.add_attendance', 'Add Attendance')}
                    </Button>
                  </Link>
                </div>
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
                      placeholder={t('hr.search_attendance', 'Search attendance records...')}
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
                    value={filters.status || 'all'}
                    onValueChange={(value) => handleFilterChange('status', value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t('hr.select_status', 'Select Status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_statuses', 'All Statuses')}</SelectItem>
                      <SelectItem value="present">{t('hr.present', 'Present')}</SelectItem>
                      <SelectItem value="absent">{t('hr.absent', 'Absent')}</SelectItem>
                      <SelectItem value="late">{t('hr.late', 'Late')}</SelectItem>
                      <SelectItem value="half_day">{t('hr.half_day', 'Half Day')}</SelectItem>
                      <SelectItem value="on_leave">{t('hr.on_leave', 'On Leave')}</SelectItem>
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

              {/* Attendance Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('hr.employee', 'Employee')}</TableHead>
                      <TableHead>{t('hr.date', 'Date')}</TableHead>
                      <TableHead>{t('hr.clock_in', 'Clock In')}</TableHead>
                      <TableHead>{t('hr.clock_out', 'Clock Out')}</TableHead>
                      <TableHead>{t('hr.total_hours', 'Total Hours')}</TableHead>
                      <TableHead>{t('hr.overtime', 'Overtime')}</TableHead>
                      <TableHead>{t('hr.status', 'Status')}</TableHead>
                      <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendances.data.map((attendance) => (
                      <TableRow key={attendance.id}>
                        <TableCell>
                          <div className="font-medium">{attendance.employee.user.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(attendance.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatTime(attendance.clock_in)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatTime(attendance.clock_out)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">
                            {formatDuration(attendance.total_hours)}
                          </div>
                          {attendance.break_duration && attendance.break_duration > 0 && (
                            <div className="text-xs text-gray-500">
                              Break: {formatDuration(attendance.break_duration)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDuration(attendance.overtime_hours)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getStatusColor(attendance.status)} flex items-center gap-1 w-fit`}>
                              {getStatusIcon(attendance.status)}
                              {attendance.status.replace('_', ' ')}
                            </Badge>
                            {attendance.is_manual_entry && (
                              <Badge variant="outline" className="text-xs">
                                Manual
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={route('hr.attendance.show', attendance.id)}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={route('hr.attendance.edit', attendance.id)}>
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

                {attendances.data.length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('hr.no_attendance_records', 'No attendance records found')}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {t('hr.no_attendance_records_description', 'No attendance records match your current filters.')}
                    </p>
                    <Link href={route('hr.attendance.create')}>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('hr.add_attendance', 'Add Attendance')}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {attendances.last_page > 1 && (
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {attendances.from} to {attendances.to} of {attendances.total} attendance records
                  </div>
                  <div className="flex gap-1">
                    {attendances.links.map((link, i) => {
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
