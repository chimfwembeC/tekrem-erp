import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { InertiaSharedProps } from '@/types';

interface Notification {
  id: number;
  type: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
  notifiable_type: string | null;
  notifiable_id: number | null;
  notifiable: any | null;
}

interface NotificationsIndexProps extends InertiaSharedProps {
  notifications: {
    data: Notification[];
    links: any[];
    current_page: number;
    last_page: number;
    from: number;
    to: number;
    total: number;
  };
}

export default function NotificationsIndex({ notifications }: NotificationsIndexProps) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return '💬';
      case 'lead':
        return '🔍';
      case 'client':
        return '👥';
      case 'communication':
        return '📞';
      default:
        return '🔔';
    }
  };

  const handleMarkAsRead = (id: number) => {
    router.post(route('notifications.mark-as-read', id), {}, {
      preserveScroll: true,
    });
  };

  const handleMarkAllAsRead = () => {
    router.post(route('notifications.mark-all-as-read'), {}, {
      preserveScroll: true,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      router.delete(route('notifications.destroy', id), {
        preserveScroll: true,
      });
    }
  };

  return (
    <AppLayout
      title="Notifications"
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
          Notifications
        </h2>
      )}
    >
      <Head title="Notifications" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center space-y-2 sm:space-y-0">
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  View and manage your notifications
                </CardDescription>
              </div>
              {notifications.data.some(n => !n.is_read) && (
                <Button onClick={handleMarkAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {notifications.data.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  You have no notifications.
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.data.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 border rounded-lg ${!notification.is_read ? 'bg-muted/50' : ''}`}
                    >
                      <div className="flex justify-between">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                          <div>
                            <p className={`${!notification.is_read ? 'font-medium' : ''}`}>
                              {notification.message}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatDateTime(notification.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          {!notification.is_read && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                          {notification.link && (
                            <Link href={notification.link}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  if (!notification.is_read) {
                                    handleMarkAsRead(notification.id);
                                  }
                                }}
                              >
                                View
                              </Button>
                            </Link>
                          )}
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDelete(notification.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {notifications.last_page > 1 && (
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {notifications.from} to {notifications.to} of {notifications.total} notifications
                  </div>
                  <div className="flex gap-1">
                    {notifications.links.map((link, i) => {
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
