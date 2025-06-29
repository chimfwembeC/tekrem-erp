import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Progress } from '@/Components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Separator } from '@/Components/ui/separator';
import {
    ArrowLeft,
    Calendar,
    Users,
    Target,
    Clock,
    FileText,
    Download,
    MessageSquare,
    User,
    DollarSign,
    Paperclip
} from 'lucide-react';

interface Project {
    id: number;
    name: string;
    description: string;
    status: string;
    progress: number;
    start_date: string;
    end_date: string;
    budget?: number;
    client: {
        name: string;
    };
    teamMembers: Array<{
        user: {
            id: number;
            name: string;
            profile_photo_url?: string;
        };
        role: string;
    }>;
    milestones: Array<{
        id: number;
        title: string;
        description: string;
        due_date: string;
        status: string;
        progress: number;
    }>;
    tasks: Array<{
        id: number;
        title: string;
        description: string;
        status: string;
        priority: string;
        due_date?: string;
        assignedTo?: {
            name: string;
        };
    }>;
    timeEntries: Array<{
        id: number;
        description: string;
        hours: number;
        date: string;
        user: {
            name: string;
        };
        task?: {
            title: string;
        };
    }>;
    attachments: Array<{
        id: number;
        file_name: string;
        file_size: number;
        uploaded_at: string;
    }>;
}

interface Props {
    project: Project;
}

export default function Show({ project }: Props) {
    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'completed':
                return 'secondary';
            case 'active':
                return 'default';
            case 'on_hold':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const getPriorityVariant = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'destructive';
            case 'medium':
                return 'default';
            case 'low':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const totalHours = project.timeEntries.reduce((sum, entry) => sum + entry.hours, 0);

    return (
        <CustomerLayout>
            <Head title={`Project: ${project.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('customer.projects.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Projects
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                            <Badge variant={getStatusVariant(project.status)}>
                                {project.status.replace('_', ' ')}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">{project.description}</p>
                    </div>
                </div>

                {/* Project Overview */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Progress</CardTitle>
                            <Target className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{project.progress}%</div>
                            <Progress value={project.progress} className="mt-2" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{project.teamMembers.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Budget</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {project.budget ? `$${project.budget.toLocaleString()}` : 'N/A'}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Project Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Start Date</p>
                                        <p className="font-medium">{formatDate(project.start_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">End Date</p>
                                        <p className="font-medium">{formatDate(project.end_date)}</p>
                                    </div>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-sm text-muted-foreground">Client</p>
                                    <p className="font-medium">{project.client.name}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Milestones */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Milestones</CardTitle>
                                <CardDescription>
                                    Key project milestones and their progress
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {project.milestones.length > 0 ? (
                                        project.milestones.map((milestone) => (
                                            <div key={milestone.id} className="p-4 border rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium">{milestone.title}</h4>
                                                    <Badge variant={getStatusVariant(milestone.status)}>
                                                        {milestone.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {milestone.description}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Calendar className="h-4 w-4" />
                                                        Due: {formatDate(milestone.due_date)}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm">{milestone.progress}%</span>
                                                        <Progress value={milestone.progress} className="w-20" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-muted-foreground py-8">
                                            No milestones defined for this project.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tasks */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Tasks</CardTitle>
                                <CardDescription>
                                    Tasks visible to you in this project
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {project.tasks.length > 0 ? (
                                        project.tasks.slice(0, 5).map((task) => (
                                            <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-medium">{task.title}</h4>
                                                        <Badge variant={getPriorityVariant(task.priority)} className="text-xs">
                                                            {task.priority}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                                        {task.description}
                                                    </p>
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                        {task.due_date && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {formatDate(task.due_date)}
                                                            </span>
                                                        )}
                                                        {task.assignedTo && (
                                                            <span className="flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                {task.assignedTo.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Badge variant={getStatusVariant(task.status)}>
                                                    {task.status}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-muted-foreground py-8">
                                            No tasks visible to you in this project.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Team Members */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Team Members</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {project.teamMembers.map((member) => (
                                        <div key={member.user.id} className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={member.user.profile_photo_url} alt={member.user.name} />
                                                <AvatarFallback>
                                                    {member.user.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{member.user.name}</p>
                                                <p className="text-xs text-muted-foreground">{member.role}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Time Tracking */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Time Entries</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {project.timeEntries.slice(0, 5).map((entry) => (
                                        <div key={entry.id} className="p-3 border rounded-lg">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-medium">{entry.hours}h</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(entry.date)}
                                                </p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{entry.description}</p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                <span>{entry.user.name}</span>
                                                {entry.task && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{entry.task.title}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Project Files */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Files</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {project.attachments.length > 0 ? (
                                        project.attachments.map((attachment) => (
                                            <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-sm font-medium">{attachment.file_name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatFileSize(attachment.file_size)} • {formatDate(attachment.uploaded_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-muted-foreground py-4">
                                            No files available.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href={route('customer.communications.create')} className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                        Contact Team
                                    </Button>
                                </Link>
                                <Link href={route('customer.support.create')} className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        <FileText className="mr-2 h-4 w-4" />
                                        Report Issue
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
