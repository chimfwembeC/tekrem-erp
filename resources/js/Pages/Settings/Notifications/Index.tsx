import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Switch } from '@/Components/ui/switch';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Separator } from '@/Components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Settings, 
  Save, 
  RotateCcw,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  Webhook,
  Slack
} from 'lucide-react';
import { toast } from 'sonner';
import useRoute from '@/Hooks/useRoute';

interface NotificationSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
  notification_frequency: string;
  email_from_name: string;
  email_from_address: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: string;
}

interface NotificationSettingsProps {
  settings: NotificationSettings;
}

export default function NotificationSettings({ settings }: NotificationSettingsProps) {
  const route = useRoute();
  
  const { data, setData, put, processing, errors, reset } = useForm({
    email_notifications: settings.email_notifications ?? true,
    sms_notifications: settings.sms_notifications ?? false,
    push_notifications: settings.push_notifications ?? true,
    notification_frequency: settings.notification_frequency ?? 'immediate',
    email_from_name: settings.email_from_name ?? 'TekRem ERP',
    email_from_address: settings.email_from_address ?? 'noreply@tekrem.com',
    smtp_host: settings.smtp_host ?? '',
    smtp_port: settings.smtp_port ?? 587,
    smtp_username: settings.smtp_username ?? '',
    smtp_password: settings.smtp_password ?? '',
    smtp_encryption: settings.smtp_encryption ?? 'tls',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    put(route('settings.notifications.update'), {
      onSuccess: () => {
        toast.success('Notification settings updated!', {
          description: 'Your notification settings have been saved successfully.'
        });
      },
      onError: () => {
        toast.error('Failed to update notification settings', {
          description: 'Please check your input and try again.'
        });
      }
    });
  };

  const handleReset = () => {
    reset();
    toast.info('Settings reset to defaults');
  };

  const notificationMethods = [
    {
      id: 'email_notifications',
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: <Mail className="h-5 w-5" />,
      enabled: data.email_notifications
    },
    {
      id: 'sms_notifications',
      title: 'SMS Notifications',
      description: 'Receive notifications via SMS',
      icon: <Smartphone className="h-5 w-5" />,
      enabled: data.sms_notifications
    },
    {
      id: 'push_notifications',
      title: 'Push Notifications',
      description: 'Receive browser push notifications',
      icon: <Bell className="h-5 w-5" />,
      enabled: data.push_notifications
    }
  ];

  const frequencyOptions = [
    { value: 'immediate', label: 'Immediate' },
    { value: 'hourly', label: 'Hourly Digest' },
    { value: 'daily', label: 'Daily Digest' },
    { value: 'weekly', label: 'Weekly Digest' }
  ];

  const encryptionOptions = [
    { value: 'tls', label: 'TLS' },
    { value: 'ssl', label: 'SSL' },
    { value: '', label: 'None' }
  ];

  return (
    <AppLayout
      title="Notification Settings"
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Notification Settings
        </h2>
      )}
    >
      <Head title="Notification Settings" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="methods" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="methods">Notification Methods</TabsTrigger>
                <TabsTrigger value="email">Email Configuration</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              {/* Notification Methods Tab */}
              <TabsContent value="methods">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Methods
                    </CardTitle>
                    <CardDescription>
                      Choose how you want to receive system notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {notificationMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-3">
                          <div className="text-gray-500">
                            {method.icon}
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={method.id} className="text-sm font-medium">
                              {method.title}
                            </Label>
                            <p className="text-sm text-gray-500">
                              {method.description}
                            </p>
                          </div>
                        </div>
                        <Switch
                          id={method.id}
                          checked={method.enabled}
                          onCheckedChange={(checked) => setData(method.id as keyof typeof data, checked)}
                        />
                      </div>
                    ))}

                    <Separator />

                    <div className="space-y-3">
                      <Label htmlFor="notification_frequency" className="text-sm font-medium">
                        Notification Frequency
                      </Label>
                      <Select
                        value={data.notification_frequency}
                        onValueChange={(value) => setData('notification_frequency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencyOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.notification_frequency && (
                        <p className="text-sm text-red-600">{errors.notification_frequency}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Email Configuration Tab */}
              <TabsContent value="email">
                <div className="space-y-6">
                  {/* Email Settings */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Email Settings
                      </CardTitle>
                      <CardDescription>
                        Configure email sender information and SMTP settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="email_from_name">From Name</Label>
                          <Input
                            id="email_from_name"
                            type="text"
                            value={data.email_from_name}
                            onChange={(e) => setData('email_from_name', e.target.value)}
                            placeholder="TekRem ERP"
                          />
                          {errors.email_from_name && (
                            <p className="text-sm text-red-600">{errors.email_from_name}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email_from_address">From Email Address</Label>
                          <Input
                            id="email_from_address"
                            type="email"
                            value={data.email_from_address}
                            onChange={(e) => setData('email_from_address', e.target.value)}
                            placeholder="noreply@tekrem.com"
                          />
                          {errors.email_from_address && (
                            <p className="text-sm text-red-600">{errors.email_from_address}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* SMTP Configuration */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        SMTP Configuration
                      </CardTitle>
                      <CardDescription>
                        Configure SMTP server settings for email delivery
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="smtp_host">SMTP Host</Label>
                          <Input
                            id="smtp_host"
                            type="text"
                            value={data.smtp_host}
                            onChange={(e) => setData('smtp_host', e.target.value)}
                            placeholder="smtp.gmail.com"
                          />
                          {errors.smtp_host && (
                            <p className="text-sm text-red-600">{errors.smtp_host}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="smtp_port">SMTP Port</Label>
                          <Input
                            id="smtp_port"
                            type="number"
                            value={data.smtp_port}
                            onChange={(e) => setData('smtp_port', parseInt(e.target.value) || 587)}
                            placeholder="587"
                          />
                          {errors.smtp_port && (
                            <p className="text-sm text-red-600">{errors.smtp_port}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="smtp_username">SMTP Username</Label>
                          <Input
                            id="smtp_username"
                            type="text"
                            value={data.smtp_username}
                            onChange={(e) => setData('smtp_username', e.target.value)}
                            placeholder="your-email@gmail.com"
                          />
                          {errors.smtp_username && (
                            <p className="text-sm text-red-600">{errors.smtp_username}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="smtp_password">SMTP Password</Label>
                          <Input
                            id="smtp_password"
                            type="password"
                            value={data.smtp_password}
                            onChange={(e) => setData('smtp_password', e.target.value)}
                            placeholder="••••••••"
                          />
                          {errors.smtp_password && (
                            <p className="text-sm text-red-600">{errors.smtp_password}</p>
                          )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="smtp_encryption">Encryption</Label>
                          <Select
                            value={data.smtp_encryption}
                            onValueChange={(value) => setData('smtp_encryption', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select encryption" />
                            </SelectTrigger>
                            <SelectContent>
                              {encryptionOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.smtp_encryption && (
                            <p className="text-sm text-red-600">{errors.smtp_encryption}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription>
                      Configure when and how you receive notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          System Notifications
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">Security Alerts</span>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm">System Warnings</span>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm">Success Messages</span>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          Business Notifications
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Info className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">New Leads</span>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <MessageSquare className="h-4 w-4 text-purple-500" />
                              <span className="text-sm">Chat Messages</span>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Webhook className="h-4 w-4 text-orange-500" />
                              <span className="text-sm">Social Media Updates</span>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={processing}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>

              <Button type="submit" disabled={processing}>
                <Save className="h-4 w-4 mr-2" />
                {processing ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
