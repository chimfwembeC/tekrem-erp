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
import useRoute from '@/Hooks/useRoute';
import { Project, User, ProjectMilestone } from '@/types';

interface MilestoneCreateProps {
  auth: {
    user: any;
  };
  project: Project;
  users: User[];
  availableDependencies: ProjectMilestone[];
}

export default function MilestoneCreate({ auth, project, users, availableDependencies }: MilestoneCreateProps) {
  const route = useRoute();
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    description: '',
    due_date: '',
    priority: 'medium',
    assigned_to: 'empty',
    dependencies: [] as number[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert "empty" values to empty strings for backend
    const submitData = {
      ...data,
      assigned_to: data.assigned_to === 'empty' ? '' : data.assigned_to,
    };
    
    post(route('projects.milestones.store', project.id), {
      data: submitData
    });
  };

  const handleDependencyToggle = (milestoneId: number) => {
    const currentDependencies = data.dependencies;
    if (currentDependencies.includes(milestoneId)) {
      setData('dependencies', currentDependencies.filter(id => id !== milestoneId));
    } else {
      setData('dependencies', [...currentDependencies, milestoneId]);
    }
  };

  return (
    <AppLayout
      title={`Create Milestone - ${project.name}`}
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Create Milestone for {project.name}
        </h2>
      )}
    >
      <Head title={`Create Milestone - ${project.name}`} />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Milestone Information</CardTitle>
                  <CardDescription>
                    Create a new milestone for this project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Milestone Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      value={data.name}
                      onChange={(e) => setData('name', e.target.value)}
                      placeholder="Enter milestone name"
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder="Describe the milestone objectives and deliverables"
                      rows={4}
                    />
                    {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="due_date">Due Date</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={data.due_date}
                        onChange={(e) => setData('due_date', e.target.value)}
                      />
                      {errors.due_date && <p className="text-red-500 text-sm">{errors.due_date}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority <span className="text-red-500">*</span></Label>
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
                      <Label htmlFor="assigned_to">Assigned To</Label>
                      <Select value={data.assigned_to} onValueChange={(value) => setData('assigned_to', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="empty">No assignee</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.assigned_to && <p className="text-red-500 text-sm">{errors.assigned_to}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dependencies */}
              {availableDependencies.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Dependencies</CardTitle>
                    <CardDescription>
                      Select milestones that must be completed before this one
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableDependencies.map((milestone) => (
                        <div key={milestone.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`milestone-${milestone.id}`}
                            checked={data.dependencies.includes(milestone.id)}
                            onCheckedChange={() => handleDependencyToggle(milestone.id)}
                          />
                          <Label htmlFor={`milestone-${milestone.id}`} className="text-sm">
                            {milestone.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {errors.dependencies && <p className="text-red-500 text-sm mt-2">{errors.dependencies}</p>}
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Link href={route('projects.milestones.index', project.id)}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Creating...' : 'Create Milestone'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
