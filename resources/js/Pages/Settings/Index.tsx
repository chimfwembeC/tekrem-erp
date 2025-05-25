import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
  Settings,
  Users,
  Bell,
  Globe,
  Shield,
  Database,
  Activity,
  Clock,
  HardDrive,
  TrendingUp,
  ChevronRight
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface SettingsIndexProps {
  settings: {
    site_name: string;
    site_description: string;
    timezone: string;
    language: string;
    currency: string;
  };
  stats: {
    total_users: number;
    active_users: number;
    total_clients: number;
    total_leads: number;
    total_conversations: number;
    system_uptime: string;
    storage_used: string;
    database_size: string;
  };
}

export default function SettingsIndex({ settings, stats }: SettingsIndexProps) {
  const route = useRoute();

  const settingsCards = [
    {
      title: 'General Settings',
      description: 'Configure basic system settings, site information, and preferences',
      icon: <Globe className="h-6 w-6" />,
      href: route('settings.general'),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      title: 'User Management',
      description: 'Manage user registration, roles, permissions, and security settings',
      icon: <Users className="h-6 w-6" />,
      href: route('settings.users'),
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      title: 'Notifications',
      description: 'Configure email, SMS, and push notification settings',
      icon: <Bell className="h-6 w-6" />,
      href: route('settings.notifications'),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950'
    },
    {
      title: 'Advanced Settings',
      description: 'System performance, security, integrations, and maintenance tools',
      icon: <Settings className="h-6 w-6" />,
      href: route('settings.advanced'),
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950'
    }
  ];

  const systemStats = [
    {
      title: 'Total Users',
      value: stats.total_users.toLocaleString(),
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: stats.active_users.toLocaleString(),
      icon: <Activity className="h-5 w-5" />,
      color: 'text-green-600'
    },
    {
      title: 'Total Clients',
      value: stats.total_clients.toLocaleString(),
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-purple-600'
    },
    {
      title: 'Conversations',
      value: stats.total_conversations.toLocaleString(),
      icon: <Bell className="h-5 w-5" />,
      color: 'text-orange-600'
    },
    {
      title: 'System Uptime',
      value: stats.system_uptime,
      icon: <Clock className="h-5 w-5" />,
      color: 'text-emerald-600'
    },
    {
      title: 'Storage Used',
      value: stats.storage_used,
      icon: <HardDrive className="h-5 w-5" />,
      color: 'text-red-600'
    }
  ];

  return (
    <AppLayout
      title="Settings"
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                System Settings
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Activity className="h-3 w-3 mr-1" />
              System Healthy
            </Badge>
          </div>
        </div>
      )}
    >
      <Head title="Settings" />

      <div className="space-y-6">
        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Overview
            </CardTitle>
            <CardDescription>
              Current system status and key metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemStats.map((stat, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className={`${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsCards.map((card, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer group">
              <Link href={card.href}>
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center mb-3`}>
                    <div className={card.color}>
                      {card.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {card.title}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {card.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Configure</span>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common administrative tasks and system maintenance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Database className="h-5 w-5" />
                <span className="text-sm">Backup System</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Activity className="h-5 w-5" />
                <span className="text-sm">System Logs</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <HardDrive className="h-5 w-5" />
                <span className="text-sm">Clear Cache</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm">View Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Current Configuration</CardTitle>
            <CardDescription>
              Overview of current system configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Site Name:</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{settings.site_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Timezone:</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{settings.timezone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Language:</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{settings.language.toUpperCase()}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Currency:</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{settings.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Database Size:</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{stats.database_size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Storage Used:</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{stats.storage_used}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
