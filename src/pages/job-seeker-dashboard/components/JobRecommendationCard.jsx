import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

// Utility function for Indian Currency (Lakh/Crore)
const formatIndianCurrency = (amount) => {
  if (amount === null || amount === undefined || amount === 0) return 'N/A';
  amount = Number(amount);
  
  if (amount >= 10000000) { 
    return `₹${(amount / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  } else if (amount >= 100000) { 
    return `₹${(amount / 100000).toFixed(2).replace(/\.00$/, '')} L`;
  } else if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
};

const JobRecommendationCard = ({ recommendations = [], onSearch = () => {}, onApplyQuick = () => {} }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState([]);

  const filterChips = [
    { id: 'remote', label: 'Remote', icon: 'Home' },
    { id: 'high-salary', label: '₹15L+', icon: 'DollarSign' },
    { id: 'tech', label: 'Technology', icon: 'Code' },
    { id: 'startup', label: 'Startup', icon: 'Zap' }
  ];

  const handleFilterToggle = (filterId) => {
    setActiveFilters(prev => 
      prev?.includes(filterId) 
        ? prev?.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    onSearch(searchQuery, activeFilters);
  };

  const formatSalary = (min, max) => {
    if (min && max) {
      // Use the utility function for display
      return `${formatIndianCurrency(min)} - ${formatIndianCurrency(max)}`;
    }
    return 'Competitive';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-subtle">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">AI Job Recommendations</h3>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search jobs, companies, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e?.target?.value)}
              className="pl-10 pr-4"
            />
          </div>
        </form>

        {/* Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {filterChips?.map((filter) => (
            <button
              key={filter?.id}
              onClick={() => handleFilterToggle(filter?.id)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-smooth border ${
                activeFilters?.includes(filter?.id)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              <Icon name={filter?.icon} size={12} />
              <span>{filter?.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Recommendations */}
      <div className="space-y-4">
        {recommendations?.slice(0, 3)?.map((job) => (
          <div key={job?.id} className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-smooth">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3 flex-1">
                <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center border border-border flex-shrink-0">
                  <span className="text-xs font-semibold text-foreground">
                    {job?.company?.charAt(0)}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground mb-1">{job?.title}</h4>
                  <p className="text-sm text-muted-foreground mb-1">{job?.company}</p>
                  <p className="text-xs text-muted-foreground">{job?.location}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {formatSalary(job?.salaryMin, job?.salaryMax)}
                  </p>
                  <div className="flex items-center space-x-1">
                    <Icon name="Star" size={12} className="text-accent" />
                    <span className="text-xs text-muted-foreground">{job?.matchScore}% match</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {job?.tags?.slice(0, 3)?.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-background text-xs text-muted-foreground rounded border border-border">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Icon name="Bookmark" size={14} />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onApplyQuick(job?.id)}
                >
                  Quick Apply
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {recommendations?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Target" size={32} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No recommendations found</p>
          <p className="text-xs text-muted-foreground">Complete your profile to receive personalized job matches</p>
        </div>
      )}
      <div className="mt-4 pt-4 border-t border-border">
        <Button variant="outline" className="w-full" onClick={() => onSearch('', [])}>
          <Icon name="Search" size={16} />
          <span className="ml-2">Browse All Jobs</span>
        </Button>
      </div>
    </div>
  );
};

export default JobRecommendationCard;