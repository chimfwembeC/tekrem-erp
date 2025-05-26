import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  ArrowLeft,
  Save,
  AlertCircle,
  User
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Category {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  is_active: boolean;
  sort_order: number;
  default_priority: string;
  default_sla_policy_id?: number;
  auto_assign_to?: number;
}

interface SLA {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
}

interface Props {
  category: Category;
  slaOptions: SLA[];
  users: User[];
}

export default function Edit({ category, slaOptions, users }: Props) {
  const { t } = useTranslate();
  const route = useRoute();

  const { data, setData, put, processing, errors } = useForm({
    name: category.name,
    description: category.description || '',
    color: category.color,
    icon: category.icon || '',
    is_active: category.is_active,
    sort_order: category.sort_order,
    default_priority: category.default_priority,
    default_sla_policy_id: category.default_sla_policy_id?.toString() || '',
    auto_assign_to: category.auto_assign_to?.toString() || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('support.categories.update', category.id));
  };

  const colorOptions = [
    { value: '#EF4444', label: 'Red' },
    { value: '#F97316', label: 'Orange' },
    { value: '#F59E0B', label: 'Amber' },
    { value: '#EAB308', label: 'Yellow' },
    { value: '#84CC16', label: 'Lime' },
    { value: '#22C55E', label: 'Green' },
    { value: '#10B981', label: 'Emerald' },
    { value: '#14B8A6', label: 'Teal' },
    { value: '#06B6D4', label: 'Cyan' },
    { value: '#0EA5E9', label: 'Sky' },
    { value: '#3B82F6', label: 'Blue' },
    { value: '#6366F1', label: 'Indigo' },
    { value: '#8B5CF6', label: 'Violet' },
    { value: '#A855F7', label: 'Purple' },
    { value: '#D946EF', label: 'Fuchsia' },
    { value: '#EC4899', label: 'Pink' },
    { value: '#F43F5E', label: 'Rose' },
    { value: '#6B7280', label: 'Gray' },
  ];

  const iconOptions = [
    { value: 'bug', label: 'Bug' },
    { value: 'lightbulb', label: 'Feature Request' },
    { value: 'help-circle', label: 'Support' },
    { value: 'dollar-sign', label: 'Billing' },
    { value: 'settings', label: 'Technical' },
    { value: 'shield', label: 'Security' },
    { value: 'zap', label: 'Performance' },
    { value: 'users', label: 'Account' },
    { value: 'file-text', label: 'Documentation' },
    { value: 'globe', label: 'General' },
  ];

  return (
    <AppLayout>
      <Head title={`${t('common.edit', 'Edit')} ${category.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href={route('support.categories.show', category.id)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back', 'Back')}
              </a>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('common.edit', 'Edit')} {t('support.category', 'Category')}
              </h1>
              <p className="text-muted-foreground">
                {t('support.edit_category_description', 'Update category settings and configuration')}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('support.category_details', 'Category Details')}</CardTitle>
                  <CardDescription>
                    {t('support.edit_category_details_description', 'Update basic information about the category')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t('support.name', 'Name')} *</Label>
                    <Input
                      id="name"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder={t('support.category_name_placeholder', 'Enter category name')}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">{t('support.description', 'Description')}</Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder={t('support.category_description_placeholder', 'Describe what this category is for')}
                      rows={3}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="color">{t('support.color', 'Color')}</Label>
                      <Select value={data.color} onValueChange={(value) => setData('color', value)}>
                        <SelectTrigger className={errors.color ? 'border-red-500' : ''}>
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: data.color }}
                              />
                              {colorOptions.find(c => c.value === data.color)?.label || 'Select color'}
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {colorOptions.map((color) => (
                            <SelectItem key={color.value} value={color.value}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: color.value }}
                                />
                                {color.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.color && (
                        <p className="text-sm text-red-500 mt-1">{errors.color}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="icon">{t('support.icon', 'Icon')}</Label>
                      <Select value={data.icon} onValueChange={(value) => setData('icon', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('support.select_icon', 'Select icon (optional)')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">{t('support.no_icon', 'No Icon')}</SelectItem>
                          {iconOptions.map((icon) => (
                            <SelectItem key={icon.value} value={icon.value}>
                              {icon.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="sort_order">{t('support.sort_order', 'Sort Order')}</Label>
                    <Input
                      id="sort_order"
                      type="number"
                      value={data.sort_order}
                      onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('support.sort_order_help', 'Lower numbers appear first')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Default Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('support.default_settings', 'Default Settings')}</CardTitle>
                  <CardDescription>
                    {t('support.edit_default_settings_description', 'Update default values for tickets in this category')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="default_priority">{t('support.default_priority', 'Default Priority')} *</Label>
                      <Select value={data.default_priority} onValueChange={(value) => setData('default_priority', value)}>
                        <SelectTrigger className={errors.default_priority ? 'border-red-500' : ''}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">{t('support.priority_low', 'Low')}</SelectItem>
                          <SelectItem value="medium">{t('support.priority_medium', 'Medium')}</SelectItem>
                          <SelectItem value="high">{t('support.priority_high', 'High')}</SelectItem>
                          <SelectItem value="urgent">{t('support.priority_urgent', 'Urgent')}</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.default_priority && (
                        <p className="text-sm text-red-500 mt-1">{errors.default_priority}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="default_sla_policy_id">{t('support.default_sla', 'Default SLA Policy')}</Label>
                      <Select value={data.default_sla_policy_id} onValueChange={(value) => setData('default_sla_policy_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('support.select_sla', 'Select SLA policy (optional)')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">{t('support.no_sla', 'No Default SLA')}</SelectItem>
                          {slaOptions.map((sla) => (
                            <SelectItem key={sla.id} value={sla.id.toString()}>
                              {sla.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="auto_assign_to">{t('support.auto_assign_to', 'Auto Assign To')}</Label>
                    <Select value={data.auto_assign_to} onValueChange={(value) => setData('auto_assign_to', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('support.select_user', 'Select user (optional)')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t('support.no_auto_assign', 'No Auto Assignment')}</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {user.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('support.auto_assign_help', 'Automatically assign new tickets in this category to this user')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('support.status', 'Status')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_active"
                      checked={data.is_active}
                      onCheckedChange={(checked) => setData('is_active', !!checked)}
                    />
                    <Label htmlFor="is_active" className="text-sm font-medium">
                      {t('support.active_category', 'Active Category')}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('support.active_category_help', 'Only active categories can be used for new tickets')}
                  </p>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Button type="submit" className="w-full" disabled={processing}>
                      <Save className="h-4 w-4 mr-2" />
                      {processing ? t('common.saving', 'Saving...') : t('common.save_changes', 'Save Changes')}
                    </Button>
                    
                    <Button type="button" variant="outline" className="w-full" asChild>
                      <a href={route('support.categories.show', category.id)}>
                        {t('common.cancel', 'Cancel')}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Help */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t('support.edit_category_help', 'Changes to default settings will only affect new tickets created in this category.')}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
