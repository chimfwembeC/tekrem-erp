import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
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
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  Users,
  Target,
  Download,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';

interface DateRange {
  from: string;
  to: string;
}

interface TicketMetrics {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
  overdue: number;
  by_priority: Array<{ priority: string; count: number }>;
  daily_trend: Array<{ date: string; count: number }>;
}

interface PerformanceMetrics {
  avg_response_time: number;
  avg_resolution_time: number;
  first_response_sla_met: number;
  resolution_sla_met: number;
}

interface AgentPerformance {
  id: number;
  name: string;
  tickets_assigned: number;
  tickets_resolved: number;
  avg_resolution_time: number;
  resolution_rate: number;
}

interface CategoryAnalytics {
  id: number;
  name: string;
  total_tickets: number;
  resolved_tickets: number;
  avg_resolution_time: number;
  resolution_rate: number;
}

interface SLACompliance {
  id: number;
  name: string;
  compliance_percentage: number;
  tickets_count: number;
  response_time_hours: number;
  resolution_time_hours: number;
}

interface SatisfactionMetrics {
  avg_rating: number;
  total_ratings: number;
  rating_distribution: Array<{ satisfaction_rating: number; count: number }>;
  satisfaction_rate: number;
}

interface KnowledgeBaseMetrics {
  total_articles: number;
  total_faqs: number;
  total_views: number;
  most_viewed_articles: Array<{ id: number; title: string; view_count: number }>;
  most_helpful_articles: Array<{ id: number; title: string; helpful_count: number }>;
  articles_by_category: Array<{ id: number; name: string; articles_count: number }>;
}

interface Props {
  dateRange: DateRange;
  ticketMetrics: TicketMetrics;
  performanceMetrics: PerformanceMetrics;
  agentPerformance: AgentPerformance[];
  categoryAnalytics: CategoryAnalytics[];
  slaCompliance: SLACompliance[];
  satisfactionMetrics: SatisfactionMetrics;
  knowledgeBaseMetrics: KnowledgeBaseMetrics;
}

export default function Dashboard({
  dateRange,
  ticketMetrics,
  performanceMetrics,
  agentPerformance,
  categoryAnalytics,
  slaCompliance,
  satisfactionMetrics,
  knowledgeBaseMetrics
}: Props) {
  const { t } = useTranslate();
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  const getChangeIndicator = (current: number, previous: number) => {
    if (previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    const isPositive = change > 0;
    
    return (
      <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {Math.abs(change).toFixed(1)}%
      </div>
    );
  };

  return (
    <AppLayout>
      <Head title={t('support.analytics', 'Support Analytics')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('support.analytics', 'Support Analytics')}</h1>
            <p className="text-muted-foreground">
              {t('support.analytics_description', 'Comprehensive support performance insights')}
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">{t('common.last_7_days', 'Last 7 days')}</SelectItem>
                <SelectItem value="30">{t('common.last_30_days', 'Last 30 days')}</SelectItem>
                <SelectItem value="90">{t('common.last_90_days', 'Last 90 days')}</SelectItem>
                <SelectItem value="365">{t('common.last_year', 'Last year')}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t('common.export', 'Export')}
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('support.total_tickets', 'Total Tickets')}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ticketMetrics.total}</div>
              <div className="text-xs text-muted-foreground">
                {ticketMetrics.open} open, {ticketMetrics.overdue} overdue
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('support.avg_response_time', 'Avg Response Time')}
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(performanceMetrics.avg_response_time)}</div>
              <div className="text-xs text-muted-foreground">
                SLA: {performanceMetrics.first_response_sla_met.toFixed(1)}% met
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('support.avg_resolution_time', 'Avg Resolution Time')}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(performanceMetrics.avg_resolution_time)}</div>
              <div className="text-xs text-muted-foreground">
                SLA: {performanceMetrics.resolution_sla_met.toFixed(1)}% met
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('support.satisfaction_rating', 'Satisfaction Rating')}
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{satisfactionMetrics.avg_rating.toFixed(1)}/5</div>
              <div className="text-xs text-muted-foreground">
                {satisfactionMetrics.satisfaction_rate.toFixed(1)}% satisfied
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Tickets by Priority */}
          <Card>
            <CardHeader>
              <CardTitle>{t('support.tickets_by_priority', 'Tickets by Priority')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ticketMetrics.by_priority}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* SLA Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>{t('support.sla_compliance', 'SLA Compliance')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {slaCompliance.map((sla) => (
                  <div key={sla.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{sla.name}</span>
                      <span className="font-medium">{sla.compliance_percentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          sla.compliance_percentage >= 95 ? 'bg-green-500' :
                          sla.compliance_percentage >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${sla.compliance_percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {sla.tickets_count} tickets
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Performance */}
        <Card>
          <CardHeader>
            <CardTitle>{t('support.agent_performance', 'Agent Performance')}</CardTitle>
            <CardDescription>
              {t('support.agent_performance_description', 'Individual agent metrics and performance')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {agentPerformance.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{agent.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {agent.tickets_assigned} assigned, {agent.tickets_resolved} resolved
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {agent.resolution_rate.toFixed(1)}% resolution rate
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg: {formatTime(agent.avg_resolution_time)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>{t('support.category_performance', 'Category Performance')}</CardTitle>
            <CardDescription>
              {t('support.category_performance_description', 'Performance metrics by ticket category')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryAnalytics.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {category.total_tickets} total tickets
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {category.resolution_rate.toFixed(1)}% resolved
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg: {formatTime(category.avg_resolution_time)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Base Stats */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('support.knowledge_base_stats', 'Knowledge Base Statistics')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{knowledgeBaseMetrics.total_articles}</div>
                  <div className="text-xs text-muted-foreground">{t('support.articles', 'Articles')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{knowledgeBaseMetrics.total_faqs}</div>
                  <div className="text-xs text-muted-foreground">{t('support.faqs', 'FAQs')}</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{knowledgeBaseMetrics.total_views}</div>
                  <div className="text-xs text-muted-foreground">{t('support.total_views', 'Total Views')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('support.satisfaction_distribution', 'Satisfaction Distribution')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={satisfactionMetrics.rating_distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ satisfaction_rating }) => `${satisfaction_rating} ⭐`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {satisfactionMetrics.rating_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
