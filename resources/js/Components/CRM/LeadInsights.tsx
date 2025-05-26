import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Progress } from '@/Components/ui/progress';
import {
  Bot,
  TrendingUp,
  TrendingDown,
  Target,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  X,
  Building,
  Users,
  Briefcase,
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';

interface LeadInsights {
  scoring?: {
    score: number;
    grade: string;
    qualification: string;
    conversion_probability: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    next_steps: string[];
    priority: string;
    reasoning: string;
  };
  company_enrichment?: {
    industry: string;
    sub_industry: string;
    company_size: string;
    employee_range: string;
    business_model: string;
    key_services: string[];
    technologies: string[];
    pain_points: string[];
    opportunities: string[];
    decision_makers: string[];
    sales_approach: string;
    confidence: number;
  };
}

interface Props {
  insights: LeadInsights;
  onDismiss: () => void;
  loading?: boolean;
}

export default function LeadInsights({ insights, onDismiss, loading = false }: Props) {
  const { t } = useTranslate();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Bot className="h-5 w-5 animate-pulse" />
            AI Lead Analysis
          </CardTitle>
          <CardDescription>
            Analyzing lead information...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-blue-600">Getting AI insights...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-700">AI Lead Analysis</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          AI-powered lead scoring and company insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Lead Scoring */}
        {insights.scoring && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-sm">Lead Scoring</span>
            </div>
            
            <div className="bg-white rounded-lg p-4 border space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`text-2xl font-bold ${getScoreColor(insights.scoring.score)}`}>
                    {insights.scoring.score}
                  </div>
                  <div className="space-y-1">
                    <Badge className={getGradeBadgeColor(insights.scoring.grade)} variant="secondary">
                      Grade {insights.scoring.grade}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {insights.scoring.qualification} lead
                    </div>
                  </div>
                </div>
                <Badge className={getPriorityColor(insights.scoring.priority)} variant="secondary">
                  {insights.scoring.priority} priority
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Conversion Probability</span>
                  <span className="font-medium">{Math.round(insights.scoring.conversion_probability * 100)}%</span>
                </div>
                <Progress value={insights.scoring.conversion_probability * 100} className="h-2" />
              </div>

              {insights.scoring.strengths.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Strengths</span>
                  </div>
                  <ul className="text-xs space-y-1">
                    {insights.scoring.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {insights.scoring.weaknesses.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium">Areas for Improvement</span>
                  </div>
                  <ul className="text-xs space-y-1">
                    {insights.scoring.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-amber-600">•</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {insights.scoring.next_steps.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Recommended Next Steps</span>
                  </div>
                  <ul className="text-xs space-y-1">
                    {insights.scoring.next_steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">{insights.scoring.reasoning}</p>
              </div>
            </div>
          </div>
        )}

        {/* Company Enrichment */}
        {insights.company_enrichment && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-green-600" />
              <span className="font-medium text-sm">Company Intelligence</span>
              <Badge className="bg-gray-100 text-gray-800" variant="secondary">
                {Math.round(insights.company_enrichment.confidence * 100)}% confidence
              </Badge>
            </div>
            
            <div className="bg-white rounded-lg p-4 border space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground">Industry</span>
                  <p className="text-sm font-medium">{insights.company_enrichment.industry}</p>
                  {insights.company_enrichment.sub_industry && (
                    <p className="text-xs text-muted-foreground">{insights.company_enrichment.sub_industry}</p>
                  )}
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Company Size</span>
                  <p className="text-sm font-medium">{insights.company_enrichment.company_size}</p>
                  <p className="text-xs text-muted-foreground">{insights.company_enrichment.employee_range} employees</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Business Model</span>
                  <p className="text-sm font-medium">{insights.company_enrichment.business_model}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Sales Approach</span>
                  <p className="text-sm font-medium">{insights.company_enrichment.sales_approach}</p>
                </div>
              </div>

              {insights.company_enrichment.pain_points.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Potential Pain Points</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {insights.company_enrichment.pain_points.map((point, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {point}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {insights.company_enrichment.opportunities.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Opportunities</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {insights.company_enrichment.opportunities.map((opportunity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {opportunity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {insights.company_enrichment.decision_makers.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Typical Decision Makers</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {insights.company_enrichment.decision_makers.map((role, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Powered by Mistral AI
        </div>
      </CardContent>
    </Card>
  );
}
