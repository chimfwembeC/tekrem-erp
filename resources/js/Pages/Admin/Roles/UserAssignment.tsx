import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { ArrowLeft, Users, Shield, UserPlus, UserMinus, Search, Filter } from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Role {
  id: number;
  name: string;
  description: string;
  users_count: number;
  is_system_role: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

interface UserRoleMatrix {
  user: User;
  roles: string[];
}

interface Props {
  roles: Role[];
  userRoleMatrix: UserRoleMatrix[];
}

export default function UserAssignment({ roles, userRoleMatrix }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<'assign' | 'remove'>('assign');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');

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

  const filteredUsers = userRoleMatrix.filter(userMatrix => {
    const matchesSearch = userMatrix.user.name.toLowerCase().includes(search.toLowerCase()) ||
                         userMatrix.user.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = !roleFilter || userMatrix.roles.includes(roleFilter);
    
    return matchesSearch && matchesRole;
  });

  const handleUserSelect = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(userMatrix => userMatrix.user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleRoleSelect = (roleId: number, checked: boolean) => {
    if (checked) {
      setSelectedRoles(prev => [...prev, roleId]);
    } else {
      setSelectedRoles(prev => prev.filter(id => id !== roleId));
    }
  };

  const handleBulkAction = () => {
    if (selectedUsers.length === 0 || selectedRoles.length === 0) {
      alert('Please select users and roles.');
      return;
    }

    router.post(route('admin.roles.bulk-assign-users'), {
      user_ids: selectedUsers,
      role_ids: selectedRoles,
      action: bulkAction,
    }, {
      onSuccess: () => {
        setSelectedUsers([]);
        setSelectedRoles([]);
        setShowBulkDialog(false);
      },
    });
  };

  const openBulkDialog = (action: 'assign' | 'remove') => {
    if (selectedUsers.length === 0) {
      alert('Please select users first.');
      return;
    }
    setBulkAction(action);
    setShowBulkDialog(true);
  };

  return (
    <AppLayout
      title="User Role Assignment"
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
              User Role Assignment
            </h2>
          </div>
          {selectedUsers.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => openBulkDialog('assign')}>
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Roles ({selectedUsers.length})
              </Button>
              <Button variant="outline" onClick={() => openBulkDialog('remove')}>
                <UserMinus className="h-4 w-4 mr-2" />
                Remove Roles ({selectedUsers.length})
              </Button>
            </div>
          )}
        </div>
      )}
    >
      <Head title="User Role Assignment" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{userRoleMatrix.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Roles</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{roles.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Selected Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedUsers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Roles</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {roles.filter(role => role.is_system_role).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">All roles</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Role Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Role Matrix
                <Badge variant="secondary">{filteredUsers.length} users</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-12">
                        <Checkbox
                          checked={filteredUsers.length > 0 && filteredUsers.every(userMatrix => selectedUsers.includes(userMatrix.user.id))}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Current Roles
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Member Since
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map((userMatrix) => (
                      <tr key={userMatrix.user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Checkbox
                            checked={selectedUsers.includes(userMatrix.user.id)}
                            onCheckedChange={(checked) => handleUserSelect(userMatrix.user.id, !!checked)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Users className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {userMatrix.user.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {userMatrix.user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {userMatrix.roles.length > 0 ? (
                              userMatrix.roles.map((roleName) => (
                                <Badge key={roleName} variant={getRoleBadgeVariant(roleName)}>
                                  {roleName}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline">No roles</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(userMatrix.user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    No users found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bulk Action Dialog */}
      <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {bulkAction === 'assign' ? 'Assign Roles' : 'Remove Roles'}
            </DialogTitle>
            <DialogDescription>
              {bulkAction === 'assign' 
                ? `Select roles to assign to ${selectedUsers.length} selected user(s).`
                : `Select roles to remove from ${selectedUsers.length} selected user(s).`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center space-x-3 p-3 border rounded">
                  <Checkbox
                    checked={selectedRoles.includes(role.id)}
                    onCheckedChange={(checked) => handleRoleSelect(role.id, !!checked)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{role.name}</span>
                      <Badge variant={getRoleBadgeVariant(role.name)}>
                        {role.name}
                      </Badge>
                      {role.is_system_role && (
                        <Badge variant="outline">System</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {role.description || 'No description'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {role.users_count} users currently have this role
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkAction} disabled={selectedRoles.length === 0}>
              {bulkAction === 'assign' ? 'Assign Roles' : 'Remove Roles'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
