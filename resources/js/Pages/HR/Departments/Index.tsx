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
  Building,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Users,
  DollarSign
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
  manager: {
    name: string;
  } | null;
  parent_department: {
    name: string;
  } | null;
  location: string;
  budget: number;
  employee_count: number;
  is_active: boolean;
  employees_count: number;
}

interface ParentDepartment {
  id: number;
  name: string;
}

interface DepartmentsIndexProps {
  departments: {
    data: Department[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  parentDepartments: ParentDepartment[];
  filters: {
    search?: string;
    is_active?: boolean;
    parent_id?: string;
  };
}

export default function Index({ departments, parentDepartments, filters }: DepartmentsIndexProps) {
  const { t } = useTranslate();
  const route = useRoute();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const search = formData.get('search') as string;

    router.get(route('hr.departments.index'), {
      ...filters,
      search: search || undefined,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get(route('hr.departments.index'), {
      ...filters,
      [key]: value === 'all' ? undefined : value,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <AppLayout
      title={t('hr.departments', 'Departments')}
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          {t('hr.departments', 'Departments')}
        </h2>
      )}
    >
      <Head title={t('hr.departments', 'Departments')} />

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {t('hr.departments', 'Departments')}
                  </CardTitle>
                  <CardDescription>
                    {t('hr.manage_departments_description', 'Manage organizational departments and structure')}
                  </CardDescription>
                </div>
                <Link href={route('hr.departments.create')}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('hr.add_department', 'Add Department')}
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
                      placeholder={t('hr.search_departments', 'Search departments...')}
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
                    value={filters.is_active?.toString() || 'all'}
                    onValueChange={(value) => handleFilterChange('is_active', value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t('hr.select_status', 'Select Status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_statuses', 'All Statuses')}</SelectItem>
                      <SelectItem value="true">{t('hr.active', 'Active')}</SelectItem>
                      <SelectItem value="false">{t('hr.inactive', 'Inactive')}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.parent_id || 'all'}
                    onValueChange={(value) => handleFilterChange('parent_id', value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t('hr.select_parent', 'Select Parent')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_departments', 'All Departments')}</SelectItem>
                      <SelectItem value="root">{t('hr.root_departments', 'Root Departments')}</SelectItem>
                      {parentDepartments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Departments Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('hr.name', 'Name')}</TableHead>
                      <TableHead>{t('hr.code', 'Code')}</TableHead>
                      <TableHead>{t('hr.manager', 'Manager')}</TableHead>
                      <TableHead>{t('hr.parent_department', 'Parent Department')}</TableHead>
                      <TableHead>{t('hr.employees', 'Employees')}</TableHead>
                      <TableHead>{t('hr.budget', 'Budget')}</TableHead>
                      <TableHead>{t('hr.status', 'Status')}</TableHead>
                      <TableHead className="text-right">{t('common.actions', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {departments.data.map((department) => (
                      <TableRow key={department.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{department.name}</div>
                            {department.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {department.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{department.code}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {department.manager?.name || t('hr.no_manager', 'No Manager')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {department.parent_department?.name || t('hr.root_department', 'Root Department')}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">{department.employees_count}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {department.budget ? formatCurrency(department.budget) : 'N/A'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(department.is_active)}>
                            {department.is_active ? t('hr.active', 'Active') : t('hr.inactive', 'Inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={route('hr.departments.show', department.id)}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={route('hr.departments.edit', department.id)}>
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

                {departments.data.length === 0 && (
                  <div className="text-center py-8">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {t('hr.no_departments', 'No departments found')}
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {t('hr.no_departments_description', 'Get started by creating your first department.')}
                    </p>
                    <Link href={route('hr.departments.create')}>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('hr.add_department', 'Add Department')}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {departments.last_page > 1 && (
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {departments.from} to {departments.to} of {departments.total} departments
                  </div>
                  <div className="flex gap-1">
                    {departments.links.map((link, i) => {
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
