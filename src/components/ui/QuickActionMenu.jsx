import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const QuickActionMenu = ({
  user = null,
  onAction = () => {},
  className = "",
  variant = "floating" // "floating" | "inline" | "dropdown"
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getJobSeekerActions = () => [
    {
      id: 'search-jobs',
      label: 'Search Jobs',
      icon: 'Search',
      description: 'Find your next opportunity',
      color: 'primary',
      action: () => onAction('search-jobs')
    },
    {
      id: 'update-profile',
      label: 'Update Profile',
      icon: 'User',
      description: 'Keep your profile current',
      color: 'secondary',
      action: () => onAction('update-profile')
    },
    {
      id: 'view-applications',
      label: 'My Applications',
      icon: 'FileText',
      description: 'Track application status',
      color: 'accent',
      action: () => onAction('view-applications')
    },
    {
      id: 'saved-jobs',
      label: 'Saved Jobs',
      icon: 'Bookmark',
      description: 'Review saved positions',
      color: 'success',
      action: () => onAction('saved-jobs')
    }
  ];

  const getRecruiterActions = () => [
    {
      id: 'post-job',
      label: 'Post New Job',
      icon: 'Plus',
      description: 'Create a job posting',
      color: 'primary',
      action: () => onAction('post-job')
    },
    {
      id: 'review-candidates',
      label: 'Review Candidates',
      icon: 'Users',
      description: 'Evaluate applications',
      color: 'secondary',
      action: () => onAction('review-candidates')
    },
    {
      id: 'schedule-interview',
      label: 'Schedule Interview',
      icon: 'Calendar',
      description: 'Book candidate meetings',
      color: 'accent',
      action: () => onAction('schedule-interview')
    },
    {
      id: 'analytics',
      label: 'View Analytics',
      icon: 'BarChart3',
      description: 'Track hiring metrics',
      color: 'success',
      action: () => onAction('analytics')
    }
  ];

  const getActions = () => {
    if (!user) return [];
    return user?.role === 'recruiter' ? getRecruiterActions() : getJobSeekerActions();
  };

  const actions = getActions();

  const getColorClasses = (color) => {
    const colorMap = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
      accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
      success: 'bg-success text-success-foreground hover:bg-success/90'
    };
    return colorMap?.[color] || colorMap?.primary;
  };

  if (!user || actions?.length === 0) return null;

  // Floating Action Button (Mobile-first)
  if (variant === 'floating') {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        {/* Expanded Actions */}
        {isExpanded && (
          <div className="mb-4 space-y-3">
            {actions?.slice(0, 3)?.map((action, index) => (
              <div
                key={action?.id}
                className="flex items-center justify-end space-x-3 animate-in slide-in-from-bottom-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-moderate">
                  <p className="text-sm font-medium text-foreground">{action?.label}</p>
                  <p className="text-xs text-muted-foreground">{action?.description}</p>
                </div>
                <Button
                  size="icon"
                  className={`w-12 h-12 rounded-full shadow-moderate ${getColorClasses(action?.color)}`}
                  onClick={action?.action}
                >
                  <Icon name={action?.icon} size={20} />
                </Button>
              </div>
            ))}
          </div>
        )}
        {/* Main FAB */}
        <Button
          size="icon"
          className="w-14 h-14 rounded-full shadow-prominent bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Icon 
            name={isExpanded ? "X" : "Plus"} 
            size={24} 
            className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
          />
        </Button>
        {/* Backdrop */}
        {isExpanded && (
          <div
            className="fixed inset-0 bg-black/20 -z-10"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </div>
    );
  }

  // Inline Action Grid (Desktop Dashboard)
  if (variant === 'inline') {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {actions?.map((action) => (
          <div
            key={action?.id}
            className="group bg-card border border-border rounded-lg p-6 hover:shadow-moderate transition-all duration-200 cursor-pointer"
            onClick={action?.action}
          >
            <div className={`w-12 h-12 rounded-lg ${getColorClasses(action?.color)} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-200`}>
              <Icon name={action?.icon} size={24} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{action?.label}</h3>
            <p className="text-sm text-muted-foreground">{action?.description}</p>
          </div>
        ))}
      </div>
    );
  }

  // Dropdown Menu
  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2"
        >
          <Icon name="Zap" size={16} />
          <span>Quick Actions</span>
          <Icon name="ChevronDown" size={16} />
        </Button>
        {isExpanded && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-popover border border-border rounded-md shadow-prominent z-50">
            <div className="py-2">
              {actions?.map((action) => (
                <button
                  key={action?.id}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-left hover:bg-muted transition-smooth"
                  onClick={() => {
                    action?.action();
                    setIsExpanded(false);
                  }}
                >
                  <div className={`w-8 h-8 rounded-lg ${getColorClasses(action?.color)} flex items-center justify-center flex-shrink-0`}>
                    <Icon name={action?.icon} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{action?.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{action?.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Overlay */}
        {isExpanded && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </div>
    );
  }

  return null;
};

export default QuickActionMenu;