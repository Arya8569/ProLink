import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SkillAnalysisCard = ({ 
  skillGaps = [], 
  recommendations = [], 
  onViewCourses = () => {},
  onStartLearning = () => {} 
}) => {
  const getSkillLevelColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'intermediate':
        return 'text-accent bg-accent/10 border-accent/20';
      case 'advanced':
        return 'text-success bg-success/10 border-success/20';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getSkillIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'programming':
        return 'Code';
      case 'design':
        return 'Palette';
      case 'marketing':
        return 'TrendingUp';
      case 'data':
        return 'BarChart3';
      case 'management':
        return 'Users';
      default:
        return 'BookOpen';
    }
  };

  const getDemandLevel = (demand) => {
    if (demand >= 80) return { label: 'High Demand', color: 'text-success' };
    if (demand >= 60) return { label: 'Medium Demand', color: 'text-accent' };
    return { label: 'Low Demand', color: 'text-warning' };
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-subtle">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Skill Gap Analysis</h3>
        <Button variant="ghost" size="sm" onClick={onViewCourses}>
          <Icon name="BookOpen" size={16} />
          <span className="ml-1">Courses</span>
        </Button>
      </div>
      {/* Skill Gaps */}
      {skillGaps?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-foreground mb-3">Skills to Develop</h4>
          <div className="space-y-3">
            {skillGaps?.slice(0, 3)?.map((skill) => {
              const demand = getDemandLevel(skill?.marketDemand);
              return (
                <div key={skill?.id} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                        <Icon name={getSkillIcon(skill?.category)} size={16} />
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-foreground">{skill?.name}</h5>
                        <p className="text-xs text-muted-foreground">{skill?.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-medium ${demand?.color}`}>
                        {demand?.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {skill?.jobsRequiring}+ jobs
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-muted rounded-full h-1.5">
                        <div 
                          className="h-1.5 bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${skill?.currentLevel || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {skill?.currentLevel || 0}%
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onStartLearning(skill?.id)}
                    >
                      <Icon name="Play" size={12} />
                      <span className="ml-1 text-xs">Learn</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Learning Recommendations */}
      {recommendations?.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Recommended Courses</h4>
          <div className="space-y-2">
            {recommendations?.slice(0, 2)?.map((course) => (
              <div key={course?.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-accent/10 text-accent rounded-lg flex items-center justify-center">
                    <Icon name="GraduationCap" size={16} />
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-foreground">{course?.title}</h5>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{course?.duration}</span>
                      <span>•</span>
                      <span>{course?.provider}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Icon name="Star" size={10} className="text-accent" />
                        <span>{course?.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    {course?.price === 0 ? 'Free' : `$${course?.price}`}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full border ${getSkillLevelColor(course?.level)}`}>
                    {course?.level}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Empty State */}
      {skillGaps?.length === 0 && recommendations?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="TrendingUp" size={32} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No skill gaps identified</p>
          <p className="text-xs text-muted-foreground">Complete your profile to get personalized skill recommendations</p>
        </div>
      )}
      {/* Action Button */}
      <Button 
        variant="outline" 
        className="w-full"
        onClick={onViewCourses}
      >
        <Icon name="BookOpen" size={16} />
        <span className="ml-2">Explore Learning Paths</span>
      </Button>
    </div>
  );
};

export default SkillAnalysisCard;