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
import {
  ArrowLeft,
  Save,
  Navigation,
  AlertTriangle,
  Settings,
  Plus
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { toast } from 'sonner';

interface Props {
  locations: Record<string, string>;
  errors?: Record<string, string>;
}

export default function MenuCreate({ locations, errors }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    location: '',
    is_active: true,
    settings: '{}'
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from name
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

      router.post(route('cms.menus.store'), {
        ...formData,
        settings: JSON.parse(formData.settings)
      }, {
        onSuccess: () => {
          toast.success(t('cms.menu_created', 'Menu created successfully'));
        },
        onError: (errors) => {
          console.error('Validation errors:', errors);
          toast.error(t('cms.menu_creation_failed', 'Failed to create menu'));
        },
        onFinish: () => {
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      console.error('Error creating menu:', error);
      toast.error(t('cms.menu_creation_failed', 'Failed to create menu'));
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <Head title={t('cms.create_menu', 'Create Menu')} />

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
                {t('cms.create_menu', 'Create Menu')}
              </h1>
              <p className="text-muted-foreground">
                {t('cms.create_menu_description', 'Create a new navigation menu')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
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
            <div className="lg:col-span-2">
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

              {/* Menu Locations Info */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('cms.menu_locations', 'Menu Locations')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {Object.entries(locations).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="font-medium">{label}</span>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">{key}</code>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('cms.next_steps', 'Next Steps')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                      1
                    </div>
                    <p>{t('cms.step_1', 'Save the menu to create it')}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                      2
                    </div>
                    <p>{t('cms.step_2', 'Add menu items and organize them')}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                      3
                    </div>
                    <p>{t('cms.step_3', 'Configure menu display settings')}</p>
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
