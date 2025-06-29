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
  Info,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MessageCircle,
  Bot,
  Eye,
  EyeOff,
  TestTube,
  Loader2,
  Bell,
  Mail,
  Smartphone,
  Webhook
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

  // Integration state
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [connectionStatus, setConnectionStatus] = useState<Record<string, string>>({});
  const [testingConnection, setTestingConnection] = useState<Record<string, boolean>>({});

  // Notification settings form
  const notificationForm = useForm({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    slack_notifications: false,
    webhook_notifications: false,
    notification_frequency: 'immediate',
    admin_alerts: true,
    system_alerts: true,
    security_alerts: true,
    backup_alerts: true,
    error_alerts: true,
    performance_alerts: false,
    webhook_url: '',
    slack_webhook_url: '',
    email_from_name: 'TekRem ERP',
    email_from_address: 'noreply@tekrem.com',
  });

  // System settings form
  const systemForm = useForm(systemSettings);

  // Security settings form
  const securityForm = useForm(securitySettings);

  // Performance settings form
  const performanceForm = useForm(performanceSettings);

  // Integration settings form
  const integrationForm = useForm(integrationSettings);

  // Social platform forms
  const socialPlatformForms = {
    facebook: useForm(integrationSettings.social_platforms?.facebook || {}),
    twitter: useForm(integrationSettings.social_platforms?.twitter || {}),
    instagram: useForm(integrationSettings.social_platforms?.instagram || {}),
    linkedin: useForm(integrationSettings.social_platforms?.linkedin || {}),
    whatsapp: useForm(integrationSettings.social_platforms?.whatsapp || {}),
  };

  // AI service forms
  const aiServiceForms = {
    mistral: useForm(integrationSettings.ai_services?.mistral || {}),
    openai: useForm(integrationSettings.ai_services?.openai || {}),
    anthropic: useForm(integrationSettings.ai_services?.anthropic || {}),
  };

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

  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    notificationForm.put(route('settings.advanced.notifications.update'), {
      onSuccess: () => {
        toast.success('Notification settings updated!', {
          description: 'Notification preferences have been saved successfully.'
        });
      },
      onError: () => {
        toast.error('Failed to update notification settings', {
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

  // Helper functions for integrations
  const toggleApiKeyVisibility = (service: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  const handleSocialPlatformSubmit = (platform: string) => {
    const form = socialPlatformForms[platform as keyof typeof socialPlatformForms];
    const { enabled, ...settings } = form.data;

    router.put(route('settings.advanced.social-platforms.update'), {
      platform,
      enabled,
      settings
    }, {
      onSuccess: () => {
        toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} integration updated!`, {
          description: 'Social platform settings have been saved successfully.'
        });
      },
      onError: () => {
        toast.error('Failed to update social platform settings', {
          description: 'Please check the form for errors and try again.'
        });
      }
    });
  };

  const handleAIServiceSubmit = (service: string) => {
    const form = aiServiceForms[service as keyof typeof aiServiceForms];
    const { enabled, ...settings } = form.data;

    router.put(route('settings.advanced.ai-services.update'), {
      service,
      enabled,
      settings
    }, {
      onSuccess: () => {
        toast.success(`${service.charAt(0).toUpperCase() + service.slice(1)} AI service updated!`, {
          description: 'AI service settings have been saved successfully.'
        });
      },
      onError: () => {
        toast.error('Failed to update AI service settings', {
          description: 'Please check the form for errors and try again.'
        });
      }
    });
  };

  const testConnection = async (type: 'social' | 'ai', service: string) => {
    const key = `${type}-${service}`;
    setTestingConnection(prev => ({ ...prev, [key]: true }));

    try {
      const form = type === 'social'
        ? socialPlatformForms[service as keyof typeof socialPlatformForms]
        : aiServiceForms[service as keyof typeof aiServiceForms];

      const { enabled, ...settings } = form.data;

      const response = await fetch(route('settings.advanced.test-connection'), {
        method: 'POST',
        headers: {
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          service,
          settings
        }),
      });

      const result = await response.json();

      setConnectionStatus(prev => ({
        ...prev,
        [key]: result.status
      }));

      if (result.status === 'connected') {
        toast.success('Connection successful!', {
          description: result.message
        });
      } else {
        toast.error('Connection failed', {
          description: result.message
        });
      }
    } catch (error) {
      setConnectionStatus(prev => ({
        ...prev,
        [key]: 'error'
      }));
      toast.error('Connection test failed', {
        description: 'Please try again or check your settings.'
      });
    } finally {
      setTestingConnection(prev => ({ ...prev, [key]: false }));
    }
  };

  const getConnectionStatusBadge = (type: 'social' | 'ai', service: string) => {
    const key = `${type}-${service}`;
    const status = connectionStatus[key] || 'disconnected';

    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  const getSocialPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="h-5 w-5 text-blue-600" />;
      case 'twitter':
        return <Twitter className="h-5 w-5 text-blue-400" />;
      case 'instagram':
        return <Instagram className="h-5 w-5 text-pink-600" />;
      case 'linkedin':
        return <Linkedin className="h-5 w-5 text-blue-700" />;
      case 'whatsapp':
        return <MessageCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Plug className="h-5 w-5" />;
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => router.visit(route('crm.ai-conversations.export.index'))}
              >
                <Bot className="h-5 w-5 text-purple-600" />
                <span className="text-sm">AI Export</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
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
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
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

          {/* Notification Settings Tab */}
          <TabsContent value="notifications">
            <div className="space-y-6">
              {/* Email Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure email notification settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleNotificationSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email_notifications" className="text-sm font-medium">
                            Email Notifications
                          </Label>
                          <Switch
                            id="email_notifications"
                            checked={notificationForm.data.email_notifications}
                            onCheckedChange={(checked) => notificationForm.setData('email_notifications', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="admin_alerts" className="text-sm font-medium">
                            Admin Alerts
                          </Label>
                          <Switch
                            id="admin_alerts"
                            checked={notificationForm.data.admin_alerts}
                            onCheckedChange={(checked) => notificationForm.setData('admin_alerts', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="system_alerts" className="text-sm font-medium">
                            System Alerts
                          </Label>
                          <Switch
                            id="system_alerts"
                            checked={notificationForm.data.system_alerts}
                            onCheckedChange={(checked) => notificationForm.setData('system_alerts', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="security_alerts" className="text-sm font-medium">
                            Security Alerts
                          </Label>
                          <Switch
                            id="security_alerts"
                            checked={notificationForm.data.security_alerts}
                            onCheckedChange={(checked) => notificationForm.setData('security_alerts', checked)}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="backup_alerts" className="text-sm font-medium">
                            Backup Alerts
                          </Label>
                          <Switch
                            id="backup_alerts"
                            checked={notificationForm.data.backup_alerts}
                            onCheckedChange={(checked) => notificationForm.setData('backup_alerts', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="error_alerts" className="text-sm font-medium">
                            Error Alerts
                          </Label>
                          <Switch
                            id="error_alerts"
                            checked={notificationForm.data.error_alerts}
                            onCheckedChange={(checked) => notificationForm.setData('error_alerts', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="performance_alerts" className="text-sm font-medium">
                            Performance Alerts
                          </Label>
                          <Switch
                            id="performance_alerts"
                            checked={notificationForm.data.performance_alerts}
                            onCheckedChange={(checked) => notificationForm.setData('performance_alerts', checked)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="notification_frequency" className="text-sm font-medium">
                            Notification Frequency
                          </Label>
                          <Select
                            value={notificationForm.data.notification_frequency}
                            onValueChange={(value) => notificationForm.setData('notification_frequency', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Immediate</SelectItem>
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="email_from_name" className="text-sm font-medium">
                          From Name
                        </Label>
                        <Input
                          id="email_from_name"
                          value={notificationForm.data.email_from_name}
                          onChange={(e) => notificationForm.setData('email_from_name', e.target.value)}
                          placeholder="TekRem ERP"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email_from_address" className="text-sm font-medium">
                          From Email Address
                        </Label>
                        <Input
                          id="email_from_address"
                          type="email"
                          value={notificationForm.data.email_from_address}
                          onChange={(e) => notificationForm.setData('email_from_address', e.target.value)}
                          placeholder="noreply@tekrem.com"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={notificationForm.processing}>
                        {notificationForm.processing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Email Settings'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Push & SMS Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Push & SMS Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure push notifications and SMS alert settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Push Notifications</Label>
                          <p className="text-xs text-muted-foreground">Browser push notifications for real-time alerts</p>
                        </div>
                        <Switch
                          checked={notificationForm.data.push_notifications}
                          onCheckedChange={(checked) => notificationForm.setData('push_notifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">SMS Notifications</Label>
                          <p className="text-xs text-muted-foreground">SMS alerts for critical system events</p>
                        </div>
                        <Switch
                          checked={notificationForm.data.sms_notifications}
                          onCheckedChange={(checked) => notificationForm.setData('sms_notifications', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Webhook Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Webhook className="h-5 w-5" />
                    Webhook & Integration Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure webhook endpoints and third-party notification integrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Webhook Notifications</Label>
                          <p className="text-xs text-muted-foreground">Send notifications to external webhooks</p>
                        </div>
                        <Switch
                          checked={notificationForm.data.webhook_notifications}
                          onCheckedChange={(checked) => notificationForm.setData('webhook_notifications', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">Slack Notifications</Label>
                          <p className="text-xs text-muted-foreground">Send alerts to Slack channels</p>
                        </div>
                        <Switch
                          checked={notificationForm.data.slack_notifications}
                          onCheckedChange={(checked) => notificationForm.setData('slack_notifications', checked)}
                        />
                      </div>
                    </div>

                    {notificationForm.data.webhook_notifications && (
                      <div className="space-y-2">
                        <Label htmlFor="webhook_url" className="text-sm font-medium">
                          Webhook URL
                        </Label>
                        <Input
                          id="webhook_url"
                          type="url"
                          value={notificationForm.data.webhook_url}
                          onChange={(e) => notificationForm.setData('webhook_url', e.target.value)}
                          placeholder="https://your-webhook-endpoint.com/notifications"
                        />
                      </div>
                    )}

                    {notificationForm.data.slack_notifications && (
                      <div className="space-y-2">
                        <Label htmlFor="slack_webhook_url" className="text-sm font-medium">
                          Slack Webhook URL
                        </Label>
                        <Input
                          id="slack_webhook_url"
                          type="url"
                          value={notificationForm.data.slack_webhook_url}
                          onChange={(e) => notificationForm.setData('slack_webhook_url', e.target.value)}
                          placeholder="https://hooks.slack.com/services/..."
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Integration Settings Tab */}
          <TabsContent value="integrations">
            <div className="space-y-6">
              {/* Social Platform Integrations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Social Platform Integrations
                  </CardTitle>
                  <CardDescription>
                    Connect with major social media platforms for enhanced customer engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(integrationSettings.social_platforms || {}).map(([platform, config]) => (
                      <div key={platform} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {getSocialPlatformIcon(platform)}
                            <div>
                              <h4 className="font-medium capitalize">{platform}</h4>
                              <p className="text-sm text-gray-500">
                                {platform === 'facebook' && 'Connect with Facebook Pages and Messenger'}
                                {platform === 'twitter' && 'Integrate with Twitter/X for social engagement'}
                                {platform === 'instagram' && 'Connect Instagram Business accounts'}
                                {platform === 'linkedin' && 'Integrate with LinkedIn for professional networking'}
                                {platform === 'whatsapp' && 'Connect WhatsApp Business API'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getConnectionStatusBadge('social', platform)}
                            <Switch
                              checked={socialPlatformForms[platform as keyof typeof socialPlatformForms]?.data?.enabled || false}
                              onCheckedChange={(checked) =>
                                socialPlatformForms[platform as keyof typeof socialPlatformForms]?.setData('enabled', checked)
                              }
                            />
                          </div>
                        </div>

                        {socialPlatformForms[platform as keyof typeof socialPlatformForms]?.data?.enabled && (
                          <div className="space-y-4 border-t pt-4">
                            {/* Platform-specific configuration fields */}
                            {platform === 'facebook' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`${platform}_app_id`}>App ID</Label>
                                  <Input
                                    id={`${platform}_app_id`}
                                    value={socialPlatformForms.facebook.data.app_id || ''}
                                    onChange={(e) => socialPlatformForms.facebook.setData('app_id', e.target.value)}
                                    placeholder="Enter Facebook App ID"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`${platform}_app_secret`}>App Secret</Label>
                                  <div className="relative">
                                    <Input
                                      id={`${platform}_app_secret`}
                                      type={showApiKeys[`${platform}_app_secret`] ? 'text' : 'password'}
                                      value={socialPlatformForms.facebook.data.app_secret || ''}
                                      onChange={(e) => socialPlatformForms.facebook.setData('app_secret', e.target.value)}
                                      placeholder="Enter Facebook App Secret"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                                      onClick={() => toggleApiKeyVisibility(`${platform}_app_secret`)}
                                    >
                                      {showApiKeys[`${platform}_app_secret`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`${platform}_page_access_token`}>Page Access Token</Label>
                                  <div className="relative">
                                    <Input
                                      id={`${platform}_page_access_token`}
                                      type={showApiKeys[`${platform}_page_access_token`] ? 'text' : 'password'}
                                      value={socialPlatformForms.facebook.data.page_access_token || ''}
                                      onChange={(e) => socialPlatformForms.facebook.setData('page_access_token', e.target.value)}
                                      placeholder="Enter Page Access Token"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                                      onClick={() => toggleApiKeyVisibility(`${platform}_page_access_token`)}
                                    >
                                      {showApiKeys[`${platform}_page_access_token`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`${platform}_webhook_verify_token`}>Webhook Verify Token</Label>
                                  <Input
                                    id={`${platform}_webhook_verify_token`}
                                    value={socialPlatformForms.facebook.data.webhook_verify_token || ''}
                                    onChange={(e) => socialPlatformForms.facebook.setData('webhook_verify_token', e.target.value)}
                                    placeholder="Enter Webhook Verify Token"
                                  />
                                </div>
                              </div>
                            )}

                            {platform === 'twitter' && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`${platform}_api_key`}>API Key</Label>
                                  <div className="relative">
                                    <Input
                                      id={`${platform}_api_key`}
                                      type={showApiKeys[`${platform}_api_key`] ? 'text' : 'password'}
                                      value={socialPlatformForms.twitter.data.api_key || ''}
                                      onChange={(e) => socialPlatformForms.twitter.setData('api_key', e.target.value)}
                                      placeholder="Enter Twitter API Key"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                                      onClick={() => toggleApiKeyVisibility(`${platform}_api_key`)}
                                    >
                                      {showApiKeys[`${platform}_api_key`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`${platform}_api_secret`}>API Secret</Label>
                                  <div className="relative">
                                    <Input
                                      id={`${platform}_api_secret`}
                                      type={showApiKeys[`${platform}_api_secret`] ? 'text' : 'password'}
                                      value={socialPlatformForms.twitter.data.api_secret || ''}
                                      onChange={(e) => socialPlatformForms.twitter.setData('api_secret', e.target.value)}
                                      placeholder="Enter Twitter API Secret"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                                      onClick={() => toggleApiKeyVisibility(`${platform}_api_secret`)}
                                    >
                                      {showApiKeys[`${platform}_api_secret`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`${platform}_access_token`}>Access Token</Label>
                                  <div className="relative">
                                    <Input
                                      id={`${platform}_access_token`}
                                      type={showApiKeys[`${platform}_access_token`] ? 'text' : 'password'}
                                      value={socialPlatformForms.twitter.data.access_token || ''}
                                      onChange={(e) => socialPlatformForms.twitter.setData('access_token', e.target.value)}
                                      placeholder="Enter Access Token"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                                      onClick={() => toggleApiKeyVisibility(`${platform}_access_token`)}
                                    >
                                      {showApiKeys[`${platform}_access_token`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`${platform}_access_token_secret`}>Access Token Secret</Label>
                                  <div className="relative">
                                    <Input
                                      id={`${platform}_access_token_secret`}
                                      type={showApiKeys[`${platform}_access_token_secret`] ? 'text' : 'password'}
                                      value={socialPlatformForms.twitter.data.access_token_secret || ''}
                                      onChange={(e) => socialPlatformForms.twitter.setData('access_token_secret', e.target.value)}
                                      placeholder="Enter Access Token Secret"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                                      onClick={() => toggleApiKeyVisibility(`${platform}_access_token_secret`)}
                                    >
                                      {showApiKeys[`${platform}_access_token_secret`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Add similar configurations for other platforms */}
                            {(platform === 'instagram' || platform === 'linkedin' || platform === 'whatsapp') && (
                              <div className="text-center py-4 text-gray-500">
                                Configuration fields for {platform} will be added here...
                              </div>
                            )}

                            <div className="flex justify-between items-center pt-4 border-t">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => testConnection('social', platform)}
                                disabled={testingConnection[`social-${platform}`]}
                                className="flex items-center gap-2"
                              >
                                {testingConnection[`social-${platform}`] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <TestTube className="h-4 w-4" />
                                )}
                                Test Connection
                              </Button>
                              <Button
                                type="button"
                                onClick={() => handleSocialPlatformSubmit(platform)}
                                className="flex items-center gap-2"
                              >
                                <Save className="h-4 w-4" />
                                Save {platform.charAt(0).toUpperCase() + platform.slice(1)} Settings
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Service Integrations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    AI Service Integrations
                  </CardTitle>
                  <CardDescription>
                    Configure AI services for enhanced automation and intelligent features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(integrationSettings.ai_services || {}).map(([service, config]) => (
                      <div key={service} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Bot className="h-5 w-5 text-purple-600" />
                            <div>
                              <h4 className="font-medium capitalize flex items-center gap-2">
                                {service}
                                {service === 'mistral' && (
                                  <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
                                    Default
                                  </Badge>
                                )}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {service === 'mistral' && 'Mistral AI - Advanced language model for intelligent responses'}
                                {service === 'openai' && 'OpenAI GPT - Powerful AI for natural language processing'}
                                {service === 'anthropic' && 'Anthropic Claude - Safe and helpful AI assistant'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getConnectionStatusBadge('ai', service)}
                            <Switch
                              checked={aiServiceForms[service as keyof typeof aiServiceForms]?.data?.enabled || false}
                              onCheckedChange={(checked) =>
                                aiServiceForms[service as keyof typeof aiServiceForms]?.setData('enabled', checked)
                              }
                            />
                          </div>
                        </div>

                        {aiServiceForms[service as keyof typeof aiServiceForms]?.data?.enabled && (
                          <div className="space-y-4 border-t pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor={`${service}_api_key`}>API Key</Label>
                                <div className="relative">
                                  <Input
                                    id={`${service}_api_key`}
                                    type={showApiKeys[`${service}_api_key`] ? 'text' : 'password'}
                                    value={aiServiceForms[service as keyof typeof aiServiceForms]?.data?.api_key || ''}
                                    onChange={(e) =>
                                      aiServiceForms[service as keyof typeof aiServiceForms]?.setData('api_key', e.target.value)
                                    }
                                    placeholder={`Enter ${service.charAt(0).toUpperCase() + service.slice(1)} API Key`}
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                                    onClick={() => toggleApiKeyVisibility(`${service}_api_key`)}
                                  >
                                    {showApiKeys[`${service}_api_key`] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </Button>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`${service}_model`}>Model</Label>
                                <Select
                                  value={aiServiceForms[service as keyof typeof aiServiceForms]?.data?.model || ''}
                                  onValueChange={(value) =>
                                    aiServiceForms[service as keyof typeof aiServiceForms]?.setData('model', value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select model" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {service === 'mistral' && (
                                      <>
                                        <SelectItem value="mistral-large-latest">Mistral Large (Latest)</SelectItem>
                                        <SelectItem value="mistral-medium-latest">Mistral Medium (Latest)</SelectItem>
                                        <SelectItem value="mistral-small-latest">Mistral Small (Latest)</SelectItem>
                                      </>
                                    )}
                                    {service === 'openai' && (
                                      <>
                                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                                      </>
                                    )}
                                    {service === 'anthropic' && (
                                      <>
                                        <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</SelectItem>
                                        <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                                        <SelectItem value="claude-2.1">Claude 2.1</SelectItem>
                                      </>
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`${service}_max_tokens`}>Max Tokens</Label>
                                <Input
                                  id={`${service}_max_tokens`}
                                  type="number"
                                  min="1"
                                  max="8192"
                                  value={aiServiceForms[service as keyof typeof aiServiceForms]?.data?.max_tokens || 4096}
                                  onChange={(e) =>
                                    aiServiceForms[service as keyof typeof aiServiceForms]?.setData('max_tokens', parseInt(e.target.value))
                                  }
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor={`${service}_temperature`}>Temperature</Label>
                                <Input
                                  id={`${service}_temperature`}
                                  type="number"
                                  min="0"
                                  max="2"
                                  step="0.1"
                                  value={aiServiceForms[service as keyof typeof aiServiceForms]?.data?.temperature || 0.7}
                                  onChange={(e) =>
                                    aiServiceForms[service as keyof typeof aiServiceForms]?.setData('temperature', parseFloat(e.target.value))
                                  }
                                />
                              </div>

                              {service === 'openai' && (
                                <div className="space-y-2 md:col-span-2">
                                  <Label htmlFor={`${service}_organization`}>Organization ID (Optional)</Label>
                                  <Input
                                    id={`${service}_organization`}
                                    value={aiServiceForms.openai?.data?.organization || ''}
                                    onChange={(e) => aiServiceForms.openai?.setData('organization', e.target.value)}
                                    placeholder="Enter OpenAI Organization ID"
                                  />
                                </div>
                              )}
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => testConnection('ai', service)}
                                disabled={testingConnection[`ai-${service}`]}
                                className="flex items-center gap-2"
                              >
                                {testingConnection[`ai-${service}`] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <TestTube className="h-4 w-4" />
                                )}
                                Test Connection
                              </Button>
                              <Button
                                type="button"
                                onClick={() => handleAIServiceSubmit(service)}
                                className="flex items-center gap-2"
                              >
                                <Save className="h-4 w-4" />
                                Save {service.charAt(0).toUpperCase() + service.slice(1)} Settings
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* reCAPTCHA Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    reCAPTCHA Integration
                  </CardTitle>
                  <CardDescription>
                    Configure Google reCAPTCHA to protect forms from spam and abuse
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">reCAPTCHA Protection</h4>
                        <p className="text-sm text-muted-foreground">
                          Enable reCAPTCHA verification for enhanced security
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Available
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(route('settings.recaptcha.index'), '_blank')}
                        >
                          Configure reCAPTCHA
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Login Protection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Registration Protection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Password Reset Protection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Contact Form Protection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Guest Chat Protection</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>v2 & v3 Support</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
