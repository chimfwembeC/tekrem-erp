import React from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Switch } from '@/Components/ui/switch';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Separator } from '@/Components/ui/separator';
import { Bell, Mail, MessageSquare, Calendar, Shield, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  security_alerts: boolean;
  chat_notifications: boolean;
  task_reminders: boolean;
  calendar_reminders: boolean;
  marketing_emails: boolean;
  lead_notifications: boolean;
  client_notifications: boolean;
  communication_notifications: boolean;
  frequency: string;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

interface Props {
  preferences?: NotificationPreferences;
}

export default function NotificationSettings({ preferences }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    email_notifications: preferences?.email_notifications ?? true,
    push_notifications: preferences?.push_notifications ?? true,
    sms_notifications: preferences?.sms_notifications ?? false,
    security_alerts: preferences?.security_alerts ?? true,
    chat_notifications: preferences?.chat_notifications ?? true,
    task_reminders: preferences?.task_reminders ?? true,
    calendar_reminders: preferences?.calendar_reminders ?? true,
    marketing_emails: preferences?.marketing_emails ?? false,
    lead_notifications: preferences?.lead_notifications ?? true,
    client_notifications: preferences?.client_notifications ?? true,
    communication_notifications: preferences?.communication_notifications ?? true,
    frequency: preferences?.frequency ?? 'immediate',
    quiet_hours_enabled: preferences?.quiet_hours_enabled ?? false,
    quiet_hours_start: preferences?.quiet_hours_start ?? '22:00',
    quiet_hours_end: preferences?.quiet_hours_end ?? '08:00',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    put(route('profile.notifications.update'), {
      onSuccess: () => {
        toast.success('Notification settings updated!', {
          description: 'Your notification preferences have been saved successfully.'
        });
      },
      onError: () => {
        toast.error('Failed to update notification settings', {
          description: 'Please try again or contact support if the problem persists.'
        });
      }
    });
  };

  const handleReset = () => {
    put(route('profile.notifications.reset'), {
      onSuccess: () => {
        toast.success('Notification settings reset!', {
          description: 'Your notification preferences have been reset to defaults.'
        });
      },
      onError: () => {
        toast.error('Failed to reset notification settings', {
          description: 'Please try again or contact support if the problem persists.'
        });
      }
    });
  };

  const notificationTypes = [
    {
      id: 'email_notifications',
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: <Mail className="h-5 w-5" />,
    },
    {
      id: 'push_notifications',
      title: 'Push Notifications',
      description: 'Receive browser push notifications',
      icon: <Bell className="h-5 w-5" />,
    },
    {
      id: 'sms_notifications',
      title: 'SMS Notifications',
      description: 'Receive notifications via text message',
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      id: 'security_alerts',
      title: 'Security Alerts',
      description: 'Important security and account notifications',
      icon: <Shield className="h-5 w-5" />,
    },
  ];

  const activityTypes = [
    {
      id: 'chat_notifications',
      title: 'Chat Messages',
      description: 'New messages in conversations and LiveChat',
    },
    {
      id: 'lead_notifications',
      title: 'Lead Updates',
      description: 'New leads and lead status changes',
    },
    {
      id: 'client_notifications',
      title: 'Client Updates',
      description: 'Client activities and status changes',
    },
    {
      id: 'communication_notifications',
      title: 'Communications',
      description: 'New communications and follow-ups',
    },
    {
      id: 'task_reminders',
      title: 'Task Reminders',
      description: 'Reminders for upcoming tasks and deadlines',
    },
    {
      id: 'calendar_reminders',
      title: 'Calendar Events',
      description: 'Upcoming meetings and appointments',
    },
    {
      id: 'marketing_emails',
      title: 'Marketing Emails',
      description: 'Product updates and promotional content',
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Notification Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Methods
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {notificationTypes.map((type) => (
            <div key={type.id} className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-3">
                <div className="text-gray-500">
                  {type.icon}
                </div>
                <div className="space-y-1">
                  <Label htmlFor={type.id} className="text-sm font-medium">
                    {type.title}
                  </Label>
                  <p className="text-sm text-gray-500">
                    {type.description}
                  </p>
                </div>
              </div>
              <Switch
                id={type.id}
                checked={data[type.id as keyof typeof data] as boolean}
                onCheckedChange={(checked) => setData(type.id as keyof typeof data, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Activity Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Notifications</CardTitle>
          <CardDescription>
            Configure which activities trigger notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activityTypes.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between space-x-2">
              <div className="space-y-1">
                <Label htmlFor={activity.id} className="text-sm font-medium">
                  {activity.title}
                </Label>
                <p className="text-sm text-gray-500">
                  {activity.description}
                </p>
              </div>
              <Switch
                id={activity.id}
                checked={data[activity.id as keyof typeof data] as boolean}
                onCheckedChange={(checked) => setData(activity.id as keyof typeof data, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Notification Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Frequency</CardTitle>
          <CardDescription>
            Control how often you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">Notification Frequency</Label>
            <Select value={data.frequency} onValueChange={(value) => setData('frequency', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="hourly">Hourly Digest</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Digest</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="quiet_hours_enabled" className="text-sm font-medium">
                  Quiet Hours
                </Label>
                <p className="text-sm text-gray-500">
                  Disable notifications during specific hours
                </p>
              </div>
              <Switch
                id="quiet_hours_enabled"
                checked={data.quiet_hours_enabled}
                onCheckedChange={(checked) => setData('quiet_hours_enabled', checked)}
              />
            </div>

            {data.quiet_hours_enabled && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="quiet_hours_start">Start Time</Label>
                  <Select value={data.quiet_hours_start} onValueChange={(value) => setData('quiet_hours_start', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <SelectItem key={hour} value={`${hour}:00`}>
                            {hour}:00
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiet_hours_end">End Time</Label>
                  <Select value={data.quiet_hours_end} onValueChange={(value) => setData('quiet_hours_end', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, '0');
                        return (
                          <SelectItem key={hour} value={`${hour}:00`}>
                            {hour}:00
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={processing}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>

        <Button type="submit" disabled={processing} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {processing ? 'Saving...' : 'Save Notification Settings'}
        </Button>
      </div>
    </form>
  );
}
