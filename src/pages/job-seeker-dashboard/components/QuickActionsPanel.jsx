import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionsPanel = ({ 
  user = null,
  onAction = () => {},
  className = ""
}) => {
  const quickActions = [
    {
      id: 'search-jobs',
      title: 'Search Jobs',
      description: 'Find your next opportunity',
      icon: 'Search',
      color: 'primary',
      shortcut: '⌘K'
    },
    {
      id: 'update-resume',
      title: 'Update Resume',
      description: 'Keep your resume current',
      icon: 'FileText',
      color: 'secondary',
      shortcut: '⌘R'
    },
    {
      id: 'view-applications',
      title: 'My Applications',
      description: 'Track application status',
      icon: 'Briefcase',
      color: 'accent',
      shortcut: '⌘A'
    },
    {
      id: 'profile-settings',
      title: 'Profile Settings',
      description: 'Manage your profile',
      icon: 'Settings',
      color: 'success',
      shortcut: '⌘P'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      primary: 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20',
      secondary: 'bg-secondary/10 text-secondary hover:bg-secondary/20 border-secondary/20',
      accent: 'bg-accent/10 text-accent hover:bg-accent/20 border-accent/20',
      success: 'bg-success/10 text-success hover:bg-success/20 border-success/20'
    };
    return colorMap?.[color] || colorMap?.primary;
  };

  const handleAction = (actionId) => {
    onAction(actionId);
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 card-subtle ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <Icon name="Zap" size={14} />
          <span>Shortcuts</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {quickActions?.map((action) => (
          <button
            key={action?.id}
            onClick={() => handleAction(action?.id)}
            className={`group p-4 rounded-lg border transition-all duration-200 text-left hover:shadow-sm ${getColorClasses(action?.color)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <Icon name={action?.icon} size={20} />
              </div>
              <div className="text-xs opacity-60 font-mono">
                {action?.shortcut}
              </div>
            </div>
            
            <h4 className="text-sm font-semibold mb-1">{action?.title}</h4>
            <p className="text-xs opacity-80">{action?.description}</p>
          </button>
        ))}
      </div>
      {/* Additional Actions */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start"
            onClick={() => handleAction('job-alerts')}
          >
            <Icon name="Bell" size={14} />
            <span className="ml-2">Job Alerts</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="justify-start"
            onClick={() => handleAction('saved-jobs')}
          >
            <Icon name="Bookmark" size={14} />
            <span className="ml-2">Saved Jobs</span>
          </Button>
        </div>
      </div>
      {/* Pro Tip */}
      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Lightbulb" size={16} className="text-accent mt-0.5" />
          <div>
            <p className="text-xs font-medium text-foreground">Pro Tip</p>
            <p className="text-xs text-muted-foreground">
              Use keyboard shortcuts to navigate quickly. Press ⌘K to search jobs instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;