import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { 
    MessageSquare, 
    Send, 
    ArrowLeft,
    Paperclip,
    X
} from 'lucide-react';

interface Props {
    types: Array<{
        value: string;
        label: string;
    }>;
    priorities: Array<{
        value: string;
        label: string;
    }>;
}

export default function Create({ types, priorities }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        type: '',
        subject: '',
        content: '',
        priority: 'medium',
        attachments: [] as File[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('type', data.type);
        formData.append('subject', data.subject);
        formData.append('content', data.content);
        formData.append('priority', data.priority);
        
        data.attachments.forEach((file, index) => {
            formData.append(`attachments[${index}]`, file);
        });

        post(route('customer.communications.store'), {
            data: formData,
            onSuccess: () => {
                reset();
            },
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setData('attachments', [...data.attachments, ...files]);
    };

    const removeFile = (index: number) => {
        const newAttachments = data.attachments.filter((_, i) => i !== index);
        setData('attachments', newAttachments);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <CustomerLayout>
            <Head title="New Communication Request" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.history.back()}
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">New Communication Request</h1>
                        <p className="text-muted-foreground">
                            Start a new communication with our team
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Communication Details
                        </CardTitle>
                        <CardDescription>
                            Please provide details about your communication request
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="type">Communication Type</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) => setData('type', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select communication type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {types.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.type && (
                                        <p className="text-sm text-destructive mt-1">{errors.type}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="priority">Priority</Label>
                                    <Select
                                        value={data.priority}
                                        onValueChange={(value) => setData('priority', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select priority" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {priorities.map((priority) => (
                                                <SelectItem key={priority.value} value={priority.value}>
                                                    {priority.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.priority && (
                                        <p className="text-sm text-destructive mt-1">{errors.priority}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    value={data.subject}
                                    onChange={(e) => setData('subject', e.target.value)}
                                    placeholder="Brief description of your request"
                                    className={errors.subject ? 'border-destructive' : ''}
                                />
                                {errors.subject && (
                                    <p className="text-sm text-destructive mt-1">{errors.subject}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="content">Message</Label>
                                <Textarea
                                    id="content"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder="Please provide detailed information about your request..."
                                    rows={6}
                                    className={errors.content ? 'border-destructive' : ''}
                                />
                                {errors.content && (
                                    <p className="text-sm text-destructive mt-1">{errors.content}</p>
                                )}
                            </div>

                            {/* File Attachments */}
                            <div>
                                <Label>Attachments</Label>
                                <div className="mt-2">
                                    <div className="flex items-center gap-4">
                                        <Label htmlFor="attachments" className="cursor-pointer">
                                            <div className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg hover:bg-muted transition-colors">
                                                <Paperclip className="h-4 w-4" />
                                                Add Files
                                            </div>
                                            <Input
                                                id="attachments"
                                                type="file"
                                                multiple
                                                onChange={handleFileChange}
                                                className="hidden"
                                                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                                            />
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Max 10MB per file. Supported: PDF, DOC, DOCX, TXT, JPG, PNG, GIF
                                        </p>
                                    </div>

                                    {/* File List */}
                                    {data.attachments.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {data.attachments.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <p className="text-sm font-medium">{file.name}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {formatFileSize(file.size)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFile(index)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {errors.attachments && (
                                    <p className="text-sm text-destructive mt-1">{errors.attachments}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    <Send className="mr-2 h-4 w-4" />
                                    {processing ? 'Sending...' : 'Send Request'}
                                </Button>
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Help Text */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Communication Guidelines</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <h4 className="font-medium">Response Times</h4>
                            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                <li>• High Priority: Within 2 hours during business hours</li>
                                <li>• Medium Priority: Within 24 hours</li>
                                <li>• Low Priority: Within 48 hours</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium">Tips for Better Support</h4>
                            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                <li>• Be specific about your issue or request</li>
                                <li>• Include relevant screenshots or documents</li>
                                <li>• Mention any error messages you've encountered</li>
                                <li>• Provide steps to reproduce the issue if applicable</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
