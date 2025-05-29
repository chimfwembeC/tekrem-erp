import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Progress } from '@/Components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import {
  Edit,
  Calendar,
  Users,
  DollarSign,
  Clock,
  Target,
  FileText,
  MessageSquare,
  Plus,
  Eye,
  Download
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import usePermissions from '@/Hooks/usePermissions';
import AIInsights from '@/Components/Projects/AIInsights';
import { Project, ProjectMilestone, ProjectFile, ProjectTimeLog } from '@/types';

interface ProjectShowProps {
  auth: {
    user: any;
  };
  project: Project & {
    milestones: ProjectMilestone[];
    files: ProjectFile[];
    time_logs: ProjectTimeLog[];
    total_hours: number;
    total_billable_amount: number;
  };
}

export default function ProjectShow({ auth, project }: ProjectShowProps) {
  const route = useRoute();
  const { hasPermission } = usePermissions();

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
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

  const formatCurrency = (amount: number | null) => {
    return amount ? `$${amount.toLocaleString()}` : 'N/A';
  };

  const formatDate = (date: string | null) => {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  };

  const completedMilestones = project.milestones?.filter(m => m.status === 'completed').length || 0;
  const totalMilestones = project.milestones?.length || 0;
  const milestoneProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <AppLayout
      title={project.name}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              {project.name}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={getStatusBadgeColor(project.status)}>
                {project.status}
              </Badge>
              <Badge variant="outline" className={getPriorityBadgeColor(project.priority)}>
                {project.priority}
              </Badge>
              {project.category && (
                <Badge variant="outline">
                  {project.category}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {hasPermission('projects.edit') && (
              <Link href={route('projects.edit', project.id)}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Project
                </Button>
              </Link>
            )}
            <Link href={route('projects.livechat', project.id)}>
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Project Chat
              </Button>
            </Link>
          </div>
        </div>
      )}
    >
      <Head title={project.name} />

      <div className="space-y-6">
        {/* Project Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">
                    {project.description || 'No description provided'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Progress</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Milestones</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{completedMilestones} of {totalMilestones} completed</span>
                        <span>{milestoneProgress}%</span>
                      </div>
                      <Progress value={milestoneProgress} className="h-2" />
                    </div>
                  </div>
                </div>

                {project.tags && project.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {project.client && (
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">Client:</span>
                      <span className="ml-2 font-medium">{project.client.name}</span>
                    </div>
                  )}

                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">Manager:</span>
                    <span className="ml-2 font-medium">{project.manager?.name}</span>
                  </div>

                  {project.budget && (
                    <div className="flex items-center text-sm">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">Budget:</span>
                      <span className="ml-2 font-medium">{formatCurrency(project.budget)}</span>
                    </div>
                  )}

                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">Spent:</span>
                    <span className="ml-2 font-medium">{formatCurrency(project.spent_amount)}</span>
                  </div>

                  {project.start_date && (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">Start Date:</span>
                      <span className="ml-2 font-medium">{formatDate(project.start_date)}</span>
                    </div>
                  )}

                  {project.deadline && (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-gray-600">Deadline:</span>
                      <span className="ml-2 font-medium">{formatDate(project.deadline)}</span>
                    </div>
                  )}

                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">Total Hours:</span>
                    <span className="ml-2 font-medium">{project.total_hours || 0}h</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-gray-600">Billable Amount:</span>
                    <span className="ml-2 font-medium">{formatCurrency(project.total_billable_amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Members */}
            {project.team && project.team.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {project.team.map((member) => (
                      <div key={member.id} className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{member.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* AI Insights */}
        <AIInsights project={project} milestones={project.milestones} />

        {/* Tabs for detailed information */}
        <Tabs defaultValue="milestones" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="time-logs">Time Logs</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="milestones" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Project Milestones</h3>
              {hasPermission('projects.milestones.create') && (
                <Link href={route('projects.milestones.create', { project: project.id })}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Milestone
                  </Button>
                </Link>
              )}
            </div>

            <div className="space-y-4">
              {project.milestones && project.milestones.length > 0 ? (
                project.milestones.map((milestone) => (
                  <Card key={milestone.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{milestone.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {milestone.description || 'No description'}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <Badge variant="outline" className={getStatusBadgeColor(milestone.status)}>
                              {milestone.status}
                            </Badge>
                            {milestone.due_date && (
                              <span className="text-sm text-gray-600">
                                Due: {formatDate(milestone.due_date)}
                              </span>
                            )}
                            {milestone.assignee && (
                              <span className="text-sm text-gray-600">
                                Assigned to: {milestone.assignee.name}
                              </span>
                            )}
                          </div>
                          <div className="mt-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{milestone.progress}%</span>
                            </div>
                            <Progress value={milestone.progress} className="h-2" />
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Link href={route('projects.milestones.show', [project.id, milestone.id])}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No milestones created yet</p>
                    {hasPermission('projects.milestones.create') && (
                      <Link href={route('projects.milestones.create', { project: project.id })} className="mt-4 inline-block">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Milestone
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Project Files</h3>
              {hasPermission('projects.files.create') && (
                <Link href={route('projects.files.create', { project: project.id })}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.files && project.files.length > 0 ? (
                project.files.map((file) => (
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
                ))
              ) : (
                <div className="col-span-full">
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No files uploaded yet</p>
                      {hasPermission('projects.files.create') && (
                        <Link href={route('projects.files.create', { project: project.id })} className="mt-4 inline-block">
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Upload First File
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="time-logs" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Time Logs</h3>
              {hasPermission('projects.time-logs.create') && (
                <Link href={route('projects.time-logs.create', { project: project.id })}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Log Time
                  </Button>
                </Link>
              )}
            </div>

            <div className="space-y-4">
              {project.time_logs && project.time_logs.length > 0 ? (
                project.time_logs.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{log.user?.name}</h4>
                            <Badge variant="outline" className={log.status_color}>
                              {log.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {log.description || 'No description'}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                            <span>{log.hours}h logged</span>
                            <span>{formatDate(log.log_date)}</span>
                            {log.is_billable && log.hourly_rate && (
                              <span>Billable: {formatCurrency(log.total_amount)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No time logged yet</p>
                    {hasPermission('projects.time-logs.create') && (
                      <Link href={route('projects.time-logs.create', { project: project.id })} className="mt-4 inline-block">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Log First Entry
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <h3 className="text-lg font-medium">Recent Activity</h3>
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Activity feed coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
