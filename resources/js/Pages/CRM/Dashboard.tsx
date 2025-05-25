import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { InertiaSharedProps } from '@/types';

interface Client {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  created_at: string;
}

interface Lead {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  status: string;
  source: string | null;
  created_at: string;
}

interface Communication {
  id: number;
  type: string;
  subject: string | null;
  content: string;
  communication_date: string;
  communicable_type: string;
  communicable_id: number;
  communicable: any;
  user: {
    id: number;
    name: string;
  };
  created_at: string;
}

interface StatusCount {
  status: string;
  count: number;
}

interface DashboardProps extends InertiaSharedProps {
  stats: {
    totalClients: number;
    totalLeads: number;
    leadsByStatus: StatusCount[];
    clientsByStatus: StatusCount[];
  };
  recentClients: Client[];
  recentLeads: Lead[];
  recentCommunications: Communication[];
}

export default function Dashboard({ auth, stats, recentClients, recentLeads, recentCommunications }: DashboardProps) {
  return (
    <AppLayout
      title="CRM Dashboard"
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          CRM Dashboard
        </h2>
      )}
    >
      <Head title="CRM Dashboard" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalClients}</div>
                <p className="text-xs text-muted-foreground">
                  Active clients in the system
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLeads}</div>
                <p className="text-xs text-muted-foreground">
                  Potential clients in the pipeline
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.clientsByStatus.find(s => s.status === 'active')?.count || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active clients
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.leadsByStatus.find(s => s.status === 'qualified')?.count || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Leads ready for conversion
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <Tabs defaultValue="clients" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="clients">Recent Clients</TabsTrigger>
                <TabsTrigger value="leads">Recent Leads</TabsTrigger>
                <TabsTrigger value="communications">Recent Communications</TabsTrigger>
              </TabsList>
              <TabsContent value="clients">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Clients</CardTitle>
                    <CardDescription>
                      The most recently added clients in the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Name</th>
                            <th className="text-left p-2">Email</th>
                            <th className="text-left p-2">Phone</th>
                            <th className="text-left p-2">Company</th>
                            <th className="text-left p-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentClients.map((client) => (
                            <tr key={client.id} className="border-b hover:bg-muted/50">
                              <td className="p-2">
                                <a href={route('crm.clients.show', client.id)} className="text-blue-600 hover:underline">
                                  {client.name}
                                </a>
                              </td>
                              <td className="p-2">{client.email}</td>
                              <td className="p-2">{client.phone}</td>
                              <td className="p-2">{client.company}</td>
                              <td className="p-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  client.status === 'active' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                }`}>
                                  {client.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="leads">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Leads</CardTitle>
                    <CardDescription>
                      The most recently added leads in the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Name</th>
                            <th className="text-left p-2">Email</th>
                            <th className="text-left p-2">Phone</th>
                            <th className="text-left p-2">Company</th>
                            <th className="text-left p-2">Status</th>
                            <th className="text-left p-2">Source</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentLeads.map((lead) => (
                            <tr key={lead.id} className="border-b hover:bg-muted/50">
                              <td className="p-2">
                                <a href={route('crm.leads.show', lead.id)} className="text-blue-600 hover:underline">
                                  {lead.name}
                                </a>
                              </td>
                              <td className="p-2">{lead.email}</td>
                              <td className="p-2">{lead.phone}</td>
                              <td className="p-2">{lead.company}</td>
                              <td className="p-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  lead.status === 'qualified' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                    : lead.status === 'contacted'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                }`}>
                                  {lead.status}
                                </span>
                              </td>
                              <td className="p-2">{lead.source}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="communications">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Communications</CardTitle>
                    <CardDescription>
                      The most recent communications with clients and leads
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentCommunications.map((comm) => (
                        <div key={comm.id} className="border rounded-lg p-4 hover:bg-muted/50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">
                                {comm.subject || `${comm.type.charAt(0).toUpperCase() + comm.type.slice(1)} with ${comm.communicable?.name || 'Unknown'}`}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {new Date(comm.communication_date).toLocaleDateString()} by {comm.user.name}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              comm.type === 'email' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                : comm.type === 'call'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : comm.type === 'meeting'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              {comm.type}
                            </span>
                          </div>
                          <p className="mt-2 text-sm line-clamp-2">{comm.content}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
