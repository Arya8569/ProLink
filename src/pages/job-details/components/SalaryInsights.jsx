import React from 'react';
import Icon from '../../../components/AppIcon';

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

const SalaryInsights = ({ job, marketData }) => {
  const formatSalary = (amount) => {
    return formatIndianCurrency(amount);
  };

  const getSalaryComparison = (jobSalary, marketAverage) => {
    if (!jobSalary || !marketAverage) return null;
    
    const difference = ((jobSalary - marketAverage) / marketAverage) * 100;
    
    if (Math.abs(difference) < 5) {
      return {
        status: 'competitive',
        text: 'Competitive with market',
        color: 'text-primary',
        icon: 'TrendingUp'
      };
    } else if (difference > 0) {
      return {
        status: 'above',
        text: `${Math.round(difference)}% Above Market`,
        color: 'text-success',
        icon: 'ArrowUp'
      };
    } else {
      return {
        status: 'below',
        text: `${Math.round(Math.abs(difference))}% Below Market`,
        color: 'text-warning',
        icon: 'ArrowDown'
      };
    }
  };

  const jobMinSalary = job?.salary?.min || 0;
  const jobMaxSalary = job?.salary?.max || 0;
  const jobAvgSalary = jobMinSalary && jobMaxSalary ? (jobMinSalary + jobMaxSalary) / 2 : jobMinSalary || jobMaxSalary;

  const comparison = getSalaryComparison(jobAvgSalary, marketData?.average);

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden card-moderate">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Icon name="DollarSign" size={20} className="text-primary" />
          <span>Salary Insights</span>
        </h3>
      </div>
      <div className="p-6 space-y-6">
        {/* Job Salary Range */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">This Position</h4>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Salary Range</span>
              {comparison && (
                <div className={`flex items-center space-x-1 ${comparison?.color}`}>
                  <Icon name={comparison?.icon} size={14} />
                  <span className="text-xs font-medium">{comparison?.text}</span>
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-foreground">
              {jobMinSalary && jobMaxSalary 
                ? `${formatSalary(jobMinSalary)} - ${formatSalary(jobMaxSalary)}`
                : jobMinSalary 
                  ? `${formatSalary(jobMinSalary)}+`
                  : jobMaxSalary
                    ? `Up to ${formatSalary(jobMaxSalary)}`
                    : 'Not Disclosed'
              }
            </div>
            {jobMinSalary && jobMaxSalary && (
              <p className="text-sm text-muted-foreground mt-1">
                Average: {formatSalary(jobAvgSalary)}
              </p>
            )}
          </div>
        </div>

        {/* Market Comparison */}
        {marketData && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Market Comparison</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icon name="TrendingUp" size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">Market Average</span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {formatSalary(marketData?.average)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icon name="BarChart3" size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">25th Percentile</span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {formatSalary(marketData?.percentile25)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icon name="BarChart3" size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">75th Percentile</span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {formatSalary(marketData?.percentile75)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Salary Breakdown */}
        {job?.salaryBreakdown && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Compensation Breakdown</h4>
            <div className="space-y-2">
              {job?.salaryBreakdown?.base && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Base Salary</span>
                  <span className="font-medium text-foreground">{formatSalary(job?.salaryBreakdown?.base)}</span>
                </div>
              )}
              {job?.salaryBreakdown?.bonus && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Annual Bonus</span>
                  <span className="font-medium text-foreground">{formatSalary(job?.salaryBreakdown?.bonus)}</span>
                </div>
              )}
              {job?.salaryBreakdown?.equity && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Equity Package</span>
                  <span className="font-medium text-foreground">{job?.salaryBreakdown?.equity}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Benefits Highlight */}
        {job?.benefits && job?.benefits?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Key Benefits</h4>
            <div className="grid grid-cols-1 gap-2">
              {job?.benefits?.slice(0, 4)?.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <Icon name="Check" size={14} className="text-success flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
              {job?.benefits?.length > 4 && (
                <p className="text-xs text-muted-foreground mt-2">
                  +{job?.benefits?.length - 4} more benefits
                </p>
              )}
            </div>
          </div>
        )}

        {/* Salary Negotiation Tips */}
        <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
          <div className="flex items-start space-x-3">
            <Icon name="Lightbulb" size={16} className="text-accent mt-0.5" />
            <div className="text-sm">
              <p className="text-foreground font-medium mb-1">Negotiation Tips</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Research similar roles in your area</li>
                <li>• Consider total compensation, not just base salary</li>
                <li>• Highlight your unique skills and experience</li>
                <li>• Be prepared to discuss your salary expectations</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalaryInsights;