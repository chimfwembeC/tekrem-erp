import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  FolderOpen, 
  Users, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { ProjectAnalytics } from '@/types';

interface ProjectsAnalyticsProps {
  auth: {
    user: any;
  };
  analytics: ProjectAnalytics;
}

export default function ProjectsAnalytics({ auth, analytics }: ProjectsAnalyticsProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const formatCurrency = (amount: number | null) => {
    return amount ? `$${amount.toLocaleString()}` : '$0';
  };

  const budgetUtilization = analytics.total_budget > 0 
    ? Math.round((analytics.total_spent / analytics.total_budget) * 100)
    : 0;

  return (
    <AppLayout
      title="Projects Analytics"
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Projects Analytics
        </h2>
      )}
    >
      <Head title="Projects Analytics" />

      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.total_projects}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.active_projects} active projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.total_projects > 0 
                  ? Math.round((analytics.completed_projects / analytics.total_projects) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics.completed_projects} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{budgetUtilization}%</div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(analytics.total_spent)} of {formatCurrency(analytics.total_budget)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(analytics.average_completion_time || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                days average
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Project Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Project Status Distribution</CardTitle>
              <CardDescription>
                Current status breakdown of all projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.project_status_distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, percentage }) => `${status}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.project_status_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Completion Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Project Trend</CardTitle>
              <CardDescription>
                Projects started vs completed over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.monthly_completion_trend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="started" 
                      stroke="#8884d8" 
                      name="Started"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#82ca9d" 
                      name="Completed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Team Utilization</CardTitle>
            <CardDescription>
              Team member workload and utilization rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.team_utilization.length > 0 ? (
                analytics.team_utilization.map((member) => (
                  <div key={member.user_id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{member.user_name}</h4>
                        <p className="text-sm text-gray-600">
                          {member.active_projects} active projects • {member.total_hours}h logged
                        </p>
                      </div>
                      <Badge 
                        variant={member.utilization_percentage > 80 ? "destructive" : 
                                member.utilization_percentage > 60 ? "default" : "secondary"}
                      >
                        {Math.round(member.utilization_percentage)}% utilized
                      </Badge>
                    </div>
                    <Progress value={member.utilization_percentage} className="h-2" />
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No team utilization data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {formatCurrency(analytics.total_budget)}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Allocated across all projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {formatCurrency(analytics.total_spent)}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {budgetUtilization}% of total budget
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Remaining Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(analytics.total_budget - analytics.total_spent)}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Available for allocation
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Project Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Project Status Summary</CardTitle>
            <CardDescription>
              Detailed breakdown of project statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {analytics.project_status_distribution.map((status, index) => (
                <div key={status.status} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold" style={{ color: COLORS[index % COLORS.length] }}>
                    {status.count}
                  </div>
                  <div className="text-sm font-medium capitalize">{status.status}</div>
                  <div className="text-xs text-gray-600">{status.percentage}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts and Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Recommendations</CardTitle>
            <CardDescription>
              System-generated insights and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.overdue_projects > 0 && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-red-800">Overdue Projects</h4>
                    <p className="text-sm text-red-600">
                      {analytics.overdue_projects} projects are overdue and need immediate attention.
                    </p>
                  </div>
                </div>
              )}

              {budgetUtilization > 80 && (
                <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <DollarSign className="h-5 w-5 text-yellow-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-yellow-800">High Budget Utilization</h4>
                    <p className="text-sm text-yellow-600">
                      Budget utilization is at {budgetUtilization}%. Consider reviewing project costs.
                    </p>
                  </div>
                </div>
              )}

              {analytics.team_utilization.some(member => member.utilization_percentage > 90) && (
                <div className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <Users className="h-5 w-5 text-orange-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-orange-800">Team Overutilization</h4>
                    <p className="text-sm text-orange-600">
                      Some team members are over 90% utilized. Consider workload redistribution.
                    </p>
                  </div>
                </div>
              )}

              {analytics.overdue_projects === 0 && budgetUtilization < 80 && 
               !analytics.team_utilization.some(member => member.utilization_percentage > 90) && (
                <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                  <div>
                    <h4 className="font-medium text-green-800">All Systems Green</h4>
                    <p className="text-sm text-green-600">
                      No critical issues detected. Projects are on track and within budget.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
