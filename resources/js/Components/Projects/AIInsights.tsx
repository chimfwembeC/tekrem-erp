import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Textarea } from '@/Components/ui/textarea';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Target,
  Users,
  DollarSign,
  Lightbulb,
  Loader2
} from 'lucide-react';
import { Project, ProjectMilestone } from '@/types';

interface AIInsightsProps {
  project: Project;
  milestones?: ProjectMilestone[];
}

interface AIInsight {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description: string;
  recommendation?: string;
  confidence: number;
}

export default function AIInsights({ project, milestones = [] }: AIInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  // Generate AI insights based on project data
  const generateInsights = async () => {
    setIsGenerating(true);
    
    // Simulate AI analysis - in real implementation, this would call the AI service
    setTimeout(() => {
      const generatedInsights: AIInsight[] = [];

      // Progress Analysis
      if (project.progress < 30 && project.deadline) {
        const daysRemaining = project.days_remaining || 0;
        if (daysRemaining < 30) {
          generatedInsights.push({
            type: 'warning',
            title: 'Project Behind Schedule',
            description: `Project is only ${project.progress}% complete with ${daysRemaining} days remaining until deadline.`,
            recommendation: 'Consider reallocating resources or adjusting scope to meet deadline.',
            confidence: 85
          });
        }
      }

      // Budget Analysis
      if (project.budget && project.spent_amount) {
        const budgetUtilization = (project.spent_amount / project.budget) * 100;
        if (budgetUtilization > 80) {
          generatedInsights.push({
            type: 'warning',
            title: 'High Budget Utilization',
            description: `${budgetUtilization.toFixed(1)}% of budget has been spent.`,
            recommendation: 'Monitor remaining expenses closely and consider budget adjustments.',
            confidence: 92
          });
        }
      }

      // Milestone Analysis
      const overdueMilestones = milestones.filter(m => m.status === 'overdue').length;
      if (overdueMilestones > 0) {
        generatedInsights.push({
          type: 'error',
          title: 'Overdue Milestones',
          description: `${overdueMilestones} milestone(s) are overdue.`,
          recommendation: 'Review milestone dependencies and reassign resources if necessary.',
          confidence: 95
        });
      }

      // Team Performance
      if (project.team && project.team.length > 5) {
        generatedInsights.push({
          type: 'info',
          title: 'Large Team Size',
          description: `Project has ${project.team.length} team members.`,
          recommendation: 'Consider implementing sub-teams or clearer role definitions for better coordination.',
          confidence: 70
        });
      }

      // Success Indicators
      if (project.progress > 70 && project.status === 'active') {
        generatedInsights.push({
          type: 'success',
          title: 'Project On Track',
          description: 'Project is progressing well with good completion rate.',
          recommendation: 'Maintain current pace and prepare for final delivery phase.',
          confidence: 88
        });
      }

      // Risk Assessment
      if (project.priority === 'critical' && project.progress < 50) {
        generatedInsights.push({
          type: 'error',
          title: 'Critical Project Risk',
          description: 'High-priority project with low completion rate poses significant risk.',
          recommendation: 'Escalate to management and consider emergency resource allocation.',
          confidence: 90
        });
      }

      setInsights(generatedInsights);
      setIsGenerating(false);
    }, 2000);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'info':
        return <Lightbulb className="h-5 w-5 text-blue-600" />;
      default:
        return <Brain className="h-5 w-5 text-gray-600" />;
    }
  };

  const getInsightBadgeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCustomAnalysis = async () => {
    if (!customPrompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate custom AI analysis
    setTimeout(() => {
      const customInsight: AIInsight = {
        type: 'info',
        title: 'Custom Analysis Result',
        description: `Analysis based on your query: "${customPrompt}"`,
        recommendation: 'This is a simulated response. In production, this would use real AI analysis.',
        confidence: 75
      };
      
      setInsights(prev => [customInsight, ...prev]);
      setCustomPrompt('');
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Project Insights
        </CardTitle>
        <CardDescription>
          AI-powered analysis and recommendations for your project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generate Insights Button */}
        <div className="flex gap-2">
          <Button 
            onClick={generateInsights} 
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Generate AI Insights
              </>
            )}
          </Button>
        </div>

        {/* Custom Analysis */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Ask AI about your project:</label>
          <div className="flex gap-2">
            <Textarea
              placeholder="e.g., What are the main risks for this project? How can we improve team efficiency?"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="flex-1"
              rows={2}
            />
            <Button 
              onClick={handleCustomAnalysis}
              disabled={isGenerating || !customPrompt.trim()}
              variant="outline"
            >
              Ask AI
            </Button>
          </div>
        </div>

        {/* Insights Display */}
        {insights.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium">AI Analysis Results</h4>
            {insights.map((insight, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.type)}
                    <h5 className="font-medium">{insight.title}</h5>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getInsightBadgeColor(insight.type)}>
                      {insight.type}
                    </Badge>
                    <Badge variant="secondary">
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  {insight.description}
                </p>
                
                {insight.recommendation && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Recommendation:</strong> {insight.recommendation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Project Metrics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-sm font-medium">{project.progress}%</div>
            <div className="text-xs text-gray-600">Progress</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-sm font-medium">
              {project.days_remaining || 'N/A'}
            </div>
            <div className="text-xs text-gray-600">Days Left</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-sm font-medium">
              {project.budget && project.spent_amount 
                ? Math.round((project.spent_amount / project.budget) * 100) + '%'
                : 'N/A'
              }
            </div>
            <div className="text-xs text-gray-600">Budget Used</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-sm font-medium">
              {project.team?.length || 0}
            </div>
            <div className="text-xs text-gray-600">Team Size</div>
          </div>
        </div>

        {insights.length === 0 && !isGenerating && (
          <div className="text-center py-8 text-gray-500">
            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Click "Generate AI Insights" to get AI-powered analysis of your project.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
