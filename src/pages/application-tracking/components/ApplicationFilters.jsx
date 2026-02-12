import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ApplicationFilters = ({
  filters,
  onFiltersChange,
  onClearFilters,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusOptions = [
    { value: '', label: 'All statuses' },
    { value: 'applied', label: 'Applied' },
    { value: 'under-review', label: 'Under Review' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interview-scheduled', label: 'Interview Scheduled' },
    { value: 'offer-received', label: 'Offer Received' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const dateRangeOptions = [
    { value: '', label: 'All time' },
    { value: 'last-week', label: 'Last week' },
    { value: 'last-month', label: 'Last month' },
    { value: 'last-3-months', label: 'Last 3 months' },
    { value: 'last-6-months', label: 'Last 6 months' }
  ];

  const positionTypeOptions = [
    { value: '', label: 'All types' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const getActiveFilterCount = () => {
    return Object.values(filters)?.filter(value => 
      value && value !== '' && (Array.isArray(value) ? value?.length > 0 : true)
    )?.length;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={`bg-card border border-border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-foreground">Filter Applications</h3>
          {activeFilterCount > 0 && (
            <span className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs font-medium">
              {activeFilterCount} active
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" size={14} />
              <span className="ml-1">Clear all</span>
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden"
          >
            <Icon name="Filter" size={16} />
            <span className="ml-2">Filters</span>
          </Button>
        </div>
      </div>
      {/* Search Bar */}
      <div className="mb-4">
        <Input
          type="search"
          placeholder="Search by company, position, or keywords..."
          value={filters?.search || ''}
          onChange={(e) => handleFilterChange('search', e?.target?.value)}
          className="w-full"
        />
      </div>
      {/* Desktop Filters */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-4">
        <Select
          label="Status"
          options={statusOptions}
          value={filters?.status || ''}
          onChange={(value) => handleFilterChange('status', value)}
        />
        
        <Select
          label="Date Range"
          options={dateRangeOptions}
          value={filters?.dateRange || ''}
          onChange={(value) => handleFilterChange('dateRange', value)}
        />
        
        <Select
          label="Position Type"
          options={positionTypeOptions}
          value={filters?.positionType || ''}
          onChange={(value) => handleFilterChange('positionType', value)}
        />
        
        <Input
          label="Company"
          type="text"
          placeholder="Filter by company..."
          value={filters?.company || ''}
          onChange={(e) => handleFilterChange('company', e?.target?.value)}
        />
      </div>
      {/* Mobile Expanded Filters */}
      {isExpanded && (
        <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
          <Select
            label="Status"
            options={statusOptions}
            value={filters?.status || ''}
            onChange={(value) => handleFilterChange('status', value)}
          />
          
          <Select
            label="Date Range"
            options={dateRangeOptions}
            value={filters?.dateRange || ''}
            onChange={(value) => handleFilterChange('dateRange', value)}
          />
          
          <Select
            label="Position Type"
            options={positionTypeOptions}
            value={filters?.positionType || ''}
            onChange={(value) => handleFilterChange('positionType', value)}
          />
          
          <Input
            label="Company"
            type="text"
            placeholder="Filter by company..."
            value={filters?.company || ''}
            onChange={(e) => handleFilterChange('company', e?.target?.value)}
          />
        </div>
      )}
    </div>
  );
};

export default ApplicationFilters;