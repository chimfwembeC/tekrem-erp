import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Checkbox } from '@/Components/ui/checkbox';
import { Badge } from '@/Components/ui/badge';
import { Switch } from '@/Components/ui/switch';
import { X, Brain } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { Client, User, ProjectTemplate } from '@/types';
import AIProjectPlanning from '@/Components/Projects/AIProjectPlanning';
import TagSelector from '@/Components/Projects/TagSelector';

interface Tag {
  id: number;
  name: string;
  color?: string;
  slug?: string;
}

interface ProjectCreateProps {
  auth: {
    user: any;
  };
  clients: Client[];
  users: User[];
  templates: ProjectTemplate[];
  tags: Tag[];
}

export default function ProjectCreate({ auth, clients, users, templates, tags }: ProjectCreateProps) {
  const route = useRoute();
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    status: 'draft',
    priority: 'medium',
    category: '',
    start_date: '',
    end_date: '',
    deadline: '',
    budget: '',
    client_id: '',
    manager_id: auth.user.id,
    team_members: [] as number[],
    tags: [] as (Tag | string)[],
    template_id: '',
    generate_ai_milestones: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert empty strings to null for backend
    const submitData = {
      ...data,
      client_id: data.client_id || null,
      template_id: data.template_id || null,
      tags: data.tags.map(tag => typeof tag === 'string' ? tag : tag.name),
    };

    post(route('projects.store'), {
      data: submitData
    });
  };

  const handleTeamMemberToggle = (userId: number) => {
    const currentMembers = data.team_members;
    if (currentMembers.includes(userId)) {
      setData('team_members', currentMembers.filter(id => id !== userId));
    } else {
      setData('team_members', [...currentMembers, userId]);
    }
  };

  const handleTemplateSelect = (templateId: string | undefined) => {
    setData('template_id', templateId || '');

    if (templateId && templateId !== '') {
      const template = templates.find(t => t.id.toString() === templateId);
      if (template) {
        // Pre-fill form with template data
        setData(prev => ({
          ...prev,
          description: template.description || prev.description,
          category: template.category || prev.category,
          budget: template.template_data.default_budget?.toString() || prev.budget,
        }));
      }
    }
  };

  return (
    <AppLayout
      title="Create Project"
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Create New Project
        </h2>
      )}
    >
      <Head title="Create Project" />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Enter the basic details for your project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Template Selection */}
                  {templates.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="template_id">Project Template (Optional)</Label>
                      <Select value={data.template_id || undefined} onValueChange={handleTemplateSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a template to pre-fill project data" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No template</SelectItem>
                          {templates.map((template) => (
                            <SelectItem key={template.id} value={template.id.toString()}>
                              {template.name} - {template.category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Project Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Enter project name"
                      />
                      {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={data.category}
                        onChange={(e) => setData('category', e.target.value)}
                        placeholder="e.g., Web Development, Mobile App"
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
                      placeholder="Describe the project goals and requirements"
                      rows={4}
                    />
                    {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="on-hold">On Hold</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.priority && <p className="text-red-500 text-sm">{errors.priority}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget ($)</Label>
                      <Input
                        id="budget"
                        type="number"
                        step="0.01"
                        value={data.budget}
                        onChange={(e) => setData('budget', e.target.value)}
                        placeholder="0.00"
                      />
                      {errors.budget && <p className="text-red-500 text-sm">{errors.budget}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dates and Client */}
              <Card>
                <CardHeader>
                  <CardTitle>Timeline & Client</CardTitle>
                  <CardDescription>
                    Set project dates and assign to a client
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={data.start_date}
                        onChange={(e) => setData('start_date', e.target.value)}
                      />
                      {errors.start_date && <p className="text-red-500 text-sm">{errors.start_date}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={data.end_date}
                        onChange={(e) => setData('end_date', e.target.value)}
                      />
                      {errors.end_date && <p className="text-red-500 text-sm">{errors.end_date}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deadline">Deadline</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={data.deadline}
                        onChange={(e) => setData('deadline', e.target.value)}
                      />
                      {errors.deadline && <p className="text-red-500 text-sm">{errors.deadline}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="client_id">Client</Label>
                      <Select value={data.client_id || undefined} onValueChange={(value) => setData('client_id', value || '')}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No client</SelectItem>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.name} - {client.company}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.client_id && <p className="text-red-500 text-sm">{errors.client_id}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="manager_id">Project Manager <span className="text-red-500">*</span></Label>
                      <Select value={data.manager_id.toString()} onValueChange={(value) => setData('manager_id', parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.manager_id && <p className="text-red-500 text-sm">{errors.manager_id}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Members */}
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Select team members for this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`user-${user.id}`}
                          checked={data.team_members.includes(user.id)}
                          onCheckedChange={() => handleTeamMemberToggle(user.id)}
                        />
                        <Label htmlFor={`user-${user.id}`} className="text-sm">
                          {user.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.team_members && <p className="text-red-500 text-sm mt-2">{errors.team_members}</p>}
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                  <CardDescription>
                    Add tags to categorize and organize your project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TagSelector
                    availableTags={tags}
                    selectedTags={data.tags}
                    onTagsChange={(tags) => setData('tags', tags)}
                    placeholder="Search existing tags or create new ones..."
                    error={errors.tags}
                  />
                </CardContent>
              </Card>

              {/* AI Project Planning */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    AI Project Planning
                  </CardTitle>
                  <CardDescription>
                    Let AI help you plan your project with intelligent milestones and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="generate_ai_milestones"
                      checked={data.generate_ai_milestones}
                      onCheckedChange={(checked) => setData('generate_ai_milestones', checked)}
                    />
                    <Label htmlFor="generate_ai_milestones">
                      Generate AI milestones when creating project
                    </Label>
                  </div>

                  {data.name && data.description && (
                    <AIProjectPlanning
                      projectData={{
                        name: data.name,
                        description: data.description,
                        category: data.category,
                        priority: data.priority,
                        budget: data.budget ? parseFloat(data.budget) : undefined,
                        start_date: data.start_date,
                        end_date: data.end_date,
                        deadline: data.deadline,
                        team_members: data.team_members,
                      }}
                    />
                  )}

                  {(!data.name || !data.description) && (
                    <div className="text-center py-8 text-gray-500">
                      <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Please fill in project name and description to enable AI planning features.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => window.history.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
