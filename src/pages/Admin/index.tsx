import { AuditLogs } from '@/components/Admin/AuditLogs';
import { FeatureFlagManagement } from '@/components/Admin/FeatureFlagManagement';
import { IntegrationManagement } from '@/components/Admin/IntegrationManagement';
import { RoleManagement } from '@/components/Admin/RoleManagement';
import { SettingsManagement } from '@/components/Admin/SettingsManagement';
import { AdminSubscriptionManagement } from '@/components/Admin/SubscriptionManagement';
import { SystemAnalytics } from '@/components/Admin/SystemAnalytics';
import { UserManagement } from '@/components/Admin/UserManagement';
import {
  AdminPanelGuard,
  RoleBadge,
  useRoleCheck,
} from '@/components/common/RoleGuard';
import { Permission } from '@/types/user/roles';
import { useUserDataZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Chip } from 'primereact/chip';
import { ProgressBar } from 'primereact/progressbar';
import { TabPanel, TabView } from 'primereact/tabview';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';

interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalMessages: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  uptime: string;
  memoryUsage: number;
  cpuUsage: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const currentUser = useUserDataZState((state) => state.data);
  const { hasPermission, getUserRoleConfig } = useRoleCheck();

  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalMessages: 0,
    systemHealth: 'healthy',
    uptime: '99.9%',
    memoryUsage: 65,
    cpuUsage: 45,
  });

  const [chartData, setChartData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Users',
        data: [65, 59, 80, 81, 56, 55],
        fill: false,
        borderColor: '#4f46e5',
        backgroundColor: '#4f46e5',
        tension: 0.1,
      },
      {
        label: 'Messages',
        data: [28, 48, 40, 19, 86, 27],
        fill: false,
        borderColor: '#10b981',
        backgroundColor: '#10b981',
        tension: 0.1,
      },
    ],
  });

  const [chartOptions] = useState({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'User Activity & Messages Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  });

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulate API calls to get dashboard stats
      // In a real app, these would be actual API calls
      setStats({
        totalUsers: 1247,
        activeUsers: 892,
        newUsersToday: 23,
        totalMessages: 15678,
        systemHealth: 'healthy',
        uptime: '99.9%',
        memoryUsage: 65,
        cpuUsage: 45,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load dashboard data',
      });
    }
  };

  const getHealthColor = (health: AdminDashboardStats['systemHealth']) => {
    switch (health) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'danger';
      default:
        return 'info';
    }
  };

  const getUsageColor = (usage: number) => {
    if (usage > 80) return 'danger';
    if (usage > 60) return 'warning';
    return 'success';
  };

  if (!currentUser) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <div className='text-center'>
          <h2>Please log in to access the admin panel</h2>
          <Button
            label='Go to Login'
            onClick={() => navigate('/auth/login')}
            className='mt-3'
          />
        </div>
      </div>
    );
  }

  return (
    <AdminPanelGuard
      fallback={
        <div className='flex justify-center items-center h-screen'>
          <div className='text-center'>
            <h2>Access Denied</h2>
            <p>You don't have permission to access the admin panel.</p>
            <Button
              label='Go Back'
              onClick={() => navigate('/')}
              className='mt-3'
            />
          </div>
        </div>
      }
    >
      <div className='admin-dashboard p-4'>
        <Toast ref={toast} />

        {/* Header */}
        <div className='flex justify-between items-center mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-gray-800'>
              Admin Dashboard
            </h1>
            <p className='text-gray-600 mt-1'>
              Welcome back, {currentUser.displayName || currentUser.email}
            </p>
          </div>
          <div className='flex items-center gap-3'>
            <RoleBadge
              role={currentUser.role!}
              size='medium'
            />
            <Button
              icon='pi pi-refresh'
              label='Refresh'
              onClick={loadDashboardData}
              className='p-button-outlined'
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
          <Card className='text-center'>
            <div className='flex flex-col items-center'>
              <i className='pi pi-users text-4xl text-blue-500 mb-2' />
              <h3 className='text-2xl font-bold'>
                {stats.totalUsers.toLocaleString()}
              </h3>
              <p className='text-gray-600'>Total Users</p>
              <Badge
                value={`+${stats.newUsersToday}`}
                severity='success'
              />
            </div>
          </Card>

          <Card className='text-center'>
            <div className='flex flex-col items-center'>
              <i className='pi pi-user-edit text-4xl text-green-500 mb-2' />
              <h3 className='text-2xl font-bold'>
                {stats.activeUsers.toLocaleString()}
              </h3>
              <p className='text-gray-600'>Active Users</p>
              <Badge
                value={`${((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}%`}
                severity='info'
              />
            </div>
          </Card>

          <Card className='text-center'>
            <div className='flex flex-col items-center'>
              <i className='pi pi-comments text-4xl text-purple-500 mb-2' />
              <h3 className='text-2xl font-bold'>
                {stats.totalMessages.toLocaleString()}
              </h3>
              <p className='text-gray-600'>Total Messages</p>
              <Badge
                value='24h'
                severity='warning'
              />
            </div>
          </Card>

          <Card className='text-center'>
            <div className='flex flex-col items-center'>
              <i className='pi pi-heart text-4xl text-red-500 mb-2' />
              <h3 className='text-2xl font-bold'>{stats.uptime}</h3>
              <p className='text-gray-600'>System Uptime</p>
              <Badge
                value={stats.systemHealth}
                severity={getHealthColor(stats.systemHealth)}
              />
            </div>
          </Card>
        </div>

        {/* System Health */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          <Card title='System Performance'>
            <div className='space-y-4'>
              <div>
                <div className='flex justify-between items-center mb-2'>
                  <span>Memory Usage</span>
                  <span className='font-bold'>{stats.memoryUsage}%</span>
                </div>
                <ProgressBar
                  value={stats.memoryUsage}
                  color={getUsageColor(stats.memoryUsage)}
                />
              </div>

              <div>
                <div className='flex justify-between items-center mb-2'>
                  <span>CPU Usage</span>
                  <span className='font-bold'>{stats.cpuUsage}%</span>
                </div>
                <ProgressBar
                  value={stats.cpuUsage}
                  color={getUsageColor(stats.cpuUsage)}
                />
              </div>
            </div>
          </Card>

          <Card title='Quick Actions'>
            <div className='grid grid-cols-2 gap-3'>
              {hasPermission(Permission.VIEW_USERS) && (
                <Button
                  icon='pi pi-users'
                  label='Manage Users'
                  onClick={() => setActiveTab(1)}
                  className='p-button-outlined'
                />
              )}

              {hasPermission(Permission.MANAGE_SETTINGS) && (
                <Button
                  icon='pi pi-cog'
                  label='Settings'
                  onClick={() => setActiveTab(3)}
                  className='p-button-outlined'
                />
              )}

              {hasPermission(Permission.VIEW_ANALYTICS) && (
                <Button
                  icon='pi pi-chart-bar'
                  label='Analytics'
                  onClick={() => setActiveTab(2)}
                  className='p-button-outlined'
                />
              )}

              {hasPermission(Permission.VIEW_LOGS) && (
                <Button
                  icon='pi pi-file-o'
                  label='Audit Logs'
                  onClick={() => setActiveTab(4)}
                  className='p-button-outlined'
                />
              )}
            </div>
          </Card>
        </div>

        {/* Analytics Chart */}
        <Card
          title='Analytics Overview'
          className='mb-6'
        >
          <div style={{ height: '400px' }}>
            <Chart
              type='line'
              data={chartData}
              options={chartOptions}
            />
          </div>
        </Card>

        {/* Admin Tabs */}
        <Card>
          <TabView
            activeIndex={activeTab}
            onTabChange={(e) => setActiveTab(e.index)}
          >
            <TabPanel
              header='Dashboard'
              leftIcon='pi pi-home'
            >
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div>
                  <h3 className='text-lg font-semibold mb-3'>
                    Recent Activity
                  </h3>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between p-3 bg-gray-50 rounded'>
                      <div>
                        <p className='font-medium'>New user registration</p>
                        <p className='text-sm text-gray-600'>
                          john.doe@example.com
                        </p>
                      </div>
                      <Chip
                        label='2 min ago'
                        className='text-xs'
                      />
                    </div>
                    <div className='flex items-center justify-between p-3 bg-gray-50 rounded'>
                      <div>
                        <p className='font-medium'>Role assignment</p>
                        <p className='text-sm text-gray-600'>
                          User promoted to Moderator
                        </p>
                      </div>
                      <Chip
                        label='5 min ago'
                        className='text-xs'
                      />
                    </div>
                    <div className='flex items-center justify-between p-3 bg-gray-50 rounded'>
                      <div>
                        <p className='font-medium'>System backup</p>
                        <p className='text-sm text-gray-600'>
                          Completed successfully
                        </p>
                      </div>
                      <Chip
                        label='1 hour ago'
                        className='text-xs'
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className='text-lg font-semibold mb-3'>System Status</h3>
                  <div className='space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span>Database</span>
                      <Badge
                        value='Online'
                        severity='success'
                      />
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>Redis Cache</span>
                      <Badge
                        value='Online'
                        severity='success'
                      />
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>Email Service</span>
                      <Badge
                        value='Online'
                        severity='success'
                      />
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>File Storage</span>
                      <Badge
                        value='Online'
                        severity='success'
                      />
                    </div>
                    <div className='flex items-center justify-between'>
                      <span>Push Notifications</span>
                      <Badge
                        value='Online'
                        severity='success'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>

            {hasPermission(Permission.VIEW_USERS) && (
              <TabPanel
                header='User Management'
                leftIcon='pi pi-users'
              >
                <UserManagement />
              </TabPanel>
            )}

            {hasPermission(Permission.VIEW_ANALYTICS) && (
              <TabPanel
                header='Analytics'
                leftIcon='pi pi-chart-bar'
              >
                <SystemAnalytics />
              </TabPanel>
            )}

            {hasPermission(Permission.MANAGE_SETTINGS) && (
              <TabPanel
                header='Settings'
                leftIcon='pi pi-cog'
              >
                <SettingsManagement />
              </TabPanel>
            )}

            {hasPermission(Permission.VIEW_LOGS) && (
              <TabPanel
                header='Audit Logs'
                leftIcon='pi pi-file-o'
              >
                <AuditLogs />
              </TabPanel>
            )}

            {hasPermission(Permission.ASSIGN_ROLES) && (
              <TabPanel
                header='Role Management'
                leftIcon='pi pi-shield'
              >
                <RoleManagement />
              </TabPanel>
            )}

            {hasPermission(Permission.MANAGE_INTEGRATIONS) && (
              <TabPanel
                header='Integrations'
                leftIcon='pi pi-link'
              >
                <IntegrationManagement />
              </TabPanel>
            )}

            {hasPermission(Permission.MANAGE_FEATURE_FLAGS) && (
              <TabPanel
                header='Feature Flags'
                leftIcon='pi pi-flag'
              >
                <FeatureFlagManagement />
              </TabPanel>
            )}

            {hasPermission(Permission.MANAGE_SUBSCRIPTIONS) && (
              <TabPanel
                header='Subscriptions'
                leftIcon='pi pi-credit-card'
              >
                <AdminSubscriptionManagement />
              </TabPanel>
            )}
          </TabView>
        </Card>
      </div>
    </AdminPanelGuard>
  );
};

export default AdminDashboard;
