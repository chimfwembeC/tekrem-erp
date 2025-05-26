import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import {
  Tag,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Ticket,
  Settings
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
  tickets_count: number;
  created_at: string;
  updated_at: string;
}

interface PaginatedCategories {
  data: Category[];
  links: any;
  meta?: any;
}

interface Props {
  categories: PaginatedCategories;
  filters: {
    search?: string;
    active?: string;
  };
}

export default function Index({ categories, filters }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('support.categories.index'), {
      ...filters,
      search: searchTerm,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    router.get(route('support.categories.index'), {
      ...filters,
      [key]: value === 'all' ? '' : value,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout>
      <Head title={t('support.categories', 'Support Categories')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('support.categories', 'Support Categories')}</h1>
            <p className="text-muted-foreground">
              {t('support.categories_description', 'Manage ticket categories and their settings')}
            </p>
          </div>
          <Button asChild>
            <Link href={route('support.categories.create')}>
              <Plus className="h-4 w-4 mr-2" />
              {t('support.create_category', 'Create Category')}
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              {t('common.filters', 'Filters')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder={t('common.search', 'Search categories...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </form>

              <Select value={filters.active || 'all'} onValueChange={(value) => handleFilterChange('active', value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('support.status', 'Status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                  <SelectItem value="true">{t('support.active', 'Active')}</SelectItem>
                  <SelectItem value="false">{t('support.inactive', 'Inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.data.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <CardTitle className="text-lg">
                        <Link
                          href={route('support.categories.show', category.id)}
                          className="hover:text-primary"
                        >
                          {category.name}
                        </Link>
                      </CardTitle>
                      {category.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={category.is_active ? 'default' : 'secondary'}>
                    {category.is_active ? t('support.active', 'Active') : t('support.inactive', 'Inactive')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t('support.tickets', 'Tickets')}</span>
                      <div className="flex items-center gap-1 mt-1">
                        <Ticket className="h-3 w-3" />
                        <span className="font-medium">{category.tickets_count}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('support.default_priority', 'Default Priority')}</span>
                      <div className="mt-1">
                        <Badge className={getPriorityColor(category.default_priority)} variant="secondary">
                          {category.default_priority}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>{t('support.sort_order', 'Sort Order')}</span>
                      <span>{category.sort_order}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>{t('support.created', 'Created')}</span>
                      <span>{new Date(category.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={route('support.categories.show', category.id)}>
                        <Eye className="h-3 w-3 mr-1" />
                        {t('common.view', 'View')}
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={route('support.categories.edit', category.id)}>
                        <Edit className="h-3 w-3 mr-1" />
                        {t('common.edit', 'Edit')}
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {categories.data.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Tag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{t('support.no_categories', 'No categories found')}</h3>
              <p className="text-muted-foreground mb-6">
                {t('support.no_categories_description', 'Get started by creating your first support category.')}
              </p>
              <Button asChild>
                <Link href={route('support.categories.create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('support.create_category', 'Create Category')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {categories.data.length > 0 && categories.meta && (
          <div className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Showing {categories.data.length} of {categories.meta.total || categories.data.length} categories
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
