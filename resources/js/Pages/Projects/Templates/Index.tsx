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
  Copy,
  Layout,
  Users,
  DollarSign,
  Clock
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import usePermissions from '@/Hooks/usePermissions';
import { ProjectTemplate } from '@/types';

interface TemplatesIndexProps {
  auth: {
    user: any;
  };
  templates: {
    data: ProjectTemplate[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  filters: {
    search?: string;
    category?: string;
    status?: string;
  };
}

export default function TemplatesIndex({ auth, templates, filters }: TemplatesIndexProps) {
  const route = useRoute();
  const { hasPermission } = usePermissions();
  const [search, setSearch] = useState(filters.search || '');
  const [category, setCategory] = useState(filters.category || 'all');
  const [status, setStatus] = useState(filters.status || 'all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('projects.templates.index'), {
      search: search || undefined,
      category: category !== 'all' ? category : undefined,
      status: status !== 'all' ? status : undefined,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDelete = (template: ProjectTemplate) => {
    if (confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
      router.delete(route('projects.templates.destroy', template.id));
    }
  };

  const handleDuplicate = (template: ProjectTemplate) => {
    router.post(route('projects.templates.duplicate', template.id));
  };

  const formatCurrency = (amount: number | null) => {
    return amount ? `$${amount.toLocaleString()}` : 'N/A';
  };

  return (
    <AppLayout
      title="Project Templates"
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Project Templates
          </h2>
          {hasPermission('projects.templates.create') && (
            <Link href={route('projects.templates.create')}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </Link>
          )}
        </div>
      )}
    >
      <Head title="Project Templates" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <CardTitle>Project Templates</CardTitle>
                <CardDescription>
                  Manage reusable project templates
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
                      placeholder="Search templates..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit" className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </form>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.data.length > 0 ? (
                  templates.data.map((template) => (
                    <Card key={template.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <Link 
                              href={route('projects.templates.show', template.id)}
                              className="text-lg font-semibold text-blue-600 hover:underline"
                            >
                              {template.name}
                            </Link>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {template.description || 'No description'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant={template.is_active ? "default" : "secondary"}>
                            {template.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {template.category && (
                            <Badge variant="outline">
                              {template.category}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Template Details */}
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Layout className="h-4 w-4 mr-2" />
                            <span>
                              {template.template_data.milestones?.length || 0} milestones
                            </span>
                          </div>
                          
                          {template.template_data.default_budget && (
                            <div className="flex items-center text-gray-600">
                              <DollarSign className="h-4 w-4 mr-2" />
                              <span>
                                Budget: {formatCurrency(template.template_data.default_budget)}
                              </span>
                            </div>
                          )}
                          
                          {template.template_data.estimated_duration && (
                            <div className="flex items-center text-gray-600">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>
                                Duration: {template.template_data.estimated_duration} days
                              </span>
                            </div>
                          )}
                          
                          <div className="flex items-center text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            <span>Used {template.usage_count} times</span>
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            Created by {template.creator?.name}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Link href={route('projects.templates.show', template.id)}>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          {hasPermission('projects.templates.edit') && (
                            <Link href={route('projects.templates.edit', template.id)}>
                              <Button variant="outline" size="sm" className="flex-1">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {hasPermission('projects.templates.create') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDuplicate(template)}
                              className="flex-1"
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Duplicate
                            </Button>
                          )}
                          {hasPermission('projects.templates.delete') && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(template)}
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
                    <Layout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No templates found.</p>
                    {hasPermission('projects.templates.create') && (
                      <Link href={route('projects.templates.create')} className="mt-4 inline-block">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Template
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {templates.data.length > 0 && templates.last_page > 1 && (
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {templates.from} to {templates.to} of {templates.total} results
                  </div>
                  <div className="flex gap-2">
                    {templates.links.map((link, index) => (
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
