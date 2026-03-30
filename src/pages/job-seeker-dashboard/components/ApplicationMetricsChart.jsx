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
  // Calculate real data for charts
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    // Group by month
    const groups = applicationData.reduce((acc, app) => {
      const date = new Date(app.appliedDate);
      if (date.getFullYear() === currentYear) {
        const month = months[date.getMonth()];
        if (!acc[month]) acc[month] = { month, applications: 0, interviews: 0, offers: 0 };
        acc[month].applications++;
        if (app.status === 'interview') acc[month].interviews++;
        if (app.status === 'offer' || app.status === 'hired') acc[month].offers++;
      }
      return acc;
    }, {});

    // Sort by month index
    return months
      .filter(m => groups[m])
      .map(m => groups[m]);
  };

  const getStatusData = () => {
    const statusCounts = {
      'applied': 0,
      'screening': 0,
      'interview': 0,
      'offer': 0,
      'hired': 0,
      'rejected': 0
    };

    applicationData.forEach(app => {
      const status = app.status?.toLowerCase();
      if (status && statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      } else {
        statusCounts['applied']++;
      }
    });

    return [
      { name: 'Applied', value: statusCounts.applied, color: '#2563EB' },
      { name: 'Screening', value: statusCounts.screening, color: '#F59E0B' },
      { name: 'Interview', value: statusCounts.interview, color: '#7C3AED' },
      { name: 'Offer', value: statusCounts.offer + statusCounts.hired, color: '#10B981' },
      { name: 'Rejected', value: statusCounts.rejected, color: '#EF4444' }
    ].filter(s => s.value > 0);
  };

  const monthlyData = getMonthlyData();
  const statusData = getStatusData();
  const totalInterviews = applicationData.filter(a => a.status === 'interview').length;

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
          <div className="text-2xl font-bold text-foreground">{totalApplications}</div>
          <div className="text-xs text-muted-foreground">Total Applied</div>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-2xl font-bold text-accent">{successRate}%</div>
          <div className="text-xs text-muted-foreground">Success Rate</div>
        </div>
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-2xl font-bold text-success">{totalInterviews}</div>
          <div className="text-xs text-muted-foreground">Interviews</div>
        </div>
      </div>

      {applicationData.length === 0 ? (
        <div className="py-12 text-center border-t border-border">
          <Icon name="BarChart3" size={48} className="text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground">Apply to jobs to see your analytics</p>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default ApplicationMetricsChart;