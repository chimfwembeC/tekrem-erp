import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Label } from '@/Components/ui/label';
import { Separator } from '@/Components/ui/separator';
import {
  ArrowLeft,
  Edit,
  Plus,
  Trash2,
  Navigation,
  ExternalLink,
  Calendar,
  User,
  Settings,
  Eye,
  Copy
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
}

export default function MenuShow({ menu, locations }: Props) {
  const { t } = useTranslate();
  const route = useRoute();

  const handleAction = (action: string) => {
    switch (action) {
      case 'edit':
        router.visit(route('cms.menus.edit', menu.id));
        break;
      case 'manage-items':
        router.visit(route('cms.menus.items.index', menu.id));
        break;
      case 'duplicate':
        router.post(route('cms.menus.duplicate', menu.id), {}, {
          onSuccess: () => {
            toast.success(t('cms.menu_duplicated', 'Menu duplicated successfully'));
          }
        });
        break;
      case 'delete':
        if (confirm(t('cms.confirm_delete_menu', 'Are you sure you want to delete this menu?'))) {
          router.delete(route('cms.menus.destroy', menu.id), {
            onSuccess: () => {
              toast.success(t('cms.menu_deleted', 'Menu deleted successfully'));
              router.visit(route('cms.menus.index'));
            }
          });
        }
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatJSON = (obj: any) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return 'Invalid JSON';
    }
  };

  const renderMenuItems = (items: MenuItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.id} className={`border rounded-lg p-3 ${level > 0 ? 'ml-6 border-l-2 border-l-primary' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{item.title}</h4>
              {item.target === '_blank' && (
                <Badge variant="outline" className="text-xs">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  External
                </Badge>
              )}
              {item.icon && (
                <Badge variant="outline" className="text-xs">
                  <span className="mr-1">🎨</span>
                  Icon
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{item.url}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">Order: {item.order}</span>
              {item.children && item.children.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  • {item.children.length} {t('cms.sub_items', 'sub-items')}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a href={item.url} target={item.target} rel="noopener noreferrer">
                <Eye className="h-3 w-3" />
              </a>
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
      <Head title={menu.name} />

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
                {menu.name}
              </h1>
              <p className="text-muted-foreground">
                {menu.description || t('cms.no_description', 'No description provided')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleAction('manage-items')}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('cms.manage_items', 'Manage Items')}
            </Button>
            <Button
              onClick={() => handleAction('edit')}
            >
              <Edit className="h-4 w-4 mr-2" />
              {t('common.edit', 'Edit')}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Menu Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  {t('cms.menu_overview', 'Menu Overview')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t('cms.menu_name', 'Menu Name')}
                    </Label>
                    <p className="text-lg font-semibold">{menu.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t('cms.slug', 'Slug')}
                    </Label>
                    <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                      {menu.slug}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t('cms.menu_location', 'Menu Location')}
                    </Label>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {locations[menu.location] || menu.location}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      {t('cms.status', 'Status')}
                    </Label>
                    <div className="mt-1">
                      <Badge variant={menu.is_active ? 'default' : 'secondary'}>
                        {menu.is_active ? t('cms.active', 'Active') : t('cms.inactive', 'Inactive')}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t('cms.total_items', 'Total Items')}
                  </Label>
                  <p className="text-2xl font-bold">{menu.items.length}</p>
                </div>
              </CardContent>
            </Card>

            {/* Menu Structure */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t('cms.menu_structure', 'Menu Structure')}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction('manage-items')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('cms.manage_items', 'Manage Items')}
                  </Button>
                </CardTitle>
                <CardDescription>
                  {t('cms.menu_structure_desc', 'Hierarchical view of all menu items')}
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
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('cms.quick_actions', 'Quick Actions')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAction('edit')}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t('common.edit', 'Edit')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAction('manage-items')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('cms.manage_items', 'Manage Items')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAction('duplicate')}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {t('cms.duplicate', 'Duplicate')}
                </Button>
                <Separator />
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => handleAction('delete')}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('common.delete', 'Delete')}
                </Button>
              </CardContent>
            </Card>

            {/* Menu Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('cms.menu_information', 'Menu Information')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('cms.created_by', 'Created by')}:</span>
                  <span>{menu.created_by.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('cms.created_at', 'Created')}:</span>
                  <span>{formatDate(menu.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('cms.updated_at', 'Updated')}:</span>
                  <span>{formatDate(menu.updated_at)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Menu Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {t('cms.menu_settings', 'Menu Settings')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t('cms.configuration', 'Configuration')}
                  </Label>
                  <pre className="mt-1 text-xs font-mono bg-muted p-2 rounded overflow-x-auto">
                    {formatJSON(menu.settings)}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('cms.location_information', 'Location Information')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t('cms.current_location', 'Current Location')}
                  </Label>
                  <p className="font-medium">{locations[menu.location] || menu.location}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    {t('cms.location_code', 'Location Code')}
                  </Label>
                  <code className="text-sm bg-muted px-2 py-1 rounded">{menu.location}</code>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>{t('cms.location_help', 'This determines where the menu appears on your website')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
