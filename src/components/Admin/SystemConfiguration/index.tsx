import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { TabPanel, TabView } from 'primereact/tabview';
import React, { useState } from 'react';
import { useSystemConfigStore } from '../../../zustandStates/systemConfigState';
import SystemFeatureFlagManagement from './SystemFeatureFlagManagement';
import SystemPermissionManagement from './SystemPermissionManagement';
import SystemRoleManagement from './SystemRoleManagement';
import SystemSettingsManagement from './SystemSettingsManagement';
import SystemSubscriptionPlanManagement from './SystemSubscriptionPlanManagement';

const SystemConfigurationAdmin: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { config, isLoading, error, refreshConfig, lastUpdated } =
    useSystemConfigStore();

  const handleRefreshConfig = async () => {
    try {
      await refreshConfig();
    } catch (error) {
      console.error('Failed to refresh configuration:', error);
    }
  };

  const getTabCounts = () => {
    return {
      roles: config.roles.length,
      permissions: config.permissions.length,
      plans: config.subscriptionPlans.length,
      flags: config.featureFlags.length,
      settings: config.settings.length,
    };
  };

  const counts = getTabCounts();

  return (
    <div className='system-configuration-admin'>
      <div className='flex justify-content-between align-items-center mb-4'>
        <div>
          <h2 className='text-2xl font-bold text-900 mb-2'>
            System Configuration
          </h2>
          <p className='text-600 m-0'>
            Manage system-wide settings, roles, permissions, and configurations
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            icon='pi pi-refresh'
            label='Refresh'
            onClick={handleRefreshConfig}
            loading={isLoading}
            outlined
            size='small'
          />
          {lastUpdated && (
            <div className='flex align-items-center gap-2 text-sm text-600'>
              <i className='pi pi-clock'></i>
              <span>
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <Card className='mb-4 border-red-200 bg-red-50'>
          <div className='flex align-items-center gap-2 text-red-700'>
            <i className='pi pi-exclamation-triangle'></i>
            <span>Error: {error}</span>
          </div>
        </Card>
      )}

      <Card className='mb-4'>
        <div className='grid'>
          <div className='col-12 md:col-4 lg:col-2'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {counts.roles}
              </div>
              <div className='text-sm text-600'>Roles</div>
            </div>
          </div>
          <div className='col-12 md:col-4 lg:col-2'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {counts.permissions}
              </div>
              <div className='text-sm text-600'>Permissions</div>
            </div>
          </div>
          <div className='col-12 md:col-4 lg:col-2'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-orange-600'>
                {counts.plans}
              </div>
              <div className='text-sm text-600'>Subscription Plans</div>
            </div>
          </div>
          <div className='col-12 md:col-4 lg:col-2'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-purple-600'>
                {counts.flags}
              </div>
              <div className='text-sm text-600'>Feature Flags</div>
            </div>
          </div>
          <div className='col-12 md:col-4 lg:col-2'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-teal-600'>
                {counts.settings}
              </div>
              <div className='text-sm text-600'>Settings</div>
            </div>
          </div>
          <div className='col-12 md:col-4 lg:col-2'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-indigo-600'>
                {config.version}
              </div>
              <div className='text-sm text-600'>Version</div>
            </div>
          </div>
        </div>
      </Card>

      <TabView
        activeIndex={activeIndex}
        onTabChange={(e) => setActiveIndex(e.index)}
        className='system-config-tabs'
      >
        <TabPanel
          header={
            <div className='flex align-items-center gap-2'>
              <i className='pi pi-users'></i>
              <span>Roles</span>
              <Badge
                value={counts.roles}
                severity='info'
              />
            </div>
          }
        >
          <SystemRoleManagement />
        </TabPanel>

        <TabPanel
          header={
            <div className='flex align-items-center gap-2'>
              <i className='pi pi-shield'></i>
              <span>Permissions</span>
              <Badge
                value={counts.permissions}
                severity='success'
              />
            </div>
          }
        >
          <SystemPermissionManagement />
        </TabPanel>

        <TabPanel
          header={
            <div className='flex align-items-center gap-2'>
              <i className='pi pi-credit-card'></i>
              <span>Subscription Plans</span>
              <Badge
                value={counts.plans}
                severity='warning'
              />
            </div>
          }
        >
          <SystemSubscriptionPlanManagement />
        </TabPanel>

        <TabPanel
          header={
            <div className='flex align-items-center gap-2'>
              <i className='pi pi-flag'></i>
              <span>Feature Flags</span>
              <Badge
                value={counts.flags}
                severity='help'
              />
            </div>
          }
        >
          <SystemFeatureFlagManagement />
        </TabPanel>

        <TabPanel
          header={
            <div className='flex align-items-center gap-2'>
              <i className='pi pi-cog'></i>
              <span>Settings</span>
              <Badge
                value={counts.settings}
                severity='secondary'
              />
            </div>
          }
        >
          <SystemSettingsManagement />
        </TabPanel>
      </TabView>
    </div>
  );
};

export default SystemConfigurationAdmin;
