import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { 
  BarChart3, 
  Users, 
  Building, 
  Calendar, 
  Clock, 
  TrendingUp, 
  GraduationCap,
  Download,
  Filter
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface AnalyticsDashboardProps {
  stats: {
    employees: {
      total: number;
      active: number;
      new_hires: number;
      terminations: number;
      turnover_rate: number;
    };
    departments: Array<{
      name: string;
      employee_count: number;
      budget: number;
    }>;
    leave: {
      total_requests: number;
      approved: number;
      pending: number;
      total_days_taken: number;
    };
    attendance: {
      average_attendance_rate: number;
      total_late_arrivals: number;
      total_absences: number;
      average_overtime_hours: number;
    };
    performance: {
      total_reviews: number;
      completed_reviews: number;
      overdue_reviews: number;
      average_rating: number;
    };
    training: {
      total_programs: number;
      completed_programs: number;
      total_enrollments: number;
      completion_rate: number;
    };
  };
  charts: {
    employee_growth: Array<{
      month: string;
      hires: number;
      terminations: number;
      net_growth: number;
    }>;
    leave_trends: Array<{
      name: string;
      count: number;
      total_days: number;
    }>;
    attendance_trends: Array<{
      date: string;
      present: number;
      absent: number;
    }>;
    performance_distribution: Array<{
      rating_category: string;
      count: number;
    }>;
    training_completion: Array<{
      status: string;
      count: number;
    }>;
  };
  filters: {
    start_date: string;
    end_date: string;
  };
}

export default function Dashboard({ stats, charts, filters }: AnalyticsDashboardProps) {
  const { t } = useTranslate();
  const route = useRoute();

  const handleDateFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set(key, value);
    window.location.href = `${route('hr.analytics.dashboard')}?${params.toString()}`;
  };

  return (
    <AppLayout
      title={t('hr.analytics_dashboard', 'HR Analytics Dashboard')}
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          {t('hr.analytics_dashboard', 'HR Analytics Dashboard')}
        </h2>
      )}
    >
      <Head title={t('hr.analytics_dashboard', 'HR Analytics Dashboard')} />

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Date Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                {t('hr.date_range', 'Date Range')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">{t('hr.from', 'From')}:</label>
                  <Input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => handleDateFilterChange('start_date', e.target.value)}
                    className="w-40"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">{t('hr.to', 'To')}:</label>
                  <Input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => handleDateFilterChange('end_date', e.target.value)}
                    className="w-40"
                  />
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  {t('hr.export_data', 'Export Data')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Employee Metrics */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('hr.total_employees', 'Total Employees')}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.employees.total}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.employees.active} active, {stats.employees.new_hires} new hires
                </p>
                <div className="mt-2">
                  <span className="text-sm font-medium">Turnover Rate: </span>
                  <span className={`text-sm ${stats.employees.turnover_rate > 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.employees.turnover_rate}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Leave Metrics */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('hr.leave_requests', 'Leave Requests')}
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.leave.total_requests}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.leave.approved} approved, {stats.leave.pending} pending
                </p>
                <div className="mt-2">
                  <span className="text-sm font-medium">Total Days: </span>
                  <span className="text-sm">{stats.leave.total_days_taken}</span>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Metrics */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('hr.attendance_rate', 'Attendance Rate')}
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.attendance.average_attendance_rate}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.attendance.total_late_arrivals} late, {stats.attendance.total_absences} absent
                </p>
                <div className="mt-2">
                  <span className="text-sm font-medium">Avg Overtime: </span>
                  <span className="text-sm">{Math.round(stats.attendance.average_overtime_hours)}h</span>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('hr.performance_reviews', 'Performance Reviews')}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.performance.total_reviews}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.performance.completed_reviews} completed, {stats.performance.overdue_reviews} overdue
                </p>
                <div className="mt-2">
                  <span className="text-sm font-medium">Avg Rating: </span>
                  <span className="text-sm">{stats.performance.average_rating.toFixed(1)}/5.0</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Training Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  {t('hr.training_programs', 'Training Programs')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{stats.training.total_programs}</div>
                    <p className="text-sm text-muted-foreground">Total Programs</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.training.total_enrollments}</div>
                    <p className="text-sm text-muted-foreground">Total Enrollments</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.training.completed_programs}</div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.training.completion_rate}%</div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Department Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {t('hr.department_overview', 'Department Overview')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.departments.slice(0, 5).map((dept, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{dept.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {dept.employee_count} employees
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          ${dept.budget?.toLocaleString() || 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">Budget</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Employee Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>{t('hr.employee_growth_trend', 'Employee Growth Trend')}</CardTitle>
                <CardDescription>
                  {t('hr.monthly_hires_terminations', 'Monthly hires vs terminations')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  {t('hr.chart_placeholder', 'Chart visualization would be implemented here')}
                  <br />
                  <small>Data: {charts.employee_growth.length} months</small>
                </div>
              </CardContent>
            </Card>

            {/* Leave Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>{t('hr.leave_trends', 'Leave Trends')}</CardTitle>
                <CardDescription>
                  {t('hr.leave_requests_by_type', 'Leave requests by type')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  {t('hr.chart_placeholder', 'Chart visualization would be implemented here')}
                  <br />
                  <small>Data: {charts.leave_trends.length} leave types</small>
                </div>
              </CardContent>
            </Card>

            {/* Performance Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>{t('hr.performance_distribution', 'Performance Distribution')}</CardTitle>
                <CardDescription>
                  {t('hr.employee_ratings_breakdown', 'Employee ratings breakdown')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  {t('hr.chart_placeholder', 'Chart visualization would be implemented here')}
                  <br />
                  <small>Data: {charts.performance_distribution.length} rating categories</small>
                </div>
              </CardContent>
            </Card>

            {/* Training Completion Chart */}
            <Card>
              <CardHeader>
                <CardTitle>{t('hr.training_completion', 'Training Completion')}</CardTitle>
                <CardDescription>
                  {t('hr.training_program_status', 'Training program status breakdown')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  {t('hr.chart_placeholder', 'Chart visualization would be implemented here')}
                  <br />
                  <small>Data: {charts.training_completion.length} status types</small>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
