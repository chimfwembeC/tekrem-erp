import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { ArrowLeft, Save, Key } from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

export default function PermissionCreate() {
  const { t } = useTranslate();
  const route = useRoute();
  
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    module: '',
    action: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('admin.permissions.store'));
  };

  const modules = [
    'crm', 'finance', 'projects', 'support', 'cms', 'hr', 'ai', 'admin', 'settings'
  ];

  const actions = [
    'view', 'create', 'edit', 'delete', 'manage', 'export', 'import'
  ];

  const handleModuleActionChange = () => {
    if (data.module && data.action) {
      setData('name', `${data.module}.${data.action}`);
    }
  };

  React.useEffect(() => {
    handleModuleActionChange();
  }, [data.module, data.action]);

  return (
    <AppLayout
      title="Create Permission"
      renderHeader={() => (
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <a href={route('admin.permissions.index')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Permissions
            </a>
          </Button>
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Create New Permission
          </h2>
        </div>
      )}
    >
      <Head title="Create Permission" />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Permission Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Permission Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Permission Naming:</strong> Permissions follow the format "module.action" (e.g., crm.view, finance.create). 
                    You can use the dropdowns below to generate the name automatically or enter a custom name.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="module">Module</Label>
                    <Select value={data.module} onValueChange={(value) => setData('module', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select module" />
                      </SelectTrigger>
                      <SelectContent>
                        {modules.map((module) => (
                          <SelectItem key={module} value={module}>
                            {module.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="action">Action</Label>
                    <Select value={data.action} onValueChange={(value) => setData('action', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        {actions.map((action) => (
                          <SelectItem key={action} value={action}>
                            {action.charAt(0).toUpperCase() + action.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Permission Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder="e.g., crm.view, finance.create"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Describe what this permission allows users to do"
                    className={errors.description ? 'border-red-500' : ''}
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Permission Examples */}
            <Card>
              <CardHeader>
                <CardTitle>Common Permission Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">CRM Module</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• crm.view - View CRM data</li>
                      <li>• crm.create - Create new CRM records</li>
                      <li>• crm.edit - Edit existing CRM records</li>
                      <li>• crm.delete - Delete CRM records</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Finance Module</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• finance.view - View financial data</li>
                      <li>• finance.create - Create transactions</li>
                      <li>• finance.manage - Full financial management</li>
                      <li>• finance.export - Export financial reports</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Admin Module</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• admin.users - Manage users</li>
                      <li>• admin.roles - Manage roles</li>
                      <li>• admin.permissions - Manage permissions</li>
                      <li>• admin.settings - Manage system settings</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Projects Module</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• projects.view - View projects</li>
                      <li>• projects.create - Create new projects</li>
                      <li>• projects.manage - Full project management</li>
                      <li>• projects.delete - Delete projects</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <a href={route('admin.permissions.index')}>Cancel</a>
              </Button>
              <Button type="submit" disabled={processing}>
                <Save className="h-4 w-4 mr-2" />
                {processing ? 'Creating...' : 'Create Permission'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
