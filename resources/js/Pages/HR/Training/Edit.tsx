import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Checkbox } from '@/Components/ui/checkbox';
import { ArrowLeft, Save, GraduationCap, Plus, X } from 'lucide-react';
import { useTranslate } from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Training {
  id: number;
  title: string;
  description: string;
  type: string;
  category: string | null;
  instructor_id: number | null;
  provider: string | null;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  mode: string;
  max_participants: number | null;
  cost_per_participant: number | null;
  currency: string;
  prerequisites: string | null;
  learning_objectives: string | null;
  materials: string[];
  is_mandatory: boolean;
  requires_certification: boolean;
  certification_validity_months: number | null;
  attachments: any[];
}

interface Instructor {
  id: number;
  name: string;
}

interface Props {
  training: Training;
  instructors: Instructor[];
  categories: string[];
}

export default function Edit({ training, instructors, categories }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [materials, setMaterials] = useState<string[]>(training.materials || ['']);
  const [attachments, setAttachments] = useState<File[]>([]);

  const { data, setData, put, processing, errors } = useForm({
    title: training.title,
    description: training.description,
    type: training.type,
    category: training.category || '',
    instructor_id: training.instructor_id?.toString() || '',
    provider: training.provider || '',
    start_date: training.start_date,
    end_date: training.end_date,
    start_time: training.start_time || '',
    end_time: training.end_time || '',
    location: training.location || '',
    mode: training.mode,
    max_participants: training.max_participants?.toString() || '',
    cost_per_participant: training.cost_per_participant?.toString() || '',
    currency: training.currency,
    prerequisites: training.prerequisites || '',
    learning_objectives: training.learning_objectives || '',
    materials: training.materials || [],
    is_mandatory: training.is_mandatory,
    requires_certification: training.requires_certification,
    certification_validity_months: training.certification_validity_months?.toString() || '',
    attachments: [] as File[],
  });

  useEffect(() => {
    if (materials.length === 0) {
      setMaterials(['']);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Filter out empty materials
    const filteredMaterials = materials.filter(material => material.trim() !== '');

    put(route('hr.training.update', training.id), {
      ...data,
      materials: filteredMaterials,
      attachments: attachments,
    });
  };

  const addMaterial = () => {
    setMaterials([...materials, '']);
  };

  const removeMaterial = (index: number) => {
    const newMaterials = materials.filter((_, i) => i !== index);
    setMaterials(newMaterials);
    setData('materials', newMaterials);
  };

  const updateMaterial = (index: number, value: string) => {
    const newMaterials = [...materials];
    newMaterials[index] = value;
    setMaterials(newMaterials);
    setData('materials', newMaterials);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
      setData('attachments', [...attachments, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = attachments.filter((_, i) => i !== index);
    setAttachments(newAttachments);
    setData('attachments', newAttachments);
  };

  return (
    <AppLayout
      title={`Edit Training: ${training.title}`}
      renderHeader={() => (
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <a href={route('hr.training.show', training.id)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Training
            </a>
          </Button>
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Edit Training: {training.title}
          </h2>
        </div>
      )}
    >
      <Head title={`Edit Training: ${training.title}`} />

      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Update the basic details for the training program
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      type="text"
                      value={data.title}
                      onChange={(e) => setData('title', e.target.value)}
                      className={errors.title ? 'border-red-500' : ''}
                      placeholder="Enter training title"
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                      <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select training type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="external">External</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="certification">Certification</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-sm text-red-500">{errors.type}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    className={errors.description ? 'border-red-500' : ''}
                    placeholder="Describe the training program"
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select or enter category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructor_id">Instructor</Label>
                    <Select value={data.instructor_id} onValueChange={(value) => setData('instructor_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        {instructors.map((instructor) => (
                          <SelectItem key={instructor.id} value={instructor.id.toString()}>
                            {instructor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="provider">External Provider</Label>
                  <Input
                    id="provider"
                    type="text"
                    value={data.provider}
                    onChange={(e) => setData('provider', e.target.value)}
                    placeholder="Enter provider name (if external)"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Schedule & Logistics */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule & Logistics</CardTitle>
                <CardDescription>
                  Update the training schedule and logistics details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={data.start_date}
                      onChange={(e) => setData('start_date', e.target.value)}
                      className={errors.start_date ? 'border-red-500' : ''}
                    />
                    {errors.start_date && (
                      <p className="text-sm text-red-500">{errors.start_date}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={data.end_date}
                      onChange={(e) => setData('end_date', e.target.value)}
                      className={errors.end_date ? 'border-red-500' : ''}
                    />
                    {errors.end_date && (
                      <p className="text-sm text-red-500">{errors.end_date}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={data.start_time}
                      onChange={(e) => setData('start_time', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={data.end_time}
                      onChange={(e) => setData('end_time', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mode">Mode *</Label>
                    <Select value={data.mode} onValueChange={(value) => setData('mode', value)}>
                      <SelectTrigger className={errors.mode ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select training mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_person">In Person</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.mode && (
                      <p className="text-sm text-red-500">{errors.mode}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      value={data.location}
                      onChange={(e) => setData('location', e.target.value)}
                      placeholder="Enter location or online platform"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max_participants">Max Participants</Label>
                    <Input
                      id="max_participants"
                      type="number"
                      value={data.max_participants}
                      onChange={(e) => setData('max_participants', e.target.value)}
                      placeholder="Enter maximum participants"
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost_per_participant">Cost per Participant</Label>
                    <Input
                      id="cost_per_participant"
                      type="number"
                      step="0.01"
                      value={data.cost_per_participant}
                      onChange={(e) => setData('cost_per_participant', e.target.value)}
                      placeholder="0.00"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={data.currency} onValueChange={(value) => setData('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training Content */}
            <Card>
              <CardHeader>
                <CardTitle>Training Content</CardTitle>
                <CardDescription>
                  Update the training content and requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="learning_objectives">Learning Objectives</Label>
                  <Textarea
                    id="learning_objectives"
                    value={data.learning_objectives}
                    onChange={(e) => setData('learning_objectives', e.target.value)}
                    placeholder="What will participants learn from this training?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prerequisites">Prerequisites</Label>
                  <Textarea
                    id="prerequisites"
                    value={data.prerequisites}
                    onChange={(e) => setData('prerequisites', e.target.value)}
                    placeholder="Any prerequisites or requirements for this training"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Training Materials</Label>
                  {materials.map((material, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={material}
                        onChange={(e) => updateMaterial(index, e.target.value)}
                        placeholder="Enter material description"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeMaterial(index)}
                        disabled={materials.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMaterial}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Material
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attachments">New Attachments</Label>
                  <Input
                    id="attachments"
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                  />
                  {attachments.length > 0 && (
                    <div className="space-y-2">
                      {attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm">{file.name}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Show existing attachments */}
                  {training.attachments && training.attachments.length > 0 && (
                    <div className="space-y-2">
                      <Label>Existing Attachments</Label>
                      {training.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded bg-gray-50">
                          <span className="text-sm">{attachment.name || `Attachment ${index + 1}`}</span>
                          <span className="text-xs text-gray-500">Existing file</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Configure training settings and certification options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_mandatory"
                    checked={data.is_mandatory}
                    onCheckedChange={(checked) => setData('is_mandatory', checked as boolean)}
                  />
                  <Label htmlFor="is_mandatory">Mandatory Training</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requires_certification"
                    checked={data.requires_certification}
                    onCheckedChange={(checked) => setData('requires_certification', checked as boolean)}
                  />
                  <Label htmlFor="requires_certification">Requires Certification</Label>
                </div>

                {data.requires_certification && (
                  <div className="space-y-2">
                    <Label htmlFor="certification_validity_months">Certification Validity (Months)</Label>
                    <Input
                      id="certification_validity_months"
                      type="number"
                      value={data.certification_validity_months}
                      onChange={(e) => setData('certification_validity_months', e.target.value)}
                      placeholder="Enter validity period in months"
                      min="1"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" asChild>
                <a href={route('hr.training.show', training.id)}>Cancel</a>
              </Button>
              <Button type="submit" disabled={processing}>
                <Save className="h-4 w-4 mr-2" />
                {processing ? 'Updating...' : 'Update Training Program'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
