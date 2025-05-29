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
  Calendar,
  Users,
  CheckSquare,
  Clock,
  AlertTriangle
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import usePermissions from '@/Hooks/usePermissions';
import { Project, ProjectTask } from '@/types';

interface TasksIndexProps {
  auth: {
    user: any;
  };
  project: Project;
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
    search?: string;
    status?: string;
    priority?: string;
    assigned_to?: string;
  };
}

export default function TasksIndex({ auth, project, tasks, filters }: TasksIndexProps) {
  const route = useRoute();
  const { hasPermission } = usePermissions();
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || 'all');
  const [priority, setPriority] = useState(filters.priority || 'all');
  const [assignedTo, setAssignedTo] = useState(filters.assigned_to || 'all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('projects.tasks.index', project.id), {
      search: search || undefined,
      status: status !== 'all' ? status : undefined,
      priority: priority !== 'all' ? priority : undefined,
      assigned_to: assignedTo !== 'all' ? assignedTo : undefined,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDelete = (task: ProjectTask) => {
    if (confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
      router.delete(route('projects.tasks.destroy', [project.id, task.id]));
    }
  };

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

  const completedTasks = tasks.data.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.data.length;
  const overdueTasks = tasks.data.filter(t => isOverdue(t.due_date, t.status)).length;

  return (
    <AppLayout
      title={`${project.name} - Tasks`}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              {project.name} - Tasks
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>{completedTasks} of {totalTasks} completed</span>
              {overdueTasks > 0 && (
                <span className="text-red-600">{overdueTasks} overdue</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={route('projects.show', project.id)}>
              <Button variant="outline">
                Back to Project
              </Button>
            </Link>
            {hasPermission('projects.tasks.create') && (
              <Link href={route('projects.tasks.create', project.id)}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    >
      <Head title={`${project.name} - Tasks`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalTasks}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% complete
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {tasks.data.filter(t => t.status === 'in-progress').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{overdueTasks}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <CardTitle>Project Tasks</CardTitle>
                <CardDescription>
                  Manage tasks for {project.name}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <form onSubmit={handleSearch} className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      type="text"
                      placeholder="Search tasks..."
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit" className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </form>

              {/* Tasks List */}
              <div className="space-y-4">
                {tasks.data.length > 0 ? (
                  tasks.data.map((task) => (
                    <Card key={task.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Link 
                                href={route('projects.tasks.show', [project.id, task.id])}
                                className="text-lg font-semibold text-blue-600 hover:underline"
                              >
                                {task.title}
                              </Link>
                              <Badge variant="outline" className={getStatusBadgeColor(task.status)}>
                                {task.status}
                              </Badge>
                              <Badge variant="outline" className={getPriorityBadgeColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              {isOverdue(task.due_date, task.status) && (
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                              )}
                            </div>
                            
                            {task.description && (
                              <p className="text-gray-600 mb-3 line-clamp-2">
                                {task.description}
                              </p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                  <CheckSquare className="h-4 w-4 mr-2" />
                                  <span>Milestone: {task.milestone.name}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Link href={route('projects.tasks.show', [project.id, task.id])}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {hasPermission('projects.tasks.edit') && (
                              <Link href={route('projects.tasks.edit', [project.id, task.id])}>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            {hasPermission('projects.tasks.delete') && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(task)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No tasks found.</p>
                    {hasPermission('projects.tasks.create') && (
                      <Link href={route('projects.tasks.create', project.id)} className="mt-4 inline-block">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Task
                        </Button>
                      </Link>
                    )}
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
