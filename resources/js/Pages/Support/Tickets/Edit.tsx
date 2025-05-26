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
  AlertCircle
} from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

interface TicketData {
  id: number;
  ticket_number: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category_id?: number;
  assigned_to?: number;
  tags?: string[];
}

interface Category {
  id: number;
  name: string;
  description: string;
  color: string;
}

interface User {
  id: number;
  name: string;
}

interface Props {
  ticket: TicketData;
  categories: Category[];
  users: User[];
}

export default function Edit({ ticket, categories, users }: Props) {
  const { t } = useTranslate();
  const route = useRoute();

  const { data, setData, put, processing, errors } = useForm({
    title: ticket.title,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority,
    category_id: ticket.category_id?.toString() || '',
    assigned_to: ticket.assigned_to?.toString() || '',
    tags: ticket.tags || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('support.tickets.update', ticket.id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
      <Head title={`${t('common.edit', 'Edit')} ${t('support.ticket', 'Ticket')} #${ticket.ticket_number}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <a href={route('support.tickets.show', ticket.id)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back', 'Back')}
              </a>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {t('common.edit', 'Edit')} {t('support.ticket', 'Ticket')} #{ticket.ticket_number}
              </h1>
              <p className="text-muted-foreground">
                {t('support.edit_ticket_description', 'Update ticket information and status')}
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
                    {t('support.edit_ticket_details_description', 'Update the ticket information')}
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
                      placeholder={t('support.description_placeholder', 'Detailed description of the issue')}
                      rows={6}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="status">{t('support.status', 'Status')} *</Label>
                      <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                        <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">
                            <Badge className={getStatusColor('open')} variant="secondary">
                              {t('support.status_open', 'Open')}
                            </Badge>
                          </SelectItem>
                          <SelectItem value="in_progress">
                            <Badge className={getStatusColor('in_progress')} variant="secondary">
                              {t('support.status_in_progress', 'In Progress')}
                            </Badge>
                          </SelectItem>
                          <SelectItem value="pending">
                            <Badge className={getStatusColor('pending')} variant="secondary">
                              {t('support.status_pending', 'Pending')}
                            </Badge>
                          </SelectItem>
                          <SelectItem value="resolved">
                            <Badge className={getStatusColor('resolved')} variant="secondary">
                              {t('support.status_resolved', 'Resolved')}
                            </Badge>
                          </SelectItem>
                          <SelectItem value="closed">
                            <Badge className={getStatusColor('closed')} variant="secondary">
                              {t('support.status_closed', 'Closed')}
                            </Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.status && (
                        <p className="text-sm text-red-500 mt-1">{errors.status}</p>
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

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="category">{t('support.category', 'Category')}</Label>
                      <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                        <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                          <SelectValue placeholder={t('support.select_category', 'Select category')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">{t('support.no_category', 'No Category')}</SelectItem>
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
                      <Label htmlFor="assigned_to">{t('support.assign_to', 'Assign To')}</Label>
                      <Select value={data.assigned_to} onValueChange={(value) => setData('assigned_to', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('support.select_assignee', 'Select assignee')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">{t('support.unassigned', 'Unassigned')}</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <Button type="submit" className="w-full" disabled={processing}>
                      <Save className="h-4 w-4 mr-2" />
                      {processing ? t('common.saving', 'Saving...') : t('common.save_changes', 'Save Changes')}
                    </Button>
                    
                    <Button type="button" variant="outline" className="w-full" asChild>
                      <a href={route('support.tickets.show', ticket.id)}>
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
                  {t('support.edit_help', 'Changes to status and priority will be logged in the ticket history.')}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
