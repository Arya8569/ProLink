import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const CompanyProfile = ({ company }) => {
  const formatEmployeeCount = (count) => {
    if (count >= 10000) return `${Math.floor(count / 1000)}k+ employees`;
    if (count >= 1000) return `${Math.floor(count / 1000)}k employees`;
    return `${count} employees`;
  };

  const getIndustryIcon = (industry) => {
    const icons = {
      'Technology': 'Laptop',
      'Healthcare': 'Heart',
      'Finance': 'DollarSign',
      'Education': 'GraduationCap',
      'Retail': 'ShoppingBag',
      'Manufacturing': 'Settings',
      'Consulting': 'Users'
    };
    return icons?.[industry] || 'Building';
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden card-moderate">
      {/* Company Header */}
      <div className="relative h-32 bg-gradient-primary">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-4 left-6 right-6">
          <div className="flex items-end space-x-4">
            <Image
              src={company?.logo}
              alt={`${company?.name} logo`}
              className="w-16 h-16 rounded-lg border-2 border-white shadow-moderate bg-white"
            />
            <div className="flex-1 min-w-0 pb-1">
              <h3 className="text-xl font-bold text-white truncate">{company?.name}</h3>
              <p className="text-white/90 text-sm">{company?.tagline}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        {/* Company Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 text-primary mb-1">
              <Icon name="Star" size={16} className="fill-current" />
              <span className="text-lg font-bold">{company?.rating}</span>
            </div>
            <p className="text-xs text-muted-foreground">Company Rating</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 text-primary mb-1">
              <Icon name="Users" size={16} />
              <span className="text-lg font-bold">{company?.openJobs}</span>
            </div>
            <p className="text-xs text-muted-foreground">Open Positions</p>
          </div>
        </div>

        {/* Company Info */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3">
            <Icon name={getIndustryIcon(company?.industry)} size={18} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">{company?.industry}</p>
              <p className="text-xs text-muted-foreground">Industry</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Icon name="MapPin" size={18} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">{company?.headquarters}</p>
              <p className="text-xs text-muted-foreground">Headquarters</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Icon name="Building" size={18} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">{formatEmployeeCount(company?.employeeCount)}</p>
              <p className="text-xs text-muted-foreground">Company Size</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Icon name="Calendar" size={18} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">Founded {company?.founded}</p>
              <p className="text-xs text-muted-foreground">Established</p>
            </div>
          </div>
        </div>

        {/* Company Description */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-foreground mb-2">About Company</h4>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
            {company?.description}
          </p>
        </div>

        {/* Recent Reviews */}
        {company?.recentReviews && company?.recentReviews?.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-foreground mb-3">Recent Reviews</h4>
            <div className="space-y-3">
              {company?.recentReviews?.slice(0, 2)?.map((review, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)]?.map((_, i) => (
                        <Icon
                          key={i}
                          name="Star"
                          size={12}
                          className={`${i < review?.rating ? 'text-accent fill-current' : 'text-muted-foreground'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{review?.role}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{review?.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button variant="outline" fullWidth iconName="Building" iconPosition="left">
            View Company Page
          </Button>
          <Button variant="ghost" fullWidth iconName="Briefcase" iconPosition="left">
            View All Jobs ({company?.openJobs})
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;