import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import {
  Edit,
  Calendar,
  Users,
  Clock,
  Target,
  FileText,
  Download,
  Eye,
  Plus,
  AlertTriangle
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import usePermissions from '@/Hooks/usePermissions';
import { Project, ProjectTask, ProjectFile, ProjectTimeLog, Tag } from '@/types';

interface TaskShowProps {
  auth: {
    user: any;
  };
  project: Project;
  task: ProjectTask & {
    files: ProjectFile[];
    time_logs: ProjectTimeLog[];
    dependencies: ProjectTask[];
    tags: Tag[];
  };
}

export default function TaskShow({ auth, project, task }: TaskShowProps) {
  const route = useRoute();
  const { hasPermission } = usePermissions();

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string | null) => {
    return date ? new Date(date).toLocaleDateString() : 'No due date';
  };

  const isOverdue = (dueDate: string | null, status: string) => {
    if (!dueDate || status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  const totalHours = task.time_logs?.reduce((sum, log) => sum + log.hours, 0) || 0;

  return (
    <AppLayout
      title={`${task.title} - ${project.name}`}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              {task.title}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {project.name} • Task
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={route('projects.tasks.index', project.id)}>
              <Button variant="outline">
                Back to Tasks
              </Button>
            </Link>
            {hasPermission('projects.tasks.edit') && (
              <Link href={route('projects.tasks.edit', [project.id, task.id])}>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Task
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    >
      <Head title={`${task.title} - ${project.name}`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {task.title}
                          <Badge variant="outline" className={getStatusBadgeColor(task.status)}>
                            {task.status}
                          </Badge>
                          <Badge variant="outline" className={getPriorityBadgeColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          {isOverdue(task.due_date, task.status) && (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                          )}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {task.description || 'No description provided'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {task.due_date && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>Due: {formatDate(task.due_date)}</span>
                          </div>
                        )}
                        
                        {task.assignee && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="h-4 w-4 mr-2" />
                            <span>Assigned to: {task.assignee.name}</span>
                          </div>
                        )}

                        {task.milestone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Target className="h-4 w-4 mr-2" />
                            <span>Milestone: {task.milestone.name}</span>
                          </div>
                        )}

                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Hours: {totalHours.toFixed(1)} / {task.estimated_hours || 0}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <FileText className="h-4 w-4 mr-2" />
                          <span>Files: {task.files?.length || 0}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <Target className="h-4 w-4 mr-2" />
                          <span>Dependencies: {task.dependencies?.length || 0}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="pt-4 border-t">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {task.tags.map((tag) => (
                              <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: tag.color }}
                                />
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Task Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge variant="outline" className={getStatusBadgeColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Priority</span>
                      <Badge variant="outline" className={getPriorityBadgeColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Estimated</span>
                      <span className="text-sm font-medium">{task.estimated_hours || 0}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Logged</span>
                      <span className="text-sm font-medium">{totalHours.toFixed(1)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Dependencies</span>
                      <span className="text-sm font-medium">{task.dependencies?.length || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="dependencies" className="w-full">
              <TabsList>
                <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="time-logs">Time Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="dependencies" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Dependencies</CardTitle>
                    <CardDescription>
                      Tasks that must be completed before this one
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {task.dependencies && task.dependencies.length > 0 ? (
                      <div className="space-y-3">
                        {task.dependencies.map((dependency) => (
                          <div key={dependency.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <Link 
                                href={route('projects.tasks.show', [project.id, dependency.id])}
                                className="font-medium text-blue-600 hover:underline"
                              >
                                {dependency.title}
                              </Link>
                              <p className="text-sm text-gray-600 mt-1">
                                {dependency.assignee?.name || 'Unassigned'}
                              </p>
                            </div>
                            <Badge variant="outline" className={getStatusBadgeColor(dependency.status)}>
                              {dependency.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No dependencies for this task
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="files" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Files</CardTitle>
                      <CardDescription>
                        Files attached to this task
                      </CardDescription>
                    </div>
                    {hasPermission('projects.files.create') && (
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Upload File
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {task.files && task.files.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {task.files.map((file) => (
                          <Card key={file.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{file.name}</h4>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {file.file_size_formatted} • {file.category}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Uploaded by {file.uploader?.name}
                                  </p>
                                </div>
                                <div className="flex gap-1 ml-2">
                                  <Button variant="outline" size="sm">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Download className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No files attached to this task
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="time-logs" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Time Logs</CardTitle>
                      <CardDescription>
                        Time tracked for this task
                      </CardDescription>
                    </div>
                    {hasPermission('projects.time-logs.create') && (
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Log Time
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent>
                    {task.time_logs && task.time_logs.length > 0 ? (
                      <div className="space-y-3">
                        {task.time_logs.map((log) => (
                          <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{log.description}</p>
                              <p className="text-sm text-gray-600">
                                {log.user?.name} • {new Date(log.logged_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{log.hours}h</p>
                              {log.is_billable && (
                                <p className="text-xs text-green-600">Billable</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No time logged for this task
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
