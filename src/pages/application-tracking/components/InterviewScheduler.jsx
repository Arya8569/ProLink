import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

import InterviewDetailsModal from './InterviewDetailsModal';

const InterviewScheduler = ({ 
  applications, 
  interviews = [],
  onScheduleInterview,
  onJoinInterview,
  className = "" 
}) => {
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get upcoming interviews from the new prop
  const upcomingInterviews = interviews?.map(app => ({
    ...app,
    interviewDate: new Date(app.interviewDate),
    isToday: new Date(app.interviewDate)?.toDateString() === new Date()?.toDateString(),
    isUpcoming: new Date(app.interviewDate) > new Date()
  }))?.sort((a, b) => a?.interviewDate - b?.interviewDate);

  const formatInterviewDateTime = (date) => {
    return new Date(date)?.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInterviewTypeIcon = (type) => {
    const icons = {
      'phone': 'Phone',
      'video': 'Video',
      'in-person': 'MapPin',
      'technical': 'Code',
      'panel': 'Users'
    };
    return icons?.[type] || 'Calendar';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upcoming Interviews */}
      {upcomingInterviews?.length > 0 ? (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Icon name="Calendar" size={20} className="mr-2" />
            Upcoming Interviews ({upcomingInterviews?.length})
          </h3>
          
          <div className="space-y-4">
            {upcomingInterviews?.map((interview) => (
              <div 
                key={interview?.id} 
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  interview?.isToday 
                    ? 'border-accent bg-accent/5' :'border-border bg-muted/30'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    interview?.isToday ? 'bg-accent text-accent-foreground' : 'bg-muted'
                  }`}>
                    <Icon name={getInterviewTypeIcon(interview?.interviewType)} size={20} />
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-foreground">{interview?.position}</h4>
                    <p className="text-sm text-muted-foreground">{interview?.company}</p>
                    <p className="text-sm text-foreground">
                      {formatInterviewDateTime(interview?.interviewDate)}
                    </p>
                    {interview?.interviewType && (
                      <p className="text-xs text-muted-foreground capitalize">
                        {interview?.interviewType?.replace('-', ' ')} Interview
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {interview?.isToday && (
                    <span className="bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium">
                      Today
                    </span>
                  )}
                  
                  {interview?.interviewType === 'video' && interview?.meetingLink && (
                    <Button
                      size="sm"
                      onClick={() => interview.meetingLink && window.open(interview.meetingLink, '_blank')}
                      className="bg-success text-success-foreground hover:bg-success/90"
                    >
                      <Icon name="Video" size={14} />
                      <span className="ml-1">Join</span>
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        setSelectedDetails(interview);
                        setIsModalOpen(true);
                    }}
                  >
                    <Icon name="ExternalLink" size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Calendar" size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No Upcoming Interviews</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            You don't have any interviews scheduled at the moment. When a recruiter schedules one, it will appear here.
          </p>
          <div className="mt-6 flex justify-center">
            <Button variant="outline" onClick={() => window.location.href='/dashboard'}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      )}

      <InterviewDetailsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        interview={selectedDetails} 
      />
    </div>
  );
};

export default InterviewScheduler;