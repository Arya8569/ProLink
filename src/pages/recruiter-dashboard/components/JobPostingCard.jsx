import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const JobPostingCard = ({ job, onViewDetails, onEditJob, onViewCandidates }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-success bg-success/10 border-success/20';
      case 'paused':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'closed':
        return 'text-error bg-error/10 border-error/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'urgent':
        return { icon: 'Flame', color: 'text-error' };
      case 'hot':
        return { icon: 'TrendingUp', color: 'text-warning' };
      case 'featured':
        return { icon: 'Star', color: 'text-accent' };
      default:
        return null;
    }
  };

  const urgencyInfo = getUrgencyIcon(job?.urgency);

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-moderate transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-semibold text-foreground">{job?.title}</h3>
            {urgencyInfo && (
              <Icon name={urgencyInfo?.icon} size={16} className={urgencyInfo?.color} />
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{job?.department} • {job?.location}</p>
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span>Posted {job?.postedDate}</span>
            <span>•</span>
            <span>Expires {job?.expiryDate}</span>
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(job?.status)}`}>
          {job?.status?.charAt(0)?.toUpperCase() + job?.status?.slice(1)}
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{job?.totalApplications}</div>
          <div className="text-xs text-muted-foreground">Applications</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-secondary">{job?.shortlisted}</div>
          <div className="text-xs text-muted-foreground">Shortlisted</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-accent">{job?.interviewed}</div>
          <div className="text-xs text-muted-foreground">Interviewed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-success">{job?.qualityScore}%</div>
          <div className="text-xs text-muted-foreground">Quality Score</div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon name="Eye" size={16} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{job?.views} views</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewCandidates(job?.id)}
          >
            <Icon name="Users" size={16} />
            <span className="ml-1">Candidates</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditJob(job?.id)}
          >
            <Icon name="Edit" size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(job?.id)}
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobPostingCard;