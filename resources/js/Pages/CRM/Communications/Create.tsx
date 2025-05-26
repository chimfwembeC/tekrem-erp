import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import EmailTemplateGenerator from '@/Components/CRM/EmailTemplateGenerator';
import SentimentAnalysis from '@/Components/CRM/SentimentAnalysis';
import useCRMAI from '@/Hooks/useCRMAI';
import { ArrowLeft, Save, Bot, Heart } from 'lucide-react';
import { Client, Lead, InertiaSharedProps } from '@/types/index';
import useRoute from '@/Hooks/useRoute';

interface CommunicationCreateProps extends InertiaSharedProps {
  clients: Client[];
  leads: Lead[];
  communicableType?: string;
  communicableId?: number;
}

export default function CommunicationCreate({ auth, clients, leads, communicableType, communicableId }: CommunicationCreateProps) {
  const route = useRoute();
  const { analyzeSentiment, generateCommunicationEmailTemplate, loading: aiLoading } = useCRMAI();

  const [showEmailGenerator, setShowEmailGenerator] = useState(false);
  const [showSentimentAnalysis, setShowSentimentAnalysis] = useState(false);
  const [sentimentAnalysis, setSentimentAnalysis] = useState(null);

  const { data, setData, post, processing, errors } = useForm({
    type: 'note',
    content: '',
    subject: '',
    communication_date: new Date().toISOString().slice(0, 16), // Format for datetime-local
    direction: 'outbound',
    status: 'completed',
    communicable_type: communicableType || '',
    communicable_id: communicableId || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('crm.communications.store'));
  };

  const handleAnalyzeSentiment = async () => {
    if (!data.content.trim()) {
      return;
    }

    const analysis = await analyzeSentiment(data.content, data.type);
    if (analysis) {
      setSentimentAnalysis(analysis);
      setShowSentimentAnalysis(true);
    }
  };

  const handleEmailTemplateGenerated = (template: any) => {
    setData('subject', template.subject);
    setData('content', template.body);
  };

  const getSelectedContact = () => {
    if (data.communicable_type === 'App\\Models\\Client' && data.communicable_id) {
      return clients.find(c => c.id.toString() === data.communicable_id.toString());
    } else if (data.communicable_type === 'App\\Models\\Lead' && data.communicable_id) {
      return leads.find(l => l.id.toString() === data.communicable_id.toString());
    }
    return null;
  };

  return (
    <AppLayout
      title="Add Communication"
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href={route('crm.communications.index')}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Communications
              </Button>
            </Link>
            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
              Add Communication
            </h2>
          </div>
        </div>
      )}
    >
      <Head title="Add Communication" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Add New Communication</CardTitle>
                    <CardDescription>
                      Record a new communication with a client or lead
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {data.type === 'email' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowEmailGenerator(true)}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <Bot className="h-4 w-4 mr-1" />
                        Generate Email
                      </Button>
                    )}
                    {data.content.trim() && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAnalyzeSentiment}
                        disabled={aiLoading}
                        className="text-purple-600 border-purple-200 hover:bg-purple-50"
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        Analyze Sentiment
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* AI Components */}
                {showEmailGenerator && (
                  <EmailTemplateGenerator
                    onTemplateGenerated={handleEmailTemplateGenerated}
                    onClose={() => setShowEmailGenerator(false)}
                    leadData={getSelectedContact()}
                    context={{ communication_type: data.type }}
                  />
                )}

                {showSentimentAnalysis && sentimentAnalysis && (
                  <SentimentAnalysis
                    analysis={sentimentAnalysis}
                    onDismiss={() => setShowSentimentAnalysis(false)}
                    loading={aiLoading}
                  />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="type">Communication Type <span className="text-red-500">*</span></Label>
                    <Select
                      value={data.type}
                      onValueChange={(value) => setData('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="call">Phone Call</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="note">Note</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="communication_date">Date & Time <span className="text-red-500">*</span></Label>
                    <Input
                      id="communication_date"
                      type="datetime-local"
                      value={data.communication_date}
                      onChange={(e) => setData('communication_date', e.target.value)}
                    />
                    {errors.communication_date && <p className="text-red-500 text-sm">{errors.communication_date}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={data.subject}
                      onChange={(e) => setData('subject', e.target.value)}
                    />
                    {errors.subject && <p className="text-red-500 text-sm">{errors.subject}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={data.status}
                      onValueChange={(value) => setData('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Direction</Label>
                  <RadioGroup
                    value={data.direction}
                    onValueChange={(value) => setData('direction', value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="inbound" id="inbound" />
                      <Label htmlFor="inbound">Inbound</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="outbound" id="outbound" />
                      <Label htmlFor="outbound">Outbound</Label>
                    </div>
                  </RadioGroup>
                  {errors.direction && <p className="text-red-500 text-sm">{errors.direction}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Related To <span className="text-red-500">*</span></Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="communicable_type">Type</Label>
                      <Select
                        value={data.communicable_type}
                        onValueChange={(value) => setData('communicable_type', value)}
                        disabled={!!communicableType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="App\Models\Client">Client</SelectItem>
                          <SelectItem value="App\Models\Lead">Lead</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.communicable_type && <p className="text-red-500 text-sm">{errors.communicable_type}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="communicable_id">Name</Label>
                      <Select
                        value={data.communicable_id.toString()}
                        onValueChange={(value) => setData('communicable_id', value)}
                        disabled={!!communicableId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select name" />
                        </SelectTrigger>
                        <SelectContent>
                          {data.communicable_type === 'App\\Models\\Client' ? (
                            clients.map((client) => (
                              <SelectItem key={client.id} value={client.id.toString()}>
                                {client.name}
                              </SelectItem>
                            ))
                          ) : data.communicable_type === 'App\\Models\\Lead' ? (
                            leads.map((lead) => (
                              <SelectItem key={lead.id} value={lead.id.toString()}>
                                {lead.name}
                              </SelectItem>
                            ))
                          ) : null}
                        </SelectContent>
                      </Select>
                      {errors.communicable_id && <p className="text-red-500 text-sm">{errors.communicable_id}</p>}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="content"
                    value={data.content}
                    onChange={(e) => setData('content', e.target.value)}
                    rows={6}
                  />
                  {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-3">
                <Link href={route('crm.communications.index')}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={processing}>
                  <Save className="h-4 w-4 mr-2" />
                  {processing ? 'Saving...' : 'Save Communication'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
