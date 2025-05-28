import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  AlertCircle,
  User,
  Building,
  Mail
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface Category {
  id: number;
  name: string;
  description: string;
  color: string;
  default_priority: string;
}

interface User {
  id: number;
  name: string;
}

interface Client {
  id: number;
  name: string;
  email: string;
}

interface Lead {
  id: number;
  name: string;
  email: string;
}

interface Props {
  categories: Category[];
  users: User[];
  clients: Client[];
  leads: Lead[];
  requesterType?: string;
  requesterId?: number;
}

export default function Create({ categories, users, clients, leads, requesterType, requesterId }: Props) {
  const { t } = useTranslate();
  const route = useRoute();
  const [attachments, setAttachments] = useState<File[]>([]);

  const { data, setData, post, processing, errors, reset } = useForm({
    title: '',
    description: '',
    priority: 'medium',
    category_id: '',
    assigned_to: '',
    requester_type: requesterType || '',
    requester_id: requesterId || '',
    tags: [] as string[],
    attachments: [] as File[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'attachments') {
        attachments.forEach((file, index) => {
          formData.append(`attachments[${index}]`, file);
        });
      } else if (key === 'tags') {
        data.tags.forEach((tag, index) => {
          formData.append(`tags[${index}]`, tag);
        });
      } else {
        formData.append(key, data[key as keyof typeof data] as string);
      }
    });

    router.post(route('support.tickets.store'), formData, {
      forceFormData: true,
      onSuccess: () => reset(),
    });
  };

  const handleCategoryChange = (categoryId: string) => {
    setData('category_id', categoryId);
    
    // Auto-set priority based on category default
    const category = categories.find(c => c.id.toString() === categoryId);
    if (category) {
      setData('priority', category.default_priority);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout>
      <Head title={t('support.create_ticket', 'Create Support Ticket')} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href={route('support.tickets.index')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back', 'Back')}
              </a>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('support.create_ticket', 'Create Support Ticket')}
              </h1>
              <p className="text-muted-foreground">
                {t('support.create_ticket_description', 'Create a new support ticket for assistance')}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t('support.ticket_details', 'Ticket Details')}</CardTitle>
                  <CardDescription>
                    {t('support.ticket_details_description', 'Provide details about your support request')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">{t('support.title', 'Title')} *</Label>
                    <Input
                      id="title"
                      value={data.title}
                      onChange={(e) => setData('title', e.target.value)}
                      placeholder={t('support.title_placeholder', 'Brief description of the issue')}
                      className={errors.title ? 'border-red-500' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">{t('support.description', 'Description')} *</Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                      placeholder={t('support.description_placeholder', 'Detailed description of the issue, steps to reproduce, etc.')}
                      rows={6}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="category">{t('support.category', 'Category')}</Label>
                      <Select value={data.category_id} onValueChange={handleCategoryChange}>
                        <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                          <SelectValue  placeholder={t('support.select_category', 'Select category')} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category_id && (
                        <p className="text-sm text-red-500 mt-1">{errors.category_id}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="priority">{t('support.priority', 'Priority')} *</Label>
                      <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                        <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">
                            <Badge className={getPriorityColor('low')} variant="secondary">
                              {t('support.priority_low', 'Low')}
                            </Badge>
                          </SelectItem>
                          <SelectItem value="medium">
                            <Badge className={getPriorityColor('medium')} variant="secondary">
                              {t('support.priority_medium', 'Medium')}
                            </Badge>
                          </SelectItem>
                          <SelectItem value="high">
                            <Badge className={getPriorityColor('high')} variant="secondary">
                              {t('support.priority_high', 'High')}
                            </Badge>
                          </SelectItem>
                          <SelectItem value="urgent">
                            <Badge className={getPriorityColor('urgent')} variant="secondary">
                              {t('support.priority_urgent', 'Urgent')}
                            </Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.priority && (
                        <p className="text-sm text-red-500 mt-1">{errors.priority}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="assigned_to">{t('support.assign_to', 'Assign To')}</Label>
                    <Select value={data.assigned_to} onValueChange={(value) => setData('assigned_to', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('support.select_assignee', 'Select assignee (optional)')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="empty">{t('support.unassigned', 'Unassigned')}</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {user.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Attachments */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('support.attachments', 'Attachments')}</CardTitle>
                  <CardDescription>
                    {t('support.attachments_description', 'Upload files to help explain the issue')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="attachments">{t('support.upload_files', 'Upload Files')}</Label>
                      <Input
                        id="attachments"
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {t('support.file_types', 'Supported: Images, PDFs, Documents, Archives (Max 10MB each)')}
                      </p>
                    </div>

                    {attachments.length > 0 && (
                      <div className="space-y-2">
                        <Label>{t('support.selected_files', 'Selected Files')}</Label>
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <Upload className="h-4 w-4" />
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Requester Information */}
              {(data.requester_type && data.requester_id) && (
                <Card>
                  <CardHeader>
                    <CardTitle>{t('support.requester', 'Requester')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.requester_type === 'App\\Models\\Client' && (
                      <div className="space-y-2">
                        {(() => {
                          const client = clients.find(c => c.id.toString() === data.requester_id.toString());
                          return client ? (
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              <div>
                                <p className="font-medium">{client.name}</p>
                                <p className="text-sm text-muted-foreground">{client.email}</p>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                    {data.requester_type === 'App\\Models\\Lead' && (
                      <div className="space-y-2">
                        {(() => {
                          const lead = leads.find(l => l.id.toString() === data.requester_id.toString());
                          return lead ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <div>
                                <p className="font-medium">{lead.name}</p>
                                <p className="text-sm text-muted-foreground">{lead.email}</p>
                              </div>
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Button type="submit" className="w-full" disabled={processing}>
                      <Save className="h-4 w-4 mr-2" />
                      {processing ? t('common.creating', 'Creating...') : t('support.create_ticket', 'Create Ticket')}
                    </Button>
                    
                    <Button type="button" variant="outline" className="w-full" asChild>
                      <a href={route('support.tickets.index')}>
                        {t('common.cancel', 'Cancel')}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Help */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t('support.create_help', 'Provide as much detail as possible to help us resolve your issue quickly.')}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
