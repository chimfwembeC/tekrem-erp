import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { ArrowLeft, Edit, Trash2, User, Shield, Key, Mail, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Role {
  id: number;
  name: string;
  description: string;
}

interface Permission {
  id: number;
  name: string;
  description: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  roles: Role[];
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

interface Props {
  user: UserData;
}

export default function UserShow({ user }: Props) {
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

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      router.delete(route('admin.users.destroy', user.id));
    }
  };

  return (
    <AppLayout
      title={`User: ${user.name}`}
      renderHeader={() => (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <a href={route('admin.users.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </a>
            </Button>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              User Details: {user.name}
            </h2>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <a href={route('admin.users.edit', user.id)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </a>
            </Button>
            <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete User
            </Button>
          </div>
        </div>
      )}
    >
      <Head title={`User: ${user.name}`} />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-lg font-medium">{user.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email Address</label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <p className="text-lg">{user.email}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Email Status</label>
                    <div className="flex items-center gap-2">
                      {user.email_verified_at ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <Badge variant="default">Verified</Badge>
                          <span className="text-sm text-gray-500">
                            on {new Date(user.email_verified_at).toLocaleDateString()}
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <Badge variant="destructive">Unverified</Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Account Created</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-lg">{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-lg">{new Date(user.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">User ID</label>
                    <p className="text-lg font-mono">#{user.id}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Roles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Assigned Roles ({user.roles.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.roles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.roles.map((role) => (
                    <div key={role.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Shield className="h-5 w-5 mt-0.5 text-gray-400" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium capitalize">{role.name}</h3>
                          <Badge variant={getRoleBadgeVariant(role.name)}>
                            {role.name}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {role.description || 'No description available'}
                        </p>
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
                    This user has no roles assigned to them.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Direct Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Direct Permissions ({user.permissions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.permissions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                  {user.permissions.map((permission) => (
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
              ) : (
                <div className="text-center py-8">
                  <Key className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    No direct permissions
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    This user has no direct permissions assigned. Permissions are inherited from roles.
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
