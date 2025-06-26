import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import { CheckCircle, Send, DollarSign, Plus, X } from 'lucide-react';
import GuestLayout from '@/Layouts/GuestLayout';
import { toast } from 'sonner';

interface Props {
  serviceTypes: Record<string, string>;
  budgetRanges: Record<string, string>;
  timelines: Record<string, string>;
  priorities: Record<string, string>;
}

export default function Create({ serviceTypes, budgetRanges, timelines, priorities }: Props) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [features, setFeatures] = useState<string[]>(['']);

  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    service_type: '',
    project_description: '',
    budget_range: '',
    timeline: '',
    requirements: [] as string[],
    features: [] as string[],
    priority: 'normal',
    source: 'website',
    utm_source: new URLSearchParams(window.location.search).get('utm_source') || '',
    utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || '',
    utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || '',
  });

  const addRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const removeRequirement = (index: number) => {
    const newRequirements = requirements.filter((_, i) => i !== index);
    setRequirements(newRequirements);
    setData('requirements', newRequirements.filter(req => req.trim() !== ''));
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
    setData('requirements', newRequirements.filter(req => req.trim() !== ''));
  };

  const addFeature = () => {
    setFeatures([...features, '']);
  };

  const removeFeature = (index: number) => {
    const newFeatures = features.filter((_, i) => i !== index);
    setFeatures(newFeatures);
    setData('features', newFeatures.filter(feature => feature.trim() !== ''));
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
    setData('features', newFeatures.filter(feature => feature.trim() !== ''));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update requirements and features before submitting
    setData('requirements', requirements.filter(req => req.trim() !== ''));
    setData('features', features.filter(feature => feature.trim() !== ''));
    
    post('/guest/quote', {
      onSuccess: (response: any) => {
        if (response.props?.flash?.success) {
          setReferenceNumber(response.props.flash.reference_number || '');
          setIsSubmitted(true);
          reset();
          setRequirements(['']);
          setFeatures(['']);
          toast.success('Quote request submitted successfully!');
        }
      },
      onError: () => {
        toast.error('Failed to submit quote request. Please try again.');
      }
    });
  };

  if (isSubmitted) {
    return (
      <GuestLayout title="Quote Request Submitted">
        <Head title="Quote Request Submitted" />
        
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl text-green-600">Quote Request Submitted!</CardTitle>
                  <CardDescription>
                    Thank you for your quote request. Our team will review your requirements and prepare a detailed quote for you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  {referenceNumber && (
                    <Alert>
                      <AlertDescription>
                        <strong>Reference Number:</strong> {referenceNumber}
                        <br />
                        Please save this reference number for tracking your quote request.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => setIsSubmitted(false)}
                      variant="outline"
                    >
                      Submit Another Request
                    </Button>
                    <Button asChild>
                      <a href="/guest/quote/status">Check Quote Status</a>
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
    <GuestLayout title="Request a Quote">
      <Head title="Request a Quote" />
      
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Request a Quote</h1>
              <p className="text-xl text-gray-600">
                Tell us about your project and we'll provide you with a detailed quote.
              </p>
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Project Quote Request
                </CardTitle>
                <CardDescription>
                  Please provide as much detail as possible to help us prepare an accurate quote.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  {/* Project Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="service_type">Service Type *</Label>
                        <Select value={data.service_type} onValueChange={(value) => setData('service_type', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select service type" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(serviceTypes).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.service_type && <p className="text-sm text-red-600">{errors.service_type}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority Level *</Label>
                        <Select value={data.priority} onValueChange={(value) => setData('priority', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority level" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(priorities).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.priority && <p className="text-sm text-red-600">{errors.priority}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="project_description">Project Description *</Label>
                      <Textarea
                        id="project_description"
                        value={data.project_description}
                        onChange={(e) => setData('project_description', e.target.value)}
                        placeholder="Please describe your project in detail..."
                        rows={4}
                        required
                      />
                      {errors.project_description && <p className="text-sm text-red-600">{errors.project_description}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="budget_range">Budget Range</Label>
                        <Select value={data.budget_range} onValueChange={(value) => setData('budget_range', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select budget range" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(budgetRanges).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.budget_range && <p className="text-sm text-red-600">{errors.budget_range}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timeline">Timeline</Label>
                        <Select value={data.timeline} onValueChange={(value) => setData('timeline', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timeline" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(timelines).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.timeline && <p className="text-sm text-red-600">{errors.timeline}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Project Requirements</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addRequirement}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Requirement
                      </Button>
                    </div>
                    {requirements.map((requirement, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={requirement}
                          onChange={(e) => updateRequirement(index, e.target.value)}
                          placeholder="Enter a project requirement"
                        />
                        {requirements.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeRequirement(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Desired Features</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Feature
                      </Button>
                    </div>
                    {features.map((feature, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder="Enter a desired feature"
                        />
                        {features.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeFeature(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={processing} className="min-w-32">
                      {processing ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Request Quote
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
