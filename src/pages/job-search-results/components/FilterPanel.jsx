import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterPanel = ({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  isVisible = true, 
  onClose,
  className = "" 
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [salaryRange, setSalaryRange] = useState([
    filters?.salaryMin || 0, 
    filters?.salaryMax || 200000
  ]);

  const industryOptions = [
    { value: '', label: 'All Industries' },
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'education', label: 'Education' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'design', label: 'Design' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'consulting', label: 'Consulting' }
  ];

  const jobTypeOptions = [
    { value: '', label: 'All Job Types' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' }
  ];

  const experienceLevelOptions = [
    { value: '', label: 'All Experience Levels' },
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'mid', label: 'Mid Level (3-5 years)' },
    { value: 'senior', label: 'Senior Level (6-10 years)' },
    { value: 'executive', label: 'Executive (10+ years)' }
  ];

  const companySizeOptions = [
    { value: '', label: 'All Company Sizes' },
    { value: 'startup', label: 'Startup (1-50)' },
    { value: 'small', label: 'Small (51-200)' },
    { value: 'medium', label: 'Medium (201-1000)' },
    { value: 'large', label: 'Large (1000+)' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSalaryChange = (index, value) => {
    const newRange = [...salaryRange];
    newRange[index] = parseInt(value) || 0;
    setSalaryRange(newRange);
    
    const newFilters = {
      ...localFilters,
      salaryMin: newRange?.[0],
      salaryMax: newRange?.[1]
    };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    setSalaryRange([0, 200000]);
    onClearFilters();
  };

  const getActiveFilterCount = () => {
    return Object.values(localFilters)?.filter(value => 
      value && value !== '' && (Array.isArray(value) ? value?.length > 0 : true)
    )?.length;
  };

  if (!isVisible) return null;

  return (
    <div className={`bg-card border border-border rounded-lg h-fit sticky top-24 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={20} />
          <h3 className="text-lg font-semibold text-foreground">Filters</h3>
          {getActiveFilterCount() > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
              {getActiveFilterCount()}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
            >
              <Icon name="X" size={16} />
            </Button>
          )}
        </div>
      </div>
      {/* Filter Content */}
      <div className="p-4 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Location Search */}
        <div>
          <Input
            label="Location"
            type="text"
            placeholder="City, state, or remote"
            value={localFilters?.location || ''}
            onChange={(e) => handleFilterChange('location', e?.target?.value)}
          />
        </div>

        {/* Industry */}
        <div>
          <Select
            label="Industry"
            options={industryOptions}
            value={localFilters?.industry || ''}
            onChange={(value) => handleFilterChange('industry', value)}
          />
        </div>

        {/* Job Type */}
        <div>
          <Select
            label="Job Type"
            options={jobTypeOptions}
            value={localFilters?.jobType || ''}
            onChange={(value) => handleFilterChange('jobType', value)}
          />
        </div>

        {/* Experience Level */}
        <div>
          <Select
            label="Experience Level"
            options={experienceLevelOptions}
            value={localFilters?.experienceLevel || ''}
            onChange={(value) => handleFilterChange('experienceLevel', value)}
          />
        </div>

        {/* Company Size */}
        <div>
          <Select
            label="Company Size"
            options={companySizeOptions}
            value={localFilters?.companySize || ''}
            onChange={(value) => handleFilterChange('companySize', value)}
          />
        </div>

        {/* Salary Range */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Salary Range
          </label>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Min"
                value={salaryRange?.[0]}
                onChange={(e) => handleSalaryChange(0, e?.target?.value)}
                className="flex-1"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={salaryRange?.[1]}
                onChange={(e) => handleSalaryChange(1, e?.target?.value)}
                className="flex-1"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              ${salaryRange?.[0]?.toLocaleString()} - ${salaryRange?.[1]?.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Work Arrangement */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Work Arrangement
          </label>
          <div className="space-y-2">
            <Checkbox
              label="Remote"
              checked={localFilters?.isRemote || false}
              onChange={(e) => handleFilterChange('isRemote', e?.target?.checked)}
            />
            <Checkbox
              label="Hybrid"
              checked={localFilters?.isHybrid || false}
              onChange={(e) => handleFilterChange('isHybrid', e?.target?.checked)}
            />
            <Checkbox
              label="On-site"
              checked={localFilters?.isOnsite || false}
              onChange={(e) => handleFilterChange('isOnsite', e?.target?.checked)}
            />
          </div>
        </div>

        {/* Benefits */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Benefits
          </label>
          <div className="space-y-2">
            <Checkbox
              label="Health Insurance"
              checked={localFilters?.healthInsurance || false}
              onChange={(e) => handleFilterChange('healthInsurance', e?.target?.checked)}
            />
            <Checkbox
              label="401(k)"
              checked={localFilters?.retirement || false}
              onChange={(e) => handleFilterChange('retirement', e?.target?.checked)}
            />
            <Checkbox
              label="Paid Time Off"
              checked={localFilters?.paidTimeOff || false}
              onChange={(e) => handleFilterChange('paidTimeOff', e?.target?.checked)}
            />
            <Checkbox
              label="Flexible Schedule"
              checked={localFilters?.flexibleSchedule || false}
              onChange={(e) => handleFilterChange('flexibleSchedule', e?.target?.checked)}
            />
          </div>
        </div>

        {/* Posted Date */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Posted Date
          </label>
          <div className="space-y-2">
            <Checkbox
              label="Last 24 hours"
              checked={localFilters?.postedWithin === '24h'}
              onChange={(e) => handleFilterChange('postedWithin', e?.target?.checked ? '24h' : '')}
            />
            <Checkbox
              label="Last 3 days"
              checked={localFilters?.postedWithin === '3d'}
              onChange={(e) => handleFilterChange('postedWithin', e?.target?.checked ? '3d' : '')}
            />
            <Checkbox
              label="Last week"
              checked={localFilters?.postedWithin === '1w'}
              onChange={(e) => handleFilterChange('postedWithin', e?.target?.checked ? '1w' : '')}
            />
            <Checkbox
              label="Last month"
              checked={localFilters?.postedWithin === '1m'}
              onChange={(e) => handleFilterChange('postedWithin', e?.target?.checked ? '1m' : '')}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;