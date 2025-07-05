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
import { useSystemConfigStore } from '@/zustandStates/systemConfigState';
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

// System Configuration Component
const SystemConfigurationTab: React.FC = () => {
  const { config, isLoading, refreshConfig } = useSystemConfigStore();

  const handleRefresh = async () => {
    try {
      await refreshConfig();
    } catch (error) {
      console.error('Failed to refresh configuration:', error);
    }
  };

  return (
    <div className='system-configuration'>
      <div className='flex justify-content-between align-items-center mb-4'>
        <div>
          <h3 className='text-2xl font-bold text-900 mb-2'>
            System Configuration
          </h3>
          <p className='text-600 m-0'>
            Manage system-wide settings, roles, permissions, and configurations
          </p>
        </div>
        <Button
          icon='pi pi-refresh'
          label='Refresh'
          onClick={handleRefresh}
          loading={isLoading}
          outlined
          size='small'
        />
      </div>

      <div className='grid'>
        <div className='col-12 md:col-6 lg:col-4'>
          <Card
            title='Roles'
            className='mb-4'
          >
            <div className='text-center'>
              <div className='text-3xl font-bold text-blue-600 mb-2'>
                {config.roles.length}
              </div>
              <p className='text-600 m-0'>System roles configured</p>
            </div>
          </Card>
        </div>

        <div className='col-12 md:col-6 lg:col-4'>
          <Card
            title='Permissions'
            className='mb-4'
          >
            <div className='text-center'>
              <div className='text-3xl font-bold text-green-600 mb-2'>
                {config.permissions.length}
              </div>
              <p className='text-600 m-0'>Permissions available</p>
            </div>
          </Card>
        </div>

        <div className='col-12 md:col-6 lg:col-4'>
          <Card
            title='Subscription Plans'
            className='mb-4'
          >
            <div className='text-center'>
              <div className='text-3xl font-bold text-orange-600 mb-2'>
                {config.subscriptionPlans.length}
              </div>
              <p className='text-600 m-0'>Plans available</p>
            </div>
          </Card>
        </div>

        <div className='col-12 md:col-6 lg:col-4'>
          <Card
            title='Feature Flags'
            className='mb-4'
          >
            <div className='text-center'>
              <div className='text-3xl font-bold text-purple-600 mb-2'>
                {config.featureFlags.length}
              </div>
              <p className='text-600 m-0'>Feature flags configured</p>
            </div>
          </Card>
        </div>

        <div className='col-12 md:col-6 lg:col-4'>
          <Card
            title='Settings'
            className='mb-4'
          >
            <div className='text-center'>
              <div className='text-3xl font-bold text-teal-600 mb-2'>
                {config.settings.length}
              </div>
              <p className='text-600 m-0'>System settings</p>
            </div>
          </Card>
        </div>

        <div className='col-12 md:col-6 lg:col-4'>
          <Card
            title='Version'
            className='mb-4'
          >
            <div className='text-center'>
              <div className='text-3xl font-bold text-indigo-600 mb-2'>
                {config.version}
              </div>
              <p className='text-600 m-0'>Current version</p>
            </div>
          </Card>
        </div>
      </div>

      <Card
        title='Configuration Details'
        className='mt-4'
      >
        <div className='grid'>
          <div className='col-12 md:col-6'>
            <h4>Active Roles</h4>
            <ul className='list-none p-0 m-0'>
              {config.roles
                .filter((role) => role.isActive)
                .map((role) => (
                  <li
                    key={role.id}
                    className='flex align-items-center gap-2 mb-2'
                  >
                    <i className={`pi ${role.icon} text-blue-600`}></i>
                    <span className='font-semibold'>{role.displayName}</span>
                    <span className='text-sm text-600'>
                      - {role.description}
                    </span>
                  </li>
                ))}
            </ul>
          </div>

          <div className='col-12 md:col-6'>
            <h4>Active Subscription Plans</h4>
            <ul className='list-none p-0 m-0'>
              {config.subscriptionPlans
                .filter((plan) => plan.isActive)
                .map((plan) => (
                  <li
                    key={plan.id}
                    className='flex align-items-center gap-2 mb-2'
                  >
                    <i className='pi pi-credit-card text-orange-600'></i>
                    <span className='font-semibold'>{plan.displayName}</span>
                    <span className='text-sm text-600'>
                      - ${plan.price}/{plan.interval}
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

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
            onClick={() => navigate({ to: '/auth' })}
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
              onClick={() => navigate({ to: '/' })}
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

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
          <Card className='text-center'>
            <div className='text-2xl font-bold text-blue-600'>
              {stats.totalUsers.toLocaleString()}
            </div>
            <div className='text-sm text-gray-600'>Total Users</div>
            <div className='flex items-center justify-center mt-2'>
              <Chip
                label={`+${stats.newUsersToday} today`}
                className='text-xs bg-blue-100 text-blue-800'
              />
            </div>
          </Card>

          <Card className='text-center'>
            <div className='text-2xl font-bold text-green-600'>
              {stats.activeUsers.toLocaleString()}
            </div>
            <div className='text-sm text-gray-600'>Active Users</div>
            <div className='flex items-center justify-center mt-2'>
              <Badge
                value={`${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%`}
                severity='success'
              />
            </div>
          </Card>

          <Card className='text-center'>
            <div className='text-2xl font-bold text-purple-600'>
              {stats.totalMessages.toLocaleString()}
            </div>
            <div className='text-sm text-gray-600'>Total Messages</div>
            <div className='flex items-center justify-center mt-2'>
              <Badge
                value='Active'
                severity='info'
              />
            </div>
          </Card>

          <Card className='text-center'>
            <div className='text-2xl font-bold text-orange-600'>
              {stats.uptime}
            </div>
            <div className='text-sm text-gray-600'>Uptime</div>
            <div className='flex items-center justify-center mt-2'>
              <Badge
                value={stats.systemHealth}
                severity={getHealthColor(stats.systemHealth)}
              />
            </div>
          </Card>
        </div>

        {/* System Health */}
        <Card
          title='System Health'
          className='mb-6'
        >
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='font-medium'>Memory Usage</span>
                <span className='text-sm text-gray-600'>
                  {stats.memoryUsage}%
                </span>
              </div>
              <ProgressBar
                value={stats.memoryUsage}
                color={getUsageColor(stats.memoryUsage)}
                className='h-2'
              />
            </div>
            <div>
              <div className='flex justify-between items-center mb-2'>
                <span className='font-medium'>CPU Usage</span>
                <span className='text-sm text-gray-600'>{stats.cpuUsage}%</span>
              </div>
              <ProgressBar
                value={stats.cpuUsage}
                color={getUsageColor(stats.cpuUsage)}
                className='h-2'
              />
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card
          title='Quick Actions'
          className='mb-6'
        >
          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
            {hasPermission(Permission.VIEW_USERS) && (
              <Button
                icon='pi pi-users'
                label='Users'
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

            {hasPermission(Permission.MANAGE_SETTINGS) && (
              <Button
                icon='pi pi-wrench'
                label='System Config'
                onClick={() => setActiveTab(9)}
                className='p-button-outlined'
              />
            )}
          </div>
        </Card>

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

            {hasPermission(Permission.MANAGE_SETTINGS) && (
              <TabPanel
                header='System Configuration'
                leftIcon='pi pi-wrench'
              >
                <SystemConfigurationTab />
              </TabPanel>
            )}
          </TabView>
        </Card>
      </div>
    </AdminPanelGuard>
  );
};

export default AdminDashboard;
