import React, { useState, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Checkbox } from '@/Components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import {
  Plus,
  Search,
  Shield,
  Users,
  Edit,
  Trash2,
  Eye,
  Filter,
  Key,
  Settings,
  Database,
  FileText,
  BarChart3,
  MessageSquare,
  Briefcase,
  UserCheck,
  Brain,
  Globe,
  CheckSquare,
  Square,
  Wand2,
  UserPlus,
  UserMinus
} from 'lucide-react';
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
  module: string;
  action: string;
  roles: Role[];
  created_at: string;
  updated_at: string;
}

interface Props {
  permissions: Permission[];
  roles: Role[];
  modules: string[];
  filters: {
    search?: string;
    module?: string;
    role?: string;
  };
}

export default function PermissionsIndex({ permissions, roles, modules, filters }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [selectedModule, setSelectedModule] = useState(filters.module || 'all');
  const [selectedRole, setSelectedRole] = useState(filters.role || 'all');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showModuleGenerator, setShowModuleGenerator] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'assign' | 'remove' | 'delete'>('assign');
  const [selectedBulkRoles, setSelectedBulkRoles] = useState<number[]>([]);

  // Module generator state
  const [newModule, setNewModule] = useState('');
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [assignToRoles, setAssignToRoles] = useState<string[]>([]);
  const availableActions = ['view', 'create', 'edit', 'delete', 'manage', 'export', 'import'];

  // Bulk operations handlers
  const handleSelectPermission = (permissionId: number, checked: boolean) => {
    if (checked) {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    } else {
      setSelectedPermissions(selectedPermissions.filter(id => id !== permissionId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPermissions(filteredPermissions.map(p => p.id));
    } else {
      setSelectedPermissions([]);
    }
  };

  const handleBulkAction = () => {
    if (selectedPermissions.length === 0) return;

    if (bulkActionType === 'delete') {
      if (confirm(`Are you sure you want to delete ${selectedPermissions.length} permission(s)?`)) {
        router.delete(route('admin.permissions.bulk-delete'), {
          data: { permission_ids: selectedPermissions },
          onSuccess: () => {
            setSelectedPermissions([]);
            setShowBulkActions(false);
          }
        });
      }
    } else {
      if (selectedBulkRoles.length === 0) {
        alert('Please select at least one role.');
        return;
      }

      router.post(route('admin.permissions.bulk-assign-roles'), {
        permission_ids: selectedPermissions,
        role_ids: selectedBulkRoles,
        action: bulkActionType
      }, {
        onSuccess: () => {
          setSelectedPermissions([]);
          setSelectedBulkRoles([]);
          setShowBulkActions(false);
        }
      });
    }
  };

  const handleGenerateModule = () => {
    if (!newModule || selectedActions.length === 0) {
      alert('Please enter a module name and select at least one action.');
      return;
    }

    router.post(route('admin.permissions.generate-module'), {
      module: newModule,
      actions: selectedActions,
      assign_to_roles: assignToRoles
    }, {
      onSuccess: () => {
        setNewModule('');
        setSelectedActions([]);
        setAssignToRoles([]);
        setShowModuleGenerator(false);
      }
    });
  };

  const handleSearch = () => {
    router.get(route('admin.permissions.index'), {
      search: searchTerm,
      module: selectedModule,
      role: selectedRole
    }, {
      preserveState: true,
      replace: true
    });
  };

  // Extract all roles for display
  const allRoles = useMemo(() => {
    const roleSet = new Set<string>();
    permissions.forEach(permission => {
      permission.roles.forEach(role => {
        roleSet.add(role.name);
      });
    });
    return Array.from(roleSet).sort();
  }, [permissions]);

  // Filter permissions based on search and filters
  const filteredPermissions = useMemo(() => {
    return permissions.filter(permission => {
      const matchesSearch = permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          permission.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesModule = selectedModule === 'all' || permission.module === selectedModule;

      const matchesRole = selectedRole === 'all' ||
                         permission.roles.some(role => role.name === selectedRole);

      return matchesSearch && matchesModule && matchesRole;
    });
  }, [permissions, searchTerm, selectedModule, selectedRole]);

  // Group permissions by module
  const groupedPermissions = useMemo(() => {
    const groups: { [key: string]: Permission[] } = {};

    filteredPermissions.forEach(permission => {
      const module = permission.module || 'system';

      if (!groups[module]) {
        groups[module] = [];
      }
      groups[module].push(permission);
    });

    return groups;
  }, [filteredPermissions]);

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'admin':
        return <Settings className="h-5 w-5" />;
      case 'crm':
        return <Users className="h-5 w-5" />;
      case 'finance':
        return <BarChart3 className="h-5 w-5" />;
      case 'projects':
        return <Briefcase className="h-5 w-5" />;
      case 'support':
        return <MessageSquare className="h-5 w-5" />;
      case 'cms':
        return <FileText className="h-5 w-5" />;
      case 'hr':
        return <UserCheck className="h-5 w-5" />;
      case 'ai':
        return <Brain className="h-5 w-5" />;
      case 'settings':
        return <Settings className="h-5 w-5" />;
      default:
        return <Database className="h-5 w-5" />;
    }
  };

  const getModuleColor = (module: string) => {
    const colors: { [key: string]: string } = {
      admin: 'bg-red-100 text-red-800 border-red-200',
      crm: 'bg-blue-100 text-blue-800 border-blue-200',
      finance: 'bg-green-100 text-green-800 border-green-200',
      projects: 'bg-purple-100 text-purple-800 border-purple-200',
      support: 'bg-orange-100 text-orange-800 border-orange-200',
      cms: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      hr: 'bg-pink-100 text-pink-800 border-pink-200',
      ai: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      settings: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[module] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleDeletePermission = (permission: Permission) => {
    if (confirm(`Are you sure you want to delete the permission "${permission.name}"?`)) {
      router.delete(route('admin.permissions.destroy', permission.id));
    }
  };



  return (
    <AppLayout
      title="Permission Management"
      renderHeader={() => (
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Permission Management
          </h2>
          <Link href={route('admin.permissions.create')}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Permission
            </Button>
          </Link>
        </div>
      )}
    >
      <Head title="Permission Management" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg">
            <div className="p-6">
              {/* Header Section */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  System Permissions
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Manage system permissions and their role assignments. Permissions control what actions users can perform.
                </p>
              </div>

              {/* Filters and Search */}
              <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search permissions..."
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Select value={selectedModule} onValueChange={setSelectedModule}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Modules" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Modules</SelectItem>
                        {modules.map(module => (
                          <SelectItem key={module} value={module}>
                            {module.charAt(0).toUpperCase() + module.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {allRoles.map(role => (
                          <SelectItem key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button onClick={handleSearch} variant="outline">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </div>

                {/* Bulk Actions Toolbar */}
                {selectedPermissions.length > 0 && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        {selectedPermissions.length} permission(s) selected
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={showBulkActions} onOpenChange={setShowBulkActions}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Bulk Actions
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Bulk Permission Actions</DialogTitle>
                            <DialogDescription>
                              Perform actions on {selectedPermissions.length} selected permission(s).
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div>
                              <Label>Action Type</Label>
                              <Select value={bulkActionType} onValueChange={(value: 'assign' | 'remove' | 'delete') => setBulkActionType(value)}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="assign">Assign to Roles</SelectItem>
                                  <SelectItem value="remove">Remove from Roles</SelectItem>
                                  <SelectItem value="delete">Delete Permissions</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {bulkActionType !== 'delete' && (
                              <div>
                                <Label>Select Roles</Label>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                  {roles.map(role => (
                                    <div key={role.id} className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`role-${role.id}`}
                                        checked={selectedBulkRoles.includes(role.id)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            setSelectedBulkRoles([...selectedBulkRoles, role.id]);
                                          } else {
                                            setSelectedBulkRoles(selectedBulkRoles.filter(id => id !== role.id));
                                          }
                                        }}
                                      />
                                      <Label htmlFor={`role-${role.id}`} className="text-sm">
                                        {role.name}
                                      </Label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowBulkActions(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleBulkAction}>
                              {bulkActionType === 'delete' ? 'Delete' : bulkActionType === 'assign' ? 'Assign' : 'Remove'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPermissions([])}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                )}

                {/* Module Generator */}
                <div className="flex justify-between items-center">
                  <div></div>
                  <Dialog open={showModuleGenerator} onOpenChange={setShowModuleGenerator}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate Module Permissions
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Generate Module Permissions</DialogTitle>
                        <DialogDescription>
                          Quickly create a set of permissions for a new module.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="module-name">Module Name</Label>
                          <Input
                            id="module-name"
                            value={newModule}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewModule(e.target.value)}
                            placeholder="e.g., inventory, reports"
                          />
                        </div>

                        <div>
                          <Label>Actions to Generate</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {availableActions.map(action => (
                              <div key={action} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`action-${action}`}
                                  checked={selectedActions.includes(action)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedActions([...selectedActions, action]);
                                    } else {
                                      setSelectedActions(selectedActions.filter(a => a !== action));
                                    }
                                  }}
                                />
                                <Label htmlFor={`action-${action}`} className="text-sm">
                                  {action}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label>Assign to Roles (Optional)</Label>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {roles.map(role => (
                              <div key={role.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`assign-role-${role.id}`}
                                  checked={assignToRoles.includes(role.name)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setAssignToRoles([...assignToRoles, role.name]);
                                    } else {
                                      setAssignToRoles(assignToRoles.filter(r => r !== role.name));
                                    }
                                  }}
                                />
                                <Label htmlFor={`assign-role-${role.id}`} className="text-sm">
                                  {role.name}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowModuleGenerator(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleGenerateModule}>
                          Generate Permissions
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Shield className="h-8 w-8 text-blue-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Permissions</p>
                          <p className="text-2xl font-bold text-gray-900">{permissions.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Database className="h-8 w-8 text-green-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Modules</p>
                          <p className="text-2xl font-bold text-gray-900">{modules.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-purple-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Roles</p>
                          <p className="text-2xl font-bold text-gray-900">{allRoles.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Filter className="h-8 w-8 text-orange-600" />
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Filtered</p>
                          <p className="text-2xl font-bold text-gray-900">{filteredPermissions.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Permissions Display */}
              <Tabs defaultValue="grouped" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="grouped">Grouped by Module</TabsTrigger>
                  <TabsTrigger value="list">List View</TabsTrigger>
                </TabsList>

                {/* Grouped View */}
                <TabsContent value="grouped" className="space-y-6">
                  {Object.keys(groupedPermissions).length === 0 ? (
                    <div className="text-center py-12">
                      <Shield className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                        No permissions found
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Try adjusting your search criteria or create a new permission.
                      </p>
                    </div>
                  ) : (
                    Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                      <Card key={module}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Checkbox
                              checked={modulePermissions.every(p => selectedPermissions.includes(p.id))}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  const newSelected = [...selectedPermissions];
                                  modulePermissions.forEach(p => {
                                    if (!newSelected.includes(p.id)) {
                                      newSelected.push(p.id);
                                    }
                                  });
                                  setSelectedPermissions(newSelected);
                                } else {
                                  setSelectedPermissions(selectedPermissions.filter(id =>
                                    !modulePermissions.some(p => p.id === id)
                                  ));
                                }
                              }}
                            />
                            {getModuleIcon(module)}
                            <span className="capitalize">{module} Module</span>
                            <Badge variant="outline" className={getModuleColor(module)}>
                              {modulePermissions.length} permissions
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Permissions for the {module} module functionality
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {modulePermissions.map((permission) => (
                              <div key={permission.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3 flex-1">
                                    <Checkbox
                                      checked={selectedPermissions.includes(permission.id)}
                                      onCheckedChange={(checked) => handleSelectPermission(permission.id, !!checked)}
                                      className="mt-1"
                                    />
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Key className="h-4 w-4 text-gray-500" />
                                        <h4 className="font-medium text-sm">{permission.name}</h4>
                                      </div>
                                    {permission.description && (
                                      <p className="text-xs text-gray-600 mb-3">{permission.description}</p>
                                    )}

                                    {/* Roles */}
                                    <div className="flex flex-wrap gap-1 mb-3">
                                      {permission.roles.length > 0 ? (
                                        permission.roles.map((role) => (
                                          <Badge key={role.id} variant="secondary" className="text-xs">
                                            {role.name}
                                          </Badge>
                                        ))
                                      ) : (
                                        <Badge variant="outline" className="text-xs text-gray-500">
                                          No roles assigned
                                        </Badge>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex gap-1 ml-2">
                                    <Link href={route('admin.permissions.show', permission.id)}>
                                      <Button variant="ghost" size="sm">
                                        <Eye className="h-3 w-3" />
                                      </Button>
                                    </Link>
                                    <Link href={route('admin.permissions.edit', permission.id)}>
                                      <Button variant="ghost" size="sm">
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                    </Link>
                                    {!permission.name.includes('admin.') && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700"
                                        onClick={() => handleDeletePermission(permission)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* List View */}
                <TabsContent value="list">
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-12">
                                <Checkbox
                                  checked={filteredPermissions.length > 0 && filteredPermissions.every(p => selectedPermissions.includes(p.id))}
                                  onCheckedChange={handleSelectAll}
                                />
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Permission
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Description
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Roles
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Module
                              </th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredPermissions.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                  <Shield className="mx-auto h-12 w-12 text-gray-400" />
                                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                    No permissions found
                                  </h3>
                                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Try adjusting your search criteria or create a new permission.
                                  </p>
                                </td>
                              </tr>
                            ) : (
                              filteredPermissions.map((permission) => {
                                const module = permission.module || 'system';
                                return (
                                  <tr key={permission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <Checkbox
                                        checked={selectedPermissions.includes(permission.id)}
                                        onCheckedChange={(checked) => handleSelectPermission(permission.id, !!checked)}
                                      />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <Key className="h-4 w-4 text-gray-400 mr-2" />
                                        <div>
                                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {permission.name}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                                        {permission.description || 'No description'}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex flex-wrap gap-1">
                                        {permission.roles.length > 0 ? (
                                          permission.roles.map((role) => (
                                            <Badge key={role.id} variant="secondary" className="text-xs">
                                              {role.name}
                                            </Badge>
                                          ))
                                        ) : (
                                          <Badge variant="outline" className="text-xs text-gray-500">
                                            No roles
                                          </Badge>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <Badge variant="outline" className={getModuleColor(module)}>
                                        {module}
                                      </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <div className="flex justify-end gap-1">
                                        <Link href={route('admin.permissions.show', permission.id)}>
                                          <Button variant="ghost" size="sm">
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                        </Link>
                                        <Link href={route('admin.permissions.edit', permission.id)}>
                                          <Button variant="ghost" size="sm">
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                        </Link>
                                        {!permission.name.includes('admin.') && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={() => handleDeletePermission(permission)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
