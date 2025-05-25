import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { InertiaSharedProps } from '@/types';
import { Badge } from '@/Components/ui/badge';

interface Client {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  position: string | null;
  status: string;
  user: {
    id: number;
    name: string;
  };
  created_at: string;
}

interface ClientsIndexProps extends InertiaSharedProps {
  clients: {
    data: Client[];
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
  };
}

export default function ClientsIndex({ auth, clients, filters }: ClientsIndexProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [status, setStatus] = useState(filters.status || 'all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('crm.clients.index'), { search, status }, { preserveState: true });
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    // If "all" is selected, don't include status in the query
    const statusParam = value === 'all' ? '' : value;
    router.get(route('crm.clients.index'), { search, status: statusParam }, { preserveState: true });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <AppLayout
      title="Clients"
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Clients
        </h2>
      )}
    >
      <Head title="Clients" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <CardTitle>Clients</CardTitle>
                <CardDescription>
                  Manage your client relationships
                </CardDescription>
              </div>
              <Link href={route('crm.clients.create')}>
                <Button>Add Client</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
                <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                  <Input
                    type="text"
                    placeholder="Search clients..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button type="submit" variant="secondary">Search</Button>
                </form>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Status:</span>
                  <Select value={status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.data.length > 0 ? (
                      clients.data.map((client) => (
                        <tr key={client.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <Link href={route('crm.clients.show', client.id)} className="text-blue-600 hover:underline">
                              {client.name}
                            </Link>
                          </td>
                          <td className="p-2">{client.email}</td>
                          <td className="p-2">{client.phone}</td>
                          <td className="p-2">{client.company}</td>
                          <td className="p-2">
                            <Badge variant="outline" className={getStatusBadgeColor(client.status)}>
                              {client.status}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <Link href={route('crm.clients.edit', client.id)}>
                                <Button variant="outline" size="sm">Edit</Button>
                              </Link>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this client?')) {
                                    router.delete(route('crm.clients.destroy', client.id));
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
                        <td colSpan={6} className="p-4 text-center">No clients found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {clients.last_page > 1 && (
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {clients.from} to {clients.to} of {clients.total} clients
                  </div>
                  <div className="flex gap-1">
                    {clients.links.map((link, i) => {
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
