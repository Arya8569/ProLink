import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

// Utility function for Indian Currency (Lakh/Crore)
const formatIndianCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === 0) return 'N/A';
  amount = Number(amount);
  
  if (amount >= 10000000) { 
    return `₹${(amount / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  } else if (amount >= 100000) { 
    return `₹${(amount / 100000).toFixed(2).replace(/\.00$/, '')} L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

const JobCard = ({ job, onSave, onApply, className = "" }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(job?.isSaved || false);
  const [isApplying, setIsApplying] = useState(false);

  const handleSave = (e) => {
    e?.stopPropagation();
    setIsSaved(!isSaved);
    onSave(job?.id, !isSaved);
  };

  const handleApply = async (e) => {
    e?.stopPropagation();
    setIsApplying(true);
    await onApply(job?.id);
    setIsApplying(false);
  };

  const handleCardClick = () => {
    navigate(`/job-details?id=${job?.id}`);
  };

  const getMatchPercentage = () => {
    return job?.aiMatchPercentage || Math.floor(Math.random() * 30) + 70;
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const posted = new Date(dateString);
    const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  const getPriorityBadge = () => {
    if (job?.priority === 'urgent') {
      return (
        <div className="flex items-center space-x-1 bg-error/10 text-error px-2 py-1 rounded-full text-xs font-medium">
          <Icon name="Zap" size={12} />
          <span>Urgent</span>
        </div>
      );
    }
    if (job?.priority === 'featured') {
      return (
        <div className="flex items-center space-x-1 bg-accent/10 text-accent px-2 py-1 rounded-full text-xs font-medium">
          <Icon name="Star" size={12} />
          <span>Featured</span>
        </div>
      );
    }
    return null;
  };

  const matchPercentage = getMatchPercentage();

  return (
    <div 
      className={`bg-card border border-border rounded-lg p-6 hover:shadow-moderate transition-all duration-200 cursor-pointer group ${className}`}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4 flex-1">
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
            <Image 
              src={job?.company?.logo} 
              alt={`${job?.company?.name} logo`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {job?.title}
              </h3>
              {getPriorityBadge()}
            </div>
            <p className="text-sm text-muted-foreground mb-2">{job?.company?.name}</p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Icon name="MapPin" size={14} />
                <span>{job?.location}</span>
              </div>
              {job?.isRemote && (
                <div className="flex items-center space-x-1">
                  <Icon name="Wifi" size={14} />
                  <span>Remote</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Icon name="Clock" size={14} />
                <span>{getTimeAgo(job?.postedDate)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            className={`${isSaved ? 'text-accent' : 'text-muted-foreground'} hover:text-accent`}
          >
            <Icon name={isSaved ? "Bookmark" : "BookmarkPlus"} size={20} />
          </Button>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-1">AI Match</div>
            <div className={`text-sm font-semibold ${
              matchPercentage >= 85 ? 'text-success' : 
              matchPercentage >= 70 ? 'text-accent' : 'text-muted-foreground'
            }`}>
              {matchPercentage}%
            </div>
          </div>
        </div>
      </div>
      {/* Job Details */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-semibold text-foreground">
            {job?.salary?.min && job?.salary?.max ? (
              `${formatIndianCurrency(job?.salary?.min)} - ${formatIndianCurrency(job?.salary?.max)}`
            ) : job?.salary?.range || 'Salary not disclosed'}
          </div>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Icon name="Star" size={14} />
            <span>{job?.company?.rating}</span>
            <span>({job?.company?.reviewCount})</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {job?.description}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {job?.skills?.slice(0, 4)?.map((skill, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
            >
              {skill}
            </span>
          ))}
          {job?.skills?.length > 4 && (
            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md">
              +{job?.skills?.length - 4} more
            </span>
          )}
        </div>
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
          <span>{job?.jobType}</span>
          <span>•</span>
          <span>{job?.experienceLevel}</span>
          {job?.benefits && job?.benefits?.length > 0 && (
            <>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Icon name="Shield" size={12} />
                <span>{job?.benefits?.length} benefits</span>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCardClick}
          >
            View Details
          </Button>
          <Button
            variant="default"
            size="sm"
            loading={isApplying}
            onClick={handleApply}
            disabled={job?.hasApplied}
          >
            {job?.hasApplied ? 'Applied' : 'Quick Apply'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;