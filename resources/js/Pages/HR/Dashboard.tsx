import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { 
  Users, 
  Building, 
  Calendar, 
  Clock, 
  TrendingUp, 
  GraduationCap,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface DashboardProps {
  stats: {
    employees: {
      total: number;
      active: number;
      new_this_month: number;
    };
    departments: {
      total: number;
      breakdown: Array<{
        name: string;
        employee_count: number;
        budget: number;
      }>;
    };
    leave: {
      pending: number;
      approved_today: number;
      this_month: number;
    };
    attendance: {
      total_today: number;
      present_today: number;
      late_today: number;
      attendance_rate: number;
    };
    performance: {
      overdue_reviews: number;
      completed_this_quarter: number;
      average_rating: number;
    };
    training: {
      upcoming: number;
      ongoing: number;
      mandatory: number;
    };
  };
  recent_activities: {
    leaves: Array<{
      id: number;
      employee_name: string;
      leave_type: string;
      start_date: string;
      days: number;
      status: string;
      created_at: string;
    }>;
    hires: Array<{
      id: number;
      name: string;
      job_title: string;
      department: string;
      hire_date: string;
    }>;
  };
  charts: {
    employee_growth: Array<{
      month: string;
      hires: number;
      terminations: number;
      net_growth: number;
    }>;
    attendance: Array<{
      date: string;
      present: number;
      late: number;
      absent: number;
    }>;
    leave_types: Array<{
      name: string;
      count: number;
      total_days: number;
    }>;
  };
}

export default function Dashboard({ stats, recent_activities, charts }: DashboardProps) {
  const { t } = useTranslate();
  const route = useRoute();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout
      title={t('hr.dashboard', 'HR Dashboard')}
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          {t('hr.dashboard', 'HR Dashboard')}
        </h2>
      )}
    >
      <Head title={t('hr.dashboard', 'HR Dashboard')} />

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Employees Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('hr.employees', 'Employees')}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.employees.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.employees.active} active, {stats.employees.new_this_month} new this month
                </p>
              </CardContent>
            </Card>

            {/* Departments Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('hr.departments', 'Departments')}
                </CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.departments.total}</div>
                <p className="text-xs text-muted-foreground">
                  Active departments
                </p>
              </CardContent>
            </Card>

            {/* Leave Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('hr.leave_requests', 'Leave Requests')}
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.leave.pending}</div>
                <p className="text-xs text-muted-foreground">
                  Pending approval, {stats.leave.approved_today} on leave today
                </p>
              </CardContent>
            </Card>

            {/* Attendance Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('hr.attendance_rate', 'Attendance Rate')}
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.attendance.attendance_rate}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.attendance.present_today} present, {stats.attendance.late_today} late today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Performance Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('hr.performance', 'Performance Reviews')}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.performance.overdue_reviews}</div>
                <p className="text-xs text-muted-foreground">
                  Overdue reviews
                </p>
                <div className="mt-2">
                  <p className="text-sm">
                    Avg Rating: <span className="font-semibold">{stats.performance.average_rating?.toFixed(1) || 'N/A'}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.performance.completed_this_quarter} completed this quarter
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Training Stats */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('hr.training', 'Training Programs')}
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.training.upcoming}</div>
                <p className="text-xs text-muted-foreground">
                  Upcoming trainings
                </p>
                <div className="mt-2">
                  <p className="text-sm">
                    {stats.training.ongoing} ongoing, {stats.training.mandatory} mandatory
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {t('hr.quick_actions', 'Quick Actions')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = route('hr.employees.create')}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {t('hr.add_employee', 'Add Employee')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = route('hr.leave.index')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {t('hr.manage_leave', 'Manage Leave')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = route('hr.attendance.index')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {t('hr.view_attendance', 'View Attendance')}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Leave Requests */}
            <Card>
              <CardHeader>
                <CardTitle>{t('hr.recent_leave_requests', 'Recent Leave Requests')}</CardTitle>
                <CardDescription>
                  {t('hr.latest_leave_submissions', 'Latest leave submissions from employees')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recent_activities.leaves.map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{leave.employee_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {leave.leave_type} • {leave.days} days • {leave.start_date}
                        </p>
                      </div>
                      <Badge className={getStatusColor(leave.status)}>
                        {leave.status}
                      </Badge>
                    </div>
                  ))}
                  {recent_activities.leaves.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {t('hr.no_recent_leaves', 'No recent leave requests')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Hires */}
            <Card>
              <CardHeader>
                <CardTitle>{t('hr.recent_hires', 'Recent Hires')}</CardTitle>
                <CardDescription>
                  {t('hr.new_employees_last_30_days', 'New employees in the last 30 days')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recent_activities.hires.map((hire) => (
                    <div key={hire.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{hire.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {hire.job_title} • {hire.department}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{hire.hire_date}</p>
                      </div>
                    </div>
                  ))}
                  {recent_activities.hires.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {t('hr.no_recent_hires', 'No recent hires')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
