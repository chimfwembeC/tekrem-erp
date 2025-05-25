import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Calendar } from '@/Components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  UserPlus,
  MessageSquare,
  Phone,
  Download,
  Calendar as CalendarIcon,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

interface OverviewMetrics {
  totalLeads: number;
  totalClients: number;
  totalCommunications: number;
  totalConversations: number;
  leadGrowth: number;
  clientGrowth: number;
  communicationGrowth: number;
  conversationGrowth: number;
}

interface StatusCount {
  status: string;
  count: number;
}

interface LeadMetrics {
  leadsByStatus: StatusCount[];
  leadsBySource: StatusCount[];
  conversionRate: number;
  averageTimeToConversion: number;
}

interface ClientMetrics {
  clientsByStatus: StatusCount[];
  clientRetentionRate: number;
  averageClientValue: number;
}

interface CommunicationMetrics {
  communicationsByType: StatusCount[];
  communicationsByUser: Array<{ name: string; count: number }>;
  averageResponseTime: number;
}

interface LiveChatMetrics {
  conversationsByStatus: StatusCount[];
  messagesByType: StatusCount[];
  averageConversationLength: number;
  customerSatisfactionScore: number;
}

interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

interface TimeSeriesData {
  date: string;
  leads: number;
  clients: number;
  communications: number;
  conversations: number;
}

interface TopPerformers {
  topSalesUsers: Array<{ name: string; communications_count: number }>;
}

interface DateRange {
  start: string;
  end: string;
}

interface AnalyticsDashboardProps {
  overview: OverviewMetrics;
  leadMetrics: LeadMetrics;
  clientMetrics: ClientMetrics;
  communicationMetrics: CommunicationMetrics;
  liveChatMetrics: LiveChatMetrics;
  conversionFunnel: FunnelStage[];
  timeSeriesData: TimeSeriesData[];
  topPerformers: TopPerformers;
  dateRange: DateRange;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AnalyticsDashboard({
  overview,
  leadMetrics,
  clientMetrics,
  communicationMetrics,
  liveChatMetrics,
  conversionFunnel,
  timeSeriesData,
  topPerformers,
  dateRange
}: AnalyticsDashboardProps) {
  const [selectedDateRange, setSelectedDateRange] = useState<string>('30d');
  const [exportFormat, setExportFormat] = useState<string>('csv');
  const [exportType, setExportType] = useState<string>('overview');

  const handleExport = async () => {
    try {
      const response = await fetch(route('crm.analytics.export'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          format: exportFormat,
          type: exportType,
          start_date: dateRange.start,
          end_date: dateRange.end,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crm_${exportType}_analytics.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success('Analytics data exported successfully!');
      } else {
        toast.error('Failed to export analytics data');
      }
    } catch (error) {
      toast.error('An error occurred while exporting data');
    }
  };

  const MetricCard = ({
    title,
    value,
    growth,
    icon: Icon,
    description
  }: {
    title: string;
    value: number;
    growth: number;
    icon: any;
    description: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          {growth >= 0 ? (
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
          )}
          <span className={growth >= 0 ? 'text-green-500' : 'text-red-500'}>
            {Math.abs(growth)}%
          </span>
          <span className="ml-1">{description}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout
      title="CRM Analytics"
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            CRM Analytics & Reports
          </h2>
          <div className="flex items-center gap-4">
            {/* Date Range Selector */}
            <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>

            {/* Export Controls */}
            <div className="flex items-center gap-2">
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="leads">Leads</SelectItem>
                  <SelectItem value="clients">Clients</SelectItem>
                  <SelectItem value="communications">Communications</SelectItem>
                  <SelectItem value="livechat">LiveChat</SelectItem>
                </SelectContent>
              </Select>

              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleExport} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      )}
    >
      <Head title="CRM Analytics" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Overview Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <MetricCard
              title="Total Leads"
              value={overview.totalLeads}
              growth={overview.leadGrowth}
              icon={UserPlus}
              description="from last period"
            />
            <MetricCard
              title="Total Clients"
              value={overview.totalClients}
              growth={overview.clientGrowth}
              icon={Users}
              description="from last period"
            />
            <MetricCard
              title="Communications"
              value={overview.totalCommunications}
              growth={overview.communicationGrowth}
              icon={MessageSquare}
              description="from last period"
            />
            <MetricCard
              title="Conversations"
              value={overview.totalConversations}
              growth={overview.conversationGrowth}
              icon={Phone}
              description="from last period"
            />
          </div>

          {/* Analytics Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="leads">Leads</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="communications">Communications</TabsTrigger>
              <TabsTrigger value="livechat">LiveChat</TabsTrigger>
              <TabsTrigger value="funnel">Conversion</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Time Series Chart */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Activity Over Time
                    </CardTitle>
                    <CardDescription>
                      Daily activity trends across all CRM modules
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="leads" stroke="#8884d8" name="Leads" />
                        <Line type="monotone" dataKey="clients" stroke="#82ca9d" name="Clients" />
                        <Line type="monotone" dataKey="communications" stroke="#ffc658" name="Communications" />
                        <Line type="monotone" dataKey="conversations" stroke="#ff7300" name="Conversations" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Top Performers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Top Performers
                    </CardTitle>
                    <CardDescription>
                      Most active team members
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {topPerformers.topSalesUsers.map((user, index) => (
                        <div key={user.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center">
                              {index + 1}
                            </Badge>
                            <span className="font-medium">{user.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {user.communications_count} communications
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Leads Tab */}
            <TabsContent value="leads" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Leads by Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={leadMetrics.leadsByStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ status, count }) => `${status}: ${count}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {leadMetrics.leadsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Leads by Source</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={leadMetrics.leadsBySource}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="source" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Lead Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Conversion Rate</span>
                      <Badge variant="secondary">{leadMetrics.conversionRate}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Avg. Time to Conversion</span>
                      <Badge variant="secondary">{leadMetrics.averageTimeToConversion} days</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Clients Tab */}
            <TabsContent value="clients" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Clients by Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={clientMetrics.clientsByStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ status, count }) => `${status}: ${count}`}
                          outerRadius={80}
                          fill="#82ca9d"
                          dataKey="count"
                        >
                          {clientMetrics.clientsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Client Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Retention Rate</span>
                      <Badge variant="secondary">{clientMetrics.clientRetentionRate}%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Avg. Client Value</span>
                      <Badge variant="secondary">${clientMetrics.averageClientValue}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Communications Tab */}
            <TabsContent value="communications" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Communications by Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={communicationMetrics.communicationsByType}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Communications by User</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {communicationMetrics.communicationsByUser.map((user, index) => (
                        <div key={user.name} className="flex items-center justify-between">
                          <span className="font-medium">{user.name}</span>
                          <Badge variant="outline">{user.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* LiveChat Tab */}
            <TabsContent value="livechat" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Conversations by Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={liveChatMetrics.conversationsByStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ status, count }) => `${status}: ${count}`}
                          outerRadius={80}
                          fill="#ff7300"
                          dataKey="count"
                        >
                          {liveChatMetrics.conversationsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>LiveChat Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Avg. Conversation Length</span>
                      <Badge variant="secondary">{liveChatMetrics.averageConversationLength} messages</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Customer Satisfaction</span>
                      <Badge variant="secondary">{liveChatMetrics.customerSatisfactionScore}/5</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Conversion Funnel Tab */}
            <TabsContent value="funnel" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Conversion Funnel
                  </CardTitle>
                  <CardDescription>
                    Track the customer journey from lead to active client
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {conversionFunnel.map((stage, index) => (
                      <div key={stage.stage} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-medium">{stage.stage}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${stage.percentage}%` }}
                              />
                            </div>
                            <div className="text-sm text-muted-foreground w-16">
                              {stage.percentage}%
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {stage.count} {stage.stage.toLowerCase()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
