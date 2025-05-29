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
import { Tag } from '@/types';

interface TagEditProps {
  auth: {
    user: any;
  };
  tag: Tag;
}

export default function TagEdit({ auth, tag }: TagEditProps) {
  const route = useRoute();
  const { data, setData, put, processing, errors } = useForm({
    name: tag.name || '',
    description: tag.description || '',
    color: tag.color || '#3B82F6',
    type: tag.type || 'general',
    is_active: tag.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('projects.tags.update', tag.id));
  };

  const predefinedColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#F97316', // Orange
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6B7280', // Gray
  ];

  return (
    <AppLayout
      title={`Edit ${tag.name}`}
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Edit Tag: {tag.name}
        </h2>
      )}
    >
      <Head title={`Edit ${tag.name}`} />

      <div className="py-12">
        <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Tag Information</CardTitle>
                <CardDescription>
                  Update the tag details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Tag Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Enter tag name"
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Describe what this tag represents"
                    rows={3}
                  />
                  {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type <span className="text-red-500">*</span></Label>
                  <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                      <SelectItem value="milestone">Milestone</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="space-y-3">
                    {/* Color Input */}
                    <div className="flex items-center gap-3">
                      <Input
                        id="color"
                        type="color"
                        value={data.color}
                        onChange={(e) => setData('color', e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={data.color}
                        onChange={(e) => setData('color', e.target.value)}
                        placeholder="#3B82F6"
                        className="flex-1"
                      />
                    </div>

                    {/* Predefined Colors */}
                    <div>
                      <Label className="text-sm text-gray-600">Quick Colors:</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {predefinedColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className={`w-8 h-8 rounded-full border-2 ${
                              data.color === color ? 'border-gray-800' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setData('color', color)}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-gray-600">Preview:</Label>
                      <div
                        className="px-3 py-1 rounded-full text-white text-sm font-medium"
                        style={{ backgroundColor: data.color }}
                      >
                        {data.name || 'Tag Name'}
                      </div>
                    </div>
                  </div>
                  {errors.color && <p className="text-red-500 text-sm">{errors.color}</p>}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={data.is_active}
                    onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                  />
                  <Label htmlFor="is_active">Active tag</Label>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-6">
                  <Link href={route('projects.tags.index')}>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={processing}>
                    {processing ? 'Updating...' : 'Update Tag'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
