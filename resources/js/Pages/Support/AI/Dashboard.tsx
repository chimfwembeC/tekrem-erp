import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import {
  Brain,
  TrendingUp,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Users,
  MessageSquare
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';

interface AIAnalysis {
  ticket_id: number;
  ticket_number: string;
  title: string;
  sentiment?: {
    sentiment: string;
    urgency: string;
    emotion: string;
    escalation_risk: string;
  };
  resolution_prediction?: {
    estimated_minutes: number;
    confidence: string;
    complexity: string;
  };
  created_at: string;
}

interface Stats {
  total_analyzed: number;
  sentiment_breakdown: Record<string, number>;
  avg_predicted_resolution: number;
  escalation_risks: Record<string, number>;
}

interface Props {
  recentAnalyses: AIAnalysis[];
  stats: Stats;
}

export default function AIDashboard({ recentAnalyses, stats }: Props) {
  const { t } = useTranslate();
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      case 'neutral':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <AppLayout>
      <Head title={t('support.ai_insights', 'AI Insights Dashboard')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('support.ai_insights', 'AI Insights Dashboard')}
            </h1>
            <p className="text-muted-foreground">
              {t('support.ai_insights_description', 'AI-powered analytics and predictions for support operations')}
            </p>
          </div>
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map((timeframe) => (
              <Button
                key={timeframe}
                variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe(timeframe)}
              >
                {timeframe === '7d' && t('common.last_7_days', 'Last 7 days')}
                {timeframe === '30d' && t('common.last_30_days', 'Last 30 days')}
                {timeframe === '90d' && t('common.last_90_days', 'Last 90 days')}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('support.tickets_analyzed', 'Tickets Analyzed')}
              </CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_analyzed}</div>
              <p className="text-xs text-muted-foreground">
                {t('support.ai_powered_analysis', 'AI-powered analysis')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('support.avg_resolution_time', 'Avg. Predicted Resolution')}
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDuration(stats.avg_predicted_resolution || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('support.ai_prediction', 'AI prediction')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('support.positive_sentiment', 'Positive Sentiment')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(((stats.sentiment_breakdown.positive || 0) / stats.total_analyzed) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {t('support.customer_satisfaction', 'Customer satisfaction')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('support.high_risk_escalations', 'High Risk Escalations')}
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.escalation_risks.high || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('support.require_attention', 'Require attention')}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sentiment Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                {t('support.sentiment_analysis', 'Sentiment Analysis')}
              </CardTitle>
              <CardDescription>
                {t('support.sentiment_breakdown', 'Customer sentiment breakdown from AI analysis')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.sentiment_breakdown).map(([sentiment, count]) => {
                  const percentage = (count / stats.total_analyzed) * 100;
                  return (
                    <div key={sentiment} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getSentimentColor(sentiment)} variant="secondary">
                            {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{count} tickets</span>
                        </div>
                        <span className="text-sm font-medium">{Math.round(percentage)}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Escalation Risk */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {t('support.escalation_risk', 'Escalation Risk')}
              </CardTitle>
              <CardDescription>
                {t('support.escalation_risk_description', 'AI-predicted escalation risk levels')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.escalation_risks).map(([risk, count]) => {
                  const percentage = (count / stats.total_analyzed) * 100;
                  return (
                    <div key={risk} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getUrgencyColor(risk)} variant="secondary">
                            {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
                          </Badge>
                          <span className="text-sm text-muted-foreground">{count} tickets</span>
                        </div>
                        <span className="text-sm font-medium">{Math.round(percentage)}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent AI Analyses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {t('support.recent_ai_analyses', 'Recent AI Analyses')}
            </CardTitle>
            <CardDescription>
              {t('support.recent_ai_analyses_description', 'Latest tickets analyzed by AI with predictions and insights')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAnalyses.length > 0 ? recentAnalyses.map((analysis) => (
                <div key={analysis.ticket_id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">#{analysis.ticket_number}</span>
                        <Badge variant="outline">{analysis.ticket_id}</Badge>
                      </div>
                      <h4 className="font-medium text-sm">{analysis.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(analysis.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Sentiment Analysis */}
                    {analysis.sentiment && (
                      <div>
                        <h5 className="text-sm font-medium mb-2">
                          {t('support.sentiment_analysis', 'Sentiment Analysis')}
                        </h5>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Sentiment:</span>
                            <Badge className={getSentimentColor(analysis.sentiment.sentiment)} variant="secondary">
                              {analysis.sentiment.sentiment}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Urgency:</span>
                            <Badge className={getUrgencyColor(analysis.sentiment.urgency)} variant="secondary">
                              {analysis.sentiment.urgency}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Escalation Risk:</span>
                            <Badge className={getUrgencyColor(analysis.sentiment.escalation_risk)} variant="secondary">
                              {analysis.sentiment.escalation_risk}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Resolution Prediction */}
                    {analysis.resolution_prediction && (
                      <div>
                        <h5 className="text-sm font-medium mb-2">
                          {t('support.resolution_prediction', 'Resolution Prediction')}
                        </h5>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Estimated Time:</span>
                            <Badge variant="outline">
                              {formatDuration(analysis.resolution_prediction.estimated_minutes)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Confidence:</span>
                            <Badge className={getConfidenceColor(analysis.resolution_prediction.confidence)} variant="secondary">
                              {analysis.resolution_prediction.confidence}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Complexity:</span>
                            <Badge variant="outline">
                              {analysis.resolution_prediction.complexity}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">{t('support.no_ai_analyses', 'No AI analyses yet')}</p>
                  <p className="text-xs">{t('support.ai_analyses_description', 'AI analyses will appear here as tickets are processed')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
