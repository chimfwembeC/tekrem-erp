import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Tag,
} from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Category {
  id: number;
  name: string;
  description?: string;
  type: string;
  color?: string;
  parent_id?: number;
  parent?: Category;
  children_count?: number;
  transactions_count?: number;
  created_at: string;
  updated_at: string;
}

interface Props {
  categories: {
    data: Category[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  filters: {
    search?: string;
    type?: string;
    parent?: string;
  };
  types: Record<string, string>;
  parentCategories?: Category[];
}

export default function Index({ categories, filters, types, parentCategories }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [search, setSearch] = useState(filters.search || '');
  const [selectedType, setSelectedType] = useState(filters.type || 'all');
  const [selectedParent, setSelectedParent] = useState(filters.parent || 'all');

  const handleSearch = () => {
    router.get(route('finance.categories.index'), {
      search,
      type: selectedType === 'all' ? '' : selectedType,
      parent: selectedParent === 'all' ? '' : selectedParent,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleReset = () => {
    setSearch('');
    setSelectedType('all');
    setSelectedParent('all');
    router.get(route('finance.categories.index'), {}, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm(t('common.confirm_delete', 'Are you sure you want to delete this item?'))) {
      router.delete(route('finance.categories.destroy', id));
    }
  };

  return (
    <AppLayout title={t('finance.categories', 'Categories')}>
      <Head title={t('finance.categories', 'Categories')} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <CardTitle>{t('finance.categories', 'Categories')}</CardTitle>
                <CardDescription>
                  {t('finance.categories_description', 'Organize your transactions with categories')}
                </CardDescription>
              </div>
              <Link href={route('finance.categories.create')}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('finance.create_category', 'Create Category')}
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
                <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2 flex-1">
                  <Input
                    type="text"
                    placeholder={t('finance.search_categories', 'Search categories...')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button type="submit" variant="secondary">{t('common.search', 'Search')}</Button>
                </form>

                <div className="flex gap-2">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={t('common.all_types', 'All types')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all_types', 'All types')}</SelectItem>
                      {types && Object.entries(types).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={handleReset}>
                    {t('common.reset', 'Reset')}
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">{t('common.name', 'Name')}</th>
                      <th className="text-left p-2">{t('common.type', 'Type')}</th>
                      <th className="text-left p-2">{t('finance.parent_category', 'Parent')}</th>
                      <th className="text-left p-2">{t('finance.subcategories', 'Subcategories')}</th>
                      <th className="text-left p-2">{t('finance.transactions', 'Transactions')}</th>
                      <th className="text-left p-2">{t('common.actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.data.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <Tag className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              {t('finance.no_categories', 'No categories found')}
                            </p>
                            <Button asChild variant="outline">
                              <Link href={route('finance.categories.create')}>
                                {t('finance.create_first_category', 'Create your first category')}
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      categories.data.map((category) => (
                        <tr key={category.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              {category.color && (
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                              )}
                              <div>
                                <p className="font-medium">{category.name}</p>
                                {category.description && (
                                  <p className="text-xs text-muted-foreground">{category.description}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge variant="secondary">
                              {(types && types[category.type]) || category.type}
                            </Badge>
                          </td>
                          <td className="p-2">
                            {category.parent ? (
                              <span className="text-sm">{category.parent.name}</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-2">
                            <span className="text-sm">{category.children_count || 0}</span>
                          </td>
                          <td className="p-2">
                            <span className="text-sm">{category.transactions_count || 0}</span>
                          </td>
                          <td className="p-2 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={route('finance.categories.show', category.id)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    {t('common.view', 'View')}
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={route('finance.categories.edit', category.id)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    {t('common.edit', 'Edit')}
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(category.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t('common.delete', 'Delete')}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {categories.last_page > 1 && (
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {t('common.showing_results', 'Showing {{from}} to {{to}} of {{total}} results', {
                      from: categories.from,
                      to: categories.to,
                      total: categories.total,
                    })}
                  </div>
                  <div className="flex gap-1">
                    {categories.links.map((link, i) => {
                      if (link.url === null) {
                        return (
                          <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            disabled
                            dangerouslySetInnerHTML={{ __html: link.label }}
                          />
                        );
                      }

                      return (
                        <Link key={i} href={link.url}>
                          <Button
                            variant={link.active ? "default" : "outline"}
                            size="sm"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                          />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
