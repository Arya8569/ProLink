import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionsPanel = ({ onAction }) => {
  const quickActions = [
    {
      id: 'post-job',
      title: 'Post New Job',
      description: 'Create a new job posting',
      icon: 'Plus',
      color: 'bg-primary text-primary-foreground hover:bg-primary/90',
      action: () => onAction('post-job')
    },
    {
      id: 'search-candidates',
      title: 'Search Candidates',
      description: 'Browse candidate database',
      icon: 'Search',
      color: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
      action: () => onAction('search-candidates')
    },
    {
      id: 'schedule-interview',
      title: 'Schedule Interview',
      description: 'Book candidate meetings',
      icon: 'Calendar',
      color: 'bg-accent text-accent-foreground hover:bg-accent/90',
      action: () => onAction('schedule-interview')
    },
    {
      id: 'team-collaboration',
      title: 'Team Collaboration',
      description: 'Manage team access',
      icon: 'Users',
      color: 'bg-success text-success-foreground hover:bg-success/90',
      action: () => onAction('team-collaboration')
    }
  ];

  const recentShortcuts = [
    {
      id: 'recent-applications',
      title: 'Recent Applications',
      count: 12,
      icon: 'FileText',
      action: () => onAction('recent-applications')
    },
    {
      id: 'pending-interviews',
      title: 'Pending Interviews',
      count: 5,
      icon: 'Clock',
      action: () => onAction('pending-interviews')
    },
    {
      id: 'offers-sent',
      title: 'Offers Sent',
      count: 3,
      icon: 'Send',
      action: () => onAction('offers-sent')
    },
    {
      id: 'messages',
      title: 'Unread Messages',
      count: 8,
      icon: 'MessageSquare',
      action: () => onAction('messages')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickActions?.map((action) => (
            <div
              key={action?.id}
              className="group cursor-pointer"
              onClick={action?.action}
            >
              <div className="bg-muted/50 border border-border rounded-lg p-4 hover:shadow-moderate transition-all duration-200 group-hover:border-primary/20">
                <div className={`w-12 h-12 rounded-lg ${action?.color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform duration-200`}>
                  <Icon name={action?.icon} size={24} />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{action?.title}</h3>
                <p className="text-sm text-muted-foreground">{action?.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Recent Shortcuts */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Access</h2>
        <div className="space-y-3">
          {recentShortcuts?.map((shortcut) => (
            <div
              key={shortcut?.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-smooth"
              onClick={shortcut?.action}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <Icon name={shortcut?.icon} size={16} className="text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">{shortcut?.title}</span>
              </div>
              <div className="flex items-center space-x-2">
                {shortcut?.count > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
                    {shortcut?.count}
                  </span>
                )}
                <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Tools & Resources */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Tools & Resources</h2>
        <div className="space-y-3">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => onAction('interview-templates')}
          >
            <Icon name="FileTemplate" size={16} />
            <span className="ml-2">Interview Templates</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => onAction('email-templates')}
          >
            <Icon name="Mail" size={16} />
            <span className="ml-2">Email Templates</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => onAction('reports')}
          >
            <Icon name="BarChart3" size={16} />
            <span className="ml-2">Hiring Reports</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => onAction('settings')}
          >
            <Icon name="Settings" size={16} />
            <span className="ml-2">Account Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;