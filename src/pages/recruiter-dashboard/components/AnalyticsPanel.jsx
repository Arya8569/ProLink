import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const AnalyticsPanel = ({ analyticsData }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('applications');

  const periodOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  const metricOptions = [
    { value: 'applications', label: 'Applications' },
    { value: 'interviews', label: 'Interviews' },
    { value: 'hires', label: 'Hires' },
    { value: 'views', label: 'Job Views' }
  ];

  const hiringFunnelData = [
    { stage: 'Applications', count: 245, percentage: 100 },
    { stage: 'Screening', count: 156, percentage: 64 },
    { stage: 'Interview', count: 89, percentage: 36 },
    { stage: 'Offer', count: 23, percentage: 9 },
    { stage: 'Hired', count: 18, percentage: 7 }
  ];

  const timeToFillData = [
    { month: 'Jan', days: 28 },
    { month: 'Feb', days: 32 },
    { month: 'Mar', days: 25 },
    { month: 'Apr', days: 30 },
    { month: 'May', days: 22 },
    { month: 'Jun', days: 26 }
  ];

  const sourceData = [
    { name: 'Job Boards', value: 45, color: '#2563EB' },
    { name: 'LinkedIn', value: 30, color: '#7C3AED' },
    { name: 'Referrals', value: 15, color: '#F59E0B' },
    { name: 'Direct', value: 10, color: '#10B981' }
  ];

  const kpiCards = [
    {
      title: 'Total Applications',
      value: '1,247',
      change: '+12.5%',
      trend: 'up',
      icon: 'FileText',
      color: 'text-primary'
    },
    {
      title: 'Time to Fill',
      value: '26 days',
      change: '-3.2 days',
      trend: 'down',
      icon: 'Clock',
      color: 'text-success'
    },
    {
      title: 'Cost per Hire',
      value: '$3,240',
      change: '-8.1%',
      trend: 'down',
      icon: 'DollarSign',
      color: 'text-success'
    },
    {
      title: 'Offer Acceptance',
      value: '78.3%',
      change: '+5.2%',
      trend: 'up',
      icon: 'CheckCircle',
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
                <div className={`flex items-center space-x-1 text-xs ${
                  kpi?.trend === 'up' ? 'text-success' : 'text-error'
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
                <div className="w-24 bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '36%' }} />
                </div>
                <span className="text-sm font-medium text-foreground">36%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Interview to Offer Rate</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div className="bg-secondary h-2 rounded-full" style={{ width: '26%' }} />
                </div>
                <span className="text-sm font-medium text-foreground">26%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Offer Acceptance Rate</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div className="bg-success h-2 rounded-full" style={{ width: '78%' }} />
                </div>
                <span className="text-sm font-medium text-foreground">78%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Quality of Hire Score</span>
              <div className="flex items-center space-x-2">
                <div className="w-24 bg-muted rounded-full h-2">
                  <div className="bg-accent h-2 rounded-full" style={{ width: '84%' }} />
                </div>
                <span className="text-sm font-medium text-foreground">84%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPanel;