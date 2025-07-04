import { PermissionGuard } from '@/components/common/RoleGuard';
import { Permission } from '@/types/user/roles';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import { Knob } from 'primereact/knob';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';

interface AnalyticsData {
  userGrowth: {
    labels: string[];
    data: number[];
  };
  messageVolume: {
    labels: string[];
    data: number[];
  };
  userEngagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
  };
  systemMetrics: {
    responseTime: number;
    uptime: number;
    errorRate: number;
    throughput: number;
  };
  topFeatures: Array<{
    name: string;
    usage: number;
    growth: number;
  }>;
  geograficalData: Array<{
    country: string;
    users: number;
    percentage: number;
  }>;
}

export const SystemAnalytics: React.FC = () => {
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<Date[]>([
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    new Date(),
  ]);
  const [selectedMetric, setSelectedMetric] = useState('users');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    userGrowth: {
      labels: [],
      data: [],
    },
    messageVolume: {
      labels: [],
      data: [],
    },
    userEngagement: {
      dailyActiveUsers: 0,
      weeklyActiveUsers: 0,
      monthlyActiveUsers: 0,
      averageSessionDuration: 0,
    },
    systemMetrics: {
      responseTime: 0,
      uptime: 0,
      errorRate: 0,
      throughput: 0,
    },
    topFeatures: [],
    geograficalData: [],
  });

  const [chartOptions] = useState({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange, selectedMetric]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simulate API call to get analytics data
      const mockData: AnalyticsData = {
        userGrowth: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [120, 190, 300, 500, 720, 1247],
        },
        messageVolume: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          data: [2500, 3200, 2800, 4100],
        },
        userEngagement: {
          dailyActiveUsers: 892,
          weeklyActiveUsers: 1156,
          monthlyActiveUsers: 1247,
          averageSessionDuration: 24.5,
        },
        systemMetrics: {
          responseTime: 150,
          uptime: 99.9,
          errorRate: 0.02,
          throughput: 1250,
        },
        topFeatures: [
          { name: 'Chat System', usage: 95, growth: 12 },
          { name: 'Anonymous Rooms', usage: 78, growth: 25 },
          { name: 'File Sharing', usage: 65, growth: 8 },
          { name: 'Voice Messages', usage: 45, growth: 35 },
          { name: 'Embed Widget', usage: 32, growth: 18 },
        ],
        geograficalData: [
          { country: 'United States', users: 456, percentage: 36.6 },
          { country: 'United Kingdom', users: 234, percentage: 18.8 },
          { country: 'Canada', users: 178, percentage: 14.3 },
          { country: 'Germany', users: 145, percentage: 11.6 },
          { country: 'Australia', users: 98, percentage: 7.9 },
          { country: 'Others', users: 136, percentage: 10.9 },
        ],
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load analytics data',
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserGrowthChartData = () => ({
    labels: analyticsData.userGrowth.labels,
    datasets: [
      {
        label: 'Total Users',
        data: analyticsData.userGrowth.data,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  });

  const getMessageVolumeChartData = () => ({
    labels: analyticsData.messageVolume.labels,
    datasets: [
      {
        label: 'Messages',
        data: analyticsData.messageVolume.data,
        backgroundColor: [
          'rgba(79, 70, 229, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(79, 70, 229)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  });

  const getFeatureUsageChartData = () => ({
    labels: analyticsData.topFeatures.map((f) => f.name),
    datasets: [
      {
        data: analyticsData.topFeatures.map((f) => f.usage),
        backgroundColor: [
          '#4f46e5',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
        ],
        hoverBackgroundColor: [
          '#6366f1',
          '#34d399',
          '#fbbf24',
          '#f87171',
          '#a78bfa',
        ],
      },
    ],
  });

  const metricOptions = [
    { label: 'Users', value: 'users' },
    { label: 'Messages', value: 'messages' },
    { label: 'Engagement', value: 'engagement' },
    { label: 'Performance', value: 'performance' },
  ];

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getHealthColor = (
    value: number,
    type: 'uptime' | 'response' | 'error'
  ) => {
    switch (type) {
      case 'uptime':
        return value >= 99.9 ? 'success' : value >= 99 ? 'warning' : 'danger';
      case 'response':
        return value <= 200 ? 'success' : value <= 500 ? 'warning' : 'danger';
      case 'error':
        return value <= 0.1 ? 'success' : value <= 1 ? 'warning' : 'danger';
      default:
        return 'info';
    }
  };

  return (
    <div className='system-analytics'>
      <Toast ref={toast} />

      {/* Controls */}
      <div className='flex flex-wrap gap-4 mb-6 items-center'>
        <div>
          <label className='block mb-2 text-sm font-medium'>Date Range</label>
          <Calendar
            value={dateRange}
            onChange={(e) => setDateRange(e.value as Date[])}
            selectionMode='range'
            readOnlyInput
            showButtonBar
          />
        </div>

        <div>
          <label className='block mb-2 text-sm font-medium'>Metric Type</label>
          <Dropdown
            value={selectedMetric}
            options={metricOptions}
            onChange={(e) => setSelectedMetric(e.value)}
            placeholder='Select metric'
          />
        </div>

        <div className='flex items-end'>
          <Button
            label='Refresh'
            icon='pi pi-refresh'
            onClick={loadAnalyticsData}
            loading={loading}
          />
        </div>

        <PermissionGuard permission={Permission.VIEW_ANALYTICS}>
          <div className='flex items-end'>
            <Button
              label='Export Report'
              icon='pi pi-download'
              className='p-button-outlined'
              onClick={() => {
                toast.current?.show({
                  severity: 'info',
                  summary: 'Export',
                  detail: 'Analytics export would be implemented here',
                });
              }}
            />
          </div>
        </PermissionGuard>
      </div>

      {/* Key Metrics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
        <Card className='text-center'>
          <div className='flex flex-col items-center'>
            <i className='pi pi-users text-4xl text-blue-500 mb-2' />
            <h3 className='text-2xl font-bold'>
              {analyticsData.userEngagement.dailyActiveUsers.toLocaleString()}
            </h3>
            <p className='text-gray-600'>Daily Active Users</p>
            <Badge
              value='+5.2%'
              severity='success'
            />
          </div>
        </Card>

        <Card className='text-center'>
          <div className='flex flex-col items-center'>
            <i className='pi pi-comments text-4xl text-green-500 mb-2' />
            <h3 className='text-2xl font-bold'>
              {analyticsData.messageVolume.data
                .reduce((a, b) => a + b, 0)
                .toLocaleString()}
            </h3>
            <p className='text-gray-600'>Total Messages</p>
            <Badge
              value='+12.8%'
              severity='success'
            />
          </div>
        </Card>

        <Card className='text-center'>
          <div className='flex flex-col items-center'>
            <i className='pi pi-clock text-4xl text-purple-500 mb-2' />
            <h3 className='text-2xl font-bold'>
              {formatDuration(
                analyticsData.userEngagement.averageSessionDuration
              )}
            </h3>
            <p className='text-gray-600'>Avg Session Duration</p>
            <Badge
              value='+2.1%'
              severity='info'
            />
          </div>
        </Card>

        <Card className='text-center'>
          <div className='flex flex-col items-center'>
            <i className='pi pi-chart-line text-4xl text-orange-500 mb-2' />
            <h3 className='text-2xl font-bold'>
              {analyticsData.systemMetrics.uptime}%
            </h3>
            <p className='text-gray-600'>System Uptime</p>
            <Badge
              value='Excellent'
              severity='success'
            />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
        <Card title='User Growth'>
          <div style={{ height: '300px' }}>
            <Chart
              type='line'
              data={getUserGrowthChartData()}
              options={chartOptions}
            />
          </div>
        </Card>

        <Card title='Message Volume'>
          <div style={{ height: '300px' }}>
            <Chart
              type='bar'
              data={getMessageVolumeChartData()}
              options={chartOptions}
            />
          </div>
        </Card>
      </div>

      {/* System Performance */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
        <Card title='System Performance'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='text-center'>
              <Knob
                value={analyticsData.systemMetrics.uptime}
                size={100}
                strokeWidth={8}
                valueColor={
                  analyticsData.systemMetrics.uptime >= 99.9
                    ? '#10b981'
                    : '#f59e0b'
                }
              />
              <p className='mt-2 font-medium'>Uptime</p>
              <p className='text-sm text-gray-600'>
                {analyticsData.systemMetrics.uptime}%
              </p>
            </div>

            <div className='space-y-4'>
              <div>
                <div className='flex justify-between items-center mb-1'>
                  <span className='text-sm'>Response Time</span>
                  <span className='text-sm font-medium'>
                    {analyticsData.systemMetrics.responseTime}ms
                  </span>
                </div>
                <ProgressBar
                  value={(500 - analyticsData.systemMetrics.responseTime) / 5}
                  color={getHealthColor(
                    analyticsData.systemMetrics.responseTime,
                    'response'
                  )}
                />
              </div>

              <div>
                <div className='flex justify-between items-center mb-1'>
                  <span className='text-sm'>Error Rate</span>
                  <span className='text-sm font-medium'>
                    {analyticsData.systemMetrics.errorRate}%
                  </span>
                </div>
                <ProgressBar
                  value={100 - analyticsData.systemMetrics.errorRate * 10}
                  color={getHealthColor(
                    analyticsData.systemMetrics.errorRate,
                    'error'
                  )}
                />
              </div>

              <div>
                <div className='flex justify-between items-center mb-1'>
                  <span className='text-sm'>Throughput</span>
                  <span className='text-sm font-medium'>
                    {analyticsData.systemMetrics.throughput} req/min
                  </span>
                </div>
                <ProgressBar
                  value={75}
                  color='info'
                />
              </div>
            </div>
          </div>
        </Card>

        <Card title='Feature Usage'>
          <div style={{ height: '300px' }}>
            <Chart
              type='doughnut'
              data={getFeatureUsageChartData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  },
                },
              }}
            />
          </div>
        </Card>
      </div>

      {/* Data Tables */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card title='Top Features'>
          <DataTable
            value={analyticsData.topFeatures}
            className='p-datatable-sm'
          >
            <Column
              field='name'
              header='Feature'
            />
            <Column
              field='usage'
              header='Usage %'
              body={(feature) => (
                <div className='flex items-center gap-2'>
                  <ProgressBar
                    value={feature.usage}
                    style={{ width: '60px', height: '6px' }}
                  />
                  <span className='text-sm'>{feature.usage}%</span>
                </div>
              )}
            />
            <Column
              field='growth'
              header='Growth'
              body={(feature) => (
                <Badge
                  value={`+${feature.growth}%`}
                  severity={
                    feature.growth > 20
                      ? 'success'
                      : feature.growth > 10
                        ? 'info'
                        : 'warning'
                  }
                />
              )}
            />
          </DataTable>
        </Card>

        <Card title='User Distribution by Country'>
          <DataTable
            value={analyticsData.geograficalData}
            className='p-datatable-sm'
          >
            <Column
              field='country'
              header='Country'
            />
            <Column
              field='users'
              header='Users'
              body={(data) => data.users.toLocaleString()}
            />
            <Column
              field='percentage'
              header='Share'
              body={(data) => (
                <div className='flex items-center gap-2'>
                  <ProgressBar
                    value={data.percentage}
                    style={{ width: '60px', height: '6px' }}
                  />
                  <span className='text-sm'>{data.percentage}%</span>
                </div>
              )}
            />
          </DataTable>
        </Card>
      </div>
    </div>
  );
};
