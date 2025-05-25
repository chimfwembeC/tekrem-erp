import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { InertiaSharedProps } from '@/types';
import { Badge } from '@/Components/ui/badge';

interface Lead {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  position: string | null;
  status: string;
  source: string | null;
  user: {
    id: number;
    name: string;
  };
  created_at: string;
  converted_to_client: boolean;
}

interface LeadsIndexProps extends InertiaSharedProps {
  leads: {
    data: Lead[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  filters: {
    search?: string;
    status?: string;
    source?: string;
  };
}

export default function LeadsIndex({ auth, leads, filters }: LeadsIndexProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || 'all');
  const [source, setSource] = useState(filters.source || 'all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('crm.leads.index'), {
      search,
      status: status === 'all' ? '' : status,
      source: source === 'all' ? '' : source
    }, { preserveState: true });
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    // If "all" is selected, don't include status in the query
    const statusParam = value === 'all' ? '' : value;
    router.get(route('crm.leads.index'), { search, status: statusParam, source: source === 'all' ? '' : source }, { preserveState: true });
  };

  const handleSourceChange = (value: string) => {
    setSource(value);
    // If "all" is selected, don't include source in the query
    const sourceParam = value === 'all' ? '' : value;
    router.get(route('crm.leads.index'), { search, status: status === 'all' ? '' : status, source: sourceParam }, { preserveState: true });
  };

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

  return (
    <AppLayout
      title="Leads"
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Leads
        </h2>
      )}
    >
      <Head title="Leads" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <CardTitle>Leads</CardTitle>
                <CardDescription>
                  Manage your potential clients
                </CardDescription>
              </div>
              <Link href={route('crm.leads.create')}>
                <Button>Add Lead</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
                <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                  <Input
                    type="text"
                    placeholder="Search leads..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button type="submit" variant="secondary">Search</Button>
                </form>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Status:</span>
                    <Select value={status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="unqualified">Unqualified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Source:</span>
                    <Select value={source} onValueChange={handleSourceChange}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="All Sources" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sources</SelectItem>
                        <SelectItem value="Website">Website</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                        <SelectItem value="Trade Show">Trade Show</SelectItem>
                        <SelectItem value="Social Media">Social Media</SelectItem>
                        <SelectItem value="Email Campaign">Email Campaign</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

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
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.data.length > 0 ? (
                      leads.data.map((lead) => (
                        <tr key={lead.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <Link href={route('crm.leads.show', lead.id)} className="text-blue-600 hover:underline">
                              {lead.name}
                            </Link>
                            {lead.converted_to_client && (
                              <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Converted
                              </Badge>
                            )}
                          </td>
                          <td className="p-2">{lead.email}</td>
                          <td className="p-2">{lead.phone}</td>
                          <td className="p-2">{lead.company}</td>
                          <td className="p-2">
                            <Badge variant="outline" className={getStatusBadgeColor(lead.status)}>
                              {lead.status}
                            </Badge>
                          </td>
                          <td className="p-2">{lead.source}</td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <Link href={route('crm.leads.edit', lead.id)}>
                                <Button variant="outline" size="sm">Edit</Button>
                              </Link>
                              {!lead.converted_to_client && lead.status === 'qualified' && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm('Are you sure you want to convert this lead to a client?')) {
                                      router.post(route('crm.leads.convert', lead.id));
                                    }
                                  }}
                                >
                                  Convert
                                </Button>
                              )}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this lead?')) {
                                    router.delete(route('crm.leads.destroy', lead.id));
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-4 text-center">No leads found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {leads.last_page > 1 && (
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {leads.from} to {leads.to} of {leads.total} leads
                  </div>
                  <div className="flex gap-1">
                    {leads.links.map((link, i) => {
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
