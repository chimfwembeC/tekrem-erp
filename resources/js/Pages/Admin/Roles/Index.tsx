import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Plus, Users, Shield, Edit, Trash2, Eye } from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Role {
  id: number;
  name: string;
  description: string;
  users_count: number;
  permissions_count: number;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

interface Props {
  roles: Role[];
}

export default function RolesIndex({ roles }: Props) {
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

  return (
    <AppLayout
      title="Role Management"
      renderHeader={() => (
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Role Management
          </h2>
          <Link href={route('admin.roles.create')}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
          </Link>
        </div>
      )}
    >
      <Head title="Role Management" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg">
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  System Roles
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Manage user roles and their permissions. Roles define what users can access and do in the system.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                  <Card key={role.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          {role.name}
                        </CardTitle>
                        <Badge variant={getRoleBadgeVariant(role.name)}>
                          {role.name}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {role.description || 'No description provided'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Users
                          </span>
                          <Badge variant="outline">{role.users_count}</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Shield className="h-4 w-4" />
                            Permissions
                          </span>
                          <Badge variant="outline">{role.permissions_count}</Badge>
                        </div>

                        <div className="pt-3 border-t">
                          <div className="flex gap-2">
                            <Link href={route('admin.roles.show', role.id)}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Link href={route('admin.roles.edit', role.id)}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                            {!['admin', 'manager', 'staff', 'customer'].includes(role.name) && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this role?')) {
                                    // Handle delete
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {roles.length === 0 && (
                <div className="text-center py-12">
                  <Shield className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    No roles found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Get started by creating a new role.
                  </p>
                  <div className="mt-6">
                    <Link href={route('admin.roles.create')}>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Role
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
