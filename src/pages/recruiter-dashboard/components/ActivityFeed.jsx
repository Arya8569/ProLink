import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ActivityFeed = ({ activities, onViewActivity, onMarkAsRead }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'application':
        return { icon: 'FileText', color: 'text-primary' };
      case 'interview':
        return { icon: 'Calendar', color: 'text-accent' };
      case 'message':
        return { icon: 'MessageSquare', color: 'text-secondary' };
      case 'status_change':
        return { icon: 'ArrowRight', color: 'text-success' };
      case 'profile_update':
        return { icon: 'User', color: 'text-warning' };
      default:
        return { icon: 'Bell', color: 'text-muted-foreground' };
    }
  };

  const getPriorityIndicator = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-error';
      case 'medium':
        return 'border-l-warning';
      case 'low':
        return 'border-l-success';
      default:
        return 'border-l-border';
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

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
        <Button variant="ghost" size="sm">
          <Icon name="Filter" size={16} />
          <span className="ml-1">Filter</span>
        </Button>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Icon name="Activity" size={32} className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              No recent activity
            </p>
          </div>
        ) : (
          activities?.map((activity) => {
            const activityInfo = getActivityIcon(activity?.type);
            return (
              <div
                key={activity?.id}
                className={`flex items-start space-x-4 p-4 rounded-lg border-l-4 hover:bg-muted/50 transition-smooth ${
                  getPriorityIndicator(activity?.priority)
                } ${!activity?.read ? 'bg-primary/5' : ''}`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center ${activityInfo?.color}`}>
                  <Icon name={activityInfo?.icon} size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${!activity?.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {activity?.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity?.description}
                      </p>
                      {activity?.candidate && (
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                            {activity?.candidate?.name?.charAt(0)}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {activity?.candidate?.name} • {activity?.candidate?.position}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTimeAgo(activity?.timestamp)}
                      </span>
                      {!activity?.read && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                  </div>
                  
                  {activity?.actions && activity?.actions?.length > 0 && (
                    <div className="flex items-center space-x-2 mt-3">
                      {activity?.actions?.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => onViewActivity(activity?.id, action?.type)}
                        >
                          <Icon name={action?.icon} size={14} />
                          <span className="ml-1">{action?.label}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      {activities?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full">
            View all activity
          </Button>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;