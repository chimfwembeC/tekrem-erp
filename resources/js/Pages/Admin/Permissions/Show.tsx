import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { ArrowLeft, Edit, Trash2, Key, Shield, Users, Calendar } from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Role {
  id: number;
  name: string;
  description: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface PermissionData {
  id: number;
  name: string;
  description: string;
  roles: Role[];
  users: User[];
  roles_count: number;
  users_count: number;
  created_at: string;
  updated_at: string;
}

interface Props {
  permission: PermissionData;
}

export default function PermissionShow({ permission }: Props) {
  const { t } = useTranslate();
  const route = useRoute();

  const getRoleBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      case 'staff':
        return 'secondary';
      case 'customer':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // Check if this is a system permission
  const isSystemPermission = permission.name.includes('admin.') || 
                            permission.name.includes('settings.') ||
                            ['crm.view', 'finance.view', 'projects.view'].includes(permission.name);

  const handleDelete = () => {
    if (isSystemPermission) {
      alert('System permissions cannot be deleted.');
      return;
    }
    
    if (permission.roles_count > 0 || permission.users_count > 0) {
      alert('Cannot delete permission that is assigned to roles or users. Please remove assignments first.');
      return;
    }

    if (confirm('Are you sure you want to delete this permission? This action cannot be undone.')) {
      router.delete(route('admin.permissions.destroy', permission.id));
    }
  };

  // Extract module and action from permission name
  const [module, action] = permission.name.split('.');

  return (
    <AppLayout
      title={`Permission: ${permission.name}`}
      renderHeader={() => (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <a href={route('admin.permissions.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Permissions
              </a>
            </Button>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              Permission Details: {permission.name}
            </h2>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href={route('admin.permissions.edit', permission.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Permission
              </a>
            </Button>
            {!isSystemPermission && (
              <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Permission
              </Button>
            )}
          </div>
        </div>
      )}
    >
      <Head title={`Permission: ${permission.name}`} />

      <div className="py-12">
        <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Permission Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Permission Name</label>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-medium font-mono">{permission.name}</p>
                      {isSystemPermission && (
                        <Badge variant="outline">System Permission</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-lg">{permission.description || 'No description provided'}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Module & Action</label>
                    <div className="flex items-center gap-2">
                      {module && (
                        <Badge variant="secondary">{module.toUpperCase()}</Badge>
                      )}
                      {action && (
                        <Badge variant="outline">{action}</Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Usage Statistics</label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span>{permission.roles_count} roles</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{permission.users_count} direct users</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-lg">{new Date(permission.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-lg">{new Date(permission.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Permission ID</label>
                    <p className="text-lg font-mono">#{permission.id}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Roles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Assigned to Roles ({permission.roles_count})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {permission.roles && permission.roles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {permission.roles.map((role) => (
                    <div key={role.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium capitalize">{role.name}</h3>
                          <Badge variant={getRoleBadgeVariant(role.name)}>
                            {role.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{role.description || 'No description'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    No roles assigned
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    This permission is not assigned to any roles.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Direct User Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Direct User Assignments ({permission.users_count})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {permission.users && permission.users.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {permission.users.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Users className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    No direct user assignments
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    This permission is not directly assigned to any users. Users may have this permission through their roles.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
