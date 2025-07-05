import { AuditLogs } from '@/components/Admin/AuditLogs';
import { FeatureFlagManagement } from '@/components/Admin/FeatureFlagManagement';
import { IntegrationManagement } from '@/components/Admin/IntegrationManagement';
import { RoleManagement } from '@/components/Admin/RoleManagement';
import { SettingsManagement } from '@/components/Admin/SettingsManagement';
import { AdminSubscriptionManagement } from '@/components/Admin/SubscriptionManagement';
import { SystemAnalytics } from '@/components/Admin/SystemAnalytics';
import { UserManagement } from '@/components/Admin/UserManagement';
import { AdminPanelGuard } from '@/components/common/RoleGuard';
import { useTheme } from '@/hooks/useTheme';
import {
  BUTTON_LABELS,
  PAGE_TITLES,
  STATUS_LABELS,
} from '@/utils/constants/generic/labels';
import { CSS_CLASSES } from '@/utils/constants/generic/styles';
import { UI_ICONS } from '@/utils/constants/generic/ui';
import { ROUTES } from '@/utils/constants/routingConstants';
import { useUserDataZState } from '@/zustandStates/userState';
import { useNavigate } from '@tanstack/react-router';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import { TabPanel, TabView } from 'primereact/tabview';
import React, { useState } from 'react';

const AdminDashboard: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { theme } = useTheme();
  const navigate = useNavigate();
  const currentUser = useUserDataZState((state) => state.data);

  // Show login prompt if not authenticated
  if (!currentUser) {
    return (
      <div
        className={`${CSS_CLASSES.FLEX.FLEX} ${CSS_CLASSES.FLEX.ITEMS_CENTER} ${CSS_CLASSES.FLEX.JUSTIFY_CENTER} ${CSS_CLASSES.LAYOUT.FULL_HEIGHT}`}
      >
        <Card>
          <div className={CSS_CLASSES.TYPOGRAPHY.TEXT_CENTER}>
            <h3
              className={`${CSS_CLASSES.TYPOGRAPHY.HEADING_MEDIUM} ${CSS_CLASSES.SPACING.MB_2}`}
            >
              Please Log In
            </h3>
            <p className={CSS_CLASSES.SPACING.MB_4}>
              You need to be logged in to access the admin dashboard.
            </p>
            <Button
              label={BUTTON_LABELS.SIGN_IN}
              icon={UI_ICONS.LOGIN}
              onClick={() => navigate({ to: ROUTES.AUTH })}
            />
          </div>
        </Card>
      </div>
    );
  }

  const overviewCards = [
    {
      title: 'User Roles',
      icon: UI_ICONS.PROFILE,
      count: '8',
      description: 'Active user roles',
      className: CSS_CLASSES.SPACING.MB_4,
    },
    {
      title: 'Permissions',
      icon: 'pi pi-shield',
      count: '24',
      description: 'System permissions',
      className: CSS_CLASSES.SPACING.MB_4,
    },
    {
      title: 'Subscription Plans',
      icon: UI_ICONS.CROWN,
      count: '3',
      description: 'Available plans',
      className: CSS_CLASSES.SPACING.MB_4,
    },
    {
      title: 'Feature Flags',
      icon: 'pi pi-flag',
      count: '12',
      description: 'Active feature flags',
      className: CSS_CLASSES.SPACING.MB_4,
    },
    {
      title: 'Settings',
      icon: UI_ICONS.SETTINGS,
      count: '15',
      description: 'System configurations',
      className: CSS_CLASSES.SPACING.MB_4,
    },
    {
      title: 'Version',
      icon: 'pi pi-info-circle',
      count: '1.0.0',
      description: 'Current app version',
      className: CSS_CLASSES.SPACING.MB_4,
    },
  ];

  const configDetails = [
    {
      label: 'Database Status',
      value: STATUS_LABELS.HEALTHY,
      status: 'success',
    },
    { label: 'API Status', value: STATUS_LABELS.HEALTHY, status: 'success' },
    { label: 'Cache Status', value: STATUS_LABELS.HEALTHY, status: 'success' },
    {
      label: 'Storage Status',
      value: STATUS_LABELS.HEALTHY,
      status: 'success',
    },
  ];

  const renderOverviewTab = () => (
    <div>
      <Panel
        header='System Overview'
        className={CSS_CLASSES.SPACING.MB_4}
      >
        <div className='grid'>
          {overviewCards.map((card, index) => (
            <div
              key={index}
              className='col-12 md:col-6 lg:col-4'
            >
              <Card title={card.title}>
                <div className={CSS_CLASSES.TYPOGRAPHY.TEXT_CENTER}>
                  <i
                    className={`${card.icon} ${CSS_CLASSES.TYPOGRAPHY.TEXT_LARGE} ${CSS_CLASSES.COLORS.TEXT_BLUE_600}`}
                  ></i>
                  <div
                    className={`${CSS_CLASSES.TYPOGRAPHY.HEADING_MEDIUM} ${CSS_CLASSES.COLORS.TEXT_BLUE_600}`}
                  >
                    {card.count}
                  </div>
                  <div className={CSS_CLASSES.TYPOGRAPHY.TEXT_SMALL}>
                    {card.description}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        header='Configuration Details'
        className={CSS_CLASSES.SPACING.MB_4}
      >
        <div className='grid'>
          {configDetails.map((detail, index) => (
            <div
              key={index}
              className='col-12 md:col-6'
            >
              <div
                className={`${CSS_CLASSES.FLEX.FLEX} ${CSS_CLASSES.FLEX.JUSTIFY_BETWEEN} ${CSS_CLASSES.FLEX.ITEMS_CENTER} ${CSS_CLASSES.SPACING.P_3} surface-border border-1 border-round-md`}
              >
                <span>{detail.label}</span>
                <span
                  className={`font-semibold ${detail.status === 'success' ? CSS_CLASSES.COLORS.TEXT_GREEN_600 : CSS_CLASSES.COLORS.TEXT_RED_600}`}
                >
                  {detail.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        header='Quick Actions'
        className={CSS_CLASSES.SPACING.MB_4}
      >
        <div
          className={`${CSS_CLASSES.FLEX.FLEX} ${CSS_CLASSES.FLEX.FLEX_WRAP} ${CSS_CLASSES.GRID.GAP_2}`}
        >
          <Button
            label='Backup System'
            icon='pi pi-download'
            severity='secondary'
            size='small'
          />
          <Button
            label='Clear Cache'
            icon='pi pi-refresh'
            severity='secondary'
            size='small'
          />
          <Button
            label='System Maintenance'
            icon='pi pi-cog'
            severity='warning'
            size='small'
          />
          <Button
            label='Export Logs'
            icon='pi pi-file-export'
            severity='secondary'
            size='small'
          />
        </div>
      </Panel>

      <Panel
        header='System Health Metrics'
        className={CSS_CLASSES.SPACING.MB_4}
      >
        <div className='grid'>
          <div className='col-12 md:col-3'>
            <Card className={CSS_CLASSES.TYPOGRAPHY.TEXT_CENTER}>
              <div
                className={`${CSS_CLASSES.TYPOGRAPHY.HEADING_MEDIUM} ${CSS_CLASSES.COLORS.TEXT_BLUE_600}`}
              >
                99.9%
              </div>
              <div className={CSS_CLASSES.TYPOGRAPHY.TEXT_SMALL}>Uptime</div>
            </Card>
          </div>
          <div className='col-12 md:col-3'>
            <Card className={CSS_CLASSES.TYPOGRAPHY.TEXT_CENTER}>
              <div
                className={`${CSS_CLASSES.TYPOGRAPHY.HEADING_MEDIUM} ${CSS_CLASSES.COLORS.TEXT_GREEN_600}`}
              >
                125ms
              </div>
              <div className={CSS_CLASSES.TYPOGRAPHY.TEXT_SMALL}>
                Avg Response
              </div>
            </Card>
          </div>
          <div className='col-12 md:col-3'>
            <Card className={CSS_CLASSES.TYPOGRAPHY.TEXT_CENTER}>
              <div
                className={`${CSS_CLASSES.TYPOGRAPHY.HEADING_MEDIUM} ${CSS_CLASSES.COLORS.TEXT_PURPLE_600}`}
              >
                1,247
              </div>
              <div className={CSS_CLASSES.TYPOGRAPHY.TEXT_SMALL}>
                Active Users
              </div>
            </Card>
          </div>
          <div className='col-12 md:col-3'>
            <Card className={CSS_CLASSES.TYPOGRAPHY.TEXT_CENTER}>
              <div
                className={`${CSS_CLASSES.TYPOGRAPHY.HEADING_MEDIUM} ${CSS_CLASSES.COLORS.TEXT_ORANGE_600}`}
              >
                23.4GB
              </div>
              <div className={CSS_CLASSES.TYPOGRAPHY.TEXT_SMALL}>
                Storage Used
              </div>
            </Card>
          </div>
        </div>
      </Panel>

      <SystemAnalytics />
    </div>
  );

  return (
    <AdminPanelGuard
      fallback={
        <div
          className={`${CSS_CLASSES.FLEX.FLEX} ${CSS_CLASSES.FLEX.ITEMS_CENTER} ${CSS_CLASSES.FLEX.JUSTIFY_CENTER} ${CSS_CLASSES.LAYOUT.FULL_HEIGHT}`}
        >
          <Card>
            <div className={CSS_CLASSES.TYPOGRAPHY.TEXT_CENTER}>
              <h3
                className={`${CSS_CLASSES.TYPOGRAPHY.HEADING_MEDIUM} ${CSS_CLASSES.SPACING.MB_2}`}
              >
                Access Denied
              </h3>
              <p className={CSS_CLASSES.SPACING.MB_4}>
                You do not have permission to access this page.
              </p>
              <Button
                label='Go to Login'
                icon={UI_ICONS.LOGIN}
                onClick={() => navigate({ to: ROUTES.AUTH })}
              />
            </div>
          </Card>
        </div>
      }
    >
      <div
        style={{
          background: theme.background,
          minHeight: '100vh',
          padding: '20px',
        }}
      >
        <div className={CSS_CLASSES.LAYOUT.CONTAINER}>
          <div
            className={`${CSS_CLASSES.FLEX.FLEX} ${CSS_CLASSES.FLEX.JUSTIFY_BETWEEN} ${CSS_CLASSES.FLEX.ITEMS_CENTER} ${CSS_CLASSES.SPACING.MB_4}`}
          >
            <h1
              className={`${CSS_CLASSES.TYPOGRAPHY.HEADING_LARGE} ${CSS_CLASSES.SPACING.M_0}`}
              style={{ color: theme.textPrimary }}
            >
              {PAGE_TITLES.ADMIN_DASHBOARD}
            </h1>
            <div
              className={`${CSS_CLASSES.FLEX.FLEX} ${CSS_CLASSES.GRID.GAP_2}`}
            >
              <Button
                label='Dashboard'
                icon={UI_ICONS.DASHBOARD}
                severity='secondary'
                size='small'
                onClick={() => navigate({ to: ROUTES.DASHBOARD })}
              />
              <Button
                label='Logout'
                icon={UI_ICONS.LOGOUT}
                severity='danger'
                size='small'
                onClick={() => navigate({ to: ROUTES.AUTH })}
              />
            </div>
          </div>

          <Card>
            <TabView
              activeIndex={activeIndex}
              onTabChange={(e) => setActiveIndex(e.index)}
            >
              <TabPanel
                header='Overview'
                leftIcon='pi pi-chart-line'
              >
                {renderOverviewTab()}
              </TabPanel>
              <TabPanel
                header='Users'
                leftIcon='pi pi-users'
              >
                <UserManagement />
              </TabPanel>
              <TabPanel
                header='Roles'
                leftIcon='pi pi-shield'
              >
                <RoleManagement />
              </TabPanel>
              <TabPanel
                header='Analytics'
                leftIcon='pi pi-chart-bar'
              >
                <SystemAnalytics />
              </TabPanel>
              <TabPanel
                header='Subscriptions'
                leftIcon='pi pi-credit-card'
              >
                <AdminSubscriptionManagement />
              </TabPanel>
              <TabPanel
                header='Feature Flags'
                leftIcon='pi pi-flag'
              >
                <FeatureFlagManagement />
              </TabPanel>
              <TabPanel
                header='Settings'
                leftIcon='pi pi-cog'
              >
                <SettingsManagement />
              </TabPanel>
              <TabPanel
                header='Integrations'
                leftIcon='pi pi-link'
              >
                <IntegrationManagement />
              </TabPanel>
              <TabPanel
                header='Audit Logs'
                leftIcon='pi pi-history'
              >
                <AuditLogs />
              </TabPanel>
            </TabView>
          </Card>
        </div>
      </div>
    </AdminPanelGuard>
  );
};

export default AdminDashboard;
