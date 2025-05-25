import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  Search, 
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Communication, InertiaSharedProps } from '@/types/index';
import useRoute from '@/Hooks/useRoute';

interface CommunicationsIndexProps extends InertiaSharedProps {
  communications: {
    data: Communication[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
  filters: {
    search?: string;
    type?: string;
    status?: string;
  };
}

export default function CommunicationsIndex({ communications, filters }: CommunicationsIndexProps) {
  const route = useRoute();
  const [search, setSearch] = useState(filters.search || '');
  const [type, setType] = useState(filters.type || 'all');
  const [status, setStatus] = useState(filters.status || 'all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(route('crm.communications.index'), {
      search,
      type: type === 'all' ? '' : type,
      status: status === 'all' ? '' : status
    }, { preserveState: true });
  };

  const handleClearFilters = () => {
    setSearch('');
    setType('all');
    setStatus('all');
    router.get(route('crm.communications.index'));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      case 'note':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      scheduled: "secondary", 
      cancelled: "destructive"
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getDirectionIcon = (direction: string | null) => {
    if (!direction) return null;
    
    return direction === 'inbound' ? 
      <ArrowDown className="h-3 w-3 text-green-600" /> : 
      <ArrowUp className="h-3 w-3 text-blue-600" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this communication?')) {
      router.delete(route('crm.communications.destroy', id));
    }
  };

  return (
    <AppLayout
      title="Communications"
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            Communications
          </h2>
          <Link href={route('crm.communications.create')}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Communication
            </Button>
          </Link>
        </div>
      )}
    >
      <Head title="Communications" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      type="text"
                      placeholder="Search communications..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="min-w-[150px]">
                  <Label htmlFor="type">Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-[150px]">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end gap-2">
                  <Button type="submit">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button type="button" variant="outline" onClick={handleClearFilters}>
                    Clear
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Communications List */}
          <Card>
            <CardHeader>
              <CardTitle>Communications ({communications.total})</CardTitle>
              <CardDescription>
                Manage all communications with clients and leads
              </CardDescription>
            </CardHeader>
            <CardContent>
              {communications.data.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No communications found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Get started by creating your first communication.
                  </p>
                  <Link href={route('crm.communications.create')}>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Communication
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {communications.data.map((communication) => (
                    <div
                      key={communication.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(communication.type)}
                              <span className="font-medium capitalize">
                                {communication.type}
                              </span>
                            </div>
                            {getDirectionIcon(communication.direction)}
                            {getStatusBadge(communication.status)}
                          </div>

                          {communication.subject && (
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                              {communication.subject}
                            </h4>
                          )}

                          <p className="text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {communication.content}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>
                              {formatDate(communication.communication_date)}
                            </span>
                            {communication.communicable && (
                              <span>
                                {communication.communicable_type.includes('Client') ? 'Client' : 'Lead'}: {communication.communicable.name}
                              </span>
                            )}
                            {communication.user && (
                              <span>
                                By: {communication.user.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Link href={route('crm.communications.show', communication.id)}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={route('crm.communications.edit', communication.id)}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(communication.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {communications.last_page > 1 && (
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {communications.from} to {communications.to} of {communications.total} communications
                  </div>
                  <div className="flex gap-1">
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
