import { PermissionGuard } from '@/components/common/RoleGuard';
import { logError } from '@/sentryErrorLogging';
import {
  AdvancedFeatureFlag,
  advancedFeatureFlagService,
} from '@/services/advancedFeatureFlagService';
import { Permission } from '@/types/user/roles';
import { useUserDataZState } from '@/zustandStates/userState';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Chip } from 'primereact/chip';
import { Column } from 'primereact/column';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { ProgressBar } from 'primereact/progressbar';
import { TabPanel, TabView } from 'primereact/tabview';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// Use the AdvancedFeatureFlag interface from the service
type FeatureFlag = AdvancedFeatureFlag;

export const FeatureFlagManagement: React.FC = () => {
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const [editingFlag, setEditingFlag] = useState<Partial<FeatureFlag>>({});
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('all');

  // Get current user for creating flags
  const userData = useUserDataZState((state) => state.data);

  const environments = [
    { label: 'All Environments', value: 'all' },
    { label: 'Development', value: 'development' },
    { label: 'Staging', value: 'staging' },
    { label: 'Production', value: 'production' },
  ];

  const flagTypes = [
    { label: 'Boolean', value: 'boolean' },
    { label: 'String', value: 'string' },
    { label: 'Number', value: 'number' },
    { label: 'JSON', value: 'json' },
    { label: 'Percentage', value: 'percentage' },
  ];

  const loadFeatureFlags = useCallback(async () => {
    setLoading(true);
    try {
      const flags = await advancedFeatureFlagService.getFeatureFlags(
        selectedEnvironment === 'all' ? undefined : selectedEnvironment
      );
      setFeatureFlags(flags);
    } catch (error) {
      console.error('Error loading feature flags:', error);
      logError(
        error instanceof Error
          ? error
          : new Error('Failed to load feature flags')
      );
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load feature flags',
        life: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [selectedEnvironment]);

  useEffect(() => {
    loadFeatureFlags();
  }, [loadFeatureFlags]);

  const getStatusColor = (status: FeatureFlag['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'scheduled':
        return 'info';
      case 'expired':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const renderFlagStatus = (flag: FeatureFlag) => {
    return (
      <div className='flex items-center gap-2'>
        <Tag
          value={flag.status.toUpperCase()}
          severity={getStatusColor(flag.status)}
        />
        {flag.status === 'scheduled' && flag.scheduledStart && (
          <span className='text-sm text-gray-500'>
            Starts: {flag.scheduledStart.toLocaleDateString()}
          </span>
        )}
      </div>
    );
  };

  const renderRolloutPercentage = (flag: FeatureFlag) => {
    return (
      <div className='flex items-center gap-2'>
        <ProgressBar
          value={flag.rolloutPercentage}
          style={{ width: '100px' }}
        />
        <span className='text-sm'>{flag.rolloutPercentage}%</span>
      </div>
    );
  };

  const renderTargeting = (flag: FeatureFlag) => {
    return (
      <div className='flex items-center gap-2'>
        <Tag
          value={flag.targeting.enabled ? 'ENABLED' : 'DISABLED'}
          severity={flag.targeting.enabled ? 'success' : 'secondary'}
        />
        {flag.targeting.enabled && (
          <Badge value={flag.targeting.rules.length} />
        )}
      </div>
    );
  };

  const renderTags = (flag: FeatureFlag) => {
    return (
      <div className='flex flex-wrap gap-1'>
        {flag.tags.slice(0, 3).map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            className='text-xs'
          />
        ))}
        {flag.tags.length > 3 && (
          <Chip
            label={`+${flag.tags.length - 3}`}
            className='text-xs'
          />
        )}
      </div>
    );
  };

  const renderActions = (flag: FeatureFlag) => {
    return (
      <div className='flex gap-2'>
        <Button
          icon='pi pi-chart-bar'
          className='p-button-sm p-button-outlined'
          tooltip='Analytics'
          onClick={() => {
            setSelectedFlag(flag);
            setShowAnalyticsDialog(true);
          }}
        />

        <Button
          icon='pi pi-pencil'
          className='p-button-sm p-button-outlined'
          tooltip='Edit'
          onClick={() => {
            setSelectedFlag(flag);
            setEditingFlag(flag);
            setShowEditDialog(true);
          }}
        />

        <PermissionGuard permission={Permission.MANAGE_FEATURE_FLAGS}>
          <Button
            icon={flag.status === 'active' ? 'pi pi-pause' : 'pi pi-play'}
            className={`p-button-sm p-button-outlined ${
              flag.status === 'active' ? 'p-button-warning' : 'p-button-success'
            }`}
            tooltip={flag.status === 'active' ? 'Disable' : 'Enable'}
            onClick={() => toggleFlag(flag)}
          />
        </PermissionGuard>
      </div>
    );
  };

  const toggleFlag = async (flag: FeatureFlag) => {
    if (!flag.id) return;

    try {
      const newStatus: FeatureFlag['status'] =
        flag.status === 'active' ? 'inactive' : 'active';

      await advancedFeatureFlagService.updateFeatureFlag(flag.id, {
        status: newStatus,
      });

      // Update local state
      const updatedFlags = featureFlags.map((f) =>
        f.id === flag.id
          ? { ...f, status: newStatus, updatedAt: new Date() }
          : f
      );
      setFeatureFlags(updatedFlags);

      toast.current?.show({
        severity: 'success',
        summary: 'Flag Updated',
        detail: `Flag ${flag.name} ${newStatus === 'active' ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error toggling feature flag:', error);
      logError(
        error instanceof Error
          ? error
          : new Error('Failed to toggle feature flag')
      );
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update flag',
      });
    }
  };

  const saveFlag = async () => {
    if (!selectedFlag?.id) return;

    try {
      await advancedFeatureFlagService.updateFeatureFlag(
        selectedFlag.id,
        editingFlag
      );

      // Update local state
      const updatedFlags = featureFlags.map((f) =>
        f.id === selectedFlag.id
          ? { ...f, ...editingFlag, updatedAt: new Date() }
          : f
      );
      setFeatureFlags(updatedFlags);
      setShowEditDialog(false);
      setEditingFlag({});

      toast.current?.show({
        severity: 'success',
        summary: 'Flag Updated',
        detail: 'Feature flag updated successfully',
      });
    } catch (error) {
      console.error('Error saving feature flag:', error);
      logError(
        error instanceof Error
          ? error
          : new Error('Failed to save feature flag')
      );
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update flag',
      });
    }
  };

  const createFlag = async () => {
    if (!editingFlag.name || !editingFlag.key) {
      toast.current?.show({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Name and key are required',
      });
      return;
    }

    try {
      const flagData = {
        name: editingFlag.name,
        key: editingFlag.key,
        description: editingFlag.description || '',
        type: (editingFlag.type || 'boolean') as AdvancedFeatureFlag['type'],
        status: 'inactive' as const,
        defaultValue: editingFlag.defaultValue || false,
        variations: editingFlag.variations || [
          {
            name: 'Enabled',
            value: true,
            description: 'Feature enabled',
            weight: 50,
          },
          {
            name: 'Disabled',
            value: false,
            description: 'Feature disabled',
            weight: 50,
          },
        ],
        targeting: {
          enabled: false,
          rules: [],
          fallback: 'Disabled',
        },
        rolloutPercentage: 0,
        environment: selectedEnvironment as AdvancedFeatureFlag['environment'],
        tags: editingFlag.tags || [],
        createdBy: userData?.email || 'admin@example.com',
      };

      await advancedFeatureFlagService.createFeatureFlag(flagData);

      // Reload flags to get the updated list
      await loadFeatureFlags();

      setShowCreateDialog(false);
      setEditingFlag({});

      toast.current?.show({
        severity: 'success',
        summary: 'Flag Created',
        detail: 'Feature flag created successfully',
      });
    } catch (error) {
      console.error('Error creating feature flag:', error);
      logError(
        error instanceof Error
          ? error
          : new Error('Failed to create feature flag')
      );
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create flag',
      });
    }
  };

  return (
    <div className='feature-flag-management'>
      <Toast ref={toast} />
      <ConfirmDialog />

      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h2 className='text-2xl font-bold'>Feature Flags</h2>
          <p className='text-gray-600'>
            Control feature rollouts and experiments
          </p>
        </div>
        <div className='flex gap-2'>
          <Dropdown
            value={selectedEnvironment}
            options={environments}
            onChange={(e) => setSelectedEnvironment(e.value)}
            placeholder='Select Environment'
          />
          <PermissionGuard permission={Permission.MANAGE_FEATURE_FLAGS}>
            <Button
              label='Create Flag'
              icon='pi pi-plus'
              onClick={() => setShowCreateDialog(true)}
            />
          </PermissionGuard>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
        <Card className='text-center'>
          <div className='flex flex-col items-center'>
            <i className='pi pi-flag text-4xl text-blue-500 mb-2' />
            <h3 className='text-2xl font-bold'>{featureFlags.length}</h3>
            <p className='text-gray-600'>Total Flags</p>
          </div>
        </Card>

        <Card className='text-center'>
          <div className='flex flex-col items-center'>
            <i className='pi pi-play text-4xl text-green-500 mb-2' />
            <h3 className='text-2xl font-bold'>
              {featureFlags.filter((f) => f.status === 'active').length}
            </h3>
            <p className='text-gray-600'>Active</p>
          </div>
        </Card>

        <Card className='text-center'>
          <div className='flex flex-col items-center'>
            <i className='pi pi-clock text-4xl text-orange-500 mb-2' />
            <h3 className='text-2xl font-bold'>
              {featureFlags.filter((f) => f.status === 'scheduled').length}
            </h3>
            <p className='text-gray-600'>Scheduled</p>
          </div>
        </Card>

        <Card className='text-center'>
          <div className='flex flex-col items-center'>
            <i className='pi pi-users text-4xl text-purple-500 mb-2' />
            <h3 className='text-2xl font-bold'>
              {featureFlags.reduce((sum, f) => sum + f.metrics.uniqueUsers, 0)}
            </h3>
            <p className='text-gray-600'>Unique Users</p>
          </div>
        </Card>
      </div>

      {/* Flags Table */}
      <Card>
        <DataTable
          value={featureFlags}
          loading={loading}
          paginator
          rows={10}
          className='p-datatable-striped'
          header={`Feature Flags - ${selectedEnvironment}`}
        >
          <Column
            field='name'
            header='Name'
            body={(flag) => (
              <div>
                <div className='font-medium'>{flag.name}</div>
                <div className='text-sm text-gray-500'>{flag.key}</div>
              </div>
            )}
          />
          <Column
            field='type'
            header='Type'
            body={(flag) => <Tag value={flag.type.toUpperCase()} />}
          />
          <Column
            field='status'
            header='Status'
            body={renderFlagStatus}
          />
          <Column
            field='rolloutPercentage'
            header='Rollout'
            body={renderRolloutPercentage}
          />
          <Column
            field='targeting'
            header='Targeting'
            body={renderTargeting}
          />
          <Column
            field='tags'
            header='Tags'
            body={renderTags}
          />
          <Column
            body={renderActions}
            style={{ minWidth: '150px' }}
          />
        </DataTable>
      </Card>

      {/* Create Flag Dialog */}
      <Dialog
        visible={showCreateDialog}
        onHide={() => setShowCreateDialog(false)}
        header='Create Feature Flag'
        style={{ width: '60vw' }}
      >
        <div className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block mb-2'>Flag Name *</label>
              <InputText
                value={editingFlag.name || ''}
                onChange={(e) =>
                  setEditingFlag({ ...editingFlag, name: e.target.value })
                }
                className='w-full'
              />
            </div>

            <div>
              <label className='block mb-2'>Flag Key *</label>
              <InputText
                value={editingFlag.key || ''}
                onChange={(e) =>
                  setEditingFlag({ ...editingFlag, key: e.target.value })
                }
                className='w-full'
              />
            </div>
          </div>

          <div>
            <label className='block mb-2'>Description</label>
            <InputTextarea
              value={editingFlag.description || ''}
              onChange={(e) =>
                setEditingFlag({ ...editingFlag, description: e.target.value })
              }
              className='w-full'
              rows={3}
            />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block mb-2'>Type</label>
              <Dropdown
                value={editingFlag.type || 'boolean'}
                options={flagTypes}
                onChange={(e) =>
                  setEditingFlag({ ...editingFlag, type: e.value })
                }
                className='w-full'
              />
            </div>

            <div>
              <label className='block mb-2'>Tags</label>
              <InputText
                value={editingFlag.tags?.join(', ') || ''}
                onChange={(e) =>
                  setEditingFlag({
                    ...editingFlag,
                    tags: e.target.value.split(',').map((t) => t.trim()),
                  })
                }
                className='w-full'
                placeholder='ui, experimental, beta'
              />
            </div>
          </div>
        </div>

        <div className='flex justify-end gap-2 mt-6'>
          <Button
            label='Cancel'
            icon='pi pi-times'
            onClick={() => setShowCreateDialog(false)}
            className='p-button-text'
          />
          <Button
            label='Create'
            icon='pi pi-check'
            onClick={createFlag}
            disabled={!editingFlag.name || !editingFlag.key}
          />
        </div>
      </Dialog>

      {/* Edit Flag Dialog */}
      <Dialog
        visible={showEditDialog}
        onHide={() => setShowEditDialog(false)}
        header={`Edit ${selectedFlag?.name}`}
        style={{ width: '70vw' }}
      >
        {selectedFlag && (
          <TabView>
            <TabPanel
              header='Basic Info'
              leftIcon='pi pi-info-circle'
            >
              <div className='space-y-4'>
                <div>
                  <label className='block mb-2'>Name</label>
                  <InputText
                    value={editingFlag.name || selectedFlag.name}
                    onChange={(e) =>
                      setEditingFlag({ ...editingFlag, name: e.target.value })
                    }
                    className='w-full'
                  />
                </div>

                <div>
                  <label className='block mb-2'>Description</label>
                  <InputTextarea
                    value={editingFlag.description || selectedFlag.description}
                    onChange={(e) =>
                      setEditingFlag({
                        ...editingFlag,
                        description: e.target.value,
                      })
                    }
                    className='w-full'
                    rows={3}
                  />
                </div>

                <div>
                  <label className='block mb-2'>Rollout Percentage</label>
                  <InputNumber
                    value={
                      editingFlag.rolloutPercentage ??
                      selectedFlag.rolloutPercentage
                    }
                    onValueChange={(e) =>
                      setEditingFlag({
                        ...editingFlag,
                        rolloutPercentage: e.value || 0,
                      })
                    }
                    min={0}
                    max={100}
                    className='w-full'
                  />
                </div>
              </div>
            </TabPanel>

            <TabPanel
              header='Targeting'
              leftIcon='pi pi-users'
            >
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <label>Enable Targeting</label>
                  <InputSwitch
                    checked={
                      editingFlag.targeting?.enabled ??
                      selectedFlag.targeting.enabled
                    }
                    onChange={(e) =>
                      setEditingFlag({
                        ...editingFlag,
                        targeting: {
                          ...selectedFlag.targeting,
                          enabled: e.value,
                        },
                      })
                    }
                  />
                </div>

                <div>
                  <h5>Targeting Rules</h5>
                  <p className='text-sm text-gray-600 mb-3'>
                    Define rules to target specific user segments
                  </p>
                  {/* Targeting rules UI would go here */}
                </div>
              </div>
            </TabPanel>

            <TabPanel
              header='Schedule'
              leftIcon='pi pi-calendar'
            >
              <div className='space-y-4'>
                <div>
                  <label className='block mb-2'>Start Date</label>
                  <Calendar
                    value={
                      editingFlag.scheduledStart ||
                      selectedFlag.scheduledStart ||
                      undefined
                    }
                    onChange={(e) =>
                      setEditingFlag({
                        ...editingFlag,
                        scheduledStart: e.value || undefined,
                      })
                    }
                    showTime
                    className='w-full'
                  />
                </div>

                <div>
                  <label className='block mb-2'>End Date</label>
                  <Calendar
                    value={
                      editingFlag.scheduledEnd ||
                      selectedFlag.scheduledEnd ||
                      undefined
                    }
                    onChange={(e) =>
                      setEditingFlag({
                        ...editingFlag,
                        scheduledEnd: e.value || undefined,
                      })
                    }
                    showTime
                    className='w-full'
                  />
                </div>
              </div>
            </TabPanel>
          </TabView>
        )}

        <div className='flex justify-end gap-2 mt-6'>
          <Button
            label='Cancel'
            icon='pi pi-times'
            onClick={() => setShowEditDialog(false)}
            className='p-button-text'
          />
          <Button
            label='Save'
            icon='pi pi-check'
            onClick={saveFlag}
          />
        </div>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog
        visible={showAnalyticsDialog}
        onHide={() => setShowAnalyticsDialog(false)}
        header={`Analytics - ${selectedFlag?.name}`}
        style={{ width: '70vw' }}
      >
        {selectedFlag && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <Card title='Evaluation Metrics'>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span>Total Evaluations:</span>
                  <span className='font-bold'>
                    {selectedFlag.metrics.totalEvaluations.toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Unique Users:</span>
                  <span className='font-bold'>
                    {selectedFlag.metrics.uniqueUsers.toLocaleString()}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Conversion Rate:</span>
                  <span className='font-bold'>
                    {(selectedFlag.metrics.conversionRate * 100).toFixed(2)}%
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span>Performance Impact:</span>
                  <span className='font-bold'>
                    {selectedFlag.metrics.performanceImpact.toFixed(3)}ms
                  </span>
                </div>
              </div>
            </Card>

            <Card title='Variation Distribution'>
              <div className='space-y-3'>
                {selectedFlag.variations.map((variation, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between'
                  >
                    <span>{variation.name}</span>
                    <div className='flex items-center gap-2'>
                      <ProgressBar
                        value={variation.weight}
                        style={{ width: '100px' }}
                      />
                      <span className='text-sm'>{variation.weight}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </Dialog>
    </div>
  );
};
