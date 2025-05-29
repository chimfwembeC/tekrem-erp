import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Tag as TagIcon,
  Users
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import usePermissions from '@/Hooks/usePermissions';
import { Tag } from '@/types';

interface TagsIndexProps {
  auth: {
    user: any;
  };
  tags: {
    data: Tag[];
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
    status?: string;
  };
}

export default function TagsIndex({ auth, tags, filters }: TagsIndexProps) {
  const route = useRoute();
  const { hasPermission } = usePermissions();
  const [search, setSearch] = useState(filters.search || '');
  const [type, setType] = useState(filters.type || 'all');
  const [status, setStatus] = useState(filters.status || 'all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('projects.tags.index'), {
      search: search || undefined,
      type: type !== 'all' ? type : undefined,
      status: status !== 'all' ? status : undefined,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDelete = (tag: Tag) => {
    if (confirm(`Are you sure you want to delete the tag "${tag.name}"?`)) {
      router.delete(route('projects.tags.destroy', tag.slug));
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project':
        return 'bg-blue-100 text-blue-800';
      case 'task':
        return 'bg-green-100 text-green-800';
      case 'general':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout
      title="Tags"
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Tags Management
          </h2>
          {hasPermission('projects.tags.create') && (
            <Link href={route('projects.tags.create')}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Tag
              </Button>
            </Link>
          )}
        </div>
      )}
    >
      <Head title="Tags" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <CardTitle>Tags</CardTitle>
                <CardDescription>
                  Manage tags for projects and tasks
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      type="text"
                      placeholder="Search tags..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit" className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </form>

              {/* Tags Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tags.data.length > 0 ? (
                  tags.data.map((tag) => (
                    <Card key={tag.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: tag.color }}
                              />
                              <Link 
                                href={route('projects.tags.show', tag.slug)}
                                className="text-lg font-semibold text-blue-600 hover:underline"
                              >
                                {tag.name}
                              </Link>
                            </div>
                            {tag.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {tag.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className={getTypeColor(tag.type)}>
                            {tag.type}
                          </Badge>
                          <Badge variant={tag.is_active ? "default" : "secondary"}>
                            {tag.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Tag Details */}
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            <span>Used {tag.usage_count || 0} times</span>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            Created by {tag.creator?.name}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Link href={route('projects.tags.show', tag.slug)}>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          {hasPermission('projects.tags.edit') && (
                            <Link href={route('projects.tags.edit', tag.slug)}>
                              <Button variant="outline" size="sm" className="flex-1">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                          )}
                          {hasPermission('projects.tags.delete') && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(tag)}
                              className="flex-1"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <TagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No tags found.</p>
                    {hasPermission('projects.tags.create') && (
                      <Link href={route('projects.tags.create')} className="mt-4 inline-block">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Tag
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {tags.data.length > 0 && tags.last_page > 1 && (
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {tags.from} to {tags.to} of {tags.total} results
                  </div>
                  <div className="flex gap-2">
                    {tags.links.map((link, index) => (
                      <Link
                        key={index}
                        href={link.url || '#'}
                        className={`px-3 py-1 rounded ${
                          link.active
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    ))}
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
