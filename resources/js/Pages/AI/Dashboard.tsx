import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import {
  Bot,
  Brain,
  MessageSquare,
  FileText,
  TrendingUp,
  Activity,
  Zap,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';

interface Service {
  id: number;
  name: string;
  provider: string;
  is_default: boolean;
  is_enabled: boolean;
  models_count: number;
}

interface Conversation {
  id: number;
  title: string;
  message_count: number;
  total_tokens: number;
  total_cost: number;
  last_message_at: string;
  user: {
    id: number;
    name: string;
  };
  ai_model: {
    id: number;
    name: string;
    service: {
      id: number;
      name: string;
      provider: string;
    };
  };
}

interface Template {
  id: number;
  name: string;
  category: string;
  usage_count: number;
  avg_rating: number;
  is_public: boolean;
  is_system: boolean;
}

interface UsageStats {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  total_tokens: number;
  total_cost: number;
  avg_response_time: number;
  success_rate: number;
}

interface DailyUsage {
  date: string;
  requests: number;
  tokens: number;
  cost: number;
}

interface UsageByOperation {
  operation_type: string;
  count: number;
  tokens: number;
  cost: number;
}

interface Props {
  stats: {
    total_services: number;
    total_models: number;
    total_conversations: number;
    total_templates: number;
  };
  usageStats: UsageStats;
  recentConversations: Conversation[];
  popularTemplates: Template[];
  services: Service[];
  dailyUsage: DailyUsage[];
  usageByOperation: UsageByOperation[];
}

export default function Dashboard({
  stats,
  usageStats,
  recentConversations,
  popularTemplates,
  services,
  dailyUsage,
  usageByOperation
}: Props) {
  const { t } = useTranslate();
  const [quickStats, setQuickStats] = useState<any>(null);

  useEffect(() => {
    // Fetch quick stats for today vs yesterday comparison
    fetch(route('ai.dashboard.quick-stats'))
      .then(response => response.json())
      .then(data => setQuickStats(data))
      .catch(console.error);
  }, []);

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'mistral':
        return <Bot className="h-4 w-4" />;
      case 'openai':
        return <Brain className="h-4 w-4" />;
      case 'anthropic':
        return <Zap className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'mistral':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'openai':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'anthropic':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <AppLayout
      title={t('ai.dashboard', 'AI Dashboard')}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight" data-testid="page-title">
            {t('ai.dashboard', 'AI Dashboard')}
          </h2>
          <div className="flex gap-2" data-testid="quick-actions-container">
            <Link href={route('ai.services.create')}>
              <Button variant="outline" size="sm" data-testid="create-service-button">
                <Settings className="h-4 w-4 mr-2" />
                {t('ai.create_service', 'Create Service')}
              </Button>
            </Link>
            <Link href={route('ai.analytics.dashboard')}>
              <Button size="sm" data-testid="analytics-button">
                <TrendingUp className="h-4 w-4 mr-2" />
                {t('ai.analytics', 'Analytics')}
              </Button>
            </Link>
          </div>
        </div>
      )}
    >
      <Head title={t('ai.dashboard', 'AI Dashboard')} />

      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="stats-container">
          <Card data-testid="total-services-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('ai.services', 'Services')}
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_services}</div>
              <p className="text-xs text-muted-foreground">
                {t('ai.enabled', 'Enabled')} AI {t('ai.services', 'services')}
              </p>
            </CardContent>
          </Card>

          <Card data-testid="total-models-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('ai.models', 'Models')}
              </CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_models}</div>
              <p className="text-xs text-muted-foreground">
                {t('ai.active', 'Active')} AI {t('ai.models', 'models')}
              </p>
            </CardContent>
          </Card>

          <Card data-testid="total-conversations-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('ai.conversations', 'Conversations')}
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_conversations}</div>
              <p className="text-xs text-muted-foreground">
                {t('ai.active', 'Active')} {t('ai.conversations', 'conversations')}
              </p>
            </CardContent>
          </Card>

          <Card data-testid="total-usage-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('ai.prompt_templates', 'Templates')}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_templates}</div>
              <p className="text-xs text-muted-foreground">
                {t('ai.prompt_templates', 'Prompt templates')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Usage Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t('ai.usage_analytics', 'Usage Analytics')}
              </CardTitle>
              <CardDescription>
                Last 7 days performance overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatNumber(usageStats.total_requests)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('common.requests', 'Requests')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatNumber(usageStats.total_tokens)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('ai.tokens_used', 'Tokens')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(usageStats.total_cost)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('ai.cost', 'Cost')}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {usageStats.success_rate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('ai.success_rate', 'Success Rate')}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>{t('ai.success_rate', 'Success Rate')}</span>
                  <span>{usageStats.success_rate.toFixed(1)}%</span>
                </div>
                <Progress value={usageStats.success_rate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t('ai.services', 'AI Services')}
              </CardTitle>
              <CardDescription>
                {t('ai.service_configuration', 'Service configuration')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getProviderIcon(service.provider)}
                      <div>
                        <div className="font-medium text-sm">{service.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {service.models_count} {t('ai.models', 'models')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {service.is_default && (
                        <Badge variant="outline" className="text-xs">
                          {t('common.default', 'Default')}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`text-xs ${getProviderColor(service.provider)}`}
                      >
                        {service.provider}
                      </Badge>
                      {service.is_enabled ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t">
                <Link href={route('ai.services.index')}>
                  <Button variant="outline" size="sm" className="w-full">
                    {t('common.view_all', 'View All')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                {t('ai.conversation_history', 'Recent Conversations')}
              </CardTitle>
              <CardDescription>
                Latest AI conversations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentConversations.length > 0 ? (
                  recentConversations.map((conversation) => (
                    <div key={conversation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {conversation.title || 'Untitled Conversation'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {conversation.user.name} • {conversation.ai_model.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {conversation.message_count} messages • {formatNumber(conversation.total_tokens)} tokens
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">
                          {new Date(conversation.last_message_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs font-medium">
                          {formatCurrency(conversation.total_cost)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    {t('common.no_results', 'No conversations found')}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <Link href={route('ai.conversations.index')}>
                  <Button variant="outline" size="sm" className="w-full">
                    {t('common.view_all', 'View All')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {t('ai.template_library', 'Popular Templates')}
              </CardTitle>
              <CardDescription>
                Most used prompt templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {popularTemplates.length > 0 ? (
                  popularTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {template.category}
                          {template.is_system && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {t('common.system', 'System')}
                            </Badge>
                          )}
                          {template.is_public && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {t('common.public', 'Public')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatNumber(template.usage_count)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('common.uses', 'uses')}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    {t('common.no_results', 'No templates found')}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <Link href={route('ai.prompt-templates.index')}>
                  <Button variant="outline" size="sm" className="w-full">
                    {t('common.view_all', 'View All')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
