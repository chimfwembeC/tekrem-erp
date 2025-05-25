import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Badge } from '@/Components/ui/badge';
import { InertiaSharedProps } from '@/types';
import ChatComponent from '@/Components/CRM/ChatComponent';

interface Communication {
  id: number;
  type: string;
  subject: string | null;
  content: string;
  communication_date: string;
  direction: string | null;
  status: string | null;
  user: {
    id: number;
    name: string;
  };
  created_at: string;
}

interface Lead {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  position: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  notes: string | null;
  source: string | null;
  status: string;
  user: {
    id: number;
    name: string;
  };
  created_at: string;
  updated_at: string;
  converted_to_client: boolean;
  converted_at: string | null;
}

interface LeadShowProps extends InertiaSharedProps {
  lead: Lead;
  communications: {
    data: Communication[];
    links: any[];
    current_page: number;
    last_page: number;
  };
}

export default function LeadShow({ auth, lead, communications }: LeadShowProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'qualified':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'unqualified':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getCommunicationTypeColor = (type: string) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'call':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'meeting':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'note':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <AppLayout
      title={`Lead: ${lead.name}`}
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Lead: {lead.name}
        </h2>
      )}
    >
      <Head title={`Lead: ${lead.name}`} />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Link href={route('crm.leads.index')}>
                <Button variant="outline">Back to Leads</Button>
              </Link>
              <Badge variant="outline" className={getStatusBadgeColor(lead.status)}>
                {lead.status}
              </Badge>
              {lead.converted_to_client && (
                <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Converted to Client
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {!lead.converted_to_client && lead.status === 'qualified' && (
                <Button
                  onClick={() => {
                    if (confirm('Are you sure you want to convert this lead to a client?')) {
                      router.post(route('crm.leads.convert', lead.id));
                    }
                  }}
                >
                  Convert to Client
                </Button>
              )}
              <Link href={route('crm.leads.edit', lead.id)}>
                <Button variant="outline">Edit Lead</Button>
              </Link>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this lead?')) {
                    router.delete(route('crm.leads.destroy', lead.id));
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </div>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Lead Details</TabsTrigger>
              <TabsTrigger value="communications">Communications</TabsTrigger>
              <TabsTrigger value="chats">Chat History</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Information</CardTitle>
                  <CardDescription>
                    Detailed information about {lead.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium">Contact Information</h3>
                      <div className="mt-4 space-y-2">
                        <div>
                          <span className="font-medium">Name:</span> {lead.name}
                        </div>
                        <div>
                          <span className="font-medium">Email:</span> {lead.email || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {lead.phone || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Company:</span> {lead.company || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Position:</span> {lead.position || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Source:</span> {lead.source || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Address</h3>
                      <div className="mt-4 space-y-2">
                        <div>
                          <span className="font-medium">Street:</span> {lead.address || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">City:</span> {lead.city || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">State/Province:</span> {lead.state || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Postal Code:</span> {lead.postal_code || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Country:</span> {lead.country || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                  {lead.notes && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium">Notes</h3>
                      <div className="mt-2 p-4 bg-muted rounded-md">
                        {lead.notes}
                      </div>
                    </div>
                  )}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium">System Information</h3>
                    <div className="mt-4 space-y-2">
                      <div>
                        <span className="font-medium">Created:</span> {new Date(lead.created_at).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Last Updated:</span> {new Date(lead.updated_at).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Assigned To:</span> {lead.user.name}
                      </div>
                      {lead.converted_to_client && lead.converted_at && (
                        <div>
                          <span className="font-medium">Converted to Client:</span> {new Date(lead.converted_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="communications">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
                  <div>
                    <CardTitle>Communications</CardTitle>
                    <CardDescription>
                      History of communications with {lead.name}
                    </CardDescription>
                  </div>
                  <Link href={route('crm.communications.create', {
                    communicable_type: 'App\\Models\\Lead',
                    communicable_id: lead.id
                  })}>
                    <Button>Add Communication</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {communications.data.length > 0 ? (
                    <div className="space-y-4">
                      {communications.data.map((comm) => (
                        <div key={comm.id} className="border rounded-lg p-4 hover:bg-muted/50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">
                                {comm.subject || `${comm.type.charAt(0).toUpperCase() + comm.type.slice(1)} on ${new Date(comm.communication_date).toLocaleDateString()}`}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(comm.communication_date).toLocaleString()} by {comm.user.name}
                              </p>
                            </div>
                            <Badge variant="outline" className={getCommunicationTypeColor(comm.type)}>
                              {comm.type}
                            </Badge>
                          </div>
                          <p className="mt-2">{comm.content}</p>
                          <div className="mt-2 flex justify-end gap-2">
                            <Link href={route('crm.communications.edit', comm.id)}>
                              <Button variant="outline" size="sm">Edit</Button>
                            </Link>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this communication?')) {
                                  router.delete(route('crm.communications.destroy', comm.id));
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No communications found.</p>
                    </div>
                  )}
                </CardContent>
                {communications.last_page > 1 && (
                  <CardFooter>
                    <div className="flex gap-1 mx-auto">
                      {communications.links.map((link, i) => {
                        if (link.url === null) {
                          return (
                            <Button
                              key={i}
                              variant="outline"
                              size="sm"
                              disabled
                              dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                          );
                        }

                        return (
                          <Link key={i} href={link.url}>
                            <Button
                              variant={link.active ? "default" : "outline"}
                              size="sm"
                              dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                          </Link>
                        );
                      })}
                    </div>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>
            <TabsContent value="chats">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
                  <div>
                    <CardTitle>Chat History</CardTitle>
                    <CardDescription>
                      Chat messages with {lead.name}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => router.post(route('crm.livechat.find-or-create'), {
                      chattable_type: 'App\\Models\\Lead',
                      chattable_id: lead.id
                    })}
                    className="flex items-center gap-2"
                  >
                    Send Message
                  </Button>
                </CardHeader>
                <CardContent>
                  {auth.user && (
                    <ChatComponent
                      chattableType="App\\Models\\Lead"
                      chattableId={lead.id}
                      recipientId={lead.user.id !== auth.user.id ? lead.user.id : 1} // Default to admin (ID 1) if the lead is assigned to the current user
                      initialMessages={[]}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
