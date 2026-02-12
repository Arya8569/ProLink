import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';
import Select from './Select';

const SearchContextBar = ({
  searchQuery = '',
  onSearchChange = () => {},
  filters = {},
  onFiltersChange = () => {},
  sortBy = 'relevance',
  onSortChange = () => {},
  resultCount = 0,
  isLoading = false,
  showFilters = true,
  className = ""
}) => {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    onSearchChange(localSearchQuery);
  };

  const handleSearchChange = (e) => {
    setLocalSearchQuery(e?.target?.value);
  };

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
    setLocalSearchQuery('');
    onSearchChange('');
  };

  const getActiveFilterCount = () => {
    return Object.values(filters)?.filter(value => 
      value && value !== '' && (Array.isArray(value) ? value?.length > 0 : true)
    )?.length;
  };

  const locationOptions = [
    { value: '', label: 'All locations' },
    { value: 'remote', label: 'Remote' },
    { value: 'new-york', label: 'New York, NY' },
    { value: 'san-francisco', label: 'San Francisco, CA' },
    { value: 'chicago', label: 'Chicago, IL' },
    { value: 'austin', label: 'Austin, TX' },
    { value: 'seattle', label: 'Seattle, WA' }
  ];

  const jobTypeOptions = [
    { value: '', label: 'All job types' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' }
  ];

  const experienceLevelOptions = [
    { value: '', label: 'All levels' },
    { value: 'entry', label: 'Entry level' },
    { value: 'mid', label: 'Mid level' },
    { value: 'senior', label: 'Senior level' },
    { value: 'executive', label: 'Executive' }
  ];

  const salaryRangeOptions = [
    { value: '', label: 'Any salary' },
    { value: '0-50k', label: '$0 - $50k' },
    { value: '50k-75k', label: '$50k - $75k' },
    { value: '75k-100k', label: '$75k - $100k' },
    { value: '100k-150k', label: '$100k - $150k' },
    { value: '150k+', label: '$150k+' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Most relevant' },
    { value: 'date', label: 'Most recent' },
    { value: 'salary-high', label: 'Salary: High to low' },
    { value: 'salary-low', label: 'Salary: Low to high' },
    { value: 'company', label: 'Company A-Z' }
  ];

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={`bg-card border-b border-border sticky top-16 z-40 ${className}`}>
      <div className="px-4 lg:px-6 py-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-4 mb-4">
          <div className="flex-1 relative">
            <Icon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
            />
            <Input
              type="search"
              placeholder="Search jobs, companies, or keywords..."
              value={localSearchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-4"
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Icon name="Loader2" size={16} className="animate-spin" />
            ) : (
              <Icon name="Search" size={16} />
            )}
            <span className="hidden sm:inline ml-2">Search</span>
          </Button>
        </form>

        {/* Filter Controls */}
        {showFilters && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile Filter Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                className="lg:hidden"
              >
                <Icon name="Filter" size={16} />
                <span className="ml-2">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              {/* Desktop Filters */}
              <div className="hidden lg:flex items-center space-x-3">
                <Select
                  placeholder="Location"
                  options={locationOptions}
                  value={filters?.location || ''}
                  onChange={(value) => handleFilterChange('location', value)}
                  className="w-40"
                />
                <Select
                  placeholder="Job type"
                  options={jobTypeOptions}
                  value={filters?.jobType || ''}
                  onChange={(value) => handleFilterChange('jobType', value)}
                  className="w-36"
                />
                <Select
                  placeholder="Experience"
                  options={experienceLevelOptions}
                  value={filters?.experienceLevel || ''}
                  onChange={(value) => handleFilterChange('experienceLevel', value)}
                  className="w-32"
                />
                <Select
                  placeholder="Salary"
                  options={salaryRangeOptions}
                  value={filters?.salaryRange || ''}
                  onChange={(value) => handleFilterChange('salaryRange', value)}
                  className="w-36"
                />
              </div>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon name="X" size={14} />
                  <span className="ml-1">Clear all</span>
                </Button>
              )}
            </div>

            {/* Results Count and Sort */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                {isLoading ? 'Searching...' : `${resultCount?.toLocaleString()} jobs found`}
              </span>
              <Select
                options={sortOptions}
                value={sortBy}
                onChange={onSortChange}
                className="w-40"
              />
            </div>
          </div>
        )}

        {/* Mobile Expanded Filters */}
        {showFilters && isFiltersExpanded && (
          <div className="lg:hidden mt-4 pt-4 border-t border-border">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Location"
                options={locationOptions}
                value={filters?.location || ''}
                onChange={(value) => handleFilterChange('location', value)}
              />
              <Select
                label="Job type"
                options={jobTypeOptions}
                value={filters?.jobType || ''}
                onChange={(value) => handleFilterChange('jobType', value)}
              />
              <Select
                label="Experience level"
                options={experienceLevelOptions}
                value={filters?.experienceLevel || ''}
                onChange={(value) => handleFilterChange('experienceLevel', value)}
              />
              <Select
                label="Salary range"
                options={salaryRangeOptions}
                value={filters?.salaryRange || ''}
                onChange={(value) => handleFilterChange('salaryRange', value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchContextBar;