import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { 
  CheckSquare, 
  Calendar, 
  Clock, 
  AlertTriangle,
  FolderOpen,
  User,
  Target
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { ProjectTask } from '@/types';

interface MyTasksProps {
  auth: {
    user: any;
  };
  tasks: {
    data: ProjectTask[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  filters: {
    status?: string;
    priority?: string;
  };
}

export default function MyTasks({ auth, tasks, filters }: MyTasksProps) {
  const route = useRoute();
  const [status, setStatus] = useState(filters.status || 'all');
  const [priority, setPriority] = useState(filters.priority || 'all');

  const handleFilter = () => {
    router.get(route('projects.my-tasks'), {
      status: status !== 'all' ? status : undefined,
      priority: priority !== 'all' ? priority : undefined,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'testing':
        return 'bg-purple-100 text-purple-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'bg-blue-100 text-blue-800';
      case 'issue':
        return 'bg-red-100 text-red-800';
      case 'bug':
        return 'bg-red-100 text-red-800';
      case 'feature':
        return 'bg-green-100 text-green-800';
      case 'improvement':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const isOverdue = (dueDateString: string | null, status: string) => {
    if (!dueDateString || status === 'done' || status === 'cancelled') return false;
    const dueDate = new Date(dueDateString);
    return dueDate < new Date();
  };

  return (
    <AppLayout
      title="My Tasks"
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          My Tasks
        </h2>
      )}
    >
      <Head title="My Tasks" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <CardTitle>My Assigned Tasks</CardTitle>
                <CardDescription>
                  Tasks assigned to you across all projects
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="testing">Testing</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleFilter} className="w-full">
                    Apply Filters
                  </Button>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-4">
                {tasks.data.length > 0 ? (
                  tasks.data.map((task) => (
                    <Card key={task.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Link 
                                href={route('projects.tasks.show', [task.project_id, task.id])}
                                className="text-lg font-semibold text-blue-600 hover:underline"
                              >
                                {task.title}
                              </Link>
                              {isOverdue(task.due_date, task.status) && (
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                            {task.description && (
                              <p className="text-gray-600 mb-3 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge className={getStatusColor(task.status)}>
                            {task.status.replace('-', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge className={getTypeColor(task.type)}>
                            {task.type}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <FolderOpen className="h-4 w-4 mr-2" />
                            <Link 
                              href={route('projects.show', task.project_id)}
                              className="text-blue-600 hover:underline"
                            >
                              {task.project?.name || 'Project'}
                            </Link>
                          </div>
                          
                          {task.milestone && (
                            <div className="flex items-center">
                              <Target className="h-4 w-4 mr-2" />
                              <span>{task.milestone.name}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span className={isOverdue(task.due_date, task.status) ? 'text-red-600 font-medium' : ''}>
                              {formatDate(task.due_date)}
                            </span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {task.progress > 0 && (
                          <div className="mt-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>{task.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1">
                            {task.tags.map((tag) => (
                              <span
                                key={tag.id}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs"
                                style={{ 
                                  backgroundColor: tag.color + '20', 
                                  color: tag.color 
                                }}
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No tasks assigned to you.</p>
                    <p className="text-gray-400">Tasks will appear here when they are assigned to you.</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {tasks.data.length > 0 && tasks.last_page > 1 && (
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {tasks.from} to {tasks.to} of {tasks.total} results
                  </div>
                  <div className="flex gap-2">
                    {tasks.links.map((link, index) => (
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
