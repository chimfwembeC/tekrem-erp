import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import {
  ArrowLeft,
  Download,
  FileText,
  Database,
  Bot,
  Calendar,
  Filter,
  Eye,
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle,
  Loader2,
  FileJson,
  FileSpreadsheet,
  Brain,
  Shield,
  Clock,
  MessageSquare,
  Users,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import useRoute from '@/Hooks/useRoute';

interface AIConversationExportProps {
  statistics?: {
    total_ai_conversations: number;
    ai_services_breakdown: Record<string, number>;
    conversation_outcomes: Record<string, number>;
    average_conversation_length: number;
    most_active_periods: Array<{ date: string; count: number }>;
    ai_response_effectiveness: {
      total_ai_responses: number;
      conversations_resolved_by_ai: number;
      average_response_time_seconds: number;
    };
  };
}

export default function AIConversationExport({ statistics }: AIConversationExportProps) {
  const route = useRoute();
  const [activeTab, setActiveTab] = useState('export');
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [stats, setStats] = useState(statistics);

  // Export form state
  const [exportForm, setExportForm] = useState({
    format: 'json',
    date_from: '',
    date_to: '',
    ai_service: '',
    min_messages: 2,
    anonymize: true,
    include_ip: false,
    include_metadata: true,
    conversation_outcome: '',
  });

  // Load statistics on component mount
  useEffect(() => {
    if (!statistics) {
      loadStatistics();
    }
  }, []);

  const loadStatistics = async () => {
    setIsLoadingStats(true);
    try {
      const response = await fetch(route('crm.ai-conversations.statistics'), {
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      toast.error('Failed to load statistics');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(route('crm.ai-conversations.export'), {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportForm),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai_conversations_export_${new Date().toISOString().split('T')[0]}.${exportForm.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success('Export completed successfully!', {
          description: 'Your AI conversation data has been downloaded.',
        });
      } else {
        const errorData = await response.json();
        toast.error('Export failed', {
          description: errorData.message || 'Please try again.',
        });
      }
    } catch (error) {
      toast.error('Export failed', {
        description: 'An unexpected error occurred.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreview = async () => {
    setIsLoadingPreview(true);
    try {
      const response = await fetch(route('crm.ai-conversations.preview'), {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportForm),
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewData(data);
        toast.success('Preview loaded successfully');
      } else {
        toast.error('Failed to load preview');
      }
    } catch (error) {
      toast.error('Failed to load preview');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const updateExportForm = (field: string, value: any) => {
    setExportForm(prev => ({ ...prev, [field]: value }));
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'json':
        return <FileJson className="h-4 w-4" />;
      case 'csv':
        return <FileText className="h-4 w-4" />;
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'ml-training':
        return <Brain className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <AppLayout
      title="AI Conversation Export"
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.visit(route('settings.advanced'))}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Advanced Settings
            </Button>
            <div className="flex items-center gap-2">
              <Bot className="h-6 w-6 text-purple-600" />
              <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                AI Conversation Export
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              <Shield className="h-3 w-3 mr-1" />
              Admin Only
            </Badge>
          </div>
        </div>
      )}
    >
      <Head title="AI Conversation Export" />

      <div className="space-y-6">
        {/* Overview Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total AI Conversations</p>
                    <p className="text-2xl font-bold">{stats.total_ai_conversations}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Responses</p>
                    <p className="text-2xl font-bold">{stats.ai_response_effectiveness.total_ai_responses}</p>
                  </div>
                  <Bot className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Conversation Length</p>
                    <p className="text-2xl font-bold">{Math.round(stats.average_conversation_length)}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">AI Services</p>
                    <p className="text-2xl font-bold">{Object.keys(stats.ai_services_breakdown).length}</p>
                  </div>
                  <Settings className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          {/* Export Tab */}
          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export AI Conversations
                </CardTitle>
                <CardDescription>
                  Export AI conversation data for analysis, machine learning training, or backup purposes.
                  All exports are anonymized by default to protect user privacy.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Export Format */}
                  <div className="space-y-2">
                    <Label htmlFor="format">Export Format</Label>
                    <Select value={exportForm.format} onValueChange={(value) => updateExportForm('format', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">
                          <div className="flex items-center gap-2">
                            <FileJson className="h-4 w-4" />
                            JSON (Structured Data)
                          </div>
                        </SelectItem>
                        <SelectItem value="csv">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            CSV (Spreadsheet)
                          </div>
                        </SelectItem>
                        <SelectItem value="excel">
                          <div className="flex items-center gap-2">
                            <FileSpreadsheet className="h-4 w-4" />
                            Excel (XLSX)
                          </div>
                        </SelectItem>
                        <SelectItem value="ml-training">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4" />
                            ML Training Format
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-2">
                    <Label htmlFor="date_from">From Date</Label>
                    <Input
                      id="date_from"
                      type="date"
                      value={exportForm.date_from}
                      onChange={(e) => updateExportForm('date_from', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date_to">To Date</Label>
                    <Input
                      id="date_to"
                      type="date"
                      value={exportForm.date_to}
                      onChange={(e) => updateExportForm('date_to', e.target.value)}
                    />
                  </div>

                  {/* AI Service Filter */}
                  <div className="space-y-2">
                    <Label htmlFor="ai_service">AI Service</Label>
                    <Select value={exportForm.ai_service} onValueChange={(value) => updateExportForm('ai_service', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Services" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="empty">All Services</SelectItem>
                        <SelectItem value="mistral">Mistral AI</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Minimum Messages */}
                  <div className="space-y-2">
                    <Label htmlFor="min_messages">Minimum Messages</Label>
                    <Input
                      id="min_messages"
                      type="number"
                      min="1"
                      max="100"
                      value={exportForm.min_messages}
                      onChange={(e) => updateExportForm('min_messages', parseInt(e.target.value))}
                    />
                  </div>

                  {/* Conversation Outcome */}
                  <div className="space-y-2">
                    <Label htmlFor="conversation_outcome">Conversation Status</Label>
                    <Select value={exportForm.conversation_outcome} onValueChange={(value) => updateExportForm('conversation_outcome', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="empty">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                {/* Privacy and Data Options */}
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Privacy & Data Options
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="anonymize">Anonymize Personal Data</Label>
                        <p className="text-sm text-gray-500">Hash names and emails for privacy</p>
                      </div>
                      <Switch
                        id="anonymize"
                        checked={exportForm.anonymize}
                        onCheckedChange={(checked) => updateExportForm('anonymize', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="include_ip">Include IP Addresses</Label>
                        <p className="text-sm text-gray-500">Include guest IP addresses in export</p>
                      </div>
                      <Switch
                        id="include_ip"
                        checked={exportForm.include_ip}
                        onCheckedChange={(checked) => updateExportForm('include_ip', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="include_metadata">Include Metadata</Label>
                        <p className="text-sm text-gray-500">Include AI service and model information</p>
                      </div>
                      <Switch
                        id="include_metadata"
                        checked={exportForm.include_metadata}
                        onCheckedChange={(checked) => updateExportForm('include_metadata', checked)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Export Actions */}
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={handlePreview}
                    disabled={isLoadingPreview}
                    className="flex items-center gap-2"
                  >
                    {isLoadingPreview ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    Preview Data
                  </Button>

                  <Button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center gap-2"
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      getFormatIcon(exportForm.format)
                    )}
                    Export {exportForm.format.toUpperCase()}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics">
            <div className="space-y-6">
              {/* AI Services Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    AI Services Breakdown
                  </CardTitle>
                  <CardDescription>
                    Distribution of AI responses by service provider
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats && Object.keys(stats.ai_services_breakdown).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(stats.ai_services_breakdown).map(([service, count]) => (
                        <div key={service} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Bot className="h-5 w-5 text-purple-600" />
                            <div>
                              <p className="font-medium capitalize">{service}</p>
                              <p className="text-sm text-gray-500">{count} responses</p>
                            </div>
                          </div>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No AI service data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Conversation Outcomes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Conversation Outcomes
                  </CardTitle>
                  <CardDescription>
                    Status distribution of AI conversations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats && Object.keys(stats.conversation_outcomes).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(stats.conversation_outcomes).map(([status, count]) => (
                        <div key={status} className="text-center p-4 border rounded-lg">
                          <p className="text-2xl font-bold">{count}</p>
                          <p className="text-sm text-gray-600 capitalize">{status}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No conversation outcome data available
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Most Active Periods */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Most Active Periods
                  </CardTitle>
                  <CardDescription>
                    Days with highest AI conversation activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats && stats.most_active_periods.length > 0 ? (
                    <div className="space-y-3">
                      {stats.most_active_periods.slice(0, 10).map((period, index) => (
                        <div key={period.date} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <div>
                              <p className="font-medium">{new Date(period.date).toLocaleDateString()}</p>
                              <p className="text-sm text-gray-500">{period.count} conversations</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{period.count}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No activity data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Data Preview
                </CardTitle>
                <CardDescription>
                  Preview a sample of the export data based on your current filters
                </CardDescription>
              </CardHeader>
              <CardContent>
                {previewData ? (
                  <div className="space-y-6">
                    {/* Preview Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Total Conversations</p>
                        <p className="text-xl font-bold">{previewData.total_conversations}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Preview Sample</p>
                        <p className="text-xl font-bold">{previewData.preview_data.length}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Estimated Size</p>
                        <p className="text-xl font-bold">{previewData.estimated_file_size}</p>
                      </div>
                    </div>

                    {/* Sample Data */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Sample Conversations</h4>
                      {previewData.preview_data.slice(0, 3).map((conversation: any, index: number) => (
                        <div key={conversation.conversation_id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium">{conversation.conversation_title}</h5>
                            <Badge variant="outline">{conversation.status}</Badge>
                          </div>
                          <div className="text-sm text-gray-600 mb-3">
                            <p>Messages: {conversation.conversation_metrics.total_messages}</p>
                            <p>AI Responses: {conversation.conversation_metrics.ai_message_count}</p>
                            <p>Services: {conversation.ai_services_used.join(', ')}</p>
                          </div>
                          <div className="space-y-2">
                            {conversation.messages.slice(0, 3).map((message: any, msgIndex: number) => (
                              <div key={message.message_id} className="flex gap-3 p-2 bg-gray-50 rounded">
                                <Badge variant={message.sender_type === 'ai' ? 'default' : 'secondary'} className="text-xs">
                                  {message.sender_type}
                                </Badge>
                                <p className="text-sm flex-1">{message.message.substring(0, 100)}...</p>
                              </div>
                            ))}
                            {conversation.messages.length > 3 && (
                              <p className="text-sm text-gray-500 text-center">
                                ... and {conversation.messages.length - 3} more messages
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No preview data loaded</p>
                    <Button onClick={handlePreview} disabled={isLoadingPreview}>
                      {isLoadingPreview ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Eye className="h-4 w-4 mr-2" />
                      )}
                      Load Preview
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
