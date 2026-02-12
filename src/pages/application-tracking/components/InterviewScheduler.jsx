import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const InterviewScheduler = ({ 
  applications, 
  onScheduleInterview,
  onJoinInterview,
  className = "" 
}) => {
  const [selectedApplication, setSelectedApplication] = useState('');
  const [interviewType, setInterviewType] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [notes, setNotes] = useState('');

  // Get applications that can have interviews scheduled
  const eligibleApplications = applications?.filter(app => 
    ['shortlisted', 'interview-scheduled']?.includes(app?.status)
  );

  // Get upcoming interviews
  const upcomingInterviews = applications?.filter(app => 
    app?.status === 'interview-scheduled' && app?.interviewDate
  )?.map(app => ({
    ...app,
    interviewDate: new Date(app.interviewDate),
    isToday: new Date(app.interviewDate)?.toDateString() === new Date()?.toDateString(),
    isUpcoming: new Date(app.interviewDate) > new Date()
  }))?.sort((a, b) => a?.interviewDate - b?.interviewDate);

  const applicationOptions = eligibleApplications?.map(app => ({
    value: app?.id,
    label: `${app?.position} at ${app?.company}`
  }));

  const interviewTypeOptions = [
    { value: 'phone', label: 'Phone Interview' },
    { value: 'video', label: 'Video Interview' },
    { value: 'in-person', label: 'In-Person Interview' },
    { value: 'technical', label: 'Technical Interview' },
    { value: 'panel', label: 'Panel Interview' }
  ];

  const handleSchedule = (e) => {
    e?.preventDefault();
    if (!selectedApplication || !interviewType || !scheduledDate || !scheduledTime) {
      return;
    }

    const interviewData = {
      applicationId: selectedApplication,
      type: interviewType,
      date: scheduledDate,
      time: scheduledTime,
      notes: notes
    };

    onScheduleInterview(interviewData);
    
    // Reset form
    setSelectedApplication('');
    setInterviewType('');
    setScheduledDate('');
    setScheduledTime('');
    setNotes('');
  };

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
      {upcomingInterviews?.length > 0 && (
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
                      onClick={() => onJoinInterview(interview?.id)}
                      className="bg-success text-success-foreground hover:bg-success/90"
                    >
                      <Icon name="Video" size={14} />
                      <span className="ml-1">Join</span>
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/calendar?interview=${interview?.id}`, '_blank')}
                  >
                    <Icon name="ExternalLink" size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Schedule New Interview */}
      {eligibleApplications?.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Icon name="Plus" size={20} className="mr-2" />
            Schedule Interview
          </h3>
          
          <form onSubmit={handleSchedule} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Application"
                placeholder="Select application"
                options={applicationOptions}
                value={selectedApplication}
                onChange={setSelectedApplication}
                required
              />
              
              <Select
                label="Interview Type"
                placeholder="Select type"
                options={interviewTypeOptions}
                value={interviewType}
                onChange={setInterviewType}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e?.target?.value)}
                min={new Date()?.toISOString()?.split('T')?.[0]}
                required
              />
              
              <Input
                label="Time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e?.target?.value)}
                required
              />
            </div>
            
            <Input
              label="Notes (Optional)"
              type="text"
              placeholder="Add any additional notes or instructions..."
              value={notes}
              onChange={(e) => setNotes(e?.target?.value)}
            />
            
            <div className="flex items-center space-x-4 pt-4">
              <Button type="submit">
                <Icon name="Calendar" size={16} />
                <span className="ml-2">Schedule Interview</span>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSelectedApplication('');
                  setInterviewType('');
                  setScheduledDate('');
                  setScheduledTime('');
                  setNotes('');
                }}
              >
                Clear Form
              </Button>
            </div>
          </form>
        </div>
      )}
      {/* No Eligible Applications */}
      {eligibleApplications?.length === 0 && upcomingInterviews?.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Interviews to Schedule</h3>
          <p className="text-muted-foreground">
            You don't have any applications that are ready for interview scheduling.
          </p>
        </div>
      )}
    </div>
  );
};

export default InterviewScheduler;