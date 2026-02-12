import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const NotificationIndicator = ({ 
  user = null, 
  notifications = [], 
  onMarkAsRead = () => {},
  onMarkAllAsRead = () => {},
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unread = notifications?.filter(n => !n?.read)?.length;
    setUnreadCount(unread);
  }, [notifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application':
        return 'FileText';
      case 'interview':
        return 'Calendar';
      case 'job_match':
        return 'Target';
      case 'message':
        return 'MessageSquare';
      case 'system':
        return 'Settings';
      default:
        return 'Bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'application':
        return 'text-primary';
      case 'interview':
        return 'text-accent';
      case 'job_match':
        return 'text-success';
      case 'message':
        return 'text-secondary';
      case 'system':
        return 'text-muted-foreground';
      default:
        return 'text-foreground';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleNotificationClick = (notification) => {
    if (!notification?.read) {
      onMarkAsRead(notification?.id);
    }
    setIsOpen(false);
  };

  const handleMarkAllAsRead = () => {
    onMarkAllAsRead();
  };

  if (!user) return null;

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Icon name="Bell" size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-xs font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>
      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-md shadow-prominent z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <Icon name="Bell" size={32} className="text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground text-center">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications?.map((notification) => (
                <div
                  key={notification?.id}
                  className={`flex items-start space-x-3 px-4 py-3 hover:bg-muted cursor-pointer transition-smooth border-l-2 ${
                    notification?.read 
                      ? 'border-l-transparent' :'border-l-primary bg-primary/5'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center ${getNotificationColor(notification?.type)}`}>
                    <Icon name={getNotificationIcon(notification?.type)} size={16} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notification?.read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                      {notification?.title}
                    </p>
                    {notification?.message && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification?.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(notification?.timestamp)}
                    </p>
                  </div>

                  {!notification?.read && (
                    <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications?.length > 0 && (
            <div className="border-t border-border px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Button>
            </div>
          )}
        </div>
      )}
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationIndicator;