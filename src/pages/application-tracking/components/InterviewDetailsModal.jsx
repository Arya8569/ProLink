import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const InterviewDetailsModal = ({ isOpen, onClose, interview }) => {
    if (!isOpen || !interview) return null;

    const formatDateTime = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
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
        return icons[type] || 'Calendar';
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col transform animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border bg-muted/20">
                    <div>
                        <h2 className="text-xl font-bold text-foreground">Interview Details</h2>
                        <p className="text-sm text-muted-foreground">{interview.company}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <Icon name="X" size={20} />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Basic Info */}
                    <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                            <Icon name={getInterviewTypeIcon(interview.interviewType)} size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground text-lg">{interview.position}</h3>
                            <p className="text-muted-foreground capitalize">{interview.interviewType?.replace('-', ' ')} Interview</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 py-4 border-y border-border">
                        <div className="flex items-center space-x-3 text-foreground">
                            <Icon name="Calendar" size={18} className="text-muted-foreground" />
                            <span className="font-medium">{formatDateTime(interview.interviewDate)}</span>
                        </div>
                    </div>

                    {/* Notes */}
                    {interview.notes && (
                        <div>
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recruiter Notes</h4>
                            <div className="bg-muted/30 p-4 rounded-lg border border-border italic text-foreground whitespace-pre-wrap">
                                "{interview.notes}"
                            </div>
                        </div>
                    )}

                    {/* Joining Instructions */}
                    {interview.interviewType === 'video' && interview.meetingLink && (
                        <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-accent mb-2 flex items-center">
                                <Icon name="Video" size={16} className="mr-2" />
                                Joining Instructions
                            </h4>
                            <p className="text-sm text-muted-foreground mb-4">
                                This is a video interview. Please ensure your camera and microphone are working before joining.
                            </p>
                            <Button 
                                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                                onClick={() => window.open(interview.meetingLink, '_blank')}
                            >
                                <Icon name="Video" size={18} className="mr-2" />
                                Join Meeting
                            </Button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-muted/10 border-t border-border flex justify-end">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </div>
            </div>
        </div>
    );
};

export default InterviewDetailsModal;
