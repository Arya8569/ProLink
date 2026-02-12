import React from 'react';
import Icon from '../../../components/AppIcon';

const SkillsMatch = ({ jobSkills, userSkills = [], matchPercentage = 0 }) => {
  const getSkillStatus = (skill) => {
    const userSkill = userSkills?.find(us => us?.name?.toLowerCase() === skill?.toLowerCase());
    if (userSkill) {
      return {
        status: 'matched',
        level: userSkill?.level || 'intermediate',
        icon: 'CheckCircle',
        color: 'text-success'
      };
    }
    return {
      status: 'missing',
      level: null,
      icon: 'Circle',
      color: 'text-muted-foreground'
    };
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return 'text-success';
    if (percentage >= 60) return 'text-accent';
    if (percentage >= 40) return 'text-warning';
    return 'text-error';
  };

  const getMatchBackground = (percentage) => {
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 60) return 'bg-accent';
    if (percentage >= 40) return 'bg-warning';
    return 'bg-error';
  };

  const getLevelColor = (level) => {
    const colors = {
      'beginner': 'bg-warning/10 text-warning border-warning/20',
      'intermediate': 'bg-primary/10 text-primary border-primary/20',
      'advanced': 'bg-success/10 text-success border-success/20',
      'expert': 'bg-secondary/10 text-secondary border-secondary/20'
    };
    return colors?.[level] || colors?.intermediate;
  };

  const matchedSkills = jobSkills?.filter(skill => 
    userSkills?.some(us => us?.name?.toLowerCase() === skill?.toLowerCase())
  );

  const missingSkills = jobSkills?.filter(skill => 
    !userSkills?.some(us => us?.name?.toLowerCase() === skill?.toLowerCase())
  );

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden card-moderate">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
            <Icon name="Target" size={20} className="text-primary" />
            <span>Skills Match</span>
          </h3>
          <div className={`text-2xl font-bold ${getMatchColor(matchPercentage)}`}>
            {matchPercentage}%
          </div>
        </div>
      </div>
      <div className="p-6">
        {/* Match Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Overall Match</span>
            <span className="text-sm text-muted-foreground">
              {matchedSkills?.length} of {jobSkills?.length} skills
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${getMatchBackground(matchPercentage)}`}
              style={{ width: `${matchPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Matched Skills */}
        {matchedSkills?.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} className="text-success" />
              <span>Matched Skills ({matchedSkills?.length})</span>
            </h4>
            <div className="space-y-2">
              {matchedSkills?.map((skill, index) => {
                const skillInfo = getSkillStatus(skill);
                const userSkill = userSkills?.find(us => us?.name?.toLowerCase() === skill?.toLowerCase());
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-success/5 border border-success/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon name={skillInfo?.icon} size={16} className={skillInfo?.color} />
                      <span className="text-sm font-medium text-foreground">{skill}</span>
                    </div>
                    {userSkill && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getLevelColor(userSkill?.level)}`}>
                        {userSkill?.level}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Missing Skills */}
        {missingSkills?.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center space-x-2">
              <Icon name="Circle" size={16} className="text-muted-foreground" />
              <span>Skills to Develop ({missingSkills?.length})</span>
            </h4>
            <div className="space-y-2">
              {missingSkills?.map((skill, index) => {
                const skillInfo = getSkillStatus(skill);
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon name={skillInfo?.icon} size={16} className={skillInfo?.color} />
                      <span className="text-sm text-muted-foreground">{skill}</span>
                    </div>
                    <button className="text-xs text-primary hover:text-primary/80 font-medium">
                      Learn
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Match Insights */}
        <div className="p-4 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-semibold text-foreground mb-2">Match Insights</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            {matchPercentage >= 80 && (
              <p className="flex items-center space-x-2">
                <Icon name="ThumbsUp" size={14} className="text-success" />
                <span>Excellent match! You have most required skills.</span>
              </p>
            )}
            {matchPercentage >= 60 && matchPercentage < 80 && (
              <p className="flex items-center space-x-2">
                <Icon name="Target" size={14} className="text-accent" />
                <span>Good match! Consider highlighting your relevant experience.</span>
              </p>
            )}
            {matchPercentage >= 40 && matchPercentage < 60 && (
              <p className="flex items-center space-x-2">
                <Icon name="AlertTriangle" size={14} className="text-warning" />
                <span>Partial match. Focus on transferable skills in your application.</span>
              </p>
            )}
            {matchPercentage < 40 && (
              <p className="flex items-center space-x-2">
                <Icon name="Info" size={14} className="text-error" />
                <span>Consider developing missing skills before applying.</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsMatch;