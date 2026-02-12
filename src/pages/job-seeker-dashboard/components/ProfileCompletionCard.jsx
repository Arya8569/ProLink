import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProfileCompletionCard = ({ 
  completionScore = 65, 
  missingItems = [], 
  achievements = [],
  onUpdateProfile = () => {} 
}) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-accent';
    return 'text-warning';
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return 'bg-success';
    if (score >= 60) return 'bg-accent';
    return 'bg-warning';
  };

  const getMissingItemIcon = (item) => {
    switch (item?.type) {
      case 'photo':
        return 'Camera';
      case 'resume':
        return 'FileText';
      case 'skills':
        return 'Code';
      case 'experience':
        return 'Briefcase';
      case 'education':
        return 'GraduationCap';
      case 'portfolio':
        return 'Globe';
      default:
        return 'Plus';
    }
  };

  const getBadgeIcon = (type) => {
    switch (type) {
      case 'profile_complete':
        return 'CheckCircle';
      case 'first_application':
        return 'Send';
      case 'skill_verified':
        return 'Award';
      case 'interview_ready':
        return 'Calendar';
      default:
        return 'Star';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-subtle">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Profile Strength</h3>
        <Button variant="ghost" size="sm" onClick={onUpdateProfile}>
          <Icon name="Edit" size={16} />
        </Button>
      </div>
      {/* Completion Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Completion Score</span>
          <span className={`text-lg font-bold ${getScoreColor(completionScore)}`}>
            {completionScore}%
          </span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${getScoreBackground(completionScore)}`}
            style={{ width: `${completionScore}%` }}
          ></div>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          {completionScore >= 80 
            ? "Excellent! Your profile stands out to recruiters"
            : completionScore >= 60
            ? "Good progress! A few more details will boost your visibility" :"Complete your profile to attract more opportunities"
          }
        </p>
      </div>
      {/* Missing Items */}
      {missingItems?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-foreground mb-3">Complete Your Profile</h4>
          <div className="space-y-2">
            {missingItems?.slice(0, 3)?.map((item) => (
              <div key={item?.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                    <Icon name={getMissingItemIcon(item)} size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item?.title}</p>
                    <p className="text-xs text-muted-foreground">{item?.description}</p>
                  </div>
                </div>
                <div className="text-xs text-accent font-medium">+{item?.points}pts</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Achievements */}
      {achievements?.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Recent Achievements</h4>
          <div className="flex flex-wrap gap-2">
            {achievements?.slice(0, 4)?.map((achievement) => (
              <div key={achievement?.id} className="flex items-center space-x-1 px-2 py-1 bg-success/10 text-success rounded-full border border-success/20">
                <Icon name={getBadgeIcon(achievement?.type)} size={12} />
                <span className="text-xs font-medium">{achievement?.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Action Button */}
      <Button 
        variant="outline" 
        className="w-full"
        onClick={onUpdateProfile}
      >
        <Icon name="User" size={16} />
        <span className="ml-2">Update Profile</span>
      </Button>
    </div>
  );
};

export default ProfileCompletionCard;