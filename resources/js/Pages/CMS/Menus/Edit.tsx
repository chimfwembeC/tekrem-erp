import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Badge } from '@/Components/ui/badge';
import {
  ArrowLeft,
  Save,
  Navigation,
  AlertTriangle,
  Settings,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface MenuItem {
  id: number;
  title: string;
  url: string;
  target: string;
  icon?: string;
  order: number;
  parent_id?: number;
  children?: MenuItem[];
}

interface Menu {
  id: number;
  name: string;
  slug: string;
  description?: string;
  location: string;
  is_active: boolean;
  settings: any;
  items: MenuItem[];
  created_by: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

interface Props {
  menu: Menu;
  locations: Record<string, string>;
  errors?: Record<string, string>;
}

export default function MenuEdit({ menu, locations, errors }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: menu.name,
    slug: menu.slug,
    description: menu.description || '',
    location: menu.location,
    is_active: menu.is_active,
    settings: JSON.stringify(menu.settings || {}, null, 2)
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from name if slug is empty
    if (field === 'name' && !formData.slug) {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate JSON settings
      try {
        JSON.parse(formData.settings);
      } catch (error) {
        toast.error(t('cms.invalid_json', 'Invalid JSON format in settings'));
        setIsSubmitting(false);
        return;
      }

      router.put(route('cms.menus.update', menu.id), {
        ...formData,
        settings: JSON.parse(formData.settings)
      }, {
        onSuccess: () => {
          toast.success(t('cms.menu_updated', 'Menu updated successfully'));
        },
        onError: (errors) => {
          console.error('Validation errors:', errors);
          toast.error(t('cms.menu_update_failed', 'Failed to update menu'));
        },
        onFinish: () => {
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      console.error('Error updating menu:', error);
      toast.error(t('cms.menu_update_failed', 'Failed to update menu'));
      setIsSubmitting(false);
    }
  };

  const handleManageItems = () => {
    router.visit(route('cms.menus.items.index', menu.id));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderMenuItems = (items: MenuItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.id} className={`border rounded-lg p-3 ${level > 0 ? 'ml-6 border-l-2 border-l-primary' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{item.title}</h4>
              {item.target === '_blank' && (
                <Badge variant="outline" className="text-xs">External</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{item.url}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Edit className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
        {item.children && item.children.length > 0 && (
          <div className="mt-3 space-y-2">
            {renderMenuItems(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <AppLayout>
      <Head title={`${t('common.edit', 'Edit')} ${menu.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.visit(route('cms.menus.index'))}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back', 'Back')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('common.edit', 'Edit')} {menu.name}
              </h1>
              <p className="text-muted-foreground">
                {t('cms.edit_menu_description', 'Modify menu settings and structure')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleManageItems}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('cms.manage_items', 'Manage Items')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.name || !formData.location}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {Object.keys(errors || {}).length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t('common.validation_errors', 'Please fix the validation errors below')}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Menu Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Navigation className="h-5 w-5" />
                    {t('cms.menu_details', 'Menu Details')}
                  </CardTitle>
                  <CardDescription>
                    {t('cms.menu_details_desc', 'Configure the basic menu information')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('cms.menu_name', 'Menu Name')} *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder={t('cms.enter_menu_name', 'Enter menu name')}
                        className={errors?.name ? 'border-destructive' : ''}
                      />
                      {errors?.name && (
                        <p className="text-sm text-destructive">{errors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug">{t('cms.slug', 'Slug')}</Label>
                      <Input
                        id="slug"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        placeholder={t('cms.auto_generated', 'Auto-generated from name')}
                        className={errors?.slug ? 'border-destructive' : ''}
                      />
                      {errors?.slug && (
                        <p className="text-sm text-destructive">{errors.slug}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{t('cms.description', 'Description')}</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder={t('cms.menu_description_placeholder', 'Describe this menu...')}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">{t('cms.menu_location', 'Menu Location')} *</Label>
                    <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                      <SelectTrigger className={errors?.location ? 'border-destructive' : ''}>
                        <SelectValue placeholder={t('cms.select_location', 'Select a location')} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(locations).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors?.location && (
                      <p className="text-sm text-destructive">{errors.location}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t('cms.location_help', 'Where this menu will be displayed on your website')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Menu Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{t('cms.menu_items', 'Menu Items')} ({menu.items.length})</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleManageItems}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t('cms.manage_items', 'Manage Items')}
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {t('cms.menu_items_desc', 'Current menu structure and items')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {menu.items.length > 0 ? (
                    <div className="space-y-3">
                      {renderMenuItems(menu.items)}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Navigation className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{t('cms.no_menu_items', 'No menu items yet')}</p>
                      <p className="text-sm">{t('cms.add_menu_items_hint', 'Click "Manage Items" to add menu items')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Menu Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {t('cms.menu_settings', 'Menu Settings')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t('cms.active', 'Active')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t('cms.menu_active_desc', 'Make this menu available for display')}
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Menu Information */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('cms.menu_information', 'Menu Information')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm">
                    <span className="text-muted-foreground">{t('cms.created_by', 'Created by')}: </span>
                    <span>{menu.created_by.name}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">{t('cms.created_at', 'Created')}: </span>
                    <span>{formatDate(menu.created_at)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">{t('cms.updated_at', 'Updated')}: </span>
                    <span>{formatDate(menu.updated_at)}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">{t('cms.total_items', 'Total Items')}: </span>
                    <span className="font-medium">{menu.items.length}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('cms.advanced_settings', 'Advanced Settings')}</CardTitle>
                  <CardDescription>
                    {t('cms.menu_advanced_settings_desc', 'JSON configuration for menu behavior')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="settings">{t('cms.menu_settings_json', 'Menu Settings')}</Label>
                    <Textarea
                      id="settings"
                      value={formData.settings}
                      onChange={(e) => handleInputChange('settings', e.target.value)}
                      placeholder='{"max_depth": 3, "show_icons": true, "mobile_breakpoint": "768px"}'
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('cms.json_format', 'JSON format')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
