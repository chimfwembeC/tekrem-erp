import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import CustomerLayout from '@/Layouts/CustomerLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Separator } from '@/Components/ui/separator';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Building, 
    Calendar, 
    Shield, 
    Settings,
    Edit,
    Camera,
    Trash2,
    Globe,
    Clock
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    position?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    timezone?: string;
    language?: string;
    bio?: string;
    profile_photo_url?: string;
    email_verified_at?: string;
    created_at: string;
    user_roles: string[];
    user_permissions: string[];
}

interface Session {
    id: string;
    ip_address: string;
    user_agent: string;
    last_activity: string;
    is_current: boolean;
}

interface Props {
    user: User;
    sessions: Session[];
    twoFactorEnabled: boolean;
}

export default function Show({ user, sessions, twoFactorEnabled }: Props) {
    const { delete: destroy } = useForm();
    const route = useRoute();

    const handleDeletePhoto = () => {
        destroy(route('customer.profile.photo.delete'), {
            preserveScroll: true,
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getBrowserName = (userAgent: string) => {
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown';
    };

    return (
        <CustomerLayout>
            <Head title="My Profile" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                        <p className="text-muted-foreground">
                            Manage your account settings and preferences
                        </p>
                    </div>
                    <Link href={route('customer.profile.edit')}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profile
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Profile Information */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <Avatar className="h-20 w-20">
                                        <AvatarImage src={user.profile_photo_url} alt={user.name} />
                                        <AvatarFallback className="text-lg">
                                            {user.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-2">
                                        <div>
                                            <h3 className="text-xl font-semibold">{user.name}</h3>
                                            <p className="text-muted-foreground">{user.email}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link href={route('customer.profile.edit')}>
                                                <Button variant="outline" size="sm">
                                                    <Camera className="mr-2 h-4 w-4" />
                                                    Change Photo
                                                </Button>
                                            </Link>
                                            {user.profile_photo_url && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={handleDeletePhoto}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid gap-4 md:grid-cols-2">
                                    {user.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{user.phone}</span>
                                        </div>
                                    )}
                                    {user.company && (
                                        <div className="flex items-center gap-2">
                                            <Building className="h-4 w-4 text-muted-foreground" />
                                            <span>{user.company}</span>
                                        </div>
                                    )}
                                    {user.position && (
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span>{user.position}</span>
                                        </div>
                                    )}
                                    {(user.city || user.country) && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            <span>
                                                {[user.city, user.state, user.country].filter(Boolean).join(', ')}
                                            </span>
                                        </div>
                                    )}
                                    {user.timezone && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span>{user.timezone}</span>
                                        </div>
                                    )}
                                    {user.language && (
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            <span>{user.language}</span>
                                        </div>
                                    )}
                                </div>

                                {user.bio && (
                                    <>
                                        <Separator />
                                        <div>
                                            <h4 className="font-medium mb-2">Bio</h4>
                                            <p className="text-muted-foreground">{user.bio}</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Account Security */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Account Security
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Email Verification</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Your email address verification status
                                        </p>
                                    </div>
                                    <Badge variant={user.email_verified_at ? "default" : "destructive"}>
                                        {user.email_verified_at ? "Verified" : "Unverified"}
                                    </Badge>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Two-Factor Authentication</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Add additional security to your account
                                        </p>
                                    </div>
                                    <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
                                        {twoFactorEnabled ? "Enabled" : "Disabled"}
                                    </Badge>
                                </div>

                                <Separator />

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Password</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Last updated: Recently
                                        </p>
                                    </div>
                                    <Link href={route('customer.profile.edit')}>
                                        <Button variant="outline" size="sm">
                                            Change Password
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Account Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Account Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Member since</p>
                                    <p className="font-medium">{formatDate(user.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Account Type</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {user.user_roles.map((role) => (
                                            <Badge key={role} variant="secondary">
                                                {role}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Active Sessions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Sessions</CardTitle>
                                <CardDescription>
                                    Manage your active sessions across devices
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {sessions.map((session) => (
                                    <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                                {getBrowserName(session.user_agent)}
                                                {session.is_current && (
                                                    <Badge variant="default" className="ml-2 text-xs">
                                                        Current
                                                    </Badge>
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {session.ip_address}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href={route('customer.profile.edit')} className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Account Settings
                                    </Button>
                                </Link>
                                <Link href={route('customer.support.create')} className="block">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Mail className="mr-2 h-4 w-4" />
                                        Contact Support
                                    </Button>
                                </Link>
                                <Link href={route('customer.profile.delete-account')} className="block">
                                    <Button variant="destructive" className="w-full justify-start">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Account
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
