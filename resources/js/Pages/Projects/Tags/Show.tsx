import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import {
  Edit,
  ArrowLeft,
  Tag as TagIcon,
  Users,
  FolderOpen,
  Calendar,
  User,
  Trash2
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import usePermissions from '@/Hooks/usePermissions';
import { Tag, Project, ProjectTask } from '@/types';

interface TagShowProps {
  auth: {
    user: any;
  };
  tag: Tag & {
    creator?: {
      id: number;
      name: string;
    };
    projects?: Project[];
    tasks?: ProjectTask[];
    usage_count: number;
  };
}

export default function TagShow({ auth, tag }: TagShowProps) {
  const route = useRoute();
  const { hasPermission } = usePermissions();

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <AppLayout
      title={tag.name}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={route('projects.tags.index')}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tags
              </Button>
            </Link>
            <div>
              <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Tag • {tag.type} • {tag.usage_count} usage{tag.usage_count !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {hasPermission('projects.update') && (
              <Link href={route('projects.tags.edit', tag.id)}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Tag
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    >
      <Head title={tag.name} />

      <div className="space-y-6">
        {/* Tag Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TagIcon className="h-5 w-5" />
                  Tag Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Name</label>
                    <p className="text-sm font-medium">{tag.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <div className="mt-1">
                      <Badge className={getTypeColor(tag.type)}>
                        {tag.type}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Color</label>
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="w-6 h-6 rounded border" 
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm font-mono">{tag.color}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <Badge variant={tag.is_active ? 'default' : 'secondary'}>
                        {tag.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                {tag.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-sm mt-1">{tag.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created By</label>
                  <p className="text-sm">{tag.creator?.name || 'Unknown'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="text-sm">{formatDate(tag.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm">{formatDate(tag.updated_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Usage</label>
                  <p className="text-sm font-semibold">{tag.usage_count}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Usage Details */}
        <Tabs defaultValue="projects" className="w-full">
          <TabsList>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Projects ({tag.projects?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Tasks ({tag.tasks?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Projects using this tag</CardTitle>
                <CardDescription>
                  All projects that have been tagged with "{tag.name}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tag.projects && tag.projects.length > 0 ? (
                  <div className="space-y-3">
                    {tag.projects.map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{project.name}</h4>
                          <p className="text-sm text-gray-500">{project.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{project.status}</Badge>
                          <Link href={route('projects.show', project.id)}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No projects are using this tag yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tasks using this tag</CardTitle>
                <CardDescription>
                  All tasks that have been tagged with "{tag.name}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tag.tasks && tag.tasks.length > 0 ? (
                  <div className="space-y-3">
                    {tag.tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-gray-500">{task.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{task.status}</Badge>
                          <Link href={route('projects.tasks.show', [task.project_id, task.id])}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No tasks are using this tag yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
