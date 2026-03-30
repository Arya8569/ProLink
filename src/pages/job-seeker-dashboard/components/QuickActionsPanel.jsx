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
      id: 'view-applications',
      title: 'My Applications',
      description: 'Track application status',
      icon: 'Briefcase',
      color: 'accent',
      shortcut: '⌘A'
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
    </div>
  );
};

export default QuickActionsPanel;