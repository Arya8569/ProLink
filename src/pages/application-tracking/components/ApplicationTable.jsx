import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import StatusBadge from './StatusBadge';
import ApplicationCard from './ApplicationCard';

const ApplicationTable = ({
  applications,
  onViewDetails,
  onScheduleFollowup,
  onViewCommunication,
  sortBy,
  onSortChange,
  className = ""
}) => {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  const getSortIcon = (column) => {
    if (sortBy?.field !== column) return 'ArrowUpDown';
    return sortBy?.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const handleSort = (field) => {
    const direction = sortBy?.field === field && sortBy?.direction === 'asc' ? 'desc' : 'asc';
    onSortChange({ field, direction });
  };

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

  if (applications?.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Applications Found</h3>
        <p className="text-muted-foreground mb-4">
          You haven't applied to any jobs yet or no applications match your current filters.
        </p>
        <Button onClick={() => window.location.href = '/job-search-results'}>
          <Icon name="Search" size={16} />
          <span className="ml-2">Browse Jobs</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={`bg-card border border-border rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-foreground">
            My Applications ({applications?.length})
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className="hidden md:flex"
          >
            <Icon name="Table" size={16} />
          </Button>
          <Button
            variant={viewMode === 'cards' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className="hidden md:flex"
          >
            <Icon name="Grid3X3" size={16} />
          </Button>
        </div>
      </div>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('company')}
                  className="font-semibold text-foreground"
                >
                  Company
                  <Icon name={getSortIcon('company')} size={14} className="ml-1" />
                </Button>
              </th>
              <th className="text-left p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('position')}
                  className="font-semibold text-foreground"
                >
                  Position
                  <Icon name={getSortIcon('position')} size={14} className="ml-1" />
                </Button>
              </th>
              <th className="text-left p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('appliedDate')}
                  className="font-semibold text-foreground"
                >
                  Applied Date
                  <Icon name={getSortIcon('appliedDate')} size={14} className="ml-1" />
                </Button>
              </th>
              <th className="text-left p-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('status')}
                  className="font-semibold text-foreground"
                >
                  Status
                  <Icon name={getSortIcon('status')} size={14} className="ml-1" />
                </Button>
              </th>
              <th className="text-left p-4 font-semibold text-foreground">Next Action</th>
              <th className="text-right p-4 font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications?.map((application) => (
              <tr key={application?.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-sm font-semibold text-foreground">
                        {application?.company?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{application?.company}</p>
                      <p className="text-sm text-muted-foreground">{application?.location}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="font-medium text-foreground">{application?.position}</p>
                  <p className="text-sm text-muted-foreground">{application?.department}</p>
                </td>
                <td className="p-4">
                  <p className="text-sm text-foreground">{formatDate(application?.appliedDate)}</p>
                </td>
                <td className="p-4">
                  <StatusBadge status={application?.status} />
                </td>
                <td className="p-4">
                  <p className="text-sm text-muted-foreground">{getNextAction(application?.status)}</p>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(application?.id)}
                    >
                      <Icon name="Eye" size={14} />
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4 p-4">
        {applications?.map((application) => (
          <ApplicationCard
            key={application?.id}
            application={application}
            onViewDetails={onViewDetails}
            onScheduleFollowup={onScheduleFollowup}
            onViewCommunication={onViewCommunication}
          />
        ))}
      </div>
    </div>
  );
};

export default ApplicationTable;