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
    Ticket, 
    Send, 
    ArrowLeft,
    Paperclip,
    X,
    AlertCircle,
    HelpCircle
} from 'lucide-react';

interface Category {
    id: number;
    name: string;
    description?: string;
}

interface Props {
    categories: Category[];
    priorities: Array<{
        value: string;
        label: string;
        description?: string;
    }>;
}

export default function Create({ categories, priorities }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        category_id: '',
        subject: '',
        description: '',
        priority: 'medium',
        attachments: [] as File[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('category_id', data.category_id);
        formData.append('subject', data.subject);
        formData.append('description', data.description);
        formData.append('priority', data.priority);
        
        data.attachments.forEach((file, index) => {
            formData.append(`attachments[${index}]`, file);
        });

        post(route('customer.support.store'), {
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

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'text-red-600';
            case 'medium':
                return 'text-yellow-600';
            case 'low':
                return 'text-green-600';
            default:
                return 'text-muted-foreground';
        }
    };

    return (
        <CustomerLayout>
            <Head title="Create Support Ticket" />

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
                        <h1 className="text-3xl font-bold tracking-tight">Create Support Ticket</h1>
                        <p className="text-muted-foreground">
                            Get help from our support team
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Ticket className="h-5 w-5" />
                            Ticket Details
                        </CardTitle>
                        <CardDescription>
                            Please provide detailed information about your issue
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="category_id">Category</Label>
                                    <Select
                                        value={data.category_id}
                                        onValueChange={(value) => setData('category_id', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    <div>
                                                        <div className="font-medium">{category.name}</div>
                                                        {category.description && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {category.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && (
                                        <p className="text-sm text-destructive mt-1">{errors.category_id}</p>
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
                                                    <div className="flex items-center gap-2">
                                                        <AlertCircle className={`h-3 w-3 ${getPriorityColor(priority.value)}`} />
                                                        <div>
                                                            <div className="font-medium">{priority.label}</div>
                                                            {priority.description && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    {priority.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
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
                                    placeholder="Brief description of your issue"
                                    className={errors.subject ? 'border-destructive' : ''}
                                />
                                {errors.subject && (
                                    <p className="text-sm text-destructive mt-1">{errors.subject}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Please provide detailed information about your issue, including steps to reproduce, error messages, and any relevant context..."
                                    rows={8}
                                    className={errors.description ? 'border-destructive' : ''}
                                />
                                {errors.description && (
                                    <p className="text-sm text-destructive mt-1">{errors.description}</p>
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
                                                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip"
                                            />
                                        </Label>
                                        <p className="text-sm text-muted-foreground">
                                            Max 10MB per file. Screenshots and logs are helpful!
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
                                    {processing ? 'Creating Ticket...' : 'Create Ticket'}
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

                {/* Help Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <HelpCircle className="h-5 w-5" />
                                Before Creating a Ticket
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <h4 className="font-medium">Check Our Resources</h4>
                                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                                    <li>• Browse our Knowledge Base for common solutions</li>
                                    <li>• Check the FAQ section for quick answers</li>
                                    <li>• Review your account settings and permissions</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Response Times</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3 text-red-600" />
                                    <span className="text-sm"><strong>High Priority:</strong> Within 2 hours</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3 text-yellow-600" />
                                    <span className="text-sm"><strong>Medium Priority:</strong> Within 24 hours</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-3 w-3 text-green-600" />
                                    <span className="text-sm"><strong>Low Priority:</strong> Within 48 hours</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </CustomerLayout>
    );
}
