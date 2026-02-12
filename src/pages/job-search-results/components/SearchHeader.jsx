import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const SearchHeader = ({
  searchQuery = '',
  onSearchChange = () => {},
  sortBy = 'relevance',
  onSortChange = () => {},
  resultCount = 0,
  isLoading = false,
  onToggleFilters = () => {},
  showMobileFilters = false,
  className = ""
}) => {
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

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'date', label: 'Most Recent' },
    { value: 'salary-high', label: 'Salary: High to Low' },
    { value: 'salary-low', label: 'Salary: Low to High' },
    { value: 'company', label: 'Company A-Z' },
    { value: 'match', label: 'Best AI Match' }
  ];

  return (
    <div className={`bg-card border-b border-border sticky top-16 z-30 ${className}`}>
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

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleFilters}
              className="lg:hidden"
            >
              <Icon name="Filter" size={16} />
              <span className="ml-2">Filters</span>
            </Button>

            {/* Results Count */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Icon name="Loader2" size={14} className="animate-spin" />
                    <span>Searching...</span>
                  </div>
                ) : (
                  `${resultCount?.toLocaleString()} jobs found`
                )}
              </span>
              {searchQuery && (
                <span className="text-sm text-foreground">
                  for "{searchQuery}"
                </span>
              )}
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <Icon name="ArrowUpDown" size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sort by:</span>
            </div>
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={onSortChange}
              className="w-40"
            />
          </div>
        </div>

        {/* Quick Filters */}
        <div className="hidden lg:flex items-center space-x-2 mt-4 pt-4 border-t border-border">
          <span className="text-sm text-muted-foreground mr-2">Quick filters:</span>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => onSearchChange('remote')}
          >
            <Icon name="Wifi" size={14} />
            <span className="ml-1">Remote</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => onSearchChange('full-time')}
          >
            <Icon name="Clock" size={14} />
            <span className="ml-1">Full-time</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => onSearchChange('senior')}
          >
            <Icon name="TrendingUp" size={14} />
            <span className="ml-1">Senior Level</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => onSearchChange('technology')}
          >
            <Icon name="Code" size={14} />
            <span className="ml-1">Tech</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchHeader;