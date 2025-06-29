import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { ArrowLeft, Save, Key } from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface PermissionData {
  id: number;
  name: string;
  description: string;
}

interface Props {
  permission: PermissionData;
}

export default function PermissionEdit({ permission }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  
  const { data, setData, put, processing, errors } = useForm({
    name: permission.name,
    description: permission.description,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('admin.permissions.update', permission.id));
  };

  // Check if this is a system permission (should be read-only)
  const isSystemPermission = permission.name.includes('admin.') || 
                            permission.name.includes('settings.') ||
                            ['crm.view', 'finance.view', 'projects.view'].includes(permission.name);

  return (
    <AppLayout
      title="Edit Permission"
      renderHeader={() => (
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <a href={route('admin.permissions.index')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Permissions
            </a>
          </Button>
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Edit Permission: {permission.name}
          </h2>
        </div>
      )}
    >
      <Head title={`Edit Permission: ${permission.name}`} />

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
                {isSystemPermission && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>System Permission:</strong> This is a system permission. Changing the name may affect system functionality. 
                      Only the description can be safely modified.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Permission Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder="e.g., crm.view, finance.create"
                      className={errors.name ? 'border-red-500' : ''}
                      disabled={isSystemPermission}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                    {isSystemPermission && (
                      <p className="text-xs text-gray-500">System permission names cannot be changed</p>
                    )}
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
                </div>
              </CardContent>
            </Card>

            {/* Permission Usage Information */}
            <Card>
              <CardHeader>
                <CardTitle>Permission Usage Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Naming Convention</h4>
                    <p className="text-sm text-gray-600">
                      Permissions should follow the format "module.action" (e.g., crm.view, finance.create). 
                      This helps organize permissions and makes them easier to understand.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Description Best Practices</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Be specific about what the permission allows</li>
                      <li>• Use action-oriented language (e.g., "View customer data", "Create new invoices")</li>
                      <li>• Mention any limitations or scope</li>
                      <li>• Keep it concise but informative</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Common Actions</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                      <span>• view</span>
                      <span>• create</span>
                      <span>• edit</span>
                      <span>• delete</span>
                      <span>• manage</span>
                      <span>• export</span>
                      <span>• import</span>
                      <span>• approve</span>
                    </div>
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
                {processing ? 'Updating...' : 'Update Permission'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
