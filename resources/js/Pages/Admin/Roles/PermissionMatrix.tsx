import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Checkbox } from '@/Components/ui/checkbox';
import { ArrowLeft, Shield, Key, Save, RotateCcw } from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Permission {
  id: number;
  name: string;
  description: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  is_system_role: boolean;
}

interface RoleMatrix {
  role: Role;
  permissions: string[];
}

interface Props {
  matrix: Record<number, RoleMatrix>;
  groupedPermissions: Record<string, Permission[]>;
}

export default function PermissionMatrix({ matrix, groupedPermissions }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Record<number, string[]>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize role permissions from matrix
  React.useEffect(() => {
    const initialPermissions: Record<number, string[]> = {};
    Object.values(matrix).forEach(roleMatrix => {
      initialPermissions[roleMatrix.role.id] = [...roleMatrix.permissions];
    });
    setRolePermissions(initialPermissions);
  }, [matrix]);

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

  const handlePermissionToggle = (roleId: number, permissionName: string, checked: boolean) => {
    setRolePermissions(prev => {
      const updated = { ...prev };
      if (!updated[roleId]) {
        updated[roleId] = [];
      }
      
      if (checked) {
        if (!updated[roleId].includes(permissionName)) {
          updated[roleId] = [...updated[roleId], permissionName];
        }
      } else {
        updated[roleId] = updated[roleId].filter(p => p !== permissionName);
      }
      
      return updated;
    });
    setHasChanges(true);
  };

  const handleModuleToggle = (roleId: number, module: string, checked: boolean) => {
    const modulePermissions = groupedPermissions[module]?.map(p => p.name) || [];
    
    setRolePermissions(prev => {
      const updated = { ...prev };
      if (!updated[roleId]) {
        updated[roleId] = [];
      }
      
      if (checked) {
        // Add all module permissions
        const newPermissions = [...updated[roleId]];
        modulePermissions.forEach(permission => {
          if (!newPermissions.includes(permission)) {
            newPermissions.push(permission);
          }
        });
        updated[roleId] = newPermissions;
      } else {
        // Remove all module permissions
        updated[roleId] = updated[roleId].filter(p => !modulePermissions.includes(p));
      }
      
      return updated;
    });
    setHasChanges(true);
  };

  const saveChanges = () => {
    if (!selectedRole) return;
    
    router.post(route('admin.roles.matrix.update'), {
      role_id: selectedRole,
      permissions: rolePermissions[selectedRole] || [],
    }, {
      onSuccess: () => {
        setHasChanges(false);
      },
    });
  };

  const resetChanges = () => {
    const initialPermissions: Record<number, string[]> = {};
    Object.values(matrix).forEach(roleMatrix => {
      initialPermissions[roleMatrix.role.id] = [...roleMatrix.permissions];
    });
    setRolePermissions(initialPermissions);
    setHasChanges(false);
  };

  const isModuleFullySelected = (roleId: number, module: string) => {
    const modulePermissions = groupedPermissions[module]?.map(p => p.name) || [];
    const currentPermissions = rolePermissions[roleId] || [];
    return modulePermissions.length > 0 && modulePermissions.every(p => currentPermissions.includes(p));
  };

  const isModulePartiallySelected = (roleId: number, module: string) => {
    const modulePermissions = groupedPermissions[module]?.map(p => p.name) || [];
    const currentPermissions = rolePermissions[roleId] || [];
    return modulePermissions.some(p => currentPermissions.includes(p)) && !isModuleFullySelected(roleId, module);
  };

  return (
    <AppLayout
      title="Permission Matrix"
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
              Permission Matrix
            </h2>
          </div>
          {hasChanges && selectedRole && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetChanges}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={saveChanges}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      )}
    >
      <Head title="Permission Matrix" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
          {/* Role Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Select Role to Manage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.values(matrix).map(({ role }) => (
                  <Button
                    key={role.id}
                    variant={selectedRole === role.id ? 'default' : 'outline'}
                    className="h-auto p-4 flex flex-col items-start"
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">{role.name}</span>
                      <Badge variant={getRoleBadgeVariant(role.name)} className="text-xs">
                        {role.name}
                      </Badge>
                    </div>
                    <p className="text-xs text-left opacity-70">
                      {role.description || 'No description'}
                    </p>
                    <p className="text-xs text-left opacity-70 mt-1">
                      {rolePermissions[role.id]?.length || 0} permissions
                    </p>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Permission Matrix */}
          {selectedRole && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Permissions for {matrix[selectedRole]?.role.name}
                  {matrix[selectedRole]?.role.is_system_role && (
                    <Badge variant="outline">System Role</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(groupedPermissions).map(([module, permissions]) => (
                    <div key={module} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isModuleFullySelected(selectedRole, module)}
                            indeterminate={isModulePartiallySelected(selectedRole, module)}
                            onCheckedChange={(checked) => handleModuleToggle(selectedRole, module, !!checked)}
                          />
                          <h3 className="font-medium text-lg capitalize">{module} Module</h3>
                          <Badge variant="secondary">
                            {permissions.length} permissions
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {permissions.map((permission) => (
                          <div key={permission.id} className="flex items-start space-x-3 p-3 border rounded">
                            <Checkbox
                              checked={rolePermissions[selectedRole]?.includes(permission.name) || false}
                              onCheckedChange={(checked) => handlePermissionToggle(selectedRole, permission.name, !!checked)}
                            />
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
              </CardContent>
            </Card>
          )}

          {!selectedRole && (
            <Card>
              <CardContent className="p-12 text-center">
                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  Select a Role
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Choose a role above to view and manage its permissions.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
