import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ApplicationStatusCard = ({ applications = [], onViewAll = () => {} }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'applied':
        return 'text-primary bg-primary/10 border-primary/20';
      case 'shortlisted':
        return 'text-accent bg-accent/10 border-accent/20';
      case 'interview':
        return 'text-secondary bg-secondary/10 border-secondary/20';
      case 'offer':
        return 'text-success bg-success/10 border-success/20';
      case 'rejected':
        return 'text-error bg-error/10 border-error/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'applied':
        return 'FileText';
      case 'shortlisted':
        return 'Star';
      case 'interview':
        return 'Calendar';
      case 'offer':
        return 'Gift';
      case 'rejected':
        return 'X';
      default:
        return 'Clock';
    }
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-subtle">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Applications</h3>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View all
          <Icon name="ArrowRight" size={16} className="ml-1" />
        </Button>
      </div>
      <div className="space-y-4">
        {applications?.slice(0, 4)?.map((application) => (
          <div key={application?.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-smooth">
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-12 h-12 bg-background rounded-lg flex items-center justify-center border border-border">
                <span className="text-sm font-semibold text-foreground">
                  {application?.company?.charAt(0)}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground truncate">
                  {application?.position}
                </h4>
                <p className="text-sm text-muted-foreground truncate">
                  {application?.company}
                </p>
                <p className="text-xs text-muted-foreground">
                  Applied {formatDate(application?.appliedDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor(application?.status)}`}>
                <Icon name={getStatusIcon(application?.status)} size={12} />
                <span>{application?.status}</span>
              </div>
              
              {application?.hasUpdate && (
                <div className="w-2 h-2 bg-accent rounded-full"></div>
              )}
            </div>
          </div>
        ))}
      </div>
      {applications?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="FileText" size={32} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No applications yet</p>
          <p className="text-xs text-muted-foreground">Start applying to jobs to see your progress here</p>
        </div>
      )}
    </div>
  );
};

export default ApplicationStatusCard;