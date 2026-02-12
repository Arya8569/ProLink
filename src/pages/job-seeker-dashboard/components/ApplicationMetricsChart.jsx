import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ApplicationMetricsChart = ({ 
  applicationData = [], 
  successRate = 0,
  totalApplications = 0,
  onViewAnalytics = () => {} 
}) => {
  // Mock data for charts
  const monthlyData = [
    { month: 'Sep', applications: 12, interviews: 3, offers: 1 },
    { month: 'Oct', applications: 18, interviews: 5, offers: 2 },
    { month: 'Nov', applications: 15, interviews: 4, offers: 1 },
    { month: 'Dec', applications: 22, interviews: 7, offers: 3 }
  ];

  const statusData = [
    { name: 'Applied', value: 45, color: '#2563EB' },
    { name: 'Shortlisted', value: 12, color: '#F59E0B' },
    { name: 'Interview', value: 8, color: '#7C3AED' },
    { name: 'Offer', value: 3, color: '#10B981' },
    { name: 'Rejected', value: 15, color: '#EF4444' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-moderate">
          <p className="text-sm font-medium text-foreground mb-1">{label}</p>
          {payload?.map((entry, index) => (
            <p key={index} className="text-xs text-muted-foreground">
              <span className="capitalize">{entry?.dataKey}:</span> {entry?.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0];
      return (
        <div className="bg-popover border border-border rounded-lg p-2 shadow-moderate">
          <p className="text-xs font-medium text-foreground">
            {data?.name}: {data?.value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-subtle">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Application Analytics</h3>
        <Button variant="ghost" size="sm" onClick={onViewAnalytics}>
          <Icon name="BarChart3" size={16} />
          <span className="ml-1">Details</span>
        </Button>
      </div>
      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-2xl font-bold text-foreground">{totalApplications || 83}</div>
          <div className="text-xs text-muted-foreground">Total Applied</div>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-2xl font-bold text-accent">{successRate || 12}%</div>
          <div className="text-xs text-muted-foreground">Success Rate</div>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-2xl font-bold text-success">7</div>
          <div className="text-xs text-muted-foreground">Interviews</div>
        </div>
      </div>
      {/* Charts Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Applications Chart */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Monthly Activity</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
                  axisLine={{ stroke: 'var(--color-border)' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
                  axisLine={{ stroke: 'var(--color-border)' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="applications" fill="var(--color-primary)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="interviews" fill="var(--color-accent)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="offers" fill="var(--color-success)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Status Distribution */}
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Status Distribution</h4>
          <div className="h-48 flex items-center">
            <div className="w-32 h-32 mx-auto">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry?.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="ml-4 space-y-2">
              {statusData?.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item?.color }}
                  ></div>
                  <span className="text-xs text-muted-foreground">{item?.name}</span>
                  <span className="text-xs font-medium text-foreground">{item?.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Insights */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-success/5 border border-success/20 rounded-lg">
            <div className="w-8 h-8 bg-success/10 text-success rounded-lg flex items-center justify-center">
              <Icon name="TrendingUp" size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Interview Rate Up</p>
              <p className="text-xs text-muted-foreground">25% increase this month</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-accent/5 border border-accent/20 rounded-lg">
            <div className="w-8 h-8 bg-accent/10 text-accent rounded-lg flex items-center justify-center">
              <Icon name="Target" size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Best Match Rate</p>
              <p className="text-xs text-muted-foreground">Tech roles: 85% success</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationMetricsChart;