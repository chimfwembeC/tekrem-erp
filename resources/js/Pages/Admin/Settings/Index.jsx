import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { toast } from 'sonner';

export default function Index({ settings, groups }) {
  const [activeTab, setActiveTab] = useState(groups[0] || 'general');
  
  const { data, setData, put, processing, errors } = useForm({
    settings: settings.map(setting => ({
      key: setting.key,
      value: setting.value,
    })),
  });

  const updateSetting = (key, value) => {
    const newSettings = [...data.settings];
    const index = newSettings.findIndex(setting => setting.key === key);
    
    if (index !== -1) {
      newSettings[index].value = value;
      setData('settings', newSettings);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    put(route('admin.settings.update'), {
      onSuccess: () => {
        toast.success('Settings updated successfully');
      },
      onError: () => {
        toast.error('Failed to update settings');
      },
    });
  };

  const renderSettingInput = (setting) => {
    const value = data.settings.find(s => s.key === setting.key)?.value || '';
    
    switch (setting.type) {
      case 'textarea':
        return (
          <Textarea
            id={setting.key}
            value={value}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            placeholder={setting.label}
            className="w-full"
          />
        );
      case 'boolean':
        return (
          <Switch
            id={setting.key}
            checked={value === '1' || value === 'true' || value === true}
            onCheckedChange={(checked) => updateSetting(setting.key, checked)}
          />
        );
      case 'select':
        const options = setting.options ? JSON.parse(setting.options) : [];
        return (
          <Select
            value={value}
            onValueChange={(value) => updateSetting(setting.key, value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={setting.label} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'color':
        return (
          <div className="flex gap-2 items-center">
            <Input
              id={setting.key}
              type="color"
              value={value}
              onChange={(e) => updateSetting(setting.key, e.target.value)}
              className="w-12 h-10 p-1"
            />
            <Input
              type="text"
              value={value}
              onChange={(e) => updateSetting(setting.key, e.target.value)}
              className="flex-1"
            />
          </div>
        );
      default:
        return (
          <Input
            id={setting.key}
            type={setting.type === 'number' ? 'number' : 'text'}
            value={value}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
            placeholder={setting.label}
            className="w-full"
          />
        );
    }
  };

  return (
    <AppLayout
      title="Settings"
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Settings
        </h2>
      )}
    >
      <Head title="Settings" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Manage your application settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-6">
                    {groups.map((group) => (
                      <TabsTrigger key={group} value={group} className="capitalize">
                        {group}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {groups.map((group) => (
                    <TabsContent key={group} value={group}>
                      <div className="space-y-6">
                        {settings
                          .filter((setting) => setting.group === group)
                          .map((setting) => (
                            <div key={setting.key} className="grid gap-2">
                              <Label htmlFor={setting.key} className="capitalize">
                                {setting.label}
                              </Label>
                              {renderSettingInput(setting)}
                              {setting.description && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {setting.description}
                                </p>
                              )}
                              {errors[`settings.${setting.key}`] && (
                                <p className="text-sm text-red-500">
                                  {errors[`settings.${setting.key}`]}
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
                
                <div className="mt-6">
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
