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
import { X } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import { Project, User, ProjectMilestone, ProjectTask, Tag } from '@/types';

interface TaskCreateProps {
  auth: {
    user: any;
  };
  project: Project;
  milestones: ProjectMilestone[];
  staffUsers: User[];
  availableTasks: ProjectTask[];
  tags: Tag[];
}

export default function TaskCreate({ auth, project, milestones, staffUsers, availableTasks, tags }: TaskCreateProps) {
  const route = useRoute();
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
    estimated_hours: '',
    milestone_id: 'empty',
    assigned_to: 'empty',
    dependencies: [] as number[],
    tags: [] as number[],
  });

  const [newTag, setNewTag] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert "empty" values to empty strings for backend
    const submitData = {
      ...data,
      milestone_id: data.milestone_id === 'empty' ? '' : data.milestone_id,
      assigned_to: data.assigned_to === 'empty' ? '' : data.assigned_to,
    };
    
    post(route('projects.tasks.store', project.id), {
      data: submitData
    });
  };

  const handleDependencyToggle = (taskId: number) => {
    const currentDependencies = data.dependencies;
    if (currentDependencies.includes(taskId)) {
      setData('dependencies', currentDependencies.filter(id => id !== taskId));
    } else {
      setData('dependencies', [...currentDependencies, taskId]);
    }
  };

  const handleTagToggle = (tagId: number) => {
    const currentTags = data.tags;
    if (currentTags.includes(tagId)) {
      setData('tags', currentTags.filter(id => id !== tagId));
    } else {
      setData('tags', [...currentTags, tagId]);
    }
  };

  return (
    <AppLayout
      title={`Create Task - ${project.name}`}
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Create Task for {project.name}
        </h2>
      )}
    >
      <Head title={`Create Task - ${project.name}`} />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Task Information</CardTitle>
                  <CardDescription>
                    Create a new task for this project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Task Title <span className="text-red-500">*</span></Label>
                    <Input
                      id="title"
                      value={data.title}
                      onChange={(e) => setData('title', e.target.value)}
                      placeholder="Enter task title"
                    />
                    {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder="Describe the task requirements and acceptance criteria"
                      rows={4}
                    />
                    {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="on-hold">On Hold</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
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
                      <Label htmlFor="estimated_hours">Estimated Hours</Label>
                      <Input
                        id="estimated_hours"
                        type="number"
                        step="0.5"
                        value={data.estimated_hours}
                        onChange={(e) => setData('estimated_hours', e.target.value)}
                        placeholder="0"
                      />
                      {errors.estimated_hours && <p className="text-red-500 text-sm">{errors.estimated_hours}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="milestone_id">Milestone</Label>
                      <Select value={data.milestone_id} onValueChange={(value) => setData('milestone_id', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select milestone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="empty">No milestone</SelectItem>
                          {milestones.map((milestone) => (
                            <SelectItem key={milestone.id} value={milestone.id.toString()}>
                              {milestone.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.milestone_id && <p className="text-red-500 text-sm">{errors.milestone_id}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="assigned_to">Assigned To</Label>
                      <Select value={data.assigned_to} onValueChange={(value) => setData('assigned_to', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="empty">No assignee</SelectItem>
                          {staffUsers.map((user) => (
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
              {availableTasks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Dependencies</CardTitle>
                    <CardDescription>
                      Select tasks that must be completed before this one
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableTasks.map((task) => (
                        <div key={task.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`task-${task.id}`}
                            checked={data.dependencies.includes(task.id)}
                            onCheckedChange={() => handleDependencyToggle(task.id)}
                          />
                          <Label htmlFor={`task-${task.id}`} className="text-sm">
                            {task.title}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {errors.dependencies && <p className="text-red-500 text-sm mt-2">{errors.dependencies}</p>}
                  </CardContent>
                </Card>
              )}

              {/* Tags */}
              {tags.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tags</CardTitle>
                    <CardDescription>
                      Select tags to categorize this task
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tags.map((tag) => (
                        <div key={tag.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tag-${tag.id}`}
                            checked={data.tags.includes(tag.id)}
                            onCheckedChange={() => handleTagToggle(tag.id)}
                          />
                          <Label htmlFor={`tag-${tag.id}`} className="text-sm flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            {tag.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {errors.tags && <p className="text-red-500 text-sm mt-2">{errors.tags}</p>}
                  </CardContent>
                </Card>
              )}

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Link href={route('projects.tasks.index', project.id)}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
