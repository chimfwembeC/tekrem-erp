import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Separator } from '@/Components/ui/separator';
import { Badge } from '@/Components/ui/badge';
import { 
  ArrowLeft, 
  Settings, 
  Save, 
  Shield, 
  Zap, 
  Plug, 
  Server,
  Database,
  Trash2,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import useRoute from '@/Hooks/useRoute';

interface AdvancedSettingsProps {
  systemSettings: any;
  securitySettings: any;
  performanceSettings: any;
  integrationSettings: any;
  systemInfo: any;
}

export default function AdvancedSettings({ 
  systemSettings, 
  securitySettings, 
  performanceSettings, 
  integrationSettings,
  systemInfo 
}: AdvancedSettingsProps) {
  const route = useRoute();
  const [activeTab, setActiveTab] = useState('system');
  const [isMaintenanceRunning, setIsMaintenanceRunning] = useState(false);

  // System settings form
  const systemForm = useForm(systemSettings);
  
  // Security settings form
  const securityForm = useForm(securitySettings);
  
  // Performance settings form
  const performanceForm = useForm(performanceSettings);
  
  // Integration settings form
  const integrationForm = useForm(integrationSettings);

  const handleSystemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    systemForm.put(route('settings.advanced.system.update'), {
      onSuccess: () => {
        toast.success('System settings updated!', {
          description: 'Advanced system settings have been saved successfully.'
        });
      },
      onError: () => {
        toast.error('Failed to update settings', {
          description: 'Please check the form for errors and try again.'
        });
      }
    });
  };

  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    securityForm.put(route('settings.advanced.security.update'), {
      onSuccess: () => {
        toast.success('Security settings updated!', {
          description: 'Security configuration has been saved successfully.'
        });
      },
      onError: () => {
        toast.error('Failed to update security settings', {
          description: 'Please check the form for errors and try again.'
        });
      }
    });
  };

  const handlePerformanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performanceForm.put(route('settings.advanced.performance.update'), {
      onSuccess: () => {
        toast.success('Performance settings updated!', {
          description: 'Performance optimization settings have been saved successfully.'
        });
      },
      onError: () => {
        toast.error('Failed to update performance settings', {
          description: 'Please check the form for errors and try again.'
        });
      }
    });
  };

  const handleIntegrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    integrationForm.put(route('settings.advanced.integrations.update'), {
      onSuccess: () => {
        toast.success('Integration settings updated!', {
          description: 'Integration configuration has been saved successfully.'
        });
      },
      onError: () => {
        toast.error('Failed to update integration settings', {
          description: 'Please check the form for errors and try again.'
        });
      }
    });
  };

  const handleMaintenanceAction = async (action: string) => {
    setIsMaintenanceRunning(true);
    
    try {
      const response = await fetch(route(`settings.maintenance.${action}`), {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message, {
          description: result.details?.join(', ') || 'Operation completed successfully'
        });
      } else {
        toast.error(result.message || 'Operation failed');
      }
    } catch (error) {
      toast.error('Maintenance operation failed', {
        description: 'Please try again or check the system logs.'
      });
    } finally {
      setIsMaintenanceRunning(false);
    }
  };

  return (
    <AppLayout
      title="Advanced Settings"
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.visit(route('settings.index'))}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                Advanced Settings
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Admin Only
            </Badge>
          </div>
        </div>
      )}
    >
      <Head title="Advanced Settings" />

      <div className="space-y-6">
        {/* System Information Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              System Information
            </CardTitle>
            <CardDescription>
              Current system status and configuration overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">PHP Version</p>
                <p className="text-sm text-gray-600">{systemInfo.php_version}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Laravel Version</p>
                <p className="text-sm text-gray-600">{systemInfo.laravel_version}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Memory Usage</p>
                <p className="text-sm text-gray-600">{systemInfo.memory_usage}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Cache Status</p>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <p className="text-sm text-gray-600">{systemInfo.cache_status}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Maintenance Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Maintenance
            </CardTitle>
            <CardDescription>
              Quick maintenance actions and system utilities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => handleMaintenanceAction('cache-clear')}
                disabled={isMaintenanceRunning}
              >
                <RefreshCw className={`h-5 w-5 ${isMaintenanceRunning ? 'animate-spin' : ''}`} />
                <span className="text-sm">Clear Cache</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => handleMaintenanceAction('logs-clear')}
                disabled={isMaintenanceRunning}
              >
                <Trash2 className="h-5 w-5" />
                <span className="text-sm">Clear Logs</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => handleMaintenanceAction('backup')}
                disabled={isMaintenanceRunning}
              >
                <Download className="h-5 w-5" />
                <span className="text-sm">Create Backup</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => window.open(route('settings.maintenance.system-info'), '_blank')}
              >
                <Database className="h-5 w-5" />
                <span className="text-sm">System Info</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Plug className="h-4 w-4" />
              Integrations
            </TabsTrigger>
          </TabsList>

          {/* System Settings Tab */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Configuration
                </CardTitle>
                <CardDescription>
                  Configure core system settings and behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSystemSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="debug_mode">Debug Mode</Label>
                          <p className="text-sm text-gray-500">Enable detailed error reporting</p>
                        </div>
                        <Switch
                          id="debug_mode"
                          checked={systemForm.data.debug_mode}
                          onCheckedChange={(checked) => systemForm.setData('debug_mode', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                          <p className="text-sm text-gray-500">Put the application in maintenance mode</p>
                        </div>
                        <Switch
                          id="maintenance_mode"
                          checked={systemForm.data.maintenance_mode}
                          onCheckedChange={(checked) => systemForm.setData('maintenance_mode', checked)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="log_level">Log Level</Label>
                        <Select 
                          value={systemForm.data.log_level} 
                          onValueChange={(value) => systemForm.setData('log_level', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select log level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="emergency">Emergency</SelectItem>
                            <SelectItem value="alert">Alert</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                            <SelectItem value="error">Error</SelectItem>
                            <SelectItem value="warning">Warning</SelectItem>
                            <SelectItem value="notice">Notice</SelectItem>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="debug">Debug</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="max_upload_size">Max Upload Size (MB)</Label>
                        <Input
                          id="max_upload_size"
                          type="number"
                          min="1"
                          max="1024"
                          value={systemForm.data.max_upload_size}
                          onChange={(e) => systemForm.setData('max_upload_size', parseInt(e.target.value))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max_execution_time">Max Execution Time (seconds)</Label>
                        <Input
                          id="max_execution_time"
                          type="number"
                          min="30"
                          max="300"
                          value={systemForm.data.max_execution_time}
                          onChange={(e) => systemForm.setData('max_execution_time', parseInt(e.target.value))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="memory_limit">Memory Limit (MB)</Label>
                        <Input
                          id="memory_limit"
                          type="number"
                          min="128"
                          max="2048"
                          value={systemForm.data.memory_limit}
                          onChange={(e) => systemForm.setData('memory_limit', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Backup Configuration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="auto_backup_enabled">Auto Backup</Label>
                          <p className="text-sm text-gray-500">Enable automatic backups</p>
                        </div>
                        <Switch
                          id="auto_backup_enabled"
                          checked={systemForm.data.auto_backup_enabled}
                          onCheckedChange={(checked) => systemForm.setData('auto_backup_enabled', checked)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="auto_backup_frequency">Backup Frequency</Label>
                        <Select 
                          value={systemForm.data.auto_backup_frequency} 
                          onValueChange={(value) => systemForm.setData('auto_backup_frequency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="backup_retention_days">Retention (days)</Label>
                        <Input
                          id="backup_retention_days"
                          type="number"
                          min="1"
                          max="365"
                          value={systemForm.data.backup_retention_days}
                          onChange={(e) => systemForm.setData('backup_retention_days', parseInt(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={systemForm.processing}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {systemForm.processing ? 'Saving...' : 'Save System Settings'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Configuration
                </CardTitle>
                <CardDescription>
                  Configure security policies and access controls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSecuritySubmit} className="space-y-6">
                  {/* Security settings form content will be added here */}
                  <div className="text-center py-8 text-gray-500">
                    Security settings form content coming soon...
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={securityForm.processing}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {securityForm.processing ? 'Saving...' : 'Save Security Settings'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Settings Tab */}
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Performance Optimization
                </CardTitle>
                <CardDescription>
                  Configure caching, optimization, and performance settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePerformanceSubmit} className="space-y-6">
                  {/* Performance settings form content will be added here */}
                  <div className="text-center py-8 text-gray-500">
                    Performance settings form content coming soon...
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={performanceForm.processing}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {performanceForm.processing ? 'Saving...' : 'Save Performance Settings'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integration Settings Tab */}
          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plug className="h-5 w-5" />
                  Integration Configuration
                </CardTitle>
                <CardDescription>
                  Configure third-party integrations and API settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleIntegrationSubmit} className="space-y-6">
                  {/* Integration settings form content will be added here */}
                  <div className="text-center py-8 text-gray-500">
                    Integration settings form content coming soon...
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={integrationForm.processing}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {integrationForm.processing ? 'Saving...' : 'Save Integration Settings'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
