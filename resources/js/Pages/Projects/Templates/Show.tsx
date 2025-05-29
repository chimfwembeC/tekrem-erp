import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import {
  Edit,
  Copy,
  Layout,
  Users,
  DollarSign,
  Clock,
  Target,
  Tag,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import usePermissions from '@/Hooks/usePermissions';
import { ProjectTemplate } from '@/types';

interface TemplateShowProps {
  auth: {
    user: any;
  };
  template: ProjectTemplate & {
    usage_count: number;
    created_by: {
      name: string;
    };
  };
}

export default function TemplateShow({ auth, template }: TemplateShowProps) {
  const route = useRoute();
  const { hasPermission } = usePermissions();

  const formatCurrency = (amount: number | null) => {
    return amount ? `$${amount.toLocaleString()}` : 'Not specified';
  };

  const formatDuration = (days: number | null) => {
    return days ? `${days} days` : 'Not specified';
  };

  return (
    <AppLayout
      title={template.name}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              {template.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Project Template • {template.category}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={route('projects.templates.index')}>
              <Button variant="outline">
                Back to Templates
              </Button>
            </Link>
            {hasPermission('projects.create') && (
              <Link href={route('projects.create', { template: template.id })}>
                <Button variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
              </Link>
            )}
            {hasPermission('projects.templates.edit') && (
              <Link href={route('projects.templates.edit', template.id)}>
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Template
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    >
      <Head title={template.name} />

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
                          {template.name}
                          {template.is_active ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {template.description || 'No description provided'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Layout className="h-4 w-4 mr-2" />
                          <span>Category: {template.category || 'Uncategorized'}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          <span>Created by: {template.created_by?.name}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span>Default Budget: {formatCurrency(template.template_data?.default_budget)}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Default Duration: {formatDuration(template.template_data?.default_duration_days)}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <Target className="h-4 w-4 mr-2" />
                          <span>Milestones: {template.template_data?.milestones?.length || 0}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          <span>Team Roles: {template.template_data?.team_roles?.length || 0}</span>
                        </div>
                      </div>

                      {/* Default Tags */}
                      {template.template_data?.default_tags && template.template_data.default_tags.length > 0 && (
                        <div className="pt-4 border-t">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Default Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {template.template_data.default_tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {tag}
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
                    <CardTitle className="text-sm font-medium">Template Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      {template.is_active ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-100 text-gray-800">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Usage Count</span>
                      <span className="text-sm font-medium">{template.usage_count || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Created</span>
                      <span className="text-sm font-medium">
                        {new Date(template.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Updated</span>
                      <span className="text-sm font-medium">
                        {new Date(template.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="milestones" className="w-full">
              <TabsList>
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                <TabsTrigger value="team-roles">Team Roles</TabsTrigger>
                <TabsTrigger value="configuration">Configuration</TabsTrigger>
              </TabsList>

              <TabsContent value="milestones" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Default Milestones</CardTitle>
                    <CardDescription>
                      Milestones that will be created for projects using this template
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {template.template_data?.milestones && template.template_data.milestones.length > 0 ? (
                      <div className="space-y-3">
                        {template.template_data.milestones.map((milestone, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{milestone.name}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {milestone.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">Order: {milestone.order}</p>
                              {milestone.estimated_days && (
                                <p className="text-xs text-gray-600">{milestone.estimated_days} days</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No milestones defined for this template
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="team-roles" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Roles</CardTitle>
                    <CardDescription>
                      Roles needed for projects using this template
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {template.template_data?.team_roles && template.template_data.team_roles.length > 0 ? (
                      <div className="space-y-3">
                        {template.template_data.team_roles.map((role, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                {role.role}
                                {role.required && (
                                  <Badge variant="secondary" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {role.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No team roles defined for this template
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="configuration" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Template Configuration</CardTitle>
                    <CardDescription>
                      Default settings and configuration for this template
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium text-sm">Default Budget</h4>
                          <p className="text-lg font-semibold text-green-600">
                            {formatCurrency(template.template_data?.default_budget)}
                          </p>
                        </div>

                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium text-sm">Default Duration</h4>
                          <p className="text-lg font-semibold text-blue-600">
                            {formatDuration(template.template_data?.default_duration_days)}
                          </p>
                        </div>

                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium text-sm">Milestones Count</h4>
                          <p className="text-lg font-semibold text-purple-600">
                            {template.template_data?.milestones?.length || 0}
                          </p>
                        </div>

                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium text-sm">Team Roles Count</h4>
                          <p className="text-lg font-semibold text-orange-600">
                            {template.template_data?.team_roles?.length || 0}
                          </p>
                        </div>
                      </div>

                      {template.template_data?.default_tags && template.template_data.default_tags.length > 0 && (
                        <div className="p-3 border rounded-lg">
                          <h4 className="font-medium text-sm mb-2">Default Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {template.template_data.default_tags.map((tag, index) => (
                              <Badge key={index} variant="outline">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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
