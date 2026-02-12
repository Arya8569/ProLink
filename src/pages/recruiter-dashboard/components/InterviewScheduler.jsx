import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const InterviewScheduler = ({ upcomingInterviews, onScheduleInterview, onRescheduleInterview, onCancelInterview }) => {
  const [selectedView, setSelectedView] = useState('today');

  const viewOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  const getInterviewTypeColor = (type) => {
    switch (type) {
      case 'phone':
        return 'bg-blue-100 text-blue-800';
      case 'video':
        return 'bg-purple-100 text-purple-800';
      case 'in-person':
        return 'bg-green-100 text-green-800';
      case 'technical':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getInterviewTypeIcon = (type) => {
    switch (type) {
      case 'phone':
        return 'Phone';
      case 'video':
        return 'Video';
      case 'in-person':
        return 'MapPin';
      case 'technical':
        return 'Code';
      default:
        return 'Calendar';
    }
  };

  const formatTime = (dateTime) => {
    return new Date(dateTime)?.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateTime) => {
    return new Date(dateTime)?.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-success';
      case 'pending':
        return 'text-warning';
      case 'cancelled':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Interview Schedule</h2>
        <div className="flex items-center space-x-3">
          <Select
            options={viewOptions}
            value={selectedView}
            onChange={setSelectedView}
            className="w-32"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => onScheduleInterview()}
          >
            <Icon name="Plus" size={16} />
            <span className="ml-1">Schedule</span>
          </Button>
        </div>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {upcomingInterviews?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Icon name="Calendar" size={32} className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              No interviews scheduled
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => onScheduleInterview()}
            >
              Schedule Interview
            </Button>
          </div>
        ) : (
          upcomingInterviews?.map((interview) => (
            <div
              key={interview?.id}
              className="flex items-start space-x-4 p-4 border border-border rounded-lg hover:shadow-moderate transition-smooth"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {interview?.candidate?.name?.charAt(0)}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-foreground">{interview?.candidate?.name}</h4>
                    <p className="text-sm text-muted-foreground">{interview?.position}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getInterviewTypeColor(interview?.type)}`}>
                      <Icon name={getInterviewTypeIcon(interview?.type)} size={12} className="inline mr-1" />
                      {interview?.type?.charAt(0)?.toUpperCase() + interview?.type?.slice(1)}
                    </div>
                    <div className={`text-xs font-medium ${getStatusColor(interview?.status)}`}>
                      {interview?.status?.charAt(0)?.toUpperCase() + interview?.status?.slice(1)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center space-x-1">
                    <Icon name="Calendar" size={14} />
                    <span>{formatDate(interview?.dateTime)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Clock" size={14} />
                    <span>{formatTime(interview?.dateTime)} ({interview?.duration})</span>
                  </div>
                  {interview?.interviewer && (
                    <div className="flex items-center space-x-1">
                      <Icon name="User" size={14} />
                      <span>{interview?.interviewer}</span>
                    </div>
                  )}
                </div>

                {interview?.notes && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {interview?.notes}
                  </p>
                )}

                <div className="flex items-center space-x-2">
                  {interview?.meetingLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(interview?.meetingLink, '_blank')}
                    >
                      <Icon name="ExternalLink" size={14} />
                      <span className="ml-1">Join Meeting</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRescheduleInterview(interview?.id)}
                  >
                    <Icon name="Calendar" size={14} />
                    <span className="ml-1">Reschedule</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCancelInterview(interview?.id)}
                  >
                    <Icon name="X" size={14} />
                    <span className="ml-1">Cancel</span>
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {upcomingInterviews?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full">
            View all interviews
          </Button>
        </div>
      )}
    </div>
  );
};

export default InterviewScheduler;