import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Badge } from '@/Components/ui/badge';
import useTypedPage from '@/Hooks/useTypedPage';
import useRoute from '@/Hooks/useRoute';

interface Notification {
  id: number;
  type: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

interface NotificationComponentProps {
  className?: string;
}

export default function NotificationComponent({ className = '' }: NotificationComponentProps) {
  const page = useTypedPage();
  const route = useRoute();
  const [isOpen, setIsOpen] = useState(false);

  // Get notifications from shared Inertia props
  const notificationsData = page.props.notifications;
  const notifications = notificationsData?.recent || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  // console.log('notificationsData',notificationsData);
  const handleMarkAsRead = (id: number) => {
    router.post(route('notifications.mark-as-read', id), {}, {
      preserveScroll: true,
      // Inertia will automatically refresh the shared data
    });
  };

  const handleMarkAllAsRead = () => {
    router.post(route('notifications.mark-all-as-read'), {}, {
      preserveScroll: true,
      // Inertia will automatically refresh the shared data
    });
  };

  const handleDelete = (id: number) => {
    router.delete(route('notifications.destroy', id), {
      preserveScroll: true,
      // Inertia will automatically refresh the shared data
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'chat':
      case 'new_chat_message':
        return '💬';
      case 'lead':
        return '🎯';
      case 'client':
        return '👤';
      case 'communication':
        return '📞';
      case 'system':
        return '⚙️';
      case 'task':
        return '✅';
      case 'reminder':
        return '⏰';
      default:
        return '🔔';
    }
  };

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'chat':
      case 'new_chat_message':
        return 'bg-blue-500';
      case 'lead':
        return 'bg-green-500';
      case 'client':
        return 'bg-purple-500';
      case 'communication':
        return 'bg-orange-500';
      case 'system':
        return 'bg-gray-500';
      case 'task':
        return 'bg-emerald-500';
      case 'reminder':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getNotificationBorderColor = (type: string) => {
    switch (type) {
      case 'chat':
      case 'new_chat_message':
        return '#3b82f6'; // blue-500
      case 'lead':
        return '#22c55e'; // green-500
      case 'client':
        return '#a855f7'; // purple-500
      case 'communication':
        return '#f97316'; // orange-500
      case 'system':
        return '#6b7280'; // gray-500
      case 'task':
        return '#10b981'; // emerald-500
      case 'reminder':
        return '#eab308'; // yellow-500
      default:
        return '#3b82f6'; // blue-500
    }
  };

  const getNotificationPriority = (type: string) => {
    switch (type) {
      case 'chat':
      case 'new_chat_message':
        return 'high';
      case 'lead':
      case 'client':
        return 'medium';
      case 'communication':
        return 'medium';
      case 'system':
        return 'low';
      default:
        return 'medium';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={`relative ${className}`}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 lg:w-[600px]">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">No notifications</div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className={`mb-2 flex flex-col items-start p-3 cursor-default border-l-4 ${!notification.is_read ? 'bg-muted/30' : ''}`} style={{ borderLeftColor: !notification.is_read ? getNotificationBorderColor(notification.type) : 'transparent' }}>
                <div className="flex w-full justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-1">
                      <div className="text-lg">{getNotificationIcon(notification.type)}</div>
                      {!notification.is_read && (
                        <div className={`w-2 h-2 rounded-full ${getNotificationBadgeColor(notification.type)}`}></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={`text-sm ${!notification.is_read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {notification.message}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {notification.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(notification.id)}
                    className="text-muted-foreground hover:text-destructive text-sm ml-2"
                  >
                    &times;
                  </button>
                </div>
                <div className="flex justify-end w-full mt-2 gap-2">
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-xs text-primary hover:text-primary/80 px-2 py-1 rounded bg-primary/10 hover:bg-primary/20"
                    >
                      Mark as read
                    </button>
                  )}
                  {notification.link && (
                    <Link
                      href={notification.link}
                      className="text-xs text-primary hover:text-primary/80 px-2 py-1 rounded bg-primary/10 hover:bg-primary/20"
                      onClick={() => {
                        setIsOpen(false);
                        if (!notification.is_read) {
                          handleMarkAsRead(notification.id);
                        }
                      }}
                    >
                      View
                    </Link>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={route('notifications.index')}
            className="w-full text-center text-sm"
            onClick={() => setIsOpen(false)}
          >
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
