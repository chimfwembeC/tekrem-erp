import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { ArrowLeft, Users, Shield, Clock, User } from 'lucide-react';
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

interface RoleHistoryEntry {
  action: string;
  roles: Role[];
  changed_at: string;
  changed_by: string;
}

interface Props {
  user: User;
  roleHistory: RoleHistoryEntry[];
}

export default function UserRoleHistory({ user, roleHistory }: Props) {
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

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'assigned':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'removed':
        return <Users className="h-4 w-4 text-red-600" />;
      case 'current':
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'assigned':
        return 'text-green-600';
      case 'removed':
        return 'text-red-600';
      case 'current':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <AppLayout
      title={`Role History - ${user.name}`}
      renderHeader={() => (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <a href={route('admin.roles.user-assignment')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to User Assignment
              </a>
            </Button>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              Role History - {user.name}
            </h2>
          </div>
        </div>
      )}
    >
      <Head title={`Role History - ${user.name}`} />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* User Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    User ID: #{user.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Role History Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Role History Timeline
                <Badge variant="secondary">{roleHistory.length} entries</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {roleHistory.length > 0 ? (
                <div className="space-y-6">
                  {roleHistory.map((entry, index) => (
                    <div key={index} className="relative">
                      {/* Timeline line */}
                      {index < roleHistory.length - 1 && (
                        <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200 dark:bg-gray-700"></div>
                      )}
                      
                      <div className="flex items-start space-x-4">
                        {/* Timeline dot */}
                        <div className="flex-shrink-0 w-12 h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center">
                          {getActionIcon(entry.action)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className={`text-sm font-medium ${getActionColor(entry.action)}`}>
                                {entry.action === 'current' ? 'Current Roles' : 
                                 entry.action === 'assigned' ? 'Roles Assigned' : 
                                 entry.action === 'removed' ? 'Roles Removed' : 
                                 'Role Change'}
                              </h4>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(entry.changed_at).toLocaleString()}
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-3">
                              {entry.roles.length > 0 ? (
                                entry.roles.map((role) => (
                                  <Badge key={role.id} variant={getRoleBadgeVariant(role.name)}>
                                    {role.name}
                                  </Badge>
                                ))
                              ) : (
                                <Badge variant="outline">No roles</Badge>
                              )}
                            </div>
                            
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Changed by: {entry.changed_by}
                            </div>
                            
                            {entry.roles.length > 0 && (
                              <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                                <strong>Role descriptions:</strong>
                                <ul className="mt-1 space-y-1">
                                  {entry.roles.map((role) => (
                                    <li key={role.id}>
                                      • <strong>{role.name}:</strong> {role.description || 'No description available'}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Clock className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    No role history available
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    This user has no recorded role changes.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Role Summary */}
          {roleHistory.length > 0 && roleHistory[0].action === 'current' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Current Role Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Active Roles
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {roleHistory[0].roles.map((role) => (
                        <Badge key={role.id} variant={getRoleBadgeVariant(role.name)}>
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                      Role Count
                    </h4>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {roleHistory[0].roles.length}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {roleHistory[0].roles.length === 1 ? 'role assigned' : 'roles assigned'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-center">
                <Button asChild>
                  <a href={route('admin.roles.user-assignment')}>
                    <Users className="h-4 w-4 mr-2" />
                    Manage User Roles
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
