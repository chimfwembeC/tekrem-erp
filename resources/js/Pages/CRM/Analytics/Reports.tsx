import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Calendar } from '@/Components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { 
  FileText,
  Download,
  Calendar as CalendarIcon,
  Filter,
  Search,
  TrendingUp,
  Users,
  MessageSquare,
  Target,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  LineChart,
  Table
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

interface ReportFilter {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  reportType: string;
  format: string;
  groupBy: string;
  status: string;
  assignedTo: string;
}

export default function CRMReports() {
  const [filters, setFilters] = useState<ReportFilter>({
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      to: new Date(),
    },
    reportType: 'overview',
    format: 'pdf',
    groupBy: 'daily',
    status: 'all',
    assignedTo: 'all',
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { value: 'overview', label: 'Overview Report', description: 'Complete CRM summary with all metrics' },
    { value: 'leads', label: 'Lead Analysis', description: 'Detailed lead performance and conversion tracking' },
    { value: 'clients', label: 'Client Report', description: 'Client activity, retention, and value analysis' },
    { value: 'communications', label: 'Communication Report', description: 'Communication frequency and effectiveness' },
    { value: 'livechat', label: 'LiveChat Analytics', description: 'Chat performance and customer satisfaction' },
    { value: 'performance', label: 'Team Performance', description: 'Individual and team productivity metrics' },
    { value: 'conversion', label: 'Conversion Funnel', description: 'Lead to client conversion analysis' },
    { value: 'revenue', label: 'Revenue Report', description: 'Financial performance and projections' },
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch(route('crm.analytics.generate-report'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          ...filters,
          dateRange: {
            from: filters.dateRange.from?.toISOString(),
            to: filters.dateRange.to?.toISOString(),
          },
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crm_${filters.reportType}_report_${format(new Date(), 'yyyy-MM-dd')}.${filters.format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('Report generated successfully!');
      } else {
        toast.error('Failed to generate report');
      }
    } catch (error) {
      toast.error('An error occurred while generating the report');
    } finally {
      setIsGenerating(false);
    }
  };

  const quickReports = [
    {
      title: 'Daily Summary',
      description: 'Today\'s activity overview',
      icon: <Clock className="h-5 w-5" />,
      action: () => {
        setFilters(prev => ({
          ...prev,
          reportType: 'overview',
          dateRange: { from: new Date(), to: new Date() },
          groupBy: 'hourly'
        }));
      }
    },
    {
      title: 'Weekly Performance',
      description: 'Last 7 days analysis',
      icon: <TrendingUp className="h-5 w-5" />,
      action: () => {
        setFilters(prev => ({
          ...prev,
          reportType: 'performance',
          dateRange: { 
            from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
            to: new Date() 
          },
          groupBy: 'daily'
        }));
      }
    },
    {
      title: 'Monthly Conversion',
      description: 'Lead to client conversion',
      icon: <Target className="h-5 w-5" />,
      action: () => {
        setFilters(prev => ({
          ...prev,
          reportType: 'conversion',
          dateRange: { 
            from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
            to: new Date() 
          },
          groupBy: 'weekly'
        }));
      }
    },
    {
      title: 'Revenue Analysis',
      description: 'Financial performance',
      icon: <DollarSign className="h-5 w-5" />,
      action: () => {
        setFilters(prev => ({
          ...prev,
          reportType: 'revenue',
          dateRange: { 
            from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), 
            to: new Date() 
          },
          groupBy: 'monthly'
        }));
      }
    },
  ];

  return (
    <AppLayout
      title="CRM Reports"
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            CRM Reports & Analytics
          </h2>
          <Button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      )}
    >
      <Head title="CRM Reports" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Report Configuration */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Report Configuration
                  </CardTitle>
                  <CardDescription>
                    Customize your report parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Report Type */}
                  <div className="space-y-2">
                    <Label>Report Type</Label>
                    <Select 
                      value={filters.reportType} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, reportType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {reportTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateRange.from ? format(filters.dateRange.from, 'MMM dd') : 'From'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.dateRange.from}
                            onSelect={(date) => setFilters(prev => ({ 
                              ...prev, 
                              dateRange: { ...prev.dateRange, from: date } 
                            }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.dateRange.to ? format(filters.dateRange.to, 'MMM dd') : 'To'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={filters.dateRange.to}
                            onSelect={(date) => setFilters(prev => ({ 
                              ...prev, 
                              dateRange: { ...prev.dateRange, to: date } 
                            }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Format */}
                  <div className="space-y-2">
                    <Label>Export Format</Label>
                    <Select 
                      value={filters.format} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, format: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Report</SelectItem>
                        <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                        <SelectItem value="csv">CSV Data</SelectItem>
                        <SelectItem value="json">JSON Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Group By */}
                  <div className="space-y-2">
                    <Label>Group By</Label>
                    <Select 
                      value={filters.groupBy} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, groupBy: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Reports */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Quick Reports</CardTitle>
                  <CardDescription>
                    Pre-configured report templates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quickReports.map((report, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start h-auto p-3"
                      onClick={report.action}
                    >
                      <div className="flex items-start gap-3">
                        {report.icon}
                        <div className="text-left">
                          <div className="font-medium">{report.title}</div>
                          <div className="text-xs text-muted-foreground">{report.description}</div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Report Preview */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Report Preview
                  </CardTitle>
                  <CardDescription>
                    {reportTypes.find(t => t.value === filters.reportType)?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-muted rounded-lg flex items-center justify-center mb-4">
                      <BarChart3 className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Report Preview</h3>
                    <p className="text-muted-foreground mb-4">
                      Configure your report settings and click "Generate Report" to create your custom CRM analytics report.
                    </p>
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        {filters.dateRange.from && filters.dateRange.to ? 
                          `${format(filters.dateRange.from, 'MMM dd')} - ${format(filters.dateRange.to, 'MMM dd')}` :
                          'Select date range'
                        }
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        {filters.format.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
