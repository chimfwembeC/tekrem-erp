import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { 
  Phone, 
  Mail, 
  Calendar, 
  FileText, 
  Edit,
  Trash2,
  ArrowLeft,
  User,
  Building,
  Clock,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Communication, InertiaSharedProps } from '@/types/index';
import useRoute from '@/Hooks/useRoute';

interface CommunicationShowProps extends InertiaSharedProps {
  communication: Communication;
}

export default function CommunicationShow({ communication }: CommunicationShowProps) {
  const route = useRoute();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-5 w-5" />;
      case 'call':
        return <Phone className="h-5 w-5" />;
      case 'meeting':
        return <Calendar className="h-5 w-5" />;
      case 'note':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
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
      <ArrowDown className="h-4 w-4 text-green-600" /> : 
      <ArrowUp className="h-4 w-4 text-blue-600" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this communication?')) {
      router.delete(route('crm.communications.destroy', communication.id), {
        onSuccess: () => {
          router.visit(route('crm.communications.index'));
        }
      });
    }
  };

  const getCommunicableRoute = () => {
    if (communication.communicable_type.includes('Client')) {
      return route('crm.clients.show', communication.communicable_id);
    } else {
      return route('crm.leads.show', communication.communicable_id);
    }
  };

  return (
    <AppLayout
      title={`Communication - ${communication.type.charAt(0).toUpperCase() + communication.type.slice(1)}`}
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
              Communication Details
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Link href={route('crm.communications.edit', communication.id)}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button 
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      )}
    >
      <Head title={`Communication - ${communication.type}`} />

      <div className="py-12">
        <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
          <div className="grid gap-6">
            {/* Main Communication Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(communication.type)}
                    <div>
                      <CardTitle className="capitalize">
                        {communication.type}
                        {communication.direction && (
                          <span className="ml-2 inline-flex items-center gap-1">
                            {getDirectionIcon(communication.direction)}
                            <span className="text-sm font-normal text-gray-500">
                              {communication.direction}
                            </span>
                          </span>
                        )}
                      </CardTitle>
                      {communication.subject && (
                        <CardDescription className="mt-1">
                          {communication.subject}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(communication.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Communication Date */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(communication.communication_date)}</span>
                  </div>

                  <Separator />

                  {/* Content */}
                  <div>
                    <h4 className="font-medium mb-2">Content</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                        {communication.content}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Information */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Associated Entity */}
              {communication.communicable && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Associated {communication.communicable_type.includes('Client') ? 'Client' : 'Lead'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium">{communication.communicable.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {communication.communicable.email}
                        </p>
                        {communication.communicable.phone && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {communication.communicable.phone}
                          </p>
                        )}
                        {communication.communicable.company && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {communication.communicable.company}
                          </p>
                        )}
                      </div>
                      <Link href={getCommunicableRoute()}>
                        <Button variant="outline" size="sm" className="w-full">
                          View {communication.communicable_type.includes('Client') ? 'Client' : 'Lead'} Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Created By */}
              {communication.user && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Created By
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium">{communication.user.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {communication.user.email}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <p>Created: {formatDate(communication.created_at)}</p>
                        {communication.updated_at !== communication.created_at && (
                          <p>Updated: {formatDate(communication.updated_at)}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Link href={route('crm.communications.edit', communication.id)}>
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Communication
                    </Button>
                  </Link>
                  
                  {communication.communicable && (
                    <Link 
                      href={route('crm.communications.create', {
                        communicable_type: communication.communicable_type,
                        communicable_id: communication.communicable_id
                      })}
                    >
                      <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Add New Communication
                      </Button>
                    </Link>
                  )}

                  <Button 
                    variant="destructive"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Communication
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
