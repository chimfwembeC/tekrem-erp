import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { Search, Clock, CheckCircle, AlertCircle, User } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { toast } from 'sonner';

interface InquiryStatus {
  reference_number: string;
  type: string;
  subject: string;
  status: string;
  urgency: string;
  created_at: string;
  responded_at: string | null;
  assigned_to: string | null;
}

export default function StatusCheck() {
  const [inquiry, setInquiry] = useState<InquiryStatus | null>(null);
  const [error, setError] = useState<string>('');

  const { data, setData, post, processing, errors } = useForm({
    reference_number: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInquiry(null);
    
    post('/guest/inquiry/status', {
      onSuccess: (response: any) => {
        if (response.props?.inquiry) {
          setInquiry(response.props.inquiry);
          toast.success('Inquiry status retrieved successfully!');
        }
      },
      onError: (errors: any) => {
        if (errors.reference_number) {
          setError(errors.reference_number[0]);
        } else {
          setError('Failed to retrieve inquiry status. Please try again.');
        }
        toast.error('Failed to retrieve inquiry status.');
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <AlertCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <GuestLayout title="Check Inquiry Status">
      <Head title="Check Inquiry Status" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Check Inquiry Status</h1>
              <p className="text-xl text-gray-600">
                Enter your reference number to check the status of your inquiry.
              </p>
            </div>

            <Card className="shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Inquiry Status Lookup
                </CardTitle>
                <CardDescription>
                  Enter the reference number you received when you submitted your inquiry.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reference_number">Reference Number</Label>
                    <Input
                      id="reference_number"
                      type="text"
                      value={data.reference_number}
                      onChange={(e) => setData('reference_number', e.target.value.toUpperCase())}
                      placeholder="Enter your reference number (e.g., INQ-ABC12345)"
                      required
                    />
                    {errors.reference_number && (
                      <p className="text-sm text-red-600">{errors.reference_number}</p>
                    )}
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" disabled={processing} className="w-full">
                    {processing ? (
                      <>Searching...</>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Check Status
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {inquiry && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Inquiry Details</span>
                    <Badge className={getStatusColor(inquiry.status)}>
                      {getStatusIcon(inquiry.status)}
                      <span className="ml-1 capitalize">{inquiry.status.replace('_', ' ')}</span>
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Reference: {inquiry.reference_number}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Inquiry Type</h4>
                      <p className="text-gray-600 capitalize">{inquiry.type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Urgency Level</h4>
                      <Badge className={getUrgencyColor(inquiry.urgency)}>
                        {inquiry.urgency.charAt(0).toUpperCase() + inquiry.urgency.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Subject</h4>
                    <p className="text-gray-600">{inquiry.subject}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Submitted</h4>
                      <p className="text-gray-600">{formatDate(inquiry.created_at)}</p>
                    </div>
                    {inquiry.responded_at && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">First Response</h4>
                        <p className="text-gray-600">{formatDate(inquiry.responded_at)}</p>
                      </div>
                    )}
                  </div>

                  {inquiry.assigned_to && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Assigned To</h4>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{inquiry.assigned_to}</span>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">What's Next?</h4>
                    <div className="text-blue-800 text-sm">
                      {inquiry.status === 'new' && (
                        <p>Your inquiry has been received and is waiting to be reviewed by our team. We'll get back to you soon!</p>
                      )}
                      {inquiry.status === 'in_progress' && (
                        <p>Our team is currently working on your inquiry. You should expect a response soon.</p>
                      )}
                      {inquiry.status === 'resolved' && (
                        <p>Your inquiry has been resolved. If you have any follow-up questions, please feel free to contact us again.</p>
                      )}
                      {inquiry.status === 'closed' && (
                        <p>This inquiry has been closed. If you need further assistance, please submit a new inquiry.</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button variant="outline" onClick={() => setInquiry(null)}>
                      Check Another Inquiry
                    </Button>
                    <Button asChild>
                      <a href="/guest/inquiry">Submit New Inquiry</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
