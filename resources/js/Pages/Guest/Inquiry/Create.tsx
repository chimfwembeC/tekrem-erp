import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { CheckCircle, Send, MessageSquare } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { toast } from 'sonner';

interface Props {
  inquiryTypes: Record<string, string>;
  urgencyLevels: Record<string, string>;
  contactMethods: Record<string, string>;
}

export default function Create({ inquiryTypes, urgencyLevels, contactMethods }: Props) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');

  const { data, setData, post, processing, errors, reset } = useForm({
    type: 'general',
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    subject: '',
    message: '',
    preferred_contact_method: 'email',
    urgency: 'normal',
    source: 'website',
    utm_source: new URLSearchParams(window.location.search).get('utm_source') || '',
    utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || '',
    utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    post('/guest/inquiry', {
      onSuccess: (response: any) => {
        if (response.props?.flash?.success) {
          setReferenceNumber(response.props.flash.reference_number || '');
          setIsSubmitted(true);
          reset();
          toast.success('Inquiry submitted successfully!');
        }
      },
      onError: () => {
        toast.error('Failed to submit inquiry. Please try again.');
      }
    });
  };

  if (isSubmitted) {
    return (
      <GuestLayout title="Inquiry Submitted">
        <Head title="Inquiry Submitted" />
        
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl text-green-600">Inquiry Submitted Successfully!</CardTitle>
                  <CardDescription>
                    Thank you for contacting us. We have received your inquiry and will get back to you soon.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  {referenceNumber && (
                    <Alert>
                      <AlertDescription>
                        <strong>Reference Number:</strong> {referenceNumber}
                        <br />
                        Please save this reference number for tracking your inquiry status.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => setIsSubmitted(false)}
                      variant="outline"
                    >
                      Submit Another Inquiry
                    </Button>
                    <Button asChild>
                      <a href="/guest/inquiry/status">Check Inquiry Status</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </GuestLayout>
    );
  }

  return (
    <GuestLayout title="Contact Us">
      <Head title="Contact Us" />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
              <p className="text-xl text-gray-600">
                Have a question or want to discuss a project? We'd love to hear from you.
              </p>
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Send us a Message
                </CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="type">Inquiry Type *</Label>
                      <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select inquiry type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(inquiryTypes).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.type && <p className="text-sm text-red-600">{errors.type}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="urgency">Urgency Level *</Label>
                      <Select value={data.urgency} onValueChange={(value) => setData('urgency', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency level" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(urgencyLevels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.urgency && <p className="text-sm text-red-600">{errors.urgency}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                      {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="Enter your email address"
                        required
                      />
                      {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        placeholder="Enter your phone number"
                      />
                      {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        type="text"
                        value={data.company}
                        onChange={(e) => setData('company', e.target.value)}
                        placeholder="Enter your company name"
                      />
                      {errors.company && <p className="text-sm text-red-600">{errors.company}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="position">Position/Title</Label>
                      <Input
                        id="position"
                        type="text"
                        value={data.position}
                        onChange={(e) => setData('position', e.target.value)}
                        placeholder="Enter your position or title"
                      />
                      {errors.position && <p className="text-sm text-red-600">{errors.position}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferred_contact_method">Preferred Contact Method *</Label>
                      <Select value={data.preferred_contact_method} onValueChange={(value) => setData('preferred_contact_method', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contact method" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(contactMethods).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.preferred_contact_method && <p className="text-sm text-red-600">{errors.preferred_contact_method}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      type="text"
                      value={data.subject}
                      onChange={(e) => setData('subject', e.target.value)}
                      placeholder="Enter the subject of your inquiry"
                      required
                    />
                    {errors.subject && <p className="text-sm text-red-600">{errors.subject}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      value={data.message}
                      onChange={(e) => setData('message', e.target.value)}
                      placeholder="Please provide details about your inquiry..."
                      rows={6}
                      required
                    />
                    {errors.message && <p className="text-sm text-red-600">{errors.message}</p>}
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={processing} className="min-w-32">
                      {processing ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Inquiry
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
