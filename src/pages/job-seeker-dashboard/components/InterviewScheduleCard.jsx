import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const InterviewScheduleCard = ({ interviews = [], onViewCalendar = () => {}, onJoinInterview = () => {} }) => {
  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date)?.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getInterviewTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'video':
        return 'Video';
      case 'phone':
        return 'Phone';
      case 'in-person':
        return 'MapPin';
      default:
        return 'Calendar';
    }
  };

  const getInterviewTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'video':
        return 'text-primary bg-primary/10 border-primary/20';
      case 'phone':
        return 'text-accent bg-accent/10 border-accent/20';
      case 'in-person':
        return 'text-secondary bg-secondary/10 border-secondary/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const isUpcoming = (date) => {
    return new Date(date) > new Date();
  };

  const isToday = (date) => {
    const today = new Date();
    const interviewDate = new Date(date);
    return today?.toDateString() === interviewDate?.toDateString();
  };

  const upcomingInterviews = interviews?.filter(interview => isUpcoming(interview?.scheduledAt));

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-subtle">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Upcoming Interviews</h3>
        <Button variant="ghost" size="sm" onClick={onViewCalendar}>
          <Icon name="Calendar" size={16} />
          <span className="ml-1">Calendar</span>
        </Button>
      </div>
      <div className="space-y-4">
        {upcomingInterviews?.slice(0, 3)?.map((interview) => (
          <div key={interview?.id} className={`p-4 rounded-lg border transition-smooth ${
            isToday(interview?.scheduledAt) 
              ? 'bg-accent/5 border-accent/20' :'bg-muted/30 border-border hover:bg-muted/50'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3 flex-1">
                <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center border border-border flex-shrink-0">
                  <span className="text-xs font-semibold text-foreground">
                    {interview?.company?.charAt(0)}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground mb-1">{interview?.position}</h4>
                  <p className="text-sm text-muted-foreground mb-1">{interview?.company}</p>
                  <p className="text-xs text-muted-foreground">{interview?.interviewer}</p>
                </div>
              </div>

              {isToday(interview?.scheduledAt) && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-accent text-accent-foreground rounded-full text-xs font-medium">
                  <Icon name="Clock" size={12} />
                  <span>Today</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Icon name="Calendar" size={14} />
                  <span>{formatDate(interview?.scheduledAt)}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Icon name="Clock" size={14} />
                  <span>{formatTime(interview?.scheduledAt)}</span>
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getInterviewTypeColor(interview?.type)}`}>
                  <Icon name={getInterviewTypeIcon(interview?.type)} size={12} />
                  <span className="capitalize">{interview?.type}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {interview?.type === 'video' && interview?.meetingLink && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onJoinInterview(interview?.id)}
                  >
                    <Icon name="Video" size={14} />
                    <span className="ml-1">Join</span>
                  </Button>
                )}
                <Button variant="ghost" size="sm">
                  <Icon name="MoreHorizontal" size={14} />
                </Button>
              </div>
            </div>

            {interview?.notes && (
              <div className="mt-3 p-2 bg-background rounded border border-border">
                <p className="text-xs text-muted-foreground">{interview?.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      {upcomingInterviews?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Calendar" size={32} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No upcoming interviews</p>
          <p className="text-xs text-muted-foreground">Your scheduled interviews will appear here</p>
        </div>
      )}
      {upcomingInterviews?.length > 3 && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full" onClick={onViewCalendar}>
            View {upcomingInterviews?.length - 3} more interviews
            <Icon name="ArrowRight" size={14} className="ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default InterviewScheduleCard;