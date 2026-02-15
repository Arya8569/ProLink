import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CandidateDetailsModal = ({ isOpen, onClose, candidate, onScheduleInterview, onReject }) => {
    if (!isOpen || !candidate) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold border border-primary/20">
                            {candidate.name?.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">{candidate.name}</h2>
                            <p className="text-muted-foreground">{candidate.position}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${candidate.matchScore >= 90 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                        candidate.matchScore >= 70 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                    {candidate.matchScore}% Match
                                </span>
                                {candidate.priority === 'high' && (
                                    <span className="flex items-center gap-1 text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                        <Icon name="Star" size={12} className="fill-current" />
                                        High Priority
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <Icon name="X" size={20} />
                    </button>
                </div>

                {/* content */}
                <div className="p-6 space-y-6">

                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                            <div className="p-2 bg-background rounded-full text-primary shadow-sm">
                                <Icon name="Mail" size={16} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Email</p>
                                <p className="text-sm font-medium text-foreground">{candidate.email || 'No email provided'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                            <div className="p-2 bg-background rounded-full text-primary shadow-sm">
                                <Icon name="Phone" size={16} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Phone</p>
                                <p className="text-sm font-medium text-foreground">{candidate.phone || 'No phone provided'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                <Icon name="Briefcase" size={16} className="text-primary" />
                                Experience
                            </h3>
                            <p className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg border border-border/50 leading-relaxed">
                                {candidate.experience || 'No experience details available.'}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                <Icon name="FileText" size={16} className="text-primary" />
                                Resume / CV
                            </h3>
                            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/20 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition-colors">
                                        <Icon name="FileText" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Resume.pdf</p>
                                        <p className="text-xs text-muted-foreground">Added on {candidate.lastActivity || 'recently'}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-primary">
                                    <Icon name="Download" size={16} className="mr-2" />
                                    Download
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-end gap-3">
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                        Close
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            onReject(candidate);
                            onClose();
                        }}
                        className="w-full sm:w-auto"
                    >
                        Reject Candidate
                    </Button>
                    <Button
                        onClick={() => {
                            onScheduleInterview(candidate);
                            onClose();
                        }}
                        className="w-full sm:w-auto"
                    >
                        Schedule Interview
                    </Button>
                </div>

            </div>
        </div>
    );
};

export default CandidateDetailsModal;
