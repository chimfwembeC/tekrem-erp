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
  Users,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Building
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Employee {
  id: number;
  employee_id: string;
  user: {
    name: string;
    email: string;
  };
  job_title: string;
  department: {
    name: string;
  } | null;
  employment_type: string;
  employment_status: string;
  hire_date: string;
  manager: {
    user: {
      name: string;
    };
  } | null;
}

interface Department {
  id: number;
  name: string;
}

interface EmployeesIndexProps {
  employees: {
    data: Employee[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  departments: Department[];
  filters: {
    search?: string;
    department_id?: string;
    employment_status?: string;
    employment_type?: string;
  };
}

export default function Index({ employees, departments, filters }: EmployeesIndexProps) {
  const { t } = useTranslate();
  const route = useRoute();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const search = formData.get('search') as string;

    router.get(route('hr.employees.index'), {
      ...filters,
      search: search || undefined,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get(route('hr.employees.index'), {
      ...filters,
      [key]: value === 'all' ? undefined : value,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmploymentTypeColor = (type: string) => {
    switch (type) {
      case 'full_time':
        return 'bg-blue-100 text-blue-800';
      case 'part_time':
        return 'bg-purple-100 text-purple-800';
      case 'contract':
        return 'bg-orange-100 text-orange-800';
      case 'intern':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout
      title={t('hr.employees', 'Employees')}
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          {t('hr.employees', 'Employees')}
        </h2>
      )}
    >
      <Head title={t('hr.employees', 'Employees')} />

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {t('hr.employees', 'Employees')}
                  </CardTitle>
                  <CardDescription>
                    {t('hr.manage_employees_description', 'Manage your organization\'s employees')}
                  </CardDescription>
                </div>
                <Link href={route('hr.employees.create')}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('hr.add_employee', 'Add Employee')}
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
                      placeholder={t('hr.search_employees', 'Search employees...')}
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
                    value={filters.department_id || 'all'}
                    onValueChange={(value) => handleFilterChange('department_id', value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t('hr.select_department', 'Select Department')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_departments', 'All Departments')}</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.employment_status || 'all'}
                    onValueChange={(value) => handleFilterChange('employment_status', value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t('hr.select_status', 'Select Status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_statuses', 'All Statuses')}</SelectItem>
                      <SelectItem value="active">{t('hr.active', 'Active')}</SelectItem>
                      <SelectItem value="inactive">{t('hr.inactive', 'Inactive')}</SelectItem>
                      <SelectItem value="terminated">{t('hr.terminated', 'Terminated')}</SelectItem>
                      <SelectItem value="on_leave">{t('hr.on_leave', 'On Leave')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.employment_type || 'all'}
                    onValueChange={(value) => handleFilterChange('employment_type', value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t('hr.select_type', 'Select Type')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_types', 'All Types')}</SelectItem>
                      <SelectItem value="full_time">{t('hr.full_time', 'Full Time')}</SelectItem>
                      <SelectItem value="part_time">{t('hr.part_time', 'Part Time')}</SelectItem>
                      <SelectItem value="contract">{t('hr.contract', 'Contract')}</SelectItem>
                      <SelectItem value="intern">{t('hr.intern', 'Intern')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Employees Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('hr.employee_id', 'Employee ID')}</TableHead>
                      <TableHead>{t('hr.name', 'Name')}</TableHead>
                      <TableHead>{t('hr.job_title', 'Job Title')}</TableHead>
                      <TableHead>{t('hr.department', 'Department')}</TableHead>
                      <TableHead>{t('hr.employment_type', 'Type')}</TableHead>
                      <TableHead>{t('hr.status', 'Status')}</TableHead>
                      <TableHead>{t('hr.hire_date', 'Hire Date')}</TableHead>
                      <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employees.data.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">
                          {employee.employee_id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{employee.user.name}</div>
                            <div className="text-sm text-gray-500">{employee.user.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{employee.job_title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4 text-gray-400" />
                            {employee.department?.name || t('hr.no_department', 'No Department')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getEmploymentTypeColor(employee.employment_type)}>
                            {employee.employment_type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(employee.employment_status)}>
                            {employee.employment_status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{employee.hire_date}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={route('hr.employees.show', employee.id)}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={route('hr.employees.edit', employee.id)}>
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

                {employees.data.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('hr.no_employees', 'No employees found')}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {t('hr.no_employees_description', 'Get started by adding your first employee.')}
                    </p>
                    <Link href={route('hr.employees.create')}>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('hr.add_employee', 'Add Employee')}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {employees.last_page > 1 && (
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {employees.from} to {employees.to} of {employees.total} employees
                  </div>
                  <div className="flex gap-1">
                    {employees.links.map((link, i) => {
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
