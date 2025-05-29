import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  Users,
  Target,
  CheckCircle,
  Clock
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import usePermissions from '@/Hooks/usePermissions';
import { Project, ProjectMilestone } from '@/types';

interface MilestonesIndexProps {
  auth: {
    user: any;
  };
  project: Project;
  milestones: {
    data: ProjectMilestone[];
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
  };
}

export default function MilestonesIndex({ auth, project, milestones, filters }: MilestonesIndexProps) {
  const route = useRoute();
  const { hasPermission } = usePermissions();
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || 'all');
  const [priority, setPriority] = useState(filters.priority || 'all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('projects.milestones.index', project.id), {
      search: search || undefined,
      status: status !== 'all' ? status : undefined,
      priority: priority !== 'all' ? priority : undefined,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const handleDelete = (milestone: ProjectMilestone) => {
    if (confirm(`Are you sure you want to delete the milestone "${milestone.name}"?`)) {
      router.delete(route('projects.milestones.destroy', [project.id, milestone.id]));
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
      case 'overdue':
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

  const completedMilestones = milestones.data.filter(m => m.status === 'completed').length;
  const totalMilestones = milestones.data.length;
  const overdueMilestones = milestones.data.filter(m => m.status === 'overdue').length;

  return (
    <AppLayout
      title={`${project.name} - Milestones`}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              {project.name} - Milestones
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>{completedMilestones} of {totalMilestones} completed</span>
              {overdueMilestones > 0 && (
                <span className="text-red-600">{overdueMilestones} overdue</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={route('projects.show', project.id)}>
              <Button variant="outline">
                Back to Project
              </Button>
            </Link>
            {hasPermission('projects.milestones.create') && (
              <Link href={route('projects.milestones.create', project.id)}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Milestone
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    >
      <Head title={`${project.name} - Milestones`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Milestones</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMilestones}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{completedMilestones}</div>
                <p className="text-xs text-muted-foreground">
                  {totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0}% complete
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
                  {milestones.data.filter(m => m.status === 'in-progress').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{overdueMilestones}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <CardTitle>Project Milestones</CardTitle>
                <CardDescription>
                  Manage milestones for {project.name}
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
                      placeholder="Search milestones..."
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
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit" className="w-full">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </form>

              {/* Milestones List */}
              <div className="space-y-4">
                {milestones.data.length > 0 ? (
                  milestones.data.map((milestone) => (
                    <Card key={milestone.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Link 
                                href={route('projects.milestones.show', [project.id, milestone.id])}
                                className="text-lg font-semibold text-blue-600 hover:underline"
                              >
                                {milestone.name}
                              </Link>
                              <Badge variant="outline" className={getStatusBadgeColor(milestone.status)}>
                                {milestone.status}
                              </Badge>
                              <Badge variant="outline" className={getPriorityBadgeColor(milestone.priority)}>
                                {milestone.priority}
                              </Badge>
                            </div>
                            
                            {milestone.description && (
                              <p className="text-gray-600 mb-3 line-clamp-2">
                                {milestone.description}
                              </p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                  <span>Progress</span>
                                  <span>{milestone.progress}%</span>
                                </div>
                                <Progress value={milestone.progress} className="h-2" />
                              </div>
                              
                              {milestone.due_date && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  <span>Due: {formatDate(milestone.due_date)}</span>
                                </div>
                              )}
                              
                              {milestone.assignee && (
                                <div className="flex items-center text-sm text-gray-600">
                                  <Users className="h-4 w-4 mr-2" />
                                  <span>Assigned to: {milestone.assignee.name}</span>
                                </div>
                              )}
                            </div>

                            {milestone.dependencies && milestone.dependencies.length > 0 && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Dependencies:</span> {milestone.dependencies.length} milestone(s)
                              </div>
                            )}
                          </div>

                          <div className="flex gap-2 ml-4">
                            <Link href={route('projects.milestones.show', [project.id, milestone.id])}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {hasPermission('projects.milestones.edit') && (
                              <Link href={route('projects.milestones.edit', [project.id, milestone.id])}>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            {hasPermission('projects.milestones.delete') && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(milestone)}
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
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No milestones found.</p>
                    {hasPermission('projects.milestones.create') && (
                      <Link href={route('projects.milestones.create', project.id)} className="mt-4 inline-block">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Milestone
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {milestones.data.length > 0 && milestones.last_page > 1 && (
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {milestones.from} to {milestones.to} of {milestones.total} results
                  </div>
                  <div className="flex gap-2">
                    {milestones.links.map((link, index) => (
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
