import React from 'react';
import Icon from '../../../components/AppIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ApplicationAnalytics = ({ applications, className = "" }) => {
  // Calculate analytics data
  const getAnalyticsData = () => {
    const statusCounts = applications?.reduce((acc, app) => {
      acc[app.status] = (acc?.[app?.status] || 0) + 1;
      return acc;
    }, {});

    const totalApplications = applications?.length;
    const responseRate = totalApplications > 0 
      ? ((totalApplications - (statusCounts?.['applied'] || 0)) / totalApplications * 100)?.toFixed(1)
      : 0;

    const interviewRate = totalApplications > 0
      ? (((statusCounts?.['interview-scheduled'] || 0) + (statusCounts?.['offer-received'] || 0)) / totalApplications * 100)?.toFixed(1)
      : 0;

    const offerRate = totalApplications > 0
      ? ((statusCounts?.['offer-received'] || 0) / totalApplications * 100)?.toFixed(1)
      : 0;

    return {
      totalApplications,
      responseRate,
      interviewRate,
      offerRate,
      statusCounts
    };
  };

  const analytics = getAnalyticsData();

  // Chart data
  const statusChartData = [
    { name: 'Applied', value: analytics?.statusCounts?.['applied'] || 0, color: '#3B82F6' },
    { name: 'Under Review', value: analytics?.statusCounts?.['under-review'] || 0, color: '#F59E0B' },
    { name: 'Shortlisted', value: analytics?.statusCounts?.['shortlisted'] || 0, color: '#8B5CF6' },
    { name: 'Interview', value: analytics?.statusCounts?.['interview-scheduled'] || 0, color: '#F97316' },
    { name: 'Offer', value: analytics?.statusCounts?.['offer-received'] || 0, color: '#10B981' },
    { name: 'Rejected', value: analytics?.statusCounts?.['rejected'] || 0, color: '#EF4444' }
  ]?.filter(item => item?.value > 0);

  const monthlyData = [
    { month: 'Jan', applications: 8, responses: 3 },
    { month: 'Feb', applications: 12, responses: 5 },
    { month: 'Mar', applications: 15, responses: 7 },
    { month: 'Apr', applications: 18, responses: 9 },
    { month: 'May', applications: 22, responses: 11 },
    { month: 'Jun', applications: 25, responses: 14 }
  ];

  const StatCard = ({ title, value, subtitle, icon, color = "primary" }) => {
    const colorClasses = {
      primary: 'text-primary bg-primary/10',
      success: 'text-success bg-success/10',
      warning: 'text-warning bg-warning/10',
      accent: 'text-accent bg-accent/10'
    };

    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-lg ${colorClasses?.[color]} flex items-center justify-center`}>
            <Icon name={icon} size={24} />
          </div>
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
          <p className="text-sm font-medium text-foreground mb-1">{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Applications"
          value={analytics?.totalApplications}
          subtitle="Jobs applied to"
          icon="FileText"
          color="primary"
        />
        <StatCard
          title="Response Rate"
          value={`${analytics?.responseRate}%`}
          subtitle="Companies responded"
          icon="TrendingUp"
          color="success"
        />
        <StatCard
          title="Interview Rate"
          value={`${analytics?.interviewRate}%`}
          subtitle="Reached interview stage"
          icon="Calendar"
          color="accent"
        />
        <StatCard
          title="Offer Rate"
          value={`${analytics?.offerRate}%`}
          subtitle="Received job offers"
          icon="Gift"
          color="warning"
        />
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Status Distribution */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Application Status</h3>
          {statusChartData?.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusChartData?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry?.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Icon name="PieChart" size={48} className="mx-auto mb-2" />
                <p>No data to display</p>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="applications" fill="#3B82F6" name="Applications" />
                <Bar dataKey="responses" fill="#10B981" name="Responses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Improvement Suggestions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Improvement Suggestions</h3>
        <div className="space-y-4">
          {analytics?.responseRate < 30 && (
            <div className="flex items-start space-x-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <Icon name="AlertTriangle" size={20} className="text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Low Response Rate</p>
                <p className="text-sm text-muted-foreground">
                  Consider improving your resume or targeting more relevant positions. Your current response rate is {analytics?.responseRate}%.
                </p>
              </div>
            </div>
          )}
          
          {analytics?.interviewRate < 15 && analytics?.totalApplications > 10 && (
            <div className="flex items-start space-x-3 p-4 bg-accent/10 border border-accent/20 rounded-lg">
              <Icon name="Target" size={20} className="text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Interview Conversion</p>
                <p className="text-sm text-muted-foreground">
                  Focus on applications where you closely match the requirements. Consider customizing your cover letters.
                </p>
              </div>
            </div>
          )}
          
          {analytics?.totalApplications > 0 && analytics?.offerRate > 20 && (
            <div className="flex items-start space-x-3 p-4 bg-success/10 border border-success/20 rounded-lg">
              <Icon name="CheckCircle" size={20} className="text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Great Performance!</p>
                <p className="text-sm text-muted-foreground">
                  Your offer rate of {analytics?.offerRate}% is excellent. Keep up the good work!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationAnalytics;