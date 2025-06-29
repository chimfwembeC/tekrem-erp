import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { ArrowLeft, Edit, Trash2, Shield, Key, Users, Calendar } from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Permission {
  id: number;
  name: string;
  description: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface RoleData {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
  users: User[];
  users_count: number;
  permissions_count: number;
  created_at: string;
  updated_at: string;
}

interface Props {
  role: RoleData;
}

export default function RoleShow({ role }: Props) {
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

  const isSystemRole = ['admin', 'manager', 'staff', 'customer'].includes(role.name);

  const handleDelete = () => {
    if (isSystemRole) {
      alert('System roles cannot be deleted.');
      return;
    }
    
    if (role.users_count > 0) {
      alert('Cannot delete role that has users assigned to it. Please reassign users first.');
      return;
    }

    if (confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      router.delete(route('admin.roles.destroy', role.id));
    }
  };

  // Group permissions by module
  const groupedPermissions = role.permissions.reduce((groups, permission) => {
    const module = permission.name.split('.')[0] || 'general';
    if (!groups[module]) {
      groups[module] = [];
    }
    groups[module].push(permission);
    return groups;
  }, {} as Record<string, Permission[]>);

  return (
    <AppLayout
      title={`Role: ${role.name}`}
      renderHeader={() => (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <a href={route('admin.roles.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Roles
              </a>
            </Button>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              Role Details: {role.name}
            </h2>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href={route('admin.roles.edit', role.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Role
              </a>
            </Button>
            {!isSystemRole && (
              <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Role
              </Button>
            )}
          </div>
        </div>
      )}
    >
      <Head title={`Role: ${role.name}`} />

      <div className="py-12">
        <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Role Name</label>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-medium capitalize">{role.name}</p>
                      <Badge variant={getRoleBadgeVariant(role.name)}>
                        {role.name}
                      </Badge>
                      {isSystemRole && (
                        <Badge variant="outline">System Role</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-lg">{role.description || 'No description provided'}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Statistics</label>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{role.users_count} users</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Key className="h-4 w-4 text-gray-400" />
                        <span>{role.permissions_count} permissions</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-lg">{new Date(role.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-lg">{new Date(role.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Role ID</label>
                    <p className="text-lg font-mono">#{role.id}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assigned Users ({role.users_count})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {role.users && role.users.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {role.users.map((user) => (
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
                    No users assigned
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    No users have been assigned to this role yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Permissions ({role.permissions_count})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {role.permissions.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                    <div key={module} className="border rounded-lg p-4">
                      <h3 className="font-medium text-lg mb-3 capitalize">{module} Module</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {modulePermissions.map((permission) => (
                          <div key={permission.id} className="flex items-start space-x-2 p-2 border rounded">
                            <Key className="h-4 w-4 mt-0.5 text-gray-400" />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">{permission.name}</h4>
                              {permission.description && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {permission.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Key className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    No permissions assigned
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    This role has no permissions assigned to it.
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
