import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import { Badge } from '@/Components/ui/badge';
import { X, Plus } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface TemplateCreateProps {
  auth: {
    user: any;
  };
}

export default function TemplateCreate({ auth }: TemplateCreateProps) {
  const route = useRoute();
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    category: '',
    is_active: true,
    template_data: {
      default_budget: '',
      default_duration_days: '',
      milestones: [] as Array<{
        name: string;
        description: string;
        order: number;
        estimated_days: string;
      }>,
      team_roles: [] as Array<{
        role: string;
        description: string;
        required: boolean;
      }>,
      default_tags: [] as string[],
    },
  });

  const [newMilestone, setNewMilestone] = React.useState({
    name: '',
    description: '',
    estimated_days: '',
  });

  const [newRole, setNewRole] = React.useState({
    role: '',
    description: '',
    required: false,
  });

  const [newTag, setNewTag] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('projects.templates.store'));
  };

  const handleAddMilestone = () => {
    if (newMilestone.name.trim()) {
      const milestone = {
        ...newMilestone,
        order: data.template_data.milestones.length + 1,
      };
      setData('template_data', {
        ...data.template_data,
        milestones: [...data.template_data.milestones, milestone],
      });
      setNewMilestone({ name: '', description: '', estimated_days: '' });
    }
  };

  const handleRemoveMilestone = (index: number) => {
    const milestones = data.template_data.milestones.filter((_, i) => i !== index);
    setData('template_data', {
      ...data.template_data,
      milestones: milestones.map((m, i) => ({ ...m, order: i + 1 })),
    });
  };

  const handleAddRole = () => {
    if (newRole.role.trim()) {
      setData('template_data', {
        ...data.template_data,
        team_roles: [...data.template_data.team_roles, newRole],
      });
      setNewRole({ role: '', description: '', required: false });
    }
  };

  const handleRemoveRole = (index: number) => {
    const roles = data.template_data.team_roles.filter((_, i) => i !== index);
    setData('template_data', {
      ...data.template_data,
      team_roles: roles,
    });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !data.template_data.default_tags.includes(newTag.trim())) {
      setData('template_data', {
        ...data.template_data,
        default_tags: [...data.template_data.default_tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setData('template_data', {
      ...data.template_data,
      default_tags: data.template_data.default_tags.filter(tag => tag !== tagToRemove),
    });
  };

  return (
    <AppLayout
      title="Create Project Template"
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Create Project Template
        </h2>
      )}
    >
      <Head title="Create Project Template" />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Template Information</CardTitle>
                  <CardDescription>
                    Create a reusable project template
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Template Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g., Web Development Project"
                      />
                      {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={data.category}
                        onChange={(e) => setData('category', e.target.value)}
                        placeholder="e.g., Software Development"
                      />
                      {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder="Describe what this template is for and when to use it"
                      rows={3}
                    />
                    {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="default_budget">Default Budget ($)</Label>
                      <Input
                        id="default_budget"
                        type="number"
                        step="0.01"
                        value={data.template_data.default_budget}
                        onChange={(e) => setData('template_data', {
                          ...data.template_data,
                          default_budget: e.target.value
                        })}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="default_duration_days">Default Duration (Days)</Label>
                      <Input
                        id="default_duration_days"
                        type="number"
                        value={data.template_data.default_duration_days}
                        onChange={(e) => setData('template_data', {
                          ...data.template_data,
                          default_duration_days: e.target.value
                        })}
                        placeholder="30"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_active"
                      checked={data.is_active}
                      onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                    />
                    <Label htmlFor="is_active">Active template</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Milestones */}
              <Card>
                <CardHeader>
                  <CardTitle>Default Milestones</CardTitle>
                  <CardDescription>
                    Define milestones that will be created for projects using this template
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Milestone Form */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50">
                    <Input
                      placeholder="Milestone name"
                      value={newMilestone.name}
                      onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                    />
                    <Input
                      placeholder="Description"
                      value={newMilestone.description}
                      onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Days"
                      value={newMilestone.estimated_days}
                      onChange={(e) => setNewMilestone({ ...newMilestone, estimated_days: e.target.value })}
                    />
                    <Button type="button" onClick={handleAddMilestone}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  {/* Milestones List */}
                  {data.template_data.milestones.length > 0 && (
                    <div className="space-y-2">
                      {data.template_data.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{milestone.name}</p>
                            <p className="text-sm text-gray-600">
                              {milestone.description} • {milestone.estimated_days} days
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveMilestone(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Team Roles */}
              <Card>
                <CardHeader>
                  <CardTitle>Team Roles</CardTitle>
                  <CardDescription>
                    Define the roles needed for projects using this template
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Role Form */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50">
                    <Input
                      placeholder="Role name"
                      value={newRole.role}
                      onChange={(e) => setNewRole({ ...newRole, role: e.target.value })}
                    />
                    <Input
                      placeholder="Description"
                      value={newRole.description}
                      onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    />
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="role_required"
                        checked={newRole.required}
                        onCheckedChange={(checked) => setNewRole({ ...newRole, required: checked as boolean })}
                      />
                      <Label htmlFor="role_required" className="text-sm">Required</Label>
                    </div>
                    <Button type="button" onClick={handleAddRole}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  {/* Roles List */}
                  {data.template_data.team_roles.length > 0 && (
                    <div className="space-y-2">
                      {data.template_data.team_roles.map((role, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {role.role}
                              {role.required && <Badge variant="secondary">Required</Badge>}
                            </p>
                            <p className="text-sm text-gray-600">{role.description}</p>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveRole(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Default Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Default Tags</CardTitle>
                  <CardDescription>
                    Tags that will be automatically applied to projects using this template
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Enter a tag"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      />
                      <Button type="button" onClick={handleAddTag} variant="outline">
                        Add Tag
                      </Button>
                    </div>
                    {data.template_data.default_tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {data.template_data.default_tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() => handleRemoveTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Link href={route('projects.templates.index')}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Creating...' : 'Create Template'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
