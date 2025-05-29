import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Textarea } from '@/Components/ui/textarea';
import { Switch } from '@/Components/ui/switch';
import { Label } from '@/Components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { 
  Brain, 
  Sparkles, 
  Target, 
  Clock,
  Users,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Lightbulb,
  TrendingUp,
  Calendar
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface AIProjectPlanningProps {
  projectData: {
    name: string;
    description: string;
    category: string;
    priority: string;
    budget?: number;
    start_date?: string;
    end_date?: string;
    deadline?: string;
    team_members?: number[];
  };
  onMilestonesGenerated?: (milestones: any[]) => void;
  onTimelineEstimated?: (timeline: any) => void;
  onResourcesRecommended?: (resources: any) => void;
}

interface AIInsight {
  type: 'milestone' | 'timeline' | 'resource' | 'task';
  title: string;
  description: string;
  data: any;
  confidence: number;
}

export default function AIProjectPlanning({ 
  projectData, 
  onMilestonesGenerated,
  onTimelineEstimated,
  onResourcesRecommended 
}: AIProjectPlanningProps) {
  const route = useRoute();
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [taskDescription, setTaskDescription] = useState('');

  const generateMilestones = async () => {
    if (!projectData.name || !projectData.description) {
      toast.error('Please provide project name and description first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(route('ai.project-planning.generate-milestones'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(projectData),
      });

      const result = await response.json();

      if (result.success) {
        const milestones = result.data.milestones;
        setInsights(prev => [...prev, {
          type: 'milestone',
          title: 'AI-Generated Milestones',
          description: `Generated ${milestones.length} milestones based on project requirements`,
          data: milestones,
          confidence: 85,
        }]);
        
        if (onMilestonesGenerated) {
          onMilestonesGenerated(milestones);
        }
        
        toast.success(`Generated ${milestones.length} milestones successfully`);
      } else {
        toast.error(result.message || 'Failed to generate milestones');
      }
    } catch (error) {
      toast.error('Failed to generate milestones');
      console.error('AI milestone generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const estimateTimeline = async () => {
    if (!projectData.name || !projectData.description) {
      toast.error('Please provide project name and description first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(route('ai.project-planning.estimate-timeline'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(projectData),
      });

      const result = await response.json();

      if (result.success) {
        const timeline = result.data;
        setInsights(prev => [...prev, {
          type: 'timeline',
          title: 'AI Timeline Estimation',
          description: `Estimated ${timeline.total_days} days with ${timeline.buffer_percentage}% buffer`,
          data: timeline,
          confidence: 80,
        }]);
        
        if (onTimelineEstimated) {
          onTimelineEstimated(timeline);
        }
        
        toast.success('Timeline estimated successfully');
      } else {
        toast.error(result.message || 'Failed to estimate timeline');
      }
    } catch (error) {
      toast.error('Failed to estimate timeline');
      console.error('AI timeline estimation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const recommendResources = async () => {
    if (!projectData.name || !projectData.description) {
      toast.error('Please provide project name and description first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(route('ai.project-planning.recommend-resources'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(projectData),
      });

      const result = await response.json();

      if (result.success) {
        const resources = result.data;
        setInsights(prev => [...prev, {
          type: 'resource',
          title: 'AI Resource Recommendations',
          description: `Recommended ${resources.team_roles?.length || 0} team roles and budget allocation`,
          data: resources,
          confidence: 75,
        }]);
        
        if (onResourcesRecommended) {
          onResourcesRecommended(resources);
        }
        
        toast.success('Resource recommendations generated successfully');
      } else {
        toast.error(result.message || 'Failed to generate resource recommendations');
      }
    } catch (error) {
      toast.error('Failed to generate resource recommendations');
      console.error('AI resource recommendation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTasks = async () => {
    if (!taskDescription.trim()) {
      toast.error('Please provide a task description');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(route('ai.project-planning.generate-tasks'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          description: taskDescription,
          project_name: projectData.name,
          team_size: projectData.team_members?.length || 1,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const tasks = result.data.tasks;
        setInsights(prev => [...prev, {
          type: 'task',
          title: 'AI-Generated Tasks',
          description: `Generated ${tasks.length} tasks from description`,
          data: tasks,
          confidence: 82,
        }]);
        
        toast.success(`Generated ${tasks.length} tasks successfully`);
        setTaskDescription('');
      } else {
        toast.error(result.message || 'Failed to generate tasks');
      }
    } catch (error) {
      toast.error('Failed to generate tasks');
      console.error('AI task generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateComprehensivePlan = async () => {
    if (!projectData.name || !projectData.description) {
      toast.error('Please provide project name and description first');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(route('ai.project-planning.generate-comprehensive-plan'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify(projectData),
      });

      const result = await response.json();

      if (result.success) {
        const { milestones, timeline, resources } = result.data;
        
        // Clear previous insights and add comprehensive plan
        setInsights([
          {
            type: 'milestone',
            title: 'AI-Generated Milestones',
            description: `Generated ${milestones.length} milestones`,
            data: milestones,
            confidence: 85,
          },
          {
            type: 'timeline',
            title: 'AI Timeline Estimation',
            description: `Estimated ${timeline.total_days} days`,
            data: timeline,
            confidence: 80,
          },
          {
            type: 'resource',
            title: 'AI Resource Recommendations',
            description: `Recommended team structure and budget allocation`,
            data: resources,
            confidence: 75,
          },
        ]);
        
        // Call all callbacks
        if (onMilestonesGenerated) onMilestonesGenerated(milestones);
        if (onTimelineEstimated) onTimelineEstimated(timeline);
        if (onResourcesRecommended) onResourcesRecommended(resources);
        
        toast.success('Comprehensive project plan generated successfully');
        setActiveTab('insights');
      } else {
        toast.error(result.message || 'Failed to generate comprehensive plan');
      }
    } catch (error) {
      toast.error('Failed to generate comprehensive plan');
      console.error('AI comprehensive plan error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'milestone': return <Target className="h-4 w-4" />;
      case 'timeline': return <Clock className="h-4 w-4" />;
      case 'resource': return <Users className="h-4 w-4" />;
      case 'task': return <CheckCircle className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Project Planning Assistant
        </CardTitle>
        <CardDescription>
          Let AI help you plan your project with intelligent milestones, timeline estimation, and resource recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tools">AI Tools</TabsTrigger>
            <TabsTrigger value="insights">Insights ({insights.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-generate"
                checked={autoGenerate}
                onCheckedChange={setAutoGenerate}
              />
              <Label htmlFor="auto-generate">
                Auto-generate milestones when creating project
              </Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={generateComprehensivePlan}
                disabled={isGenerating || !projectData.name}
                className="h-20 flex flex-col items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Sparkles className="h-6 w-6" />
                )}
                <span>Generate Complete Plan</span>
              </Button>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Quick Actions:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateMilestones}
                    disabled={isGenerating}
                  >
                    <Target className="h-4 w-4 mr-1" />
                    Milestones
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={estimateTimeline}
                    disabled={isGenerating}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Timeline
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={generateMilestones}
                disabled={isGenerating}
                variant="outline"
                className="h-16 flex items-center justify-center gap-2"
              >
                <Target className="h-5 w-5" />
                Generate Milestones
              </Button>

              <Button
                onClick={estimateTimeline}
                disabled={isGenerating}
                variant="outline"
                className="h-16 flex items-center justify-center gap-2"
              >
                <Clock className="h-5 w-5" />
                Estimate Timeline
              </Button>

              <Button
                onClick={recommendResources}
                disabled={isGenerating}
                variant="outline"
                className="h-16 flex items-center justify-center gap-2"
              >
                <Users className="h-5 w-5" />
                Recommend Resources
              </Button>

              <div className="space-y-2">
                <Label>Generate Tasks from Description</Label>
                <Textarea
                  placeholder="Describe what needs to be done..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={2}
                />
                <Button
                  onClick={generateTasks}
                  disabled={isGenerating || !taskDescription.trim()}
                  size="sm"
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Generate Tasks
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {insights.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No AI insights generated yet.</p>
                <p className="text-sm">Use the AI tools to generate project insights.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          {getInsightIcon(insight.type)}
                          {insight.title}
                        </CardTitle>
                        <Badge 
                          variant="outline" 
                          className={getConfidenceColor(insight.confidence)}
                        >
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                      <CardDescription>{insight.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {insight.type === 'milestone' && (
                        <div className="space-y-2">
                          {insight.data.map((milestone: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span className="font-medium">{milestone.name}</span>
                              <Badge variant="outline">{milestone.priority}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {insight.type === 'timeline' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Total Duration</p>
                            <p className="font-semibold">{insight.data.total_days} days</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Buffer</p>
                            <p className="font-semibold">{insight.data.buffer_percentage}%</p>
                          </div>
                        </div>
                      )}
                      
                      {insight.type === 'resource' && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Recommended Team Roles:</p>
                          {insight.data.team_roles?.map((role: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <span>{role.role}</span>
                              <Badge variant="outline">{role.count}x</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {insight.type === 'task' && (
                        <div className="space-y-2">
                          {insight.data.map((task: any, idx: number) => (
                            <div key={idx} className="p-2 bg-gray-50 rounded">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{task.title}</span>
                                <Badge variant="outline">{task.priority}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
