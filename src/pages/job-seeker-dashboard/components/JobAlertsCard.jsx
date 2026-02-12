import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const JobAlertsCard = ({ 
  alerts = [], 
  savedSearches = [],
  onCreateAlert = () => {},
  onViewAlert = () => {},
  onQuickApply = () => {} 
}) => {
  const [activeTab, setActiveTab] = useState('alerts');

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getAlertFrequency = (frequency) => {
    switch (frequency) {
      case 'daily':
        return { label: 'Daily', icon: 'Calendar', color: 'text-primary' };
      case 'weekly':
        return { label: 'Weekly', icon: 'CalendarDays', color: 'text-accent' };
      case 'instant':
        return { label: 'Instant', icon: 'Zap', color: 'text-success' };
      default:
        return { label: 'Custom', icon: 'Settings', color: 'text-muted-foreground' };
    }
  };

  const recentAlerts = alerts?.filter(alert => alert?.hasNewJobs)?.slice(0, 4);

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-subtle">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Job Alerts & Saved</h3>
        <Button variant="ghost" size="sm" onClick={onCreateAlert}>
          <Icon name="Plus" size={16} />
          <span className="ml-1">New Alert</span>
        </Button>
      </div>
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-4 bg-muted rounded-lg p-1">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-smooth ${
            activeTab === 'alerts' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
          }`}
        >
          Alerts ({alerts?.length})
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-smooth ${
            activeTab === 'saved' ?'bg-background text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
          }`}
        >
          Saved ({savedSearches?.length})
        </button>
      </div>
      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-3">
          {recentAlerts?.map((alert) => {
            const frequency = getAlertFrequency(alert?.frequency);
            return (
              <div key={alert?.id} className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-smooth">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-foreground mb-1">{alert?.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2">{alert?.query}</p>
                    <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Icon name={frequency?.icon} size={12} className={frequency?.color} />
                        <span>{frequency?.label}</span>
                      </div>
                      <span>•</span>
                      <span>Last: {formatDate(alert?.lastTriggered)}</span>
                    </div>
                  </div>
                  
                  {alert?.hasNewJobs && (
                    <div className="flex items-center space-x-2">
                      <div className="bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium">
                        {alert?.newJobsCount} new
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onViewAlert(alert?.id)}
                      >
                        <Icon name="ArrowRight" size={12} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {alerts?.length === 0 && (
            <div className="text-center py-6">
              <Icon name="Bell" size={24} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-1">No job alerts set up</p>
              <p className="text-xs text-muted-foreground">Create alerts to get notified about new opportunities</p>
            </div>
          )}
        </div>
      )}
      {/* Saved Searches Tab */}
      {activeTab === 'saved' && (
        <div className="space-y-3">
          {savedSearches?.slice(0, 4)?.map((search) => (
            <div key={search?.id} className="p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-smooth">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-foreground mb-1">{search?.title}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{search?.query}</p>
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <span>{search?.resultCount} jobs found</span>
                    <span>•</span>
                    <span>Saved {formatDate(search?.savedAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onViewAlert(search?.id)}
                  >
                    <Icon name="Search" size={12} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Icon name="MoreHorizontal" size={12} />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {savedSearches?.length === 0 && (
            <div className="text-center py-6">
              <Icon name="Bookmark" size={24} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-1">No saved searches</p>
              <p className="text-xs text-muted-foreground">Save your searches to quickly access them later</p>
            </div>
          )}
        </div>
      )}
      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={onCreateAlert}>
            <Icon name="Bell" size={14} />
            <span className="ml-1">Create Alert</span>
          </Button>
          <Button variant="outline" size="sm">
            <Icon name="Search" size={14} />
            <span className="ml-1">Browse Jobs</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobAlertsCard;