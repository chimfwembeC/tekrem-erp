import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Separator } from '@/Components/ui/separator';
import { ArrowLeft, Users, Save, Shield, Key, Clock } from 'lucide-react';
import { toast } from 'sonner';
import useRoute from '@/Hooks/useRoute';

interface UserSettingsProps {
  settings: {
    allow_registration: boolean;
    require_email_verification: boolean;
    default_role: string;
    password_min_length: number;
    password_require_uppercase: boolean;
    password_require_lowercase: boolean;
    password_require_numbers: boolean;
    password_require_symbols: boolean;
    session_timeout: number;
    max_login_attempts: number;
  };
  roles: Array<{
    name: string;
    label: string;
  }>;
}

export default function UserSettings({ settings, roles }: UserSettingsProps) {
  const route = useRoute();
  
  const { data, setData, put, processing, errors } = useForm({
    allow_registration: settings.allow_registration,
    require_email_verification: settings.require_email_verification,
    default_role: settings.default_role,
    password_min_length: settings.password_min_length,
    password_require_uppercase: settings.password_require_uppercase,
    password_require_lowercase: settings.password_require_lowercase,
    password_require_numbers: settings.password_require_numbers,
    password_require_symbols: settings.password_require_symbols,
    session_timeout: settings.session_timeout,
    max_login_attempts: settings.max_login_attempts,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    put(route('settings.users.update'), {
      onSuccess: () => {
        toast.success('User settings updated!', {
          description: 'User management settings have been saved successfully.'
        });
      },
      onError: () => {
        toast.error('Failed to update settings', {
          description: 'Please check the form for errors and try again.'
        });
      }
    });
  };

  return (
    <AppLayout
      title="User Management Settings"
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                User Management Settings
              </h2>
            </div>
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={processing}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {processing ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    >
      <Head title="User Management Settings" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Registration Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Registration Settings
            </CardTitle>
            <CardDescription>
              Configure user registration and account creation settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="allow_registration" className="text-sm font-medium">
                  Allow User Registration
                </Label>
                <p className="text-sm text-gray-500">
                  Allow new users to register accounts
                </p>
              </div>
              <Switch
                id="allow_registration"
                checked={data.allow_registration}
                onCheckedChange={(checked) => setData('allow_registration', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="require_email_verification" className="text-sm font-medium">
                  Require Email Verification
                </Label>
                <p className="text-sm text-gray-500">
                  Users must verify their email before accessing the system
                </p>
              </div>
              <Switch
                id="require_email_verification"
                checked={data.require_email_verification}
                onCheckedChange={(checked) => setData('require_email_verification', checked)}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="default_role">Default User Role</Label>
              <Select value={data.default_role} onValueChange={(value) => setData('default_role', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select default role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.name} value={role.name}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.default_role && (
                <p className="text-sm text-red-600">{errors.default_role}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Password Requirements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Password Requirements
            </CardTitle>
            <CardDescription>
              Set password complexity and security requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password_min_length">Minimum Password Length</Label>
              <Input
                id="password_min_length"
                type="number"
                min="6"
                max="50"
                value={data.password_min_length}
                onChange={(e) => setData('password_min_length', parseInt(e.target.value))}
              />
              {errors.password_min_length && (
                <p className="text-sm text-red-600">{errors.password_min_length}</p>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Password Complexity Requirements</h4>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="password_require_uppercase" className="text-sm font-medium">
                    Require Uppercase Letters
                  </Label>
                  <p className="text-sm text-gray-500">
                    Password must contain at least one uppercase letter
                  </p>
                </div>
                <Switch
                  id="password_require_uppercase"
                  checked={data.password_require_uppercase}
                  onCheckedChange={(checked) => setData('password_require_uppercase', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="password_require_lowercase" className="text-sm font-medium">
                    Require Lowercase Letters
                  </Label>
                  <p className="text-sm text-gray-500">
                    Password must contain at least one lowercase letter
                  </p>
                </div>
                <Switch
                  id="password_require_lowercase"
                  checked={data.password_require_lowercase}
                  onCheckedChange={(checked) => setData('password_require_lowercase', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="password_require_numbers" className="text-sm font-medium">
                    Require Numbers
                  </Label>
                  <p className="text-sm text-gray-500">
                    Password must contain at least one number
                  </p>
                </div>
                <Switch
                  id="password_require_numbers"
                  checked={data.password_require_numbers}
                  onCheckedChange={(checked) => setData('password_require_numbers', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="password_require_symbols" className="text-sm font-medium">
                    Require Special Characters
                  </Label>
                  <p className="text-sm text-gray-500">
                    Password must contain at least one special character
                  </p>
                </div>
                <Switch
                  id="password_require_symbols"
                  checked={data.password_require_symbols}
                  onCheckedChange={(checked) => setData('password_require_symbols', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Configure session and login security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session_timeout"
                  type="number"
                  min="5"
                  max="1440"
                  value={data.session_timeout}
                  onChange={(e) => setData('session_timeout', parseInt(e.target.value))}
                />
                {errors.session_timeout && (
                  <p className="text-sm text-red-600">{errors.session_timeout}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
                <Input
                  id="max_login_attempts"
                  type="number"
                  min="3"
                  max="20"
                  value={data.max_login_attempts}
                  onChange={(e) => setData('max_login_attempts', parseInt(e.target.value))}
                />
                {errors.max_login_attempts && (
                  <p className="text-sm text-red-600">{errors.max_login_attempts}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </AppLayout>
  );
}
