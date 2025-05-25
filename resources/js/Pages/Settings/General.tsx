import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { ArrowLeft, Globe, Save } from 'lucide-react';
import { toast } from 'sonner';
import useRoute from '@/Hooks/useRoute';

interface GeneralSettingsProps {
  settings: {
    site_name: string;
    site_description: string;
    site_url: string;
    admin_email: string;
    timezone: string;
    date_format: string;
    time_format: string;
    currency: string;
    language: string;
  };
}

export default function GeneralSettings({ settings }: GeneralSettingsProps) {
  const route = useRoute();
  
  const { data, setData, put, processing, errors, reset } = useForm({
    site_name: settings.site_name,
    site_description: settings.site_description,
    site_url: settings.site_url,
    admin_email: settings.admin_email,
    timezone: settings.timezone,
    date_format: settings.date_format,
    time_format: settings.time_format,
    currency: settings.currency,
    language: settings.language,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    put(route('settings.general.update'), {
      onSuccess: () => {
        toast.success('Settings updated!', {
          description: 'General settings have been saved successfully.'
        });
      },
      onError: () => {
        toast.error('Failed to update settings', {
          description: 'Please check the form for errors and try again.'
        });
      }
    });
  };

  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago', label: 'Central Time (CT)' },
    { value: 'America/Denver', label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London', label: 'London (GMT)' },
    { value: 'Europe/Paris', label: 'Paris (CET)' },
    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  ];

  const currencies = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'JPY', label: 'Japanese Yen (JPY)' },
    { value: 'CAD', label: 'Canadian Dollar (CAD)' },
    { value: 'AUD', label: 'Australian Dollar (AUD)' },
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
  ];

  return (
    <AppLayout
      title="General Settings"
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                General Settings
              </h2>
            </div>
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={processing}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {processing ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    >
      <Head title="General Settings" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Site Information */}
        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
            <CardDescription>
              Basic information about your site and organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="site_name">Site Name</Label>
                <Input
                  id="site_name"
                  value={data.site_name}
                  onChange={(e) => setData('site_name', e.target.value)}
                  placeholder="Enter site name"
                />
                {errors.site_name && (
                  <p className="text-sm text-red-600">{errors.site_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_url">Site URL</Label>
                <Input
                  id="site_url"
                  type="url"
                  value={data.site_url}
                  onChange={(e) => setData('site_url', e.target.value)}
                  placeholder="https://example.com"
                />
                {errors.site_url && (
                  <p className="text-sm text-red-600">{errors.site_url}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_description">Site Description</Label>
              <Textarea
                id="site_description"
                value={data.site_description}
                onChange={(e) => setData('site_description', e.target.value)}
                placeholder="Brief description of your site"
                rows={3}
              />
              {errors.site_description && (
                <p className="text-sm text-red-600">{errors.site_description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin_email">Administrator Email</Label>
              <Input
                id="admin_email"
                type="email"
                value={data.admin_email}
                onChange={(e) => setData('admin_email', e.target.value)}
                placeholder="admin@example.com"
              />
              {errors.admin_email && (
                <p className="text-sm text-red-600">{errors.admin_email}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Localization */}
        <Card>
          <CardHeader>
            <CardTitle>Localization</CardTitle>
            <CardDescription>
              Configure timezone, language, and regional settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={data.timezone} onValueChange={(value) => setData('timezone', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.timezone && (
                  <p className="text-sm text-red-600">{errors.timezone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={data.language} onValueChange={(value) => setData('language', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.language && (
                  <p className="text-sm text-red-600">{errors.language}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={data.currency} onValueChange={(value) => setData('currency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((curr) => (
                      <SelectItem key={curr.value} value={curr.value}>
                        {curr.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.currency && (
                  <p className="text-sm text-red-600">{errors.currency}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_format">Date Format</Label>
                <Select value={data.date_format} onValueChange={(value) => setData('date_format', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Y-m-d">YYYY-MM-DD</SelectItem>
                    <SelectItem value="m/d/Y">MM/DD/YYYY</SelectItem>
                    <SelectItem value="d/m/Y">DD/MM/YYYY</SelectItem>
                    <SelectItem value="d-m-Y">DD-MM-YYYY</SelectItem>
                  </SelectContent>
                </Select>
                {errors.date_format && (
                  <p className="text-sm text-red-600">{errors.date_format}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time_format">Time Format</Label>
                <Select value={data.time_format} onValueChange={(value) => setData('time_format', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="H:i:s">24 Hour (HH:MM:SS)</SelectItem>
                    <SelectItem value="h:i:s A">12 Hour (HH:MM:SS AM/PM)</SelectItem>
                    <SelectItem value="H:i">24 Hour (HH:MM)</SelectItem>
                    <SelectItem value="h:i A">12 Hour (HH:MM AM/PM)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.time_format && (
                  <p className="text-sm text-red-600">{errors.time_format}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </AppLayout>
  );
}
