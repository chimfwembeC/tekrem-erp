import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Checkbox } from '@/Components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Eye,
  Copy,
  Trash2,
  Navigation,
  Download,
  Upload,
  Settings,
  List
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';

interface MenuItem {
  id: number;
  title: string;
  url?: string;
  target: string;
  icon?: string;
  is_active: boolean;
  sort_order: number;
  children?: MenuItem[];
}

interface Menu {
  id: number;
  name: string;
  slug: string;
  description?: string;
  location: string;
  is_active: boolean;
  items_count: number;
  items?: MenuItem[];
  created_by: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

interface Props {
  menus: {
    data: Menu[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  locations: Record<string, string>;
  filters: {
    search?: string;
    location?: string;
  };
}

export default function MenusIndex({ menus, locations, filters }: Props) {
  const { t } = useTranslate();
  const [selectedMenus, setSelectedMenus] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  const handleSearch = () => {
    router.get(route('cms.menus.index'), {
      ...filters,
      search: searchQuery,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFilter = (key: string, value: string) => {
    router.get(route('cms.menus.index'), {
      ...filters,
      [key]: value || undefined,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleBulkAction = (action: string) => {
    if (selectedMenus.length === 0) return;

    router.post(route('cms.menus.bulk-action'), {
      action,
      menu_ids: selectedMenus,
    }, {
      onSuccess: () => {
        setSelectedMenus([]);
      },
    });
  };

  const handleMenuAction = (menuId: number, action: string) => {
    switch (action) {
      case 'edit':
        router.visit(route('cms.menus.edit', menuId));
        break;
      case 'view':
        router.visit(route('cms.menus.show', menuId));
        break;
      case 'duplicate':
        router.post(route('cms.menus.duplicate', menuId));
        break;
      case 'export':
        window.open(route('cms.menus.export', menuId), '_blank');
        break;
      case 'delete':
        if (confirm(t('cms.confirm_delete_menu', 'Are you sure you want to delete this menu?'))) {
          router.delete(route('cms.menus.destroy', menuId));
        }
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderMenuItems = (items: MenuItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.id} className={`${level > 0 ? 'ml-4 border-l pl-4' : ''}`}>
        <div className="flex items-center gap-2 py-1">
          <div className={`w-2 h-2 rounded-full ${item.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-sm">{item.title}</span>
          {item.url && (
            <span className="text-xs text-muted-foreground">({item.url})</span>
          )}
        </div>
        {item.children && item.children.length > 0 && (
          <div className="mt-1">
            {renderMenuItems(item.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <AppLayout>
      <Head title={t('cms.menus', 'Menus')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t('cms.menus', 'Menus')}
            </h1>
            <p className="text-muted-foreground">
              {t('cms.menus_description', 'Manage site navigation and menus')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <label htmlFor="import-menu" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                {t('cms.import_menu', 'Import Menu')}
              </label>
            </Button>
            <input
              id="import-menu"
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  const formData = new FormData();
                  formData.append('menu_file', e.target.files[0]);
                  router.post(route('cms.menus.import'), formData);
                }
              }}
            />
            <Button asChild>
              <Link href={route('cms.menus.create')}>
                <Plus className="h-4 w-4 mr-2" />
                {t('cms.create_menu', 'Create Menu')}
              </Link>
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {t('common.filters', 'Filters')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="flex gap-2">
                  <Input
                    placeholder={t('cms.search_menus', 'Search menus...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button variant="outline" onClick={handleSearch}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Select value={filters.location || 'all'} onValueChange={(value) => handleFilter('location', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('cms.all_locations', 'All locations')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('cms.all_locations', 'All locations')}</SelectItem>
                  {Object.entries(locations).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedMenus.length > 0 && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedMenus.length} {t('cms.menus_selected', 'menus selected')}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>
                    <Navigation className="h-4 w-4 mr-2" />
                    {t('cms.activate', 'Activate')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleBulkAction('deactivate')}>
                    <Navigation className="h-4 w-4 mr-2" />
                    {t('cms.deactivate', 'Deactivate')}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleBulkAction('delete')}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('common.delete', 'Delete')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Menus List */}
        <div className="grid gap-6 lg:grid-cols-2">
          {menus.data.map((menu) => (
            <Card key={menu.id} className="group hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedMenus.includes(menu.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedMenus(prev => [...prev, menu.id]);
                        } else {
                          setSelectedMenus(prev => prev.filter(id => id !== menu.id));
                        }
                      }}
                    />
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {menu.name}
                        <Badge variant={menu.is_active ? 'default' : 'secondary'}>
                          {menu.is_active ? t('cms.active', 'Active') : t('cms.inactive', 'Inactive')}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{menu.description}</CardDescription>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleMenuAction(menu.id, 'view')}>
                        <Eye className="h-4 w-4 mr-2" />
                        {t('common.view', 'View')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMenuAction(menu.id, 'edit')}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t('common.edit', 'Edit')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleMenuAction(menu.id, 'duplicate')}>
                        <Copy className="h-4 w-4 mr-2" />
                        {t('cms.duplicate', 'Duplicate')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMenuAction(menu.id, 'export')}>
                        <Download className="h-4 w-4 mr-2" />
                        {t('cms.export', 'Export')}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleMenuAction(menu.id, 'delete')}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('common.delete', 'Delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  {/* Menu Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t('cms.location', 'Location')}</span>
                      <div className="font-medium">{locations[menu.location] || menu.location}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('cms.items', 'Items')}</span>
                      <div className="font-medium">{menu.items_count}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('cms.created_by', 'Created by')}</span>
                      <div className="font-medium">{menu.created_by.name}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('cms.created_at', 'Created')}</span>
                      <div className="font-medium">{formatDate(menu.created_at)}</div>
                    </div>
                  </div>

                  {/* Menu Items Preview */}
                  {menu.items && menu.items.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                        <List className="h-4 w-4" />
                        {t('cms.menu_items', 'Menu Items')}
                      </h4>
                      <div className="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                        {renderMenuItems(menu.items.slice(0, 5))}
                        {menu.items.length > 5 && (
                          <div className="text-xs text-muted-foreground mt-2">
                            +{menu.items.length - 5} more items
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleMenuAction(menu.id, 'view')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t('common.view', 'View')}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleMenuAction(menu.id, 'edit')}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      {t('common.edit', 'Edit')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {menus.data.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Navigation className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {t('cms.no_menus_found', 'No menus found')}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {t('cms.create_first_menu', 'Create your first menu to get started')}
              </p>
              <Button asChild>
                <Link href={route('cms.menus.create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('cms.create_menu', 'Create Menu')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {menus.links && menus.data.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {menus.from || 0} to {menus.to || 0} of {menus.total || 0} results
            </div>
            <div className="flex gap-2">
              {menus.links.map((link: any, index: number) => (
                <Button
                  key={index}
                  variant={link.active ? 'default' : 'outline'}
                  size="sm"
                  disabled={!link.url}
                  onClick={() => link.url && router.visit(link.url)}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
