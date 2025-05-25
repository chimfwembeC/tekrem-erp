import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { Communication, Client, Lead, InertiaSharedProps } from '@/types/index';
import useRoute from '@/Hooks/useRoute';

interface CommunicationEditProps extends InertiaSharedProps {
  communication: Communication;
  clients: Client[];
  leads: Lead[];
}

export default function CommunicationEdit({ communication, clients, leads }: CommunicationEditProps) {
  const route = useRoute();
  
  const { data, setData, put, processing, errors } = useForm({
    type: communication.type,
    content: communication.content,
    subject: communication.subject || '',
    communication_date: communication.communication_date.split('T')[0], // Format for date input
    direction: communication.direction || '',
    status: communication.status || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('crm.communications.update', communication.id));
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format for datetime-local input
  };

  return (
    <AppLayout
      title="Edit Communication"
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={route('crm.communications.show', communication.id)}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Communication
              </Button>
            </Link>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              Edit Communication
            </h2>
          </div>
        </div>
      )}
    >
      <Head title="Edit Communication" />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Edit Communication</CardTitle>
              <CardDescription>
                Update the communication details below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Associated Entity Info */}
                {communication.communicable && (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h4 className="font-medium mb-2">
                      Associated {communication.communicable_type.includes('Client') ? 'Client' : 'Lead'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {communication.communicable.name} ({communication.communicable.email})
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Type */}
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select value={data.type} onValueChange={(value) => setData('type', value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select communication type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="note">Note</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.type}</p>
                    )}
                  </div>

                  {/* Direction */}
                  <div className="space-y-2">
                    <Label htmlFor="direction">Direction</Label>
                    <Select value={data.direction} onValueChange={(value) => setData('direction', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select direction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Not specified</SelectItem>
                        <SelectItem value="inbound">Inbound</SelectItem>
                        <SelectItem value="outbound">Outbound</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.direction && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.direction}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Communication Date */}
                  <div className="space-y-2">
                    <Label htmlFor="communication_date">Communication Date *</Label>
                    <Input
                      id="communication_date"
                      type="datetime-local"
                      value={formatDateTime(communication.communication_date)}
                      onChange={(e) => setData('communication_date', e.target.value)}
                      required
                    />
                    {errors.communication_date && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.communication_date}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Not specified</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-sm text-red-600 dark:text-red-400">{errors.status}</p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    type="text"
                    placeholder="Enter communication subject (optional)"
                    value={data.subject}
                    onChange={(e) => setData('subject', e.target.value)}
                  />
                  {errors.subject && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.subject}</p>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    placeholder="Enter communication content..."
                    value={data.content}
                    onChange={(e) => setData('content', e.target.value)}
                    rows={6}
                    required
                  />
                  {errors.content && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.content}</p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Link href={route('crm.communications.show', communication.id)}>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={processing}>
                    <Save className="h-4 w-4 mr-2" />
                    {processing ? 'Updating...' : 'Update Communication'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
