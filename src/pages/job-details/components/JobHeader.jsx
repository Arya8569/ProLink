import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const JobHeader = ({ job, onApply, onSave, isSaved = false, isApplied = false }) => {
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary not disclosed';
    if (min && max) return `$${min?.toLocaleString()} - $${max?.toLocaleString()}`;
    if (min) return `$${min?.toLocaleString()}+`;
    return `Up to $${max?.toLocaleString()}`;
  };

  const getJobTypeColor = (type) => {
    const colors = {
      'full-time': 'bg-success/10 text-success border-success/20',
      'part-time': 'bg-accent/10 text-accent border-accent/20',
      'contract': 'bg-secondary/10 text-secondary border-secondary/20',
      'freelance': 'bg-primary/10 text-primary border-primary/20',
      'internship': 'bg-warning/10 text-warning border-warning/20'
    };
    return colors?.[type] || 'bg-muted text-muted-foreground border-border';
  };

  const getUrgencyBadge = (urgency) => {
    if (urgency === 'urgent') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-1 bg-error/10 text-error border border-error/20 rounded-md text-xs font-medium">
          <Icon name="Zap" size={12} />
          <span>Urgent Hiring</span>
        </span>
      );
    }
    if (urgency === 'hot') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-1 bg-accent/10 text-accent border border-accent/20 rounded-md text-xs font-medium">
          <Icon name="TrendingUp" size={12} />
          <span>Hot Job</span>
        </span>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-moderate">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        {/* Left Section - Job Info */}
        <div className="flex-1">
          <div className="flex items-start space-x-4">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              <Image
                src={job?.company?.logo}
                alt={`${job?.company?.name} logo`}
                className="w-16 h-16 rounded-lg object-cover border border-border"
              />
            </div>

            {/* Job Details */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{job?.title}</h1>
                {getUrgencyBadge(job?.urgency)}
              </div>

              <div className="flex items-center space-x-2 mb-3">
                <h2 className="text-lg font-semibold text-primary hover:text-primary/80 cursor-pointer">
                  {job?.company?.name}
                </h2>
                <div className="flex items-center space-x-1">
                  <Icon name="Star" size={16} className="text-accent fill-current" />
                  <span className="text-sm text-muted-foreground">
                    {job?.company?.rating} ({job?.company?.reviewCount} reviews)
                  </span>
                </div>
              </div>

              {/* Job Meta Information */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center space-x-1">
                  <Icon name="MapPin" size={16} />
                  <span>{job?.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Clock" size={16} />
                  <span>{job?.workType}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Calendar" size={16} />
                  <span>Posted {job?.postedDate}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Users" size={16} />
                  <span>{job?.applicantCount} applicants</span>
                </div>
              </div>

              {/* Job Type and Salary */}
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getJobTypeColor(job?.type)}`}>
                  {job?.type?.charAt(0)?.toUpperCase() + job?.type?.slice(1)}
                </span>
                <div className="flex items-center space-x-1 text-lg font-semibold text-foreground">
                  <Icon name="DollarSign" size={18} />
                  <span>{formatSalary(job?.salary?.min, job?.salary?.max)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:w-48">
          <Button
            variant={isApplied ? "outline" : "default"}
            size="lg"
            fullWidth
            onClick={onApply}
            disabled={isApplied}
            iconName={isApplied ? "Check" : "Send"}
            iconPosition="left"
          >
            {isApplied ? "Applied" : "Apply Now"}
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={onSave}
              iconName={isSaved ? "BookmarkCheck" : "Bookmark"}
              iconPosition="left"
              className="flex-1"
            >
              {isSaved ? "Saved" : "Save"}
            </Button>

            <Button
              variant="outline"
              size="lg"
              iconName="Share2"
            >
              <span className="sr-only">Share job</span>
            </Button>
          </div>
        </div>
      </div>
      {/* Skills Tags */}
      {job?.skills && job?.skills?.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex flex-wrap gap-2">
            {job?.skills?.slice(0, 8)?.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm font-medium hover:bg-primary/10 hover:text-primary transition-smooth cursor-pointer"
              >
                {skill}
              </span>
            ))}
            {job?.skills?.length > 8 && (
              <span className="px-3 py-1 text-muted-foreground text-sm">
                +{job?.skills?.length - 8} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobHeader;