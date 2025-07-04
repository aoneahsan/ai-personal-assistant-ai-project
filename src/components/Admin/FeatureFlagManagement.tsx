import { PermissionGuard } from '@/components/common/RoleGuard';
import { Permission } from '@/types/user/roles';
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
import React, { useEffect, useRef, useState } from 'react';

interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'json' | 'percentage';
  status: 'active' | 'inactive' | 'scheduled' | 'expired';
  defaultValue: any;
  variations: Array<{
    name: string;
    value: any;
    description: string;
    weight: number;
  }>;
  targeting: {
    enabled: boolean;
    rules: Array<{
      id: string;
      name: string;
      conditions: Array<{
        attribute: string;
        operator:
          | 'equals'
          | 'not_equals'
          | 'contains'
          | 'greater_than'
          | 'less_than';
        value: any;
      }>;
      variation: string;
      weight: number;
    }>;
    fallback: string;
  };
  rolloutPercentage: number;
  environment: 'development' | 'staging' | 'production';
  tags: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  metrics: {
    totalEvaluations: number;
    uniqueUsers: number;
    conversionRate: number;
    performanceImpact: number;
  };
}

interface FeatureFlagTemplate {
  id: string;
  name: string;
  description: string;
  type: FeatureFlag['type'];
  category: string;
  defaultConfig: Partial<FeatureFlag>;
}

export const FeatureFlagManagement: React.FC = () => {
  const toast = useRef<Toast>(null);
  const [loading, setLoading] = useState(false);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [templates, setTemplates] = useState<FeatureFlagTemplate[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const [editingFlag, setEditingFlag] = useState<Partial<FeatureFlag>>({});
  const [newVariation, setNewVariation] = useState({
    name: '',
    value: '',
    description: '',
    weight: 0,
  });
  const [selectedEnvironment, setSelectedEnvironment] =
    useState<string>('production');

  const environments = [
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

  const targetingAttributes = [
    { label: 'User Role', value: 'userRole' },
    { label: 'Subscription Plan', value: 'subscriptionPlan' },
    { label: 'Country', value: 'country' },
    { label: 'Email Domain', value: 'emailDomain' },
    { label: 'Registration Date', value: 'registrationDate' },
    { label: 'Last Login', value: 'lastLogin' },
  ];

  const operators = [
    { label: 'Equals', value: 'equals' },
    { label: 'Not Equals', value: 'not_equals' },
    { label: 'Contains', value: 'contains' },
    { label: 'Greater Than', value: 'greater_than' },
    { label: 'Less Than', value: 'less_than' },
  ];

  useEffect(() => {
    loadFeatureFlags();
    loadTemplates();
  }, [selectedEnvironment]);

  const loadFeatureFlags = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const mockFlags: FeatureFlag[] = [
        {
          id: '1',
          name: 'New Chat Interface',
          key: 'new_chat_interface',
          description: 'Enable the new chat interface with improved UX',
          type: 'boolean',
          status: 'active',
          defaultValue: false,
          variations: [
            {
              name: 'Enabled',
              value: true,
              description: 'Show new interface',
              weight: 50,
            },
            {
              name: 'Disabled',
              value: false,
              description: 'Show old interface',
              weight: 50,
            },
          ],
          targeting: {
            enabled: true,
            rules: [
              {
                id: 'premium_users',
                name: 'Premium Users',
                conditions: [
                  {
                    attribute: 'subscriptionPlan',
                    operator: 'equals',
                    value: 'PREMIUM',
                  },
                ],
                variation: 'Enabled',
                weight: 100,
              },
            ],
            fallback: 'Disabled',
          },
          rolloutPercentage: 25,
          environment: 'production',
          tags: ['ui', 'chat', 'experimental'],
          createdBy: 'admin@example.com',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          metrics: {
            totalEvaluations: 15420,
            uniqueUsers: 1247,
            conversionRate: 0.12,
            performanceImpact: 0.05,
          },
        },
        {
          id: '2',
          name: 'AI Response Limit',
          key: 'ai_response_limit',
          description: 'Set maximum number of AI responses per user per day',
          type: 'number',
          status: 'active',
          defaultValue: 10,
          variations: [
            {
              name: 'Free Tier',
              value: 5,
              description: 'Limited responses',
              weight: 60,
            },
            {
              name: 'Pro Tier',
              value: 50,
              description: 'Increased limit',
              weight: 30,
            },
            {
              name: 'Unlimited',
              value: -1,
              description: 'No limit',
              weight: 10,
            },
          ],
          targeting: {
            enabled: true,
            rules: [
              {
                id: 'subscription_based',
                name: 'Subscription Based',
                conditions: [
                  {
                    attribute: 'subscriptionPlan',
                    operator: 'equals',
                    value: 'FREE',
                  },
                ],
                variation: 'Free Tier',
                weight: 100,
              },
            ],
            fallback: 'Pro Tier',
          },
          rolloutPercentage: 100,
          environment: 'production',
          tags: ['ai', 'limits', 'subscription'],
          createdBy: 'admin@example.com',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          metrics: {
            totalEvaluations: 45670,
            uniqueUsers: 2134,
            conversionRate: 0.08,
            performanceImpact: 0.02,
          },
        },
        {
          id: '3',
          name: 'Dark Mode Default',
          key: 'dark_mode_default',
          description: 'Set dark mode as default theme for new users',
          type: 'boolean',
          status: 'scheduled',
          defaultValue: false,
          variations: [
            {
              name: 'Dark',
              value: true,
              description: 'Dark mode default',
              weight: 100,
            },
            {
              name: 'Light',
              value: false,
              description: 'Light mode default',
              weight: 0,
            },
          ],
          targeting: {
            enabled: false,
            rules: [],
            fallback: 'Light',
          },
          rolloutPercentage: 0,
          environment: 'production',
          tags: ['ui', 'theme', 'ux'],
          createdBy: 'designer@example.com',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          scheduledStart: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          scheduledEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          metrics: {
            totalEvaluations: 0,
            uniqueUsers: 0,
            conversionRate: 0,
            performanceImpact: 0,
          },
        },
      ];

      setFeatureFlags(
        mockFlags.filter((f) => f.environment === selectedEnvironment)
      );
    } catch (error) {
      console.error('Error loading feature flags:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load feature flags',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const mockTemplates: FeatureFlagTemplate[] = [
        {
          id: 'boolean_toggle',
          name: 'Boolean Toggle',
          description: 'Simple on/off feature flag',
          type: 'boolean',
          category: 'Basic',
          defaultConfig: {
            type: 'boolean',
            defaultValue: false,
            variations: [
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
          },
        },
        {
          id: 'ab_test',
          name: 'A/B Test',
          description: 'Split traffic between two variants',
          type: 'string',
          category: 'Experimentation',
          defaultConfig: {
            type: 'string',
            defaultValue: 'control',
            variations: [
              {
                name: 'Control',
                value: 'control',
                description: 'Original version',
                weight: 50,
              },
              {
                name: 'Variant',
                value: 'variant',
                description: 'New version',
                weight: 50,
              },
            ],
          },
        },
        {
          id: 'gradual_rollout',
          name: 'Gradual Rollout',
          description: 'Gradually increase feature exposure',
          type: 'percentage',
          category: 'Rollout',
          defaultConfig: {
            type: 'percentage',
            defaultValue: 0,
            rolloutPercentage: 0,
          },
        },
      ];

      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

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
    try {
      const newStatus = flag.status === 'active' ? 'inactive' : 'active';
      const updatedFlag = { ...flag, status: newStatus, updatedAt: new Date() };

      setFeatureFlags(
        featureFlags.map((f) => (f.id === flag.id ? updatedFlag : f))
      );

      toast.current?.show({
        severity: 'success',
        summary: 'Flag Updated',
        detail: `${flag.name} has been ${newStatus}`,
      });
    } catch (error) {
      console.error('Error toggling flag:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to update flag',
      });
    }
  };

  const saveFlag = async () => {
    if (!selectedFlag || !editingFlag) return;

    try {
      const updatedFlag = {
        ...selectedFlag,
        ...editingFlag,
        updatedAt: new Date(),
      };

      setFeatureFlags(
        featureFlags.map((f) => (f.id === selectedFlag.id ? updatedFlag : f))
      );

      setShowEditDialog(false);
      setSelectedFlag(null);
      setEditingFlag({});

      toast.current?.show({
        severity: 'success',
        summary: 'Flag Saved',
        detail: 'Feature flag updated successfully',
      });
    } catch (error) {
      console.error('Error saving flag:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save flag',
      });
    }
  };

  const createFlag = async () => {
    if (!editingFlag.name || !editingFlag.key) return;

    try {
      const newFlag: FeatureFlag = {
        id: `flag_${Date.now()}`,
        name: editingFlag.name,
        key: editingFlag.key,
        description: editingFlag.description || '',
        type: editingFlag.type || 'boolean',
        status: 'inactive',
        defaultValue: editingFlag.defaultValue || false,
        variations: editingFlag.variations || [],
        targeting: {
          enabled: false,
          rules: [],
          fallback: 'Disabled',
        },
        rolloutPercentage: 0,
        environment: selectedEnvironment as any,
        tags: editingFlag.tags || [],
        createdBy: 'admin@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        metrics: {
          totalEvaluations: 0,
          uniqueUsers: 0,
          conversionRate: 0,
          performanceImpact: 0,
        },
      };

      setFeatureFlags([...featureFlags, newFlag]);
      setShowCreateDialog(false);
      setEditingFlag({});

      toast.current?.show({
        severity: 'success',
        summary: 'Flag Created',
        detail: 'Feature flag created successfully',
      });
    } catch (error) {
      console.error('Error creating flag:', error);
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
                      editingFlag.scheduledStart || selectedFlag.scheduledStart
                    }
                    onChange={(e) =>
                      setEditingFlag({
                        ...editingFlag,
                        scheduledStart: e.value,
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
                      editingFlag.scheduledEnd || selectedFlag.scheduledEnd
                    }
                    onChange={(e) =>
                      setEditingFlag({ ...editingFlag, scheduledEnd: e.value })
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
