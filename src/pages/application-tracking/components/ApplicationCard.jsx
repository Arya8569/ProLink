import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import StatusBadge from './StatusBadge';

const ApplicationCard = ({
  application,
  onViewDetails,
  onScheduleFollowup,
  onViewCommunication,
  className = ""
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getNextAction = (status) => {
    const actions = {
      'applied': 'Wait for response',
      'under-review': 'Follow up in 1 week',
      'shortlisted': 'Prepare for interview',
      'interview-scheduled': 'Attend interview',
      'offer-received': 'Review & respond',
      'rejected': 'Apply to similar roles'
    };
    return actions?.[status] || 'No action needed';
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-4 hover:shadow-moderate transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-semibold text-foreground">
              {application?.company?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{application?.position}</h3>
            <p className="text-sm text-muted-foreground truncate">{application?.company}</p>
            <p className="text-xs text-muted-foreground">{application?.location}</p>
          </div>
        </div>
        <StatusBadge status={application?.status} />
      </div>
      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Applied:</span>
          <span className="text-foreground">{formatDate(application?.appliedDate)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Department:</span>
          <span className="text-foreground">{application?.department}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Next Action:</span>
          <span className="text-foreground text-right">{getNextAction(application?.status)}</span>
        </div>
      </div>
      {/* Actions */}
      <div className="flex items-center space-x-2 pt-3 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails(application?.id)}
          className="flex-1"
        >
          <Icon name="Eye" size={14} />
          <span className="ml-1">Details</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewCommunication(application?.id)}
        >
          <Icon name="MessageSquare" size={14} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onScheduleFollowup(application?.id)}
        >
          <Icon name="Calendar" size={14} />
        </Button>
      </div>
    </div>
  );
};

export default ApplicationCard;