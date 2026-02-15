import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const AnalyticsPanel = ({ metrics }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  // Use real metrics or defaults
  const hiringFunnelData = metrics?.funnelData || [];
  const timeToFillData = metrics?.timeToFillData || [];
  const sourceData = metrics?.sourceData || [];

  const kpiCards = [
    {
      title: 'Total Applications',
      value: metrics?.totalApplications || 0,
      // Remove trend if no historical data available
      change: metrics?.applicationChange || '0%',
      trend: metrics?.applicationTrend || 'neutral',
      icon: 'FileText',
      color: 'text-primary'
    },
    {
      title: 'Interviews Scheduled',
      value: metrics?.totalInterviews || 0,
      change: metrics?.interviewChange || '0%',
      trend: metrics?.interviewTrend || 'neutral',
      icon: 'Clock',
      color: 'text-success'
    },
    {
      title: 'Offers Sent',
      value: metrics?.offersSent || 0,
      change: '0%',
      trend: 'neutral',
      icon: 'CheckCircle',
      color: 'text-success'
    },
    {
      title: 'Hires',
      value: metrics?.totalHires || 0,
      change: '0%',
      trend: 'neutral',
      icon: 'UserCheck',
      color: 'text-accent'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Analytics Dashboard</h2>
          <div className="flex items-center space-x-3">
            <Select
              options={periodOptions}
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              className="w-36"
            />
            <Button variant="outline" size="sm">
              <Icon name="Download" size={16} />
              <span className="ml-1">Export</span>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards?.map((kpi, index) => (
            <div key={index} className="bg-muted/50 border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <Icon name={kpi?.icon} size={20} className={kpi?.color} />
                <div className={`flex items-center space-x-1 text-xs ${kpi?.trend === 'up' ? 'text-success' : 'text-error'
                  }`}>
                  <Icon name={kpi?.trend === 'up' ? 'TrendingUp' : 'TrendingDown'} size={12} />
                  <span>{kpi?.change}</span>
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">{kpi?.value}</div>
              <div className="text-sm text-muted-foreground">{kpi?.title}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hiring Funnel */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Hiring Funnel</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hiringFunnelData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563EB" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time to Fill Trend */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Time to Fill Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeToFillData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="days" stroke="#7C3AED" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Sources */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Application Sources</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {sourceData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Application to Interview Rate</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-foreground">{metrics?.conversionRates?.interview || '0%'}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Interview to Offer Rate</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-foreground">{metrics?.conversionRates?.offer || '0%'}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Offer Acceptance Rate</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-foreground">{metrics?.conversionRates?.acceptance || '0%'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;