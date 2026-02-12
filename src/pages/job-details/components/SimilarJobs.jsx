import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const SimilarJobs = ({ jobs, currentJobId }) => {
  const formatSalary = (min, max) => {
    if (!min && !max) return 'Salary not disclosed';
    if (min && max) return `$${min?.toLocaleString()} - $${max?.toLocaleString()}`;
    if (min) return `$${min?.toLocaleString()}+`;
    return `Up to $${max?.toLocaleString()}`;
  };

  const getJobTypeColor = (type) => {
    const colors = {
      'full-time': 'bg-success/10 text-success',
      'part-time': 'bg-accent/10 text-accent',
      'contract': 'bg-secondary/10 text-secondary',
      'freelance': 'bg-primary/10 text-primary',
      'internship': 'bg-warning/10 text-warning'
    };
    return colors?.[type] || 'bg-muted text-muted-foreground';
  };

  const getMatchScore = (score) => {
    if (score >= 90) return { color: 'text-success', bg: 'bg-success/10', label: 'Excellent' };
    if (score >= 80) return { color: 'text-accent', bg: 'bg-accent/10', label: 'Great' };
    if (score >= 70) return { color: 'text-primary', bg: 'bg-primary/10', label: 'Good' };
    return { color: 'text-warning', bg: 'bg-warning/10', label: 'Fair' };
  };

  const filteredJobs = jobs?.filter(job => job?.id !== currentJobId);

  if (filteredJobs?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 card-moderate">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
          <Icon name="Briefcase" size={20} className="text-primary" />
          <span>Similar Jobs</span>
        </h3>
        <div className="text-center py-8">
          <Icon name="Search" size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No similar jobs found at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden card-moderate">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Icon name="Briefcase" size={20} className="text-primary" />
          <span>Similar Jobs</span>
          <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
            {filteredJobs?.length}
          </span>
        </h3>
      </div>
      <div className="divide-y divide-border max-h-96 overflow-y-auto">
        {filteredJobs?.slice(0, 5)?.map((job) => {
          const matchInfo = getMatchScore(job?.matchScore || 75);
          
          return (
            <div key={job?.id} className="p-4 hover:bg-muted/30 transition-smooth">
              <div className="flex items-start space-x-3">
                {/* Company Logo */}
                <Image
                  src={job?.company?.logo}
                  alt={`${job?.company?.name} logo`}
                  className="w-10 h-10 rounded-lg object-cover border border-border flex-shrink-0"
                />

                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/job-details?id=${job?.id}`}
                        className="text-sm font-semibold text-foreground hover:text-primary transition-smooth line-clamp-1"
                      >
                        {job?.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">{job?.company?.name}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${matchInfo?.bg} ${matchInfo?.color} flex-shrink-0 ml-2`}>
                      {job?.matchScore || 75}% match
                    </div>
                  </div>

                  {/* Job Meta */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
                    <div className="flex items-center space-x-1">
                      <Icon name="MapPin" size={12} />
                      <span>{job?.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Clock" size={12} />
                      <span>{job?.postedDate}</span>
                    </div>
                  </div>

                  {/* Job Type and Salary */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job?.type)}`}>
                        {job?.type?.charAt(0)?.toUpperCase() + job?.type?.slice(1)}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-foreground">
                      {formatSalary(job?.salary?.min, job?.salary?.max)}
                    </div>
                  </div>

                  {/* Skills Preview */}
                  {job?.skills && job?.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job?.skills?.slice(0, 3)?.map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                      {job?.skills?.length > 3 && (
                        <span className="text-xs text-muted-foreground px-1">
                          +{job?.skills?.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {/* Quick Actions */}
              <div className="flex items-center space-x-2 mt-3">
                <Link to={`/job-details?id=${job?.id}`} className="flex-1">
                  <Button variant="outline" size="sm" fullWidth>
                    View Details
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" iconName="Bookmark">
                  <span className="sr-only">Save job</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {/* View More */}
      {filteredJobs?.length > 5 && (
        <div className="p-4 border-t border-border">
          <Link to="/job-search-results">
            <Button variant="ghost" fullWidth iconName="ArrowRight" iconPosition="right">
              View All Similar Jobs ({filteredJobs?.length})
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default SimilarJobs;