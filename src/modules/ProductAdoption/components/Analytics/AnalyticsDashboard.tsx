import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { ProgressBar } from 'primereact/progressbar';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { useAnalyticsOverview } from '../../hooks';
import { AnalyticsFilter, DateRange } from '../../types';
import { formatNumber, formatPercentage, formatDuration } from '../../utils';
import './AnalyticsDashboard.scss';

export const AnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
    preset: 'last-30-days',
  });

  const filter: AnalyticsFilter = { dateRange };
  const { analytics, isLoading, refetch } = useAnalyticsOverview(filter);

  const datePresets = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 Days', value: 'last-7-days' },
    { label: 'Last 30 Days', value: 'last-30-days' },
    { label: 'Last 90 Days', value: 'last-90-days' },
    { label: 'Custom', value: 'custom' },
  ];

  const handleDatePresetChange = (preset: string) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (preset) {
      case 'today':
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date();
        break;
      case 'yesterday':
        start = new Date(now.setDate(now.getDate() - 1));
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setHours(23, 59, 59, 999);
        break;
      case 'last-7-days':
        start = new Date(now.setDate(now.getDate() - 7));
        end = new Date();
        break;
      case 'last-30-days':
        start = new Date(now.setDate(now.getDate() - 30));
        end = new Date();
        break;
      case 'last-90-days':
        start = new Date(now.setDate(now.getDate() - 90));
        end = new Date();
        break;
    }

    setDateRange({ start, end, preset });
  };

  const chartData = {
    labels: ['Impressions', 'Starts', 'Completions'],
    datasets: [
      {
        label: 'Tour Metrics',
        data: [
          analytics?.totalImpressions || 0,
          analytics?.totalStarts || 0,
          analytics?.totalCompletions || 0,
        ],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (isLoading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>Product Adoption Analytics</h2>
        <div className="analytics-controls">
          <Dropdown
            value={dateRange.preset}
            options={datePresets}
            onChange={(e) => handleDatePresetChange(e.value)}
            placeholder="Select date range"
          />
          {dateRange.preset === 'custom' && (
            <>
              <Calendar
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.value as Date })}
                placeholder="Start date"
              />
              <Calendar
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.value as Date })}
                placeholder="End date"
              />
            </>
          )}
          <Button
            icon="pi pi-refresh"
            className="p-button-outlined"
            onClick={() => refetch()}
          />
        </div>
      </div>

      <div className="analytics-overview">
        <Card className="metric-card">
          <div className="metric-content">
            <span className="metric-label">Total Tours</span>
            <span className="metric-value">{analytics?.totalTours || 0}</span>
            <span className="metric-sublabel">
              {analytics?.activeTours || 0} active
            </span>
          </div>
        </Card>

        <Card className="metric-card">
          <div className="metric-content">
            <span className="metric-label">Impressions</span>
            <span className="metric-value">
              {formatNumber(analytics?.totalImpressions || 0)}
            </span>
          </div>
        </Card>

        <Card className="metric-card">
          <div className="metric-content">
            <span className="metric-label">Tour Starts</span>
            <span className="metric-value">
              {formatNumber(analytics?.totalStarts || 0)}
            </span>
          </div>
        </Card>

        <Card className="metric-card">
          <div className="metric-content">
            <span className="metric-label">Completions</span>
            <span className="metric-value">
              {formatNumber(analytics?.totalCompletions || 0)}
            </span>
          </div>
        </Card>

        <Card className="metric-card">
          <div className="metric-content">
            <span className="metric-label">Avg. Completion Rate</span>
            <span className="metric-value">
              {formatPercentage(analytics?.averageCompletionRate || 0)}
            </span>
            <ProgressBar
              value={analytics?.averageCompletionRate || 0}
              showValue={false}
              style={{ height: '6px', marginTop: '8px' }}
            />
          </div>
        </Card>
      </div>

      <div className="analytics-charts">
        <Card title="Tour Performance Overview" className="chart-card">
          <Chart type="bar" data={chartData} options={chartOptions} />
        </Card>

        <Card title="Top Performing Tours" className="performance-card">
          <DataTable
            value={analytics?.topPerformingTours || []}
            paginator
            rows={5}
            emptyMessage="No tours found"
          >
            <Column field="tourName" header="Tour Name" />
            <Column
              field="impressions"
              header="Impressions"
              body={(rowData) => formatNumber(rowData.impressions)}
            />
            <Column
              field="completionRate"
              header="Completion Rate"
              body={(rowData) => (
                <div className="completion-rate">
                  <span>{formatPercentage(rowData.completionRate)}</span>
                  <ProgressBar
                    value={rowData.completionRate}
                    showValue={false}
                    style={{ height: '4px', marginTop: '4px' }}
                  />
                </div>
              )}
            />
            <Column
              field="averageTimeToComplete"
              header="Avg. Time"
              body={(rowData) => formatDuration(rowData.averageTimeToComplete)}
            />
            <Column
              body={(rowData) => (
                <Button
                  icon="pi pi-chart-line"
                  className="p-button-text p-button-sm"
                  tooltip="View details"
                />
              )}
            />
          </DataTable>
        </Card>
      </div>

      <Card title="Recent Activity" className="activity-card">
        <DataTable
          value={analytics?.recentActivity || []}
          paginator
          rows={10}
          emptyMessage="No recent activity"
        >
          <Column
            field="timestamp"
            header="Time"
            body={(rowData) => new Date(rowData.timestamp).toLocaleString()}
          />
          <Column field="action" header="Action" />
          <Column field="tourName" header="Tour" />
          <Column field="userEmail" header="User" />
        </DataTable>
      </Card>
    </div>
  );
};